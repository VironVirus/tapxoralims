# LIMS Nigeria

Offline-first Laboratory Information Management System for Nigerian labs, built with `Next.js 15`, `Supabase`, `Dexie`, `TanStack Query`, `Zod`, and PWA support.

## Stack

- `Next.js 15` App Router + TypeScript
- `Tailwind CSS` + custom `shadcn/ui`-style components
- `Supabase` Auth + PostgreSQL + RLS
- `Dexie.js` for IndexedDB offline cache
- `TanStack Query` for server/local data orchestration
- `@react-pdf/renderer` for receipts and reports
- PWA assets with service worker, manifest, and offline fallback
- Netlify-ready deployment

## Prerequisites

- Node.js 20+
- npm 10+
- Supabase project

## Environment Variables

Create `.env.local` from `.env.example` and set:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_PROJECT_ID=YOUR_PROJECT_ID
```

## Install

```bash
npm install
```

## Supabase Setup

1. Open the Supabase SQL editor.
2. Run [`supabase/schema.sql`](/C:/Users/user/Desktop/lab/supabase/schema.sql).
3. In Authentication:
   - Enable `Email` sign-in.
   - Enable magic links.
   - Set the site URL for local and Netlify usage.
4. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3068/auth/callback`
   - `https://YOUR_NETLIFY_SITE.netlify.app/auth/callback`
5. Create the first user account.
6. Promote that user to `Admin` in Supabase if needed.

Example role update:

```sql
update public.profiles
set role = 'Admin'
where id = 'YOUR_USER_UUID';
```

## Generate Supabase Types

If the Supabase CLI is installed:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID --schema public > types/supabase.ts
```

Project helper:

```bash
npm run supabase:types
```

## Run Locally

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Verification

Run the project typecheck:

```bash
npm run typecheck
```

The current project passes `npm run typecheck`.

## Offline Support

The app includes:

- IndexedDB mirroring for core Supabase tables
- queued offline mutations
- retry/sync when the device is back online
- conflict tracking for critical records
- service worker and offline fallback page
- installable manifest for PWA behavior

Admin users can review sync state from the admin dashboard.

## Core Modules Included

- Authentication and role-aware navigation
- Patient management with NDPR consent capture
- Test catalogue management
- Orders and sample tracking
- Results entry and verification
- Professional report generation
- Inventory management
- Billing and receipts
- Dashboards
- Full audit log viewer

## Netlify Deployment

Recommended Netlify settings:

- Build command: `npm run build`
- Publish directory: `.next`

Set these environment variables in Netlify:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_PROJECT_ID`

If you use Netlify’s Next.js runtime, keep the project as a standard Next.js app and let Netlify detect it automatically.

## Important Post-Update Step

If your Supabase project was created before the latest patient-consent polish, rerun [`supabase/schema.sql`](/C:/Users/user/Desktop/lab/supabase/schema.sql) so these fields exist:

- `patients.ndpr_consent`
- `patients.ndpr_consent_at`

This is required for the patient registration form and patient history view to work correctly.

## Security Notes

- RLS is enabled across the main operational tables.
- Facility-scoped access is enforced in SQL policies.
- Role changes remain restricted to administrators.
- Audit logs capture key operational changes.

## Useful Commands

```bash
npm run dev
npm run build
npm run start
npm run typecheck
npm run supabase:types
```
