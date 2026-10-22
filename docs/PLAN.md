# KapyBa execution plan (v2: real product, deployable end to end)

Replaces the pre-pivot plan (Expo, seeded demo data, no backend). Inputs: `docs/IDEA.md` (what and why), `docs/UX.md` (every screen), `mock/simple.html` (behaviour reference, local only).
Repo: https://github.com/Romeo-04/kapyba.git. Base branch: `main`.

Goal: a stranger can open the URL, set up a stall, post a QR, have real customers rate dishes from their own phones, and see real coaching, with nothing seeded or faked. Marked **(call)** = my choice, change it if you disagree. Marked **(open)** = needs a human decision before the unit starts.

## 0. What "real" means (the definition of done for the product)

1. **Onboarding to first rating with no developer help.** Owner signs in, finishes Simula (UX O0), prints the QR, a buyer scans it on another phone and rates, and the owner sees it on Ngayon within 10 seconds.
2. **No fake numbers.** Scores, counts, tag bars and neighbourhood averages come from stored ratings. Where data is too thin the UI shows Kulang pa, never a placeholder. The mock's placeholder neighbourhood average (`areaOf`) is replaced by a real query or hidden.
3. **Every IDEA.md rule is enforced on the server**, not only in the UI: private-first negatives, public score only at 10 ratings from 5 or more buyers in 30 days, one rating per dish per buyer per day, owner publish switch, Alok never tied to ratings, Ulat review.
4. **Works on a weak connection.** Owner taps and buyer ratings queue offline and sync, without double counting.
5. **Deployed**: production URL, managed database with backups, CI gate on every PR, error tracking, privacy notice, rollback in under 10 minutes.
6. **Bagyo Fund stays a simulation.** The UI never says insurance, covered or guaranteed (RA 10607). A test greps the shipped strings for those words.

## 1. Stack (all calls)

| Layer | Choice | Why |
|---|---|---|
| App | Next.js (App Router) + TypeScript, installable PWA | One codebase, no app-store step, QR links open straight in the browser |
| Database | Postgres on Neon, Drizzle ORM and SQL migrations | Managed, branchable for preview deploys, free tier fits a pilot |
| Hosting | Vercel (app), Neon (db) | Preview URL per PR, instant rollback |
| Owner auth | Email magic link **(open: phone OTP is more natural for owners but costs money per SMS; decide before U4)** | No passwords for tinderas |
| Buyer identity | None to sign up. A random device token in an httpOnly cookie, bound to the stall QR scan | One rating per day needs an identity; accounts would kill the two-tap promise |
| Weather | Open-Meteo forecast API (free, no key), plus a manual owner "Bagyo" switch | PAGASA has no open API; the manual switch is the source of truth on a storm day |
| Prices | Bundled `prices.json` from the DA price monitoring PDF, refreshed by a script and PR | Honest and reviewable; no scraping in production |
| Offline | Service worker plus IndexedDB queue with idempotency keys | Required by IDEA.md |
| Tests | Vitest (engine and API), Playwright (flows), axe (a11y) | |
| Monitoring | Sentry (errors), Vercel Analytics, a `/api/health` check | |

Shared secrets live only in Vercel and Neon env settings. `.env.example` lists names with no values. Nothing secret is committed or printed.

## 2. Architecture

```
app/                    routes (owner: /o/*, buyer: /s/[stallCode], public: /ulam)
app/api/                route handlers (thin: validate, call a service, return JSON)
src/domain/             pure TS, no framework: scoring, integrity, plan, benchmark, recs, alok
src/db/                 schema.ts, migrations/, queries
src/services/           ratings, stalls, dishes, plan, alok, reports (use db + domain)
src/ui/                 tokens, icons (the P dictionary from the mock), components from UX.md
src/offline/            queue, sync, service worker registration
scripts/                pdf-to-prices.mjs, seed-dev.mjs (dev only), smoke.mjs
tests/                  unit, api, e2e
docs/                   IDEA.md, UX.md, PLAN.md, RUNBOOK.md, PRIVACY.md, adr/
```

Rule: `src/domain` imports nothing from Next, the DB or the UI. The mock's `engine.js` and the logic in `simple.html` (`mismatch`, `recsFor`, `tone`, `dealOf`) are ported here as tested functions.

### Data model

| Table | Key columns |
|---|---|
| `owners` | id, email, created_at |
| `stalls` | id, owner_id, name, code (short, unguessable), area (school or barrio), lat/lng (optional, rounded), created_at |
| `dishes` | id, stall_id, name, icon, price, base_servings, category, published (bool), paborito (bool), archived_at |
| `ratings` | id, dish_id, device_id, score (1–5), tags (bitmask: salt, plate, flame, coin), day (date), idempotency_key (unique), status (`ok`, `flagged`, `removed`), created_at. **Unique (dish_id, device_id, day)** |
| `devices` | id, token_hash, first_seen_at (no personal data) |
| `daily_logs` | id, stall_id, dish_id, day, cooked, sold, leftover |
| `alok` | id, stall_id, dish_id, kind (`combo`, `suki`, `oras`), limit, claimed, starts_at, ends_at, closed_at |
| `alok_claims` | id, alok_id, device_id, created_at (counts only; no payments) |
| `reports` (Ulat) | id, stall_id, window_start, window_end, reason, status (`open`, `upheld`, `rejected`), reviewer_note, created_at |
| `events` | append-only audit of owner actions (publish toggle, report filed, alok posted) |

Derived, never stored by hand: dish score, rating count, distinct buyers, tag shares, trend, neighbourhood average. Compute through SQL views or queries and cache for 60 seconds.

### Integrity rules as code (each has a test at its threshold)

- Public score visible only if `count >= 10 AND distinct_devices >= 5` in the last 30 days and `published`. Otherwise return `{ state: 'kulang', have, need }`.
- Insert uses the unique key; a duplicate returns "already rated today" (UX B4), not an error.
- A rating needs a valid stall QR token issued at scan time (HMAC of stall code + device + 12-hour expiry), so a link shared in a group chat cannot flood the stall from far away. **(call)** Add a rate limit per IP and per device.
- `flagged` ratings stay in the owner's private view and leave public aggregates while a report is open.
- Alok write endpoints reject any body that references a rating or score.
- Owner reply and non-Taglish languages are out of scope (IDEA.md section 12).

## 3. Phases and units

One unit = one issue = one branch = one agent = one PR, reviewed by a human before merge. Narrow tests while working; the full gate once at the end: `npm run gate` = typecheck, lint, unit, api, build, e2e smoke. Each new test is shown failing against the old code before the PR opens.

### Phase 0: decisions and foundation (sequential)

| # | Unit | Done when |
|---|---|---|
| D1 | **(open)** Decide owner auth (email vs phone OTP), the rating reviewer for Ulat (team, a partner school, or none in the pilot), and hosting accounts | Answers recorded in `docs/adr/001-decisions.md` |
| U0 | Bootstrap: Next.js, TS, lint, Vitest, Playwright, Drizzle, CI running `npm run gate` on PRs, `.env.example` | Empty app builds and deploys a Vercel preview from a PR |
| U1 | Environments: Neon project with `main` and a branch per preview, Vercel project, Sentry, secrets set | `/api/health` returns ok on preview and production; no secret in git (CI scan passes) |

### Phase 1: core, in parallel (4 units, disjoint files)

| # | Unit | Owns | Done when |
|---|---|---|---|
| U2 | Schema and migrations | `src/db/` | Migrations apply to a clean database and roll forward from the previous one; constraints tested (unique rating per day) |
| U3 | Domain: score ring tone, thresholds (happy 4.0, neutral 3.4, sad below), integrity gate, Pansin, recommendations, Alok rules | `src/domain/` | Ported from the mock; tests at every threshold; Alok rejects rating-linked input |
| U4 | Owner auth and stall setup API | `app/api/auth`, `src/services/stalls` | Sign in, create stall and dishes, unguessable stall code |
| U5 | Design system from `UX.md`: tokens, icon set (mock's `P` dictionary), score ring, dish tile, tag bar, pills, buttons, recommendation card, Alok card, Mascot states | `src/ui/` | A `/dev/ui` page shows every component and state; reduced-motion and touch-target checks pass |

### Phase 2: the loop (parallel after Phase 1 merges)

| # | Unit | Screens (UX.md) | Done when (real behaviour) |
|---|---|---|---|
| U6 | Owner onboarding (Simula) | O0 | A new owner completes six steps and lands on Ngayon with a printable QR; refresh mid-way resumes |
| U7 | Buyer rating | B2, B3, B4, S2 | Scan QR on a second phone, rate in two taps, row appears in Postgres; second rating that day shows B4 |
| U8 | Owner Ngayon and Detail | O1, O2 | Real score, tag bars, trend; Kulang pa progress; publish switch writes and takes effect on the buyer board |
| U9 | Buyer board | B1 | Ulam board lists only stalls and dishes that pass the integrity gate plus Paborito picks, filtered by budget chip and area |
| U10 | Daily log, Natira, Bukas, Palengke | O3, O4, O5 | Owner logs cooked, sold and leftover; Bukas plan uses real logs and ratings; shopping list uses the bundled price file; empty history shows Kulang, not invented numbers |
| U11 | Kumpara and recommendations | O2 | Neighbourhood tick uses a real aggregate across stalls in the same area, shown only when at least 3 stalls qualify; otherwise hidden |
| U12 | Alok | O8, B1 | Owner posts Combo, Suki or Oras with a limit; buyer sees the ribbon and a claim screen; staff mark claimed; Oras expires on time; counts update atomically |
| U13 | Ulat and moderation | O7 | Owner reports a burst; ratings flagged; weekly limit enforced; reviewer view (even a protected admin page) can uphold or reject; audit row written |
| U14 | Bagyo Mode and weather | O1 | Open-Meteo forecast feeds a rain pill; manual Bagyo switch shrinks the plan; Fund screen is clearly a simulation with the banned-words test |
| U15 | Offline queue and sync | S1 | Airplane mode: owner taps and buyer ratings queue; on reconnect they sync once (idempotency key proves no double count) |

Cut order if time runs out: U11 neighbourhood tick (hide it), U14 Fund screen, U12 Suki and Oras (keep Combo), U13 reviewer UI (keep a SQL runbook). Never cut: U2, U3, U6, U7, U8, U9, U15, the integrity gate.

### Phase 3: harden and ship

| # | Unit | Done when |
|---|---|---|
| U16 | Security pass: authz on every owner route (an owner cannot read or write another stall), input validation, rate limits, cookie flags, CSRF, dependency audit | A test per route proves another owner gets 403; no high advisories |
| U17 | Privacy and legal: `docs/PRIVACY.md` and an in-app notice (Data Privacy Act, RA 10173): device token only, no names, retention 12 months, deletion by email; Alok and Bagyo wording reviewed against FTC and Google incentivised-review guidance and RA 10607 | Notice shown at first rating and first sign-in; banned-words test green |
| U18 | Accessibility and copy: Taglish strings file, screen-reader labels, contrast, reduced motion, 44px targets, icon-comprehension test run with 5 owners (UX.md section 1) | Checklist ticked; findings fixed or logged |
| U19 | Performance: buyer board and rating page under 150 KB JS on first load, usable on throttled 3G, Lighthouse PWA and a11y at least 90 on a mid-range Android profile | Report attached to the PR |
| U20 | Observability and ops: Sentry release tagging, uptime ping on `/api/health`, structured logs, Neon backups verified by a restore into a branch, `docs/RUNBOOK.md` (deploy, rollback, restore, rotate secrets, take down a bad stall) | Restore drill done once and written down |
| U21 | End-to-end suite on the deployed preview: owner signs up, creates dishes, buyer on a second browser context rates, owner sees it; duplicate rating, offline sync, Alok claim, Ulat flow | Runs in CI against the preview URL, green twice in a row |
| U22 | Fresh-eyes review of each phase's diff (opus) | Ranked findings, material ones fixed |
| U23 | Production release: custom domain (optional), env promoted, migration run, smoke script, rollback tested | Live URL, checklist in section 5 signed |

## 4. Milestones

| Milestone | Contains | Exit check |
|---|---|---|
| M0 | D1, U0, U1 | Preview deploys from a PR; health check green |
| M1 | U2–U5 | Rules proven by tests; design system page reviewed |
| M2 | U6–U10 | **First real rating from a second phone, end to end** |
| M3 | U11–U15 | Full loop incl. Alok, Ulat, Bagyo, offline, on a preview |
| M4 | U16–U21 | Security, privacy, performance and e2e gates green |
| M5 | U22–U23 | Production live; pilot starts |

## 5. Deployment readiness checklist (all must be true before pilot)

- [ ] `npm run gate` green on `main`; deploys only from `main`; previews per PR.
- [ ] Migrations run automatically and are reversible or have a written down-plan.
- [ ] Production env set: database URL, auth secret, QR HMAC secret, Sentry DSN. None in git history (scan run).
- [ ] Backup restored into a branch and verified.
- [ ] Rollback: previous Vercel deployment promoted in under 10 minutes; tested once.
- [ ] Rate limits and cookie flags verified on the production domain over HTTPS.
- [ ] Privacy notice live; deletion path works.
- [ ] Banned-words test (insurance, covered, guaranteed) green; Alok has no rating link.
- [ ] A real phone, on mobile data, completes: sign in, setup, print QR, rate from a second phone, see result, go offline and sync.
- [ ] Error alerts reach a named person; someone owns the pager during the pilot.
- [ ] Seed or demo data absent from production (a script refuses to run against it).

## 6. Pilot rollout (after M5)

3 stalls around one school, 2 weeks, as in IDEA.md section 13. Team members onboard each owner in person and print the QR. Track per stall: ratings per day, distinct buyers, leftover pesos before and after, owner still using on day 14, reports filed. Review weekly and decide whether to widen. The SDG measures in IDEA.md section 15 come from these numbers.

## 7. Working method

- `agent-workflow/` stays local and git-ignored. Never `git add -f` it. Do not commit `mock/simple.html`.
- Models: scouts haiku (read-only), implementers sonnet, reviewers and design calls opus. State the model in every brief.
- The coordinator opens an issue per unit (scope, out of scope, undo steps), spawns the agent in its own worktree off `main`, and checks the report against the branch (diff, checks, files) before telling the team anything shipped.
- Branches: `feat/u7-buyer-rating`, `chore/u0-bootstrap`. Commit prefixes `feat:`, `fix:`, `docs:`, `chore:`. No attribution trailers. Do not force-push; do not merge without human review.
- UI PRs attach a screenshot or a test recording. Shared files (`app/layout`, schema, tab bar) are changed by one unit at a time.

## 8. Team mapping

| Person | Units |
|---|---|
| 1 Data and ops | U1, U2, U10 prices, U20, U23 |
| 2 App screens and mascot | U5, U6–U9, U12, U18 |
| 3 Domain, integrity, backend | U3, U4, U11, U13, U14, U15, U16 |
| 4 Pitch, interviews, pilot | D1, U17 review, U18 icon test, section 6 |

Agents build; humans own the decisions marked (open), every review and the pilot.

## 9. Risks

| Risk | Mitigation |
|---|---|
| Fake or friend-driven ratings | QR-bound token, device and IP limits, 5-buyer minimum, Ulat; the reviewer role is the weakest link (D1) |
| Too few ratings to show anything | Paborito and Kulang pa states; 3-stall pilot in one place; owners prompt at the counter |
| Owners will not print or place a QR | Print-ready PDF in setup, plus a sticker run funded by the team (cost in IDEA.md section 9) |
| Owner phone data is thin or offline | Offline queue (U15); owner flows need only taps |
| Neighbourhood average has no data | Hidden until 3 stalls qualify (U11) |
| Legal wording on the fund or deals | U17 review; banned-words test; Fund stays a simulation |
| Free-tier limits or an outage during the pilot | Health alerts, backups, a runbook, and a static "paused" page |
| Scope too large for the time | Cut order in section 3; never cut the integrity gate or offline sync |

## 10. First actions

1. Human: answer D1 (owner sign-in method, Ulat reviewer, hosting accounts).
2. Human: confirm the stack in section 1, or say what to change.
3. Coordinator: open issues for D1, U0 and U1, then spawn U0.
4. Human: book three owner interviews and one school contact now; U6 and U13 depend on what they say.

## 11. Alignment with other docs

`IDEA.md` and `UX.md` are the source of truth for the product. `PRD.md` (v2) holds the requirements this plan builds, `docs/adr/001-decisions.md` tracks open decisions, and `PRIVACY.md` and `RUNBOOK.md` are drafts to finish before the pilot (U17, U20).
