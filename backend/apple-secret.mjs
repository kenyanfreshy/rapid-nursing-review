// Makes the "Secret Key (for OAuth)" that Supabase needs for Sign in with Apple on the web.
// Runs on your Mac; the .p8 key never leaves your computer, and the result is copied straight
// to the clipboard by the Terminal command in mobile/WEB_APP_SETUP.md (never paste it in chat).
//
//   node backend/apple-secret.mjs <TEAM_ID> <KEY_ID> <path/to/AuthKey_XXXX.p8> [services id]
//
// Apple allows at most 6 months, so this makes one valid for 180 days. Run it again before it
// expires and paste the new value into Supabase (Authentication → Sign In / Providers → Apple).
import fs from "node:fs";
import crypto from "node:crypto";

const [teamId, keyId, p8, clientId = "com.alexkorir.rnr.web"] = process.argv.slice(2);
if (!teamId || !keyId || !p8) {
  console.error("Usage: node backend/apple-secret.mjs <TEAM_ID> <KEY_ID> <AuthKey.p8> [services id]");
  process.exit(1);
}
const b64 = (o) => Buffer.from(typeof o === "string" ? o : JSON.stringify(o)).toString("base64url");
const now = Math.floor(Date.now() / 1000);
const days = 180;
const head = b64({ alg: "ES256", kid: keyId, typ: "JWT" });
const body = b64({ iss: teamId, iat: now, exp: now + days * 86400, aud: "https://appleid.apple.com", sub: clientId });
const sig = crypto.sign("sha256", Buffer.from(`${head}.${body}`), { key: fs.readFileSync(p8, "utf8"), dsaEncoding: "ieee-p1363" }).toString("base64url");
process.stdout.write(`${head}.${body}.${sig}`);
const until = new Date((now + days * 86400) * 1000);
console.error(`\nApple client secret for ${clientId}, valid until ${until.toDateString()}.`);
console.error(`Set a reminder to make a new one before ${new Date(until.getTime() - 14 * 86400e3).toDateString()}.`);
