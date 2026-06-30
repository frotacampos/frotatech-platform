import React from "react";
import HomeHeader from "@/components/home/HomeHeader";
import HeroSection from "@/components/home/HeroSection";
import ComoFuncionaSection from "@/components/home/ComoFuncionaSection";
import BeneficiosSection from "@/components/home/BeneficiosSection";
import SistemaPreviewSection from "@/components/home/SistemaPreviewSection";
import EstatisticasSection from "@/components/home/EstatisticasSection";
import HomeFooter from "@/components/home/HomeFooter";
import ChatbotWidget from "@/components/ai/ChatbotWidget";

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: "#04080f" }}>
      <HomeHeader />
      <HeroSection />
      <ComoFuncionaSection />
      <BeneficiosSection />
      <SistemaPreviewSection />
      <EstatisticasSection />
      <HomeFooter />
      <ChatbotWidget />
    </div>
  );
}