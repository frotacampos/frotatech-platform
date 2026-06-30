import { base44 } from "@/api/base44Client";

export const stockProvider = {
  async listMovements(options = {}) {
    const orderBy = options.orderBy || "-created_date";
    if (options.filters && Object.keys(options.filters).length > 0) {
      return base44.entities.MovimentacaoEstoque.filter(options.filters, orderBy, options.limit);
    }
    return base44.entities.MovimentacaoEstoque.list(orderBy, options.limit);
  },
  createMovement: (data) => base44.entities.MovimentacaoEstoque.create(data),
  getMovementsByMaterial: (materialId) => base44.entities.MovimentacaoEstoque.filter({ material_id: materialId }, "-created_date"),
};
