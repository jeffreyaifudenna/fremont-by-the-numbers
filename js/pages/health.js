/* Health Care: hospitals, coverage, providers and population health. */
FBN.page({
  key: 'health',
  title: 'Health Care',
  lede: 'Fremont’s two hospitals and how they rate, who is covered and how, how many doctors there are, and how healthy residents report being.',
  uses: ['living_facts', 'census_profile', 'health_places', 'health_access', 'leapfrog_grades', 'city_rankings'],
  sections: function (data, row) {
    const healthiest = row('city_rankings', 'healthiest') || {};
    const grades = data('leapfrog_grades');
    const cycles = []; grades.forEach(g => { if (!cycles.includes(g.cycle)) cycles.push(g.cycle); });
    const hospitals = []; grades.forEach(g => { if (!hospitals.includes(g.hospital)) hospitals.push(g.hospital); });
    const gradeRows = cycles.map(c => { const r = { cycle: c }; hospitals.forEach(h => { const g = grades.find(x => x.cycle === c && x.hospital === h); r[h] = g ? g.grade : '—'; }); return r; });
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
        title: 'How healthy are Fremont adults?',
        sub: 'CDC PLACES estimates for the city, mostly from the 2023 Behavioral Risk Factor Surveillance System.',
        cards: [
          { ds: 'health_places', id: 'CHECKUP', label: 'Adults with a routine checkup in the past year', icon: 'check', color: 1 },
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
        facts: [{ ds: 'living_facts', title: 'Hazards', group: 'Hazards' }]
      }
    ];
  }
});
