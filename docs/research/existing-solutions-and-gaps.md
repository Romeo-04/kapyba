# Existing solutions and gaps: dish-level ratings for karinderyas

Research date: 2026-10-22. Scope: solutions and their gaps only (problems are covered by a separate note). Earlier notes already cover Google's 2025 review-removal figure, delivery commissions and Too Good To Go in the Philippines, so those are only referenced here ([buyer-side-and-business-model.md](buyer-side-and-business-model.md)).

Method note: "Fetched" means I opened the page and read the claim. "Search summary" means only a search result snippet supported it, so treat it as weaker. Anything not at a primary source is marked **unverified**.

## Summary

1. Dish-level rating is not new. Google Maps has had machine-learned "Popular dishes" from reviews since May 2019, and Toast already ships per-item thumbs up/down via a receipt QR, delivered privately to the restaurant. The "dish-level" idea alone is not a moat.
2. Three earlier dish-rating startups (Oink 2012, Forkly 2013, Foodspotting 2013 sale) did not become lasting businesses. Oink shut, Forkly wound down, Foodspotting was sold for about $10M (2013). No street-food or karinderya-specific attempt was found.
3. Government grading (UK FHRS, Singapore SFA, LA) rates hygiene from inspections, not taste. Evidence of benefit is real for UK compliance (2015) but contested for illness in Los Angeles (2019). None gives dish-level or coaching feedback, and the Philippines has no consumer-facing grade, only a permit.
4. Credit products for Philippine micro-merchants (Grab, Maya, GCash) score payments, sales or wallet activity. Grab's PH business loan needs SEC/DTI papers, a mayor's permit and six months of bank statements (fetched, undated), which excludes most karinderyas.
5. Evidence that ratings predict repayment is thin. One peer-reviewed result links Yelp ratings to SBA loan pricing (Management Science, 2025), not to default for micro-vendors. Phone-usage data predicts repayment better (World Bank Economic Review, 2020).
6. Ratings move small-restaurant revenue and can hurt it: half-star effects on sell-outs (Berkeley, 2012). Rating thresholds harm workers in Uber's case (Data and Society, 2016).
7. Design features that match the intended design exist separately: IMDb minimum votes (5) and Bayesian chart weighting, Yelp's not-recommended filter, Uber's rolling 500-trip window, Airbnb's quarterly 12-month window. Nobody combines them for micro-eateries.
8. The platform is truly different on: free, no-account QR for informal stalls, hyperlocal school focus, private-first negatives with coaching, and a forecasting and credit link. Each of those is individually copyable.
9. Highest copy risk: Google Maps (already has dish extraction, QR review links, 292M reviews blocked in 2025) and delivery apps. Toast could copy it for formal restaurants but is a POS company that carinderias do not use (unverified for the Philippines).
10. Biggest unknowns: Booky's current status, Foodpanda PH ownership, whether delivery apps show item ratings, and any karinderya-specific startup.

## 1. General review platforms

| Solution | What it does, who it serves | Ratings and feedback handling | Evidence | Gap for a micro-eatery |
|---|---|---|---|---|
| Google Maps / Business Profile | Open map listing, free profile, reviews with Google Account | Owners can reply, flag policy violations, send a review link or QR; incentives banned ([Google Business Help, n.d.](https://support.google.com/business/answer/7035772), fetched). Maps added "Popular dishes" from review text and user photos in 2019 ([TechCrunch, 2019](https://techcrunch.com/2019/05/30/google-maps-now-uses-machine-learning-to-find-restaurants-best-dishes-make-suggestions), search summary). | 292 million policy-violating reviews blocked or removed in 2025; new reviews paused on spam spikes ([Google, 2026](https://blog.google/products-and-platforms/products/maps/new-ways-were-protecting-businesses-on-maps/), fetched). | Buyer needs a Google account to review; free text, public by default; stalls with no listing have nothing to rate; no coaching; dish names are inferred, not structured. |
| Yelp | Reviews, mostly US/Europe | Software filters "not recommended" reviews out of the star count; less active reviewers are most likely filtered ([Yelp Trust, n.d.](https://trust.yelp.com/recommendation-software/), fetched). | Half-star display moved Bay Area restaurant sell-out odds from 13% to 34% (3 to 3.5 stars), per UC Berkeley economists (2012, [Berkeley News](https://news.berkeley.edu/2012/09/04/yelp-reviews-boost-restaurants-business/), search summary only). | Not a Philippine product (coverage unverified). Account-based; shop-level star. |
| Tripadvisor | Travel and restaurants | **Unverified**, no page fetched. | None | Tourist-oriented; assumed no karinderya coverage (unverified). |
| Zomato Philippines | Restaurant discovery and delivery | Ended operations in the Philippines in February 2023 after about a decade ([Rappler via search, 2023](https://www.rappler.com/?p=2216063); [Manila Bulletin, 2023](https://mb.com.ph/2023/2/6/icymi-zomato-ends-its-operations-in-the-philippines), search summary). | Reason not disclosed. | Exit shows thin local economics for discovery apps (inference, not a stated reason). |
| Booky | Philippine restaurant booking and discovery, CEO Ben Wintle in 2023 profile | Revenue from Booky Prime subscription (Dealroom summary) | Described as the remaining discovery platform after Zomato Pro closed in 2020 ([ABS-CBN, 2020](https://abs-cbn.com/life/11/21/20/zomato-is-closing-whats-next-for-restaurant-discovery), search summary). | Reservation-focused, formal restaurants. Status in 2025 to 2026 **unverified**. |
| Foodpanda PH / GrabFood | Delivery marketplaces with star ratings | Item-level rating features **unverified**. Delivery Hero said in April 2025 it plans to sell foodpanda in the Philippines and other markets (search summary; no buyer confirmed). Grab agreed in March 2026 to buy foodpanda Taiwan for $600M (search summary). | Commission and onboarding costs are in the earlier note. | Needs permits, high commission, delivery logistics; not for walk-in karinderyas. |
| Facebook | Pages with "Recommendations" (yes/no) since 2018 | Replaced 1 to 5 stars with a yes/no recommendation prompt ([BrightLocal, 2018](https://www.brightlocal.com/2018/08/22/facebook-switching-reviews-to-recommendations/), search summary). | None on outcomes. | Shop-level, requires FB account and a Page. Current behavior in 2026 **unverified**. |
| TikTok | Food video discovery | Popular for food content in the Philippines; DOT ran a food campaign in 2021 with 35M+ views ([PNA, 2021](https://alpha.pna.gov.ph/articles/1143057), search summary). No rating product found. | None | Influencer reach, not structured ratings; "TikTok Local Services" in the PH not found. |
| Beli | Social restaurant ranking app, users rank places against each other for a 1 to 10 score | Reported 120M+ ratings across 2M establishments in August 2026 ([Boston Globe via search summary, 2026](https://www.bostonglobe.com/2026/08/04/lifestyle/beli-restaurant-rating-app/)). | Roughly 80% of users under 35 (secondary source). | Account-based, shop-level ranking, North America focus (PH coverage **unverified**). |

## 2. Government and institutional grading

| Scheme | What it does | Documented effects | Limits relevant to us |
|---|---|---|---|
| UK Food Hygiene Rating Scheme (England, Wales, NI) | Local authority officers inspect food handling, premises, and food-safety management; 0 to 5 ([gov.uk, n.d.](https://www.gov.uk/government/publications/food-hygiene-rating-scheme/food-hygiene-rating-scheme), fetched). Display mandatory in Wales and NI, voluntary in England. | Quasi-experimental evaluation found significant compliance gains in England, Wales, NI, but not in Scotland's pass/fail scheme (Salis, Jabin, Morris, [FSA, 2015](https://e-space.mmu.ac.uk/618918/), search summary; illness result not read). | Inspection intervals run 6 months to 2 years; the rating is a snapshot; no dish information; no peer feedback. |
| Los Angeles County letter grades (1998) | A/B/C cards in the window | Jin and Leslie reported a 20% fall in foodborne hospitalizations (QJE, 2003); Ho, Ashwood, Handan-Nader (AEJ Policy, 2019) found it did not hold up under better data ([UMD abstract, search summary](https://www.econ.umd.edu/publication/effects-information-product-quality-evidence-restaurant-hygiene-grade-cards)). | Illness benefit contested; grading is binary-ish; cost of inspection borne by county. |
| Singapore SFA (formerly NEA) | Grades A to D replaced on 19 January 2026 by SAFE: A (over 3 years, no major lapse), B (1 to 3 years), C (after a major lapse); hawker stalls are Category 2; grade viewable by scanning the licence QR ([SFA newsroom, 2026](https://www.sfa.gov.sg/news-publications/newsroom/new-safety-assurance-for-food-establishment--safe--framework--to-strengthen-food-safety), search result summary). | MPs raised access concerns for non-digital consumers. No stall-level results found. | Track record of lapses, not quality; rewards absence of violations. |
| Hong Kong | "5-star" Open Categorization scheme from 1999 was discontinued in November 2000 after 129 premises lost grading and about 16% of "excellence" premises were only grade C by regular inspection; 2014 advisory paper said FEHD grading risked public and trade confusion ([LegCo papers, 2000 and 2001, search summary](https://www.legco.gov.hk/yr01-02/english/panels/fseh/papers/fe0128cb2-967-05-e.pdf)). | Failure case. | Lesson: generous or self-selected grading erodes credibility. Current scheme **unverified**. |
| India FSSAI Clean Street Food Hub / Eat Right | Hubs of up to 50 vendors sponsored by partners; FSSAI post-training audit; piloted 2018 ([GAIN, undated](https://www.gainhealth.org/resources/reports-and-publications/gain-working-paper-series-3-indias-clean-street-food-hubs), search summary). | 249 hubs and 284 Eat Right Stations certified by July 2025 per a news item; vendor-training figures conflict (3 lakh vs 13 lakh). No outcome study found. | Cluster-based, sponsor-dependent; certification is binary; no consumer rating. |
| Thailand Clean Food Good Taste | Department of Health logo since 1989; in 2002, 3,045 of 6,843 applicants earned it; 30% random reassessment twice a year ([FAO/WHO paper, 2002](https://www.fao.org/3/AB523E/AB523E.htm), search summary). | Folded into SAN Plus; agency responsible differs between sources. | Logo, not a score; effects unverified. |
| Indonesia SLHS | Hygiene and sanitation certificate after inspection and lab test, now mandatory for free-meal kitchens ([Antara, 2025](https://megapolitan.antaranews.com/berita/544251/bgn-tegaskan-slhs-sebagai-syarat-wajib-operasional-sppg), search summary). | Not assessed. | Street-vendor treatment **unverified**. Vietnam **unverified**. |
| Philippines sanitary permit (PD 856, LGU) | Permit from local health office with sanitary inspection and staff health certificates; LGUs run street food under RA 10611 ([FFTC summary](https://ap.fftc.org.tw/node/650); [Morong LGU checklist](https://morongrizal.gov.ph/wp-content/uploads/2018/08/Requirements-for-Application-of-Sanitary-Permit.pdf), search summaries). | Not found. | Binary permit, varies by LGU, no public score. No DOH or LGU "seal" program found (searched "Seal of Good Food Safety", "Sangkap Pinoy"; nothing returned). |
| DOST street vendor training | DOST VII trained 80 Cebu vendors in 2016; the page reports no measured results ([DOST, 2016](https://dost.gov.ph/knowledge-resources/news/45-2016-news/959-street-carinderia-food-in-cebu-city-now-safer-after-vendors-get-dost-training.html), fetched). | None measured. | Training without measurement. |
| DepEd canteen rules | DO 8 s. 2007 and DO 13 s. 2017 set healthy food categories (green/yellow/red) for school canteens ([DepEd, 2017](https://deped.gov.ph/?p=1412), search summary). | Local memos reiterate them; compliance data not found. | Covers on-campus canteens, not karinderyas near campuses. |

Takeaway: these schemes judge hygiene by inspection, are binary or snapshot, and offer no improvement feedback loop. They are complementary, not competing, with a taste-and-value signal. A lesson from Hong Kong is that any public badge needs credible, non-self-selected standards.

## 3. Owner-side feedback and reputation tools

| Tool | Who it serves | Feedback model | Cost | Gap |
|---|---|---|---|---|
| Toast Pay Menu Item Review | Restaurants on Toast POS | After paying via receipt QR, guest gives optional thumbs up/down on up to three items plus optional text; goes to restaurant via report and weekly email, no public display described; guest contact not shared ([Toast support, n.d.](https://support.toasttab.com/en/article/Toast-Pay-Menu-Item-Review), fetched). | Page gives no price. | Needs Toast POS and Toast Pay; private only; no public score; no minimum count described; not available to cash-only stalls. Closest feature match found. |
| Toast Guest Feedback | Same | Dine-in and digital receipt feedback; optional SMS alert on negative review (search summary). | Unverified | Same dependence on POS. |
| Square | POS users | Only a 2019 trade article mentions feedback summary; **unverified** currently. | Unverified | Unknown. |
| Birdeye, Podium | Multi-location SMBs, review generation and reply | Pricing is quote-only. A third-party page reported roughly $299 to $449 per location per month (Birdeye) and about $399 and up (Podium), annual contract; **unverified**, not vendor-confirmed. | Not free | Priced for businesses with US-dollar budgets. |
| Customer Alliance | Hospitality | No published price on G2 (search summary). | Unverified | Unknown |
| Yelp for Business | Claimed Yelp pages | Basic page free, paid ads optional (secondary source). | Unverified | Same as Yelp. |
| Google review QR/link | Any claimed profile | Free QR or link; customer needs Google account ([Google, n.d.](https://support.google.com/business/answer/7035772), fetched). | Free | Public, shop-level, account required. |
| Feedbackly, Typeform | Generic survey tools | **Unverified**, not researched. | | |
| Too Good To Go | Surplus-food discovery | Launched in Japan in early 2026 as its 21st market and first in Asia; no Philippines launch found (search summary). Fees to partners not found. | Unverified | Demand signal only for surplus, not ratings. |

## 4. Reputation as financial data

| Provider | How it uses data | Evidence | Gap for karinderyas |
|---|---|---|---|
| GCash GScore | Based on wallet activity (balances, bill payments, GSave, GInvest, GInsure); updated weekly; GCash says a high score does not guarantee a loan ([GCash Help, n.d.](https://help.gcash.com/hc/en-us/articles/360017566894), search summary; direct fetch returned 403). | Formula not published. | Consumer wallet activity, not dish quality or sales. |
| Maya Advance | Up to ₱350,000 for merchants running Maya Center businesses, launched in the Maya Business app; eligibility method not explained ([Maya, 2025](https://www.maya.ph/stories/maya-expands-business-app-to-help-msmes-manage-inventory-and-access-financing), fetched). Maya Business passed 1M formal businesses (Philstar, 2025, search summary). | Third-party analysts state at least three months as merchant; **unverified**. | Requires Maya merchant account. |
| Grab Financial (PH) | Business loan up to ₱499,000 over 12 months, from 1.49% monthly; needs 1 year in operation, ₱25,000 net monthly sales, SEC or DTI papers, mayor's permit, six months of bank statements ([Grab PH FAQ, undated](https://www.grab.com/ph/merchant/finance/hub/products/faq/), fetched). In Singapore, repayments come from Grab earnings based on sales data ([Grab SG](https://www.grab.com/sg/merchant/finance/hub/products/merchant-credit-line/), search summary). | No default data seen. | The paper requirements exclude informal vendors, the very gap a reputation record could fill. |
| Shopee / Sea Monee (SeaMoney) | Consumer and SME loans; book of $11.1B at Q2 2026, 90-day NPL about 1% reported for an earlier quarter ([Pulse 2.0, 2026](https://pulse2.com/sea-monee-loan-book-surges-63-to-11-1-billion-as-90-day-npl-ratio-holds-at-1/), search summary). | Company figures via news. | Needs platform sales history. Seller-specific scoring inputs **unverified**. |
| M-Shwari (Kenya) | Savings-linked digital loan. In a regression-discontinuity study, eligible households were 6.3 percentage points less likely to forgo expenses after shocks, no change in savings or assets; 34% of eligible took loans ([Bharadwaj, Jack, Suri, NBER, 2019](https://nber.org/papers/w25604), search summary). | Peer-reviewed working paper. | Consumer loan, not merchant. |
| Kenya digital credit risks | Digital credit drove about 90% of blacklistings; an estimated 2.7M digital borrowers were reported to credit bureaus by 2017 ([PLOS ONE, 2021](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8301605/), search summary). | Peer-reviewed. | Warns that negative records can exclude people for years. |
| Lenddo / EFL | Social-network and trusted-connection scoring; merged with EFL in 2017 (Wikipedia, search summary); later status **unverified**. | None verified | Shows alternative data scoring exists; privacy concerns were noted in coverage. |
| Khatabook | Ledger app that moved into lending, with revenue from interest and partner commissions (Entrepreneur India, search summary). | Scale numbers inconsistent across sources. | Ledger data, no customer rating. |
| Tala, Branch, Kredivo, India UPI lending | **Unverified**, not researched. | | |

Do ratings predict repayment? Direct evidence for micro-vendors: none found. Related evidence:
- Yelp rating half-star differences are associated with about 25 basis points lower SBA loan spread and about 6% lower collateral, larger when lenders know less about the borrower ([Huang, Management Science, 2025](https://pubsonline.informs.org/doi/fpi/10.1287/mnsc.2020.03003), search summary). This concerns loan pricing, not default.
- Mobile phone call records outperformed credit-bureau data on thin-file borrowers; the highest-risk quintile defaulted 2.8 times as often as the lowest ([Björkegren and Grissen, World Bank Economic Review, 2020](https://documents1.worldbank.org/curated/en/811881575657172759/pdf/Behavior-Revealed-in-Mobile-Phone-Usage-Predicts-Credit-Repayment.pdf), search summary).
- A study of Chinese P2P platforms found manipulated positive reviews relate to default in both directions depending on horizon (search summary, [IDEAS](https://ideas.repec.org/a/spr/elcore/v24y2024i3d10.1007_s10660-022-09571-7.html)).

Risks: gaming and fake ratings once they carry money value; blacklisting harms (Kenya); minors and personal data; regulatory status of using a reputation score for credit in the Philippines was not researched (**unverified**). A rating predicts customer satisfaction, not cash flow, so the better credit signal is probably sales regularity, not stars.

## 5. The low-rating problem

| Mechanism | How it works | Source |
|---|---|---|
| Owner reply and flagging | Google lets owners reply and flag policy violations; no general dispute process described in Google's 2026 blog | [Google Business Help](https://support.google.com/business/answer/7035772), fetched |
| Fake-review removal, Google | Bans paid reviews, conflicts of interest, incentives, selective solicitation | [Google contribution policy](https://support.google.com/contributionpolicy/answer/7400114), fetched |
| Yelp filter | Unrecommended reviews do not count toward the star rating or count | [Yelp Trust](https://trust.yelp.com/recommendation-software/), fetched |
| FTC final rule on fake reviews (announced August 2024) | Bans review suppression by baseless threats, undisclosed insider reviews, and buying fake social indicators; civil penalties for knowing violators; amount not on the page I read | [FTC, 2024](https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials), fetched |
| UK DMCC Act | Fake-review rules effective 6 April 2025; CMA can fine up to 10% of global turnover (some firms say £300,000 or 10%, whichever higher); CMA primary page not fetched | [CMS summary, 2025](https://cms.law/en/gbr/legal-updates/no-more-faux-five-stars-the-dmcc-act-bans-fake-reviews), search summary |
| IMDb | Rating not shown under 5 ratings; weighted not arithmetic average; different weighting on unusual voting; Top 250 needs 25,000 ratings and uses a Bayesian-style formula | [IMDb Help](https://help.imdb.com/article/imdb/track-movies-tv/ratings-faq/G67Y87TFYYP6TWAV), fetched |
| Uber | Driver average covers the most recent 500 rated trips, so it can recover; city-specific minimum; the figures 4.5 and 4.6 are second-hand | Uber help (via search summary, direct fetch failed) and [Data and Society, 2016](https://datasociety.net/library/discriminating-tastes-customer-ratings-as-vehicles-for-bias/) |
| Airbnb | Superhost needs 4.8 or higher overall rating, checked quarterly over 12 months; may withhold status for high review-removal rates; review counts once both sides review or after 14 days | [Airbnb Help](https://www.airbnb.com/help/article/829), fetched |
| Facebook | Shifted to yes/no recommendations (2018) | BrightLocal, search summary |

Harm evidence: Rosenblat, Levy, Barocas and Hwang argue that customer ratings carry bias into Uber's deactivation decisions, with drivers needing to stay near 4.6 (Data and Society, 2016; later in Policy and Internet, 2017). For restaurants, a half-star can swing sell-outs (Berkeley, 2012), and Luca's Seattle study reported 5 to 9% revenue per star for independents but not chains (secondary summary of 2010 paper, not the paper itself). A fixed threshold plus open public scores is therefore a real risk for a single-cook stall. Recency windows (Uber, Airbnb), minimum counts (IMDb) and filtering of thin accounts (Yelp) are the proven mitigations; I found no verified source that says Yelp or Airbnb use Bayesian averaging for individual listings (**unverified**).

## 6. Gap analysis

Legend: Yes / Partial / No. "U" = unverified. Source keys: [G] Google Business Help and Google blogs; [TC] TechCrunch 2019; [T] Toast support; [Y] Yelp Trust; [GOV] gov.uk FHRS and SFA; [GC] GCash, Maya, Grab pages; [F] TechCrunch Forkly and Oink 2012 to 2013.

| Capability | Google Maps | Delivery apps | Beli | Facebook / TikTok | Toast item review | Birdeye / Podium | FHRS / SFA | Forkly / Oink / Foodspotting | GCash / Maya / Grab Fin |
|---|---|---|---|---|---|---|---|---|---|
| Dish-level ratings | Partial, inferred from text [TC] | U | No (place ranking) | No | Yes [T] | No | No | Yes [F] | No |
| Structured tags, not free text | No | U | Partial | No | Partial (thumbs plus text) [T] | No | No | U | No |
| Private-first negatives | No | U | No | No | Yes, no public display described [T] | Partial (U) | n/a | No | n/a |
| Minimum-count public score | No | U | U | No | No public score | U | n/a (inspection) | U | n/a |
| No buyer account | No, needs Google account [G] | No | No | No | Partial, receipt QR [T] | U | n/a | No | n/a |
| Owner coaching | No (reply only) [G] | U | No | No | Partial, reports and weekly email [T] | Partial (U) | No | No | No |
| Hyperlocal school-area focus | No | No | No | No | No | No | No | No | No |
| Works for informal vendors without permits | Partial (owner or user can add place; U) | No, permits required (earlier note) | U | Partial (page is free) | No, needs Toast POS | No | No, permit-based | U | No (Grab PH needs permits [GC]) |
| Free for owners | Yes [G] | No | U | Yes (U) | U | No (U) | Yes for owners | U | n/a |
| Feeds demand forecasting | No | Partial (internal, U) | No | No | Partial, with sales data [T] | No | No | No | n/a |
| Creates a credit-usable record | No | Partial (Grab Financial uses sales data) [GC] | No | No | No | No | No | No | Partial: wallet and sales, not ratings [GC] |

## Where the platform is truly different

- Free, account-less QR collection on informal stalls. Google, Yelp and Beli require accounts; Toast requires its POS. A cash-only stall with a printed QR is not served by any verified product.
- Hyperlocal school-area focus with a minimum-distinct-buyer rule before any public score. Nobody found does this; IMDb and Yelp use counts and filters but at global scale.
- Private-first negatives paired with coaching. Toast's private item feedback is the closest, but it is tied to Toast POS and has no public layer.
- A rating record that sits next to the owner's own sales and weather data. Grab and Maya underwrite on sales, but through formal merchant accounts, so a karinderya with no permit stays outside.
- Honest limit: none of this is proven demand. Buyer discovery behavior for karinderyas is unverified (earlier note).

## Where an incumbent could copy us

- Google Maps: already extracts popular dishes, offers QR review links, owns the listing graph, and has the review-integrity machinery. It could add structured dish tags, hide scores until a minimum count, and private owner feedback quickly. What it is unlikely to do: serve unlisted stalls without accounts, or build forecasting and credit around them. This is the biggest threat.
- Delivery apps (Grab, foodpanda): hold order data per dish and could show item scores. Their weakness is permit-based onboarding and delivery-only coverage; a school-area walk-in karinderya is outside their funnel. Whether item ratings exist today is unverified. Foodpanda's Philippine future is uncertain (Delivery Hero said in 2025 it planned a sale).
- Toast and POS vendors: have the closest feature (receipt-QR item review). They could add a public score. Karinderyas rarely use POS systems (assumption, unverified for PH).
- GCash and Maya: have QR payments at small merchants and could attach item ratings to payment receipts. This is a real risk for the credit link, because they already own the payment and credit data. Whether they plan this is unverified.
- Beli and TikTok: strong with young urban diners, but scores are place-level and account-based; a pivot to school-area carinderyas is unlikely.
- Defence: the history of Oink, Forkly and Foodspotting says dish-level ratings alone do not retain users or monetize; the value must come from the owner-side loop, which is the harder part to copy.

## 7. Closest competitors and failed attempts

| Attempt | What happened | Source |
|---|---|---|
| Oink (Kevin Rose, Milk) | Rated individual dishes and items; 100,000 downloads in about 2.5 weeks after November 2011; 150,000 users by December; shut down March 2012, described as a "test"; TechCrunch speculated about poor review margins (speculation, not stated) | [TechCrunch, 2012](https://techcrunch.com/?p=520280), fetched |
| Forkly | Rated individual dishes; 2.1M dishes, 93,000 restaurants, about 500,000 dish ratings; $900,000 raised across 2011 and 2012; in October 2013 "in transition" and seeking a buyer; the founder said data was not monetized and differentiation from Foodspotting was weak | [TechCrunch, 2013](https://techcrunch.com/2013/10/07/forkly-the-foodspotting-competitor-from-brightkite-founders-is-shutting-down), fetched |
| Foodspotting | Dish-photo app acquired by OpenTable for about $10M cash in January 2013; OpenTable said it would run it standalone. Current status **unverified** (I did not find evidence of a shutdown) | [TechCrunch/Vator via search summary, 2013](https://vator.tv/2013-01-29-opentable-acquires-foodspotting-for-10-million-cash/) |
| Urbanspoon | Restaurant (not dish) reviews, folded into Zomato in 2015 | [TechCrunch, 2015](https://techcrunch.com/2015/06/01/urbanspoon-zomato-integration), search summary |
| Street food or hawker-specific rating apps | None found in the searches run | n/a |

All three dish apps were consumer social apps in rich markets, with accounts and open ratings, and none had an owner-side loop. They are evidence of what not to rely on (consumer growth alone), not of failure of the owner-feedback model, which was not tested.

## Not verified

- Booky current status; foodpanda PH current ownership; Tripadvisor, GoFood; whether Grab and foodpanda show per-item ratings.
- Facebook and TikTok current local-review products (2018 and 2021 data only).
- Birdeye and Podium prices (third-party, unconfirmed); Customer Alliance, Yelp for Business, Square, Feedbackly, Typeform, Too Good To Go partner fees.
- Primary pages not read directly (only search summaries): SFA SAFE, Hong Kong LegCo papers, FSSAI and GAIN, FAO/WHO Thailand document, DepEd order text, FHRS final evaluation (illness result not read), Jin and Leslie and Ho et al., NBER M-Shwari, Huang (Yelp and SBA), Björkegren and Grissen, Berkeley news (Anderson and Magruder), Luca (only a secondary summary), CMA guidance (law-firm summaries only), Uber's own rating help page (fetch failed), GCash help (403), Beli figures, Sea Monee figures.
- Tala, Branch, Kredivo, India UPI lending, Maya's actual eligibility method, Lenddo's later status, Indonesia street-food exemption, Vietnam rules.
- Whether Yelp or Airbnb use Bayesian averaging; Uber's current minimum rating (4.5 and 4.6 are second-hand and dated).
- Philippine legal treatment of using ratings for credit, and Data Privacy Act implications for minors.
- Any Philippine startup or LGU program doing dish-level ratings.

## Sources

Fetched (page read): [Google Business Help](https://support.google.com/business/answer/7035772); [Google contribution policy](https://support.google.com/contributionpolicy/answer/7400114); [Google blog, 2026](https://blog.google/products-and-platforms/products/maps/new-ways-were-protecting-businesses-on-maps/); [Yelp Trust](https://trust.yelp.com/recommendation-software/); [IMDb Help](https://help.imdb.com/article/imdb/track-movies-tv/ratings-faq/G67Y87TFYYP6TWAV); [gov.uk FHRS](https://www.gov.uk/government/publications/food-hygiene-rating-scheme/food-hygiene-rating-scheme); [FTC, 2024](https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials); [Airbnb Help 829](https://www.airbnb.com/help/article/829); [Toast support](https://support.toasttab.com/en/article/Toast-Pay-Menu-Item-Review); [Grab PH FAQ](https://www.grab.com/ph/merchant/finance/hub/products/faq/); [Maya, 2025](https://www.maya.ph/stories/maya-expands-business-app-to-help-msmes-manage-inventory-and-access-financing); [DOST, 2016](https://dost.gov.ph/knowledge-resources/news/45-2016-news/959-street-carinderia-food-in-cebu-city-now-safer-after-vendors-get-dost-training.html); [TechCrunch Oink, 2012](https://techcrunch.com/?p=520280); [TechCrunch Forkly, 2013](https://techcrunch.com/2013/10/07/forkly-the-foodspotting-competitor-from-brightkite-founders-is-shutting-down).

Search summary only: all other links in the tables above, including [MMU e-space FHRS record](https://e-space.mmu.ac.uk/618918/), [UMD hygiene grade cards](https://www.econ.umd.edu/publication/effects-information-product-quality-evidence-restaurant-hygiene-grade-cards), [SFA SAFE](https://www.sfa.gov.sg/news-publications/newsroom/new-safety-assurance-for-food-establishment--safe--framework--to-strengthen-food-safety), [NBER 25604](https://nber.org/papers/w25604), [Management Science, Huang](https://pubsonline.informs.org/doi/fpi/10.1287/mnsc.2020.03003), [Data and Society, 2016](https://datasociety.net/library/discriminating-tastes-customer-ratings-as-vehicles-for-bias/), [CMS, 2025](https://cms.law/en/gbr/legal-updates/no-more-faux-five-stars-the-dmcc-act-bans-fake-reviews).
