// Server-side Pro authorization test for Rapid Nursing Review: the real `entitlement` Edge Function
// (supabase/functions/entitlement/index.ts) and the real backend/supabase.sql, run against a DISPOSABLE local
// PostgreSQL cluster (created in a temp dir and deleted afterwards; never a Supabase project).
//
//   node tests/entitlement_server_test.mjs
//
// Needs: PostgreSQL server binaries (initdb, pg_ctl, postgres, psql) on PATH or in PG_BIN, and esbuild (ESBUILD=path).
// As root, set PG_RUNAS=<unprivileged user> (PostgreSQL refuses to run as root).
//
// What is real: the SQL (tables, has_pro(), has_pro_for(), rate limit), the function's code. What is simulated:
// the Supabase client (a small adapter that runs the same operations as SQL through psql), the Supabase auth
// lookup (JWT → user id), and RevenueCat's REST answers (scripted per test, including delays for races).
// Exit codes: 0 all passed · 1 a check failed · 2 BLOCKED (no PostgreSQL / esbuild).
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, rmSync, chmodSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const BIN = process.env.PG_BIN || ["/usr/lib/postgresql/17/bin", "/usr/lib/postgresql/16/bin", "/opt/homebrew/bin", "/usr/local/bin"].find((d) => existsSync(join(d, "initdb"))) || "";
const tool = (n) => (BIN ? join(BIN, n) : n);
if (spawnSync(tool("initdb"), ["--version"]).status !== 0) { console.log("BLOCKED: PostgreSQL initdb not found (set PG_BIN). Nothing was verified."); process.exit(2); }
const RUNAS = process.getuid && process.getuid() === 0 ? process.env.PG_RUNAS : null;
if (process.getuid && process.getuid() === 0 && !RUNAS) { console.log("BLOCKED: running as root; set PG_RUNAS=<unprivileged user>. Nothing was verified."); process.exit(2); }
const as = (cmd, args, opts = {}) => RUNAS ? execFileSync("runuser", ["-u", RUNAS, "--", cmd, ...args], opts) : execFileSync(cmd, args, opts);

// ── Disposable cluster ──
const dir = mkdtempSync(join(tmpdir(), "rnr-pg-")); chmodSync(dir, 0o777);
const data = join(dir, "data"), sock = dir, port = String(54000 + (process.pid % 1000));
as(tool("initdb"), ["-D", data, "-A", "trust", "-U", "postgres", "--no-sync"], { stdio: "ignore" });
as(tool("pg_ctl"), ["-D", data, "-l", join(dir, "log"), "-w", "-o", `-k ${sock} -p ${port} -c listen_addresses=''`, "start"], { stdio: "ignore" });
const cleanup = () => { try { as(tool("pg_ctl"), ["-D", data, "-m", "immediate", "stop"], { stdio: "ignore" }); } catch {} rmSync(dir, { recursive: true, force: true }); };
process.on("exit", cleanup);
const psql = (sql) => execFileSync(tool("psql"), ["-h", sock, "-p", port, "-U", "postgres", "-d", "postgres", "-X", "-q", "-t", "-A", "-v", "ON_ERROR_STOP=1", "-c", sql], { encoding: "utf8" }).trim();
const lit = (v) => v === null || v === undefined ? "null" : typeof v === "number" || typeof v === "boolean" ? String(v) : `'${String(v).replace(/'/g, "''")}'`;

// Minimal stand-ins for the Supabase-provided schemas the SQL file refers to (auth.users, auth.uid(), storage).
psql(`
  create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
  create schema auth; create table auth.users (id uuid primary key);
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  create schema storage; create table storage.buckets (id text primary key, name text, public boolean);
  create table storage.objects (id bigserial primary key, bucket_id text, name text); alter table storage.objects enable row level security;`);
psql(readFileSync(join(ROOT, "backend/supabase.sql"), "utf8"));

// ── Supabase client adapter (service role: runs SQL directly) ──
const TOKENS = new Map();   // jwt → user id
function fakeClient() {
  const table = (t) => {
    const q = { t, where: [], kind: "select", cols: "*" };
    const b = {
      select(cols) { q.cols = cols; return b; },
      eq(c, v) { q.where.push(`${c} = ${lit(v)}`); return b; },
      async maybeSingle() {
        const out = psql(`select coalesce(row_to_json(x)::text, '') from (select ${q.cols} from public.${t} where ${q.where.join(" and ") || "true"} limit 1) x`);
        return { data: out ? JSON.parse(out) : null, error: null };
      },
      async upsert(row) {
        const cols = Object.keys(row);
        try { psql(`insert into public.${t} (${cols.join(",")}) values (${cols.map((c) => lit(row[c])).join(",")}) on conflict (user_id) do update set ${cols.filter((c) => c !== "user_id").map((c) => `${c} = excluded.${c}`).join(", ")}`); return { error: null }; }
        catch (e) { return { error: { message: String(e.stderr || e) } }; }
      },
      delete() { q.kind = "delete"; const d = { eq: async (c, v) => { psql(`delete from public.${t} where ${c} = ${lit(v)}`); return { error: null }; } }; return d; },
    };
    return b;
  };
  return {
    auth: { async getUser(jwt) { const id = TOKENS.get(jwt); return id ? { data: { user: { id } }, error: null } : { data: null, error: { message: "bad jwt" } }; } },
    from: table,
    async rpc(name, args) {
      try {
        const out = psql(`select to_json(public.${name}(${Object.entries(args).map(([k, v]) => `${k} => ${lit(v)}`).join(", ")}))::text`);
        return { data: JSON.parse(out), error: null };
      } catch (e) { return { data: null, error: { message: String(e.stderr || e) } }; }
    },
  };
}
globalThis.__fakeSupabase = { createClient: () => fakeClient() };

// ── RevenueCat (scripted) ──
let rcScript = [];   // queue of { status, body, delayMs } or "throw"
let rcCalls = 0;
globalThis.fetch = async (url) => {
  if (!String(url).startsWith("https://api.revenuecat.com/v1/subscribers/")) throw new Error("unexpected fetch " + url);
  rcCalls++;
  const step = rcScript.shift() ?? { status: 500, body: {} };
  if (step.gate) await step.gate;
  if (step === "throw" || step.throw) throw new Error("network down");
  return new Response(JSON.stringify(step.body ?? {}), { status: step.status ?? 200 });
};
const DAY = 864e5, iso = (ms) => new Date(ms).toISOString();
const rcActive = (o = {}) => ({ status: 200, body: { subscriber: { entitlements: { pro: { product_identifier: "com.alexkorir.rapidnursingreview.pro.monthly", expires_date: iso(Date.now() + 20 * DAY), ...o } }, subscriptions: {} } } });
const rcNone = () => ({ status: 200, body: { subscriber: { entitlements: {}, subscriptions: {} } } });

// ── Load the real function ──
const handlers = [];
globalThis.Deno = { serve: (h) => handlers.push(h), env: { get: (k) => ({ SUPABASE_URL: "http://local", SUPABASE_SERVICE_ROLE_KEY: "service", RC_SECRET_KEY: "sk_test_abcdefghijklmnop", ENTITLEMENT_MAX_HOUR: process.env.__MAXH || "30" })[k] } };
const shim = join(dir, "supabase-shim.mjs");
writeFileSync(shim, "export const createClient = (...a) => globalThis.__fakeSupabase.createClient(...a);\n");
const bundle = join(dir, "entitlement.mjs");
// Same source, with only the remote supabase-js import pointed at the adapter (esbuild can't alias a URL).
const src = readFileSync(join(ROOT, "supabase/functions/entitlement/index.ts"), "utf8");
const IMPORT = '"https://esm.sh/@supabase/supabase-js@2.45.4"';
if (!src.includes(IMPORT)) { console.log("FAIL the function no longer imports " + IMPORT + "; update this test"); process.exit(1); }
writeFileSync(join(dir, "entitlement.ts"), src.replace(IMPORT, JSON.stringify(shim)));
execFileSync(process.env.ESBUILD || "esbuild", [join(dir, "entitlement.ts"), "--bundle", "--format=esm", "--platform=neutral", `--outfile=${bundle}`, "--log-level=error"]);
await import(bundle);
const handler = handlers[0];
const quiet = console.error; console.error = () => {};
const call = async (jwt) => { const r = await handler(new Request("http://local/functions/v1/entitlement", { method: "POST", headers: jwt ? { Authorization: `Bearer ${jwt}` } : {} })); return { status: r.status, body: await r.json() }; };

let pass = 0, fail = 0;
const check = (n, ok) => { ok ? pass++ : fail++; console.log((ok ? "PASS " : "FAIL ") + n); };
const users = [];
const newUser = () => { const id = execFileSync("node", ["-e", "console.log(crypto.randomUUID())"], { encoding: "utf8" }).trim(); psql(`insert into auth.users values ('${id}')`); const jwt = "jwt-" + id; TOKENS.set(jwt, id); users.push(id); return { id, jwt }; };
const hasPro = (id) => psql(`select public.has_pro_for('${id}')`) === "t";
const hasProAsUser = (id) => psql(`begin; set local role authenticated; select set_config('request.jwt.claim.sub', '${id}', true); select public.has_pro(); commit;`).split("\n").filter(Boolean).pop() === "t";
const checkedAt = (id) => psql(`select coalesce(checked_at::text, '') from public.pro_access where user_id = '${id}'`);
const age = (id, hours) => psql(`update public.pro_access set checked_at = checked_at - interval '${hours} hours' where user_id = '${id}'`);

// 1. Active subscriber
let u = newUser(); rcScript = [rcActive()];
let r = await call(u.jwt);
check("active RevenueCat entitlement → active, recorded, has_pro true (service + signed-in user)", r.status === 200 && r.body.active && hasPro(u.id) && hasProAsUser(u.id));

// 2. Cached answers never renew the 24-hour timestamp
const t0 = checkedAt(u.id); const callsBefore = rcCalls;
r = await call(u.jwt);
check("second check within 60 s answers from the mirror without calling RevenueCat", r.body.active && rcCalls === callsBefore);
check("…and does not move checked_at", checkedAt(u.id) === t0);

// 3. Failed verification never extends authorization
age(u.id, 23); const aged = checkedAt(u.id);
for (const step of ["throw", { status: 500 }, { status: 502 }, { status: 429 }, { status: 401 }]) {
  rcScript = [step]; r = await call(u.jwt);
  check(`RevenueCat ${step === "throw" ? "unreachable" : step.status} → error answer, checked_at unchanged`, r.status >= 500 && checkedAt(u.id) === aged);
}
check("still Pro at 23 h after the last real confirmation (by design)", hasPro(u.id));
age(u.id, 1.1);
check("past 24 h since the last real confirmation → has_pro false, even though the row is still there and unexpired", !hasPro(u.id) && !hasProAsUser(u.id) && checkedAt(u.id) !== "");
rcScript = ["throw", "throw", "throw"]; for (let i = 0; i < 3; i++) await call(u.jwt);
check("repeated failed checks after 24 h do not bring access back", !hasPro(u.id));

// 4. Refund / revocation
u = newUser(); rcScript = [rcActive()]; await call(u.jwt);
rcScript = [rcNone()]; let n0 = rcCalls; r = await call(u.jwt);
check("within 60 s of a positive check the answer comes from the mirror (a refund is not visible yet)", r.body.active === true && rcCalls === n0);
rcScript = []; age(u.id, 0.02); rcScript = [rcNone()]; r = await call(u.jwt);
check("refund seen by RevenueCat → next real check answers inactive and has_pro false immediately", r.body.active === false && !hasPro(u.id));

// 5. Expired entitlement still listed with a past date
u = newUser(); rcScript = [rcActive({ expires_date: iso(Date.now() - DAY) })]; r = await call(u.jwt);
check("entitlement listed with a past expiry → inactive", r.body.active === false && !hasPro(u.id));
// 6. Grace period extends to the grace date
u = newUser(); rcScript = [rcActive({ expires_date: iso(Date.now() - DAY), grace_period_expires_date: iso(Date.now() + 2 * DAY) })]; r = await call(u.jwt);
check("billing grace period → active until the grace date", r.body.active && hasPro(u.id));
// 7. Lifetime still needs a confirmation every 24 h
u = newUser(); rcScript = [rcActive({ expires_date: null, product_identifier: "com.alexkorir.rapidnursingreview.pro.lifetime" })]; r = await call(u.jwt);
check("lifetime (no expiry) → active", r.body.active && r.body.expiresAt === null && hasPro(u.id));
age(u.id, 25);
check("lifetime also lapses on the web 24 h after the last confirmation", !hasPro(u.id));

// 8. Accounts are separate
const a = newUser(), b = newUser(); rcScript = [rcActive()]; await call(a.jwt);
check("one account's Pro never applies to another account", hasPro(a.id) && !hasPro(b.id) && !hasProAsUser(b.id));
r = await call("jwt-forged");
check("unknown/forged session → 401, nothing written", r.status === 401);

// 9. Stale response race: an older positive RevenueCat answer must not overwrite a newer negative one
u = newUser(); rcScript = [rcActive()]; await call(u.jwt); age(u.id, 1);
let release; const gate = new Promise((res) => (release = res));
rcScript = [{ ...rcActive(), gate }, rcNone()];
const slow = call(u.jwt);                 // A: reads RevenueCat first (still active), answer delayed
await new Promise((res) => setTimeout(res, 50));
const fast = await call(u.jwt);           // B: reads RevenueCat after the refund → inactive, writes first
release(); await slow;                    // A finishes last
check("race: a refund answer that finished first is not undone by an older 'active' answer finishing later", fast.body.active === false && !hasPro(u.id));

// 10. Rate limit: blocked checks don't renew
u = newUser(); rcScript = [rcActive()]; await call(u.jwt); age(u.id, 2);
const before = checkedAt(u.id);
psql(`insert into public.entitlement_checks(user_id) select '${u.id}' from generate_series(1, 40)`);
const n = rcCalls; r = await call(u.jwt);
check("over the hourly check limit → 429, RevenueCat not called, checked_at unchanged", r.status === 429 && rcCalls === n && checkedAt(u.id) === before);

// 11. Privileges and re-running the SQL over existing data (deployment safety)
let denied = false; try { psql(`begin; set local role authenticated; select public.record_pro_check('${u.id}', now(), true, 'x', null); commit;`); } catch { denied = true; }
check("signed-in users cannot call record_pro_check (service role only)", denied);
denied = false; try { psql(`begin; set local role authenticated; update public.pro_access set checked_at = now(); commit;`); } catch { denied = true; }
check("signed-in users cannot write pro_access directly", denied);
const snapshot = () => psql(`select string_agg(user_id || ':' || coalesce(expires_at::text,'null') || ':' || checked_at::text, ',' order by user_id) from public.pro_access`);
const accessNow = () => users.map((id) => hasPro(id) ? "1" : "0").join("");
const s0 = snapshot(), g0 = accessNow();
psql(readFileSync(join(ROOT, "backend/supabase.sql"), "utf8"));
check("re-running backend/supabase.sql keeps every pro_access row and every account's access unchanged", snapshot() === s0 && accessNow() === g0);
// A row written by the previous version of the function (no inactive rows, plain upsert) keeps working
const legacy = newUser(); psql(`insert into public.pro_access (user_id, product_id, expires_at, checked_at) values ('${legacy.id}', 'p', null, now() - interval '1 hour')`);
check("rows written by the previous function version still grant access", hasPro(legacy.id));
rcScript = [rcNone()]; r = await call(legacy.jwt);
check("…and a newer refund answer replaces them", r.body.active === false && !hasPro(legacy.id));

console.log(`\n${pass}/${pass + fail} checks passed (real SQL on a disposable PostgreSQL ${psql("show server_version")}, real entitlement function; Supabase client and RevenueCat simulated)`);
process.exit(fail ? 1 : 0);
