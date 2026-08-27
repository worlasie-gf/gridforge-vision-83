import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { getUtilityAdapter, UtilityNotConfiguredError } from "../_shared/utility-adapter.ts";
import { getAuthenticatedUser, pkceChallenge, randomToken, serviceClient, logEvent } from "../_shared/guards.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const requestId = crypto.randomUUID();

  try {
    if (req.method !== "POST") throw new HttpError(405, "Method not allowed");
    const user = await getAuthenticatedUser(req);
    if (!user) throw new HttpError(401, "Unauthorized");

    const state = randomToken(32);
    const codeVerifier = randomToken(48);
    const codeChallenge = await pkceChallenge(codeVerifier);

    const db = serviceClient();
    const { error: insertError } = await db.from("utility_oauth_states").insert({
      state,
      code_verifier: codeVerifier,
      user_id: user.id,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 min
    });
    if (insertError) throw new HttpError(500, "Could not start authorization");

    const redirectUri = Deno.env.get("PGE_REDIRECT_URI") ?? "";
    if (!redirectUri) throw new UtilityNotConfiguredError("Missing configuration: PGE_REDIRECT_URI");

    const url = await getUtilityAdapter().buildAuthorizeUrl({ state, codeChallenge, redirectUri });

    logEvent({ requestId, operation: "authorize_start", status: "ok" });
    return json({ url });
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
    logEvent({ requestId, operation: "authorize_start", status: "not_configured" });
    return json({ error: "PG&E connection is not available yet. Please check back soon." }, 503);
  }
  if (err instanceof HttpError) {
    return json({ error: err.message }, err.status);
  }
  logEvent({ requestId, operation: "authorize_start", status: "error", errorCategory: "internal" });
  return json({ error: "Something went wrong. Please try again." }, 500);
}
