# Fremont by the Numbers: fact-check results and correction list (Oct 25, 2026)

Three independent reviewers re-checked about 258 rows (single figures or groups) against their sources. Totals: Confirmed 198 | Mismatch 7 | Stale 2 | Could not verify 51. No wrong-city mix-ups (Fremont MI/NE/OH) were found.
Full reviewer reports (scratchpad): factcheck/report_A.md, report_B.md, report_C.md. Nothing on the site has been changed.

## A. Fix before launch (reviewer evidence is specific)
| # | Page | What the site says | What the source says | Proposed fix |
|---|---|---|---|---|
| 1 | Rent, Internet | AT&T Fiber 300 Mbps $35 | AT&T Fremont page: $50/mo | Show $50 (label any $35 as a conditional promo). Re-check, prices may have changed since Oct 24 |
| 2 | Rent, Internet | AT&T Fiber 1 Gig $65; note "500 Mbps is $50" | Page: 1 Gig $70, 500 Mbps $60 | Show $70 / $60 |
| 3 | Rent, Utilities | Note: "Bright Choice is Fremont's default plan" | Ava's Fremont page: Renewable 100 is the default (the City Data page already says so) | Fix note. Decide which bill to show: $138.33 is Bright Choice; Renewable 100 at 338 kWh is $144.43 |
| 4 | Rent, Buying | Redfin Fremont $901 per sq ft (Sep 2026) | Redfin: $897 | Change to $897 |
| 5 | City Data | S&P AA+ (stable) links to the FY2025/26 proposed budget, which doesn't state the rating | FY2024-25 ACFR does (fremont.gov showpublisheddocument/19533) | Re-point the link |
| 6 | Safety, staffing chart | Titled "funded positions"; 2025 sworn = 190 next to 205 authorized | 205 authorized sworn, 16 vacancies at Oct 31, 2025 (about 189 employed) | Relabel as employed staff, or explain the 190 vs 205 |
| 7 | Safety, fatal crashes chart | Legend "Other fatalities listed" | City column is "Other Fatal Crashes" (crashes, not deaths) | Rename the legend |
| 8 | Schools, high school table | Students: MSJ 1,794 / Irvington 2,157 / American 2,618 / Washington 1,957 / JFK 1,273 | Same page's finder shows 1,740 / 2,141 / 2,694 / 1,964 / 1,308 (checked directly: MSJ 1,740 and JFK 1,308 match CDE 2025-26) | Use the CDE numbers, or footnote the data year for Students, Graduation, AP columns (verified against site data: the two tables do disagree) |
| 9 | Startups, funding rounds | Ultima Genomics $600M (May 2022, Fremont HQ) not listed | Reviewer cites Wikipedia | Add it as #3 after confirming with a primary source (press release). Verified: it is absent from startup_rounds.json |
| 10 | Home, Rent, topic card | "Typical asking rent" $3,388 (Zillow ZORI, Sep 2026) links to a Zillow page that shows "average rent $2,996" (data through Jan 2026) | Site's own Jan 2026 ZORI value is $3,161; growth rates agree, levels differ | Name the measure ("Zillow Observed Rent Index") and link the Research data page |
| 11 | Health | "one of the lowest uninsured rates in California" has no support | n/a | Add a comparison figure or drop the phrase |

## B. Small label/date tidy-ups
- City rankings: ParkScore date can read "May 20, 2026" (not just "2026"); "Most Caring" (#5 of 100, Dec 8, 2025) is a 2025 edition though the catalog text says "2026 rankings"; "Least Stressed #1" reframes WalletHub's most-stressed-first table (already disclosed).
- Home card "9 of 37": the 37 leaves out Cabrillo, which U.S. News ranks as a range; consider "of 38 ranked". Only the three high-school ranks (#10, #48, #49 in California) are confirmed.
- Crime: add a note that sources differ (state DOJ 436 violent in 2024; FBI-derived sites show 444-473; FPD's 2023 report 448 vs site 475). Label which population the per-1,000 rates divide by (Jan 2025 DOF).
- Jobs: WARN 2025 total (513 over 20 notices) includes apparent duplicate filings (unique about 423) and the source shows no 2026 notices; "median earnings, full-time year-round" label not confirmed (check ACS B20017).
- Parks: "trail miles, all agencies" label unconfirmed (city page describes 61 miles as the City's network); Festival of the Arts edition numbering inconsistent (1983 start would make 2026 the 44th).
- City pages disagree with themselves on manufacturing share ("35%", "one in three", "one in four").
- Leftover file data/release_calendar.json is still in the published site although the section was removed.

## C. Could not be checked automatically (needs a normal browser or a person)
- Employers table: FY2025 ACFR principal-employers table (fremont.gov showpublisheddocument/19533, PDF p. ~200-202). Currently FY2024 via Wikipedia. Tesla 25,000 may be out of date (June 2023 speech: "recently exceeded 30,000"). Tesla is on the home page and the Startups card.
- WalletHub 2026 ranks for Greenest #7, Rent #26, Retire #115 (115 was also Fremont's 2014 rank). Edition, date and "of N" are right for all 14 rows.
- FUSD four-year graduation rate 93.1%: the trend file also shows 93.1% for 2023-24, which may be a copy error. DataQuest blocks automation; do not work around it.
- State crime file: confirm 436 violent / 5,233 property for 2024. Violent cleared is 155 in both 2022 and 2023 (verified in the data file; could be coincidence).
- U.S. News elementary and middle ranks behind "9 of 37" (blocked to fetchers).
- Census ACS detail tables (rent by bedroom, rent burden, housing units, vacancy, coverage shares, commute time, industry shares, 451 restaurants from the Economic Census): data.census.gov needs a browser.
- Zillow listing counts, Redfin ZIP 94539 (cached 2024 page), city dashboards (FremontApp, climate cards, fire 2021-2024 bars), BART history, property tax rate, students per teacher, fire department area (88 vs 92 sq mi in a city document), Safeway vs WinCo 49%, library / community center / pickleball counts.

## D. Method limits
Reviewers could not use sources that block automated access (EDD, DataQuest, U.S. News, data.census.gov, the DOJ download, FY2025 ACFR PDF); fetch tools sometimes served stale cached pages (WalletHub, Zillow), so some 2026 ranks were confirmed from news coverage instead. "Confirmed" means the number matched the source the reviewer could open.
