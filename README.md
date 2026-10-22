# KapyBa

Team Kapybytes, CSSPRINT 2026 ("The Tale is Forged"). Problem space: a practical digital solution for a specific problem faced by Filipino MSMEs.

> **KapyBa helps karinderya owners know which dishes customers love, so they cook what sells, waste less, and earn more. It helps students and workers know which dishes are worth their money.**

## In one minute

A karinderya serves many ulam each day, and the owner usually decides how much to cook by guessing. Customers walk away happy or disappointed and nobody tells the owner which dish was the problem. Buyers on a small budget cannot tell which stall serves the best dish for the price until they have already paid.

KapyBa fixes both with one tool. A customer scans a QR code at the stall and rates a dish with a face: happy, so-so or sad. It takes two taps and needs no account. The owner opens the app and sees, dish by dish, what people think, what to fix, and how much to cook and buy tomorrow. Other buyers see which dishes are worth their money.

## 1. The problem

**Owners cook blind.** Karinderya owners get no dish-level feedback. They do not know whether a dish stays unsold because it is too salty, too small or too pricey, so they cook the same amounts every day.

**Food is wasted.** Ulam that is cooked but not sold is lost money and wasted food. Small stalls have no simple tool to plan how much to cook.

**Buyers cannot tell what is worth it.** Students and workers with a tight lunch budget choose by guess, a friend's word or what they can see in the pot.

**Existing tools do not fit.** Google Maps rates a place, not a dish, and needs buyers to have accounts. Restaurant software needs a cash register system that a karinderya does not have. Review sites are made for restaurants, not for a cash-only stall.

(Evidence and sources: `docs/BRIEF.md` and `docs/research/`. Most of the hard numbers come from other countries, so we test the Philippine picture in a pilot.)

## 2. The impact

| Who | What changes |
|---|---|
| **Owners** | Cook what sells, throw away less, learn what to fix, and attract buyers with their own deals. Free to use. |
| **Buyers** | Pick a dish that is worth their money, within their budget, in seconds. |
| **Community** | Less food wasted, and small businesses that grow. This supports the UN goals on responsible consumption (SDG 12.3) and decent work and growth of small businesses (SDG 8.3). More in `docs/IDEA.md` section 15. |

How we will know it works: in a 2-week pilot at 3 stalls near one school, we measure the pesos of leftover food each day, the number of real ratings, and whether owners keep using it.

## 3. What is new (novelty)

1. **Ratings by dish, not by place.** Each dish gets its own face score, so the owner sees exactly which one to fix.
2. **Built for the owner, not just for browsing.** Most rating apps help buyers choose. KapyBa also coaches the owner and turns ratings into tomorrow's cooking and shopping plan.
3. **Fair to small stalls.** Bad news goes to the owner privately first, as simple tags like "too salty" or "small serving". A dish only shows a public score after enough different people have rated it, and old ratings fade over 30 days, so one bad week does not sink a stall.
4. **No sign-up for customers.** A QR code on the stall is the only step. It works for cash-only stalls with no permits.
5. **Cuts waste and brings buyers.** Leftover data shrinks tomorrow's cooking, and owners can post their own deals (Alok) to move slow dishes. Deals are never given in exchange for a rating, so ratings stay honest.
6. **Honest when there is little data.** The app shows "Kulang pa" (not enough yet) instead of a made-up score.

## 4. What you can do with it

### Owners

| What | How it helps |
|---|---|
| **Set up in about 2 minutes** (Simula) | Pick dishes from an icon grid, add prices and servings, print your QR code. |
| **See today at a glance** (Ngayon) | Every dish with a happy, so-so or sad face and a trend arrow. |
| **Understand each dish** | Why customers are unhappy: salty, small serving, cold, or too pricey. |
| **Compare with nearby stalls** (Kumpara) | See where your dish sits next to the neighbourhood, with simple advice such as "less salt" or "cook less". |
| **Track leftovers** (Natira) | Tap what was left at the end of the day to see the pesos lost. |
| **Plan tomorrow** (Bukas) | Suggested servings based on leftovers, ratings and weather. |
| **Get a shopping list** (Palengke) | What to buy, how much, and a price range, using government market prices. |
| **Post your own deals** (Alok) | Combo meals, stamp cards for regulars (Suki), and timed offers (Oras). Only your stall can offer them. |
| **Mark Sale or Naubos** | Discount the last plates or show that a dish is sold out. |
| **Show your best dishes** (Paborito) | Highlight up to three signature dishes before ratings come in. |
| **Report fake ratings** (Ulat) | Flag a suspicious burst of ratings so it is reviewed. |
| **Prepare for typhoons** (Bagyo Mode) | Cooking and shopping shrink when a storm is coming. The Bagyo Fund screen is only a simulation of how a weather payout could work; it is not insurance. |
| **Keep working with weak signal** | Taps and ratings are saved on the phone and sent when the signal returns. |

### Buyers

| What | How it helps |
|---|---|
| **Scan the stall QR and rate** | Two taps and a face. No account. One rating per dish per day. |
| **Browse the Ulam board** | Dishes with their scores and prices, with ribbons for Sulit (worth it), Sale, Naubos and Alok deals. |
| **Filter by budget** | Choose ₱50, ₱70 or ₱100 and see only what fits. |
| **Claim a stall's deal** | Show the screen at the stall. No payment in the app. |

### Built-in fairness rules

- Negative feedback goes to the owner first, privately.
- A public score appears only after at least 10 ratings from at least 5 different people (our starting assumption, to be tested).
- Ratings count over the last 30 days only.
- No public lists of worst dishes. The owner chooses what to publish.
- A deal can never be tied to a rating, and paying for a deal cannot buy a higher rank.

## 5. A day with KapyBa

1. **Morning.** Aling Rosa opens KapyBa. Bukas says to cook a little less sinigang, because it was left over three days running and its ratings say "too salty". She cooks less and uses less salt.
2. **Lunch.** A student scans the QR at the stall, sees adobo is the best dish for ₱70, and later rates it with a happy face in two taps.
3. **Afternoon.** Tinola is not moving, so Aling Rosa posts a timed deal (Oras) for the last hour. Buyers see the Alok ribbon on the board.
4. **Evening.** She taps what is left over. The app shows the pesos lost shrinking week by week, and builds tomorrow's palengke list.

## 6. Where the project is now

- **Done:** the idea, research, requirements, designer brief, a clickable mock, and the execution plan.
- **Started:** the app foundation (a working web app skeleton with automatic checks). The real features are not built yet.
- **Next:** the units in `docs/PLAN.md`, leading to a first real rating from a second phone, then a 3-stall pilot.
- **Not claimed:** KapyBa does not sell or provide insurance, take payments, or run deliveries. Several numbers (such as the 10-rating minimum) are assumptions we will test.

## 7. Read more

| Doc | What it is |
|---|---|
| `docs/IDEA.md` | The idea, rules, scrutiny, SDGs |
| `docs/BRIEF.md` (`brief.html`) | Problems, competitors, why it can win |
| `docs/PRD.md` | Requirements |
| `docs/UX.md` | Designer hand-off: screens, tokens, icons |
| `docs/PLAN.md` | Technical stack, work units, launch checklist |
| `docs/adr/001-decisions.md` | Decisions made and still open |
| `docs/PRIVACY.md`, `docs/RUNBOOK.md` | Privacy notice draft, operations guide |
| `docs/research/` | Sources |

## For developers

```
npm install
npm run dev      # http://localhost:3000
npm run gate     # typecheck, lint, unit tests, end-to-end smoke test
```

`.env.example` lists the setting names; real values are never committed. `agent-workflow/` is local and ignored. Branch per task, human review before merge.
