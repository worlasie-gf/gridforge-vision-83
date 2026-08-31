// Utility adapter abstraction.
// All PG&E-facing operations go through this interface so the transport can be
// swapped (stub -> dedicated mTLS proxy service) without touching callers.

export interface TokenSet {
  accessToken: string;
  refreshToken?: string;
  expiresInSeconds?: number;
  authorizationRef?: string;
  scope?: string;
}

export interface ParsedInterval {
  usagePointRef?: string;
  intervalStart: string; // ISO
  durationSeconds: number;
  valueWh: number;
  quality?: string;
}

export interface FetchUsageResult {
  intervals: ParsedInterval[];
  periodStart?: string;
  periodEnd?: string;
}

export interface UtilityAdapter {
  buildAuthorizeUrl(params: {
    state: string;
    codeChallenge: string;
    redirectUri: string;
  }): Promise<string>;

  exchangeCode(params: {
    code: string;
    codeVerifier?: string;
    redirectUri: string;
  }): Promise<TokenSet>;

  refreshAccessToken(refreshToken: string): Promise<TokenSet>;

  revokeAuthorization(accessToken: string): Promise<void>;

  fetchUsage(params: { accessToken: string; subscriptionRef?: string }): Promise<FetchUsageResult>;

  verifyNotification(body: string, headers: Headers): Promise<{ valid: boolean; resourceRef?: string }>;
}

export class UtilityNotConfiguredError extends Error {
  constructor(detail?: string) {
    super(detail ?? "PG&E integration is not configured yet");
    this.name = "UtilityNotConfiguredError";
  }
}

function pgeEnv(name: string): string | undefined {
  const v = Deno.env.get(name);
  return v && v.length > 0 ? v : undefined;
}

function requireEnv(name: string): string {
  const v = pgeEnv(name);
  if (!v) throw new UtilityNotConfiguredError(`Missing configuration: ${name}`);
  return v;
}

/**
 * PG&E Share My Data adapter.
 *
 * Reference material: PG&E's published JavaScript SDK (illustrative only, not
 * production code). Nothing from it is copied here. This implementation uses
 * native fetch and is transport-pluggable:
 *
 *   PGE_API_TRANSPORT = "stub"  -> every PG&E network call fails closed with a
 *                                  clearly labelled "not configured" error.
 *   PGE_API_TRANSPORT = "proxy" -> calls are forwarded to the dedicated
 *                                  PGE_PROXY_URL service that performs mutual
 *                                  TLS with PG&E (client cert + private key
 *                                  live only on that service).
 *
 * Edge functions cannot perform client-certificate TLS, so "proxy" is the
 * supported production transport.
 */
class PgeAdapter implements UtilityAdapter {
  private transport(): "stub" | "proxy" {
    return pgeEnv("PGE_API_TRANSPORT") === "proxy" ? "proxy" : "stub";
  }

  private async proxyFetch(path: string, init: RequestInit): Promise<Response> {
    const base = requireEnv("PGE_PROXY_URL").replace(/\/$/, "");
    const token = requireEnv("PGE_PROXY_TOKEN");
    return fetch(`${base}${path}`, {
      ...init,
      headers: {
        ...(init.headers ?? {}),
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
    });
  }

  async buildAuthorizeUrl(params: { state: string; codeChallenge: string; redirectUri: string }): Promise<string> {
    const authorizeBase = requireEnv("PGE_AUTHORIZE_URL");
    const clientId = requireEnv("PGE_CLIENT_ID");
    const scope = pgeEnv("PGE_SCOPE");
    const url = new URL(authorizeBase);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", params.redirectUri);
    url.searchParams.set("state", params.state);
    if (scope) url.searchParams.set("scope", scope);
    // PKCE (S256) — PG&E-compatible when enabled on the registration.
    url.searchParams.set("code_challenge", params.codeChallenge);
    url.searchParams.set("code_challenge_method", "S256");
    return url.toString();
  }

  async exchangeCode(params: { code: string; codeVerifier?: string; redirectUri: string }): Promise<TokenSet> {
    if (this.transport() === "stub") {
      throw new UtilityNotConfiguredError("PG&E token exchange is not configured (transport=stub)");
    }
    const res = await this.proxyFetch("/oauth/token", {
      method: "POST",
      body: JSON.stringify({
        grant_type: "authorization_code",
        code: params.code,
        code_verifier: params.codeVerifier,
        redirect_uri: params.redirectUri,
      }),
    });
    if (!res.ok) throw new Error(`token_exchange_failed:${res.status}`);
    return (await res.json()) as TokenSet;
  }

  async refreshAccessToken(refreshToken: string): Promise<TokenSet> {
    if (this.transport() === "stub") {
      throw new UtilityNotConfiguredError("PG&E token refresh is not configured (transport=stub)");
    }
    const res = await this.proxyFetch("/oauth/token", {
      method: "POST",
      body: JSON.stringify({ grant_type: "refresh_token", refresh_token: refreshToken }),
    });
    if (!res.ok) throw new Error(`token_refresh_failed:${res.status}`);
    return (await res.json()) as TokenSet;
  }

  async revokeAuthorization(accessToken: string): Promise<void> {
    if (this.transport() === "stub") {
      // Nothing to revoke upstream yet; local revocation proceeds.
      return;
    }
    await this.proxyFetch("/oauth/revoke", {
      method: "POST",
      body: JSON.stringify({ access_token: accessToken }),
    });
  }

  async fetchUsage(params: { accessToken: string; subscriptionRef?: string }): Promise<FetchUsageResult> {
    if (this.transport() === "stub") {
      throw new UtilityNotConfiguredError("PG&E data retrieval is not configured (transport=stub)");
    }
    const res = await this.proxyFetch("/espi/usage", {
      method: "POST",
      body: JSON.stringify({ subscription_ref: params.subscriptionRef }),
    });
    if (!res.ok) throw new Error(`usage_fetch_failed:${res.status}`);
    const xml = await res.text();
    const { parseEspiUsageFeed } = await import("./espi-parser.ts");
    return parseEspiUsageFeed(xml);
  }

  /**
   * Notification verification is PLUGGABLE and fails closed.
   *
   * PG&E's actual notification authentication mechanism is NOT confirmed yet.
   * `PGE_NOTIFICATION_VERIFIER` selects the strategy once PG&E's testing
   * documentation states what it is:
   *
   *   unset / "none"  -> reject everything (current, correct default)
   *   "hmac"          -> shared-secret HMAC-SHA256 over the raw body,
   *                      header name from PGE_NOTIFICATION_SIGNATURE_HEADER
   *                      (provisional; do not register with PG&E as fact)
   *   "gateway"       -> delegate to the dedicated mTLS gateway service,
   *                      which terminated the PG&E client-certificate TLS
   *                      handshake and can attest the caller
   */
  async verifyNotification(body: string, headers: Headers): Promise<{ valid: boolean; resourceRef?: string }> {
    const mode = pgeEnv("PGE_NOTIFICATION_VERIFIER") ?? "none";

    if (mode === "none") {
      throw new UtilityNotConfiguredError(
        "PG&E notification verification is not configured (awaiting PG&E's documented mechanism)",
      );
    }

    if (mode === "gateway") {
      const res = await this.proxyFetch("/notifications/verify", {
        method: "POST",
        body: JSON.stringify({
          body,
          headers: Object.fromEntries(headers.entries()),
        }),
      });
      if (!res.ok) return { valid: false };
      const result = (await res.json()) as { valid?: boolean; resource_ref?: string };
      if (!result.valid) return { valid: false };
      return { valid: true, resourceRef: result.resource_ref ?? extractResourceRef(body) };
    }

    if (mode !== "hmac") {
      throw new UtilityNotConfiguredError(`Unknown PGE_NOTIFICATION_VERIFIER: ${mode}`);
    }

    const secret = requireEnv("PGE_NOTIFICATION_SECRET");
    const headerName = pgeEnv("PGE_NOTIFICATION_SIGNATURE_HEADER") ?? "x-pge-signature";
    const signature = headers.get(headerName) ?? "";
    if (!signature) return { valid: false };
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const expected = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body)));
    const providedBytes = hexToBytes(signature.replace(/^sha256=/, ""));
    if (providedBytes.length !== expected.length) return { valid: false };
    let diff = 0;
    for (let i = 0; i < expected.length; i++) diff |= expected[i] ^ providedBytes[i];
    if (diff !== 0) return { valid: false };
    return { valid: true, resourceRef: extractResourceRef(body) };
  }
}

/** Subscription reference only — never customer data into logs. */
function extractResourceRef(body: string): string | undefined {
  const match = body.match(/Batch\/Subscription\/(\w+)/) ?? body.match(/Subscription\/(\w+)/);
  return match?.[1];
}


function hexToBytes(hex: string): Uint8Array {
  if (!/^[0-9a-fA-F]*$/.test(hex) || hex.length % 2 !== 0) return new Uint8Array(0);
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

export function getUtilityAdapter(): UtilityAdapter {
  return new PgeAdapter();
}
