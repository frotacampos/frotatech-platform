import React, { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { aiApi } from "@/lib/api";

export default function AiDescricaoHelper({ descricao, onSugestao }) {
  const [loading, setLoading] = useState(false);

  const handleSugerir = async () => {
    if (!descricao?.trim() || descricao.length < 10) return;
    setLoading(true);
    const data = await aiApi.suggestDescription({ descricao_raw: descricao });
    if (data?.descricao_sugerida) {
      onSugestao(data.descricao_sugerida);
    }
    setLoading(false);
  };

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={handleSugerir}
      disabled={loading || !descricao || descricao.length < 10}
      className="border-lumicity-cyan/40 text-lumicity-cyan hover:bg-lumicity-cyan/10 rounded-lg text-xs gap-1.5"
    >
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
      {loading ? "Melhorando..." : "Melhorar com IA"}
    </Button>
  );
}
