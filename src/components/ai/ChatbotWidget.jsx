import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, MessageCircle, Send, X, Zap } from "lucide-react";
import { aiApi } from "@/lib/api";

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [historico, loading]);

  const handleEnviar = async () => {
    if (!mensagem.trim() || loading) return;
    const msg = mensagem.trim();
    setMensagem("");
    const novoHistorico = [...historico, { role: "user", content: msg }];
    setHistorico(novoHistorico);
    setLoading(true);

    try {
      const data = await aiApi.chatbotMessage({
        mensagem: msg,
        historico: historico.slice(-6),
      });
      const resposta = data?.resposta || "Desculpe, nao consegui processar sua mensagem.";
      setHistorico([...novoHistorico, { role: "assistant", content: resposta }]);
    } catch (error) {
      setHistorico([
        ...novoHistorico,
        {
          role: "assistant",
          content:
            "Nao consegui acessar o assistente agora. Voce pode registrar um problema pelo botao Registrar Problema e acompanhar pelo painel do cidadao.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full gradient-lumicity flex items-center justify-center shadow-lg shadow-lumicity-blue/40 hover:scale-110 transition-transform"
          >
            <MessageCircle className="w-6 h-6 text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 bg-lumicity-dark border border-white/15 rounded-2xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden"
            style={{ maxHeight: "480px" }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 gradient-lumicity">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-white" />
                <span className="font-space font-600 text-white text-sm">LumiCity IA</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: "280px", maxHeight: "320px" }}>
              {historico.length === 0 && (
                <div className="text-center py-6">
                  <Zap className="w-8 h-8 text-lumicity-cyan mx-auto mb-2 opacity-50" />
                  <p className="text-white/40 text-sm font-inter">Ola! Como posso ajudar voce hoje?</p>
                  <p className="text-white/25 text-xs mt-1 font-inter">Tire duvidas sobre como reportar problemas de iluminacao.</p>
                </div>
              )}
              {historico.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-xl text-sm font-inter leading-relaxed ${
                      m.role === "user" ? "gradient-lumicity text-white" : "bg-white/8 text-white/80 border border-white/10"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/8 border border-white/10 rounded-xl px-3 py-2">
                    <Loader2 className="w-4 h-4 text-lumicity-cyan animate-spin" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="px-3 py-3 border-t border-white/10 flex items-center gap-2">
              <input
                type="text"
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEnviar()}
                placeholder="Digite sua duvida..."
                className="flex-1 bg-[#0b1220] border border-white/15 rounded-xl px-3 py-2 text-white text-sm placeholder:text-white/35 focus:outline-none focus:border-lumicity-cyan font-inter"
              />
              <button
                onClick={handleEnviar}
                disabled={!mensagem.trim() || loading}
                className="w-9 h-9 gradient-lumicity rounded-xl flex items-center justify-center disabled:opacity-40 hover:opacity-90 transition-all flex-shrink-0"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
