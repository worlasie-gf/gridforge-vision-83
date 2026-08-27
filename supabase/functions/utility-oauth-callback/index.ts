import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { getUtilityAdapter, UtilityNotConfiguredError } from "../_shared/utility-adapter.ts";
import { encryptSecret } from "../_shared/crypto.ts";
import { serviceClient, logEvent } from "../_shared/guards.ts";

const BodySchema = z.object({
  code: z.string().min(1).max(2048),
  state: z.string().min(16).max(256),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const requestId = crypto.randomUUID();

  try {
    if (req.method !== "POST") throw new HttpError(405, "Method not allowed");
    const parsed = BodySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, "Invalid request");
    const { code, state } = parsed.data;

    const db = serviceClient();

    // Validate state: exists, belongs to a real user, unexpired, single-use.
    const { data: stateRow, error: stateError } = await db
      .from("utility_oauth_states")
      .select("id, user_id, code_verifier, expires_at, consumed_at")
      .eq("state", state)
      .maybeSingle();
    if (stateError || !stateRow) throw new HttpError(400, "Invalid request");
    if (stateRow.consumed_at) throw new HttpError(400, "Invalid request");
    if (new Date(stateRow.expires_at).getTime() < Date.now()) throw new HttpError(400, "Authorization expired");

    // Consume the state before doing anything else (replay protection).
    const { error: consumeError } = await db
      .from("utility_oauth_states")
      .update({ consumed_at: new Date().toISOString() })
      .eq("id", stateRow.id)
      .is("consumed_at", null);
    if (consumeError) throw new HttpError(400, "Invalid request");

    const redirectUri = Deno.env.get("PGE_REDIRECT_URI") ?? "";
    if (!redirectUri) throw new UtilityNotConfiguredError("Missing configuration: PGE_REDIRECT_URI");

    const tokens = await getUtilityAdapter().exchangeCode({
      code,
      codeVerifier: stateRow.code_verifier ?? undefined,
      redirectUri,
    });

    // Find or create the customer's connection.
    const { data: existing } = await db
      .from("utility_connections")
      .select("id")
      .eq("user_id", stateRow.user_id)
      .eq("utility", "pge")
      .maybeSingle();

    let connectionId: string;
    if (existing) {
      connectionId = existing.id;
      await db.from("utility_connections").update({
        authorization_status: "authorized",
        connection_status: "active",
        authorized_at: new Date().toISOString(),
      }).eq("id", connectionId);
    } else {
      const customerRef = `gf-${crypto.randomUUID().slice(0, 12)}`;
      const { data: created, error: createError } = await db
        .from("utility_connections")
        .insert({
          user_id: stateRow.user_id,
          customer_ref: customerRef,
          utility: "pge",
          authorization_status: "authorized",
          connection_status: "active",
          authorized_at: new Date().toISOString(),
        })
        .select("id")
        .single();
      if (createError || !created) throw new HttpError(500, "Could not save connection");
      connectionId = created.id;
    }

    // Store tokens encrypted, service-role only.
    await db.from("utility_oauth_tokens").upsert({
      connection_id: connectionId,
      access_token_encrypted: await encryptSecret(tokens.accessToken),
      refresh_token_encrypted: tokens.refreshToken ? await encryptSecret(tokens.refreshToken) : null,
      token_expires_at: tokens.expiresInSeconds
        ? new Date(Date.now() + tokens.expiresInSeconds * 1000).toISOString()
        : null,
    }, { onConflict: "connection_id" });

    // Authorization metadata only — never tokens.
    await db.from("utility_authorizations").insert({
      connection_id: connectionId,
      authorization_ref: tokens.authorizationRef ?? null,
      scope: tokens.scope ?? null,
      granted_at: new Date().toISOString(),
      status: "active",
    });

    logEvent({ requestId, operation: "oauth_callback", connectionId, status: "ok" });
    return json({ ok: true });
  } catch (err) {
    return handleError(err, requestId);
  }
});

class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

function handleError(err: unknown, requestId: string): Response {
  if (err instanceof UtilityNotConfiguredError) {
    logEvent({ requestId, operation: "oauth_callback", status: "not_configured" });
    return json({ error: "PG&E connection is not available yet. Please check back soon." }, 503);
  }
  if (err instanceof HttpError) return json({ error: err.message }, err.status);
  logEvent({ requestId, operation: "oauth_callback", status: "error", errorCategory: "internal" });
  return json({ error: "Something went wrong. Please try again." }, 500);
}
