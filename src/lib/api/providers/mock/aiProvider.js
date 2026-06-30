export const aiProvider = {
  async suggestDescription(payload) {
    return { descricao_sugerida: `Descricao revisada: ${payload.descricao_raw}` };
  },
  async classifyPriority() {
    return { prioridade: "media", motivo: "Classificacao mock para demonstracao local.", urgente: false };
  },
  async generateTrendReport() {
    return {
      resumo_executivo: "Relatorio mock gerado para demonstracao offline do LumiCity.",
      total_chamados: 3,
      taxa_resolucao: "33%",
      tempo_medio_resolucao: "2 dias",
      areas_criticas: [{ area: "Centro", quantidade: 2, descricao: "Maior concentracao de chamados mock." }],
      tendencias: ["Volume estavel de chamados no periodo mock."],
      planos_acao: [{ titulo: "Ronda preventiva", prioridade: "media", descricao: "Validar pontos recorrentes no Centro.", impacto: "Reducao de reincidencias." }],
      pontos_positivos: ["Modo mock ativo para desenvolvimento offline."],
      alertas: [],
      gerado_em: new Date().toISOString(),
      total_processado: 3,
    };
  },
  async chatbotMessage(payload) {
    return { resposta: `Modo mock: recebi sua mensagem "${payload.mensagem}".` };
  },
};
