/* ===== Screens: shell, welcome, home, topic, practice runner, labs, cases, progress ===== */
const VIEWS = {};
const NAV = [['home', 'Map', 'map'], ['labs', 'Labs', 'lab'], ['cases', 'Cases', 'case'], ['exam', 'Exam', 'exam'], ['me', 'Me', 'me']];
const NAVOF = { home: 'home', topic: 'home', practice: 'home', labs: 'labs', lab: 'labs', cases: 'cases', case: 'cases', exam: 'exam', examrun: 'exam', examres: 'exam', me: 'me', teacher: 'me' };
const pct = v => Math.round(v * 100);
const MARK_SVG = '<svg viewBox="0 0 36 20" fill="none" stroke="var(--signal)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M1 10h8l3-8 5 16 4-12 3 4h11"/></svg>';

function render() {
  const app = $('#app');
  if (R.view === 'teacher' && !DB.cur) { app.innerHTML = '<main class="view" style="max-width:960px;margin:0 auto;padding:24px 16px"></main>'; VIEWS.teacher($('main', app), R.args); return }
  if (!DB.cur || !P()) { app.innerHTML = welcomeHTML(); bindWelcome(app); return }
  const dark = isDark();
  app.innerHTML = `<div class="shell"><header class="top"><button class="mark" data-go="home" aria-label="Signal home">${MARK_SVG}<span>Signal</span></button><span class="sp"></span>
   <span class="chip" id="chip" title="Rank and XP"></span>
   <button class="ibtn" id="snd" aria-pressed="${!!DB.sound}" aria-label="Sound effects">${ico(DB.sound ? 'snd' : 'mute')}</button>
   <button class="ibtn" id="thm" aria-label="Switch light and dark">${ico(dark ? 'sun' : 'moon')}</button></header>
   <nav class="nav" aria-label="Main">${NAV.map(([k, l, i]) => `<button data-go="${k}" ${NAVOF[R.view] === k ? 'aria-current="page"' : ''}>${ico(i)}<span>${l}</span></button>`).join('')}</nav>
   <main id="main"></main></div>`;
  refreshChip();
  $$('[data-go]', app).forEach(b => b.onclick = () => go(b.dataset.go));
  $('#snd').onclick = () => { DB.sound = !DB.sound; save(); $('#snd').setAttribute('aria-pressed', !!DB.sound); $('#snd').innerHTML = ico(DB.sound ? 'snd' : 'mute'); sfx('ok') };
  $('#thm').onclick = () => { DB.theme = isDark() ? 'light' : 'dark'; save(); applyTheme(); $('#thm').innerHTML = ico(isDark() ? 'sun' : 'moon') };
  VIEWS[R.view]($('#main'), R.args);
}
function refreshChip() {
  const c = $('#chip'); if (!c || !P()) return; const p = P(), r = rankOf(p.xp);
  c.innerHTML = `<span class="rk">${r.name[0]}</span><span class="rn">${r.name}</span><span class="mut num">${p.xp} XP</span>`;
}

/* ---------- welcome ---------- */
function welcomeHTML() {
  const names = Object.values(DB.profiles).sort((a, b) => (b.xp || 0) - (a.xp || 0));
  const last = DB.profiles[DB.last] ? DB.last : '';
  return `<div class="welcome"><div class="inner">
   <div class="brandplate"><img src="${LOGO}" alt="Inspire International Academy"><span>9B Biology<br>Dr. Shaimaa Ahmed</span></div>
   <div><h1>Signal</h1><p class="mut" style="margin-top:10px;font-size:18px;max-width:30ch">Coordination and response, from stimulus to response.</p></div>
   <form id="wf" class="lcol" style="gap:16px"><div class="field"><label for="nm"><b>Your name</b></label><input type="text" id="nm" autocomplete="off" maxlength="24" placeholder="First name" value="${esc(last)}"></div>
   <div class="field"><label for="cl"><b>Class</b></label><input type="text" id="cl" autocomplete="off" maxlength="8" value="9B" style="max-width:120px"></div>
   <button class="btn pri block" type="submit" style="min-height:54px;font-size:18px">Start</button></form>
   ${names.length ? `<div><p class="small mut" style="margin-bottom:8px">Playing on this device already?</p><div class="profiles">${names.map(p => `<button class="btn sm" data-pn="${esc(p.name)}">${esc(p.name)}</button>`).join('')}</div></div>` : ''}
   <button class="back" id="tchr" style="align-self:flex-start">Teacher view</button></div></div>`;
}
function bindWelcome(app) {
  $('#wf', app).onsubmit = e => { e.preventDefault(); if (login($('#nm', app).value, $('#cl', app).value)) { DB.last = DB.cur; save(); go('home') } else $('#nm', app).focus() };
  $$('[data-pn]', app).forEach(b => b.onclick = () => { login(b.dataset.pn); DB.last = DB.cur; save(); go('home') });
  $('#tchr', app).onclick = () => go('teacher');
}

/* ---------- home ---------- */
const ringHTML = (v, tc, sz = 52) => `<div class="ring ${tc}" style="--sz:${sz}px"><svg viewBox="0 0 52 52"><circle class="bgc" cx="26" cy="26" r="22"/><circle class="fg" cx="26" cy="26" r="22" stroke-dasharray="${(2 * Math.PI * 22).toFixed(1)}" stroke-dashoffset="${(2 * Math.PI * 22 * (1 - v)).toFixed(1)}"/></svg><b>${pct(v)}</b></div>`;
VIEWS.home = m => {
  const p = P(), rk = rankOf(p.xp), due = allDue(), st = streakNow();
  const stats = TOPICS.map((_, i) => topicStats(i));
  let weakest = 0; stats.forEach((s, i) => { if (s.mastery < stats[weakest].mastery) weakest = i });
  const anySeen = stats.some(s => s.seen);
  let nextHTML;
  if (due > 0) nextHTML = `<h3>${due} question${due > 1 ? 's are' : ' is'} due for review</h3><p class="mut">Questions you got wrong come back sooner. Ones you know come back later.</p><div class="row"><button class="btn pri" data-act="daily">Review now</button></div>`;
  else if (!anySeen) nextHTML = `<h3>Start with Plate I</h3><p class="mut">Tap a glowing circle on the body, or open the nervous system plate.</p><div class="row"><button class="btn pri" data-t="0">Open Plate I</button><button class="btn" data-act="daily">Try 10 questions</button></div>`;
  else nextHTML = `<h3>Plate ${TOPICS[weakest].plate} needs the most work</h3><p class="mut">${TOPICS[weakest].n}: ${pct(stats[weakest].mastery)}% mastered.</p><div class="row"><button class="btn pri" data-pr="${weakest}">Practise it</button><button class="btn" data-lab="${TOPICS[weakest].lab}">Open the lab</button></div>`;
  m.innerHTML = `<div class="view">
   <div class="hello"><div><h1>Pick a part of the body.</h1><p class="mut" style="margin-top:8px">Hi ${esc(p.name)}. Each glowing circle is a plate: notes, a live lab and questions.</p></div>
    <div class="stats"><div class="stat"><b>${st}</b><span>day streak</span></div><div class="stat"><b>${due}</b><span>due for review</span></div></div></div>
   <div class="homegrid">
    <div class="plate" id="plate">${plateSVG()}${PLATE_HOT.map(h => `<button class="hot ${TOPICS[h.t].col}" style="left:${h.hx / 3.4}%;top:${h.hy / 5.8}%" data-t="${h.t}" aria-label="Plate ${TOPICS[h.t].plate}: ${TOPICS[h.t].n}"><b>${TOPICS[h.t].plate}</b></button>`).join('')}
     ${PLATE_HOT.map(h => `<button class="plabel ${h.ax === 'r' ? 'r' : ''} ${TOPICS[h.t].col}" style="${h.ax === 'r' ? 'right:' + Math.max(0, 100 - (h.hx + 34) / 3.4) + '%' : 'left:' + Math.max(0, (h.hx - 34) / 3.4) + '%'};top:${h.ly / 5.8}%" data-t="${h.t}">${TOPICS[h.t].n}<small>Plate ${TOPICS[h.t].plate}</small></button>`).join('')}
    </div>
    <div class="lcol">
     <div class="card next">${nextHTML}</div>
     <div class="card"><div class="row" style="justify-content:space-between"><h3>${rk.name}</h3><span class="mut small num">${p.xp} XP${rk.next ? ` · ${rk.hi - p.xp} to ${rk.next}` : ''}</span></div>
      <div class="chain" aria-hidden="true">${RANKS.map((r, i) => `<u class="${i < rk.i ? 'on' : i === rk.i ? 'cur' : ''}"></u>${i < RANKS.length - 1 ? `<i class="${i < rk.i ? 'on' : ''}"></i>` : ''}`).join('')}</div>
      <p class="tiny mut" style="margin-top:8px">The ranks follow a reflex arc: ${RANKS.map(r => r[0]).join(', ')}.</p></div>
     <div class="tlist">${TOPICS.map((t, i) => `<button class="trow ${t.col}" data-t="${i}"><span class="pn">${t.plate}</span><span><h3>${t.n}</h3><span class="mut small">${stats[i].seen} of ${stats[i].total} questions seen</span></span>${ringHTML(stats[i].mastery, t.col, 48)}</button>`).join('')}</div>
    </div></div></div>`;
  $$('[data-t]', m).forEach(b => b.onclick = () => go('topic', { t: +b.dataset.t }));
  $$('[data-act=daily]', m).forEach(b => b.onclick = () => go('practice', { t: null }));
  $$('[data-pr]', m).forEach(b => b.onclick = () => go('practice', { t: +b.dataset.pr }));
  $$('[data-lab]', m).forEach(b => b.onclick = () => go('lab', { id: b.dataset.lab }));
  const pp = $('#plpath', m); if (pp && !matchMedia('(prefers-reduced-motion: reduce)').matches) { setTimeout(() => pp.classList.add('go'), 500); const tm = setInterval(() => { pp.classList.remove('go'); void pp.getBoundingClientRect(); pp.classList.add('go') }, 9000); onLeave(() => clearInterval(tm)) }
  else if (pp) pp.style.opacity = 0;
};

/* ---------- topic ---------- */
VIEWS.topic = (m, a) => {
  const t = TOPICS[a.t], s = topicStats(a.t), cases = CASES.filter(c => c.t === a.t), p = P();
  m.innerHTML = `<div class="view ${t.col}"><button class="back" data-go="home">${ico('back')}Map</button>
   <div class="thead"><span class="big">${t.plate}</span><div class="grow"><h2>${t.n}</h2><p class="mut">${t.blurb}</p></div>${ringHTML(s.mastery, t.col, 64)}</div>
   <div class="actions"><button class="btn pri" data-a="pr">${ico('bolt')}Practise 8 questions</button><button class="btn" data-a="lab">${ico('lab')}Open the lab</button>${s.due ? `<button class="btn" data-a="pr">${s.due} due for review</button>` : ''}</div>
   <section class="panel"><h3>Know this</h3><ul class="notes" style="margin-top:14px">${t.notes.map(n => `<li><span>${n}</span></li>`).join('')}</ul></section>
   <section class="panel"><h3>Key terms</h3><div class="terms" style="margin-top:14px">${t.terms.map(x => `<div class="term"><b>${x[0]}</b><br><span class="small">${x[1]}</span></div>`).join('')}</div></section>
   ${cases.length ? `<section class="panel"><h3>Case files</h3><div class="tlist" style="margin-top:14px">${cases.map(c => `<button class="trow ${t.col}" data-case="${c.id}"><span class="pn">${ico('case')}</span><span><h3 style="font-size:17px">${c.title}</h3><span class="mut small">${p.cases[c.id] ? 'Best score ' + pct(p.cases[c.id].best) + '%' : 'Not tried yet'}</span></span><span>${ico('next')}</span></button>`).join('')}</div></section>` : ''}</div>`;
  $$('[data-go]', m).forEach(b => b.onclick = () => go(b.dataset.go));
  $$('[data-a=pr]', m).forEach(b => b.onclick = () => go('practice', { t: a.t }));
  $$('[data-a=lab]', m).forEach(b => b.onclick = () => go('lab', { id: t.lab }));
  $$('[data-case]', m).forEach(b => b.onclick = () => go('case', { id: b.dataset.case }));
};

/* ---------- generic question runner ---------- */
const needsCheck = q => ['order', 'match', 'sort', 'explain'].includes(q.type);
const BASEXP = { mcq: 10, tf: 8, label: 10, order: 15, match: 15, sort: 15 };
function ansText(q) {
  switch (q.type) {
    case 'mcq': return q.a; case 'tf': return q.a ? 'True' : 'False'; case 'order': return q.steps.join(' > ');
    case 'match': return q.pairs.map(p => p[0] + ': ' + p[1]).join('; '); case 'sort': return q.cats.map((c, k) => c + ': ' + q.items.filter(i => i[1] === k).map(i => i[0]).join(', ')).join('. ');
    case 'label': return DIAG[q.diagram].parts[q.part]; case 'explain': return q.model;
  }
}
function Runner(main, o) {
  const qs = o.qs, sessions = qs.map(() => ({})), results = []; let i = 0, xpTotal = 0, streak = 0;
  function showQ() {
    const q = qs[i], sess = sessions[i]; let revealed = false;
    const tp = q.t !== undefined ? TOPICS[q.t] : null;
    main.innerHTML = `<div class="runner ${o.tc || (tp ? tp.col : '')}"><div class="rhead"><button class="back" data-quit style="padding:6px 8px 6px 0">${ico('back')}Quit</button><div class="dots" aria-hidden="true">${qs.map((_, k) => `<i class="${k < results.length ? (results[k] >= .99 ? 'ok' : results[k] > 0 ? 'part' : 'no') : k === i ? 'cur' : ''}"></i>`).join('')}</div><span class="num small mut">${i + 1} of ${qs.length}</span></div>
     ${o.story ? `<div class="storybox">${esc(o.story)}</div>` : ''}
     <div class="card qcard in"><div class="qtype">${tp ? `<span class="plateno">Plate ${tp.plate}</span>` : ''}<span>${TYPE_LABEL[q.type]}</span></div><div id="qh"></div><div id="fbh"></div><div class="row" id="act"></div></div></div>`;
    $('[data-quit]', main).onclick = () => o.quit();
    const qh = $('#qh', main), fbh = $('#fbh', main), act = $('#act', main);
    const setBtn = (label, fn, dis) => { act.innerHTML = `<button class="btn pri block" ${dis ? 'disabled' : ''}>${label}</button>`; $('button', act).onclick = fn };
    const api = mountQ(qh, q, sess, {
      mode: 'practice',
      onChange: (v, c) => { if (!revealed && needsCheck(q)) { if (q.type === 'explain') { const b = $('button', act); if (b) b.disabled = !c; else setBtn('Check answer', submit, !c) } else setBtn('Check answer', submit, !c) } },
      onSubmit: submit, onMarks: () => { }
    });
    if (needsCheck(q)) setBtn('Check answer', submit, true);
    function submit() {
      if (revealed) return; revealed = true; sess.reveal = true;
      if (q.type === 'explain') { autoMark(q, sess); api.draw(); setBtn('Done marking', finalize); fbh.innerHTML = `<div class="fb mid">${ico('half')}<div>Here is how the check marked your answer. Tap any point to change it, then press Done marking.</div></div>` }
      else { api.draw(); finalize() }
    }
    function finalize() {
      const frac = gradeQ(q, sess); results.push(frac); rec(q.id, frac);
      streak = frac >= .99 ? streak + 1 : 0;
      let xp = q.type === 'explain' ? q.marks * 6 * frac : BASEXP[q.type] * frac; if (frac >= .99) xp += Math.min(streak, 5) * 2; xp = Math.round(xp);
      xpTotal += xp; addXP(xp); if (xp) xpFly(xp);
      const cls = frac >= .99 ? 'ok' : frac > 0 ? 'mid' : 'no', head = frac >= .99 ? 'Correct.' : frac > 0 ? 'Partly right.' : 'Not quite.';
      let body;
      if (q.type === 'explain') { const got = sess.marks.filter(Boolean).length; body = `${got} of ${q.marks} mark${q.marks > 1 ? 's' : ''}.` }
      else if (q.type === 'match' || q.type === 'sort') { const n = q.type === 'match' ? q.pairs.length : q.items.length; body = `${Math.round(frac * n)} of ${n} right. ${q.why || ''}` }
      else if (q.type === 'mcq' && sess.hinted && frac > 0) body = 'Half marks for using the hint. ' + q.why;
      else if (frac < 1 && q.type === 'mcq') body = `The answer is <b>${esc(q.a)}</b>. ${esc(q.why)}`;
      else if (q.type === 'tf') body = esc(q.why); else if (q.type !== 'label') body = esc(q.why || ''); else body = '';
      fbh.innerHTML = `<div class="fb ${cls}">${ico(cls === 'ok' ? 'check' : cls === 'mid' ? 'half' : 'x')}<div><b>${head}</b> ${body}${xp ? ` <span class="mut">+${xp} XP</span>` : ''}${streak >= 3 ? `<br><span class="mut">${streak} correct in a row.</span>` : ''}</div></div>`;
      sfx(frac >= .99 ? 'ok' : frac > 0 ? 'tap' : 'no'); if (frac < .5) buzz(30);
      setBtn(i === qs.length - 1 ? 'See results' : 'Next question', () => { i++; if (i >= qs.length) summary(); else { showQ(); window.scrollTo(0, 0) } });
      $('button', act).focus({ preventScroll: true });
      fbh.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }
  function summary() {
    const tot = results.reduce((a, b) => a + b, 0), acc = tot / qs.length;
    if (acc >= .8) { confetti(); sfx('win') }
    const fin = o.onDone ? o.onDone(acc, results, xpTotal) : '';
    main.innerHTML = `<div class="view runner ${o.tc || ''}"><div class="sum-top"><div class="bigscore">${tot % 1 ? tot.toFixed(1) : tot}<span class="mut" style="font-size:.4em">/${qs.length}</span></div><div><h2>${acc >= .8 ? 'Strong work.' : acc >= .5 ? 'Getting there.' : 'Worth another go.'}</h2><p class="mut">${pct(acc)}% correct · +${xpTotal} XP</p></div></div>
     ${fin}
     <div class="row">${o.again ? '<button class="btn pri" data-r="again">' + (o.againLabel || 'Go again') + '</button>' : ''}<button class="btn" data-r="back">${o.backLabel || 'Back to map'}</button></div>
     <section class="panel"><h3>Review</h3><div class="review" style="margin-top:12px">${qs.map((q, k) => `<details class="rv"><summary><span class="dot ${results[k] >= .99 ? 'ok' : results[k] > 0 ? 'part' : 'no'}"></span><span class="grow">${esc(q.q)}</span></summary><div class="small" style="margin-top:10px"><b>Answer:</b> ${esc(ansText(q))}${q.why && q.type !== 'explain' ? `<br><span class="mut">${esc(q.why)}</span>` : ''}</div></details>`).join('')}</div></section></div>`;
    const ag = $('[data-r=again]', main); if (ag) ag.onclick = o.again; $('[data-r=back]', main).onclick = o.quit;
    window.scrollTo(0, 0);
  }
  showQ();
}

VIEWS.practice = (m, a) => {
  const pool = BANK.filter(q => a.t === null || q.t === a.t), mistakes = a.mistakes;
  let list = mistakes ? BANK.filter(q => { const r = P().q[q.id]; return r && r.b === 1 && r.n > 0 }) : pool;
  if (!list.length) list = pool;
  const qs = pickSession(list, a.t === null ? 10 : 8, { perTopic: a.t === null ? 3 : 99 });
  Runner(m, { qs, tc: a.t !== null ? TOPICS[a.t].col : '', quit: () => go(a.t !== null && !mistakes ? 'topic' : 'home', a.t !== null ? { t: a.t } : {}), again: () => go('practice', a), againLabel: 'Another set', backLabel: a.t !== null ? 'Back to plate' : 'Back to map' });
};

/* ---------- labs ---------- */
VIEWS.labs = m => {
  const p = P();
  m.innerHTML = `<div class="view"><div><h2>Labs</h2><p class="mut">Run each experiment, then finish its challenges for XP.</p></div>
   <div class="labgrid">${Object.entries(LABS).map(([id, l]) => { const d = Object.keys((p.labs[id] || {}).done || {}).length, n = l.challenges.length; return `<button class="labcard ${TOPICS[l.topic].col}" data-lab="${id}"><div class="art">${GLYPH[id]}</div><div class="bd"><span class="plateno">Plate ${TOPICS[l.topic].plate}</span><h3>${l.title}</h3><span class="mut small">${l.sub}</span><span class="small" style="font-weight:700;color:${d === n ? 'var(--good)' : 'var(--mut)'}">${d === n ? 'All challenges done' : d + ' of ' + n + ' challenges'}</span></div></button>` }).join('')}</div></div>`;
  $$('[data-lab]', m).forEach(b => b.onclick = () => go('lab', { id: b.dataset.lab }));
};
VIEWS.lab = (m, a) => {
  const lab = LABS[a.id], t = TOPICS[lab.topic], p = P(); p.labs[a.id] = p.labs[a.id] || { done: {} };
  m.innerHTML = `<div class="view ${t.col}"><button class="back" data-go="labs">${ico('back')}Labs</button>
   <div class="thead"><span class="big" style="font-size:clamp(46px,12vw,72px)">${t.plate}</span><div class="grow"><h2>${lab.title}</h2><p class="mut">${lab.sub}</p></div></div>
   <div id="labhost"></div>
   <section class="panel"><h3>Challenges</h3><ul class="chal" id="chal" style="margin-top:12px"></ul></section>
   <div class="actions"><button class="btn pri" data-pr>${ico('bolt')}Practise this plate</button><button class="btn" data-t>Plate notes</button></div></div>`;
  const stops = [], loops = [], cleans = [];
  const L = {
    stop(fn) { if (typeof fn === 'function') { stops.push(fn); return fn } stops.splice(0).forEach(f => f()) },
    loop(fn) { let alive = true; const f = tm => { if (!alive) return; fn(tm); requestAnimationFrame(f) }; requestAnimationFrame(f); loops.push(() => alive = false) },
    cleanup(fn) { cleans.push(fn) },
    reset() { stops.splice(0).forEach(f => f()); loops.splice(0).forEach(f => f()); cleans.splice(0).forEach(f => { try { f() } catch (e) { } }) },
    done(k) {
      const st = p.labs[a.id]; if (st.done[k]) return;
      st.done[k] = Date.now(); save(); addXP(25); toast('Challenge complete. +25 XP'); sfx('win'); drawChal();
      if (Object.keys(st.done).length === lab.challenges.length) { award('lab-' + a.id, lab.title + ' complete'); confetti() }
    }
  };
  const drawChal = () => { const d = p.labs[a.id].done; $('#chal', m).innerHTML = lab.challenges.map(([k, tx]) => `<li class="${d[k] ? 'done' : ''}"><span class="bx">${d[k] ? ico('check') : ''}</span><span>${tx}</span></li>`).join('') };
  drawChal(); onLeave(() => L.reset());
  $$('[data-go]', m).forEach(b => b.onclick = () => go('labs'));
  $('[data-pr]', m).onclick = () => go('practice', { t: lab.topic }); $('[data-t]', m).onclick = () => go('topic', { t: lab.topic });
  lab.mount($('#labhost', m), L);
};

/* ---------- cases ---------- */
VIEWS.cases = m => {
  const p = P();
  m.innerHTML = `<div class="view"><div><h2>Case files</h2><p class="mut">Each case is a short story. Work out what happened, step by step.</p></div>
   <div class="tlist">${CASES.map(c => { const t = TOPICS[c.t], r = p.cases[c.id]; return `<button class="trow ${t.col}" data-case="${c.id}"><span class="pn">${t.plate}</span><span><h3>${c.title}</h3><span class="mut small">${t.n} · ${c.steps.length} steps${r ? ' · best ' + pct(r.best) + '%' : ''}</span></span><span style="color:${r && r.best >= .99 ? 'var(--good)' : 'var(--mut)'}">${r && r.best >= .99 ? ico('check') : ico('next')}</span></button>` }).join('')}</div></div>`;
  $$('[data-case]', m).forEach(b => b.onclick = () => go('case', { id: b.dataset.case }));
};
VIEWS.case = (m, a) => {
  const c = CASES.find(x => x.id === a.id), t = TOPICS[c.t];
  Runner(m, {
    qs: c.steps, story: c.story, tc: t.col, quit: () => go('cases'), again: () => go('case', a), againLabel: 'Replay case', backLabel: 'All cases',
    onDone: (acc) => { const p = P(), old = p.cases[c.id]; p.cases[c.id] = { best: Math.max(acc, old ? old.best : 0), n: (old ? old.n : 0) + 1 }; save(); addXP(20 + Math.round(acc * 20)); if (acc >= .99) award('case-' + c.id, 'Case solved: ' + c.title); if (CASES.every(x => p.cases[x.id])) award('all-cases', 'Every case file opened'); return `<div class="storybox ${t.col}"><b>Diagnosis.</b> ${esc(c.verdict)}</div>` }
  });
};

/* ---------- me ---------- */
function radarSVG(vals) {
  const cx = 150, cy = 140, r = 100, n = 5, ang = i => -Math.PI / 2 + i * 2 * Math.PI / n, pt = (i, k) => [cx + Math.cos(ang(i)) * r * k, cy + Math.sin(ang(i)) * r * k];
  let o = `<svg viewBox="0 0 300 290" class="radar" role="img" aria-label="Mastery by plate">`;
  [.25, .5, .75, 1].forEach(k => o += `<polygon points="${TOPICS.map((_, i) => pt(i, k).join(',')).join(' ')}" fill="none" stroke="var(--line)" stroke-width="1"/>`);
  TOPICS.forEach((t, i) => { const [x, y] = pt(i, 1), [lx, ly] = pt(i, 1.2); o += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="var(--line)"/><text x="${lx}" y="${ly + 4}" text-anchor="middle" class="tx tx-ink" style="font-weight:800">${t.plate}</text>` });
  o += `<polygon points="${vals.map((v, i) => pt(i, Math.max(.04, v)).join(',')).join(' ')}" fill="var(--signal)" fill-opacity=".28" stroke="var(--signal)" stroke-width="3" stroke-linejoin="round"/>`;
  vals.forEach((v, i) => { const [x, y] = pt(i, Math.max(.04, v)); o += `<circle cx="${x}" cy="${y}" r="4.5" fill="var(--bg)" stroke="var(--signal)" stroke-width="2.5"/>` });
  return o + '</svg>';
}
const BADGE_NAMES = () => { const o = { 'all-cases': 'Every case file opened', 'exam-80': 'Exam 80% or more', 'streak-3': 'Three day streak', 'xp-500': 'Reached 500 XP' }; Object.entries(LABS).forEach(([k, l]) => o['lab-' + k] = l.title + ' complete'); CASES.forEach(c => o['case-' + c.id] = 'Case solved: ' + c.title); return o };
VIEWS.me = m => {
  const p = P(), rk = rankOf(p.xp), stats = TOPICS.map((_, i) => topicStats(i));
  const tot = Object.values(p.q).reduce((a, r) => a + r.n, 0), ok = Object.values(p.q).reduce((a, r) => a + r.ok, 0), mistakes = Object.values(p.q).filter(r => r.b === 1 && r.n > 0).length;
  if (streakNow() >= 3) award('streak-3', 'Three day streak'); if (p.xp >= 500) award('xp-500', 'Reached 500 XP');
  const bn = BADGE_NAMES(), earned = Object.keys(p.badges);
  m.innerHTML = `<div class="view"><div class="rankbox"><div><span class="mut small">${esc(p.name)} · ${esc(p.cls)}</span><div class="rank-name">${rk.name}</div></div>
    <div class="chain">${RANKS.map((r, i) => `<u class="${i < rk.i ? 'on' : i === rk.i ? 'cur' : ''}"></u>${i < RANKS.length - 1 ? `<i class="${i < rk.i ? 'on' : ''}"></i>` : ''}`).join('')}</div>
    <p class="mut small">${p.xp} XP${rk.next ? ` · ${rk.hi - p.xp} XP to ${rk.next}` : ' · top rank'} · ${streakNow()} day streak</p></div>
   <div class="homegrid"><section class="card"><h3>Mastery by plate</h3>${radarSVG(stats.map(s => s.mastery))}<div class="bars" style="margin-top:8px">${TOPICS.map((t, i) => `<div class="bar ${t.col}"><span>Plate ${t.plate}</span><div class="tr"><i style="width:${pct(stats[i].mastery)}%"></i></div><b class="num">${pct(stats[i].mastery)}%</b></div>`).join('')}</div></section>
    <div class="lcol"><section class="card"><h3>Your numbers</h3><div class="readout" style="margin-top:12px"><div class="rd"><b>${tot}</b><span>answers given</span></div><div class="rd"><b>${tot ? pct(ok / tot) + '%' : '-'}</b><span>accuracy</span></div><div class="rd"><b>${p.exams.length ? pct(Math.max(...p.exams.map(e => e.got / e.max))) + '%' : '-'}</b><span>best exam</span></div></div>
     <div class="row" style="margin-top:14px">${mistakes ? `<button class="btn pri" id="mist">Review ${mistakes} mistake${mistakes > 1 ? 's' : ''}</button>` : '<span class="mut small">No open mistakes. Nice.</span>'}</div></section>
     <section class="card"><h3>Send results to your teacher</h3><p class="mut small" style="margin:6px 0 12px">Copy your result code and paste it in your class chat. Your teacher can read it in the Teacher view.</p><div class="codebox" id="code">${esc(makeCode(p))}</div><div class="row" style="margin-top:12px"><button class="btn sm" id="cp">${ico('copy')}Copy code</button></div></section></div></div>
   <section class="panel"><h3>Badges</h3><div class="badges" style="margin-top:12px">${Object.entries(bn).filter(([k]) => earned.includes(k)).map(([k, l]) => `<div class="badge">${ico('star')}<span>${esc(l)}</span></div>`).join('') || '<p class="mut">Finish a lab challenge or a case file to earn your first badge.</p>'}</div></section>
   <section class="panel"><h3>This device</h3><div class="row" style="margin-top:12px"><button class="btn sm" id="sw">Switch student</button><button class="btn sm ghost" id="tc">Teacher view</button><button class="btn sm ghost" id="rst">Reset my progress</button></div><div id="conf"></div></section></div>`;
  const mi = $('#mist', m); if (mi) mi.onclick = () => go('practice', { t: null, mistakes: true });
  $('#cp', m).onclick = async () => { toast(await copyText(makeCode(p)) ? 'Code copied' : 'Select the code and copy it') };
  $('#sw', m).onclick = () => { DB.cur = null; save(); go('home') };
  $('#tc', m).onclick = () => go('teacher');
  $('#rst', m).onclick = () => { $('#conf', m).innerHTML = `<div class="callout" style="margin-top:12px"><b>Delete all progress for ${esc(p.name)}?</b> This cannot be undone.<div class="row" style="margin-top:10px"><button class="btn sm pri" id="yes">Delete progress</button><button class="btn sm ghost" id="no">Keep it</button></div></div>`; $('#no', m).onclick = () => $('#conf', m).innerHTML = ''; $('#yes', m).onclick = () => { DB.profiles[DB.cur] = newProfile(p.name, p.cls); save(); go('me') } };
};
