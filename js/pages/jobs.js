/* Jobs: unemployment, income and wages, employers, industries and commuting. */
FBN.page({
  key: 'jobs',
  title: 'Jobs',
  lede: 'What Fremont residents earn, who employs people here, which industries dominate, and how the job market is moving.',
  uses: ['census_profile', 'people_more', 'resident_industries', 'commute_modes', 'vacancy', 'business', 'jobs_more', 'employers'],
  sections: function (data, row) {
    return [
      {
        title: 'Headline numbers',
        cards: [
          { ds: 'jobs_more', id: 'fremont_unemployment_rate_latest', label: 'Fremont unemployment rate', icon: 'percent', color: 2, note: 'A year earlier: ' + FBN.fmt((row('jobs_more', 'fremont_unemployment_rate_year_ago') || {}).value, 'pct1') + '. Not seasonally adjusted.' },
          { ds: 'census_profile', id: 'mhi', label: 'Median household income', icon: 'dollar', color: 1 },
          { ds: 'census_profile', id: 'pci', label: 'Income per person', icon: 'dollar', color: 1 },
          { ds: 'jobs_more', id: 'fremont_minimum_wage_2026', label: 'Fremont minimum wage, per hour', icon: 'dollar', color: 3, note: 'California: ' + FBN.fmt((row('jobs_more', 'california_minimum_wage_2026') || {}).value, 'usd2') + '. Rises each July 1 with inflation.' },
          { ds: 'census_profile', id: 'lfpr', label: 'Adults in the labor force', icon: 'users', color: 4 },
          { ds: 'people_more', id: 'inc_200k', label: 'Households earning $200,000 or more', icon: 'trend', color: 5 }
        ]
      },
      {
        title: 'Jobs in Fremont vs jobs held by residents',
        sub: 'In the City’s Housing Element, Fremont had about 5% more jobs than employed residents, so on balance it draws in more workers than it sends out.',
        cards: [
          { ds: 'jobs_more', id: 'fremont_jobs_total_lehd', label: 'Jobs located in Fremont (Housing Element)', icon: 'briefcase', color: 1 },
          { ds: 'jobs_more', id: 'fremont_employed_residents_housing_element', label: 'Employed Fremont residents (same table and year)', icon: 'users', color: 2 },
          { ds: 'jobs_more', id: 'fremont_jobs_per_worker_ratio', label: 'Jobs per employed resident (Housing Element)', icon: 'percent', color: 3, note: 'Above 1.0 means a net importer of workers.' },
          { ds: 'jobs_more', id: 'fremont_employed_population_2024', label: 'Employed Fremont residents, 2024 (ACS)', icon: 'users', color: 2, note: 'A newer survey count. Do not compare it with the c. 2018 jobs figure.' },
          { ds: 'people_more', id: 'jobs_located', label: 'Private-sector jobs in Fremont ZIP codes (Census)', icon: 'briefcase', color: 4 },
          { ds: 'jobs_more', id: 'fremont_manufacturing_share_of_jobs', label: 'Fremont jobs related to manufacturing (City of Fremont)', icon: 'factory', color: 5 },
          { ds: 'jobs_more', id: 'fremont_warn_layoffs_2025', label: 'Workers covered by layoff (WARN) notices in 2025', icon: 'trenddown', color: 2 }
        ],
        notes: ['The first three cards come from one table in the City’s 2023–2031 Housing Element, which draws on Census LEHD data from about 2018 (jobs come from administrative records, employed residents from survey data). The 2024 residents count (Census ACS) and the 2023 ZIP-code job count (Census County Business Patterns, which covers a wider area than the city limits) use different methods and are not meant to be compared with them.']
      },
      {
        title: 'Largest employers',
        charts: [{
          ds: 'employers', type: 'hbar', x: 'employer', format: 'int', sort: 'employees', size: 'tall',
          title: 'Fremont’s largest employers', sub: 'Employees, as reported in the City’s FY2025 financial report (ties share a rank)',
          series: [{ key: 'employees', label: 'Employees' }],
          source: 'City of Fremont Annual Comprehensive Financial Report, FY ended June 30, 2025, Schedule 15: Principal Employers (p. 202; the City’s source is its Economic Development Department). Figures are rounded.'
        }],
        tables: [{
          ds: 'employers', title: 'Employers, with sources', phone: [0, 1, 2, 3], sort: (a, b) => a.rank - b.rank,
          columns: [{ key: 'rank', label: '#', format: 'int' }, { key: 'employer', label: 'Employer' }, { key: 'employees', label: 'Employees', format: 'int' }, { key: 'year', label: 'As of' }, { key: 'source', label: 'Source' }]
        }],
        notes: ['The table lists 12 employers because of ties at 8th and 10th place. Compared with FY2024, Tesla is down from 25,000 to 23,000, Lam Research is up from 4,000 to 4,400, and Quanta Computer and Thermo Fisher Scientific are new to the list.']
      },
      {
        title: 'Wages',
        sub: 'What Fremont residents earn, and the minimum wage. Wages by occupation are not published for Fremont alone.',
        cards: [
          { ds: 'jobs_more', id: 'fremont_median_earnings_men', label: 'Median earnings, men working full-time, Fremont', icon: 'dollar', color: 1 },
          { ds: 'jobs_more', id: 'fremont_median_earnings_women', label: 'Median earnings, women working full-time, Fremont', icon: 'dollar', color: 2 },
        ],
        facts: [{ ds: 'jobs_more', title: 'Wages, in detail', group: 'Wages' }]
      },
      {
        title: 'Where Fremont works',
        charts: [{
          ds: 'resident_industries', type: 'hbar', x: 'industry', format: 'pct', sort: 'share_pct',
          title: 'Industries Fremont residents work in', sub: 'Share of employed residents, 2020–2024',
          series: [{ key: 'share_pct', label: 'Share of workers' }],
          source: 'Census ACS table C24050, 2020–2024, top seven industries. Manufacturing is the third-largest, at 16.2% of employed residents.'
        }, {
          ds: 'commute_modes', type: 'hbar', x: 'mode', format: 'pct', sort: 'share_pct',
          title: 'How residents get to work', sub: 'Workers 16 and over, 2020–2024',
          series: [{ key: 'share_pct', label: 'Share of workers' }],
          source: 'Census ACS table DP03. Nearly one in three works from home.'
        }],
        facts: [{ ds: 'jobs_more', title: 'Unemployment, in detail', group: 'Unemployment' }, { ds: 'jobs_more', title: 'Businesses (City of Fremont figures)', group: 'Businesses' }]
      },
      {
        title: 'Workplaces',
        cards: [
          { ds: 'business', id: 'establishments', label: 'Business establishments in Fremont ZIP codes', icon: 'building', color: 1 },
          { ds: 'jobs_more', id: 'fremont_city_center_jobs', label: 'Jobs in the City Center area (City of Fremont)', icon: 'city', color: 2 },
          { ds: 'business', id: 'retail_jobs', label: 'Retail jobs', icon: 'cart', color: 3 },
          { ds: 'business', id: 'food_jobs', label: 'Food-service jobs', icon: 'fork', color: 4 }
        ],
        tables: [{
          ds: 'vacancy', title: 'Commercial space: how much sits empty', phoneCards: true, sub: 'Kidder Mathews, third quarter 2026',
          columns: [{ key: 'market', label: 'Market' }, { key: 'inventory_sf', label: 'Square feet', format: 'int' }, { key: 'total_vacancy', label: 'Total vacancy', format: 'pct1' }, { key: 'direct_vacancy', label: 'Direct vacancy', format: 'pct1' }],
          source: 'Kidder Mathews quarterly market reports (Silicon Valley office and R&amp;D; East Bay industrial, Fremont/Newark submarket). Office vacancy is high; industrial space stays tight.'
        }]
      }
    ];
  }
});
