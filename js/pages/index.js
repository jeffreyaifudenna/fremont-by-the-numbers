/* Home page: headline numbers and one door into each category. */
FBN.page({
  key: 'index',
  bare: true,
  title: 'FremontCaByTheNumbers.com',
  kicker: 'Free and open data for Fremont',
  hint: 'Start with a topic below, or click any number under “Fremont at a glance” to open its source in a new tab.',
  lede: 'Fair, free access to public data about Fremont, California: housing, schools, safety, jobs and more. Every number comes from the agency or company that published it, and links to its source and date.',
  uses: ['startup_rounds', 'dof_population', 'census_profile', 'zillow_market', 'schools', 'police_facts', 'city_rankings', 'business', 'parks_summary', 'city_facts', 'people_more', 'jobs_more', 'living_facts', 'health_places', 'high_schools', 'crime_oj', 'unemployment_monthly', 'zillow_history'],
  sections: function (data, row) {
    const v = (ds, id, key) => (row(ds, id, key) || {}).value;
    const f = FBN.fmt;
    const pop = row('dof_population', '2026-01-01', 'date') || {};
    const unemp = row('jobs_more', 'fremont_unemployment_rate_latest') || {};
    const happiest = row('city_rankings', 'happiest') || {};
    const pop25 = (row('dof_population', '2025-01-01', 'date') || {}).population;
    const hsAll = data('high_schools').filter(r => r.kind === 'School');
    const hsTop50 = hsAll.filter(r => Number(r.usn_state) <= 50);
    const crime24 = data('crime_oj').find(r => r.city === 'Fremont' && r.year === 2024) || {};
    const topRound = data('startup_rounds').slice().sort((a, b) => b.amount_usd - a.amount_usd)[0] || {};
    const zMonth = String((row('zillow_market', 'zori') || {}).as_of || '').replace(/ \d+,/, '');  // 'Sep 30, 2026' -> 'Sep 2026'
    const roundWhen = topRound.date ? new Date(topRound.date + '-15').toLocaleString('en-US', { month: 'short', year: 'numeric' }) : '';

    const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const mlab = m => MON[+m.slice(5, 7) - 1] + ' ' + m.slice(0, 4);
    const zh = data('zillow_history').slice(-25);                    // last 24 months plus the current one
    const zLabels = zh.length ? [mlab(zh[0].month), mlab(zh[zh.length - 1].month)] : ['', ''];
    const um = data('unemployment_monthly').slice(-25);
    const uLabels = um.length ? [um[0].label, um[um.length - 1].label] : ['', ''];
    const uLast = um[um.length - 1] || {};
    const uYearAgo = row('jobs_more', 'fremont_unemployment_rate_year_ago') || {};
    const heroHtml = '<div class="home-hero"><div><span class="hh-kicker">Fremont, California</span><div class="hh-title">Know Fremont by the numbers.</div>' +
      '<p class="hh-lede">Fair, free access to public data about Fremont, California: housing, schools, safety, jobs and more. Every number comes from the agency or company that published it, and links to its source and date.</p>' +
      '<ul class="hh-ticks"><li>Source on every figure</li><li>Free, no account</li><li>Open data</li></ul>' +
      '</div>' +
      '<div class="hh-scene"><svg viewBox="0 0 600 330" role="img" aria-label="Illustration of Fremont: hills, a BART train and a lake">' +
      '<circle class="sun" cx="480" cy="78" r="32"/><path class="hill1" d="M0 215 Q90 125 200 195 T380 185 T600 165 V330 H0Z"/><path class="hill2" d="M0 250 Q140 185 280 245 T600 225 V330 H0Z"/>' +
      '<g class="bld"><rect x="56" y="212" width="34" height="58"/><rect x="96" y="226" width="28" height="44"/><rect x="130" y="202" width="36" height="68"/><rect x="432" y="222" width="40" height="48"/><rect x="478" y="208" width="30" height="62"/></g>' +
      '<rect class="bld" x="0" y="258" width="600" height="8" opacity=".5"/><rect class="train" x="196" y="232" width="196" height="26" rx="8"/>' +
      '<g class="win"><rect x="208" y="238" width="28" height="12" rx="3"/><rect x="244" y="238" width="28" height="12" rx="3"/><rect x="280" y="238" width="28" height="12" rx="3"/><rect x="316" y="238" width="28" height="12" rx="3"/><rect x="352" y="238" width="28" height="12" rx="3"/></g>' +
      '<path class="lake" d="M0 296 Q150 276 300 296 T600 292 V330 H0Z"/></svg></div></div>';

    const cats = [
      { href: 'rent.html', icon: 'home', color: 1, title: 'Rent & Housing', v: f(v('zillow_market', 'zori'), 'usd'), l: 'typical asking rent, ' + zMonth + ' (Zillow)' },
      { href: 'schools.html', icon: 'school', color: 2, title: 'Schools', v: f(v('schools', 'grad_rate'), 'pct'), l: 'Fremont Unified four-year graduation rate, class of 2025' },
      { href: 'food.html', icon: 'fork', color: 3, title: 'Food', v: f(v('business', 'restaurants'), 'int'), l: 'restaurants, bars and food-service businesses (2022 Economic Census)' },
      { href: 'parks.html', icon: 'tree', color: 4, title: 'Parks & Events', v: f(v('parks_summary', 'parkland_share'), 'pct'), l: 'of the city is parkland, all agencies' },
      { href: 'city.html', icon: 'city', color: 5, title: 'City Data', v: f(pop.population, 'int'), l: 'residents, Jan 1, 2026 (CA Dept. of Finance)' },
      { href: 'safety.html', icon: 'shield', color: 1, title: 'Crime & Safety', v: f(crime24.violent, 'int'), l: 'violent crimes reported in 2024 (CA DOJ)' },
      { href: 'health.html', icon: 'heart', color: 2, title: 'Health Care', v: f(v('census_profile', 'uninsured'), 'pct'), l: 'of residents under 65 are uninsured (ACS 2020–2024)' },
      { href: 'jobs.html', icon: 'briefcase', color: 3, title: 'Jobs', v: f(unemp.value, 'pct1'), l: 'unemployment rate, ' + (unemp.period || '') + ' (BLS/EDD); median household income ' + f(v('census_profile', 'mhi'), 'usd') },
      { href: 'startups.html', icon: 'rocket', color: 4, title: 'Startups', v: f(topRound.amount_usd, 'usdc'), l: 'largest recent funding round by a Fremont-linked company (' + [topRound.company, topRound.round, roundWhen].filter(Boolean).join(', ') + ')' }
    ];
    const catHtml = '<div class="cat-grid">' + cats.map(c =>
      '<a class="cat-card" href="' + c.href + '"><div class="cat-top"><span class="chip" style="background:var(--s' + c.color + ')">' + FBN.icon(c.icon, c.color === 4 ? ' style="stroke:#0f2233"' : '') + '</span><h2>' + FBN.esc(c.title) + '</h2></div>' +
      '<div class="cat-stat"><span class="v">' + FBN.esc(c.v) + '</span><span class="l">' + FBN.esc(c.l) + '</span></div><span class="cat-more">See the numbers →</span></a>').join('') + '</div>';

    return [
      {
        id: 'glance',
        lead: '<h2 class="sr-only">Fremont at a glance</h2>' + heroHtml,
        cards: [
          { ds: 'dof_population', id: '2026-01-01', key: 'date', label: 'Residents', value: pop.population, format: 'int', icon: 'users', color: 1, meta: 'Jan 1, 2026 · CA Dept. of Finance E-1' },
          { ds: 'zillow_market', id: 'zhvi', label: 'Typical home value', icon: 'home', color: 2, deltaKey: 'yoy_pct', series: zh.map(r => r.zhvi), seriesLabels: zLabels, seriesFormat: 'usd' },
          { ds: 'census_profile', id: 'mhi', label: 'Median household income', icon: 'dollar', color: 3 },
          { ds: 'city_rankings', id: 'happiest', label: 'Happiest city in America (WalletHub)', value: happiest.rank, format: 'rank', icon: 'star', color: 4, meta: 'of ' + happiest.of + ' cities · ' + happiest.published },
          { ds: 'zillow_market', id: 'zori', label: 'Typical asking rent (Zillow index)', icon: 'key', color: 5, deltaKey: 'yoy_pct', series: zh.map(r => r.zori), seriesLabels: zLabels, seriesFormat: 'usd' },
          { ds: 'jobs_more', id: 'fremont_unemployment_rate_latest', label: 'Unemployment rate, Fremont', icon: 'briefcase', color: 1, note: uYearAgo.value !== undefined ? uYearAgo.period + ': ' + f(uYearAgo.value, 'pct1') : '', series: um.map(r => r.fremont), seriesLabels: uLabels, seriesFormat: 'pct1' },
          { ds: 'high_schools', label: 'Fremont Unified high schools in California’s top 50 (U.S. News)', value: hsTop50.length, format: 'int', icon: 'school', color: 1, meta: 'of ' + hsAll.length + ' comprehensive high schools · 2026–27 · U.S. News Best High Schools' }
        ]
      },
      { title: 'Explore by topic', html: catHtml },
      {
        html: '<div class="about-row"><div class="about-box"><h2>Why this site exists</h2>' +
          '<p class="about-sub">Fair, free access to public data</p>' +
          '<p><strong>Public data should be easy for everyone to find, not just people with money or technical skill.</strong> Anyone with time and the right tools can gather these figures. This site does it once, in the open, so no one has to. A more equitable world starts with fair and free access.</p>' +
          '<p>It is free, with no account and no paywall. The code and data are open on <a href="https://github.com/jeffreyaifudenna/fremont-by-the-numbers" target="_blank" rel="noopener">GitHub</a>. The site runs no surveys of its own: it collects what the City of Fremont, the U.S. Census Bureau, California agencies, Zillow, Redfin and others have already published, and links every number back to them.</p>' +
          '<p>Built by JeffreyAiFudenna, with Claude (Anthropic’s AI model) gathering the figures and writing the code. AI can misread a source, so click any number to open its source and check.</p>' +
          '<p><strong>Cheers to Fremont. It’s why I made this.</strong> <a href="sources.html">Methodology and sources</a></p></div>' +
          /* The one local sponsor spot: defined once in js/fbn.js (sponsorHtml) and shown on every page. */
          FBN.sponsorHtml() + '</div>'
      }
    ].filter(Boolean);
  },
  after: function (wrap) { wrap.appendChild(FBN.freshnessBar()); }
});
