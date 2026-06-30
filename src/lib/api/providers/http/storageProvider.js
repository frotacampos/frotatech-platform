import { httpRequest } from "./httpClient";

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(reader.error);
  reader.readAsDataURL(file);
});

export const storageProvider = {
  async uploadImage(file) {
    const dataUrl = await readFileAsDataUrl(file);
    return httpRequest("/storage/images", {
      method: "POST",
      body: {
        filename: file.name || "upload.jpg",
        content_type: file.type || "image/jpeg",
        data_url: dataUrl,
      },
    });
  },
  getFileUrl: (path) => path,
  extractDataFromUploadedFile: (payload) => httpRequest("/storage/extract-data", { method: "POST", body: payload }),
};
