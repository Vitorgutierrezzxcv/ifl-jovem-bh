import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { LogOut, ChevronRight, User, BookOpen, Library, DollarSign, FileText, Star, Bell, Shield, Trash2, AlertTriangle, BarChart2, TrendingUp, Users, CheckSquare, Lock, Pencil, Check } from "lucide-react";
import MobileHeader from "../components/layout/MobileHeader";
import StatusBadge from "../components/ui/StatusBadge";
import ProfileAnalytics from "../components/profile/ProfileAnalytics";
import ProfilePerformance from "../components/profile/ProfilePerformance";
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
  const [activeTab, setActiveTab] = useState("perfil");
  const [editingBio, setEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState("");
  const [savingBio, setSavingBio] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const u = await base44.auth.me();
      setUser(u);
      const members = await base44.entities.Member.filter({ email: u.email });
      if (members.length > 0) {
        setMember(members[0]);
        setBioDraft(members[0].mini_bio || "");
      } else {
        const all = await base44.entities.Member.list("-total_points", 1);
        if (all.length > 0) setMember(all[0]);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const menuItems = [
    { icon: BookOpen, label: "Clube do Livro", path: "/clube-livro" },
    { icon: Library, label: "ROL Literário", path: "/rol" },
    { icon: DollarSign, label: "Financeiro", path: "/financeiro" },
    { icon: Star, label: "Oportunidades", path: "/oportunidades" },
    { icon: FileText, label: "Documentos", path: "/documentos" },
    { icon: Users, label: "Diretório de Associados", path: "/diretorio" },
    { icon: Bell, label: "Avisos", path: "/avisos" },
  ];

  const isBoard = ["presidente", "vice_presidente", "diretor", "gerente"].includes(member?.role);
  const isAdmin = user?.role === "admin" || isBoard;

  async function handleSaveBio() {
    if (!member) return;
    setSavingBio(true);
    await base44.entities.Member.update(member.id, { mini_bio: bioDraft });
    setMember(m => ({ ...m, mini_bio: bioDraft }));
    setSavingBio(false);
    setEditingBio(false);
  }

  async function handleDeleteAccount() {
    await base44.auth.logout("/");
  }

  return (
    <div className="min-h-screen bg-ifl-gray-bg" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 96px)" }}>
      {/* Header */}
      <div className="hex-bg-dark relative overflow-hidden" style={{ background: "#071D33" }}>
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

      {/* Tabs */}
      <div className="flex gap-1 px-4 mt-4">
        {[
          { key: "perfil", label: "Perfil" },
          { key: "desempenho", label: "Desempenho", icon: TrendingUp },
          { key: "analytics", label: "Analytics", icon: BarChart2 },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-inter text-sm font-semibold transition-all"
            style={{
              background: activeTab === tab.key ? "#071D33" : "hsl(var(--card))",
              color: activeTab === tab.key ? "#D4A043" : "#6B7280",
              border: activeTab === tab.key ? "1px solid rgba(184,135,42,0.2)" : "1px solid rgba(7,29,51,0.06)",
            }}
          >
            {tab.icon && <tab.icon size={14} strokeWidth={2} />}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Desempenho tab */}
      {activeTab === "desempenho" && <ProfilePerformance member={member} />}

      {/* Analytics tab */}
      {activeTab === "analytics" && <ProfileAnalytics member={member} />}

      {/* Profile tab content */}
      {activeTab === "perfil" && <>

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

      {/* Mini bio */}
      {member && (
        <div className="px-4 mt-4">
          <div className="rounded-2xl p-4" style={{ background: "hsl(var(--card))", border: "1px solid rgba(7,29,51,0.06)", boxShadow: "0 2px 8px rgba(7,29,51,0.04)" }}>
            <div className="flex items-center justify-between mb-2">
              <p className="font-inter text-xs font-semibold" style={{ color: "#6B7280" }}>Mini bio (visível no diretório)</p>
              {!editingBio && (
                <button onClick={() => setEditingBio(true)} className="flex items-center gap-1 font-inter text-xs font-semibold" style={{ color: "#B8872A" }}>
                  <Pencil size={12} /> Editar
                </button>
              )}
            </div>
            {editingBio ? (
              <div className="flex flex-col gap-2">
                <textarea value={bioDraft} onChange={e => setBioDraft(e.target.value)} rows={3} maxLength={220}
                  placeholder="Conte um pouco sobre sua área de atuação..."
                  className="w-full rounded-xl px-3 py-2 font-inter text-sm resize-none outline-none text-foreground"
                  style={{ background: "hsl(var(--background))", border: "1px solid rgba(7,29,51,0.1)" }} />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => { setEditingBio(false); setBioDraft(member.mini_bio || ""); }} className="px-3 py-1.5 rounded-lg font-inter text-xs font-semibold" style={{ color: "#6B7280" }}>Cancelar</button>
                  <button onClick={handleSaveBio} disabled={savingBio} className="flex items-center gap-1 px-3 py-1.5 rounded-lg font-inter text-xs font-semibold text-white" style={{ background: "#071D33" }}>
                    <Check size={12} /> {savingBio ? "Salvando..." : "Salvar"}
                  </button>
                </div>
              </div>
            ) : (
              <p className="font-inter text-sm text-foreground">{member.mini_bio || "Nenhuma bio adicionada ainda."}</p>
            )}
          </div>
        </div>
      )}

      {/* Monthly tasks quick access */}
      <div className="px-4 mt-4">
        <button onClick={() => navigate("/tarefas")} className="w-full rounded-2xl p-4 flex items-center gap-3 card-hover"
          style={{ background: "hsl(var(--card))", border: "1px solid rgba(7,29,51,0.06)", boxShadow: "0 2px 8px rgba(7,29,51,0.04)" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(184,135,42,0.1)" }}>
            <CheckSquare size={17} style={{ color: "#B8872A" }} />
          </div>
          <div className="flex-1 text-left">
            <p className="font-montserrat font-bold text-sm text-foreground">Enviar Tarefas do Mês</p>
            <p className="font-inter text-xs" style={{ color: "#6B7280" }}>Veja as tarefas pendentes e envie suas entregas</p>
          </div>
          <ChevronRight size={16} style={{ color: "#B8872A" }} />
        </button>
      </div>

      {/* Board area access */}
      {isBoard && (
        <div className="px-4 mt-4">
          <button onClick={() => navigate("/diretoria")} className="w-full rounded-2xl p-4 flex items-center gap-3 card-hover"
            style={{ background: "hsl(var(--card))", border: "1px solid rgba(7,29,51,0.06)", boxShadow: "0 2px 8px rgba(7,29,51,0.04)" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(7,29,51,0.06)" }}>
              <Lock size={16} style={{ color: "#071D33" }} />
            </div>
            <div className="flex-1 text-left">
              <p className="font-montserrat font-bold text-sm text-foreground">Acesso da Diretoria</p>
              <p className="font-inter text-xs" style={{ color: "#6B7280" }}>Documentos institucionais restritos</p>
            </div>
            <ChevronRight size={16} style={{ color: "#B8872A" }} />
          </button>
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

      </>}

    </div>
  );
}