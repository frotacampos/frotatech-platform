import { base44 } from "@/api/base44Client";

export const citizensProvider = {
  async loginCitizen(cpf, dataNascimento) {
    const result = await base44.functions.invoke("cidadaoAuth", { action: "login", cpf, data_nascimento: dataNascimento });
    return result.data;
  },
  async createCitizen(data) {
    const result = await base44.functions.invoke("cidadaoAuth", { action: "cadastrar", ...data });
    return result.data;
  },
  async getCitizenByCpf(cpf) {
    const cpfLimpo = (cpf || "").replace(/\D/g, "");
    const items = await base44.entities.CidadaoCadastro.filter({ cpf: cpfLimpo });
    return items?.[0] || null;
  },
  listCitizens: (options = {}) => base44.entities.CidadaoCadastro.list(options.orderBy || "-created_date", options.limit),
  updateCitizen: (id, data) => base44.entities.CidadaoCadastro.update(id, data),
  deleteCitizen: (id) => base44.entities.CidadaoCadastro.delete(id),
};
