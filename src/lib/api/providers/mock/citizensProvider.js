import { clone, mockCitizens, nextId } from "./mockData";

const cleanCpf = (cpf = "") => cpf.replace(/\D/g, "");

export const citizensProvider = {
  async loginCitizen(cpf, dataNascimento) {
    const citizen = mockCitizens.find((item) => item.cpf === cleanCpf(cpf) && item.data_nascimento === dataNascimento);
    return citizen ? { success: true, cidadao: clone(citizen) } : { success: false, error: "CPF ou data de nascimento incorretos." };
  },
  async createCitizen(data) {
    const item = { id: nextId("cid"), ativo: true, perfil: "cidadao", ...data, cpf: cleanCpf(data.cpf) };
    mockCitizens.push(item);
    return { success: true, cidadao: clone(item) };
  },
  async getCitizenByCpf(cpf) {
    return clone(mockCitizens.find((item) => item.cpf === cleanCpf(cpf)) || null);
  },
  async listCitizens(options = {}) {
    return clone(options.limit ? mockCitizens.slice(0, options.limit) : mockCitizens);
  },
  async updateCitizen(id, data) {
    const idx = mockCitizens.findIndex((item) => item.id === id);
    if (idx >= 0) mockCitizens[idx] = { ...mockCitizens[idx], ...data };
    return clone(mockCitizens[idx] || null);
  },
  async deleteCitizen(id) {
    const idx = mockCitizens.findIndex((item) => item.id === id);
    if (idx >= 0) mockCitizens.splice(idx, 1);
    return { success: true };
  },
};
