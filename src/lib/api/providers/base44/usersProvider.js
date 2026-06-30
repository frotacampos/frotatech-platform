import { base44 } from "@/api/base44Client";

export const usersProvider = {
  listUsers: (options = {}) => base44.entities.User.list(options.orderBy, options.limit),
  getCurrentUser: () => base44.auth.me(),
  inviteUser(data) {
    const email = typeof data === "string" ? data : data.email;
    const role = typeof data === "string" ? undefined : data.role;
    return base44.users.inviteUser(email, role);
  },
  updateUser: (id, data) => base44.entities.User.update(id, data),
  deleteUser: (id) => base44.entities.User.delete(id),
};
