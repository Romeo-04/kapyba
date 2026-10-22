# KapyBa privacy notice (draft)

Draft for team and legal review before launch. Applies to the Data Privacy Act of 2012 (RA 10173). Not legal advice; have it reviewed before the pilot.

## What we collect

| Who | Data | Why |
|---|---|---|
| Owner | Email (or phone, if chosen), stall name, area, dishes, prices, daily cooked, sold and leftover counts | Run the service and coaching |
| Buyer | A random device token stored in a cookie, the ratings and tags they submit, the day, deal claims | One rating per dish per day, scores, deal counts |
| Everyone | Error and performance data (Sentry, Vercel); those services handle IP addresses | Keep the service working |

We do not collect buyer names, emails, phone numbers, payment details or precise location. Stall coordinates, if given, are rounded.

## How it is used and shown

- A buyer's individual rating is never shown to the public or linked to a person. The public sees only a dish score after enough ratings.
- Owners see their own dishes' ratings and tags, not buyer tokens.
- Ratings under a report may be reviewed by the reviewer, who sees tokens and timestamps only.
- We do not sell data. Deals (Alok) are never tied to ratings.

## Retention and deletion

- Ratings and logs: kept up to 12 months, then deleted or aggregated.
- Device tokens: deleted after 12 months of inactivity.
- Owners can ask to delete their account and stall by email to the team contact. We delete within 30 days.
- Buyers can clear the cookie; ratings already submitted stay as anonymous aggregates.

## Your rights

Access, correction, deletion, objection, and complaint to the National Privacy Commission.

## Contact

TODO: team contact email (open, D1c in `docs/adr/001-decisions.md`).

## In-app notices

- First sign-in (owner) and first rating (buyer): a one-line notice with a link to this page.
- The Bagyo Fund screen says it is a simulation. KapyBa does not sell or carry insurance.
