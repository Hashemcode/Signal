/* ===== Lab: Reflex lab (reaction test, reflex vs decision, damage detective) ===== */
LABS.reflex = {
  title: 'Reflex lab', topic: 1, sub: 'Measure your reaction, race a reflex and diagnose a cut nerve',
  challenges: [['react', 'Complete five reaction tests'], ['race', 'Race a reflex against a voluntary action'], ['cut', 'Cut each type of neurone and test the result']],
  mount(host, L) {
    let tab = 'react';
    const draw = () => {
      host.innerHTML = segBar([['react', 'Reaction test'], ['race', 'Reflex or decision'], ['cut', 'Damage detective']], tab) + '<div id="lab-body" class="lcol" style="margin-top:16px"></div>';
      $$('[data-tab]', host).forEach(b => b.onclick = () => { L.reset(); tab = b.dataset.tab; draw() });
      ({ react: tReact, race: tReflexRace, cut: tCut })[tab]($('#lab-body', host), L);
    };
    draw();
  }
};

function tReact(h, L) {
  h.innerHTML = `<p>Tap the box as soon as it turns pink. Five tries. Do not tap early.</p>
  <button class="ruler-zone" id="zone">Tap to start</button>
  <div class="readout"><div class="rd"><b id="last">-</b><span>Last try</span></div><div class="rd"><b id="mean">-</b><span>Average</span></div><div class="rd"><b id="cnt">0 / 5</b><span>Tries</span></div></div>
  <div id="cmp" class="callout">Your reaction is a <b>voluntary</b> response. Light hits your retina, the signal goes to your brain, your brain decides, and a motor neurone tells your finger to move. A typical reaction takes about 200 to 300 ms. A reflex such as the knee-jerk takes about 50 ms.</div>`;
  const z = $('#zone', h); let phase = 'idle', t0 = 0, timer = 0; const res = [];
  L.cleanup(() => clearTimeout(timer));
  const setZ = (c, t) => { z.className = 'ruler-zone ' + c; z.textContent = t };
  z.onpointerdown = e => {
    e.preventDefault();
    if (phase === 'idle') { phase = 'wait'; setZ('wait', 'Wait for pink...'); timer = setTimeout(() => { phase = 'go'; t0 = performance.now(); setZ('ready', 'TAP NOW'); buzz(15) }, 1300 + Math.random() * 2600) }
    else if (phase === 'wait') { clearTimeout(timer); phase = 'idle'; setZ('', 'Too early. Tap to try again.'); sfx('no') }
    else if (phase === 'go') {
      const ms = Math.round(performance.now() - t0); res.push(ms); phase = 'idle'; sfx('ok');
      $('#last', h).textContent = ms + ' ms'; $('#mean', h).textContent = Math.round(res.reduce((a, b) => a + b) / res.length) + ' ms'; $('#cnt', h).textContent = Math.min(res.length, 5) + ' / 5';
      if (res.length >= 5) { setZ('', 'Done. Tap to run again.'); L.done('react'); res.length = 0 } else setZ('', 'Tap for the next try');
    }
  };
}

function tReflexRace(h, L) {
  h.innerHTML = `<div class="stage"><svg viewBox="0 0 420 300">
   <ellipse cx="300" cy="44" rx="52" ry="30" class="t-sig s-sig w3"/><text class="tx tx-ink" x="300" y="48" text-anchor="middle">brain</text>
   <line x1="300" x2="300" y1="76" y2="256" class="s-l w8 rnd" opacity=".5"/><text class="tx" x="312" y="170">spinal cord</text>
   <g id="armg" style="transform-origin:200px 214px;transition:transform .35s"><path d="M200 214L56 252" class="s-l w8 rnd nofill" opacity=".7"/><ellipse id="mus" cx="130" cy="232" rx="26" ry="11" class="t-vio s-vio w2" style="transform-origin:130px 232px;transition:transform .3s"/><circle cx="52" cy="253" r="12" class="f-s2 s-l w2"/>
   <path class="f-amb" d="M30 270c-5 4-8 10-5 15c3 5 11 5 14 0c2-5-1-9-4-14c-1 3-2 3-3 1z" id="flame"/></g>
   <path id="rp" d="M52 253L150 264L296 238L296 224L252 207L136 226" class="nofill s-amb w2 dash"/>
   <path id="vp" d="M52 253L150 264L296 238L296 96L300 70L296 96L296 224L252 207L136 226" class="nofill s-sig w2 dash"/>
   <circle id="dr" r="8" cx="52" cy="253" class="f-amb glow" style="opacity:0" stroke="var(--bg)" stroke-width="2.5"/>
   <circle id="dv" r="8" cx="52" cy="253" class="f-sig glow" style="opacity:0" stroke="var(--bg)" stroke-width="2.5"/>
   <text class="tx" x="14" y="20" style="fill:var(--amber)">orange: reflex arc</text><text class="tx" x="14" y="36" style="fill:var(--signal)">pink: through the brain</text>
  </svg></div>
  <div class="readout"><div class="rd"><b id="rt" style="color:var(--amber)">-</b><span>Reflex: hand moves</span></div><div class="rd"><b id="vt" style="color:var(--signal)">-</b><span>Brain is aware (pain felt)</span></div></div>
  <div class="row"><button class="btn pri" id="go">Touch the flame</button></div>
  <div class="callout" id="why">The reflex path is short: it only goes as far as the spinal cord. The path through the brain is longer and has more synapses, so you feel the pain after your hand has already moved.</div>`;
  let busy = false;
  $('#go', h).onclick = () => {
    if (busy) return; busy = true; $('#armg', h).style.transform = ''; $('#mus', h).style.transform = ''; $('#rt', h).textContent = '-'; $('#vt', h).textContent = '-';
    const rp = $('#rp', h), vp = $('#vp', h), lr = rp.getTotalLength(), lv = vp.getTotalLength(), dr = $('#dr', h), dv = $('#dv', h); dr.style.opacity = dv.style.opacity = 1;
    let rd = false;
    L.stop(tween(4200, k => {
      const kr = clamp(k / .26, 0, 1), kv = clamp(k / .95, 0, 1);
      const a = rp.getPointAtLength(lr * kr); dr.setAttribute('cx', a.x); dr.setAttribute('cy', a.y);
      const b = vp.getPointAtLength(lv * kv); dv.setAttribute('cx', b.x); dv.setAttribute('cy', b.y);
      if (kr >= 1 && !rd) { rd = true; dr.style.opacity = 0; $('#armg', h).style.transform = 'rotate(32deg)'; $('#mus', h).style.transform = 'scale(1.25,.8)'; $('#rt', h).textContent = '50 ms'; sfx('ok'); buzz(20) }
    }, () => { dv.style.opacity = 0; $('#vt', h).textContent = '300 ms'; busy = false; L.done('race'); sfx('tick') }));
  };
}

function tCut(h, L) {
  const seg = { sens: 'M106 62H238Q282 62 290 96', relay: 'M290 98V176', motor: 'M290 176Q282 212 240 214H120' };
  const cutAt = { sens: [196, 62], relay: [290, 138], motor: [200, 214] };
  const OUT = {
    none: ['Normal. The impulse completes the whole arc. The arm withdraws and the brain is told, so she feels the pain.', 0],
    sens: ['The impulse stops in the sensory neurone. It never reaches the spinal cord. No pain is felt and the arm does not move.', 2],
    relay: ['The reflex pathway is broken, so there is no automatic withdrawal. She can still feel pain because the sensory neurone also sends the signal up to the brain.', 1],
    motor: ['The impulse reaches the spinal cord and the brain is told, so she feels pain. The motor neurone is cut, so the muscle never gets the message and the arm does not move.', 1]
  };
  const PRED = ['Feels pain and the arm withdraws', 'Feels pain but the arm does not move', 'No pain and the arm does not move'];
  h.innerHTML = `<div class="stage"><svg viewBox="0 0 420 270" id="csv">${DIAG.arc.svg()}<g id="cutmark" style="opacity:0"><circle r="14" class="f-bg s-sig w3"/><path d="M-6 -6L6 6M6 -6L-6 6" class="s-sig w3 rnd nofill"/></g><circle id="cd" r="9" cx="96" cy="60" class="f-sig glow" style="opacity:0" stroke="var(--bg)" stroke-width="3"/>
   ${Object.entries(seg).map(([k, d]) => `<path id="sg-${k}" d="${d}" class="nofill" stroke="none"/>`).join('')}</svg></div>
  <div><h4>1. Cut a neurone</h4><div class="seg" id="cuts" style="margin-top:8px"><button data-c="none" aria-selected="true">None</button><button data-c="sens" aria-selected="false">Sensory</button><button data-c="relay" aria-selected="false">Relay</button><button data-c="motor" aria-selected="false">Motor</button></div></div>
  <div><h4>2. Predict what happens when she touches something hot</h4><div class="opts" id="pred" style="margin-top:8px">${PRED.map((p, i) => `<button class="opt" data-p="${i}" style="grid-template-columns:1fr"><span>${p}</span></button>`).join('')}</div></div>
  <div class="row"><button class="btn pri" id="test" disabled>Test it</button><span class="mut small" id="tested"></span></div>
  <div class="callout" id="res" aria-live="polite">Choose a cut and make a prediction first.</div>`;
  let cut = 'none', pred = null; const tested = new Set();
  const refresh = () => { $('#test', h).disabled = pred === null; $$('#cuts button', h).forEach(b => b.setAttribute('aria-selected', b.dataset.c === cut)); $$('#pred .opt', h).forEach(b => b.classList.toggle('sel', +b.dataset.p === pred)); $$('.part', h).forEach(g => { g.style.opacity = cut === g.dataset.p ? 1 : (cut === 'none' ? 1 : .55) }); $('#cutmark', h).style.opacity = cut === 'none' ? 0 : 1; if (cut !== 'none') $('#cutmark', h).setAttribute('transform', `translate(${cutAt[cut][0]} ${cutAt[cut][1]})`) };
  $$('#cuts button', h).forEach(b => b.onclick = () => { cut = b.dataset.c; refresh() });
  $$('#pred .opt', h).forEach(b => b.onclick = () => { pred = +b.dataset.p; refresh() });
  $('#test', h).onclick = () => {
    const d = $('#cd', h); d.style.opacity = 1;
    const order = ['sens', 'relay', 'motor'], stopIdx = cut === 'none' ? 3 : order.indexOf(cut);
    const els = order.map(k => $('#sg-' + k, h)); let i = 0;
    const runSeg = () => {
      if (i >= stopIdx) { return finish() }
      const p = els[i], Ln = p.getTotalLength(), full = i < stopIdx, stopAtMid = false;
      L.stop(tween(i === 0 ? 1100 : 600, k => { const pt = p.getPointAtLength(Ln * k); d.setAttribute('cx', pt.x); d.setAttribute('cy', pt.y) }, () => { i++; runSeg() }));
    };
    const finish = () => {
      if (cut !== 'none') {
        const p = els[stopIdx], Ln = p.getTotalLength();
        L.stop(tween(Ln > 150 ? 500 : 350, k => { const pt = p.getPointAtLength(Ln * k * .5); d.setAttribute('cx', pt.x); d.setAttribute('cy', pt.y) }, () => { d.style.opacity = 0; show() }));
      } else { d.style.opacity = 0; show() }
    };
    const show = () => {
      const [t, ans] = OUT[cut]; const right = pred === ans;
      $('#res', h).innerHTML = `<b>${right ? 'Your prediction was right.' : 'Not what you predicted.'}</b> ${t}`; sfx(right ? 'ok' : 'no');
      if (cut !== 'none') { tested.add(cut); $('#tested', h).textContent = `${tested.size} of 3 cuts tested`; if (tested.size === 3) L.done('cut') }
    };
    $('#test', h).disabled = true; $('#res', h).textContent = 'Testing...'; runSeg(); L.cleanup(() => { }); setTimeout(() => refresh(), 50);
  };
  refresh();
}
