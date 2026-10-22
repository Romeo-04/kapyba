# ADR 001: stack and open decisions

Status: proposed. Items marked **open** need a human answer before the unit that depends on them starts. Update this file when answered; do not delete the old text.

## Decided (by the team, in the pivot conversation)

| Decision | Choice |
|---|---|
| Product shape | Dish-rating platform with an owner loop (`IDEA.md`) |
| Bagyo Fund | Simulation only; no insurance wording (RA 10607) |
| Alok | Owner-only; never tied to ratings; cannot buy rank |
| Compare vs guess | Compare automatically; no guess quiz |

## Proposed (my calls, change if you disagree)

| Decision | Choice | Why | Cost of changing later |
|---|---|---|---|
| App framework | Next.js App Router, TypeScript, PWA | One codebase; QR links open in the browser | High after Phase 1 |
| Database | Postgres on Neon, Drizzle | Managed, branchable | Medium |
| Hosting | Vercel | Preview per PR, instant rollback | Low |
| Buyer identity | Device token in a cookie, bound to the QR scan | Keeps two-tap rating; one per day needs some identity | Medium |
| Weather | Open-Meteo plus manual Bagyo switch | PAGASA has no open API | Low |
| Prices | Bundled file refreshed by script and PR | Reviewable, no scraping in production | Low |
| Public score gate | 10 ratings from 5 or more devices in 30 days | Assumption, tune with pilot data | Low |

## Answered (2026-10-22: the user said to always choose the recommended answer)

| # | Question | Decision |
|---|---|---|
| D1a | Owner sign-in | Email magic link for the pilot; add phone OTP if owners struggle |
| D1b | Who reviews Ulat reports | The team during the pilot, within 24 hours, every decision logged |
| D1c | Hosting accounts | A shared organisation with two owners. The accounts themselves still have to be created by a human |
| D2 | Receipt or slip code | QR only for the pilot; add a code if abuse appears |
| D4 | Score publication default | Opt-in per dish |

## Still open

| # | Question | Needed by |
|---|---|---|
| D3 | Pilot school and three stalls (needs interviews and a school contact) | Pilot |
| D5 | Contact email for `PRIVACY.md` | Before launch |

## Problem validation (2026-10-22)

Full write-up: `docs/research/PROBLEM-VALIDATION.md`. What it changes for us:

- The problem is real and costly (sourced; food-waste cost is 22–45 times the planned price), but the local-only market is too small for a subscription-led venture. Do not claim venture scale.
- The 4–10% unsold-food figure is an Indonesian proxy. Any pitch must label it as such. We have no Philippine figure; the pilot's leftover pesos per day is the first one.
- Search-trend evidence failed (only Wikipedia views, down 39–43%). Re-run with a real keyword tool before claiming demand growth.
- No one has shown a budget for dish-level feedback. The partner who funds access (school, LGU or DTI) is unverified, so the owner interviews must find a named role with discretionary spend.
- Product consequence: keep the owner plan optional and secondary. Revenue paths to test later are partner-funded site contracts, or a transaction-linked layer such as Alok. Neither is built or priced.
