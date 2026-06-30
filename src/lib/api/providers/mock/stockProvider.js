import { clone, mockMovements, nextId } from "./mockData";

export const stockProvider = {
  async listMovements(options = {}) {
    const items = options.filters
      ? mockMovements.filter((item) => Object.entries(options.filters).every(([key, value]) => item[key] === value))
      : mockMovements;
    return clone(options.limit ? items.slice(0, options.limit) : items);
  },
  async createMovement(data) {
    const item = { id: nextId("mov"), created_date: new Date().toISOString(), ...data };
    mockMovements.unshift(item);
    return clone(item);
  },
  async getMovementsByMaterial(materialId) {
    return clone(mockMovements.filter((item) => item.material_id === materialId));
  },
};
