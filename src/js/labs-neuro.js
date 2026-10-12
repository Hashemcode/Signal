/* ===== Lab: Impulse lab (neurone, synapse, speed race) ===== */
const LABS = {};
const tween = (dur, fn, done) => { const t0 = performance.now(); let alive = true; (function f(t) { if (!alive) return; const k = clamp((t - t0) / dur, 0, 1); fn(k); if (k < 1) requestAnimationFrame(f); else done && done() })(t0); return () => { alive = false } };
const segBar = (tabs, cur) => `<div class="seg" role="tablist">${tabs.map(([k, l]) => `<button role="tab" data-tab="${k}" aria-selected="${k === cur}">${l}</button>`).join('')}</div>`;
const tglHTML = (id, label, on) => `<button class="tgl" id="${id}" role="switch" aria-checked="${!!on}"><i></i><span>${label}</span></button>`;
function tglBind(el, fn) { el.onclick = () => { const v = el.getAttribute('aria-checked') !== 'true'; el.setAttribute('aria-checked', v); fn(v) } }
const slHTML = (id, label, min, max, val, unit = '', step = 1) => `<div class="sl"><label for="${id}">${label}<span id="${id}v">${val}${unit}</span></label><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}"></div>`;

LABS.neuro = {
  title: 'Impulse lab', topic: 0, sub: 'Neurone parts, the synapse and why myelin matters',
  challenges: [['parts', 'Tap all six parts of the neurone'], ['fire', 'Fire an impulse along the neurone'], ['syn', 'Run the synapse from start to finish'], ['block', 'Block the receptors and see what happens'], ['race', 'Race the myelinated and unmyelinated fibres']],
  mount(host, L) {
    let tab = 'neurone';
    const draw = () => {
      host.innerHTML = segBar([['neurone', 'Neurone'], ['synapse', 'Synapse'], ['race', 'Speed race']], tab) + '<div id="lab-body" class="lcol" style="margin-top:16px"></div>';
      $$('[data-tab]', host).forEach(b => b.onclick = () => { L.reset(); tab = b.dataset.tab; draw() });
      ({ neurone: tNeurone, synapse: tSynapse, race: tRace })[tab]($('#lab-body', host), L);
    };
    draw();
  }
};

function tNeurone(h, L) {
  const info = { dend: ['Dendrites', 'Branched endings that receive impulses from other cells.'], body: ['Cell body', 'Contains the nucleus and most of the cell’s machinery.'], nuc: ['Nucleus', 'Controls the activities of the neurone.'], axon: ['Axon', 'A long fibre that carries the impulse away from the cell body.'], myelin: ['Myelin sheath', 'Fatty insulation around the axon. It speeds up the impulse.'], term: ['Axon terminals', 'The ends of the axon. They release neurotransmitter into the synapse.'] };
  h.innerHTML = `<div class="stage"><svg viewBox="0 0 420 200" id="nsv">${DIAG.neurone.svg()}<path id="npath" d="M26 40Q46 62 70 85L92 100H318L352 76" class="nofill" stroke="none"/><circle id="ndot" r="9" class="f-sig glow" cx="0" cy="0" style="opacity:0" stroke="var(--bg)" stroke-width="3"/></svg></div>
  <div class="callout" id="info" aria-live="polite">Tap any part of the neurone to find out what it does.</div>
  <div class="row"><button class="btn pri" id="fire">${ico('bolt')}Fire impulse</button><span class="mut small" id="seen"></span></div>`;
  const seen = new Set();
  const upd = () => { $('#seen', h).textContent = `${seen.size} of 6 parts explored`; if (seen.size === 6) L.done('parts') };
  $$('.part', h).forEach(g => { const f = () => { $$('.part', h).forEach(x => x.style.opacity = .35); g.style.opacity = 1; const v = info[g.dataset.p]; $('#info', h).innerHTML = `<b>${v[0]}</b>. ${v[1]}`; seen.add(g.dataset.p); upd(); sfx('tap') }; g.onclick = f; g.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); f() } } });
  upd();
  $('#fire', h).onclick = () => {
    $$('.part', h).forEach(x => x.style.opacity = 1);
    $('#info', h).innerHTML = 'The impulse travels: <b>dendrites</b>, <b>cell body</b>, <b>axon</b>, <b>axon terminals</b>.';
    const p = $('#npath', h), d = $('#ndot', h), Ln = p.getTotalLength(); d.style.opacity = 1;
    L.stop(tween(2400, k => { const pt = p.getPointAtLength(Ln * k); d.setAttribute('cx', pt.x); d.setAttribute('cy', pt.y) }, () => { d.style.opacity = 0; L.done('fire') }));
  };
}

function tSynapse(h, L) {
  h.innerHTML = `<div class="stage"><svg viewBox="0 0 420 300" id="ssv">
   <defs><clipPath id="bulb"><path d="M110 -10V70Q110 120 210 120T310 70V-10Z"/></clipPath></defs>
   <path id="pre" class="t-sig s-sig w3" d="M110 -10V70Q110 120 210 120T310 70V-10Z"/>
   <text class="tx" x="124" y="24">axon terminal (neurone 1)</text>
   <path id="post" class="t-sky s-sky w3" d="M90 252Q210 226 330 252V312H90Z"/>
   <text class="tx" x="104" y="286">next neurone (neurone 2)</text>
   <text class="tx" x="340" y="190">synapse</text>
   <g id="recs"></g><g id="ves"></g><g id="parts"></g>
   <circle id="flash" r="10" cx="210" cy="8" class="f-sig glow" style="opacity:0"/>
   <circle id="newimp" r="10" cx="95" cy="276" class="f-sig glow" style="opacity:0"/>
  </svg></div>
  <div class="callout" id="stepinfo" aria-live="polite"><b>Step 0.</b> Press Next step to begin.</div>
  <div class="row"><button class="btn pri" id="nx">Next step</button><button class="btn ghost" id="rs">${ico('reset')}Restart</button>${tglHTML('blk', 'Block the receptors (drug)', false)}</div>`;
  const svg = $('#ssv', h), ns = 'http://www.w3.org/2000/svg';
  const mk = (tag, a, p) => { const e = document.createElementNS(ns, tag); Object.entries(a).forEach(([k, v]) => e.setAttribute(k, v)); (p || svg).appendChild(e); return e };
  const recXs = [150, 195, 240, 285];
  recXs.forEach(x => mk('path', { d: `M${x - 9} 241 L${x} 251 L${x + 9} 241`, class: 'nofill s-vio w3 rnd', 'data-r': x }, $('#recs', h)));
  let P_ = [], ves = [];
  const vpos = [[150, 62], [190, 80], [235, 76], [275, 60], [170, 46], [255, 44]];
  const reset = () => { $('#parts', h).innerHTML = ''; $('#ves', h).innerHTML = ''; P_ = []; ves = vpos.map(([x, y]) => ({ c: mk('circle', { cx: x, cy: y, r: 9, class: 'f-s1 s-sig w2' }, $('#ves', h)), x, y, dots: [0, 1].map(k => mk('circle', { cx: x - 3 + k * 6, cy: y + (k ? 2 : -2), r: 2.4, class: 'f-amb' }, $('#ves', h))) }));
    $$('#recs path', h).forEach(r => r.setAttribute('class', 'nofill s-vio w3 rnd')); $('#post', h).setAttribute('class', 't-sky s-sky w3'); step = 0; $('#stepinfo', h).innerHTML = '<b>Step 0.</b> Press Next step to begin.'; $('#nx', h).disabled = false; $('#nx', h).textContent = 'Next step' };
  let step = 0, blocked = false, ranBlocked = false;
  const txt = ['', 'An electrical <b>impulse</b> arrives at the axon terminal.', 'Vesicles join the membrane and release <b>neurotransmitter</b> into the synapse.', 'Neurotransmitter <b>diffuses</b> across the gap.', '', ''];
  const post = $('#post', h);
  $('#nx', h).onclick = () => {
    step++; sfx('tap');
    if (step === 1) { const f = $('#flash', h); f.style.opacity = 1; L.stop(tween(700, k => f.setAttribute('cy', 8 + k * 60), () => f.style.opacity = 0)); $('#stepinfo', h).innerHTML = '<b>Step 1.</b> ' + txt[1] }
    if (step === 2) {
      ves.forEach((v, i) => { v.c.style.opacity = 0; v.dots.forEach(d => d.style.opacity = 0) });
      vpos.forEach(([x, y]) => { for (let k = 0; k < 3; k++) P_.push({ e: mk('circle', { cx: x, cy: y + 12, r: 3.6, class: 'f-amb' }, $('#parts', h)), x: x + (Math.random() - .5) * 20, y: y + 14 + Math.random() * 10, vx: (Math.random() - .5) * .6, vy: .3, st: 0 }) });
      L.stop(tween(900, k => P_.forEach(p => p.e.setAttribute('cy', p.y + k * 18))));
      $('#stepinfo', h).innerHTML = '<b>Step 2.</b> ' + txt[2];
    }
    if (step === 3) {
      $('#stepinfo', h).innerHTML = '<b>Step 3.</b> ' + txt[3];
      const t0 = performance.now(), ends = P_.map((p, i) => ({ tx: recXs[i % 4] + (Math.random() - .5) * 8, ty: blocked ? 236 + Math.random() * 6 : 238 }));
      const sx = P_.map(p => +p.e.getAttribute('cx')), sy = P_.map(p => +p.e.getAttribute('cy'));
      L.stop(tween(1800, k => P_.forEach((p, i) => { const wob = Math.sin(k * 9 + i) * 6 * (1 - k); p.e.setAttribute('cx', lerp(sx[i], ends[i].tx, k) + wob); p.e.setAttribute('cy', lerp(sy[i], ends[i].ty, k)) })));
    }
    if (step === 4) {
      if (blocked) {
        P_.forEach(p => { p.e.style.transition = 'transform 1s'; p.e.style.transform = 'translateY(-26px)'; p.e.style.opacity = .3 });
        $('#stepinfo', h).innerHTML = '<b>Step 4.</b> The receptors are blocked, so the neurotransmitter cannot bind. <b>No impulse starts</b> in neurone 2. The message stops here.'; ranBlocked = true; L.done('block');
      } else {
        $$('#recs path', h).forEach(r => r.setAttribute('class', 'nofill s-sig w5 rnd')); post.setAttribute('class', 't-sig s-sig w3');
        $('#stepinfo', h).innerHTML = '<b>Step 4.</b> Neurotransmitter <b>binds to receptors</b> on neurone 2. This starts a <b>new electrical impulse</b>.';
        const d = $('#newimp', h); d.style.opacity = 1; L.stop(tween(1100, k => d.setAttribute('cx', 95 + k * 230), () => { d.style.opacity = 0; L.done('syn') }));
      }
      $('#nx', h).disabled = true; $('#nx', h).textContent = 'Finished';
    }
  };
  $('#rs', h).onclick = () => { L.stop(); reset() };
  tglBind($('#blk', h), v => { blocked = v; L.stop(); reset(); toast(v ? 'Receptors blocked. Run the steps again.' : 'Receptors working') });
  reset();
}

function tRace(h, L) {
  const dist = 1;      // metres from spinal cord to fingertip (rough)
  const fast = 100, slow = 2;    // m/s (myelinated vs unmyelinated)
  h.innerHTML = `<div class="stage"><svg viewBox="0 0 420 220">
   <text class="tx tx-ink" x="16" y="26">Myelinated axon (about 100 m/s)</text>
   <line x1="30" x2="390" y1="62" y2="62" class="s-sig w5 rnd"/>
   ${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<rect x="${44 + i * 44}" y="50" width="34" height="24" rx="12" class="f-amb"/>`).join('')}
   <circle id="d1" r="9" cx="30" cy="62" class="f-sig glow" stroke="var(--bg)" stroke-width="3"/>
   <text class="tx tx-ink" x="16" y="116">Unmyelinated axon (about 2 m/s)</text>
   <line x1="30" x2="390" y1="152" y2="152" class="s-sig w5 rnd"/>
   <circle id="d2" r="9" cx="30" cy="152" class="f-sig glow" stroke="var(--bg)" stroke-width="3"/>
   <text class="tx" x="30" y="196">spinal cord</text><text class="tx" x="390" y="196" text-anchor="end">fingertip, 1 m away</text>
  </svg></div>
  <div class="readout"><div class="rd"><b id="t1">0 ms</b><span>Myelinated</span></div><div class="rd"><b id="t2">0 ms</b><span>Unmyelinated</span></div></div>
  <div class="row"><button class="btn pri" id="go">${ico('play')}Send both impulses</button></div>
  <p class="mut small">The animation is slowed down so you can see it. The times shown are the real ones. Myelin makes the impulse about 50 times faster, which matters when a reflex has to protect you.</p>`;
  let busy = false;
  $('#go', h).onclick = () => {
    if (busy) return; busy = true;
    const tF = dist / fast * 1000, tS = dist / slow * 1000, vis = 5200;
    $('#t1', h).textContent = '0 ms'; $('#t2', h).textContent = '0 ms';
    L.stop(tween(vis, k => {
      const sim = k * tS;
      $('#d2', h).setAttribute('cx', 30 + 360 * k); $('#d1', h).setAttribute('cx', 30 + 360 * Math.min(1, sim / tF));
      $('#t1', h).textContent = Math.round(Math.min(sim, tF)) + ' ms'; $('#t2', h).textContent = Math.round(sim) + ' ms';
    }, () => { busy = false; L.done('race'); sfx('win') }));
  };
}
