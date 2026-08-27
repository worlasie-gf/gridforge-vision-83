import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { getAuthenticatedUser, userHasRole, serviceClient, logEvent } from "../_shared/guards.ts";

const BodySchema = z.object({
  connectionId: z.string().uuid(),
  limit: z.number().int().min(1).max(500).default(200),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const requestId = crypto.randomUUID();

  try {
    if (req.method !== "POST") throw new HttpError(405, "Method not allowed");
    const parsed = BodySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, "Invalid request");
    const { connectionId, limit } = parsed.data;

    const user = await getAuthenticatedUser(req);
    if (!user) throw new HttpError(401, "Unauthorized");

    // Raw utility data requires the separate utility_data_viewer permission.
    const allowed = await userHasRole(user.id, "utility_data_viewer");

    const db = serviceClient();
    // Audit every access attempt, allowed or not.
    await db.from("utility_access_audit").insert({
      actor_user_id: user.id,
      connection_id: connectionId,
      action: "view_raw_usage",
      result: allowed ? "allowed" : "denied",
    });

    if (!allowed) throw new HttpError(404, "Not found");

    const { data: intervals, error } = await db
      .from("utility_usage_intervals")
      .select("interval_start, interval_duration_seconds, value_wh, quality")
      .eq("connection_id", connectionId)
      .order("interval_start", { ascending: false })
      .limit(limit);
    if (error) throw new HttpError(500, "Could not load data");

    logEvent({ requestId, operation: "view_usage", connectionId, status: "ok" });
    return json({ intervals: intervals ?? [] });
  } catch (err) {
    if (err instanceof HttpError) return json({ error: err.message }, err.status);
    logEvent({ requestId, operation: "view_usage", status: "error", errorCategory: "internal" });
    return json({ error: "Something went wrong." }, 500);
  }
});

class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
