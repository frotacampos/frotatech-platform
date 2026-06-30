import { base44 } from "@/api/base44Client";

export const storageProvider = {
  uploadImage: (file) => base44.integrations.Core.UploadFile({ file }),
  getFileUrl: (path) => path,
  extractDataFromUploadedFile: (payload) => base44.integrations.Core.ExtractDataFromUploadedFile(payload),
};
