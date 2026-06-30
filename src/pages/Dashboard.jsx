import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, MapPin, Clock, CheckCircle, AlertTriangle, FileText, Map, Wrench, User, Mail, Phone, CreditCard, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { reportsApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatDuration, calcDuration, slaColor } from "@/lib/sla";
import AppSidebar from "@/components/layout/AppSidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import { useAppAuth } from "@/hooks/useAuth";

const statusConfig = {
  "Pendente":     { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: Clock },
  "Em Andamento": { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: AlertTriangle },
  "Resolvido":    { color: "bg-green-500/20 text-green-400 border-green-500/30", icon: CheckCircle },
  "Cancelado":    { color: "bg-gray-500/20 text-gray-400 border-gray-500/30", icon: AlertTriangle },
};

export default function Dashboard() {
  const { user, role, loading } = useAppAuth();
  const [abaCidadao, setAbaCidadao] = useState("reportes");
  const userName = user?.full_name || "Usuário";

  const { data: reportes = [], isLoading } = useQuery({
    queryKey: ["reportes", user?.id, role],
    queryFn: async () => {
      if (!user) return [];
      if (role === "cidadao") {
        return reportsApi.listReports({ filters: { usuario_id: user.id }, orderBy: "-data_criacao" });
      }
      return reportsApi.listReports({ orderBy: "-data_criacao", limit: 50 });
    },
    enabled: !!user && !loading,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-lumicity-dark flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lumicity-dark">
      <AppSidebar user={user} role={role} />
      <MobileHeader user={user} role={role} title="Dashboard" />

      <main className="lg:pl-64 pt-20 lg:pt-0 pb-20 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="font-space text-2xl sm:text-3xl font-700 text-white mb-1">
              Olá, {userName.split(" ")[0]} 👋
            </h1>
            <p className="text-white/50 font-inter text-sm">
              {role === "cidadao" ? "Acompanhe seus reportes de iluminação." : "Visão geral dos chamados."}
            </p>
          </motion.div>

          {/* Quick access cards for non-cidadao */}
          {role !== "cidadao" && (
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              <Link to="/admin-dashboard">
                <motion.div
                  initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                  className="bg-primary/10 border border-primary/30 rounded-2xl p-4 hover:bg-primary/15 transition-all cursor-pointer group"
                >
                  <FileText className="w-6 h-6 text-primary mb-2" />
                  <p className="font-space font-600 text-white text-sm">Dashboard Admin</p>
                  <p className="text-white/40 text-xs font-inter mt-1">Estatísticas completas</p>
                </motion.div>
              </Link>
              <Link to="/chamados">
                <motion.div
                  initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="bg-blue-500/10 border border-blue-500/25 rounded-2xl p-4 hover:bg-blue-500/15 transition-all cursor-pointer"
                >
                  <Wrench className="w-6 h-6 text-blue-400 mb-2" />
                  <p className="font-space font-600 text-white text-sm">Chamados</p>
                  <p className="text-white/40 text-xs font-inter mt-1">Gerenciar atendimentos</p>
                </motion.div>
              </Link>
              <Link to="/mapa">
                <motion.div
                  initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                  className="bg-green-500/10 border border-green-500/25 rounded-2xl p-4 hover:bg-green-500/15 transition-all cursor-pointer"
                >
                  <Map className="w-6 h-6 text-green-400 mb-2" />
                  <p className="font-space font-600 text-white text-sm">Mapa</p>
                  <p className="text-white/40 text-xs font-inter mt-1">Visualização geográfica</p>
                </motion.div>
              </Link>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total", value: reportes.length, color: "text-white" },
              { label: "Pendentes", value: reportes.filter(r => r.status === "Pendente").length, color: "text-yellow-400" },
              { label: "Em Andamento", value: reportes.filter(r => r.status === "Em Andamento").length, color: "text-blue-400" },
              { label: "Resolvidos", value: reportes.filter(r => r.status === "Resolvido").length, color: "text-green-400" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center"
              >
                <p className={`font-space text-2xl font-700 ${stat.color}`}>{stat.value}</p>
                <p className="text-white/40 text-xs font-inter mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Action button (cidadao) */}
          {role === "cidadao" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
              <Link to="/registrar-problema">
                <Button className="gradient-lumicity text-white border-0 px-6 py-3 rounded-xl font-inter font-500 hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-lumicity-blue/30">
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar Novo Problema
                </Button>
              </Link>
            </motion.div>
          )}

          {role === "cidadao" && (
            <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1 mb-6">
              <button
                onClick={() => setAbaCidadao("reportes")}
                className={`flex-1 h-10 rounded-xl text-sm font-inter transition-all ${abaCidadao === "reportes" ? "bg-primary/20 text-white border border-primary/30" : "text-white/45 hover:text-white"}`}
              >
                Meus Reportes
              </button>
              <button
                onClick={() => setAbaCidadao("dados")}
                className={`flex-1 h-10 rounded-xl text-sm font-inter transition-all ${abaCidadao === "dados" ? "bg-primary/20 text-white border border-primary/30" : "text-white/45 hover:text-white"}`}
              >
                Meus Dados
              </button>
            </div>
          )}

          {/* List */}
          {role === "cidadao" && abaCidadao === "dados" ? (
            <CitizenDataPanel user={user} />
          ) : (
          <div>
            <h2 className="font-space text-lg font-600 text-white mb-4">
              {role === "cidadao" ? "Meus Reportes" : "Chamados Recentes"}
            </h2>

            {isLoading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="bg-white/5 rounded-2xl p-4 animate-pulse h-20" />)}
              </div>
            ) : reportes.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
                <MapPin className="w-10 h-10 text-white/20 mx-auto mb-3" />
                <p className="text-white/40 font-inter">Nenhum reporte encontrado.</p>
                {role === "cidadao" && (
                  <Link to="/registrar-problema">
                    <Button className="mt-4 gradient-lumicity text-white border-0 rounded-xl text-sm">
                      Registrar primeiro problema
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {reportes.map((reporte, i) => (
                  <motion.div
                    key={reporte.id}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  >
                    <ReporteCard reporte={reporte} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
          )}
        </div>
      </main>
    </div>
  );
}

function formatDateValue(value) {
  if (!value) return "Não informado";
  try {
    return format(new Date(`${value}T00:00:00`), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return value;
  }
}

function CitizenDataPanel({ user }) {
  const items = [
    { icon: User, label: "Nome completo", value: user?.full_name || user?.name || "Não informado" },
    { icon: CreditCard, label: "CPF", value: user?.cpf || "Não informado" },
    { icon: Calendar, label: "Data de nascimento", value: formatDateValue(user?.birth_date || user?.data_nascimento) },
    { icon: Phone, label: "Telefone", value: user?.phone || user?.telefone || "Não informado" },
    { icon: Mail, label: "E-mail", value: user?.email || "Não informado" },
  ];

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
      <div className="mb-5">
        <h2 className="font-space text-lg font-600 text-white">Meus Dados</h2>
        <p className="text-white/35 text-sm font-inter mt-1">Esses dados acompanham seus chamados e aparecem nos relatórios da plataforma.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {items.map((item) => (
          <div key={item.label} className="bg-white/[0.04] border border-white/8 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <item.icon className="w-4 h-4 text-lumicity-cyan" />
              <p className="text-white/35 text-xs font-inter uppercase tracking-wider">{item.label}</p>
            </div>
            <p className="text-white text-sm font-inter break-words">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReporteCard({ reporte }) {
  const config = statusConfig[reporte.status] || statusConfig["Pendente"];
  const StatusIcon = config.icon;
  const sla = calcDuration(reporte.data_criacao || reporte.created_date, reporte.data_resolucao || null);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-white/20 transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <span className="text-lumicity-cyan text-xs font-inter">{reporte.categoria || "Iluminação Pública"}</span>
          <p className="text-white font-inter text-sm leading-relaxed line-clamp-2 mt-0.5">{reporte.descricao}</p>
          {reporte.endereco && (
            <div className="flex items-center gap-1 mt-1.5">
              <MapPin className="w-3 h-3 text-white/30 flex-shrink-0" />
              <p className="text-white/30 text-xs font-inter truncate">{reporte.endereco}</p>
            </div>
          )}
          <div className="flex items-center gap-3 mt-1">
            <p className="text-white/20 text-xs font-inter">
              {reporte.data_criacao || reporte.created_date
                ? format(new Date(reporte.data_criacao || reporte.created_date), "dd/MM/yy HH:mm", { locale: ptBR })
                : "—"}
            </p>
            {sla !== null && (
              <p className={`text-xs font-inter font-500 ${slaColor(sla)}`}>
                {reporte.status === "Resolvido" ? `Resolvido em ${formatDuration(sla)}` : `${formatDuration(sla)} em aberto`}
              </p>
            )}
          </div>
        </div>
        <Badge className={`${config.color} border text-xs flex-shrink-0 flex items-center gap-1`}>
          <StatusIcon className="w-3 h-3" />
          {reporte.status}
        </Badge>
      </div>
    </div>
  );
}
