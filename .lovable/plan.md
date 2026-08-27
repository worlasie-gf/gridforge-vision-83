# PG&E Share My Data — Execution Plan (approved design, now building)

The architecture review was approved. This is the build sequence; the PG&E SDK link and "reference only" guidance are incorporated below.

## PG&E reference material — how it is used

- PG&E's JavaScript SDK is used **as reference only** to understand their OAuth handshake, mutual TLS, notification (`/Notification`) behaviour, and ESPI/Green Button Atom+XML structures. Nothing is copied from it.
- Production code is fresh server-side TypeScript with maintained libraries (native `fetch`, `fast-xml-parser` for ESPI Atom feeds, Zod for validation).
- mTLS: edge functions cannot do two-way TLS, so PG&E token/data calls go through a `UtilityAdapter` interface. Transport is a config switch (`PGE_API_TRANSPORT = "stub" | "proxy"`). It ships in `stub` mode (clearly labelled "not configured" errors) until you provision the proxy service that will hold the client certificate and private key.
- ESPI parsing normalises `UsagePoint → MeterReading → IntervalBlock → IntervalReading` into canonical Wh/W values with `powerOfTenMultiplier` applied once at ingest. PG&E Subscription/Bulk IDs are stored as opaque references.

## Build order

1. **Database migration** (shown to you for approval):
   - Tables: `profiles`, `user_roles` (enum `admin`, `utility_data_viewer`, `customer`), `utility_connections`, `utility_authorizations` (metadata only, no tokens), `utility_oauth_tokens` (service_role-only, encrypted, zero client policies), `utility_oauth_states` (PKCE-ready), `utility_sync_events`, `utility_data_metadata`, `utility_usage_intervals` (service_role-only), `utility_access_audit`.
   - Every table: GRANTs to `authenticated` + `service_role` (no `anon` anywhere), RLS enabled, owner-scoped policies for customers, `has_role('admin')` policies for admins, and no permissive policies on token/state/raw-interval tables. Security-definer `has_role()` function included.
2. **Auth + guards**: Supabase email/password auth, a `/login` flow that preserves intended routes, `RequireAuth`/`RequireAdmin` route guards, `<PrivateMeta />` helper setting `noindex, nofollow`, unauthorized users see a generic 404, `robots.txt` disallows the private routes.
3. **Backend functions**: `utility-authorize-start`, `utility-oauth-callback`, `utility-notification`, `utility-sync`, `utility-revoke`, `admin-connections`, `admin-view-usage` (extra `utility_data_viewer` check + audit row). Zod input validation, generic error responses, sanitized logging only, shared `UtilityAdapter` + PG&E implementation in `stub` mode.
4. **Pages**: `/connect/pge` (single "Connect PG&E Account" button, no data shown), `/oauth/pge/callback` (posts code+state straight to backend, shows only success/failure), `/admin/data-connections` (metadata cards only, plus gated "View Authorized Data"). None are linked anywhere publicly.
5. **Security checklist**: run the linter and verify every item from your section 16; any failure is flagged, not waived.

## Still needed from you (not blocking the build)

PG&E client ID/secret, client certificate + private key, third-party ID / `ApplicationInformation` resource, registered redirect and notification URIs, sandbox vs production base URLs, scope string, and subscription/bulk IDs. Secrets will be requested via the secure secrets form only when the integration needs them — never hardcoded.
