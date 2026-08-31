# PG&E mTLS Integration Service — architecture (not yet deployed)

A dedicated service is required because Lovable Cloud edge functions run on a
runtime whose `fetch()` cannot present an X.509 client certificate. PG&E's
Share My Data APIs require two-way TLS, so all PG&E-facing network calls must
terminate in a service we control.

Target host: `https://api.gridforge.energy` (GridForge-controlled domain, DNS
and TLS separate from the marketing site).

No certificate, private key, client ID, or secret is generated or checked in
here. PG&E issues/registers the real certificate; the service loads it from its
own secret store at boot.

## Boundary

```text
Browser ──► gridforge.energy (static SPA, no secrets)
              │  supabase.functions.invoke(...)
              ▼
        Edge functions (Lovable Cloud)
          - session/role checks, PKCE state, encrypted token storage
          - UtilityAdapter, PGE_API_TRANSPORT = "stub" (unchanged today)
              │  HTTPS + Bearer PGE_PROXY_TOKEN
              ▼
        api.gridforge.energy  ◄── holds X.509 client cert + private key
              │  mutual TLS
              ▼
        PG&E Share My Data
```

The private key exists only inside the gateway's runtime secret store /
mounted volume. It never enters frontend code, the application database,
browser-accessible storage, logs, or any edge-function environment.

## Interfaces

The edge-function side already calls these paths through
`proxyFetch()` in `supabase/functions/_shared/utility-adapter.ts`. All requests
carry `Authorization: Bearer <PGE_PROXY_TOKEN>` and `content-type:
application/json`. The gateway rejects anything else and never returns PG&E
credentials or tokens it was not asked for.

### 1. Token exchange / OAuth proxy

```
POST /oauth/token
  { "grant_type": "authorization_code",
    "code": "...", "code_verifier": "...", "redirect_uri": "..." }
POST /oauth/token
  { "grant_type": "refresh_token", "refresh_token": "..." }
POST /oauth/revoke
  { "access_token": "..." }

200 -> { "accessToken", "refreshToken?", "expiresInSeconds?",
         "authorizationRef?", "scope?" }
4xx/5xx -> { "error": "<category>" }   // no PG&E payload echoed
```

The gateway injects the PG&E client ID/secret and performs the mTLS handshake.
Tokens pass straight back to the edge function, which encrypts them before
storage; the gateway persists nothing.

### 2. PG&E data retrieval

```
POST /espi/usage
  { "subscription_ref": "...", "published_min?": ISO, "published_max?": ISO }

200 -> ESPI Atom+XML body (content-type application/atom+xml)
```

Raw ESPI XML is returned unparsed; normalization to Wh happens in
`espi-parser.ts` on the edge side. The gateway is a transport, not a data store.

### 3. Notification receiver / verifier

Two supported shapes, chosen once PG&E documents the real mechanism:

- **Verifier mode (preferred if PG&E authenticates with a client certificate):**
  PG&E POSTs directly to `https://api.gridforge.energy/notifications/pge`. The
  gateway terminates the mTLS handshake, validates the peer certificate chain,
  then forwards the body to the edge `utility-notification` function.
- **Delegated mode:** PG&E POSTs to the edge function, which calls
  `POST /notifications/verify { body, headers }` and receives
  `{ "valid": boolean, "resource_ref"?: string }`.

`PGE_NOTIFICATION_VERIFIER` selects the strategy (`none` | `hmac` | `gateway`)
and defaults to `none`, which rejects every notification. The HMAC path is
provisional and must not be presented to PG&E as our mechanism until their
testing documentation confirms it.

## Deployment requirements

- Runtime with raw TLS control: Node/Go on Fly.io, Cloud Run, or ECS.
- Static egress IP if PG&E allowlists source addresses.
- Cert + key mounted from the platform secret manager, never from the repo.
- Structured logs with no tokens, no certificate material, no customer data.
- Health endpoint `GET /healthz` reporting cert presence and expiry days only.

## Cutover (not now)

`PGE_API_TRANSPORT` stays `"stub"` — every PG&E call fails closed — until the
gateway is deployed and tested end to end against PG&E's sandbox. Only then set
`PGE_API_TRANSPORT=proxy`, `PGE_PROXY_URL=https://api.gridforge.energy`, and
`PGE_PROXY_TOKEN`.

## Registration values for PG&E

| Field | Value |
| --- | --- |
| Third Party Portal URI | `https://gridforge.energy/connect/pge` |
| Third Party Scope Selection URL | `https://gridforge.energy/connect/pge` |
| OAuth Redirect URI | `https://gridforge.energy/oauth/pge/callback` |
| Notification URI | `https://api.gridforge.energy/notifications/pge` once the gateway is live; the deployed `utility-notification` function URL in the interim |
