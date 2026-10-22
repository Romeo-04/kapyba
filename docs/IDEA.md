# KapyBa: the whole idea

Team Kapybytes, CSSPRINT 2026. Evidence and sources live in `docs/BRIEF.md` and `docs/research/`. This file is the idea itself: what it is, how it works, what is still weak. Items marked **(assumption)** are untested. Status: final for the CSSPRINT 2026 submission; the targeted SDGs are in section 15.

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

### Getting started (onboarding)

Target: a working stall in under two minutes, with nothing typed except the stall name **(assumption)**.

1. **Simula:** name the stall and tap the nearby landmark (school or area).
2. **Pick dishes:** an icon grid of common karinderya dishes, six preselected. Tap to add or remove.
3. **Presyo:** one stepper per dish for the selling price.
4. **Karaniwan:** one slider per dish for the usual plates sold a day. This sets the baseline for Bukas.
5. **Paborito:** pick up to three signature dishes (see cold start below).
6. **QR:** the stall QR is generated and ready to print.

Recipes come prefilled from typical dishes, so the Palengke list works on day one; the owner edits them later. Ingredient amounts are never typed from scratch.

### Starting from zero (cold start)

The Ulam board is empty until ratings arrive, and a board nobody uses collects no ratings. Without faking anything:

- **Paborito:** each owner picks up to three signature dishes. The board shows them with a distinct "owner's pick" label and **no score**, so buyers see something useful and never mistake it for a rating.
- **Kulang pa progress:** a dish below the minimum shows how close it is (people icon and a count toward 10), for the owner and, once published, for buyers. This turns the lock into a goal.
- **Pilot, not launch:** start with 3 stalls around one school, QR placed at the counter and on the receipt or slip, with an in-person ask for the first 30 ratings per stall.
- **Owner value first:** the owner loop (Natira, Bukas, Palengke) works with zero public ratings, so owners get value before the board has any.
- **Never** seed fake scores or import scores from elsewhere.

### Offline and low signal

Stalls and school belts often have weak signal.

- **Owner screens work offline:** Ngayon, Natira, Bukas and Palengke run from the last synced data. A small offline icon and a "last updated" clock show the state.
- **Buyer ratings queue on the phone** and send when signal returns. The buyer sees the same confirmation either way.
- **Logging queues too:** leftovers, sold-out and Linis taps sync later.
- **Honest constraint:** collecting ratings from many phones and showing them on the owner's phone needs a small shared backend. The original no-backend MVP does not cover this; only the demo can be local. Offline here means queue-and-sync, not no-server.

## 5. Features

### Owner
| Feature | What it does | Pain |
|---|---|---|
| **Ngayon (today)** | Dish tiles with score ring, face and the top problem icon | 1 |
| **Dish detail** | Tag bars (sarap, alat, init, dami, sulit), 30-day trend, capybara coach in one icon-pair | 1 |
| **Kumpara (compare) and recommendations** | No guessing quiz. Each tag bar carries a tick for the neighbourhood average of the same dish. The app compares the owner's own behaviour (how much they cook, their price) with public ratings, flags a **Pansin** (notice) when they disagree, and shows up to three icon actions: Bawasan, Dagdagan, Painitin, Konti, Dagdag, Taasan | 1, 3 |
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
| **Alok (owner-only deals)** | Owner posts a deal only their stall offers: a combo, a suki stamp card, or a timed offer, with a limit on how many. It appears on the Ulam board with an Alok ribbon (see section 7) | 3, 5 |
| **Setup (onboarding)** | Under two minutes: stall name, dish icon grid, price and usual plates per dish, three paborito, QR | adoption |
| **Ulat (report)** | Owner flags suspicious ratings on a dish (see section 6); flagged ratings leave the public score while under review | 6 |
| **Offline queue** | Owner taps and buyer ratings are saved on the phone and sync when signal returns | reach |

### Buyer
| Feature | What it does | Pain |
|---|---|---|
| **Ulam board** | Dishes near a landmark, ranked by score against price; "Sulit" ribbon on the best | 2, 8 |
| **Budget chips** | Tap a peso amount to hide dishes above it | 8 |
| **Lock state** | A dish with too few ratings shows a lock, not a misleading score | 6, 9 |
| **Sale and Naubos tags** | See what is discounted or gone before walking over | 3 |
| **Rate** | Face (sad, neutral, happy) plus tag icons for sad or neutral; one rating per dish per day | 1, 6 |
| **Alok** | See each stall's own deals on the board and claim by showing the screen at the stall | 2, 3 |
| **Paborito** | Owner's three signature dishes shown with an "owner's pick" label and no score, so the board is useful before ratings exist | cold start |
| **Kulang pa progress** | A locked dish shows how many ratings it has toward the minimum | 6, cold start |
| **Last updated** | A clock shows when the board last synced; stale data is labelled, not hidden | reach |

## 6. Rating integrity and the low-rating rule

- **Private first.** Negative feedback reaches the owner as tags, not a public star.
- **Public only after a minimum:** 10 ratings from 5 or more distinct buyers **(assumption)**. Until then the dish shows a lock.
- **30-day rolling window**, so one bad week recovers.
- **One rating per dish per buyer per day**; QR plus a receipt or slip code gates ratings to people who bought **(assumption on the code mechanic)**.
- **No public worst-lists.** Owner chooses publication.
- **Ulat (owner reporting):** the owner can flag a burst of suspicious ratings on a dish (for example many sad faces from one code in minutes). Flagged ratings stay visible to the owner but leave the public score while under review. Limits to stop abuse of the tool itself: a small number of reports per week, reported ratings are restored if the review rejects the report, and the review is logged. **Open question:** who reviews, and how fast. Candidates are the partner (school or LGU desk) or a rule-based check first. Not decided.
- **Honest limits:** a determined faker can still scan with several phones. Mitigation is distinct-buyer counts and owner reporting, not perfection.

## 7. Waste loop (the unsold-ulam problem)

1. Owner taps leftovers each evening (Natira).
2. Tomorrow's servings shrink for dishes that were left over and for low-rated dishes, grow for high-rated ones (Bukas).
3. Near closing the owner can mark a dish Sale; buyers see it on the board **(assumption: owners will discount, buyers will walk over; test)**.
4. Over time the app shows peso cost of leftovers falling. This is the metric to measure in the pilot.

### Alok: deals only this stall has

Sale is a one-tap discount on a dish. **Alok** is a deal the owner designs and markets, and that no other stall can copy because it is theirs.

| Kind | Example | Helps |
|---|---|---|
| **Combo** | Adobo plus rice plus drink at a set price | Move a slow dish with a fast one |
| **Suki** | Stamp card: every fifth meal free | Repeat buyers without accounts |
| **Oras** | A timed offer, for example last hour of lunch | Cut leftovers |

How it works: the owner picks a dish, a kind and a limit (for example 10 plates), and posts. It shows on the Ulam board with an Alok ribbon and the remaining count. The buyer shows the screen at the stall; the owner taps to mark it claimed. No payments or accounts.

Rules that keep it honest:
- **Never conditional on a rating.** Giving a deal for a review is an incentivised review, which Google bans and the FTC and UK rules target. A deal can be shown to anyone; it cannot be tied to rating.
- **Cannot buy rank.** The board orders by score against price. A deal adds a ribbon, never a higher position.
- **Labelled and limited.** Every Alok shows its limit and expiry; no fake scarcity.
- **Owner-only.** An Alok belongs to one stall; the app does not run cross-stall promotions in the MVP.
- **Waste link:** the app suggests an Alok for a dish that keeps showing up in Natira.

Assumptions to test: that owners will post deals, that buyers walk over for them, and that a combo does not just give away margin. Track claimed deals against leftover pesos in the pilot.

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

A review of the idea and the first simplified mock. Row 17 came from a later question about comparing owner and public perception; a guess-the-rating quiz was rejected as friction. Status shows where each item stands in `mock/simple.html`.

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
| 18 | **Owners had no way to market what makes their stall different** | The product helped them cook and shop but not attract buyers | Alok: owner-only deals (combo, suki, oras), never tied to ratings, cannot buy rank | Added |
| 17 | **Owner could not see where their view differs from the public's** | Owners fix what they already suspect and miss blind spots | Compare without asking: implied view from servings and price, area-average ticks, Pansin flag, action cards | Added |
| 11 | **Owner right of reply** | Fairness for low-rated dishes | Preset reply icons | Deferred: not in the idea yet |
| 12 | **Onboarding** (stall name, dishes, recipes, usual sales) | The app is empty without it | Setup under two minutes, icon dish grid, prefilled recipes (section 4) | In the idea and `UX.md`; not in the mock |
| 13 | **Offline and low signal** | Stalls have poor signal | Queue-and-sync for owner taps and buyer ratings; needs a small backend (section 4) | In the idea and `UX.md`; not in the mock |
| 14 | **Abuse reporting** by owners | Retaliation, fake ratings | Ulat with limits and a review step (section 6); reviewer undecided | In the idea and `UX.md`; not in the mock |
| 15 | **Language**: Taglish only; Cebuano, Ilocano etc. | Reach outside Metro Manila | Icon-first helps; strings file later | Deferred: not in the idea yet |
| 16 | **Cold start**: the board is empty until ratings arrive | Buyer side has no pull on day one | Paborito picks, Kulang pa progress, 3-stall pilot (section 4) | In the idea and `UX.md`; not in the mock |

## 12. MVP scope

**In:** Setup, Ngayon, dish detail with Kumpara, Natira, Bukas, Palengke list, Ulam board with Paborito and Kulang pa, Rate, lock rule, Naubos, Sale, Alok, QR, Ulat, Bagyo simulation, Linis, offline queue. Installable PWA.

**Needs a decision:** a small shared backend for ratings. The demo can run on local data; the pilot cannot.

**Out for now:** real insurance, credit record, accounts, payments, delivery, owner reply, languages beyond Taglish, push notifications.

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

Ngayon (today), Natira (leftover), Bukas (tomorrow), Ulam (dish), Sulit (worth it), Naubos (sold out), Sale, Gumaganda (improving), Linis (clean), Palengke (market), Boto (votes), Simulasyon (simulation), Salamat (thanks), Simula (start), Paborito (owner's pick), Kulang (not enough yet), Ulat (report), Pansin (notice), Alok (offer), Combo, Suki (regular), Oras (time).

## 15. Targeted SDGs

Our reading of the UN Sustainable Development Goals; the target wording is from memory and should be checked against sdgs.un.org before the pitch. Each goal is tied to a feature and a number we can measure in the pilot.

| SDG | Target | How KapyBa serves it | Pilot measure |
|---|---|---|---|
| **12 Responsible Consumption and Production** (primary) | 12.3: halve food waste at retail and consumer level, and cut food losses along supply chains | Dish ratings, Natira, Bukas and the Palengke list help owners cook what sells; Sale and Alok move leftover ulam before it is thrown away | Leftover pesos per day, before and after (see section 13) |
| **8 Decent Work and Economic Growth** (primary) | 8.3: support micro, small and medium enterprises and their growth | Free private coaching, Kumpara and the owner's own deals (Alok) raise a karinderya's sales and margin | Sales per stall and the share of owners who keep using the app after two weeks |
| **1 No Poverty** (supporting) | 1.5: build the resilience of the poor to climate-related shocks | Bagyo Mode warns owners before a typhoon. The Bagyo Fund is a simulation only and carries no real risk (section 8) | Owners who change their shopping list on a Bagyo day |
| **9 Industry, Innovation and Infrastructure** (supporting) | 9.3: give small enterprises access to financial services | A verified rating history can later become a reputation record for a lender or insurer. Out of scope for the MVP | Not measured in the pilot |

Not claimed: SDG 2 (zero hunger) and SDG 3 (health). We do not measure nutrition or access to food, so claiming them would overreach.
