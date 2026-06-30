import { clone, mockMaterials, nextId } from "./mockData";

export const materialsProvider = {
  async listMaterials(options = {}) {
    return clone(options.limit ? mockMaterials.slice(0, options.limit) : mockMaterials);
  },
  async getMaterial(id) {
    return clone(mockMaterials.find((item) => item.id === id) || null);
  },
  async createMaterial(data) {
    const item = { id: nextId("mat"), ativo: true, ...data };
    mockMaterials.push(item);
    return clone(item);
  },
  async updateMaterial(id, data) {
    const idx = mockMaterials.findIndex((item) => item.id === id);
    if (idx >= 0) mockMaterials[idx] = { ...mockMaterials[idx], ...data };
    return clone(mockMaterials[idx] || null);
  },
  async deleteMaterial(id) {
    return this.updateMaterial(id, { ativo: false });
  },
};
