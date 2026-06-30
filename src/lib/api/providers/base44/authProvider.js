import { base44 } from "@/api/base44Client";

export const authProvider = {
  login: (_email, _password, redirectTo = window.location.href) => base44.auth.redirectToLogin(redirectTo),
  logout: (redirectTo = window.location.href) => base44.auth.logout(redirectTo),
  getCurrentUser: () => base44.auth.me(),
  updateCurrentUser: (data) => base44.auth.updateMe(data),
  async hasRole(role) {
    const user = await base44.auth.me();
    return user?.role === role;
  },
  redirectToLogin: (redirectTo = window.location.href) => base44.auth.redirectToLogin(redirectTo),
};
