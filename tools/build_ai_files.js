/* Builds the AI- and crawler-friendly files for Fremont by the Numbers.
 * Run from anywhere:  node build_ai_files.js <site folder> [YYYY-MM-DD]
 * Needs Playwright. Steps: (1) write plain page shells, (2) render every page in a headless browser,
 * (3) write the final shells (pre-rendered content + JSON-LD), llms.txt, llms-full.txt and robots.txt. */
const fs = require('fs'), path = require('path'), cp = require('child_process');
const { chromium } = require('playwright');

const SITE = path.resolve(process.argv[2] || '.');
const MODIFIED = process.argv[3] || new Date().toISOString().slice(0, 10);
const NAME = 'Fremont by the Numbers';
const PAGES = [
  { file: 'index', label: 'Overview', title: NAME, type: 'WebSite', desc: 'Fremont by the Numbers is a data aggregator built using Claude. It gathers public figures about Fremont, California (housing, schools, safety, jobs and more) and links every number to its source.' },
  { file: 'rent', label: 'Rent & Housing', desc: 'Typical rent, home prices, housing stock, new homes, utility bills, internet and child care costs in Fremont, California, each with its source and date.' },
  { file: 'schools', label: 'Schools', desc: 'Fremont Unified graduation rates, test results, high school rankings and a finder for every elementary, middle and high school, each with its source and date.' },
  { file: 'food', label: 'Food', desc: 'Grocery budgets, food price inflation, restaurants and grocery stores in Fremont, California, each with its source and date.' },
  { file: 'parks', label: 'Parks & Events', desc: 'Parks, trails, annual events, community facilities and weather in Fremont, California, each with its source and date.' },
  { file: 'city', label: 'City Data', desc: 'Population, households, city budget, elections, city services, climate, transportation and national rankings for Fremont, California, each with its source and date.' },
  { file: 'safety', label: 'Crime & Safety', desc: 'Crime, police, fire department and traffic safety figures for Fremont, California, each with its source and date.' },
  { file: 'health', label: 'Health Care', desc: 'Hospitals, health coverage, clinics and community health figures for Fremont, California, each with its source and date.' },
  { file: 'jobs', label: 'Jobs', desc: 'Unemployment, income, largest employers, wages, industries and commuting in Fremont, California, each with its source and date.' },
  { file: 'startups', label: 'Startups', title: 'Startup Ecosystem', desc: 'Companies, funding rounds, the manufacturing base and rankings in the Fremont, California startup ecosystem, each with its source and date.' },
  { file: 'sources', label: 'About & Sources', title: 'About, Sources & Methodology', type: 'AboutPage', desc: 'How Fremont by the Numbers works: a data aggregator built using Claude, its methodology, limitations, datasets and every source page.' }
];
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pageTitle = p => p.title || p.label;
const fullTitle = p => p.file === 'index' ? NAME : pageTitle(p) + ' · ' + NAME;

function head(p, extra) {
  return '<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
    '<title>' + esc(fullTitle(p)) + '</title>\n<meta name="description" content="' + esc(p.desc) + '">\n' +
    '<meta name="theme-color" content="#0d366b">\n' +
    '<meta property="og:type" content="website">\n<meta property="og:site_name" content="' + NAME + '">\n<meta property="og:title" content="' + esc(fullTitle(p)) + '">\n<meta property="og:description" content="' + esc(p.desc) + '">\n' +
    '<meta name="twitter:card" content="summary">\n' +
    '<link rel="alternate" type="text/plain" href="llms-full.txt" title="Full text of every page">\n' +
    '<script>try{var t=localStorage.getItem(\'fbn-theme\');if(t)document.documentElement.setAttribute(\'data-theme\',t);}catch(e){}</script>\n' +
    '<link rel="stylesheet" href="css/tokens.css">\n<link rel="stylesheet" href="css/site.css">\n<link rel="icon" href="favicon.svg" type="image/svg+xml">\n' + (extra || '');
}
function shell(p, bodyHtml, jsonld) {
  const scripts = '<script src="js/charts.js"></script>\n<script src="js/fbn.js"></script>\n<script src="js/pages/' + p.file + '.js"></script>\n';
  const ld = jsonld ? '<script type="application/ld+json">' + JSON.stringify(jsonld).replace(/</g, '\\u003c') + '</script>\n' : '';
  if (p.file === 'index' && !process.env.STANDALONE) {
    // index.html is published inside the artifact wrapper, which supplies <html>, <head> and <body>.
    return head(p, ld) + (bodyHtml || '<main></main>') + '\n' + scripts;
  }
  return '<!doctype html>\n<html lang="en">\n<head>\n' + head(p, ld) + '</head>\n<body>\n' + (bodyHtml ? bodyHtml : '<main></main>') + '\n' + scripts + '</body>\n</html>\n';
}

(async () => {
  // 1. plain shells
  PAGES.forEach(p => fs.writeFileSync(path.join(SITE, p.file + '.html'), shell(p, null, null)));
  const srv = cp.spawn('python3', ['-m', 'http.server', '8767', '--bind', '127.0.0.1'], { cwd: SITE, stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 1200));
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const results = {};
  try {
    for (const p of PAGES) {
      const pg = await ctx.newPage();
      const errs = []; pg.on('pageerror', e => errs.push(e.message));
      await pg.goto('http://127.0.0.1:8767/' + p.file + '.html'); await pg.waitForSelector('main .section, main .prose, main .about-box', { timeout: 8000 }).catch(() => {}); await pg.waitForTimeout(600);
      const r = await pg.evaluate(() => {
        document.querySelectorAll('.chart-tip').forEach(e => e.remove());
        document.querySelectorAll('script').forEach(e => e.remove());
        const t = e => { if (!e) return ''; const c = e.cloneNode(true); c.querySelectorAll('.sr-only, .row-open, .card-open').forEach(x => x.remove()); return c.textContent.replace(/\s*↗\s*/g, ' ').replace(/\s+/g, ' ').trim(); };
        const abs = u => { try { return new URL(u, location.href).href.replace(location.origin + '/', ''); } catch (e) { return u; } };
        const md = [];
        const mdTable = tb => {
          const heads = [...tb.querySelectorAll('thead th')].map(t);
          const rows = [...tb.querySelectorAll('tbody tr')];
          const out = []; let width = heads.length;
          out.push('| ' + heads.join(' | ') + ' |'); out.push('|' + heads.map(() => ' --- ').join('|') + '|');
          rows.forEach(tr => {
            if (tr.classList.contains('group-row')) { out.push('| **' + t(tr) + '** |' + ' |'.repeat(Math.max(0, width - 1))); return; }
            const cells = [...tr.children].map(c => t(c).replace(/\|/g, '/').replace(/ ↗$/, ''));
            const href = tr.dataset.href; if (href) cells[cells.length - 1] = (cells[cells.length - 1] + ' [source](' + href + ')').trim();
            out.push('| ' + cells.join(' | ') + ' |');
          });
          return out.join('\n');
        };
        document.querySelectorAll('main .section').forEach(sec => {
          const h2 = sec.querySelector('.section-head h2');
          if (h2) md.push('\n## ' + t(h2)); const sub = sec.querySelector('.section-head .sub'); if (sub) md.push(t(sub));
          sec.querySelectorAll('.cards .card').forEach(c => {
            const href = c.getAttribute('href');
            md.push('- ' + t(c.querySelector('.card-label')) + ': **' + t(c.querySelector('.card-value')) + '**' + (c.querySelector('.card-delta') ? ' (' + t(c.querySelector('.card-delta')) + ')' : '') +
              (c.querySelector('.card-meta') ? ' — ' + t(c.querySelector('.card-meta')) : '') + (c.querySelector('.card-note') ? '. ' + t(c.querySelector('.card-note')) : '') + (href ? ' [source](' + href + ')' : ''));
          });
          sec.querySelectorAll('.cat-card').forEach(c => md.push('- [' + t(c.querySelector('h2')) + '](' + c.getAttribute('href') + '): ' + t(c.querySelector('.v')) + ' ' + t(c.querySelector('.l'))));
          sec.querySelectorAll('.panel').forEach(pn => {
            const h3 = t(pn.querySelector('h3')) || t(pn.querySelector('caption'));
            md.push('\n### ' + h3); const sb = pn.querySelector('.panel-head .sub'); if (sb) md.push(t(sb));
            const cd = pn.querySelector('table.chart-data'); if (cd) md.push(mdTable(cd));
            const tb = pn.querySelector('.table-wrap table'); if (tb) md.push(mdTable(tb));
            const sl = pn.querySelector('.source-line'); if (sl) { md.push('Source note: ' + t(sl)); }
          });
          sec.querySelectorAll('.note').forEach(n => md.push('Note: ' + t(n)));
          sec.querySelectorAll('.about-box, .prose').forEach(b => md.push([...b.querySelectorAll('h2,p,li')].map(x => (x.tagName === 'H2' ? '\n## ' : x.tagName === 'LI' ? '- ' : '') + t(x)).join('\n')));
          sec.querySelectorAll('.dataset').forEach(d => md.push('- ' + t(d.querySelector('.t')) + ': ' + t(d.querySelector('.d'))));
          sec.querySelectorAll('ul.source-list li').forEach(li => { const a = li.querySelector('a'); md.push('- ' + t(li) + (a ? ' <' + a.href + '>' : '')); });
        });
        const urls = [...new Set([...document.querySelectorAll('a[target=_blank]')].map(a => a.href).filter(u => /^https?:/.test(u)))];
        return { body: document.body.innerHTML, md: md.join('\n'), urls, h1: t(document.querySelector('h1')), sections: [...document.querySelectorAll('main .section-head h2')].map(t), errs: [] };
      });
      r.errs = errs; results[p.file] = r; await pg.close();
      if (errs.length) console.log('PAGE ERRORS', p.file, errs);
    }
  } finally { await browser.close(); srv.kill(); }

  // 2. final shells
  PAGES.forEach(p => {
    const r = results[p.file];
    const ld = { '@context': 'https://schema.org', '@type': p.type || 'Dataset', name: fullTitle(p), description: p.desc, inLanguage: 'en', dateModified: MODIFIED, isAccessibleForFree: true,
      spatialCoverage: 'Fremont, California, USA', creator: { '@type': 'Person', name: 'JeffreyAiFudenna' }, creditText: 'Compiled by Claude (Anthropic) from public sources. Each figure is credited to its source on the page.', isBasedOn: r.urls.slice(0, 200) };
    if (p.type === 'WebSite') { delete ld.isBasedOn; ld.about = 'Fremont, California'; }
    if (p.type === 'AboutPage') delete ld.isBasedOn;
    let body = r.body.replace(/<main([^>]*)>/, '<main$1 id="main">');
    if (p.file === 'index') { body = body; }
    // for the index fragment, the artifact wrapper supplies <body>; keep only what is inside <main> plus site chrome
    fs.writeFileSync(path.join(SITE, p.file + '.html'), shell(p, p.file === 'index' ? r.body : body, ld));
  });

  // 3. llms-full.txt, llms.txt, robots.txt
  const cat = JSON.parse(fs.readFileSync(path.join(SITE, 'data/_catalog.json'), 'utf8'));
  let full = '# ' + NAME + ' — full text\n\n> Fremont by the Numbers is a data aggregator built using Claude. It republishes figures that public sources have already published about Fremont, California, and shows each figure with its source and date. Data as of ' + MODIFIED + '. Links in this file marked "source" go to the page a figure was read from.\n';
  PAGES.forEach(p => { const r = results[p.file]; full += '\n\n---\n\n# ' + pageTitle(p) + '  (' + p.file + '.html)\n\n' + p.desc + '\n' + r.md + '\n'; });
  fs.writeFileSync(path.join(SITE, 'llms-full.txt'), full);

  let txt = '# ' + NAME + '\n\n> Fremont by the Numbers is a data aggregator built using Claude, Anthropic\'s AI model. It gathers public figures about Fremont, California (housing, schools, safety, jobs and more) from the agencies and companies that publish them, and shows every figure with its source and date. The site is Fremont-only and runs no surveys of its own. Built by JeffreyAiFudenna.\n\n' +
    'How to read it: every page is plain HTML with the figures also written out as text and tables. Each figure links to its original source. Treat the source link as the authority; Claude can misread a source. Data was last checked ' + MODIFIED + '.\n\n## Pages\n\n';
  PAGES.forEach(p => { txt += '- [' + pageTitle(p) + '](' + p.file + '.html): ' + p.desc + '\n'; });
  txt += '\n## Full text\n\n- [All pages as one text file](llms-full.txt): every figure, table, chart value and source link in one place.\n\n## Raw data\n\nEach dataset is one JSON file in /data. Rows carry an id, label, value, period (what the figure covers), source and source_url. data/_catalog.json describes every dataset; data/source_links.json maps datasets to source pages.\n\n';
  Object.keys(cat).sort().forEach(k => { txt += '- [' + (cat[k].title || k) + '](data/' + k + '.json): ' + (cat[k].description || '').replace(/\s+/g, ' ') + '\n'; });
  txt += '\n## Optional\n\n- [About, methodology and sources](sources.html): how the data was gathered, known limitations, and every source page.\n';
  fs.writeFileSync(path.join(SITE, 'llms.txt'), txt);

  fs.writeFileSync(path.join(SITE, 'robots.txt'), '# Everything on this site is public and meant to be read, by people and by AI tools.\nUser-agent: *\nAllow: /\n\n# After you publish on your own domain, add a sitemap line here, for example:\n# Sitemap: https://YOUR-DOMAIN/sitemap.xml\n');
  console.log('built', PAGES.length, 'pages;', Object.entries(results).map(([k, v]) => k + ':' + Math.round(v.body.length / 1024) + 'KB/' + v.urls.length + ' links').join(' '));
})();
