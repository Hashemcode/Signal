'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0;[a[i], a[j]] = [a[j], a[i]] } return a };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const pick = a => a[Math.random() * a.length | 0];
const day = (d = Date.now()) => Math.floor((d - new Date().getTimezoneOffset() * 60000) / 864e5);

/* ---------- icons (stroke, 24px) ---------- */
const IC = {
  map: '<path d="M12 21s-6.5-5.7-6.5-11a6.5 6.5 0 0113 0c0 5.3-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>',
  lab: '<path d="M9 3h6M10 3v6.2L4.6 18.4A2 2 0 006.3 21.5h11.4a2 2 0 001.7-3.1L14 9.2V3"/><path d="M7.5 15h9"/>',
  case: '<rect x="3" y="7" width="18" height="13" rx="2.5"/><path d="M9 7V5.5A1.5 1.5 0 0110.5 4h3A1.5 1.5 0 0115 5.5V7M12 11v5M9.5 13.5h5"/>',
  exam: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4.5l3 1.8M9.5 2.5h5"/>',
  me: '<circle cx="12" cy="8" r="3.8"/><path d="M4.5 20.5c.8-4 3.7-6 7.5-6s6.7 2 7.5 6"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.5 1.5M17.2 17.2l1.5 1.5M5.3 18.7l1.5-1.5M17.2 6.8l1.5-1.5"/>',
  moon: '<path d="M20 14.5A8.5 8.5 0 019.5 4a8.5 8.5 0 1010.5 10.5z"/>',
  snd: '<path d="M4 9.5v5h3.5l5 4v-13l-5 4H4z"/><path d="M16 9a4 4 0 010 6M18.5 6.5a7.5 7.5 0 010 11"/>',
  mute: '<path d="M4 9.5v5h3.5l5 4v-13l-5 4H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  half: '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17" /><path d="M12 3.5a8.5 8.5 0 010 17z" fill="currentColor"/>',
  play: '<path d="M7 4.5l12 7.5-12 7.5z" fill="currentColor"/>',
  bolt: '<path d="M13 2.5L5 13.5h6l-1 8 8-11h-6z" fill="currentColor"/>',
  flame: '<path d="M12 2.5c1 4-3.5 5.5-3.5 10a3.5 3.5 0 007 0c0-1.2-.5-2-1-2.8 2.5 1 4.5 3.4 4.5 6.3a7 7 0 01-14 0c0-6 5-7.5 7-13.5z" fill="currentColor"/>',
  copy: '<rect x="8.5" y="8.5" width="11" height="11" rx="2"/><path d="M15.5 8.5V6A1.5 1.5 0 0014 4.5H6A1.5 1.5 0 004.5 6v8A1.5 1.5 0 006 15.5h2.5"/>',
  star: '<path d="M12 3l2.7 5.7 6.1.8-4.5 4.3 1.1 6.1L12 17l-5.4 2.9 1.1-6.1L3.2 9.5l6.1-.8z" fill="currentColor"/>',
  flag: '<path d="M6 21V4M6 5h11l-2 4 2 4H6"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
  reset: '<path d="M4 12a8 8 0 108-8H7M7 1.5L4 4.5 7 7.5"/>',
  next: '<path d="M9 5l7 7-7 7"/>'
};
const ico = (n, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n]}</svg>`;

/* ---------- storage (falls back to memory when blocked) ---------- */
const KEY = 'signal.v1';
let MEM = null;
const store = {
  load() {
    try { const t = localStorage.getItem(KEY); if (t) return JSON.parse(t) } catch (e) { }
    return MEM || { cur: null, theme: null, sound: false, profiles: {} };
  },
  save(d) { MEM = d; try { localStorage.setItem(KEY, JSON.stringify(d)) } catch (e) { } }
};
const DB = store.load();
const save = () => store.save(DB);
const newProfile = (name, cls) => ({ name, cls: cls || '9B', xp: 0, q: {}, hist: [], exams: [], badges: {}, streak: { last: -1, n: 0 }, cases: {}, labs: {}, created: Date.now() });
const P = () => DB.profiles[DB.cur];
function login(name, cls) {
  name = name.trim().slice(0, 24); if (!name) return false;
  const k = name.toLowerCase();
  const found = Object.keys(DB.profiles).find(x => x.toLowerCase() === k);
  const id = found || name;
  if (!DB.profiles[id]) DB.profiles[id] = newProfile(name, cls);
  else if (cls) DB.profiles[id].cls = cls;
  DB.cur = id; save(); return true;
}

/* ---------- ranks, XP, streaks ---------- */
const RANKS = [['Stimulus', 0], ['Receptor', 120], ['Sensory', 300], ['Relay', 600], ['Motor', 1000], ['Effector', 1600], ['Response', 2500]];
function rankOf(xp) {
  let i = 0; RANKS.forEach((r, k) => { if (xp >= r[1]) i = k });
  const lo = RANKS[i][1], hi = RANKS[i + 1] ? RANKS[i + 1][1] : null;
  return { i, name: RANKS[i][0], lo, hi, pct: hi ? (xp - lo) / (hi - lo) : 1, next: RANKS[i + 1] && RANKS[i + 1][0] };
}
function addXP(n, why) {
  const p = P(); if (!p || !n) return;
  const before = rankOf(p.xp).i; p.xp += Math.round(n); const after = rankOf(p.xp).i;
  touchStreak(); save(); refreshChip();
  if (after > before) { toast(`Rank up: ${RANKS[after][0]}`); confetti(); sfx('win') }
}
function touchStreak() {
  const p = P(), t = day();
  if (p.streak.last === t) return;
  p.streak.n = p.streak.last === t - 1 ? p.streak.n + 1 : 1; p.streak.last = t;
}
const streakNow = () => { const p = P(), t = day(); return p.streak.last >= t - 1 ? p.streak.n : 0 };
function award(id, label) {
  const p = P(); if (p.badges[id]) return false;
  p.badges[id] = Date.now(); save(); toast('Badge earned: ' + label); sfx('win'); return true;
}

/* ---------- audio + feedback ---------- */
let AC = null;
function sfx(kind) {
  if (!DB.sound) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const t = AC.currentTime, seq = { ok: [[660, 0], [880, .09]], no: [[220, 0], [170, .12]], tap: [[520, 0]], win: [[523, 0], [659, .1], [784, .2], [1046, .3]], tick: [[880, 0]] }[kind] || [];
    seq.forEach(([f, d]) => { const o = AC.createOscillator(), g = AC.createGain(); o.type = kind === 'no' ? 'triangle' : 'sine'; o.frequency.value = f; g.gain.setValueAtTime(.0001, t + d); g.gain.exponentialRampToValueAtTime(.12, t + d + .015); g.gain.exponentialRampToValueAtTime(.0001, t + d + .2); o.connect(g).connect(AC.destination); o.start(t + d); o.stop(t + d + .22) });
  } catch (e) { }
}
const buzz = ms => { try { navigator.vibrate && navigator.vibrate(ms) } catch (e) { } };
let toastT;
function toast(msg) {
  $$('.toast').forEach(x => x.remove());
  const d = document.createElement('div'); d.className = 'toast'; d.setAttribute('role', 'status'); d.textContent = msg; document.body.appendChild(d);
  clearTimeout(toastT); toastT = setTimeout(() => d.remove(), 2600);
}
function confetti(n = 40) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cols = ['var(--signal)', 'var(--amber)', 'var(--sky)', 'var(--mint)', 'var(--violet)'];
  for (let i = 0; i < n; i++) {
    const c = document.createElement('i'); c.className = 'conf'; c.style.left = Math.random() * 100 + 'vw'; c.style.background = cols[i % 5];
    c.style.animationDelay = Math.random() * .8 + 's'; c.style.animationDuration = 2 + Math.random() * 1.6 + 's'; document.body.appendChild(c); setTimeout(() => c.remove(), 4500);
  }
}
function xpFly(n) {
  const d = document.createElement('div'); d.className = 'xpfly'; d.textContent = '+' + n + ' XP'; document.body.appendChild(d); setTimeout(() => d.remove(), 1000);
}
const copyText = async (t) => {
  try { await navigator.clipboard.writeText(t); return true } catch (e) { }
  try { const ta = document.createElement('textarea'); ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = 0; document.body.appendChild(ta); ta.select(); const ok = document.execCommand('copy'); ta.remove(); return ok } catch (e) { return false }
};

/* ---------- theme ---------- */
function applyTheme() {
  const r = document.documentElement;
  if (DB.theme) r.setAttribute('data-theme', DB.theme); else r.removeAttribute('data-theme');
  const dark = DB.theme ? DB.theme === 'dark' : !matchMedia('(prefers-color-scheme: light)').matches;
  const m = document.querySelector('meta[name=theme-color]'); if (m) m.content = dark ? '#0A2744' : '#EAF3F9';
}
const isDark = () => DB.theme ? DB.theme === 'dark' : !matchMedia('(prefers-color-scheme: light)').matches;

/* ---------- adaptive scheduling (Leitner boxes) ---------- */
const GAP = [0, 0, 1, 2, 4, 8, 16];            // days until due, by box
function rec(id, frac) {
  const p = P(), r = p.q[id] || (p.q[id] = { b: 0, due: 0, n: 0, ok: 0, last: 0 });
  r.n++; r.ok += frac; r.last = Date.now();
  r.b = frac >= .99 ? Math.min(6, r.b + 1) : frac >= .5 ? Math.max(1, r.b) : 1;
  r.due = day() + GAP[r.b];
}
const boxOf = id => (P().q[id] || {}).b || 0;
function topicStats(t) {
  const p = P(), qs = BANK.filter(q => q.t === t);
  let sum = 0, seen = 0, due = 0, n = 0, ok = 0;
  qs.forEach(q => { const r = p.q[q.id]; if (r) { seen++; sum += Math.min(r.b, 4); n += r.n; ok += r.ok; if (r.due <= day()) due++ } });
  return { total: qs.length, seen, due, mastery: qs.length ? sum / (4 * qs.length) : 0, acc: n ? ok / n : null };
}
const allDue = () => BANK.filter(q => { const r = P().q[q.id]; return r && r.due <= day() }).length;

/* ---------- router ---------- */
const R = { view: 'home', args: {}, stack: [] };
let cleanup = null;
function go(view, args = {}, push = true) {
  if (cleanup) { try { cleanup() } catch (e) { } cleanup = null }
  R.view = view; R.args = args;
  render();
  window.scrollTo(0, 0);
}
const onLeave = fn => { cleanup = fn };
