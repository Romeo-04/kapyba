# KapyBa: problems, findings, feature matrix, and why it is winnable

Team Kapybytes, CSSPRINT 2026 ("The Tale is Forged"). Problem space: a practical digital solution for a specific problem faced by Filipino MSMEs.

Evidence labels: **[V]** read at the source in `docs/research/`. **[S]** search snippet only. **[A]** our assumption, to be tested by interview. Anything not marked is our reasoning, not a finding. Nothing here is proven demand for karinderyas; the Philippine-specific evidence gap is stated in section 7.

Sources: `docs/research/problems-and-pain-points.md`, `existing-solutions-and-gaps.md`, `msme-global-problems-and-solutions.md`, `buyer-side-and-business-model.md`, `parametric-insurance-philippines.md`. Agent-written research; spot-checked, not fully re-verified.

---

## 1. Problem statement (recommended: B)

> Carinderia owners cook blind: they get no dish-level feedback on what customers like, so unsold ulam is wasted, while students and workers cannot tell which stall's dishes are worth their budget.

One platform serves both sides of that sentence. The owner side is the product; the buyer side is the distribution.

## 2. Problems and pain points, ranked

| # | Pain | Who | Evidence | Existing at international level |
|---|---|---|---|---|
| 1 | No structured, dish-level feedback; owners cannot see why customers leave | Owner | Ratings move independent-restaurant revenue about 5–9% per star (Seattle) and sell-outs 19 pts per half star (San Francisco) [V]. US online-review data; transfer to a karinderya is unproven | Small restaurants everywhere rely on word of mouth or open reviews they cannot act on |
| 2 | Buyers cannot judge dish quality or value before spending a tight budget | Buyer | No Philippine data on how people find karinderyas [A] | Place-level ratings dominate (Google, Beli); dish-level is inferred or absent |
| 3 | Cooked-but-unsold ulam is wasted | Owner | UNEP: 1.05B tonnes food waste, 290M from food service [V]. PH household plate waste 130 g/household/day in 2023 vs 77 g in 2018–19 [V, household data, not karinderya]. No karinderya-level figure found | Food service waste is global; tools target large kitchens (forecasting needs POS data) |
| 4 | Food-safety opacity | Buyer | WHO: over 866M foodborne cases, 1.52M deaths (2021) [V]. LA grade cards raised inspection scores and cut hospitalisations [V] | UK FHRS, Singapore SFA grade hygiene by inspection only; PH has a permit, no consumer grade |
| 5 | Invisibility of informal stalls | Owner | No street-food rating app found in searches [V] | Google lists places, but unlisted stalls need someone to add them |
| 6 | Fake or thin-count ratings | Both | Google blocked or removed 292M reviews in 2025; FTC (2024) and UK (2025) banned fake reviews [V] | Policed at platform scale; micro-vendors get one bad review swing |
| 7 | Reputation is not provable to lenders | Owner | BSP MSME loans are 3.6% of bank loans [V]; Grab PH lending needs SEC/DTI papers, a mayor's permit and 6 months of bank statements [V] | Alt-data credit exists (World Bank, IFC) but none ties restaurant ratings to lending [V] |
| 8 | Price versus value is invisible | Buyer | Assumption [A] | No product compares ulam price to rating at neighbouring stalls |
| 9 | Rating inflation | Both | Known pattern; no PH data | Mitigations exist separately (IMDb min votes, Yelp filter) |
| 10 | A low rating can sink a single-cook stall | Owner | Harm evidence from Uber drivers (Data and Society) and restaurants (Berkeley) [V] | Recency windows (Uber, Airbnb) and minimum counts (IMDb) are the proven fixes |

**Weather risk (side track).** Typhoons cut a stall's sales for days. No Philippine product pays small traders on a weather trigger [V]; analogues exist (CCRIF vendor cover, Fiji vendors, Korea KB Sonbo) [V]. RA 10607 means only a licensed insurer may carry the risk, so KapyBa can be a distribution and data layer at most. In the product this stays labelled "simulation".

## 3. The low-rating question

What if a karinderya gets a low rating? The design answer, built from mechanisms that exist separately:

- Private first: negatives go to the owner as tags (maalat, malamig, maliit ang serving), not as a public star.
- No public score until a minimum count (assumption: 10 ratings from 5 or more distinct buyers). IMDb hides scores under 5 ratings [V].
- 30-day rolling window so a bad week recovers (Uber uses 500 trips, Airbnb 12 months) [V].
- Dish-level, so one weak dish does not brand the whole stall.
- Owner right of reply and a "gumaganda" (improving) badge. Opt-in publication.
- No public "worst" lists, one rating per buyer per day.

## 4. Feature matrix: existing solutions vs KapyBa

Y = yes, P = partial, N = no, U = unverified. Competitor cells are from `existing-solutions-and-gaps.md` section 6 [V unless U].

| Capability | Google Maps | Delivery apps | Beli | FB / TikTok | Toast | Birdeye / Podium | FHRS / SFA | Forkly / Oink | GCash / Maya / Grab Fin | **KapyBa (target)** |
|---|---|---|---|---|---|---|---|---|---|---|
| Dish-level ratings | P (inferred) | U | N | N | Y | N | N | Y | N | **Y** |
| Structured tags, not free text | N | U | P | N | P | N | N | U | N | **Y** |
| Private-first negatives | N | U | N | N | Y | P (U) | n/a | N | n/a | **Y** |
| Minimum-count public score | N | U | U | N | no public score | U | n/a | U | n/a | **Y** |
| No buyer account | N | N | N | N | P (receipt QR) | U | n/a | N | n/a | **Y (QR)** |
| Owner coaching | N | U | N | N | P | P (U) | N | N | N | **Y** |
| School-area hyperlocal focus | N | N | N | N | N | N | N | N | N | **Y** |
| Works for informal stalls without permits | P (U) | N | U | P | N (needs POS) | N | N | U | N | **Y** |
| Free for owners | Y | N | U | Y (U) | U | N (U) | Y | U | n/a | **Y** |
| Feeds demand forecast | N | P (U) | N | N | P | N | N | N | n/a | **Y** |
| Credit-usable record | N | P (sales data) | N | N | N | N | N | N | P (sales, not ratings) | **Later** |
| Leftover / sold-out signal | N | N | N | N | N | N | N | N | N | **Y (new)** |

Reading it: no single competitor covers the row set. The closest is Toast (private per-item feedback, forecasting with sales data), but it requires the Toast POS, which karinderyas are not known to use (unverified for PH).

KapyBa column is a target, not a shipped capability. Today the mock demonstrates the forecast and Palengke list, not the rating flow.

## 5. Gap-closing features, mapped to pain

Each feature closes a gap left by an existing solution and hits a named pain. "Gap" cites the competitor limit.

| Feature | Closes gap in | Hits pain | Notes |
|---|---|---|---|
| **Stall QR + verified-visit code** (receipt or printed slip code, 1 rating per buyer per day, no account) | Google/Yelp need accounts; Toast needs POS | #1, #6 | The code gates ratings to people who bought. Cuts fake reviews at the source |
| **Tag-based dish rating** (taste, alat, init, dami, sulit; 2 taps) | Google infers dishes from text; free text is slow and abusive | #1, #2 | Works for low-literacy and fast lunch-hour use |
| **Private owner inbox + capybara coach** ("sinigang: 7 of 12 said maalat") | Google offers reply only; Birdeye is paid | #1, #10 | Coaching is the owner value that Forkly and Oink lacked |
| **Minimum-distinct-buyer publish rule + 30-day window + "gumaganda" badge** | IMDb, Yelp, Uber do pieces, none for micro-eateries | #6, #9, #10 | Protects a single-cook stall from one bad week |
| **Leftover and sold-out button** (end of day: "naubos" / "may natira") | No rating product captures waste | #3 | Feeds forecast; shrinks tomorrow's list |
| **Ratings into the forecast and ranking** (a low-rated dish gets fewer servings, a high-rated one more) | Toast does this only with POS sales | #3, #1 | Already half-built in the mock engine (rank score) |
| **Ulam Board** (school area: what is moving today, price, tag summary) | Google and delivery apps are place-level and permit-bound | #2, #5, #8 | Buyer-side distribution; needs at least 5 participating owners nearby (assumption) |
| **Sulit view** (rating vs price per dish across nearby stalls) | None | #8 | Answers a student's actual budget question |
| **Lingguhang hygiene check-in** (owner self-checklist, buyer "malinis?" tag) | FHRS/SFA are inspection-only and absent in PH | #4 | Self-reported, labelled as such. Not an inspection or certification |
| **Bagyo Mode + simulated Bagyo Fund** | No PH weather-triggered cover for small traders | weather | Simulation only until a licensed partner is attached |
| **Reputation record export** (dish ratings plus sales consistency, owner-consented) | Grab/Maya underwrite on formal accounts | #7 | Later pitch; no source ties ratings to repayment [V] |

## 6. Why it is winnable

1. **A real wedge no verified product serves.** A cash-only stall with a printed QR is not served by Google (account), Toast (POS), Grab Financial (permits) or FHRS/SFA (permit/inspection) [V]. That is the starting position, not a moat.
2. **Hyperlocal beats global.** One school belt with 5–10 stalls can reach the minimum-count rule quickly. A global product cannot make that its focus without ignoring its scale.
3. **The owner loop is the hard-to-copy part.** Oink, Forkly and Foodspotting failed or sold small with consumer-first dish rating; Forkly's founder cited unmonetised data and weak differentiation [V]. KapyBa starts from the owner side: coaching, forecast, waste. Those need the owner's sales data, which Google does not hold.
4. **Proven mechanics, new combination.** Minimum counts (IMDb), spam filtering (Yelp), rolling windows (Uber, Airbnb), private item feedback (Toast). Nobody combines them for micro-eateries [V].
5. **Cheap to run.** No backend needed for the mock; real version needs only QR plus small storage. Free to owners; funding from partners (school, LGU, DTI) first, a tiny optional plan (₱49–99/month) later [A, unit economics unproven].
6. **The waste story is concrete and measurable** per stall (portions cooked versus sold) once interviews supply a baseline.

### How an incumbent could still beat us

| Threat | Why it is real | Our defence |
|---|---|---|
| Google Maps | Already extracts popular dishes, QR review links, 292M reviews blocked [V]; could add tags and min-count quickly | Unlisted stalls without accounts; owner sales and forecast loop; a school-belt launch Google has no reason to prioritise |
| GCash / Maya | Own QR payments at small merchants; could attach ratings to receipts [V that they have QR; plans unverified] | Partner rather than compete: ratings record is data they might want; keep the owner product free |
| Toast / POS vendors | Closest feature set | Karinderyas rarely use POS (unverified for PH) |
| Delivery apps | Hold item order data | Permit-based onboarding, delivery-only coverage |
| Apathy | Dish apps failed on retention | Do not rely on buyer growth: owner value works with zero public ratings |

## 7. Honest unknowns (validate before building)

- **No Philippine karinderya data** on waste, review behaviour or how buyers choose stalls. First task: owner interviews (8 questions) and buyer interviews (6) in `problems-and-pain-points.md`.
- Revenue-per-star figures are US, online restaurants. Transfer to a carinderia is unproven.
- Not verified at all: Booky, Foodpanda PH ownership, delivery-app item ratings, GCash/Maya plans, Birdeye pricing, Vietnam rules.
- Minimum-count thresholds (10 ratings, 5 buyers), price points and the 5-owner Ulam Board threshold are our assumptions.
- DTI and BSP digital figures in `msme-global-problems-and-solutions.md` are unverified.
- Insurance claims depend on a licensed partner. Until then the UI says "simulation".

## 8. Falsifiers: what would make us stop or change

| Test | Pass | Fail means |
|---|---|---|
| 8 owner interviews | At least 5 say they cook by guess and waste ulam daily | Waste is not a felt pain; lean on buyer side or reframe |
| Owners shown the private inbox mock | At least 5 would scan a QR at their stall | Rating flow adds friction they will not accept |
| Buyers at one school shown the Sulit view | Majority say they would use it to pick a stall | Buyer side has no pull; keep owner-only |
| 2-week pilot at 3 stalls | 30+ verified ratings per stall | Collection too slow; add incentive or receipt-code |

## 9. Next steps

1. Run the owner and buyer interviews; update section 2 evidence and falsifiers.
2. Update `PRD.md`, `UX.md` and `PLAN.md` for the pivot (rating flow, owner inbox, Ulam Board, leftover signal).
3. Add the rating flow and owner inbox to `mock/`.
4. Commit this file and the research notes.
