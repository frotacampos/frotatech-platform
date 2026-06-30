import { httpRequest, queryString } from "./httpClient";

export const stockProvider = {
  listMovements: (options = {}) => httpRequest(`/lumicity/stock/movements${queryString({ orderBy: options.orderBy, limit: options.limit, ...options.filters })}`),
  createMovement: (data) => httpRequest("/lumicity/stock/movements", { method: "POST", body: data }),
  getMovementsByMaterial: (materialId) => httpRequest(`/lumicity/materials/${materialId}/movements`),
};
