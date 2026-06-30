import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Building2, Save, Upload, Loader2, CheckCircle, AlertTriangle,
  Phone, Mail, MapPin, FileText, Globe, Image, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { companiesApi, storageApi } from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import AppSidebar from "@/components/layout/AppSidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import { useAppAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

const ABAS = [
  { id: "dados", label: "Dados da Empresa", icon: Building2 },
  { id: "logomarca", label: "Logomarca", icon: Image },
];

function formatCNPJ(v) {
  return v.replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2")
    .slice(0, 18);
}
function formatTel(v) {
  return v.replace(/\D/g, "").replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d{1,4})$/, "$1-$2").slice(0, 15);
}

export default function ConfiguracaoEmpresa() {
  const { user, role, loading } = useAppAuth();
  const [abaAtiva, setAbaAtiva] = useState("dados");
  const [salvando, setSalvando] = useState(false);
  const [salvoOk, setSalvoOk] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef(null);
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    nome: "", cnpj: "", tipo: "Prefeitura", email: "", telefone: "",
    endereco: "", cidade: "", estado: "", responsavel_nome: "",
    responsavel_email: "", logo_url: "",
  });

  const { data: empresas = [], isLoading } = useQuery({
    queryKey: ["empresa-config"],
    queryFn: () => companiesApi.listCompanies({ orderBy: "-created_date", limit: 1 }),
    enabled: !loading,
  });

  const empresa = empresas[0] || null;

  useEffect(() => {
    if (empresa) {
      setForm({
        nome: empresa.nome || "",
        cnpj: empresa.cnpj || "",
        tipo: empresa.tipo || "Prefeitura",
        email: empresa.email || "",
        telefone: empresa.telefone || "",
        endereco: empresa.endereco || "",
        cidade: empresa.cidade || "",
        estado: empresa.estado || "",
        responsavel_nome: empresa.responsavel_nome || "",
        responsavel_email: empresa.responsavel_email || "",
        logo_url: empresa.logo_url || "",
      });
    }
  }, [empresa]);

  const setF = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSalvar = async (e) => {
    e.preventDefault();
    setSalvando(true);
    if (empresa) {
      await companiesApi.updateCompany(empresa.id, form);
    } else {
      await companiesApi.createCompany({ ...form, responsavel_user_id: user?.id });
    }
    setSalvando(false);
    setSalvoOk(true);
    queryClient.invalidateQueries({ queryKey: ["empresa-config"] });
    setTimeout(() => setSalvoOk(false), 3000);
  };

  const handleUploadLogo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    const { file_url } = await storageApi.uploadImage(file);
    setF("logo_url", file_url);
    // Salva imediatamente na empresa se já existir
    if (empresa) {
      await companiesApi.updateCompany(empresa.id, { logo_url: file_url });
      queryClient.invalidateQueries({ queryKey: ["empresa-config"] });
    }
    setUploadingLogo(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-lumicity-dark flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  );

  if (role !== "admin") return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4">
      <div className="text-center">
        <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
        <h2 className="font-space text-xl font-700 text-white mb-2">Acesso Restrito</h2>
        <p className="text-white/50 font-inter mb-6">Esta área é exclusiva para administradores.</p>
        <Link to="/admin-dashboard"><Button className="gradient-lumicity text-white border-0 rounded-xl">Voltar</Button></Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-lumicity-dark">
      <AppSidebar user={user} role={role} />
      <MobileHeader user={user} role={role} title="Configurações" />

      <main className="lg:pl-64 pt-20 lg:pt-0 pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

          <div className="mb-8">
            <h1 className="font-space text-2xl sm:text-3xl font-700 text-white">Configuração da Empresa</h1>
            <p className="text-white/40 font-inter text-sm mt-1">Dados institucionais e identidade visual</p>
          </div>

          {/* Abas */}
          <div className="flex gap-2 mb-6">
            {ABAS.map(aba => (
              <button key={aba.id} onClick={() => setAbaAtiva(aba.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-inter transition-all ${
                  abaAtiva === aba.id
                    ? "gradient-lumicity text-white"
                    : "bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10"
                }`}>
                <aba.icon className="w-4 h-4" />
                {aba.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="py-20 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Aba Dados */}
              {abaAtiva === "dados" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <form onSubmit={handleSalvar} className="space-y-5">

                    {/* Informações principais */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Building2 className="w-4 h-4 text-lumicity-cyan" />
                        <h2 className="font-space font-600 text-white text-sm">Informações Principais</h2>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2 space-y-1.5">
                          <Label className="text-white/70 text-sm">Razão Social *</Label>
                          <Input value={form.nome} onChange={e => setF("nome", e.target.value)}
                            placeholder="Nome da empresa / prefeitura"
                            className="bg-[#1a2235] border-white/15 text-white placeholder:text-white/30 rounded-xl" required />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-white/70 text-sm">CNPJ</Label>
                          <Input value={form.cnpj} onChange={e => setF("cnpj", formatCNPJ(e.target.value))}
                            placeholder="00.000.000/0000-00"
                            className="bg-[#1a2235] border-white/15 text-white placeholder:text-white/30 rounded-xl" />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-white/70 text-sm">Tipo</Label>
                          <select value={form.tipo} onChange={e => setF("tipo", e.target.value)}
                            className="w-full bg-[#1a2235] border border-white/15 text-white rounded-xl h-9 px-3 text-sm font-inter appearance-none focus:outline-none focus:border-lumicity-cyan [color-scheme:dark]">
                            <option className="bg-gray-900" value="Prefeitura">Prefeitura</option>
                            <option className="bg-gray-900" value="Terceirizada">Terceirizada</option>
                            <option className="bg-gray-900" value="Concessionária">Concessionária</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Contato */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Phone className="w-4 h-4 text-lumicity-cyan" />
                        <h2 className="font-space font-600 text-white text-sm">Contato</h2>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-white/70 text-sm">E-mail</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                            <Input type="email" value={form.email} onChange={e => setF("email", e.target.value)}
                              placeholder="contato@empresa.com"
                              className="bg-[#1a2235] border-white/15 text-white placeholder:text-white/30 rounded-xl pl-9" />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-white/70 text-sm">Telefone</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                            <Input value={form.telefone} onChange={e => setF("telefone", formatTel(e.target.value))}
                              placeholder="(00) 00000-0000"
                              className="bg-[#1a2235] border-white/15 text-white placeholder:text-white/30 rounded-xl pl-9" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Endereço */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4 text-lumicity-cyan" />
                        <h2 className="font-space font-600 text-white text-sm">Endereço</h2>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-white/70 text-sm">Endereço completo</Label>
                        <Input value={form.endereco} onChange={e => setF("endereco", e.target.value)}
                          placeholder="Rua, número, bairro"
                          className="bg-[#1a2235] border-white/15 text-white placeholder:text-white/30 rounded-xl" />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-white/70 text-sm">Cidade</Label>
                          <Input value={form.cidade} onChange={e => setF("cidade", e.target.value)}
                            placeholder="Cidade"
                            className="bg-[#1a2235] border-white/15 text-white placeholder:text-white/30 rounded-xl" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-white/70 text-sm">Estado (UF)</Label>
                          <Input value={form.estado} onChange={e => setF("estado", e.target.value.toUpperCase().slice(0, 2))}
                            placeholder="AM"
                            className="bg-[#1a2235] border-white/15 text-white placeholder:text-white/30 rounded-xl" />
                        </div>
                      </div>
                    </div>

                    {/* Responsável */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-4 h-4 text-lumicity-cyan" />
                        <h2 className="font-space font-600 text-white text-sm">Responsável</h2>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-white/70 text-sm">Nome do responsável</Label>
                          <Input value={form.responsavel_nome} onChange={e => setF("responsavel_nome", e.target.value)}
                            placeholder="Nome completo"
                            className="bg-[#1a2235] border-white/15 text-white placeholder:text-white/30 rounded-xl" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-white/70 text-sm">E-mail do responsável</Label>
                          <Input type="email" value={form.responsavel_email} onChange={e => setF("responsavel_email", e.target.value)}
                            placeholder="responsavel@empresa.com"
                            className="bg-[#1a2235] border-white/15 text-white placeholder:text-white/30 rounded-xl" />
                        </div>
                      </div>
                    </div>

                    {salvoOk && (
                      <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm font-inter">
                        <CheckCircle className="w-4 h-4" /> Dados salvos com sucesso!
                      </div>
                    )}

                    <Button type="submit" disabled={salvando} className="w-full gradient-lumicity text-white border-0 rounded-xl h-11">
                      {salvando ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                      Salvar Dados
                    </Button>
                  </form>
                </motion.div>
              )}

              {/* Aba Logomarca */}
              {abaAtiva === "logomarca" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-5">
                      <Image className="w-4 h-4 text-lumicity-cyan" />
                      <h2 className="font-space font-600 text-white text-sm">Logomarca da Empresa</h2>
                    </div>

                    {/* Preview */}
                    <div className="mb-6">
                      <Label className="text-white/70 text-sm mb-3 block">Pré-visualização</Label>
                      <div className="w-full h-48 rounded-2xl border-2 border-dashed border-white/15 flex items-center justify-center bg-white/3 overflow-hidden">
                        {form.logo_url ? (
                          <div className="relative w-full h-full flex items-center justify-center p-4">
                            <img src={form.logo_url} alt="Logomarca" className="max-h-full max-w-full object-contain" />
                            <button
                              onClick={() => setF("logo_url", "")}
                              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/70 transition-all"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Image className="w-10 h-10 text-white/20 mx-auto mb-2" />
                            <p className="text-white/30 text-sm font-inter">Nenhuma logomarca definida</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Upload */}
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleUploadLogo}
                    />

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={() => logoInputRef.current?.click()}
                        disabled={uploadingLogo}
                        className="flex-1 gradient-lumicity text-white border-0 rounded-xl"
                      >
                        {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                        {uploadingLogo ? "Enviando..." : "Enviar Logomarca"}
                      </Button>

                      {form.logo_url && !empresa?.logo_url && (
                        <Button onClick={handleSalvar} disabled={salvando} variant="outline"
                          className="border-white/20 text-white/60 hover:text-white hover:bg-white/10 rounded-xl">
                          {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                          Salvar
                        </Button>
                      )}
                    </div>

                    <p className="text-white/30 text-xs font-inter mt-3">
                      Formatos aceitos: PNG, JPG, SVG. Recomendado: fundo transparente (PNG).
                    </p>

                    {salvoOk && (
                      <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm font-inter mt-4">
                        <CheckCircle className="w-4 h-4" /> Logomarca salva com sucesso!
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
