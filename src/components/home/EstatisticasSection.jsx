import React from "react";
import { motion } from "framer-motion";
import { MapPin, CheckCircle, Users, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { reportsApi } from "@/lib/api";

export default function EstatisticasSection() {
  const { data: reportes = [] } = useQuery({
    queryKey: ["home-stats"],
    queryFn: () => reportsApi.listReports({ orderBy: "-created_date", limit: 500 }),
  });

  const total = reportes.length;
  const resolvidos = reportes.filter((r) => r.status === "Resolvido").length;
  const cidadaos = [...new Set(reportes.map((r) => r.usuario_id).filter(Boolean))].length;

  const stats = [
    { icon: MapPin, label: "Problemas Registrados", value: total || "—", suffix: total ? "+" : "", color: "text-blue-400", bg: "bg-blue-500/6", border: "border-blue-500/15" },
    { icon: CheckCircle, label: "Problemas Resolvidos", value: resolvidos || "—", suffix: resolvidos ? "+" : "", color: "text-emerald-400", bg: "bg-emerald-500/6", border: "border-emerald-500/15" },
    { icon: Users, label: "Cidadãos Participando", value: cidadaos || "—", suffix: cidadaos ? "+" : "", color: "text-cyan-400", bg: "bg-cyan-500/6", border: "border-cyan-500/15" },
    { icon: Clock, label: "Cidades Atendidas", value: "—", suffix: "", color: "text-purple-400", bg: "bg-purple-500/6", border: "border-purple-500/15" },
  ];

  return (
    <section className="py-28 relative" style={{ background: "linear-gradient(180deg, #06101e 0%, #04080f 100%)" }}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 text-white/30 text-xs font-inter font-500 uppercase tracking-[0.25em] mb-5">
            <span className="w-4 h-px bg-white/20" />
            Impacto
            <span className="w-4 h-px bg-white/20" />
          </span>
          <h2 className="font-space text-4xl sm:text-5xl font-700 text-white tracking-tight leading-tight">
            Números da plataforma
          </h2>
          <p className="text-white/40 text-lg font-inter mt-4 max-w-md mx-auto">
            Resultados reais de cidades que utilizam o LumiCity
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`${s.bg} border ${s.border} rounded-3xl p-7 text-center hover:scale-[1.03] transition-transform duration-300`}
            >
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <s.icon className={`w-6 h-6 ${s.color}`} />
              </div>
              <p className={`font-space text-4xl font-700 ${s.color} mb-1 leading-none`}>
                {s.value}{s.suffix}
              </p>
              <p className="text-white/35 text-xs font-inter mt-2 leading-relaxed">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
