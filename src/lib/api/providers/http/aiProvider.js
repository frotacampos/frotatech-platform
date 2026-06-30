import { httpRequest } from "./httpClient";

export const aiProvider = {
  suggestDescription: (payload) => httpRequest("/ai/suggest-description", { method: "POST", body: payload }),
  classifyPriority: (payload) => httpRequest("/ai/classify-priority", { method: "POST", body: payload }),
  generateTrendReport: (payload = {}) => httpRequest("/ai/trend-report", { method: "POST", body: payload }),
  chatbotMessage: (payload) => httpRequest("/ai/chatbot", { method: "POST", body: payload }),
};
