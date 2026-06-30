import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Zap, Menu, X, LayoutDashboard, Wrench, Map, UserCog, LogOut, Package, FileText, Settings2, BookOpen } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

export default function MobileHeader({ user, role, title }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { logout } = useAuth();
  const isActive = (path) => location.pathname === path;

  const handleLogout = () => logout();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: role === "admin" ? "/admin-dashboard" : "/dashboard", roles: ["cidadao", "operador", "admin"] },
    { icon: Wrench, label: "Chamados", href: "/chamados", roles: ["operador", "admin"] },
    { icon: Map, label: "Mapa", href: "/mapa", roles: ["operador", "admin"] },
    { icon: Package, label: "Almoxarifado", href: "/almoxarifado", roles: ["operador", "admin"] },
    { icon: FileText, label: "Relatórios", href: "/relatorios", roles: ["operador", "admin"] },
    { icon: UserCog, label: "Usuários", href: "/usuarios", roles: ["admin"] },
    { icon: Settings2, label: "Configurações", href: "/configuracao-empresa", roles: ["admin"] },
    { icon: BookOpen, label: "Documentação", href: "/documentacao", roles: ["operador", "admin"] },
  ].filter(item => item.roles.includes(role || "cidadao"));

  return (
    <>
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-lumicity-dark/90 backdrop-blur-xl border-b border-white/10 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg gradient-lumicity flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-space font-700 text-white">{title || "LumiCity"}</span>
        </div>
        <button onClick={() => setOpen(true)} className="text-white/50 hover:text-white transition-colors">
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-lumicity-dark border-r border-white/10 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg gradient-lumicity flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-space font-700 text-white">LumiCity</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-1">
              {navItems.map(item => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-inter transition-all ${
                    isActive(item.href)
                      ? "bg-primary/20 text-white border border-primary/30"
                      : "text-white/40 hover:text-white/70 hover:bg-white/5"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="border-t border-white/10 pt-4">
              <p className="text-white/60 text-sm font-inter mb-1">{user?.full_name}</p>
              <p className="text-white/30 text-xs capitalize mb-3">{role}</p>
              <button onClick={handleLogout} className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm font-inter">
                <LogOut className="w-4 h-4" />Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
