/* Schools: Fremont Unified results, rankings, trends and a school-by-school table. */
FBN.page({
  key: 'schools',
  title: 'Schools',
  lede: 'How Fremont Unified’s schools rank and perform: test results, graduation, U.S. News rankings and a table of every school.',
  sections: function (data, row) {
    const hs = r => r.kind === 'School';
    /* the California rank opens that school's own U.S. News page, where the rank is shown */
    const usnLink = (r, text) => r.usn_url
      ? '<a class="src-link" href="' + FBN.esc(r.usn_url) + '" target="_blank" rel="noopener noreferrer" aria-label="' + FBN.esc(text + ' in California: ' + (r.full_name || r.school)) + ' on U.S. News (opens in a new tab)" title="Open this school’s U.S. News page in a new tab">' + FBN.esc(text) + '</a>'
      : FBN.esc(text);
    /* state ranks are stored as text ("1026", "4440-5920"): add thousands commas and an en dash for ranges */
    const rk = s => '#' + String(s).replace(/\d{4,}/g, d => Number(d).toLocaleString('en-US')).replace('-', '–');
    return [
      {
        title: 'Fremont Unified at a glance',
        cards: [
          { ds: 'schools', id: 'enrollment', label: 'Students enrolled', icon: 'users', color: 1 },
          { ds: 'schools', id: 'k12_schools', label: 'K–12 schools', icon: 'school', color: 2, showNote: false },
          { ds: 'schools', id: 'grad_rate', label: 'Four-year graduation rate', icon: 'award', color: 3, note: 'California: ' + FBN.fmt((row('schools', 'grad_rate_state') || {}).value, 'pct') },
          { ds: 'schools', id: 'ela', label: 'Proficient or advanced in English', icon: 'book', color: 4, note: 'California: ' + FBN.fmt((row('schools', 'ela_state') || {}).value, 'pct') },
          { ds: 'schools', id: 'math', label: 'Proficient or advanced in math', icon: 'chart', color: 5, note: 'California: ' + FBN.fmt((row('schools', 'math_state') || {}).value, 'pct') },
          { ds: 'schools', id: 'ratio', label: 'Students per teacher', icon: 'users', color: 1, note: 'California: ' + FBN.fmt((row('schools', 'ratio_state') || {}).value, 'dec1') }
        ],
        notes: ['Fremont Unified serves nearly all of the city. Test figures are the share of students meeting the state standard on the 2025–26 Smarter Balanced tests in grades 3–8 and 11.']
      },
      {
        title: 'High school rankings',
        sub: 'U.S. News Best High Schools, 2026–27 edition, for Fremont Unified’s five comprehensive high schools.',
        tables: [{
          ds: 'high_schools', title: 'Where each high school ranks', sub: 'Lower is better; prior-year state rank in parentheses', navy: true, phoneCards: true,
          filter: hs,
          columns: [
            { key: 'school', label: 'School' },
            { key: r => r.usn_national, label: 'U.S. rank', format: 'rank' },
            { key: r => usnLink(r, rk(r.usn_state)) + ' <span class="dim">(' + FBN.esc(rk(r.usn_state_prior)) + ')</span>', label: 'California rank', html: true, num: false },
            { key: r => r.usn_metro, label: 'SF Bay Area rank', format: 'rank' },
            { key: 'enrollment', label: 'Students', format: 'int' },
            { key: 'grad_rate', label: 'Graduation', format: 'pct' },
            { key: 'ap_took', label: 'Took an AP exam', format: 'pct' },
            { key: 'ap_passed', label: 'Passed an AP exam', format: 'pct' }
          ],
          source: 'U.S. News &amp; World Report, Best High Schools 2026–27 (published Aug 2026); prior ranks from FUSD’s Aug 2025 release. Students are 2025–26 enrollment from the California Department of Education, the same figures as the school finder below; graduation and AP rates are U.S. News figures. In this edition U.S. News ranks Mission San Jose first in the SF Bay Area column and 10th in California.'
        }],
        charts: [{
          ds: 'high_schools', type: 'hbar', x: 'school', format: 'pct',
          title: '11th-grade test results by high school', sub: 'Share meeting the state standard, 2025–26',
          series: [{ key: 'ela_11', label: 'English', color: 1 }, { key: 'math_11', label: 'Math', color: 2 }],
          source: 'CAASPP Smarter Balanced results, grade 11, 2025–26. The last two rows are the district-wide and statewide figures for comparison.'
        }]
      },
      {
        title: 'Trends over the years',
        sub: 'Fremont Unified compared with California, from the state Department of Education via Ed-Data.',
        charts: [{
          ds: 'school_trends', type: 'line', x: 'year', format: 'pct', zero: false, ymin: 80,
          title: 'Four-year graduation rate', filter: r => r.grad_rate !== null,
          series: [{ key: 'grad_rate', label: 'Fremont Unified' }, { key: 'grad_rate_state', label: 'California', color: 2, dashed: true }],
          source: 'CDE adjusted cohort graduation rate via Ed-Data. State figures before 2021–22 were not captured.'
        }, {
          ds: 'school_trends', type: 'line', x: 'year', format: 'pct', zero: false,
          title: 'Chronic absenteeism', sub: 'Students missing 10% or more of school days', filter: r => r.chronic_absent !== null,
          series: [{ key: 'chronic_absent', label: 'Fremont Unified' }, { key: 'chronic_absent_state', label: 'California', color: 2, dashed: true }],
          source: 'CDE via Ed-Data.'
        }, {
          ds: 'school_trends', type: 'line', x: 'year', format: 'pct', zero: false,
          title: 'Graduates meeting UC/CSU entrance requirements (A–G)', filter: r => r.a_g_rate !== null,
          series: [{ key: 'a_g_rate', label: 'Fremont Unified' }, { key: 'a_g_rate_state', label: 'California', color: 2, dashed: true }],
          source: 'CDE via Ed-Data.'
        }, {
          ds: 'school_trends', type: 'line', x: 'year', format: 'int', zero: false,
          title: 'Enrollment', sub: 'Fremont Unified, all grades',
          series: [{ key: 'enrollment', label: 'Students' }],
          source: 'CDE via Ed-Data. Enrollment has fallen about 8% since its 2017–18 peak.'
        }, {
          ds: 'school_trends', type: 'line', x: 'year', format: 'usd', zero: false,
          title: 'Spending per student', filter: r => r.spend_per_student !== null,
          series: [{ key: 'spend_per_student', label: 'Fremont Unified' }, { key: 'spend_per_student_state', label: 'California', color: 2, dashed: true }],
          source: 'CDE via Ed-Data (current expense of education per student).'
        }, {
          ds: 'school_trends', type: 'line', x: 'year', format: 'usd', zero: false,
          title: 'Average teacher salary', filter: r => r.teacher_salary !== null,
          series: [{ key: 'teacher_salary', label: 'Fremont Unified' }, { key: 'teacher_salary_state', label: 'California', color: 2, dashed: true }],
          source: 'CDE via Ed-Data.'
        }, {
          ds: 'school_trends', type: 'line', x: 'year', format: 'pct', zero: false,
          title: 'Students from low-income families', sub: 'Eligible for free or reduced-price meals',
          series: [{ key: 'low_income_pct', label: 'Fremont Unified' }, { key: 'english_learner_pct', label: 'English learners', color: 3 }],
          source: 'CDE via Ed-Data. The low-income share has nearly doubled since 2016–17.'
        }]
      },
      {
        title: 'Every Fremont Unified school',
        sub: 'Elementary, middle and high schools with test results, attendance and U.S. News state rank; click a rank to open that school’s U.S. News page.',
        tables: [{
          ds: 'school_list', title: 'School finder', phoneCards: true, sub: 'Grouped by school level, then sorted by English results',
          links: [
            { url: 'https://www.usnews.com/education/k12/elementary-schools/california/fremont-unified-school-district-111898', name: 'U.S. News, Fremont Unified elementary schools' },
            { url: 'https://www.usnews.com/education/k12/middle-schools/california/fremont-unified-school-district-111898', name: 'U.S. News, Fremont Unified middle schools' },
            { url: 'https://www.usnews.com/education/best-high-schools/california/districts/fremont-unified-school-district-111898', name: 'U.S. News, Fremont Unified high schools' }
          ],
          groupBy: r => r.level, groupLabels: { High: 'High schools', Middle: 'Junior high and middle schools', Elementary: 'Elementary schools' }, navy: true,
          sort: (a, b) => {
            const lv = { 'High': 0, 'Middle': 1, 'Elementary': 2 };
            return (lv[a.level] - lv[b.level]) || ((b.ela || 0) - (a.ela || 0));
          },
          columns: [
            { key: 'full_name', label: 'School' },
            { key: 'grades', label: 'Grades' },
            { key: 'enrollment', label: 'Students', format: 'int' },
            { key: 'ela', label: 'English', format: 'pct1' },
            { key: 'math', label: 'Math', format: 'pct1' },
            { key: 'chronic_absent', label: 'Chronic absence', format: 'pct1' },
            { key: 'low_income', label: 'Low income', format: 'pct1' },
            { key: r => usnLink(r, r.usn_state ? rk(r.usn_state) : 'Unranked'), label: 'U.S. News CA rank', html: true, num: false }
          ],
          source: 'CAASPP 2025–26 results (share meeting standard); DataQuest 2025–26 enrollment; Ed-Data 2024–25 chronic absence and 2025–26 low-income share; U.S. News 2027 edition elementary and middle school state ranks, 2026–27 for high schools.'
        }]
      },
      {
        title: 'Beyond Fremont Unified',
        cards: [
          { ds: 'schools', id: 'private', label: 'Private schools with a Fremont address', icon: 'school', color: 2 },
          { ds: 'schools', id: 'ohlone', label: 'Ohlone College, students per year', icon: 'award', color: 3 }
        ],
        notes: ['Ohlone College is Fremont’s community college, with its main campus in the Mission San Jose hills and a second campus in Newark; its headcount comes from a draft self-evaluation report and is marked unverified.']
      }
    ];
  }
});
