# KapyBa execution plan

Follows the local agent workflow (`agent-workflow/WORKFLOW.md`, not committed). Inputs: `docs/PRD.md`, `docs/UX.md`.
Repo: https://github.com/Romeo-04/kapyba.git (empty at planning time). Base branch: `main`.

## 0. Ground rules

- One unit = one issue = one branch = one worktree = one agent = one PR. A human reviews before every merge.
- `agent-workflow/` stays local and is listed in `.gitignore`. Never `git add -f` it.
- Models: scout = haiku (read-only), implementer = sonnet, reviewer and design calls = opus. State the model in every brief.
- Narrow tests while working, full gate once at the end: `npm run gate` = `tsc --noEmit && lint && jest && expo export --platform web`.
- Art comes from the connected Codex account. Asset PRs carry the prompts used and the license note.
- Engine code (`src/engine`) imports nothing from React or Expo. UI imports engine, never the reverse.

## 1. Target layout

```
app/                 Expo Router screens (S1–S17)
src/engine/          forecast, plan, costRange, alerts, bagyo (pure TS, unit-tested)
src/data/            prices.json, seed (dishes, recipes, ingredients, sales)
src/store/           AsyncStorage wrapper and hooks
src/ui/              tokens, Mascot, Button, Card, Chip, ListRow, RangeBar, charts
assets/mascot/       capybara poses
assets/art/          intro, dishes, ingredients, bagyo
scripts/             pdf-to-prices.mjs (one-time)
public/              manifest, service worker, icons
docs/                UX.md, PRD.md, PLAN.md, adr/
```

## 2. Phases and units

Each unit lists files owned (no other unit edits them), model, and done-when. Units in the same wave run in parallel.

### Wave 0: foundation (sequential, coordinator plus one agent)

| # | Unit | Model | Done when |
|---|---|---|---|
| U0 | Repo bootstrap: Expo + TS + Router, `AGENTS.md` from template, `.gitignore`, CI gate, `npm run gate` passes on an empty screen | sonnet | PR open, web export builds |
| U1 | Web feasibility spike (throwaway, labeled): drag-reorder list, SVG sparkline, AsyncStorage, service worker offline all work on the web build | sonnet | Report states which libs work on web; decision recorded in `docs/adr/001-web-libs.md` |

Open issues for all later units before starting Wave 1.

### Wave 1: independent building blocks (parallel, 4 agents)

| # | Unit | Owns | Model | Done when |
|---|---|---|---|---|
| U2 | Engine: `plan`, `costRange` from the PDF, with tests reproducing the PDF numbers | `src/engine/plan.ts`, `costRange.ts` | sonnet | Tests fail when code reverted, pass otherwise |
| U3 | Engine: forecast (calendar, weather factor 0.38 example, perishability, moving average, error band) | `src/engine/forecast.ts`, `bagyo.ts` | sonnet | 0.8×0.3+0.2×0.7 → 0.38; 150 → about 57 |
| U4 | Price data: `scripts/pdf-to-prices.mjs`, bundled `prices.json` for 2–3 weeks, hand-encoded fallback | `scripts/`, `src/data/prices.json` | sonnet | Schema validated, covers NCR markets near UST |
| U5 | Design system: tokens, fonts, Button, Card, Chip, ListRow, RangeBar, TabBar, Mascot component with all 8 states (placeholder art until U6) | `src/ui/` | sonnet | Storybook-style `/dev/ui` page screenshot attached |

### Wave 2: art and data seed (parallel)

| # | Unit | Owns | Model | Done when |
|---|---|---|---|---|
| U6 | Art A: capybara character sheet (approve first), then 8 poses, splash hero, PWA icon | `assets/mascot/`, `public/icons/` | codex image | Human approves sheet before poses are made |
| U7 | Art B: 3 intro slides, 6 dish avatars, about 30 ingredient icons, 3 Bagyo heroes | `assets/art/` | codex image | Style matches the sheet, no baked text, transparent where needed |
| U8 | Seed data: Aling Rosa store, 6 dishes with recipes, ingredients with buy units and sections, 30 days of sales, school calendar | `src/data/seed/` | sonnet | Loads in tests, covers all four day types |
| U9 | Alerts engine: spike, margin, substitute, budget fit | `src/engine/alerts.ts` | sonnet | Each rule tested at its threshold |

Art units need only the PRD asset table, so they start as soon as U5 tokens land.

### Wave 3: screens (parallel after Waves 1–2 merge; each owns its route files)

| # | Unit | Screens | Notes |
|---|---|---|---|
| U10 | Onboarding | S1, S2, S3 | Splash, store setup, intro carousel |
| U11 | Dish setup | S4, S5 | Drag ranking, tags, recipes, usual sales |
| U12 | Palengke list (priority) | S7, S14, S8 | Cost range card, sections, shop mode, budget fit, item detail |
| U13 | Home and alerts | S6, S12 | Status carousel, time-of-day primary button |
| U14 | Bagyo Mode | S13 | Manual level switch, shrink animation, Bagyo Fund simulated |
| U15 | Logging | S10, S11, S16 | Spend, leftovers, celebration |
| U16 | Dashboard and prices | S15, S9 | Charts, seeded history |

Shared files (`app/_layout.tsx`, tab bar, store hooks) are owned by U0 and changed only by the coordinator.
If two units must edit one file, run them one after the other.

### Wave 4: finish

| # | Unit | Model | Done when |
|---|---|---|---|
| U17 | PWA: manifest, service worker, versioned cache, install prompt, offline test | sonnet | Airplane-mode load works on a phone |
| U18 | Copy and a11y pass: Taglish strings file, screen-reader labels, contrast check, reduced motion | sonnet | Checklist in `UX.md` section 7 ticked |
| U19 | Demo flow: Playwright script for the 4-step pitch demo, screen recording, backup video | sonnet | Runs offline start to finish in 2.5 minutes |
| U20 | Fresh-eyes review of each wave's diff | opus | Findings ranked, material ones fixed |
| U21 | Docs: README, ADRs, deploy to Vercel or Netlify, demo script | sonnet | Live URL, docs match code |

## 3. Milestones

| Milestone | Contains | Exit check |
|---|---|---|
| M0 | U0, U1 | Gate green, web libs decided |
| M1 | U2–U5 | PDF examples reproduced by tests |
| M2 | U6–U9 | Art approved, seed loads |
| M3 | U10–U16 | Full daily loop clickable on web |
| M4 | U17–U21 | Offline demo, recording, deployed URL |

If time runs short, cut in this order: U16 charts to static tiles, Bagyo Fund, substitute alert, U9 budget fit polish.
Never cut: U2, U3, U12, U14 (the demo depends on them).

## 4. Team mapping (from the PDF)

| Person | Units |
|---|---|
| 1 Price data and alerts | U4, U9 |
| 2 App screens and mascot | U5, U6, U7, U10–U13, U15, U16 |
| 3 Engine, cost range, Bagyo | U2, U3, U14 logic |
| 4 Pitch, interview, rehearsal | Interview results into U8 and copy (U18), U19 |

Agents do the building. Humans own review, approvals and the interview.

## 5. Briefs and issues

For each unit, the coordinator:
1. Opens a GitHub issue (scope, out of scope, how to undo) and assigns the owner.
2. Fills `agent-workflow/templates/brief.md` with the issue number, files owned, model and the PRD or UX sections to read.
3. Spawns the agent with `isolation: "worktree"`, base `main`, and explicit `model`.
4. Checks the report against the branch (diff, checks, files touched) before telling the team anything shipped.

Branch names: `feat/u12-palengke-list`, `chore/u0-bootstrap`. Commit prefixes: `feat:`, `fix:`, `docs:`, `chore:`.
PR bodies from `templates/pr-body.md`. UI PRs attach a screenshot or test-run recording. Do not force-push.

## 6. Verification

- Engine: unit tests mirror the PDF numbers (weather factor, cost range, plan rounding).
- Screens: component tests per state (loading, empty, offline, error).
- Flow: one Playwright run of the demo script on the web build.
- Manual: install the PWA on a real Android phone, airplane mode, run the evening and morning flows.
- Each new test is proven to fail against the old code before the PR opens.

## 7. Risks to watch (from PRD)

Chart or drag library failing on web (U1), DA PDF parsing (U4 fallback), art drift (U6 sheet first),
stale service-worker cache (U17), forecast looking arbitrary (always show range plus "why").

## 8. First actions

1. Human: approve `docs/UX.md` and `docs/PRD.md` (or list changes).
2. Human: say when to commit and push the docs. Nothing has been committed or pushed yet.
3. Coordinator: open issues U0 and U1, spawn U0, then U1.
4. Human: send one teammate to interview an owner. Feed answers into U8 and copy.
