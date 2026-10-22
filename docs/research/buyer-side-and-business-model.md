# KapyBa: buyer side and business model research

Researched 2026-10-22. Scope: buyer-side ideas, whether they help the owner's core problem, business models, Filipino micro-merchant pricing, and a recommendation. It does not repeat `msme-global-problems-and-solutions.md`. Insurance appears only as a revenue and cost line.

Evidence labels: **Verified** means I fetched the page and read the figure. **Search-only** means the figure appeared in a search excerpt but the page could not be fetched (HTTP 403 or 429, or a dead host). **Unverified** means no first-party source was reached. The "Not verified" section lists the gaps.

## Summary

1. No first-party or peer-reviewed Philippine study on how people find carinderias was found. I cannot claim evidence for the buyer-discovery premise. Treat it as a hypothesis for the pilot.
2. Open ratings are the wrong first move for a small team. Google alone blocked or removed 292 million policy-violating reviews and 13 million fake profiles in 2025 ([Google, 2025](https://blog.google/products-and-platforms/products/maps/new-ways-were-protecting-businesses-on-maps/)). A small team cannot match that moderation load, and carinderias have very low review density.
3. Recommended buyer layer: a read-only, owner-published "Ulam Board" (today's ulam, price, sold-out status). It costs the owner one tap and needs no moderation.
4. Buyer features help the owner's core problem only when they create a demand signal before cooking (reserve or pre-order). Ratings and "popular nearby" do not feed the forecast.
5. The best pre-order evidence is a Belgian school meal app. A 12-day order deadline is estimated to cut about 60 tonnes of food waste a year (about EUR 380,000 saved) ([Interreg Europe, 2022 onward](https://www.interregeurope.eu/good-practices/implementation-of-meal-ordering-application-for-schools-parents)). A school canteen with fixed menus is not a carinderia, so transfer is uncertain.
6. Micro-merchant software mostly runs free core plus cheap add-ons. Loyverse's core is free with add-ons from USD 5 a month (2026). OkCredit charges INR 30 to 99 per 30 days (2026).
7. Filipino digital-payment fee norms are 1.0% to 1.6% for QR Ph. Any fee on sales must be small against this.
8. Best-fit models for a carinderia owner who earns little and keeps a notebook: partner-funded free access first, a tiny optional subscription second, embedded insurance and supplier ordering later.
9. Failure patterns: Bukalapak's warung program sits inside a company still losing money (2024). Karma's site now presents a restaurant POS (2026), which suggests surplus-food marketplaces are hard to sustain alone.
10. Pitch line: "Free to the owner during the pilot, funded by a school or LGU partner. We charge a few pesos only when the owner saves money."

## 1. Buyer side and discovery

### What existing platforms do

| Platform | How discovery, ratings and "popular nearby" work | Fit for micro-eateries | Evidence |
|---|---|---|---|
| Google Maps | Open reviews; the owner must claim the listing. | Poor for turuturo stalls with no listing. Fake-review fight is heavy: 292 million reviews blocked or removed and 13 million fake profiles removed in 2025. Google pauses new reviews on a profile when spam spikes. | [Google, 2025](https://blog.google/products-and-platforms/products/maps/new-ways-were-protecting-businesses-on-maps/) |
| Foodpanda, GrabFood | Delivery marketplaces with ranking and ratings. | Third-party sources put Philippine commissions at roughly 20% to 30%. That is far too high for a carinderia, and onboarding needs DTI or SEC papers, a mayor's permit, BIR Form 2303 and an ID. Search-only, and the vendor sources disagree. | [Klikit, vendor blog](https://klikit.io/en/learn/food-delivery-commission-fees-philippines-guide) (search excerpt only) |
| Too Good To Go, OLIO | Surplus-food discovery, not ratings. | See section 2. | See section 2 |
| Yelp, Beli, Zomato, Hungry Hub, GoFood warung listings, TikTok food reviews | Not verified in this pass. | Unverified | None |
| Facebook groups and TikTok | Informal word of mouth. | Likely where Filipino buyers already ask, but there is no food-specific data. Context only: 90.8 million social media user identities in January 2025 (78.0% of the population) ([DataReportal, 2025](https://datareportal.com/reports/digital-2025-philippines)). | Verified (general usage only) |

### Evidence on how Filipinos find carinderias

I found none that I can cite. One candidate, a General Santos City journal paper on carinderia loyalty ([Kaalam, 2025](https://kaalam.htcgsc.edu.ph/wp-content/uploads/2025/07/BEYOND-THE-TASTE-EXPLORING-THE-FACTORS-INFLUENCING-CONSUMER-LOYALTY-TO-CARINDERIAS-IN-GENERAL-SANTOS-CITY.pdf)), returned unreadable PDF data, so I could not read its findings. A cross-country YouGov poll on word of mouth does not break out the Philippines. The pilot should ask 20 students and parents: "How did you first find this carinderia?"

### Why open ratings are risky here

- **Cold start and low density.** A stall with 8 ulam a day and no listing will have zero or one rating for months. One angry rating then dominates.
- **Fake and retaliatory reviews.** Google's volumes above show the scale of the problem even for a mature platform.
- **Owner willingness.** Unverified. No source was found on whether carinderia owners accept being rated. Test this in the pilot before building anything.
- **Privacy and minors.** Buyers near schools include students. Collecting reviews and accounts from minors raises Data Privacy Act issues. I did not fetch the law or National Privacy Commission guidance, so this needs a check by someone qualified.
- **Informality.** Owners often have no permit, so platforms that require DTI or SEC papers (the Foodpanda route above) exclude them. A read-only board needs no permit.

### Should buyer features be a read-only layer fed by owner data?

Yes. It reuses data the owner already enters (the evening log, the dish list), adds no new moderation duty, and does not expose the owner to ratings. That is a design judgment, not a verified finding.

### Three buyer-side designs, ranked by effort and risk

| Rank | Design | Effort | Risk | Notes |
|---|---|---|---|---|
| 1 | **Ulam Board.** The owner taps "publish today's ulam". It produces a shareable image and link for Facebook or Viber, with a "naubos na" (sold out) toggle. No buyer accounts. | Low (static page or image from existing data) | Very low | Buyers get utility without logging in. The owner controls what is shown. Tests whether buyers look at all. |
| 2 | **School-area "what's moving".** Anonymous weekly top ulam, built from opted-in owners' own sales logs. Show it only when at least 5 owners contribute. | Medium (needs a backend and enough owners) | Low to medium | Matches the team's "popular around" idea but replaces public perception with owner data. Fails below the owner threshold, so cold start still applies. The 5-owner threshold is my assumption. |
| 3 | **Light buyer signal.** One-tap "sulit" thumbs-up on today's ulam, limited to buyers holding a code printed on the receipt or shown at the stall, plus an optional reserve button. | High (accounts or codes, fraud rules, privacy) | Medium to high | Only attempt after designs 1 and 2 show use. The owner must opt in. Do not publish scores until there are enough votes. The threshold is a design choice, not from a source. |

## 2. Does a buyer side help the core problem?

The core problem is forecasting, waste and price shocks. Only a signal that arrives before cooking changes the forecast.

| Model | Verified? | What it shows | Relevance to KapyBa |
|---|---|---|---|
| School meal pre-order, Liège region, Belgium | Verified | A 12-day order deadline since September 2022 cut overproduction; estimated saving about 60 tonnes of food waste and about EUR 380,000 a year (estimate; waste figures are apportioned across service streams). [Interreg Europe](https://www.interregeurope.eu/good-practices/implementation-of-meal-ordering-application-for-schools-parents) | Closest evidence that pre-orders reduce waste. A 12-day deadline suits a set school menu, not a walk-in carinderia. |
| Too Good To Go | Partly verified | About 157 million meals saved in 2025 and more than 180,000 business partners, per a Dutch press release (search excerpt; the page returned HTTP 429). Partners reportedly pay an annual fee and a per-bag commission: USD 89 a year and USD 1.79 per bag in the US in 2024 ([Modern Retail, 2024](https://www.modernretail.co/operations/too-good-to-go-teams-up-with-whole-foods/)). | It sells leftovers after the forecast failed. It reduces waste but does not improve forecasting. A leftover-ulam discount is possible later. Surprise-bag pricing is US data. |
| OLIO | Verified (site) | Free app; the page claims 9 million users and does not explain revenue. [OLIO](https://olioapp.com) | Donation model. No revenue lesson. |
| Karma (Sweden) | Partly verified | Surplus-food marketplace that pivoted in 2016 and again in 2020 (search results, 2018 to 2020 sources). Its current site presents a cloud POS and restaurant platform run by Karmalicious AB ([Karma](https://karma.life), 2026). Whether this is the same company as the surplus app is unverified. | A cautionary sign for a surplus marketplace as a standalone business. Do not state this as fact in a pitch. |
| Flash Food, Lunchbox, office and canteen pre-order apps | Unverified | No page fetched. "Flashfood" (Canada) 404ed on my fetch; no Philippine "Flash Food" was found. | Do not cite. |

Conclusion for the team: ratings and "what's popular" are discovery features. They may bring buyers but do not help the owner buy less waste. The reserve button and the sold-out status are the only buyer features that touch the core problem. A cleaner test is a "reserve my ulam by 10 AM" option for students and teachers. Success means it moves actual cooking quantities.

## 3. Business models for micro-merchant software

| Model | Revenue per user (verified where possible) | Who pays | Risks | Fit for a carinderia owner |
|---|---|---|---|---|
| Freemium subscription | Loyverse core is free; add-ons are USD 5 per store per month (unlimited sales history), USD 5 per employee per month, USD 25 per store per month (advanced inventory) ([Loyverse](https://loyverse.com/pricing), 2026). OkCredit: free basic; INR 30, 75 or 99 per 30 days ([OkCredit](https://okcredit.in/pricing), 2026). Moka POS: Rp299,000, Rp499,000, Rp799,000 per outlet per month ([Moka](https://www.mokapos.com/en/pricing), 2026). Vyapar prices vary by source: unverified. | The owner | Low conversion. Moka's price targets cafes with a counter, not a carinderia. | Only the OkCredit-style tiny price fits. |
| Transaction fees | GCash QR Ph 1.0%, cards 3.2%, VAT-inclusive, no monthly MDR fee, per the GCash Help Center (search excerpt only; page returned HTTP 403). Maya: 1.25% offline or 1.60% for QR Ph; the page contradicts itself ([Maya](https://www.maya.ph/business/qr-ph), 2026). | The owner or the buyer | A cash carinderia has few digital sales. A KapyBa fee would stack on top of the wallet fee. | Poor. KapyBa does not process sales. |
| Embedded finance and lending referral | Khatabook reported FY24 revenue of INR 113.8 crore per Inc42. Dealroom says revenue comes from payments, premium plans and lending, with no split ([Inc42](https://inc42.com/company/khatabook/financials/), FY24). The Inc42 page also shows FY25 revenue of INR 1.4 crore, which looks like incomplete data: unverified. | The lender | Regulatory burden, default risk, and the owner's thin records. | A later option. The sales log could support a credit referral, but it needs a licensed partner. |
| Embedded insurance commission | GSMA reports that only 12% of the microinsurance target population was covered in 2023 (search excerpt of [GSMA, 2025](https://www.gsma.com/solutions-and-impact/connectivity-for-good/mobile-for-development/gsma_resources/from-connectivity-to-coverage-scaling-resilience-through-mobile-enabled-microinsurance/); page returned HTTP 403). No commission rate found. | The owner, by a few pesos per sale | Basis risk, claims trust, and licensing. Insurance needs a licensed underwriter. | Treat as a cost pass-through, not profit, until a distribution fee is agreed. |
| B2B ordering and supplier commission | Not verified. Packworks says about 300,000 stores use its inventory and POS software (2024), and its software was free to at least one owner. The article does not say how Packworks earns ([Rest of World, 2024](https://restofworld.org/2024/sari-sari-philippines-tech/)). GrowSari links stores to brands such as Unilever and Nestle for wholesale buying. The article gives no revenue model. | Suppliers or brands | Carinderia owners buy fresh produce at the palengke, not from catalogues. | Weak fit for wet-market buying. Revisit when suppliers can confirm prices. |
| Data licensing | None found. | Buyers of data | Privacy, small sample, and owner trust. | Not now. |
| Advertising or promoted listings | None verified. | Advertisers | Needs buyer traffic KapyBa does not have yet. | Not now. |
| Government, NGO, grant, school or LGU funding | DTI's FY2024 budget lists a Negosyo Center target of MSMEs assisted at 34% (2023 level) and 47% (2024 target) ([DBM, 2024](https://www.dbm.gov.ph/wp-content/uploads/GAA/GAA2024/VolumeII/DTI/B.pdf), search excerpt). Packworks partners with DTI's Sari-Sari Store Advancement Program ([Rest of World, 2024](https://restofworld.org/2024/sari-sari-philippines-tech/)). | The partner | Slow decisions, grant dependence, and reporting duties. | Good for a pilot. Not a lasting model on its own. |

### Failures and warnings

- **Bukalapak (Indonesia).** Its warung partner program continues, but the company reported a net loss of Rp597.35 billion for January to September 2024 on net revenue of Rp3.4 trillion, and announced layoffs on 30 October 2024 ([Katadata, 2024](https://databoks.katadata.co.id/en/employment/statistics/67231636a30a7/bukalapak-plans-layoffs-amidst-hundreds-of-billions-of-rupiah-in-losses)). Warung software did not carry the company.
- **Khatabook.** Net loss of INR 116.24 crore in FY24 on reported revenue of INR 102.7 to 113.8 crore (the sources differ; the loss figure is from a search excerpt of YourStory, whose page did not load).
- **Karma.** See section 2.
- **Packworks hardware cost.** One owner spent about 9,000 pesos on a tablet, scanner and printer (2019). The software was free, but setup costs money ([Rest of World, 2024](https://restofworld.org/2024/sari-sari-philippines-tech/)). KapyBa avoids this by running on the owner's phone.

## 4. Pricing reality for Filipino micro-merchants

- **Willingness to pay.** I found no study that measures it in pesos. A GCash readiness study of 68 sari-sari owners reports concern about transaction costs but gives no figures (search excerpt, [JISEM](https://jisem-journal.com/index.php/journal/article/view/3208)). Willingness to pay is therefore unverified. Measure it in the pilot.
- **Free-tier expectation.** Packworks software was free to its users, and Loyverse's core is free. Free core is the norm, so a paid wall on the first feature will likely fail (inference).
- **Fee norms.** GCash 1.0% QR Ph (search excerpt, page returned HTTP 403); Maya 1.25% to 1.60% ([Maya](https://www.maya.ph/business/qr-ph), 2026). KapyBa should not add a percentage fee on sales.
- **Digital readiness.** The BSP's 2025 survey, as reported by the Tribune, shows 50% of adults with formal accounts (56% in 2021) and 36% with e-money accounts ([Tribune, 2026](https://tribune.net.ph/2026/04/17/only-half-of-filipino-adults-have-formal-bank-accounts-bsp-2)). I did not reach the BSP release itself.
- **Scale of the segment.** The 2023 PSA list counted 1,246,373 businesses, of which accommodation and food service was 190,899 (search excerpt of [DTI, 2023](https://dti.gov.ph/businesses/msmes/msmeresources/msme-statistics); the host did not resolve when fetched).

## 5. Recommendation

### Ranked business models

| Rank | Model | Unit-economics sketch (all assumptions, not verified) | Why |
|---|---|---|---|
| 1 | **Partner-funded free access.** A school, LGU, DTI Negosyo Center or sponsor pays; the owner pays nothing. | Assume a partner funds PHP 150 to 300 per owner per month for 30 owners, so PHP 4,500 to 9,000 a month against hosting and support costs. Both the price and the partner appetite are untested. | Fits an owner who earns little. Also matches a contest pilot. |
| 2 | **Freemium with a tiny optional plan.** Core list is free; a paid tier adds history and backup. | Assume PHP 49 to 99 a month at 10% conversion, so PHP 5 to 10 per active user a month. Anchor: OkCredit INR 30 to 99 per 30 days (2026). Conversion rate is a guess. | A familiar pattern, but revenue per user is low. |
| 3 | **Embedded insurance distribution (Bagyo Fund) plus, later, supplier or lending referrals.** | Premium a few pesos per sale is a pass-through. Assume KapyBa keeps a 10% to 20% distribution fee, if a licensed underwriter agrees. Unverified. | Revenue only appears when the owner gets a payout. Needs a licensed partner. Not before the pilot proves trust. |

Not recommended now: advertising, data licensing, transaction fees, and open ratings.

### What to test in the first pilot

1. Does the owner open the app 5 of 7 days (the PRD target)? Does the forecast error fall week on week?
2. Waste in kilograms and PHP per week, before and after, from the owner's notebook.
3. Willingness to pay: ask "would you pay PHP 0, 49, 99 a month?" after two weeks of real use, and see whether anyone pays.
4. Ulam Board: do buyers open it, and does any buyer change what they eat? Count views and walk-ins that mention it.
5. Opt-in: will owners share anonymous sales totals for a "what's moving" board? Count yes and no.
6. Reserve button: does it change cooked quantities for any ulam?
7. Partner appetite: does a school or LGU office say it would fund 30 owners? Ask for a letter of intent.

### What to say in a CSSPRINT pitch

"KapyBa is free for the carinderia owner during the pilot. We are asking a school or LGU partner to fund it, because fewer wasted ingredients and steadier prices help the neighborhood's cheapest meal. After the pilot, owners who want history and backup pay a few pesos a month. Later, a rain-day cover funded by a few pesos per sale could add a small distribution fee. We will test willingness to pay before we set any price."

## Not verified

- **Carinderia discovery in the Philippines.** No usable source. The Kaalam PDF returned unreadable data.
- **Yelp, Beli, Zomato, Hungry Hub, GoFood warung listings, TikTok food reviews.** No page fetched.
- **Foodpanda and GrabFood commissions.** Only a third-party vendor (Klikit), and its figures conflict.
- **GCash MDR.** Seen in a search excerpt of the GCash Help Center; the page returned HTTP 403.
- **Too Good To Go 2025 totals.** From a search excerpt; the press page returned HTTP 429. Partner fees are US 2024 only.
- **Karma, Flash Food, Lunchbox.** Unclear identity or no source; do not cite.
- **Italian university pre-order study (946 students).** Found only in a search excerpt, not fetched.
- **Vyapar prices.** Secondary sources only.
- **Khatabook revenue.** The sources disagree (INR 102.7 crore vs 113.8 crore for FY24), and the Inc42 FY25 figure looks incomplete. The loss figure is from a search excerpt.
- **GSMA microinsurance 12% figure.** From a search excerpt; the page returned HTTP 403. No commission rate found.
- **PSA, DTI and DBM figures.** DTI host did not resolve; figures are from search excerpts. The DBM figures are ambiguous (target vs actual).
- **Data Privacy Act and minors.** Not researched. Needs a check with the National Privacy Commission or counsel.
- **Willingness to pay (PHP) for Filipino micro-merchants.** No source found.
- **Embedded insurance commission rates.** None found.

## Sources

- [Google, 2025, protecting businesses on Maps](https://blog.google/products-and-platforms/products/maps/new-ways-were-protecting-businesses-on-maps/)
- [DataReportal, 2025, Digital 2025: The Philippines](https://datareportal.com/reports/digital-2025-philippines)
- [Interreg Europe, school meal ordering application](https://www.interregeurope.eu/good-practices/implementation-of-meal-ordering-application-for-schools-parents)
- [Modern Retail, 2024, Too Good To Go and Whole Foods](https://www.modernretail.co/operations/too-good-to-go-teams-up-with-whole-foods/)
- [OLIO](https://olioapp.com)
- [Karma](https://karma.life)
- [Loyverse pricing](https://loyverse.com/pricing)
- [OkCredit pricing](https://okcredit.in/pricing)
- [Moka pricing](https://www.mokapos.com/en/pricing)
- [Maya Business QR Ph](https://www.maya.ph/business/qr-ph)
- [GCash Help Center, MDR](https://help.gcash.com/hc/en-us/articles/55684605325593-What-is-the-GCash-for-Business-Merchant-Discount-Rate-MDR) (not fetched; HTTP 403)
- [Inc42, Khatabook financials](https://inc42.com/company/khatabook/financials/)
- [Rest of World, 2024, sari-sari tech](https://restofworld.org/2024/sari-sari-philippines-tech/)
- [Katadata, 2024, Bukalapak](https://databoks.katadata.co.id/en/employment/statistics/67231636a30a7/bukalapak-plans-layoffs-amidst-hundreds-of-billions-of-rupiah-in-losses)
- [Tribune, 2026, BSP survey](https://tribune.net.ph/2026/04/17/only-half-of-filipino-adults-have-formal-bank-accounts-bsp-2)
- [DTI, 2023 MSME statistics](https://dti.gov.ph/businesses/msmes/msmeresources/msme-statistics) (not fetched)
- [DBM, 2024, DTI budget](https://www.dbm.gov.ph/wp-content/uploads/GAA/GAA2024/VolumeII/DTI/B.pdf) (not fetched)
- [GSMA, 2025, microinsurance](https://www.gsma.com/solutions-and-impact/connectivity-for-good/mobile-for-development/gsma_resources/from-connectivity-to-coverage-scaling-resilience-through-mobile-enabled-microinsurance/) (not fetched)
- [Kaalam, 2025, carinderia loyalty](https://kaalam.htcgsc.edu.ph/wp-content/uploads/2025/07/BEYOND-THE-TASTE-EXPLORING-THE-FACTORS-INFLUENCING-CONSUMER-LOYALTY-TO-CARINDERIAS-IN-GENERAL-SANTOS-CITY.pdf) (unreadable)
- [JISEM, sari-sari GCash readiness](https://jisem-journal.com/index.php/journal/article/view/3208) (search excerpt)
- [Klikit, Philippine delivery commissions](https://klikit.io/en/learn/food-delivery-commission-fees-philippines-guide) (vendor blog, search excerpt)
