const API_BASE_URL = window.location.origin;
const AUTH_STORAGE_KEY = "rosebookingAuth";

function getAuth() {
  return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY)) || null;
}

function setAuthSession(data) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
}

function clearAuthSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

function getToken() {
  const auth = getAuth();
  return auth ? auth.token : null;
}

function getSessionUser() {
  const auth = getAuth();
  return auth ? auth.user : null;
}

async function apiRequest(endpoint, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const message = payload && payload.message ? payload.message : "Request failed";
    throw new Error(message);
  }

  return payload;
}

window.RoseApi = {
  request: apiRequest,
  getAuth,
  setAuthSession,
  clearAuthSession,
  getToken,
  getSessionUser
};
