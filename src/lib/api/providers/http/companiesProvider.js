import { httpRequest, queryString } from "./httpClient";

export const companiesProvider = {
  listCompanies: (options = {}) => httpRequest(`/lumicity/companies${queryString(options)}`),
  createCompany: (data) => httpRequest("/lumicity/companies", { method: "POST", body: data }),
  updateCompany: (id, data) => httpRequest(`/lumicity/companies/${id}`, { method: "PATCH", body: data }),
  deleteCompany: (id) => httpRequest(`/lumicity/companies/${id}`, { method: "DELETE" }),
};
