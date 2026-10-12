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
if (typeof module !== 'undefined') module.exports = GM;
