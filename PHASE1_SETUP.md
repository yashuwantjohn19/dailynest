# DailyNest Phase 1 setup

This revision replaces the fake login path with real Supabase phone OTP authentication and adds the profile/address foundation.

## 1. Create/configure Supabase

1. Create a Supabase project.
2. Open **SQL Editor** and run `supabase/migrations/001_phase1_foundation.sql`.
3. In **Authentication > Providers > Phone**, enable phone authentication and configure an SMS provider supported by Supabase.
4. Copy the project URL and anon/publishable key into `.env.local` using `.env.example` as the template.

Do **not** expose the `service_role` key in the frontend or commit it to Git.

## 2. Start the app

```bash
npm install
npm run dev
```

Open `/login`, request an OTP, and sign in. The database trigger creates a `profiles` row automatically. Open `/account` to save the customer's name, email, delivery address and preferred delivery time.

## 3. Create the first admin

All new accounts are customers by default. After signing in once, promote the intended operator from the Supabase SQL editor:

```sql
update public.profiles
set role = 'admin'
where phone = '+91XXXXXXXXXX';
```

Admin navigation is shown only to users whose profile role is `admin`, and `/admin/*` pages have an application-level role guard. Database RLS remains the real authorization boundary.

## Phase 1 completed in this revision

- Real Supabase browser session persistence
- Phone OTP login without mock-user fallback
- Auth-linked customer profiles
- Delivery addresses with preferred/assigned time fields
- Customer account editor
- Customer/admin roles
- RLS policies for profiles, apartments and addresses
- Automatic profile creation from `auth.users`
- Admin navigation no longer enabled for every user
- Admin route guard

## Still intentionally pending

The existing subscription, wallet, production and some apartment/admin flows still contain development/mock behavior. Those belong to the next phases and must be migrated before production launch. Real payments/refunds are not implemented in this Phase 1 revision.
