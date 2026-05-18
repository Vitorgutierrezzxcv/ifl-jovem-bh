import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Calendar, Trophy, CheckSquare, DollarSign, BookOpen, Star, Bell, ChevronRight, TrendingUp, AlertCircle, Clock, MessageSquare, Users, Award, FileText } from "lucide-react";
import MobileHeader from "../components/layout/MobileHeader";
import MetricCard from "../components/ui/MetricCard";
import StatusBadge from "../components/ui/StatusBadge";
import usePullToRefresh from "../hooks/usePullToRefresh";
import PullToRefreshIndicator from "../components/ui/PullToRefreshIndicator";

const cycleLabels = {
  qualifier: "Qualifier",
  "1_ciclo": "1º Ciclo",
  "2_ciclo": "2º Ciclo",
  "3_ciclo": "3º Ciclo",
  fellow: "Fellow",
  honorario: "Honorário",
};

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [member, setMember] = useState(null);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const u = await base44.auth.me();
      setUser(u);
      const [members, evs, anns, tks] = await Promise.all([
        base44.entities.Member.filter({ email: u.email }),
        base44.entities.Event.list("-date", 5),
        base44.entities.Announcement.filter({ status: "publicado" }, "-created_date", 5),
        base44.entities.Task.filter({ status: "publicada" }, "-due_date", 5),
      ]);
      if (members.length > 0) setMember(members[0]);
      const today = new Date().toISOString().split("T")[0];
      setEvents(evs.filter(e => e.date >= today).slice(0, 3));
      setAnnouncements(anns.slice(0, 3));
      setTasks(tks.slice(0, 3));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleRefresh = useCallback(async () => {
    setLoading(true);
    await loadData();
  }, []);

  const { containerRef, pullDistance, refreshing, progress: pullProgress } = usePullToRefresh(handleRefresh);

  const progress = member ? Math.min(100, Math.round((member.total_points || 0) / 2)) : 0;
  const firstName = user?.full_name?.split(" ")[0] || "Associado";

  const typeLabels = {
    palestra_ordinaria: "Palestra",
    evento_ordinario_formacao: "Formação",
    clube_do_livro: "Clube do Livro",
    evento_extraordinario: "Extraordinário",
    viagem: "Viagem",
    forum: "Fórum",
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-ifl-gray-bg relative"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 96px)" }}
    >
      <PullToRefreshIndicator pullDistance={pullDistance} refreshing={refreshing} progress={pullProgress} />
      {/* Hero Header */}
      <div
        className="hex-bg-dark relative overflow-hidden"
        style={{ background: "#071D33" }}
      >
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(184,135,42,0.12) 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />

        <MobileHeader dark />

        <div className="px-5 pb-6">
          <p className="font-inter text-sm mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>
            Olá 👋
          </p>
          <h1 className="font-montserrat font-black text-2xl text-white leading-tight">
            {user?.full_name || "Associado"}
          </h1>

          {/* Journey Card */}
          <div
            className="mt-5 rounded-2xl p-4 relative overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(184,135,42,0.25)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>CICLO ATUAL</p>
                <p className="font-montserrat font-bold text-lg text-white mt-0.5">
                  {member ? cycleLabels[member.cycle] : "—"}
                </p>
              </div>
              <StatusBadge status={member?.progress_status || "em_dia"} />
            </div>

            {/* Progress bar */}
            <div className="mb-2">
              <div className="flex justify-between mb-1.5">
                <span className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Progresso geral</span>
                <span className="font-montserrat font-bold text-xs" style={{ color: "#D4A043" }}>{progress}%</span>
              </div>
              <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
                <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${progress}%`, background: "linear-gradient(90deg, #B8872A, #D4A043)" }} />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={() => navigate("/jornada")}
                className="flex items-center gap-1 font-inter text-xs font-semibold"
                style={{ color: "#D4A043" }}
              >
                Ver minha jornada <ChevronRight size={14} />
              </button>
              <button
                onClick={() => navigate("/ciclo")}
                className="flex items-center gap-1 font-inter text-xs font-semibold"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                Sobre o ciclo <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick metrics */}
      <div className="px-4 mt-4">
        <div className="grid grid-cols-3 gap-3">
          <MetricCard icon={Star} label="Pontos" value={member?.total_points || 0} color="#B8872A" onClick={() => navigate("/pontos")} />
          <MetricCard icon={Trophy} label="Ranking" value={member?.ranking_position ? `#${member.ranking_position}` : "—"} color="#071D33" onClick={() => navigate("/ranking")} />
          <MetricCard icon={Calendar} label="Presença" value={`${Math.round(member?.attendance_percentage || 0)}%`} color="#1F8A5B" onClick={() => navigate("/presenca")} />
        </div>
      </div>

      {/* Próximos eventos */}
      {events.length > 0 && (
        <div className="px-4 mt-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-montserrat font-bold text-sm uppercase tracking-wider" style={{ color: "#071D33" }}>
              <span style={{ borderBottom: "2px solid #B8872A", paddingBottom: 2 }}>Próximos Eventos</span>
            </h2>
            <button onClick={() => navigate("/agenda")} className="font-inter text-xs font-medium" style={{ color: "#B8872A" }}>
              Ver todos
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {events.map(ev => (
              <div
                key={ev.id}
                className="rounded-2xl p-4 flex items-center gap-3 card-hover"
                style={{ background: "hsl(var(--card))", border: "1px solid rgba(7,29,51,0.06)", boxShadow: "0 2px 8px rgba(7,29,51,0.04)" }}
                onClick={() => navigate("/agenda")}
              >
                <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
                  style={{ background: "#071D33" }}>
                  <span className="font-montserrat font-black text-lg text-white leading-none">
                    {new Date(ev.date + "T12:00:00").getDate()}
                  </span>
                  <span className="font-inter text-[9px] uppercase" style={{ color: "#D4A043" }}>
                    {new Date(ev.date + "T12:00:00").toLocaleString("pt-BR", { month: "short" })}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-montserrat font-bold text-sm truncate" style={{ color: "#111827" }}>{ev.name}</p>
                  <p className="font-inter text-xs truncate mt-0.5" style={{ color: "#6B7280" }}>
                    {typeLabels[ev.type] || ev.type} · {ev.location || "A definir"}
                  </p>
                </div>
                <ChevronRight size={16} style={{ color: "#B8872A", flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Avisos */}
      {announcements.length > 0 && (
        <div className="px-4 mt-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-montserrat font-bold text-sm uppercase tracking-wider" style={{ color: "#071D33" }}>
              <span style={{ borderBottom: "2px solid #B8872A", paddingBottom: 2 }}>Avisos</span>
            </h2>
          </div>
          <div className="flex flex-col gap-2">
            {announcements.map(ann => (
              <div
                key={ann.id}
                className="rounded-2xl p-4 card-hover"
                style={{
                  background: ann.priority === "urgente" ? "#071D33" : "hsl(var(--card))",
                  border: ann.priority === "urgente" ? "1px solid rgba(184,135,42,0.3)" : "1px solid rgba(7,29,51,0.06)",
                  boxShadow: "0 2px 8px rgba(7,29,51,0.04)",
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: ann.priority === "urgente" ? "rgba(184,135,42,0.2)" : "rgba(7,29,51,0.06)" }}>
                    <Bell size={15} style={{ color: ann.priority === "urgente" ? "#D4A043" : "#071D33" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-montserrat font-bold text-sm" style={{ color: ann.priority === "urgente" ? "#FFFFFF" : "#111827" }}>
                      {ann.title}
                    </p>
                    <p className="font-inter text-xs mt-0.5 line-clamp-2" style={{ color: ann.priority === "urgente" ? "rgba(255,255,255,0.55)" : "#6B7280" }}>
                      {ann.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="px-4 mt-5">
        <h2 className="font-montserrat font-bold text-sm uppercase tracking-wider mb-3" style={{ color: "#071D33" }}>
          <span style={{ borderBottom: "2px solid #B8872A", paddingBottom: 2 }}>Ações Rápidas</span>
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: CheckSquare, label: "Minhas Tarefas", path: "/tarefas", color: "#071D33" },
            { icon: BookOpen, label: "Clube do Livro", path: "/clube-livro", color: "#B8872A" },
            { icon: DollarSign, label: "Financeiro", path: "/financeiro", color: "#1F8A5B" },
            { icon: Star, label: "Oportunidades", path: "/oportunidades", color: "#B8872A" },
            { icon: MessageSquare, label: "Demandas", path: "/demandas", color: "#071D33" },
            { icon: Users, label: "Colaborações", path: "/colaboracoes", color: "#1F8A5B" },
            { icon: Award, label: "Critérios de Pts", path: "/criterios-pontuacao", color: "#B8872A" },
            { icon: FileText, label: "Ciclo de Formação", path: "/ciclo", color: "#071D33" },
          ].map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="rounded-2xl p-4 flex items-center gap-3 card-hover text-left"
              style={{ background: "hsl(var(--card))", border: "1px solid rgba(7,29,51,0.06)", boxShadow: "0 2px 8px rgba(7,29,51,0.04)" }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: `${item.color}10` }}>
                <item.icon size={17} style={{ color: item.color }} strokeWidth={1.8} />
              </div>
              <span className="font-inter text-sm font-semibold" style={{ color: "#111827" }}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}