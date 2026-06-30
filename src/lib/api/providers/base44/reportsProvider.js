import { base44 } from "@/api/base44Client";

const normalizeListOptions = (options = {}) => ({
  orderBy: options.orderBy || options.sort || "-data_criacao",
  limit: options.limit,
  filters: options.filters,
});

export const reportsProvider = {
  async listReports(options = {}) {
    const { orderBy, limit, filters } = normalizeListOptions(options);
    if (filters && Object.keys(filters).length > 0) {
      return base44.entities.Reporte.filter(filters, orderBy, limit);
    }
    return base44.entities.Reporte.list(orderBy, limit);
  },
  async getReport(id) {
    const reports = await base44.entities.Reporte.filter({ id });
    return reports?.[0] || null;
  },
  createReport: (data) => base44.entities.Reporte.create(data),
  updateReport: (id, data) => base44.entities.Reporte.update(id, data),
  deleteReport: (id) => base44.entities.Reporte.delete(id),
  assignReport: (id, operatorId, payload = {}) => base44.entities.Reporte.update(id, { operador_id: operatorId, ...payload }),
  changeStatus: (id, status, payload = {}) => base44.entities.Reporte.update(id, { ...payload, status }),
  subscribeReports: (handler) => base44.entities.Reporte.subscribe(handler),
};
