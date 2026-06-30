import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Clock, CheckCircle, Wrench, XCircle, MapPin, Calendar, Plus } from "lucide-react";
import { reportsApi } from "@/lib/api";
import { getCidadaoSession } from "@/lib/cidadaoSession";

const statusConfig = {
  "Pendente":     { icon: Clock,       color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30", label: "Pendente" },
  "Em Andamento": { icon: Wrench,      color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/30",    label: "Em Andamento" },
  "Resolvido":    { icon: CheckCircle, color: "text-green-400",  bg: "bg-green-500/10 border-green-500/30",  label: "Resolvido" },
  "Cancelado":    { icon: XCircle,     color: "text-red-400",    bg: "bg-red-500/10 border-red-500/30",      label: "Cancelado" },
};

function StatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig["Pendente"];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-inter font-medium flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

export default function MeusChamados() {
  const [cidadao, setCidadao] = useState(null);
  const [chamados, setChamados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessao = getCidadaoSession();
    if (!sessao) {
      setLoading(false);
      return;
    }
    setCidadao(sessao);

    // Carga inicial
    reportsApi.listReports({ filters: { cpf_cidadao: sessao.cpf } })
      .then((data) => {
        const sorted = [...data].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        setChamados(sorted);
      })
      .finally(() => setLoading(false));

    // Atualização em tempo real
    const unsubscribe = reportsApi.subscribeReports((event) => {
      if (event.type === "update" && event.data?.cpf_cidadao === sessao.cpf) {
        setChamados((prev) =>
          prev.map((c) => (c.id === event.id ? { ...c, ...event.data } : c))
        );
      }
      if (event.type === "create" && event.data?.cpf_cidadao === sessao.cpf) {
        setChamados((prev) => [event.data, ...prev]);
      }
      if (event.type === "delete") {
        setChamados((prev) => prev.filter((c) => c.id !== event.id));
      }
    });

    return () => unsubscribe();
  }, []);

  if (!cidadao && !loading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-white/50 font-inter mb-4">Você precisa estar logado para ver seus chamados.</p>
          <Link to="/cidadao-login">
            <button className="gradient-lumicity text-white font-inter font-medium px-6 py-3 rounded-xl">
              Fazer Login
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero">
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-lumicity-blue/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header — sem links para dashboard/mapa/chamados */}
      <header className="relative z-10 px-4 sm:px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-lumicity flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-space font-bold text-white text-lg">LumiCity</span>
        </div>
        <Link to="/registrar-problema">
          <button className="flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 hover:text-white hover:bg-white/15 transition-all rounded-xl px-4 py-2 text-sm font-inter">
            <Plus className="w-4 h-4" />
            Novo Chamado
          </button>
        </Link>
      </header>

      {/* Conteúdo */}
      <div className="relative z-10 max-w-lg mx-auto px-4 sm:px-6 pb-12 pt-2">

        {/* Perfil do cidadão */}
        {cidadao && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl">
            <div className="w-10 h-10 rounded-full gradient-lumicity flex items-center justify-center flex-shrink-0">
              <span className="text-white font-space font-bold text-sm">{cidadao.nome.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-inter font-medium text-sm truncate">{cidadao.nome}</p>
              <p className="text-white/40 text-xs font-inter">Meus chamados</p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-xs font-inter">Ao vivo</span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : chamados.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-white/20" />
            </div>
            <p className="text-white/40 font-inter text-sm mb-4">Você ainda não registrou nenhum chamado.</p>
            <Link to="/registrar-problema">
              <button className="gradient-lumicity text-white font-inter text-sm px-5 py-2.5 rounded-xl">
                Registrar Problema
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {chamados.map((chamado, i) => (
                <motion.div
                  key={chamado.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-5"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <p className="text-white font-inter text-sm font-medium leading-snug flex-1">{chamado.descricao}</p>
                    <StatusBadge status={chamado.status} />
                  </div>

                  <div className="space-y-1.5">
                    {chamado.endereco && (
                      <div className="flex items-center gap-2 text-white/40 text-xs font-inter">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{chamado.endereco}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-white/30 text-xs font-inter">
                      <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>
                        {new Date(chamado.created_date).toLocaleDateString("pt-BR", {
                          day: "2-digit", month: "2-digit", year: "numeric",
                          hour: "2-digit", minute: "2-digit"
                        })}
                      </span>
                    </div>
                  </div>

                  {chamado.observacoes && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <p className="text-white/50 text-xs font-inter italic">"{chamado.observacoes}"</p>
                      {chamado.operador_nome && (
                        <p className="text-white/25 text-xs font-inter mt-1">— {chamado.operador_nome}</p>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
