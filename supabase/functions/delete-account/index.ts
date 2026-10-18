// Supabase Edge Function `delete-account`: permanently deletes the signed-in account (Apple guideline
// 5.1.1(v): in-app account deletion). Uses the Auth admin API, so it works whatever the database role
// may do in the auth schema. Progress, Pro access and logs cascade; reports are kept anonymised.
//
// Sign in with Apple token revocation: when the iPhone sends a fresh Apple authorization code, this
// function exchanges it for a refresh token and revokes it with Apple (appleid.apple.com/auth/revoke),
// as Apple asks apps to do on deletion. Optional secrets (set in Terminal with `read -s`, never in chat):
//   APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_PRIVATE_KEY (the whole .p8 text), APPLE_BUNDLE_ID (default com.alexkorir.rapidnursingreview)
// Without them the account is still deleted; only the revocation is skipped (logged).
//
// Deploy: npx supabase functions deploy delete-account --no-verify-jwt   (the JWT is checked here)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    return await handle(req);
  } catch (e) {
    console.error("delete-account", e);
    return json({ error: "Account deletion: server error. Try again in a minute." }, 500);
  }
});

const b64url = (buf: ArrayBuffer | Uint8Array | string) => {
  const bytes = typeof buf === "string" ? new TextEncoder().encode(buf) : buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = ""; for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
async function appleClientSecret(teamId: string, keyId: string, p8: string, clientId: string) {
  const der = Uint8Array.from(atob(p8.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "")), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey("pkcs8", der, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const now = Math.floor(Date.now() / 1000);
  const head = b64url(JSON.stringify({ alg: "ES256", kid: keyId, typ: "JWT" }));
  const body = b64url(JSON.stringify({ iss: teamId, iat: now, exp: now + 300, aud: "https://appleid.apple.com", sub: clientId }));
  const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, new TextEncoder().encode(`${head}.${body}`));
  return `${head}.${body}.${b64url(sig)}`;
}
async function revokeApple(code: string): Promise<boolean> {
  const teamId = Deno.env.get("APPLE_TEAM_ID"), keyId = Deno.env.get("APPLE_KEY_ID"), p8 = Deno.env.get("APPLE_PRIVATE_KEY");
  const clientId = Deno.env.get("APPLE_BUNDLE_ID") ?? "com.alexkorir.rapidnursingreview";
  if (!teamId || !keyId || !p8) { console.warn("Apple revoke skipped: APPLE_TEAM_ID / APPLE_KEY_ID / APPLE_PRIVATE_KEY not set"); return false; }
  const secret = await appleClientSecret(teamId, keyId, p8, clientId);
  const form = (o: Record<string, string>) => ({ method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(o), signal: AbortSignal.timeout(15000) });
  const tok = await fetch("https://appleid.apple.com/auth/token", form({ client_id: clientId, client_secret: secret, code, grant_type: "authorization_code" }));
  const t = await tok.json().catch(() => ({}));
  const token = t.refresh_token || t.access_token;
  if (!tok.ok || !token) { console.warn("Apple token exchange failed", tok.status, t?.error); return false; }
  const rev = await fetch("https://appleid.apple.com/auth/revoke", form({ client_id: clientId, client_secret: secret, token, token_type_hint: t.refresh_token ? "refresh_token" : "access_token" }));
  if (!rev.ok) console.warn("Apple revoke failed", rev.status);
  return rev.ok;
}

async function handle(req: Request): Promise<Response> {
  if (req.method !== "POST") return json({ error: "Bad request." }, 405);
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  const jwt = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!jwt) return json({ error: "Please sign in again." }, 401);
  const { data: who } = await admin.auth.getUser(jwt);
  const uid = who?.user?.id;
  if (!uid) return json({ error: "Please sign in again." }, 401);

  let body: { appleAuthorizationCode?: unknown } = {};
  try { body = await req.json(); } catch { body = {}; }
  let appleRevoked = false;
  if (typeof body.appleAuthorizationCode === "string" && body.appleAuthorizationCode.length < 2000) {
    try { appleRevoked = await revokeApple(body.appleAuthorizationCode); } catch (e) { console.warn("Apple revoke error", e); }
  }

  const { error } = await admin.auth.admin.deleteUser(uid);
  if (error) { console.error("deleteUser", error); return json({ error: "Account deletion failed on the server. Try again, or email alexkorirbooks@gmail.com." }, 500); }
  return json({ deleted: true, appleRevoked });
}
