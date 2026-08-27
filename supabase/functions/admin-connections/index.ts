import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { getAuthenticatedUser, userHasRole, serviceClient, logEvent } from "../_shared/guards.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const requestId = crypto.randomUUID();

  try {
    if (req.method !== "GET" && req.method !== "POST") throw new HttpError(405, "Method not allowed");
    const user = await getAuthenticatedUser(req);
    if (!user) throw new HttpError(401, "Unauthorized");
    if (!(await userHasRole(user.id, "admin"))) throw new HttpError(404, "Not found");

    const db = serviceClient();
    const { data: connections, error } = await db
      .from("utility_connections")
      .select("id, customer_ref, utility, authorization_status, connection_status, authorized_at, last_sync_at, last_sync_status")
      .order("created_at", { ascending: false });
    if (error) throw new HttpError(500, "Could not load connections");

    const result = [];
    for (const conn of connections ?? []) {
      const { data: meta } = await db
        .from("utility_data_metadata")
        .select("period_start, period_end, record_count, processing_status, verification_status, created_at")
        .eq("connection_id", conn.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const { count: totalRecords } = await db
        .from("utility_data_metadata")
        .select("id", { count: "exact", head: true })
        .eq("connection_id", conn.id);

      const { data: sums } = await db
        .from("utility_data_metadata")
        .select("record_count")
        .eq("connection_id", conn.id);
      const recordsReceived = (sums ?? []).reduce((acc, r) => acc + (r.record_count ?? 0), 0);

      result.push({
        id: conn.id,
        customerRef: conn.customer_ref,
        utility: conn.utility,
        authorizationStatus: conn.authorization_status,
        connectionStatus: conn.connection_status,
        authorizedAt: conn.authorized_at,
        lastSyncAt: conn.last_sync_at,
        lastSyncStatus: conn.last_sync_status,
        accountMatched: conn.authorization_status === "authorized",
        intervalDataAvailable: recordsReceived > 0,
        recordsReceived,
        syncBatches: totalRecords ?? 0,
        processingStatus: meta?.processing_status ?? null,
        verificationStatus: meta?.verification_status ?? null,
        lastError: conn.last_sync_status === "success" || conn.last_sync_status === null ? null : conn.last_sync_status,
      });
    }

    logEvent({ requestId, operation: "admin_connections", status: "ok" });
    return json({ connections: result });
  } catch (err) {
    if (err instanceof HttpError) return json({ error: err.message }, err.status);
    logEvent({ requestId, operation: "admin_connections", status: "error", errorCategory: "internal" });
    return json({ error: "Something went wrong." }, 500);
  }
});

class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
