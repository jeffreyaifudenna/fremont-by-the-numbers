/* Methodology and the full source list. */
FBN.page({
  key: 'sources',
  title: 'About, Sources & Methodology',
  kicker: 'Data aggregator · built using Claude',
  lede: 'Fremont by the Numbers is a data aggregator built using Claude. This page explains what that means, how each number is handled, and lists every page the figures came from.',
  uses: 'all',
  sections: function (data, row) {
    const cat = FBN.catalog() || {};
    const ids = Object.keys(cat).sort((a, b) => cat[a].title.localeCompare(cat[b].title));
    const sources = data('source_list').slice().sort((a, b) => a.publisher.localeCompare(b.publisher) || a.title.localeCompare(b.title));
    const extra = [];
    ids.forEach(id => (FBN.data(id) || []).forEach(r => { if (r && r.source_url && !sources.some(s => s.url === r.source_url) && !extra.some(e => e.url === r.source_url)) extra.push({ publisher: (r.source || '').split(',')[0], title: r.source || r.label, url: r.source_url, supports: r.label }); }));
    extra.sort((a, b) => a.publisher.localeCompare(b.publisher));
    const all = sources.concat(extra);
    const byPub = {};
    all.forEach(s => { (byPub[s.publisher] = byPub[s.publisher] || []).push(s); });
    const pubs = Object.keys(byPub).sort();
    const srcHtml = pubs.map(p => '<h3 style="font-size:16px;margin:18px 0 4px">' + FBN.esc(p) + '</h3><ul class="source-list">' + byPub[p].map(s =>
      '<li><a href="' + FBN.esc(s.url) + '" target="_blank" rel="noopener noreferrer">' + FBN.esc(s.title) + '</a>' + (s.supports ? '<span class="sup">' + FBN.esc(s.supports) + '</span>' : '') + '</li>').join('') + '</ul>').join('');

    return [
      {
        id: 'how',
        html: '<div class="prose">' +
          '<h2>A data aggregator built using Claude</h2>' +
          '<p><strong>Fremont by the Numbers is a data aggregator.</strong> It does not run its own surveys, counts or measurements. It gathers figures that public sources have already published, such as the City of Fremont’s reports and dashboards, the U.S. Census Bureau, California state agencies, Zillow, Redfin and news coverage, and shows them in one place for people who live in, or are thinking about moving to, Fremont, California. Every number carries its source and the date it was read.</p>' +
          '<h2>Built by JeffreyAiFudenna</h2>' +
          '<p>Fremont by the Numbers was built by <strong>JeffreyAiFudenna</strong>, using Claude to gather the data and write the code.</p>' +
          '<h2>The dataset was created using Claude</h2>' +
          '<p>The research and data collection behind this site were done with Claude, Anthropic’s AI model, working from public sources. Claude read each source, recorded the figure together with the page it came from and the date it was read, flagged caveats such as incomplete years or county-level data, and wrote the code for this site. The site owner reviews the dataset before publishing. Because an AI can misread a source, the site is built so that you can check any number yourself.</p>' +
          '<h2>Click a number to see where it came from</h2>' +
          '<p>Click or tap any stat card, table row or chart bar to open its source in a new tab (on a chart, tap the “View source” link under it). Where a figure comes from a report, the link opens the report or the publisher’s page for it. A few figures are simple arithmetic on published numbers (rates per 1,000 residents, shares, year-over-year changes); those link to the source of the underlying figures. If a link has moved, the Sources list below names the publisher so you can find the current page.</p>' +
          '<h2>What a number on this site means</h2>' +
          '<ul>' +
          '<li><strong>Every figure carries its period and source.</strong> “2020–2024” means a Census five-year survey estimate; a month or date means a count or index for that time.</li>' +
          '<li><strong>Fremont first.</strong> Figures are for the city of Fremont wherever they exist. When they do not, the page says so and uses Fremont’s ZIP codes, Alameda County, the Oakland–Fremont metro area or the Bay Area, in that order.</li>' +
          '<li><strong>Official before modeled, modeled before crowdsourced.</strong> Government counts and company statements come first; modeled indexes like Zillow’s are labeled; crowdsourced figures are used only where nothing else exists and are marked.</li>' +
          '<li><strong>Nothing is estimated here.</strong> Where a figure could not be found, the page leaves it out rather than guessing. A few derived figures (rates per 1,000 residents, shares, year-over-year changes) are simple arithmetic on the published numbers and say which population they use.</li>' +
          '<li><strong>Incomplete data is marked.</strong> Hollow points and bars in charts, and the “Incomplete” or “Year to date” labels, mean the period is not finished or the source has not finished reporting it.</li>' +
          '</ul>' +
          '<h2>Known limitations</h2>' +
          '<ul>' +
          '<li>The City of Fremont’s dashboards (fire incidents, homeless response, FremontApp, climate) publish no download, so those figures were read from the dashboards by hand.</li>' +
          '<li>This site is compiled by an AI model from other organizations’ publications. It can make mistakes, and it cannot always reach a primary source; where it relied on a secondary source (a republisher, a news report or an encyclopedia transcription), the row says so. Please use the source links to confirm anything you plan to rely on.</li>' +
          '<li>Fremont Police Department’s switch to incident-based (NIBRS) reporting in 2022 changes how crimes are counted, and the state’s 2025 crime file is incomplete for Fremont.</li>' +
          '<li>Some figures exist only at the county or metro level (child care costs, gas bills, food price inflation, living-wage food budgets).</li>' +
          '<li>Rankings such as WalletHub’s and U.S. News’s use their publishers’ own methods and weightings.</li>' +
          '</ul>' +
          '<h2>Privacy</h2>' +
          '<p>This site has no accounts, forms, ads or tracking cookies, and it does not collect personal information. The only thing it stores on your device is your light or dark mode choice. The site is hosted on Vercel, which keeps standard server logs and may count visits.</p>' +
          '<h2>Updates</h2>' +
          '<p>On Oct 25, 2026 the site was trimmed: figures that were out of date, duplicated on another page, or not about Fremont itself (county, Bay Area, national or worldwide) were removed, so each fact now appears once. Each figure is refreshed when its source publishes a new release; the release calendar on the home page lists what is due next. The date in the header is the date the dataset was last checked. Corrections are welcome.</p>' +
          '</div>'
      },
      {
        title: 'Datasets behind the site',
        sub: 'Each dataset is one file; its description says what it holds and when it was read.',
        html: '<details class="datasets"><summary>Show all ' + ids.length + ' datasets</summary><div class="dataset-list">' + ids.map(id => '<div class="dataset"><span class="t">' + FBN.esc(cat[id].title) + '</span><span class="d">' + FBN.esc(cat[id].description) + '</span>' + (cat[id].updated ? '<span class="u">Read ' + FBN.esc(cat[id].updated.slice(0, 10)) + '</span>' : '') + '</div>').join('') + '</div></details>'
      },
      {
        title: 'Every source page',
        sub: all.length + ' pages, grouped by publisher. Each link is the page a figure was read from.',
        html: '<details class="datasets"><summary>Show all ' + all.length + ' source pages</summary>' + srcHtml + '</details>'
      }
    ];
  }
});
