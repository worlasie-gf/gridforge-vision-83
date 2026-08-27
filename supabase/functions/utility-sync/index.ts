import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { getUtilityAdapter, UtilityNotConfiguredError } from "../_shared/utility-adapter.ts";
import { encryptSecret, decryptSecret } from "../_shared/crypto.ts";
import { getAuthenticatedUser, userHasRole, serviceClient, logEvent } from "../_shared/guards.ts";

const BodySchema = z.object({ connectionId: z.string().uuid() });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const requestId = crypto.randomUUID();

  try {
    if (req.method !== "POST") throw new HttpError(405, "Method not allowed");
    const parsed = BodySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, "Invalid request");
    const { connectionId } = parsed.data;

    // Caller must be an admin or the connection owner.
    const user = await getAuthenticatedUser(req);
    if (!user) throw new HttpError(401, "Unauthorized");

    const db = serviceClient();
    const { data: connection } = await db
      .from("utility_connections")
      .select("id, user_id, subscription_ref, authorization_status")
      .eq("id", connectionId)
      .maybeSingle();
    if (!connection) throw new HttpError(404, "Not found");

    const isOwner = connection.user_id === user.id;
    const isAdmin = !isOwner && (await userHasRole(user.id, "admin"));
    if (!isOwner && !isAdmin) throw new HttpError(404, "Not found");
    if (connection.authorization_status !== "authorized") throw new HttpError(409, "Not authorized");

    const { data: tokenRow } = await db
      .from("utility_oauth_tokens")
      .select("access_token_encrypted, refresh_token_encrypted, token_expires_at")
      .eq("connection_id", connectionId)
      .maybeSingle();
    if (!tokenRow) throw new HttpError(409, "Not authorized");

    const adapter = getUtilityAdapter();
    let accessToken = await decryptSecret(tokenRow.access_token_encrypted);

    // Refresh when expired or expiring within 2 minutes.
    const expiresAt = tokenRow.token_expires_at ? new Date(tokenRow.token_expires_at).getTime() : 0;
    if (tokenRow.refresh_token_encrypted && expiresAt - Date.now() < 2 * 60 * 1000) {
      const refreshed = await adapter.refreshAccessToken(await decryptSecret(tokenRow.refresh_token_encrypted));
      accessToken = refreshed.accessToken;
      await db.from("utility_oauth_tokens").update({
        access_token_encrypted: await encryptSecret(refreshed.accessToken),
        refresh_token_encrypted: refreshed.refreshToken
          ? await encryptSecret(refreshed.refreshToken)
          : tokenRow.refresh_token_encrypted,
        token_expires_at: refreshed.expiresInSeconds
          ? new Date(Date.now() + refreshed.expiresInSeconds * 1000).toISOString()
          : null,
      }).eq("connection_id", connectionId);
    }

    const usage = await adapter.fetchUsage({
      accessToken,
      subscriptionRef: connection.subscription_ref ?? undefined,
    });

    if (usage.intervals.length > 0) {
      const rows = usage.intervals.map((i) => ({
        connection_id: connectionId,
        usage_point_ref: i.usagePointRef ?? null,
        interval_start: i.intervalStart,
        interval_duration_seconds: i.durationSeconds,
        value_wh: i.valueWh,
        quality: i.quality ?? null,
      }));
      // Insert in batches of 500.
      for (let i = 0; i < rows.length; i += 500) {
        const { error } = await db.from("utility_usage_intervals").insert(rows.slice(i, i + 500));
        if (error) throw new Error("interval_insert_failed");
      }
    }

    await db.from("utility_data_metadata").insert({
      connection_id: connectionId,
      period_start: usage.periodStart ?? null,
      period_end: usage.periodEnd ?? null,
      record_count: usage.intervals.length,
      processing_status: "received",
      verification_status: "pending",
    });
    await db.from("utility_sync_events").insert({
      connection_id: connectionId,
      status: "success",
      record_count: usage.intervals.length,
    });
    await db.from("utility_connections").update({
      last_sync_at: new Date().toISOString(),
      last_sync_status: "success",
    }).eq("id", connectionId);

    logEvent({ requestId, operation: "sync", connectionId, status: "ok", recordCount: usage.intervals.length });
    return json({ ok: true, recordCount: usage.intervals.length });
  } catch (err) {
    // Best-effort failure event; never leak internals.
    try {
      const parsed = BodySchema.safeParse(await req.clone().json().catch(() => null)).safe ? null : null;
      void parsed;
    } catch { /* ignore */ }
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
    logEvent({ requestId, operation: "sync", status: "not_configured" });
    return json({ error: "PG&E data retrieval is not configured yet." }, 503);
  }
  if (err instanceof HttpError) return json({ error: err.message }, err.status);
  logEvent({ requestId, operation: "sync", status: "error", errorCategory: "internal" });
  return json({ error: "Something went wrong. Please try again." }, 500);
}
