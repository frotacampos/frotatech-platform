import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2, Lock, Mail, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/AuthContext";

export default function PlatformLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("admin@frotatech.demo");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      const next = new URLSearchParams(location.search).get("next");
      navigate(next || (user?.role === "admin" ? "/admin-dashboard" : "/dashboard"), { replace: true });
    } catch (err) {
      console.error("HTTP login failed:", err);
      setError("E-mail ou senha invalidos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-lumicity-dark flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl gradient-lumicity flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-space text-xl font-700 text-white">LumiCity</h1>
            <p className="text-white/40 text-xs font-inter">Acesso FrotaTech Platform</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-white/70 text-sm">E-mail</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="bg-white border-white/20 text-slate-950 placeholder:text-slate-400 rounded-xl pl-9"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-white/70 text-sm">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="bg-white border-white/20 text-slate-950 placeholder:text-slate-400 rounded-xl pl-9"
                autoComplete="current-password"
                required
              />
            </div>
          </div>
        </div>

        {error && <p className="text-red-300 text-xs font-inter mt-4">{error}</p>}

        <Button disabled={loading} className="w-full gradient-lumicity text-white border-0 rounded-xl h-11 mt-6">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Entrar"}
        </Button>
      </form>
    </div>
  );
}
