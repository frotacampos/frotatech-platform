import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Users, UserPlus, Mail, Shield, Loader2, AlertTriangle, CheckCircle, Trash2, Pencil, X, Info, KeyRound, CreditCard, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { citizensApi, usersApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import AppSidebar from "@/components/layout/AppSidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import { useAppAuth } from "@/hooks/useAuth";

const roleConfig = {
  admin:                { label: "Admin",               color: "bg-purple-500/15 text-purple-400 border-purple-500/30" },
  operador:             { label: "Operador",            color: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  cidadao:              { label: "Cidadão",             color: "bg-green-500/15 text-green-400 border-green-500/30" },
  "tecnico-eletricista":{ label: "Téc. Eletricista",   color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  motorista:            { label: "Motorista",           color: "bg-orange-500/15 text-orange-400 border-orange-500/30" },
  ajudante:             { label: "Ajudante",            color: "bg-teal-500/15 text-teal-400 border-teal-500/30" },
};

const PERFIS_EQUIPE = [
  { value: "tecnico-eletricista", label: "Técnico Eletricista" },
  { value: "motorista", label: "Motorista" },
  { value: "ajudante", label: "Ajudante" },
  { value: "admin", label: "Admin" },
];

function formatCPF(v) {
  return v.replace(/\D/g,"").replace(/(\d{3})(\d)/,"$1.$2").replace(/(\d{3})(\d)/,"$1.$2").replace(/(\d{3})(\d{1,2})$/,"$1-$2").slice(0,14);
}
function formatTel(v) {
  return v.replace(/\D/g,"").replace(/(\d{2})(\d)/,"($1) $2").replace(/(\d{5})(\d{1,4})$/,"$1-$2").slice(0,15);
}
function senhaFromNascimento(dataNasc) {
  if (!dataNasc) return "";
  const [ano, mes, dia] = dataNasc.split("-");
  return `${dia}${mes}${ano}`;
}

export default function GerenciarUsuarios() {
  const { user, role, loading } = useAppAuth();
  const [email, setEmail] = useState("");
  const [novoRole, setNovoRole] = useState("user");
  const [inviting, setInviting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Edit modal (usuários plataforma)
  const [editingUser, setEditingUser] = useState(null);
  const [editRole, setEditRole] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete confirm (usuários plataforma)
  const [deletingUser, setDeletingUser] = useState(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  // Edit/Delete para equipe/cidadãos (CidadaoCadastro)
  const [editingOp, setEditingOp] = useState(null);
  const [editOpPerfil, setEditOpPerfil] = useState("");
  const [savingOp, setSavingOp] = useState(false);
  const [deletingOp, setDeletingOp] = useState(null);
  const [confirmingDeleteOp, setConfirmingDeleteOp] = useState(false);

  // Criar usuário
  const [showCriar, setShowCriar] = useState(false);
  const [criando, setCriando] = useState(false);
  const [criarFeedback, setCriarFeedback] = useState("");
  const [novoUsuario, setNovoUsuario] = useState({
    nome: "", cpf: "", data_nascimento: "", perfil: "tecnico-eletricista",
    email: "", telefone: "", ativo: true,
  });

  const setNU = (field, value) => setNovoUsuario(prev => ({ ...prev, [field]: value }));

  const { data: usuarios = [], isLoading, refetch } = useQuery({
    queryKey: ["usuarios-admin"],
    queryFn: () => usersApi.listUsers(),
    enabled: !loading,
  });

  const { data: todosRegistros = [], isLoading: loadingRegistros, refetch: refetchRegistros } = useQuery({
    queryKey: ["cidadaos-cadastrados"],
    queryFn: () => citizensApi.listCitizens(),
    enabled: !loading,
  });

  // Separar equipe (tem perfil de equipe) de cidadãos (perfil cidadao ou ausente)
  const equipe = todosRegistros.filter(r => r.perfil && r.perfil !== "cidadao");
  const cidadaos = todosRegistros.filter(r => !r.perfil || r.perfil === "cidadao");

  const handleRefetchAll = () => { refetch(); refetchRegistros(); };

  const handleCriarUsuario = async (e) => {
    e.preventDefault();
    setCriando(true);
    setCriarFeedback("");
    const data = await citizensApi.createCitizen({
      nome: novoUsuario.nome,
      cpf: novoUsuario.cpf,
      data_nascimento: novoUsuario.data_nascimento,
      telefone: novoUsuario.telefone,
      email: novoUsuario.email,
      perfil: novoUsuario.perfil,
    });
    setCriando(false);
    if (data?.success) {
      setShowCriar(false);
      setNovoUsuario({ nome: "", cpf: "", data_nascimento: "", perfil: "tecnico-eletricista", email: "", telefone: "", ativo: true });
      handleRefetchAll();
    } else {
      setCriarFeedback(data?.error || "Erro ao criar usuário.");
    }
  };

  const handleConvidar = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setInviting(true);
    setFeedback(null);
    await usersApi.inviteUser({ email: email.trim(), role: novoRole });
    setFeedback({ type: "success", msg: `Convite enviado para ${email}` });
    setEmail("");
    setInviting(false);
    refetch();
  };

  const openEdit = (u) => { setEditingUser(u); setEditRole(u.role || "user"); };
  const handleSaveEdit = async () => {
    setSavingEdit(true);
    await usersApi.updateUser(editingUser.id, { role: editRole });
    setSavingEdit(false);
    setEditingUser(null);
    refetch();
  };
  const handleDelete = async () => {
    setConfirmingDelete(true);
    await usersApi.deleteUser(deletingUser.id);
    setConfirmingDelete(false);
    setDeletingUser(null);
    refetch();
  };

  const openEditOp = (op) => { setEditingOp(op); setEditOpPerfil(op.perfil || "tecnico-eletricista"); };
  const handleSaveEditOp = async () => {
    setSavingOp(true);
    await citizensApi.updateCitizen(editingOp.id, { perfil: editOpPerfil });
    setSavingOp(false);
    setEditingOp(null);
    refetchRegistros();
  };
  const handleDeleteOp = async () => {
    setConfirmingDeleteOp(true);
    await citizensApi.deleteCitizen(deletingOp.id);
    setConfirmingDeleteOp(false);
    setDeletingOp(null);
    refetchRegistros();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-lumicity-dark flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (role !== "admin") {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center px-4">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h2 className="font-space text-xl font-700 text-white mb-2">Acesso Restrito</h2>
          <p className="text-white/50 font-inter mb-6">Esta área é exclusiva para administradores.</p>
          <Link to="/dashboard"><Button className="gradient-lumicity text-white border-0 rounded-xl">Voltar</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lumicity-dark">
      <AppSidebar user={user} role={role} />
      <MobileHeader user={user} role={role} title="Usuários" />

      <main className="lg:pl-64 pt-20 lg:pt-0 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="font-space text-2xl sm:text-3xl font-700 text-white">Gerenciar Usuários</h1>
              <p className="text-white/40 font-inter text-sm mt-1">Cadastre operadores e administradores no sistema</p>
            </div>
            <Button
              onClick={() => { setShowCriar(true); setCriarFeedback(""); }}
              className="gradient-lumicity text-white border-0 rounded-xl whitespace-nowrap flex-shrink-0"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Criar Usuário
            </Button>
          </div>

          {/* Convidar usuário */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <UserPlus className="w-4 h-4 text-lumicity-cyan" />
              <h2 className="font-space font-600 text-white text-sm">Convidar Usuário por E-mail</h2>
            </div>
            <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl mb-4">
              <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-blue-300 text-xs font-inter">
                Informe o e-mail do usuário. Ele receberá um convite para criar sua senha e acessar a plataforma.
                O acesso só é liberado após o aceite do convite.
              </p>
            </div>
            {feedback && (
              <div className={`flex items-center gap-2 p-3 rounded-xl mb-4 text-sm font-inter ${
                feedback.type === "success"
                  ? "bg-green-500/10 border border-green-500/20 text-green-400"
                  : "bg-red-500/10 border border-red-500/20 text-red-400"
              }`}>
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                {feedback.msg}
              </div>
            )}
            <form onSubmit={handleConvidar} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input
                    type="email"
                    placeholder="email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-[#1a2235] border-white/15 text-white placeholder:text-white/40 pl-9 rounded-xl"
                    required
                  />
                </div>
              </div>
              <select
                value={novoRole}
                onChange={(e) => setNovoRole(e.target.value)}
                className="bg-white/8 border border-white/15 text-white rounded-xl h-9 px-3 text-sm font-inter appearance-none cursor-pointer focus:outline-none focus:border-lumicity-cyan [color-scheme:dark] min-w-36"
              >
                <option value="user" className="bg-gray-900">Operador</option>
                <option value="admin" className="bg-gray-900">Administrador</option>
              </select>
              <Button
                type="submit"
                disabled={inviting || !email.trim()}
                className="gradient-lumicity text-white border-0 rounded-xl whitespace-nowrap"
              >
                {inviting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                Enviar Convite
              </Button>
            </form>
          </motion.div>

          {/* Usuários da Plataforma */}
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-6">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-white/10">
              <Users className="w-4 h-4 text-white/40" />
              <h2 className="font-space font-600 text-white text-sm">Usuários da Plataforma</h2>
              <span className="ml-auto text-white/30 text-xs font-inter">{usuarios.length} usuário(s)</span>
            </div>
            {isLoading ? (
              <div className="p-8 text-center"><div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" /></div>
            ) : usuarios.length === 0 ? (
              <div className="p-8 text-center text-white/30 text-sm font-inter">Nenhum usuário encontrado.</div>
            ) : (
              <div className="divide-y divide-white/5">
                {usuarios.map((u, i) => {
                  const rc = roleConfig[u.role] || roleConfig.cidadao;
                  const isSelf = u.email === user?.email;
                  return (
                    <motion.div key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-3 px-5 py-4">
                      <div className="w-9 h-9 rounded-full gradient-lumicity flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-space font-600">{(u.full_name || u.email || "?").charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-inter font-500 truncate">
                          {u.full_name || "—"}
                          {isSelf && <span className="ml-2 text-white/30 text-xs">(você)</span>}
                        </p>
                        <p className="text-white/30 text-xs font-inter truncate">{u.email}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-inter font-500 flex-shrink-0 ${rc.color}`}>
                        <Shield className="w-3 h-3" />{rc.label}
                      </span>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button onClick={() => openEdit(u)}
                          className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 hover:bg-blue-500/20 transition-all" title="Editar">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        {!isSelf && (
                          <button onClick={() => setDeletingUser(u)}
                            className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all" title="Excluir">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Equipe Operacional (cadastrados via CPF com perfil técnico) */}
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-6">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-white/10">
              <Shield className="w-4 h-4 text-lumicity-cyan" />
              <h2 className="font-space font-600 text-white text-sm">Equipe Operacional</h2>
              <span className="ml-auto text-white/30 text-xs font-inter">{equipe.length} membro(s)</span>
            </div>
            {loadingRegistros ? (
              <div className="p-8 text-center"><div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" /></div>
            ) : equipe.length === 0 ? (
              <div className="p-8 text-center text-white/30 text-sm font-inter">Nenhum membro cadastrado. Use "Criar Usuário" acima.</div>
            ) : (
              <div className="divide-y divide-white/5">
                {equipe.map((op, i) => {
                  const rc = roleConfig[op.perfil] || roleConfig.operador;
                  return (
                    <motion.div key={op.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-3 px-5 py-4">
                      <div className="w-9 h-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-space font-600">{(op.nome || "?").charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-inter font-500 truncate">{op.nome}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="flex items-center gap-1 text-white/30 text-xs font-inter"><CreditCard className="w-3 h-3" />{op.cpf}</span>
                          {op.telefone && <span className="flex items-center gap-1 text-white/30 text-xs font-inter"><Phone className="w-3 h-3" />{op.telefone}</span>}
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-inter font-500 flex-shrink-0 ${rc.color}`}>
                        <Shield className="w-3 h-3" />{rc.label}
                      </span>
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${op.ativo ? "bg-green-400" : "bg-red-400"}`} title={op.ativo ? "Ativo" : "Inativo"} />
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button onClick={() => openEditOp(op)}
                          className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 hover:bg-blue-500/20 transition-all" title="Editar">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeletingOp(op)}
                          className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all" title="Excluir">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cidadãos Cadastrados */}
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-6">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-white/10">
              <User className="w-4 h-4 text-green-400" />
              <h2 className="font-space font-600 text-white text-sm">Cidadãos Cadastrados</h2>
              <span className="ml-auto text-white/30 text-xs font-inter">{cidadaos.length} cidadão(s)</span>
            </div>
            {loadingRegistros ? (
              <div className="p-8 text-center"><div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" /></div>
            ) : cidadaos.length === 0 ? (
              <div className="p-8 text-center text-white/30 text-sm font-inter">Nenhum cidadão cadastrado ainda.</div>
            ) : (
              <div className="divide-y divide-white/5">
                {cidadaos.map((op, i) => (
                  <motion.div key={op.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-3 px-5 py-4">
                    <div className="w-9 h-9 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-green-400 text-sm font-space font-600">{(op.nome || "?").charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-inter font-500 truncate">{op.nome}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="flex items-center gap-1 text-white/30 text-xs font-inter"><CreditCard className="w-3 h-3" />{op.cpf}</span>
                        {op.telefone && <span className="flex items-center gap-1 text-white/30 text-xs font-inter"><Phone className="w-3 h-3" />{op.telefone}</span>}
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-inter font-500 flex-shrink-0 bg-green-500/15 text-green-400 border-green-500/30">
                      <User className="w-3 h-3" />Cidadão
                    </span>
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${op.ativo ? "bg-green-400" : "bg-red-400"}`} title={op.ativo ? "Ativo" : "Inativo"} />
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button onClick={() => openEditOp(op)}
                        className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 hover:bg-blue-500/20 transition-all" title="Editar">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeletingOp(op)}
                        className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all" title="Excluir">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Modal Editar Usuário Plataforma */}
      <AnimatePresence>
        {editingUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4"
            onClick={() => setEditingUser(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0d1525] border border-white/15 rounded-2xl p-6 w-full max-w-sm">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-space font-700 text-white">Editar Usuário</h3>
                <button onClick={() => setEditingUser(null)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-white/60 text-xs mb-1 block">Nome</Label>
                  <p className="text-white text-sm font-inter">{editingUser.full_name || "—"}</p>
                  <p className="text-white/30 text-xs">{editingUser.email}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70 text-sm">Função</Label>
                  <select value={editRole} onChange={(e) => setEditRole(e.target.value)}
                    className="w-full bg-white/8 border border-white/15 text-white rounded-xl h-10 px-3 text-sm font-inter appearance-none cursor-pointer focus:outline-none focus:border-lumicity-cyan [color-scheme:dark]">
                    <option value="user" className="bg-gray-900">Operador</option>
                    <option value="admin" className="bg-gray-900">Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button onClick={() => setEditingUser(null)} variant="outline" className="flex-1 border-white/20 text-white/60 hover:text-white hover:bg-white/10 rounded-xl">Cancelar</Button>
                <Button onClick={handleSaveEdit} disabled={savingEdit} className="flex-1 gradient-lumicity text-white border-0 rounded-xl">
                  {savingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Editar Perfil Equipe */}
      <AnimatePresence>
        {editingOp && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4"
            onClick={() => setEditingOp(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0d1525] border border-white/15 rounded-2xl p-6 w-full max-w-sm">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-space font-700 text-white">Editar Perfil</h3>
                <button onClick={() => setEditingOp(null)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-white/60 text-xs mb-1 block">Nome</Label>
                  <p className="text-white text-sm font-inter">{editingOp.nome}</p>
                  <p className="text-white/30 text-xs">{editingOp.cpf}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70 text-sm">Perfil</Label>
                  <select value={editOpPerfil} onChange={(e) => setEditOpPerfil(e.target.value)}
                    className="w-full bg-white/8 border border-white/15 text-white rounded-xl h-10 px-3 text-sm font-inter appearance-none cursor-pointer focus:outline-none focus:border-lumicity-cyan [color-scheme:dark]">
                    {PERFIS_EQUIPE.map(p => <option key={p.value} value={p.value} className="bg-gray-900">{p.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button onClick={() => setEditingOp(null)} variant="outline" className="flex-1 border-white/20 text-white/60 hover:text-white hover:bg-white/10 rounded-xl">Cancelar</Button>
                <Button onClick={handleSaveEditOp} disabled={savingOp} className="flex-1 gradient-lumicity text-white border-0 rounded-xl">
                  {savingOp ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Criar Usuário */}
      <AnimatePresence>
        {showCriar && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4"
            onClick={() => setShowCriar(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0d1525] border border-white/15 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-space font-700 text-white text-lg">Novo Membro da Equipe</h3>
                <button onClick={() => setShowCriar(false)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              {criarFeedback && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-red-400 text-sm font-inter">{criarFeedback}</div>
              )}
              <form onSubmit={handleCriarUsuario} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-sm">Nome completo *</Label>
                  <Input placeholder="Nome do usuário" value={novoUsuario.nome}
                    onChange={(e) => setNU("nome", e.target.value)}
                    className="bg-[#1a2235] border-white/15 text-white placeholder:text-white/30 rounded-xl" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-white/70 text-sm">CPF *</Label>
                    <Input placeholder="Somente números" value={novoUsuario.cpf}
                      onChange={(e) => setNU("cpf", formatCPF(e.target.value))}
                      className="bg-[#1a2235] border-white/15 text-white placeholder:text-white/30 rounded-xl" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-white/70 text-sm">Data de nascimento *</Label>
                    <Input type="date" value={novoUsuario.data_nascimento}
                      onChange={(e) => setNU("data_nascimento", e.target.value)}
                      className="bg-[#1a2235] border-white/15 text-white rounded-xl [color-scheme:dark]" required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-sm">Perfil *</Label>
                  <select value={novoUsuario.perfil} onChange={(e) => setNU("perfil", e.target.value)}
                    className="w-full bg-[#1a2235] border border-white/15 text-white rounded-xl h-10 px-3 text-sm font-inter appearance-none cursor-pointer focus:outline-none focus:border-lumicity-cyan [color-scheme:dark]" required>
                    {PERFIS_EQUIPE.map(p => <option key={p.value} value={p.value} className="bg-gray-900">{p.label}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-white/70 text-sm">E-mail</Label>
                    <Input type="email" placeholder="opcional" value={novoUsuario.email}
                      onChange={(e) => setNU("email", e.target.value)}
                      className="bg-[#1a2235] border-white/15 text-white placeholder:text-white/30 rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-white/70 text-sm">Telefone</Label>
                    <Input placeholder="opcional" value={novoUsuario.telefone}
                      onChange={(e) => setNU("telefone", formatTel(e.target.value))}
                      className="bg-[#1a2235] border-white/15 text-white placeholder:text-white/30 rounded-xl" />
                  </div>
                </div>
                {novoUsuario.data_nascimento && (
                  <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                    <KeyRound className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-yellow-300 text-xs font-inter">
                      <span className="font-semibold">Senha de acesso:</span> data de nascimento no formato DDMMAAAA<br />
                      Ex: nascimento {novoUsuario.data_nascimento.split("-").reverse().join("/")} → senha <span className="font-mono font-bold">{senhaFromNascimento(novoUsuario.data_nascimento)}</span>
                    </p>
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <Button type="button" onClick={() => setShowCriar(false)} variant="outline"
                    className="flex-1 border-white/20 text-white/60 hover:text-white hover:bg-white/10 rounded-xl">Cancelar</Button>
                  <Button type="submit" disabled={criando} className="flex-1 gradient-lumicity text-white border-0 rounded-xl">
                    {criando ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Excluir Equipe/Cidadão */}
      <AnimatePresence>
        {deletingOp && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4"
            onClick={() => setDeletingOp(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0d1525] border border-red-500/20 rounded-2xl p-6 w-full max-w-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="font-space font-700 text-white">Excluir Cadastro</h3>
                  <p className="text-white/40 text-xs font-inter">Esta ação não pode ser desfeita</p>
                </div>
              </div>
              <p className="text-white/60 text-sm font-inter mb-6">
                Tem certeza que deseja excluir <span className="text-white font-medium">{deletingOp.nome}</span>?
              </p>
              <div className="flex gap-3">
                <Button onClick={() => setDeletingOp(null)} variant="outline" className="flex-1 border-white/20 text-white/60 hover:text-white hover:bg-white/10 rounded-xl">Cancelar</Button>
                <Button onClick={handleDeleteOp} disabled={confirmingDeleteOp} className="flex-1 bg-red-500 hover:bg-red-600 text-white border-0 rounded-xl">
                  {confirmingDeleteOp ? <Loader2 className="w-4 h-4 animate-spin" /> : "Excluir"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Excluir Usuário Plataforma */}
      <AnimatePresence>
        {deletingUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4"
            onClick={() => setDeletingUser(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0d1525] border border-red-500/20 rounded-2xl p-6 w-full max-w-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="font-space font-700 text-white">Excluir Usuário</h3>
                  <p className="text-white/40 text-xs font-inter">Esta ação não pode ser desfeita</p>
                </div>
              </div>
              <p className="text-white/60 text-sm font-inter mb-6">
                Tem certeza que deseja excluir <span className="text-white font-medium">{deletingUser.full_name || deletingUser.email}</span>?
              </p>
              <div className="flex gap-3">
                <Button onClick={() => setDeletingUser(null)} variant="outline" className="flex-1 border-white/20 text-white/60 hover:text-white hover:bg-white/10 rounded-xl">Cancelar</Button>
                <Button onClick={handleDelete} disabled={confirmingDelete} className="flex-1 bg-red-500 hover:bg-red-600 text-white border-0 rounded-xl">
                  {confirmingDelete ? <Loader2 className="w-4 h-4 animate-spin" /> : "Excluir"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
