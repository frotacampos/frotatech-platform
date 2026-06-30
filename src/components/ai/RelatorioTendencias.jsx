import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles, Loader2, TrendingUp, AlertTriangle, CheckCircle,
  MapPin, Lightbulb, RefreshCw, ChevronDown, ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { aiApi } from "@/lib/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const prioridadeConfig = {
  alta: { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30", label: "Alta" },
  media: { bg: "bg-yellow-500/15", text: "text-yellow-400", border: "border-yellow-500/30", label: "Média" },
  baixa: { bg: "bg-green-500/15", text: "text-green-400", border: "border-green-500/30", label: "Baixa" },
};

export default function RelatorioTendencias() {
  const [loading, setLoading] = useState(false);
  const [relatorio, setRelatorio] = useState(null);
  const [expandido, setExpandido] = useState(true);

  const handleGerar = async () => {
    setLoading(true);
    setRelatorio(null);
    const data = await aiApi.generateTrendReport({});
    if (data) setRelatorio(data);
    setLoading(false);
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl gradient-lumicity flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-space font-600 text-white text-sm">Relatório IA de Tendências</h3>
            <p className="text-white/30 text-xs font-inter">Análise inteligente dos chamados com planos de ação</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {relatorio && (
            <button onClick={() => setExpandido(!expandido)} className="text-white/40 hover:text-white transition-colors">
              {expandido ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
          <Button
            onClick={handleGerar}
            disabled={loading}
            size="sm"
            className="gradient-lumicity text-white border-0 rounded-xl text-xs gap-1.5"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            {loading ? "Analisando..." : relatorio ? "Atualizar" : "Gerar Relatório"}
          </Button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="px-5 py-10 text-center">
          <Loader2 className="w-8 h-8 text-lumicity-cyan animate-spin mx-auto mb-3" />
          <p className="text-white/50 font-inter text-sm">Analisando {" "}chamados com IA...</p>
          <p className="text-white/25 font-inter text-xs mt-1">Isso pode levar alguns segundos</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !relatorio && (
        <div className="px-5 py-10 text-center">
          <TrendingUp className="w-10 h-10 text-white/15 mx-auto mb-3" />
          <p className="text-white/30 font-inter text-sm">Clique em "Gerar Relatório" para obter uma análise completa com IA</p>
        </div>
      )}

      {/* Report Content */}
      {!loading && relatorio && expandido && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-5 py-5 space-y-6"
        >
          {/* Meta info */}
          {relatorio.gerado_em && (
            <p className="text-white/20 text-xs font-inter">
              Gerado em {format(new Date(relatorio.gerado_em), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} · {relatorio.total_processado} chamados processados
            </p>
          )}

          {/* Resumo executivo */}
          {relatorio.resumo_executivo && (
            <div className="bg-primary/10 border border-primary/25 rounded-xl p-4">
              <p className="text-white/40 text-xs font-inter uppercase tracking-wider mb-2">Resumo Executivo</p>
              <p className="text-white/80 font-inter text-sm leading-relaxed">{relatorio.resumo_executivo}</p>
            </div>
          )}

          {/* KPIs */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-white font-space text-lg font-700">{relatorio.total_chamados || "—"}</p>
              <p className="text-white/30 text-xs font-inter">Total</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-green-400 font-space text-lg font-700">{relatorio.taxa_resolucao || "—"}</p>
              <p className="text-white/30 text-xs font-inter">Resolvidos</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-lumicity-cyan font-space text-lg font-700 truncate text-sm">{relatorio.tempo_medio_resolucao || "—"}</p>
              <p className="text-white/30 text-xs font-inter">Tempo Médio</p>
            </div>
          </div>

          {/* Alertas */}
          {relatorio.alertas?.length > 0 && (
            <div>
              <p className="text-white/30 text-xs font-inter uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> Alertas
              </p>
              <div className="space-y-2">
                {relatorio.alertas.map((a, i) => (
                  <div key={i} className="flex items-start gap-2 bg-red-500/8 border border-red-500/20 rounded-xl p-3">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-red-300 text-xs font-inter leading-relaxed">{a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Áreas críticas */}
          {relatorio.areas_criticas?.length > 0 && (
            <div>
              <p className="text-white/30 text-xs font-inter uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-lumicity-cyan" /> Áreas Críticas
              </p>
              <div className="space-y-2">
                {relatorio.areas_criticas.map((a, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 bg-white/5 rounded-xl p-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-white/70 text-xs font-inter font-500">{a.area}</p>
                      <p className="text-white/30 text-xs font-inter mt-0.5">{a.descricao}</p>
                    </div>
                    <span className="text-lumicity-cyan text-xs font-space font-700 flex-shrink-0">{a.quantidade} chamados</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tendências */}
          {relatorio.tendencias?.length > 0 && (
            <div>
              <p className="text-white/30 text-xs font-inter uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-lumicity-gold" /> Tendências Identificadas
              </p>
              <div className="space-y-1.5">
                {relatorio.tendencias.map((t, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-lumicity-gold flex-shrink-0 mt-1.5" />
                    <p className="text-white/60 text-xs font-inter leading-relaxed">{t}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Planos de ação */}
          {relatorio.planos_acao?.length > 0 && (
            <div>
              <p className="text-white/30 text-xs font-inter uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-primary" /> Planos de Ação Sugeridos
              </p>
              <div className="space-y-3">
                {relatorio.planos_acao.map((p, i) => {
                  const c = prioridadeConfig[p.prioridade] || prioridadeConfig.media;
                  return (
                    <div key={i} className={`border rounded-xl p-4 ${c.bg} ${c.border}`}>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <p className={`font-space font-600 text-sm ${c.text}`}>{p.titulo}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-inter ${c.bg} ${c.text} ${c.border}`}>
                          {c.label}
                        </span>
                      </div>
                      <p className="text-white/60 text-xs font-inter leading-relaxed">{p.descricao}</p>
                      {p.impacto && (
                        <p className="text-white/40 text-xs font-inter mt-2 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Impacto: {p.impacto}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pontos positivos */}
          {relatorio.pontos_positivos?.length > 0 && (
            <div>
              <p className="text-white/30 text-xs font-inter uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-green-400" /> Pontos Positivos
              </p>
              <div className="space-y-1.5">
                {relatorio.pontos_positivos.map((p, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-white/60 text-xs font-inter leading-relaxed">{p}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
