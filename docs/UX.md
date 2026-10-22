# KapyBa UX: screens and user journey

Source: `KapyBa_CSSPRINT_2026.md.pdf` (product), the 12-screen coffee-shop wireframe (layout language).
Status: draft for approval. Anything marked **(call)** is my choice, not the team's.

## 1. Design intent

KapyBa is a calm morning companion, not a spreadsheet. Aling Rosa opens it on a phone, in the evening
tired, or at 4 AM in a dark palengke. Every screen answers one question and has one main button.

Principles:

1. **One question per screen.** "Ano ang bibilhin ko?" is the list. "Okay ba ang presyo?" is alerts.
2. **Capybara is the voice.** It talks, reacts and changes costume. It never nags.
3. **Big, warm, thumb-first.** Min tap target 48 dp. Primary action sits in the bottom 30%.
4. **Taglish, short.** Max about 8 words per line. Numbers in pesos with the peso sign, ranges as `1,670–2,700`.
5. **Under one minute to log.** One total for spending, one tap per dish for leftovers.
6. **Works at 4 AM and offline.** Dark "Umaga" theme for the palengke trip, list opens with no signal.
7. **No accounts, one store** (MVP): Aling Rosa's carinderia, seeded.

## 2. Visual language (adapted from the wireframe)

The wireframe is a coffee-shop kit: tan splash, white and cream screens, cocoa pill buttons, rounded
image cards, circular avatars, chip rows, a hero photo with overlapping dark cards. We keep the
structure and re-skin it around the capybara.

| Token | Value (call) | Use |
|---|---|---|
| `cocoa` | `#7B5544` | Primary buttons, headings, icons |
| `tan` | `#D4A373` | Splash, accents, selected chip |
| `cream` | `#FDEBD2` | Card and screen background |
| `paper` | `#FFFFFF` | Base screen |
| `leaf` | `#6B8F5E` | Good price, saved money |
| `chili` | `#C8553D` | Price spike, red warning |
| `rain` | `#5B7FA6` | Bagyo Mode accents |
| `night` | `#2B1D17` | Umaga (dawn) theme background |

- **Shapes:** pill buttons (full radius), 20 dp card radius, circular avatars for dishes and ingredients.
- **Type (call):** rounded humanist sans (Nunito) for UI; tabular numerals for money.
- **Motion:** 200 ms ease-out. The capybara blinks and breathes (slow scale 1.00–1.02). Respect reduced motion.
- **Components lifted from the wireframe:** pill CTA, cream list card (thumb + two lines + trailing meta),
  circle category row, three-column grid with filter chips, hero with overlapping dark cards,
  pagination dots, thumbs-up confirmation, input pair.

### Mascot states

| State | Trigger | Look |
|---|---|---|
| `calm` | Prices normal | Apron, half-closed eyes, slight smile |
| `eyebrow` | Price spike or low margin | One raised eyebrow, holds calculator |
| `umbrella` | PAGASA yellow | Opens umbrella |
| `raincoat` | PAGASA orange | Yellow raincoat |
| `salbabida` | PAGASA red | Floating in a salbabida, still calm |
| `cheer` | Under budget, Bagyo Fund grows | Arms up, confetti |
| `sleepy` | Umaga theme, empty states | Yawning, lantern |
| `thinking` | Forecast loading | Chin on paw, steam from kettle |

## 3. Navigation

Bottom tab bar, 4 tabs (pill-shaped, cocoa on cream):

`Ngayon` (Home) · `Palengke` (List) · `Menu` (Dishes) · `Tala` (Dashboard)

Bagyo Mode and Alerts are reached from Home. Logging is reached from the Home primary button, which
changes with the time of day (see journey).

## 4. Screen inventory

Wireframe slot numbers refer to the 12 phones, read left to right, top to bottom.

| # | Screen | Wireframe slot | Purpose |
|---|---|---|---|
| S1 | Splash | 1 | Brand, tagline, two buttons |
| S2 | Store setup | 2 | Name the carinderia (replaces Sign Up) |
| S3 | Intro carousel | 3 | 3 slides: what KapyBa does |
| S4 | Dish setup and ranking | 6 | Add dishes, drag to rank, tags |
| S5 | Recipe and sales setup | 7 | Per-dish ingredients, usual sales |
| S6 | Ngayon (Home) | 4 | Capybara greeting, trip summary, alerts |
| S7 | Palengke list | 5 | Main screen: grouped list, cost range |
| S8 | Item detail and substitute | 9 | Price history, cheaper swap |
| S9 | Presyo (price catalog) | 10 | Ingredient grid with section chips |
| S10 | Mag-log ng gastos (morning) | 11 | Log paid prices |
| S11 | Mag-log ng benta (evening) | 11 | Log sales and leftovers |
| S12 | Alerts | 9 | Price spike, margin, substitute, budget fit |
| S13 | Bagyo Mode | 8 | Warning level, shrunk list, Bagyo Fund |
| S14 | Budget fit | 5 | "May 2,000 ako" best list |
| S15 | Tala (Dashboard) | 4 | Saved money, waste avoided, price moves |
| S16 | Celebration | 12 | Thumbs-up, cheer, streak |
| S17 | Settings | 6 | Language, theme, reset demo data, about |

### S1 Splash
- Tan full screen, capybara in apron holding a ladle, "KapyBa", tagline "Handa sa palengke, handa sa ulam."
- Two pills: **Simulan** (primary), **May account na ako** (hidden in MVP: replaced by **Demo ni Aling Rosa**).
- Auto-advance never. Returning users skip to S6.

### S2 Store setup
- Replaces Sign Up. One field: *Pangalan ng carinderia*. Second field: *Malapit sa* (school/area, optional, drives school calendar).
- Primary: **Tuloy**. Secondary text link: **Gamitin ang demo na tindahan** (loads Aling Rosa seed).
- Capybara peeks above the form, `calm`.

### S3 Intro carousel
- Three slides, large capybara illustration, two-line copy, dots, **Susunod** / **Simulan** pill.
  1. "Alam mo na ang presyo bago pumunta." (prices)
  2. "Eksakto ang dami, walang sayang." (forecast)
  3. "Handa kahit bumagyo." (Bagyo Mode)
- Skippable. Never shown twice.

### S4 Dish setup and ranking
- Header with back and tab-style step label (`1 of 3`). Cream rows: dish avatar, name, selling price, drag handle.
- Drag to reorder. Long press picks up with haptic. Rank numbers update live.
- Tag chips under each row: `Matagal tumagal`, `Pang-ulan`, `Mataas ang kita`.
- **Dagdag ulam** pill at the end. Primary: **Tapos na ang ranking**.
- Empty state: capybara `sleepy`, "Walang ulam pa. Magdagdag tayo."

### S5 Recipe and sales setup
- Hero circle with the dish image and dots to page between dishes.
- Below: ingredient rows (amount per serving, stepper) and "Ilan ang karaniwan mong nabebenta?" slider.
- Circle row of six common ingredients for quick add. Option **Kunan ng litrato ang notebook** (Phase 2, shown disabled with label).
- Prefilled for 5–6 typical dishes; owner edits, not types from scratch.

### S6 Ngayon (Home)
- Top carousel of status cards (swipe): Price mood (capybara `calm` / `eyebrow`), Weather (Bagyo level), Budget.
- Below: up to 3 alert rows (avatar, title, one-line action). **Tingnan lahat** link.
- Primary button by time of day:
  - Evening: **Tingnan ang listahan bukas**
  - Before 7 AM: **Simulan ang palengke**
  - After 4 PM: **I-log ang benta**
- Header chip: date, school-day type (`Exam week`, `Walang pasok`).

### S7 Palengke list (main screen)
- Header: date, back and menu. Total card at the top, cocoa on cream: `₱1,670–₱2,700`, "malamang ₱2,150", range bar.
- Section chips (circle row): Karne, Isda, Gulay, Pampalasa, Iba pa. Tap scrolls and filters.
- Rows grouped by section: avatar, ingredient, `3.5–4.5 kg`, `₱630–₱990`, checkbox. Check as she buys; row dims and total trip tracker updates.
- Shared ingredients appear once, with "para sa adobo, sinigang" in small text.
- Sticky bottom: **Bilhin na** (starts shop mode) and a **Badyet** icon button (S14).
- Shop mode: night theme, big checkbox rows, hides prices behind a tap, keeps screen awake.
- Offline banner: "Walang signal. Gamit ang huling listahan."

### S8 Item detail and substitute
- Big ingredient image, 14-day price sparkline (low/high band), today's range, "Karaniwan mong bayad".
- Substitute card (from the wireframe's two circle cards): "Tilapia, 20% mas mura. Palitan?" **Palitan** / **Huwag**.
- Primary: **Isama sa listahan**.

### S9 Presyo (price catalog)
- Search bar, filter chips (Lahat, Karne, Isda, Gulay…), 3-column grid of ingredient tiles with name and today's mid price and an up/down arrow.
- Two feature tiles at the bottom: "Tumaas ngayon" and "Bumaba ngayon".

### S10 Mag-log ng gastos (morning)
- Profile-style header: capybara avatar plus "Magkano ang nagastos mo?".
- Two modes (segmented control): **Kabuuan** (one number input) and **Isa-isa** (tap item, enter paid price).
- Input pair from the wireframe: `Item` and `Presyo`. Quick amounts as chips.
- Primary: **I-save**. Result: S16 if under the low end of the range.

### S11 Mag-log ng benta (evening)
- One row per dish: avatar, "Ilan ang natira?" with a `−  n  +` stepper, and a toggle **Naubos** (sold out).
- Sold-out dishes show a note: "Ibig sabihin, mas marami pa ang gusto." (explains why leftovers matter).
- Primary: **Tapos na** (under a minute). Result: S16.

### S12 Alerts
- Search plus tabs: Presyo, Kita, Palit, Badyet.
- Rows (cream card, avatar, title, action line). Swipe to dismiss. Tap opens S8 or S7 with the change applied.
- Wording examples live in `PRD.md` section 7.

### S13 Bagyo Mode
- Hero: stormy sky image, capybara in costume for the warning level, search-bar-style status pill ("PAGASA: Orange rainfall warning").
- Overlapping dark cards: **Mas maliit na listahan** (−62%, cost range new vs old), **Bumili nang maaga** (shelf-stable items with add buttons).
- Bottom circular button opens **Bagyo Fund** (balance, simulated).
- Manual toggle for the demo: Yellow / Orange / Red. Auto toggle reads from bundled warning data.

### S14 Budget fit
- Input: "Magkano ang hawak mo ngayon?" (default ₱2,000). Output: best list within budget, items removed shown struck through with reason ("mababa ang kita").
- Primary: **Gamitin ang listahang ito**.

### S15 Tala (Dashboard)
- Cream tiles in a grid: Natipid this month, Nasayang na naiwasan (kg), Benta by dish (bar), Presyo ng sibuyas, baboy, manok (lines).
- Capybara comment at the top: "Nakatipid ka ng ₱3,420 ngayong buwan."
- Period chips: Linggo, Buwan.

### S16 Celebration
- Thumbs-up circle becomes capybara `cheer`. One line of copy, two small stats, **Balik sa Ngayon**.
- Shown after logs when a goal is met. Skippable by tap. Never blocks.

### S17 Settings
- Language (Taglish default, English), theme (Auto / Araw / Umaga), reset demo, about KapyBa and data sources.

## 5. User journey

Persona: Aling Rosa, 52, carinderia near España.

| Stage | Where | She does | She feels | Capybara |
|---|---|---|---|---|
| Discover | outside app | Hears about it from a student | Curious, doubtful | none |
| Set up (10 min) | S1–S5 | Names the store, ranks dishes, checks recipes | "Madali lang pala" | `calm`, guides |
| Evening check | S6 → S7 | Reads tomorrow's list and range | Relieved, in control | presents the list |
| Alert | S12 → S8 | Reads onion spike, swaps a dish | Warned, not scared | `eyebrow` |
| Rain | S13 | Sees red warning, list shrinks | Protected | `salbabida` |
| Morning shop | S7 shop mode | Walks the palengke, ticks items | Fast, certain | silent |
| Log spend | S10 | Types one total | Done in seconds | `cheer` if under |
| Evening log | S11 | Taps leftovers per dish | Quick | `calm` |
| Monthly review | S15 | Sees pesos saved | Proud | `cheer` |

### Daily loop

```
Evening ─► S6 Ngayon ─► S7 list (range) ─► [alerts S12 / budget S14 / Bagyo S13]
   ▲                                                   │
   │                                                   ▼
S11 log sales + leftovers ◄─ S10 log spend ◄─ Morning shop mode (S7)
   └──────────► forecast and personal prices improve ───────────┘
```

### First-run flow

`S1 → S2 → S3 → S4 → S5 → S6 (first list appears within 1 tap)`. Demo shortcut: `S1 → "Demo ni Aling Rosa" → S6`.

## 6. States every screen must have

Loading (capybara `thinking`), empty, offline, error with a retry, and reduced-motion. Money uses `Intl`
formatting with peso sign. Missing price data falls back to the latest price and says so ("Huling presyo: Oct 18").

## 7. Accessibility

- Contrast AA on cocoa/cream/paper pairs (verify `tan` text on white fails, so tan is background only).
- Labels in Tagalog and English for screen readers. Prices read as "isang libo anim na raan hanggang dalawang libo pitong daan pesos".
- Never rely on color alone: price up/down also has an arrow and word.
- Touch targets 48 dp. Text scales to 200%.

## 8. Demo script mapping (5-minute pitch)

1. S6 → S7: evening list, `₱1,670–₱2,700`.
2. S12: onion spike, margin check, tap through to a menu change.
3. S13: toggle Red, list shrinks, range drops.
4. S15: monthly savings.
