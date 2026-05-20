import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Clock, CheckSquare, Users, BookOpen, AlertTriangle,
  Star, ListTodo, ArrowUpRight, UserX, RefreshCw, MessageSquare,
  ChevronRight, Play, Inbox,
} from "lucide-react";
import AdminHeader from "./AdminHeader";

const activityLabels = {
  mesa_redonda: "Mesa Redonda",
  evento_extraordinario: "Evento Extraordinário",
  evento_ordinario: "Evento Ordinário",
  lanche_recepcao_sombra: "Lanche / Recepção / Sombra",
  linkedin: "LinkedIn",
  stories_nichat: "Stories / NiChat",
  clube_livro_presenca: "Clube do Livro — Presença",
  clube_livro_leitura: "Clube do Livro — Leitura",
  clube_livro_participacao: "Clube do Livro — Participação Ativa",
  tarefa: "Tarefa",
  outros: "Outros",
};

const deptLabels = {
  comunicacao: "Comunicação",
  eventos: "Eventos",
  formacao: "Formação",
  financeiro: "Financeiro",
  institucional: "Institucional",
  presidencia: "Presidência",
  outros: "Outros",
};

const deptColors = {
  comunicacao: "#0EA5E9",
  eventos: "#6366F1",
  formacao: "#7C3AED",
  financeiro: "#D99A22",
  institucional: "#1F8A5B",
  presidencia: "#B5862A",
  outros: "#6B7280",
};

const statusColors = {
  recebido: { bg: "rgba(14,165,233,0.1)", color: "#0EA5E9", label: "Recebido" },
  em_analise: { bg: "rgba(217,154,34,0.1)", color: "#D99A22", label: "Em Análise" },
  aprovado: { bg: "rgba(31,138,91,0.1)", color: "#1F8A5B", label: "Aprovado" },
  rejeitado: { bg: "rgba(180,35,24,0.1)", color: "#B42318", label: "Rejeitado" },
  aplicado: { bg: "rgba(7,29,51,0.08)", color: "#071D33", label: "Aplicado" },
};

export default function FormacaoDashboard({ onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    const [queue, submissions, members, bookclubs, demands, events] = await Promise.all([
      base44.entities.PointsQueue.list("-created_date", 100),
      base44.entities.TaskSubmission.list("-created_date", 200),
      base44.entities.Member.list(),
      base44.entities.BookClub.list("-session_date", 50),
      base44.entities.DemandRequest.list("-created_date", 100),
      base44.entities.Event.list("-date", 100),
    ]);

    const today = new Date().toISOString().split("T")[0];

    // Queue pending
    const queuePending = queue.filter(q => ["recebido", "em_analise"].includes(q.status));

    // Tasks pending review
    const tasksPending = submissions.filter(s => ["enviada", "em_correcao", "enviada_atraso"].includes(s.status));

    // Members at risk
    const atRisk = members.filter(m => ["em_risco", "atencao"].includes(m.progress_status) && m.member_status === "ativo");
    const licensed = members.filter(m => m.member_status === "licenciado");
    const disconnected = members.filter(m => ["desligado", "suspenso"].includes(m.member_status));

    // Book clubs pending validation (realizado but need point verification)
    const bookclubsDone = bookclubs.filter(b => b.status === "realizado").slice(0, 5);

    // Demands pending
    const demandsPending = demands.filter(d => ["pendente", "em_analise"].includes(d.status));

    // Upcoming events without attendance closed
    const upcomingEvents = events.filter(e => e.date >= today && e.status !== "cancelado").slice(0, 5);
    const pastNoAttendance = events.filter(e => e.date < today && e.requires_presence && e.status === "realizado").slice(0, 3);

    setData({ queuePending, tasksPending, atRisk, licensed, disconnected, bookclubsDone, demandsPending, upcomingEvents, pastNoAttendance, members });
    setLoading(false);
  }

  if (loading) return (
    <div className="flex-1 flex items-center justify-center min-h-screen" style={{ background: "#F4F5F7" }}>
      <div className="w-7 h-7 border-4 border-gray-200 border-t-ifl-navy rounded-full animate-spin" />
    </div>
  );

  const d = data;
  const totalPending = d.queuePending.length + d.tasksPending.length + d.demandsPending.length;

  return (
    <div className="min-h-screen" style={{ background: "#F4F5F7" }}>
      <AdminHeader
        title="Central de Formação"
        subtitle={`${totalPending} itens aguardando ação`}
      />

      <div className="p-4 lg:p-6 space-y-5">

        {/* Summary KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Fila de Pontuação", value: d.queuePending.length, color: "#0EA5E9", bg: "rgba(14,165,233,0.08)", icon: Inbox, section: "queue" },
            { label: "Tarefas p/ Corrigir", value: d.tasksPending.length, color: "#D99A22", bg: "rgba(217,154,34,0.08)", icon: CheckSquare, section: "tasks" },
            { label: "Demandas Abertas", value: d.demandsPending.length, color: "#B42318", bg: "rgba(180,35,24,0.07)", icon: MessageSquare, section: "demands" },
            { label: "Membros em Risco", value: d.atRisk.length, color: "#7C3AED", bg: "rgba(124,58,237,0.07)", icon: AlertTriangle, section: "members" },
          ].map(item => (
            <button key={item.label} onClick={() => onNavigate && onNavigate(item.section)}
              className="bg-white rounded-2xl p-4 text-left group hover:shadow-md transition-all"
              style={{ border: "1px solid rgba(13,33,55,0.08)" }}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: item.bg }}>
                  <item.icon size={16} style={{ color: item.color }} />
                </div>
                <ArrowUpRight size={13} style={{ color: "#D1D5DB" }} className="group-hover:text-gray-500 transition-colors" />
              </div>
              <p className="font-montserrat font-black text-3xl" style={{ color: item.color }}>{item.value}</p>
              <p className="font-inter text-xs font-semibold mt-1" style={{ color: "#374151" }}>{item.label}</p>
            </button>
          ))}
        </div>

        {/* Fila de pontuação recebida */}
        <div className="bg-white rounded-2xl" style={{ border: "1px solid rgba(13,33,55,0.08)" }}>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(13,33,55,0.06)" }}>
            <div className="flex items-center gap-2">
              <Inbox size={16} style={{ color: "#0EA5E9" }} />
              <h3 className="font-montserrat font-bold text-sm" style={{ color: "#071D33" }}>Fila de Pontuação de Diretorias</h3>
            </div>
            <button onClick={() => onNavigate && onNavigate("queue")}
              className="font-inter text-xs font-semibold flex items-center gap-1"
              style={{ color: "#B5862A" }}>
              Ver todos <ArrowUpRight size={11} />
            </button>
          </div>
          {d.queuePending.length === 0 ? (
            <div className="py-8 text-center">
              <p className="font-inter text-sm" style={{ color: "#9CA3AF" }}>Nenhuma solicitação pendente 🎉</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "rgba(13,33,55,0.04)" }}>
              {d.queuePending.slice(0, 5).map(q => {
                const scfg = statusColors[q.status] || statusColors.recebido;
                const dcolor = deptColors[q.source_department] || "#6B7280";
                return (
                  <div key={q.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${dcolor}15` }}>
                      <Inbox size={14} style={{ color: dcolor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-inter text-sm font-semibold truncate" style={{ color: "#111827" }}>{q.title}</p>
                      <p className="font-inter text-[11px]" style={{ color: "#9CA3AF" }}>
                        {deptLabels[q.source_department]} · {activityLabels[q.activity_type]} · {q.suggested_points} pts
                      </p>
                    </div>
                    <span className="font-inter text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: scfg.bg, color: scfg.color }}>
                      {scfg.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Members status alerts */}
        {(d.atRisk.length > 0 || d.licensed.length > 0 || d.disconnected.length > 0) && (
          <div className="bg-white rounded-2xl" style={{ border: "1px solid rgba(13,33,55,0.08)" }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(13,33,55,0.06)" }}>
              <div className="flex items-center gap-2">
                <Users size={16} style={{ color: "#B42318" }} />
                <h3 className="font-montserrat font-bold text-sm" style={{ color: "#071D33" }}>Alertas de Associados</h3>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {d.atRisk.length > 0 && (
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(180,35,24,0.05)", border: "1px solid rgba(180,35,24,0.15)" }}>
                  <AlertTriangle size={14} style={{ color: "#B42318" }} />
                  <div className="flex-1">
                    <p className="font-inter text-sm font-semibold" style={{ color: "#B42318" }}>{d.atRisk.length} em risco</p>
                    <p className="font-inter text-xs" style={{ color: "#9CA3AF" }}>{d.atRisk.map(m => m.full_name).slice(0, 3).join(", ")}{d.atRisk.length > 3 ? "..." : ""}</p>
                  </div>
                  <button onClick={() => onNavigate && onNavigate("members")} className="p-1"><ChevronRight size={14} style={{ color: "#B42318" }} /></button>
                </div>
              )}
              {d.licensed.length > 0 && (
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(217,154,34,0.05)", border: "1px solid rgba(217,154,34,0.15)" }}>
                  <Clock size={14} style={{ color: "#D99A22" }} />
                  <div className="flex-1">
                    <p className="font-inter text-sm font-semibold" style={{ color: "#D99A22" }}>{d.licensed.length} licenciado(s)</p>
                    <p className="font-inter text-xs" style={{ color: "#9CA3AF" }}>{d.licensed.map(m => m.full_name).slice(0, 3).join(", ")}</p>
                  </div>
                </div>
              )}
              {d.disconnected.length > 0 && (
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(107,114,128,0.06)", border: "1px solid rgba(107,114,128,0.15)" }}>
                  <UserX size={14} style={{ color: "#6B7280" }} />
                  <div className="flex-1">
                    <p className="font-inter text-sm font-semibold" style={{ color: "#6B7280" }}>{d.disconnected.length} desligado(s)/suspenso(s)</p>
                    <p className="font-inter text-xs" style={{ color: "#9CA3AF" }}>Verificar se precisam ser removidos do ranking</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Upcoming events */}
        {d.upcomingEvents.length > 0 && (
          <div className="bg-white rounded-2xl" style={{ border: "1px solid rgba(13,33,55,0.08)" }}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(13,33,55,0.06)" }}>
              <div className="flex items-center gap-2">
                <Play size={16} style={{ color: "#1F8A5B" }} />
                <h3 className="font-montserrat font-bold text-sm" style={{ color: "#071D33" }}>Próximos Eventos</h3>
              </div>
              <button onClick={() => onNavigate && onNavigate("events")} className="font-inter text-xs font-semibold" style={{ color: "#B5862A" }}>
                Gerenciar →
              </button>
            </div>
            <div className="divide-y" style={{ borderColor: "rgba(13,33,55,0.04)" }}>
              {d.upcomingEvents.slice(0, 4).map(ev => (
                <div key={ev.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="text-center flex-shrink-0 w-10">
                    <p className="font-montserrat font-black text-base" style={{ color: "#071D33" }}>
                      {new Date(ev.date + "T12:00:00").getDate()}
                    </p>
                    <p className="font-inter text-[9px] uppercase" style={{ color: "#9CA3AF" }}>
                      {new Date(ev.date + "T12:00:00").toLocaleDateString("pt-BR", { month: "short" })}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-inter text-sm font-semibold truncate" style={{ color: "#111827" }}>{ev.name}</p>
                    <p className="font-inter text-xs" style={{ color: "#9CA3AF" }}>{ev.type?.replace(/_/g, " ")}</p>
                  </div>
                  <span className="font-inter text-[10px] px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(31,138,91,0.08)", color: "#1F8A5B" }}>
                    {ev.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Demands queue */}
        {d.demandsPending.length > 0 && (
          <div className="bg-white rounded-2xl" style={{ border: "1px solid rgba(13,33,55,0.08)" }}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(13,33,55,0.06)" }}>
              <div className="flex items-center gap-2">
                <MessageSquare size={16} style={{ color: "#B42318" }} />
                <h3 className="font-montserrat font-bold text-sm" style={{ color: "#071D33" }}>Correções de Ranking Pendentes</h3>
              </div>
              <button onClick={() => onNavigate && onNavigate("demands")} className="font-inter text-xs font-semibold" style={{ color: "#B5862A" }}>
                Ver todas →
              </button>
            </div>
            <div className="divide-y" style={{ borderColor: "rgba(13,33,55,0.04)" }}>
              {d.demandsPending.slice(0, 4).map(dem => (
                <div key={dem.id} className="flex items-start gap-3 px-5 py-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(180,35,24,0.07)" }}>
                    <MessageSquare size={13} style={{ color: "#B42318" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-inter text-sm font-semibold" style={{ color: "#111827" }}>{dem.member_name}</p>
                    <p className="font-inter text-xs truncate" style={{ color: "#9CA3AF" }}>{dem.category}</p>
                  </div>
                  <span className="font-inter text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: dem.status === "pendente" ? "rgba(180,35,24,0.1)" : "rgba(217,154,34,0.1)", color: dem.status === "pendente" ? "#B42318" : "#D99A22" }}>
                    {dem.status === "pendente" ? "Pendente" : "Em análise"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}