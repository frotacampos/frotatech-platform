import { base44 } from "@/api/base44Client";

export const aiProvider = {
  async suggestDescription(payload) {
    const result = await base44.functions.invoke("aiSugerirDescricao", payload);
    return result.data;
  },
  async classifyPriority(payload) {
    const result = await base44.functions.invoke("aiSugerirPrioridade", payload);
    return result.data;
  },
  async generateTrendReport(payload = {}) {
    const result = await base44.functions.invoke("aiRelatorioTendencias", payload);
    return result.data;
  },
  async chatbotMessage(payload) {
    const result = await base44.functions.invoke("aiChatbot", payload);
    return result.data;
  },
};
