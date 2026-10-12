/* ===== Exam mode: timed paper, no feedback until the end, marks per question ===== */
let EXAM = null;
const GRADE = v => v >= .85 ? 'Excellent' : v >= .7 ? 'Strong' : v >= .55 ? 'Secure' : v >= .4 ? 'Developing' : 'Needs work';
function buildPaper(kind) {
  const used = new Set(), out = [];
  const grab = (f, n = 1) => { const c = shuffle(BANK.filter(q => !used.has(q.id) && f(q))); c.slice(0, n).forEach(q => { used.add(q.id); out.push(q) }) };
  const inT = q => kind === 'full' || q.t === kind;
  if (kind === 'full') {
    TOPICS.forEach((_, t) => grab(q => q.t === t && (q.type === 'mcq' && !q.fig || q.type === 'tf')));
    grab(q => q.type === 'mcq' && q.fig, 2); grab(q => q.type === 'explain' && q.marks >= 3, 2);
    grab(q => q.type === 'order'); grab(q => q.type === 'sort'); grab(q => q.type === 'label'); grab(q => q.type === 'match');
  } else {
    grab(q => inT(q) && (q.type === 'mcq' && !q.fig || q.type === 'tf'), 3); grab(q => inT(q) && q.type === 'mcq' && q.fig); grab(q => inT(q) && q.type === 'explain'); grab(q => inT(q) && (q.type === 'order' || q.type === 'sort')); grab(q => inT(q) && (q.type === 'label' || q.type === 'match'));
    if (out.length < 8) grab(q => inT(q) && (q.type === 'mcq' || q.type === 'tf'), 8 - out.length);
  }
  const rank = q => q.type === 'explain' ? 3 : (q.type === 'mcq' && q.fig) ? 1 : ['order', 'sort', 'label', 'match'].includes(q.type) ? 2 : 0;
  return out.map((q, i) => [rank(q) + Math.random() * .5, q]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
}
const fmtT = s => Math.floor(s / 60) + ':' + String(Math.max(0, s % 60)).padStart(2, '0');

VIEWS.exam = m => {
  const p = P(), last = p.exams.slice(-5).reverse();
  m.innerHTML = `<div class="view"><div><h2>Exam mode</h2><p class="mut">A timed paper with no hints and no feedback until the end. Marks are shown per question, like a real paper.</p></div>
   <div class="actions"><button class="btn pri" data-k="full">${ico('exam')}Full paper: 13 questions, 20 minutes</button></div>
   <section class="panel"><h3>Single plate papers</h3><p class="mut small" style="margin:4px 0 12px">8 questions, 10 minutes.</p><div class="tlist">${TOPICS.map((t, i) => `<button class="trow ${t.col}" data-k="${i}"><span class="pn">${t.plate}</span><span><h3>${t.n}</h3></span><span>${ico('next')}</span></button>`).join('')}</div></section>
   ${last.length ? `<section class="panel"><h3>Recent papers</h3><table class="table" style="margin-top:10px"><thead><tr><th>Date</th><th>Paper</th><th>Marks</th><th>Result</th></tr></thead><tbody>${last.map(e => `<tr><td>${new Date(e.d).toLocaleDateString()}</td><td>${e.kind === 'full' ? 'Full paper' : 'Plate ' + TOPICS[e.kind].plate}</td><td>${e.got} / ${e.max}</td><td>${GRADE(e.got / e.max)}</td></tr>`).join('')}</tbody></table></section>` : ''}</div>`;
  $$('[data-k]', m).forEach(b => b.onclick = () => { const k = b.dataset.k === 'full' ? 'full' : +b.dataset.k; const qs = buildPaper(k); EXAM = { kind: k, qs, sess: qs.map(() => ({})), idx: 0, flags: new Set(), secs: k === 'full' ? 1200 : 600, left: k === 'full' ? 1200 : 600, done: false }; go('examrun') });
};

VIEWS.examrun = m => {
  if (!EXAM || EXAM.done) return go('exam');
  const E = EXAM; let tm = null, confirm = false;
  const answered = i => completeQ(E.qs[i], E.sess[i]);
  function draw() {
    const q = E.qs[E.idx], s = E.sess[E.idx], tp = TOPICS[q.t], un = E.qs.filter((_, i) => !answered(i)).length;
    m.innerHTML = `<div class="runner ${tp.col}"><div class="rhead"><span class="timer ${E.left < 120 ? 'low' : ''}" id="tmr" role="timer">${fmtT(E.left)}</span><span class="grow"></span><span class="small mut num">Question ${E.idx + 1} of ${E.qs.length} · ${marksOf(q)} mark${marksOf(q) > 1 ? 's' : ''}</span></div>
     <div class="qnav">${E.qs.map((_, i) => `<button class="${answered(i) ? 'done' : ''} ${i === E.idx ? 'cur' : ''} ${E.flags.has(i) ? 'flag' : ''}" data-i="${i}" aria-label="Question ${i + 1}${E.flags.has(i) ? ' flagged' : ''}">${i + 1}</button>`).join('')}</div>
     <div class="card qcard"><div class="qtype"><span class="plateno">Plate ${tp.plate}</span><span>${TYPE_LABEL[q.type]}</span></div><div id="qh"></div></div>
     <div class="row"><button class="btn" id="pv" ${E.idx === 0 ? 'disabled' : ''}>Previous</button><button class="btn" id="nx" ${E.idx === E.qs.length - 1 ? 'disabled' : ''}>Next</button><button class="btn ghost" id="fl">${ico('flag')}${E.flags.has(E.idx) ? 'Unflag' : 'Flag for later'}</button><span class="grow"></span><button class="btn pri" id="fin">Finish paper</button></div>
     ${confirm ? `<div class="callout"><b>${un ? un + ' question' + (un > 1 ? 's are' : ' is') + ' unanswered.' : 'All questions answered.'}</b> Finish and see your marks?<div class="row" style="margin-top:10px"><button class="btn sm pri" id="yes">Finish and mark</button><button class="btn sm ghost" id="no">Keep working</button></div></div>` : ''}</div>`;
    mountQ($('#qh', m), q, s, { mode: 'exam', onChange: () => { const b = $$('.qnav button', m)[E.idx]; if (b) b.classList.toggle('done', answered(E.idx)) } });
    $$('.qnav button', m).forEach(b => b.onclick = () => { E.idx = +b.dataset.i; confirm = false; draw() });
    $('#pv', m).onclick = () => { E.idx--; confirm = false; draw(); window.scrollTo(0, 0) }; $('#nx', m).onclick = () => { E.idx++; confirm = false; draw(); window.scrollTo(0, 0) };
    $('#fl', m).onclick = () => { E.flags.has(E.idx) ? E.flags.delete(E.idx) : E.flags.add(E.idx); draw() };
    $('#fin', m).onclick = () => { confirm = true; draw(); $('#yes', m).scrollIntoView({ block: 'center' }) };
    const y = $('#yes', m); if (y) { y.onclick = finish; $('#no', m).onclick = () => { confirm = false; draw() } }
  }
  function finish() { clearInterval(tm); E.done = true; go('examres') }
  tm = setInterval(() => { E.left--; const t = $('#tmr', m); if (t) { t.textContent = fmtT(E.left); t.classList.toggle('low', E.left < 120) } if (E.left <= 0) { toast('Time is up'); finish() } }, 1000);
  onLeave(() => clearInterval(tm));
  draw();
};

VIEWS.examres = m => {
  if (!EXAM) return go('exam');
  const E = EXAM, p = P();
  const earn = i => { const q = E.qs[i], f = gradeQ(q, E.sess[i]), mk = marksOf(q); return q.type === 'explain' ? E.sess[i].marks.filter(Boolean).length : Math.round(f * mk * 2) / 2 };
  const totals = () => { const by = TOPICS.map(() => [0, 0]); let got = 0, max = 0; E.qs.forEach((q, i) => { const g = earn(i), mx = marksOf(q); by[q.t][0] += g; by[q.t][1] += mx; got += g; max += mx }); return { by, got, max } };
  if (!E.saved) {
    E.saved = true; const t = totals(); E.qs.forEach((q, i) => rec(q.id, gradeQ(q, E.sess[i])));
    E.rec = { d: Date.now(), kind: E.kind, got: t.got, max: t.max, by: t.by }; p.exams.push(E.rec); if (p.exams.length > 30) p.exams.shift(); save();
    addXP(Math.round(t.got * 3)); if (t.got / t.max >= .8) { award('exam-80', 'Exam 80% or more'); confetti(); sfx('win') }
  }
  function paint() {
    const t = totals(); E.rec.got = t.got; E.rec.by = t.by; save();
    const v = t.got / t.max;
    $('#hd', m).innerHTML = `<div class="sum-top"><div class="bigscore">${t.got % 1 ? t.got.toFixed(1) : t.got}<span class="mut" style="font-size:.4em">/${t.max}</span></div><div><h2>${GRADE(v)}</h2><p class="mut">${pct(v)}% · ${E.kind === 'full' ? 'Full paper' : 'Plate ' + TOPICS[E.kind].plate} · +${Math.round(t.got * 3)} XP</p></div></div>
     <div class="bars" style="margin-top:16px">${TOPICS.map((tp, i) => t.by[i][1] ? `<div class="bar ${tp.col}"><span>Plate ${tp.plate}</span><div class="tr"><i style="width:${pct(t.by[i][0] / t.by[i][1])}%"></i></div><b class="num">${t.by[i][0] % 1 ? t.by[i][0].toFixed(1) : t.by[i][0]}/${t.by[i][1]}</b></div>` : '').join('')}</div>`;
    $$('.rvm', m).forEach((el, i) => { const g = earn(i), mx = marksOf(E.qs[i]); el.textContent = `${g % 1 ? g.toFixed(1) : g}/${mx}`; el.parentElement.querySelector('.dot').className = 'dot ' + (g >= mx ? 'ok' : g > 0 ? 'part' : 'no') });
  }
  const weak = (() => { const t = totals(); let w = -1, wv = 2; t.by.forEach((b, i) => { if (b[1] && b[0] / b[1] < wv) { wv = b[0] / b[1]; w = i } }); return w })();
  m.innerHTML = `<div class="view runner"><div id="hd"></div>
   <div class="row"><button class="btn pri" id="again">New paper</button>${weak >= 0 ? `<button class="btn" id="wk">Practise Plate ${TOPICS[weak].plate}</button>` : ''}<button class="btn ghost" id="bk">Exam home</button></div>
   <section class="panel"><h3>Question by question</h3><p class="mut small" style="margin:4px 0 12px">Written answers were marked by keyword. Tap a mark point to change it.</p><div class="review">${E.qs.map((q, i) => `<details class="rv"><summary><span class="dot"></span><span class="grow">${i + 1}. ${esc(q.q)}</span><b class="rvm num"></b></summary><div class="rvh" data-i="${i}" style="margin-top:12px"></div></details>`).join('')}</div></section></div>`;
  $$('.rvh', m).forEach(h => { const i = +h.dataset.i; const s = E.sess[i]; s.reveal = true; mountQ(h, E.qs[i], s, { mode: 'review', onMarks: paint }) });
  paint();
  $('#again', m).onclick = () => go('exam'); $('#bk', m).onclick = () => go('exam'); const wk = $('#wk', m); if (wk) wk.onclick = () => go('practice', { t: weak });
  window.scrollTo(0, 0);
};
