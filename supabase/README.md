# Supabase Setup

## 1) Apply Schema

Run the SQL in `supabase/schema.sql` inside the Supabase SQL editor.

## 2) Configure Env Vars

Create `.env.local` from `.env.example` and populate:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 3) Seed Content

Once the tables exist, run:

```bash
npm run seed
```

This loads tickets, narrative templates, and events from `pm-simulator-db/`.
