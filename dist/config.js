// Public settings for "Sync and web access". Only PUBLIC values belong here:
//   supabaseUrl   https://<project-ref>.supabase.co  (Supabase → Project Settings → API)
//   supabaseKey   the publishable key (sb_publishable_…) or legacy "anon public" key
// Never put the secret / service_role key, the RevenueCat secret key or any Apple key here.
//
// While these say REPLACE_ME, or appleSignIn is false, the app hides the Sign in with Apple card
// entirely and works exactly as before, so builds made before the backend is ready are safe to ship.
export const RNR_CONFIG = {
  supabaseUrl: 'https://REPLACE_ME.supabase.co',
  supabaseKey: 'REPLACE_ME',
  appleSignIn: false,
  webAppUrl: 'https://nclexrapidnursingreview.com/app/',
  supportEmail: 'alexkorirbooks@gmail.com',
};
