import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, User, Phone, Calendar, CreditCard, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi, usersApi } from "@/lib/api";

export default function Perfil() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ cpf: "", telefone: "", data_nascimento: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      const u = await authApi.getCurrentUser();
      if (!u) { navigate("/"); return; }
      setUser(u);
      const profiles = await usersApi.listUsers();
      const match = profiles.find(p => p.created_by === u.email || p.id === u.id);
      if (match) {
        setProfile(match);
        setForm({
          cpf: match.cpf || "",
          telefone: match.telefone || "",
          data_nascimento: match.data_nascimento || "",
        });
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (profile?.id) {
      await usersApi.updateUser(profile.id, {
        cpf: form.cpf,
        telefone: form.telefone,
        data_nascimento: form.data_nascimento,
        primeiro_login: false,
      });
    } else {
      await authApi.updateCurrentUser({
        cpf: form.cpf,
        telefone: form.telefone,
        data_nascimento: form.data_nascimento,
        primeiro_login: false,
      });
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => navigate("/dashboard"), 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (saved) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="w-16 h-16 gradient-lumicity rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="font-space text-xl font-700 text-white mb-2">Perfil atualizado!</h2>
          <p className="text-white/50 font-inter text-sm">Redirecionando...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 rounded-lg gradient-lumicity flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-space font-700 text-white text-xl">LumiCity</span>
        </div>

        <div className="bg-white/5 border border-white/15 rounded-3xl p-6 sm:p-8 backdrop-blur-xl">
          <div className="mb-6">
            <h1 className="font-space text-xl font-700 text-white">Complete seu perfil</h1>
            <p className="text-white/40 text-sm font-inter mt-1">
              Olá, {user?.full_name?.split(" ")[0]}! Preencha seus dados para continuar.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label className="text-white/60 text-sm font-inter mb-1.5 block">CPF *</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  placeholder="000.000.000-00"
                  value={form.cpf}
                  onChange={(e) => setForm({ ...form, cpf: e.target.value })}
                  className="bg-white/8 border-white/20 text-white placeholder:text-white/20 pl-10 rounded-xl"
                  required
                />
              </div>
            </div>

            <div>
              <Label className="text-white/60 text-sm font-inter mb-1.5 block">Telefone *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  placeholder="(00) 00000-0000"
                  value={form.telefone}
                  onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                  className="bg-white/8 border-white/20 text-white placeholder:text-white/20 pl-10 rounded-xl"
                  required
                />
              </div>
            </div>

            <div>
              <Label className="text-white/60 text-sm font-inter mb-1.5 block">Data de Nascimento *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="date"
                  value={form.data_nascimento}
                  onChange={(e) => setForm({ ...form, data_nascimento: e.target.value })}
                  className="w-full bg-white/8 border border-white/20 text-white rounded-xl h-9 pl-10 pr-4 text-sm font-inter focus:outline-none focus:border-lumicity-cyan [color-scheme:dark]"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="w-full gradient-lumicity text-white border-0 h-11 rounded-xl font-inter font-500 hover:opacity-90 transition-all mt-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar e continuar"}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
