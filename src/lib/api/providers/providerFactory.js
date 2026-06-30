import * as base44Providers from "./base44";
import * as mockProviders from "./mock";
import * as httpProviders from "./http";

const providersByMode = {
  base44: base44Providers,
  mock: mockProviders,
  http: httpProviders,
};

const providerNames = {
  reports: "reportsProvider",
  materials: "materialsProvider",
  stock: "stockProvider",
  citizens: "citizensProvider",
  companies: "companiesProvider",
  cities: "citiesProvider",
  users: "usersProvider",
  auth: "authProvider",
  ai: "aiProvider",
  storage: "storageProvider",
};

export const getApiMode = () => {
  const mode = import.meta.env.VITE_API_MODE || "base44";
  return providersByMode[mode] ? mode : "base44";
};

export const getProvider = (providerName) => {
  const mode = getApiMode();
  const exportName = providerNames[providerName];
  const provider = providersByMode[mode]?.[exportName];

  if (!provider) {
    throw new Error(`Unknown API provider "${providerName}" for mode "${mode}"`);
  }

  return provider;
};
