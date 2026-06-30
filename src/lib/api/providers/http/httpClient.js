const apiBaseUrl = () => (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1").replace(/\/$/, "");
const tokenStorageKey = "frotatech_access_token";

export const getStoredAccessToken = () => {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem(tokenStorageKey);
};

export const setStoredAccessToken = (token) => {
  if (typeof localStorage === "undefined") return;
  if (token) localStorage.setItem(tokenStorageKey, token);
  else localStorage.removeItem(tokenStorageKey);
};

export async function httpRequest(path, options = {}) {
  const token = getStoredAccessToken();
  const response = await fetch(`${apiBaseUrl()}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
    body: options.body && typeof options.body !== "string" ? JSON.stringify(options.body) : options.body,
  });

  if (!response.ok) {
    const message = await response.text();
    const error = new Error(message || `HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) return null;
  return response.json();
}

export const queryString = (params = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") search.set(key, value);
  });
  const value = search.toString();
  return value ? `?${value}` : "";
};
