# Fremont by the Numbers

Static site (plain HTML/CSS/JS + JSON in data/). Data aggregator for Fremont, CA built by JeffreyAiFudenna using Claude. Every figure links to its source. No framework, no dependencies. Hosting: Vercel Hobby (non-commercial only: no ads or affiliate links as the main purpose unless moved to Pro or another host).

## How it works
- Pages are drawn in the browser from data/*.json by js/fbn.js using page specs in js/pages/<page>.js.
- Source link per figure: row source_url, then data/source_links.json (rows "dataset:id", then sources, then dataset default).
- The .html files are PRE-RENDERED snapshots (for crawlers). After changing any data, js or page spec, rebuild:
  `STANDALONE=1 node tools/build_ai_files.js . YYYY-MM-DD`   (needs Node + `npm i` once, which installs Playwright from package.json, a build-only tool; uses python3 http.server on port 8767). Also set SITE.updated in js/fbn.js first.
  STANDALONE=1 makes index.html a full document (required for Vercel).
- Speed: pages show the pre-rendered copy at once and fbn.js swaps in the live render when the data arrives. The build stamps css/js/data URLs with ?v=<hash of css/, js/, data/>, and vercel.json caches ?v= URLs for a year. So ALWAYS rebuild before deploying a data/js/css change, or returning visitors keep the old files.
- tools/refresh_zillow.py updates Zillow home value/rent from Zillow's public CSVs (dry run against the real files worked Oct 26, 2026).
- tools/refresh_apis.py (added Oct 28, 2026; standard library only, no keys) refreshes the free-API datasets: `python tools/refresh_apis.py . [--dry-run] [--only bls,fred,ccrs,usgs,cms]`. bls = Fremont/county/state unemployment (unemployment_monthly + 2 jobs_more rows), fred = mortgage_rate, ccrs = crashes_ccrs (CHP crash database), usgs = earthquake_years/earthquake_largest, cms = hospital star rows in health_access. It keeps each file's layout and line endings, only writes what changed, and stamps _catalog.json. A re-run with nothing new is a no-op.
- Owner rule (Oct 28, 2026): all refresh scripts run together, once a month, on the same day. Use `python tools/refresh_monthly.py .` on the run day ("run_day": 28 in tools/refresh_schedule.json). It runs refresh_zillow.py then refresh_apis.py, records the date in tools/refresh_last_run.json, and if data changed sets SITE.updated and rebuilds. It refuses on other days or a second time in a month (--force overrides; --dry-run works any day). It never commits, pushes or deploys. Don't run the two refresh scripts separately except to debug. Free keys the owner could sign up for later: Census API (would automate the ACS datasets) and api.data.gov (FBI crime data, College Scorecard, EV chargers). tools/refresh_schedule.json lists when each dataset is next due. Scheduled refreshes are NOT set up (owner will decide if the site proves useful).
- tools/factcheck_corrections.md (Oct 25) and tools/factcheck_2026-10-26.md: fact checks. The "Update" section at the top of the Oct 26 file says what is resolved and what still needs a person (sites that block automated checks).

## Rules from the owner
- Ask before deleting anything, adding dependencies, pushing to GitHub, or deploying live.
- Plain English in discuss/design, technical in build/review. Say plainly if a decision looks like a mistake.
- Never work around site blocks or CAPTCHAs; take source URLs from source_links.json or a search, never from memory.
- Check the work: rebuild, diff against the previous output, test at 390px and 1280px, light and dark.

## Git
When I ask you to commit, run the commit and push together as one command
(git commit -m "..." && git push) so I only get one approval prompt.
Never run them as separate commands. Do not push without asking me first.

## Next steps
1. DONE Oct 26, 2026: repo github.com/jeffreyaifudenna/fremont-by-the-numbers; live at https://fremontcabythenumbers.com (Namecheap domain, DNS A @ + CNAME www pointed at Vercel; old fremont-by-the-numbers.vercel.app still works) via `vercel deploy --prod` (GitHub repo is connected to the Vercel project, so pushes to main auto-deploy). Git commits use the GitHub noreply email.
2. Done: report-an-error link, privacy note, sitemap.xml + robots Sitemap line and canonical/og:url tags (ORIGIN in tools/build_ai_files.js). Preview image: og.png (1200x630) plus og:image tags in tools/build_ai_files.js. www redirects to the bare domain (vercel.json, verified Oct 26, 2026). Visitor counts: Vercel Web Analytics script is in every page head (anonymous, no cookies; privacy note says so); Analytics is enabled on the Vercel project (script answered 200 on Oct 26, 2026); see the Analytics tab in the Vercel dashboard. Hobby includes 50,000 events/month.
3. Optional later: monthly refresh (GitHub Actions or manual).
Full project notes live in the Claude project "Fremont By The Numbers" (claude/site-build-notes.md, claude/ai-readability.md).
