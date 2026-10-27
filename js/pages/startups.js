/* Startup Ecosystem: companies, funding, the manufacturing base, patents and rankings. */
FBN.page({
  key: 'startups',
  title: 'Startup Ecosystem',
  lede: 'Fremont is the Bay Area’s manufacturing capital and home to a cluster of hardware, clean-energy and biotech companies. Here is what can be counted, and who is doing the counting.',
  uses: ['startups', 'startup_rounds', 'jobs_more', 'resident_industries', 'vacancy', 'business'],
  sections: function (data, row) {
    const mfg = row('resident_industries', 'Manufacturing', 'industry') || {};
    const rank = row('startups', 'wallethub_start_business_rank_2026') || {};
    return [
      {
        title: 'Headline numbers',
        cards: [
          { ds: 'startups', id: 'crunchbase_fremont_orgs', label: 'Companies headquartered in Fremont (Crunchbase)', icon: 'rocket', color: 1 },
          { ds: 'startups', id: 'crunchbase_fremont_total_funding', label: 'All-time funding raised by Fremont companies (Crunchbase)', icon: 'dollar', color: 1 },
          { ds: 'startups', id: 'fremont_tech_firms_city', label: 'High-tech, life-science and clean-tech firms (City of Fremont)', icon: 'bolt', color: 3 },
          { ds: 'startups', id: 'fremont_manufacturers_city', label: 'Advanced manufacturing companies (City of Fremont)', icon: 'factory', color: 3 },
          { ds: 'startups', id: 'fremont_patent_holders_per_100', label: 'Residents holding a patent, per 100 (City of Fremont)', icon: 'award', color: 4 }
        ],
        notes: ['!Startup counts depend on who is counting. Crunchbase lists every organization with a Fremont headquarters; narrower directories count about 80 to 150 startups. City of Fremont figures are its own economic-development claims, captured as stated. No free source publishes a per-year total of venture funding for Fremont.']
      },
      {
        title: 'How many startups, by source',
        charts: [{
          ds: 'startups', type: 'hbar', x: r => r.label.replace(/ \(.*\)$/, ''), format: 'int',
          filter: r => r.group === 'How many companies' && r.format === 'int' && r.value < 10000, sort: 'value',
          title: 'Fremont startups counted by different directories', sub: 'Each uses its own definition', size: 'tall',
          series: [{ key: 'value', label: 'Companies' }],
          source: 'Crunchbase and VCBacked.co, read Oct 24, 2026. Both are crowdsourced directories.'
        }],
        facts: [{ ds: 'startups', title: 'Company counts, in detail', group: 'How many companies' }]
      },
      {
        title: 'Big rounds, unicorns and IPOs',
        cards: [
          { ds: 'startups', id: 'fremont_unicorn_weee_valuation', label: 'Weee! valuation at its Series E, Fremont’s clearest unicorn', icon: 'cart', color: 1 },
          { ds: 'startups', id: 'alamar_ipo_2026', label: 'Alamar Biosciences IPO, April 2026', icon: 'trend', color: 2 },
          { ds: 'startups', id: 'ultima_genomics_raise_2022', label: 'Ultima Genomics, raised at launch (2022)', icon: 'dollar', color: 3 },
          { ds: 'startups', id: 'tandem_pv_factory_mw', label: 'Tandem PV solar factory, megawatts per year (opened 2026)', icon: 'sun', color: 4 }
        ],
        tables: [{
          ds: 'startup_rounds', title: 'Largest recent funding rounds and IPOs by Fremont-linked companies', phoneCards: true, sub: '2022–2026; not exhaustive; see the “Fremont link” column', navy: true, sort: 'amount_usd', rowArrow: false,
          columns: [{ key: 'company', label: 'Company' }, { key: 'what', label: 'What it does' }, { key: 'amount_usd', label: 'Amount', format: 'usdc' }, { key: 'round', label: 'Round' }, { key: 'date', label: 'Date' }, { key: 'hq', label: 'Fremont link', cardWide: true }, { key: r => '<a href="' + FBN.esc(r.source_url) + '" target="_blank" rel="noopener noreferrer">' + FBN.esc(r.source) + '</a>', label: 'Source', html: true, num: false, cardWide: true }],
          source: 'Compiled from company press releases, SEC filings and news reports; each row cites its own. Neuralink and Pony.ai have contested or dual headquarters, Nitricity has an office in Fremont, and Tandem PV’s press release is datelined San Jose (its factory is in Fremont).'
        }],
        facts: [{ ds: 'startups', title: 'Unicorns and IPOs', group: 'Unicorns and IPOs' }]
      },
      {
        title: 'The manufacturing base',
        cards: [
          { ds: 'startups', id: 'fremont_manufacturing_jobs_city', label: 'Manufacturing jobs in Fremont (City economic development)', icon: 'factory', color: 1 },
          { ds: 'resident_industries', id: 'Manufacturing', key: 'industry', label: 'Residents who work in manufacturing', value: mfg.share_pct, format: 'pct', icon: 'users', color: 2, meta: '2020–2024 · Census ACS' },
          { ds: 'jobs_more', id: 'tesla_fremont_largest_employer', label: 'Employees at Tesla’s Fremont factory', icon: 'factory', color: 3, link: true },
          { ds: 'startups', id: 'fremont_industrial_sqft', label: 'Square feet of industrial space (City of Fremont)', icon: 'building', color: 5 },
          { ds: 'startups', id: 'fremont_small_businesses_city', label: 'Small businesses (City of Fremont)', icon: 'briefcase', color: 1 }
        ],
        facts: [{ ds: 'startups', title: 'Places to build: Warm Springs and Ardenwood', group: 'Infrastructure' }],
        tables: [{
          ds: 'vacancy', title: 'Industrial, R&D and office space', sub: 'Inventory and vacancy, Q3 2026',
          columns: [{ key: 'market', label: 'Market' }, { key: 'inventory_sf', label: 'Square feet', format: 'int' }, { key: 'total_vacancy', label: 'Total vacancy', format: 'pct1' }],
          source: 'Kidder Mathews quarterly reports. The industrial figure covers the Fremont/Newark submarket, so it includes Newark. Industrial space and R&amp;D space are each several times the size of the office market. The City’s own figure for industrial space in Fremont is 50 million square feet.'
        }]
      },
      {
        title: 'Patents and rankings',
        cards: [
          { ds: 'startups', id: 'wallethub_start_business_rank_2026', label: 'WalletHub Best Large Cities to Start a Business', value: rank.value, format: 'rank', icon: 'star', color: 4, meta: 'of 100 cities · 2026 · Business costs ranked 95th' },
          { ds: 'startups', id: 'nerdwallet_start_business_norcal', label: 'NerdWallet rank for starting a business in Northern California (cited by the City, undated)', format: 'rank', icon: 'star', color: 4 }
        ],
        facts: [{ ds: 'startups', title: 'Patents', group: 'Patents' }, { ds: 'startups', title: 'Rankings', group: 'Rankings' }],
        notes: ['USPTO patent counts for Fremont are not included yet.']
      }
    ];
  }
});
