import React from "react";
import { motion } from "framer-motion";
import { Monitor, Map, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api";

const pins = [
  { top: "30%", left: "25%", color: "bg-yellow-400", pulse: true },
  { top: "55%", left: "60%", color: "bg-blue-400", pulse: false },
  { top: "20%", left: "65%", color: "bg-emerald-400", pulse: false },
  { top: "70%", left: "35%", color: "bg-yellow-400", pulse: true },
  { top: "45%", left: "45%", color: "bg-red-400", pulse: false },
];

const features = [
  "Dashboard em tempo real com KPIs",
  "Mapa interativo de chamados",
  "Relatórios automatizados com IA",
  "Gestão de equipes e operadores",
];

function MapMockup() {
  return (
    <div className="relative bg-[#080e1e] rounded-2xl overflow-hidden border border-white/8 h-56 shadow-xl">
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(99,150,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(99,150,255,0.15) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      {pins.map((p, i) => (
        <div key={i} className="absolute" style={{ top: p.top, left: p.left }}>
          {p.pulse && (
            <div className={`absolute w-7 h-7 ${p.color} rounded-full opacity-15 animate-ping -top-1.5 -left-1.5`} />
          )}
          <div className={`w-4 h-4 ${p.color} rounded-full border-2 border-white/40 shadow-lg`} />
        </div>
      ))}
      <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-md rounded-lg px-3 py-1.5 border border-white/10">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          <p className="text-white/60 text-[10px] font-inter">Chamados em tempo real</p>
        </div>
      </div>
    </div>
  );
}

function DashPanel() {
  return (
    <div className="bg-white/[0.025] border border-white/8 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <span className="text-white/50 text-xs font-inter font-500">Visão Geral</span>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-emerald-400/70 text-[10px] font-inter">Ao vivo</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        {[
          { label: "Abertos", val: "—", c: "text-yellow-400" },
          { label: "Resolvidos", val: "—", c: "text-emerald-400" },
          { label: "Tempo médio", val: "—", c: "text-blue-400" },
        ].map((k, i) => (
          <div key={i} className="bg-white/4 rounded-xl p-3 text-center border border-white/5">
            <p className={`font-space text-lg font-700 ${k.c}`}>{k.val}</p>
            <p className="text-white/25 text-[10px] font-inter mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>
      <div className="flex items-end gap-1.5 h-12">
        {[40, 65, 50, 80, 55, 90, 70].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm bg-gradient-to-t from-blue-600/60 to-cyan-400/30"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export default function SistemaPreviewSection() {
  const apiMode = import.meta.env.VITE_API_MODE || "base44";
  const goToSystem = () => {
    if (apiMode === "http") {
      window.location.href = "/login?next=/dashboard";
      return;
    }
    authApi.redirectToLogin("/redirect");
  };

  return (
    <section className="py-32 relative overflow-hidden" style={{ background: "#04080f" }}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
      <div className="absolute top-1/2 -translate-y-1/2 left-0 w-[500px] h-[500px] bg-cyan-500/4 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid lg:grid-cols-2 gap-16 xl:gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 bg-cyan-500/15 rounded-lg flex items-center justify-center">
                <Monitor className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <span className="text-white/30 text-xs font-inter uppercase tracking-wider">Dashboard</span>
            </div>
            <DashPanel />
            <div className="flex items-center gap-2 mt-5 mb-1">
              <div className="w-6 h-6 bg-cyan-500/15 rounded-lg flex items-center justify-center">
                <Map className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <span className="text-white/30 text-xs font-inter uppercase tracking-wider">Mapa de chamados</span>
            </div>
            <MapMockup />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.7 }}
          >
            <span className="inline-flex items-center gap-2 text-blue-400 text-xs font-inter font-500 uppercase tracking-[0.25em] mb-7 bg-blue-500/8 border border-blue-500/20 rounded-full px-5 py-2">
              <span className="w-1 h-1 bg-blue-400 rounded-full" />
              Sistema
            </span>
            <h2 className="font-space text-4xl sm:text-5xl font-700 text-white mb-6 leading-tight tracking-tight">
              Visualize e gerencie{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                em tempo real
              </span>
            </h2>
            <p className="text-white/45 text-base font-inter leading-relaxed mb-8">
              Dashboard completo com mapa interativo, histórico de chamados, indicadores de desempenho e relatórios automatizados para a gestão municipal.
            </p>
            <div className="space-y-3 mb-10">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-emerald-500/15 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                  </div>
                  <span className="text-white/55 text-sm font-inter">{f}</span>
                </div>
              ))}
            </div>
            <Button
              onClick={goToSystem}
              className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white border-0 h-14 px-10 rounded-2xl font-inter font-600 text-base hover:opacity-90 hover:scale-[1.02] transition-all shadow-[0_8px_32px_rgba(59,130,246,0.3)] group"
            >
              Acessar o Sistema
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
