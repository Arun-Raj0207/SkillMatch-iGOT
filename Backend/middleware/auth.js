const { supabaseAnon, getSupabaseForRequest } = require('../config/supabaseClient');

/**
 * Verifies the `Authorization: Bearer <token>` header against Supabase,
 * attaches the resulting user and a per-request Supabase client (scoped to
 * that user's token, so RLS applies) to req, and rejects the request
 * otherwise. Every route except /api/health should sit behind this.
 */
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header.' });
  }

  try {
    const { data, error } = await supabaseAnon.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({ error: 'Invalid or expired session.' });
    }

    req.user = data.user;
    req.accessToken = token;
    req.supabase = getSupabaseForRequest(token);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Failed to verify session.', detail: err.message });
  }
}

module.exports = { requireAuth };
