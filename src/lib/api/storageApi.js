import { getProvider } from "./providers/providerFactory";

const provider = getProvider("storage");

export const storageApi = {
  uploadImage: (...args) => provider.uploadImage(...args),
  getFileUrl: (...args) => provider.getFileUrl(...args),
  extractDataFromUploadedFile: (...args) => provider.extractDataFromUploadedFile(...args),
};
