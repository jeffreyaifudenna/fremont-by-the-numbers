/* FremontCaByTheNumbers.com — shared renderer.
   Pages describe themselves in js/pages/*.js; numbers live in data/*.json.
   Nothing here contains a figure. */
(function () {
  'use strict';

  const SITE = {
    name: 'FremontCaByTheNumbers.com',
    updated: 'Oct 26, 2026',
    nav: [
      { key: 'index', href: 'index.html', label: 'Overview' },
      { key: 'rent', href: 'rent.html', label: 'Rent & Housing' },
      { key: 'schools', href: 'schools.html', label: 'Schools' },
      { key: 'food', href: 'food.html', label: 'Food' },
      { key: 'parks', href: 'parks.html', label: 'Parks & Events' },
      { key: 'city', href: 'city.html', label: 'City Data' },
      { key: 'safety', href: 'safety.html', label: 'Crime & Safety' },
      { key: 'health', href: 'health.html', label: 'Health Care' },
      { key: 'jobs', href: 'jobs.html', label: 'Jobs' },
      { key: 'startups', href: 'startups.html', label: 'Startups' },
      { key: 'sources', href: 'sources.html', label: 'About & Sources' }
    ]
  };

  /* ---------- icons (inline SVG paths, 24x24 stroke) ---------- */
  const ICONS = {
    home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9"/><path d="M16 5l3 3"/><path d="M13 8l3 3"/>',
    school: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11.5V17c0 1.5 3 3 6 3s6-1.5 6-3v-5.5"/><path d="M22 9v6"/>',
    cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.5 11h11l2-7H6"/>',
    fork: '<path d="M7 3v8"/><path d="M4 3v5a3 3 0 0 0 6 0V3"/><path d="M7 11v10"/><path d="M17 3c-2 2-2 6 0 8v10"/><path d="M17 3c2 0 3 3 3 5s-1 3-3 3"/>',
    tree: '<path d="M12 2l6 8h-3l4 6H5l4-6H6z"/><path d="M12 16v6"/>',
    city: '<path d="M3 21h18"/><path d="M5 21V8l5-3v16"/><path d="M10 21V11l6-3v13"/><path d="M16 21V12l3 1v8"/>',
    shield: '<path d="M12 2l8 3v6c0 5-3.4 9.3-8 11-4.6-1.7-8-6-8-11V5z"/><path d="M9 12l2 2 4-4"/>',
    flame: '<path d="M12 22c4 0 7-3 7-7 0-3-2-5-3-7-1 2-2 3-3 3 0-3-1-6-4-9 0 4-4 6-4 11 0 5 3 9 7 9z"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>',
    plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
    briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M2 13h20"/>',
    rocket: '<path d="M5 15l-2 6 6-2"/><path d="M9 15a13 13 0 0 1 11-11c0 5-2 9-7 11l-4-0z"/><path d="M9 15l-1-1a3 3 0 0 1 0-4l1-1"/><circle cx="15" cy="9" r="1.5"/>',
    dollar: '<path d="M12 2v20"/><path d="M17 6.5c0-1.4-2.2-2.5-5-2.5s-5 1.1-5 2.5S9.2 9 12 9s5 1.1 5 2.5v.5c0 1.4-2.2 2.5-5 2.5s-5-1.1-5-2.5"/><path d="M17 17.5c0 1.4-2.2 2.5-5 2.5s-5-1.1-5-2.5"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14c3 0 5 2 5 5"/>',
    trend: '<path d="M3 17l6-6 4 4 8-8"/><path d="M21 7v6h-6"/>',
    trenddown: '<path d="M3 7l6 6 4-4 8 8"/><path d="M21 11v6h-6"/>',
    car: '<path d="M3 13l2-5a2 2 0 0 1 2-1h10a2 2 0 0 1 2 1l2 5"/><rect x="2" y="13" width="20" height="6" rx="1"/><circle cx="7" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/>',
    water: '<path d="M12 3c-4 5-7 8-7 12a7 7 0 0 0 14 0c0-4-3-7-7-12z"/>',
    bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
    wifi: '<path d="M2 9a16 16 0 0 1 20 0"/><path d="M5.5 12.5a11 11 0 0 1 13 0"/><path d="M9 16a5.5 5.5 0 0 1 6 0"/><circle cx="12" cy="19.5" r="1"/>',
    trash: '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M5 6l1 14h12l1-14"/>',
    book: '<path d="M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z"/><path d="M20 4h-6a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h7z"/>',
    chart: '<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M8 3v4"/><path d="M16 3v4"/>',
    map: '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14"/><path d="M15 6v14"/>',
    building: '<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 21v-4h6v4"/><path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2"/>',
    star: '<path d="M12 3l2.8 5.8 6.2.9-4.5 4.4 1.1 6.3L12 17.5l-5.6 2.9 1.1-6.3L3 9.7l6.2-.9z"/>',
    award: '<circle cx="12" cy="9" r="6"/><path d="M8.5 14L7 22l5-3 5 3-1.5-8"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    bed: '<path d="M3 18v-8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8"/><path d="M3 14h18"/><path d="M7 10V7h4v3"/>',
    train: '<rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 11h14"/><circle cx="9" cy="14" r="1"/><circle cx="15" cy="14" r="1"/><path d="M8 17l-2 4M16 17l2 4"/>',
    leaf: '<path d="M4 20c0-9 5-15 16-16 0 11-5 16-14 16"/><path d="M4 20c4-6 7-9 11-11"/>',
    thermo: '<path d="M10 4a2 2 0 0 1 4 0v9.5a4 4 0 1 1-4 0z"/><path d="M12 10v6"/>',
    ballot: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 12l3 3 5-6"/>',
    factory: '<path d="M3 21V9l5 3V9l5 3V9l5 3v9z"/><path d="M8 21v-4h3v4"/><path d="M14 21v-4h3v4"/>',
    bus: '<rect x="4" y="3" width="16" height="15" rx="3"/><path d="M4 11h16"/><circle cx="8" cy="15" r="1"/><circle cx="16" cy="15" r="1"/><path d="M6 18v2M18 18v2"/>',
    stethoscope: '<path d="M5 3v6a5 5 0 0 0 10 0V3"/><path d="M10 14v2a5 5 0 0 0 10 0v-2"/><circle cx="20" cy="12" r="2"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18"/><path d="M12 3a14 14 0 0 0 0 18"/>',
    percent: '<path d="M19 5L5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5 5.5-6"/>',
    warn: '<path d="M12 3l9.5 16.5h-19z"/><path d="M12 10v4M12 17v.5"/>'
  };
  function icon(name, extra) {
    const p = ICONS[name] || ICONS.chart;
    return '<svg viewBox="0 0 24 24" aria-hidden="true"' + (extra || '') + '>' + p + '</svg>';
  }

  /* ---------- formatting ---------- */
  const nf0 = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
  const nf1 = new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const nf2 = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  function compact(n) {
    const a = Math.abs(n);
    if (a >= 1e9) return '$' + (n / 1e9).toFixed(a >= 1e10 ? 0 : 1).replace(/\.0$/, '') + 'B';
    if (a >= 1e6) return '$' + (n / 1e6).toFixed(a >= 1e8 ? 0 : 1).replace(/\.0$/, '') + 'M';
    if (a >= 1e3) return '$' + (n / 1e3).toFixed(0) + 'K';
    return '$' + nf0.format(n);
  }
  function fmt(v, f) {
    if (v === null || v === undefined || v === '') return '—';
    if (typeof v === 'string' && isNaN(Number(v))) return v;
    const n = Number(v);
    switch (f) {
      case 'usd': return '$' + nf0.format(n);
      case 'usd2': return '$' + nf2.format(n);
      case 'usdc': return compact(n);
      case 'usd_plus': return '$' + nf0.format(n) + '+';
      case 'usd_kwh': return '$' + n.toFixed(3) + '/kWh';
      case 'int': return nf0.format(n);
      case 'pct': return (Number.isInteger(n) ? nf0.format(n) : nf1.format(n)) + '%';
      case 'pct0': return nf0.format(n) + '%';
      case 'pct1': return nf1.format(n) + '%';
      case 'pct2': return nf2.format(n) + '%';
      case 'dec1': return nf1.format(n);
      case 'dec2': return nf2.format(n);
      case 'min': return nf1.format(n) + ' min';
      case 'ratio': return nf1.format(n * 100) + '%';
      case 'rank': return '#' + nf0.format(n);
      case 'text': return String(v);
      default: return Number.isInteger(n) ? nf0.format(n) : nf1.format(n);
    }
  }
  function axisFmt(f) {
    return function (v) {
      if (f === 'usd' || f === 'usdc') return compact(v);
      if (f === 'pct' || f === 'pct1') return v + '%';
      if (Math.abs(v) >= 1000) return nf0.format(v);
      return v;
    };
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  /* ---------- data ---------- */
  const cache = {};
  let catalog = null;
  let links = null;   // data/source_links.json: where each number can be checked
  const base = (document.currentScript && document.currentScript.getAttribute('data-base')) || '';
  // data-v is a hash of css/, js/ and data/ written by the build; versioned files can be cached for good (see vercel.json).
  const ver = (document.currentScript && document.currentScript.getAttribute('data-v')) || '';
  function dataUrl(f) { return base + 'data/' + f + (ver ? '?v=' + ver : ''); }
  function loadJSON(path) {
    return fetch(path, ver ? {} : { cache: 'no-cache' }).then(r => { if (!r.ok) throw new Error(path + ' ' + r.status); return r.json(); });
  }
  function load(ids) {
    const want = Array.from(new Set(ids));
    const p = want.map(id => cache[id] ? Promise.resolve() : loadJSON(dataUrl(id + '.json')).then(d => { cache[id] = d; }).catch(e => { cache[id] = null; console.warn(e); }));
    if (!catalog) p.push(loadJSON(dataUrl('_catalog.json')).then(c => { catalog = c; }).catch(() => { catalog = {}; }));
    if (!links) p.push(loadJSON(dataUrl('source_links.json')).then(l => { links = l; }).catch(() => { links = { datasets: {}, sources: [], rows: {} }; }));
    return Promise.all(p);
  }

  /* ---------- source links: every number can be clicked through to where it came from ---------- */
  // The Census serves data.census.gov tables as API downloads in some rows; send people to the readable table page instead.
  function cleanUrl(u) {
    return String(u).replace(/^(https:\/\/data\.census\.gov)\/api\/access\/data\/table\?id=([^&]+)&(.*)$/, '$1/table/$2?$3');
  }
  function absUrl(u) { return /^https?:/i.test(u) ? cleanUrl(u) : base + u; }
  // Resolution order: the row's own source_url/url, then a per-row override, then a match on the row's source text, then the dataset default.
  function linkFor(ds, r) {
    const L = links || { datasets: {}, sources: [], rows: {} };
    if (r) {
      const own = r.source_url || r.url;
      if (own && /^https?:/i.test(own)) return { url: own, name: r.source || r.publisher || (catalog && catalog[ds] ? catalog[ds].title : '') };
      const keys = [r.id, r.geo, r.park];
      for (let i = 0; i < keys.length; i++) { if (keys[i]) { const hit = L.rows[ds + ':' + keys[i]]; if (hit) return hit; } }
      const src = String(r.source || r.publisher || '').toLowerCase();
      if (src) { for (let i = 0; i < L.sources.length; i++) { if (src.indexOf(L.sources[i].match.toLowerCase()) >= 0) return L.sources[i]; } }
    }
    return (ds && L.datasets[ds]) || null;
  }
  function rowLink(ds, id, key) { const r = row(ds, id, key); return r ? linkFor(ds, r) : null; }
  const OPEN_TXT = 'Opens the source in a new tab';
  /* links for a whole chart or table panel: explicit url/links, else the default link of each dataset it draws on */
  function panelLinks(spec) {
    if (spec.link === false) return [];
    const dedupe = list => list.filter((l, i) => l && list.findIndex(o => o && o.url === l.url) === i);
    if (spec.links) return dedupe(spec.links);
    if (spec.url) return [{ url: spec.url, name: spec.urlName || '' }];
    const ids = spec.ds ? [spec.ds] : (spec.uses || []);
    const out = [];
    ids.forEach(id => { const l = linkFor(id, null); if (l && !out.some(o => o.url === l.url)) out.push(l); });
    // A dataset whose rows each carry their own link: list the distinct ones (up to six) for the rows this chart or table uses.
    if (!out.length && spec.ds && !spec.build) {
      let rows = data(spec.ds);
      if (spec.filter) rows = rows.filter(typeof spec.filter === 'function' ? spec.filter : r => Object.keys(spec.filter).every(k => r[k] === spec.filter[k]));
      rows.forEach(r => { const l = linkFor(spec.ds, r); if (l && !out.some(o => o.url === l.url)) out.push(l); });
      if (out.length > 6) out.length = 0;
    }
    return out;
  }
  function linkHtml(lk, cls, text) {
    return '<a class="' + cls + '" href="' + esc(absUrl(lk.url)) + '" target="_blank" rel="noopener noreferrer" title="' + esc(OPEN_TXT + (lk.name ? ': ' + lk.name : '')) + '">' + text + '</a>';
  }
  /* the "View source" line under a chart or table */
  function sourceLine(spec, extra) {
    const lks = panelLinks(spec).concat(extra || []);
    const html = (spec.source || '') + (lks.length ? '<span class="src-open-row">' + lks.map(lk => linkHtml(lk, 'src-open', 'View source' + (lk.name ? ': ' + esc(lk.name) : '') + ' <span aria-hidden="true">↗</span><span class="sr-only"> (opens in a new tab)</span>')).join('') + '</span>' : '');
    if (!html) return null;
    const s = document.createElement('div'); s.className = 'source-line'; s.innerHTML = html;
    return s;
  }
  /* clicking anywhere on a linked table row opens that row's source in a new tab (the arrow link does the same for keyboards) */
  function wireRows(root) {
    root.addEventListener('click', e => {
      const tr = e.target.closest && e.target.closest('tr[data-href]');
      if (!tr || e.target.closest('a, button, summary')) return;
      const sel = window.getSelection && window.getSelection();
      if (sel && String(sel).length) return;
      window.open(tr.getAttribute('data-href'), '_blank', 'noopener,noreferrer');
    });
  }
  function rowAttrs(lk) { return lk ? ' class="linked" data-href="' + esc(absUrl(lk.url)) + '"' : ''; }
  function rowArrow(lk, what) {
    return lk ? ' ' + linkHtml(lk, 'row-open', '<span aria-hidden="true">↗</span><span class="sr-only">Open source for ' + esc(what) + ' (new tab)</span>') : '';
  }
  function data(id) { return cache[id] || []; }
  function row(ds, id, key) {
    const k = key || 'id';
    const rows = data(ds);
    if (id === undefined) return rows[0];
    return rows.find(r => r[k] === id) || null;
  }
  function norm(r) {
    if (!r) return null;
    return {
      label: r.label || r.metric || r.measure || r.ranking || r.release || '',
      value: r.value !== undefined ? r.value : (r.rank !== undefined ? r.rank : ''),
      format: r.format || (r.rank !== undefined ? 'rank' : undefined),
      period: r.period || r.as_of || r.published || r.year || '',
      source: r.source || r.publisher || '',
      note: r.note || r.highlights || '',
      kind: r.kind || '',
      url: r.source_url || r.url || ''
    };
  }

  /* ---------- theme ---------- */
  function currentTheme() {
    const t = document.documentElement.getAttribute('data-theme');
    if (t) return t;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function setTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem('fbn-theme', t); } catch (e) { /* ignore */ }
    const b = document.querySelector('.theme-toggle');
    if (b) b.innerHTML = icon(t === 'dark' ? 'sun' : 'moon', ' width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"');
  }
  (function initTheme() {
    let t = null;
    try { t = localStorage.getItem('fbn-theme'); } catch (e) { /* ignore */ }
    if (t) document.documentElement.setAttribute('data-theme', t);
  })();
  function cssVar(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
  function seriesColor(i) { return cssVar('--s' + (((i - 1) % 5) + 1)); }

  /* ---------- chrome: header, nav, footer ---------- */
  function chrome(key) {
    document.querySelectorAll('body > .site-header, body > .site-nav, body > .site-footer').forEach(e => e.remove());
    const header = document.createElement('header');
    header.className = 'site-header';
    header.innerHTML = '<div class="wrap">' +
      '<a class="brand" href="' + base + 'index.html"><span class="eyebrow">Fremont, California<span class="eb-agg"><span class="eb-sep"> · </span>Data aggregator built by JeffreyAiFudenna with Claude</span></span><span class="name">' + SITE.name + '</span></a>' +
      '<div class="header-right"><span class="updated">Data as of ' + SITE.updated + '</span>' +
      '<button class="theme-toggle" type="button" aria-label="Switch between light and dark mode"></button></div></div>';
    const nav = document.createElement('nav');
    nav.className = 'site-nav'; nav.setAttribute('aria-label', 'Sections');
    nav.innerHTML = '<button class="nav-arrow nav-prev" type="button" aria-label="Scroll the tabs left" hidden><span aria-hidden="true">‹</span></button>' +
      '<div class="wrap" id="site-menu">' + SITE.nav.map(n =>
      '<a href="' + base + n.href + '"' + (n.key === key ? ' aria-current="page"' : '') + '>' + n.label + '</a>').join('') + '</div>' +
      '<button class="nav-arrow nav-next" type="button" aria-label="Scroll the tabs right" hidden><span aria-hidden="true">›</span></button>';
    const tabs = nav.querySelector('.wrap'), prev = nav.querySelector('.nav-prev'), next = nav.querySelector('.nav-next');
    const calm = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cue = () => { prev.hidden = tabs.scrollLeft < 4; next.hidden = tabs.scrollLeft + tabs.clientWidth >= tabs.scrollWidth - 4; };
    prev.addEventListener('click', () => tabs.scrollBy({ left: -Math.max(160, tabs.clientWidth * 0.7), behavior: calm() ? 'auto' : 'smooth' }));
    next.addEventListener('click', () => tabs.scrollBy({ left: Math.max(160, tabs.clientWidth * 0.7), behavior: calm() ? 'auto' : 'smooth' }));
    tabs.addEventListener('scroll', cue, { passive: true });
    window.addEventListener('resize', cue);
    setTimeout(() => { const cur = tabs.querySelector('[aria-current="page"]'); if (cur) tabs.scrollLeft = Math.max(0, cur.offsetLeft - (tabs.clientWidth - cur.offsetWidth) / 2); cue(); }, 0);
    const footer = document.createElement('footer');
    footer.className = 'site-footer';
    footer.innerHTML = '<div class="wrap"><span>' + SITE.name + ' is a data aggregator built by JeffreyAiFudenna using Claude. It republishes figures from public sources; every figure shows its source and date, and clicking a figure opens the source in a new tab.</span>' +
      '<span><a href="' + base + 'sources.html">About, methodology &amp; sources</a> · <a href="https://github.com/jeffreyaifudenna/fremont-by-the-numbers/issues" target="_blank" rel="noopener">Report an error</a></span></div>';
    document.body.prepend(nav);
    document.body.prepend(header);
    document.body.appendChild(footer);
    header.querySelector('.theme-toggle').addEventListener('click', () => setTheme(currentTheme() === 'dark' ? 'light' : 'dark'));
    setTheme(currentTheme());
  }

  /* ---------- components ---------- */
  /* Cards show a short source name and date; the full citation sits in the hover text and behind the link. */
  function shortSource(t) {
    t = String(t || '');
    if (t.length <= 34) return t;
    const cut = t.split(/ \(|, |; | — | – /)[0].trim();
    return cut.length >= 6 ? cut : t;
  }
  function shortPeriod(t) {
    t = String(t || '');
    return t.length > 30 ? t.replace(/\s*\([^)]*\)/g, '').trim() : t;
  }
  function sourceText(ds, r, full) {
    const n = norm(r);
    const parts = [];
    const src = n.source || (catalog && catalog[ds] ? catalog[ds].title : '');
    if (n.period) parts.push(esc(full ? n.period : shortPeriod(n.period)));
    if (src) parts.push(esc(full ? src : shortSource(src)));
    return parts.join(' · ');
  }
  function card(spec) {
    const r = spec.ds ? row(spec.ds, spec.id, spec.key) : null;
    const n = r ? norm(r) : {};
    const label = spec.label || n.label || '';
    const value = spec.value !== undefined ? spec.value : n.value;
    const format = spec.format || n.format;
    const text = typeof value === 'string' && isNaN(Number(value));
    let delta = '';
    if (spec.deltaKey && r && r[spec.deltaKey] !== null && r[spec.deltaKey] !== undefined) {
      const d = Number(r[spec.deltaKey]);
      const good = spec.deltaGood === 'down' ? d < 0 : d > 0;
      delta = '<span class="card-delta ' + (d === 0 ? '' : (good ? 'up' : 'down')) + '">' + (d > 0 ? '+' : '') + nf1.format(d) + '% ' + esc(spec.deltaLabel || 'vs a year ago') + '</span>';
    }
    const meta = spec.meta !== undefined ? esc(spec.meta) : (r ? sourceText(spec.ds, r) : esc(spec.period || ''));
    const note = spec.note || (spec.showNote && n.note) || '';
    const lk = spec.link === false ? null : (spec.url ? { url: spec.url, name: spec.urlName || '' } : linkFor(spec.ds, r));
    const el = document.createElement(lk ? 'a' : 'div');
    el.className = 'card c' + (spec.color || 1) + (spec.plain ? ' plain' : '') + (lk ? ' card-link' : '');
    if (lk) {
      el.href = absUrl(lk.url); el.target = '_blank'; el.rel = 'noopener noreferrer';
      const fullTxt = (spec.meta === undefined && r) ? sourceText(spec.ds, r, true).replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'") : '';
      el.title = OPEN_TXT + (lk.name ? ': ' + lk.name : '') + (fullTxt ? '\n' + fullTxt : '');
    }
    el.innerHTML =
      '<div class="card-top"><span class="card-label">' + esc(label) + '</span><span class="chip">' + icon(spec.icon || 'chart') + '</span></div>' +
      '<span class="card-value' + (text ? ' text' : '') + '">' + esc(fmt(value, format)) + '</span>' +
      delta +
      (meta ? '<span class="card-meta">' + meta + '</span>' : '') +
      (note ? '<span class="card-note">' + esc(note) + '</span>' : '') +
      (lk ? '<span class="card-open" aria-hidden="true">Source ↗</span><span class="sr-only">' + esc(OPEN_TXT + (lk.name ? ': ' + lk.name : '')) + '</span>' : '');
    return el;
  }

  const charts = [];
  function chartPanel(spec) {
    const panel = document.createElement('div');
    panel.className = 'panel' + (spec.navy ? ' navy' : '');
    const box = document.createElement('div');
    box.className = 'chart-box' + (spec.size ? ' ' + spec.size : '');
    panel.innerHTML = '<div class="panel-head"><h3>' + esc(spec.title || '') + '</h3>' + (spec.sub ? '<span class="sub">' + esc(spec.sub) + '</span>' : '') + '</div>';
    panel.appendChild(box);
    const legend = document.createElement('div'); legend.className = 'legend';
    panel.appendChild(legend);
    const sl = sourceLine(spec); if (sl) panel.appendChild(sl);
    const entry = { spec, box, legend, links: panelLinks(spec) };
    charts.push(entry);
    drawChart(entry);
    return panel;
  }
  function buildSeries(spec) {
    let rows = data(spec.ds).slice();
    if (spec.filter) rows = rows.filter(typeof spec.filter === 'function' ? spec.filter : r => Object.keys(spec.filter).every(k => r[k] === spec.filter[k]));
    if (spec.sort) rows.sort(typeof spec.sort === 'function' ? spec.sort : (a, b) => (b[spec.sort] || 0) - (a[spec.sort] || 0));
    if (spec.limit) rows = rows.slice(0, spec.limit);
    const labels = rows.map(r => typeof spec.x === 'function' ? spec.x(r) : r[spec.x]);
    const datasets = spec.series.map((s, i) => ({
      label: s.label,
      data: rows.map(r => typeof s.key === 'function' ? s.key(r) : r[s.key]),
      _color: s.color || (i + 1),
      _dashed: !!s.dashed,
      _pointStyles: s.status ? rows.map(r => r[s.status]) : null
    }));
    return { labels, datasets, rows };
  }
  function drawChart(entry) {
    if (typeof FBNChart === 'undefined') return;
    const spec = entry.spec;
    const built = spec.build ? spec.build(data, row) : buildSeries(spec);
    const yf = spec.yfmt || spec.format;
    const datasets = built.datasets.map((d, i) => {
      const color = typeof d._color === 'string' ? 'var(' + d._color + ')' : 'var(--s' + ((((d._color || (i + 1)) - 1) % 5) + 1) + ')';
      return {
        label: d.label, data: d.data, color, dashed: !!d._dashed,
        hollow: d._pointStyles ? d._pointStyles.map(s => !!(s && /incomplete|year to date|preliminary|estimate|goal/i.test(s))) : null
      };
    });
    // Where a click on a bar or point goes: the chart's own link if it names one, else each row's own source, else the dataset's.
    let urls = null;
    const explicit = !!(spec.url || spec.links);
    const first = entry.links[0] ? absUrl(entry.links[0].url) : null;
    if (built.urls) {
      urls = built.urls.map(u => u ? absUrl(u) : first);
    } else if (spec.ds && built.rows && built.rows.length === built.labels.length) {
      const per = built.rows.map(r => {
        const own = r.source_url || r.url;
        if (own) return absUrl(own);
        if (explicit) return null;
        const l = linkFor(spec.ds, r); return l ? absUrl(l.url) : null;
      });
      if (per.some(Boolean)) urls = per.map(u => u || first);
    }
    if (!urls && entry.links.length === 1) urls = built.labels.map(() => first);
    FBNChart.draw(entry.box, {
      type: spec.type || 'line', labels: built.labels, datasets, stacked: !!spec.stacked,
      zero: spec.zero, ymin: spec.ymin, ymax: spec.ymax, alt: spec.alt || spec.title,
      format: v => fmt(v, yf), urls
    });
    /* Text version of the chart for screen readers, search engines and AI tools. */
    let dt = entry.dataTable;
    if (!dt) { const wrapEl = document.createElement('div'); wrapEl.className = 'sr-only'; dt = document.createElement('table'); dt.className = 'chart-data'; wrapEl.appendChild(dt); entry.box.parentNode.insertBefore(wrapEl, entry.legend); entry.dataTable = dt; }
    dt.innerHTML = '<caption>' + esc(spec.title || 'Chart data') + (spec.sub ? ' (' + esc(spec.sub) + ')' : '') + '</caption><thead><tr><th>Item</th>' + datasets.map(d => '<th>' + esc(d.label) + '</th>').join('') + '</tr></thead><tbody>' +
      built.labels.map((l, i) => '<tr><th scope="row">' + esc(l) + '</th>' + datasets.map(d => '<td>' + esc(d.data[i] === null || d.data[i] === undefined ? '' : fmt(d.data[i], yf)) + '</td>').join('') + '</tr>').join('') + '</tbody>';
    entry.legend.innerHTML = (datasets.length > 1 || spec.showLegend) ? datasets.map(d =>
      '<span><span class="swatch" style="background:' + d.color + '"></span>' + esc(d.label) + '</span>').join('') : '';
    if (spec.legendNote) entry.legend.innerHTML += '<span class="dim">' + esc(spec.legendNote) + '</span>';
  }
  function redrawCharts() { charts.forEach(drawChart); }
  let rsT = null;
  window.addEventListener('resize', () => { clearTimeout(rsT); rsT = setTimeout(redrawCharts, 150); });

  /* On phones a table shows only its first few columns, with a button for the rest,
     or (phoneCards) turns each row into a small card with every figure labeled. */
  function phoneShow(n, list, cards) { return new Set(cards ? Array.from({ length: n }, (_, i) => i) : (list && list.length ? list : [0, 1, 2])); }
  function clsAttr() { const c = Array.prototype.slice.call(arguments).filter(Boolean).join(' '); return c ? ' class="' + c + '"' : ''; }
  function trimToggle(panel, n, show) {
    if (n <= show.size) return;
    const w = panel.querySelector('.table-wrap'); if (!w) return;
    w.classList.add('trim'); if (!show.has(n - 1)) w.classList.add('arrow-first');
    const b = document.createElement('button'); b.type = 'button'; b.className = 'tbl-toggle';
    const more = 'Show all ' + n + ' columns';
    b.textContent = more; b.setAttribute('aria-expanded', 'false');
    b.addEventListener('click', () => { const on = w.classList.toggle('trim'); b.textContent = on ? more : 'Show fewer columns'; b.setAttribute('aria-expanded', on ? 'false' : 'true'); });
    w.after(b);
  }
  function tablePanel(spec) {
    const panel = document.createElement('div');
    panel.className = 'panel' + (spec.navy ? ' navy' : '') + (spec.columns.length >= 7 ? ' wide' : '');  // 7+ columns need the full row on desktop
    let rows = spec.rows ? spec.rows(data, row) : data(spec.ds).slice();
    if (spec.filter) rows = rows.filter(typeof spec.filter === 'function' ? spec.filter : r => Object.keys(spec.filter).every(k => r[k] === spec.filter[k]));
    if (spec.sort) rows.sort(typeof spec.sort === 'function' ? spec.sort : (a, b) => (b[spec.sort] || 0) - (a[spec.sort] || 0));
    if (spec.limit) rows = rows.slice(0, spec.limit);
    const showCols = phoneShow(spec.columns.length, spec.phone, spec.phoneCards);
    const head = '<thead><tr>' + spec.columns.map((c, ci) => '<th' + clsAttr((c.num !== false && c.format && c.format !== 'text' ? 'num' : ''), showCols.has(ci) ? '' : 'ph-x') + '>' + esc(c.label) + '</th>').join('') + '</tr></thead>';
    const fallback = panelLinks(spec)[0] || null;
    const rowLinkFor = r => spec.link === false ? null : ((spec.ds ? linkFor(spec.ds, r) : null) || fallback);
    const gcount = {}; if (spec.groupBy) rows.forEach(r => { const g = spec.groupBy(r); gcount[g] = (gcount[g] || 0) + 1; });
    let lastGroup = null;
    const body = '<tbody>' + rows.map(r => {
      let gh = '';
      if (spec.groupBy) { const g = spec.groupBy(r); if (g !== lastGroup) { lastGroup = g; const lab = (spec.groupLabels && spec.groupLabels[g]) || g; gh = '<tr class="group-row"><th colspan="' + spec.columns.length + '" scope="colgroup">' + esc(lab) + ' <span class="group-n">(' + gcount[g] + ')</span></th></tr>'; } }
      const lk = rowLinkFor(r);
      const last = spec.columns.length - 1;
      const firstTxt = (() => { const c = spec.columns[0]; const v = typeof c.key === 'function' ? c.key(r) : r[c.key]; return c.html ? String(v).replace(/<[^>]*>/g, '') : String(v); })();
      return gh + '<tr' + (lk ? ' class="linked' + (spec.highlight && spec.highlight(r) ? ' hl' : '') + '" data-href="' + esc(absUrl(lk.url)) + '"' : (spec.highlight && spec.highlight(r) ? ' class="hl"' : '')) + '>' + spec.columns.map((c, ci) => {
        const v = typeof c.key === 'function' ? c.key(r) : r[c.key];
        const num = c.num !== false && c.format && c.format !== 'text';
        return '<td' + clsAttr(num ? 'num' : '', showCols.has(ci) ? '' : 'ph-x', spec.phoneCards && c.cardWide ? 'cw' : '') + (spec.phoneCards ? ' data-label="' + esc(c.label) + '"' : '') + '>' + (spec.phoneCards ? '<span class="cv">' : '') + (c.html ? v : esc(fmt(v, c.format || 'text'))) + (spec.phoneCards ? '</span>' : '') + (ci === last && spec.rowArrow !== false ? rowArrow(lk, firstTxt) : '') + '</td>';
      }).join('') + '</tr>';
    }).join('') + '</tbody>';
    panel.innerHTML = '<div class="panel-head"><h3>' + esc(spec.title || '') + '</h3>' + (spec.sub ? '<span class="sub">' + esc(spec.sub) + '</span>' : '') + '</div>' +
      '<div class="table-wrap' + (spec.phoneCards ? ' ph-cards' : '') + '"><table>' + head + body + '</table></div>';
    const sl = sourceLine(spec); if (sl) panel.appendChild(sl);
    wireRows(panel);
    trimToggle(panel, spec.columns.length, showCols);
    return panel;
  }
  /* a fact list: rows of a fact-style dataset shown as Label | Value | Period | Source */
  function factsPanel(spec) {
    const ids = spec.ids;
    let rows = data(spec.ds).filter(r => !ids || ids.includes(r.id));
    if (spec.group) rows = rows.filter(r => r.group === spec.group);
    if (ids) rows.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
    const panel = document.createElement('div');
    panel.className = 'panel' + (spec.navy ? ' navy' : '');
    panel.innerHTML = '<div class="panel-head"><h3>' + esc(spec.title || '') + '</h3>' + (spec.sub ? '<span class="sub">' + esc(spec.sub) + '</span>' : '') + '</div>' +
      '<div class="table-wrap"><table><thead><tr><th>Measure</th><th class="num">Value</th><th>Covers</th><th class="ph-x">Source</th></tr></thead><tbody>' +
      rows.map(r => {
        const n = norm(r); const lk = linkFor(spec.ds, r);
        const srcTxt = esc(n.source || (catalog && catalog[spec.ds] ? catalog[spec.ds].title : ''));
        return '<tr' + (lk ? ' class="linked" data-href="' + esc(absUrl(lk.url)) + '"' : '') + '><td>' + esc(n.label) + (n.note ? '<br><span class="dim">' + esc(n.note) + '</span>' : '') + '</td><td' + (typeof n.value === 'number' ? ' class="num"' : '') + '>' + esc(fmt(n.value, n.format)) + '</td><td><span class="dim">' + esc(n.period) + '</span></td><td class="ph-x">' +
          (lk ? linkHtml(lk, 'src-link', srcTxt + ' <span aria-hidden="true">↗</span><span class="sr-only"> (opens in a new tab)</span>') : '<span class="dim">' + srcTxt + '</span>') + '</td></tr>';
      }).join('') +
      '</tbody></table></div>';
    if (spec.source) { const s = document.createElement('div'); s.className = 'source-line'; s.innerHTML = spec.source; panel.appendChild(s); }
    wireRows(panel);
    trimToggle(panel, 4, new Set([0, 1, 2]));
    return panel;
  }

  const usedIds = new Set();
  function uniqueId(t) {
    let id = String(t).toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'section', k = id, i = 2;
    while (usedIds.has(k) || document.getElementById(k)) k = id + '-' + (i++);
    usedIds.add(k); return k;
  }
  /* Detail tables that repeat the cards above them sit behind a "Show details" bar. */
  function fold(panel, spec) {
    if (!(spec.fold || /in detail|with sources/i.test(spec.title || ''))) return panel;
    const d = document.createElement('details'); d.className = 'fold';
    const sm = document.createElement('summary');
    sm.innerHTML = '<span class="fold-t">' + esc(spec.title || 'Details') + '</span><span class="fold-h">Show details</span>';
    d.appendChild(sm); d.appendChild(panel);
    if (panel.querySelector('.chart-box')) d.addEventListener('toggle', () => { if (d.open) redrawCharts(); });  // a closed fold has no width to draw into
    return d;
  }
  function section(spec) {
    const sec = document.createElement('section');
    sec.className = 'section';
    if (spec.id) sec.id = spec.id;
    else if (spec.title) sec.id = uniqueId(spec.title);
    if (spec.title) sec.innerHTML = '<div class="section-head"><h2>' + esc(spec.title) + '</h2>' + (spec.sub ? '<p class="sub">' + esc(spec.sub) + '</p>' : '') + '</div>';
    if (spec.cards) {
      const g = document.createElement('div'); g.className = 'cards' + (spec.tight ? ' tight' : '') + (spec.cols === 3 ? ' cols3' : '');
      spec.cards.forEach(c => g.appendChild(card(c)));
      sec.appendChild(g);
    }
    if (spec.charts || spec.tables || spec.facts) {
      const r = document.createElement('div'); r.className = 'panel-row';
      (spec.charts || []).forEach(c => r.appendChild(fold(chartPanel(c), c)));
      (spec.tables || []).forEach(t => r.appendChild(fold(tablePanel(t), t)));
      (spec.facts || []).forEach(f => r.appendChild(fold(factsPanel(f), f)));
      sec.appendChild(r);
    }
    if (spec.html) { const d = document.createElement('div'); d.innerHTML = spec.html; sec.appendChild(d); }
    (spec.notes || (spec.note ? [spec.note] : [])).forEach(n => {
      const p = document.createElement('p'); p.className = 'note' + (n.startsWith('!') ? ' warn' : ''); p.textContent = n.replace(/^!/, ''); sec.appendChild(p);
    });
    return sec;
  }

  function collectDatasets(spec) {
    const ids = new Set();
    const walk = o => {
      if (!o || typeof o !== 'object') return;
      if (Array.isArray(o)) { o.forEach(walk); return; }
      if (o.ds) ids.add(o.ds);
      if (Array.isArray(o.uses)) o.uses.forEach(u => ids.add(u));
      Object.keys(o).forEach(k => { if (typeof o[k] === 'object') walk(o[k]); });
    };
    walk(spec);
    return Array.from(ids);
  }

  /* ---------- page ---------- */
  function page(spec) {
    document.title = (spec.key === 'index' ? SITE.name : spec.title + ' · ' + SITE.name);
    chrome(spec.key);
    const main = document.querySelector('main') || document.body.appendChild(document.createElement('main'));
    const head = spec.bare ? '<div class="wrap"><h1 class="sr-only">' + esc(spec.title) + '</h1><p class="loading">Loading figures…</p></div>'
      : '<div class="wrap"><div class="page-head">' + (spec.kicker ? '<p class="kicker">' + esc(spec.kicker) + '</p>' : '') + '<h1>' + esc(spec.title) + '</h1>' + (spec.lede ? '<p class="lede">' + esc(spec.lede) + '</p>' : '') +
      (spec.key !== 'sources' ? '<p class="click-hint"><span aria-hidden="true">↗</span> ' + esc(spec.hint || 'Click any number, card or table row to open its source in a new tab.') + '</p>' : '') + '<p class="last-checked">Figures last checked ' + esc(SITE.updated) + '. Each figure shows the date of its own source.</p></div><p class="loading">Loading figures…</p></div>';
    // The .html files ship pre-rendered. Keep that copy on screen while the data loads, then swap in the live page
    // in one go (same task, so nothing paints in between). Only a bare shell shows "Loading figures…".
    const prerendered = !!main.querySelector('.section');
    const kept = prerendered ? Array.from(main.childNodes) : null;
    let wrap = null;
    const fresh = () => { main.innerHTML = head; wrap = main.querySelector('.wrap'); };
    if (!prerendered) fresh();
    const uses = spec.uses === 'all' ? [] : (spec.uses || []);
    // Discover datasets: probe a function-built spec with empty data so every ds reference is collected.
    let probe = spec.sections;
    if (typeof spec.sections === 'function') { try { probe = spec.sections(() => [], () => null); } catch (e) { probe = []; } }
    load(collectDatasets(probe).concat(collectDatasets(spec)).concat(uses)).then(() => spec.uses === 'all' ? load(Object.keys(catalog || {})) : null).then(() => {
      if (prerendered) fresh();
      wrap.querySelector('.loading').remove();
      const secs = typeof spec.sections === 'function' ? spec.sections(data, row) : spec.sections;
      secs.forEach(s => wrap.appendChild(section(s)));
      if (spec.key !== 'index') jumpList(wrap);
      if (spec.uses !== 'all' && spec.key !== 'index') wrap.appendChild(usedDatasets(collectDatasets(secs).concat(uses)));
      if (spec.after) spec.after(wrap, data, row);
      redrawCharts();  // charts were first drawn before their panels were on the page, so at a guessed size
    }).catch(e => {
      console.error(e);
      if (prerendered) {   // the pre-rendered copy stays up, saved charts included even on phones
        main.replaceChildren(...kept);
        main.querySelectorAll('.chart-box svg.pre').forEach(s => s.classList.remove('pre'));
        return;
      }
      wrap.querySelector('.loading').textContent = 'The figures could not be loaded. If you opened this page as a file, it needs to be served from a web server (or published) for the data files to load.';
    });
  }
  function jumpList(wrap) {
    const secs = Array.from(wrap.querySelectorAll('section.section[id]')).filter(s => s.querySelector('.section-head h2'));
    if (secs.length < 3) return;
    const nav = document.createElement('nav'); nav.className = 'jump'; nav.setAttribute('aria-label', 'On this page');
    nav.innerHTML = '<span class="jump-t">On this page</span>' + secs.map(s => '<a href="#' + s.id + '">' + esc(s.querySelector('.section-head h2').textContent) + '</a>').join('');
    const head = wrap.querySelector('.page-head'); if (head) head.after(nav);
  }
  function usedDatasets(list) {
    const ids = Array.from(new Set(list)).filter(id => catalog && catalog[id] && cache[id]);
    const sec = document.createElement('section');
    sec.className = 'section';
    if (!ids.length) return sec;
    sec.innerHTML = '<details class="datasets"><summary>Where these numbers come from: ' + ids.length + ' dataset' + (ids.length > 1 ? 's' : '') + ' used on this page</summary>' +
      '<p class="sub">Each dataset below names its source and the date it was read. Full methodology and every source page are on the <a href="' + base + 'sources.html">Sources</a> page.</p>' +
      '<div class="dataset-list">' + ids.map(id => { const c = catalog[id]; const lk = linkFor(id, null); return '<div class="dataset"><span class="t">' + esc(c.title) + '</span><span class="d">' + esc(c.description) + '</span>' + (c.updated ? '<span class="u">Read ' + esc(c.updated.slice(0, 10)) + '</span>' : '') + (lk ? linkHtml(lk, 'u src-link', 'Open source ↗<span class="sr-only"> for ' + esc(c.title) + ' (opens in a new tab)</span>') : '') + '</div>'; }).join('') + '</div></details>';
    return sec;
  }

  window.FBN = { page, section, card, chartPanel, tablePanel, factsPanel, load, data, row, norm, fmt, icon, esc, SITE, chrome, linkFor, rowLink, absUrl, catalog: () => catalog };
})();
