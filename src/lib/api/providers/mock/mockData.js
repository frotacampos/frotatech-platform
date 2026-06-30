const now = new Date();
const iso = (daysAgo = 0) => new Date(now.getTime() - daysAgo * 86400000).toISOString();

export const mockUser = {
  id: "mock-user-1",
  email: "admin@lumicity.local",
  full_name: "Admin LumiCity",
  role: "admin",
};

export const mockReports = [
  {
    id: "rep-001",
    descricao: "Poste apagado na Rua das Flores, proximo ao numero 120.",
    status: "Pendente",
    categoria: "Iluminacao Publica",
    endereco: "Rua das Flores, Centro",
    latitude: -3.119,
    longitude: -60.021,
    usuario_id: "cid-001",
    usuario_nome: "Maria Silva",
    nome_cidadao: "Maria Silva",
    cpf_cidadao: "12345678900",
    telefone_cidadao: "92999990000",
    data_criacao: iso(1),
    created_date: iso(1),
    historico: [],
  },
  {
    id: "rep-002",
    descricao: "Luminaria piscando em frente a praca principal.",
    status: "Em Andamento",
    categoria: "Iluminacao Publica",
    endereco: "Praca Principal, Centro",
    latitude: -3.121,
    longitude: -60.018,
    operador_id: "mock-user-1",
    operador_nome: "Admin LumiCity",
    usuario_nome: "Joao Souza",
    cpf_cidadao: "98765432100",
    data_criacao: iso(3),
    created_date: iso(3),
    data_inicio_atendimento: iso(2),
    historico: [],
  },
  {
    id: "rep-003",
    descricao: "Rua sem iluminacao apos queda de energia.",
    status: "Resolvido",
    categoria: "Iluminacao Publica",
    endereco: "Avenida Norte, Bairro Luz",
    latitude: -3.126,
    longitude: -60.01,
    operador_id: "mock-user-1",
    operador_nome: "Admin LumiCity",
    usuario_nome: "Ana Costa",
    cpf_cidadao: "11122233344",
    data_criacao: iso(8),
    created_date: iso(8),
    data_inicio_atendimento: iso(7),
    data_resolucao: iso(6),
    historico: [],
  },
];

export const mockMaterials = [
  { id: "mat-001", nome: "Lampada LED 100W", codigo: "LED-100", categoria: "Lampada", unidade: "un", quantidade_estoque: 24, quantidade_minima: 10, localizacao: "Prateleira A1", ativo: true },
  { id: "mat-002", nome: "Rele fotoeletrico", codigo: "REL-01", categoria: "Rele", unidade: "un", quantidade_estoque: 6, quantidade_minima: 8, localizacao: "Prateleira B2", ativo: true },
  { id: "mat-003", nome: "Cabo PP 2x2,5mm", codigo: "CAB-25", categoria: "Cabo", unidade: "m", quantidade_estoque: 180, quantidade_minima: 50, localizacao: "Rolo C1", ativo: true },
];

export const mockMovements = [
  { id: "mov-001", material_id: "mat-001", material_nome: "Lampada LED 100W", tipo: "Saida", quantidade: 2, motivo: "Manutencao corretiva", operador_nome: "Admin LumiCity", created_date: iso(2) },
  { id: "mov-002", material_id: "mat-002", material_nome: "Rele fotoeletrico", tipo: "Entrada", quantidade: 10, motivo: "Compra", operador_nome: "Admin LumiCity", created_date: iso(4) },
];

export const mockCitizens = [
  { id: "cid-001", nome: "Maria Silva", cpf: "12345678900", data_nascimento: "1990-01-10", telefone: "92999990000", email: "maria@example.com", perfil: "cidadao", ativo: true, created_date: iso(10) },
  { id: "cid-002", nome: "Tecnico Campo", cpf: "22233344455", data_nascimento: "1985-05-20", telefone: "92988887777", email: "tecnico@example.com", perfil: "tecnico-eletricista", ativo: true, created_date: iso(12) },
];

export const mockCompanies = [
  { id: "emp-001", nome: "Prefeitura Demo", cnpj: "00000000000100", tipo: "Prefeitura", email: "contato@demo.local", cidade: "Manaus", estado: "AM", responsavel_nome: "Admin LumiCity", responsavel_email: "admin@lumicity.local", ativa: true },
];

export const mockCities = [
  { id: "city-001", nome: "Manaus", estado: "AM", latitude_centro: -3.119, longitude_centro: -60.021, ativa: true },
  { id: "city-002", nome: "Itacoatiara", estado: "AM", latitude_centro: -3.143, longitude_centro: -58.444, ativa: true },
];

export const mockUsers = [
  { ...mockUser, created_by: "admin@lumicity.local", empresa_nome: "Prefeitura Demo", cargo: "Administrador", cpf: "00000000000", telefone: "92999999999" },
  { id: "mock-user-2", email: "operador@lumicity.local", full_name: "Operador Demo", role: "operador", created_by: "operador@lumicity.local" },
];

export const clone = (data) => JSON.parse(JSON.stringify(data));
export const nextId = (prefix) => `${prefix}-${Date.now()}`;
