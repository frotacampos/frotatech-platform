import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, ArrowLeft, ArrowRight, CheckCircle, Loader2, Zap, User, Mail, Phone, MapPin, FileText, Shield, Upload, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi, companiesApi, storageApi } from "@/lib/api";

const STEPS = [
  { id: 1, title: "Tipo de Empresa", icon: Shield },
  { id: 2, title: "Dados da Empresa", icon: Building2 },
  { id: 3, title: "Responsável", icon: User },
  { id: 4, title: "Localização", icon: MapPin },
  { id: 5, title: "Confirmar", icon: CheckCircle },
];

export default function CadastrarEmpresa() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractMsg, setExtractMsg] = useState("");

  const [form, setForm] = useState({
    tipo: "",
    nome: "",
    cnpj: "",
    email: "",
    telefone: "",
    responsavel_nome: "",
    responsavel_email: "",
    endereco: "",
    cidade: "",
    estado: "",
  });

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const formatCNPJ = (v) =>
    v.replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d{1,2})$/, "$1-$2")
      .slice(0, 18);

  const formatTel = (v) =>
    v.replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d{1,4})$/, "$1-$2")
      .slice(0, 15);

  const handleDocumentUpload = async (file) => {
    if (!file) return;
    setExtracting(true);
    setExtractMsg("Enviando documento...");
    try {
      const { file_url } = await storageApi.uploadImage(file);
      setExtractMsg("Extraindo dados com IA...");
      const result = await storageApi.extractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: {
            nome: { type: "string" },
            cnpj: { type: "string" },
            email: { type: "string" },
            telefone: { type: "string" },
            responsavel_nome: { type: "string" },
            endereco: { type: "string" },
            cidade: { type: "string" },
            estado: { type: "string" },
          }
        }
      });
      if (result.status === "success" && result.output) {
        const d = Array.isArray(result.output) ? result.output[0] : result.output;
        setForm(prev => ({
          ...prev,
          nome: d.nome || prev.nome,
          cnpj: d.cnpj ? formatCNPJ(d.cnpj) : prev.cnpj,
          email: d.email || prev.email,
          telefone: d.telefone ? formatTel(d.telefone) : prev.telefone,
          responsavel_nome: d.responsavel_nome || prev.responsavel_nome,
          endereco: d.endereco || prev.endereco,
          cidade: d.cidade || prev.cidade,
          estado: d.estado ? d.estado.toUpperCase().slice(0, 2) : prev.estado,
        }));
        setExtractMsg("✓ Dados preenchidos automaticamente!");
      } else {
        setExtractMsg("Não foi possível extrair os dados. Preencha manualmente.");
      }
    } catch {
      setExtractMsg("Erro ao processar documento. Tente novamente.");
    } finally {
      setExtracting(false);
      setTimeout(() => setExtractMsg(""), 4000);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const user = await authApi.getCurrentUser();
      await companiesApi.createCompany({
        ...form,
        cnpj: form.cnpj.replace(/\D/g, ""),
        telefone: form.telefone.replace(/\D/g, ""),
        responsavel_user_id: user?.id || "",
        ativa: true,
      });
      // Atualiza o role do usuário para admin_empresa
      if (user) {
        await authApi.updateCurrentUser({
          role: "admin_empresa",
          empresa_nome: form.nome,
        });
      }
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 2500);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="w-20 h-20 gradient-lumicity rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="font-space text-2xl font-bold text-white mb-2">Empresa Cadastrada!</h2>
          <p className="text-white/50 font-inter">Você agora é administrador da empresa.</p>
          <p className="text-white/30 text-sm font-inter mt-2">Redirecionando...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero">
      <div className="fixed top-1/4 right-1/4 w-96 h-96 bg-lumicity-cyan/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-4 sm:px-6 py-5 flex items-center gap-4">
        <Link to="/">
          <button className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg gradient-lumicity flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-space font-bold text-white">Cadastrar Empresa</span>
        </div>
      </header>

      <div className="relative z-10 max-w-lg mx-auto px-4 sm:px-6 pb-12">
        {/* Progress */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center gap-1">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
                  step > s.id ? "gradient-lumicity border-transparent" :
                  step === s.id ? "bg-white/15 border-lumicity-cyan" :
                  "bg-white/5 border-white/15"
                }`}>
                  {step > s.id
                    ? <CheckCircle className="w-4 h-4 text-white" />
                    : <s.icon className={`w-4 h-4 ${step === s.id ? "text-lumicity-cyan" : "text-white/30"}`} />
                  }
                </div>
                <span className={`text-xs font-inter hidden sm:block ${step === s.id ? "text-white/70" : "text-white/25"}`}>{s.title}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-2 transition-all ${step > s.id ? "bg-lumicity-cyan/50" : "bg-white/10"}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Card */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white/5 border border-white/15 rounded-3xl p-6 sm:p-8 backdrop-blur-xl"
        >
          {/* Step 1: Tipo */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-space text-lg font-bold text-white mb-4">Qual é o tipo da sua empresa?</h2>
              {["Prefeitura", "Terceirizada", "Concessionária"].map((tipo) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => set("tipo", tipo)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                    form.tipo === tipo
                      ? "bg-lumicity-cyan/15 border-lumicity-cyan text-white"
                      : "bg-white/5 border-white/15 text-white/60 hover:border-white/30"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${form.tipo === tipo ? "gradient-lumicity" : "bg-white/10"}`}>
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-space font-semibold text-sm">{tipo}</p>
                    <p className="text-xs text-white/40 font-inter mt-0.5">
                      {tipo === "Prefeitura" ? "Órgão público municipal" :
                       tipo === "Terceirizada" ? "Empresa contratada pelo município" :
                       "Empresa concessionária de serviços"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Dados da empresa */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-space text-lg font-bold text-white mb-4">Dados da empresa</h2>

              {/* Upload de Documento */}
              <div className="p-4 bg-lumicity-cyan/8 border border-lumicity-cyan/25 rounded-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-lumicity-cyan" />
                  <span className="text-lumicity-cyan text-sm font-inter font-medium">Preencher automaticamente com documento</span>
                </div>
                <p className="text-white/40 text-xs font-inter">Envie um CNPJ, contrato social, certificado MEI ou qualquer documento da empresa — a IA extrai e preenche os campos.</p>
                <label className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed cursor-pointer transition-all ${extracting ? "border-lumicity-cyan/40 bg-lumicity-cyan/5" : "border-white/20 hover:border-lumicity-cyan/50 hover:bg-white/5"}`}>
                  <input type="file" accept=".pdf,.png,.jpg,.jpeg,.xlsx,.csv" className="hidden"
                    onChange={e => handleDocumentUpload(e.target.files[0])} disabled={extracting} />
                  {extracting
                    ? <Loader2 className="w-4 h-4 text-lumicity-cyan animate-spin" />
                    : <Upload className="w-4 h-4 text-white/40" />}
                  <span className={`text-sm font-inter ${extracting ? "text-lumicity-cyan" : "text-white/40"}`}>
                    {extracting ? "Processando..." : "Clique para enviar PDF, imagem ou planilha"}
                  </span>
                </label>
                {extractMsg && (
                  <p className={`text-xs font-inter ${extractMsg.startsWith("✓") ? "text-green-400" : "text-white/50"}`}>{extractMsg}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Razão Social *</Label>
                <Input value={form.nome} onChange={e => set("nome", e.target.value)}
                  placeholder="Nome da empresa" className="bg-white/10 border-white/20 text-white placeholder:text-white/25 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">CNPJ *</Label>
                <Input value={form.cnpj} onChange={e => set("cnpj", formatCNPJ(e.target.value))}
                  placeholder="00.000.000/0000-00" className="bg-white/10 border-white/20 text-white placeholder:text-white/25 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">E-mail da empresa</Label>
                <Input type="email" value={form.email} onChange={e => set("email", e.target.value)}
                  placeholder="contato@empresa.com" className="bg-white/10 border-white/20 text-white placeholder:text-white/25 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Telefone</Label>
                <Input value={form.telefone} onChange={e => set("telefone", formatTel(e.target.value))}
                  placeholder="(00) 00000-0000" className="bg-white/10 border-white/20 text-white placeholder:text-white/25 rounded-xl" />
              </div>
            </div>
          )}

          {/* Step 3: Responsável */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-space text-lg font-bold text-white mb-4">Dados do responsável</h2>
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Nome do responsável *</Label>
                <Input value={form.responsavel_nome} onChange={e => set("responsavel_nome", e.target.value)}
                  placeholder="Nome completo" className="bg-white/10 border-white/20 text-white placeholder:text-white/25 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">E-mail do responsável *</Label>
                <Input type="email" value={form.responsavel_email} onChange={e => set("responsavel_email", e.target.value)}
                  placeholder="responsavel@empresa.com" className="bg-white/10 border-white/20 text-white placeholder:text-white/25 rounded-xl" />
              </div>
              <div className="p-3 bg-lumicity-cyan/10 border border-lumicity-cyan/20 rounded-xl">
                <p className="text-lumicity-cyan text-xs font-inter">Você será definido como administrador desta empresa e poderá convidar funcionários pelo painel.</p>
              </div>
            </div>
          )}

          {/* Step 4: Localização */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="font-space text-lg font-bold text-white mb-4">Localização da empresa</h2>
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Endereço</Label>
                <Input value={form.endereco} onChange={e => set("endereco", e.target.value)}
                  placeholder="Rua, número, bairro" className="bg-white/10 border-white/20 text-white placeholder:text-white/25 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-white/70 text-sm">Cidade *</Label>
                  <Input value={form.cidade} onChange={e => set("cidade", e.target.value)}
                    placeholder="Cidade" className="bg-white/10 border-white/20 text-white placeholder:text-white/25 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70 text-sm">Estado (UF) *</Label>
                  <Input value={form.estado} onChange={e => set("estado", e.target.value.toUpperCase().slice(0, 2))}
                    placeholder="AM" className="bg-white/10 border-white/20 text-white placeholder:text-white/25 rounded-xl" />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Confirmação */}
          {step === 5 && (
            <div className="space-y-4">
              <h2 className="font-space text-lg font-bold text-white mb-4">Confirme os dados</h2>
              <div className="space-y-3">
                {[
                  { label: "Tipo", value: form.tipo },
                  { label: "Empresa", value: form.nome },
                  { label: "CNPJ", value: form.cnpj },
                  { label: "Responsável", value: form.responsavel_nome },
                  { label: "E-mail", value: form.responsavel_email },
                  { label: "Cidade/UF", value: form.cidade && form.estado ? `${form.cidade} / ${form.estado}` : form.cidade || form.estado },
                ].map(({ label, value }) => value ? (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-white/40 text-sm font-inter">{label}</span>
                    <span className="text-white text-sm font-inter font-medium">{value}</span>
                  </div>
                ) : null)}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <Button onClick={() => setStep(s => s - 1)} variant="outline"
                className="flex-1 border-white/20 text-white/60 hover:text-white hover:bg-white/10 rounded-xl">
                <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
              </Button>
            )}
            {step < 5 ? (
              <Button
                onClick={() => setStep(s => s + 1)}
                disabled={
                  (step === 1 && !form.tipo) ||
                  (step === 2 && (!form.nome || !form.cnpj)) ||
                  (step === 3 && (!form.responsavel_nome || !form.responsavel_email)) ||
                  (step === 4 && (!form.cidade || !form.estado))
                }
                className="flex-1 gradient-lumicity text-white border-0 rounded-xl hover:opacity-90"
              >
                Próximo <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}
                className="flex-1 gradient-lumicity text-white border-0 rounded-xl hover:opacity-90">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                Cadastrar Empresa
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
