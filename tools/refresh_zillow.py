#!/usr/bin/env python3
"""Monthly refresh of the Zillow home value (ZHVI) and asking rent (ZORI) for Fremont, CA.

Uses only the Python standard library (no installs).

What it does
  - Reads Zillow Research's two public city CSV files and picks Fremont, CA (RegionID 11540).
  - Rewrites data/zillow_history.json (monthly series, Jan 2015 onward).
  - Updates the 'zhvi' and 'zori' rows in data/zillow_market.json: value, year-over-year change, as-of date.
  - Prints what changed. It never touches the other rows (listings and sales measures), which come from
    Zillow's city page and still need a manual look.

Normally run once a month by tools/refresh_monthly.py, together with refresh_apis.py.

Usage
  python3 refresh_zillow.py SITE_FOLDER                      # download the CSVs, then update
  python3 refresh_zillow.py SITE_FOLDER --dry-run            # show changes, write nothing
  python3 refresh_zillow.py SITE_FOLDER --zhvi a.csv --zori b.csv   # use local copies of the CSVs

After a real update, also set SITE.updated in js/fbn.js and rebuild the pre-rendered pages
(node build_ai_files.js SITE_FOLDER YYYY-MM-DD). Zillow requires clear attribution; the site already shows it.
"""
import argparse, csv, datetime, io, json, os, sys, urllib.request

ZHVI_URL = "https://files.zillowstatic.com/research/public_csvs/zhvi/City_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv"
ZORI_URL = "https://files.zillowstatic.com/research/public_csvs/zori/City_zori_uc_sfrcondomfr_sm_month.csv"
REGION_ID = "11540"  # Fremont, CA


def load_text(path_or_url):
    if path_or_url.startswith("http"):
        req = urllib.request.Request(path_or_url, headers={"User-Agent": "fremont-by-the-numbers-refresh/1.0"})
        with urllib.request.urlopen(req, timeout=120) as r:
            return r.read().decode("utf-8-sig")
    with open(path_or_url, encoding="utf-8-sig") as f:
        return f.read()


def fremont_series(csv_text):
    """Return {'YYYY-MM': value} for Fremont, CA from a Zillow city CSV."""
    rdr = csv.DictReader(io.StringIO(csv_text))
    match = None
    for row in rdr:
        if row.get("RegionID") == REGION_ID:
            match = row
            break
        if (row.get("RegionName") == "Fremont" and row.get("State") == "CA"
                and "Alameda" in (row.get("CountyName") or "")):
            match = row  # fallback, keep scanning in case the RegionID row appears later
    if match is None:
        sys.exit("Fremont, CA was not found in the CSV. Zillow may have changed the file layout.")
    out = {}
    for key, val in match.items():
        if key and len(key) == 10 and key[4] == "-" and key[7] == "-" and val not in ("", None):
            out[key[:7]] = round(float(val))
    if not out:
        sys.exit("No monthly columns found for Fremont.")
    return out


def month_end_label(ym):
    y, m = int(ym[:4]), int(ym[5:7])
    nxt = datetime.date(y + (m == 12), (m % 12) + 1, 1)
    d = nxt - datetime.timedelta(days=1)
    return d.strftime("%b ") + str(d.day) + d.strftime(", %Y")


def year_ago(ym):
    return "%04d-%s" % (int(ym[:4]) - 1, ym[5:7])


def yoy(series, ym):
    prev = series.get(year_ago(ym))
    return None if not prev else round(100.0 * (series[ym] / prev - 1), 1)


def build_history(zhvi, zori, start="2015-01"):
    months = sorted(m for m in zhvi if m >= start and m in zori)
    return [{"month": m, "zhvi": zhvi[m], "zori": zori[m]} for m in months]


def write_like(p, text):
    """Write text with the line endings the file already has (git checks files out with CRLF on Windows)."""
    with open(p, encoding="utf-8", newline="") as f:
        crlf = "\r\n" in f.read()
    with open(p, "w", encoding="utf-8", newline="\r\n" if crlf else "\n") as f:
        f.write(text)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("site", help="site folder that contains data/")
    ap.add_argument("--zhvi", default=ZHVI_URL, help="ZHVI CSV path or URL")
    ap.add_argument("--zori", default=ZORI_URL, help="ZORI CSV path or URL")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()

    zhvi = fremont_series(load_text(a.zhvi))
    zori = fremont_series(load_text(a.zori))
    latest = min(max(zhvi), max(zori))  # newest month present in both files

    data_dir = os.path.join(a.site, "data")
    hist_path = os.path.join(data_dir, "zillow_history.json")
    mkt_path = os.path.join(data_dir, "zillow_market.json")
    old_hist = json.load(open(hist_path))
    market = json.load(open(mkt_path))

    new_hist = build_history(zhvi, zori)
    old_by = {r["month"]: r for r in old_hist}
    changes = []
    for r in new_hist:
        o = old_by.get(r["month"])
        if o is None:
            changes.append("new month %s: home value %s, rent %s" % (r["month"], r["zhvi"], r["zori"]))
        elif (o["zhvi"], o["zori"]) != (r["zhvi"], r["zori"]):
            changes.append("revised %s: home value %s -> %s, rent %s -> %s" % (r["month"], o["zhvi"], r["zhvi"], o["zori"], r["zori"]))
    dropped = sorted(set(old_by) - {r["month"] for r in new_hist})
    if dropped:
        changes.append("months in the site file but not in the new CSVs (kept out of the rewrite): %s" % ", ".join(dropped))

    as_of = month_end_label(latest)
    for row in market:
        if row["id"] == "zhvi":
            new = {"value": zhvi[latest], "yoy_pct": yoy(zhvi, latest), "as_of": as_of}
        elif row["id"] == "zori":
            new = {"value": zori[latest], "yoy_pct": yoy(zori, latest), "as_of": as_of}
        else:
            continue
        diff = {k: (row.get(k), v) for k, v in new.items() if row.get(k) != v}
        if diff:
            changes.append("market row %s: %s" % (row["id"], "; ".join("%s %s -> %s" % (k, o, n) for k, (o, n) in diff.items())))
            row.update(new)

    if not changes:
        print("No changes. Latest month in the CSVs is %s." % latest)
        return
    print("Latest month in the CSVs: %s (%s)" % (latest, as_of))
    for c in changes:
        print(" -", c)
    if a.dry_run:
        print("Dry run: nothing written.")
        return
    # Keep each file's layout (history on one line; market one row per line, final newline) and its line endings.
    write_like(hist_path, json.dumps(new_hist, separators=(", ", ": ")))
    write_like(mkt_path, "[\n" + ",\n".join("  " + json.dumps(r) for r in market) + "\n]\n")
    print("Wrote zillow_history.json and zillow_market.json.")
    print("Still manual: listings and sales rows in zillow_market (inventory, new_listings, days_pending, sale_to_list, over_list),")
    print("SITE.updated in js/fbn.js, and rebuilding the pre-rendered pages.")


if __name__ == "__main__":
    main()
