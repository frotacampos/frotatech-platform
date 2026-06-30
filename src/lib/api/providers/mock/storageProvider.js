export const storageProvider = {
  async uploadImage(file) {
    return { file_url: file ? URL.createObjectURL(file) : "" };
  },
  getFileUrl(path) {
    return path;
  },
  async extractDataFromUploadedFile() {
    return { status: "success", output: {} };
  },
};
