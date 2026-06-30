import { getProvider } from "./providers/providerFactory";

const provider = getProvider("stock");

export const stockApi = {
  listMovements: (...args) => provider.listMovements(...args),
  createMovement: (...args) => provider.createMovement(...args),
  getMovementsByMaterial: (...args) => provider.getMovementsByMaterial(...args),
};
