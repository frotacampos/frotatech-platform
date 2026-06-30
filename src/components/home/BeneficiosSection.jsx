import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Zap, BarChart3, ArrowRight } from "lucide-react";
import { authApi } from "@/lib/api";

const beneficios = [
  {
    icon: ShieldCheck,
    title: "Mais segurança nas ruas",
    desc: "Ruas bem iluminadas reduzem riscos, acidentes e insegurança. Cada chamado resolvido é uma contribuição direta para a qualidade de vida da cidade.",
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/12",
    border: "border-blue-500/15 hover:border-blue-500/35",
    tag: "Segurança",
    tagColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  {
    icon: Zap,
    title: "Resolução mais rápida",
    desc: "Chamados organizados automaticamente e equipes acionadas em tempo real resultam em tempos de resposta muito menores.",
    iconColor: "text-cyan-400",
    iconBg: "bg-cyan-500/12",
    border: "border-cyan-500/15 hover:border-cyan-500/35",
    tag: "Eficiência",
    tagColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  },
  {
    icon: BarChart3,
    title: "Gestão inteligente para a prefeitura",
    desc: "Dashboard completo com indicadores, mapas de calor e relatórios automáticos para tomada de decisões estratégicas e planejamento urbano.",
    iconColor: "text-purple-400",
    iconBg: "bg-purple-500/12",
    border: "border-purple-500/15 hover:border-purple-500/35",
    tag: "Gestão",
    tagColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  },
];

export default function BeneficiosSection() {
  const apiMode = import.meta.env.VITE_API_MODE || "base44";
  const goToSystem = () => {
    if (apiMode === "http") {
      window.location.href = "/login?next=/dashboard";
      return;
    }
    authApi.redirectToLogin("/redirect");
  };

  return (
    <section
      id="beneficios"
      className="py-32 relative"
      style={{ background: "linear-gradient(180deg, #04080f 0%, #06101e 100%)" }}
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center gap-2 text-purple-400 text-xs font-inter font-500 uppercase tracking-[0.25em] mb-5 bg-purple-500/8 border border-purple-500/20 rounded-full px-5 py-2">
            <span className="w-1 h-1 bg-purple-400 rounded-full" />
            Benefícios
          </span>
          <h2 className="font-space text-4xl sm:text-5xl font-700 text-white mb-5 tracking-tight leading-tight">
            Por que usar o LumiCity
          </h2>
          <p className="text-white/45 text-lg font-inter max-w-xl mx-auto leading-relaxed">
            Uma plataforma completa para cidadãos, operadores e gestores públicos
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {beneficios.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.13, duration: 0.6 }}
              className={`relative bg-white/[0.025] border ${b.border} rounded-3xl p-8 group hover:scale-[1.02] transition-all duration-300 cursor-default backdrop-blur-sm`}
            >
              <span className={`inline-flex items-center text-[10px] font-inter font-500 uppercase tracking-widest border rounded-full px-3 py-1 mb-6 ${b.tagColor}`}>
                {b.tag}
              </span>
              <div className={`w-14 h-14 ${b.iconBg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <b.icon className={`w-7 h-7 ${b.iconColor}`} />
              </div>
              <h3 className="font-space font-600 text-white text-xl mb-4 leading-snug">{b.title}</h3>
              <p className="text-white/45 text-sm font-inter leading-relaxed mb-6">{b.desc}</p>
              <button
                onClick={goToSystem}
                className={`flex items-center gap-1.5 text-xs font-inter font-500 ${b.iconColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              >
                Saiba mais <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
