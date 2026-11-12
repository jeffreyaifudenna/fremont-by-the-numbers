/* Home page: headline numbers and one door into each category. */
/* Advertiser signup: paste the Google Form share link between the quotes. While empty, the link falls back to email. */
const AD_FORM = 'https://docs.google.com/forms/d/e/1FAIpQLSfLKXM5-mOgRRrkmQecmai8uK4hnng7TT1Hsj7tse_ygrfYFA/viewform';
const AD_SIGNUP = AD_FORM || 'mailto:Jeffreyaifudenna@gmail.com?subject=Advertising%20on%20Fremont%20by%20the%20Numbers';
FBN.page({
  key: 'index',
  bare: true,
  title: 'FremontCaByTheNumbers.com',
  kicker: 'Free and open data for Fremont',
  hint: 'Start with a topic below, or click any number under “Fremont at a glance” to open its source in a new tab.',
  lede: 'Fair, free access to public data about Fremont, California: housing, schools, safety, jobs and more. Every number comes from the agency or company that published it, and links to its source and date.',
  uses: ['startup_rounds', 'dof_population', 'census_profile', 'zillow_market', 'schools', 'police_facts', 'city_rankings', 'business', 'parks_summary', 'city_facts', 'people_more', 'jobs_more', 'living_facts', 'health_places', 'high_schools', 'crime_oj'],
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
        title: 'Fremont at a glance',
        cols: 3,
        sub: 'Click any number to open its source in a new tab.',
        cards: [
          { ds: 'dof_population', id: '2026-01-01', key: 'date', label: 'Residents', value: pop.population, format: 'int', icon: 'users', color: 1, meta: 'Jan 1, 2026 · CA Dept. of Finance E-1' },
          { ds: 'zillow_market', id: 'zhvi', label: 'Typical home value', icon: 'home', color: 2, deltaKey: 'yoy_pct' },
          { ds: 'census_profile', id: 'mhi', label: 'Median household income', icon: 'dollar', color: 3 },
          { ds: 'city_rankings', id: 'happiest', label: 'Happiest city in America (WalletHub)', value: happiest.rank, format: 'rank', icon: 'star', color: 4, meta: 'of ' + happiest.of + ' cities · ' + happiest.published },
          { ds: 'zillow_market', id: 'zori', label: 'Typical asking rent (Zillow index)', icon: 'key', color: 5 },
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
          /* One sponsor slot, local Fremont businesses only. To fill it, replace the contents of .ad-slot
             (keep the "Sponsored" label). Contact link below is the open-slot invitation. */
          '<aside class="ad-slot" aria-label="Sponsor"><span class="ad-label">Built by</span>' +
          '<p class="ad-title">JeffreyAiFudenna</p>' +
          '<p><a class="ad-btn" href="https://jeffrey-ai-portfolio.vercel.app" target="_blank" rel="noopener">Visit my portfolio ↗</a></p>' +
          '<p class="ad-own"><strong>Own a Fremont business?</strong> Sponsor this free public resource and help keep it free. One business at a time, simple monthly fee. <a href="' + AD_SIGNUP + '"' + (AD_FORM ? ' target="_blank" rel="noopener"' : '') + '>Sign up to advertise' + (AD_FORM ? ' ↗' : '') + '</a>.</p></aside></div>'
      }
    ];
  }
});
