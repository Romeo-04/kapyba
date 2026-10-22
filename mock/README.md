# KapyBa clickable mock

Throwaway design prototype. Not the Expo app planned in `docs/PLAN.md`.

Open `index.html` in a browser, or serve this folder:

```
python -m http.server 5173
```

Then visit `http://127.0.0.1:5173/index.html`. Add `#home`, `#list`, `#bagyo` and so on to jump to a screen.

- `engine.js` ports `plan()` and `costRange()` from the product doc. The red warning gives a weather factor of 0.38.
- `index.html` holds all 18 screens from `docs/UX.md`, with an SVG capybara standing in for Codex-generated art.
- All data is made up. No network calls.

Try: Splash, then "Demo ni Aling Rosa", then Palengke list, then Bagyo Mode and switch to Red.
