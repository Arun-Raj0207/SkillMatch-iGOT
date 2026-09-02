const { createClient } = require('@supabase/supabase-js');

function sanitizeEnvValue(value) {
  if (!value) return value;
  // Strips normal whitespace plus characters that LOOK invisible but aren't
  // caught by .trim() — zero-width spaces, BOM, non-breaking spaces — which
  // commonly sneak in when a value is copy-pasted from a web page.
  return value
    .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, '')
    .trim();
}

const SUPABASE_URL = sanitizeEnvValue(process.env.SUPABASE_URL);
const SUPABASE_ANON_KEY = sanitizeEnvValue(process.env.SUPABASE_ANON_KEY);

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variable. Check Backend/.env.'
  );
}

if (SUPABASE_URL.startsWith('postgresql://') || SUPABASE_URL.startsWith('postgres://')) {
  throw new Error(
    'SUPABASE_URL must be the Supabase project URL, not the Postgres connection string. Use https://<project-ref>.supabase.co'
  );
}

if (!/^https?:\/\//.test(SUPABASE_URL)) {
  throw new Error('SUPABASE_URL must start with http:// or https://');
}

// Deliberately using the anon key, not the service role key. Every request
// this client makes gets scoped by the calling user's own access token (see
// middleware/auth.js), so the existing Row Level Security policies on
// `profiles` and `competency_assessments` keep applying exactly as they do
// from the frontend. There is no privileged bypass here on purpose.
function getSupabaseForRequest(accessToken) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// A client with no user token attached, used only for verifying tokens
// (auth.getUser) in the auth middleware before a per-request client exists.
const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

module.exports = {
  getSupabaseForRequest,
  supabaseAnon,
};