/* City of Fremont official data: people, budget, services, civic life, climate, transportation, rankings. */
FBN.page({
  key: 'city',
  title: 'City of Fremont: Official Data',
  lede: 'Who lives here, how the city is run, and what its own dashboards and reports say.',
  uses: ['dof_population', 'census_population', 'census_profile', 'people_more', 'languages', 'asian_groups', 'city_facts', 'civic_facts', 'app_summary', 'app_top', 'homeless_pit', 'homeless_monthly', 'climate_kpis', 'ghg_sector', 'ev_zip', 'ev_permits', 'city_rankings', 'pavement', 'traffic_facts', 'highway_aadt', 'living_facts', 'commute_modes', 'bart_history', 'water_monthly'],
  sections: function (data, row) {
    const pop26 = row('dof_population', '2026-01-01', 'date') || {};
    const wm = data('water_monthly');
    const wLast = wm[wm.length - 1] || {};
    const ev = data('ev_zip');
    const evShare = yr => { const rows = ev.filter(r => r.year === yr); const z = rows.reduce((a, r) => a + r.bev + r.phev + r.fcev, 0); const t = rows.reduce((a, r) => a + r.light_total, 0); return t ? 100 * z / t : null; };
    const evRows = [{ year: 'Jan 2020', share: evShare(2020) }, { year: 'Dec 2025', share: evShare(2025) }];
    return [
      {
        title: 'People',
        cards: [
          { ds: 'dof_population', id: '2026-01-01', key: 'date', label: 'Residents', value: pop26.population, format: 'int', icon: 'users', color: 1, meta: pop26.period + ' · CA Dept. of Finance' },
          { ds: 'census_profile', id: 'foreign_born', label: 'Born outside the U.S.', icon: 'globe', color: 2 },
          { ds: 'census_profile', id: 'other_lang', label: 'Speak a language other than English at home', icon: 'globe', color: 2 },
          { ds: 'people_more', id: 'median_age', label: 'Median age', icon: 'users', color: 3 },
          { ds: 'census_profile', id: 'ba_plus', label: 'Adults with a bachelor’s degree or higher', icon: 'award', color: 4 },
          { ds: 'people_more', id: 'hh_kids', label: 'Households with children', icon: 'home', color: 5 }
        ],
        charts: [{
          ds: 'census_population', type: 'line', x: 'year', format: 'int',
          title: 'Population since 1960', sub: 'Decennial Census counts and the 2025 estimate', status: 'kind',
          series: [{ key: 'population', label: 'Residents', status: 'kind' }],
          source: 'Decennial Census via MTC and Census QuickFacts; Jul 2025 figure is a Census Bureau estimate. The state Department of Finance puts Jan 2026 at ' + FBN.fmt(pop26.population, 'int') + ', using a different method.'
        }, {
          ds: 'languages', type: 'hbar', x: 'language', format: 'pct', sort: 'share_pct',
          title: 'Languages spoken at home', sub: 'Residents age 5 and up, 2020–2024',
          series: [{ key: 'share_pct', label: 'Share of residents' }],
          source: 'Census ACS table C16001.'
        }],
        tables: [{
          ds: 'census_profile', title: 'Race and ethnicity', sub: 'Census Bureau estimates, Jul 1, 2025', filter: r => r.group === 'Race and ethnicity', sort: 'value',
          columns: [{ key: 'measure', label: 'Group' }, { key: 'value', label: 'Share', format: 'pct' }],
          source: 'Census QuickFacts. Groups are “alone” except Hispanic or Latino, which can be any race.'
        }, {
          ds: 'asian_groups', title: 'Asian communities', sub: 'Share of all Fremont residents, 2020–2024', sort: 'share_pct',
          columns: [{ key: 'group', label: 'Group' }, { key: 'share_pct', label: 'Share', format: 'pct' }],
          source: 'Census ACS table DP05 (alone).'
        }]
      },
      {
        title: 'Households and income',
        facts: [{ ds: 'census_profile', title: 'Households and housing', group: 'Households and housing' },
                { ds: 'census_profile', title: 'Income, education and work', group: 'Income, education and work' }],
        notes: ['Census American Community Survey five-year estimates for 2020–2024 unless noted. Newer Census releases are added when the site’s data is next refreshed.']
      },
      {
        title: 'City government and budget',
        cards: [
          { ds: 'city_facts', id: 'budget', label: 'Operating budget, all funds', icon: 'dollar', color: 1 },
          { ds: 'city_facts', id: 'general_fund', label: 'General fund spending', icon: 'dollar', color: 1 },
          { ds: 'civic_facts', id: 'city_fte', label: 'City employees (full-time equivalent)', icon: 'users', color: 2 },
          { ds: 'civic_facts', id: 'credit', label: 'S&P bond rating', icon: 'award', color: 3 },
        ],
        notes: ['Budget figures are from the City’s FY 2026/27 Adopted Operating Budget (Summary of All Funds). The all-funds total is total uses, which includes transfers between funds; spending before transfers is about $408 million. The employee count is from the FY 2025/26 proposed budget and the bond rating from the City’s FY 2024-25 financial report (AA+, stable); it was not checked against S&P directly.']
      },
      {
        title: 'Voters and elections',
        cards: [
          { ds: 'civic_facts', id: 'registered', label: 'Registered voters', icon: 'ballot', color: 1 },
          { ds: 'civic_facts', id: 'turnout_2024', label: 'Turnout, November 2024', icon: 'ballot', color: 2 },
          { ds: 'civic_facts', id: 'vbm_2024', label: 'Ballots cast by mail, November 2024', icon: 'ballot', color: 3 }
        ],
        charts: [{
          ds: 'civic_facts', type: 'hbar', x: 'label', format: 'int', filter: r => r.group === 'Registration' && r.id !== 'registered', sort: 'value',
          title: 'Voter registration by party', sub: 'As of May 18, 2026',
          series: [{ key: 'value', label: 'Registered voters' }],
          source: 'California Secretary of State, Report of Registration.'
        }]
      },
      {
        title: 'City services: FremontApp requests',
        sub: 'What residents report through the city’s service-request app.',
        cards: [
          { ds: 'app_summary', id: 'created', label: 'Requests created, Jul–Sep 2026', icon: 'phone', color: 1, note: 'The dashboard shows 1,574 closed and 48 open; the other 158 have no status listed.' },
          { ds: 'app_summary', id: 'closed', label: 'Requests closed', icon: 'check', color: 3 },
          { ds: 'app_summary', id: 'days_to_close', label: 'Average days to close', icon: 'clock', color: 2 },
        ],
        charts: [{
          ds: 'app_top', type: 'hbar', x: 'request', format: 'int', sort: 'requests',
          title: 'Most common request types', sub: 'Jul 1 – Sep 30, 2026',
          series: [{ key: 'requests', label: 'Requests' }],
          source: 'City of Fremont FremontApp dashboard, read by hand (no download is published).'
        }]
      },
      {
        title: 'Homeless response',
        charts: [{
          ds: 'homeless_pit', type: 'bar', x: 'year', format: 'int',
          title: 'Unhoused residents counted', sub: 'Point-in-time counts (every two years)',
          series: [{ key: 'unhoused', label: 'People counted' }],
          source: 'Alameda County point-in-time count, as shown on the City’s Homeless Response dashboard.'
        }, {
          ds: 'homeless_monthly', type: 'line', x: 'label', format: 'int',
          title: 'Monthly response activity', sub: 'City Homeless Response dashboard',
          series: [{ key: 'cleanups', label: 'Cleanups' }, { key: 'outreach_visits', label: 'Outreach visits', color: 3 }, { key: 'encampments_cleared', label: 'Encampments cleared', color: 2 }, { key: 'app_reports', label: 'App reports', color: 4 }],
          source: 'City of Fremont Homeless Response dashboard, read by hand.'
        }]
      },
      {
        title: 'Climate and energy',
        cards: [
          { ds: 'climate_kpis', id: 'evs', label: 'Electric vehicles registered in Fremont (city count)', icon: 'bolt', color: 3 },
          { ds: 'climate_kpis', id: 'trees', label: 'Trees planted in 2025', icon: 'tree', color: 3 },
          { ds: 'climate_kpis', id: 'food', label: 'Pounds of food recovered in 2025', icon: 'leaf', color: 4 },
          { ds: 'living_facts', id: 'solar_accounts', label: 'Solar customer accounts', icon: 'sun', color: 4 },
          { ds: 'living_facts', id: 'ava_accounts', label: 'Ava Community Energy accounts', icon: 'bolt', color: 1 },
          { ds: 'water_monthly', id: wLast.month, key: 'month', label: 'Residential water use per person per day (gallons), ' + wLast.label, value: wLast.residential_gpcd, format: 'dec1', icon: 'water', color: 2, meta: wLast.label + ' · State Water Board report by ACWD', note: 'Alameda County Water District serves Fremont, Newark and Union City.' }
        ],
        charts: [{
          ds: 'ghg_sector', type: 'bar', x: 'year', format: 'int', stacked: true,
          title: 'Greenhouse gas emissions by sector', sub: 'Metric tons CO₂e; last bar is the 2030 goal',
          series: [{ key: 'transportation', label: 'Transportation', color: 1 }, { key: 'building_energy', label: 'Building energy', color: 2 }, { key: 'waste', label: 'Waste', color: 4 }, { key: 'water_wastewater', label: 'Water and wastewater', color: 3 }],
          source: 'City of Fremont Climate Action dashboard (inventories for 2005–2018; 2030 goal).'
        }, {
          type: 'bar', format: 'pct1', uses: ['ev_zip'],
          title: 'Zero-emission share of light vehicles, Fremont ZIP codes', sub: 'Battery, plug-in hybrid and fuel-cell vehicles',
          build: () => ({ labels: evRows.map(r => r.year), datasets: [{ label: 'Zero-emission share', data: evRows.map(r => r.share), _color: 3 }] }),
          source: 'California DMV, Vehicle Fuel Type Count by ZIP (data.ca.gov), ZIPs 94536, 94538, 94539, 94555. The City’s dashboard count of EVs uses a different method.'
        }, {
          ds: 'ev_permits', type: 'bar', x: 'year', format: 'int',
          title: 'EV charger permits issued', sub: '2026 is year to date',
          series: [{ key: 'permits', label: 'Permits', status: 'status' }],
          source: 'City of Fremont Climate Action dashboard.'
        }, {
          ds: 'water_monthly', type: 'line', x: 'label', format: 'dec1', zero: false,
          title: 'Residential water use per person per day', sub: 'Gallons, Alameda County Water District, by month since 2014',
          series: [{ key: 'residential_gpcd', label: 'Gallons per person per day', color: 2 }],
          source: 'State Water Resources Control Board, urban retail water supplier monthly reports (data.ca.gov), Alameda County Water District, which serves Fremont, Newark and Union City. Summer use runs well above winter use.'
        }]
      },
      {
        title: 'Getting around',
        cards: [
          { ds: 'census_profile', id: 'commute', label: 'Average commute, one way', icon: 'car', color: 1 },
          { ds: 'living_facts', id: 'bart_fremont', label: 'Fremont BART, weekday riders', icon: 'train', color: 2 },
          { ds: 'living_facts', id: 'bart_warm', label: 'Warm Springs BART, weekday riders', icon: 'train', color: 2 },
          { ds: 'traffic_facts', id: 'lane_miles', label: 'Lane miles of city streets', icon: 'map', color: 3 },
          { ds: 'traffic_facts', id: 'signals', label: 'Traffic signals', icon: 'car', color: 4 }
        ],
        charts: [{
          ds: 'commute_modes', type: 'hbar', x: 'mode', format: 'pct', sort: 'share_pct',
          title: 'How Fremont gets to work', sub: 'Workers 16 and over, 2020–2024',
          series: [{ key: 'share_pct', label: 'Share of workers' }],
          source: 'Census ACS table DP03.'
        }, {
          ds: 'bart_history', type: 'bar', x: 'station', format: 'int',
          title: 'BART weekday exits, before and after the pandemic', sub: 'Average weekday, by fiscal year',
          series: [{ key: 'fy2019', label: 'FY 2019', color: 3 }, { key: 'fy2024', label: 'FY 2024', color: 2 }, { key: 'fy2025', label: 'FY 2025', color: 1 }],
          source: 'BART ridership via DataSF (dataset m2xz-p7ja).'
        }, {
          ds: 'highway_aadt', type: 'hbar', x: 'label', format: 'int', sort: 'aadt',
          title: 'Busiest highway segments', sub: 'Average annual daily traffic, 2024',
          series: [{ key: 'aadt', label: 'Vehicles per day' }],
          source: 'Caltrans Traffic Census (AADT), 2024.'
        }],
        tables: [{
          ds: 'pavement', title: 'Street condition', phone: [0, 1, 2, 3, 4], sub: 'Pavement Condition Index, 0–100 (higher is better), three-year average', filter: r => r.city === 'Fremont' || r.city === 'Bay Area',
          columns: [{ key: 'city', label: 'Area' }, { key: 'lane_miles', label: 'Lane miles', format: 'dec1' }, { key: 'pci_2022', label: '2022', format: 'int' }, { key: 'pci_2023', label: '2023', format: 'int' }, { key: 'pci_2024', label: '2024', format: 'int' }],
          highlight: r => r.city === 'Fremont',
          source: 'Metropolitan Transportation Commission pavement condition table, Jan 2026 update.'
        }]
      },
      {
        title: 'How Fremont ranks',
        tables: [{
          ds: 'city_rankings', title: 'National city rankings, 2025–26', phoneCards: true, sub: 'Lower is better', navy: true, sort: (a, b) => a.order - b.order,
          columns: [{ key: 'ranking', label: 'Ranking' }, { key: 'publisher', label: 'Publisher' }, { key: r => '#' + r.rank + ' of ' + r.of, label: 'Fremont', num: false }, { key: 'published', label: 'Published' }, { key: 'highlights', label: 'Highlights', cardWide: true }],
          source: 'WalletHub ranking pages and Trust for Public Land ParkScore. Rankings compare the largest U.S. cities and use the publishers’ own weightings.'
        }]
      }
    ];
  }
});
