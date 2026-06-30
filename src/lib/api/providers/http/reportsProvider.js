import { httpRequest, queryString } from "./httpClient";

const statusToApi = {
  Pendente: "aberto",
  "Em Andamento": "em_andamento",
  Resolvido: "resolvido",
  Cancelado: "cancelado",
};

const statusToApp = {
  aberto: "Pendente",
  em_andamento: "Em Andamento",
  resolvido: "Resolvido",
  cancelado: "Cancelado",
};

const priorityToApi = {
  baixa: "baixa",
  Baixa: "baixa",
  media: "media",
  Media: "media",
  "Média": "media",
  alta: "alta",
  Alta: "alta",
};

const priorityToApp = {
  baixa: "baixa",
  media: "media",
  alta: "alta",
};

const compact = (payload) => Object.fromEntries(
  Object.entries(payload).filter(([, value]) => value !== undefined)
);

const toApiStatus = (status) => statusToApi[status] || status;
const toAppStatus = (status) => statusToApp[status] || status;
const toApiPriority = (priority) => priorityToApi[priority] || priority;

const reportTitle = (data) => {
  const value = data.title || data.titulo || data.descricao || data.description || "Chamado LumiCity";
  return value.length > 180 ? `${value.slice(0, 177)}...` : value;
};

const toApiReport = (data = {}) => compact({
  city_id: data.city_id || data.cidade_id,
  title: data.title || data.titulo || reportTitle(data),
  description: data.description || data.descricao,
  status: data.status ? toApiStatus(data.status) : undefined,
  priority: toApiPriority(data.priority || data.prioridade),
  address: data.address || data.endereco,
  neighborhood: data.neighborhood || data.bairro,
  latitude: data.latitude,
  longitude: data.longitude,
  photo_url: data.photo_url || data.foto_url,
  resolution_photo_url: data.resolution_photo_url || data.foto_resolucao_url,
  citizen_name: data.citizen_name || data.nome_cidadao || data.usuario_nome,
  citizen_cpf: data.citizen_cpf || data.cpf_cidadao || data.cpf,
  citizen_phone: data.citizen_phone || data.telefone_cidadao || data.telefone,
});

const toAppReport = (report = {}) => ({
  ...report,
  created_date: report.created_at,
  updated_date: report.updated_at,
  data_criacao: report.created_at,
  titulo: report.title,
  descricao: report.description,
  status: toAppStatus(report.status),
  prioridade: priorityToApp[report.priority] || report.priority,
  endereco: report.address,
  bairro: report.neighborhood,
  foto_url: report.photo_url,
  foto_resolucao_url: report.resolution_photo_url,
  cidade_id: report.city_id,
  usuario_id: report.created_by_user_id,
  usuario_nome: report.citizen_name || report.created_by_user_id,
  operador_id: report.assigned_operator_id,
  operador_nome: report.assigned_operator_id ? "Operador atribuido" : "",
  nome_cidadao: report.citizen_name,
  cpf_cidadao: report.citizen_cpf,
  telefone_cidadao: report.citizen_phone,
});

const updateReportFields = async (id, data = {}) => {
  const body = toApiReport(data);
  delete body.status;
  delete body.resolution_photo_url;
  if (Object.keys(body).length === 0) {
    return httpRequest(`/lumicity/reports/${id}`);
  }
  return httpRequest(`/lumicity/reports/${id}`, { method: "PATCH", body });
};

const assignReportToOperator = (id, operatorId) => (
  httpRequest(`/lumicity/reports/${id}/assign`, { method: "POST", body: { operator_id: operatorId } })
);

const changeReportStatus = (id, status, payload = {}) => (
  httpRequest(`/lumicity/reports/${id}/status`, {
    method: "PATCH",
    body: {
      status: toApiStatus(status),
      notes: payload.observacoes || payload.notes,
      resolution_photo_url: payload.resolution_photo_url || payload.foto_resolucao_url,
    },
  })
);

const mapFilters = (filters = {}) => compact({
  ...filters,
  status: filters.status ? toApiStatus(filters.status) : undefined,
  priority: toApiPriority(filters.priority || filters.prioridade),
  search: filters.search || filters.busca,
  assigned_operator_id: filters.assigned_operator_id || filters.operador_id,
  neighborhood: filters.neighborhood || filters.bairro,
});

export const reportsProvider = {
  async listReports(options = {}) {
    const reports = await httpRequest(`/lumicity/reports${queryString({ limit: options.limit, ...mapFilters(options.filters) })}`);
    return reports.map(toAppReport);
  },
  async getReport(id) {
    return toAppReport(await httpRequest(`/lumicity/reports/${id}`));
  },
  async createReport(data) {
    return toAppReport(await httpRequest("/lumicity/reports", { method: "POST", body: toApiReport(data) }));
  },
  async updateReport(id, data) {
    let report;
    if (data?.operador_id) {
      report = await assignReportToOperator(id, data.operador_id);
    }
    report = await updateReportFields(id, data);
    if (data?.status) {
      report = await changeReportStatus(id, data.status, data);
    }
    return toAppReport(report);
  },
  deleteReport: (id) => httpRequest(`/lumicity/reports/${id}`, { method: "DELETE" }),
  async assignReport(id, operatorId) {
    return toAppReport(await assignReportToOperator(id, operatorId));
  },
  async changeStatus(id, status, payload = {}) {
    return toAppReport(await changeReportStatus(id, status, payload));
  },
  subscribeReports: () => () => {},
};
