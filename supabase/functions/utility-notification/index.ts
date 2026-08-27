import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { getUtilityAdapter, UtilityNotConfiguredError } from "../_shared/utility-adapter.ts";
import { serviceClient, logEvent } from "../_shared/guards.ts";

// Naive per-instance rate limiting (resets on cold start). A durable limiter
// should front this endpoint in production.
const hits = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 30;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  list.push(now);
  hits.set(ip, list);
  return list.length > MAX_PER_WINDOW;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const requestId = crypto.randomUUID();

  try {
    if (req.method !== "POST") return json({ error: "Not allowed" }, 405);
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (rateLimited(ip)) {
      logEvent({ requestId, operation: "notification", status: "rate_limited" });
      return json({ error: "Too many requests" }, 429);
    }

    const body = await req.text();
    if (body.length > 64_000) return json({ error: "Invalid request" }, 400);

    const result = await getUtilityAdapter().verifyNotification(body, req.headers);
    if (!result.valid) {
      logEvent({ requestId, operation: "notification", status: "rejected" });
      return json({ error: "Invalid request" }, 401);
    }

    // Record a sync event keyed by subscription reference if we can map it.
    const db = serviceClient();
    let connectionId: string | undefined;
    if (result.resourceRef) {
      const { data: conn } = await db
        .from("utility_connections")
        .select("id")
        .eq("subscription_ref", result.resourceRef)
        .maybeSingle();
      connectionId = conn?.id;
    }
    if (connectionId) {
      await db.from("utility_sync_events").insert({
        connection_id: connectionId,
        status: "data_ready",
        record_count: null,
        error_category: null,
      });
    }

    logEvent({ requestId, operation: "notification", connectionId, status: "accepted" });
    return json({ ok: true });
  } catch (err) {
    if (err instanceof UtilityNotConfiguredError) {
      logEvent({ requestId, operation: "notification", status: "not_configured" });
      return json({ error: "Service unavailable" }, 503);
    }
    logEvent({ requestId, operation: "notification", status: "error", errorCategory: "internal" });
    return json({ error: "Invalid request" }, 400);
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
