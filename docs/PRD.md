# KapyBa PRD (v2, dish-rating platform)

Replaces the pre-pivot forecast-app PRD. Product reasoning: `docs/IDEA.md`. Screens and components: `docs/UX.md`. Build order, stack and deploy checklist: `docs/PLAN.md`. Evidence: `docs/BRIEF.md`, `docs/research/`.
Status: draft for team review. **(call)** = decision I made that the team has not. **(open)** = needs a human answer, tracked in `docs/adr/001-decisions.md`.

## 1. Summary

KapyBa is a free, capybara-guided, mobile-first PWA with two sides.
- **Owners** (karinderya) see how customers rate each dish, compare it with nearby stalls, get private coaching, and cook and shop smarter, including a palengke list and a way to post their own deals (Alok).
- **Buyers** (students and workers) see which dishes are worth their money and rate in two taps by scanning a QR at the stall. No account.

Tagline: "Handa sa palengke, handa sa ulam." Mascot: a calm capybara.

## 2. Problem

> Carinderia owners cook blind: they get no dish-level feedback on what customers like, so unsold ulam is wasted, while students and workers cannot tell which stall's dishes are worth their budget.

Details, evidence and the competitor gap are in `BRIEF.md`. Linked pains: no structured feedback, cooked-but-unsold food, no way for buyers to compare cash-only stalls, price and weather shocks.

## 3. Users

| User | Description | Needs |
|---|---|---|
| **Owner** (primary) | A tindera or tindero, often 40–60, mid-range Android, intermittent data, hot counter, no time to read | Know what to cook and buy; see which dish to fix; attract buyers; low effort, mostly taps |
| **Buyer** (primary) | Student or worker with a ₱50–100 lunch budget, in a hurry | Pick a dish worth the money; rate without signing up |
| **Reviewer** (support) | Handles Ulat reports. **(open)** who this is | Review a flagged burst fast and log the decision |
| **Team admin** (support) | Our team during the pilot | Onboard stalls, check health, take down a bad stall |

## 4. Goals, non-goals, anti-goals

### Goals
- G1. A buyer rates a dish in two taps and under 10 seconds from scanning the QR.
- G2. An owner finishes setup (Simula) in under 2 minutes with prefilled recipes, and logs a day in under 1 minute.
- G3. The owner sees real, private, actionable coaching per dish (tags, trend, Kumpara, recommendations).
- G4. Unsold ulam falls at pilot stalls (peso value of leftovers per day).
- G5. Buyers can pick by budget from a board that is honest about missing data.
- G6. Works on weak signal: owner taps and buyer ratings queue and sync once.
- G7. Deployed, monitored and recoverable (see `PLAN.md` section 5).

### Non-goals (MVP)
- Real insurance or payouts. The Bagyo Fund is a simulation (RA 10607).
- Payments, delivery, ordering, credit scoring, loyalty accounts.
- Owner reply to ratings, languages beyond Taglish, push notifications. Deferred in `IDEA.md`.
- Cross-stall promotions or paid placement.
- Photo OCR of notebooks.

### Anti-goals
- A public worst-list or any shaming of stalls.
- A score that looks precise on thin data (never fake or smooth a number).
- Deals or anything else tied to a rating (incentivised reviews).
- Anything that needs typing at the palengke or the counter.

## 5. Success metrics

| Metric | Target | Source |
|---|---|---|
| Time from QR scan to submitted rating | median ≤ 10 s | event timestamps |
| Owner setup time | ≤ 2 min median | onboarding events |
| Ratings per pilot stall | ≥ 30 verified in 2 weeks | `ratings` |
| Distinct buyers per stall | ≥ 10 in 2 weeks | `ratings` |
| Owner still active on day 14 | ≥ 2 of 3 stalls | sessions |
| Leftover pesos per day vs baseline week | falls | `daily_logs` |
| Duplicate-rating bypass | 0 | server rejects, tested |
| Sync correctness | 0 double-counted ratings after offline replay | e2e |
| Errors | < 1% of requests 5xx | Sentry and logs |

## 6. Requirements

Priority: P0 ships for the pilot, P1 should, P2 later. Each requirement maps to a screen in `UX.md` and a unit in `PLAN.md`.

### F1 Owner onboarding, Simula (P0) — O0, U6
- R1.1 Sign in with the chosen method (**open**); no password.
- R1.2 Six steps: stall name, area, dishes from an icon grid, prices, base servings, QR. Recipes prefilled, editable later.
- R1.3 Resume mid-way after refresh or reload.
- R1.4 Ends on Ngayon with a printable QR (PDF).

### F2 Buyer rating (P0) — B2, B3, B4, S2, U7
- R2.1 The QR opens `/s/[stallCode]` and issues a short-lived signed token bound to the device.
- R2.2 Rating = face (sad, neutral, happy). Sad or neutral adds optional tag icons: salt, plate, flame, coin.
- R2.3 One rating per dish per device per day, enforced by a database unique key. A repeat shows "already rated" (B4), not an error.
- R2.4 Submissions carry an idempotency key so an offline replay never double counts.

### F3 Ulam board for buyers (P0) — B1, U9
- R3.1 Lists dishes whose score passes the gate: ≥ 10 ratings from ≥ 5 distinct devices in the last 30 days, and the owner has published.
- R3.2 Below the gate a dish shows Kulang pa with progress, or the owner's Paborito pick (label, no score). Never a placeholder score.
- R3.3 Budget chips (₱50, ₱70, ₱100), area filter, ribbons for Sulit, Sale, Naubos and Alok, last-updated clock.
- R3.4 Order by score against price. A deal never changes position.

### F4 Owner Ngayon and dish detail (P0) — O1, O2, U8
- R4.1 Per dish: score ring (happy ≥ 4.0, neutral 3.4–3.99, sad < 3.4, arc = score / 5), trend, count, tag bars, Gumaganda badge.
- R4.2 Private view includes ratings not yet public and flagged ratings.
- R4.3 Publish switch per dish, effective immediately on the board.
- R4.4 Paborito: up to three owner picks.

### F5 Kumpara and recommendations (P1) — O2, U11
- R5.1 Implied owner view from base servings and price; no quiz.
- R5.2 Neighbourhood tick on each tag bar from a real aggregate of stalls in the same area. Hidden until at least 3 stalls qualify.
- R5.3 Pansin flag: amber if the owner cooks a lot of a dish rated low, green if little of a dish rated high.
- R5.4 Up to three recommendation cards (Bawasan, Dagdagan, Painitin, Konti, Dagdag, Taasan) derived by tested rules.

### F6 Daily log, Natira, Bukas (P0) — O3, O4, U10
- R6.1 Morning: cooked servings per dish, under 30 seconds.
- R6.2 Evening: sold, leftover and Naubos toggle; edits allowed for the last 7 days.
- R6.3 Bukas: tomorrow's servings from base, leftovers, ratings and weather; shown as a plan, never a single false-precise number.
- R6.4 Sale: one-tap discount on a dish, visible on the board.

### F7 Palengke list (P0) — O5, U10
- R7.1 Convert Bukas servings into ingredient quantities by recipe, merge shared ingredients, subtract on-hand stock, round up to the buying unit.
- R7.2 Group by section (Karne, Isda, Gulay, Pampalasa, Iba pa); show low, likely and high cost for each item and the trip.
- R7.3 Prices come from the bundled DA price file; a missing date falls back to the latest available and says so. The owner's own logged prices replace market midpoints once present.
- R7.4 Check-off shop mode that works offline.
- R7.5 Price spike alert at ≥ 20% above the 7-day average **(call)**.

### F8 Alok, owner-only deals (P1) — O8, U12
- R8.1 Kinds: Combo, Suki (stamp card), Oras (timed). Limit and expiry required.
- R8.2 Buyer sees a ribbon and remaining count; claims by showing the screen; the owner taps to mark claimed. No payments.
- R8.3 Server rejects any Alok payload that references a rating or score, and the board order ignores deals.
- R8.4 The app suggests an Alok for dishes that keep appearing in Natira.

### F9 Ulat, abuse reporting (P1) — O7, U13
- R9.1 An owner reports a burst of suspicious ratings on a dish. The ratings stay in the owner's private view and leave the public score while a report is open.
- R9.2 Weekly report limit per stall. A rejected report restores the ratings. Every step writes an audit event.
- R9.3 A protected reviewer page (or a runbook query in the pilot) can uphold or reject. Reviewer and turnaround: **(open)**.

### F10 Bagyo Mode (P1) — O1, U14
- R10.1 Open-Meteo forecast feeds a rain pill; a manual Yellow, Orange or Red switch is the source of truth on storm days.
- R10.2 Red shrinks Bukas and the list, cutting perishables most.
- R10.3 Bagyo Fund screen is a simulation, labelled Simulasyon. Shipped strings never contain "insurance", "covered" or "guaranteed", and a test enforces it.

### F11 Offline and low signal (P0) — S1, U15
- R11.1 Owner taps and buyer ratings write to an on-device queue first and sync when online, in order, once each.
- R11.2 The UI shows an offline state and the last-updated time; stale data is labelled, not hidden.

### F12 PWA (P0)
- Web manifest, versioned service worker cache, install prompt, update path tested so a new deploy does not strand users on a stale build.

### F13 Cold start (P0) — U9
- Paborito picks, Kulang pa progress and a 3-stall pilot around one school. Nothing is seeded in production.

## 7. Non-functional requirements

| Area | Requirement |
|---|---|
| Performance | Buyer board and rating page ≤ 150 KB JS first load; usable on throttled 3G; Lighthouse PWA and accessibility ≥ 90 |
| Availability | Health check `/api/health`; alert to a named person; restore drill done once |
| Security | Authorization on every owner route (another owner gets 403); input validation; rate limits per IP and device; httpOnly, secure, same-site cookies; dependency audit |
| Privacy | Device token only, no buyer names; retention 12 months; deletion on request (RA 10173); notice at first rating and first sign-in; see `PRIVACY.md` |
| Accessibility | 44 px targets, screen-reader labels, contrast, reduced motion; icon-comprehension test with 5 owners |
| Legal wording | No "insurance" for the Fund; no deal tied to ratings (Google, FTC, UK guidance) |
| Localization | Taglish strings in one file so other languages can be added later |

## 8. Data model

The authoritative schema is in `PLAN.md` section 2: `owners`, `stalls`, `dishes`, `ratings`, `devices`, `daily_logs`, `alok`, `alok_claims`, `reports`, `events`. Scores, counts, tag shares and neighbourhood averages are always derived from `ratings`, never stored by hand.

## 9. Technical approach

Summary only; the reasoning and unit breakdown are in `PLAN.md`.
- Next.js (App Router) and TypeScript, installable PWA, hosted on Vercel.
- Postgres on Neon with Drizzle; one migration per change.
- Pure domain code in `src/domain` (scoring, integrity, recommendations, Alok rules) with unit tests at every threshold.
- Service worker plus an IndexedDB queue for offline.
- Vitest, Playwright and axe in CI through `npm run gate`.

## 10. Rollout

3 stalls around one school for 2 weeks; team onboards each owner in person. Metrics in section 5. Widen only after a weekly review. Targeted SDGs and their measures: `IDEA.md` section 15.

## 11. Risks

See `PLAN.md` section 9. Highest: fake or friend-driven ratings, too few ratings, owners not placing the QR, and an unresolved Ulat reviewer.

## 12. Open questions

1. Owner sign-in: email magic link or phone OTP?
2. Who reviews Ulat reports and how fast?
3. Is a receipt or slip code needed on top of the QR to prove the buyer bought? (IDEA.md marks this an assumption.)
4. Which school and which three stalls?
5. Do owners accept publishing scores by default or only by opt-in? (The plan assumes opt-in per dish.)
