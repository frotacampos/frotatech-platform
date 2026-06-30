import { httpRequest, queryString, setStoredAccessToken } from "./httpClient";

const cleanCpf = (cpf = "") => cpf.replace(/\D/g, "");
const toAppCitizen = (user = {}) => ({
  ...user,
  nome: user.name || user.full_name || user.email,
  telefone: user.phone,
  data_nascimento: user.birth_date,
  perfil: user.role,
  ativo: user.is_active,
});

export const citizensProvider = {
  loginCitizen: (cpf, dataNascimento) => httpRequest("/lumicity/citizens/login", { method: "POST", body: { cpf, dataNascimento } }),
  async createCitizen(data) {
    const token = await httpRequest("/auth/register-citizen", {
      method: "POST",
      body: {
        name: data.nome || data.name,
        email: data.email,
        password: data.password || data.senha,
        phone: data.telefone || data.phone,
        cpf: cleanCpf(data.cpf),
        birth_date: data.data_nascimento || data.birth_date,
      },
    });
    setStoredAccessToken(token?.access_token);
    return {
      success: true,
      cidadao: {
        nome: data.nome || data.name,
        email: data.email,
        cpf: cleanCpf(data.cpf),
        telefone: data.telefone || data.phone,
      },
      token,
    };
  },
  async getCitizenByCpf(cpf) {
    const users = await httpRequest(`/users${queryString({ role: "cidadao" })}`);
    return users.map(toAppCitizen).find((user) => cleanCpf(user.cpf || "") === cleanCpf(cpf)) || null;
  },
  async listCitizens() {
    const users = await httpRequest(`/users${queryString({ role: "cidadao" })}`);
    return users.map(toAppCitizen);
  },
  updateCitizen: (id, data) => httpRequest(`/users/${id}`, { method: "PATCH", body: { role: data.perfil || data.role, ...data } }),
  deleteCitizen: (id) => httpRequest(`/users/${id}`, { method: "DELETE" }),
};
