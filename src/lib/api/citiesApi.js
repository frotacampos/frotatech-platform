import { getProvider } from "./providers/providerFactory";

const provider = getProvider("cities");

export const citiesApi = {
  listCities: (...args) => provider.listCities(...args),
  createCity: (...args) => provider.createCity(...args),
  updateCity: (...args) => provider.updateCity(...args),
  deleteCity: (...args) => provider.deleteCity(...args),
};
