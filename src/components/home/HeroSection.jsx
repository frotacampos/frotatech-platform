import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Zap, Star, UserPlus, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import DashboardMockup from "@/components/home/DashboardMockup";

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="min-h-screen flex items-center relative overflow-hidden pt-20"
      style={{ background: "linear-gradient(145deg, #04080f 0%, #080e20 35%, #0a1428 60%, #050c18 100%)" }}
    >
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(99,179,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(99,179,255,0.6) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
      <div className="absolute top-1/4 -left-32 w-[600px] h-[600px] bg-blue-600/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-500/6 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-20 lg:py-28 relative z-10 w-full">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col"
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 self-start bg-gradient-to-r from-blue-500/15 to-cyan-500/10 border border-blue-400/25 rounded-full px-5 py-2 mb-8 backdrop-blur-sm"
            >
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-cyan-300 text-xs font-inter font-500 tracking-wide">
                Plataforma de Gestão Pública Inteligente
              </span>
            </motion.div>

            <h1 className="font-space font-700 leading-[1.08] tracking-tight mb-6">
              <span className="block text-white text-5xl sm:text-6xl lg:text-[4rem] xl:text-[4.5rem]">
                Gestão Inteligente
              </span>
              <span className="block text-5xl sm:text-6xl lg:text-[4rem] xl:text-[4.5rem] text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-300">
                de Iluminação
              </span>
              <span className="block text-white text-5xl sm:text-6xl lg:text-[4rem] xl:text-[4.5rem]">
                Pública
              </span>
            </h1>

            <p className="text-white/60 text-lg sm:text-xl font-inter leading-relaxed mb-10 max-w-lg">
              A população identifica problemas e a prefeitura resolve com eficiência, transparência e controle total.
            </p>

            <div className="flex flex-col gap-3 mb-10">
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/cidadao-login" className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white border-0 h-14 px-8 rounded-2xl font-inter font-600 text-base hover:opacity-90 hover:scale-[1.02] transition-all shadow-[0_8px_32px_rgba(59,130,246,0.35)] group">
                    <LogIn className="w-4 h-4 mr-2" />
                    Entrar como Cidadão
                  </Button>
                </Link>
                <Link to="/cidadao-cadastro" className="flex-1">
                  <Button variant="outline" className="w-full border-lumicity-cyan/40 bg-lumicity-cyan/10 text-lumicity-cyan hover:bg-lumicity-cyan/20 h-14 px-8 rounded-2xl font-inter text-base transition-all">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Criar Conta
                  </Button>
                </Link>
              </div>
              <Link to="/acesso-operador">
                <Button
                  variant="ghost"
                  className="text-white/30 hover:text-white/60 text-sm font-inter h-9 transition-all"
                >
                  Sou operador/admin → Acessar Sistema
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                ))}
                <span className="text-white/35 text-xs font-inter ml-1">5.0</span>
              </div>
              <div className="h-3 w-px bg-white/10" />
              <p className="text-white/30 text-sm font-inter flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-cyan-500/60" />
                Simples, rápido e transparente
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
            className="hidden lg:block"
          >
            <DashboardMockup />
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#04080f] to-transparent pointer-events-none" />
    </section>
  );
}
