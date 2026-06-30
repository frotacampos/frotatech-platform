import { getProvider } from "./providers/providerFactory";

const provider = getProvider("citizens");

export const citizensApi = {
  loginCitizen: (...args) => provider.loginCitizen(...args),
  createCitizen: (...args) => provider.createCitizen(...args),
  getCitizenByCpf: (...args) => provider.getCitizenByCpf(...args),
  listCitizens: (...args) => provider.listCitizens(...args),
  updateCitizen: (...args) => provider.updateCitizen(...args),
  deleteCitizen: (...args) => provider.deleteCitizen(...args),
};
