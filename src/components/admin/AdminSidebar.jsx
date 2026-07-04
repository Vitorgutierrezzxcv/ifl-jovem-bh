import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  LayoutDashboard, Users, Calendar, CheckSquare, DollarSign,
  Star, Bell, Target, MessageSquare, LogOut, Menu, X, ChevronRight,
  Shield, ArrowLeft, Lock, BookOpen, GraduationCap, Inbox, Zap, Handshake, FileText, Library,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const navItems = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, desc: "Visão geral" },
  { key: "members", label: "Associados", icon: Users, desc: "Gestão de membros" },
  { key: "events", label: "Eventos", icon: Calendar, desc: "Agenda e presenças" },
  { key: "tasks", label: "Tarefas", icon: CheckSquare, desc: "Correção de entregas" },
  { key: "points", label: "Pontos", icon: Star, desc: "Lançamentos e aprovações" },
  { key: "financial", label: "Financeiro", icon: DollarSign, desc: "Cobranças e pagamentos" },
  { key: "opportunities", label: "Oportunidades", icon: Target, desc: "Vagas e eventos" },
  { key: "demands", label: "Demandas", icon: MessageSquare, desc: "Solicitações de membros" },
  { key: "announcements", label: "Avisos", icon: Bell, desc: "Comunicados" },
  { key: "access", label: "Níveis de Acesso", icon: Shield, desc: "Cargos e permissões" },
  { key: "library", label: "Biblioteca", icon: BookOpen, desc: "Materiais por diretoria" },
  { key: "formacao", label: "Central de Formação", icon: GraduationCap, desc: "Dashboard operacional" },
  { key: "queue", label: "Fila de Pontuação", icon: Inbox, desc: "Lançamentos das diretorias" },
  { key: "extraordinary", label: "Eventos Extraordinários", icon: Zap, desc: "Inscrições e seleção" },
  { key: "sponsors", label: "Patrocinadores", icon: Handshake, desc: "Cotas e pagamentos" },
  { key: "board", label: "Docs. da Diretoria", icon: FileText, desc: "Área restrita" },
  { key: "rol", label: "Artigos do ROL", icon: Library, desc: "Aprovação de artigos" },
];

const roleLabel = {
  presidente: "Presidente",
  vice_presidente: "Vice-Presidente",
  diretor: "Diretor",
  gerente: "Gerente",
};

export default function AdminSidebar({ active, onNavigate, user, member, isAdmin, memberRole }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const role = roleLabel[memberRole] || (isAdmin ? "Admin Master" : "Equipe");
  const initial = user?.full_name?.charAt(0) || "A";

  function NavContent({ onItemClick }) {
    return (
      <div className="flex flex-col h-full select-none">
        {/* Brand */}
        <div className="px-5 pt-6 pb-5 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #B8872A 0%, #D4A043 100%)" }}>
              <span className="font-montserrat font-black text-sm text-white">IFL</span>
            </div>
            <div>
              <p className="font-montserrat font-black text-[13px] text-white leading-tight">Central IFL</p>
              <p className="font-inter text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>Painel Administrativo</p>
            </div>
          </div>
        </div>

        {/* User card */}
        <div className="mx-3 mt-4 mb-2 rounded-xl p-3" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, rgba(184,135,42,0.3), rgba(212,160,67,0.4))", border: "1.5px solid rgba(184,135,42,0.4)" }}>
              <span className="font-montserrat font-bold text-sm" style={{ color: "#D4A043" }}>{initial}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-inter text-[13px] font-semibold text-white truncate leading-tight">{user?.full_name || "—"}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Shield size={9} style={{ color: "#D4A043" }} />
                <p className="font-inter text-[10px]" style={{ color: "#D4A043" }}>{role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto space-y-0.5">
          <p className="font-inter text-[9px] font-bold uppercase tracking-widest px-3 pt-1 pb-2" style={{ color: "rgba(255,255,255,0.25)" }}>
            Módulos
          </p>
          {navItems.map(item => {
            const isActive = active === item.key;
            return (
              <button
                key={item.key}
                onClick={() => { onItemClick(item.key); }}
                title={item.desc}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left transition-all duration-150 group"
                style={{
                  background: isActive ? "rgba(184,135,42,0.16)" : "transparent",
                  border: isActive ? "1px solid rgba(184,135,42,0.28)" : "1px solid transparent",
                }}
              >
                <item.icon
                  size={16}
                  strokeWidth={isActive ? 2.2 : 1.7}
                  style={{ color: isActive ? "#D4A043" : "rgba(255,255,255,0.45)", flexShrink: 0, transition: "color 0.15s" }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-inter text-[13px] font-medium leading-tight"
                    style={{ color: isActive ? "#D4A043" : "rgba(255,255,255,0.78)" }}>
                    {item.label}
                  </p>
                </div>
                {isActive && <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#D4A043" }} />}
              </button>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="px-3 py-4 space-y-1 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <ArrowLeft size={15} style={{ color: "rgba(255,255,255,0.4)" }} />
            <span className="font-inter text-[13px]" style={{ color: "rgba(255,255,255,0.5)" }}>Voltar ao app</span>
          </button>
          <button
            onClick={() => base44.auth.logout("/")}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all"
            style={{ background: "rgba(180,35,24,0.08)", border: "1px solid rgba(180,35,24,0.12)" }}
          >
            <LogOut size={15} style={{ color: "#F87171" }} />
            <span className="font-inter text-[13px]" style={{ color: "#F87171" }}>Sair da conta</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col w-60 flex-shrink-0 h-screen sticky top-0"
        style={{ background: "#0A1929", borderRight: "1px solid rgba(255,255,255,0.06)" }}
      >
        <NavContent onItemClick={(key) => onNavigate(key)} />
      </aside>

      {/* Mobile top bar */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4"
        style={{
          background: "#0A1929",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          paddingTop: "calc(env(safe-area-inset-top) + 10px)",
          paddingBottom: "10px",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #B8872A, #D4A043)" }}>
            <span className="font-montserrat font-black text-[11px] text-white">IFL</span>
          </div>
          <span className="font-montserrat font-bold text-sm text-white">Admin</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          {mobileOpen ? <X size={18} className="text-white" /> : <Menu size={18} className="text-white" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 flex flex-col" style={{ background: "#0A1929" }}>
            <NavContent onItemClick={(key) => { onNavigate(key); setMobileOpen(false); }} />
          </aside>
        </div>
      )}
    </>
  );
}