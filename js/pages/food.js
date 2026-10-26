/* Food: grocery and restaurant costs, how they're changing, and the local food economy. */
FBN.page({
  key: 'food',
  title: 'Food',
  lede: 'What groceries and eating out cost in and around Fremont, how fast those prices are rising, and the size of the local food scene.',
  uses: ['food_prices', 'food_cpi', 'business', 'retail_mix', 'living_facts'],
  sections: function (data, row) {
    const monthly = v => v == null ? null : Math.round(v / 12);
    const mit1 = row('food_prices', 'mit_food_1adult') || {};
    const mit4 = row('food_prices', 'mit_food_2adults_2kids') || {};
    return [
      {
        title: 'What food costs',
        cards: [
          { ds: 'food_prices', id: 'mit_food_2adults_2kids', label: 'Living-wage food budget, two adults and two kids, per month', value: monthly(mit4.value), format: 'usd', icon: 'cart', color: 1, meta: '2026 · MIT Living Wage Calculator, Alameda County (annual figure ÷ 12)' },
          { ds: 'food_prices', id: 'mit_food_1adult', label: 'Living-wage food budget, one adult, per month', value: monthly(mit1.value), format: 'usd', icon: 'cart', color: 1, meta: '2026 · MIT Living Wage Calculator, Alameda County (annual figure ÷ 12)' },
        ],
        notes: ['!No agency publishes Fremont-only food prices. The budgets above are Alameda County living-wage estimates from MIT, and the price changes below cover the San Francisco–Oakland–Hayward area, which includes Fremont.']
      },
      {
        title: 'How fast food prices are rising',
        sub: 'Consumer Price Index for the San Francisco–Oakland–Hayward area, which includes Fremont.',
        cards: [
          { ds: 'food_prices', id: 'cpi_food_at_home_yoy', label: 'Grocery prices, change over the past year', icon: 'trend', color: 1 },
          { ds: 'food_prices', id: 'cpi_food_away_yoy', label: 'Restaurant prices, change over the past year', icon: 'trend', color: 2 },
          { ds: 'food_prices', id: 'cpi_all_food_yoy', label: 'All food, change over the past year', icon: 'trend', color: 3 }
        ],
        charts: [{
          ds: 'food_cpi', type: 'line', x: r => r.month + ' ' + r.year, format: 'pct1', zero: false,
          title: 'Food price inflation, year over year', sub: 'Each August, 2018–2026',
          series: [{ key: 'food_at_home_yoy_pct', label: 'Groceries' }, { key: 'food_away_yoy_pct', label: 'Restaurants', color: 2 }, { key: 'all_items_yoy_pct', label: 'All items', color: '--axis', dashed: true }],
          url: 'https://www.bls.gov/regions/west/news-release/consumerpriceindex_sanfrancisco.htm', urlName: 'BLS: Consumer Price Index, San Francisco area',
          source: 'BLS Consumer Price Index news releases, San Francisco–Oakland–Hayward (CPI-U). Of the eight Augusts shown, grocery inflation was highest in August 2022, at 11.6%.'
        }, {
          ds: 'food_cpi', type: 'line', x: r => r.month + ' ' + r.year, format: 'dec1', zero: false,
          title: 'Price index levels', sub: '1982–84 = 100',
          series: [{ key: 'food_at_home_index', label: 'Groceries' }, { key: 'food_away_index', label: 'Restaurants', color: 2 }],
          url: 'https://www.bls.gov/regions/west/news-release/consumerpriceindex_sanfrancisco.htm', urlName: 'BLS: Consumer Price Index, San Francisco area',
          source: 'BLS, same series. From August 2018 to August 2026 the restaurant index rose 46% and the grocery index 40%.'
        }]
      },
      {
        title: 'Grocery budgets in detail',
        facts: [{ ds: 'food_prices', title: 'Grocery costs and budgets', group: 'Groceries' }]
      },
      {
        title: 'Eating out',
        cards: [
          { ds: 'food_prices', id: 'restaurants_fremont', label: 'Restaurants and other eating places in Fremont', icon: 'fork', color: 1 },
          { ds: 'food_prices', id: 'full_service_restaurants_fremont', label: 'Full-service (sit-down) restaurants', icon: 'fork', color: 2 },
          { ds: 'food_prices', id: 'limited_service_restaurants_fremont', label: 'Counter and fast-food restaurants', icon: 'fork', color: 3 },
          { ds: 'food_prices', id: 'restaurant_sales_fremont', label: 'Restaurant and bar sales per year', icon: 'dollar', color: 4 },
        ],
        facts: [{ ds: 'food_prices', title: 'Eating out, in detail', group: 'Eating out' }]
      },
      {
        title: 'Where to shop',
        cards: [
          { ds: 'food_prices', id: 'supermarkets_fremont', label: 'Supermarkets and grocery stores', icon: 'cart', color: 1 },
          { ds: 'food_prices', id: 'specialty_food_stores_fremont', label: 'Specialty food stores (meat, produce, other)', icon: 'cart', color: 2 },
          { ds: 'food_prices', id: 'farmers_markets_fremont', label: 'Certified farmers’ markets', icon: 'leaf', color: 3, note: 'Niles (Saturday), Irvington (Sunday) and Kaiser (Thursday), year-round.' },
          { ds: 'food_prices', id: 'grocery_sales_fremont', label: 'Grocery sales per year', icon: 'dollar', color: 4 }
        ],
        charts: [{
          ds: 'retail_mix', type: 'hbar', x: 'category', format: 'int', sort: 'stores',
          title: 'Stores in Fremont by type', sub: 'Retail establishments, 2022',
          series: [{ key: 'stores', label: 'Stores' }],
          source: 'Census 2022 Economic Census, retail trade, city of Fremont (437 stores in all).'
        }],
        facts: [{ ds: 'food_prices', title: 'Food assistance', group: 'Food assistance' }],
        notes: ['Store and restaurant counts are from the 2022 Economic Census (city of Fremont); the count of business establishments on the Jobs page is from 2023 County Business Patterns (Fremont ZIP codes). A Bay Area price survey found a 150-item basket costs about 49% more at Safeway than at WinCo (Consumers’ Checkbook, 2025).']
      }
    ];
  }
});
