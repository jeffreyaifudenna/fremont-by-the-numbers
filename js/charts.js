/* Tiny SVG chart renderer for Fremont by the Numbers: line, bar, hbar (grouped or stacked).
   No dependencies. Colors are CSS variables so dark mode needs no redraw. */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  function el(name, attrs, parent) {
    const e = document.createElementNS(NS, name);
    for (const k in attrs) if (attrs[k] !== undefined && attrs[k] !== null) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function niceTicks(min, max, count) {
    if (!(max > min)) { max = min + 1; }
    const span = max - min;
    const step0 = span / Math.max(1, count);
    const mag = Math.pow(10, Math.floor(Math.log10(step0)));
    const norm = step0 / mag;
    const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
    const lo = Math.floor(min / step) * step, hi = Math.ceil(max / step) * step;
    const ticks = [];
    for (let v = lo; v <= hi + step / 2; v += step) ticks.push(Math.round(v / step) * step);
    return { lo, hi, ticks };
  }
  function wrap(text, max) {
    const words = String(text).split(' ');
    const lines = [];
    let cur = '';
    words.forEach(w => {
      if ((cur + ' ' + w).trim().length > max && cur) { lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim();
    });
    if (cur) lines.push(cur);
    if (lines.length > 2) { lines.length = 2; lines[1] = lines[1].replace(/.{3}$/, '') + '…'; }
    return lines;
  }
  const TEXT = { fill: 'var(--muted)', 'font-size': 12, 'font-family': 'inherit' };

  function draw(box, spec) {
    box.innerHTML = '';
    const W = box.clientWidth || 600, H = box.clientHeight || 280;
    const svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, width: '100%', height: '100%', role: 'img', 'aria-label': spec.alt || '' }, box);
    const labels = spec.labels || [];
    const ds = spec.datasets || [];
    const fmt = spec.format || (v => v);
    const horizontal = spec.type === 'hbar';
    const stacked = !!spec.stacked;
    const isBar = spec.type === 'bar' || horizontal;

    // value range
    let vmin = Infinity, vmax = -Infinity;
    labels.forEach((_, i) => {
      let pos = 0, neg = 0;
      ds.forEach(d => { const v = d.data[i]; if (v == null || isNaN(v)) return; if (stacked) { if (v >= 0) pos += v; else neg += v; } else { vmin = Math.min(vmin, v); vmax = Math.max(vmax, v); } });
      if (stacked) { vmin = Math.min(vmin, neg); vmax = Math.max(vmax, pos); }
    });
    if (!isFinite(vmin)) { vmin = 0; vmax = 1; }
    if (spec.zero !== false || isBar) vmin = Math.min(0, vmin);
    if (spec.ymin !== undefined) vmin = spec.ymin;
    if (spec.ymax !== undefined) vmax = spec.ymax;
    if (vmin === vmax) vmax = vmin + 1;
    const nt = niceTicks(vmin, vmax, horizontal ? 4 : 5);
    if (spec.ymin !== undefined) nt.lo = spec.ymin;
    const tickLabels = nt.ticks.filter(t => t >= nt.lo - 1e-9 && t <= nt.hi + 1e-9).map(t => ({ v: t, s: String(fmt(t)) }));

    // margins
    const charW = 6.8;
    let left, bottom = 26, top = 8, right = 10;
    let catLines = [];
    if (horizontal) {
      catLines = labels.map(l => wrap(l, Math.max(14, Math.floor((W * 0.42) / charW))));
      const maxc = Math.max(...catLines.map(ls => Math.max(...ls.map(s => s.length))), 4);
      left = Math.min(W * 0.45, maxc * charW + 10);
      bottom = 24;
      right = Math.max(10, Math.max(...tickLabels.map(t => t.s.length)) * charW / 2 + 6);
    } else {
      left = Math.max(...tickLabels.map(t => t.s.length), 2) * charW + 10;
    }
    const pw = Math.max(10, W - left - right), ph = Math.max(10, H - top - bottom);
    const g = el('g', { transform: 'translate(' + left + ',' + top + ')' }, svg);

    const vScale = v => horizontal ? (v - nt.lo) / (nt.hi - nt.lo) * pw : ph - (v - nt.lo) / (nt.hi - nt.lo) * ph;

    // gridlines + value ticks
    tickLabels.forEach(t => {
      if (horizontal) {
        const x = vScale(t.v);
        el('line', { x1: x, x2: x, y1: 0, y2: ph, stroke: 'var(--line)', 'stroke-width': 1 }, g);
        el('text', Object.assign({ x, y: ph + 18, 'text-anchor': 'middle' }, TEXT), g).textContent = t.s;
      } else {
        const y = vScale(t.v);
        el('line', { x1: 0, x2: pw, y1: y, y2: y, stroke: t.v === 0 ? 'var(--axis)' : 'var(--line)', 'stroke-width': 1 }, g);
        el('text', Object.assign({ x: -8, y: y + 4, 'text-anchor': 'end' }, TEXT), g).textContent = t.s;
      }
    });

    const n = labels.length;
    const hollow = (d, i) => d.hollow && d.hollow[i];
    const tipRows = [];  // per index: {x, y, items}

    if (horizontal) {
      const band = ph / Math.max(1, n);
      const inner = band * 0.72;
      const groups = stacked ? 1 : ds.length;
      const bh = Math.min(inner / groups, 36);
      labels.forEach((l, i) => {
        const y0 = i * band + (band - bh * groups) / 2;
        let acc = 0;
        ds.forEach((d, j) => {
          const v = d.data[i]; if (v == null || isNaN(v)) return;
          const start = stacked ? acc : 0, end = stacked ? acc + v : v;
          const x1 = vScale(Math.min(start, end)), x2 = vScale(Math.max(start, end));
          el('rect', { x: x1, y: stacked ? y0 : y0 + j * bh, width: Math.max(0, x2 - x1), height: bh - 2, rx: 3, fill: hollow(d, i) ? 'var(--surface)' : d.color, stroke: d.color, 'stroke-width': hollow(d, i) ? 2 : 0 }, g);
          if (stacked) acc += v;
        });
        catLines[i].forEach((line, k) => {
          el('text', Object.assign({ x: -8, y: i * band + band / 2 + 4 + (k - (catLines[i].length - 1) / 2) * 13, 'text-anchor': 'end', fill: 'var(--ink-2)' }, TEXT, { fill: 'var(--ink-2)' }), g).textContent = line;
        });
        tipRows.push({ x: 0, y: i * band, w: pw, h: band, label: l, items: ds.map(d => ({ label: d.label, color: d.color, value: d.data[i] })) });
      });
    } else if (isBar) {
      const band = pw / Math.max(1, n);
      const inner = band * 0.7;
      const groups = stacked ? 1 : ds.length;
      const bw = Math.min(inner / groups, 44);
      labels.forEach((l, i) => {
        const x0 = i * band + (band - bw * groups) / 2;
        let acc = 0;
        ds.forEach((d, j) => {
          const v = d.data[i]; if (v == null || isNaN(v)) return;
          const start = stacked ? acc : 0, end = stacked ? acc + v : v;
          const y1 = vScale(Math.max(start, end)), y2 = vScale(Math.min(start, end));
          el('rect', { x: stacked ? x0 : x0 + j * bw, y: y1, width: bw - 2, height: Math.max(0, y2 - y1), rx: 3, fill: hollow(d, i) ? 'var(--surface)' : d.color, stroke: d.color, 'stroke-width': hollow(d, i) ? 2 : 0 }, g);
          if (stacked) acc += v;
        });
        tipRows.push({ x: i * band, y: 0, w: band, h: ph, label: l, items: ds.map(d => ({ label: d.label, color: d.color, value: d.data[i] })) });
      });
      // x labels: show as many as fit
      const lw = Math.min(14, Math.max(...labels.map(l => String(l).length))) * 7.2 + 8;
      const every = Math.max(1, Math.ceil(lw / band));
      labels.forEach((l, i) => {
        if ((n - 1 - i) % every !== 0) return;
        el('text', Object.assign({ x: i * band + band / 2, y: ph + 18, 'text-anchor': 'middle' }, TEXT), g).textContent = String(l).length > 14 ? String(l).slice(0, 13) + '…' : l;
      });
    } else {
      // line
      const xs = i => n > 1 ? i / (n - 1) * pw : pw / 2;
      ds.forEach(d => {
        let path = '', open = false;
        d.data.forEach((v, i) => {
          if (v == null || isNaN(v)) { open = false; return; }
          path += (open ? 'L' : 'M') + xs(i).toFixed(1) + ',' + vScale(v).toFixed(1);
          open = true;
        });
        el('path', { d: path, fill: 'none', stroke: d.color, 'stroke-width': 2.5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'stroke-dasharray': d.dashed ? '6 4' : null }, g);
        if (n <= 40) d.data.forEach((v, i) => {
          if (v == null || isNaN(v)) return;
          el('circle', { cx: xs(i), cy: vScale(v), r: hollow(d, i) ? 4.5 : 3.5, fill: hollow(d, i) ? 'var(--surface)' : d.color, stroke: d.color, 'stroke-width': 2 }, g);
        });
      });
      const maxLabels = Math.max(2, Math.floor(pw / 72));
      const every = Math.max(1, Math.ceil((n - 1) / (maxLabels - 1)));
      labels.forEach((l, i) => {
        if ((n - 1 - i) % every !== 0) return;
        el('text', Object.assign({ x: xs(i), y: ph + 18, 'text-anchor': i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle' }, TEXT), g).textContent = l;
      });
      labels.forEach((l, i) => {
        const half = n > 1 ? pw / (n - 1) / 2 : pw / 2;
        tipRows.push({ x: xs(i) - half, y: 0, w: half * 2, h: ph, label: l, items: ds.map(d => ({ label: d.label, color: d.color, value: d.data[i] })) });
      });
    }

    let pointerType = 'mouse';
    // tooltip
    const tip = document.createElement('div');
    tip.className = 'chart-tip';
    tip.style.display = 'none';
    box.appendChild(tip);
    const hl = el('rect', { x: 0, y: 0, width: 0, height: 0, fill: 'var(--ink)', opacity: 0.05, display: 'none' }, g);
    const overlay = el('rect', { x: 0, y: 0, width: pw, height: ph, fill: 'transparent' }, g);
    function show(evt) {
      const r = svg.getBoundingClientRect();
      const sx = W / r.width;
      const px = (evt.clientX - r.left) * sx - left, py = (evt.clientY - r.top) * sx - top;
      const row = tipRows.find(t => horizontal ? (py >= t.y && py < t.y + t.h) : (px >= t.x && px < t.x + t.w));
      if (!row) { hide(); return; }
      hl.setAttribute('x', row.x); hl.setAttribute('y', row.y); hl.setAttribute('width', row.w); hl.setAttribute('height', row.h); hl.setAttribute('display', null);
      const ri = tipRows.indexOf(row);
      tip.innerHTML = '<div class="t">' + escapeHtml(row.label) + '</div>' + row.items.filter(it => it.value != null).map(it => '<div><span class="swatch" style="background:' + it.color + '"></span>' + escapeHtml(it.label) + ': <b>' + escapeHtml(fmt(it.value)) + '</b></div>').join('') +
        (spec.urls && spec.urls[ri] && pointerType !== 'touch' ? '<div class="tip-hint">Click to open the source ↗</div>' : '');
      tip.style.display = 'block';
      const bx = evt.clientX - r.left, by = evt.clientY - r.top;
      const tw = tip.offsetWidth, th = tip.offsetHeight;
      tip.style.left = Math.max(0, Math.min(r.width - tw, bx + 12)) + 'px';
      tip.style.top = Math.max(0, (by - th - 12 > 0 ? by - th - 12 : by + 14)) + 'px';
    }
    function hide() { tip.style.display = 'none'; hl.setAttribute('display', 'none'); }
    // Clicking a bar or point opens its source in a new tab (mouse and pen only; on touch a tap shows the tooltip and the
    // "View source" link under the chart does the same job).
    const urls = spec.urls || null;
    function rowAt(evt) {
      const r = svg.getBoundingClientRect();
      const sx = W / r.width;
      const px = (evt.clientX - r.left) * sx - left, py = (evt.clientY - r.top) * sx - top;
      return tipRows.findIndex(t => horizontal ? (py >= t.y && py < t.y + t.h) : (px >= t.x && px < t.x + t.w));
    }
    if (urls && urls.some(Boolean)) overlay.style.cursor = 'pointer';
    overlay.addEventListener('pointermove', e => { pointerType = e.pointerType || 'mouse'; show(e); });
    overlay.addEventListener('pointerdown', e => { pointerType = e.pointerType || 'mouse'; show(e); });
    overlay.addEventListener('pointerleave', hide);
    overlay.addEventListener('click', e => {
      if (!urls || pointerType === 'touch') return;
      const i = rowAt(e);
      if (i >= 0 && urls[i]) window.open(urls[i], '_blank', 'noopener,noreferrer');
    });
  }
  function escapeHtml(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

  window.FBNChart = { draw };
})();
