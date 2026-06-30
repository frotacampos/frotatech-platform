import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Users, Search, Filter, MapPin, Calendar,
  RefreshCw, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { citiesApi, reportsApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import StatusBadge from "@/components/operador/StatusBadge";
import ChamadoDetalhes from "@/components/operador/ChamadoDetalhes";
import AppSidebar from "@/components/layout/AppSidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import { useAppAuth } from "@/hooks/useAuth";
import { formatDuration, calcDuration, slaColor } from "@/lib/sla";

export default function Chamados() {
  const { user, role, loading } = useAppAuth();
  const [selectedChamado, setSelectedChamado] = useState(null);

  // Filters
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [filtroData, setFiltroData] = useState("");
  const [filtroUsuario, setFiltroUsuario] = useState("");
  const [filtroCidade, setFiltroCidade] = useState("Todas");
  const [busca, setBusca] = useState("");

  const { data: chamados = [], isLoading, refetch } = useQuery({
    queryKey: ["chamados-operador"],
    queryFn: () => reportsApi.listReports({ orderBy: "-data_criacao", limit: 200 }),
    enabled: !loading,
  });

  const { data: cidades = [] } = useQuery({
    queryKey: ["cidades"],
    queryFn: () => citiesApi.listCities({ orderBy: "nome" }),
    enabled: !loading,
  });

  const handleUpdated = () => {
    refetch();
    if (selectedChamado) {
      reportsApi.listReports({ orderBy: "-data_criacao", limit: 200 }).then(all => {
        const updated = all.find(r => r.id === selectedChamado.id);
        if (updated) setSelectedChamado(updated);
      });
    }
  };

  // --- Filtering ---
  const chamadosFiltrados = chamados.filter((c) => {
    if (filtroStatus !== "Todos" && c.status !== filtroStatus) return false;
    if (filtroCidade !== "Todas" && c.cidade_nome !== filtroCidade) return false;
    if (filtroData) {
      const dataC = c.data_criacao || c.created_date;
      if (!dataC || !dataC.startsWith(filtroData)) return false;
    }
    if (filtroUsuario) {
      const nome = (c.usuario_nome || "").toLowerCase();
      if (!nome.includes(filtroUsuario.toLowerCase())) return false;
    }
    if (busca) {
      const b = busca.toLowerCase();
      const desc = (c.descricao || "").toLowerCase();
      const end = (c.endereco || "").toLowerCase();
      if (!desc.includes(b) && !end.includes(b)) return false;
    }
    return true;
  });

  const countPorStatus = (s) => chamados.filter(c => c.status === s).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-lumicity-dark flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (role === "cidadao") {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center px-4">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h2 className="font-space text-xl font-700 text-white mb-2">Acesso Restrito</h2>
          <p className="text-white/50 font-inter mb-6">Esta área é exclusiva para operadores e administradores.</p>
          <Link to="/dashboard"><Button className="gradient-lumicity text-white border-0 rounded-xl">Voltar ao início</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lumicity-dark flex">
      <AppSidebar user={user} role={role} />
      <MobileHeader user={user} role={role} title="Chamados" />

      {/* Main */}
      <main className="lg:pl-64 w-full pt-20 lg:pt-0 pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

          {/* Page header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-space text-2xl sm:text-3xl font-700 text-white">Chamados</h1>
              <p className="text-white/40 font-inter text-sm mt-1">{chamados.length} registros no total</p>
            </div>
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              className="border-white/20 text-white/60 hover:text-white hover:bg-white/10 rounded-xl"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>

          {/* Status summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Total", count: chamados.length, color: "text-white", bg: "bg-white/5", border: "border-white/10" },
              { label: "Pendentes", count: countPorStatus("Pendente"), color: "text-yellow-400", bg: "bg-yellow-500/5", border: "border-yellow-500/20" },
              { label: "Em Andamento", count: countPorStatus("Em Andamento"), color: "text-blue-400", bg: "bg-blue-500/5", border: "border-blue-500/20" },
              { label: "Resolvidos", count: countPorStatus("Resolvido"), color: "text-green-400", bg: "bg-green-500/5", border: "border-green-500/20" },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className={`${s.bg} border ${s.border} rounded-2xl p-4 text-center cursor-pointer hover:brightness-110 transition-all`}
                onClick={() => setFiltroStatus(s.label === "Total" ? "Todos" : s.label)}
              >
                <p className={`font-space text-2xl font-700 ${s.color}`}>{s.count}</p>
                <p className="text-white/40 text-xs font-inter mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none z-10" />
                <input
                  placeholder="Buscar descrição..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full bg-white/8 border border-white/15 text-white placeholder:text-white/25 pl-9 pr-4 rounded-xl h-10 text-sm font-inter focus:outline-none focus:border-lumicity-cyan [color-scheme:dark]"
                />
              </div>

              {/* Status */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                <select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                  className="w-full bg-white/8 border border-white/15 text-white rounded-xl h-10 pl-9 pr-4 text-sm font-inter appearance-none cursor-pointer focus:outline-none focus:border-lumicity-cyan [color-scheme:dark]"
                >
                  {["Todos", "Pendente", "Em Andamento", "Resolvido", "Cancelado"].map(s => (
                    <option key={s} value={s} className="bg-gray-900">{s}</option>
                  ))}
                </select>
              </div>

              {/* Data */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                <input
                  type="date"
                  value={filtroData}
                  onChange={(e) => setFiltroData(e.target.value)}
                  className="w-full bg-white/8 border border-white/15 text-white rounded-xl h-10 pl-9 pr-4 text-sm font-inter appearance-none focus:outline-none focus:border-lumicity-cyan [color-scheme:dark]"
                />
              </div>

              {/* Usuário */}
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none z-10" />
                <input
                  placeholder="Filtrar por cidadão..."
                  value={filtroUsuario}
                  onChange={(e) => setFiltroUsuario(e.target.value)}
                  className="w-full bg-white/8 border border-white/15 text-white placeholder:text-white/25 pl-9 pr-4 rounded-xl h-10 text-sm font-inter focus:outline-none focus:border-lumicity-cyan [color-scheme:dark]"
                />
              </div>

              {/* Cidade */}
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                <select
                  value={filtroCidade}
                  onChange={e => setFiltroCidade(e.target.value)}
                  className="w-full bg-white/8 border border-white/15 text-white rounded-xl h-10 pl-9 pr-4 text-sm font-inter appearance-none cursor-pointer focus:outline-none focus:border-lumicity-cyan [color-scheme:dark]"
                >
                  <option value="Todas" className="bg-gray-900">Todas as cidades</option>
                  {cidades.map(c => <option key={c.id} value={c.nome} className="bg-gray-900">{c.nome}</option>)}
                </select>
              </div>
            </div>

            {(filtroStatus !== "Todos" || filtroData || filtroUsuario || busca || filtroCidade !== "Todas") && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-white/30 text-xs font-inter">{chamadosFiltrados.length} resultado(s)</span>
                <button
                  onClick={() => { setFiltroStatus("Todos"); setFiltroData(""); setFiltroUsuario(""); setBusca(""); setFiltroCidade("Todas"); }}
                  className="text-lumicity-cyan text-xs hover:underline"
                >
                  Limpar filtros
                </button>
              </div>
            )}
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="space-y-2">
              {[1,2,3,4,5].map(i => <div key={i} className="bg-white/5 rounded-2xl h-16 animate-pulse" />)}
            </div>
          ) : chamadosFiltrados.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-16 text-center">
              <FileText className="w-10 h-10 text-white/15 mx-auto mb-3" />
              <p className="text-white/30 font-inter">Nenhum chamado encontrado.</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left px-5 py-3 text-white/30 text-xs font-inter uppercase tracking-wider">ID</th>
                      <th className="text-left px-5 py-3 text-white/30 text-xs font-inter uppercase tracking-wider">Descrição</th>
                      <th className="text-left px-5 py-3 text-white/30 text-xs font-inter uppercase tracking-wider">Cidadão</th>
                      <th className="text-left px-5 py-3 text-white/30 text-xs font-inter uppercase tracking-wider">Localização</th>
                      <th className="text-left px-5 py-3 text-white/30 text-xs font-inter uppercase tracking-wider">Data</th>
                      <th className="text-left px-5 py-3 text-white/30 text-xs font-inter uppercase tracking-wider">Status</th>
                      <th className="text-left px-5 py-3 text-white/30 text-xs font-inter uppercase tracking-wider">Responsável</th>
                      <th className="text-left px-5 py-3 text-white/30 text-xs font-inter uppercase tracking-wider">SLA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {chamadosFiltrados.map((c, i) => (
                      <motion.tr
                        key={c.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => setSelectedChamado(c)}
                        className="hover:bg-white/5 cursor-pointer transition-colors group"
                      >
                        <td className="px-5 py-4">
                          <span className="text-white/30 text-xs font-mono">#{c.id?.slice(-6).toUpperCase()}</span>
                        </td>
                        <td className="px-5 py-4 max-w-xs">
                          <p className="text-white/80 text-sm font-inter line-clamp-2 group-hover:text-white transition-colors">{c.descricao}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-white/50 text-sm font-inter">{c.usuario_nome || "—"}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-white/25 flex-shrink-0" />
                            <span className="text-white/40 text-xs font-inter truncate max-w-32">{c.endereco || "—"}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-white/40 text-xs font-inter whitespace-nowrap">
                            {c.data_criacao || c.created_date
                              ? format(new Date(c.data_criacao || c.created_date), "dd/MM/yy HH:mm", { locale: ptBR })
                              : "—"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={c.status} />
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-white/40 text-xs font-inter">{c.operador_nome || <span className="italic text-white/20">Sem resp.</span>}</span>
                        </td>
                        <td className="px-5 py-4">
                          {(() => {
                            const sla = calcDuration(c.data_criacao || c.created_date, c.status === "Resolvido" ? c.data_resolucao : null);
                            return <span className={`text-xs font-inter font-500 ${slaColor(sla)}`}>{formatDuration(sla)}</span>;
                          })()}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-3">
                {chamadosFiltrados.map((c, i) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => setSelectedChamado(c)}
                    className="bg-white/5 border border-white/10 rounded-2xl p-4 cursor-pointer hover:border-white/20 transition-all active:scale-[0.99]"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="text-white/80 text-sm font-inter line-clamp-2 flex-1">{c.descricao}</p>
                      <StatusBadge status={c.status} />
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-white/30 text-xs font-inter">{c.usuario_nome || "—"}</span>
                      {c.endereco && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-white/20" />
                          <span className="text-white/25 text-xs font-inter truncate max-w-28">{c.endereco}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-white/20 text-xs font-inter">
                        {c.data_criacao || c.created_date
                          ? format(new Date(c.data_criacao || c.created_date), "dd/MM/yy HH:mm", { locale: ptBR })
                          : "—"}
                      </span>
                      <span className="text-white/25 text-xs font-inter">{c.operador_nome || "Sem responsável"}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Drawer de detalhes */}
      <AnimatePresence>
        {selectedChamado && (
          <ChamadoDetalhes
            reporte={selectedChamado}
            operador={user}
            onClose={() => setSelectedChamado(null)}
            onUpdated={handleUpdated}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
