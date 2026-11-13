#!/usr/bin/env python3
"""Copy the public part of tools/refresh_schedule.json into data/_schedule.json.

The Sources page and the home-page freshness bar read data/_schedule.json to show each dataset's
refresh cadence, when the publisher usually releases, and when the next check is due. Internal notes
stay in tools/refresh_schedule.json. Standard library only.

  python tools/sync_schedule.py .          # run from the site folder
refresh_monthly.py runs this after every monthly refresh.
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
KEEP = ("cadence", "typical_release", "method", "next_check")


def read_json(p, default):
    if not os.path.exists(p):
        return default
    with open(p, encoding="utf-8") as f:
        return json.load(f)


def main():
    site = sys.argv[1] if len(sys.argv) > 1 else "."
    sched = read_json(os.path.join(HERE, "refresh_schedule.json"), {})
    last = read_json(os.path.join(HERE, "refresh_last_run.json"), {}).get("last_run")
    out = {
        "run_day": sched.get("run_day"),
        "last_run": last,
        "cadences": sched.get("cadences", {}),
        "datasets": {k: {f: v[f] for f in KEEP if f in v} for k, v in sched.get("datasets", {}).items()},
    }
    text = json.dumps(out, indent=1, ensure_ascii=False) + "\n"
    path = os.path.join(site, "data", "_schedule.json")
    old = open(path, encoding="utf-8", newline="").read() if os.path.exists(path) else None
    if old != text:
        with open(path, "w", encoding="utf-8", newline="\n") as f:
            f.write(text)
        print("wrote", path)
    else:
        print("data/_schedule.json already up to date")


if __name__ == "__main__":
    main()
