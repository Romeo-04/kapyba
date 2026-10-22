# KapyBa UX: design brief for the designer

Product: a free, capybara-guided app for karinderya owners and the people who eat there. Owners see how customers rate each dish, compare it with nearby stalls, and cook and shop smarter. Buyers see which dishes are worth their money and rate in two taps.

Read first: `docs/IDEA.md` (what the product is and why). Behaviour reference: `mock/simple.html` (local clickable mock, not in the repo; ask the team for the file). The older `mock/index.html` is the pre-pivot forecast app and is superseded here.

Status: v2, final for hand-off. Replaces the pre-pivot UX doc. Screens match the local mock, including Alok (O8). Goals the product serves (SDG 12.3 food waste and SDG 8.3 small business growth) are in `IDEA.md` section 15; the design should make leftover food and owner sales visible, not hide them. Marked **(call)** = our choice, change it if you have a better one. Marked **(open)** = needs your decision or a test.

## 1. Design intent

Two kinds of people use this in a rush: a tindera at a hot counter, and a student on a lunch break. Neither reads. So:

1. **Show, do not tell.** A ring, a bar, a plate, a drop. If a sentence is needed, the visual failed.
2. **One word at most.** Where text appears it is a single word in Taglish, uppercase small label or a heading. No paragraphs, no sentences, no tooltips that explain basics.
3. **Icons, not emoji.** One custom line-icon family (section 3.3). No emoji anywhere in the UI.
4. **One question per screen, one main action.**
5. **Capybara is the voice.** It reacts with a mood and an icon pair, never a lecture, never nags.
6. **Thumb-first.** Primary action in the bottom 30%. Tap targets 44 px minimum (48 for the primary button).
7. **Private first, kind to owners.** Negative feedback is shown as a fixable tag, not a verdict. Locked and hidden states look calm, not like an error.
8. **Works with bad signal.** Owner screens run offline; ratings queue and sync.

### Success test for the visual language **(open, run it)**

Show the owner Ngayon and dish detail screens to 5 owners with no explanation. Pass: at least 4 of 5 can say which dish is weakest and what the capybara suggests. If not, the icon or the flag needs redesign before polish.

## 2. Roles and navigation

| Role | Entry | Navigation |
|---|---|---|
| **Owner** | Installed PWA, set up once | Bottom tabs: **Ngayon** · **Natira** · **Bukas** |
| **Buyer** | Scans the stall QR, lands on the rate page without install or login; can open the board | Bottom tabs: **Ulam** · **Rate** |

The role switch (store icon, person icon) at the top right exists only in the mock so one phone can show both. In the product the two experiences are separate entry points.

Secondary screens (reached from a tab, always with a back button at top left): dish detail, Palengke, QR, Alok, report, setup.

## 3. Visual language

### 3.1 Tokens

| Token | Value | Use |
|---|---|---|
| `cocoa` | `#7B5544` | Primary buttons, headings, active icons |
| `tan` | `#D4A373` | Accents, range bars, number badges |
| `cream` | `#FDEBD2` | Cards, icon backgrounds, inactive tracks |
| `paper` | `#FFF8EE` | Screen background |
| `ink` | `#3A2A22` | Body text, numbers |
| `mute` | `#9A8576` | Secondary labels, locked and disabled |
| `leaf` | `#4F8F4B` | Good score, improving, on |
| `amber` | `#E0A32E` | Middling score, Sale |
| `chili` | `#C8553D` | Weak score, problem, spike |
| `rain` | `#4A7CA8` | Bagyo, simulated fund |

Score colour rule: score at least 4.0 is `leaf`, 3.4 to 3.99 is `amber`, below 3.4 is `chili` **(call)**. Colour is never the only signal: the face shape changes too (section 4.1).

Dark "Umaga" shop mode for the palengke trip: background `#2B1D17`, cream cards with ink text. Only the Palengke checklist needs it.

### 3.2 Shape, type, motion

- **Shape:** 20 to 26 px card radius, pill buttons, circular rings, 14 px radius icon plates.
- **Type (call):** a rounded humanist sans for headings; system sans for UI; **tabular numerals** for every number. Headings 30 px, labels 11 to 13 px uppercase with letter spacing, numbers 20 to 40 px.
- **Elevation:** a 1 px translucent ring plus a very soft shadow. No hard borders.
- **Motion:** easing `cubic-bezier(.23,1,.32,1)`. 120 to 260 ms. Press feedback `scale(.97)`. Screen entrance: a short rise with a 40 ms stagger, once per navigation. Rings sweep in over 600 ms, bars grow from the left. Animate only named properties, never everything. Hover effects only on devices that hover.
- **Reduced motion:** keep fades, remove movement, sweep and bob.

### 3.3 Icon family

24 px grid, 2 px stroke, round caps and joins, no fill, `currentColor`. Active state uses a 2.6 px stroke. Draw all icons as one family; the mock holds a first draft you can redraw.

| Group | Icons |
|---|---|
| Navigation | today, plate, cart, board, qr, back, next, store, user, pin |
| Dish | bowl, meat, fish, leaf |
| Tag (taste dimensions) | heart (sarap), salt (alat), flame (init), plate (dami), coin (sulit), snow (lamig) |
| Ingredient | meat, fish, onion, garlic, tomato, leaf |
| Deal | megaphone, combo, star, plus, minus, x |
| Status | check, lock, clock, eye, eyeoff, alert, shield, sparkle, dome, drop, tag, trend, bin, up, down |

**Hard icons to get right** **(open)**: the Alok kind icons (`combo`, `star`, `clock` must read apart), `salt` (shaker, must not read as a cup), `plate` as portion (must differ from the plain plate used for leftovers), `onion` vs `garlic` vs `tomato`, and `shield` for the simulated fund. Test each with owners.

Every icon-only control needs an accessible label (section 9).

### 3.4 Mascot: capybara

Hand off to art (Codex is connected): character sheet first, approved before poses. The mock uses a simple placeholder.

| Mood | Trigger | Look |
|---|---|---|
| `calm` | Default, nothing wrong | Soft smile |
| `worry` | A dish is weak, or a Pansin | Raised brows, small frown |
| `happy` | Rating sent, good day | Smile, small confetti |
| `rain` | Bagyo level 1 to 3 | Holds an umbrella |
| `sleepy` | Offline, empty states **(call)** | Yawn, eyes half closed |

Sizes: 56 px in the header, 72 px on Bukas, 150 px on thank-you. A slow bob (4 px, 3.2 s). Never blocks content.

## 4. Components

### 4.1 Score ring with face

The signature element. A circle track with an arc from 0 to score divided by 5, and a face icon at the centre.

| State | Look |
|---|---|
| Public | Coloured arc and a face: happy, neutral or sad |
| Locked (too few ratings) | Empty track and a lock icon |
| Hidden by owner | Same as locked on the buyer side; the owner sees an eye-off badge |
| Trend rising | Small green trend badge on the tile corner |

Sizes: 120 (detail), 76 (tile), 56 (stat), 52 (board card). Face thresholds as in section 3.1.

### 4.2 Dish tile (Ngayon)

Icon plate, ring, name (one word). Corner badges, at most one per corner: **top right** a red problem icon (salt, plate or flame) or a green trend badge; **top left** an amber tag (Sale) or a grey check (Naubos, tile dims to 50%).

### 4.3 Tag bar

Icon plate on the left, horizontal bar, and a dark tick marking the **neighbourhood average** for the same dish. A red bar and red plate mean the problem tag. No numbers. A tiny key under the bars explains the tick (tick plus pin icon).

### 4.4 Pills and action buttons

- **Pill:** icon plus one uppercase word. Green (Gumaganda, Linis), amber (Pansin when over-cooked), neutral (Simulasyon).
- **Action button (84 px square):** icon over a label. Toggles Naubos, Sale, Publiko. On state fills cocoa (Sale fills amber).
- **Recommendation card:** icon, a direction arrow (red down or green up), one word: Bawasan, Dagdagan, Painitin, Konti, Dagdag, Taasan. Up to three in a row.
- **Primary button:** full width, 60 px, cocoa, icon only or icon plus one word.

### 4.5 Other

| Component | Note |
|---|---|
| Plate toggle row | Six plate buttons per dish; tap n to set n leftovers, tap n again to reduce |
| Big number card | Icon, large number, optional small secondary number; the whole card can be a button with a next arrow |
| Drop selector | Four buttons: none (check) and three drops; selection is cumulative |
| Paired bars | Thin grey bar for the usual amount, thick cocoa bar for the suggestion, up or down arrow with the number |
| Ingredient row | Icon, small name word, kg, price, round check; spike arrow in red |
| Range band | Tan band from low to high price with a dark marker for the likely total |
| Board card | Ribbon (Sulit, Sale, Naubos), icon, name, buyer count, distance, price, small ring |
| Budget chips | Coin icon and three amounts (50, 70, 100) **(call)** |
| Alok card | Cream card: kind icon plate, dish icon, remaining count, expiry clock, a close icon to end the deal |
| QR card | White rounded card, large QR with the capybara at the centre |
| Fund card | Pale blue, shield icon, peso number, "Simulasyon" pill |
| Offline banner | Small offline icon plus a clock; sits under the header, never blocks |

## 5. Screen inventory

IDs: **O** owner, **B** buyer, **S** shared. "In mock" = shown in `simple.html`.

| ID | Screen | Purpose | In mock |
|---|---|---|---|
| O0 | Setup (steps 1 to 6) | Get a stall working in under two minutes | No |
| O1 | Ngayon | Dish health at a glance | Yes |
| O2 | Dish detail | One dish: bars, trend, compare, actions | Yes |
| O3 | Natira | Log leftovers, Linis check-in | Yes |
| O4 | Bukas | Suggested servings, typhoon level, fund | Yes |
| O5 | Palengke | Shopping list with price range | Yes |
| O6 | QR | Show and print the stall code | Yes (drawn, not scannable) |
| O7 | Ulat | Report suspicious ratings | No |
| O8 | Alok | Post and manage the stall's own deals | Yes |
| B1 | Ulam board | Compare dishes by score and price | Yes |
| B2 | Rate | Two-tap rating | Yes |
| B3 | Salamat | Confirmation | Yes |
| B4 | Already rated | One per dish per day | Yes |
| S1 | Offline state | Banner and queued state | No |
| S2 | Empty and locked states | Calm, goal-oriented | Partly |

### O0 Setup

Six short steps, a progress bar of six dots at the top, back at top left, one primary button at the bottom.

1. **Simula:** one text field (stall name) and a landmark picker (school or area pins). Capybara `calm`.
2. **Ulam:** an icon grid of about 20 common dishes (bowl, meat, fish, leaf families). Six preselected. Tap to toggle. A final tile adds a custom dish.
3. **Presyo:** per selected dish, an icon plate and a stepper for price. Tap and hold to repeat.
4. **Karaniwan:** per dish, a plate-row slider for the usual plates sold a day.
5. **Paborito:** pick up to three dishes with a heart toggle. Selected ones get a heart badge.
6. **QR:** the stall QR appears with a **Print** button and a **Tapos** button.

Recipes are prefilled for the typical dishes and edited later; do not ask for ingredient amounts here. Skip, then resume setup from Ngayon, is allowed.

### O1 Ngayon

Header: capybara (`worry` if any dish is weak, else `calm`), QR round button, role switch (mock only). Three stat cards: overall ring, votes (user icon), leftovers (leaf icon). Below, a two-column grid of dish tiles (section 4.2). Tap a tile for O2.

### O2 Dish detail

Top to bottom:
1. Back, dish icon plate.
2. Large ring, dish name, a row with pills (Gumaganda, Pansin) and the vote count with a user icon.
3. Three action buttons: Naubos, Sale, Publiko.
4. Five tag bars with neighbourhood ticks and the tick key.
5. 30-day trend line, coloured by score.
6. Coach card: capybara plus an icon pair for the top problem (for example salt and a red down arrow), or a check and "Bongga" when fine.
7. Up to three recommendation cards.

Locked dish: ring is locked, no bars; show the capybara with `user n / 10` as progress (**Kulang pa**). Actions remain.

**Pansin** appears when what the owner does disagrees with the public view. Amber pill: cooked a lot, rated low. Green pill: cooked little, rated high. **(open)** The word needs testing; the concept is "your effort and the public view do not match".

### O3 Natira

Heading, a big number card (bin icon, leftover count, peso cost). One row per dish: icon plate and six plate toggles. A **Linis** row of three toggles (sparkle, dome, drop); when all three are on a green Linis pill appears. Primary button: check, goes to Bukas.

### O4 Bukas

Heading and drop selector (none, three drops). Capybara in `calm` or `rain` with an umbrella. Per dish: icon plate, paired bars, arrow and the number of servings. From level 2 up: the fund card (shield, peso number, Simulasyon pill). Bottom: a big card with the cart icon, the estimated cost and a next arrow, which opens Palengke.

### O5 Palengke

Header with back, word "Palengke". Big card with the likely total and a range band with low and high prices. Ingredient rows (section 4.5). Check as you buy; the row dims. **Shop mode (dark)** **(call)**: a toggle that switches to the dark theme with larger rows and hides prices until tapped, for use at dawn. Keeps the screen awake.

### O6 QR

Large QR card and a Print button. Real code must be scannable; the stall URL carries a stall id. **(open)** Whether the code also carries a receipt or slip code that proves purchase (see `IDEA.md` section 6).

### O7 Ulat (report)

Reached from a dish detail overflow (three-dot icon, **(call)**). One sheet: a list of the recent rating bursts as bars over time with a flag button on each suspicious one, a confirm button, and a clock icon showing "under review". Flagged ratings stay visible to the owner and leave the public score. Limit on reports per week; show a small counter. **(open)** Who reviews is undecided; design the sheet so the outcome (kept, removed) can be shown later.

### O8 Alok

Opened from a megaphone round button next to the QR button on Ngayon. Top to bottom:
1. Back, word "Alok".
2. **Dish row:** a horizontal row of dish icon plates, one selected.
3. **Kind row:** three large buttons: Combo (two overlapping plates), Suki (star), Oras (clock). One selected.
4. **Limit stepper:** minus, a large number, plus. Default 10 **(call)**.
5. Primary check button: **Post**.
6. Below, the active deals as Alok cards with remaining count, the time left and a close icon.

Rules the screen must make visible without words: a deal cannot be linked to a rating, and posting never changes rank. Do not add any "rate to unlock" control. Capybara `happy` after a post.

**(open)** Combo needs a price and a second item; for the MVP a combo is a label plus the limit, the price is set at the stall. Decide whether to design the full builder.

### B1 Ulam board

Header: pin icon and the landmark word (for example UST). Budget chips under it. Cards ranked by score against price; the best public one gets a green **Sulit** ribbon. A dish on sale shows an amber ribbon, the old price struck through and the new price. A sold-out dish dims with a grey **Naubos** ribbon. Locked or hidden dishes show a ring with a lock. **Paborito:** an owner's pick with no score shows a heart badge and a "Paborito" ribbon in a different colour from Sulit **(call)**, so it is never mistaken for a rating. A stall with an active deal shows an **Alok** ribbon in `rain` blue, a kind icon and the remaining count; a dish can have Sale and Alok, in which case the ribbon order is Naubos, Alok, Sale, Sulit **(call)**. Alok never changes the card's position. A clock icon with the last-updated time sits at the top right.

### B2 Rate

Opened from a board card or directly from the QR. Dish icon and name. Three large face buttons (sad, neutral, happy). A sad or neutral face reveals four tag buttons (salt, snow, plate, coin); more can be added later. A check button sends. A lock-and-store icon pair under the button says the rating goes privately to the owner. The send button is disabled until a face is chosen.

### B3 Salamat and B4 Already rated

B3: capybara `happy`, "Salamat", a check, and a button back to the board. B4: a large clock icon, the dish, and a button back; shown when the buyer has already rated that dish today.

### S1 Offline

A banner with the offline icon under the header. Owner taps and buyer ratings are saved locally and show a small clock until synced. After sync the clock disappears; no toast. Capybara `sleepy` on empty offline screens.

### S2 Empty and locked states

Never an error look. Locked: lock icon with progress dots toward 10. Empty board: capybara `sleepy` and the Paborito cards only. New stall with no ratings: ring locked, bars hidden, a single "Kulang pa" progress.

## 6. User journeys

### Owner, daily

```
Evening: Natira (tap leftovers, Linis) -> Bukas (see tomorrow, set drop level)
 -> Palengke (list and range) -> early morning shop mode -> cook
Any time: Ngayon -> weak dish -> detail -> compare, actions -> Naubos / Sale
```

### Owner, a low-rated dish

1. Ngayon shows a red badge on Sinigang.
2. Detail: the red tag bar is salt, above the neighbourhood tick; Pansin says cook less.
3. Recommendation cards: Bawasan (less salt), Konti (cook less).
4. Natira at night shows fewer leftovers once changed; the dish later shows the Gumaganda pill.

### Buyer

QR at the stall -> Rate (face, optional tags, send) -> Salamat. Or Ulam board -> budget chip -> pick the Sulit dish -> walk to the stall.

### First run (owner)

Install -> Setup O0 (six steps) -> Ngayon with locked rings and Paborito -> print the QR.

## 7. States every screen must have

Loading (capybara `thinking`; you may reuse `calm` with a small spinner), empty, locked, offline, error with a retry icon, and reduced motion. Money uses the peso sign and thousands separators. Numbers have tabular alignment.

## 8. Copy

Words only where listed. All Taglish, one word.

| Word | Meaning | Where |
|---|---|---|
| Ngayon | today | Tab, Owner home |
| Natira | leftover | Tab, screen |
| Bukas | tomorrow | Tab, screen |
| Ulam | dish | Buyer tab |
| Rate | rate | Buyer tab |
| Palengke | market | Shopping list |
| Sulit | worth it | Board ribbon |
| Naubos | sold out | Toggle, board ribbon |
| Sale | discount | Toggle, ribbon |
| Alok | offer | Deals screen, board ribbon |
| Combo, Suki, Oras | combo, regular customer card, timed | Alok kinds |
| Publiko | public | Toggle |
| Gumaganda | improving | Pill |
| Pansin | notice | Pill |
| Linis | clean | Check-in, pill |
| Boto | votes | Stat card |
| Simulasyon | simulation | Fund pill |
| Salamat | thanks | Confirmation |
| Bongga | great | Coach, good state |
| Simula | start | Setup |
| Paborito | owner's pick | Board ribbon, Setup |
| Kulang | not enough yet | Locked progress |
| Ulat | report | Report sheet |
| Bawasan, Dagdagan, Painitin, Konti, Dagdag, Taasan | less, more, hotter, fewer plates, more plates, raise price | Recommendation cards |

Never write the words "insurance", "covered" or "guaranteed" anywhere near the fund. It is a **simulation** until a licensed partner is attached (see `IDEA.md` section 8).

## 9. Accessibility

- Contrast at least 4.5 to 1 for text and 3 to 1 for icons on `paper` and `cream`. `tan` and `amber` are never text on white.
- Never colour alone: faces change shape, problem bars carry a red icon plate, trend uses an arrow icon.
- Every icon-only control has an `aria-label` in Taglish with an English alternative; decorative icons are `aria-hidden`.
- Score ring exposes a text equivalent, for example "Sinigang, 3.1 of 5, 12 ratings".
- Tap targets 44 px minimum. Text scales to 200 percent without clipping.
- Respect reduced motion. Focus rings 2 px cocoa.
- Because the product is icon-first, the comprehension test in section 1 is an accessibility requirement, not decoration.

## 10. Open decisions for the designer

1. Finalise the icon family and test the four hard icons (3.3).
2. Capybara character sheet (art, not the placeholder).
3. Is **Pansin** understood without help? Test or replace.
4. Dark shop mode: apply to the whole app or only O5?
5. Face thresholds and ring scale: 0 to 5 arc, or a cleaner 0 to 100 percent?
6. Board card density: ring on the right, or on the left?
7. Larger type option for older owners.
8. Whether score colours work for colour-blind users (the face shape is the backup).

## 11. What changed from the previous UX doc

| Old screen | Now |
|---|---|
| S1 Splash, S2 Store setup, S3 Intro, S4 Dish setup, S5 Recipe setup | **O0 Setup**, six steps, no intro carousel |
| S6 Ngayon | **O1 Ngayon**, now shows dish health, not price alerts |
| S7 Palengke list, S8 Item detail, S9 Prices, S14 Budget fit | **O5 Palengke**; per-item price history and substitutes are cut for now |
| S10 Log spend | Cut for now (spend logging) |
| S11 Log sales and leftovers | **O3 Natira** |
| S12 Alerts | Replaced by recommendation cards in **O2** |
| S13 Bagyo Mode | **O4 Bukas** drop selector and fund card |
| S15 Dashboard, S16 Celebration | Cut for now; the 30-day trend lives in **O2**, a celebration is the **Gumaganda** pill |
| S17 Settings | Not designed yet |
| New | O2 detail with compare, O6 QR, O7 Ulat, O8 Alok, B1 to B4 buyer side, S1 offline, S2 empty |

## 12. Demo order (5 minutes)

1. O1 Ngayon: red Sinigang badge, green Galunggong.
2. O2 Sinigang: tag bar above the tick, Pansin, Bawasan and Konti.
3. B2 Rate: sad face with the salt tag, sent privately.
4. B1 Board: Sulit ribbon, budget chip, Sale ribbon on the leftover dish.
5. O4 Bukas: set the typhoon level, the plan shrinks, the simulated fund appears.
