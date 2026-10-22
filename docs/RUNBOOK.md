# KapyBa runbook

For whoever is on call during the pilot. Fill in the TODOs when accounts exist (decision D1c in `docs/adr/001-decisions.md`). Never paste secrets into issues, chat or commits.

## Where things live

| Thing | Where |
|---|---|
| App | Vercel project `kapyba` (TODO URL) |
| Database | Neon project `kapyba`; branch `main` is production |
| Errors | Sentry project `kapyba` |
| Health | `GET /api/health` returns `{ ok: true, db: true, version }` |
| Secrets | Vercel and Neon settings only. Names are in `.env.example` |

## Deploy

1. Merge a reviewed PR to `main`. CI runs `npm run gate`.
2. Vercel deploys. Migrations run as a pre-deploy step; check the log.
3. Run `node scripts/smoke.mjs <url>`: health, owner sign-in page, a buyer page for a test stall.
4. Watch Sentry for 15 minutes.

## Roll back

1. In Vercel, promote the previous deployment (target: under 10 minutes).
2. If a migration caused it, follow that migration's down-plan in its PR. Do not edit production data by hand without a backup branch.
3. Post what happened in the team channel.

## Back up and restore

- Neon keeps point-in-time history. Before risky changes, create a branch from `main` as a restore point.
- Restore drill (do once before the pilot): create a branch from a past timestamp, run `scripts/smoke.mjs` against an app pointed at it, and record the result here.

## Rotate a secret

1. Create the new value in the provider.
2. Set it in Vercel for production and redeploy.
3. Revoke the old value. Rotating the QR signing secret invalidates open scan tokens; buyers rescan, which is fine.

## Take down a bad stall or dish

1. Set `dishes.published = false` for the stall's dishes, or set `archived_at` for the stall.
2. Add an `events` row stating who, when and why.
3. Tell the owner.

## Ulat reports (until the reviewer UI exists)

1. List reports with status `open`, oldest first. Target: decide within 24 hours.
2. Review the ratings in the window: count, distinct devices, timing.
3. Uphold: mark the ratings `removed`. Reject: mark them `ok`. Set the report status, add a note, and write an `events` row.

## Incidents

| Symptom | First check |
|---|---|
| Ratings not saving | `/api/health`, Neon status, Sentry for 5xx |
| Duplicate counts | Idempotency key and unique rating key; look for a failed migration |
| Buyers cannot rate | QR token expiry, signing secret changed, clock skew |
| Owner sees nothing | Auth provider status, owner-to-stall link |
| App stuck on an old version | Service worker cache version; bump and redeploy |
