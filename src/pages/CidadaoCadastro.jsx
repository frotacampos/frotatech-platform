import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, CreditCard, Calendar, User, Phone, Mail, Loader2, ArrowLeft, CheckCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { citizensApi } from "@/lib/api";
import { setCidadaoSession } from "@/lib/cidadaoSession";
import { getRuntimeApiMode } from "@/lib/api/apiMode";

function formatCPF(value) {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    .slice(0, 14);
}

function formatTelefone(value) {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d{1,4})$/, "$1-$2")
    .slice(0, 15);
}

export default function CidadaoCadastro() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    data_nascimento: "",
    telefone: "",
    email: "",
    senha: "",
    confirmar_senha: "",
  });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      if (getRuntimeApiMode() === "http" && form.senha !== form.confirmar_senha) {
        setErro("As senhas não conferem.");
        setLoading(false);
        return;
      }

      const data = await citizensApi.createCitizen({
        nome: form.nome,
        cpf: form.cpf,
        data_nascimento: form.data_nascimento,
        telefone: form.telefone,
        email: form.email,
        senha: form.senha,
      });

      if (data?.success) {
        setCidadaoSession(data.cidadao);
        setSucesso(true);
        setTimeout(() => navigate("/registrar-problema"), 1200);
      } else {
        setErro(data?.error || "Erro ao realizar cadastro. Tente novamente.");
      }
    } catch (err) {
      // O SDK lança exceção para respostas de erro HTTP (ex: 409 CPF duplicado)
      const mensagem = err?.response?.data?.error || err?.message || "";
      if (mensagem) {
        setErro(mensagem);
      } else {
        setErro("Erro ao realizar cadastro. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (sucesso) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="w-20 h-20 gradient-lumicity rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="font-space text-2xl font-bold text-white mb-2">Cadastro Realizado!</h2>
          <p className="text-white/50 font-inter">Redirecionando para registrar seu problema...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4 py-12">
      <div className="fixed top-1/4 right-1/4 w-96 h-96 bg-lumicity-cyan/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex items-center gap-3 mb-8">
          <Link to="/">
            <button className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/15 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-lumicity flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-space font-bold text-white text-lg">LumiCity</span>
          </div>
        </div>

        <div className="bg-white/5 border border-white/15 rounded-3xl p-8 backdrop-blur-xl">
          <div className="mb-6">
            <h1 className="font-space text-2xl font-bold text-white mb-1">Cadastro de Cidadão</h1>
            <p className="text-white/40 font-inter text-sm">Crie sua conta para registrar problemas de iluminação</p>
          </div>

          {erro && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-5 text-red-400 text-sm font-inter">
              {erro}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white/70 text-sm font-inter">Nome completo *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  placeholder="Seu nome completo"
                  value={form.nome}
                  onChange={(e) => set("nome", e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/25 rounded-xl pl-9 focus:border-lumicity-cyan"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white/70 text-sm font-inter">CPF *</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  placeholder="000.000.000-00"
                  value={form.cpf}
                  onChange={(e) => set("cpf", formatCPF(e.target.value))}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/25 rounded-xl pl-9 focus:border-lumicity-cyan"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white/70 text-sm font-inter">Data de Nascimento *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  type="date"
                  value={form.data_nascimento}
                  onChange={(e) => set("data_nascimento", e.target.value)}
                  className="bg-white/10 border-white/20 text-white rounded-xl pl-9 focus:border-lumicity-cyan [color-scheme:dark]"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white/70 text-sm font-inter">Telefone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  placeholder="(00) 00000-0000"
                  value={form.telefone}
                  onChange={(e) => set("telefone", formatTelefone(e.target.value))}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/25 rounded-xl pl-9 focus:border-lumicity-cyan"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white/70 text-sm font-inter">E-mail *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/25 rounded-xl pl-9 focus:border-lumicity-cyan"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white/70 text-sm font-inter">Senha *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  type="password"
                  placeholder="Crie uma senha"
                  value={form.senha}
                  onChange={(e) => set("senha", e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/25 rounded-xl pl-9 focus:border-lumicity-cyan"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white/70 text-sm font-inter">Confirmar senha *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  type="password"
                  placeholder="Digite a senha novamente"
                  value={form.confirmar_senha}
                  onChange={(e) => set("confirmar_senha", e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/25 rounded-xl pl-9 focus:border-lumicity-cyan"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !form.nome || !form.cpf || !form.data_nascimento || !form.email || !form.senha || !form.confirmar_senha}
              className="w-full gradient-lumicity text-white border-0 h-12 rounded-xl font-inter font-medium text-base hover:opacity-90 transition-all mt-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar Conta"}
            </Button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-white/30 text-sm font-inter">
              Já tem cadastro?{" "}
              <Link to="/cidadao-login" className="text-lumicity-cyan hover:underline">
                Entrar aqui
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
