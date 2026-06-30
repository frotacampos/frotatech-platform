import { base44 } from "@/api/base44Client";

export const companiesProvider = {
  listCompanies: (options = {}) => base44.entities.Empresa.list(options.orderBy || "-created_date", options.limit),
  createCompany: (data) => base44.entities.Empresa.create(data),
  updateCompany: (id, data) => base44.entities.Empresa.update(id, data),
  deleteCompany: (id) => base44.entities.Empresa.update(id, { ativa: false }),
};
