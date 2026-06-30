import { httpRequest, queryString } from "./httpClient";

export const usersProvider = {
  listUsers: (options = {}) => httpRequest(`/users${queryString(options)}`),
  getCurrentUser: () => httpRequest("/auth/me"),
  inviteUser: (data) => httpRequest("/users/invitations", { method: "POST", body: data }),
  updateUser: (id, data) => httpRequest(`/users/${id}`, { method: "PATCH", body: data }),
  deleteUser: (id) => httpRequest(`/users/${id}`, { method: "DELETE" }),
};
