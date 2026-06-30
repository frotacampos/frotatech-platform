import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, MapPin, Camera, X, ArrowLeft, CheckCircle, Loader2, User, Phone, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi, reportsApi, storageApi } from "@/lib/api";
import AiDescricaoHelper from "@/components/ai/AiDescricaoHelper";
import AiPrioridadeBadge from "@/components/ai/AiPrioridadeBadge";
import { getCidadaoSession } from "@/lib/cidadaoSession";

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

export default function RegistrarProblema() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cidadao, setCidadao] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Campos do cidadão não logado
  const [nomeCidadao, setNomeCidadao] = useState("");
  const [cpfCidadao, setCpfCidadao] = useState("");
  const [telefoneCidadao, setTelefoneCidadao] = useState("");

  const [descricao, setDescricao] = useState("");
  const [enderecoManual, setEnderecoManual] = useState("");
  const [foto, setFoto] = useState(null);
  const [fotoUrl, setFotoUrl] = useState("");
  const [localizacao, setLocalizacao] = useState(null);
  const [loadingGps, setLoadingGps] = useState(false);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [gpsError, setGpsError] = useState("");

  useEffect(() => {
    // Verificar sessão de cidadão local primeiro
    const sessaoCidadao = getCidadaoSession();
    if (sessaoCidadao) {
      setCidadao(sessaoCidadao);
      setCheckingAuth(false);
      obterLocalizacao();
      return;
    }

    authApi.getCurrentUser()
      .then((u) => {
        setUser(u);
        // Admin e operador não podem registrar problemas
        if (u && (u.role === "admin" || u.role === "operador")) {
          setCheckingAuth(false);
          return;
        }
        obterLocalizacao();
      })
      .catch(() => { setUser(null); obterLocalizacao(); })
      .finally(() => setCheckingAuth(false));
  }, []);

  const obterLocalizacao = () => {
    setLoadingGps(true);
    setGpsError("");
    if (!navigator.geolocation) {
      setGpsError("GPS não disponível neste dispositivo.");
      setLoadingGps(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocalizacao({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setLoadingGps(false);
      },
      () => {
        setGpsError("Não foi possível obter a localização. O reporte será salvo sem GPS.");
        setLoadingGps(false);
      },
      { timeout: 10000 }
    );
  };

  const handleFotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFoto(file);
    setLoadingUpload(true);
    const { file_url } = await storageApi.uploadImage(file);
    setFotoUrl(file_url);
    setLoadingUpload(false);
  };

  const geocodificarEndereco = async (endereco) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}&limit=1`,
        { headers: { "Accept-Language": "pt-BR" } }
      );
      const data = await res.json();
      if (data && data.length > 0) {
        return { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) };
      }
    } catch (_) {}
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!descricao.trim()) return;

    // Validar campos obrigatórios para não logados e sem sessão de cidadão
    if (!user && !cidadao && (!nomeCidadao.trim() || !cpfCidadao.trim() || !telefoneCidadao.trim())) return;

    setLoading(true);

    // Determinar dados do autor: usuário Base44, cidadão logado, ou anônimo
    const isCidadaoUser = user?.role === "cidadao";
    const autorNome = user?.full_name || cidadao?.nome || nomeCidadao.trim();
    const autorCpf = user?.cpf || cidadao?.cpf || cpfCidadao.replace(/\D/g, "");
    const autorTelefone = user?.phone || user?.telefone || cidadao?.telefone || telefoneCidadao.replace(/\D/g, "");

    // Tentar geocodificar endereço manual se não tiver GPS
    let coordenadas = localizacao;
    if (!coordenadas && enderecoManual.trim()) {
      coordenadas = await geocodificarEndereco(enderecoManual.trim());
    }

    await reportsApi.createReport({
      descricao: descricao.trim(),
      foto_url: fotoUrl || "",
      latitude: coordenadas?.latitude || null,
      longitude: coordenadas?.longitude || null,
      endereco: enderecoManual.trim() || (localizacao ? `${localizacao.latitude.toFixed(4)}, ${localizacao.longitude.toFixed(4)}` : ""),
      status: "Pendente",
      categoria: "Iluminação Pública",
      usuario_id: user?.id || cidadao?.id || "",
      usuario_nome: autorNome,
      nome_cidadao: isCidadaoUser || !user ? autorNome : "",
      cpf_cidadao: isCidadaoUser || !user ? autorCpf : "",
      telefone_cidadao: isCidadaoUser || !user ? autorTelefone : "",
      data_criacao: new Date().toISOString(),
    });

    setLoading(false);
    setSuccess(true);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  // Admin e operador não podem registrar problemas
  if (user && (user.role === "admin" || user.role === "operador")) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center mx-auto mb-5">
            <Zap className="w-8 h-8 text-yellow-400" />
          </div>
          <h2 className="font-space text-xl font-bold text-white mb-2">Área exclusiva para cidadãos</h2>
          <p className="text-white/50 font-inter text-sm mb-6 max-w-xs mx-auto">
            Administradores e operadores gerenciam os chamados, mas não registram problemas.<br/>Use o painel para visualizar e atender os chamados.
          </p>
          <Link to={user.role === "admin" ? "/admin-dashboard" : "/dashboard"}>
            <Button className="gradient-lumicity text-white border-0 rounded-xl">Ir para o Painel</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-sm mx-auto">
          <div className="w-20 h-20 gradient-lumicity rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="font-space text-2xl font-bold text-white mb-2">Reporte Enviado!</h2>
          <p className="text-white/50 font-inter mb-6">Sua denúncia foi registrada com sucesso. Você pode acompanhar o status aqui.</p>
          <div className="flex flex-col gap-3">
            {cidadao && (
              <Link to="/meus-chamados">
                <button className="w-full gradient-lumicity text-white font-inter font-medium px-6 py-3 rounded-xl">
                  Acompanhar meu chamado
                </button>
              </Link>
            )}
            <Link to="/registrar-problema" onClick={() => window.location.reload()}>
              <button className="w-full bg-white/10 border border-white/20 text-white/70 hover:text-white font-inter text-sm px-6 py-3 rounded-xl transition-all">
                Registrar outro problema
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero">
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-lumicity-blue/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-4 sm:px-6 py-5 flex items-center gap-4">
        <Link to={user ? "/dashboard" : "/"}>
          <button className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/15 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg gradient-lumicity flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-space font-bold text-white">Registrar Problema</span>
        </div>
      </header>

      {/* Form */}
      <div className="relative z-10 max-w-lg mx-auto px-4 sm:px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/15 rounded-3xl p-6 sm:p-8 backdrop-blur-xl"
        >
          <div className="mb-6">
            <span className="inline-flex items-center gap-2 bg-lumicity-cyan/20 border border-lumicity-cyan/30 rounded-full px-3 py-1">
              <div className="w-2 h-2 bg-lumicity-cyan rounded-full" />
              <span className="text-lumicity-cyan text-xs font-inter">Iluminação Pública</span>
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Dados do cidadão logado via sessão */}
            {!user && cidadao && (
              <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                <div className="w-8 h-8 rounded-full gradient-lumicity flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-space font-600">{cidadao.nome.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-green-300 text-sm font-inter font-500">{cidadao.nome}</p>
                  <p className="text-green-400/60 text-xs font-inter">Logado como cidadão</p>
                </div>
              </div>
            )}

            {/* Dados do cidadão (apenas se não logado e sem sessão) */}
            {!user && !cidadao && (
              <div className="space-y-4 p-4 bg-white/5 border border-white/10 rounded-2xl">
                <p className="text-white/60 text-xs font-inter uppercase tracking-wider">Seus dados de contato</p>

                <div className="space-y-2">
                  <Label className="text-white/70 text-sm font-inter">Nome completo *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input
                      placeholder="Seu nome completo"
                      value={nomeCidadao}
                      onChange={(e) => setNomeCidadao(e.target.value)}
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
                      value={cpfCidadao}
                      onChange={(e) => setCpfCidadao(formatCPF(e.target.value))}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/25 rounded-xl pl-9 focus:border-lumicity-cyan"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white/70 text-sm font-inter">Telefone *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input
                      placeholder="(00) 00000-0000"
                      value={telefoneCidadao}
                      onChange={(e) => setTelefoneCidadao(formatTelefone(e.target.value))}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/25 rounded-xl pl-9 focus:border-lumicity-cyan"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Descrição */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-white/70 text-sm font-inter">Descrição do problema *</Label>
                <AiDescricaoHelper descricao={descricao} onSugestao={setDescricao} />
              </div>
              <Textarea
                placeholder="Ex: Poste apagado na calçada em frente ao número 123..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={4}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/25 rounded-xl focus:border-lumicity-cyan resize-none"
                required
              />
              {descricao.length >= 10 && (
                <div className="mt-2">
                  <AiPrioridadeBadge
                    descricao={descricao}
                    endereco={localizacao ? `${localizacao.latitude.toFixed(4)}, ${localizacao.longitude.toFixed(4)}` : ""}
                  />
                </div>
              )}
            </div>

            {/* Localização */}
            <div className="space-y-3">
              <Label className="text-white/70 text-sm font-inter">Localização</Label>

              {/* Campo de endereço manual */}
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  placeholder="Digite o endereço (Ex: Rua das Flores, 123, Centro)"
                  value={enderecoManual}
                  onChange={(e) => setEnderecoManual(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/25 rounded-xl pl-9 pr-4 h-10 text-sm font-inter focus:outline-none focus:border-lumicity-cyan [color-scheme:dark]"
                />
              </div>

              <p className="text-white/30 text-xs font-inter">— ou use o GPS abaixo —</p>

              <div className={`flex items-center gap-3 rounded-xl p-4 border ${
                localizacao ? "bg-green-500/10 border-green-500/30" :
                gpsError ? "bg-red-500/10 border-red-500/30" : "bg-white/5 border-white/15"
              }`}>
                {loadingGps ? (
                  <>
                    <Loader2 className="w-5 h-5 text-lumicity-cyan animate-spin" />
                    <span className="text-white/60 text-sm font-inter">Obtendo localização...</span>
                  </>
                ) : localizacao ? (
                  <>
                    <MapPin className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="text-green-300 text-sm font-inter">Localização obtida</p>
                      <p className="text-white/30 text-xs">{localizacao.latitude.toFixed(5)}, {localizacao.longitude.toFixed(5)}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <MapPin className="w-5 h-5 text-white/30" />
                    <div className="flex-1">
                      <p className="text-white/40 text-sm font-inter">{gpsError || "GPS não disponível"}</p>
                    </div>
                    <button type="button" onClick={obterLocalizacao} className="text-lumicity-cyan text-xs hover:underline">
                      Tentar novamente
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Foto */}
            <div className="space-y-2">
              <Label className="text-white/70 text-sm font-inter">Foto (opcional)</Label>
              {!foto ? (
                <label className="flex flex-col items-center justify-center gap-3 bg-white/5 border border-dashed border-white/20 rounded-xl p-8 cursor-pointer hover:bg-white/8 hover:border-white/30 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Camera className="w-5 h-5 text-white/40" />
                  </div>
                  <div className="text-center">
                    <p className="text-white/50 text-sm font-inter">Toque para adicionar foto</p>
                    <p className="text-white/25 text-xs mt-1">JPG, PNG até 10MB</p>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFotoChange} />
                </label>
              ) : (
                <div className="relative">
                  {loadingUpload ? (
                    <div className="bg-white/5 border border-white/15 rounded-xl p-4 flex items-center gap-3">
                      <Loader2 className="w-5 h-5 text-lumicity-cyan animate-spin" />
                      <span className="text-white/50 text-sm font-inter">Enviando foto...</span>
                    </div>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden">
                      <img src={fotoUrl || URL.createObjectURL(foto)} alt="Preview" className="w-full h-48 object-cover" />
                      <button
                        type="button"
                        onClick={() => { setFoto(null); setFotoUrl(""); }}
                        className="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading || !descricao.trim() || loadingUpload || (!user && !cidadao && (!nomeCidadao.trim() || !cpfCidadao.trim() || !telefoneCidadao.trim()))}
              className="w-full gradient-lumicity text-white border-0 h-12 rounded-xl font-inter font-medium text-base hover:opacity-90 transition-all shadow-lg shadow-lumicity-blue/30 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </div>
              ) : "Enviar Reporte"}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
