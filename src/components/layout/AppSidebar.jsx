import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Zap, LayoutDashboard, Map, Users, LogOut, Wrench, UserCog, Package, FileText, Settings2, BookOpen } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

export default function AppSidebar({ user, role }) {
  const location = useLocation();
  const { logout } = useAuth();
  const isActive = (path) => location.pathname === path;

  const handleLogout = () => logout();
  const userName = user?.full_name || "Usuário";

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
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-white/5 border-r border-white/10 flex-col p-6 z-40">
      <div className="flex items-center gap-2 mb-10">
        <div className="w-8 h-8 rounded-lg gradient-lumicity flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="font-space font-700 text-white text-lg">LumiCity</span>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map(item => (
          <Link
            key={item.href}
            to={item.href}
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
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full gradient-lumicity flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-space font-600">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-inter font-500 truncate">{userName}</p>
            <p className="text-white/40 text-xs capitalize">{role || "cidadao"}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm font-inter transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}
