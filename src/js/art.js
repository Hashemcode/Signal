/* ===== Hand-drawn SVG: diagrams for label questions, the body plate, lab-card icons ===== */
const P_ = (id, label, inner, hit = '') => `<g class="part" data-p="${id}" role="button" tabindex="0" aria-label="${label}">${hit}${inner}</g>`;

const DIAG = {
  eye: {
    vb: '20 36 400 232', parts: { cornea: 'Cornea', iris: 'Iris', pupil: 'Pupil', lens: 'Lens', lig: 'Suspensory ligaments', cil: 'Ciliary muscle', retina: 'Retina', optic: 'Optic nerve', sclera: 'Sclera' },
    svg: () => `
 ${P_('sclera', 'Sclera', '<circle class="shape f-s2 s-l w5" cx="255" cy="150" r="100"/>', '<circle class="hit nofill" cx="255" cy="150" r="104"/>')}
 <circle class="f-bg" cx="255" cy="150" r="93"/>
 <circle class="nofill s-l1 w1 dash" cx="255" cy="150" r="60" opacity=".5"/>
 <text class="tx" x="248" y="154">vitreous humour</text>
 ${P_('retina', 'Retina', '<path class="shape nofill s-sig w5 rnd" d="M278.8 61.5A92 92 0 0 1 278.8 238.5"/>', '<path class="hit nofill" d="M278.8 61.5A92 92 0 0 1 278.8 238.5"/>')}
 ${P_('cornea', 'Cornea', '<path class="shape t-sky s-sky w5 rnd" d="M175 92Q122 150 175 208"/>', '<path class="hit nofill" d="M175 92Q122 150 175 208"/>')}
 ${P_('iris', 'Iris', '<path class="shape f-amb s-amb w2" d="M178 100l16 30-12 4-8-26zM178 200l16-30-12-4-8 26z"/>', '<path class="hit nofill" d="M178 104l12 24M178 196l12-24"/>')}
 ${P_('pupil', 'Pupil', '<rect class="shape f-bg s-mut w1 dash" x="172" y="134" width="26" height="32" rx="5"/>')}
 ${P_('lens', 'Lens', '<ellipse class="shape t-sky s-sky w3" cx="218" cy="150" rx="17" ry="38"/>')}
 ${P_('lig', 'Suspensory ligaments', '<path class="shape nofill s-ink w2 rnd" d="M214 114L198 96M214 186L198 204M222 113L207 92M222 187L207 208"/>', '<path class="hit nofill" d="M214 114L198 96M214 186L198 204M222 113L207 92M222 187L207 208" style="stroke-width:16"/>')}
 ${P_('cil', 'Ciliary muscle', '<ellipse class="shape t-vio s-vio w2" cx="196" cy="90" rx="20" ry="11" transform="rotate(25 196 90)"/><ellipse class="shape t-vio s-vio w2" cx="196" cy="210" rx="20" ry="11" transform="rotate(-25 196 210)"/>')}
 ${P_('optic', 'Optic nerve', '<path class="shape nofill s-amb w8 rnd" d="M350 158Q380 162 408 150"/><path class="nofill s-bg" d="" />', '<path class="hit nofill" d="M350 158Q380 162 408 150"/>')}
 <path class="nofill s-mut w1 dash" d="M30 150H120" /><path class="nofill s-mut w2 rnd" d="M110 143l12 7-12 7" />
 <text class="tx" x="26" y="140">light</text>`
  },
  neurone: {
    vb: '0 0 420 200', parts: { dend: 'Dendrites', body: 'Cell body', nuc: 'Nucleus', axon: 'Axon', myelin: 'Myelin sheath', term: 'Axon terminals' },
    svg: () => `
 ${P_('dend', 'Dendrites', '<g class="shape nofill s-sig w3 rnd"><path d="M70 85Q46 62 26 40M26 40Q16 30 8 28M26 40Q34 30 34 18M66 118Q40 136 24 162M24 162Q12 172 6 170M24 162Q30 174 28 186M78 78Q72 54 80 26M80 26Q88 16 100 14M80 26Q72 14 64 10"/></g>', '<path class="hit nofill" d="M70 85Q46 62 26 40M66 118Q40 136 24 162M78 78Q72 54 80 26"/>')}
 ${P_('axon', 'Axon', '<path class="shape nofill s-sig w5 rnd" d="M118 100H318"/>', '<path class="hit nofill" d="M118 100H318" style="stroke-width:30"/>')}
 ${P_('myelin', 'Myelin sheath', '<rect class="shape f-amb s-amb w1" x="138" y="86" width="46" height="28" rx="14"/><rect class="shape f-amb s-amb w1" x="190" y="86" width="46" height="28" rx="14"/><rect class="shape f-amb s-amb w1" x="242" y="86" width="46" height="28" rx="14"/>')}
 ${P_('term', 'Axon terminals', '<g class="shape nofill s-sig w3 rnd"><path d="M318 100L350 76M318 100L352 124M318 100H358"/></g><g class="f-sig"><circle cx="352" cy="74" r="7"/><circle cx="355" cy="126" r="7"/><circle cx="363" cy="100" r="7"/></g>', '<path class="hit nofill" d="M318 100L350 76M318 100L352 124M318 100H358" style="stroke-width:30"/>')}
 ${P_('body', 'Cell body', '<path class="shape t-sig s-sig w3" d="M60 98C58 78 80 66 100 70C120 74 124 96 116 110C108 132 76 136 64 120C59 114 59 106 60 98Z"/>')}
 ${P_('nuc', 'Nucleus', '<circle class="shape f-sig s-sig w1" cx="92" cy="100" r="13"/><circle class="f-bg" cx="95" cy="103" r="4"/>')}`
  },
  brain: {
    vb: '0 0 320 270', parts: { cerebrum: 'Cerebrum', cerebellum: 'Cerebellum', medulla: 'Medulla' },
    svg: () => `
 ${P_('cerebrum', 'Cerebrum', '<path class="shape t-sig s-sig w3 rnd" d="M52 150C28 76 108 24 184 30C262 36 296 92 274 146C256 178 206 176 164 170C112 166 74 186 52 150Z"/><g class="nofill s-sig w1 rnd" opacity=".7"><path d="M90 70Q120 60 140 84Q160 60 200 66M72 112Q108 96 130 120Q160 96 200 112Q232 96 262 120M96 148Q130 132 160 150Q196 134 230 146"/></g>')}
 ${P_('cerebellum', 'Cerebellum', '<path class="shape t-mint s-mint w3 rnd" d="M196 182C204 160 262 156 280 178C292 196 262 222 230 220C206 218 190 202 196 182Z"/><g class="nofill s-mint w1" opacity=".8"><path d="M204 186Q240 176 276 186M204 196Q242 188 280 198M210 207Q244 200 268 210"/></g>')}
 ${P_('medulla', 'Medulla', '<path class="shape t-amb s-amb w3 rnd" d="M172 176C176 196 182 226 188 252L216 252C214 232 212 206 208 178Z"/>', '<path class="hit nofill" d="M184 180L200 250" style="stroke-width:34"/>')}
 <text class="tx" x="30" y="190">front</text><text class="tx" x="262" y="248">back</text>`
  },
  arc: {
    vb: '0 0 420 270', parts: { rec: 'Receptor', sens: 'Sensory neurone', relay: 'Relay neurone', motor: 'Motor neurone', eff: 'Effector (muscle)' },
    svg: () => `
 <rect class="f-s3" x="20" y="22" width="150" height="38" rx="10"/><text class="tx" x="30" y="44">skin</text>
 <circle class="f-bg s-l w2" cx="290" cy="150" r="62"/>
 <path class="t-sky s-sky w1" d="M290 118c-28-14-44 10-34 28c-8 22 12 38 34 22c22 16 42 0 34-22c10-18-6-42-34-28z"/>
 <text class="tx" x="248" y="224">spinal cord</text>
 ${P_('rec', 'Receptor', '<circle class="shape f-sig s-sig w2" cx="96" cy="60" r="10"/><path class="nofill s-sig w1" d="M96 50v-14M86 54l-8-10M106 54l8-10" />', '<circle class="hit" cx="96" cy="58" r="24"/>')}
 ${P_('sens', 'Sensory neurone', '<path class="shape nofill s-sig w5 rnd" d="M106 62H238Q282 62 290 96"/>', '<path class="hit nofill" d="M106 62H238Q282 62 290 96"/>')}
 ${P_('relay', 'Relay neurone', '<path class="shape nofill s-mint w5 rnd" d="M290 98V176"/><circle class="shape f-mint" cx="290" cy="138" r="8"/>', '<path class="hit nofill" d="M290 98V176"/>')}
 ${P_('motor', 'Motor neurone', '<path class="shape nofill s-amb w5 rnd" d="M290 176Q282 212 240 214H120"/>', '<path class="hit nofill" d="M290 176Q282 212 240 214H120"/>')}
 ${P_('eff', 'Effector (muscle)', '<ellipse class="shape t-vio s-vio w3" cx="76" cy="214" rx="48" ry="22"/><g class="nofill s-vio w1" opacity=".7"><path d="M40 214h72M48 203h54M48 225h54"/></g>')}
 <circle class="f-ink" cx="290" cy="98" r="3.5"/><circle class="f-ink" cx="290" cy="176" r="3.5"/>`
  },
  gland: {
    vb: '0 0 300 420', parts: { pit: 'Pituitary gland', thy: 'Thyroid gland', adr: 'Adrenal glands', panc: 'Pancreas' },
    svg: () => `
 <g class="f-s2 s-l w2 rnd"><circle cx="150" cy="52" r="34"/><path d="M138 84v24h24V84"/><path d="M96 124Q150 106 204 124L226 270Q150 306 74 270Z"/><path d="M96 126L66 244M204 126L234 244"/></g>
 <ellipse class="f-s3 s-l1 w1" cx="118" cy="232" rx="17" ry="25"/><ellipse class="f-s3 s-l1 w1" cx="182" cy="232" rx="17" ry="25"/>
 <text class="tx" x="104" y="270" opacity=".0">kidneys</text>
 ${P_('pit', 'Pituitary gland', '<circle class="shape f-sig s-sig w2" cx="150" cy="62" r="7"/>', '<circle class="hit" cx="150" cy="62" r="10"/>')}
 ${P_('thy', 'Thyroid gland', '<path class="shape f-mint s-mint w2 rnd" d="M138 112c-12-6-16 8-10 14c8 4 14-2 22-4c8 2 14 8 22 4c6-6 2-20-10-14c-6 4-8 4-12 4s-6 0-12-4z"/>', '<rect class="hit" x="124" y="106" width="52" height="28"/>')}
 ${P_('adr', 'Adrenal glands', '<path class="shape f-amb s-amb w2 rnd" d="M110 206c4-8 18-8 20 0c-6 4-14 6-20 0zM190 206c-4-8-18-8-20 0c6 4 14 6 20 0z"/>', '<circle class="hit" cx="120" cy="206" r="12"/><circle class="hit" cx="180" cy="206" r="12"/>')}
 ${P_('panc', 'Pancreas', '<path class="shape f-vio s-vio w2 rnd" d="M104 262Q130 244 160 252Q190 258 204 246Q214 262 192 270Q160 280 130 272Q112 270 104 262Z"/>', '<rect class="hit" x="100" y="242" width="112" height="38"/>')}
 <text class="tx" x="214" y="214" opacity="0">x</text>`
  }
};
function diagramHTML(name, st = {}) {
  const d = DIAG[name];
  return `<div class="diag"><svg viewBox="${d.vb}" role="group" aria-label="${name} diagram">${d.svg()}</svg></div>`;
}

/* ===== Body plate (home screen). Coordinates are in a 340x560 box ===== */
const PLATE_HOT = [   // topic, hotspot centre in svg units (340x580), label anchor + label top
  { t: 0, hx: 46, hy: 46, ax: 'l', ly: 74 }, { t: 2, hx: 294, hy: 46, ax: 'r', ly: 74 },
  { t: 1, hx: 38, hy: 262, ax: 'l', ly: 290 }, { t: 3, hx: 296, hy: 224, ax: 'r', ly: 252 },
  { t: 4, hx: 262, hy: 488, ax: 'r', ly: 548 }
];
function plateSVG() {
  return `<svg viewBox="0 0 340 580" aria-hidden="true">
 <defs><clipPath id="bodyclip"><circle cx="170" cy="62" r="33"/><rect x="156" y="92" width="28" height="30"/><path d="M104 130Q170 108 236 130L252 300Q170 330 88 300Z"/></clipPath></defs>
 <g class="f-s1 s-l w2 rnd">
  <ellipse cx="170" cy="66" rx="30" ry="36"/>
  <path d="M158 98v24h24V98"/>
  <path d="M104 128Q170 106 236 128Q246 150 244 190L252 302Q170 334 88 302L96 190Q94 150 104 128Z"/>
  <path d="M112 134L88 212L78 296L98 300L110 226L124 170" /><path d="M228 134L252 212L262 296L242 300L230 226L216 170"/>
  <path d="M130 318L124 440L130 536H156L162 440L168 330M210 318L216 440L210 536H184L178 440L172 330"/>
 </g>
 <g class="nofill s-l1 w1 dash" opacity=".7"><path d="M170 104V300M146 160Q170 168 194 160M142 190Q170 200 198 190M140 220Q170 230 200 220"/></g>
 <g class="nofill s-sig w2 rnd" opacity=".9">
  <path d="M170 98V290"/><path d="M170 150L112 168L90 240L84 292M170 150L228 168L250 240L256 292M170 290L136 340L128 440L130 520M170 290L204 340L212 440L210 520"/>
 </g>
 <ellipse class="t-sig s-sig w2" cx="170" cy="48" rx="21" ry="15"/><path class="nofill s-sig w1" d="M155 46q8-8 16 0t14-2M158 54q10-6 20 0"/>
 <circle class="f-bg s-sky w2" cx="183" cy="66" r="7.5"/><circle class="f-sky" cx="183" cy="66" r="3"/>
 <g class="f-amb"><ellipse cx="146" cy="224" rx="9" ry="5" transform="rotate(-20 146 224)"/><ellipse cx="194" cy="224" rx="9" ry="5" transform="rotate(20 194 224)"/></g>
 <path class="t-vio s-vio w2 rnd" d="M146 238Q166 228 196 238Q206 246 190 250Q164 254 148 248Z"/>
 <g class="nofill s-l1 w1 dash" opacity=".9"><path d="M150 48H69M190 66L271 48M200 224H273M84 262H61"/></g>
 <g transform="translate(8 -12)"><path class="f-sig" d="M70 316c10 10 16 18 14 30c-2 10-10 16-18 16s-16-6-16-16c0-8 5-12 8-20c2 4 4 5 6 3c1-4 3-8 6-13z"/>
 <path class="f-amb" d="M68 340c6 6 9 10 8 16c-1 5-5 8-9 8s-8-3-8-8c0-4 3-7 4-10c2 2 3 2 5 0z"/></g>
 <g transform="translate(262 452)">
  <ellipse class="f-s3" cx="0" cy="84" rx="30" ry="8"/><path class="f-s2 s-l w2" d="M-22 62h44l-6 22h-32z"/>
  <path class="nofill s-mint w3 rnd" d="M0 62C0 40 0 26 0 4"/><path class="t-mint s-mint w2" d="M0 28c-20-4-32-18-30-34c18 0 30 12 30 34zM0 18c18-2 28-14 28-30c-16 2-28 12-28 30z"/>
 </g>
 <path class="pulse-path" id="plpath" pathLength="1" d="M80 318L84 298L88 244L112 168L170 150L170 200L112 190L96 230"/>
</svg>`;
}

/* lab card glyphs (small, 120x110) */
const GLYPH = {
  neuro: `<svg viewBox="0 0 120 110"><g class="nofill s-sig w3 rnd"><path d="M12 30l22 16M10 70l24-14M34 46H100"/><path d="M100 46l12-12M100 46l12 12"/></g><circle class="t-sig s-sig w3" cx="38" cy="50" r="14"/><circle class="f-sig" cx="38" cy="50" r="5"/><rect class="f-amb" x="52" y="40" width="14" height="12" rx="6"/><rect class="f-amb" x="70" y="40" width="14" height="12" rx="6"/></svg>`,
  reflex: `<svg viewBox="0 0 120 110"><path class="nofill s-amb w3 rnd" d="M14 24H70Q92 24 92 48V78Q92 92 70 92H30"/><circle class="f-amb" cx="14" cy="24" r="7"/><circle class="t-amb s-amb w2" cx="92" cy="58" r="14"/><ellipse class="t-vio s-vio w2" cx="30" cy="92" rx="18" ry="9"/></svg>`,
  eye: `<svg viewBox="0 0 120 110"><path class="t-sky s-sky w3 rnd" d="M8 55Q60 -4 112 55Q60 114 8 55Z"/><circle class="f-s3 s-sky w2" cx="60" cy="55" r="22"/><circle class="f-bg" cx="60" cy="55" r="10"/><circle class="f-sky" cx="53" cy="48" r="3"/></svg>`,
  glucose: `<svg viewBox="0 0 120 110"><path class="nofill s-vio w3 rnd" d="M8 70Q26 20 46 44T84 40T112 78"/><rect class="t-vio" x="8" y="48" width="104" height="28" opacity=".35"/><path class="nofill s-mut w1 dash" d="M8 48H112M8 76H112"/><circle class="f-vio" cx="84" cy="40" r="5"/></svg>`,
  plant: `<svg viewBox="0 0 120 110"><path class="f-s3" d="M26 98h68v6H26z"/><path class="nofill s-mint w3 rnd" d="M60 98Q60 70 74 48Q82 36 88 30"/><path class="t-mint s-mint w2" d="M72 52c-18 0-30-10-32-24c18-2 30 8 32 24zM80 40c14-4 22-14 22-26c-14 2-22 12-22 26z"/><circle class="f-amb" cx="100" cy="14" r="8"/></svg>`
};
