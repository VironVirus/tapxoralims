# Tapxora LIMS Backup and Restore Runbook

This runbook should be completed before public launch. It covers Supabase PostgreSQL data, file assets referenced by the app, and the operational restore drill.

## Backup Strategy

- Enable Supabase automated backups before onboarding live laboratories. Use a paid Supabase plan that includes scheduled backups and point-in-time recovery if the lab will store production patient data.
- Run a manual backup before every schema change, major deployment, or bulk data import.
- Keep at least one encrypted off-platform backup copy controlled by the business owner or system administrator.
- Test restore procedures monthly. A backup that has never been restored is only a hope, not a recovery plan.

## What Must Be Backed Up

- Supabase PostgreSQL database: patients, tests, orders, results, invoices, inventory, users/profiles, QC logs, audit logs, and branding settings.
- Supabase Auth users: included in managed Supabase backups, but exports should be handled carefully because they contain sensitive identity data.
- Supabase Storage buckets if used for report logos or uploaded assets.
- Netlify environment variable names, not secret values in public documentation.
- Current `supabase/schema.sql` and application release commit SHA.

## Supabase Scheduled Backups

1. Open the Supabase project dashboard.
2. Go to `Project Settings` then `Database`.
3. Review the `Backups` section.
4. Upgrade the project if scheduled backups or point-in-time recovery are not available on the current plan.
5. Confirm the backup schedule, retention period, and restore options.
6. Record the backup owner, restore approver, and emergency contact in your internal operations notes.

Recommended launch policy:

- Daily automated backups for production.
- Manual backup immediately before running a new schema.
- Monthly restore drill into a separate staging Supabase project.
- Immediate backup after a successful large migration.

## Manual Backup With Supabase CLI

Install the Supabase CLI locally if it is not already installed:

```bash
npm install --save-dev supabase
```

Log in and dump the database:

```bash
npx supabase login
npx supabase db dump --project-id YOUR_PROJECT_ID --file backups/tapxora-lims-YYYY-MM-DD.sql
```

Do not commit backup files to GitHub. Store them in a secure encrypted location.

## Manual Backup With `pg_dump`

If using direct database credentials:

```bash
pg_dump "postgresql://postgres:YOUR_PASSWORD@YOUR_HOST:5432/postgres" --format=custom --file=tapxora-lims-YYYY-MM-DD.dump
```

Use a secure terminal and avoid pasting production passwords into shared chat or public logs.

## Restore Drill

1. Create a separate staging Supabase project.
2. Restore the backup into staging, not production.
3. Set staging environment variables in a local `.env.local` or Netlify preview site.
4. Confirm login, patient search, test request creation, result entry, verification, report PDF, billing, inventory, and QC logs.
5. Record the restore date, backup file used, who performed it, and any issues found.

Supabase CLI restore example:

```bash
psql "postgresql://postgres:STAGING_PASSWORD@STAGING_HOST:5432/postgres" < backups/tapxora-lims-YYYY-MM-DD.sql
```

For `pg_dump --format=custom` backups:

```bash
pg_restore --clean --if-exists --no-owner --dbname="postgresql://postgres:STAGING_PASSWORD@STAGING_HOST:5432/postgres" tapxora-lims-YYYY-MM-DD.dump
```

## Production Restore Rules

- Do not restore production while users are actively entering data unless downtime has been announced.
- Take a final emergency backup before any destructive restore.
- Restore into staging first whenever possible.
- After restore, verify RLS policies, admin user access, report branding, result verification RPC, and invoice totals.
- Keep an incident note describing what happened, what was restored, and the exact time range affected.

## Security Notes

- Backup files contain patient and financial records. Treat them as confidential medical data.
- Never upload backups into GitHub, WhatsApp groups, public Google Drive folders, or unencrypted email.
- Limit backup access to trusted administrators only.
- Rotate database credentials if a backup or connection string is exposed.
