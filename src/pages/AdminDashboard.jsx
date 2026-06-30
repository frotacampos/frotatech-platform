import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from "recharts";
import {
  AlertTriangle, TrendingUp, Clock, CheckCircle,
  Wrench, MapPin, Map, Users, Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { citiesApi, reportsApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { calcAvgResolutionTime, formatDuration, getHotspots, slaColor, calcDuration } from "@/lib/sla";
import AppSidebar from "@/components/layout/AppSidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import { useAppAuth } from "@/hooks/useAuth";
import StatusBadge from "@/components/operador/StatusBadge";
import { AnimatePresence } from "framer-motion";
import ChamadoDetalhes from "@/components/operador/ChamadoDetalhes";
import RelatorioTendencias from "@/components/ai/RelatorioTendencias";

export default function AdminDashboard() {
  const { user, role, loading } = useAppAuth();
  const [filtroCidade, setFiltroCidade] = useState("Todas");
  const [selectedChamado, setSelectedChamado] = useState(null);

  const { data: allReportes = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-reportes"],
    queryFn: () => reportsApi.listReports({ orderBy: "-data_criacao", limit: 500 }),
    enabled: !loading,
  });

  const { data: cidades = [] } = useQuery({
    queryKey: ["cidades"],
    queryFn: () => citiesApi.listCities({ orderBy: "nome" }),
    enabled: !loading,
  });

  if (loading || isLoading) {
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
          <p className="text-white/50 font-inter mb-6">Esta área é exclusiva para administradores.</p>
          <Link to="/dashboard"><Button className="gradient-lumicity text-white border-0 rounded-xl">Voltar</Button></Link>
        </div>
      </div>
    );
  }

  // Filter by city
  const reportes = filtroCidade === "Todas"
    ? allReportes
    : allReportes.filter(r => r.cidade_nome === filtroCidade);

  const total = reportes.length;
  const pendentes = reportes.filter(r => r.status === "Pendente").length;
  const emAndamento = reportes.filter(r => r.status === "Em Andamento").length;
  const resolvidos = reportes.filter(r => r.status === "Resolvido").length;
  const avgSla = calcAvgResolutionTime(reportes);

  // Last 7 days chart data
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const day = subDays(new Date(), 6 - i);
    const dateStr = format(day, "yyyy-MM-dd");
    const count = reportes.filter(r => {
      const d = r.data_criacao || r.created_date || "";
      return d.startsWith(dateStr);
    }).length;
    return { dia: format(day, "dd/MM", { locale: ptBR }), chamados: count };
  });

  const pieData = [
    { name: "Pendente", value: pendentes, color: "#eab308" },
    { name: "Em Andamento", value: emAndamento, color: "#3b82f6" },
    { name: "Resolvido", value: resolvidos, color: "#22c55e" },
  ].filter(d => d.value > 0);

  // Hotspots
  const hotspots = getHotspots(reportes);

  // Chamados mais antigos em aberto
  const maisAntigos = [...reportes]
    .filter(r => r.status === "Pendente" || r.status === "Em Andamento")
    .sort((a, b) => {
      const da = new Date(a.data_criacao || a.created_date || 0);
      const db = new Date(b.data_criacao || b.created_date || 0);
      return da - db;
    })
    .slice(0, 5);

  const handleUpdated = () => {
    refetch();
    if (selectedChamado) {
      reportsApi.listReports({ orderBy: "-data_criacao", limit: 500 }).then(all => {
        const updated = all.find(r => r.id === selectedChamado.id);
        if (updated) setSelectedChamado(updated);
      });
    }
  };

  return (
    <div className="min-h-screen bg-lumicity-dark">
      <AppSidebar user={user} role={role} />
      <MobileHeader user={user} role={role} title="Dashboard" />

      <main className="lg:pl-64 pt-20 lg:pt-0 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-space text-2xl sm:text-3xl font-700 text-white">Dashboard Administrativo</h1>
              <p className="text-white/40 font-inter text-sm mt-1">Visão geral do sistema LumiCity</p>
            </div>
            {/* City filter */}
            <select
              value={filtroCidade}
              onChange={e => setFiltroCidade(e.target.value)}
              className="bg-white/8 border border-white/15 text-white rounded-xl h-10 px-4 text-sm font-inter appearance-none cursor-pointer focus:outline-none focus:border-lumicity-cyan [color-scheme:dark] min-w-40"
            >
              <option value="Todas" className="bg-gray-900">Todas as cidades</option>
              {cidades.map(c => (
                <option key={c.id} value={c.nome} className="bg-gray-900">{c.nome}</option>
              ))}
            </select>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {[
              { label: "Total", value: total, color: "text-white", bg: "bg-white/5", border: "border-white/10", icon: Activity },
              { label: "Pendentes", value: pendentes, color: "text-yellow-400", bg: "bg-yellow-500/5", border: "border-yellow-500/20", icon: Clock },
              { label: "Em Andamento", value: emAndamento, color: "text-blue-400", bg: "bg-blue-500/5", border: "border-blue-500/20", icon: Wrench },
              { label: "Resolvidos", value: resolvidos, color: "text-green-400", bg: "bg-green-500/5", border: "border-green-500/20", icon: CheckCircle },
              { label: "Tempo Médio", value: formatDuration(avgSla), color: avgSla ? slaColor(avgSla) : "text-white/40", bg: "bg-white/5", border: "border-white/10", icon: TrendingUp },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className={`${s.bg} border ${s.border} rounded-2xl p-4`}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white/40 text-xs font-inter">{s.label}</p>
                  <s.icon className={`w-4 h-4 ${s.color} opacity-60`} />
                </div>
                <p className={`font-space text-2xl font-700 ${s.color}`}>{s.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Bar chart */}
            <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="font-space font-600 text-white mb-4 text-sm">Chamados — Últimos 7 dias</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={last7} barCategoryGap="30%">
                  <XAxis dataKey="dia" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: "#1a2234", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", fontSize: 12 }}
                    cursor={{ fill: "rgba(255,255,255,0.05)" }}
                  />
                  <Bar dataKey="chamados" radius={[6, 6, 0, 0]}>
                    {last7.map((_, i) => <Cell key={i} fill="url(#barGrad)" />)}
                  </Bar>
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(210,100%,55%)" />
                      <stop offset="100%" stopColor="hsl(190,80%,45%)" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie chart */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="font-space font-600 text-white mb-4 text-sm">Distribuição por Status</h3>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "#1a2234", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", fontSize: 12 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-white/20 text-sm font-inter">Sem dados</div>
              )}
            </div>
          </div>

          {/* Relatório IA de Tendências */}
          <div className="mb-8">
            <RelatorioTendencias />
          </div>

          {/* Bottom row */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Hotspots / Regiões com mais chamados */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4 text-lumicity-cyan" />
                <h3 className="font-space font-600 text-white text-sm">Regiões com Mais Chamados</h3>
              </div>
              {hotspots.length === 0 ? (
                <p className="text-white/25 text-sm font-inter">Nenhum dado de localização disponível.</p>
              ) : (
                <div className="space-y-3">
                  {hotspots.map((h, i) => {
                    const pct = Math.round((h.count / total) * 100);
                    return (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white/60 text-xs font-inter">{h.lat.toFixed(3)}, {h.lng.toFixed(3)}</span>
                          <span className="text-white/80 text-xs font-inter font-500">{h.count} chamados</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            className="h-full gradient-lumicity rounded-full"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-white/10">
                <Link to="/mapa">
                  <Button size="sm" className="gradient-lumicity text-white border-0 rounded-xl text-xs">
                    <Map className="w-3 h-3 mr-1.5" />
                    Ver no Mapa
                  </Button>
                </Link>
              </div>
            </div>

            {/* Chamados mais antigos em aberto */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-red-400" />
                <h3 className="font-space font-600 text-white text-sm">Chamados Mais Antigos em Aberto</h3>
              </div>
              {maisAntigos.length === 0 ? (
                <p className="text-white/25 text-sm font-inter">Nenhum chamado em aberto.</p>
              ) : (
                <div className="space-y-3">
                  {maisAntigos.map((c) => {
                    const sla = calcDuration(c.data_criacao || c.created_date, null);
                    return (
                      <div
                        key={c.id}
                        onClick={() => setSelectedChamado(c)}
                        className="flex items-center justify-between gap-3 cursor-pointer hover:bg-white/5 rounded-xl p-2 -mx-2 transition-all"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-white/70 text-xs font-inter line-clamp-1">{c.descricao}</p>
                          <p className={`text-xs mt-0.5 font-inter font-500 ${slaColor(sla)}`}>
                            {formatDuration(sla)} em aberto
                          </p>
                        </div>
                        <StatusBadge status={c.status} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

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
