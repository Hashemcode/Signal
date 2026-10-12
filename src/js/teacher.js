/* ===== Result codes and the teacher view (works with no server: paste codes, read the class) ===== */
const b64u = s => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64u = s => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))));
const chk = s => { let h = 7; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 99991; return h.toString(36) };
function makeCode(p) {
  const st = TOPICS.map((_, i) => topicStats(i)), tot = Object.values(p.q).reduce((a, r) => a + r.n, 0), ok = Object.values(p.q).reduce((a, r) => a + r.ok, 0);
  const o = { n: p.name, c: p.cls, x: p.xp, m: st.map(s => pct(s.mastery)), a: tot ? pct(ok / tot) : 0, q: tot, e: p.exams.length ? pct(Math.max(...p.exams.map(e => e.got / e.max))) : -1, d: day(), b: Object.keys(p.badges).length };
  const b = b64u(JSON.stringify(o)); return 'SIG1.' + b + '.' + chk(b);
}
function parseCode(t) {
  t = t.trim(); const m = t.match(/^SIG1\.([A-Za-z0-9_-]+)\.([a-z0-9]+)$/); if (!m) return null;
  try { const o = JSON.parse(unb64u(m[1])); o.ok = chk(m[1]) === m[2]; return o } catch (e) { return null }
}
VIEWS.teacher = (m, a) => {
  const saved = (DB.teacher || '');
  m.innerHTML = `<div class="view"><button class="back" id="bk">${ico('back')}${DB.cur ? 'Back' : 'Sign in'}</button>
   <div><h2>Teacher view</h2><p class="mut" style="max-width:62ch">Ask students to copy their result code from the Me tab and paste it into your class chat. Paste the codes here, one per line. Nothing leaves this device.</p></div>
   <textarea class="codes" id="codes" placeholder="SIG1.eyJu..." aria-label="Result codes, one per line">${esc(saved)}</textarea>
   <div class="row"><button class="btn pri" id="go">Read codes</button><button class="btn ghost" id="clr">Clear</button></div>
   <div id="out"></div></div>`;
  $('#bk', m).onclick = () => go('home');
  const run = () => {
    const raw = $('#codes', m).value; DB.teacher = raw; save();
    const lines = raw.split(/\s+/).filter(Boolean), rows = [], bad = [];
    lines.forEach(l => { const o = parseCode(l.replace(/^.*?(SIG1\.)/, '$1')); if (o) rows.push(o); else bad.push(l.slice(0, 14)) });
    // keep latest per name
    const byName = {}; rows.forEach(r => { const k = (r.c + '|' + r.n).toLowerCase(); if (!byName[k] || r.d >= byName[k].d) byName[k] = r }); const list = Object.values(byName).sort((x, y) => x.n.localeCompare(y.n));
    if (!list.length) { $('#out', m).innerHTML = lines.length ? '<div class="callout">None of those lines look like result codes. A code starts with SIG1.</div>' : ''; return }
    const avg = TOPICS.map((_, i) => Math.round(list.reduce((s, r) => s + r.m[i], 0) / list.length));
    let wk = 0; avg.forEach((v, i) => { if (v < avg[wk]) wk = i });
    const heat = v => `<span class="heat" style="background:color-mix(in srgb,${v >= 60 ? 'var(--good)' : v >= 30 ? 'var(--amber)' : 'var(--bad)'} ${Math.max(14, Math.min(60, v / 1.6))}%,transparent)">${v}</span>`;
    const need = list.filter(r => r.q > 0 && (r.a < 55 || r.m.reduce((s, v) => s + v, 0) / 5 < 15)).map(r => r.n);
    $('#out', m).innerHTML = `<div class="card"><h3>Class of ${list.length}</h3><p class="mut" style="margin-top:6px">Weakest plate on average: <b>Plate ${TOPICS[wk].plate}, ${TOPICS[wk].n}</b> (${avg[wk]}% mastery).${need.length ? ` Check in with: <b>${esc(need.join(', '))}</b>.` : ''}</p></div>
     <div class="scroll-x"><table class="table"><thead><tr><th>Name</th><th>Class</th><th>XP</th>${TOPICS.map(t => `<th title="${t.n}">${t.plate}</th>`).join('')}<th>Accuracy</th><th>Best exam</th><th>Answers</th><th></th></tr></thead><tbody>
     ${list.map(r => `<tr><td><b>${esc(r.n)}</b></td><td>${esc(r.c)}</td><td>${r.x}</td>${r.m.map(heat).map(x => `<td>${x}</td>`).join('')}<td>${r.a}%</td><td>${r.e >= 0 ? r.e + '%' : '-'}</td><td>${r.q}</td><td>${r.ok ? '' : '<span class="pill" style="color:var(--bad)">edited</span>'}</td></tr>`).join('')}
     <tr><td><b>Average</b></td><td></td><td>${Math.round(list.reduce((s, r) => s + r.x, 0) / list.length)}</td>${avg.map(v => `<td>${heat(v)}</td>`).join('')}<td>${Math.round(list.reduce((s, r) => s + r.a, 0) / list.length)}%</td><td></td><td></td><td></td></tr></tbody></table></div>
     ${bad.length ? `<p class="small mut">${bad.length} line${bad.length > 1 ? 's' : ''} could not be read.</p>` : ''}<div class="row"><button class="btn sm" id="csv">${ico('copy')}Copy as CSV</button></div><p class="tiny mut">Plate numbers: ${TOPICS.map(t => t.plate + ' ' + t.n).join(', ')}. Numbers under plates are mastery percentages. Codes are not secure, so treat them as a quick check, not an assessment record.</p>`;
    $('#csv', m).onclick = async () => { const csv = ['Name,Class,XP,' + TOPICS.map(t => 'Plate ' + t.plate).join(',') + ',Accuracy,Best exam,Answers', ...list.map(r => [r.n, r.c, r.x, ...r.m, r.a, r.e, r.q].map(v => '"' + String(v).replace(/"/g, '""') + '"').join(','))].join('\n'); toast(await copyText(csv) ? 'CSV copied' : 'Could not copy') };
  };
  $('#go', m).onclick = run; $('#clr', m).onclick = () => { $('#codes', m).value = ''; run() };
  if (saved) run();
};
