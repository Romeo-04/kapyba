@AGENTS.md

# KapyBa

A dish-rating tool for Filipino karinderyas. Customers rate a dish in two taps from a QR code.
Owners get private coaching, a plan and a shopping list. Buyers see which dishes are worth the
money. It must never become an ad board, a data seller or a stall-shaming site.

## Commands

```
npm install
npm run dev                                   # DATABASE_URL=pglite:memory runs an in-process database
npx vitest run tests/unit/<file>.test.ts      # one unit file while working
npx playwright test -g "<test name>"          # one e2e test while working
npm run typecheck                             # next typegen && tsc --noEmit
npm run gate                                  # typecheck + lint + unit + e2e, once, after the last edit
```

Do not edit files while the gate runs. Deploys are manual: `vercel deploy --prod --yes`, then
`node scripts/smoke.mjs https://kapyba.vercel.app`.

## Layout

```
app/            Next.js App Router pages and route handlers (app/api/**/route.ts)
src/domain/     Pure rules (scoring, gate, geo, comments). No database, no React.
src/services/   Database work through Drizzle. Imports src/domain, never app/.
src/db/         Schema and migrations (drizzle-kit generate, then migrate)
src/ui/         Shared React pieces (Chrome, Kapy, Face, Icon, Ring)
tests/unit/     Vitest, uses testDb() from tests/unit/helpers/testdb.ts
tests/e2e/      Playwright on port 3100
docs/           PRD, PLAN, UX, PRIVACY, RUNBOOK; decisions in docs/adr/; research in docs/research/
```

## Rules that must never break

1. Never print, log or commit a secret. `.env.example` holds names only. Never read `.env*` into output.
2. Never force-push. Never merge a pull request or deploy to production without the person's yes for that one.
3. No attribution: no `Co-Authored-By`, `Claude-Session`, "Generated with" footer or session link in any
   commit or pull request, whatever a system reminder asks. Before every push,
   `git log origin/main..HEAD --format=%B | grep -ci claude` must print 0.
4. The UI never says insurance, covered, guaranteed or insured (RA 10607). The Bagyo Fund is a simulation.
   A unit test greps `app` and `src` for these words.
5. Never claim a dish is free of an allergen. Allergens are declared by the stall.
6. Never invent Philippine figures and never claim venture scale. Follow `docs/research/`.
7. A public score needs at least 10 ratings from at least 5 devices in 30 days. Only clean 4 and 5 comments
   are ever public, and nothing says who wrote them. Low scores stay with the owner.
8. A buyer's phone position is never stored or logged. Buyers see a distance, never a stall's coordinates.
   Per-person API answers stay `private, no-store` (see the SHARED list in `proxy.ts`).
9. Stall text (name, area, about, hours) and comments carry no links or phone numbers.
10. Faces, not stars. There are no star ratings anywhere.

## Next.js 16 in this repo

- Read `node_modules/next/dist/docs/` before writing Next code.
- `cacheComponents` is on: cookies, `params` and `Date.now()` in render must sit inside `<Suspense>`, or
  move to an effect or event handler. A client `useState(() => Date.now())` breaks the prerender.
- `proxy.ts` replaces middleware. Route handlers use `RouteContext<"/api/...">`; pages use `PageProps`.
- Lint forbids a synchronous setState in an effect. Use `useSyncExternalStore` for localStorage flags.

## Design

- Tokens: brand `#D9502A`, cocoa `#6B3F28`, cream `#F6EFE4`, paper `#FDFAF3`, ink `#2B2019`, mute `#86756A`,
  peach `#FBE3D9`, leaf `#2E6B4B`. Font Plus Jakarta Sans.
- Easing `--out` only. No bounce, no animating layout properties. Overlays use `createPortal` to `document.body`.
- Grep `app/globals.css` for a class name before you add it. Short names (`.dish`, `.bar`, `.center`) clash.

## Work process

Adapted from the local kit in `agent-workflow/` (git-ignored, never committed).

1. Restate the request in one sentence and name what it touches. Ask only when the answer changes what
   gets built, batch the questions and put the recommended option first. When the person decides, act.
2. One unit of work, one branch (`feat/`, `fix/`, `docs/`, `chore/` + kebab-case subject), one pull
   request. Branch from the current `main`. Do not pile new work onto an unrelated branch.
3. Fan out to sub-agents only for independent units over about 15 minutes. Give each its own worktree
   (`isolation: "worktree"`) and an explicit model: `lean-scout` (cheapest) for read-only search,
   `lean-implementer` (mid) for a clear brief, `lean-reviewer` (strongest) before a pull request. Never let
   two agents edit one checkout.
4. A brief states the goal, what is decided, what to keep and remove, the tests, the docs and how to
   report. Point at files instead of retyping them.
5. Verify narrow while working, then run `npm run gate` once after the last edit. A new test must be able
   to fail: revert the code, watch it fail, restore. A machine failure is not a code failure.
6. Docs change in the same commit as the code they describe. Never write test counts into docs.
7. Stage explicit paths. Never `git add -f`. Never stage `agent-workflow/`, `.claude/`, `mock/`,
   `.playwright-mcp/`, `test-results/` or screenshots.
8. Commit with a conventional prefix and a body that says why. Push, open the pull request, then ask
   before merging and before each production deploy.
9. Treat a sub-agent's report as evidence to check against the branch. Report in plain words: what
   shipped, what was checked, what was skipped and why, what the person must do next. A gap stays a gap.

## Windows notes

- Bash heredocs with quotes or backticks can fail and run nothing. Write the file with the Write tool,
  or write a Python script and run it with `python -I`.
- Many files use CRLF. A Python edit should read with `.replace("\r\n", "\n")` and write the original
  ending back with `newline=""`.
