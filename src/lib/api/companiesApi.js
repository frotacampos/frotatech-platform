import { getProvider } from "./providers/providerFactory";

const provider = getProvider("companies");

export const companiesApi = {
  listCompanies: (...args) => provider.listCompanies(...args),
  createCompany: (...args) => provider.createCompany(...args),
  updateCompany: (...args) => provider.updateCompany(...args),
  deleteCompany: (...args) => provider.deleteCompany(...args),
};
