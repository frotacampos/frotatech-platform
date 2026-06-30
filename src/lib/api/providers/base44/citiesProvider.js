import { base44 } from "@/api/base44Client";

export const citiesProvider = {
  listCities: (options = {}) => base44.entities.Cidade.list(options.orderBy || "nome", options.limit),
  createCity: (data) => base44.entities.Cidade.create(data),
  updateCity: (id, data) => base44.entities.Cidade.update(id, data),
  deleteCity: (id) => base44.entities.Cidade.update(id, { ativa: false }),
};
