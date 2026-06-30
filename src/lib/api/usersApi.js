import { getProvider } from "./providers/providerFactory";

const provider = getProvider("users");

export const usersApi = {
  listUsers: (...args) => provider.listUsers(...args),
  getCurrentUser: (...args) => provider.getCurrentUser(...args),
  inviteUser: (...args) => provider.inviteUser(...args),
  updateUser: (...args) => provider.updateUser(...args),
  deleteUser: (...args) => provider.deleteUser(...args),
};
