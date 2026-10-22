# KapyBa: the whole idea

Team Kapybytes, CSSPRINT 2026. Evidence and sources live in `docs/BRIEF.md` and `docs/research/`. This file is the idea itself: what it is, how it works, what is still weak. Items marked **(assumption)** are untested.

## 1. One line

A free capybara-guided app where karinderya customers rate dishes in two taps, owners get private coaching and a smarter shopping list, and nearby students and workers see which dishes are worth their money.

## 2. The problem

> Carinderia owners cook blind: they get no dish-level feedback on what customers like, so unsold ulam is wasted, while students and workers cannot tell which stall's dishes are worth their budget.

Three linked pains (details and evidence in `BRIEF.md` section 2):
1. Owners never learn why a dish does not sell (no structured feedback).
2. Cooked-but-unsold ulam is lost money and food (waste).
3. Buyers cannot judge value before paying (no dish-level, price-aware signal).

Side problem: typhoons wipe out days of sales, and prices at the palengke swing weekly.

## 3. Who it is for

| User | Needs | What they do in the app |
|---|---|---|
| **Owner** (tindera or tindero, often one cook) | Know what to cook and buy, stop losing food, not be shamed publicly | See dish health, log leftovers, plan tomorrow, shop with a price-aware list |
| **Buyer** (student, worker nearby) | Pick a dish worth the money, fast | Browse the Ulam board, rate after eating |
| **Partner** (school, LGU, DTI) | Livelihood and food-waste outcomes (later) | Funds access and sees aggregate, anonymised data |

## 4. How it works (the loop)

```
Buyer eats -> scans stall QR -> two taps (face + optional tag) -> private to owner
Owner sees ring + tag bars -> coach says one thing -> cooks and buys differently
End of day: owner taps leftovers -> forecast shrinks or grows tomorrow's list
Enough distinct buyers -> dish score becomes public on the Ulam board
Board helps new buyers choose -> more ratings -> loop continues
```

The owner loop is the product. The buyer board is how ratings get collected and why owners join.

## 5. Features

### Owner
| Feature | What it does | Pain |
|---|---|---|
| **Ngayon (today)** | Dish tiles with score ring, face and the top problem icon | 1 |
| **Dish detail** | Tag bars (sarap, alat, init, dami, sulit), 30-day trend, capybara coach in one icon-pair | 1 |
| **Gumaganda badge** | Shown when a dish's 30-day trend rises | 1 |
| **Publish switch** | Owner chooses whether a dish's score is public (opt-in) | fear of shaming |
| **Naubos (sold out)** | One tap marks a dish gone; it greys out on the board and feeds demand data | 3 |
| **Sale (huling plato)** | Owner discounts a dish near closing; buyers see the tag | 3 **(assumption)** |
| **Natira (leftovers)** | Tap plates per dish; shows count and peso cost | 3 |
| **Bukas (tomorrow)** | Suggested servings per dish from ratings, leftovers and typhoon level | 3 |
| **Palengke list** | Ingredient list with price range, spike alerts, check-off | cost |
| **Bagyo Mode + Fund simulation** | Typhoon level shrinks the plan; a simulated payout shows what a parametric cover could pay | weather |
| **Linis check-in** | Three-icon weekly checklist (self-reported hygiene) | 4 |
| **Stall QR** | Printable code that opens the rating page, no buyer account | 1, 6 |

### Buyer
| Feature | What it does | Pain |
|---|---|---|
| **Ulam board** | Dishes near a landmark, ranked by score against price; "Sulit" ribbon on the best | 2, 8 |
| **Budget chips** | Tap a peso amount to hide dishes above it | 8 |
| **Lock state** | A dish with too few ratings shows a lock, not a misleading score | 6, 9 |
| **Sale and Naubos tags** | See what is discounted or gone before walking over | 3 |
| **Rate** | Face (sad, neutral, happy) plus tag icons for sad or neutral; one rating per dish per day | 1, 6 |

## 6. Rating integrity and the low-rating rule

- **Private first.** Negative feedback reaches the owner as tags, not a public star.
- **Public only after a minimum:** 10 ratings from 5 or more distinct buyers **(assumption)**. Until then the dish shows a lock.
- **30-day rolling window**, so one bad week recovers.
- **One rating per dish per buyer per day**; QR plus a receipt or slip code gates ratings to people who bought **(assumption on the code mechanic)**.
- **No public worst-lists.** Owner chooses publication.
- **Honest limits:** a determined faker can still scan with several phones. Mitigation is distinct-buyer counts and owner reporting, not perfection.

## 7. Waste loop (the unsold-ulam problem)

1. Owner taps leftovers each evening (Natira).
2. Tomorrow's servings shrink for dishes that were left over and for low-rated dishes, grow for high-rated ones (Bukas).
3. Near closing the owner can mark a dish Sale; buyers see it on the board **(assumption: owners will discount, buyers will walk over; test)**.
4. Over time the app shows peso cost of leftovers falling. This is the metric to measure in the pilot.

## 8. Weather and the Bagyo Fund

- PAGASA warning level (set manually in the MVP; no official API was found) shrinks the shopping and cooking plan.
- A **simulated** Bagyo Fund shows what a parametric payout could be (sized from recent average sales, triggered by warning level). It is labelled Simulasyon.
- Only a licensed insurer may carry the risk (RA 10607). KapyBa is distribution and data at most. The UI never says "insurance" or "guaranteed" until a licensed partner is attached.

## 9. Business model (all assumptions)

1. Free to owners and buyers. Funded first by partners: school, LGU, DTI.
2. Later: optional owner plan at about ₱49–99 per month.
3. Later: embedded insurance referral fee and, if ever proven, a consented reputation record for lenders.

Unit economics are unproven; the pilot should measure willingness to pay.

## 10. Why it can win (summary)

- No verified product serves a cash-only stall with a printed QR (Google needs accounts, Toast needs a POS, Grab lending needs permits).
- The owner loop (coaching, forecast, waste) is what past dish-rating apps lacked, and it needs data Google does not hold.
- Launch hyperlocally: one school belt, 5 to 10 stalls.
- Biggest risks: Google Maps copying the rating side, GCash/Maya adding ratings to receipts, buyers never rating. See `BRIEF.md` section 6.

## 11. Scrutiny: what was weak or missing

A review of the idea and the first simplified mock. Status shows where each item stands in `mock/simple.html`.

| # | Gap found | Why it matters | Fix | In mock |
|---|---|---|---|---|
| 1 | The simple mock dropped the **palengke list and price alerts**, the core of the original KapyBa | Without it the app has no daily habit on the shopping side | Palengke list with price range and spike | Added |
| 2 | **No way to mark sold out** during the day | Board shows dishes that are gone; waste data is only end of day | Naubos toggle | Added |
| 3 | **Waste only measured, not reduced at the source** | Leftovers still end in the bin | Sale tag for last plates | Added |
| 4 | **No publish control** for owners | Owners may refuse to join if scores go public by default | Publish switch | Added |
| 5 | **No positive reinforcement** for improving dishes | Coaching only says what is wrong | Gumaganda badge | Added |
| 6 | **Stall QR not shown anywhere** | The whole collection method is invisible | QR screen | Added |
| 7 | **Weather had no financial answer** | The insurance idea was dropped from the simple mock | Simulated Bagyo Fund card | Added |
| 8 | **Hygiene** was a pain point with no feature | Pain 4 had no owner action | Linis check-in (self-reported) | Added |
| 9 | **Buyers cannot filter by budget**, their key constraint | Pain 8 | Budget chips | Added |
| 10 | **No guard on repeat ratings** | Spam, one buyer swinging a dish | One per dish per day | Added |
| 11 | **Owner right of reply** | Fairness for low-rated dishes | Preset reply icons | Not yet |
| 12 | **Onboarding** (stall name, dishes, recipes, usual sales) | The app is empty without it | Setup flow from the plan | Not yet (see `UX.md` S1–S5) |
| 13 | **Offline and low signal** | Stalls have poor signal | Service worker, queued ratings | Not yet |
| 14 | **Abuse reporting** by owners | Retaliation, fake ratings | Flag button | Not yet |
| 15 | **Language**: Taglish only; Cebuano, Ilocano etc. | Reach outside Metro Manila | Icon-first helps; strings file later | Not yet |
| 16 | **Cold start**: the board is empty until ratings arrive | Buyer side has no pull on day one | Seed with owner-entered "paborito" and pilot at 3 stalls | Not yet |

## 12. MVP scope

**In:** Ngayon, dish detail, Natira, Bukas, Palengke list, Ulam board, Rate, lock rule, Naubos, Sale, QR, Bagyo simulation, Linis. Local data, no backend, offline-capable PWA.

**Out for now:** real insurance, credit record, accounts, payments, delivery, reply, push notifications.

**Plan impact:** `docs/PRD.md`, `docs/UX.md`, `docs/PLAN.md` still describe the pre-pivot forecast app. They need an update for the rating loop (see `BRIEF.md` next steps).

## 13. Validation before building more

| Test | Pass |
|---|---|
| 8 owner interviews | 5 or more cook by guess and waste ulam most days |
| Owners shown the mock | 5 or more would put a QR at their stall |
| Buyers at one school shown the Ulam board | Most would use it to pick |
| Sale tag with 3 owners for a week | Leftover pesos drop and buyers show up |
| 2-week pilot at 3 stalls | 30 or more verified ratings per stall |

## 14. One-word vocabulary used in the UI

Ngayon (today), Natira (leftover), Bukas (tomorrow), Ulam (dish), Sulit (worth it), Naubos (sold out), Sale, Gumaganda (improving), Linis (clean), Palengke (market), Boto (votes), Simulasyon (simulation), Salamat (thanks).
