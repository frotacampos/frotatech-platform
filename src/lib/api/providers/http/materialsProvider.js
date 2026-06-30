import { httpRequest, queryString } from "./httpClient";

export const materialsProvider = {
  listMaterials: (options = {}) => httpRequest(`/lumicity/materials${queryString(options)}`),
  getMaterial: (id) => httpRequest(`/lumicity/materials/${id}`),
  createMaterial: (data) => httpRequest("/lumicity/materials", { method: "POST", body: data }),
  updateMaterial: (id, data) => httpRequest(`/lumicity/materials/${id}`, { method: "PATCH", body: data }),
  deleteMaterial: (id) => httpRequest(`/lumicity/materials/${id}`, { method: "DELETE" }),
};
