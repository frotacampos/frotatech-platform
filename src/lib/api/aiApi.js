import { getProvider } from "./providers/providerFactory";

const provider = getProvider("ai");

export const aiApi = {
  suggestDescription: (...args) => provider.suggestDescription(...args),
  classifyPriority: (...args) => provider.classifyPriority(...args),
  generateTrendReport: (...args) => provider.generateTrendReport(...args),
  chatbotMessage: (...args) => provider.chatbotMessage(...args),
};
