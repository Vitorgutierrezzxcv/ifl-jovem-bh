import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  LayoutDashboard, Users, Calendar, CheckSquare, DollarSign,
  Star, Bell, Target, MessageSquare, LogOut, Menu, X, ChevronRight
} from "lucide-react";

const navItems = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "members", label: "Associados", icon: Users },
  { key: "events", label: "Eventos", icon: Calendar },
  { key: "tasks", label: "Tarefas", icon: CheckSquare },
  { key: "points", label: "Pontos", icon: Star },
  { key: "financial", label: "Financeiro", icon: DollarSign },
  { key: "opportunities", label: "Oportunidades", icon: Target },
  { key: "demands", label: "Demandas", icon: MessageSquare },
  { key: "announcements", label: "Avisos", icon: Bell },
];

export default function AdminSidebar({ active, onNavigate, user, member, isAdmin, memberRole }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const roleLabel = {
    presidente: "Presidente",
    vice_presidente: "Vice-Presidente",
    diretor: "Diretor",
    gerente: "Gerente",
  }[memberRole] || (isAdmin ? "Admin Master" : "");

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #B8872A, #D4A043)" }}>
            <span className="font-montserrat font-black text-sm text-white">IFL</span>
          </div>
          <div>
            <p className="font-montserrat font-black text-sm text-white leading-none">Central IFL</p>
            <p className="font-inter text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>Painel Administrativo</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-5 py-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(184,135,42,0.2)" }}>
            <span className="font-montserrat font-bold text-xs" style={{ color: "#D4A043" }}>
              {user?.full_name?.charAt(0) || "A"}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-inter text-xs font-semibold text-white truncate">{user?.full_name}</p>
            <p className="font-inter text-[10px] truncate" style={{ color: "rgba(255,255,255,0.45)" }}>{roleLabel}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="font-inter text-[10px] font-semibold uppercase tracking-wider px-3 mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>Menu</p>
        <div className="flex flex-col gap-0.5">
          {navItems.map(item => {
            const isActive = active === item.key;
            return (
              <button
                key={item.key}
                onClick={() => { onNavigate(item.key); setMobileOpen(false); }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all w-full"
                style={{
                  background: isActive ? "rgba(184,135,42,0.18)" : "transparent",
                  border: isActive ? "1px solid rgba(184,135,42,0.3)" : "1px solid transparent",
                }}
              >
                <item.icon size={16} style={{ color: isActive ? "#D4A043" : "rgba(255,255,255,0.5)", flexShrink: 0 }} strokeWidth={1.8} />
                <span className="font-inter text-sm" style={{ color: isActive ? "#D4A043" : "rgba(255,255,255,0.75)" }}>{item.label}</span>
                {isActive && <ChevronRight size={14} style={{ color: "#D4A043", marginLeft: "auto" }} />}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={() => base44.auth.logout("/")}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full"
          style={{ background: "rgba(180,35,24,0.1)" }}
        >
          <LogOut size={16} style={{ color: "#F87171" }} />
          <span className="font-inter text-sm" style={{ color: "#F87171" }}>Sair</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 h-screen" style={{ background: "#071D33" }}>
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3"
        style={{ background: "#071D33", paddingTop: "calc(env(safe-area-inset-top) + 12px)" }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #B8872A, #D4A043)" }}>
            <span className="font-montserrat font-black text-xs text-white">IFL</span>
          </div>
          <span className="font-montserrat font-bold text-sm text-white">Admin</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.1)" }}>
          {mobileOpen ? <X size={18} className="text-white" /> : <Menu size={18} className="text-white" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 flex flex-col" style={{ background: "#071D33" }}>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}