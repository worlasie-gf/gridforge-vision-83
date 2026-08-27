// Shared auth/role helpers for utility + admin edge functions.
import { createClient } from "npm:@supabase/supabase-js@2";

export function serviceClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

export async function getAuthenticatedUser(req: Request): Promise<{ id: string } | null> {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const client = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { data, error } = await client.auth.getUser(token);
  if (error || !data?.user) return null;
  return { id: data.user.id };
}

export async function userHasRole(userId: string, role: "admin" | "utility_data_viewer" | "customer"): Promise<boolean> {
  const { data, error } = await serviceClient().rpc("has_role", { _user_id: userId, _role: role });
  if (error) return false;
  return data === true;
}

export function logEvent(fields: Record<string, string | number | boolean | undefined>) {
  // Sanitized logging only: request id, connection id, operation, status,
  // error category. Never tokens, codes, secrets, or raw utility data.
  console.log(JSON.stringify({ ts: new Date().toISOString(), ...fields }));
}

export function randomToken(bytes = 32): string {
  const arr = crypto.getRandomValues(new Uint8Array(bytes));
  let s = "";
  for (const b of arr) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function pkceChallenge(verifier: string): Promise<string> {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)));
  let s = "";
  for (const b of digest) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
