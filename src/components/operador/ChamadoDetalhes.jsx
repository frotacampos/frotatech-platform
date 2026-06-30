import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, MessageSquare, ChevronRight, Loader2, Upload, FileText, RotateCcw, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { reportsApi, storageApi } from "@/lib/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import StatusBadge from "./StatusBadge";

const FLUXO = ["Pendente", "Em Andamento", "Resolvido"];

export default function ChamadoDetalhes({ reporte, operador, onClose, onUpdated }) {
  const [obs, setObs] = useState("");
  const [obsResolucao, setObsResolucao] = useState("");
  const [fotoResolucao, setFotoResolucao] = useState(null);
  const [fotoResolucaoUrl, setFotoResolucaoUrl] = useState("");
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [saving, setSaving] = useState(false);

  // Editar
  const [showEdit, setShowEdit] = useState(false);
  const [editDescricao, setEditDescricao] = useState(reporte.descricao || "");
  const [editEndereco, setEditEndereco] = useState(reporte.endereco || "");

  // Excluir
  const [showDelete, setShowDelete] = useState(false);

  const proximoStatus = () => {
    const idx = FLUXO.indexOf(reporte.status);
    return idx < FLUXO.length - 1 ? FLUXO[idx + 1] : null;
  };

  const handleFotoResolucao = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFotoResolucao(file);
    setUploadingFoto(true);
    const { file_url } = await storageApi.uploadImage(file);
    setFotoResolucaoUrl(file_url);
    setUploadingFoto(false);
  };

  const handleAvancarStatus = async () => {
    const novoStatus = proximoStatus();
    if (!novoStatus) return;
    setSaving(true);

    const textoObs = novoStatus === "Resolvido" ? obsResolucao.trim() : obs.trim();

    const novaEntrada = {
      data: new Date().toISOString(),
      usuario_nome: operador?.full_name || "Operador",
      acao: `Status alterado para "${novoStatus}"`,
      texto: textoObs || "",
    };

    const historico = [...(reporte.historico || []), novaEntrada];

    const update = {
      status: novoStatus,
      historico,
      operador_id: reporte.operador_id || operador?.id || "",
      operador_nome: reporte.operador_nome || operador?.full_name || "",
    };

    if (novoStatus === "Em Andamento") {
      update.data_inicio_atendimento = new Date().toISOString();
      if (!reporte.operador_id) {
        update.operador_id = operador?.id || "";
        update.operador_nome = operador?.full_name || "";
      }
    }

    if (novoStatus === "Resolvido") {
      update.data_resolucao = new Date().toISOString();
      if (fotoResolucaoUrl) update.foto_resolucao_url = fotoResolucaoUrl;
    }

    if (textoObs) update.observacoes = textoObs;

    try {
      await reportsApi.updateReport(reporte.id, update);
      setObs("");
      setObsResolucao("");
      onUpdated();
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      alert("Sem permissão para realizar esta ação.");
    } finally {
      setSaving(false);
    }
  };

  const handleAssumirChamado = async () => {
    setSaving(true);
    const novaEntrada = {
      data: new Date().toISOString(),
      usuario_nome: operador?.full_name || "Operador",
      acao: "Chamado assumido",
      texto: "",
    };
    try {
      await reportsApi.assignReport(reporte.id, operador?.id || "", {
        operador_id: operador?.id || "",
        operador_nome: operador?.full_name || "",
        historico: [...(reporte.historico || []), novaEntrada],
      });
      onUpdated();
    } catch (err) {
      console.error("Erro ao assumir chamado:", err);
      alert("Sem permissão para realizar esta ação.");
    } finally {
      setSaving(false);
    }
  };

  const handleReabrir = async () => {
    setSaving(true);
    const novaEntrada = {
      data: new Date().toISOString(),
      usuario_nome: operador?.full_name || "Operador",
      acao: 'Status alterado para "Pendente"',
      texto: "Chamado reaberto",
    };
    try {
      await reportsApi.changeStatus(reporte.id, "Pendente", {
        status: "Pendente",
        data_resolucao: null,
        historico: [...(reporte.historico || []), novaEntrada],
      });
      onUpdated();
    } catch (err) {
      alert("Sem permissão para realizar esta ação.");
    } finally {
      setSaving(false);
    }
  };

  const handleSalvarEdicao = async () => {
    setSaving(true);
    try {
      await reportsApi.updateReport(reporte.id, {
        descricao: editDescricao.trim(),
        endereco: editEndereco.trim(),
      });
      setShowEdit(false);
      onUpdated();
    } catch (err) {
      alert("Sem permissão para realizar esta ação.");
    } finally {
      setSaving(false);
    }
  };

  const handleExcluir = async () => {
    setSaving(true);
    try {
      await reportsApi.deleteReport(reporte.id);
      onClose();
      onUpdated();
    } catch (err) {
      alert("Sem permissão para realizar esta ação.");
    } finally {
      setSaving(false);
    }
  };

  const handleAdicionarObs = async () => {
    if (!obs.trim()) return;
    setSaving(true);
    const novaEntrada = {
      data: new Date().toISOString(),
      usuario_nome: operador?.full_name || "Operador",
      acao: "Observação adicionada",
      texto: obs.trim(),
    };
    try {
      await reportsApi.updateReport(reporte.id, {
        observacoes: obs.trim(),
        historico: [...(reporte.historico || []), novaEntrada],
      });
      setObs("");
      onUpdated();
    } catch (err) {
      console.error("Erro ao adicionar observação:", err);
      alert("Sem permissão para realizar esta ação.");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return "—";
    return format(new Date(d), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const proximo = proximoStatus();

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="relative ml-auto w-full max-w-xl bg-lumicity-dark border-l border-white/10 flex flex-col h-full overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 flex-shrink-0">
          <div>
            <p className="text-white/40 text-xs font-inter mb-1">Chamado #{reporte.id?.slice(-6).toUpperCase()}</p>
            <StatusBadge status={reporte.status} size="lg" />
          </div>
          <div className="flex items-center gap-2">
            {/* Reabrir */}
            {(reporte.status === "Resolvido" || reporte.status === "Cancelado") && (
              <button
                onClick={handleReabrir}
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20 transition-all text-xs font-inter"
                title="Reabrir chamado"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Reabrir</span>
              </button>
            )}
            {/* Editar */}
            <button
              onClick={() => { setEditDescricao(reporte.descricao || ""); setEditEndereco(reporte.endereco || ""); setShowEdit(true); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all text-xs font-inter"
              title="Editar chamado"
            >
              <Pencil className="w-4 h-4" />
              <span className="hidden sm:inline">Editar</span>
            </button>
            {/* Excluir */}
            <button
              onClick={() => setShowDelete(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all text-xs font-inter"
              title="Excluir chamado"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Excluir</span>
            </button>
            {/* OS */}
            <button
              onClick={() => {
                const win = window.open("", "_blank");
                win.document.write(`
                  <html><head><title>Ordem de Serviço - #${reporte.id?.slice(-6).toUpperCase()}</title>
                  <style>body{font-family:Arial,sans-serif;padding:40px;color:#111;max-width:700px;margin:auto}
                  h1{font-size:22px;margin-bottom:4px}h2{font-size:15px;color:#555;margin:20px 0 6px}
                  .badge{display:inline-block;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:bold;background:#e8f4ff;color:#0056a3}
                  .row{display:flex;justify-content:space-between;border-bottom:1px solid #eee;padding:6px 0;font-size:13px}
                  .label{color:#777}.value{color:#111;font-weight:500}
                  .box{background:#f9f9f9;border:1px solid #ddd;border-radius:8px;padding:14px;margin-top:6px;font-size:13px}
                  .footer{margin-top:40px;border-top:2px solid #333;padding-top:16px;display:flex;justify-content:space-between}
                  .sig{text-align:center;flex:1}.sig-line{border-top:1px solid #999;margin:30px 10px 4px;font-size:12px;color:#555}
                  @media print{button{display:none}}</style></head>
                  <body>
                  <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid #0056a3;padding-bottom:16px;margin-bottom:20px">
                    <div><h1>⚡ LumiCity</h1><p style="color:#555;font-size:13px;margin:0">Gestão de Iluminação Pública</p></div>
                    <div style="text-align:right"><strong style="font-size:18px">ORDEM DE SERVIÇO</strong><br/><span style="color:#777;font-size:12px">#${reporte.id?.slice(-6).toUpperCase()}</span></div>
                  </div>
                  <div class="badge">${reporte.status}</div>
                  <h2>Dados do Chamado</h2>
                  <div class="row"><span class="label">Categoria</span><span class="value">${reporte.categoria || "Iluminação Pública"}</span></div>
                  <div class="row"><span class="label">Registrado por</span><span class="value">${reporte.usuario_nome || reporte.nome_cidadao || "—"}</span></div>
                  <div class="row"><span class="label">Localização</span><span class="value">${reporte.endereco || "Não informado"}</span></div>
                  <div class="row"><span class="label">Data de abertura</span><span class="value">${reporte.data_criacao ? new Date(reporte.data_criacao).toLocaleString("pt-BR") : "—"}</span></div>
                  <div class="row"><span class="label">Responsável</span><span class="value">${reporte.operador_nome || "A definir"}</span></div>
                  ${reporte.data_inicio_atendimento ? `<div class="row"><span class="label">Início do atendimento</span><span class="value">${new Date(reporte.data_inicio_atendimento).toLocaleString("pt-BR")}</span></div>` : ""}
                  ${reporte.data_resolucao ? `<div class="row"><span class="label">Resolvido em</span><span class="value">${new Date(reporte.data_resolucao).toLocaleString("pt-BR")}</span></div>` : ""}
                  <h2>Descrição do Problema</h2>
                  <div class="box">${reporte.descricao}</div>
                  ${reporte.observacoes ? `<h2>Observações</h2><div class="box">${reporte.observacoes}</div>` : ""}
                  <div class="footer">
                    <div class="sig"><div class="sig-line">Responsável Técnico</div></div>
                    <div class="sig"><div class="sig-line">Operador / Supervisor</div></div>
                  </div>
                  <button onclick="window.print()" style="margin-top:24px;padding:10px 24px;background:#0056a3;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:14px">🖨️ Imprimir</button>
                  </body></html>
                `);
                win.document.close();
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/8 border border-white/15 text-white/60 hover:text-white hover:bg-white/15 transition-all text-xs font-inter"
              title="Gerar Ordem de Serviço"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">OS</span>
            </button>
            <button onClick={onClose} className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/15 transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Descrição */}
          <Section title="Descrição">
            <p className="text-white/80 font-inter text-sm leading-relaxed">{reporte.descricao}</p>
          </Section>

          {/* Foto do cidadão */}
          {reporte.foto_url && (
            <Section title="Foto do Cidadão">
              <img src={reporte.foto_url} alt="Foto do problema" className="w-full rounded-xl object-cover max-h-56 border border-white/10" />
            </Section>
          )}

          {/* Localização */}
          <Section title="Localização">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-lumicity-cyan flex-shrink-0" />
              <span className="text-white/70 text-sm font-inter">{reporte.endereco || "Não informado"}</span>
            </div>
            {reporte.latitude && reporte.longitude && (
              <a
                href={`https://maps.google.com/?q=${reporte.latitude},${reporte.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-lumicity-cyan text-xs mt-2 hover:underline"
              >
                Ver no Google Maps <ChevronRight className="w-3 h-3" />
              </a>
            )}
          </Section>

          {/* Datas */}
          <Section title="Datas">
            <div className="space-y-2">
              <DateRow label="Criado em" value={formatDate(reporte.data_criacao || reporte.created_date)} />
              <DateRow label="Início do atendimento" value={formatDate(reporte.data_inicio_atendimento)} />
              <DateRow label="Resolvido em" value={formatDate(reporte.data_resolucao)} />
            </div>
          </Section>

          {/* Responsável */}
          <Section title="Responsável">
            {reporte.operador_nome ? (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full gradient-lumicity flex items-center justify-center">
                  <span className="text-white text-xs font-space">{reporte.operador_nome.charAt(0)}</span>
                </div>
                <span className="text-white/80 text-sm font-inter">{reporte.operador_nome}</span>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-white/30 text-sm font-inter italic">Sem responsável</span>
                <Button
                  size="sm"
                  onClick={handleAssumirChamado}
                  disabled={saving}
                  className="gradient-lumicity text-white border-0 rounded-lg text-xs"
                >
                  {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : "Assumir chamado"}
                </Button>
              </div>
            )}
          </Section>

          {/* Foto de resolução */}
          {reporte.status !== "Resolvido" && proximo === "Resolvido" && (
            <Section title="Foto de Resolução (opcional)">
              {!fotoResolucao ? (
                <label className="flex items-center gap-3 bg-white/5 border border-dashed border-white/20 rounded-xl p-4 cursor-pointer hover:bg-white/8 transition-all">
                  <Upload className="w-5 h-5 text-white/30" />
                  <span className="text-white/40 text-sm font-inter">Adicionar foto após resolução</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFotoResolucao} />
                </label>
              ) : uploadingFoto ? (
                <div className="flex items-center gap-2 text-white/50 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando foto...
                </div>
              ) : (
                <img src={fotoResolucaoUrl || URL.createObjectURL(fotoResolucao)} alt="Resolução" className="w-full rounded-xl object-cover max-h-40 border border-white/10" />
              )}
            </Section>
          )}

          {reporte.foto_resolucao_url && reporte.status === "Resolvido" && (
            <Section title="Foto de Resolução">
              <img src={reporte.foto_resolucao_url} alt="Foto resolução" className="w-full rounded-xl object-cover max-h-56 border border-white/10" />
            </Section>
          )}

          {/* Observações */}
          {reporte.status !== "Resolvido" && (
            <Section title="Adicionar Observação">
              <textarea
                placeholder="Descreva o que foi feito ou observado..."
                value={obs}
                onChange={(e) => setObs(e.target.value)}
                rows={3}
                className="w-full bg-white/8 border border-white/15 text-white placeholder:text-white/25 rounded-xl resize-none text-sm p-3 focus:outline-none focus:border-lumicity-cyan [color-scheme:dark]"
              />
              <Button
                size="sm"
                onClick={handleAdicionarObs}
                disabled={!obs.trim() || saving}
                variant="outline"
                className="mt-2 border-white/20 text-white/70 hover:bg-white/10 rounded-lg text-xs"
              >
                <MessageSquare className="w-3 h-3 mr-1.5" />
                Salvar observação
              </Button>
            </Section>
          )}

          {/* Histórico */}
          {reporte.historico?.length > 0 && (
            <Section title="Histórico">
              <div className="space-y-3">
                {[...reporte.historico].reverse().map((h, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-1.5 bg-white/10 rounded-full flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white/70 text-xs font-inter font-500">{h.acao}</p>
                      {h.texto && <p className="text-white/40 text-xs font-inter mt-0.5">{h.texto}</p>}
                      <p className="text-white/20 text-xs mt-1">{formatDate(h.data)} · {h.usuario_nome}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* Footer: avançar status */}
        {proximo && reporte.status !== "Cancelado" && (
          <div className="px-6 py-4 border-t border-white/10 flex-shrink-0">
            {proximo === "Resolvido" && (
              <div className="mb-3">
                <textarea
                  placeholder="Observação ao resolver (opcional)..."
                  value={obsResolucao}
                  onChange={(e) => setObsResolucao(e.target.value)}
                  rows={2}
                  className="w-full bg-white/8 border border-white/15 text-white placeholder:text-white/25 rounded-xl resize-none text-sm p-3 focus:outline-none focus:border-lumicity-cyan [color-scheme:dark]"
                />
              </div>
            )}
            <Button
              onClick={handleAvancarStatus}
              disabled={saving || uploadingFoto}
              className="w-full gradient-lumicity text-white border-0 rounded-xl h-11 font-inter font-500 hover:opacity-90 transition-all"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Marcar como "{proximo}"
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        )}
      </motion.div>

      {/* Modal Editar */}
      <AnimatePresence>
        {showEdit && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 z-10 flex items-center justify-center px-4"
            onClick={() => setShowEdit(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#0d1525] border border-white/15 rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-space font-700 text-white">Editar Chamado</h3>
                <button onClick={() => setShowEdit(false)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-white text-sm">Descrição</Label>
                  <textarea
                    value={editDescricao}
                    onChange={e => setEditDescricao(e.target.value)}
                    rows={4}
                    className="w-full bg-[#1a2235] border border-white/15 text-white placeholder:text-white/30 rounded-xl resize-none text-sm p-3 focus:outline-none focus:border-lumicity-cyan"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white text-sm">Endereço</Label>
                  <Input
                    value={editEndereco}
                    onChange={e => setEditEndereco(e.target.value)}
                    className="bg-[#1a2235] border-white/15 text-white placeholder:text-white/30 rounded-xl"
                    placeholder="Endereço do chamado"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button onClick={() => setShowEdit(false)} variant="outline" className="flex-1 border-white/20 text-white/60 hover:text-white hover:bg-white/10 rounded-xl">Cancelar</Button>
                <Button onClick={handleSalvarEdicao} disabled={saving || !editDescricao.trim()} className="flex-1 gradient-lumicity text-white border-0 rounded-xl">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Excluir */}
      <AnimatePresence>
        {showDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 z-10 flex items-center justify-center px-4"
            onClick={() => setShowDelete(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#0d1525] border border-red-500/20 rounded-2xl p-6 w-full max-w-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="font-space font-700 text-white">Excluir Chamado</h3>
                  <p className="text-white/40 text-xs font-inter">Esta ação não pode ser desfeita</p>
                </div>
              </div>
              <p className="text-white/60 text-sm font-inter mb-6">
                Tem certeza que deseja excluir o chamado <span className="text-white font-medium">#{reporte.id?.slice(-6).toUpperCase()}</span>?
              </p>
              <div className="flex gap-3">
                <Button onClick={() => setShowDelete(false)} variant="outline" className="flex-1 border-white/20 text-white/60 hover:text-white hover:bg-white/10 rounded-xl">Cancelar</Button>
                <Button onClick={handleExcluir} disabled={saving} className="flex-1 bg-red-500 hover:bg-red-600 text-white border-0 rounded-xl">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Excluir"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <p className="text-white/30 text-xs font-inter uppercase tracking-wider mb-2">{title}</p>
      {children}
    </div>
  );
}

function DateRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/40 text-xs font-inter">{label}</span>
      <span className="text-white/70 text-xs font-inter">{value}</span>
    </div>
  );
}
