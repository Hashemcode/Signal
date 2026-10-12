/* ===== Small chart renderer for data questions ===== */
function niceMax(v) { const p = Math.pow(10, Math.floor(Math.log10(v))); const n = v / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p }
function chartSVG(f) {
  const W = 440, H = 260, L = 58, Rr = 16, T = 16, B = 56, iw = W - L - Rr, ih = H - T - B;
  const all = f.series.flatMap(s => s.y), ymax = niceMax(Math.max(...all, f.band ? f.band[1] : 0) * 1.05);
  const Y = v => T + ih - v / ymax * ih;
  const cols = ['var(--signal)', 'var(--sky)', 'var(--amber)'];
  let o = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(f.yl)} chart">`;
  const step = ymax / 5;
  for (let i = 0; i <= 5; i++) { const v = step * i, y = Y(v); o += `<line x1="${L}" x2="${W - Rr}" y1="${y}" y2="${y}" stroke="var(--line)" stroke-width="1" opacity=".6"/><text x="${L - 8}" y="${y + 4}" text-anchor="end" class="tx">${+v.toFixed(2)}</text>` }
  if (f.band) o += `<rect x="${L}" y="${Y(f.band[1])}" width="${iw}" height="${Y(f.band[0]) - Y(f.band[1])}" fill="var(--mint)" opacity=".16"/><text x="${W - Rr - 4}" y="${Y(f.band[1]) + 13}" text-anchor="end" class="tx" style="fill:var(--mint)">normal range</text>`;
  if (f.kind === 'line') {
    const xmin = f.xs[0], xmax = f.xs[f.xs.length - 1], X = v => L + (v - xmin) / (xmax - xmin) * iw;
    f.xs.forEach(x => { o += `<line x1="${X(x)}" x2="${X(x)}" y1="${T + ih}" y2="${T + ih + 5}" stroke="var(--mut)"/><text x="${X(x)}" y="${T + ih + 19}" text-anchor="middle" class="tx">${x}</text>` });
    f.series.forEach((s, k) => {
      const pts = s.y.map((v, i) => [X(f.xs[i]), Y(v)]);
      o += `<path d="${pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('')}" fill="none" stroke="${cols[k]}" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"/>`;
      pts.forEach(p => o += `<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="var(--bg)" stroke="${cols[k]}" stroke-width="2.4"/>`);
    });
  } else {
    const n = f.cats.length, bw = Math.min(70, iw / n * .55);
    f.cats.forEach((c, i) => {
      const cx = L + iw / n * (i + .5), v = f.series[0].y[i];
      o += `<rect x="${cx - bw / 2}" y="${Y(v)}" width="${bw}" height="${T + ih - Y(v)}" rx="5" fill="${cols[i % 3]}" opacity=".9"/><text x="${cx}" y="${Y(v) - 6}" text-anchor="middle" class="tx tx-ink">${v}</text>`;
      const words = c.split(' '), half = Math.ceil(words.length / 2);
      const l1 = words.slice(0, half).join(' '), l2 = words.slice(half).join(' ');
      o += `<text x="${cx}" y="${T + ih + 18}" text-anchor="middle" class="tx">${esc(l1)}</text>${l2 ? `<text x="${cx}" y="${T + ih + 32}" text-anchor="middle" class="tx">${esc(l2)}</text>` : ''}`;
    });
  }
  o += `<line x1="${L}" x2="${L}" y1="${T}" y2="${T + ih}" stroke="var(--mut)"/><line x1="${L}" x2="${W - Rr}" y1="${T + ih}" y2="${T + ih}" stroke="var(--mut)"/>`;
  if (f.xl) o += `<text x="${L + iw / 2}" y="${H - 6}" text-anchor="middle" class="tx tx-ink">${esc(f.xl)}</text>`;
  o += `<text transform="translate(14 ${T + ih / 2}) rotate(-90)" text-anchor="middle" class="tx tx-ink">${esc(f.yl)}</text>`;
  if (f.series.length > 1) f.series.forEach((s, k) => { o += `<g transform="translate(${L + 10 + k * 130} ${T + 4})"><rect width="14" height="4" y="4" rx="2" fill="${cols[k]}"/><text x="20" y="10" class="tx tx-ink">${esc(s.n)}</text></g>` });
  return o + '</svg>';
}
