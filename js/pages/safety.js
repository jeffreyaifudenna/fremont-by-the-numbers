/* Crime & Safety: crime, policing, fire, traffic safety, and how residents feel. */
FBN.page({
  key: 'safety',
  title: 'Crime & Safety',
  lede: 'Reported crime, how Fremont is policed, the fire department’s workload, and traffic safety, with the caveats that come with each dataset.',
  uses: ['crime_oj', 'crime_clearance', 'police_facts', 'police_staffing', 'hate_crimes', 'fire_summary', 'fire_incidents', 'fire_types', 'traffic_fatal', 'traffic_facts', 'ots_rankings', 'city_rankings', 'dof_population'],
  sections: function (data, row) {
    const fre = data('crime_oj').filter(r => r.city === 'Fremont');
    const c24 = fre.find(r => r.year === 2024) || {};
    const c23 = fre.find(r => r.year === 2023) || {};
    const pop = (row('dof_population', '2025-01-01', 'date') || {}).population;
    const per1k = n => pop ? Math.round(10 * 1000 * n / pop) / 10 : null;
    const safest = row('city_rankings', 'safest') || {};
    const clr = data('crime_clearance').filter(r => r.city === 'Fremont');
    const clearRows = clr.map(r => ({ year: r.year, v: Math.round(1000 * r.violent_cleared / r.violent) / 10, p: Math.round(1000 * r.property_cleared / r.property) / 10, status: r.status }));
    const types24 = [
      { type: 'Homicide', n: c24.homicide }, { type: 'Rape', n: c24.rape }, { type: 'Robbery', n: c24.robbery }, { type: 'Aggravated assault', n: c24.agg_assault },
      { type: 'Burglary', n: c24.burglary }, { type: 'Vehicle theft', n: c24.vehicle_theft }, { type: 'Larceny / theft', n: c24.larceny }, { type: 'Arson', n: c24.arson }
    ];
    return [
      {
        title: 'Crime in 2024, the last complete year',
        cards: [
          { ds: 'crime_oj', label: 'Violent crimes reported', value: c24.violent, format: 'int', icon: 'shield', color: 1, meta: '2024 · CA DOJ OpenJustice', note: (c23.violent ? ((c24.violent - c23.violent) / c23.violent * 100).toFixed(1) + '% vs 2023' : '') },
          { ds: 'crime_oj', label: 'Violent crimes per 1,000 residents', value: per1k(c24.violent), format: 'dec1', icon: 'users', color: 1, meta: '2024 · CA DOJ crimes ÷ Dept. of Finance population, Jan 1, 2025' },
          { ds: 'crime_oj', label: 'Property crimes reported', value: c24.property, format: 'int', icon: 'home', color: 2, meta: '2024 · CA DOJ OpenJustice', note: (c23.property ? ((c24.property - c23.property) / c23.property * 100).toFixed(1) + '% vs 2023' : '') },
          { ds: 'crime_oj', label: 'Property crimes per 1,000 residents', value: per1k(c24.property), format: 'dec1', icon: 'users', color: 2, meta: '2024 · CA DOJ crimes ÷ Dept. of Finance population, Jan 1, 2025' },
          { ds: 'city_rankings', id: 'safest', label: 'Safest Cities rank (WalletHub)', value: safest.rank, format: 'rank', icon: 'star', color: 4, meta: 'of ' + safest.of + ' cities · ' + safest.published },
          { ds: 'police_facts', id: 'feel_safe', label: 'Residents who feel safe in Fremont', icon: 'check', color: 3 }
        ],
        charts: [{
          ds: 'crime_oj', type: 'line', x: 'year', format: 'int', filter: r => r.city === 'Fremont',
          title: 'Reported crimes, 2015–2025', sub: 'Hollow point: 2025 is incomplete',
          series: [{ key: 'violent', label: 'Violent crimes', status: 'status' }, { key: 'property', label: 'Property crimes', color: 2, status: 'status' }],
          source: 'California DOJ OpenJustice, Crimes and Clearances (July 2026 release). Fremont’s 2025 reporting is incomplete in this file; it will be rechecked at the July 2027 release.'
        }, {
          type: 'hbar', format: 'int', uses: ['crime_oj'],
          title: 'Crimes by type, 2024',
          build: () => ({ labels: types24.map(r => r.type), datasets: [{ label: 'Reported', data: types24.map(r => r.n), _color: 1 }] }),
          source: 'California DOJ OpenJustice. Larceny (theft) makes up most property crime.'
        }],
        notes: ['!Fremont PD switched to the FBI’s incident-based reporting system (NIBRS) in 2022, which can raise counts and change clearance rates compared with earlier years. Comparisons across that line should be made with care.', 'Totals for the same year can differ between sources: websites that republish FBI-derived data and the police department’s own annual reports count and classify offenses differently. This page uses the state Department of Justice file. Rates per 1,000 residents divide 2024 crimes by the Department of Finance population for Jan 1, 2025 (233,428).']
      },
      {
        title: 'Solved cases and hate crimes',
        charts: [{
          type: 'line', format: 'pct', uses: ['crime_clearance'],
          title: 'Share of reported crimes cleared', sub: 'Cleared by arrest or exceptional means',
          build: () => ({ labels: clearRows.map(r => r.year), datasets: [{ label: 'Violent crimes', data: clearRows.map(r => r.v), _color: 1, _pointStyles: clearRows.map(r => r.status) }, { label: 'Property crimes', data: clearRows.map(r => r.p), _color: 2, _pointStyles: clearRows.map(r => r.status) }] }),
          source: 'California DOJ OpenJustice clearance columns. The drop in violent clearances from 2022 coincides with the NIBRS switch.'
        }, {
          ds: 'hate_crimes', type: 'bar', x: 'year', format: 'int',
          title: 'Hate crime events reported', sub: 'Fremont, 2015–2025',
          series: [{ key: 'incidents', label: 'Events' }],
          source: 'California DOJ OpenJustice hate crime data (agency code 0105).'
        }]
      },
      {
        title: 'Police',
        cards: [
          { ds: 'police_facts', id: 'calls_2025', label: 'Calls for service in 2025', icon: 'phone', color: 1 },
          { ds: 'police_facts', id: 'sworn_auth', label: 'Authorized sworn officers', icon: 'shield', color: 2 },
          { ds: 'police_facts', id: 'officer_vacancies', label: 'Officer vacancies', icon: 'users', color: 4 },
          { ds: 'police_facts', id: 'answer_911', label: '911 calls answered within 15 seconds', icon: 'clock', color: 3 },
          { ds: 'police_facts', id: 'police_sat', label: 'Residents satisfied with police protection', icon: 'check', color: 5 },
          { ds: 'police_facts', id: 'crime_up', label: 'Residents who think crime has increased', icon: 'trend', color: 2 }
        ],
        charts: [{
          ds: 'police_staffing', type: 'line', x: 'year', format: 'int', filter: r => r.city === 'Fremont', zero: false,
          title: 'Police staffing', sub: 'Sworn officers and civilian staff reported to the state each October 31',
          series: [{ key: 'sworn', label: 'Sworn officers' }, { key: 'civilian', label: 'Civilian staff', color: 3 }],
          source: 'California DOJ OpenJustice, Law Enforcement Personnel (counts as of Oct 31 each year). The City’s FY 2025–26 organization chart shows 205 authorized sworn positions, and the Police Department’s Strategic Plan update (Nov 2025) reports 16 vacancies at Oct 31, 2025, so the 2025 figure of 190 is consistent with officers on staff rather than authorized positions.'
        }, {
          type: 'bar', format: 'int', uses: ['police_facts'],
          title: 'Police calls for service', sub: 'Selected years',
          build: (d, r) => { const ids = ['calls_2020', 'calls_2023', 'calls_2025']; const rows = ids.map(i => r('police_facts', i) || {}); return { labels: rows.map(x => x.period), datasets: [{ label: 'Calls', data: rows.map(x => x.value), _color: 1 }] }; },
          source: 'Fremont PD yearly summaries and 2023 annual report.'
        }],
        notes: ['Survey figures come from the City of Fremont’s December 2025 community survey (FM3 Research, 636 residents, ±4%).']
      },
      {
        title: 'Fire department',
        cards: [
          { ds: 'fire_summary', id: 'total_2025', label: 'Incidents responded to in 2025', icon: 'flame', color: 2, showNote: true },
          { ds: 'fire_summary', id: 'stations', label: 'Fire stations', icon: 'building', color: 1 },
          { ds: 'fire_summary', id: 'area', label: 'Square miles covered', icon: 'map', color: 4 },
        ],
        charts: [{
          ds: 'fire_incidents', type: 'bar', x: 'year', format: 'int',
          title: 'Fire department incidents by year',
          series: [{ key: 'incidents', label: 'Incidents', color: 2, status: 'status' }],
          source: 'City of Fremont Fire incidents dashboard, read by hand. The dashboard’s 2026 count is partial and its date range is unconfirmed, so 2026 is left out. For 2025 the dashboard shows 18,999; the city’s incident-summaries page lists 19,003.'
        }, {
          ds: 'fire_types', type: 'hbar', x: 'category', format: 'int', sort: 'incidents',
          title: 'What the fire department responds to', sub: '2025, full year (19,003 incidents)',
          series: [{ key: 'incidents', label: 'Incidents', color: 2 }],
          source: 'City of Fremont Fire Department, incident summaries for 2025. About two of every three incidents are rescue and EMS calls.'
        }]
      },
      {
        title: 'Traffic safety',
        cards: [
          { ds: 'traffic_facts', id: 'ped_share', label: 'Pedestrians among people killed in crashes, 2014–2025', icon: 'users', color: 2 },
          { ds: 'traffic_facts', id: 'redlight', label: 'Intersections with red-light cameras', icon: 'car', color: 1 },
          { ds: 'traffic_facts', id: 'bikeways', label: 'Miles of separated bikeways added in five years', icon: 'map', color: 3 },
          { ds: 'traffic_facts', id: 'safe_driving', label: 'Residents who feel safe driving in Fremont', icon: 'car', color: 4 },
          { ds: 'traffic_facts', id: 'safe_walk_nbhd', label: 'Feel safe walking in their neighborhood', icon: 'users', color: 4 }
        ],
        charts: [{
          ds: 'traffic_fatal', type: 'bar', x: 'year', format: 'int', stacked: true,
          title: 'Fatal crashes by year',
          series: [{ key: 'fatal_crashes', label: 'Fatal crashes', color: 2 }, { key: 'other_fatal', label: 'Other fatal crashes listed separately', color: 4 }],
          source: 'City of Fremont Traffic Safety, Safety Data and Trends page.'
        }],
        tables: [{
          ds: 'ots_rankings', title: 'State crash rankings, 2023', sub: 'Fremont among 62 California cities of 100,001–250,000 people; rank 1 is worst', sort: (a, b) => a.order - b.order,
          columns: [{ key: 'category', label: 'Category' }, { key: 'count', label: 'Count', format: 'int' }, { key: r => r.rank + ' of ' + r.of, label: 'Rank', num: false }],
          source: 'California Office of Traffic Safety, 2023 rankings. A high rank number means fewer crashes than most similar cities; DUI arrests are the exception.'
        }]
      }
    ];
  }
});
