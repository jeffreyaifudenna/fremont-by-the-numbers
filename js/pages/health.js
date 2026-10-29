/* Health Care: hospitals, coverage, providers and population health. */
FBN.page({
  key: 'health',
  title: 'Health Care',
  lede: 'Fremont’s two hospitals and how they rate, who is covered and how, how many doctors there are, and how healthy residents report being.',
  uses: ['living_facts', 'census_profile', 'health_places', 'health_access', 'leapfrog_grades', 'air_quality', 'city_rankings', 'nursing_homes'],
  sections: function (data, row) {
    const healthiest = row('city_rankings', 'healthiest') || {};
    const nh = data('nursing_homes');
    const nhBeds = nh.reduce((a, r) => a + (r.beds || 0), 0);
    const nhRes = Math.round(nh.reduce((a, r) => a + (r.residents_per_day || 0), 0));
    const nhDate = nh[0] && nh[0].processing_date ? new Date(nh[0].processing_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';
    const nhUrl = 'https://data.cms.gov/provider-data/dataset/4pq5-n9py', nhUrlName = 'CMS: nursing home provider information';
    const grades = data('leapfrog_grades');
    const cycles = []; grades.forEach(g => { if (!cycles.includes(g.cycle)) cycles.push(g.cycle); });
    const hospitals = []; grades.forEach(g => { if (!hospitals.includes(g.hospital)) hospitals.push(g.hospital); });
    const gradeRows = cycles.map(c => { const r = { cycle: c }; hospitals.forEach(h => { const g = grades.find(x => x.cycle === c && x.hospital === h); r[h] = g ? g.grade : '—'; }); return r; });
    const aq = data('air_quality').filter(r => r.county === 'Alameda').sort((a, b) => a.year - b.year);
    const aqLast = aq[aq.length - 1] || {}, aqPrev = aq[aq.length - 2] || {};
    const cov = ['employer_coverage_share', 'medicaid_share_fremont', 'medicare_share', 'direct_purchase_share'].map(id => row('health_access', id)).filter(Boolean);
    return [
      {
        title: 'Coverage',
        cards: [
          { ds: 'census_profile', id: 'uninsured', label: 'Residents under 65 without health insurance', icon: 'heart', color: 1 },
          { ds: 'health_access', id: 'employer_coverage_share', label: 'Residents covered through an employer', icon: 'briefcase', color: 2 },
          { ds: 'health_access', id: 'medicaid_share_fremont', label: 'Residents on Medi-Cal or other public coverage', icon: 'users', color: 3 },
          { ds: 'health_access', id: 'medicare_share', label: 'Residents with Medicare', icon: 'users', color: 4 },
        ],
        charts: [{
          type: 'hbar', format: 'pct1', uses: ['health_access'],
          title: 'How Fremont residents are covered', sub: 'Share of all residents, 2024; people can hold more than one type',
          build: () => ({ labels: cov.map(r => r.label.replace('Fremont residents with ', '').replace(/^./, c => c.toUpperCase()).replace(' (incl. Covered California)', '')), datasets: [{ label: 'Share of residents', data: cov.map(r => r.value), _color: 1 }], urls: cov.map(r => r.source_url) }),
          links: cov.map(r => FBN.linkFor('health_access', r)),
          source: 'Census ACS 2024 one-year estimates, tables C27004–C27007, Fremont city.'
        }]
      },
      {
        title: 'The hospitals',
        sub: 'Washington Hospital is run by a public health-care district; Kaiser Permanente Fremont Medical Center serves Kaiser members. Fremont Hospital is a private psychiatric hospital.',
        cards: [
          { ds: 'health_access', id: 'wh_cms_star', label: 'Washington Hospital, Medicare overall star rating (of 5)', icon: 'star', color: 1 },
          { ds: 'health_access', id: 'kp_cms_star', label: 'Kaiser Fremont, Medicare overall star rating (of 5)', icon: 'star', color: 2 },
          { ds: 'health_access', id: 'wh_leapfrog', label: 'Washington Hospital, Leapfrog safety grade', icon: 'award', color: 1 },
          { ds: 'health_access', id: 'kp_leapfrog', label: 'Kaiser Fremont, Leapfrog safety grade', icon: 'award', color: 2 },
          { ds: 'health_access', id: 'wh_ed_median_minutes', label: 'Washington Hospital ER, median minutes from arrival to leaving (patients sent home)', icon: 'clock', color: 4 },
          { ds: 'health_access', id: 'wh_er_visits_fy26', label: 'Washington Hospital ER visits in a year', icon: 'plus', color: 3 },
          { ds: 'living_facts', id: 'hosp_washington', label: 'Washington Hospital, licensed beds', icon: 'bed', color: 1 },
          { ds: 'living_facts', id: 'hosp_kaiser', label: 'Kaiser Fremont, licensed beds', icon: 'bed', color: 2 },
          { ds: 'living_facts', id: 'hosp_fremont', label: 'Fremont Hospital (psychiatric), licensed beds', icon: 'bed', color: 5 }
        ],
        tables: [{
          title: 'Leapfrog Hospital Safety Grade, by cycle', sub: 'A is best', navy: true, uses: ['leapfrog_grades'],
          rows: () => gradeRows,
          columns: [{ key: 'cycle', label: 'Cycle' }].concat(hospitals.map(h => ({ key: h, label: h }))),
          source: 'The Leapfrog Group, hospital pages. Washington Hospital’s Spring 2026 A is its first in the period shown.'
        }],
        facts: [{ ds: 'health_access', title: 'Hospital figures, in detail', group: 'Hospitals' }],
        notes: ['Kaiser Fremont reports no ER timeliness or visit counts to the public datasets used here; its volumes are not published anywhere reachable.']
      },
      {
        title: 'Clinics and urgent care',
        cards: [
          { ds: 'health_access', id: 'bach_fremont_sites', label: 'Bay Area Community Health clinic sites in Fremont', icon: 'plus', color: 4, note: 'The community health center formerly called Tri-City Health Center.' }
        ],
        facts: [{ ds: 'health_access', title: 'Clinics and urgent care', group: 'Clinics' }],
      },
      {
        title: 'Nursing homes',
        sub: 'Every Medicare- or Medicaid-certified nursing home in Fremont, with its Care Compare star ratings.',
        cards: [
          { ds: 'nursing_homes', url: nhUrl, urlName: nhUrlName, label: 'Certified nursing homes in Fremont', value: nh.length, format: 'int', icon: 'bed', color: 1, meta: 'CMS data of ' + nhDate + ' · Medicare Care Compare' },
          { ds: 'nursing_homes', url: nhUrl, urlName: nhUrlName, label: 'Certified beds', value: nhBeds, format: 'int', icon: 'bed', color: 2, meta: 'CMS data of ' + nhDate + ' · Medicare Care Compare', note: FBN.fmt(nhRes, 'int') + ' residents on an average day.' },
          { ds: 'nursing_homes', url: nhUrl, urlName: nhUrlName, label: 'Rated 4 or 5 stars overall', value: nh.filter(r => r.overall >= 4).length, format: 'int', icon: 'star', color: 4, meta: 'CMS data of ' + nhDate + ' · Medicare Care Compare', note: 'Of ' + nh.length + '. Ratings run from 1 to 5; 5 is best.' }
        ],
        tables: [{
          ds: 'nursing_homes', title: 'Nursing homes and their ratings', sub: 'Stars out of 5; each row opens the facility’s Care Compare page', phone: [0, 2, 6],
          columns: [{ key: 'name', label: 'Facility' }, { key: 'beds', label: 'Beds', format: 'int' }, { key: 'overall', label: 'Overall', format: 'int' }, { key: 'inspection', label: 'Inspections', format: 'int' }, { key: 'staffing', label: 'Staffing', format: 'int' }, { key: 'quality', label: 'Quality', format: 'int' }, { key: 'fines_usd', label: 'Fines', format: 'usd' }],
          source: 'Medicare Care Compare, Provider Information dataset (data.cms.gov). Fines are the total CMS lists for the facility. The two Crestwood facilities accept Medicaid only.'
        }]
      },
      {
        title: 'How healthy are Fremont adults?',
        sub: 'CDC PLACES estimates for the city, mostly from the 2023 Behavioral Risk Factor Surveillance System.',
        cards: [
          { ds: 'health_places', id: 'CHECKUP', label: 'Adults with a routine checkup in the past year', format: 'pct', icon: 'check', color: 1 },
          { ds: 'city_rankings', id: 'healthiest', label: 'Healthiest Cities rank (WalletHub)', value: healthiest.rank, format: 'rank', icon: 'star', color: 4, meta: 'of ' + healthiest.of + ' cities · ' + healthiest.published }
        ],
        charts: [{
          ds: 'health_places', type: 'hbar', x: 'measure', format: 'pct1', sort: (a, b) => a.order - b.order,
          title: 'Share of adults, by measure', size: 'tall',
          series: [{ key: 'value', label: 'Fremont adults' }],
          source: 'CDC PLACES 2025 release (place-level model estimates; 95% ranges are in the dataset). These are modeled estimates, not counts, and no California or U.S. comparison figures are included.'
        }],
      },
      {
        title: 'Environment',
        sub: 'Air quality as measured by the EPA’s monitors. Fremont is in Alameda County; Santa Clara County, just south, is shown for comparison.',
        cards: aqLast.year ? [
          { ds: 'air_quality', label: 'Days with good air, Alameda County, ' + aqLast.year, value: aqLast.good, format: 'int', icon: 'leaf', color: 3, meta: aqLast.year + ' · EPA AirData', note: 'Out of ' + FBN.fmt(aqLast.days, 'int') + ' days measured; ' + FBN.fmt(aqLast.moderate, 'int') + ' were moderate.' },
          { ds: 'air_quality', label: 'Days unhealthy for sensitive groups, Alameda County, ' + aqLast.year, value: aqLast.usg, format: 'int', icon: 'warn', color: 2, meta: aqLast.year + ' · EPA AirData', note: (aqPrev.year ? FBN.fmt(aqPrev.usg, 'int') + ' in ' + aqPrev.year + '. ' : '') + (aqLast.unhealthy ? FBN.fmt(aqLast.unhealthy, 'int') + ' days were unhealthy for everyone.' : 'No days were unhealthy for everyone.') },
          { ds: 'air_quality', label: 'Typical (median) daily air-quality index, Alameda County, ' + aqLast.year, value: aqLast.median_aqi, format: 'int', icon: 'chart', color: 1, meta: aqLast.year + ' · EPA AirData', note: '0–50 is good and 51–100 moderate. The worst day reached ' + FBN.fmt(aqLast.max_aqi, 'int') + '.' }
        ] : [],
        charts: [{
          ds: 'air_quality', type: 'bar', x: r => r.county + ' ' + r.year, format: 'int', stacked: true,
          sort: (a, b) => (a.county === b.county ? a.year - b.year : (a.county === 'Alameda' ? -1 : 1)),
          title: 'Days by air quality', sub: 'Alameda and Santa Clara counties, by year',
          series: [{ key: 'good', label: 'Good', color: 3 }, { key: 'moderate', label: 'Moderate', color: 4 }, { key: 'usg', label: 'Unhealthy for sensitive groups', color: 2 }],
          source: 'U.S. EPA AirData, annual AQI by county (pre-generated files). The 2025 file does not yet include Alameda, Santa Clara or other Bay Area counties, so 2024 is the latest year shown.'
        }],
        facts: [{ ds: 'living_facts', title: 'Hazards', group: 'Hazards' }]
      }
    ];
  }
});
