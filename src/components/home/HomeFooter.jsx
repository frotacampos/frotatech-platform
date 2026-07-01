import React from "react";
import { Zap, Mail, Phone, ArrowRight } from "lucide-react";
import { authApi } from "@/lib/api";
import { getRuntimeApiMode } from "@/lib/api/apiMode";

export default function HomeFooter() {
  const apiMode = getRuntimeApiMode();
  const navigateAccess = (path) => {
    if (apiMode === "http") {
      const next = path === "/redirect" ? "/dashboard" : path;
      window.location.href = `/login?next=${encodeURIComponent(next)}`;
      return;
    }
    authApi.redirectToLogin(path);
  };

  return (
    <footer className="relative" style={{ background: "#02050c" }}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-16 pb-10">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-space font-700 text-white text-lg tracking-tight">LumiCity</span>
                <div className="text-[10px] text-cyan-400/50 font-inter leading-none mt-0.5 tracking-widest uppercase">
                  Sistema Público
                </div>
              </div>
            </div>
            <p className="text-white/30 text-sm font-inter leading-relaxed max-w-xs">
              Plataforma digital de gestão de iluminação pública, aproximando cidadão e prefeitura para cidades mais seguras e eficientes.
            </p>
          </div>

          <div>
            <p className="text-white/40 text-xs font-inter font-600 uppercase tracking-[0.2em] mb-5">Acesso</p>
            <div className="space-y-3">
              {[
                { label: "Registrar Problema", path: "/registrar-problema" },
                { label: "Acessar o Sistema", path: "/redirect" },
                { label: "Painel do Operador", path: "/chamados" },
              ].map((l) => (
                <button
                  key={l.label}
                  onClick={() => navigateAccess(l.path)}
                  className="flex items-center gap-2 text-white/30 hover:text-white/70 text-sm font-inter transition-colors group"
                >
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-white/40 text-xs font-inter font-600 uppercase tracking-[0.2em] mb-5">Contato</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-white/30">
                <div className="w-8 h-8 bg-white/4 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <a href="mailto:frotacampos40@gmail.com" className="text-sm font-inter hover:text-white/60 transition-colors">frotacampos40@gmail.com</a>
              </div>
              <div className="flex items-center gap-3 text-white/30">
                <div className="w-8 h-8 bg-white/4 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <a href="tel:+5592992266602" className="text-sm font-inter hover:text-white/60 transition-colors">(92) 99226-6602</a>
              </div>
              <div className="mt-3 pt-3 border-t border-white/5">
                <p className="text-white/20 text-xs font-inter">FROTATECH · CNPJ 62.250.344/0001-06</p>
                <p className="text-white/15 text-xs font-inter mt-0.5">Rio Preto da Eva — AM</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/6 pt-7 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/15 text-xs font-inter">© 2026 LumiCity — Todos os direitos reservados</p>
          <p className="text-white/10 text-xs font-inter">Sistema de Gestão de Iluminação Pública Municipal</p>
        </div>
      </div>
    </footer>
  );
}
