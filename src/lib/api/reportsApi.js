import { getProvider } from "./providers/providerFactory";

const provider = getProvider("reports");

export const reportsApi = {
  listReports: (...args) => provider.listReports(...args),
  getReport: (...args) => provider.getReport(...args),
  createReport: (...args) => provider.createReport(...args),
  updateReport: (...args) => provider.updateReport(...args),
  deleteReport: (...args) => provider.deleteReport(...args),
  assignReport: (...args) => provider.assignReport(...args),
  changeStatus: (...args) => provider.changeStatus(...args),
  subscribeReports: (...args) => provider.subscribeReports(...args),
};
