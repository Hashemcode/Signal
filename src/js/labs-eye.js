/* ===== Lab: Eye lab (pupil reflex, accommodation) ===== */
LABS.eye = {
  title: 'Eye lab', topic: 2, sub: 'Change the light, then focus on near and far objects',
  challenges: [['bright', 'Make the pupil as small as it goes'], ['dim', 'Make the pupil as large as it goes'], ['flash', 'Flash a torch into the eye'], ['near', 'Bring a near object (under 30 cm) into sharp focus'], ['far', 'Bring a distant object (over 3 m) into sharp focus']],
  mount(host, L) {
    let tab = 'pupil';
    const draw = () => {
      host.innerHTML = segBar([['pupil', 'Pupil and light'], ['focus', 'Focusing']], tab) + '<div id="lab-body" class="lcol" style="margin-top:16px"></div>';
      $$('[data-tab]', host).forEach(b => b.onclick = () => { L.reset(); tab = b.dataset.tab; draw() });
      ({ pupil: tPupil, focus: tFocus })[tab]($('#lab-body', host), L);
    };
    draw();
  }
};

function tPupil(h, L) {
  const rays = Array.from({ length: 40 }, (_, i) => { const a = i / 40 * Math.PI * 2; return `<line x1="${(150 + Math.cos(a) * 15).toFixed(1)}" y1="${(150 + Math.sin(a) * 15).toFixed(1)}" x2="${(150 + Math.cos(a) * 62).toFixed(1)}" y2="${(150 + Math.sin(a) * 62).toFixed(1)}"/>` }).join('');
  h.innerHTML = `<div class="twocol"><div class="lcol"><div class="stage"><svg viewBox="0 0 300 300" id="psv">
    <defs><radialGradient id="irisg" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#7FB2D8"/><stop offset=".6" stop-color="#3E78A8"/><stop offset="1" stop-color="#1F4A72"/></radialGradient><clipPath id="almond"><path d="M8 150Q150 22 292 150Q150 278 8 150Z"/></clipPath></defs>
    <rect id="pbg" width="300" height="300" fill="#0b1b30"/>
    <path d="M8 150Q150 22 292 150Q150 278 8 150Z" fill="#EEF4F8" stroke="var(--line2)" stroke-width="3"/>
    <g clip-path="url(#almond)"><circle cx="150" cy="150" r="64" fill="url(#irisg)"/><g id="radial" stroke="#cfe6f7" stroke-width="1.2" opacity=".6">${rays}</g><g id="circ" fill="none" stroke="#cfe6f7" stroke-width="1.6"><circle cx="150" cy="150" r="30"/><circle cx="150" cy="150" r="38"/><circle cx="150" cy="150" r="46"/></g>
    <circle id="pup" cx="150" cy="150" r="30" fill="#04070d"/><ellipse cx="132" cy="130" rx="9" ry="5" fill="#fff" opacity=".7" transform="rotate(-30 132 130)"/></g>
    <path d="M8 150Q150 22 292 150Q150 278 8 150Z" fill="none" stroke="var(--line2)" stroke-width="3"/>
   </svg></div></div>
   <div class="lcol ctrl">${slHTML('lt', 'Light level', 0, 100, 50, '%')}
    <button class="btn" id="flash">Flash a torch</button>
    <div class="readout"><div class="rd"><b id="pd">-</b><span>Pupil diameter</span></div><div class="rd"><b id="rcm" style="font-size:17px">-</b><span>Iris muscles</span></div><div class="rd"><b id="rr" style="font-size:17px">-</b><span>Active receptors</span></div></div>
    <div class="callout" id="pinfo"></div></div></div>`;
  const lt = $('#lt', h); let target = 50, cur = 50, dia = 5, fl = false;
  const bgc = k => { const a = [11, 27, 48], b = [190, 226, 250]; return `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], k))).join(',')})` };
  const upd = (light, d) => {
    const r = d * 6; $('#pup', h).setAttribute('r', r);
    $('#pbg', h).setAttribute('fill', bgc(light / 100)); $('#radial', h).setAttribute('opacity', (1 - light / 100) * .85 + .1); $('#circ', h).setAttribute('opacity', (light / 100) * .9 + .05);
    $('#pd', h).textContent = d.toFixed(1) + ' mm';
  };
  const target_d = l => 8 - 6 * Math.pow(l / 100, .62);
  let tellT = 0;
  const info = () => {
    const l = target;
    $('#rcm', h).innerHTML = l > 55 ? 'Circular contract<br>Radial relax' : l < 40 ? 'Radial contract<br>Circular relax' : 'Both partly active';
    $('#rr', h).textContent = l > 55 ? 'Cones (colour)' : l < 30 ? 'Rods (dim light)' : 'Rods and cones';
    $('#pinfo', h).innerHTML = l > 70 ? '<b>Bright light.</b> Circular muscles contract and radial muscles relax. The pupil gets smaller so less light reaches the retina. This protects the receptors.' : l < 30 ? '<b>Dim light.</b> Radial muscles contract and circular muscles relax. The pupil gets larger so more light enters the eye.' : '<b>Medium light.</b> Slide towards bright or dark to see the iris muscles change.';
  };
  lt.oninput = () => { target = +lt.value; $('#ltv', h).textContent = target + '%'; info() };
  $('#flash', h).onclick = () => {
    if (fl) return; fl = true; const from = target; sfx('tick');
    L.stop(tween(250, k => { target = lerp(from, 100, k); lt.value = target; $('#ltv', h).textContent = Math.round(target) + '%'; info() }, () => { setTimeout(() => { L.stop(tween(2000, k => { target = lerp(100, from, k); lt.value = target; $('#ltv', h).textContent = Math.round(target) + '%'; info() }, () => fl = false)) }, 1500); L.done('flash') }));
  };
  let last = performance.now();
  L.loop(t => {
    const dt = Math.min(.1, (t - last) / 1000); last = t;
    cur += (target - cur) * Math.min(1, dt / .28);
    const want = target_d(cur); dia += (want - dia) * Math.min(1, dt / .18);
    upd(cur, dia);
    if (target >= 92 && dia < 2.7) L.done('bright'); if (target <= 8 && dia > 7.3) L.done('dim');
  });
  info();
}

function tFocus(h, L) {
  const LX = 215, RX = 351, EX = 6;   // lens x, retina x, exaggeration of image shift
  h.innerHTML = `<div class="stage"><svg viewBox="0 0 480 270" id="fsv">
   <ellipse cx="271" cy="135" rx="104" ry="100" class="f-s2 s-l w3"/><ellipse cx="271" cy="135" rx="94" ry="90" class="f-bg"/>
   <path d="M351 66Q374 135 351 204" class="nofill s-sig w5 rnd"/><text class="tx" x="364" y="60">retina</text>
   <path d="M178 82Q150 135 178 188" class="t-sky s-sky w5 rnd nofill"/>
   <path d="M190 98l-4 20M190 172l-4-20" class="s-amb w5 rnd"/>
   <g id="ligs" class="nofill s-ink w2 rnd"><path id="lg1"/><path id="lg2"/></g>
   <ellipse id="cb1" class="t-vio s-vio w2"/><ellipse id="cb2" class="t-vio s-vio w2"/>
   <ellipse id="lens" cx="${LX}" cy="135" ry="36" class="t-sky s-sky w3"/>
   <g id="rays" class="nofill s-amb w2"><polyline id="r1"/><polyline id="r2"/><polyline id="r3"/></g>
   <circle id="img" r="5" class="f-bg s-amb w2"/><line id="blur" x1="351" x2="351" class="s-sig w5 rnd"/>
   <circle id="obj" r="9" cy="135" class="f-amb glow"/><text class="tx" id="objt" y="162">object</text>
   <text class="tx" x="212" y="236">lens</text>
  </svg></div>
  <p class="tiny mut">Diagram is not to scale. Image shifts are exaggerated so you can see them.</p>
  <div class="twocol"><div class="lcol ctrl">${slHTML('dist', 'Distance of object', 0, 100, 100, '')}
   ${slHTML('cil', 'Ciliary muscles', 0, 100, 0, '%')}</div>
   <div class="lcol"><div class="readout"><div class="rd"><b id="od">-</b><span>Object distance</span></div><div class="rd"><b id="sh">-</b><span>Sharpness</span></div></div><button class="btn" id="auto">Show me the right setting</button></div></div>
  <div class="callout" id="finfo" aria-live="polite"></div>`;
  const dist = $('#dist', h), cil = $('#cil', h); let manual = true;
  const U = s => 0.15 * Math.pow(6 / 0.15, s / 100);        // metres
  const setTxt = (id, t) => $(id, h).textContent = t;
  function update() {
    const u = U(+dist.value), A = +cil.value / 100 * 7, P = 58.8 + A, v = 1 / (P - 1 / u) * 1000;   // mm
    const vpx = (RX - LX) + (v - 17) * 8 * EX * 2;
    const xo = lerp(150, 24, Math.log(u / .15) / Math.log(6 / .15));
    $('#obj', h).setAttribute('cx', xo); $('#objt', h).setAttribute('x', xo - 18); $('#objt', h).textContent = u < 1 ? Math.round(u * 100) + ' cm' : u.toFixed(1) + ' m';
    const c = +cil.value / 100, rx = lerp(9, 24, c); $('#lens', h).setAttribute('rx', rx);
    $('#cb1', h).setAttribute('cx', 204); $('#cb1', h).setAttribute('cy', 84); $('#cb1', h).setAttribute('rx', lerp(22, 12, c)); $('#cb1', h).setAttribute('ry', lerp(9, 13, c));
    $('#cb2', h).setAttribute('cx', 204); $('#cb2', h).setAttribute('cy', 186); $('#cb2', h).setAttribute('rx', lerp(22, 12, c)); $('#cb2', h).setAttribute('ry', lerp(9, 13, c));
    const lg = (y0, dir) => { const ay = y0 + dir * lerp(-6, 8, c), sag = lerp(0, 9, c); return `M${LX - 4} ${135 - dir * 34}Q${LX - 4 - sag} ${(135 - dir * 34 + ay) / 2} ${202} ${ay}` };
    $('#lg1', h).setAttribute('d', lg(98, -1).replace(/NaN/g, '0')); $('#lg2', h).setAttribute('d', lg(172, 1));
    $('#ligs', h).setAttribute('stroke-width', lerp(3.4, 1.4, c));
    const ys = [-30, 0, 30], ray = (i, yl) => { const slope = (135 - (135 + yl)) / vpx; const yR = 135 + yl + slope * (RX - LX); const pts = `${xo},135 ${LX},${135 + yl} ${RX},${yR}`; $('#r' + (i + 1), h).setAttribute('points', pts); return yR };
    const yTop = ray(0, -30), yBot = ray(2, 30); $('#r2', h).setAttribute('points', `${xo},135 ${RX},135`);
    const blur = Math.abs(yTop - 135);
    const bl = $('#blur', h); bl.setAttribute('y1', 135 - blur); bl.setAttribute('y2', 135 + blur);
    const im = $('#img', h); im.setAttribute('cx', LX + vpx); im.setAttribute('cy', 135); im.style.display = LX + vpx < 440 ? '' : 'none';
    const sharp = clamp(1 - blur / 16, 0, 1), need = 1 / u;
    setTxt('#cilv', Math.round(c * 100) + '%'); $('#distv', h).textContent = u < 1 ? Math.round(u * 100) + ' cm' : u.toFixed(1) + ' m';
    setTxt('#od', u < 1 ? Math.round(u * 100) + ' cm' : u.toFixed(1) + ' m'); setTxt('#sh', Math.round(sharp * 100) + '%');
    const ok = sharp > .9;
    let msg;
    if (ok) msg = c > .5 ? '<b>In focus.</b> Ciliary muscles are contracted, the suspensory ligaments are slack and the lens is fat. Light from the near object is bent more.' : c < .25 ? '<b>In focus.</b> Ciliary muscles are relaxed, the suspensory ligaments are tight and the lens is thin. A distant object needs little bending.' : '<b>In focus.</b> The lens thickness matches the distance.';
    else msg = (v > 17 + .05 ? '<b>Image forms behind the retina.</b> The lens is too thin for this distance. Contract the ciliary muscles so the lens gets fatter.' : '<b>Image forms in front of the retina.</b> The lens is too fat for this distance. Relax the ciliary muscles so the lens gets thinner.');
    $('#finfo', h).innerHTML = msg;
    if (ok && manual) { if (u < .3) L.done('near'); if (u > 3) L.done('far') }
    $('#sh', h).style.color = ok ? 'var(--good)' : '';
  }
  dist.oninput = () => { manual = true; update() }; cil.oninput = () => { manual = true; update() };
  $('#auto', h).onclick = () => {
    const u = U(+dist.value), want = clamp(1 / u / 7 * 100, 0, 100), from = +cil.value; manual = false;
    L.stop(tween(900, k => { cil.value = lerp(from, want, k); update() }, () => toast('That is the ciliary muscle setting for this distance')));
  };
  update();
}
