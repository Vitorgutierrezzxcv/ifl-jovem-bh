import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Users, Calendar, CheckSquare, DollarSign, AlertTriangle,
  Star, MessageSquare, Target, Bell, TrendingUp, ArrowUpRight,
  Clock, CircleAlert, Info,
} from "lucide-react";
import AdminHeader from "./AdminHeader";

export default function AdminDashboard({ onNavigate, isAdmin, memberRole }) {
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStats(); }, []);

  async function loadStats() {
    try {
      const [members, events, submissions, charges, demands, points] = await Promise.all([
        base44.entities.Member.list(),
        base44.entities.Event.list("-date", 50),
        base44.entities.TaskSubmission.list(),
        base44.entities.FinancialCharge.list(),
        base44.entities.DemandRequest.list(),
        base44.entities.PointsLedger.list(),
      ]);

      const today = new Date().toISOString().split("T")[0];
      const nextEvents = events.filter(e => e.date >= today);

      const s = {
        totalMembers: members.length,
        active: members.filter(m => m.member_status === "ativo").length,
        qualifier: members.filter(m => m.cycle === "qualifier").length,
        ciclo1: members.filter(m => m.cycle === "1_ciclo").length,
        ciclo2: members.filter(m => m.cycle === "2_ciclo").length,
        ciclo3: members.filter(m => m.cycle === "3_ciclo").length,
        fellow: members.filter(m => m.cycle === "fellow").length,
        inadimplentes: members.filter(m => ["inadimplente", "vencido"].includes(m.financial_status)).length,
        pendingSubmissions: submissions.filter(s => ["enviada", "em_correcao"].includes(s.status)).length,
        openDemands: demands.filter(d => ["pendente", "em_analise"].includes(d.status)).length,
        nextEvents: nextEvents.length,
        pendingPoints: points.filter(p => p.status === "pendente").length,
        overdueCharges: charges.filter(c => ["vencido", "inadimplente"].includes(c.status)).length,
        atRisk: members.filter(m => ["em_risco", "atencao"].includes(m.progress_status)).length,
      };

      setStats(s);

      const a = [];
      if (s.inadimplentes > 0) a.push({ type: "danger", msg: `${s.inadimplentes} associado(s) inadimplentes`, section: "financial" });
      if (s.atRisk > 0) a.push({ type: "danger", msg: `${s.atRisk} associado(s) em risco de desligamento`, section: "members" });
      if (s.pendingSubmissions > 0) a.push({ type: "warning", msg: `${s.pendingSubmissions} tarefa(s) aguardando correção`, section: "tasks" });
      if (s.openDemands > 0) a.push({ type: "warning", msg: `${s.openDemands} demanda(s) em aberto`, section: "demands" });
      if (s.pendingPoints > 0) a.push({ type: "info", msg: `${s.pendingPoints} ponto(s) aguardando aprovação`, section: "points" });
      setAlerts(a);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const primaryStats = [
    { label: "Total de Associados", value: stats?.totalMembers, sub: `${stats?.active ?? 0} ativos`, icon: Users, color: "#071D33", bg: "rgba(7,29,51,0.07)", section: "members" },
    { label: "Inadimplentes", value: stats?.inadimplentes, sub: "status vencido ou inadimplente", icon: DollarSign, color: "#B42318", bg: "rgba(180,35,24,0.07)", section: "financial" },
    { label: "Tarefas para Corrigir", value: stats?.pendingSubmissions, sub: "aguardando revisão", icon: CheckSquare, color: "#D99A22", bg: "rgba(217,154,34,0.08)", section: "tasks" },
    { label: "Demandas Abertas", value: stats?.openDemands, sub: "pendentes ou em análise", icon: MessageSquare, color: "#B5862A", bg: "rgba(181,134,42,0.08)", section: "demands" },
    { label: "Próximos Eventos", value: stats?.nextEvents, sub: "agendados", icon: Calendar, color: "#1F8A5B", bg: "rgba(31,138,91,0.07)", section: "events" },
    { label: "Pontos Pendentes", value: stats?.pendingPoints, sub: "aguardando aprovação", icon: Star, color: "#7C3AED", bg: "rgba(124,58,237,0.07)", section: "points" },
  ];

  const cycleBreakdown = [
    { label: "Qualifier", value: stats?.qualifier, color: "#6B7280" },
    { label: "1º Ciclo", value: stats?.ciclo1, color: "#071D33" },
    { label: "2º Ciclo", value: stats?.ciclo2, color: "#1565C0" },
    { label: "3º Ciclo", value: stats?.ciclo3, color: "#1F8A5B" },
    { label: "Fellow", value: stats?.fellow, color: "#B5862A" },
  ];

  const quickActions = [
    { icon: Calendar, label: "Criar Evento", section: "events", color: "#071D33" },
    { icon: CheckSquare, label: "Corrigir Tarefas", section: "tasks", color: "#D99A22" },
    { icon: Star, label: "Lançar Pontos", section: "points", color: "#7C3AED" },
    { icon: Bell, label: "Novo Aviso", section: "announcements", color: "#1F8A5B" },
    { icon: Target, label: "Oportunidades", section: "opportunities", color: "#B5862A" },
    { icon: MessageSquare, label: "Ver Demandas", section: "demands", color: "#B42318" },
  ];

  const alertIcon = { danger: CircleAlert, warning: AlertTriangle, info: Info };
  const alertColors = {
    danger: { bg: "rgba(180,35,24,0.06)", border: "rgba(180,35,24,0.2)", icon: "#B42318", text: "#991B1B" },
    warning: { bg: "rgba(217,154,34,0.06)", border: "rgba(217,154,34,0.25)", icon: "#D99A22", text: "#92400E" },
    info: { bg: "rgba(7,29,51,0.04)", border: "rgba(7,29,51,0.12)", icon: "#4B6CB7", text: "#374151" },
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center min-h-screen" style={{ background: "#F4F5F7" }}>
      <div className="w-8 h-8 border-4 border-gray-200 border-t-ifl-navy rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: "#F4F5F7" }}>
      <AdminHeader
        title="Dashboard"
        subtitle="Visão geral do sistema IFL Jovem BH"
      />

      <div className="p-6 max-w-[1400px]">

        {/* Alerts strip */}
        {alerts.length > 0 && (
          <div className="mb-6 flex flex-col gap-2">
            {alerts.map((a, i) => {
              const cfg = alertColors[a.type];
              const Icon = alertIcon[a.type];
              return (
                <button
                  key={i}
                  onClick={() => onNavigate(a.section)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-left w-full group transition-all hover:brightness-95"
                  style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
                >
                  <Icon size={15} style={{ color: cfg.icon, flexShrink: 0 }} />
                  <span className="font-inter text-sm flex-1" style={{ color: cfg.text }}>{a.msg}</span>
                  <ArrowUpRight size={13} style={{ color: cfg.icon, opacity: 0.6 }} className="group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })}
          </div>
        )}

        {/* Primary stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          {primaryStats.map(s => (
            <button
              key={s.label}
              onClick={() => onNavigate(s.section)}
              className="bg-white rounded-2xl p-4 text-left group hover:shadow-md transition-all duration-200"
              style={{ border: "1px solid rgba(13,33,55,0.08)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: s.bg }}>
                  <s.icon size={15} style={{ color: s.color }} strokeWidth={2} />
                </div>
                <ArrowUpRight size={13} style={{ color: "#D1D5DB" }} className="group-hover:text-gray-500 transition-colors" />
              </div>
              <p className="font-montserrat font-black text-3xl leading-none" style={{ color: s.color }}>{s.value ?? 0}</p>
              <p className="font-inter text-[11px] font-semibold mt-1.5 leading-tight" style={{ color: "#374151" }}>{s.label}</p>
              <p className="font-inter text-[10px] mt-0.5" style={{ color: "#9CA3AF" }}>{s.sub}</p>
            </button>
          ))}
        </div>

        {/* Bottom row: cycle breakdown + quick actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Cycle breakdown */}
          <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid rgba(13,33,55,0.08)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-montserrat font-bold text-sm" style={{ color: "#071D33" }}>Associados por Ciclo</h3>
              <button
                onClick={() => onNavigate("members")}
                className="font-inter text-xs font-semibold flex items-center gap-1"
                style={{ color: "#B5862A" }}
              >
                Ver todos <ArrowUpRight size={11} />
              </button>
            </div>
            <div className="space-y-3">
              {cycleBreakdown.map(item => {
                const pct = stats?.totalMembers ? Math.round(((item.value || 0) / stats.totalMembers) * 100) : 0;
                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-inter text-xs font-medium" style={{ color: "#374151" }}>{item.label}</span>
                      <span className="font-montserrat font-bold text-sm" style={{ color: item.color }}>{item.value ?? 0}</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: "rgba(13,33,55,0.06)" }}>
                      <div className="h-1.5 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: item.color, opacity: 0.7 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid rgba(13,33,55,0.08)" }}>
            <h3 className="font-montserrat font-bold text-sm mb-4" style={{ color: "#071D33" }}>Ações Rápidas</h3>
            <div className="grid grid-cols-3 gap-3">
              {quickActions.map(item => (
                <button
                  key={item.section}
                  onClick={() => onNavigate(item.section)}
                  className="flex flex-col items-center gap-2 py-4 px-2 rounded-xl transition-all hover:shadow-sm"
                  style={{ background: `${item.color}07`, border: `1px solid ${item.color}18` }}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: `${item.color}14` }}>
                    <item.icon size={16} style={{ color: item.color }} strokeWidth={1.8} />
                  </div>
                  <span className="font-inter text-[11px] font-semibold text-center leading-tight" style={{ color: "#374151" }}>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}