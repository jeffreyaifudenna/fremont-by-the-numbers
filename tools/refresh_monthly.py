#!/usr/bin/env python3
"""Monthly refresh: run every refresh script on the same day, then rebuild the pages.

Uses only the Python standard library (no installs). The build step needs Node (see CLAUDE.md).

What it does, in order
  1. Checks the run day ("run_day" in tools/refresh_schedule.json) and that no monthly run has
     happened yet this calendar month (tools/refresh_last_run.json). Stops if either check fails.
  2. Runs refresh_zillow.py, then refresh_apis.py (every API source it lists).
  3. Records today in tools/refresh_last_run.json.
  4. If any file in data/ changed: sets SITE.updated in js/fbn.js and rebuilds the pre-rendered pages
     (STANDALONE=1 node tools/build_ai_files.js SITE YYYY-MM-DD).
It never commits, pushes or deploys. Review the diff and test the pages first.

Usage
  python3 tools/refresh_monthly.py .              # on the run day
  python3 tools/refresh_monthly.py . --dry-run    # any day: show what would change, write nothing
  python3 tools/refresh_monthly.py . --force      # missed the run day, or need a second run this month
  python3 tools/refresh_monthly.py . --no-build   # refresh data only
"""
import argparse, datetime, hashlib, json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
LAST_RUN = os.path.join(HERE, "refresh_last_run.json")
SCHEDULE = os.path.join(HERE, "refresh_schedule.json")
SCRIPTS = ["refresh_zillow.py", "refresh_apis.py"]
MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


def data_hash(site):
    h = hashlib.sha1()
    d = os.path.join(site, "data")
    for name in sorted(os.listdir(d)):
        if name.endswith(".json"):
            with open(os.path.join(d, name), "rb") as f:
                h.update(name.encode() + f.read())
    return h.hexdigest()


def read_json(p, default):
    if not os.path.exists(p):
        return default
    with open(p, encoding="utf-8") as f:
        return json.load(f)


def write_keep_endings(p, text):
    with open(p, encoding="utf-8", newline="") as f:
        old = f.read()
    with open(p, "w", encoding="utf-8", newline="\r\n" if "\r\n" in old else "\n") as f:
        f.write(text)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("site", help="site folder that contains data/")
    ap.add_argument("--dry-run", action="store_true", help="show changes, write nothing (ignores the run-day checks)")
    ap.add_argument("--force", action="store_true", help="skip the run-day and once-a-month checks")
    ap.add_argument("--no-build", action="store_true", help="do not rebuild the pages afterwards")
    a = ap.parse_args()

    today = datetime.date.today()
    run_day = int(read_json(SCHEDULE, {}).get("run_day", 28))
    last = read_json(LAST_RUN, {}).get("last_run")
    if not (a.dry_run or a.force):
        if today.day != run_day:
            sys.exit("The monthly refresh runs on day %d of the month; today is day %d. "
                     "Use --dry-run to look, or --force if the run day was missed." % (run_day, today.day))
        if last and last[:7] == today.isoformat()[:7]:
            sys.exit("Already ran this month (%s). Use --force to run again." % last)

    before = data_hash(a.site)
    failed = []
    for script in SCRIPTS:
        print("\n=== %s ===" % script, flush=True)
        cmd = [sys.executable, os.path.join(HERE, script), a.site] + (["--dry-run"] if a.dry_run else [])
        if subprocess.call(cmd) != 0:
            failed.append(script)
    if a.dry_run:
        print("\nDry run: nothing written." + (" Failed: %s" % ", ".join(failed) if failed else ""))
        return

    note = read_json(LAST_RUN, {})
    note["last_run"] = today.isoformat()
    note["note"] = "Written by tools/refresh_monthly.py after each real monthly run."
    with open(LAST_RUN, "w", encoding="utf-8", newline="\n") as f:
        f.write(json.dumps(note, indent=1) + "\n")

    if data_hash(a.site) == before:
        print("\nNo data changed, so no rebuild is needed.")
    elif a.no_build:
        print("\nData changed. Rebuild skipped (--no-build): set SITE.updated in js/fbn.js and rebuild before deploying.")
    else:
        label = "%s %d, %d" % (MON[today.month - 1], today.day, today.year)
        fbn = os.path.join(a.site, "js", "fbn.js")
        with open(fbn, encoding="utf-8", newline="") as f:
            src = f.read()
        src2 = re.sub(r"(updated: ')[^']*(')", r"\g<1>" + label + r"\g<2>", src, count=1)
        if src2 != src:
            write_keep_endings(fbn, src2.replace("\r\n", "\n"))
        print("\n=== rebuild (SITE.updated = %s) ===" % label, flush=True)
        env = dict(os.environ, STANDALONE="1")
        if subprocess.call(["node", os.path.join(HERE, "build_ai_files.js"), a.site, today.isoformat()], env=env) != 0:
            failed.append("build_ai_files.js")

    print("\nDone." + (" These steps failed and need a look: %s." % ", ".join(failed) if failed else ""))
    print("Next: review the diff, check the pages at 390px and 1280px in light and dark, then commit and push.")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
