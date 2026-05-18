import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { LogOut, ChevronRight, User, BookOpen, Library, DollarSign, FileText, Star, Bell, Shield, Trash2, AlertTriangle } from "lucide-react";
import MobileHeader from "../components/layout/MobileHeader";
import BottomNav from "../components/layout/BottomNav";
import StatusBadge from "../components/ui/StatusBadge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const cycleLabels = { qualifier: "Qualifier", "1_ciclo": "1º Ciclo", "2_ciclo": "2º Ciclo", "3_ciclo": "3º Ciclo", fellow: "Fellow", honorario: "Honorário" };
const roleLabels = { associado: "Associado", gerente: "Gerente", diretor: "Diretor", vice_presidente: "Vice-Presidente", presidente: "Presidente" };

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const u = await base44.auth.me();
      setUser(u);
      const members = await base44.entities.Member.filter({ email: u.email });
      if (members.length > 0) setMember(members[0]);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const menuItems = [
    { icon: BookOpen, label: "Clube do Livro", path: "/clube-livro" },
    { icon: Library, label: "ROL Literário", path: "/rol" },
    { icon: DollarSign, label: "Financeiro", path: "/financeiro" },
    { icon: Star, label: "Oportunidades", path: "/oportunidades" },
    { icon: FileText, label: "Documentos", path: "/documentos" },
    { icon: Bell, label: "Avisos", path: "/avisos" },
  ];

  const isAdmin = user?.role === "admin" || ["presidente", "vice_presidente", "diretor", "gerente"].includes(member?.role);

  async function handleDeleteAccount() {
    await base44.auth.logout("/");
  }

  return (
    <div className="min-h-screen bg-ifl-gray-bg" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 72px)" }}>
      {/* Header */}
      <div className="hex-bg-dark relative overflow-hidden" style={{ background: "linear-gradient(160deg, #071D33 0%, #0A2640 100%)" }}>
        <MobileHeader title="Perfil" dark showNotification={false} />
        <div className="px-5 pb-8">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center font-montserrat font-black text-3xl text-white flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #B8872A, #D4A043)" }}>
              {user?.full_name?.charAt(0) || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-montserrat font-black text-xl text-white truncate">{user?.full_name || "Associado"}</h1>
              <p className="font-inter text-xs mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.5)" }}>{user?.email}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {member?.cycle && (
                  <span className="font-inter text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(184,135,42,0.2)", color: "#D4A043" }}>
                    {cycleLabels[member.cycle]}
                  </span>
                )}
                {member?.role && (
                  <span className="font-inter text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}>
                    {roleLabels[member.role]}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { label: "Pontos", value: member?.total_points || 0, color: "#D4A043" },
              { label: "Ranking", value: member?.ranking_position ? `#${member.ranking_position}` : "—", color: "#D4A043" },
              { label: "Presença", value: `${Math.round(member?.attendance_percentage || 0)}%`, color: "#D4A043" },
            ].map(stat => (
              <div key={stat.label} className="rounded-2xl p-3 text-center" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(184,135,42,0.15)" }}>
                <p className="font-montserrat font-black text-lg" style={{ color: stat.color }}>{stat.value}</p>
                <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.45)" }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status */}
      {member && (
        <div className="px-4 mt-4">
          <div className="rounded-2xl p-4 flex items-center justify-between"
            style={{ background: "hsl(var(--card))", border: "1px solid rgba(7,29,51,0.06)", boxShadow: "0 2px 8px rgba(7,29,51,0.04)" }}>
            <div>
              <p className="font-inter text-xs" style={{ color: "#6B7280" }}>Status do associado</p>
              <div className="mt-1">
                <StatusBadge status={member.member_status} size="md" />
              </div>
            </div>
            <div className="text-right">
              <p className="font-inter text-xs" style={{ color: "#6B7280" }}>Financeiro</p>
              <div className="mt-1">
                <StatusBadge status={member.financial_status} size="md" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin access */}
      {isAdmin && (
        <div className="px-4 mt-4">
          <button
            onClick={() => navigate("/admin")}
            className="w-full rounded-2xl p-4 flex items-center gap-3 card-hover"
            style={{ background: "#071D33", border: "1px solid rgba(184,135,42,0.2)" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(184,135,42,0.2)" }}>
              <Shield size={18} style={{ color: "#D4A043" }} />
            </div>
            <div className="flex-1 text-left">
              <p className="font-montserrat font-bold text-sm text-white">Painel Administrativo</p>
              <p className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>Acesso à área da diretoria</p>
            </div>
            <ChevronRight size={16} style={{ color: "#B8872A" }} />
          </button>
        </div>
      )}

      {/* Menu items */}
      <div className="px-4 mt-4">
        <h2 className="font-montserrat font-bold text-xs uppercase tracking-wider mb-3" style={{ color: "#9CA3AF" }}>Mais opções</h2>
        <div className="rounded-2xl overflow-hidden" style={{ background: "hsl(var(--card))", border: "1px solid rgba(7,29,51,0.06)", boxShadow: "0 2px 8px rgba(7,29,51,0.04)" }}>
          {menuItems.map((item, idx) => (
            <button key={item.path} onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-3 px-4 py-3.5 card-hover"
              style={{ borderBottom: idx < menuItems.length - 1 ? "1px solid rgba(7,29,51,0.05)" : "none" }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(7,29,51,0.05)" }}>
                <item.icon size={16} style={{ color: "#071D33" }} strokeWidth={1.8} />
              </div>
              <span className="flex-1 text-left font-inter text-sm font-medium" style={{ color: "#111827" }}>{item.label}</span>
              <ChevronRight size={15} style={{ color: "#D1D5DB" }} />
            </button>
          ))}
        </div>
      </div>

      {/* Logout */}
      <div className="px-4 mt-4">
        <button
          onClick={() => base44.auth.logout("/")}
          className="w-full rounded-2xl p-4 flex items-center gap-3 card-hover"
          style={{ background: "rgba(180,35,24,0.06)", border: "1px solid rgba(180,35,24,0.15)" }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(180,35,24,0.1)" }}>
            <LogOut size={16} style={{ color: "#B42318" }} />
          </div>
          <span className="font-inter text-sm font-semibold" style={{ color: "#B42318" }}>Sair da conta</span>
        </button>
      </div>

      {/* Delete account */}
      <div className="px-4 mt-3 mb-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="w-full rounded-2xl p-4 flex items-center gap-3 card-hover"
              style={{ background: "transparent", border: "1px solid rgba(180,35,24,0.1)" }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(180,35,24,0.06)" }}>
                <Trash2 size={15} style={{ color: "#B42318" }} />
              </div>
              <span className="font-inter text-sm" style={{ color: "#B42318", opacity: 0.7 }}>Excluir conta</span>
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle size={18} style={{ color: "#B42318" }} />
                Excluir conta
              </AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação é irreversível. Todos os seus dados — histórico, pontos e progresso — serão permanentemente removidos. Deseja continuar?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                style={{ background: "#B42318", color: "#fff" }}
              >
                Sim, excluir minha conta
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <BottomNav />
    </div>
  );
}