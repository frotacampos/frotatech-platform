import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, Plus, Search, AlertTriangle, ArrowUpDown, Pencil, Trash2,
  X, Loader2, TrendingUp, TrendingDown, RefreshCw, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { materialsApi, stockApi } from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import AppSidebar from "@/components/layout/AppSidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import { useAppAuth } from "@/hooks/useAuth";

const CATEGORIAS = ["Lâmpada", "Luminária", "Cabo", "Poste", "Relé", "Disjuntor", "Caixa de Passagem", "Ferramental", "EPI", "Outros"];
const UNIDADES = ["un", "m", "m²", "kg", "caixa", "rolo", "par"];

const emptyMaterial = {
  nome: "", codigo: "", categoria: "Lâmpada", unidade: "un",
  quantidade_estoque: 0, quantidade_minima: 0,
  preco_unitario: "", fornecedor: "", localizacao: "", descricao: "", ativo: true
};

export default function Almoxarifado() {
  const { user, role, loading } = useAppAuth();
  const qc = useQueryClient();
  const [busca, setBusca] = useState("");
  const [catFiltro, setCatFiltro] = useState("Todas");
  const [modalMaterial, setModalMaterial] = useState(null); // null | {} | material
  const [modalMovimento, setModalMovimento] = useState(null); // material
  const [salvando, setSalvando] = useState(false);
  const [movimento, setMovimento] = useState({ tipo: "Saída", quantidade: 1, motivo: "", observacao: "" });

  const { data: materiais = [], isLoading } = useQuery({
    queryKey: ["materiais"],
    queryFn: () => materialsApi.listMaterials({ orderBy: "nome" }),
    enabled: !loading,
  });

  const filtrados = materiais.filter(m => {
    if (!m.ativo) return false;
    if (catFiltro !== "Todas" && m.categoria !== catFiltro) return false;
    if (busca && !m.nome.toLowerCase().includes(busca.toLowerCase()) &&
        !(m.codigo || "").toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  });

  const semEstoque = materiais.filter(m => m.ativo && m.quantidade_estoque <= m.quantidade_minima).length;

  const handleSalvarMaterial = async () => {
    setSalvando(true);
    const dados = { ...modalMaterial };
    if (dados.preco_unitario === "") delete dados.preco_unitario;
    if (dados.id) {
      await materialsApi.updateMaterial(dados.id, dados);
    } else {
      await materialsApi.createMaterial(dados);
    }
    setSalvando(false);
    setModalMaterial(null);
    qc.invalidateQueries({ queryKey: ["materiais"] });
  };

  const handleExcluir = async (id) => {
    await materialsApi.deleteMaterial(id);
    qc.invalidateQueries({ queryKey: ["materiais"] });
  };

  const handleMovimento = async () => {
    setSalvando(true);
    const mat = modalMovimento;
    const qty = Number(movimento.quantidade);
    const novaQtd = movimento.tipo === "Entrada"
      ? mat.quantidade_estoque + qty
      : movimento.tipo === "Saída"
        ? Math.max(0, mat.quantidade_estoque - qty)
        : qty;

    await materialsApi.updateMaterial(mat.id, { quantidade_estoque: novaQtd });
    await stockApi.createMovement({
      material_id: mat.id,
      material_nome: mat.nome,
      tipo: movimento.tipo,
      quantidade: qty,
      motivo: movimento.motivo,
      observacao: movimento.observacao,
      operador_nome: user?.full_name || "Operador",
    });
    setSalvando(false);
    setModalMovimento(null);
    setMovimento({ tipo: "Saída", quantidade: 1, motivo: "", observacao: "" });
    qc.invalidateQueries({ queryKey: ["materiais"] });
  };

  if (loading) return (
    <div className="min-h-screen bg-lumicity-dark flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-lumicity-dark">
      <AppSidebar user={user} role={role} />
      <MobileHeader user={user} role={role} title="Almoxarifado" />

      <main className="lg:pl-64 pt-20 lg:pt-0 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-space text-2xl sm:text-3xl font-700 text-white">Almoxarifado</h1>
              <p className="text-white/40 font-inter text-sm mt-1">Controle de materiais e estoque</p>
            </div>
            <Button
              onClick={() => setModalMaterial({ ...emptyMaterial })}
              className="gradient-lumicity text-white border-0 rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Material
            </Button>
          </div>

          {/* Alertas */}
          {semEstoque > 0 && (
            <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl mb-6">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              <p className="text-yellow-300 text-sm font-inter">
                <strong>{semEstoque}</strong> material(is) com estoque abaixo do mínimo.
              </p>
            </div>
          )}

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <Input
                placeholder="Buscar material..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                className="bg-white/5 border-white/15 text-white placeholder:text-white/30 pl-9 rounded-xl"
              />
            </div>
            <select
              value={catFiltro}
              onChange={e => setCatFiltro(e.target.value)}
              className="bg-white/5 border border-white/15 text-white rounded-xl h-9 px-3 text-sm font-inter appearance-none focus:outline-none [color-scheme:dark]"
            >
              <option value="Todas">Todas as categorias</option>
              {CATEGORIAS.map(c => <option key={c} value={c} className="bg-gray-900">{c}</option>)}
            </select>
          </div>

          {/* Tabela */}
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 text-left">
                    <th className="px-4 py-3 text-white/40 text-xs font-inter font-500 uppercase">Material</th>
                    <th className="px-4 py-3 text-white/40 text-xs font-inter font-500 uppercase hidden sm:table-cell">Categoria</th>
                    <th className="px-4 py-3 text-white/40 text-xs font-inter font-500 uppercase text-center">Estoque</th>
                    <th className="px-4 py-3 text-white/40 text-xs font-inter font-500 uppercase hidden md:table-cell">Local</th>
                    <th className="px-4 py-3 text-white/40 text-xs font-inter font-500 uppercase text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {isLoading ? (
                    <tr><td colSpan={5} className="py-12 text-center">
                      <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
                    </td></tr>
                  ) : filtrados.length === 0 ? (
                    <tr><td colSpan={5} className="py-12 text-center text-white/30 text-sm font-inter">
                      Nenhum material encontrado.
                    </td></tr>
                  ) : filtrados.map(m => {
                    const baixo = m.quantidade_estoque <= m.quantidade_minima;
                    return (
                      <motion.tr
                        key={m.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-white/3 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <p className="text-white text-sm font-inter font-500">{m.nome}</p>
                          {m.codigo && <p className="text-white/30 text-xs">{m.codigo}</p>}
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className="text-white/50 text-xs font-inter bg-white/8 px-2 py-1 rounded-full">{m.categoria}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-sm font-space font-700 ${baixo ? "text-red-400" : "text-green-400"}`}>
                            {m.quantidade_estoque} <span className="text-xs font-400 text-white/40">{m.unidade}</span>
                          </span>
                          {baixo && <p className="text-red-400/60 text-xs">mín. {m.quantidade_minima}</p>}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell text-white/40 text-xs">{m.localizacao || "—"}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 justify-end">
                            <button
                              onClick={() => setModalMovimento(m)}
                              className="w-8 h-8 rounded-lg bg-lumicity-cyan/10 border border-lumicity-cyan/20 flex items-center justify-center text-lumicity-cyan hover:bg-lumicity-cyan/20 transition-all"
                              title="Movimentar estoque"
                            >
                              <ArrowUpDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setModalMaterial({ ...m })}
                              className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 hover:bg-blue-500/20 transition-all"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleExcluir(m.id)}
                              className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Material */}
      <AnimatePresence>
        {modalMaterial && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto"
          >
            <div className="min-h-full flex items-center justify-center px-4 py-6" onClick={() => setModalMaterial(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#0d1525] border border-white/15 rounded-2xl p-6 w-full max-w-lg"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-space font-700 text-white">{modalMaterial.id ? "Editar Material" : "Novo Material"}</h3>
                <button onClick={() => setModalMaterial(null)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-white text-xs font-500">Nome *</Label>
                  <Input value={modalMaterial.nome} onChange={e => setModalMaterial(p => ({ ...p, nome: e.target.value }))}
                    className="bg-[#1a2235] border-white/15 text-white placeholder:text-white/50 rounded-xl" placeholder="Nome do material" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white text-xs font-500">Código</Label>
                  <Input value={modalMaterial.codigo} onChange={e => setModalMaterial(p => ({ ...p, codigo: e.target.value }))}
                    className="bg-[#1a2235] border-white/15 text-white placeholder:text-white/50 rounded-xl" placeholder="Ex: LAMP-01" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white text-xs font-500">Categoria *</Label>
                  <select value={modalMaterial.categoria} onChange={e => setModalMaterial(p => ({ ...p, categoria: e.target.value }))}
                    className="w-full bg-white/8 border border-white/15 text-white rounded-xl h-9 px-3 text-sm [color-scheme:dark] focus:outline-none">
                    {CATEGORIAS.map(c => <option key={c} value={c} className="bg-gray-900 text-white">{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white text-xs font-500">Unidade</Label>
                  <select value={modalMaterial.unidade} onChange={e => setModalMaterial(p => ({ ...p, unidade: e.target.value }))}
                    className="w-full bg-white/8 border border-white/15 text-white rounded-xl h-9 px-3 text-sm [color-scheme:dark] focus:outline-none">
                    {UNIDADES.map(u => <option key={u} value={u} className="bg-gray-900 text-white">{u}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white text-xs font-500">Preço unitário (R$)</Label>
                  <Input type="number" value={modalMaterial.preco_unitario} onChange={e => setModalMaterial(p => ({ ...p, preco_unitario: e.target.value }))}
                    className="bg-[#1a2235] border-white/15 text-white placeholder:text-white/50 rounded-xl" placeholder="0,00" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white text-xs font-500">Estoque atual</Label>
                  <Input type="number" value={modalMaterial.quantidade_estoque} onChange={e => setModalMaterial(p => ({ ...p, quantidade_estoque: Number(e.target.value) }))}
                    className="bg-[#1a2235] border-white/15 text-white placeholder:text-white/50 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white text-xs font-500">Estoque mínimo</Label>
                  <Input type="number" value={modalMaterial.quantidade_minima} onChange={e => setModalMaterial(p => ({ ...p, quantidade_minima: Number(e.target.value) }))}
                    className="bg-[#1a2235] border-white/15 text-white placeholder:text-white/50 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white text-xs font-500">Fornecedor</Label>
                  <Input value={modalMaterial.fornecedor} onChange={e => setModalMaterial(p => ({ ...p, fornecedor: e.target.value }))}
                    className="bg-[#1a2235] border-white/15 text-white placeholder:text-white/50 rounded-xl" placeholder="Nome do fornecedor" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-white text-xs font-500">Localização no almoxarifado</Label>
                  <Input value={modalMaterial.localizacao} onChange={e => setModalMaterial(p => ({ ...p, localizacao: e.target.value }))}
                    className="bg-[#1a2235] border-white/15 text-white placeholder:text-white/50 rounded-xl" placeholder="Ex: Prateleira A2" />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button onClick={() => setModalMaterial(null)} variant="outline"
                  className="flex-1 border-white/20 text-white/60 hover:text-white hover:bg-white/10 rounded-xl">
                  Cancelar
                </Button>
                <Button onClick={handleSalvarMaterial} disabled={salvando || !modalMaterial.nome}
                  className="flex-1 gradient-lumicity text-white border-0 rounded-xl">
                  {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}
                </Button>
              </div>
            </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Movimentação */}
      <AnimatePresence>
        {modalMovimento && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4"
            onClick={() => setModalMovimento(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#0d1525] border border-white/15 rounded-2xl p-6 w-full max-w-sm"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-space font-700 text-white">Movimentar Estoque</h3>
                <button onClick={() => setModalMovimento(null)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              <div className="bg-white/5 rounded-xl p-3 mb-4">
                <p className="text-white font-inter font-500 text-sm">{modalMovimento.nome}</p>
                <p className="text-white/40 text-xs">Estoque atual: <span className="text-white">{modalMovimento.quantidade_estoque} {modalMovimento.unidade}</span></p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-white text-xs font-500">Tipo</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Entrada", "Saída", "Ajuste"].map(t => (
                      <button key={t} onClick={() => setMovimento(p => ({ ...p, tipo: t }))}
                        className={`h-9 rounded-xl text-xs font-inter border transition-all ${movimento.tipo === t ? "gradient-lumicity text-white border-transparent" : "border-white/20 text-white/50 hover:text-white hover:bg-white/8"}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white text-xs font-500">Quantidade</Label>
                  <Input type="number" min="1" value={movimento.quantidade} onChange={e => setMovimento(p => ({ ...p, quantidade: e.target.value }))}
                    className="bg-[#1a2235] border-white/15 text-white placeholder:text-white/50 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white text-xs font-500">Motivo</Label>
                  <Input value={movimento.motivo} onChange={e => setMovimento(p => ({ ...p, motivo: e.target.value }))}
                    className="bg-[#1a2235] border-white/15 text-white placeholder:text-white/50 rounded-xl" placeholder="Ex: Manutenção chamado #123" />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button onClick={() => setModalMovimento(null)} variant="outline"
                  className="flex-1 border-white/20 text-white/60 hover:text-white hover:bg-white/10 rounded-xl">
                  Cancelar
                </Button>
                <Button onClick={handleMovimento} disabled={salvando || !movimento.quantidade}
                  className="flex-1 gradient-lumicity text-white border-0 rounded-xl">
                  {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmar"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
