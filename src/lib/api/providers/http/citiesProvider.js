import { httpRequest, queryString } from "./httpClient";

export const citiesProvider = {
  listCities: (options = {}) => httpRequest(`/lumicity/cities${queryString(options)}`),
  createCity: (data) => httpRequest("/lumicity/cities", { method: "POST", body: data }),
  updateCity: (id, data) => httpRequest(`/lumicity/cities/${id}`, { method: "PATCH", body: data }),
  deleteCity: (id) => httpRequest(`/lumicity/cities/${id}`, { method: "DELETE" }),
};
