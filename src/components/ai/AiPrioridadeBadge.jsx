import React, { useState } from "react";
import { Sparkles, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { aiApi } from "@/lib/api";

const prioridadeConfig = {
  alta: { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30" },
  media: { bg: "bg-yellow-500/15", text: "text-yellow-400", border: "border-yellow-500/30" },
  baixa: { bg: "bg-green-500/15", text: "text-green-400", border: "border-green-500/30" },
};

export default function AiPrioridadeBadge({ descricao, endereco }) {
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);

  const handleAnalisar = async () => {
    if (!descricao?.trim()) return;
    setLoading(true);
    const data = await aiApi.classifyPriority({ descricao, endereco });
    if (data?.prioridade) setResultado(data);
    setLoading(false);
  };

  if (resultado) {
    const c = prioridadeConfig[resultado.prioridade] || prioridadeConfig.media;
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-inter ${c.bg} ${c.text} ${c.border}`}>
        {resultado.urgente && <Zap className="w-3 h-3" />}
        <span className="font-500 capitalize">Prioridade {resultado.prioridade}</span>
        <span className="text-white/40">·</span>
        <span className="text-white/50">{resultado.motivo}</span>
      </div>
    );
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={handleAnalisar}
      disabled={loading || !descricao || descricao.length < 10}
      className="border-lumicity-gold/40 text-lumicity-gold hover:bg-lumicity-gold/10 rounded-lg text-xs gap-1.5"
    >
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
      {loading ? "Analisando..." : "Sugerir prioridade"}
    </Button>
  );
}
