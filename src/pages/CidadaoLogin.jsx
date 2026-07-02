import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, CreditCard, Calendar, Loader2, ArrowLeft, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { citizensApi } from "@/lib/api";
import { setCidadaoSession } from "@/lib/cidadaoSession";
import { getRuntimeApiMode } from "@/lib/api/apiMode";
import PlatformLogin from "@/pages/PlatformLogin";

function formatCPF(value) {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    .slice(0, 14);
}

function CidadaoLoginLegado() {
  const navigate = useNavigate();
  const [cpf, setCpf] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setLoading(true);

    const data = await citizensApi.loginCitizen(cpf, dataNascimento);

    setLoading(false);

    if (data?.success) {
      setCidadaoSession(data.cidadao);
      navigate("/registrar-problema");
    } else {
      setErro(data?.error || "Erro ao realizar login.");
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4">
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-lumicity-blue/10 rounded-full blur-3xl pointer-events-none" />

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
            <h1 className="font-space text-2xl font-bold text-white mb-1">Entrar como Cidadão</h1>
            <p className="text-white/40 font-inter text-sm">Use seu CPF e data de nascimento para acessar</p>
          </div>

          {erro && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-5 text-red-400 text-sm font-inter">
              {erro}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-white/70 text-sm font-inter">CPF</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => setCpf(formatCPF(e.target.value))}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/25 rounded-xl pl-9 focus:border-lumicity-cyan"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white/70 text-sm font-inter">Data de Nascimento</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  type="date"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                  className="bg-white/10 border-white/20 text-white rounded-xl pl-9 focus:border-lumicity-cyan [color-scheme:dark]"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !cpf || !dataNascimento}
              className="w-full gradient-lumicity text-white border-0 h-12 rounded-xl font-inter font-medium text-base hover:opacity-90 transition-all"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Entrar
                </>
              )}
            </Button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-white/30 text-sm font-inter">
              Não tem cadastro?{" "}
              <Link to="/cidadao-cadastro" className="text-lumicity-cyan hover:underline">
                Cadastre-se aqui
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function CidadaoLogin() {
  return getRuntimeApiMode() === "http" ? <PlatformLogin /> : <CidadaoLoginLegado />;
}
