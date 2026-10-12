# Signal

A revision game for Grade 9 Biology, Coordination and Response. One file, no server, no dependencies.

- Map of the body with five plates: nervous system, reflex arc, eye, hormones, plant responses
- Five live labs: impulse, reflex, eye, glucose, plant tropism
- Question types: multiple choice, true or false, ordering, matching, sorting, diagram tap, typed answers
- Spaced review (Leitner boxes), XP, ranks, streaks, badges
- Timed exam mode with a marked results page
- Case files (multi-step clinical scenarios)
- Teacher view: students paste a result code, the teacher sees a class table. Nothing leaves the device.

## Build

    node build.mjs      # writes dist/index.html and dist/fragment.html

Open `dist/index.html` in a browser. Tests (Playwright): `python3 tools/smoke.py`, `labs_test.py`, `flow_test.py`.

## Hosting

Pushing to `main` deploys `dist/` to GitHub Pages through `.github/workflows/pages.yml`.
Enable Pages with source "GitHub Actions" in the repo settings.
