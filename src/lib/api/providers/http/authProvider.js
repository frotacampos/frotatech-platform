import { httpRequest, setStoredAccessToken } from "./httpClient";

const toAppUser = (user = {}) => ({
  ...user,
  full_name: user.full_name || user.name || user.email || "Usuario",
  nome: user.name || user.full_name || user.email || "Usuario",
  telefone: user.phone,
  data_nascimento: user.birth_date,
});

export const authProvider = {
  async login(email, password) {
    const token = await httpRequest("/auth/login", { method: "POST", body: { email, password } });
    setStoredAccessToken(token?.access_token);
    return token;
  },
  logout: () => {
    setStoredAccessToken(null);
    return Promise.resolve();
  },
  async getCurrentUser() {
    return toAppUser(await httpRequest("/auth/me"));
  },
  updateCurrentUser: (data) => httpRequest("/auth/me", { method: "PATCH", body: data }),
  async hasRole(role) {
    const user = await httpRequest("/auth/me");
    return user?.role === role;
  },
  redirectToLogin: () => Promise.resolve(),
};
