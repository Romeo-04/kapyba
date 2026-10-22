# KapyBa PRD

Source of truth for product: `KapyBa_CSSPRINT_2026.md.pdf`. UX detail: `docs/UX.md`. Build order: `docs/PLAN.md`.
Status: draft. **(call)** marks a decision I made that the team has not.

## 1. Summary

KapyBa is a mobile-first PWA that tells a carinderia owner, each evening, what to buy at the palengke,
how much, and what it will cost as a range. It uses government market prices and the owner's own sales.
Mascot: a calm capybara. Tagline: "Handa sa palengke, handa sa ulam."

## 2. Problem

Carinderia owners near schools guess daily purchases. Results: wasted fish and vegetables, dishes sold out
by lunch, price surprises, and bad rain or class-suspension days after food is cooked.

## 3. Users

Primary: Aling Rosa, 52, carinderia near España, about 8 ulam a day, shops at 4 AM, uses GCash, keeps a
paper notebook, mid-range Android phone, intermittent data.
Secondary (demo audience): CSSPRINT judges.

## 4. Goals and non-goals

### Goals
- G1. A palengke list with a cost range she trusts, ready every evening.
- G2. Logging takes under one minute a day.
- G3. A visible Bagyo Mode that shrinks the list and cost.
- G4. A demo that never depends on a network.
- G5. Joyful: the capybara makes opening the app pleasant.

### Non-goals (MVP)
- Login or accounts. One hardcoded store.
- A backend server. All logic runs in the app.
- Live price fetching. Bundled `prices.json`.
- Real payments or real Bagyo Fund money. Simulate.
- Supplier ordering, credit, insurance, crowdsourced prices (Phase 2).
- Notebook photo OCR (Phase 2, shown disabled).

### Anti-goals
- A spreadsheet look. A forecast shown as one false-precise number. Scary alerts. Anything that needs typing
  during a palengke trip.

## 5. Success metrics (demo and pilot)

| Metric | Target |
|---|---|
| Setup to first list | ≤ 10 minutes, ≤ 3 minutes with seeded recipes |
| Evening log time | ≤ 60 seconds |
| Demo flow | Runs offline start to finish, 2.5 minutes |
| List correctness | Unit tests match the PDF examples (e.g. weather factor 0.38 → about 57 of 150) |
| Pilot (post-contest) | Owner opens app 5 of 7 days; forecast error falls week over week |

## 6. Features and requirements

Priority: P0 must ship for the demo, P1 should, P2 later.

### F1 Palengke list with cost range (P0, build first)
- R1.1 Convert forecast servings to ingredient quantities via recipes.
- R1.2 Merge shared ingredients across dishes into one line.
- R1.3 Subtract on-hand stock, round up to the buying unit (kg, bundle, piece).
- R1.4 Group by palengke section: Karne, Isda, Gulay, Pampalasa, Iba pa.
- R1.5 Show low / likely / high cost per item and for the trip (`costRange` in the PDF).
- R1.6 Check-off shop mode, night theme, offline.
- R1.7 "Usual" price from her logs replaces market midpoint once present.

### F2 Price data (P0)
- R2.1 A one-time Node script converts DA PDF reports into `prices.json` (`date, market, commodity, low, high`).
- R2.2 Bundle the file. Fall back to the latest available price when a date is missing, and say so in the UI.
- R2.3 Keep markets near UST: Blumentritt, Dagonoy, Paco, Trabajo.
- R2.4 Fallback: hand-encode key items if PDF parsing fails.

### F3 Dish ranking (P0)
- R3.1 Drag to rank. Tags: `keepsWell`, `rainyFav`, `highProfit`.
- R3.2 Ship recipes for 5–6 typical dishes (adobo, sinigang, tinola, bistek, pritong galunggong, ginisang gulay) **(call)**.
- R3.3 Blend ranking with real sales over time and suggest rank changes, owner accepts or declines.

### F4 Daily demand forecast (P0)
- R4.1 `servings = normalDay × calendarFactor × weatherFactor × perishabilityCaution`.
- R4.2 `weatherFactor = P(susp) × suspendedRatio + (1 − P(susp)) × rainyRatio`.
- R4.3 Low/high band from past forecast error.
- R4.4 Learn by moving average from sales and leftovers; leftovers reveal true demand when sold out.
- R4.5 Split total servings across dishes by rank score, ×1.2 for rainy favorites (`plan` in the PDF).

### F5 Smart alerts (P0 for price spike and margin check, P1 for the rest)
- Price spike, margin check, substitute, budget fit. Copy in section 7.
- R5.1 Spike = price up ≥ 20% vs 7-day average **(call)**.
- R5.2 Margin = selling price − recipe cost at today's mid price; warn under ₱10 or under 20% **(call)**.
- R5.3 Each alert has one action that changes the list or menu.

### F6 Bagyo Mode (P0)
- R6.1 Manual Yellow / Orange / Red switch for the demo, auto from bundled PAGASA data for the real flow.
- R6.2 Red shrinks demand via the weather factor and cuts perishables most; list and range update visibly.
- R6.3 Warns about post-storm price jumps and suggests early buying of shelf-stable items.
- R6.4 Bagyo Fund (P1): simulated balance, a few pesos per sale, unlock on bad-weather days.

### F7 Logging (P0)
- R7.1 Morning: total or per item, under 30 seconds.
- R7.2 Evening: leftovers stepper and sold-out toggle per dish.
- R7.3 Edits allowed for the last 7 days.

### F8 Dashboard (P1)
- Sales by dish, waste avoided, money saved vs old guesses, key ingredient price lines. Seeded 30-day history for the demo.

### F9 Mascot and delight (P0 for core states, P1 for the rest)
- Capybara states in `UX.md`. Celebrations never block flow.

### F10 PWA (P0)
- Web manifest (name, capybara icon, theme color), service worker so the list opens offline, installable.

## 7. Copy (Taglish) samples

| Alert | Text |
|---|---|
| Price spike | "Tumaas ng 30% ang sibuyas ngayong linggo. Madami ito sa sinigang at adobo. Bawasan muna ang adobo?" |
| Margin | "Sa presyo ng baboy ngayon, ₱8 lang ang kita sa bawat sinigang. Taasan ng ₱5 o palitan?" |
| Substitute | "Mahal ang galunggong. Tilapia, 20% mas mura." |
| Budget fit | "Mayroon kang ₱2,000. Ito ang pinakamainam na listahan." |
| Bagyo red | "Red warning. Binawasan ko ang listahan ng 62%. Bumili ng de-lata at bigas nang maaga." |

## 8. Data model (bundled JSON, stored on device)

- `prices`: date, market, commodity, low, high
- `sales`: date, dish, servingsSold, leftovers, dayType (`normal | exam | rainy | suspended`)
- `dishes`: name, rank, tags, sellingPrice
- `recipes`: dish, ingredient, amountPerServing
- `ingredients`: name, section, buyUnit, stock
- `userPrices`: date, ingredient, paid (owner logs)
- `settings`: theme, language, budget, bagyoLevel

## 9. Technical approach

- Expo (React Native) with web export as a PWA. TypeScript throughout. Expo Router **(call)**.
- Pure-TypeScript engine in `src/engine` with no UI imports: forecast, plan, costRange, alerts, bagyo. Unit-tested.
- Storage: AsyncStorage (browser storage on web). No network calls in the demo path.
- Charts: a library verified on React Native Web, tested on the web build early. Candidate: `victory-native` web or `react-native-svg` hand-rolled sparkline **(call: start hand-rolled, it is a few lines)**.
- Drag reorder: `react-native-draggable-flatlist` or a web-safe alternative. Verify on web in the first spike.
- Hosting: static web export on Vercel or Netlify.
- Test stack: Jest or Vitest for engine, React Native Testing Library for screens, Playwright for demo flow **(call)**.

## 10. Art and assets

Generated with the connected Codex account. Style: warm flat illustration, cocoa line, cream fill, soft grain.
Single consistent capybara character sheet first, then all poses derived from it.

| Asset | Count |
|---|---|
| Capybara poses (8 states in `UX.md`) | 8 |
| Intro slides | 3 |
| Splash hero | 1 |
| Dish avatars (circle) | 6 |
| Ingredient icons | about 30 |
| Bagyo hero (sky) | 3 levels |
| PWA icon, splash, favicon | 1 set |

Rules: transparent PNG or SVG when possible, 2x and 3x raster, no text baked into images, license recorded.

## 11. Risks

| Risk | Mitigation |
|---|---|
| DA PDFs hard to parse | Hand-encode key items, keep the script optional |
| Charts or drag fail on web | Spike on web in week one |
| Forecast looks arbitrary | Always show range and "why" line |
| Art inconsistent | Character sheet first, reuse as reference for every pose |
| Offline service worker caches stale build | Version the cache, test an update path |

## 12. Open questions for the team

1. Real owner interview results: do they change the dish list or the log flow?
2. English-only fallback needed for judges?
3. Is Android-first or iOS Safari install the demo device?
4. Does the school calendar come from a bundled list or manual flags?
