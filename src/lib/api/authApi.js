import { getProvider } from "./providers/providerFactory";

const provider = getProvider("auth");

export const authApi = {
  login: (...args) => provider.login(...args),
  logout: (...args) => provider.logout(...args),
  getCurrentUser: (...args) => provider.getCurrentUser(...args),
  updateCurrentUser: (...args) => provider.updateCurrentUser(...args),
  hasRole: (...args) => provider.hasRole(...args),
  redirectToLogin: (...args) => provider.redirectToLogin(...args),
};
