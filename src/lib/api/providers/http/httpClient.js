const productionApiBaseUrl = "https://api.frotatech.dev.br/api/v1";
const requestTimeoutMs = 30000;
const tokenStorageKey = "frotatech_access_token";

const envApiBaseUrl = () => (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.URL_BASE_API_VITE ||
  productionApiBaseUrl
);

const apiBaseUrl = () => envApiBaseUrl().replace(/\/$/, "");

const safeEndpoint = (path) => {
  const value = String(path || "");
  const [pathname] = value.split("?");
  return pathname || "/";
};

const requestLog = ({ url, path, method, status, message, durationMs }) => {
  console.error("[FrotaTech API]", {
    url,
    endpoint: safeEndpoint(path),
    method,
    status,
    message,
    durationMs,
  });
};

export class ApiRequestError extends Error {
  constructor(message, { status, endpoint, url, durationMs } = {}) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.endpoint = endpoint;
    this.url = url;
    this.durationMs = durationMs;
  }
}

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
  const method = options.method || "GET";
  const url = `${apiBaseUrl()}${path}`;
  const startedAt = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs || requestTimeoutMs);

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
      ...options,
      signal: controller.signal,
      body: options.body && typeof options.body !== "string" ? JSON.stringify(options.body) : options.body,
    });

    const durationMs = Date.now() - startedAt;

    if (!response.ok) {
      const message = await response.text();
      const errorMessage = message || `HTTP ${response.status}`;
      requestLog({ url, path, method, status: response.status, message: errorMessage, durationMs });
      throw new ApiRequestError(errorMessage, {
        status: response.status,
        endpoint: safeEndpoint(path),
        url,
        durationMs,
      });
    }

    if (response.status === 204) return null;
    return response.json();
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    const isAbort = error?.name === "AbortError";
    const status = error?.status || (isAbort ? 408 : undefined);
    const message = isAbort ? `Request timeout after ${options.timeoutMs || requestTimeoutMs}ms` : error?.message || "Network request failed";

    if (!(error instanceof ApiRequestError)) {
      requestLog({ url, path, method, status, message, durationMs });
    }

    if (error instanceof ApiRequestError) throw error;

    throw new ApiRequestError(message, {
      status,
      endpoint: safeEndpoint(path),
      url,
      durationMs,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

export const queryString = (params = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") search.set(key, value);
  });
  const value = search.toString();
  return value ? `?${value}` : "";
};
