import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { getUtilityAdapter } from "../_shared/utility-adapter.ts";
import { decryptSecret } from "../_shared/crypto.ts";
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

    const user = await getAuthenticatedUser(req);
    if (!user) throw new HttpError(401, "Unauthorized");

    const db = serviceClient();
    const { data: connection } = await db
      .from("utility_connections")
      .select("id, user_id")
      .eq("id", connectionId)
      .maybeSingle();
    if (!connection) throw new HttpError(404, "Not found");

    const isOwner = connection.user_id === user.id;
    const isAdmin = !isOwner && (await userHasRole(user.id, "admin"));
    if (!isOwner && !isAdmin) throw new HttpError(404, "Not found");

    // Best-effort upstream revocation; local revocation proceeds regardless.
    try {
      const { data: tokenRow } = await db
        .from("utility_oauth_tokens")
        .select("access_token_encrypted")
        .eq("connection_id", connectionId)
        .maybeSingle();
      if (tokenRow) {
        await getUtilityAdapter().revokeAuthorization(await decryptSecret(tokenRow.access_token_encrypted));
      }
    } catch {
      logEvent({ requestId, operation: "revoke", connectionId, status: "upstream_revoke_failed" });
    }

    await db.from("utility_oauth_tokens").delete().eq("connection_id", connectionId);
    await db.from("utility_authorizations")
      .update({ status: "revoked", revoked_at: new Date().toISOString() })
      .eq("connection_id", connectionId)
      .eq("status", "active");
    await db.from("utility_connections").update({
      authorization_status: "revoked",
      connection_status: "inactive",
    }).eq("id", connectionId);

    logEvent({ requestId, operation: "revoke", connectionId, status: "ok" });
    return json({ ok: true });
  } catch (err) {
    if (err instanceof HttpError) return json({ error: err.message }, err.status);
    logEvent({ requestId, operation: "revoke", status: "error", errorCategory: "internal" });
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
});

class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
