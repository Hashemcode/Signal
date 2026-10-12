/* ===== Lab: Plant lab (phototropism, geotropism, auxin) ===== */
const D2R = Math.PI / 180;
const LIGHT_DIR = { left: 270, right: 90, top: 0 };
function plantSim(cfg) {
  const kL = 1.0, kG = .7, kGr = .6, RATE = .35, SUB = 20, DAYS = 7;
  const seed = cfg.sideways ? { x: 105, y: 160 } : { x: 180, y: 176 };
  let a = (cfg.sideways ? 90 : 0) * D2R, b = (cfg.sideways ? 270 : 180) * D2R;
  let sp = { x: seed.x, y: seed.y }, rp = { x: seed.x, y: seed.y };
  const S = [{ ...sp }], Rt = [{ ...rp }], sig = [{ s: 0, r: 0 }];
  const lightOn = cfg.light !== 'none' && !cfg.clino, tl = (LIGHT_DIR[cfg.light] || 0) * D2R;
  for (let i = 0; i < SUB * DAYS; i++) {
    const dt = 1 / SUB; let s = 0, r = 0;
    if (!cfg.clino) {
      if (cfg.tip === 'on' && lightOn) s += kL * Math.sin(tl - a);
      if (cfg.tip !== 'cut') s += -kG * Math.sin(a);
      r += -kGr * Math.sin(b - Math.PI);
      if (lightOn) r += -.35 * kL * Math.sin(tl - b);
    }
    if (cfg.tip !== 'cut') { a += RATE * s * dt; sp = { x: sp.x + Math.sin(a) * 14 * dt, y: sp.y - Math.cos(a) * 14 * dt } }
    b += RATE * r * dt; rp = { x: rp.x + Math.sin(b) * 11 * dt, y: rp.y - Math.cos(b) * 11 * dt };
    S.push({ ...sp }); Rt.push({ ...rp }); sig.push({ s, r, a, b });
  }
  return { S, R: Rt, sig, SUB, seed, a: i => sig[Math.min(i, sig.length - 1)].a, final: { a: a / D2R, b: b / D2R } };
}
const angDiff = d => { d = ((d % 360) + 540) % 360 - 180; return d };

LABS.plant = {
  title: 'Plant lab', topic: 4, sub: 'Shine light, turn the board and remove the tip',
  challenges: [['photo', 'Make a shoot bend towards light from the side'], ['tip', 'Cover the tip and show the shoot does not bend'], ['cut', 'Remove the tip and see what happens'], ['gravity', 'Turn the seedling on its side and watch the shoot curve upwards'], ['clino', 'Use the clinostat and show gravity has no effect']],
  mount(host, L) {
    const cfg = { light: 'right', sideways: false, clino: false, tip: 'on' }; let day = 0, sim = plantSim(cfg);
    const grp = (id, label, opts, cur) => `<div><h4>${label}</h4><div class="seg" id="${id}" style="margin-top:6px">${opts.map(([v, l]) => `<button data-v="${v}" aria-selected="${v === cur}">${l}</button>`).join('')}</div></div>`;
    host.innerHTML = `<div class="twocol"><div class="lcol"><div class="stage"><canvas id="pc" width="720" height="600" aria-label="Seedling experiment" role="img"></canvas></div>
      <div class="row"><button class="btn pri" id="pp">${ico('play')}Grow 7 days</button><div class="sl grow" style="min-width:140px"><label for="dy">Day<span id="dyv">0</span></label><input type="range" id="dy" min="0" max="7" step="0.05" value="0"></div></div></div>
     <div class="lcol ctrl">${grp('g-light', 'Light from', [['none', 'None'], ['left', 'Left'], ['right', 'Right'], ['top', 'Above']], cfg.light)}${grp('g-or', 'Seedling', [['up', 'Upright'], ['side', 'On its side']], 'up')}${grp('g-tip', 'Shoot tip', [['on', 'Intact'], ['cover', 'Covered'], ['cut', 'Removed']], 'on')}
      ${tglHTML('clino', 'Clinostat (slowly rotates the seedling)', false)}
      <div class="readout"><div class="rd"><b id="sa">0°</b><span>Shoot angle from vertical</span></div><div class="rd"><b id="ra">0°</b><span>Root angle from vertical</span></div></div>
      <div class="callout" id="pinfo2" aria-live="polite"></div></div></div>`;
    const cv = $('#pc', host), ctx = cv.getContext('2d'); const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
    const setCfg = () => { sim = plantSim(cfg); draw() };
    const bindSeg = (id, fn) => $$('#' + id + ' button', host).forEach(b => b.onclick = () => { $$('#' + id + ' button', host).forEach(x => x.setAttribute('aria-selected', x === b)); fn(b.dataset.v); L.stop(); setCfg(); play(0) });
    bindSeg('g-light', v => cfg.light = v); bindSeg('g-or', v => cfg.sideways = v === 'side'); bindSeg('g-tip', v => cfg.tip = v);
    tglBind($('#clino', host), v => { cfg.clino = v; L.stop(); setCfg(); play(0) });
    const dy = $('#dy', host); dy.oninput = () => { L.stop(); day = +dy.value; draw() };
    const play = from => { L.stop(); L.stop(tween((7 - from) * 600, k => { day = lerp(from, 7, k); dy.value = day; draw() })) };
    $('#pp', host).onclick = () => play(day >= 7 ? 0 : day);
    L.cleanup(() => { });
    function sun(x, y) { ctx.save(); ctx.fillStyle = css('--amber'); ctx.strokeStyle = css('--amber'); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 14, 0, 7); ctx.fill(); for (let i = 0; i < 10; i++) { const a = i / 10 * 6.283; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * 20, y + Math.sin(a) * 20); ctx.lineTo(x + Math.cos(a) * 28, y + Math.sin(a) * 28); ctx.stroke() } ctx.restore() }
    function draw() {
      const W = 360, H = 300, dpr = cv.width / W; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = css('--bg'); ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = css('--line'); ctx.globalAlpha = .35; ctx.lineWidth = 1; for (let x = 0; x <= W; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() } for (let y = 0; y <= H; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() } ctx.globalAlpha = 1;
      const i = Math.min(sim.S.length - 1, Math.round(day * sim.SUB)), mint = css('--mint'), amber = css('--amber'), sky = css('--sky'), ink = css('--ink');
      // light
      if (cfg.light !== 'none') {
        const pos = { left: [26, 150], right: [334, 150], top: [180, 26] }[cfg.light]; sun(pos[0], pos[1]);
        ctx.strokeStyle = amber; ctx.globalAlpha = cfg.clino ? .15 : .4; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
        [-40, 0, 40].forEach(o => { const dx = cfg.light === 'top' ? o : 0, dy2 = cfg.light === 'top' ? 0 : o; ctx.beginPath(); ctx.moveTo(pos[0] + dx, pos[1] + dy2 + (cfg.light === 'top' ? 26 : 0)); ctx.lineTo(pos[0] + (cfg.light === 'left' ? 90 : cfg.light === 'right' ? -90 : dx), pos[1] + dy2 + (cfg.light === 'top' ? 100 : 0)); ctx.stroke() }); ctx.setLineDash([]); ctx.globalAlpha = 1;
      }
      // gravity arrow
      ctx.strokeStyle = css('--mut'); ctx.fillStyle = css('--mut'); ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(334, 232); ctx.lineTo(334, 272); ctx.stroke(); ctx.beginPath(); ctx.moveTo(327, 266); ctx.lineTo(334, 278); ctx.lineTo(341, 266); ctx.fill(); ctx.font = '700 11px "Atkinson Hyperlegible",system-ui'; ctx.textAlign = 'center'; ctx.fillText('gravity', 334, 224);
      // clinostat
      if (cfg.clino) { ctx.save(); ctx.translate(30, 262); ctx.rotate(day * 2.6); ctx.strokeStyle = sky; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 16, 0, 5.2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(10, -14); ctx.lineTo(18, -6); ctx.lineTo(6, -6); ctx.fillStyle = sky; ctx.fill(); ctx.restore(); ctx.fillStyle = sky; ctx.textAlign = 'center'; ctx.fillText('clinostat', 30, 292) }
      // root
      const taper = (pts, w0, w1, col) => { ctx.strokeStyle = col; ctx.lineCap = 'round'; for (let k = 1; k < pts.length; k++) { const t = k / (pts.length - 1); ctx.lineWidth = lerp(w0, w1, t); ctx.beginPath(); ctx.moveTo(pts[k - 1].x, pts[k - 1].y); ctx.lineTo(pts[k].x, pts[k].y); ctx.stroke() } };
      const R = sim.R.slice(0, i + 1), S = sim.S.slice(0, i + 1);
      taper(R.filter((_, k) => k % 2 === 0 || k === R.length - 1), 4.5, 1.6, amber);
      // seed
      const sd = sim.seed; ctx.fillStyle = css('--s3'); ctx.strokeStyle = css('--line2'); ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(sd.x, sd.y, 13, 9, cfg.sideways ? 0 : 1.57, 0, 7); ctx.fill(); ctx.stroke();
      taper(S.filter((_, k) => k % 2 === 0 || k === S.length - 1), 7, 3.6, mint);
      const tip = S[S.length - 1], ang = sim.sig[Math.min(i, sim.sig.length - 1)].a ?? (cfg.sideways ? 90 * D2R : 0), dirx = Math.sin(ang), diry = -Math.cos(ang);
      // leaves
      if (cfg.tip !== 'cut' && day > 1.5) { const sz = clamp((day - 1.5) / 5.5, 0, 1) * 15 + 3; [-1, 1].forEach(sgn => { ctx.save(); ctx.translate(tip.x, tip.y); ctx.rotate(ang + sgn * .9); ctx.fillStyle = mint; ctx.globalAlpha = .85; ctx.beginPath(); ctx.ellipse(0, -sz * .7, sz * .45, sz, 0, 0, 7); ctx.fill(); ctx.restore() }) }
      // tip treatment
      if (cfg.tip === 'cover') { ctx.save(); ctx.translate(tip.x, tip.y); ctx.rotate(ang); ctx.fillStyle = '#9aa3ab'; ctx.strokeStyle = '#5c6670'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.roundRect(-6, -17, 12, 20, 4); ctx.fill(); ctx.stroke(); ctx.restore() }
      if (cfg.tip === 'cut') { ctx.save(); ctx.translate(tip.x, tip.y); ctx.rotate(ang); ctx.strokeStyle = css('--bad'); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-8, -5); ctx.lineTo(8, -5); ctx.stroke(); ctx.restore() }
      // auxin dots
      const sg = sim.sig[Math.min(i, sim.sig.length - 1)]; if (i > 0 && !cfg.clino) {
        if (cfg.tip !== 'cut' && sg.s !== undefined) { const f = clamp(sg.s / 1.2, -1, 1); const nxp = Math.cos(ang), nyp = Math.sin(ang); const left = Math.round(10 * clamp(.5 + f * .45, .05, .95)); for (let k = 0; k < 10; k++) { const side = k < left ? -1 : 1, along = (k % 5) * 6 + 4, off = 11 + (k % 2) * 3; ctx.fillStyle = sky; ctx.beginPath(); ctx.arc(tip.x - dirx * along + nxp * off * side, tip.y - diry * along + nyp * off * side, 2.6, 0, 7); ctx.fill() } }
        const rt = R[R.length - 1]; if (sg.r !== undefined && Math.abs(sg.r) > .001) { const bb = sg.b, bx = Math.sin(bb), by = -Math.cos(bb), nxp = Math.cos(bb), nyp = Math.sin(bb); const f = clamp(sg.r / .6, -1, 1); const right = Math.round(8 * clamp(.5 + f * .45, .05, .95)); for (let k = 0; k < 8; k++) { const side = k < right ? 1 : -1, along = (k % 4) * 5 + 4; ctx.fillStyle = sky; ctx.beginPath(); ctx.arc(rt.x - bx * along + nxp * 9 * side, rt.y - by * along + nyp * 9 * side, 2.4, 0, 7); ctx.fill() } }
      }
      ctx.fillStyle = css('--mut'); ctx.textAlign = 'left'; ctx.font = '700 13px "Atkinson Hyperlegible",system-ui'; ctx.fillText('Day ' + (Math.round(day * 10) / 10), 12, 20);
      ctx.fillStyle = sky; ctx.beginPath(); ctx.arc(120, 15, 3, 0, 7); ctx.fill(); ctx.fillStyle = css('--mut'); ctx.font = '12px "Atkinson Hyperlegible",system-ui'; ctx.fillText('auxin', 128, 19);
      // readouts
      const a = sg.a !== undefined ? sg.a / D2R : (cfg.sideways ? 90 : 0), bq = sg.b !== undefined ? sg.b / D2R : (cfg.sideways ? 270 : 180);
      $('#sa', host).textContent = Math.abs(Math.round(angDiff(a))) + '°'; $('#ra', host).textContent = Math.abs(Math.round(angDiff(bq - 180))) + '°'; $('#dyv', host).textContent = Math.round(day * 10) / 10;
      info(a);
      if (day >= 6) check(a);
    }
    function info(a) {
      let t = [];
      if (cfg.clino) t.push('<b>Clinostat on.</b> The seedling keeps rotating, so light and gravity reach all sides equally. Auxin stays evenly spread. It grows straight.');
      else {
        if (cfg.tip === 'cut') t.push('<b>Tip removed.</b> The tip makes the auxin, so growth and bending stop.');
        else {
          if (cfg.light !== 'none') t.push(cfg.tip === 'cover' ? '<b>Tip covered.</b> The tip cannot detect the light, so auxin is not moved to one side for light.' : '<b>Light from the ' + (cfg.light === 'top' ? 'top' : cfg.light) + '.</b> The tip detects it and auxin moves to the <b>shaded side</b>. Cells there elongate more, so the shoot bends towards the light.');
          if (cfg.sideways) t.push('<b>On its side.</b> Gravity makes auxin collect on the <b>lower side</b> of the shoot. Those cells elongate more, so the shoot curves up (negative geotropism). In the root, high auxin on the lower side slows growth, so the root curves down (positive geotropism).');
          if (cfg.light === 'none' && !cfg.sideways) t.push('<b>No stimulus.</b> Auxin is spread evenly, so the shoot grows straight up and the root straight down.');
        }
      }
      $('#pinfo2', host).innerHTML = t.join('<br><br>');
    }
    function check(a) {
      const d = angDiff(a); const toward = cfg.light === 'right' ? d : cfg.light === 'left' ? -d : 0;
      if (!cfg.clino && !cfg.sideways && cfg.tip === 'on' && (cfg.light === 'left' || cfg.light === 'right') && toward > 25) L.done('photo');
      if (!cfg.clino && !cfg.sideways && cfg.tip === 'cover' && (cfg.light === 'left' || cfg.light === 'right') && Math.abs(d) < 8) L.done('tip');
      if (cfg.tip === 'cut' && cfg.light !== 'none') L.done('cut');
      if (!cfg.clino && cfg.sideways && cfg.tip === 'on' && cfg.light === 'none' && Math.abs(d) < 45) L.done('gravity');
      if (cfg.clino && cfg.sideways && Math.abs(d - 90) < 8) L.done('clino');
    }
    draw();
    const mo = new MutationObserver(draw); mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] }); L.cleanup(() => mo.disconnect());
  }
};
