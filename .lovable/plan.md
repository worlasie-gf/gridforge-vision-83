# PG&E Share My Data — Secure Integration (Review Before Build)

This is the pre-implementation review you asked for in section 15. Nothing is built and no database change is applied until you approve.

## 1. Architecture

```text
Customer browser ──► GridForge frontend (React, no secrets)
                        │  supabase.functions.invoke(...)
                        ▼
                 Cloud backend functions  ── utility adapter interface ──► PG&E
                 (secrets, tokens, certs)         (pge adapter impl)
                        │
                        ▼
                 Cloud database (RLS on every table)
```

Key rules baked in:
- The browser never sees PG&E secrets, tokens, auth codes, certificates, or raw interval data.
- All PG&E calls sit behind a `UtilityAdapter` interface (`startAuthorization`, `exchangeCode`, `refresh`, `revoke`, `fetchUsage`, `verifyNotification`). The PG&E implementation lives behind that interface, so if mutual TLS forces a move off edge functions, only the adapter's transport layer relocates — frontend, database, and API contract stay unchanged.
- The frontend talks only to a small set of named backend endpoints; it never knows PG&E URLs.

### Mutual TLS answer (important)
Supabase Edge Functions run on Deno Deploy, which does **not** support client-certificate (two-way TLS) outbound connections. If PG&E requires mTLS for the token/data endpoints — which Share My Data historically does — the edge functions can host the OAuth redirect, callback, admin API, and webhook receive, but the actual PG&E API calls will need a dedicated backend service (a small containerised Node/Deno service on Fly.io/Render/Cloud Run) holding the client cert and private key. The plan is structured so that swap is a config change: `PGE_API_TRANSPORT = "edge" | "proxy"` plus a `PGE_PROXY_URL` + shared auth token. No PG&E network call is written before you confirm the mTLS requirement.

## 2. Routes (all private, none linked publicly)

| Route | Purpose | Protection |
| --- | --- | --- |
| `/connect/pge` | Customer authorization page with a single "Connect PG&E Account" button | Requires signed-in customer; no utility data shown |
| `/oauth/pge/callback` | Receives `code` + `state`, immediately posts them to a backend function, shows only success/failure | No token handling client-side |
| `/admin/data-connections` | Operational metadata table | Requires auth + `admin` role, checked server-side |

- Not added to nav, footer, sitemap, or any page listing. `robots.txt` gets a disallow, and each page sets `noindex, nofollow` via a small `<PrivateMeta />` helper.
- Unauthorized access renders the existing 404 page (generic, no hints).
- These routes stay out of the public marketing site's navigation entirely.

## 3. Roles and auth

- Supabase email/password auth (MFA-ready: TOTP enrollment surfaced on the admin page; enforced for admins once you enable it).
- Roles in a dedicated `user_roles` table with enum `app_role`: `admin`, `utility_data_viewer`, `customer`. Never on a profile table.
- `has_role(user_id, role)` security-definer function used by every policy and by every backend function.
- `admin` alone grants metadata only. Viewing raw usage additionally requires `utility_data_viewer`, checked again server-side on each request and written to the audit table.
- Short admin sessions: JWT expiry reduced and an idle-timeout sign-out in the admin shell.

## 4. Proposed tables (review these)

All tables: RLS enabled, `GRANT` only to `authenticated` + `service_role`, **no `anon` grants at all**.

- `profiles` — `user_id`, display name. Owner-read/write.
- `user_roles` — `user_id`, `role`. Read: own rows or admins. Write: service_role only.
- `utility_connections` — `id`, `user_id`, `customer_ref` (internal, non-PII), `utility` ('pge'), `service_agreement_ref`, `authorization_status`, `connection_status`, `authorized_at`, `last_sync_at`, `last_sync_status`.
- `utility_authorizations` — metadata only: `connection_id`, `authorization_ref` (PG&E resource id), `scope`, `granted_at`, `expires_at`, `revoked_at`, `status`. **No tokens.**
- `utility_oauth_tokens` — access/refresh tokens, encrypted at rest, `service_role` only, **zero policies for `authenticated`** so no app user can ever query it. (If you prefer, tokens can live in the proxy backend's own store instead — say the word.)
- `utility_oauth_states` — `state`, `code_verifier` (PKCE-ready), `user_id`, `expires_at`, `consumed_at`. service_role only.
- `utility_sync_events` — `connection_id`, `occurred_at`, `status`, `record_count`, `error_category`. No payloads.
- `utility_data_metadata` — `connection_id`, `period_start`, `period_end`, `record_count`, `processing_status`, `verification_status`.
- `utility_usage_intervals` — the raw readings, service_role only, never selectable from the client; reads happen through a backend function gated on `utility_data_viewer`.
- `utility_access_audit` — `actor_user_id`, `occurred_at`, `connection_id`, `action`, `result`. No utility values.

Existing `demand_flex_submissions` (marketing) stays completely separate; nothing is joined to it.

### Proposed RLS policy shape

- Customer: `SELECT` own rows on `utility_connections`, `utility_authorizations`, `utility_data_metadata` where `user_id = auth.uid()` (or via owning connection). No insert/update/delete — the backend writes.
- Admin: `SELECT` on `utility_connections`, `utility_authorizations`, `utility_sync_events`, `utility_data_metadata`, `utility_access_audit` via `has_role(auth.uid(),'admin')`.
- `utility_oauth_tokens`, `utility_oauth_states`, `utility_usage_intervals`: RLS enabled with **no permissive policies** — unreachable from any client key.
- No "authenticated can select all" policies anywhere.

## 5. Server-side functions

| Function | Job |
| --- | --- |
| `utility-authorize-start` | Auth'd customer; creates state + PKCE verifier; returns PG&E authorize URL |
| `utility-oauth-callback` | Validates state (single-use, expiring), exchanges code via adapter, stores tokens + authorization metadata |
| `utility-notification` | PG&E data-ready webhook: validates signature/cert/shared secret, replay window, rate limit, enqueues sync |
| `utility-sync` | Pulls data via adapter, refreshes token when needed, writes metadata + sync event |
| `utility-revoke` | Disconnects an authorization |
| `admin-connections` | Returns metadata list for admins (server-side role check) |
| `admin-view-usage` | Requires `utility_data_viewer`; returns raw data and writes an audit row |

All validate input with Zod, return generic errors, and log only request id / connection id / operation / status / sanitized error category.

## 6. Admin interface

`/admin/data-connections` shows a card per connection: utility, internal reference, Authorized ✓, Account matched ✓, Interval data available ✓, last sync date, records received, verification status, generic error. Raw data only behind an explicit "View Authorized Data" action that hits `admin-view-usage`.

## 7. Secrets needed (requested only when you have them)

`PGE_CLIENT_ID`, `PGE_CLIENT_SECRET`, `PGE_AUTHORIZE_URL`, `PGE_TOKEN_URL`, `PGE_API_BASE_URL`, `PGE_REDIRECT_URI`, `PGE_NOTIFICATION_SECRET`, `PGE_CLIENT_CERT` + `PGE_CLIENT_KEY` (proxy service only, never a database table), `TOKEN_ENCRYPTION_KEY` (generated, not pasted).

## 8. PG&E information still missing

Authorization + token endpoints, API base URL, client credentials, notification/webhook auth mechanism, whether mTLS is required, the certificate itself, scope/`Batch Subscription` semantics, and token lifetime/refresh rules. Until these arrive, endpoints are clearly-labelled placeholders that throw a "not configured" error rather than calling anything.

## 9. Build order

1. Database migration (tables, grants, RLS, roles, `has_role`) — shown to you for approval by the migration tool.
2. Auth + role guards + private route shell with noindex.
3. Backend functions with the adapter interface and placeholder PG&E config.
4. `/connect/pge`, `/oauth/pge/callback`, `/admin/data-connections`.
5. Security review checklist against every item in your section 16, with any failures flagged rather than waived.

## Open questions

Answer inline if you have preferences; otherwise I'll proceed with the defaults above: token storage in the encrypted service-role-only table vs. in the future proxy backend, and whether admins should be able to see customer email at all or only an internal reference id.
