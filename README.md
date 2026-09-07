# Soft Life Era

Next.js 15 + Supabase scaffold. Proves the full pipeline end to end:
signup → session → RLS-protected read/write on `daily_checkins` and
`profiles`. Today's feeling picker is real, not a mock — it writes to
Supabase.

## Setup

1. Create a new Supabase project (its own project — not shared with
   any other CRWL/consulting Supabase project; this is a separate
   consumer product with its own users and its own billing).
2. In the SQL Editor, run `schema.sql` from the project root.
3. Project Settings → API → copy the Project URL and anon public key
   into `.env.local` (copy `.env.local.example` first).
4. `npm install`
5. `npm run dev` → http://localhost:3000

## What's here

- `/signup`, `/login` — real auth against Supabase, email/password
- `/today` — protected route (middleware redirects signed-out
  visitors to `/login`), feeling picker upserts into `daily_checkins`
- `middleware.ts` — session refresh + route protection for every page
- `schema.sql` — full data model, RLS enabled on every table,
  `plan`/`stripe_*` columns on `profiles` ready for Stripe later
- Colors/fonts in `tailwind.config.ts` and `app/globals.css` are
  ported directly from the prototype's `:root` tokens

## What's not here yet

Everything past Today: My Spaces, Stay in Flow, the other 7 Spaces.
Port those next, one at a time, against this same auth/schema
foundation — see the project notes for the recommended order
(Stay in Flow next, Creative Command Center last).
