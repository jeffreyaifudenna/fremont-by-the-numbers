#!/usr/bin/env python3
"""Refresh the datasets that come from free public APIs (no key needed).

Uses only the Python standard library (no installs).

Sources, and what each one writes
  bls   U.S. Bureau of Labor Statistics data API v1, Local Area Unemployment Statistics.
        Writes data/unemployment_monthly.json (Fremont, Alameda County and California, monthly since 2019)
        and updates the two Fremont unemployment-rate rows in data/jobs_more.json.
        The keyless v1 API allows 25 requests a day; this uses one.
  fred  Freddie Mac 30-year fixed mortgage rate (weekly), via FRED's public CSV download.
        Writes data/mortgage_rate.json (the last two years of weeks).
  ccrs  California Crash Reporting System (CHP) on data.ca.gov, one SQL query per year.
        Writes data/crashes_ccrs.json (crash reports inside Fremont by year since 2016).
  usgs  USGS earthquake catalog. Center: Fremont City Hall; radius 50 km.
        Writes data/earthquake_years.json (count by year since 2016) and
        data/earthquake_largest.json (the largest since 2000).
  cms   CMS Provider Data Catalog (Medicare Care Compare).
        Updates the overall and patient-survey star-rating rows in data/health_access.json.

Normally run once a month by tools/refresh_monthly.py, together with refresh_zillow.py.

Usage
  python3 refresh_apis.py SITE_FOLDER                  # fetch everything, then write
  python3 refresh_apis.py SITE_FOLDER --dry-run        # show changes, write nothing
  python3 refresh_apis.py SITE_FOLDER --only bls,fred  # just some sources

Each written dataset also gets a new 'updated' time in data/_catalog.json.
After a real update, set SITE.updated in js/fbn.js and rebuild the pre-rendered pages
(STANDALONE=1 node tools/build_ai_files.js . YYYY-MM-DD).
"""
import argparse, csv, datetime, io, json, os, sys, urllib.parse, urllib.request

UA = {"User-Agent": "fremont-by-the-numbers-refresh/1.0 (+https://fremontcabythenumbers.com)"}
TODAY = datetime.date.today()
READ = TODAY.strftime("%b ") + str(TODAY.day) + TODAY.strftime(", %Y")   # e.g. Oct 28, 2026
MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

# Fremont City Hall, 3300 Capitol Ave
LAT, LON, RADIUS_KM = 37.5483, -121.9886, 50


def fetch(url, data=None, headers=None, timeout=120):
    req = urllib.request.Request(url, data=data, headers={**UA, **(headers or {})})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode("utf-8-sig")


def fetch_json(url, **kw):
    return json.loads(fetch(url, **kw))


def month_label(ym):
    return MON[int(ym[5:7]) - 1] + " " + ym[:4]


# ---------- BLS: unemployment ----------
BLS_SERIES = {
    "fremont": "LAUCT062600000000003",           # Fremont city, unemployment rate
    "fremont_unemployed": "LAUCT062600000000004",
    "fremont_labor_force": "LAUCT062600000000006",
    "alameda": "LAUCN060010000000003",           # Alameda County
    "california": "LAUST060000000000003",        # California, not seasonally adjusted
}


def bls(site):
    body = json.dumps({"seriesid": list(BLS_SERIES.values()), "startyear": "2019", "endyear": str(TODAY.year)}).encode()
    res = fetch_json("https://api.bls.gov/publicAPI/v1/timeseries/data/", data=body, headers={"Content-Type": "application/json"})
    if res.get("status") != "REQUEST_SUCCEEDED":
        sys.exit("BLS: %s %s" % (res.get("status"), res.get("message")))
    by_id = {s["seriesID"]: s["data"] for s in res["Results"]["series"]}
    months = {}
    for key, sid in BLS_SERIES.items():
        for d in by_id.get(sid, []):
            if not d["period"].startswith("M") or d["period"] == "M13" or d["value"] in ("-", ""):
                continue   # "-" marks a month BLS never published (Oct 2025, during the federal shutdown)
            ym = "%s-%s" % (d["year"], d["period"][1:])
            r = months.setdefault(ym, {"month": ym, "label": month_label(ym), "status": "Published"})
            r[key] = float(d["value"]) if key in ("fremont", "alameda", "california") else int(float(d["value"]))
            if any(f.get("code") == "P" for f in d.get("footnotes", []) if f):
                r["status"] = "Preliminary"
    rows = [months[m] for m in sorted(months) if "fremont" in months[m]]
    if not rows:
        sys.exit("BLS: no Fremont months returned.")
    # Keep a row for any month BLS skipped, so the chart shows a gap instead of joining across it
    y, m = int(rows[0]["month"][:4]), int(rows[0]["month"][5:])
    have = {r["month"] for r in rows}
    while "%04d-%02d" % (y, m) < rows[-1]["month"]:
        ym = "%04d-%02d" % (y, m)
        if ym not in have:
            rows.append({"month": ym, "label": month_label(ym), "status": "Not published",
                         "fremont": None, "fremont_unemployed": None, "fremont_labor_force": None, "alameda": None, "california": None})
        y, m = (y + 1, 1) if m == 12 else (y, m + 1)
    rows.sort(key=lambda r: r["month"])
    out = [("unemployment_monthly", rows)]

    # The two headline rows on the Jobs page
    jobs = load(site, "jobs_more")
    last = rows[-1]
    ago = months.get("%04d-%s" % (int(last["month"][:4]) - 1, last["month"][5:]))
    for r in jobs:
        if r["id"] == "fremont_unemployment_rate_latest":
            r.update({"value": last["fremont"], "period": last["label"],
                      "note": "LAUS sub-county estimate, not seasonally adjusted; %s unemployed in a labor force of %s.%s Fetched from the BLS data API %s."
                      % ("{:,}".format(last["fremont_unemployed"]), "{:,}".format(last["fremont_labor_force"]),
                         " Preliminary; BLS revises it the following month." if last["status"] == "Preliminary" else "", READ)})
        elif r["id"] == "fremont_unemployment_rate_year_ago":
            prev = months.get(rows[-2]["month"]) if len(rows) > 1 else None
            if ago:
                r.update({"value": ago["fremont"], "period": ago["label"],
                          "note": "Same BLS series as the latest month%s. Fetched %s." % ("; %s was %s%%" % (prev["label"], prev["fremont"]) if prev else "", READ)})
            else:   # e.g. Oct 2025, which BLS never published
                ym = "%04d-%s" % (int(last["month"][:4]) - 1, last["month"][5:])
                r.update({"value": None, "period": month_label(ym),
                          "note": "BLS did not publish a figure for %s. Fetched %s." % (month_label(ym), READ)})
    out.append(("jobs_more", jobs))
    return out


# ---------- FRED: mortgage rate ----------
def fred(site):
    text = fetch("https://fred.stlouisfed.org/graph/fredgraph.csv?id=MORTGAGE30US")
    rows = []
    for rec in csv.DictReader(io.StringIO(text)):
        d = rec.get("observation_date") or rec.get("DATE")
        v = rec.get("MORTGAGE30US")
        if d and v not in (None, "", "."):
            rows.append({"week": d, "rate": float(v)})
    if not rows:
        sys.exit("FRED: no MORTGAGE30US rows.")
    cutoff = (datetime.date.fromisoformat(rows[-1]["week"]) - datetime.timedelta(days=730)).isoformat()
    return [("mortgage_rate", [r for r in rows if r["week"] > cutoff])]


# ---------- CCRS: crashes ----------
FPD_NCIC = "0105"   # Fremont Police Department; other agency codes in these rows are CHP offices


def ccrs(site):
    pkg = fetch_json("https://data.ca.gov/api/3/action/package_show?id=ccrs")["result"]
    res = {}
    for r in pkg["resources"]:
        n = r.get("name", "")
        if n.startswith("Crashes_") and n[8:].isdigit() and r.get("datastore_active"):
            res[int(n[8:])] = r["id"]
    if not res:
        sys.exit("CCRS: no crash tables found on data.ca.gov.")
    rows = []
    for year in sorted(res):
        q = ('SELECT count(*) AS reports, '
             'sum(CASE WHEN "NumberInjured">0 AND "NumberKilled"=0 THEN 1 ELSE 0 END) AS injury_crashes, '
             'sum(CASE WHEN "NumberKilled">0 THEN 1 ELSE 0 END) AS fatal_crashes, '
             'sum("NumberKilled") AS killed, sum("NumberInjured") AS injured, '
             'sum(CASE WHEN "NCIC Code"=\'%s\' THEN 1 ELSE 0 END) AS fpd_reports, '
             'sum(CASE WHEN "NCIC Code"=\'%s\' AND "NumberKilled">0 THEN 1 ELSE 0 END) AS fpd_fatal, '
             'max("Crash Date Time") AS last_crash '
             'FROM "%s" WHERE "City Name"=\'Fremont\' AND "IsDeleted"=\'False\'') % (FPD_NCIC, FPD_NCIC, res[year])
        rec = fetch_json("https://data.ca.gov/api/3/action/datastore_search_sql?sql=" + urllib.parse.quote(q))["result"]["records"][0]
        if not rec["reports"]:
            continue
        last = (rec.pop("last_crash") or "")[:10]
        row = {"year": year}
        row.update({k: int(rec[k] or 0) for k in ("reports", "injury_crashes", "fatal_crashes", "killed", "injured", "fpd_reports", "fpd_fatal")})
        row["status"] = "Year to date through " + month_label(last[:7])[:3] + " " + str(int(last[8:10])) if year == TODAY.year else "Full year"
        rows.append(row)
    return [("crashes_ccrs", rows)]


# ---------- USGS: earthquakes ----------
def usgs_url(kind, **params):
    p = {"format": "geojson", "latitude": LAT, "longitude": LON, "maxradiuskm": RADIUS_KM, "eventtype": "earthquake"}
    p.update(params)
    return "https://earthquake.usgs.gov/fdsnws/event/1/%s?%s" % (kind, urllib.parse.urlencode(p))


def usgs(site):
    feats = fetch_json(usgs_url("query", starttime="2016-01-01", minmagnitude=2.5, orderby="time-asc"))["features"]
    years = {}
    for f in feats:
        p = f["properties"]
        y = datetime.datetime.fromtimestamp(p["time"] / 1000, datetime.timezone.utc).year
        r = years.setdefault(y, {"year": y, "m25": 0, "m35": 0, "m45": 0, "largest": 0})
        m = p["mag"] or 0
        r["m25"] += 1
        r["m35"] += m >= 3.5
        r["m45"] += m >= 4.5
        r["largest"] = max(r["largest"], round(m, 1))
    rows = []
    for y in range(2016, TODAY.year + 1):
        r = years.get(y, {"year": y, "m25": 0, "m35": 0, "m45": 0, "largest": None})
        r["status"] = ("Year to date through " + READ.rsplit(",", 1)[0]) if y == TODAY.year else "Full year"
        r["source_url"] = usgs_url("count", starttime="%d-01-01" % y, endtime="%d-01-01" % (y + 1), minmagnitude=2.5)
        rows.append(r)

    big = fetch_json(usgs_url("query", starttime="2000-01-01", minmagnitude=4.0, orderby="magnitude", limit=10))["features"]
    largest = []
    for f in big:
        p = f["properties"]
        t = datetime.datetime.fromtimestamp(p["time"] / 1000, datetime.timezone.utc).astimezone(datetime.timezone(datetime.timedelta(hours=-8)))
        lon, lat = f["geometry"]["coordinates"][:2]
        largest.append({"date": t.strftime("%Y-%m-%d"), "label": MON[t.month - 1] + " " + str(t.day) + ", " + str(t.year),
                        "mag": round(p["mag"], 1), "place": p["place"], "km": round(dist_km(lat, lon)),
                        "source_url": p["url"]})
    return [("earthquake_years", rows), ("earthquake_largest", largest)]


def dist_km(lat, lon):
    from math import radians, sin, cos, asin, sqrt
    a = sin(radians(lat - LAT) / 2) ** 2 + cos(radians(LAT)) * cos(radians(lat)) * sin(radians(lon - LON) / 2) ** 2
    return 6371 * 2 * asin(sqrt(a))


# ---------- CMS: hospital star ratings ----------
CMS_Q = "https://data.cms.gov/provider-data/api/1/datastore/query/%s/0?"
HOSPITALS = {"wh": "050195", "kp": "050512"}


def cms_query(dataset, **conds):
    q = {}
    for i, (k, v) in enumerate(conds.items()):
        q["conditions[%d][property]" % i] = k
        q["conditions[%d][value]" % i] = v
    q["limit"] = 20
    return fetch_json(CMS_Q % dataset + urllib.parse.urlencode(q))["results"]


def cms(site):
    rows = load(site, "health_access")
    by = {r["id"]: r for r in rows}
    gen = {h["facility_id"]: h for h in cms_query("xubh-q36u", citytown="FREMONT", state="CA")}
    for key, fid in HOSPITALS.items():
        h = gen.get(fid)
        r = by.get(key + "_cms_star")
        if not h or not r:
            continue
        v = h.get("hospital_overall_rating")
        if v and v.isdigit():
            if int(v) != r["value"]:
                r["period"] = "CMS release current as of " + READ + " (check the release month on Care Compare)"
            r["value"] = int(v)
            r["note"] = "Fetched from the CMS data API " + READ + "."
        s = cms_query("dgck-syfz", facility_id=fid, hcahps_measure_id="H_STAR_RATING")
        r = by.get(key + "_hcahps_star")
        if s and r and s[0].get("patient_survey_star_rating", "").isdigit():
            s = s[0]
            r["value"] = int(s["patient_survey_star_rating"])
            r["period"] = "%s discharges" % period_mmddyyyy(s["start_date"], s["end_date"])
            r["note"] = "%s completed surveys, %s%% response rate. Fetched from the CMS data API %s." % (
                "{:,}".format(int(s["number_of_completed_surveys"])), s["survey_response_rate_percent"], READ)
    return [("health_access", rows)]


def period_mmddyyyy(a, b):
    f = lambda s: MON[int(s[:2]) - 1] + " " + s[-4:]
    return f(a) + "–" + f(b)


# ---------- files ----------
def path(site, ds):
    return os.path.join(site, "data", ds + ".json")


def load(site, ds):
    p = path(site, ds)
    if not os.path.exists(p):
        return []
    with open(p, encoding="utf-8") as f:
        return json.load(f)


def read_raw(p):
    if not os.path.exists(p):
        return ""
    with open(p, encoding="utf-8", newline="") as f:
        return f.read()


def write_like(p, text, like):
    """Write text with the same line endings the file had (git checks files out with CRLF on Windows)."""
    with open(p, "w", encoding="utf-8", newline="\r\n" if "\r\n" in like else "\n") as f:
        f.write(text)


def dump_rows(rows, like=""):
    """Keep the file's layout: indent=1 with no final newline (most files in data/), else one row per line."""
    if like.replace("\r\n", "\n").startswith("[\n {"):
        return json.dumps(rows, indent=1, ensure_ascii=False)
    return "[\n" + ",\n".join("  " + json.dumps(r, ensure_ascii=False) for r in rows) + "\n]\n"


def describe(old, new):
    if old == new:
        return []
    if not old:
        return ["new file, %d rows" % len(new)]
    out = []
    key = lambda r: r.get("id") or r.get("month") or r.get("week") or r.get("year") or r.get("date")
    ob = {key(r): r for r in old}
    nb = {key(r): r for r in new}
    for k, r in nb.items():
        o = ob.get(k)
        if o is None:
            out.append("added %s" % k)
        elif o != r:
            diff = ["%s %s -> %s" % (f, o.get(f), r.get(f)) for f in r if o.get(f) != r.get(f) and f != "note"]
            if diff:   # a note that only changes its fetch date is not worth rewriting the file for
                out.append("%s: %s" % (k, "; ".join(diff)))
    gone = [k for k in ob if k not in nb]
    if gone:
        out.append("dropped %d rows (%s ... %s)" % (len(gone), gone[0], gone[-1]))
    return out


SOURCES = {"bls": bls, "fred": fred, "ccrs": ccrs, "usgs": usgs, "cms": cms}


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("site", help="site folder that contains data/")
    ap.add_argument("--only", default=",".join(SOURCES), help="comma-separated: " + ",".join(SOURCES))
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()

    results = []
    for name in a.only.split(","):
        name = name.strip()
        if name not in SOURCES:
            sys.exit("Unknown source %r. Choose from %s." % (name, ", ".join(SOURCES)))
        print("Fetching %s ..." % name)
        try:
            results.extend(SOURCES[name](a.site))
        except Exception as e:   # one source failing should not stop the others
            print("  %s failed: %s" % (name, e))

    changed = []
    for ds, rows in results:
        old = load(a.site, ds)
        lines = describe(old, rows)
        print("%s: %s" % (ds, "no change" if not lines else "%d change(s)" % len(lines)))
        for line in lines[:25]:
            print("   -", line)
        if len(lines) > 25:
            print("   ... and %d more" % (len(lines) - 25))
        if lines:
            changed.append((ds, rows))

    if a.dry_run or not changed:
        print("Dry run: nothing written." if a.dry_run else "Nothing to write.")
        return
    stamp = TODAY.isoformat() + "T12:00:00Z"   # pages show the date part, so use the local date, not UTC's
    cat_path = path(a.site, "_catalog")
    cat_text = read_raw(cat_path)
    catalog = json.loads(cat_text)
    for ds, rows in changed:
        like = read_raw(path(a.site, ds))
        write_like(path(a.site, ds), dump_rows(rows, like), like)
        if ds in catalog:
            catalog[ds]["updated"] = stamp
        else:
            print("  note: %s is not in data/_catalog.json; add a title and description for it." % ds)
    write_like(cat_path, json.dumps(catalog, indent=1, ensure_ascii=False), cat_text)
    print("Wrote %s and updated _catalog.json." % ", ".join(ds + ".json" for ds, _ in changed))
    print("Next: set SITE.updated in js/fbn.js and rebuild the pre-rendered pages.")


if __name__ == "__main__":
    main()
