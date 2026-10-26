# Fremont by the Numbers

Static site (plain HTML/CSS/JS + JSON in data/). Data aggregator for Fremont, CA built by JeffreyAiFudenna using Claude. Every figure links to its source. No framework, no dependencies. Hosting: Vercel Hobby (non-commercial only: no ads or affiliate links as the main purpose unless moved to Pro or another host).

## How it works
- Pages are drawn in the browser from data/*.json by js/fbn.js using page specs in js/pages/<page>.js.
- Source link per figure: row source_url, then data/source_links.json (rows "dataset:id", then sources, then dataset default).
- The .html files are PRE-RENDERED snapshots (for crawlers). After changing any data, js or page spec, rebuild:
  `STANDALONE=1 node tools/build_ai_files.js . YYYY-MM-DD`   (needs Node + `npm i playwright` once; uses python3 http.server on port 8767). Also set SITE.updated in js/fbn.js first.
  STANDALONE=1 makes index.html a full document (required for Vercel).
- tools/refresh_zillow.py updates Zillow home value/rent from Zillow's public CSVs (untested against the real files). tools/refresh_schedule.json lists when each dataset is next due. Scheduled refreshes are NOT set up (owner will decide if the site proves useful).
- tools/factcheck_corrections.md: Oct 25, 2026 fact check; its "could not be checked" list still needs a person or browser.

## Rules from the owner
- Ask before deleting anything, adding dependencies, pushing to GitHub, or deploying live.
- Plain English in discuss/design, technical in build/review. Say plainly if a decision looks like a mistake.
- Never work around site blocks or CAPTCHAs; take source URLs from source_links.json or a search, never from memory.
- Check the work: rebuild, diff against the previous output, test at 390px and 1280px, light and dark.

## Next steps
1. DONE Oct 26, 2026: repo github.com/jeffreyaifudenna/fremont-by-the-numbers; live at https://fremont-by-the-numbers.vercel.app via `vercel deploy --prod` (GitHub repo is connected to the Vercel project, so pushes to main auto-deploy). Git commits use the GitHub noreply email.
2. Done: report-an-error link, privacy note, sitemap.xml + robots Sitemap line (ORIGIN in tools/build_ai_files.js; change it if a custom domain is added). Still to do: preview image, domain choice, visitor counts.
3. Optional later: monthly refresh (GitHub Actions or manual).
Full project notes live in the Claude project "Fremont By The Numbers" (claude/site-build-notes.md, claude/ai-readability.md).
