import { clone, mockUser, mockUsers } from "./mockData";

export const usersProvider = {
  async listUsers(options = {}) {
    return clone(options.limit ? mockUsers.slice(0, options.limit) : mockUsers);
  },
  async getCurrentUser() {
    return clone(mockUser);
  },
  async inviteUser(data) {
    return { success: true, email: data.email || data, role: data.role };
  },
  async updateUser(id, data) {
    const idx = mockUsers.findIndex((item) => item.id === id);
    if (idx >= 0) mockUsers[idx] = { ...mockUsers[idx], ...data };
    return clone(mockUsers[idx] || null);
  },
  async deleteUser(id) {
    const idx = mockUsers.findIndex((item) => item.id === id);
    if (idx >= 0) mockUsers.splice(idx, 1);
    return { success: true };
  },
};
