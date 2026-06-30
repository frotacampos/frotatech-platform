import { base44 } from "@/api/base44Client";

export const materialsProvider = {
  listMaterials: (options = {}) => base44.entities.Material.list(options.orderBy || "nome", options.limit),
  async getMaterial(id) {
    const items = await base44.entities.Material.filter({ id });
    return items?.[0] || null;
  },
  createMaterial: (data) => base44.entities.Material.create(data),
  updateMaterial: (id, data) => base44.entities.Material.update(id, data),
  deleteMaterial: (id) => base44.entities.Material.update(id, { ativo: false }),
};
