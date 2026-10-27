/* Rent & Housing: rents, home prices, housing stock and production, utilities and taxes. */
FBN.page({
  key: 'rent',
  title: 'Rent & Housing',
  lede: 'What it costs to rent or buy in Fremont, how the market is moving, and what the monthly bills look like once you move in.',
  sections: function (data, row) {
    const redfin = row('redfin_market', 'Fremont', 'geo') || {};
    return [
      {
        title: 'Headline numbers',
        cards: [
          { ds: 'zillow_market', id: 'zori', label: 'Typical asking rent (Zillow ZORI)', icon: 'key', color: 1, deltaKey: 'yoy_pct', deltaGood: 'down' },
          { ds: 'census_profile', id: 'med_rent', label: 'Median gross rent, all renters (Census ACS)', icon: 'key', color: 1 },
          { ds: 'zillow_market', id: 'zhvi', label: 'Typical home value (Zillow ZHVI)', icon: 'home', color: 2, deltaKey: 'yoy_pct' },
          { ds: 'redfin_market', id: 'Fremont', key: 'geo', label: 'Median sale price (Redfin)', value: redfin.median_sale_price, format: 'usd', icon: 'home', color: 2, meta: redfin.period + ' · Redfin', note: redfin.yoy_price_pct !== undefined ? (redfin.yoy_price_pct > 0 ? '+' : '') + redfin.yoy_price_pct + '% vs a year ago' : '' },
          { ds: 'people_more', id: 'rent_burden', label: 'Renters paying 30%+ of income on rent', icon: 'users', color: 4, showNote: true }
        ],
        notes: ['Zillow figures are modeled indexes of the middle tier of homes and rentals; Census figures are survey medians across everyone who already lives here, so they run lower than asking rents.']
      },
      {
        title: 'Rent by bedroom',
        sub: 'What Fremont renters pay, and what HUD considers a fair-market rent for the Oakland–Fremont area.',
        charts: [{
          ds: 'rent_by_bedroom', type: 'bar', x: 'bedrooms', format: 'usd',
          title: 'Monthly rent by bedroom count', sub: 'Census median gross rent (2020–2024) vs HUD Fair Market Rent (FY 2026)',
          series: [{ key: 'acs_2020_2024', label: 'Census median, 2020–2024' }, { key: 'hud_fmr_fy2026', label: 'HUD fair market rent, FY 2026' }],
          links: [FBN.linkFor('rent_by_bedroom', null), { url: 'https://www.huduser.gov/portal/datasets/fmr/fmrs/FY2026_code/2026summary.odn?fmrtype=Final&selection_type=hmfa&cbsasub=METRO41860MM5775', name: 'HUD: FY 2026 Fair Market Rents' }],
          source: 'Census ACS table B25031 (Fremont city) and HUD FY 2026 Fair Market Rents, Oakland–Fremont HUD Metro FMR Area. Census medians for 3- and 4-bedroom homes are capped at $3,501 (“top-coded”), so the true figures are higher.'
        }, {
          ds: 'rent_by_bedroom', type: 'bar', x: 'bedrooms', format: 'usd',
          title: 'Median rent in two Census survey periods', sub: 'Census median gross rent, 2015–2019 vs 2020–2024 (not adjusted to a common year’s dollars)',
          series: [{ key: 'acs_2015_2019', label: '2015–2019', color: 3 }, { key: 'acs_2020_2024', label: '2020–2024', color: 1 }],
          source: 'Census ACS table B25031, 5-year estimates. Each period is stated in its own final year’s dollars, so the gap mixes rent growth with inflation.'
        }]
      },
      {
        title: 'How the market has moved',
        charts: [{
          ds: 'zillow_history', type: 'line', x: r => { const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+r.month.slice(5, 7) - 1]; return m + ' ' + r.month.slice(0, 4); }, format: 'usd', zero: false,
          title: 'Typical home value since 2015', sub: 'Zillow Home Value Index, monthly',
          series: [{ key: 'zhvi', label: 'Typical home value' }],
          source: 'Zillow Research, ZHVI (mid-tier, smoothed, seasonally adjusted), city of Fremont, through Sep 2026.'
        }, {
          ds: 'zillow_history', type: 'line', x: r => { const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+r.month.slice(5, 7) - 1]; return m + ' ' + r.month.slice(0, 4); }, format: 'usd', zero: false,
          title: 'Typical asking rent since 2015', sub: 'Zillow Observed Rent Index, monthly',
          series: [{ key: 'zori', label: 'Typical asking rent', color: 2 }],
          source: 'Zillow Research, ZORI (smoothed), city of Fremont, through Sep 2026.'
        }]
      },
      {
        title: 'Buying: the current market',
        tables: [{
          ds: 'redfin_market', title: 'Sale prices by ZIP code', phoneCards: true, sub: 'Redfin, latest month available',
          columns: [
            { key: 'geo', label: 'Area' }, { key: 'period', label: 'Month' },
            { key: 'median_sale_price', label: 'Median sale price', format: 'usd' },
            { key: 'yoy_price_pct', label: 'Change, 1 yr', format: 'pct1' },
            { key: 'median_ppsf', label: 'Price per sq ft', format: 'usd' },
            { key: 'homes_sold', label: 'Homes sold', format: 'int' },
            { key: 'median_dom', label: 'Days on market', format: 'int' }
          ],
          highlight: r => r.geo === 'Fremont',
          source: 'Redfin housing-market pages for Fremont and ZIPs 94536, 94538, 94539 and 94555. 94539 (Mission San Jose) is the most expensive part of the city.'
        }],
        facts: [{
          ds: 'zillow_market', title: 'Listings and sales measures', sub: 'Zillow Research, city of Fremont',
          ids: ['inventory', 'new_listings', 'days_pending', 'sale_to_list', 'over_list']
        }]
      },
      {
        title: 'Housing stock',
        cards: [
          { ds: 'people_more', id: 'housing_units', icon: 'building', color: 1 },
          { ds: 'census_profile', id: 'owner_rate', label: 'Homes that are owner-occupied', icon: 'home', color: 2 },
          { ds: 'people_more', id: 'year_built', label: 'Median year homes were built', icon: 'calendar', color: 3 },
          { ds: 'people_more', id: 'rental_vacancy', icon: 'key', color: 4 },
          { ds: 'census_profile', id: 'owner_cost', label: 'Median monthly owner costs, with a mortgage', icon: 'dollar', color: 5 },
          { ds: 'civic_facts', id: 'affordable_units', label: 'Regulated affordable rental homes', icon: 'users', color: 1 }
        ],
        notes: ['Census figures are 2020–2024 five-year survey estimates for the city of Fremont. The owner-cost figure is capped at $4,000 in the survey, so the real median is higher.']
      },
      {
        title: 'Building more homes',
        sub: 'Fremont’s state housing target for 2023–2031 and how far along it is.',
        cards: [
          { ds: 'housing_production', id: 'permits_2025', label: 'Homes permitted in 2025', format: 'int', icon: 'building', color: 1 },
          { ds: 'housing_production', id: 'adus_2025', label: 'Of which backyard units (ADUs)', format: 'int', icon: 'home', color: 2 },
          { ds: 'housing_production', id: 'rhna_total', label: 'State target for 2023–2031 (RHNA)', format: 'int', icon: 'map', color: 3 },
          { ds: 'housing_production', id: 'rhna_remaining', label: 'Still to permit after 2025', format: 'int', icon: 'clock', color: 4 },
          { ds: 'housing_production', id: 'affordable_pipeline', label: 'Affordable homes about to start construction', format: 'int', icon: 'users', color: 5 }
        ],
        charts: [{
          ds: 'rhna_by_income', type: 'hbar', x: 'category', format: 'int', stacked: true,
          title: 'Progress toward the 2023–2031 housing target, by income level', sub: 'Permitted so far vs still remaining',
          series: [{ key: 'to_date', label: 'Permitted 2023–2025', color: 1 }, { key: 'remaining', label: 'Remaining', color: '--axis' }],
          source: 'City of Fremont 2025 Housing Element Annual Progress Report (Planning Commission staff report, Feb 26, 2026).'
        }]
      },
      {
        title: 'Utilities and taxes',
        sub: 'The regular bills on top of rent or a mortgage.',
        cards: [
          { ds: 'family_costs', id: 'elec_bill', label: 'Average monthly electric bill, Ava Bright Choice (338 kWh)', icon: 'bolt', color: 4, note: 'Fremont’s default plan, Renewable 100, costs about 1.75 cents per kWh more.' },
          { ds: 'utilities', id: 'pge_gas_avg_bill', label: 'Average monthly gas bill (31 therms, PG&E territory)', icon: 'flame', color: 2 },
          { ds: 'living_facts', id: 'water_bill', label: 'Typical home water bill, every two months', icon: 'water', color: 1 },
          { ds: 'living_facts', id: 'sewer', label: 'Sewer charge per home, per year', icon: 'water', color: 1 },
          { ds: 'living_facts', id: 'garbage', label: 'Garbage, 32-gallon cart, per month', icon: 'trash', color: 3 },
          { ds: 'living_facts', id: 'sales_tax', label: 'Sales tax rate', icon: 'percent', color: 2 },
          { ds: 'living_facts', id: 'prop_tax', label: 'Property tax base rate (plus voter-approved bonds)', icon: 'percent', color: 2 }
        ],
        facts: [{
          ds: 'family_costs', title: 'Electricity and water, in detail', ids: ['elec_rate', 'elec_bill', 'water_gpcd']
        }, {
          ds: 'utilities', title: 'Natural gas and the Ava discount', ids: ['pge_gas_rate_per_therm', 'pge_gas_avg_bill', 'ava_bright_choice_discount']
        }, {
          ds: 'living_facts', title: 'Energy accounts in Fremont', group: 'Energy', sub: 'Ava Community Energy is the default electricity provider; PG&E delivers it.'
        }],
        notes: ['Electricity is sold by Ava Community Energy (the East Bay’s public power agency) and delivered by PG&E. Water comes from Alameda County Water District; sewer service from Union Sanitary District; garbage from Republic Services under the city contract.']
      },
      {
        title: 'Internet',
        sub: 'Who serves Fremont and what the advertised prices are.',
        cards: [
          { ds: 'utilities', id: 'att_fiber_300_price', label: 'AT&T Fiber, 300 Mbps, per month', icon: 'wifi', color: 1 },
          { ds: 'utilities', id: 'att_fiber_gig_price', label: 'AT&T Fiber, 1 Gig, per month', icon: 'wifi', color: 1 },
          { ds: 'utilities', id: 'xfinity_base_price', label: 'Xfinity, 300 Mbps, promotional price per month', icon: 'wifi', color: 2, note: 'Everyday price is higher once the promotion ends.' },
          { ds: 'utilities', id: 'tmobile_home_internet_price', label: 'T-Mobile 5G Home Internet, base tier', icon: 'wifi', color: 3 },
          { ds: 'utilities', id: 'att_fiber_coverage', label: 'Fremont addresses that can get AT&T Fiber', icon: 'map', color: 4 },
          { ds: 'census_profile', id: 'broadband', label: 'Households with a broadband subscription', icon: 'users', color: 5 }
        ],
        facts: [{ ds: 'utilities', title: 'Internet providers and prices, in detail', group: 'Internet' }],
        notes: ['!Promotional prices change often and usually require autopay; check the provider for your address. Fiber availability differs by source (26% to 76% of addresses). Sonic does not appear to serve Fremont.']
      },
      {
        title: 'Child care',
        sub: 'County-wide figures; Fremont-specific prices are not published.',
        facts: [{ ds: 'family_costs', title: 'Child care costs, Alameda County', group: 'Child care (Alameda County)' }]
      }
    ];
  }
});
