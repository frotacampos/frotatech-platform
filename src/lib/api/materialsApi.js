import { getProvider } from "./providers/providerFactory";

const provider = getProvider("materials");

export const materialsApi = {
  listMaterials: (...args) => provider.listMaterials(...args),
  getMaterial: (...args) => provider.getMaterial(...args),
  createMaterial: (...args) => provider.createMaterial(...args),
  updateMaterial: (...args) => provider.updateMaterial(...args),
  deleteMaterial: (...args) => provider.deleteMaterial(...args),
};
