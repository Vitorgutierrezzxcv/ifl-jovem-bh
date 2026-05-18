import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, Building2, ShieldCheck, Calendar,
  CheckSquare, BookOpen, Library, Star, Trophy, DollarSign,
  Megaphone, FileText, BarChart2, Shield, Settings, ChevronLeft, ChevronRight, UsersRound, ClipboardList
} from "lucide-react";
import IFLLogo from "./IFLLogo";

const navItems = [
  { path: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/admin/associados", icon: Users, label: "Associados" },
  { path: "/admin/diretorias", icon: Building2, label: "Diretorias" },
  { path: "/admin/cargos", icon: ShieldCheck, label: "Cargos" },
  { path: "/admin/eventos", icon: Calendar, label: "Eventos" },
  { path: "/admin/presenca", icon: CheckSquare, label: "Presença" },
  { path: "/admin/tarefas", icon: ClipboardList, label: "Tarefas" },
  { path: "/admin/clube-livro", icon: BookOpen, label: "Clube do Livro" },
  { path: "/admin/rol", icon: Library, label: "ROL Literário" },
  { path: "/admin/pontuacao", icon: Star, label: "Pontuação" },
  { path: "/admin/ranking", icon: Trophy, label: "Ranking" },
  { path: "/admin/financeiro", icon: DollarSign, label: "Financeiro" },
  { path: "/admin/colaboracoes", icon: UsersRound, label: "Colaborações" },
  { path: "/admin/oportunidades", icon: Star, label: "Oportunidades" },
  { path: "/admin/avisos", icon: Megaphone, label: "Avisos" },
  { path: "/admin/documentos", icon: FileText, label: "Documentos" },
  { path: "/admin/relatorios", icon: BarChart2, label: "Relatórios" },
  { path: "/admin/auditoria", icon: Shield, label: "Auditoria" },
  { path: "/admin/configuracoes", icon: Settings, label: "Configurações" },
];

export default function AdminSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 z-40 flex flex-col transition-all duration-300"
      style={{
        width: collapsed ? 64 : 240,
        background: "#071D33",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
        {!collapsed && <IFLLogo size={32} showText={true} />}
        {collapsed && <IFLLogo size={32} />}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors ml-auto"
          style={{ color: "#B8872A" }}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-3 scrollbar-hide">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 mx-2 mb-0.5 px-3 py-2.5 rounded-xl transition-all duration-200"
              style={{
                background: active ? "rgba(184,135,42,0.15)" : "transparent",
                borderLeft: active ? "3px solid #B8872A" : "3px solid transparent",
                color: active ? "#D4A043" : "rgba(255,255,255,0.65)",
              }}
            >
              <item.icon size={18} strokeWidth={active ? 2 : 1.5} />
              {!collapsed && (
                <span className="font-inter text-sm font-medium truncate">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}