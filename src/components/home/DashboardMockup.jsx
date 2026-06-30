import React from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, CheckCircle, Wrench, BarChart2, Activity } from "lucide-react";

const chamados = [
  { id: "A1F2", desc: "Poste apagado — Av. Brasil, 450", status: "Pendente", color: "text-yellow-400", dot: "bg-yellow-400" },
  { id: "B3E7", desc: "Lâmpada queimada — Rua das Flores", status: "Em Andamento", color: "text-blue-400", dot: "bg-blue-400" },
  { id: "C9D1", desc: "Luz piscando — Praça Central", status: "Resolvido", color: "text-emerald-400", dot: "bg-emerald-400" },
  { id: "D4K2", desc: "Poste danificado — Rua Palmeira", status: "Pendente", color: "text-yellow-400", dot: "bg-yellow-400" },
];

export default function DashboardMockup() {
  return (
    <div className="relative">
      <div className="absolute -inset-6 bg-gradient-to-br from-blue-500/6 to-cyan-500/4 rounded-[3rem] blur-3xl" />
      <div className="relative bg-white/[0.035] backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/8 bg-white/[0.02]">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-400/50" />
            <div className="w-3 h-3 rounded-full bg-emerald-400/50" />
          </div>
          <div className="flex-1 mx-4 h-6 bg-white/5 rounded-lg flex items-center px-3 border border-white/5">
            <span className="text-white/20 text-[10px] font-inter">lumicity.gov.br/dashboard</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <Activity className="w-3.5 h-3.5 text-cyan-400/50" />
          </div>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { icon: MapPin, label: "Total", val: "—", color: "text-white/70", bg: "bg-white/5", border: "border-white/8" },
              { icon: Clock, label: "Pendentes", val: "—", color: "text-yellow-400", bg: "bg-yellow-500/8", border: "border-yellow-500/15" },
              { icon: CheckCircle, label: "Resolvidos", val: "—", color: "text-emerald-400", bg: "bg-emerald-500/8", border: "border-emerald-500/15" },
            ].map((k, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className={`${k.bg} rounded-2xl p-3.5 border ${k.border}`}
              >
                <k.icon className={`w-3.5 h-3.5 ${k.color} mb-2 opacity-60`} />
                <p className={`font-space text-2xl font-700 ${k.color} leading-none`}>{k.val}</p>
                <p className="text-white/25 text-[10px] font-inter mt-1">{k.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="bg-white/[0.025] rounded-2xl p-4 mb-4 border border-white/6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/35 text-xs font-inter">Últimos 7 dias</span>
              <BarChart2 className="w-3.5 h-3.5 text-white/15" />
            </div>
            <div className="flex items-end gap-1.5 h-16">
              {[30, 55, 40, 70, 45, 85, 60].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.6 + i * 0.07, duration: 0.45 }}
                  style={{ height: `${h}%`, transformOrigin: "bottom" }}
                  className="flex-1 rounded-t-md bg-gradient-to-t from-blue-600/60 to-cyan-400/40"
                />
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            {chamados.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.75 + i * 0.08 }}
                className="flex items-center gap-3 bg-white/[0.025] rounded-xl px-3.5 py-2.5 border border-white/5"
              >
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
                <p className="text-white/55 text-xs font-inter flex-1 truncate">{c.desc}</p>
                <span className={`text-[10px] font-inter font-500 ${c.color} flex-shrink-0`}>{c.status}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 1.2, duration: 0.4 }}
        className="absolute -bottom-5 -right-5 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl px-4 py-2.5 shadow-[0_8px_24px_rgba(59,130,246,0.45)]"
      >
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-white" />
          <span className="text-white text-xs font-inter font-600">Sistema ativo</span>
        </div>
      </motion.div>
    </div>
  );
}