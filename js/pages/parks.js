/* Parks, Recreation & Events. Event and facility research is merged in as it lands. */
FBN.page({
  key: 'parks',
  title: 'Parks, Recreation & Events',
  lede: 'Fremont’s parks, open space, weather for being outdoors, and the events that fill the calendar.',
  uses: ['parks_summary', 'city_parks', 'regional_parks', 'city_rankings', 'climate_normals', 'living_facts', 'events', 'drought_years'],
  sections: function (data, row) {
    const dr = data('drought_years');
    const dNow = dr.find(r => r.latest_week) || {};
    const dFull = dr.filter(r => r.status === 'Full year');
    const dLast = dFull[dFull.length - 1] || {};
    const s = [];
    const parkscore = row('city_rankings', 'parkscore') || {};
    s.push({
      title: 'Parks at a glance',
      cards: [
        { ds: 'parks_summary', id: 'city_parks', label: 'City parks', icon: 'tree', color: 3 },
        { ds: 'parks_summary', id: 'city_acres', label: 'Acres of city parkland', icon: 'map', color: 3 },
        { ds: 'parks_summary', id: 'all_parkland', label: 'Acres of parkland, all agencies', icon: 'map', color: 1, note: 'Includes regional parks and the Don Edwards wildlife refuge.' },
        { ds: 'parks_summary', id: 'parkland_share', label: 'Share of the city that is parkland', icon: 'percent', color: 1, note: 'National median for big cities: 15%.' },
        { ds: 'parks_summary', id: 'walk_share', label: 'Residents within a 10-minute walk of a park', icon: 'users', color: 2 },
        { ds: 'city_rankings', id: 'parkscore', label: 'ParkScore rank among the 100 largest U.S. cities', value: parkscore.rank, format: 'rank', icon: 'star', color: 4, meta: parkscore.published + ' · Trust for Public Land' }
      ]
    });
    if (data('events').length) {
      s.push({
        title: 'Trails, courts and programs',
        cards: [
          { ds: 'events', id: 'trail_network_miles_all', label: 'Miles of trails in Fremont’s network (City figure)', icon: 'map', color: 3, note: 'The city’s 30-year goal is 140 miles.' },
          { ds: 'events', id: 'city_trail_miles_2022', label: 'Miles of city-owned multi-use trails', icon: 'map', color: 3 },
          { ds: 'events', id: 'pickleball_courts_central_park_knoll', label: 'Dedicated pickleball courts at Central Park Knoll', icon: 'star', color: 2 },
          { ds: 'events', id: 'dog_parks_count', label: 'City off-leash dog parks', icon: 'tree', color: 4 },
          { ds: 'events', id: 'rec_registrants_fy1920', label: 'Recreation program registrants in a year', icon: 'users', color: 1, note: 'Last published figure, pre-pandemic (FY 2019–20).' },
          { ds: 'events', id: 'aqua_adventure_admission', label: 'Aqua Adventure water park, non-resident admission', icon: 'water', color: 1 }
        ],
        facts: [{ ds: 'events', title: 'Mission Peak', group: 'Mission Peak', sub: 'Fremont’s most-hiked landmark' },
                { ds: 'events', title: 'Facilities', group: 'Facilities' }],
        notes: ['The 2022 Parks & Recreation Master Plan publishes needs rather than an inventory of playgrounds, fields and courts, so those counts are not shown. The Mission Peak visitor count is a 2016 figure and later park district reporting suggested visits declined.']
      });
    }
    s.push({
      title: 'The biggest parks',
      tables: [{
        ds: 'city_parks', title: 'Largest city parks', sub: 'By acreage, from the city parks layer', sort: 'acres', limit: 15,
        filter: r => r.status === 'Existing',
        columns: [{ key: 'name', label: 'Park' }, { key: 'type', label: 'Type' }, { key: 'acres', label: 'Acres', format: 'dec1' }],
        source: 'City of Fremont Open Data Hub, Parks layer (65 entries, 1,251 acres); the 2022 Parks &amp; Recreation Master Plan counts 64 parks and 1,224 acres, and gives Central Park as 430 acres against 351 in the layer.'
      }, {
        ds: 'regional_parks', title: 'Regional parks in Fremont', sub: 'East Bay Regional Park District',
        columns: [{ key: 'park', label: 'Park' }, { key: 'acres', label: 'Acres', format: 'int' }, { key: 'note', label: 'Note' }],
        source: 'East Bay Regional Park District park pages. Mission Peak alone is larger than every city park combined.'
      }]
    });
    if (data('events').length) {
      s.push({
        title: 'Annual events',
        sub: 'Signature events with figures from their organizers or the City.',
        cards: [
          { ds: 'events', id: 'festival_of_arts_attendance', label: 'Fremont Festival of the Arts, attendees each year (media figure)', icon: 'star', color: 4, note: 'Held the first weekend of August since 1983; the organizer says only “thousands.”' },
          { ds: 'events', id: 'niles_antique_faire_vendors', label: 'Vendors at the Niles Antique Faire & Flea Market (news report)', icon: 'cart', color: 2, note: 'Last Sunday of August; 61st edition in 2025.' },
        ],
        facts: [{ ds: 'events', title: 'Signature events, in detail', group: 'Signature events', navy: true }],
        notes: ['!Attendance figures for Fremont events come from news coverage, not organizer counts, and several are years old. No attendance is published for the Ardenwood Harvest Festival, Ohlone Days, Lunar New Year or Niles Essanay film events.']
      });
    }
    s.push({
      title: 'Community facilities',
      cards: [
        { ds: 'parks_summary', id: 'libraries', label: 'County library branches in Fremont', icon: 'book', color: 1, note: 'Fremont Main, Centerville and Niles; Irvington closed in 2024.' },
        { ds: 'parks_summary', id: 'community_centers', label: 'City community centers', icon: 'building', color: 2 },
        { ds: 'parks_summary', id: 'age_well', label: 'Age Well (senior) centers', icon: 'users', color: 3 }
      ]
    });
    s.push({
      title: 'Weather for the outdoors',
      sub: 'Thirty-year normals for Fremont: mild, dry summers and wet winters. Plus whether the county is in drought.',
      cards: [
        { ds: 'drought_years', id: dNow.year, key: 'year', label: 'Alameda County drought status this week', value: dNow.latest_worst === 'None' ? 'No drought' : dNow.latest_worst, format: 'text', icon: 'water', color: 1, meta: 'Week of ' + dNow.latest_week + ' · U.S. Drought Monitor', note: FBN.fmt(dNow.latest_none_pct, 'pct') + ' of the county is free of drought and abnormal dryness.' },
        { ds: 'drought_years', id: dLast.year, key: 'year', label: 'Weeks in drought in ' + dLast.year, value: dLast.weeks_d1plus, format: 'int', icon: 'sun', color: 2, meta: dLast.year + ' · U.S. Drought Monitor', note: 'Worst level reached: ' + dLast.worst + '. ' + FBN.fmt(dLast.weeks_d0plus, 'int') + ' weeks were at least abnormally dry.' }
      ],
      charts: [{
        ds: 'drought_years', type: 'bar', x: 'year', format: 'int',
        title: 'Weeks of drought in Alameda County, by year', sub: 'Weeks with any part of the county abnormally dry, and in moderate drought or worse; the last bar is year to date',
        series: [{ key: 'weeks_d0plus', label: 'Abnormally dry or worse (D0+)', color: 4, status: 'status' }, { key: 'weeks_d1plus', label: 'Moderate drought or worse (D1+)', color: 2, status: 'status' }],
        source: 'U.S. Drought Monitor county statistics, produced by the National Drought Mitigation Center with USDA, NOAA and NASA. 2021 reached exceptional drought (D4); the latest week is ' + dNow.latest_week + '.'
      }, {
        ds: 'climate_normals', type: 'line', x: 'month', format: 'int', zero: false,
        title: 'Typical daily high and low temperature (°F)',
        series: [{ key: 'high_f', label: 'Daily high', color: 2 }, { key: 'low_f', label: 'Daily low', color: 1 }],
        source: 'NOAA 1991–2020 climate normals, Fremont station.'
      }, {
        ds: 'climate_normals', type: 'bar', x: 'month', format: 'dec1',
        title: 'Rain by month (inches)',
        series: [{ key: 'precip_in', label: 'Precipitation, inches', color: 1 }],
        source: 'NOAA 1991–2020 climate normals. Almost all rain falls November through April.'
      }]
    });
    return s;
  }
});
