/* ===== Start ===== */
applyTheme();
try { matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => { applyTheme(); if (!DB.theme) render() }) } catch (e) { }
render();
