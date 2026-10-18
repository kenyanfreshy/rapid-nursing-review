// Supabase Edge Function `book-page`: one page of "Rapid Nursing Review: All Body Systems at a
// Glance" at a time, for signed-in Pro accounts only.
//
// The private `book` storage bucket has no access policy, so this function (service role) is
// the only way to read it. The web app draws the page on a canvas with a watermark.
//   GET ?page=44   → the page image (image/webp), Cache-Control: no-store
// Per-account limits (optional secrets, defaults): BOOK_MAX_HOUR=120, BOOK_MAX_DAY=400 page views.
//
// Deploy: npx supabase functions deploy book-page --no-verify-jwt   (the JWT is checked here)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const PAGES = 196;
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};
const err = (msg: string, status: number) =>
  new Response(JSON.stringify({ error: msg }), { status, headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    return await handle(req);
  } catch (e) {
    console.error(e);
    return err(`Book page: server error (${(e as Error)?.message || e})`, 500);
  }
});

async function handle(req: Request): Promise<Response> {
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  const jwt = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!jwt) return err("Please sign in again.", 401);
  const { data: who } = await admin.auth.getUser(jwt);
  const uid = who?.user?.id;
  if (!uid) return err("Please sign in again.", 401);
  const { data: pro, error: proErr } = await admin.rpc("has_pro", { uid });
  if (proErr) return err(`Book page: couldn't check access (${proErr.message}).`, 500);
  if (!pro) return err("Rapid Nursing Review Pro is needed to read the book. Reload the page to check your subscription again.", 403);

  const page = Number(new URL(req.url).searchParams.get("page"));
  if (!Number.isInteger(page) || page < 1 || page > PAGES) return err("Bad request.", 400);

  const now = Date.now();
  const hourAgo = new Date(now - 3600e3).toISOString(), dayAgo = new Date(now - 86400e3).toISOString();
  const maxH = Number(Deno.env.get("BOOK_MAX_HOUR") ?? 120), maxD = Number(Deno.env.get("BOOK_MAX_DAY") ?? 400);
  const { count: inHour } = await admin.from("book_reads").select("id", { count: "exact", head: true }).eq("user_id", uid).gte("at", hourAgo);
  const { count: inDay } = await admin.from("book_reads").select("id", { count: "exact", head: true }).eq("user_id", uid).gte("at", dayAgo);
  if ((inHour ?? 0) >= maxH || (inDay ?? 0) >= maxD) return err("You've opened a lot of pages in a short time. Reading will continue shortly.", 429);
  await admin.from("book_reads").insert({ user_id: uid, page });

  const name = `rnr/pages/p${String(page).padStart(3, "0")}.webp`;
  const { data, error } = await admin.storage.from("book").download(name);
  if (error || !data) return err("Page not found. Were the book pages uploaded to the private `book` bucket?", 404);
  return new Response(data, {
    headers: { ...cors, "Content-Type": "image/webp", "Cache-Control": "no-store, private", "X-Content-Type-Options": "nosniff", "Content-Disposition": "inline" },
  });
}
