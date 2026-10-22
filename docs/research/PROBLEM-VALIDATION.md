# KapyBa — Problem Identification & Validation

Team Kapybytes, CSSPRINT 2026.
Compiled 22 Oct 2026. **Status: complete — both rounds graded. Round 2 result: Real = PASS (except search trends, FAILED); Large = FAILED at local-only scope; Significant = COI PASS / paying PARTIAL; overall venture verdict = FAIL as scoped, pivot the framing.**

Every claim carries a link, a verbatim quote or exact figure, and a date. Gaps are marked as gaps; nothing is padded.

---

# ROUND 1 — PROBLEM IDENTIFICATION

## 4W1H definition

### Who

**Primary User (most impacted):** the **owner-operator of a karinderya/carinderia** — one cook (usually *tindera*), 0–2 helpers, cash-only, no POS, no receipt data, serving 20–100 plates a day near a school, office belt, market or terminal. They are cook, cashier, buyer-of-inputs and marketer in one person.

**Buyer / co-user:** nearby **student or hourly worker** eating 1–3 meals a day on a fixed allowance (₱60–200/day food budget). They supply the ratings and are the second impacted party.

**Decision Maker — split into two; `IDEA.md` conflates them:**

| Role | Who | What they decide |
|---|---|---|
| **Adoption decision-maker** (MVP gate) | The **owner-operator** | Whether to print and place the QR, and whether a dish's score is published |
| **Budget decision-maker** (revenue gate) | A **partner program officer** — school admin/faculty, LGU MSME or food-safety desk, or DTI field office — plus, later, the owner at ₱49–99/month | Whether free access is funded, and later whether the owner pays |

> ⚠️ The partner decision-maker is currently a *category*, not a named role with a budget line. Round 2 must confirm one exists with discretionary spend; otherwise Gate 3 (Paying) fails.

### What

**The problem:** dish-level feedback does not exist in informal food retail. The owner commits capital (ingredients, fuel, an hour of labour) to cook a dish **before** any customer judges it, and receives no structured signal afterwards — only the absence of a sale, which is silent and ambiguous (too expensive? too salty? wrong time? wrong location? too much?).

As a result:

- **Owner:** cooked-but-unsold ulam is lost raw-material cost + fuel + labour with zero recovery. Measured in **pesos of leftovers per day** (the pilot metric in `IDEA.md` §7).
- **Owner:** unexplained sales swings are diagnosed by guess, so the correction applied to tomorrow's pot is also a guess → the error compounds daily.
- **Buyer:** must judge value before paying, from visual inspection alone, with no price-aware, dish-level, independent signal → risk of overpaying for a bad plate, or walking past a good one.
- **Qualitative:** quiet erosion of trust between buyer and stall; owner embarrassment/defensiveness (hence the publish switch and "no worst-lists"); buyer default to chains, draining demand from exactly the stalls that need it.

*Measurement units are defined; **values are pending** the Round 2 evidence pack and the pilot (leftover ₱/day, % of plates unsold, ratings per dish/day).* No numbers are invented in this document.

### When

- **Per service (daily, high frequency):** the lunch peak (≈11:30–13:00) — buyers decide in seconds; owners see the result only when pots come back half-full.
- **Daily trigger (owner):** end-of-service / end-of-day — leftovers are visible and already worthless. This is where *Natira* attaches.
- **Daily trigger (buyer):** "saan tayo kumain?" asked at 11am by a student or office mate.
- **Weekly:** palengke price swings change input cost → owner re-prices by feel (root of *Palengke list* and spike alerts).
- **Event-driven:** typhoon/PAGASA warning days wipe out sales and can spoil perishables already bought (*Bagyo Mode*).
- **Not one-off:** the loop repeats 2–3× a day, 300+ days a year. Frequency is a strength of this problem.

### Why (root causes, not symptoms)

1. **No feedback instrument exists.** Cash sale = no order record, no line-item data, no customer identity. There is no channel through which a dish-level opinion can arrive.
2. **Demand is committed before it is observed.** Cooking happens the night or morning before eating is observed. Over/under-production is *structural*, not a competence failure — nobody is forecasting.
3. **Information asymmetry at the point of sale.** The buyer sees food under glass with no independent price-aware signal. Google Maps is stall-level, account-gated, not normalised for price; queues only work as a proxy for stalls that already have queues.
4. **Thin margins remove the buffer.** Waste is not absorbed; it comes out of the owner's take-home the same day.
5. **Informality excludes existing software.** POS systems require hardware/BIR compliance; delivery platforms require permits and commission. A cash-only stall with a printed QR is structurally unserved (`IDEA.md` §10).

### How they solve it today, and why it fails

| Who | Today's workaround | What's wrong with it |
|---|---|---|
| Owner | Cook by guess, watch what's left in the kaldero, imitate neighbouring stalls' prices, haggle away last plates, write off waste | Learns only *that* a dish underperformed, never *why*; the correction is another guess; no record persists |
| Buyer | Queue length, visual/smell check, memory and *suki* ties, asking classmates/office mates, Google reviews, or defaulting to a chain | Fails exactly at the new/unknown stall where the signal is needed most; no price-vs-quality comparison; no dish granularity |
| Buyer (avoidance) | Walk to fast food / convenience store where quality and price are standardised | Permanently shifts the buyer's budget away from karinderyas — the owner loses the sale without ever seeing a complaint |

## Problem statement

> For the **owner-operator of a cash-only karinderya** near a school or office belt, **when they commit ingredients, fuel and an hour of labour to cook before any customer judges the dish**, **the absence of any dish-level feedback** causes **cooked-but-unsold ulam to be written off as peso losses every service, sales swings to be corrected by guess (compounding the error daily), and buyers to default to chains** — because **there is no feedback instrument on a cash sale and no independent, price-aware, dish-level signal for the buyer**. Today they use **instinct, the sight of a half-empty pot, neighbour price-copying and word-of-mouth suki habits**, but these fail because **they are silent on cause, leave no record, and give the buyer nothing to judge value against before paying.**

**Explicit:**

- **Primary User** = karinderya owner-operator (the owner loop is the product).
- **Co-user / data supplier** = nearby student or worker buyer.
- **Decision Maker (adoption)** = the owner (QR placement, publish switch).
- **Decision Maker (budget)** = school / LGU / DTI partner program officer — *unverified until Round 2*.

---

# ROUND 2 — PROBLEM VALIDATION

## Gate 1 — Problem is Real

### 1a. Credible sources (last 3 years) — **PASS (8 sources, all post-22 Oct 2023, quantified)**

| # | Source | Verbatim quote / exact figure | Date |
|---|---|---|---|
| 1 | [UNEP Food Waste Index Report 2024](https://www.unep.org/en/news-and-stories/press-release/world-squanders-over-1-billion-meals-day-un-report) | "In 2022 there were 1.05 billion tonnes of food waste generated (including inedible parts), amounting to 132 kilograms per capita… **Out of the total food wasted in 2022, 60 per cent happened at the household level, with food services responsible for 28 per cent and retail 12 per cent**." | 27 Mar 2024 |
| 2 | [BusinessWorld, UNEP country figures](https://bworldonline.com/economy/2024/03/27/584555/phl-household-food-waste-falls-sharply-to-nearly-3-million-tonnes-a-year-unep/) | "Philippine household food waste amounted to **2.95 million tonnes a year, or 26 kilograms (kg) per capita**." | 27 Mar 2024 |
| 3 | [Faizah et al., *Journal of Marketing Innovation* 4(2)](https://jmi.polban.ac.id/jmi/article/download/185/54) (n=102 restaurants, Indonesia) | "In Indonesia, **food waste accounts for approximately four to ten percent of food purchased from restaurants**, a statistic that has notable implications for the food supply chain at the retail level." | Sep 2024 |
| 4 | [DTI MSMED Plan 2023–2028](https://dtiwebfiles.s3.ap-southeast-1.amazonaws.com/BSMED/MSME+Plan+2023-2028/MSME+Plan+2023-2028_approved+07Nov2024.v2.pdf) | "**Accommodation and Food Service Activities 158,113 — 14.31%**" of establishments; "MSMEs comprise 99.59% of business establishments in the Philippines, and are most commonly engaged in retail trading, **food service**, and manufacturing activities." | approved 7 Nov 2024 |
| 5 | [DTI MSMED Plan 2023–2028 (same document)](https://dtiwebfiles.s3.ap-southeast-1.amazonaws.com/BSMED/MSME+Plan+2023-2028/MSME+Plan+2023-2028_approved+07Nov2024.v2.pdf) | "A survey by ERIA [found] **only 10% of MSMEs in the Philippines are fully digitalized**… only 34% of MSMEs are digitalized to the degree where they use social media or e-commerce platforms… **MSMEs adoption of social media (60%) and online sales/payment solutions (70%)… outpace back-end ERP (20%) and CRM (30%) software**." | 7 Nov 2024 |
| 6 | [Street-food consumers, Manila — *J. of Public Health and Emergency*](https://jphe.amegroups.org/article/view/10008/html) (n=384, Polytechnic University of the Philippines) | "Street food consumption is a **major public health concern** due to the numerous food safety hazards associated with it… The term 'hepa lane'… widely believed that consuming street food can increase the risk of transmitting the hepatitis A virus (HAV) due to inadequate food safety measures." | 28 May 2024 |
| 7 | [PSA — CPI / inflation release](https://psa.gov.ph/price-indices/cpi-ir) | "Food inflation at the national level recorded a faster annual increment of **6.8 percent in September 2026** from 4.6 percent in the previous month. In September 2025, food inflation was lower at 0.8 percent." | 6 Oct 2026 |
| 8 | [BusinessWorld — DEPDev/PSA food poverty threshold](https://bworldonline.com/the-nation/2025/09/24/700766/depdev-raises-poverty-threshold/) | "**This year's food poverty threshold has been set at P84 per person every day.**" (2023 benchmark: ~₱64/person/day) | 24 Sep 2025 |

Supporting fragility signal:

- [Moody's via BusinessWorld](https://bworldonline.com/top-stories/2026/10/21/788488/moodys-flags-rising-risks-in-philippine-msme-retail-loans/) — "we are seeing pockets of stress, particularly in **SME and retail lending**… greater sensitivity of SME and retail borrowers to higher costs"; headline inflation "a three-and-a-half-year high of 7.2%". **21 Oct 2026.**

**Stated gaps (not padded):**

- **NOT FOUND:** a credible, recent study giving a **carinderia net-margin %**, daily revenue, or closure rate. Available items were student theses or pre-2023.
- **NOT FOUND:** a **Philippine peso-denominated** study of cooked food left unsold in eateries. The 4–10%-of-food-purchased figure is an **Indonesian proxy** and must be labelled as such in any pitch.

### 1b. Search volume & trends — **FAILED (evidence not obtainable; only available proxy declines)**

Google Trends is unreachable from this environment (trends API returns HTTP 400; no Chrome binary installed; no keyword-volume tool available). What was actually captured on **22 Oct 2026**:

**Google autocomplete (related queries, users' own words):**

- `carinderia near me` → "carinderia near me menu", "carinderia near me open now", "carinderia near me delivery", "carinderia around me"
- `ulam` → "ulam for today", "ulam ideas for lunch", "ulam ideas for dinner", "ulam na may sabaw", "ulam sa tag ulan"
- `food waste philippines` → "food waste philippines statistics", "food waste philippines 2025", "food waste app philippines"

**Bing autocomplete:** `best carinderia near me`, `karenderya near me`, `ulam for today lunch/dinner/ideas`

**The one obtainable time series — Wikipedia article views (Wikimedia REST API, retrieved 22 Oct 2026) — is declining:**

| Article | Oct 2024–Sep 2025 | Oct 2025–Sep 2026 | Change |
|---|---|---|---|
| *Carinderia* | 13,628 views | 8,371 views | **−39%** |
| *Ulam* | 2,756 views | 1,574 views | **−43%** |

**Verdict:** related-query breadth exists in users' own words, but **consistent or increasing volume cannot be shown**, and the only available proxy trends down. Re-run this sub-gate with a real keyword tool (Google Keyword Planner / Ahrefs / SEMrush) before claiming Gate 1 fully passed. Failure condition applied honestly: *"fails if flat or declining over 12–24 months"* — as measured by the only proxy available.

### 1c. Online discussions (last 12 months) — **PASS (7 independent threads, dates and engagement verified via pullpush.io)**

| # | Thread | Date | Ups / Comments | Relevance |
|---|---|---|---|---|
| 1 | [r/Philippines_Expats — "Disappointed in the food quality"](https://www.reddit.com/r/Philippines_Expats/comments/1olifnq/disappointed_in_the_food_quality/) | 2025-11-01 | **57 / 327** | Buyer cannot judge carinderia quality before buying |
| 2 | [r/PHFoodPorn — "Please help a struggling family owned restaurant"](https://www.reddit.com/r/PHFoodPorn/comments/1u836kh/please_help_a_struggling_family_owned_restaurant/) | 2026-06-17 | **4,364 / 492** | Op: "our income is really slow and **there have been days recently where we had 0 orders or just 1 order for the whole day**" |
| 3 | [r/PHFoodPorn — "My food business just closed"](https://www.reddit.com/r/PHFoodPorn/comments/1u19ik6/my_food_business_just_closed_wanted_to_share_the/) | 2026-06-09 | **3,811 / 187** | Small food business failure |
| 4 | [r/PHFoodPorn — "After 3 pa order close na agad Ang food business"](https://www.reddit.com/r/PHFoodPorn/comments/1r9kdzq/after_3_pa_order_close_na_agad_ang_food_business/) | 2026-02-20 | **2,164 / 119** | Micro-scale demand over/under-shoot; school selling channel lost |
| 5 | [r/FoodPH — "first time ko kumain sa karinderya naiyak ako"](https://www.reddit.com/r/FoodPH/comments/1tbwweu/first_time_ko_kumain_sa_karinderya_naiyak_ako/) | 2026-05-13 | **824 / 108** | Top reply: "ingat lang dahil **hindi lahat ng nagkakarinderya business e malinis at bagong luto, yung iba reheat or recycled**" — buyer relies on hearsay heuristics |
| 6 | [r/BusinessPH — "MATUMAL FOOD BUSINESS"](https://www.reddit.com/r/BusinessPH/comments/1oj96to/matumal_food_business/) | 2025-10-29 | **45 / 44** | "biglang bumaba ang sales… **marami rin akong nakikitang stalls na nagsasara**" (4 years in food business) |
| 7 | [r/Philippines — "Restaurant owners: What do you do with leftover food at the end of the day?"](https://www.reddit.com/r/Philippines/comments/1v3za1d/restaurant_owners_what_do_you_do_with_leftover/) | 2026-07-23 | **11 / 10** | Exact owner-side waste question. **Low engagement** — used as direct-topic evidence, not as severity evidence |

Adjacent (weaker relevance, listed for transparency):

- [r/AskPH — "What is the brokest thing you've ever had to do?"](https://www.reddit.com/r/AskPH/comments/1vdim0g/) — 2026-08-02, 126 / 218. Includes workaround: students asking a carenderia for leftover *sabaw*.
- [r/Philippines_Expats — cost of living PH](https://www.reddit.com/r/Philippines_Expats/comments/1qcbz12/) — 2026-01-14, 137 / 296.
- [r/adultingph — "Presyo ng bilihin tataas simula April 1"](https://www.reddit.com/r/adultingph/comments/1s5rqba/) — 2026-03-28, 751 / 73 (weekly price-spike trigger).

**Note on method:** Reddit's public endpoints return 403 to scripts; thread dates, scores and comment counts above were retrieved from the pullpush.io archive API by post ID on 22 Oct 2026.

---

## Gate 2 — Problem is Large (local-only sizing) — **FAILED**

Scoped, per instruction, to **the Philippine karinderya market only** — no global TAM, no regional expansion, and no top-down foodservice-market figure used as the headline. Fully bottom-up, every input sourced or explicitly flagged as an assumption.

### Input A — how many outlets exist (verified)

| Input | Figure | Source | Date |
|---|---|---|---|
| Total foodservice outlets, 2024 | **96,650** | [USDA FAS GAIN RP2025-0059](https://www.fas.usda.gov/data/gain-report/2025/12/Food%20Service%20-%20Hotel%20Restaurant%20Institutional%20Annual_Manila_Philippines_RP2025-0059.pdf) — "The number of outlets in 2024 exceeded pre-pandemic levels, reaching 96,650, an addition of 328 outlets." | 30 Dec 2025 |
| Independent (non-chained) share | **72%** | Same report, Fig. 3 (2024: 28% chained / 72% independent) | 30 Dec 2025 |
| Street stalls / kiosks, 2024 | **≈41,100** (derived) | Same report: "…to 50,007 by 2029" at 4% CAGR → 50,007 ÷ 1.04⁵ = 41,101 | 30 Dec 2025 |
| Formal accommodation + food establishments | 37,500 (2024), 30,861 (2022) | PSA ASPBI — *quoted from search snippet + PSA's own Facebook mirror; psa.gov.ph is Cloudflare-blocked from this network* | ~29 Jun 2026 |
| All accommodation & food-service establishments | **158,113 (14.31%)** | [DTI MSMED Plan 2023–2028](https://dtiwebfiles.s3.ap-southeast-1.amazonaws.com/BSMED/MSME+Plan+2023-2028/MSME+Plan+2023-2028_approved+07Nov2024.v2.pdf) | 7 Nov 2024 |
| **Carinderia-specific count (PSIC 56107)** | **NOT FOUND** | PSIC 56107 "Carinderia or eatery" exists as a code ([PSIC 2019](https://bir-cdn.bir.gov.ph/BIR/pdf/PSA_PSIC%202019.pdf)) but no published establishment count; PSA ULE/OpenSTAT inaccessible | — |

*Consistency check on the GAIN report (auditable):* back-calculating all four 2024 categories from their 2029 CAGR forecasts gives 41,101 + 20,875 + 18,941 + 15,959 = **96,876**, within 0.24% of the published 96,650 — the report's own segments reconcile.

*Buyer-side context (verified):* DepEd SY 2025-26 enrolment **24.9 million** ([Philstar, 5 Sep 2025](https://www.philstar.com/headlines/2025/09/05/2470606/deped-bares-12-million-enrollment-drop-sy-2025-2026)); tertiary **4,164,809** (AY2022-23, [EDCOM II Year One Report](https://edcom2.gov.ph/media/2024/02/EDCOM-II-Year-One-Report-PDF-022924.pdf)); schools: 49,406 elementary + 17,469 secondary + 2,404 tertiary (same report).

### Input B — the sizing chain

```
A. Independent outlets, 2024                     96,650 × 72%        = 69,588
                                                     [GAIN verified]

B. Serviceable = independent, small/cash-only,
   in a school / office / market belt            69,588 × 30–60%     = 20,877 – 41,753
                                                     [ASSUMPTION — unverified; base 45% = 31,315]

C. Owner plan price (IDEA.md §9)                 ₱49–99 / month      [ASSUMPTION — unproven]
   Paid conversion                                10–30%              [ASSUMPTION — no data]
   FX for reporting                              ₱57 = US$1          [ASSUMPTION]

D. ARR = B_owners × conversion × price × 12
```

### The arithmetic (base, upside, and the hard ceiling)

| Scenario | Owners | Price | ARR (₱) | ARR (US$) |
|---|---|---|---|---|
| **Base** | 31,315 serviceable × 20% conversion = **6,263** | ₱75/mo | ₱5,636,700 | **≈ $98,900** |
| **Upside** | every serviceable owner pays | ₱99/mo | ₱37,202,220 | **≈ $652,700** |
| **Hard ceiling (impossible)** | *every accommodation & food-service establishment in the Philippines* — DTI's 158,113, i.e. ignoring that it excludes none of the market | ₱99/mo | ₱187,838,244 | **≈ $3,295,000** |
| **Required for a $200M outcome** | — | — | — | **$30,000,000 – $50,000,000** |

**Reverse test (what the requirement demands):**

- $30M ARR at ₱99/mo = ₱1.71bn/yr ÷ ₱1,188 = **1,439,000 paying accounts** — **9.1× every food-service establishment in the country**, including every Jollibee, mall and restaurant.
- $30M ARR at POS-class pricing (₱999/mo) = **142,600 accounts** ≈ 2× the entire serviceable base, or 79% of *all* independent outlets paying premium price — while KapyBa's stated model is **free first** (`IDEA.md` §9).

**Verdict: FAILED.** At local-only scope with a per-stall subscription of ₱49–99/month, the **achievable ceiling is ≈ $0.1M–$3.3M ARR** — roughly **1/9th to 1/300th** of the $30–50M ARR that a $200M+ outcome requires. The gap is not a matter of execution speed; it is arithmetic. No growth-rate assumption closes a 9× overshoot of the entire addressable establishment count.

*Flagged honestly:* the one genuinely top-down number here is the ₱49–99 price point (an untested guess in `IDEA.md`, not observed). Everything else is bottom-up and checkable.

**What would have to change for Gate 2 to pass (framing pivot, not more evidence):** the revenue layer cannot be a small owner subscription. Candidates: (a) partner-funded per-site contracts (LGU / DTI / school) at a materially higher ACV, (b) a transaction take-rate (Alok claims, procurement, payments) where revenue scales with plate volume rather than account count, (c) dropping local-only scope. Option (c) is excluded by your instruction; (a) and (b) are unproven and unpriced today.

---

## Gate 3 — Problem is Significant — **PASS on cost-of-inaction; PARTIAL on "paying"**

### COI model (per stall, per year)

```
COI = wasted food (unsold ulam)
    + fuel + labour committed to the unsold batch        [not separately quantified below]
    + margin lost to buyers who walked to a chain        [not separately quantified below]
```

| Term | Low | Base | High | Source / status |
|---|---|---|---|---|
| Daily food cost of a stall | ₱600 | ₱1,250 | ₱2,000 | **ASSUMPTION** — scaled off adjacent micro-enterprise: sari-sari stores average ₱861,000–₱1,123,000 annual sales = ₱2,870–3,743/day ([BusinessWorld, 16 Jun 2025](https://bworldonline.com/economy/2025/06/16/679536/sari-sari-store-segment-targeted-for-growth-to-p2-4-trillion-by-2030/)), food cost at 40–50% of sales. *Not a carinderia figure — no verified carinderia P&L exists (Gap, 1a).* |
| Unsold share of food purchased | 4% | 7% | 10% | "food waste accounts for approximately **four to ten percent of food purchased from restaurants**" ([Faizah et al.](https://jmi.polban.ac.id/jmi/article/download/185/54), Sep 2024 — **Indonesia proxy**) |
| **Wasted food per year** | **₱7,200** | **₱26,250** | **₱60,000** | low: 600×4%×300d = 7,200 · base: 1,250×7%×300 = 26,250 · high: 2,000×10%×300 = 60,000 |
| In US$ (base) | $126 | **≈ $460/yr** | $1,053 | ÷57 |
| Price of the fix (₱99/mo plan) | — | **₱1,188/yr** | — | `IDEA.md` §9 |
| **COI ÷ price** | 6× | **22×** | 51× | at ₱49/mo (₱588/yr) the base ratio is **45×** |

Even taking only the food term, the annual cost of inaction is **22–45× the annual price of the product at the base case** — and it excludes fuel, labour and lost walk-aways entirely. **COI intensity: HIGH**, though two of three terms are unquantified and the waste share is an imported proxy.

**Pressure multipliers (all sourced):** food inflation **6.8% in Sep 2026** vs 0.8% a year earlier ([PSA](https://psa.gov.ph/price-indices/cpi-ir), 6 Oct 2026); headline inflation "a three-and-a-half-year high of **7.2%**" with Moody's flagging "pockets of stress… in SME and retail lending" ([BusinessWorld](https://bworldonline.com/top-stories/2026/10/21/788488/moodys-flags-rising-risks-in-philippine-msme-retail-loans/), 21 Oct 2026); food threshold ₱84/person/day ([DEPDev/PSA](https://bworldonline.com/the-nation/2025/09/24/700766/depdev-raises-poverty-threshold/), 24 Sep 2025).

### Are they already spending money on it? — **PARTIAL (adjacent categories yes, this product no)**

Evidence the same audience already pays for tools and distribution (all fetched 22 Oct 2026):

| What they pay today | Exact figure | Source |
|---|---|---|
| Restaurant POS software (vendor explicitly targeting carinderias) | C-POS **Pro ₱980/mo**, Basic ₱3,000 one-time ([cpos.store](https://cpos.store/)); Qashier **₱1,790–2,790/mo** ([Qashier PH](https://qashier.com/ph/software-pricing/)); market guide **₱1,395–3,995/terminal/mo**, onboarding ₱5,000–20,000 ([CukCuk PH, 25 Nov 2025](https://cukcuk.ph/2025/11/25/restaurant-pos-system-cost/)) |
| Payment rails | Maya QR / QR Ph **1.0% MDR**, GCash **2% MDR**, cards 3.5% ([Maya Business pricing](https://www.maya.ph/business/pricing)); GCash QR Ph 1.0% ([PayMongo, 23 Jun 2026](https://www.paymongo.com/blog/maya-vs-gcash-vs-paymongo-for-business)) |
| Delivery platform commission | GrabFood **22–30%**, foodpanda **20–28%**, ShopeeFood 18–22%; "GrabFood only ₱500,000 monthly revenue → ₱125,000 commission" ([klikit, 26 May 2026](https://klikit.io/en/learn/food-delivery-commission-fees-philippines-guide)) |
| Storefront / digital tooling | PayMongo Storefront **₱349/mo** (same PayMongo page) |
| Occupancy (kiosk) | SM kiosk **₱9,300/sqm + VAT + CUSA**; Manila retail rent ₱1,705/sqm ([franchisedetailsph, 31 Jul 2025](https://franchisedetailsph.com/blog/secure-prime-mall-location/) — *blog-grade*) |
| Digital-menu micro-service | Someone is already selling a **₱500 QR digital menu** to local micro-food businesses ([r/BusinessPH, 31 May 2026](https://www.reddit.com/r/BusinessPH/comments/1tsie16/)) |

**Honest reading:** budget demonstrably flows from these owners — at **₱349–3,995/month**, i.e. **3.5–40× KapyBa's intended ₱49–99**. What is **not** evidenced anywhere is a budget line for *dish-level customer feedback*: no procurement, no survey, no vendor sale in that specific category was found. Against that, only **10% of MSMEs are fully digitalized and CRM use is 30%** (DTI, 7 Nov 2024), and the top adoption barriers are "cultural resistance, lack of technical expertise, and financial constraints" ([peer-reviewed, 1 Sep 2025](https://economicsrs.com/articles/10.2478/eoik-2025-0056)).

**Gate 3 verdict: COI = PASS (high, quantified on the food term). "Already paying" = PARTIAL** — money is proven adjacent (POS, payments, delivery, occupancy) but zero is proven in this specific line item. Fails the strict condition *"direct budget allocation tied to the problem"* unless partner-funded procurement (school/LGU/DTI) is confirmed in interviews.

---

## Scorecard

| Gate | Result | Basis |
|---|---|---|
| **Real — sources** | **PASS** | 8 credible, post-2023, quantified sources |
| **Real — search trends** | **FAILED** | No volume time series obtainable; only available proxy (Wikipedia views) declined 39–43% |
| **Real — discussions** | **PASS** | 7 threads in 12 months, dated, engagement verified |
| **Large (local-only)** | **FAILED** | Ceiling ≈ **$0.1M–$3.3M ARR** vs **$30–50M** required; reaching $30M at ₱99/mo needs 1.44M accounts = 9.1× every food-service establishment in the Philippines |
| **Significant — COI** | **PASS** | ₱7,200–60,000/stall/yr wasted food alone = **22–45×** the product price |
| **Significant — already paying** | **PARTIAL** | ₱349–3,995/mo proven in POS/payments/delivery; **no** proven budget for dish-level feedback |
| **Overall venture verdict** | **FAIL as scoped** | Real and significant, but not large enough locally for a $200M outcome |

### What this means (truthful, not softened)

1. **The problem is real and it hurts.** Sources and user discussion both support it; the COI is large relative to the price of any fix.
2. **The problem is not large enough at local-only scope.** This is arithmetic, not pessimism: even selling to *every* food-service establishment in the country at the intended price yields ≈$3.3M ARR — about **1/9th of the minimum** for a $200M outcome.
3. **Therefore the framing must pivot before building** — the framework's prescribed response to a failed gate. The two credible paths that keep local-only scope are **(a) partner-funded contracts (LGU/DTI/school) at a higher ACV**, or **(b) a transaction-linked revenue layer (Alok claims / procurement / payments take)** so revenue scales with plates sold rather than stall count. Both are currently unpriced and unvalidated.
4. **For CSSPRINT 2026 this does not block anything** — the validation plan in `IDEA.md` §13 (8 owner interviews, 3-stall pilot) is the right next step regardless. It blocks only the claim of venture scale.

### Source-access caveats (carried forward from research)

- `psa.gov.ph`, `pco.gov.ph`, `help.gcash.com`, `magazine.foodpanda.ph` returned 403/Cloudflare from this network. PSA figures (37,500 / 30,861 / 33,215) are verbatim snippets of PSA's own pages plus PSA's Facebook mirror — **re-verify from a Philippine IP if precision matters.**
- Official GrabFood / foodpanda PH rate cards and mall operator rate cards are **not published**; third-party rates are labelled as such.
- **Never-found, do not invent:** carinderia net-margin %, national carinderia count (PSIC 56107), Philippine peso study of cooked-ulam waste, official delivery commission rate cards.
