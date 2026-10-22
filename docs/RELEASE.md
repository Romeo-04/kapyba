# Release checklist

Everything the code needs is built and tested. These steps need a person with accounts. Tick each one and note who and when. Never paste a secret into an issue, chat or commit.

## 1. Accounts (D1)

- [ ] Neon project and a `main` branch. Record the org and region.
- [ ] Vercel project connected to the repo.
- [ ] Sentry project (optional until a hook is added in `instrumentation.ts`).
- [ ] Email sender for sign-in links (Resend, with a verified sending address).

## 2. Environment variables (names are in `.env.example`)

| Name | Where it comes from |
|---|---|
| `DATABASE_URL` | Neon connection string |
| `AUTH_SECRET` | any long random string; rotating it signs every owner out |
| `QR_SIGNING_SECRET` | 16+ random characters; rotating it makes open scan tokens expire (buyers rescan) |
| `RESEND_API_KEY`, `MAIL_FROM` | the email provider (needs a verified domain); production refuses to start sign-in without mail settings |
| `SMTP_USER`, `SMTP_PASS` | Gmail instead, no domain needed: the Gmail address and a 16-character app password (Google Account, Security, 2-Step Verification, App passwords) |
| `NEXT_PUBLIC_APP_URL` | the live URL |
| `REVIEWER_EMAILS` | who may decide Ulat reports (the team during the pilot) |
| `NEXT_PUBLIC_PRIVACY_EMAIL` | the privacy contact (D5) |
| `CRON_SECRET` | any long random string; without it the daily cleanup job stays off |
| `SENTRY_DSN` | optional |

Never set `ALLOW_PGLITE` in production.

## 3. Database

- [ ] Run the migrations in order against the Neon `main` branch: `npx drizzle-kit migrate` with `DATABASE_URL` set (files in `src/db/migrations`, `0000` to `0005`). They have only ever run in the in-memory test database.
- [ ] Take a Neon restore point first (see the runbook).

## 4. Deploy and check

- [ ] Merge the reviewed PRs to `main` in order; Vercel deploys.
- [ ] `node scripts/smoke.mjs <live url>` prints "all checks passed".
- [ ] Sign in as an owner with a real email, finish Simula, print the QR, rate from a second phone, see it on Ngayon.
- [ ] Confirm the daily job: `curl -H "Authorization: Bearer $CRON_SECRET" <live url>/api/cron/retention` returns `ok`.
- [ ] Practise a rollback once (runbook).

## 5. Before owners see it

- [ ] Pilot school and three stalls chosen (D3); each owner onboarded in person.
- [ ] Privacy contact set and the privacy page read by someone qualified. The wording is ours, not legal advice.
- [ ] The Bagyo Fund copy read by someone qualified (it is a simulation; the app never says insurance, covered or guaranteed).
- [ ] Palengke placeholder prices replaced with the DA price file, or the placeholder notice left visible.
- [ ] Assumptions still unverified, to check against pilot data: the 10-rating and 5-buyer gate, Bukas factors, rain and Bagyo factors, rate limits, Ulat limits, Kumpara's 3-stall minimum, the Sale idea, the Bagyo Fund share.
