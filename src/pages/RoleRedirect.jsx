import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppAuth } from "@/hooks/useAuth";
import { Zap } from "lucide-react";

/**
 * Página intermediária que redireciona o usuário para a área correta
 * baseado no seu role após o login.
 */
export default function RoleRedirect() {
  const { user, role, loading } = useAppAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/"); return; }

    if (role === "admin") {
      navigate("/admin-dashboard", { replace: true });
    } else if (role === "operador") {
      navigate("/chamados", { replace: true });
    } else {
      // cidadao — verificar se tem perfil completo
      navigate("/dashboard", { replace: true });
    }
  }, [loading, user, role]);

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-xl gradient-lumicity flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    </div>
  );
}