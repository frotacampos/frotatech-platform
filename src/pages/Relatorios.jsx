import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  FileText, BarChart2, MapPin, Package, Calendar, Download,
  TrendingUp, Clock, CheckCircle, AlertCircle, Loader2, Users, CreditCard, Phone, Printer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { citizensApi, reportsApi, stockApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import AppSidebar from "@/components/layout/AppSidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import { useAppAuth } from "@/hooks/useAuth";

const ABAS = [
  { id: "servicos", label: "Ordens de Serviço", icon: FileText },
  { id: "mensais", label: "Serviços Mensais", icon: BarChart2 },
  { id: "bairros", label: "Por Bairro/Local", icon: MapPin },
  { id: "materiais", label: "Materiais Usados", icon: Package },
  { id: "cidadaos", label: "Cidadãos", icon: Users },
];

const STATUS_COLORS = {
  "Pendente": "#ef4444",
  "Em Andamento": "#eab308",
  "Resolvido": "#22c55e",
  "Cancelado": "#6b7280",
};

export default function Relatorios() {
  const { user, role, loading } = useAppAuth();
  const [abaAtiva, setAbaAtiva] = useState("servicos");
  const [mesReferencia, setMesReferencia] = useState(format(new Date(), "yyyy-MM"));
  const [gerando, setGerando] = useState(false);

  const { data: reportes = [], isLoading: loadingReportes } = useQuery({
    queryKey: ["relatorio-reportes"],
    queryFn: () => reportsApi.listReports({ orderBy: "-data_criacao", limit: 1000 }),
    enabled: !loading,
  });

  const { data: movimentacoes = [], isLoading: loadingMov } = useQuery({
    queryKey: ["relatorio-movimentacoes"],
    queryFn: () => stockApi.listMovements({ orderBy: "-created_date", limit: 500 }),
    enabled: !loading,
  });

  const { data: todosRegistrosCidadaos = [], isLoading: loadingCidadaos } = useQuery({
    queryKey: ["relatorio-cidadaos"],
    queryFn: () => citizensApi.listCitizens({ orderBy: "-created_date", limit: 1000 }),
    enabled: !loading,
  });
  const cidadaos = todosRegistrosCidadaos.filter(r => !r.perfil || r.perfil === "cidadao");

  // Filtro por mês selecionado
  const [anoMes] = mesReferencia.split("-");
  const mesFiltro = useMemo(() => {
    const [ano, mes] = mesReferencia.split("-").map(Number);
    return { start: startOfMonth(new Date(ano, mes - 1)), end: endOfMonth(new Date(ano, mes - 1)) };
  }, [mesReferencia]);

  const reportesMes = useMemo(() =>
    reportes.filter(r => {
      try {
        return isWithinInterval(parseISO(r.data_criacao || r.created_date), mesFiltro);
      } catch { return false; }
    }), [reportes, mesFiltro]);

  // Dados mensais (últimos 6 meses)
  const dadosMensais = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const ref = subMonths(new Date(), 5 - i);
      const label = format(ref, "MMM/yy", { locale: ptBR });
      const inicio = startOfMonth(ref);
      const fim = endOfMonth(ref);
      const total = reportes.filter(r => {
        try { return isWithinInterval(parseISO(r.data_criacao || r.created_date), { start: inicio, end: fim }); }
        catch { return false; }
      });
      return {
        mes: label,
        total: total.length,
        resolvidos: total.filter(r => r.status === "Resolvido").length,
        pendentes: total.filter(r => r.status === "Pendente").length,
      };
    });
  }, [reportes]);

  // Por bairro/endereço
  const dadosBairros = useMemo(() => {
    const mapa = {};
    reportesMes.forEach(r => {
      const local = (r.endereco || "Sem endereço").split(",")[0].trim() || "Sem endereço";
      if (!mapa[local]) mapa[local] = { local, total: 0, resolvidos: 0 };
      mapa[local].total++;
      if (r.status === "Resolvido") mapa[local].resolvidos++;
    });
    return Object.values(mapa).sort((a, b) => b.total - a.total).slice(0, 10);
  }, [reportesMes]);

  // Por status (pie)
  const dadosStatus = useMemo(() => {
    const mapa = {};
    reportesMes.forEach(r => {
      mapa[r.status] = (mapa[r.status] || 0) + 1;
    });
    return Object.entries(mapa).map(([name, value]) => ({ name, value }));
  }, [reportesMes]);

  // Materiais usados
  const dadosMateriais = useMemo(() => {
    const movMes = movimentacoes.filter(m => {
      try { return isWithinInterval(parseISO(m.created_date), mesFiltro); }
      catch { return false; }
    });
    const mapa = {};
    movMes.filter(m => m.tipo === "Saída").forEach(m => {
      if (!mapa[m.material_nome]) mapa[m.material_nome] = { nome: m.material_nome, quantidade: 0, movimentos: 0 };
      mapa[m.material_nome].quantidade += m.quantidade;
      mapa[m.material_nome].movimentos++;
    });
    return Object.values(mapa).sort((a, b) => b.quantidade - a.quantidade);
  }, [movimentacoes, mesFiltro]);

  const gerarPDF = async () => {
    setGerando(true);
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const mesLabel = format(new Date(mesFiltro.start), "MMMM/yyyy", { locale: ptBR });

    doc.setFontSize(18);
    doc.text("LumiCity - Relatório de Serviços", 20, 20);
    doc.setFontSize(11);
    doc.text(`Período: ${mesLabel}`, 20, 30);
    doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 20, 37);

    doc.setFontSize(14);
    doc.text("Resumo do Mês", 20, 50);
    doc.setFontSize(10);
    doc.text(`Total de chamados: ${reportesMes.length}`, 20, 60);
    doc.text(`Resolvidos: ${reportesMes.filter(r => r.status === "Resolvido").length}`, 20, 67);
    doc.text(`Pendentes: ${reportesMes.filter(r => r.status === "Pendente").length}`, 20, 74);
    doc.text(`Em Andamento: ${reportesMes.filter(r => r.status === "Em Andamento").length}`, 20, 81);

    doc.setFontSize(14);
    doc.text("Ordens de Serviço", 20, 95);
    doc.setFontSize(9);
    doc.text("ID", 20, 105);
    doc.text("Descrição", 45, 105);
    doc.text("Status", 140, 105);
    doc.text("Local", 165, 105);
    doc.line(20, 107, 190, 107);

    let y = 112;
    reportesMes.slice(0, 30).forEach(r => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(r.id?.slice(-6).toUpperCase() || "-", 20, y);
      doc.text((r.descricao || "").slice(0, 40), 45, y);
      doc.text(r.status || "-", 140, y);
      doc.text((r.endereco || "").slice(0, 20), 165, y);
      y += 7;
    });

    doc.save(`lumicity-relatorio-${mesReferencia}.pdf`);
    setGerando(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-lumicity-dark flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-lumicity-dark">
      <AppSidebar user={user} role={role} />
      <MobileHeader user={user} role={role} title="Relatórios" />

      <main className="lg:pl-64 pt-20 lg:pt-0 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-space text-2xl sm:text-3xl font-700 text-white">Relatórios</h1>
              <p className="text-white/40 font-inter text-sm mt-1">Análise e exportação de dados operacionais</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="month"
                value={mesReferencia}
                onChange={e => setMesReferencia(e.target.value)}
                className="bg-white/5 border border-white/15 text-white rounded-xl h-9 px-3 text-sm [color-scheme:dark] focus:outline-none"
              />
              <Button
                onClick={gerarPDF}
                disabled={gerando}
                className="gradient-lumicity text-white border-0 rounded-xl whitespace-nowrap"
              >
                {gerando ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                Exportar PDF
              </Button>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total no mês", value: reportesMes.length, icon: FileText, color: "text-lumicity-cyan" },
              { label: "Resolvidos", value: reportesMes.filter(r => r.status === "Resolvido").length, icon: CheckCircle, color: "text-green-400" },
              { label: "Pendentes", value: reportesMes.filter(r => r.status === "Pendente").length, icon: Clock, color: "text-yellow-400" },
              { label: "Cancelados", value: reportesMes.filter(r => r.status === "Cancelado").length, icon: AlertCircle, color: "text-red-400" },
            ].map((k, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className={`w-8 h-8 rounded-xl bg-white/8 flex items-center justify-center mb-3 ${k.color}`}>
                  <k.icon className="w-4 h-4" />
                </div>
                <p className="font-space text-2xl font-700 text-white">{k.value}</p>
                <p className="text-white/40 text-xs font-inter mt-0.5">{k.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Abas */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {ABAS.map(aba => (
              <button
                key={aba.id}
                onClick={() => setAbaAtiva(aba.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-inter whitespace-nowrap transition-all ${
                  abaAtiva === aba.id
                    ? "gradient-lumicity text-white"
                    : "bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10"
                }`}
              >
                <aba.icon className="w-4 h-4" />
                {aba.label}
              </button>
            ))}
          </div>

          {/* Conteúdo das abas */}
          {loadingReportes ? (
            <div className="py-20 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Ordens de Serviço */}
              {abaAtiva === "servicos" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="px-4 py-3 text-left text-white/40 text-xs uppercase font-inter">OS</th>
                            <th className="px-4 py-3 text-left text-white/40 text-xs uppercase font-inter">Descrição</th>
                            <th className="px-4 py-3 text-left text-white/40 text-xs uppercase font-inter hidden sm:table-cell">Local</th>
                            <th className="px-4 py-3 text-left text-white/40 text-xs uppercase font-inter hidden md:table-cell">Operador</th>
                            <th className="px-4 py-3 text-left text-white/40 text-xs uppercase font-inter">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {reportesMes.length === 0 ? (
                            <tr><td colSpan={5} className="py-12 text-center text-white/30 text-sm">Nenhum chamado neste período.</td></tr>
                          ) : reportesMes.map(r => (
                            <tr key={r.id} className="hover:bg-white/3">
                              <td className="px-4 py-3 text-lumicity-cyan text-xs font-mono">#{r.id?.slice(-6).toUpperCase()}</td>
                              <td className="px-4 py-3 text-white/80 text-sm max-w-xs truncate">{r.descricao}</td>
                              <td className="px-4 py-3 text-white/40 text-xs hidden sm:table-cell max-w-[150px] truncate">{r.endereco || "—"}</td>
                              <td className="px-4 py-3 text-white/40 text-xs hidden md:table-cell">{r.operador_nome || "—"}</td>
                              <td className="px-4 py-3">
                                <span className="text-xs font-inter px-2 py-1 rounded-full" style={{
                                  backgroundColor: (STATUS_COLORS[r.status] || "#666") + "20",
                                  color: STATUS_COLORS[r.status] || "#999"
                                }}>{r.status}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Serviços Mensais */}
              {abaAtiva === "mensais" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-6">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="font-space font-600 text-white mb-4">Chamados nos últimos 6 meses</h3>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={dadosMensais}>
                        <XAxis dataKey="mes" tick={{ fill: "#ffffff50", fontSize: 11 }} />
                        <YAxis tick={{ fill: "#ffffff50", fontSize: 11 }} />
                        <Tooltip contentStyle={{ background: "#0d1525", border: "1px solid #ffffff20", borderRadius: 10, color: "#fff" }} />
                        <Legend wrapperStyle={{ color: "#ffffff60", fontSize: 12 }} />
                        <Bar dataKey="total" name="Total" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="resolvidos" name="Resolvidos" fill="#22c55e" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="pendentes" name="Pendentes" fill="#ef4444" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="font-space font-600 text-white mb-4">Distribuição por Status — {format(mesFiltro.start, "MMMM/yyyy", { locale: ptBR })}</h3>
                    {dadosStatus.length === 0 ? (
                      <p className="text-white/30 text-sm text-center py-8">Sem dados neste período.</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie data={dadosStatus} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                            {dadosStatus.map((entry, i) => (
                              <Cell key={i} fill={STATUS_COLORS[entry.name] || "#6b7280"} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ background: "#0d1525", border: "1px solid #ffffff20", borderRadius: 10, color: "#fff" }} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Por Bairro */}
              {abaAtiva === "bairros" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
                    <h3 className="font-space font-600 text-white mb-4">Chamados por Localidade — {format(mesFiltro.start, "MMMM/yyyy", { locale: ptBR })}</h3>
                    {dadosBairros.length === 0 ? (
                      <p className="text-white/30 text-sm text-center py-8">Sem dados neste período.</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={dadosBairros} layout="vertical">
                          <XAxis type="number" tick={{ fill: "#ffffff50", fontSize: 11 }} />
                          <YAxis type="category" dataKey="local" width={120} tick={{ fill: "#ffffff60", fontSize: 10 }} />
                          <Tooltip contentStyle={{ background: "#0d1525", border: "1px solid #ffffff20", borderRadius: 10, color: "#fff" }} />
                          <Bar dataKey="total" name="Total" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
                          <Bar dataKey="resolvidos" name="Resolvidos" fill="#22c55e" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="px-4 py-3 text-left text-white/40 text-xs uppercase font-inter">Localidade</th>
                          <th className="px-4 py-3 text-center text-white/40 text-xs uppercase font-inter">Total</th>
                          <th className="px-4 py-3 text-center text-white/40 text-xs uppercase font-inter">Resolvidos</th>
                          <th className="px-4 py-3 text-center text-white/40 text-xs uppercase font-inter">% Resolução</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {dadosBairros.map((b, i) => (
                          <tr key={i} className="hover:bg-white/3">
                            <td className="px-4 py-3 text-white/80 text-sm">{b.local}</td>
                            <td className="px-4 py-3 text-center text-white font-space font-600">{b.total}</td>
                            <td className="px-4 py-3 text-center text-green-400 font-space font-600">{b.resolvidos}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`text-sm font-space font-600 ${b.total > 0 && b.resolvidos / b.total >= 0.7 ? "text-green-400" : "text-yellow-400"}`}>
                                {b.total > 0 ? Math.round((b.resolvidos / b.total) * 100) : 0}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {/* Cidadãos */}
              {abaAtiva === "cidadaos" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-white/40 text-sm font-inter">{cidadaos.length} cidadão(s) cadastrado(s)</p>
                    <Button
                      onClick={() => {
                        const win = window.open("", "_blank");
                        const rows = cidadaos.map(c => `
                          <tr style="border-bottom:1px solid #eee">
                            <td style="padding:6px 10px">${c.nome || "—"}</td>
                            <td style="padding:6px 10px">${c.cpf || "—"}</td>
                            <td style="padding:6px 10px">${c.data_nascimento || "—"}</td>
                            <td style="padding:6px 10px">${c.telefone || "—"}</td>
                            <td style="padding:6px 10px">${c.email || "—"}</td>
                            <td style="padding:6px 10px;text-align:center">${c.ativo ? "✅" : "❌"}</td>
                          </tr>`).join("");
                        win.document.write(`<!DOCTYPE html><html><head><title>Relatório de Cidadãos - LumiCity</title>
                          <style>body{font-family:Arial,sans-serif;padding:30px;color:#111}
                          h1{font-size:20px;margin-bottom:4px}p{color:#555;font-size:13px;margin-bottom:20px}
                          table{width:100%;border-collapse:collapse;font-size:13px}
                          th{background:#0ea5e9;color:#fff;padding:8px 10px;text-align:left}
                          tr:nth-child(even){background:#f5f5f5}
                          @media print{button{display:none}}</style></head>
                          <body>
                          <h1>LumiCity — Relatório de Cidadãos</h1>
                          <p>Gerado em: ${new Date().toLocaleString("pt-BR")} | Total: ${cidadaos.length} cidadão(s)</p>
                          <button onclick="window.print()" style="margin-bottom:16px;padding:8px 16px;background:#0ea5e9;color:#fff;border:none;border-radius:6px;cursor:pointer">🖨️ Imprimir</button>
                          <table><thead><tr>
                            <th>Nome</th><th>CPF</th><th>Nascimento</th><th>Telefone</th><th>E-mail</th><th>Ativo</th>
                          </tr></thead><tbody>${rows}</tbody></table>
                          </body></html>`);
                        win.document.close();
                      }}
                      className="gradient-lumicity text-white border-0 rounded-xl text-sm"
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Imprimir / Exportar
                    </Button>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    {loadingCidadaos ? (
                      <div className="py-12 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      </div>
                    ) : cidadaos.length === 0 ? (
                      <p className="py-12 text-center text-white/30 text-sm">Nenhum cidadão cadastrado.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-white/10">
                              <th className="px-4 py-3 text-left text-white/40 text-xs uppercase font-inter">Nome</th>
                              <th className="px-4 py-3 text-left text-white/40 text-xs uppercase font-inter">CPF</th>
                              <th className="px-4 py-3 text-left text-white/40 text-xs uppercase font-inter hidden sm:table-cell">Nascimento</th>
                              <th className="px-4 py-3 text-left text-white/40 text-xs uppercase font-inter hidden md:table-cell">Telefone</th>
                              <th className="px-4 py-3 text-left text-white/40 text-xs uppercase font-inter hidden md:table-cell">E-mail</th>
                              <th className="px-4 py-3 text-center text-white/40 text-xs uppercase font-inter">Ativo</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {cidadaos.map(c => (
                              <tr key={c.id} className="hover:bg-white/3">
                                <td className="px-4 py-3 text-white/80 text-sm font-inter">{c.nome}</td>
                                <td className="px-4 py-3 text-white/50 text-xs font-mono">{c.cpf}</td>
                                <td className="px-4 py-3 text-white/40 text-xs hidden sm:table-cell">{c.data_nascimento || "—"}</td>
                                <td className="px-4 py-3 text-white/40 text-xs hidden md:table-cell">{c.telefone || "—"}</td>
                                <td className="px-4 py-3 text-white/40 text-xs hidden md:table-cell">{c.email || "—"}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`w-2 h-2 rounded-full inline-block ${c.ativo ? "bg-green-400" : "bg-red-400"}`} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Materiais */}
              {abaAtiva === "materiais" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2">
                      <Package className="w-4 h-4 text-white/40" />
                      <h3 className="font-space font-600 text-white text-sm">Materiais utilizados em {format(mesFiltro.start, "MMMM/yyyy", { locale: ptBR })}</h3>
                    </div>
                    {loadingMov ? (
                      <div className="py-12 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      </div>
                    ) : dadosMateriais.length === 0 ? (
                      <p className="py-12 text-center text-white/30 text-sm">Nenhuma saída de material registrada neste período.</p>
                    ) : (
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="px-4 py-3 text-left text-white/40 text-xs uppercase font-inter">Material</th>
                            <th className="px-4 py-3 text-center text-white/40 text-xs uppercase font-inter">Qtd. Usada</th>
                            <th className="px-4 py-3 text-center text-white/40 text-xs uppercase font-inter">N° Mov.</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {dadosMateriais.map((m, i) => (
                            <tr key={i} className="hover:bg-white/3">
                              <td className="px-4 py-3 text-white/80 text-sm">{m.nome}</td>
                              <td className="px-4 py-3 text-center text-lumicity-cyan font-space font-700">{m.quantidade}</td>
                              <td className="px-4 py-3 text-center text-white/40 text-sm">{m.movimentos}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
