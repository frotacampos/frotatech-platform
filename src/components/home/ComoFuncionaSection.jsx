import React from "react";
import { motion } from "framer-motion";
import { Smartphone, Cpu, Users } from "lucide-react";

const steps = [
  {
    icon: Smartphone,
    step: "01",
    title: "Cidadão registra o problema",
    desc: "Via aplicativo ou navegador, o cidadão fotografa e descreve o problema de iluminação. A localização é capturada automaticamente.",
    gradFrom: "from-blue-600/15",
    border: "border-blue-500/20 hover:border-blue-500/40",
    iconBg: "bg-blue-500/15 group-hover:bg-blue-500/25",
    iconColor: "text-blue-400",
    stepColor: "text-blue-500/10",
  },
  {
    icon: Cpu,
    step: "02",
    title: "Sistema organiza automaticamente",
    desc: "A plataforma categoriza, prioriza e distribui o chamado para a equipe responsável, com alertas em tempo real.",
    gradFrom: "from-cyan-600/15",
    border: "border-cyan-500/20 hover:border-cyan-500/40",
    iconBg: "bg-cyan-500/15 group-hover:bg-cyan-500/25",
    iconColor: "text-cyan-400",
    stepColor: "text-cyan-500/10",
  },
  {
    icon: Users,
    step: "03",
    title: "Equipe resolve com acompanhamento",
    desc: "Os operadores atualizam o status do chamado. O cidadão acompanha a resolução em tempo real até a conclusão.",
    gradFrom: "from-emerald-600/15",
    border: "border-emerald-500/20 hover:border-emerald-500/40",
    iconBg: "bg-emerald-500/15 group-hover:bg-emerald-500/25",
    iconColor: "text-emerald-400",
    stepColor: "text-emerald-500/10",
  },
];

export default function ComoFuncionaSection() {
  return (
    <section id="como-funciona" className="py-32 relative" style={{ background: "#04080f" }}>
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(148,189,255,0.9) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center gap-2 text-cyan-400 text-xs font-inter font-500 uppercase tracking-[0.25em] mb-5 bg-cyan-500/8 border border-cyan-500/20 rounded-full px-5 py-2">
            <span className="w-1 h-1 bg-cyan-400 rounded-full" />
            Processo
          </span>
          <h2 className="font-space text-4xl sm:text-5xl font-700 text-white mb-5 tracking-tight leading-tight">
            Como funciona
          </h2>
          <p className="text-white/45 text-lg font-inter max-w-xl mx-auto leading-relaxed">
            Três etapas simples para transformar um problema em solução
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              className={`relative bg-gradient-to-b ${s.gradFrom} to-transparent bg-white/[0.02] border ${s.border} rounded-3xl p-8 group hover:scale-[1.02] transition-all duration-300 cursor-default`}
            >
              <div className={`absolute top-5 right-6 text-7xl font-space font-700 ${s.stepColor} select-none leading-none`}>
                {s.step}
              </div>
              <div className={`w-14 h-14 ${s.iconBg} rounded-2xl flex items-center justify-center mb-6 transition-all duration-300`}>
                <s.icon className={`w-7 h-7 ${s.iconColor}`} />
              </div>
              <h3 className="font-space font-600 text-white text-xl mb-4 leading-snug pr-8">{s.title}</h3>
              <p className="text-white/45 text-sm font-inter leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}