import { clone, mockReports, nextId } from "./mockData";

const byFilters = (items, filters = {}) => items.filter((item) => Object.entries(filters).every(([key, value]) => item[key] === value));

export const reportsProvider = {
  async listReports(options = {}) {
    const items = options.filters ? byFilters(mockReports, options.filters) : mockReports;
    return clone(options.limit ? items.slice(0, options.limit) : items);
  },
  async getReport(id) {
    return clone(mockReports.find((item) => item.id === id) || null);
  },
  async createReport(data) {
    const item = { id: nextId("rep"), created_date: new Date().toISOString(), ...data };
    mockReports.unshift(item);
    return clone(item);
  },
  async updateReport(id, data) {
    const idx = mockReports.findIndex((item) => item.id === id);
    if (idx >= 0) mockReports[idx] = { ...mockReports[idx], ...data };
    return clone(mockReports[idx] || null);
  },
  async deleteReport(id) {
    const idx = mockReports.findIndex((item) => item.id === id);
    if (idx >= 0) mockReports.splice(idx, 1);
    return { success: true };
  },
  async assignReport(id, operatorId, payload = {}) {
    return this.updateReport(id, { operador_id: operatorId, ...payload });
  },
  async changeStatus(id, status, payload = {}) {
    return this.updateReport(id, { ...payload, status });
  },
  subscribeReports() {
    return () => {};
  },
};
