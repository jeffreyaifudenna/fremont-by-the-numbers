/* Home page: headline numbers and one door into each category. */
FBN.page({
  key: 'index',
  bare: true,
  title: 'Fremont by the Numbers',
  kicker: 'Data aggregator · built using Claude',
  hint: 'Start with a topic below, or click any number under “Fremont at a glance” to open its source in a new tab.',
  lede: 'Fremont by the Numbers is a data aggregator built using Claude. It gathers public figures about Fremont, California (housing, schools, safety, jobs and more) from the agencies and companies that publish them, and shows each number with its source and date.',
  uses: ['employers', 'dof_population', 'census_profile', 'zillow_market', 'schools', 'police_facts', 'city_rankings', 'business', 'parks_summary', 'city_facts', 'people_more', 'jobs_more', 'living_facts', 'health_places', 'high_schools', 'school_list', 'crime_oj'],
  sections: function (data, row) {
    const v = (ds, id, key) => (row(ds, id, key) || {}).value;
    const f = FBN.fmt;
    const pop = row('dof_population', '2026-01-01', 'date') || {};
    const unemp = row('jobs_more', 'fremont_unemployment_rate_latest') || {};
    const happiest = row('city_rankings', 'happiest') || {};
    const pop25 = (row('dof_population', '2025-01-01', 'date') || {}).population;
    const ranked = data('school_list').filter(r => /^\d+$/.test(String(r.usn_state).replace('#', ''))).map(r => ({ level: r.level, n: Number(String(r.usn_state).replace('#', '')) }));
    const top100 = ranked.filter(r => r.n <= 100);
    const byLevel = lv => top100.filter(r => r.level === lv).length;
    const crime24 = data('crime_oj').find(r => r.city === 'Fremont' && r.year === 2024) || {};
    const tesla = data('employers').find(r => /^Tesla/.test(r.employer)) || {};

    const cats = [
      { href: 'rent.html', icon: 'home', color: 1, title: 'Rent & Housing', v: f(v('zillow_market', 'zori'), 'usd'), l: 'typical asking rent, Sep 2026 (Zillow)' },
      { href: 'schools.html', icon: 'school', color: 2, title: 'Schools', v: f(v('schools', 'grad_rate'), 'pct'), l: 'Fremont Unified four-year graduation rate, class of 2025' },
      { href: 'food.html', icon: 'fork', color: 3, title: 'Food', v: f(v('business', 'restaurants'), 'int'), l: 'restaurants, bars and food-service businesses (2022 Economic Census)' },
      { href: 'parks.html', icon: 'tree', color: 4, title: 'Parks & Events', v: f(v('parks_summary', 'parkland_share'), 'pct'), l: 'of the city is parkland, all agencies' },
      { href: 'city.html', icon: 'city', color: 5, title: 'City Data', v: f(pop.population, 'int'), l: 'residents, Jan 1, 2026 (CA Dept. of Finance)' },
      { href: 'safety.html', icon: 'shield', color: 1, title: 'Crime & Safety', v: f(crime24.violent, 'int'), l: 'violent crimes reported in 2024 (CA DOJ)' },
      { href: 'health.html', icon: 'heart', color: 2, title: 'Health Care', v: f(v('census_profile', 'uninsured'), 'pct'), l: 'of residents under 65 are uninsured (ACS 2020–2024)' },
      { href: 'jobs.html', icon: 'briefcase', color: 3, title: 'Jobs', v: f(unemp.value, 'pct1'), l: 'unemployment rate, ' + (unemp.period || '') + ' (BLS/EDD); median household income ' + f(v('census_profile', 'mhi'), 'usd') },
      { href: 'startups.html', icon: 'rocket', color: 4, title: 'Startups', v: f(tesla.employees, 'int'), l: 'Tesla employees in Fremont, the city’s largest employer (City financial report, FY2024)' }
    ];
    const catHtml = '<div class="cat-grid">' + cats.map(c =>
      '<a class="cat-card" href="' + c.href + '"><div class="cat-top"><span class="chip" style="background:var(--s' + c.color + ')">' + FBN.icon(c.icon, c.color === 4 ? ' style="stroke:#0f2233"' : '') + '</span><h2>' + c.title + '</h2></div>' +
      '<div class="cat-stat"><span class="v">' + c.v + '</span><span class="l">' + c.l + '</span></div><span class="cat-more">See the numbers →</span></a>').join('') + '</div>';

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
          { ds: 'school_list', label: 'Fremont Unified schools in California’s top 100 for their level (U.S. News)', value: top100.length + ' of ' + ranked.length, icon: 'school', color: 1, url: 'https://www.usnews.com/education/best-high-schools/california/districts/fremont-unified-school-district-111898', urlName: 'U.S. News: Fremont Unified School District', meta: byLevel('High') + ' high, ' + byLevel('Middle') + ' middle and ' + byLevel('Elementary') + ' elementary schools · 2026–27 · U.S. News · ' + ranked.length + ' schools have a numbered state rank' }
        ]
      },
      { title: 'Explore by topic', html: catHtml },
      {
        html: '<div class="about-box"><h2>About this site</h2>' +
          '<p class="about-sub">A data aggregator built by JeffreyAiFudenna using Claude to gather data and write the code</p>' +
          '<p><strong>Fremont by the Numbers does not run its own surveys or measurements.</strong> It collects figures that public sources have already published (the City of Fremont, the U.S. Census Bureau, California state agencies, Zillow, Redfin, news reports and others) and puts them in one place.</p>' +
          '<p><strong>Claude did the gathering.</strong> Claude, Anthropic’s AI model, read each source, recorded the figure with the page it came from and the date it was read, and wrote the code for this site. AI can misread a source, so every number links back to where it came from: click it to open the source in a new tab and check.</p>' +
          '<p><a href="sources.html">Read the full methodology and source list</a></p></div>'
      }
    ];
  }
});
