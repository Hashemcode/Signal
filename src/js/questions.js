/* ===== Question engine: every type renders from (question, session) and grades to a fraction ===== */
const TYPE_LABEL = { mcq: 'Multiple choice', tf: 'True or false', order: 'Put in order', match: 'Match up', sort: 'Sort into groups', label: 'Tap the diagram', explain: 'Written answer' };
const marksOf = q => q.type === 'explain' ? q.marks : (q.type === 'order' || q.type === 'match' || q.type === 'sort') ? 2 : 1;
const norm = s => ' ' + String(s).toLowerCase().replace(/[^a-z0-9\s'’-]/g, ' ').replace(/\s+/g, ' ') + ' ';
const LET = 'ABCD';
const OK_ICON = ico('check'), NO_ICON = ico('x');

const QT = {
  mcq: {
    init: (q, s) => { s.order = s.order || shuffle([q.a, ...q.w]) },
    view(q, s, o) {
      const fig = q.fig ? `<div class="fig">${chartSVG(q.fig)}</div>` : '';
      const opts = s.order.map((t, i) => {
        let c = 'opt';
        if (s.reveal) { if (t === q.a) c += ' good'; else if (t === s.v) c += ' bad' } else if (t === s.v) c += ' sel';
        if (s.gone && s.gone.includes(t) && !s.reveal) c += ' gone';
        return `<button class="${c}" data-v="${esc(t)}" ${s.reveal || (s.gone && s.gone.includes(t)) ? 'disabled' : ''}><span class="k">${LET[i]}</span><span>${esc(t)}</span></button>`;
      }).join('');
      const hint = (o.mode === 'practice' && !s.reveal && !s.hinted) ? `<button class="btn ghost sm" data-hint style="align-self:flex-start">Remove two wrong answers (half marks)</button>` : '';
      return `<p class="qtext">${esc(q.q)}</p>${fig}<div class="opts">${opts}</div>${hint}`;
    },
    bind(h, q, s, api, o) {
      $$('.opt', h).forEach(b => b.onclick = () => { api.set(b.dataset.v); if (o.mode === 'practice') api.submit() });
      const hb = $('[data-hint]', h); if (hb) hb.onclick = () => { s.hinted = true; s.gone = shuffle(s.order.filter(t => t !== q.a)).slice(0, 2); api.draw() };
    },
    complete: (q, s) => s.v !== undefined,
    grade: (q, s) => s.v === q.a ? (s.hinted ? .5 : 1) : 0
  },
  tf: {
    view(q, s) {
      const mk = (val, lab, ic) => { let c = 'opt'; if (s.reveal) { if (val === q.a) c += ' good'; else if (val === s.v) c += ' bad' } else if (val === s.v) c += ' sel'; return `<button class="${c}" data-v="${val}" ${s.reveal ? 'disabled' : ''}><span class="k">${ic}</span><span>${lab}</span></button>` };
      return `<p class="qtext">${esc(q.q)}</p><div class="opts two">${mk(true, 'True', OK_ICON)}${mk(false, 'False', NO_ICON)}</div>`;
    },
    bind(h, q, s, api, o) { $$('.opt', h).forEach(b => b.onclick = () => { api.set(b.dataset.v === 'true'); if (o.mode === 'practice') api.submit() }) },
    complete: (q, s) => s.v !== undefined,
    grade: (q, s) => s.v === q.a ? 1 : 0
  },
  order: {
    init: (q, s) => { s.order = s.order || shuffle(q.steps.map((_, i) => i)); s.v = s.v || [] },
    view(q, s) {
      const n = q.steps.length;
      const chosen = s.v.map((i, k) => { let c = 'st'; if (s.reveal) c += q.steps[k] === q.steps[i] ? ' good' : ' bad'; return `<span class="${c}"><b>${k + 1}</b>${esc(q.steps[i])}</span>` }).join('');
      const pool = s.order.filter(i => !s.v.includes(i)).map(i => `<button class="opt" data-i="${i}" style="grid-template-columns:1fr"><span>${esc(q.steps[i])}</span></button>`).join('');
      const ctl = !s.reveal && s.v.length ? `<div class="row"><button class="btn ghost sm" data-undo>${ico('back')}Undo</button><button class="btn ghost sm" data-clear>Clear</button></div>` : '';
      const ans = s.reveal ? `<div class="model"><b>Correct order</b><ol style="margin:6px 0 0;padding-left:22px">${q.steps.map(x => `<li>${esc(x)}</li>`).join('')}</ol></div>` : '';
      return `<p class="qtext">${esc(q.q)}</p><div class="seq" aria-label="Your order">${chosen || '<span class="mut small">Tap the steps in order, first to last.</span>'}</div>${s.reveal ? '' : `<div class="opts">${pool}</div>`}${ctl}${ans}`;
    },
    bind(h, q, s, api) {
      $$('[data-i]', h).forEach(b => b.onclick = () => { api.set([...s.v, +b.dataset.i]) });
      const u = $('[data-undo]', h); if (u) u.onclick = () => api.set(s.v.slice(0, -1));
      const c = $('[data-clear]', h); if (c) c.onclick = () => api.set([]);
    },
    complete: (q, s) => s.v.length === q.steps.length,
    grade: (q, s) => { const ok = s.v.filter((i, k) => i === k).length; return ok === q.steps.length ? 1 : ok / q.steps.length * .75 }
  },
  match: {
    init: (q, s) => { s.order = s.order || shuffle(q.pairs.map((_, i) => i)); s.v = s.v || {}; s.sel = null },
    view(q, s) {
      const tagL = i => s.v[i] !== undefined ? `<span class="tag">${Object.keys(s.v).indexOf(String(i)) + 1}</span>` : '';
      const rightOf = {}; Object.entries(s.v).forEach(([l, r], k) => rightOf[r] = k + 1);
      const L = q.pairs.map((p, i) => { let c = 'pbtn'; if (s.reveal) c += s.v[i] === i ? ' good' : ' bad'; else if (s.sel === i) c += ' sel'; return `<button class="${c}" data-l="${i}" ${s.reveal ? 'disabled' : ''}>${esc(p[0])}${tagL(i)}</button>` }).join('');
      const Rr = s.order.map(i => { const t = rightOf[i]; return `<button class="pbtn" data-r="${i}" ${s.reveal ? 'disabled' : ''}>${esc(q.pairs[i][1])}${t ? `<span class="tag">${t}</span>` : ''}</button>` }).join('');
      const fix = s.reveal ? `<div class="model"><b>Correct pairs</b><ul style="margin:6px 0 0;padding-left:20px">${q.pairs.map(p => `<li>${esc(p[0])}: ${esc(p[1])}</li>`).join('')}</ul></div>` : '';
      return `<p class="qtext">${esc(q.q)}</p><p class="mut small">Tap a term, then tap its match. Tap a matched term to undo.</p><div class="pair-grid"><div class="col">${L}</div><div class="col">${Rr}</div></div>${fix}`;
    },
    bind(h, q, s, api) {
      $$('[data-l]', h).forEach(b => b.onclick = () => { const i = +b.dataset.l; if (s.v[i] !== undefined) { const v = { ...s.v }; delete v[i]; s.sel = null; api.set(v) } else { s.sel = s.sel === i ? null : i; api.draw() } });
      $$('[data-r]', h).forEach(b => b.onclick = () => {
        const r = +b.dataset.r; if (s.sel === null) return;
        const v = { ...s.v }; Object.keys(v).forEach(k => { if (v[k] === r) delete v[k] }); v[s.sel] = r; s.sel = null; api.set(v);
      });
    },
    complete: (q, s) => Object.keys(s.v).length === q.pairs.length,
    grade: (q, s) => q.pairs.filter((_, i) => s.v[i] === i).length / q.pairs.length
  },
  sort: {
    init: (q, s) => { s.order = s.order || shuffle(q.items.map((_, i) => i)); s.v = s.v || [] },
    view(q, s) {
      const rows = s.order.map(i => {
        const btn = k => { let c = ''; if (s.reveal) { if (q.items[i][1] === k) c = 'good'; else if (s.v[i] === k) c = 'bad' } else if (s.v[i] === k) c = 'sel'; return `<button class="${c}" data-i="${i}" data-k="${k}" ${s.reveal ? 'disabled' : ''}>${esc(q.cats[k])}</button>` };
        return `<div class="sortrow"><span>${esc(q.items[i][0])}</span><div class="ch">${btn(0)}${btn(1)}</div></div>`;
      }).join('');
      return `<p class="qtext">${esc(q.q)}</p><div>${rows}</div>`;
    },
    bind(h, q, s, api) { $$('[data-k]', h).forEach(b => b.onclick = () => { const v = s.v.slice(); v[+b.dataset.i] = +b.dataset.k; api.set(v) }) },
    complete: (q, s) => q.items.every((_, i) => s.v[i] !== undefined),
    grade: (q, s) => q.items.filter((it, i) => s.v[i] === it[1]).length / q.items.length
  },
  label: {
    view(q, s) {
      const nm = s.reveal ? `<div class="callout"><b>${esc(DIAG[q.diagram].parts[q.part])}</b>. ${esc(q.why)}</div>` : '';
      return `<p class="qtext">${esc(q.q)}</p>${diagramHTML(q.diagram)}${nm}`;
    },
    bind(h, q, s, api, o) {
      $$('.part', h).forEach(g => {
        const id = g.dataset.p;
        if (s.reveal) { if (id === q.part) g.classList.add('good'); else if (id === s.v) g.classList.add('bad') } else if (id === s.v) g.classList.add('sel');
        const act = () => { if (s.reveal) return; api.set(id); if (o.mode === 'practice') api.submit() };
        g.onclick = act; g.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act() } };
      });
    },
    complete: (q, s) => !!s.v,
    grade: (q, s) => s.v === q.part ? 1 : 0
  },
  explain: {
    view(q, s, o) {
      const pts = s.reveal ? autoMark(q, s) : null;
      const mp = s.reveal ? `<div class="mp">${q.points.map((p, i) => `<button class="mpi ${s.marks[i] ? 'got' : 'miss'}" data-m="${i}"><span class="bx">${s.marks[i] ? ico('check') : ''}</span><span>${esc(p.label)}</span></button>`).join('')}</div><p class="tiny mut">Tap a point to switch it if the check got it wrong.</p><div class="model"><b>Model answer</b><br>${esc(q.model)}</div>` : '';
      const box = s.reveal ? `<div class="model" style="white-space:pre-wrap"><b>Your answer</b><br>${esc(s.v || '(blank)')}</div>` : `<textarea class="ans" id="ans" rows="5" placeholder="Write your answer here. Use key words from your notes." aria-label="Your answer">${esc(s.v || '')}</textarea>`;
      return `<p class="qtext">${esc(q.q)} <span class="mut" style="font-weight:400">(${q.marks} mark${q.marks > 1 ? 's' : ''})</span></p>${box}${mp}`;
    },
    bind(h, q, s, api, o) {
      const ta = $('#ans', h); if (ta) ta.oninput = () => { s.v = ta.value; o.onChange && o.onChange(s.v, QT.explain.complete(q, s)) };
      $$('[data-m]', h).forEach(b => b.onclick = () => { s.marks[+b.dataset.m] = !s.marks[+b.dataset.m]; api.draw(); o.onMarks && o.onMarks() });
    },
    complete: (q, s) => (s.v || '').trim().length > 2,
    grade: (q, s) => { autoMark(q, s); return s.marks.filter(Boolean).length / q.marks }
  }
};
function autoMark(q, s) {
  if (!s.marks) { const t = norm(s.v || ''); s.marks = q.points.map(p => p.rx.some(r => { try { return new RegExp(r, 'i').test(t) } catch (e) { return false } })) }
  return s.marks;
}

/* mountQ: draws a question into host. sess is the per-question state kept by the caller. */
function mountQ(host, q, sess, o = {}) {
  const T = QT[q.type]; if (T.init) T.init(q, sess);
  const api = {
    draw() { host.innerHTML = T.view(q, sess, o); T.bind && T.bind(host, q, sess, api, o) },
    set(v) { sess.v = v; o.onChange && o.onChange(v, T.complete(q, sess)); api.draw() },
    submit() { o.onSubmit && o.onSubmit() }
  };
  api.draw(); return api;
}
const ensureQ = (q, s) => { const T = QT[q.type]; if (T.init) T.init(q, s) };
const gradeQ = (q, sess) => { ensureQ(q, sess); return QT[q.type].grade(q, sess) };
const completeQ = (q, sess) => { ensureQ(q, sess); return QT[q.type].complete(q, sess) };

/* ---------- choosing questions ---------- */
const CAP = { match: 1, sort: 1, order: 1, explain: 1, label: 2 };
function pickSession(pool, n, opts = {}) {
  const p = P(), t = day(), tcap = opts.perTopic || 99;
  const sc = pool.map(q => {
    const r = p.q[q.id]; let pr;
    if (!r) pr = 2 + Math.random();
    else if (r.due <= t) pr = 4 + (6 - r.b) * .3 + Math.random() * .6;
    else pr = Math.random() * 1.5;
    if (r && r.n && r.ok / r.n < .5) pr += 1;
    return { q, pr };
  }).sort((a, b) => b.pr - a.pr);
  const out = [], cnt = {}, tc = {};
  for (const { q } of sc) {
    if (out.length >= n) break;
    if ((cnt[q.type] || 0) >= (CAP[q.type] || 99)) continue;
    if ((tc[q.t] || 0) >= tcap) continue;
    out.push(q); cnt[q.type] = (cnt[q.type] || 0) + 1; tc[q.t] = (tc[q.t] || 0) + 1;
  }
  // spread: avoid two heavy interactive questions in a row
  const heavy = x => ['match', 'sort', 'order', 'explain'].includes(x.type);
  const sh = shuffle(out), res = [];
  sh.forEach(q => { if (heavy(q) && res.length && heavy(res[res.length - 1])) { const k = res.findIndex((x, i) => !heavy(x) && (i === 0 || !heavy(res[i - 1])) && i > 0); if (k > 0) res.splice(k, 0, q); else res.push(q) } else res.push(q) });
  return res;
}
