const validApiModes = new Set(["base44", "mock", "http"]);

const productionHosts = new Set([
  "lumicity.frotatech.dev.br",
  "staging-lumicity.frotatech.dev.br",
]);

const isProductionHost = () => {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return productionHosts.has(host) || host.endsWith(".frotatech.dev.br");
};

export const getRuntimeApiMode = () => {
  const envMode = String(import.meta.env.VITE_API_MODE || "").trim().toLowerCase();
  if (validApiModes.has(envMode)) return envMode;
  return isProductionHost() ? "http" : "base44";
};

export const isHttpApiMode = () => getRuntimeApiMode() === "http";
