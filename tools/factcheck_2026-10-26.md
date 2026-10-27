# Fact check and site review, Oct 26, 2026

Second pass, one day after tools/factcheck_corrections.md. This one focuses on **where each figure comes from**, not re-confirming the 198 rows that already matched yesterday. Nothing in the site was changed.

## Update (Oct 26, 2026, evening; all deployed)
- thinksiliconvalley.com is still down. Warm Springs 850 acres and "more than 20,000 new jobs" are confirmed on the City's Warm Springs employment-hub page (fremont.gov, read in the in-app browser) and both rows now cite it. The "nearly 45,000 manufacturing jobs" row was removed: no live City page gives a job count (the Local Economy Overview now says advanced manufacturing is "one in every four jobs"; that page and the "over 900 companies" figure were already on the site).
- Relabelled: Pacific Commons sq ft is the portion offered for sale; Festival of the Arts attendance is a news estimate; Niles Antique Faire vendor count is a news report (organizer says "hundreds").
- Done: canonical and og:url tags; data/release_calendar.json deleted; Sources sentence about the release calendar replaced.
- Checked later in the in-app browser (read-only): WalletHub Greenest #7, Rent #26 and Retire #115 of 182 all match, sub-ranks included. Community centers (4) match the City's Community Centers page (now linked). Central Park Knoll's 8 pickleball courts match; Vallejo Mill added 4 more (opened Jun 17, 2026). Dog parks: still 2, now from City pages (Central Park + Vallejo Mill, opened Jun 17, 2026); Shinn Pond appears only in a local guide. New Central Park Community Center: City page still says Phase 1 complete in 2027.
- Home page: the "9 of 37 Fremont schools in California's top 100 (U.S. News)" card was replaced by "3 Fremont Unified high schools in California's top 50 (U.S. News, 2026-27)": Mission San Jose #10, Irvington #48, American #49 of the 5 comprehensive high schools (counted from data/high_schools.json). The U.S. News elementary and middle ranks are still shown on the Schools page (school finder) and are still unverified (U.S. News blocks automated checks).
- Left as is (no official page settles it): Aqua Adventure opened 2009 (no City page gives the year); Mission Peak 2,520 ft (USGS record not reachable; sources say 2,500-2,520); T-Mobile Rely $50 (T-Mobile's newsroom only states $35 with a voice line; promos vary).
- Still for a person: FUSD graduation rate 93.1% repeated for 2023-24 and 2024-25 (owner: ignore for now) (Ed-Data needs clicks the in-app browser is not approved for), the rest of section 3 below, and Section C of tools/factcheck_corrections.md.

## Status (Oct 26, 2026, later the same day)
Applied in the working tree (not yet committed or deployed): all 8 "fix first" items except the thinksiliconvalley.com links (the whole site is down; no official replacement page found, so the 3 rows still point there). Also swapped to primary links: BLS for unemployment, EDD for WARN, CA DIR for minimum wage, company/SEC/investor/TechCrunch pages for every startup round that cited Power Engineering, Crunchbase News, S&P AutoTechInsight, Renaissance Capital, Hoodline, Fertilizer Daily, Business Wire or VCBacked; Verizon's own page; Amtrak's fact sheet; per-row Kidder Mathews links; the moved Sutter urgent-care page. Removed the Citizen Portal and budget-Hoodline entries from the Sources list. Pages rebuilt (build verified deterministic first: rebuilding HEAD reproduced the committed files byte for byte).
Not changed: Weee! (Built In SF) and the Crunchbase/VCBacked counts, Tier 2 Data USA / BroadbandNow rows, Tier 4 stale items, Hoodline's affordable-homes figure (housing_production), canonical tags, release_calendar.json, and the Sources page sentence that still mentions a release calendar on the home page. The employers table was read from the FY2025 ACFR by a reviewer in the in-app browser; the PDF downloads instead of opening, so it was not re-read a second time.

## Fix first (wrong numbers or claims, verified against the original source)
1. **Top employers / Tesla 25,000** (home page, Jobs, Startups): the City's FY2025 ACFR says Tesla 23,000 and Lam 4,400, and adds Quanta Computer and Thermo Fisher. The site uses FY2024 figures copied from Wikipedia.
2. **WARN layoffs 2025**: site says 513 workers / 20 notices from an aggregator; the state's own WARN reports say 12 notices (about 358 workers). "No 2026 notices" is wrong (6 so far).
3. **Pony.ai "dual HQ Fremont"**: its SEC prospectus names Guangzhou as the principal office; Fremont is its U.S. office.
4. **Tandem PV round date**: Mar 2025, not Apr 2025; the $50M includes debt.
5. **Verizon 5G Home Plus** note: $80 on site, $70 on verizon.com.
6. **Amtrak Fremont station**: 33,060 on site; Amtrak's fact sheet says 32,781, counting boardings plus alightings.
7. **City budget**: the numbers are right, but they cite an AI meeting-summary site and Hoodline, and say "proposed" when the budget is now adopted.
8. **3 broken source links** (see section 2).

## 1. Questionable sources (ranked, worst first)

Of about 110 websites cited, most are official (City, Census, state agencies, BLS, CDE, CMS, NOAA) or the original publisher (Zillow, Redfin, WalletHub, U.S. News). The ones below are secondhand, commercial, AI-written, or blogs.

### Tier 1: replace (AI-written, or the figure is wrong on its source)
| Figure (file:row) | Cited source | Problem | Better source |
|---|---|---|---|
| City operating budget $427M and general fund $289.1M (city_facts: budget, general_fund) | Hoodline + citizenportal.ai | Citizen Portal is an AI-generated meeting-summary site; Hoodline is largely AI-assisted aggregation. Figure is the *proposed* budget; the budget has since been adopted. Hoodline is also the **default link for the whole city_facts dataset**, so police calls and FUSD enrollment rows fall back to a Hoodline tax article if their own match fails. | **Numbers match** the City's FY2026/27 *Adopted* Operating Budget (fremont.gov/home/showpublisheddocument/21162/639252581230269794, p. 32: total uses $427,121K, General Fund $289,089K). Re-point both rows there, change "proposed" to "adopted", and note "total uses includes transfers out". Also set a proper dataset default link. civic_facts city_fte 1,006.6 still cites the FY2025/26 proposed budget. |
| Top 10 employers, incl. Tesla 25,000 (employers, all 10 rows; jobs_more: tesla_fremont_largest_employer) | Wikipedia, "via City ACFR FY2024" | Wikipedia is not a primary source, **and the figures are out of date.** Tesla 25,000 is on the home page. | City FY2025 ACFR (fremont.gov/home/showpublisheddocument/19533, p. 202, Schedule 15): Tesla **23,000**, Lam Research **4,400**, Washington Hospital 2,400, **Quanta Computer 2,000** (missing from site), Kaiser 1,600, Synnex 1,400, Western Digital 1,100, City of Fremont 1,000, **Thermo Fisher 1,000** (missing), FUSD 800, Boehringer Ingelheim 800, Sutter Health 775 (12th, not top 10). Replace the table and the Tesla figure on the home page, Jobs and Startups. |
| Amtrak Fremont station 33,060 (living_facts: amtrak_riders) | Great American Stations | Amtrak's own FY2025 California fact sheet says **32,781**, and it counts boardings plus alightings, not riders. Use 32,781 and relabel. |
| WARN layoffs 513 workers / 20 notices in 2025 (jobs_more: fremont_warn_layoffs_2025) | LaborCurrent aggregator | **Wrong.** California EDD's own WARN reports (FY2024-25 and FY2025-26 PDFs) list **12 notices, about 358 workers** at Fremont addresses in 2025. The aggregator counts non-Fremont sites (Boston Scientific Sunnyvale, Flagship Menlo Park/SF) and double-counts Building Robotics. The note "No 2026 Fremont notices" is also wrong: EDD lists **6 in Jan–May 2026 (about 351 workers)**. | edd.ca.gov/en/jobs_and_training/layoff_services_warn (notice counts re-checked by hand; worker totals from the reviewer) |
| Verizon 5G Home note (utilities: verizon_home_internet_price) | Cord Cutters News | Base $60 matches Verizon, but the note says Home Plus is **$80**; verizon.com shows **$70**. | verizon.com/home/internet/5g/ |
| Aqua Adventure admission $27 (events: aqua_adventure_admission) | 510 Families blog | The same blog's 2025 guide says $34, contradicting $27. Official page (fremont.gov) blocks automated checks. | fremont.gov Aqua Adventure page, checked by a person |
| Dog parks = 2 (events: dog_parks_count) | Macaroni KID (parenting blog) | Official snippets show only Central Park Dog Park (large + small dog areas). Shinn Pond may not be a City dog park, so the official count may be 1. | fremont.gov dog parks page, checked by a person |

### Tier 2: secondhand aggregators (number probably right, but link to the original)
| Figure | Cited source | Note / better source |
|---|---|---|
| Fremont unemployment 4.5% (Aug 2026), 4.9% year ago; shown on the home page Jobs card (jobs_more) | YCharts (republishing BLS LAUS) | **Both match BLS** (series LAUCT062600000000003: Aug 2026 4.5%, Aug 2025 4.9%, re-checked today). Cite BLS instead of YCharts. Also: source_list.json says EDD city data was "last released for June 2024"; that is stale, BLS has Fremont through Aug 2026. |
| CA minimum wage $16.90 (jobs_more) | Davis Wright Tremaine law-firm blog | Matches. Cite the state: dir.ca.gov/DIRNews/2025/2025-118.html |
| Median earnings men/women, work-from-home 32.1%, drove alone 53.8%, super-commuters, employed residents (jobs_more, 6 rows) | Data USA | Data USA does not say 1-year vs 5-year ACS. The Commute chart (commute_modes) shows the same 53.8/32.1 from ACS DP03 directly, so the jobs_more rows can just cite DP03. Earnings: ACS B20017. (The Census API now needs a free key, so these were not re-checked today.) |
| Internet providers 14, average price $71.19 (utilities) | BroadbandNow | Commercial aggregator average of advertised plans; FCC map blocks automated checks. Keep labelled "Modeled". |
| Xfinity 99% / AT&T Fiber 76% coverage (utilities) | broadbandmap.com | Third-party reading of FCC data. Better: broadbandmap.fcc.gov. |
| T-Mobile Home Internet $50 (utilities) | ConsumerAffairs | t-mobile.com blocks automated checks; one Sep 2026 blog claims all tiers rose $5. Needs a person to check. |
| Mission Peak elevation 2,520 ft (events) | Wikipedia | Other sources say 2,517 ft. Better: USGS GNIS record 228839. |
| Aqua Adventure opened 2009 (events) | Wikipedia | Probably right; cite the City page. |
| Pacific Commons 887,130 sq ft (business: pacific_sqft) | JLL sale listing | Matches JLL's listing snippets, but it is the owned portion offered for sale; the whole center is about 1.1–1.2M sq ft (owner Heitman, manager Vestar). Relabel. |
| Office/R&D/industrial vacancy (vacancy) | Kidder Mathews broker reports | **All match** (office 6.9% direct / 20.5% total is real: large sublease vacancy). But source_links.json only links the office PDF, so the R&D and industrial rows open the wrong report. Add per-row links (rd-market-research-silicon-valley-2026-3q.pdf; East Bay industrial market report page). |

### Tier 3: startup figures resting on trade press or directories
All amounts match a primary or near-primary source. The problems are the "Fremont HQ" claims and one date.
| Row | Amount check | Fremont claim | Fix |
|---|---|---|---|
| Pacific Fusion $900M Series A (Power Engineering) | Matches founders' letter | "Based in Fremont" per the company | Cite pacificfusion.com/updates/founders-letter; money is released in stages |
| Neuralink $650M Series E (Crunchbase News) | Matches neuralink.com post | HQ only per Wikipedia/PitchBook; careers page lists Fremont as one of 3 sites | Say "Fremont site"; cite neuralink.com |
| Weee! $425M / $4.1B valuation (Built In SF) | Amount matches Weee! press page; valuation is press-reported only | Directories only | Cite Grocery Dive or Weee! press page |
| **Pony.ai IPO $260M (S&P AutoTechInsight)** | Matches SEC prospectus (20M ADS × $13) | **Not supported.** Prospectus gives principal office as Guangzhou; Fremont is its U.S. office | Change "dual HQ" to "U.S. offices in Fremont"; cite SEC 424B4. Also affects startups.json ponyai_ipo_2024 label |
| Alamar IPO $191M (Renaissance Capital) | Matches (11.25M × $17); with over-allotment it became about $220M | Fremont HQ, company dateline | Cite investors.alamarbio.com |
| Alamar Series C $128M (**Hoodline**) | Matches company release ($100M first close + $28M) | Fremont dateline | Replace Hoodline with the PR Newswire/BioSpace release |
| Nitricity $50M Series B (Fertilizer Daily) | Matches (Sep 10, 2025) | Pilot plant in Fremont, HQ not stated | Say "pilot plant in Fremont" |
| **Tandem PV $50M Series A (Business Wire)** | **Date wrong:** company release is Mar 4, 2025, not Apr 2025; "Series A and debt", not all equity | Fremont address and factory, San Jose dateline | Fix date and wording |
| Everestlabs $16.1M Series A (**VCBacked**) | Matches TechCrunch | Trade press / directories only | Cite TechCrunch |
| Crunchbase 2,463 orgs / $22.6B / 154 startups; VCBacked 82 | Cannot be checked (Crunchbase blocks automation) | n/a | Proprietary counts; keep labelled, or drop the two Crunchbase cards from the top of the Startups page |

### Tier 4: stale or soft figures (source is fine, the number is old or vague)
- Mission Peak visitors 274,000/yr (2016) and 22,700/month (2014): 10+ years old, from Bay Nature quoting the park district. No newer official count found.
- Festival of the Arts "150,000 attendees" (NBC Bay Area): the organizer only says "thousands of visitors". Edition numbering (42nd in 2026) **does** match the organizer, so yesterday's numbering concern is resolved.
- Niles Antique Faire "200 vendors" (Patch photo caption): organizer (niles.org) says "hundreds".
- Kaiser ED 33 bays (Ratcliff architects' portfolio page, undated design): not confirmed by Kaiser or HCAI. A 2014 Kaiser brochure lists 16 ED beds. Label as a design figure or drop.
- City "manufacturing jobs 45,000" and Warm Springs 850 acres / 20,000 jobs (thinksiliconvalley.com, the City's economic-development site): **both pages failed to load today** (404 / connection refused). Re-check; the City may have moved the site.
- FUSD graduation rate 93.1% shows for both 2023-24 and 2024-25 in school_trends.json; may be a copy error (DataQuest blocks automation; needs a person).

### Confirmed OK today (secondhand-looking but checked)
- AT&T Fiber $50 / $60 / $70 and Xfinity $45 promo: match the carriers' Fremont pages; yesterday's AT&T fix is in.
- Ava note now correctly says Renewable 100 is Fremont's default.
- Checkbook Safeway vs WinCo 49%: matches the article, not paywalled.
- Bay Area Community Health 8 Fremont sites: matches bach.health.
- Yesterday's Section A fixes (Redfin $897, ZORI label, S&P link to the ACFR, staffing and fatal-crash labels, uninsured phrase) are all in the data and live.

## 2. Site review

**Works well**
- Live site is byte-identical to the repo (index, rent, fbn.js, data, sitemap, robots, llms.txt checked).
- www redirects (308) to the bare domain; unknown pages return 404; HTTPS with HSTS.
- All 11 pages load with no "NaN", "undefined" or load errors; every card links to a source; one h1 per page; lang="en"; meta description and og:image present.
- 375px phone width: no horizontal page scroll on any page (wide tables scroll inside their own box). Light and dark both render correctly at 375px and 1280px.

**Problems**
1. **Broken source links (3):** thinksiliconvalley.com/advanced-manufacturing/ and /innovation-2/ (3 startup-page rows), and sutterhealth.org/find-location/facility/fremont-center-urgent-care (Health: urgent-care row) return 404.
2. **74 of 235 source links block automated checkers (HTTP 403)**: data.census.gov, bls.gov, fremont.gov documents, JLL, Cytek. They are probably fine for people in a browser but cannot be monitored automatically.
3. **Old address still serves a full copy**: fremont-by-the-numbers.vercel.app returns 200 instead of redirecting, and pages have no `<link rel="canonical">`. Search engines may index both. Fix: add canonical tags in tools/build_ai_files.js, or a host redirect for the vercel.app domain in vercel.json.
4. **data/release_calendar.json** is still published and described in README.md, but no page uses it.
5. **Rebuild not verified**: the build needs Playwright, which is not installed on this machine, so I could not confirm the pre-rendered .html snapshots match the data. The live JS-drawn pages are correct either way; this only affects what crawlers see.
6. Minor: chart axis labels are small and low-contrast in dark mode on phones.

## 3. What a person still needs to check (sites block automation)
fremont.gov blocks automated fetchers; the budget and ACFR PDFs were read in the in-app browser, but the dog parks and Aqua Adventure pages still need a person. Also:, t-mobile.com, FCC broadband map, CDE DataQuest (graduation rate), data.census.gov / Census API (needs a free API key), U.S. News elementary and middle ranks, plus Section C of tools/factcheck_corrections.md.
