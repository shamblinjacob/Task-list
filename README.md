# Task List

A personal goals, tasks, and daily reflection app. Built for daily use on desktop and mobile as a PWA — install it to your phone's homescreen and it behaves like a native app.

## Features

- **Today view** — daily task list, daily intention, end-of-day reflection, progress bar
- **Goals** — long-term goals with status (active / paused / completed / archived), target dates, and auto-calculated progress from linked tasks
- **Reflections** — searchable history of your daily intentions and notes
- **Auto-rollover** — unfinished tasks from prior days move to today automatically
- **PWA** — installable to homescreen with offline-capable shell
- **Sync** — optional Supabase backend for cross-device sync. Falls back to localStorage if not configured.

## Stack

- Next.js 14 (App Router) + React 18 + TypeScript
- Tailwind CSS
- Supabase (Postgres) for storage and sync

## Local setup

```bash
npm install
npm run dev
```

The app runs at http://localhost:3000. Without Supabase configured it will use localStorage only.

## Supabase setup (for cross-device sync)

1. Create a free project at [supabase.com](https://supabase.com).
2. In the Supabase dashboard, open **SQL Editor** and run the contents of [`supabase/schema.sql`](./supabase/schema.sql).
3. In **Project Settings → API**, copy the **Project URL** and the **anon public** key.
4. Create a `.env.local` file in the project root:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-public-key>
   ```

5. Restart `npm run dev`.

> This is a single-user app: the schema disables Row Level Security so the anon key can read and write. **Do not share the deployed URL publicly** — anyone with it can see and edit your data. If you want privacy, deploy it behind a password using [Vercel Password Protection](https://vercel.com/docs/security/deployment-protection) or add Supabase Auth.

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import it on [vercel.com](https://vercel.com/new).
3. Add the two env vars above in the Vercel project settings.
4. Deploy.

## Installing to your phone

1. Open the deployed URL in Safari (iOS) or Chrome (Android).
2. iOS: tap **Share → Add to Home Screen**.
3. Android: tap **⋮ → Install app** (or "Add to Home Screen").

## Project structure

```
src/
  app/
    page.tsx           # Today
    goals/page.tsx     # Goals
    reflections/page.tsx
    layout.tsx
    globals.css
  components/
    Nav.tsx
    Checkbox.tsx
    ConfigBanner.tsx
  lib/
    store.ts           # data layer (Supabase + localStorage fallback)
    supabase.ts
    database.types.ts
    date.ts
public/
  manifest.webmanifest
  icon.svg
  icon-192.png
  icon-512.png
supabase/
  schema.sql
```
