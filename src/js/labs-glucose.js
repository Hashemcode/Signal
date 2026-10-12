/* ===== Lab: Glucose lab (insulin, glucagon, type 1 diabetes) and nerve vs hormone ===== */
const GM = {
  new(mode) { return { G: 5, S: 60, I: 0.5, Gc: 0, depot: 0, gut: 0, ex: 0, mode, t: 0 } },
  step(m, dt) {
    const ab = Math.min(m.gut, 1.2 * dt); m.gut -= ab;
    let I = m.I;
    if (m.mode === 'healthy') I += (0.12 * Math.max(0, m.G - 4.8) * dt) + 0.28 * ab; else { const ai = 0.04 * m.depot * dt; m.depot -= ai; I += 5.3 * ai }
    I -= 0.05 * I * dt; m.I = Math.max(0, I);
    const gcT = Math.max(0, 4.5 - m.G) * 0.8; m.Gc += (gcT - m.Gc) * Math.min(1, dt / 5);
    const outBase = 0.024 * (1 - Math.min(1, m.I / 2.5)) + 0.05 * m.Gc;
    const out = m.S > 1 ? outBase : outBase * 0.2;
    const upIns = 0.004 * m.I * m.G, up = 0.0020 * m.G + upIns + (m.ex > 0 ? 0.05 : 0);
    m.G = Math.max(1.2, Math.min(30, m.G + (ab * 0.30 + out - up) * dt));
    m.S = Math.max(0, Math.min(100, m.S + (upIns - out) * 2.5 * dt));
    if (m.ex > 0) m.ex = Math.max(0, m.ex - dt);
    m.t += dt;
  }
};

LABS.glucose = {
  title: 'Glucose lab', topic: 3, sub: 'Keep blood glucose steady, then take the pancreas away',
  challenges: [['healthy', 'Healthy body: eat a big meal and watch glucose stay under 10'], ['untreated', 'Type 1 diabetes: see untreated glucose pass 12'], ['managed', 'Type 1 diabetes: eat 50 g or more, inject insulin, and bring glucose back to 4 to 8'], ['scare', 'Run the nerve versus hormone test']],
  mount(host, L) {
    let tab = 'glucose';
    const draw = () => {
      host.innerHTML = segBar([['glucose', 'Blood glucose'], ['scare', 'Nerve or hormone']], tab) + '<div id="lab-body" class="lcol" style="margin-top:16px"></div>';
      $$('[data-tab]', host).forEach(b => b.onclick = () => { L.reset(); tab = b.dataset.tab; draw() });
      ({ glucose: tGlucose, scare: tScare })[tab]($('#lab-body', host), L);
    };
    draw();
  }
};

function tGlucose(h, L) {
  let mode = 'healthy', m = GM.new('healthy'), hist = [], evs = [], paused = false, spd = 15, ate = 0, injected = false, maxG = 5, minG = 5, mealT = -1, hadMeal60 = false;
  const W = 440, H = 250, Lm = 44, Rm = 12, T = 14, B = 34, iw = W - Lm - Rm, ih = H - T - B, YM = 24, WIN = 360;
  const Y = v => T + ih - v / YM * ih;
  h.innerHTML = `<div class="seg" id="mode"><button data-m="healthy" aria-selected="true">Healthy body</button><button data-m="t1" aria-selected="false">Type 1 diabetes</button></div>
  <div class="stage"><svg viewBox="0 0 ${W} ${H}" id="gsv">
   <rect x="${Lm}" y="${Y(8)}" width="${iw}" height="${Y(4) - Y(8)}" fill="var(--mint)" opacity=".16"/>
   ${[0, 4, 8, 12, 16, 20, 24].map(v => `<line x1="${Lm}" x2="${W - Rm}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--line)" opacity=".6"/><text x="${Lm - 6}" y="${Y(v) + 4}" text-anchor="end" class="tx">${v}</text>`).join('')}
   <text x="${W - Rm - 4}" y="${Y(8) + 13}" text-anchor="end" class="tx" style="fill:var(--mint)">normal range</text>
   <g id="xt"></g><g id="evm"></g>
   <path id="gp" fill="none" stroke="var(--signal)" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"/>
   <circle id="gd" r="6" fill="var(--bg)" stroke="var(--signal)" stroke-width="3"/>
   <text x="12" y="${T + ih / 2}" transform="rotate(-90 12 ${T + ih / 2})" text-anchor="middle" class="tx tx-ink">Glucose (mmol/dm3)</text>
   <text id="ht" x="${Lm + 8}" y="${T + 16}" class="tx" style="fill:var(--bad)"></text>
  </svg></div>
  <div class="readout"><div class="rd"><b id="gv">5.0</b><span>Blood glucose</span></div><div class="rd"><b id="iv">0.5</b><span>Insulin level</span></div><div class="rd"><b id="gcv">0</b><span>Glucagon level</span></div><div class="rd"><b id="sv">60%</b><span>Glycogen in liver</span></div></div>
  <div class="callout" id="ginfo" aria-live="polite"></div>
  <div><h4>Do something</h4><div class="row" style="margin-top:8px" id="acts">
   <button class="btn sm" data-a="snack">Snack, 20 g</button><button class="btn sm" data-a="meal">Big meal, 60 g</button><button class="btn sm" data-a="ex">Exercise, 30 min</button>
   <span id="ins" class="row" style="display:none;gap:8px"><button class="btn sm pri" data-a="i2">Inject 2 units</button><button class="btn sm pri" data-a="i4">Inject 4 units</button><button class="btn sm pri" data-a="i6">Inject 6 units</button></span></div></div>
  <div class="row"><button class="btn ghost sm" id="pz">Pause</button><button class="btn ghost sm" id="sp">Speed: normal</button><button class="btn ghost sm" id="rs">${ico('reset')}Restart</button></div>
  <p class="tiny mut">Simplified model. About 1 unit of insulin covers 10 g of carbohydrate, and too much insulin makes glucose fall too low.</p>`;
  const clock = t => { const mm = (7 * 60 + Math.round(t)) % 1440; return String(Math.floor(mm / 60)).padStart(2, '0') + ':' + String(mm % 60).padStart(2, '0') };
  function drawChart() {
    const t1 = m.t, t0 = Math.max(0, t1 - WIN), X = t => Lm + (t - t0) / WIN * iw;
    const pts = hist.filter(p => p[0] >= t0);
    $('#gp', h).setAttribute('d', pts.map((p, i) => (i ? 'L' : 'M') + X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1)).join(''));
    const last = pts[pts.length - 1] || [0, m.G]; const gd = $('#gd', h); gd.setAttribute('cx', X(last[0])); gd.setAttribute('cy', Y(last[1]));
    let xt = ''; for (let t = Math.ceil(t0 / 60) * 60; t <= t0 + WIN; t += 60) xt += `<line x1="${X(t)}" x2="${X(t)}" y1="${T + ih}" y2="${T + ih + 5}" stroke="var(--mut)"/><text x="${X(t)}" y="${T + ih + 19}" text-anchor="middle" class="tx">${clock(t)}</text>`;
    $('#xt', h).innerHTML = xt;
    $('#evm', h).innerHTML = evs.filter(e => e.t >= t0).map(e => `<g transform="translate(${X(e.t)} ${T + ih})"><path d="M0 0L-5 -10H5Z" fill="${e.c}"/><text y="-14" text-anchor="middle" class="tx tx-ink">${e.l}</text></g>`).join('');
  }
  function narrate() {
    let t;
    if (m.G < 3.5) t = '<b>Too low (hypoglycaemia).</b> The person feels shaky and dizzy. Eat a snack. In a healthy body glucagon would push glucose back up.';
    else if (m.mode === 'healthy') t = m.G > 8 ? '<b>Glucose is high.</b> The pancreas releases <b>insulin</b>. The liver turns glucose into <b>glycogen</b>. Glucose falls. This is negative feedback.' : m.G < 4.4 ? '<b>Glucose is low.</b> The pancreas releases <b>glucagon</b>. The liver turns glycogen into glucose. Glucose rises.' : '<b>Glucose is in the normal range.</b> The pancreas keeps it steady. Eat something to test the feedback loop.';
    else t = m.G > 8 ? '<b>The pancreas makes no insulin.</b> Glucose stays high. The treatment is an insulin injection with food, plus controlling carbohydrate.' : '<b>Insulin is working.</b> Glucose is back in range. Too much insulin would push it too low.';
    $('#ginfo', h).innerHTML = t;
  }
  function addEv(l, c) { evs.push({ t: m.t, l, c }) }
  function reset() { m = GM.new(mode); hist = [[0, 5]]; evs = []; ate = 0; injected = false; maxG = 5; minG = 5; hadMeal60 = false; mealT = -1; drawChart(); narrate(); $('#ins', h).style.display = mode === 't1' ? 'flex' : 'none' }
  $$('#mode button', h).forEach(b => b.onclick = () => { mode = b.dataset.m; $$('#mode button', h).forEach(x => x.setAttribute('aria-selected', x === b)); reset() });
  $$('#acts [data-a]', h).forEach(b => b.onclick = () => {
    const a = b.dataset.a; sfx('tap');
    if (a === 'snack') { m.gut += 20; ate += 20; addEv('S', 'var(--amber)') }
    if (a === 'meal') { m.gut += 60; ate += 60; hadMeal60 = true; mealT = m.t; addEv('M', 'var(--amber)') }
    if (a === 'ex') { m.ex = 30; addEv('E', 'var(--sky)') }
    if (a[0] === 'i') { const u = +a.slice(1); m.depot += u; injected = true; addEv(u + 'u', 'var(--signal)') }
  });
  $('#pz', h).onclick = e => { paused = !paused; e.target.textContent = paused ? 'Resume' : 'Pause' };
  $('#sp', h).onclick = e => { spd = spd === 15 ? 45 : 15; e.target.textContent = 'Speed: ' + (spd === 15 ? 'normal' : 'fast') };
  $('#rs', h).onclick = reset;
  reset();
  let last = performance.now(), acc = 0, nar = 0, lastRec = 0;
  L.loop(t => {
    const dt = Math.min(.1, (t - last) / 1000); last = t;
    if (!paused) {
      acc += dt * spd;
      while (acc >= 1) {
        acc -= 1; GM.step(m, 1); maxG = Math.max(maxG, m.G); minG = Math.min(minG, m.G);
        if (m.t - lastRec >= 3) { hist.push([m.t, m.G]); lastRec = m.t; if (hist.length > 600) hist.shift() }
        // challenges
        if (mode === 'healthy' && hadMeal60 && m.t - mealT > 120 && m.G < 10 && maxG < 10) L.done('healthy');
        if (mode === 't1' && m.G > 12) L.done('untreated');
        if (mode === 't1' && ate >= 50 && injected && m.t - mealT > 100 && mealT >= 0 && m.G >= 4 && m.G <= 8 && minG > 3.5) L.done('managed');
      }
      drawChart(); $('#ht', h).textContent = m.G < 3.5 ? 'Too low' : m.G > 12 ? 'Too high' : '';
      $('#gv', h).textContent = m.G.toFixed(1); $('#iv', h).textContent = m.I.toFixed(1); $('#gcv', h).textContent = m.Gc.toFixed(1); $('#sv', h).textContent = Math.round(m.S) + '%';
      const gv = $('#gv', h); gv.style.color = m.G < 3.5 || m.G > 12 ? 'var(--bad)' : (m.G >= 4 && m.G <= 8 ? 'var(--good)' : 'var(--amber)');
      nar += dt; if (nar > .5) { nar = 0; narrate() }
    }
  });
}

function tScare(h, L) {
  const W = 440, H = 240, Lm = 46, Rm = 14, T = 20, B = 44, iw = W - Lm - Rm, ih = H - T - B, TM = 300;
  const X = t => Lm + Math.sqrt(t / TM) * iw, Y = v => T + ih - v * ih;
  const rn = t => Math.exp(-t / .9), rh = t => t < 8 ? 0 : (1 - Math.exp(-(t - 8) / 18)) * Math.exp(-Math.max(0, t - 100) / 140);
  const path = (f, upto) => { let d = ''; for (let i = 0; i <= 300; i++) { const t = TM * (i / 300) ** 2; if (t > upto) break; d += (i ? 'L' : 'M') + X(t).toFixed(1) + ' ' + Y(f(t)).toFixed(1) } return d };
  h.innerHTML = `<p>A loud bang makes you jump straight away. Your heart then keeps pounding for minutes. Press the button to see both responses on one timeline.</p>
  <div class="stage"><svg viewBox="0 0 ${W} ${H}">
   ${[0, .25, .5, .75, 1].map(v => `<line x1="${Lm}" x2="${W - Rm}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--line)" opacity=".6"/><text x="${Lm - 6}" y="${Y(v) + 4}" text-anchor="end" class="tx">${Math.round(v * 100)}</text>`).join('')}
   ${[0, 1, 5, 15, 30, 60, 120, 300].map(t => `<line x1="${X(t)}" x2="${X(t)}" y1="${T + ih}" y2="${T + ih + 5}" stroke="var(--mut)"/><text x="${X(t)}" y="${T + ih + 19}" text-anchor="middle" class="tx">${t}</text>`).join('')}
   <text x="${Lm + iw / 2}" y="${H - 4}" text-anchor="middle" class="tx tx-ink">Time after the bang (seconds, scale stretched at the start)</text>
   <text x="12" y="${T + ih / 2}" transform="rotate(-90 12 ${T + ih / 2})" text-anchor="middle" class="tx tx-ink">Strength of response (%)</text>
   <path id="pn" fill="none" stroke="var(--signal)" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/><path id="ph" fill="none" stroke="var(--violet)" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>
   <line id="cur" y1="${T}" y2="${T + ih}" stroke="var(--mut)" stroke-dasharray="3 4" style="opacity:0"/>
   <g transform="translate(${Lm + 14} ${T + 6})"><rect width="14" height="4" y="4" rx="2" fill="var(--signal)"/><text x="20" y="10" class="tx tx-ink">Nervous: the jump</text><rect y="22" width="14" height="4" rx="2" fill="var(--violet)"/><text x="20" y="28" class="tx tx-ink">Hormonal: adrenaline and heart rate</text></g>
  </svg></div>
  <div class="readout"><div class="rd"><b id="tm">0 s</b><span>Time</span></div><div class="rd"><b id="jp" style="color:var(--signal)">0%</b><span>Jump (nerves)</span></div><div class="rd"><b id="hr" style="color:var(--violet)">70</b><span>Heart rate (beats/min)</span></div></div>
  <div class="row"><button class="btn pri" id="bang">Bang!</button></div>
  <div class="callout" id="sc">Nerves act in milliseconds and the effect is over in seconds. Adrenaline is released into the blood, takes longer to arrive and lasts for minutes.</div>`;
  let busy = false;
  $('#bang', h).onclick = () => {
    if (busy) return; busy = true; sfx('no'); buzz(40);
    L.stop(tween(7000, k => {
      const t = TM * k * k; $('#pn', h).setAttribute('d', path(rn, t)); $('#ph', h).setAttribute('d', path(rh, t));
      const c = $('#cur', h); c.setAttribute('x1', X(t)); c.setAttribute('x2', X(t)); c.style.opacity = 1;
      $('#tm', h).textContent = (t < 10 ? t.toFixed(1) : Math.round(t)) + ' s'; $('#jp', h).textContent = Math.round(rn(t) * 100) + '%'; $('#hr', h).textContent = Math.round(70 + 55 * rh(t));
    }, () => { busy = false; L.done('scare'); $('#sc', h).innerHTML = '<b>Nervous response:</b> immediate, short-lived. <b>Hormonal response:</b> slower to start, longer lasting. Both coordinate the body to deal with danger.' }));
  };
}
