import { clone, mockUser } from "./mockData";

export const authProvider = {
  async login() {
    return clone(mockUser);
  },
  logout() {
    return { success: true };
  },
  async getCurrentUser() {
    return clone(mockUser);
  },
  async updateCurrentUser(data) {
    Object.assign(mockUser, data);
    return clone(mockUser);
  },
  async hasRole(role) {
    return mockUser.role === role;
  },
  redirectToLogin(redirectTo = "/redirect") {
    window.location.href = redirectTo;
  },
};
