import React, { useState, useEffect } from "react";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api";
import { getRuntimeApiMode } from "@/lib/api/apiMode";

export default function HomeHeader() {
  const [scrolled, setScrolled] = useState(false);
  const apiMode = getRuntimeApiMode();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const goToLogin = (next = "/dashboard") => {
    if (apiMode === "http") {
      window.location.href = `/login?next=${encodeURIComponent(next)}`;
      return;
    }
    authApi.redirectToLogin(next);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#04080f]/95 backdrop-blur-2xl border-b border-white/8 shadow-2xl shadow-black/40"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-space font-700 text-white text-xl tracking-tight">LumiCity</span>
            <div className="text-[10px] text-cyan-400/60 font-inter leading-none mt-0.5 tracking-widest uppercase">
              Sistema Público
            </div>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {[
            { label: "Início", id: "hero" },
            { label: "Como funciona", id: "como-funciona" },
            { label: "Benefícios", id: "beneficios" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => scrollTo(item.id)}
              className="px-4 py-2.5 text-sm font-inter text-white/50 hover:text-white hover:bg-white/6 rounded-xl transition-all duration-200"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => goToLogin("/dashboard")}
            className="hidden sm:block text-sm font-inter text-white/50 hover:text-white transition-colors"
          >
            Entrar
          </button>
          <Button
            onClick={() => goToLogin("/registrar-problema")}
            className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white border-0 rounded-xl px-5 h-10 text-sm font-inter font-500 hover:opacity-90 transition-all shadow-lg shadow-blue-600/30"
          >
            Registrar Problema
          </Button>
        </div>
      </div>
    </header>
  );
}
