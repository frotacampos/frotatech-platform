import { clone, mockCompanies, nextId } from "./mockData";

export const companiesProvider = {
  async listCompanies(options = {}) {
    return clone(options.limit ? mockCompanies.slice(0, options.limit) : mockCompanies);
  },
  async createCompany(data) {
    const item = { id: nextId("emp"), ativa: true, ...data };
    mockCompanies.push(item);
    return clone(item);
  },
  async updateCompany(id, data) {
    const idx = mockCompanies.findIndex((item) => item.id === id);
    if (idx >= 0) mockCompanies[idx] = { ...mockCompanies[idx], ...data };
    return clone(mockCompanies[idx] || null);
  },
  async deleteCompany(id) {
    return this.updateCompany(id, { ativa: false });
  },
};
