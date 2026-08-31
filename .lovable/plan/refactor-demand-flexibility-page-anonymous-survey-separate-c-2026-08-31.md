# Refactor: Demand Flexibility page — anonymous survey + separate contact opt-in

Scope is limited to `/demand-flexibility` and its form workflow plus two new backend tables. No changes to brand, nav, colors, typography, or other pages.

## Note on the backend

This project's connected Supabase project is the one provisioned through Lovable Cloud — they are the same database, not two options. All inserts go there using only the publishable (anon) key already in `src/integrations/supabase/client.ts`. No service-role key is ever used in frontend code.

## Page changes

**Hero** — keep concise, with the copy exactly as supplied:
- H1: "Show where the flex is"
- Lead: "Flexible capacity already exists. Help us build a clearer picture of where it lives and where people are ready to participate."
- Paragraph about batteries, water heaters, thermostats, EV chargers, buildings.
- Section heading: "The grid can't plan around flexibility it can't see." plus the supporting paragraph (updated to the wording supplied).

**Remove** the two participation pathway cards ("I have flexibility today" / "Not yet — but I'm interested") and the conditional-form logic. One unified form is always visible.

**Section 1 — Share your information anonymously**
- Visible note: "Your responses are anonymous. We do not collect your name or email in this section."
- Keep the "Joining the list adds you to the picture." explanation above the form.
- Fields (name and email removed entirely from this section):
  - ZIP code (required)
  - Electricity provider (existing placeholder with PG&E, Duke Energy, Xcel Energy, Con Edison, Evergy, or Not sure)
  - Which best describes you? (existing select options)
  - What do you have? Select any that apply. — existing pill options, plus a new option: "None — I'm interested in demand flexibility but don't currently own or manage one of these."
  - Are you already participating in a demand flexibility or demand response program? (Yes / No / Not sure)
  - Would you like to be notified when a program becomes available? (existing notify question, kept as an anonymous preference)
- Submit button: "Submit anonymous response"
- On success: inline confirmation + toast; form resets.

**Section 2 — Stay informed (optional)**
- Visually separate card directly below, own heading "Stay informed".
- Copy: "Would you like to be notified when a demand flexibility program becomes available in your area or about future GridForge research opportunities?"
- Note: "Your contact information is submitted separately and is not linked to your survey responses."
- Fields: Name, Email. Button: "Keep me informed".
- Independent submit handler and independent state; not required for the survey submit.

**A few things to know** accordion stays, with wording adjusted to reflect that survey responses carry no identity and contact info is stored separately.

## Database changes (one migration)

Two new, unrelated tables. The existing `demand_flex_submissions` table is left in place untouched but the page stops writing to it.

`public.demand_flex_responses`
- `id` uuid PK default `gen_random_uuid()`
- `zip_code` text not null
- `electricity_provider` text
- `respondent_type` text
- `resources` text[] default `{}`
- `current_program_participation` text
- `notification_interest` text
- `additional_information` text
- `created_at` timestamptz not null default `now()`
- No name, email, phone, contact id, user id, or any identity column.

`public.demand_flex_contacts`
- `id` uuid PK default `gen_random_uuid()`
- `name` text not null
- `email` text not null
- `created_at` timestamptz not null default `now()`
- No foreign key or any reference to responses.

Grants and RLS on both:
- `GRANT INSERT ... TO anon, authenticated;` and `GRANT ALL ... TO service_role;` — no SELECT/UPDATE/DELETE grant to public roles.
- RLS enabled; a single INSERT policy for `anon, authenticated` with `WITH CHECK (true)`. No SELECT, UPDATE, or DELETE policies, so the public frontend can write but never read or modify records.

## Where the code writes to Supabase

Both writes live in `src/pages/DemandFlexibility.tsx`:
- `handleSurveySubmit` → `supabase.from("demand_flex_responses").insert({...})`
- `handleContactSubmit` → `supabase.from("demand_flex_contacts").insert({ name, email })`

Two separate handlers, two separate inserts, no shared identifier passed between them.

## Verification

- Typecheck the page.
- Submit both forms in the preview and confirm rows land in the correct tables and that a client-side `select` on either table returns no rows.
- Report back: connected project, tables created, exact fields, RLS policies, and the two insert call sites.
