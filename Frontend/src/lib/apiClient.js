import { supabase } from "./supabaseClient";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error(
    "Missing VITE_API_BASE_URL env var. Add it to Frontend/.env, e.g. http://localhost:5000"
  );
}

async function getAccessToken() {
  const { data, error } = await supabase.auth.getSession();

  if (error || !data?.session?.access_token) {
    throw new Error("No active session. Log in before calling the API.");
  }

  return data.session.access_token;
}

/**
 * Thin wrapper around fetch that attaches the current Supabase session as a
 * Bearer token and points at the backend. Throws on non-2xx responses with
 * whatever error message the backend returned.
 */
async function apiRequest(path, { method = "GET", body } = {}) {
  const token = await getAccessToken();

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error || `Request failed with status ${res.status}`);
  }

  return data;
}

export const api = {
  getLatestAssessment: () => apiRequest("/api/competency/assess"),
  runAssessment: () => apiRequest("/api/competency/assess", { method: "POST" }),
};
