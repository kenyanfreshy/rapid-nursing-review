// Supabase Edge Function `entitlement`: does the signed-in account have Rapid Nursing Review Pro?
//
// The iPhone app calls Purchases.logIn(<Supabase user id>) after Sign in with Apple, so a
// subscription bought in the app is attached to that id in RevenueCat. This function asks
// RevenueCat with the SECRET key (kept only in Supabase secrets), mirrors the answer into
// public.pro_access (which unlocks the private question bank and the book-page function),
// and returns { active, productId, expiresAt, store }.
//
// Deploy (the function checks the JWT itself; the gateway check would reject Apple sessions):
//   npx supabase functions deploy entitlement --no-verify-jwt
// Secrets (typed in Terminal with `read -s`, never pasted into chat):
//   RC_SECRET_KEY = RevenueCat secret API key (sk_…)
//   RC_ENTITLEMENT = pro   (optional; default "pro")
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    return await handle(req);
  } catch (e) {
    console.error("entitlement", e);
    // Always answer with CORS headers so the browser shows this message, not "Load failed".
    // Details stay in the function logs (Supabase → Edge Functions → entitlement → Logs).
    return json({ error: "Subscription check: server error. Try again in a minute." }, 500);
  }
});

async function handle(req: Request): Promise<Response> {
  const url = Deno.env.get("SUPABASE_URL")!;
  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });

  const jwt = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!jwt) return json({ error: "Please sign in again." }, 401);
  const { data: who, error } = await admin.auth.getUser(jwt);
  if (error || !who?.user) return json({ error: "Please sign in again." }, 401);
  const uid = who.user.id;

  // Recently confirmed: answer from the mirror without calling RevenueCat again.
  const { data: cached } = await admin.from("pro_access").select("product_id, expires_at, checked_at").eq("user_id", uid).maybeSingle();
  if (cached && Date.now() - Date.parse(cached.checked_at) < 60_000 && (!cached.expires_at || Date.parse(cached.expires_at) > Date.now())) {
    return json({ active: true, productId: cached.product_id, expiresAt: cached.expires_at ? Date.parse(cached.expires_at) : null, store: null });
  }
  // At most ENTITLEMENT_MAX_HOUR checks per account per hour (default 30).
  const { data: allowed, error: limErr } = await admin.rpc("claim_entitlement_check", { p_uid: uid, p_max_hour: Number(Deno.env.get("ENTITLEMENT_MAX_HOUR") ?? 30) });
  if (limErr) { console.error("claim_entitlement_check", limErr); return json({ error: "Subscription check: server setup incomplete. Did you run backend/supabase.sql?" }, 500); }
  if (!allowed) return json({ error: "Too many subscription checks in a short time. Try again in a few minutes." }, 429);

  const ent = (Deno.env.get("RC_ENTITLEMENT") ?? "pro").trim() || "pro";
  const rcKey = (Deno.env.get("RC_SECRET_KEY") ?? "").trim();
  // A masked copy ("sk_••••") or a key with spaces/quotes crashes the HTTP header; catch it here.
  if (!/^sk_[\x21-\x7e]{10,}$/.test(rcKey)) {
    return json({ error: "Server setup: RC_SECRET_KEY is missing or has extra characters. Set it again with the full RevenueCat secret key (starts with sk_)." }, 500);
  }

  let rc: Response;
  try {
    rc = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(uid)}`, {
      headers: { Authorization: `Bearer ${rcKey}`, "Content-Type": "application/json" },
      signal: AbortSignal.timeout(15000),
    });
  } catch (e) {
    console.error("revenuecat fetch", e);
    return json({ error: "Couldn't reach RevenueCat for the subscription check. Try again in a minute." }, 502);
  }
  if (rc.status === 401 || rc.status === 403) return json({ error: "Server setup: RevenueCat rejected RC_SECRET_KEY. Check it's the secret key of the Rapid Nursing Review project." }, 500);
  if (!rc.ok) return json({ error: `Subscription check failed (RevenueCat ${rc.status}). Try again in a minute.` }, 502);

  const body = await rc.json();
  const e = body?.subscriber?.entitlements?.[ent];
  const expires = e?.expires_date ? Date.parse(e.expires_date) : null;
  const grace = e?.grace_period_expires_date ? Date.parse(e.grace_period_expires_date) : null;
  const until = grace && expires ? Math.max(grace, expires) : expires;
  const active = !!e && (until === null || until > Date.now());

  if (active) {
    const { error: upErr } = await admin.from("pro_access").upsert({
      user_id: uid,
      product_id: e.product_identifier ?? null,
      expires_at: until ? new Date(until).toISOString() : null,
      checked_at: new Date().toISOString(),
    });
    if (upErr) { console.error("pro_access upsert", upErr); return json({ error: "Subscription check: couldn't record access. Did you run backend/supabase.sql?" }, 500); }
  } else {
    await admin.from("pro_access").delete().eq("user_id", uid);
  }
  const store = e ? (body.subscriber.subscriptions?.[e.product_identifier]?.store ?? (body.subscriber.non_subscriptions ? "app_store" : null)) : null;
  return json({ active, productId: e?.product_identifier ?? null, expiresAt: until, store });
}
