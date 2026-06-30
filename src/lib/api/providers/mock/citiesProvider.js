import { clone, mockCities, nextId } from "./mockData";

export const citiesProvider = {
  async listCities(options = {}) {
    return clone(options.limit ? mockCities.slice(0, options.limit) : mockCities);
  },
  async createCity(data) {
    const item = { id: nextId("city"), ativa: true, ...data };
    mockCities.push(item);
    return clone(item);
  },
  async updateCity(id, data) {
    const idx = mockCities.findIndex((item) => item.id === id);
    if (idx >= 0) mockCities[idx] = { ...mockCities[idx], ...data };
    return clone(mockCities[idx] || null);
  },
  async deleteCity(id) {
    return this.updateCity(id, { ativa: false });
  },
};
