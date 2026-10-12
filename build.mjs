// Concatenates src/ into one self-contained dist/index.html (works offline, no dependencies).
import fs from 'node:fs';
import path from 'node:path';
const R = p => fs.readFileSync(path.join(import.meta.dirname, p), 'utf8');
const order = [
  'js/core.js', 'js/art.js', 'js/data.js', 'js/questions.js', 'js/charts.js',
  'js/labs-neuro.js', 'js/labs-reflex.js', 'js/labs-eye.js', 'js/labs-glucose.js', 'js/labs-plant.js',
  'js/screens.js', 'js/exam.js', 'js/teacher.js', 'js/main.js'
];
const logo = 'data:image/png;base64,' + fs.readFileSync(path.join(import.meta.dirname, 'src/logo.png')).toString('base64');
const orig = fs.readFileSync(path.join(import.meta.dirname, 'data/orig.json'), 'utf8');
let js = order.map(f => `/* ---- ${f} ---- */\n` + R('src/' + f)).join('\n');
js = js.replace('__ORIG__', orig).replace('__LOGO__', logo);
let html = R('src/index.html').replace('/*__CSS__*/', R('src/style.css')).replace('/*__JS__*/', () => js);
fs.mkdirSync(path.join(import.meta.dirname, 'dist'), { recursive: true });
fs.writeFileSync(path.join(import.meta.dirname, 'dist/index.html'), html);
console.log('built dist/index.html', (html.length / 1024).toFixed(0) + ' KB');

// Artifact fragment: no doctype/html/head/body, for hosts that wrap the page themselves.
const css = R('src/style.css');
const frag = `<title>Signal</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,300..800&display=swap">
<style>
${css}
</style>
<div id="app" aria-live="polite"></div>
<script>
${js}
</script>
`;
fs.writeFileSync(path.join(import.meta.dirname, 'dist/fragment.html'), frag);
console.log('built dist/fragment.html');
