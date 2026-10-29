#!/usr/bin/env python3
"""Refresh the datasets that come from free public APIs (no key needed, except the optional Census one).

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

  census U.S. Census Bureau American Community Survey API (needs a free key: CENSUS_API_KEY or tools/census_key.txt).
        Refreshes the ACS rows of census_profile, people_more, commute_modes, languages, asian_groups,
        resident_industries, rent_by_bedroom and the four insurance rows of health_access. With the same
        survey years as the site it reproduces the stored numbers (a check on the mapping); when a new ACS
        year is published it updates them and lists what to edit by hand. Skipped when there is no key.

Normally run once a month by tools/refresh_monthly.py, together with refresh_zillow.py.

Usage
  python3 refresh_apis.py SITE_FOLDER                  # fetch everything, then write
  python3 refresh_apis.py SITE_FOLDER --dry-run        # show changes, write nothing
  python3 refresh_apis.py SITE_FOLDER --only bls,fred  # just some sources

Each written dataset also gets a new 'updated' time in data/_catalog.json.
After a real update, set SITE.updated in js/fbn.js and rebuild the pre-rendered pages
(STANDALONE=1 node tools/build_ai_files.js . YYYY-MM-DD).
"""
import argparse, csv, datetime, io, json, os, re, sys, urllib.error, urllib.parse, urllib.request

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


# ---------- Census: American Community Survey ----------
# Needs a free key (https://api.census.gov/data/key_signup.html): set CENSUS_API_KEY, or put it alone in
# tools/census_key.txt (do not commit that file). Fremont city = state 06, place 26000.
ACS_PLACE = "for=place:26000&in=state:06"

# census_profile rows from the ACS profile tables: id -> variable
PROFILE_ROWS = {
    "foreign_born": "DP02_0094PE", "other_lang": "DP02_0114PE", "same_house": "DP02_0080PE", "households": "DP02_0001E",
    "pph": "DP02_0016E", "owner_rate": "DP04_0046PE", "med_value": "DP04_0089E", "med_rent": "DP04_0134E",
    "owner_cost": "DP04_0101E", "broadband": "DP02_0154PE", "mhi": "DP03_0062E", "pci": "DP03_0088E",
    "poverty": "DP03_0128PE", "ba_plus": "DP02_0068PE", "hs_plus": "DP02_0067PE", "lfpr": "DP03_0003PE",
    "commute": "DP03_0025E",
}
# people_more rows: id -> variable (counts in the notes come from COUNT_VARS)
PEOPLE_ROWS = {
    "median_age": "DP05_0018E", "hh_kids": "DP02_0014PE", "inc_200k": "DP03_0061PE", "veterans": "DP02_0070PE",
    "disability": "DP02_0072PE", "housing_units": "DP04_0001E", "vacancy": "DP04_0003PE", "owner_vacancy": "DP04_0004E",
    "rental_vacancy": "DP04_0005E", "year_built": "B25035_001E",
}
ASIAN_GROUPS = {"Asian Indian": "DP05_0062PE", "Chinese": "DP05_0063PE", "Filipino": "DP05_0064PE", "Other Asian": "DP05_0068PE",
                "Vietnamese": "DP05_0067PE", "Korean": "DP05_0066PE", "Japanese": "DP05_0065PE"}
INDUSTRIES = {
    "Professional, scientific, management and administrative": "DP03_0041", "Education and health care": "DP03_0042",
    "Manufacturing": "DP03_0035", "Retail trade": "DP03_0037", "Finance, insurance and real estate": "DP03_0040",
    "Arts, entertainment, lodging and food service": "DP03_0043", "Information": "DP03_0039",
}   # add "E" for the worker count, "PE" for the share
LANGUAGES = {   # speakers 5+ (C16001); the share is of all residents 5+
    "English only": "C16001_002E", "Other Indo-European languages (incl. Hindi, Gujarati, Punjabi)": "C16001_015E",
    "Chinese (incl. Mandarin, Cantonese)": "C16001_021E", "Other Asian and Pacific Island languages (incl. Telugu, Tamil)": "C16001_030E",
    "Spanish": "C16001_003E", "Tagalog (incl. Filipino)": "C16001_027E", "Vietnamese": "C16001_024E", "Korean": "C16001_018E",
}
COMMUTE = {"Drove alone": ["B08301_003E"], "Worked from home": ["B08301_021E"], "Carpooled": ["B08301_004E"],
           "Public transit": ["B08301_010E"], "Walked": ["B08301_019E"],
           "Other means": ["B08301_016E", "B08301_017E", "B08301_018E", "B08301_020E"]}   # taxi, motorcycle, bicycle, other
RENT_BEDROOMS = ["B25031_002E", "B25031_003E", "B25031_004E", "B25031_005E", "B25031_006E"]   # studio .. 4 bedrooms; _007E is 5+
BURDEN = ["B25070_%03dE" % i for i in range(1, 12)] + ["B25091_%03dE" % i for i in range(1, 13)]   # rent, owner-with-mortgage
# ACS 1-year health insurance tables C27004-C27007: the "with coverage" cells (male then female, under 19 / 19-64 / 65+)
INSURANCE = {"employer_coverage_share": "C27004", "direct_purchase_share": "C27005", "medicare_share": "C27006", "medicaid_share_fremont": "C27007"}
INS_WITH = (4, 7, 10, 14, 17, 20)   # cells 9 and 19 are the male and female 65+ totals; 10 and 20 their "with coverage" cells


def census_key():
    k = os.environ.get("CENSUS_API_KEY", "").strip()
    f = os.path.join(os.path.dirname(os.path.abspath(__file__)), "census_key.txt")
    if not k and os.path.exists(f):
        with open(f, encoding="utf-8") as fh:
            k = fh.read().strip()
    return k


def acs_get(year, survey, table_path, names, key):
    """One row of Fremont values from the ACS API (at most 50 variables a request). Never print the URL: it holds the key."""
    out = {}
    for i in range(0, len(names), 45):
        url = "https://api.census.gov/data/%d/acs/%s%s?get=%s&%s&key=%s" % (year, survey, table_path, ",".join(names[i:i + 45]), ACS_PLACE, key)
        head, row = fetch_json(url)[:2]
        out.update(zip(head, row))
    return out


def acs_latest(survey, key):
    for y in range(TODAY.year, TODAY.year - 3, -1):
        try:
            acs_get(y, survey, "", ["B01003_001E"], key)
            return y
        except urllib.error.HTTPError as e:
            if e.code != 404:   # 404 = that year is not published yet
                raise
    sys.exit("Census: no ACS %s year found." % survey)


def num(v):
    """Census returns strings; large negative numbers mean 'not available'."""
    try:
        v = float(v)
    except (TypeError, ValueError):
        return None
    return None if v < -999999 else v


def n_(v):
    return int(round(v)) if v is not None else None


def pct(a, b):
    return round(100.0 * a / b, 1) if a is not None and b else None


def commas(v):
    return "{:,}".format(int(v))


def restamp(s, old5, new5, old1, new1):
    """Move the survey years named in a string to the new vintage."""
    if not isinstance(s, str) or (old5 == new5 and old1 == new1):
        return s
    s = s.replace("%d–%d" % (old5 - 4, old5), "%d–%d" % (new5 - 4, new5)).replace("%d dollars" % old5, "%d dollars" % new5)
    s = s.replace("5Y%d" % old5, "5Y%d" % new5).replace("1Y%d" % old1, "1Y%d" % new1)
    return s.replace("%d (ACS 1-year)" % old1, "%d (ACS 1-year)" % new1).replace("ACS %d 1-year" % old1, "ACS %d 1-year" % new1)


def set_row(r, value, texts, stamp):
    """Update one row's value; when the value or the survey year moved, restamp its text and its 'Read' date."""
    old = r.get("value")
    r["value"] = value
    for f in ("period", "measure", "label", "source", "source_url", "note"):
        if f in r:
            r[f] = restamp(r[f], *stamp)
    if "note" in texts:
        r["note"] = texts["note"]
    if old != value or stamp[0] != stamp[1] or stamp[2] != stamp[3]:
        if isinstance(r.get("note"), str):
            r["note"] = re.sub(r"Read [A-Z][a-z]{2} \d{1,2}, \d{4}\.", "Read %s." % READ, r["note"])


def census(site):
    key = census_key()
    if not key:
        print("  skipped: no Census API key (set CENSUS_API_KEY, or put the key in tools/census_key.txt).")
        return []
    y5, y1 = acs_latest("acs5", key), acs_latest("acs1", key)
    profile = load(site, "census_profile")
    m = re.search(r"(\d{4})–(\d{4})", next((r["period"] for r in profile if r["id"] == "mhi"), "")) or sys.exit("Census: cannot find the stored ACS years.")
    old5 = int(m.group(2))
    ins_rows = load(site, "health_access")
    old1 = int(re.search(r"(\d{4}) \(ACS 1-year\)", next(r["period"] for r in ins_rows if r["id"] == "employer_coverage_share")).group(1))
    stamp = (old5, y5, old1, y1)
    print("  ACS 5-year %d–%d (site has %d–%d); ACS 1-year %d (site has %d)" % (y5 - 4, y5, old5 - 4, old5, y1, old1))

    prof_vars = list(PROFILE_ROWS.values()) + list(PEOPLE_ROWS.values()) + ["DP02_0070E", "DP02_0014E", "DP03_0061E", "DP02_0001E"] + list(ASIAN_GROUPS.values())
    prof_vars += [v + s for v in INDUSTRIES.values() for s in ("E", "PE")]
    p = acs_get(y5, "acs5", "/profile", sorted({v for v in prof_vars if v.startswith("DP")}), key)
    d = acs_get(y5, "acs5", "", sorted(set(sum(COMMUTE.values(), []) + list(LANGUAGES.values()) + RENT_BEDROOMS + BURDEN
                                          + ["B08301_001E", "C16001_001E", "B25031_007E", "B25035_001E"])), key)
    p.update(d)
    out = []

    # census_profile (only the survey rows; the QuickFacts estimate, land-area and race rows are left alone)
    rows = load(site, "census_profile")
    for r in rows:
        v = num(p.get(PROFILE_ROWS.get(r["id"], "-")))
        if v is None:
            continue
        if r["id"] == "owner_cost" and int(v) % 100 == 1:
            v -= 1   # ACS reports a top-coded median ("$4,000+") as 4,001
        set_row(r, int(v) if r["format"] in ("int", "usd", "usd_plus") else v, {}, stamp)
    out.append(("census_profile", rows))

    # people_more
    rows = load(site, "people_more")
    hh = num(p["DP02_0001E"])
    notes = {"hh_kids": "%s of %s" % (commas(num(p["DP02_0014E"])), commas(hh)), "inc_200k": "%s of %s" % (commas(num(p["DP03_0061E"])), commas(hh)),
             "veterans": "%s veterans" % commas(num(p["DP02_0070E"]))}
    rb, ob = [num(d[k]) for k in BURDEN[:11]], [num(d[k]) for k in BURDEN[11:]]
    rows_ok = {"rent_burden": (pct(sum(rb[6:10]), rb[0] - rb[10]), "%s of %s renter households with a computed ratio" % (commas(sum(rb[6:10])), commas(rb[0] - rb[10]))),
               "owner_burden": (pct(sum(ob[7:11]), ob[1] - ob[11]), "%s of %s" % (commas(sum(ob[7:11])), commas(ob[1] - ob[11])))}
    for r in rows:
        if r["id"] in PEOPLE_ROWS:
            v = num(p[PEOPLE_ROWS[r["id"]]])
            set_row(r, int(v) if r["format"] in ("int", "text") else v, {"note": notes[r["id"]]} if r["id"] in notes else {}, stamp)
        elif r["id"] in rows_ok:
            set_row(r, rows_ok[r["id"]][0], {"note": rows_ok[r["id"]][1]}, stamp)
    out.append(("people_more", rows))

    # commute_modes
    total = num(d["B08301_001E"])
    rows = [{"mode": k, "share_pct": pct(w, total), "workers": n_(w)} for k, w in ((k, sum(num(d[x]) for x in v)) for k, v in COMMUTE.items())]
    out.append(("commute_modes", sorted(rows, key=lambda r: -r["workers"])))

    # languages (English only has no speaker count on the site today; the table has one, so fill it)
    total = num(d["C16001_001E"])
    rows = [{"language": k, "share_pct": pct(num(d[v]), total), "people": n_(num(d[v]))} for k, v in LANGUAGES.items()]
    out.append(("languages", rows[:1] + sorted(rows[1:], key=lambda r: -r["share_pct"])))

    # asian_groups, resident_industries
    rows = [{"group": k, "share_pct": num(p[v])} for k, v in ASIAN_GROUPS.items()]
    out.append(("asian_groups", sorted(rows, key=lambda r: -r["share_pct"])))
    rows = [{"industry": k, "share_pct": num(p[v + "PE"]), "workers": n_(num(p[v + "E"]))} for k, v in INDUSTRIES.items()]
    out.append(("resident_industries", sorted(rows, key=lambda r: -r["share_pct"])))

    # rent_by_bedroom: only the column for the survey years already on the site (a new vintage needs a new column and rent.js edits by hand)
    rows = load(site, "rent_by_bedroom")
    col, flag = "acs_%d_%d" % (old5 - 4, old5), "top_coded_%d" % old5
    if y5 != old5:
        print("  rent_by_bedroom: ACS %d–%d is out; add an acs_%d_%d column and a top_coded_%d flag by hand (and edit js/pages/rent.js)." % (y5 - 4, y5, y5 - 4, y5, y5))
    else:
        top = num(d["B25031_007E"])
        for r, var in zip(rows, RENT_BEDROOMS):
            v = num(d[var])
            r[col], r[flag] = n_(v), v == top
        out.append(("rent_by_bedroom", rows))

    # health insurance (ACS 1-year, summed across the sex-by-age cells)
    names = []
    for t in INSURANCE.values():
        names += ["%s_%03dE" % (t, i) for i in (1, 9, 19) + INS_WITH]
    ins = acs_get(y1, "acs1", "", names, key)
    rows = load(site, "health_access")
    for r in rows:
        t = INSURANCE.get(r["id"])
        if not t:
            continue
        g = lambda i: num(ins["%s_%03dE" % (t, i)])
        base, got = g(1), sum(g(i) for i in INS_WITH)
        note = re.sub(r"^[\d,]+ of [\d,]+", "%s of %s" % (commas(got), commas(base)), r["note"])
        if t == "C27006":   # Medicare: also the share among residents 65 and over
            w65, tot65 = g(10) + g(20), g(9) + g(19)
            note = re.sub(r"\d+\.\d% \([\d,]+ of [\d,]+\)", "%s%% (%s of %s)" % (pct(w65, tot65), commas(w65), commas(tot65)), note)
        set_row(r, pct(got, base), {"note": note}, stamp)
    out.append(("health_access", rows))
    return out


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
    """Keep the file's layout. The data files use a few: indent 0, 1 or 2, or one row per line; with or without
    unicode escapes and a final newline. Pick the one that reproduces the old file from its own rows."""
    cur = like.replace("\r\n", "\n")
    old = json.loads(cur) if cur.strip() else None
    perline = lambda r, ea: "[\n" + ",\n".join("  " + json.dumps(x, ensure_ascii=ea) for x in r) + "\n]"
    for ea in (False, True):
        for fmt in (lambda r: json.dumps(r, indent=1, ensure_ascii=ea), lambda r: json.dumps(r, indent=0, ensure_ascii=ea),
                    lambda r: json.dumps(r, indent=2, ensure_ascii=ea), lambda r: perline(r, ea)):
            for end in ("", "\n"):
                if old is not None and fmt(old) + end == cur:
                    return fmt(rows) + end
    return perline(rows, False) + "\n"


def describe(old, new):
    if old == new:
        return []
    if not old:
        return ["new file, %d rows" % len(new)]
    out = []
    key = lambda r: r.get("id") or r.get("month") or r.get("week") or r.get("year") or r.get("date") or r.get("mode") or r.get("language")         or r.get("group") or r.get("industry") or r.get("bedrooms")
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


SOURCES = {"bls": bls, "fred": fred, "ccrs": ccrs, "usgs": usgs, "cms": cms, "census": census}


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
