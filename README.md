# FremontCaByTheNumbers.com

**Live site:** https://fremontcabythenumbers.com

Built by Jeffrey Fudenna with Claude Code.

A static website that shows public data about Fremont, California, with the source and date on every figure.

No framework and no server code. Plain HTML, CSS and JavaScript plus JSON data files; the site itself loads no third-party libraries. Works on any device.

There is one local build step: the `.html` files are pre-rendered snapshots (for speed, crawlers and AI tools), made by `tools/build_ai_files.js` in a headless browser. That build needs Node and Playwright (`npm i` once, from `package.json`; a build-only tool that Vercel does not install, see `.vercelignore`).

## Folder layout

```
index.html            home page: headline numbers and one door into each category
rent.html … sources.html   one page per category, plus Sources & Methodology
css/tokens.css        the color scheme (Bayside light, Night Shift dark)
css/site.css          layout and components
js/fbn.js             shared renderer: loads data files, draws cards, tables, charts
js/charts.js          small SVG chart module (line, bar, horizontal bar); no dependencies
js/pages/<page>.js    what each page shows: which datasets, cards, charts, tables
data/<dataset>.json   the numbers, one file per dataset
data/_catalog.json    title, description and read date for every dataset
tools/merge_research.py   copies a researcher's JSON into data/ and registers it
```

## How a number gets on a page

1. It lives in a row of a `data/*.json` file, together with its `period`, `source` and (for newer datasets) `source_url`, `kind` and `geo`.
2. A page file in `js/pages/` points at it: `{ ds: 'zillow_market', id: 'zori' }` makes a stat card; a chart or table names the dataset and the columns.
3. The renderer prints the value, the period and the source under it automatically.

So **to update a figure, edit the data file**, not the page. To add a card, add one line to the page file.

## Updating data

- Edit the JSON in `data/` (GitHub's web editor is fine). Keep `period` and `source` current.
- Update the `updated` date in `data/_catalog.json` for that dataset, and `SITE.updated` at the top of `js/fbn.js` for the header.
- A future pipeline (Fremont Pulse) only needs to overwrite these files; nothing in the pages changes.

## Running it locally

The pages fetch the data files, so they need to be served over HTTP (opening `index.html` as a file will show "figures could not be loaded"). From this folder:

```
python3 -m http.server 8000
```

then open http://localhost:8000.

## Publishing

Push the folder to a GitHub repository and connect it to Vercel (or Netlify, GitHub Pages, Cloudflare Pages). Vercel needs no build command; the output directory is the repo root and every push republishes the site in about a minute. **Before pushing any change to `css/`, `js/` or `data/`, rerun the pre-render locally:**

```
STANDALONE=1 node tools/build_ai_files.js . YYYY-MM-DD
```

It rewrites every page, `llms.txt`, `llms-full.txt`, `sitemap.xml` and `robots.txt`, and stamps asset URLs with `?v=<hash of css/, js/, data/>`. Those URLs are cached for a year (`vercel.json`), so skipping the rebuild leaves returning visitors on old files.

## Conventions

- Fremont is always series color 1 (blue). Benchmarks (California, HUD) use series 2 (orange) and are dashed in line charts.
- Hollow points and bars mean the period is incomplete, year-to-date, preliminary, an estimate or a goal.
- Notes starting with `!` render with a warning marker.
- Text never uses series colors; series colors are for chart marks and legend swatches only.

The dataset was compiled using Claude from the public sources listed on the Sources page.

## License

MIT License. See [LICENSE](LICENSE). Free to use, change and share.
