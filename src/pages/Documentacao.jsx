import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, BookOpen, Globe, Users, Wrench, Package, FileText, Map,
  BarChart2, Shield, Bell, Cpu, Database, Code2, Layers, CheckCircle2,
  ArrowRight, ChevronDown, ChevronUp, Building2, Phone, Mail, Star,
  Lock, RefreshCw, Upload, MessageSquare, AlertTriangle, Smartphone,
  TrendingUp, Settings, Layout, Download
} from "lucide-react";
import { jsPDF } from "jspdf";

const SECTIONS = [
  { id: "overview", label: "Visão Geral", icon: Globe },
  { id: "modulos", label: "Módulos", icon: Layers },
  { id: "tecnologias", label: "Tecnologias", icon: Cpu },
  { id: "arquitetura", label: "Arquitetura", icon: Database },
  { id: "perfis", label: "Perfis de Acesso", icon: Users },
  { id: "fluxos", label: "Fluxos Operacionais", icon: RefreshCw },
  { id: "inteligencia", label: "IA & Inteligência", icon: Star },
  { id: "escalabilidade", label: "Escalabilidade", icon: TrendingUp },
  { id: "mercado", label: "Pronto para o Mercado", icon: Building2 },
];

function gerarPDF() {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const margin = 18;
  const contentW = W - margin * 2;
  let y = 0;

  const addPage = () => { doc.addPage(); y = 22; };
  const checkY = (needed = 10) => { if (y + needed > 278) addPage(); };
  const ensureSpace = (needed) => { if (y + needed > 278) addPage(); };
  const estimateBlock = (itemCount) => 10 + itemCount * 5 + 4;

  const h1 = (text) => {
    ensureSpace(22);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(0, 120, 255);
    doc.text(text, margin, y);
    y += 11;
  };
  const h3 = (text) => {
    checkY(10);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(0, 160, 210);
    doc.text(text, margin, y);
    y += 6;
  };
  const body = (text, indent = 0) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 45, 80);
    const lines = doc.splitTextToSize(text, contentW - indent);
    lines.forEach(line => {
      checkY(5);
      doc.text(line, margin + indent, y);
      y += 5;
    });
  };
  const bullet = (text) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 45, 80);
    const lines = doc.splitTextToSize("• " + text, contentW - 5);
    lines.forEach(line => {
      checkY(5);
      doc.text(line, margin + 5, y);
      y += 5;
    });
  };

  // ── CAPA ──
  // Fundo céu noturno
  doc.setFillColor(3, 10, 28);
  doc.rect(0, 0, 210, 297, "F");
  doc.setFillColor(8, 20, 55);
  doc.rect(0, 150, 210, 147, "F");

  // Estrelas
  doc.setFillColor(255, 255, 255);
  [[25,18],[55,32],[80,12],[115,8],[140,22],[165,14],[185,35],[35,55],[100,42],[150,50],[190,25],[10,38],[70,65],[130,38]].forEach(([sx,sy]) => {
    doc.circle(sx, sy, 0.6, "F");
  });

  // Lua crescente
  doc.setFillColor(255, 245, 180);
  doc.circle(178, 38, 11, "F");
  doc.setFillColor(3, 10, 28);
  doc.circle(183, 34, 10, "F");

  // Poste de luz 1 (esquerda)
  doc.setDrawColor(180, 190, 220);
  doc.setFillColor(180, 190, 220);
  doc.setLineWidth(2);
  doc.line(28, 240, 28, 155);
  doc.setLineWidth(1.2);
  doc.line(28, 155, 48, 148);
  doc.setFillColor(255, 230, 80);
  doc.circle(49, 147, 6, "F");
  // Halo amarelo
  doc.setFillColor(255, 230, 80);
  doc.setLineWidth(0);
  for (let r = 18; r >= 6; r -= 3) {
    const alpha = (18 - r) / 18 * 0.06;
    doc.setFillColor(255, 230, 80);
    doc.ellipse(49, 160, r, r * 0.5, "F");
  }

  // Poste de luz 2 (direita)
  doc.setDrawColor(160, 175, 210);
  doc.setFillColor(160, 175, 210);
  doc.setLineWidth(1.8);
  doc.line(175, 248, 175, 168);
  doc.setLineWidth(1);
  doc.line(175, 168, 158, 163);
  doc.setFillColor(255, 215, 60);
  doc.circle(157, 161, 5, "F");

  // Poste pequeno ao fundo
  doc.setDrawColor(100, 115, 160);
  doc.setLineWidth(1);
  doc.line(95, 252, 95, 205);
  doc.line(95, 205, 107, 201);
  doc.setFillColor(200, 220, 255);
  doc.circle(108, 199, 3.5, "F");

  // Prédios / skyline
  doc.setFillColor(12, 25, 60);
  [[0,40,260,270],[40,60,80,270],[110,50,60,270],[155,65,55,270],[185,55,25,270]].forEach(([x,h,w,base]) => {
    doc.rect(x, base - h, w, h, "F");
  });
  // Janelas nos prédios
  doc.setFillColor(255, 220, 80);
  [[10,215],[20,215],[10,225],[20,225],[50,215],[50,225],[120,215],[130,215],[120,225],[165,215],[175,215],[190,215]].forEach(([wx,wy]) => {
    doc.rect(wx, wy, 4, 3, "F");
  });

  // Rua
  doc.setFillColor(18, 25, 50);
  doc.rect(0, 260, 210, 37, "F");
  doc.setDrawColor(50, 65, 110);
  doc.setLineWidth(0.3);
  doc.line(0, 260, 210, 260);
  // Faixas
  doc.setFillColor(180, 190, 220);
  for (let rx = 5; rx < 210; rx += 18) {
    doc.rect(rx, 271, 9, 2, "F");
  }

  // Reflexos de luz na rua
  doc.setFillColor(255, 230, 80);
  doc.ellipse(49, 268, 8, 3, "F");
  doc.ellipse(157, 272, 6, 2.5, "F");

  // Textos da capa
  doc.setFont("helvetica", "bold");
  doc.setFontSize(44);
  doc.setTextColor(255, 255, 255);
  doc.text("LumiCity", 105, 100, { align: "center" });

  doc.setFontSize(13);
  doc.setTextColor(80, 200, 255);
  doc.text("Documentação Técnica Completa", 105, 115, { align: "center" });

  doc.setFontSize(10);
  doc.setTextColor(150, 200, 255);
  doc.text("Plataforma de Gestão de Iluminação Pública", 105, 127, { align: "center" });

  // Badge versão
  doc.setFillColor(0, 90, 200);
  doc.roundedRect(72, 133, 66, 10, 3, 3, "F");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text("v1.0  ·  Produção  ·  " + new Date().toLocaleDateString("pt-BR"), 105, 139.5, { align: "center" });

  // ── CONTEÚDO ──
  doc.addPage();
  y = 22;

  // 1. VISÃO GERAL
  h1("1. Visão Geral");
  body("O LumiCity é uma plataforma SaaS desenvolvida para prefeituras, concessionárias e empresas terceirizadas de iluminação pública. Ela digitaliza completamente o ciclo de vida de um chamado de manutenção: desde o reporte feito pelo cidadão pelo celular até a resolução registrada com foto geolocalizada pelo operador em campo.");
  y += 2;
  body("Com módulos de almoxarifado, relatórios inteligentes, mapa interativo e assistência por IA, o LumiCity elimina planilhas, ligações telefônicas e papelada — substituindo tudo por um fluxo digital, rastreável e auditável.");
  y += 6;

  // 2. MÓDULOS
  h1("2. Módulos da Plataforma");
  const modulos = [
    { title: "Portal do Cidadão (Público)", items: ["Registro de chamados com foto e geolocalização GPS", "Cadastro e login por CPF + data de nascimento", "Acompanhamento em tempo real dos chamados", "Interface responsiva, funciona em qualquer celular", "Preenchimento assistido por IA para descrição"] },
    { title: "Painel do Operador", items: ["Listagem completa com filtros avançados (status, data, cidade)", "Drawer lateral com detalhes completos do chamado", "Avanço de status com observações e fotos", "Geração de Ordem de Serviço em PDF", "Ações: reabrir, editar e excluir chamados", "Controle de SLA com indicadores visuais"] },
    { title: "Dashboard Administrativo", items: ["KPIs em tempo real: total, pendentes, em andamento, resolvidos", "Análise de tendências por período e categoria", "Relatório de desempenho por operador", "Gerenciamento de usuários, equipes e empresas"] },
    { title: "Mapa Interativo", items: ["Visualização geográfica de chamados ativos", "Marcadores coloridos por status", "Popup com detalhes ao clicar no marcador", "Baseado em OpenStreetMap (sem custo de licença)"] },
    { title: "Almoxarifado", items: ["Cadastro de materiais elétricos e equipamentos", "Controle de estoque com alertas de mínimo", "Registro de entradas, saídas e ajustes", "Vinculação de movimentação a chamados", "10 categorias: Lâmpada, Luminária, Cabo, Poste, Relé, etc."] },
    { title: "Relatórios", items: ["KPIs consolidados e gráficos de chamados por mês", "Análise de consumo de materiais", "Exportação de relatório mensal em PDF", "Relatório de tendências gerado por IA"] },
    { title: "Gerenciamento de Usuários", items: ["Convite de usuários por e-mail (admin e operador)", "Criação de membros de equipe por CPF", "Controle de papéis: admin, operador, técnico, motorista, ajudante"] },
  ];
  modulos.forEach(m => {
    ensureSpace(estimateBlock(m.items.length));
    h3(m.title); m.items.forEach(item => bullet(item)); y += 3;
  });
  y += 4;

  // 3. STACK
  h1("3. Stack Tecnológica");
  const stacks = [
    { cat: "Frontend", items: ["React 18 + Vite", "Tailwind CSS + Shadcn/UI + Radix UI", "Framer Motion (animações)", "React Router DOM v6 (roteamento)", "TanStack React Query (estado assíncrono)", "Recharts (gráficos)", "React Leaflet + OpenStreetMap (mapa)", "jsPDF (geração de PDF)", "Date-fns, Lucide React"] },
    { cat: "Backend & Infraestrutura (Base44)", items: ["Base44 Platform (BaaS)", "Deno Deploy — Edge Functions serverless", "Base44 SDK (entidades, auth, integrações)", "Base44 Storage (upload de imagens)", "WebSockets para atualizações em tempo real", "Auth & RBAC nativo"] },
    { cat: "Inteligência Artificial", items: ["Base44 InvokeLLM + GPT-4o-mini (OpenAI)", "AI Sugestão de Descrição de chamados", "AI Prioridade Automática", "AI Relatório de Tendências preditivo", "Chatbot Inteligente na landing page"] },
    { cat: "Autenticação Dupla", items: ["Login por e-mail para operadores e admins", "Login por CPF + data de nascimento para cidadãos/equipe", "Sessão via localStorage para cidadãos"] },
  ];
  stacks.forEach(s => {
    ensureSpace(estimateBlock(s.items.length));
    h3(s.cat); s.items.forEach(item => bullet(item)); y += 3;
  });
  y += 4;

  // 4. ARQUITETURA
  h1("4. Arquitetura de Dados");
  const entidades = [
    { name: "Reporte", desc: "Entidade central. Representa um chamado de iluminação. Campos: descricao, status, latitude, longitude, endereco, foto_url, cidade_id, operador_id, historico[]." },
    { name: "Material", desc: "Itens do almoxarifado. Campos: nome, codigo, categoria, unidade, quantidade_estoque, quantidade_minima, preco_unitario, fornecedor." },
    { name: "MovimentacaoEstoque", desc: "Histórico de entradas, saídas e ajustes. Campos: material_id, tipo, quantidade, motivo, reporte_id, operador_nome." },
    { name: "CidadaoCadastro", desc: "Cadastro de cidadãos e membros de equipe. Campos: nome, cpf, data_nascimento, telefone, email, senha_hash, ativo." },
    { name: "Empresa", desc: "Empresas/prefeituras na plataforma. Campos: nome, cnpj, tipo, email, cidade, responsavel_email, ativa." },
    { name: "Cidade", desc: "Cidades cadastradas para filtros e mapa. Campos: nome, estado, latitude_centro, longitude_centro, ativa." },
    { name: "User (built-in)", desc: "Usuários operadores e admins. Gerenciado pelo Base44 Auth. Campos: id, email, full_name, role." },
  ];
  entidades.forEach(e => {
    ensureSpace(18);
    h3(e.name); body(e.desc, 4); y += 2;
  });
  y += 4;

  // 5. PERFIS
  h1("5. Perfis de Acesso");
  const perfis = [
    { role: "Administrador (e-mail)", items: ["Acesso total à plataforma", "Gerenciar usuários, empresas e cidades", "Ver relatórios KPIs e análise de IA", "Editar e excluir qualquer chamado"] },
    { role: "Operador (e-mail)", items: ["Gerenciar chamados (visualizar, assumir, avançar status)", "Acesso ao mapa e almoxarifado", "Gerar ordens de serviço em PDF"] },
    { role: "Técnico / Motorista / Ajudante (CPF)", items: ["Login via CPF e data de nascimento", "Acesso ao dashboard operacional", "Visualizar chamados atribuídos"] },
    { role: "Cidadão (CPF)", items: ["Registrar chamados com foto e GPS", "Acompanhar status em tempo real", "Cadastro self-service por CPF"] },
    { role: "Público (sem login)", items: ["Registrar chamado como visitante", "Acessar landing page e chatbot"] },
  ];
  perfis.forEach(p => {
    ensureSpace(estimateBlock(p.items.length));
    h3(p.role); p.items.forEach(item => bullet(item)); y += 3;
  });
  y += 4;

  // 6. FLUXOS
  h1("6. Fluxos Operacionais");
  const fluxos = [
    { title: "Ciclo de Vida de um Chamado", items: ["1. Cidadão reporta com foto e GPS", "2. Chamado criado como 'Pendente'", "3. Operador assume o chamado", "4. Status avança para 'Em Andamento' (SLA iniciado)", "5. Técnico resolve — operador registra resolução com foto", "6. Status 'Resolvido' — cidadão vê em tempo real"] },
    { title: "Fluxo de Almoxarifado", items: ["1. Admin cadastra material com estoque inicial", "2. Saída registrada ao usar material em campo", "3. Alerta visual quando abaixo do mínimo", "4. Entrada registrada ao receber reposição"] },
    { title: "Fluxo de Acesso de Equipe", items: ["1. Admin cria membro com CPF e data de nascimento", "2. Senha gerada automaticamente (formato DDMMAAAA)", "3. Técnico acessa /acesso-operador pelo celular", "4. Sistema redireciona para o dashboard correto"] },
  ];
  fluxos.forEach(f => {
    ensureSpace(estimateBlock(f.items.length));
    h3(f.title); f.items.forEach(item => bullet(item)); y += 3;
  });
  y += 4;

  // 7. IA — sempre começa em nova página
  addPage();
  h1("7. Inteligência Artificial");
  const ias = [
    { title: "Sugestão de Descrição", desc: "Analisa localização e categoria do problema e gera uma descrição técnica padronizada no momento do reporte." },
    { title: "Prioridade Automática", desc: "Lê a descrição e classifica a urgência (Alta/Média/Baixa) com uma explicação curta para o operador." },
    { title: "Relatório de Tendências", desc: "Analisa volume, padrões temporais e desempenho da equipe. Gera texto analítico com recomendações estratégicas." },
    { title: "Chatbot Inteligente", desc: "Assistente na landing page que responde dúvidas, guia cidadãos para registrar chamados e explica o processo." },
  ];
  ias.forEach(a => {
    ensureSpace(20);
    h3(a.title); body(a.desc, 4); y += 3;
  });
  y += 4;

  // 8. ESCALABILIDADE
  h1("8. Escalabilidade");
  ["Multi-cidade: entidade Cidade permite cadastrar qualquer município", "Multi-empresa: suporte a Prefeituras, Terceirizadas e Concessionárias", "Multi-equipe: perfis flexíveis para qualquer estrutura organizacional", "Banco ilimitado: sem limite de registros no Base44", "Mobile-first: 100% responsivo, sem instalar aplicativo", "Tempo real: WebSockets para atualizações instantâneas", "Segurança por papel: rotas e dados protegidos por RBAC", "CDN de arquivos: fotos em URLs permanentes"].forEach(item => bullet(item));
  y += 4;
  ensureSpace(estimateBlock(6));
  h3("Próximos Passos para Escalar");
  ["Notificações push via e-mail ou WhatsApp", "App nativo iOS/Android via wrapper React", "Integração com sistemas municipais (SIGAM, e-SIC)", "Dashboard público de transparência", "Módulo de manutenção preventiva por histórico", "Google Maps API para geocoding mais preciso"].forEach(item => bullet(item));
  y += 4;

  // 9. MERCADO
  h1("9. Pronto para o Mercado");
  ensureSpace(estimateBlock(3));
  h3("Público-Alvo");
  ["Prefeituras — cidades de qualquer porte que precisam digitalizar a gestão de iluminação", "Empresas Terceirizadas — prestadoras de serviço de manutenção elétrica municipal", "Concessionárias — distribuidoras de energia com obrigação de manter iluminação pública"].forEach(item => bullet(item));
  y += 4;
  ensureSpace(estimateBlock(3));
  h3("Modelo de Comercialização Sugerido");
  ["Básico: R$ 497/mês — 1 cidade, até 5 operadores, módulos essenciais", "Profissional: R$ 997/mês — até 5 cidades, operadores ilimitados, relatórios IA", "Enterprise: Sob consulta — multi-empresa, SLA garantido, personalização de marca"].forEach(item => bullet(item));
  y += 4;
  ensureSpace(estimateBlock(5));
  h3("Diferenciais Competitivos");
  ["7+ módulos funcionais e integrados", "4 perfis de acesso com autenticação dupla", "IA em 4 pontos estratégicos do sistema", "Arquitetura multi-empresa e multi-cidade", "100% web, responsivo, sem instalação"].forEach(item => bullet(item));

  // Rodapé colorido em todas as páginas (exceto capa)
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    if (i > 1) {
      doc.setFillColor(0, 80, 180);
      doc.rect(0, 286, 210, 11, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(255, 255, 255);
      doc.text("LumiCity — Documentação Técnica v1.0", margin, 292.5);
      doc.text(`Página ${i} de ${totalPages}`, W - margin, 292.5, { align: "right" });
    }
  }

  doc.save("LumiCity_Documentacao_Tecnica.pdf");
}

export default function Documentacao() {
  const [activeSection, setActiveSection] = useState("overview");
  const [expandedFaq, setExpandedFaq] = useState(null);

  return (
    <div className="min-h-screen bg-lumicity-dark text-white font-inter">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-lumicity-dark/95 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl gradient-lumicity flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-space font-700 text-white text-lg">LumiCity</span>
              <span className="ml-2 text-white/30 text-sm font-inter">Documentação Técnica</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 text-xs font-inter font-500">v1.0 · Produção</span>
            <button
              onClick={gerarPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/20 border border-primary/30 text-white text-xs font-inter hover:bg-primary/30 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar PDF
            </button>
          </div>
        </div>
        {/* Nav tabs */}
        <div className="overflow-x-auto">
          <div className="flex gap-1 px-4 sm:px-6 pb-3 min-w-max">
            {SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-inter transition-all whitespace-nowrap ${
                  activeSection === s.id
                    ? "bg-primary/20 text-white border border-primary/30"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                <s.icon className="w-3.5 h-3.5" />
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-16">

        {/* ── VISÃO GERAL ── */}
        {activeSection === "overview" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Globe className="w-4 h-4 text-lumicity-cyan" />
                <span className="text-lumicity-cyan text-sm font-inter">Plataforma de Gestão de Iluminação Pública</span>
              </div>
              <h1 className="font-space text-4xl sm:text-5xl font-700 text-white mb-4">LumiCity</h1>
              <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
                Sistema completo e inteligente para gestão de chamados de iluminação pública, conectando cidadãos, operadores e administradores municipais em uma única plataforma.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { value: "100%", label: "Web & Mobile", icon: Smartphone },
                { value: "IA", label: "Assistida por IA", icon: Star },
                { value: "Multi", label: "Multi-empresa", icon: Building2 },
                { value: "Real-time", label: "Tempo real", icon: Bell },
              ].map((stat, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
                  <stat.icon className="w-6 h-6 text-lumicity-cyan mx-auto mb-2" />
                  <p className="font-space text-2xl font-700 text-white">{stat.value}</p>
                  <p className="text-white/40 text-xs mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="font-space text-xl font-700 text-white mb-4">O que é o LumiCity?</h2>
              <p className="text-white/60 leading-relaxed mb-4">
                O <strong className="text-white">LumiCity</strong> é uma plataforma SaaS (Software as a Service) desenvolvida para prefeituras, concessionárias e empresas terceirizadas de iluminação pública. Ela digitaliza completamente o ciclo de vida de um chamado de manutenção: desde o reporte feito pelo cidadão pelo celular até a resolução registrada com foto geolocalizada pelo operador em campo.
              </p>
              <p className="text-white/60 leading-relaxed">
                Com módulos de almoxarifado, relatórios inteligentes, mapa interativo e assistência por IA, o LumiCity elimina planilhas, ligações telefônicas e papelada — substituindo tudo por um fluxo digital, rastreável e auditável.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { icon: AlertTriangle, title: "Problema identificado", desc: "Cidadãos reportam falhas de iluminação com foto e GPS diretamente pelo celular, sem precisar ligar para a prefeitura." },
                { icon: Wrench, title: "Gestão eficiente", desc: "Operadores recebem e gerenciam chamados em tempo real, com histórico completo, SLA e responsável definido." },
                { icon: BarChart2, title: "Decisão baseada em dados", desc: "Administradores acompanham KPIs, tendências e relatórios gerados automaticamente por IA." },
              ].map((item, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <item.icon className="w-6 h-6 text-lumicity-cyan mb-3" />
                  <h3 className="font-space font-700 text-white text-sm mb-2">{item.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── MÓDULOS ── */}
        {activeSection === "modulos" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <SectionHeader icon={Layers} title="Módulos da Plataforma" subtitle="Cada módulo foi desenvolvido para um fluxo operacional específico, todos integrados entre si." />
            {[
              {
                icon: Globe, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20",
                title: "Portal do Cidadão",
                badge: "Público",
                items: [
                  "Registro de chamados com foto e geolocalização GPS automática",
                  "Cadastro e login por CPF + data de nascimento",
                  "Acompanhamento em tempo real dos chamados enviados",
                  "Interface responsiva, funciona em qualquer celular sem instalar app",
                  "Preenchimento assistido por IA para descrição do problema",
                ],
              },
              {
                icon: Wrench, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20",
                title: "Painel do Operador",
                badge: "Operador",
                items: [
                  "Listagem completa de chamados com filtros avançados (status, data, cidade, cidadão)",
                  "Drawer lateral com detalhes completos do chamado",
                  "Avanço de status com registro de observações e fotos",
                  "Assumir responsabilidade pelo chamado",
                  "Geração de Ordem de Serviço em PDF para impressão",
                  "Ações: reabrir, editar e excluir chamados",
                  "Controle de SLA com indicadores visuais de tempo",
                ],
              },
              {
                icon: Shield, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20",
                title: "Dashboard Administrativo",
                badge: "Admin",
                items: [
                  "KPIs em tempo real: total de chamados, pendentes, em andamento, resolvidos",
                  "Análise de tendências por período e categoria",
                  "Relatório de desempenho por operador",
                  "Mapa de calor geográfico dos chamados",
                  "Gerenciamento de usuários, equipes e empresas",
                  "Configuração da empresa com upload de logomarca",
                ],
              },
              {
                icon: Map, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20",
                title: "Mapa Interativo",
                badge: "Operador + Admin",
                items: [
                  "Visualização geográfica de todos os chamados ativos",
                  "Marcadores coloridos por status (pendente, em andamento, resolvido)",
                  "Popup com detalhes ao clicar no marcador",
                  "Centralização automática por cidade",
                  "Baseado em OpenStreetMap (sem custo de licença)",
                ],
              },
              {
                icon: Package, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20",
                title: "Almoxarifado",
                badge: "Operador + Admin",
                items: [
                  "Cadastro completo de materiais elétricos e equipamentos",
                  "Controle de estoque com alertas de quantidade mínima",
                  "Registro de entradas, saídas e ajustes com motivo",
                  "Vinculação de movimentação a chamados de serviço",
                  "Filtros por nome e categoria",
                  "10 categorias: Lâmpada, Luminária, Cabo, Poste, Relé, Disjuntor, Caixa de Passagem, Ferramental, EPI, Outros",
                ],
              },
              {
                icon: BarChart2, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20",
                title: "Relatórios",
                badge: "Admin",
                items: [
                  "Visão geral com KPIs consolidados",
                  "Gráficos de chamados por status e por mês (Recharts)",
                  "Análise de consumo de materiais do almoxarifado",
                  "Lista de cidadãos cadastrados na plataforma",
                  "Exportação de relatório mensal em PDF (jsPDF)",
                  "Relatório de tendências gerado por IA com análise preditiva",
                ],
              },
              {
                icon: Users, color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20",
                title: "Gerenciamento de Usuários",
                badge: "Admin",
                items: [
                  "Convite de usuários por e-mail (admin e operador)",
                  "Criação de membros de equipe por CPF (técnicos, motoristas, ajudantes)",
                  "Listagem de cidadãos cadastrados",
                  "Edição de perfil e exclusão de usuários",
                  "Controle de papéis: admin, operador, técnico eletricista, motorista, ajudante",
                ],
              },
            ].map((mod, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className={`${mod.bg} border ${mod.border} rounded-2xl p-6`}>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl ${mod.bg} border ${mod.border} flex items-center justify-center flex-shrink-0`}>
                    <mod.icon className={`w-5 h-5 ${mod.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-space font-700 text-white">{mod.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${mod.border} ${mod.color} font-inter`}>{mod.badge}</span>
                    </div>
                    <ul className="space-y-1.5">
                      {mod.items.map((item, j) => (
                        <li key={j} className="flex items-start gap-2 text-white/60 text-sm">
                          <CheckCircle2 className={`w-3.5 h-3.5 ${mod.color} flex-shrink-0 mt-0.5`} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ── TECNOLOGIAS ── */}
        {activeSection === "tecnologias" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <SectionHeader icon={Cpu} title="Stack Tecnológica" subtitle="Tecnologias modernas, testadas e prontas para produção em larga escala." />

            {[
              {
                category: "Frontend", color: "text-blue-400", items: [
                  { name: "React 18", desc: "Biblioteca principal para construção da interface reativa" },
                  { name: "Vite", desc: "Build tool ultrarrápido para desenvolvimento e produção" },
                  { name: "Tailwind CSS", desc: "Utilitários CSS para design consistente e responsivo" },
                  { name: "Framer Motion", desc: "Animações fluidas e transições de interface" },
                  { name: "React Router DOM v6", desc: "Roteamento SPA com rotas protegidas por papel (role)" },
                  { name: "TanStack React Query", desc: "Gerenciamento de estado assíncrono com cache e refetch" },
                  { name: "Recharts", desc: "Gráficos interativos para dashboards e relatórios" },
                  { name: "React Leaflet", desc: "Mapa interativo com OpenStreetMap sem custo de API" },
                  { name: "Shadcn/UI + Radix UI", desc: "Componentes acessíveis e customizáveis" },
                  { name: "Date-fns", desc: "Manipulação de datas com suporte a locale pt-BR" },
                  { name: "Lucide React", desc: "Biblioteca de ícones coesa e leve" },
                  { name: "jsPDF", desc: "Geração de PDFs no cliente para relatórios e ordens de serviço" },
                ],
              },
              {
                category: "Backend & Infraestrutura (Base44)", color: "text-green-400", items: [
                  { name: "Base44 Platform", desc: "Backend as a Service: banco de dados, auth, storage e funções serverless" },
                  { name: "Deno Deploy (Edge Functions)", desc: "Funções backend serverless com latência mínima" },
                  { name: "Base44 SDK", desc: "SDK JavaScript para acesso às entidades, auth e integrações" },
                  { name: "Base44 Storage", desc: "Upload e armazenamento de imagens e arquivos (fotos de chamados, logomarcas)" },
                  { name: "WebSockets (Real-time)", desc: "Subscriptions de entidade para atualizações em tempo real" },
                  { name: "Auth & RBAC", desc: "Autenticação nativa com controle de papéis (admin, operador, cidadão)" },
                ],
              },
              {
                category: "Inteligência Artificial", color: "text-yellow-400", items: [
                  { name: "Base44 InvokeLLM", desc: "Chamada a modelos de linguagem para geração de texto inteligente" },
                  { name: "GPT-4o-mini (OpenAI)", desc: "Modelo usado para sugestão de descrição e prioridade de chamados" },
                  { name: "AI Sugestão de Descrição", desc: "Analisa contexto do chamado e sugere uma descrição técnica adequada" },
                  { name: "AI Prioridade Automática", desc: "Classifica a urgência do chamado com base na descrição" },
                  { name: "AI Relatório de Tendências", desc: "Gera análise preditiva e identificação de padrões operacionais" },
                  { name: "Chatbot Inteligente", desc: "Assistente conversacional na landing page para suporte e triagem" },
                ],
              },
              {
                category: "Autenticação Dupla", color: "text-pink-400", items: [
                  { name: "Auth Plataforma (E-mail)", desc: "Login por e-mail + senha para operadores e administradores convidados" },
                  { name: "Auth Cidadão (CPF)", desc: "Login por CPF + data de nascimento para cidadãos (sem e-mail necessário)" },
                  { name: "Sessão via localStorage", desc: "Persistência da sessão do cidadão de forma segura no navegador" },
                  { name: "Senha gerada por data de nascimento", desc: "Acesso simples para equipes de campo via CPF e data de nascimento" },
                ],
              },
            ].map((group, i) => (
              <div key={i}>
                <h3 className={`font-space font-700 ${group.color} text-base mb-4`}>{group.category}</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {group.items.map((item, j) => (
                    <div key={j} className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-3">
                      <Code2 className={`w-4 h-4 ${group.color} flex-shrink-0 mt-0.5`} />
                      <div>
                        <p className="text-white text-sm font-inter font-500">{item.name}</p>
                        <p className="text-white/40 text-xs mt-0.5 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* ── ARQUITETURA ── */}
        {activeSection === "arquitetura" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <SectionHeader icon={Database} title="Arquitetura de Dados" subtitle="Entidades relacionadas que formam o modelo de dados da plataforma." />

            {[
              {
                name: "Reporte", color: "border-yellow-500/30 bg-yellow-500/5",
                desc: "Entidade central da plataforma. Representa um chamado de iluminação pública.",
                fields: ["descricao", "status (Pendente/Em Andamento/Resolvido/Cancelado)", "latitude, longitude, endereco", "foto_url, foto_resolucao_url", "cidade_id, cidade_nome", "operador_id, operador_nome", "data_criacao, data_inicio_atendimento, data_resolucao", "historico[] (array de eventos)", "usuario_nome, nome_cidadao, cpf_cidadao"],
              },
              {
                name: "Material", color: "border-orange-500/30 bg-orange-500/5",
                desc: "Itens do almoxarifado. Rastreia estoque e movimentações.",
                fields: ["nome, codigo, categoria, unidade", "quantidade_estoque, quantidade_minima", "preco_unitario, fornecedor, localizacao", "ativo (boolean)"],
              },
              {
                name: "MovimentacaoEstoque", color: "border-orange-500/30 bg-orange-500/5",
                desc: "Histórico de entradas, saídas e ajustes de materiais.",
                fields: ["material_id, material_nome", "tipo (Entrada/Saída/Ajuste)", "quantidade, motivo", "reporte_id (opcional, vinculo com chamado)", "operador_nome, observacao"],
              },
              {
                name: "CidadaoCadastro", color: "border-green-500/30 bg-green-500/5",
                desc: "Cadastro de cidadãos e membros de equipe com acesso por CPF.",
                fields: ["nome, cpf, data_nascimento", "telefone, email, senha_hash", "perfil (cidadao / tecnico-eletricista / motorista / ajudante)", "ativo (boolean)"],
              },
              {
                name: "Empresa", color: "border-blue-500/30 bg-blue-500/5",
                desc: "Registro das empresas/prefeituras que utilizam a plataforma.",
                fields: ["nome, cnpj, tipo (Prefeitura/Terceirizada/Concessionária)", "email, telefone, endereco, cidade, estado", "responsavel_nome, responsavel_email", "responsavel_user_id, ativa"],
              },
              {
                name: "Cidade", color: "border-cyan-500/30 bg-cyan-500/5",
                desc: "Cidades cadastradas para centralização do mapa e filtragem.",
                fields: ["nome, estado", "latitude_centro, longitude_centro", "ativa (boolean)"],
              },
              {
                name: "User (built-in)", color: "border-purple-500/30 bg-purple-500/5",
                desc: "Usuários da plataforma (operadores e admins). Gerenciado pelo Base44 Auth.",
                fields: ["id, email, full_name (built-in)", "role (admin / user)"],
              },
            ].map((entity, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className={`border ${entity.color} rounded-2xl p-5`}>
                <div className="flex items-start gap-3 mb-3">
                  <Database className="w-5 h-5 text-white/40 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-space font-700 text-white">{entity.name}</h3>
                    <p className="text-white/50 text-sm mt-0.5">{entity.desc}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {entity.fields.map((f, j) => (
                    <span key={j} className="font-mono text-xs bg-white/8 border border-white/10 text-white/60 px-2.5 py-1 rounded-lg">{f}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ── PERFIS ── */}
        {activeSection === "perfis" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <SectionHeader icon={Users} title="Perfis de Acesso" subtitle="Hierarquia de papéis com permissões específicas para cada nível." />
            {[
              {
                role: "Administrador", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30",
                acesso: "Login por e-mail (convite)",
                desc: "Acesso total à plataforma. Responsável pela gestão operacional e estratégica.",
                pode: [
                  "Acesso a todos os módulos", "Gerenciar usuários (convidar, editar, excluir)",
                  "Configurar empresa e logomarca", "Ver relatórios e KPIs administrativos",
                  "Gerenciar cidades e empresas", "Criar membros de equipe",
                  "Análise por IA de tendências", "Editar e excluir qualquer chamado",
                ],
              },
              {
                role: "Operador", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30",
                acesso: "Login por e-mail (convite)",
                desc: "Equipe responsável pela operação dos chamados em campo e no sistema.",
                pode: [
                  "Gerenciar chamados (visualizar, assumir, avançar status)",
                  "Reabrir, editar e excluir chamados", "Acesso ao mapa de chamados",
                  "Controle de almoxarifado", "Gerar ordens de serviço",
                  "Ver relatórios operacionais",
                ],
              },
              {
                role: "Técnico / Motorista / Ajudante", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30",
                acesso: "Login por CPF + data de nascimento",
                desc: "Equipe de campo cadastrada pelo admin. Acesso simplificado sem e-mail.",
                pode: [
                  "Login via CPF e data de nascimento", "Acesso ao dashboard operacional",
                  "Visualizar chamados atribuídos", "Registrar execução de serviço",
                ],
              },
              {
                role: "Cidadão", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30",
                acesso: "Login por CPF + data de nascimento",
                desc: "Usuário final que registra problemas de iluminação pelo celular.",
                pode: [
                  "Registrar chamados com foto e GPS", "Acompanhar status dos chamados enviados",
                  "Cadastro self-service por CPF", "Receber atualizações em tempo real",
                ],
              },
              {
                role: "Público (sem login)", color: "text-white/50", bg: "bg-white/5", border: "border-white/15",
                acesso: "Sem autenticação",
                desc: "Qualquer pessoa pode acessar o portal público e registrar um chamado como visitante.",
                pode: [
                  "Registrar chamado sem cadastro (nome, CPF, telefone)", "Acessar landing page e chatbot",
                  "Registrar empresa na plataforma",
                ],
              },
            ].map((p, i) => (
              <div key={i} className={`${p.bg} border ${p.border} rounded-2xl p-6`}>
                <div className="flex items-start gap-4">
                  <Lock className={`w-5 h-5 ${p.color} flex-shrink-0 mt-1`} />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                      <h3 className={`font-space font-700 ${p.color} text-lg`}>{p.role}</h3>
                      <span className="text-xs font-inter text-white/30 bg-white/8 border border-white/10 px-2.5 py-0.5 rounded-full">{p.acesso}</span>
                    </div>
                    <p className="text-white/50 text-sm mb-3">{p.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {p.pode.map((item, j) => (
                        <span key={j} className={`text-xs ${p.color} bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg font-inter`}>{item}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* ── FLUXOS ── */}
        {activeSection === "fluxos" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <SectionHeader icon={RefreshCw} title="Fluxos Operacionais" subtitle="Ciclo de vida completo dos principais processos da plataforma." />

            <FlowCard title="Ciclo de Vida de um Chamado" color="text-yellow-400"
              steps={[
                { num: "1", title: "Reporte pelo Cidadão", desc: "Cidadão abre o portal, tira uma foto e o GPS captura a localização automaticamente. Descreve o problema ou usa a sugestão por IA." },
                { num: "2", title: "Criação do Chamado", desc: "Chamado criado com status 'Pendente'. Fica visível no painel de todos os operadores e no mapa." },
                { num: "3", title: "Assumir Responsabilidade", desc: "Operador visualiza o chamado e clica em 'Assumir chamado'. Seu nome fica vinculado ao registro." },
                { num: "4", title: "Início do Atendimento", desc: "Operador avança o status para 'Em Andamento'. A data de início é registrada automaticamente para cálculo de SLA." },
                { num: "5", title: "Resolução em Campo", desc: "Técnico resolve o problema. Operador registra observação e opcionalmente envia foto da resolução." },
                { num: "6", title: "Encerramento", desc: "Status muda para 'Resolvido'. Cidadão vê a atualização em tempo real em 'Meus Chamados'." },
              ]}
            />

            <FlowCard title="Fluxo de Almoxarifado" color="text-orange-400"
              steps={[
                { num: "1", title: "Cadastro de Material", desc: "Admin ou operador cadastra o material com categoria, unidade, estoque inicial e quantidade mínima." },
                { num: "2", title: "Movimentação de Estoque", desc: "Ao usar um material em campo, registra-se uma Saída vinculada ao chamado correspondente." },
                { num: "3", title: "Alerta de Estoque Baixo", desc: "Sistema destaca visualmente materiais com quantidade abaixo do mínimo configurado." },
                { num: "4", title: "Reposição (Entrada)", desc: "Ao receber novos itens, registra-se uma Entrada com o fornecedor e quantidade." },
              ]}
            />

            <FlowCard title="Fluxo de Acesso de Equipe" color="text-blue-400"
              steps={[
                { num: "1", title: "Admin cria membro", desc: "Admin preenche CPF, nome e data de nascimento do técnico/motorista no módulo de Usuários." },
                { num: "2", title: "Senha automática", desc: "A senha é gerada automaticamente a partir da data de nascimento no formato DDMMAAAA." },
                { num: "3", title: "Login em campo", desc: "O técnico acessa /acesso-operador pelo celular, informa CPF e data de nascimento." },
                { num: "4", title: "Redirecionamento", desc: "Sistema identifica o perfil e redireciona para o dashboard correto (operador ou admin)." },
              ]}
            />
          </motion.div>
        )}

        {/* ── IA ── */}
        {activeSection === "inteligencia" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <SectionHeader icon={Star} title="Inteligência Artificial" subtitle="IA integrada em pontos estratégicos para aumentar a eficiência operacional." />
            {[
              {
                icon: MessageSquare, title: "Sugestão de Descrição",
                color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20",
                when: "No momento em que o cidadão registra um chamado",
                how: "Analisa a localização e categoria do problema, gera uma descrição técnica padronizada para facilitar o atendimento.",
                benefit: "Reduz descrições vagas e acelera o triagem pelo operador.",
              },
              {
                icon: AlertTriangle, title: "Prioridade Automática",
                color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20",
                when: "Logo após o cidadão descrever o problema",
                how: "Lê a descrição e classifica a urgência (Alta, Média, Baixa) com uma explicação curta.",
                benefit: "Operadores focam primeiro nos casos mais críticos sem análise manual.",
              },
              {
                icon: BarChart2, title: "Relatório de Tendências",
                color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20",
                when: "No painel de relatórios do administrador",
                how: "Analisa volume de chamados, padrões temporais, tipos mais frequentes e desempenho da equipe. Gera texto analítico com recomendações.",
                benefit: "Decisões estratégicas baseadas em análise de dados, sem trabalho manual.",
              },
              {
                icon: MessageSquare, title: "Chatbot Inteligente",
                color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20",
                when: "Na landing page, disponível para qualquer visitante",
                how: "Responde perguntas sobre a plataforma, guia o cidadão para registrar um chamado e explica o processo de atendimento.",
                benefit: "Reduz carga de suporte e melhora a experiência do cidadão.",
              },
            ].map((ai, i) => (
              <div key={i} className={`${ai.bg} border ${ai.border} rounded-2xl p-6`}>
                <div className="flex items-start gap-4">
                  <ai.icon className={`w-6 h-6 ${ai.color} flex-shrink-0 mt-0.5`} />
                  <div>
                    <h3 className={`font-space font-700 ${ai.color} mb-3`}>{ai.title}</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-white/40">Quando:</span> <span className="text-white/70">{ai.when}</span></p>
                      <p><span className="text-white/40">Como funciona:</span> <span className="text-white/70">{ai.how}</span></p>
                      <p><span className="text-white/40">Benefício:</span> <span className="text-white/70">{ai.benefit}</span></p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* ── ESCALABILIDADE ── */}
        {activeSection === "escalabilidade" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <SectionHeader icon={TrendingUp} title="Escalabilidade" subtitle="Arquitetura pensada para crescer com a demanda sem reescrever código." />
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: Globe, title: "Multi-cidade", desc: "A entidade Cidade permite cadastrar qualquer município. Filtros e mapas se adaptam automaticamente." },
                { icon: Building2, title: "Multi-empresa", desc: "A entidade Empresa suporta Prefeituras, Terceirizadas e Concessionárias no mesmo sistema." },
                { icon: Users, title: "Multi-equipe", desc: "Perfis flexíveis (admin, operador, técnico, motorista, ajudante) suportam estruturas de qualquer tamanho." },
                { icon: Database, title: "Banco ilimitado", desc: "Base44 não tem limite de registros. O sistema suporta milhares de chamados, materiais e usuários." },
                { icon: Smartphone, title: "Mobile-first", desc: "Todo o sistema foi desenvolvido responsivo. Funciona perfeitamente em celulares sem instalar aplicativo." },
                { icon: Bell, title: "Tempo real", desc: "WebSocket subscriptions garantem que todos os usuários vejam atualizações imediatamente." },
                { icon: Lock, title: "Segurança por papel", desc: "Cada rota, ação e dado é protegido pelo papel do usuário. Nenhum acesso indevido é possível." },
                { icon: Upload, title: "Armazenamento de arquivos", desc: "Fotos de chamados e logomarcas armazenadas em CDN com URLs permanentes." },
              ].map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-5 flex gap-4">
                  <item.icon className="w-5 h-5 text-lumicity-cyan flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-space font-700 text-white text-sm mb-1">{item.title}</h3>
                    <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6">
              <h3 className="font-space font-700 text-white mb-3">Próximos Passos para Escalar</h3>
              <ul className="space-y-2">
                {[
                  "Notificações push via e-mail ou WhatsApp ao mudar status do chamado",
                  "App nativo (iOS/Android) usando o mesmo código React via wrapper",
                  "Integração com sistemas de protocolo municipal (SIGAM, e-SIC)",
                  "Dashboard público com transparência de dados para a população",
                  "Módulo de manutenção preventiva baseado em histórico de chamados",
                  "Integração com Google Maps API para geocoding mais preciso",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-white/60 text-sm">
                    <ArrowRight className="w-4 h-4 text-lumicity-cyan flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}

        {/* ── MERCADO ── */}
        {activeSection === "mercado" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <SectionHeader icon={Building2} title="Pronto para o Mercado" subtitle="Tudo o que uma plataforma precisa para ser comercializada." />

            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { icon: CheckCircle2, title: "Produto completo", color: "text-green-400", desc: "Todos os módulos funcionais e integrados. Sem funcionalidades pela metade." },
                { icon: Smartphone, title: "Responsivo", color: "text-blue-400", desc: "Funciona no celular, tablet e desktop sem instalar nada." },
                { icon: Star, title: "Diferencial com IA", color: "text-yellow-400", desc: "IA nativa em descrição, prioridade, relatórios e chatbot." },
              ].map((item, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
                  <item.icon className={`w-8 h-8 ${item.color} mx-auto mb-3`} />
                  <h3 className="font-space font-700 text-white mb-1">{item.title}</h3>
                  <p className="text-white/50 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="font-space font-700 text-white mb-4">Público-Alvo</h3>
              <div className="space-y-3">
                {[
                  { icon: Building2, title: "Prefeituras", desc: "Cidades de qualquer porte que precisam digitalizar a gestão de iluminação pública e prestar contas à população." },
                  { icon: Wrench, title: "Empresas Terceirizadas", desc: "Prestadoras de serviço de manutenção elétrica que atendem múltiplos contratos municipais." },
                  { icon: Zap, title: "Concessionárias", desc: "Distribuidoras de energia com obrigação de manter a iluminação pública operacional." },
                ].map((t, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <t.icon className="w-5 h-5 text-lumicity-cyan flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white font-inter font-500 text-sm">{t.title}</p>
                      <p className="text-white/50 text-xs">{t.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="font-space font-700 text-white mb-4">Modelo de Comercialização Sugerido</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { plan: "Básico", price: "R$ 497/mês", desc: "1 cidade, até 5 operadores, módulos essenciais" },
                  { plan: "Profissional", price: "R$ 997/mês", desc: "Até 5 cidades, operadores ilimitados, relatórios IA" },
                  { plan: "Enterprise", price: "Sob consulta", desc: "Multi-empresa, SLA garantido, personalização de marca" },
                ].map((plan, i) => (
                  <div key={i} className={`rounded-xl p-4 border ${i === 1 ? "bg-primary/15 border-primary/30" : "bg-white/5 border-white/10"}`}>
                    <p className={`font-space font-700 ${i === 1 ? "text-lumicity-cyan" : "text-white"} mb-1`}>{plan.plan}</p>
                    <p className="text-white text-xl font-space font-700 mb-2">{plan.price}</p>
                    <p className="text-white/50 text-xs">{plan.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-primary/20 to-lumicity-cyan/10 border border-primary/30 rounded-2xl p-8 text-center">
              <Zap className="w-10 h-10 text-lumicity-cyan mx-auto mb-4" />
              <h3 className="font-space text-2xl font-700 text-white mb-3">LumiCity está pronto</h3>
              <p className="text-white/60 max-w-xl mx-auto leading-relaxed">
                Com mais de <strong className="text-white">7 módulos funcionais</strong>, <strong className="text-white">4 perfis de acesso</strong>, <strong className="text-white">IA em 4 pontos do sistema</strong> e arquitetura multi-empresa e multi-cidade, o LumiCity está pronto para ser comercializado e implantado em qualquer município do Brasil.
              </p>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="mb-2">
      <div className="flex items-center gap-3 mb-2">
        <Icon className="w-6 h-6 text-lumicity-cyan" />
        <h2 className="font-space text-2xl font-700 text-white">{title}</h2>
      </div>
      <p className="text-white/40 font-inter">{subtitle}</p>
    </div>
  );
}

function FlowCard({ title, color, steps }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <h3 className={`font-space font-700 ${color} mb-5`}>{title}</h3>
      <div className="space-y-4">
        {steps.map((s, i) => (
          <div key={i} className="flex gap-4">
            <div className={`w-7 h-7 rounded-full ${color.replace("text-", "bg-").replace("-400", "-500/20")} border ${color.replace("text-", "border-").replace("-400", "-500/30")} flex items-center justify-center flex-shrink-0`}>
              <span className={`text-xs font-space font-700 ${color}`}>{s.num}</span>
            </div>
            <div>
              <p className="text-white font-inter font-500 text-sm">{s.title}</p>
              <p className="text-white/50 text-xs mt-0.5 leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}