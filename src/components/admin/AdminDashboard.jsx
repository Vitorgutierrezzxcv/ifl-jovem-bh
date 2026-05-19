import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Users, Calendar, CheckSquare, DollarSign, AlertTriangle, Star, MessageSquare, Target, Bell, TrendingUp, Clock } from "lucide-react";
import AdminHeader from "./AdminHeader";

export default function AdminDashboard({ onNavigate, isAdmin, memberRole }) {
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStats(); }, []);

  async function loadStats() {
    try {
      const [members, events, tasks, submissions, charges, demands, announcements, points] = await Promise.all([
        base44.entities.Member.list(),
        base44.entities.Event.list("-date", 50),
        base44.entities.Task.list(),
        base44.entities.TaskSubmission.list(),
        base44.entities.FinancialCharge.list(),
        base44.entities.DemandRequest.list(),
        base44.entities.Announcement.list(),
        base44.entities.PointsLedger.list(),
      ]);

      const today = new Date().toISOString().split("T")[0];
      const nextEvents = events.filter(e => e.date >= today);

      const s = {
        totalMembers: members.length,
        active: members.filter(m => m.member_status === "ativo").length,
        inactive: members.filter(m => !["ativo"].includes(m.member_status)).length,
        qualifier: members.filter(m => m.cycle === "qualifier").length,
        ciclo1: members.filter(m => m.cycle === "1_ciclo").length,
        ciclo2: members.filter(m => m.cycle === "2_ciclo").length,
        ciclo3: members.filter(m => m.cycle === "3_ciclo").length,
        fellow: members.filter(m => m.cycle === "fellow").length,
        inadimplentes: members.filter(m => m.financial_status === "inadimplente" || m.financial_status === "vencido").length,
        pendingSubmissions: submissions.filter(s => ["enviada", "em_correcao"].includes(s.status)).length,
        openDemands: demands.filter(d => ["pendente", "em_analise"].includes(d.status)).length,
        nextEvents: nextEvents.length,
        pendingPoints: points.filter(p => p.status === "pendente").length,
        overdueCharges: charges.filter(c => ["vencido", "inadimplente"].includes(c.status)).length,
      };

      setStats(s);

      const a = [];
      if (s.inadimplentes > 0) a.push({ type: "danger", msg: `${s.inadimplentes} associado(s) inadimplentes`, section: "financial" });
      if (s.pendingSubmissions > 0) a.push({ type: "warning", msg: `${s.pendingSubmissions} tarefa(s) aguardando correção`, section: "tasks" });
      if (s.openDemands > 0) a.push({ type: "warning", msg: `${s.openDemands} demanda(s) em aberto`, section: "demands" });
      if (s.pendingPoints > 0) a.push({ type: "info", msg: `${s.pendingPoints} ponto(s) aguardando aprovação`, section: "points" });
      const atRisk = members.filter(m => m.progress_status === "em_risco" || m.progress_status === "atencao");
      if (atRisk.length > 0) a.push({ type: "danger", msg: `${atRisk.length} associado(s) em risco de desligamento`, section: "members" });
      setAlerts(a);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const quickActions = [
    { icon: Calendar, label: "Criar Evento", section: "events", color: "#0D2137" },
    { icon: CheckSquare, label: "Ver Tarefas", section: "tasks", color: "#B5862A" },
    { icon: Star, label: "Lançar Pontos", section: "points", color: "#1F8A5B" },
    { icon: Bell, label: "Novo Aviso", section: "announcements", color: "#0D2137" },
    { icon: Target, label: "Oportunidades", section: "opportunities", color: "#B5862A" },
    { icon: MessageSquare, label: "Demandas", section: "demands", color: "#1F8A5B" },
  ];

  if (loading) return (
    <div className="flex-1 flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-4 border-gray-200 border-t-ifl-navy rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen" style={{ paddingTop: "calc(env(safe-area-inset-top) + 56px)", background: "#F4F5F7" }} >
      <div className="lg:pt-0 pt-0">
        <AdminHeader title="Dashboard" subtitle="Visão geral do sistema IFL Jovem BH" />
      </div>

      <div className="p-6">
        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="mb-6">
            <h2 className="font-montserrat font-bold text-sm uppercase tracking-wider mb-3" style={{ color: "#B42318" }}>
              ⚠ Alertas Críticos
            </h2>
            <div className="flex flex-col gap-2">
              {alerts.map((a, i) => (
                <button key={i} onClick={() => onNavigate(a.section)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-left w-full"
                  style={{
                    background: a.type === "danger" ? "rgba(180,35,24,0.06)" : a.type === "warning" ? "rgba(217,154,34,0.08)" : "rgba(13,33,55,0.04)",
                    border: `1px solid ${a.type === "danger" ? "rgba(180,35,24,0.2)" : a.type === "warning" ? "rgba(217,154,34,0.25)" : "rgba(13,33,55,0.1)"}`,
                  }}>
                  <AlertTriangle size={15} style={{ color: a.type === "danger" ? "#B42318" : a.type === "warning" ? "#D99A22" : "#071D33", flexShrink: 0 }} />
                  <span className="font-inter text-sm" style={{ color: a.type === "danger" ? "#B42318" : a.type === "warning" ? "#92610A" : "#374151" }}>{a.msg}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <StatCard label="Total Associados" value={stats?.totalMembers} icon={Users} color="#071D33" onClick={() => onNavigate("members")} />
          <StatCard label="Ativos" value={stats?.active} icon={TrendingUp} color="#1F8A5B" onClick={() => onNavigate("members")} />
          <StatCard label="Inadimplentes" value={stats?.inadimplentes} icon={DollarSign} color="#B42318" onClick={() => onNavigate("financial")} />
          <StatCard label="Correções Pend." value={stats?.pendingSubmissions} icon={CheckSquare} color="#D99A22" onClick={() => onNavigate("tasks")} />
        </div>

        {/* Cycle breakdown */}
        <div className="rounded-2xl p-5 mb-6 bg-white" style={{ border: "1px solid rgba(13,33,55,0.08)" }}>
          <h3 className="font-montserrat font-bold text-sm mb-4" style={{ color: "#071D33" }}>Associados por Ciclo</h3>
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Qualifier", value: stats?.qualifier, color: "#6B7280" },
              { label: "1º Ciclo", value: stats?.ciclo1, color: "#071D33" },
              { label: "2º Ciclo", value: stats?.ciclo2, color: "#0D4A8A" },
              { label: "3º Ciclo", value: stats?.ciclo3, color: "#1F8A5B" },
              { label: "Fellow", value: stats?.fellow, color: "#B5862A" },
              { label: "Demandas", value: stats?.openDemands, color: "#D99A22" },
            ].map(item => (
              <div key={item.label} className="text-center p-3 rounded-xl" style={{ background: `${item.color}08` }}>
                <p className="font-montserrat font-black text-2xl" style={{ color: item.color }}>{item.value ?? 0}</p>
                <p className="font-inter text-xs mt-1" style={{ color: "#6B7280" }}>{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="font-montserrat font-bold text-sm uppercase tracking-wider mb-3" style={{ color: "#071D33" }}>Ações Rápidas</h2>
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
            {quickActions.map(item => (
              <button key={item.section} onClick={() => onNavigate(item.section)}
                className="flex flex-col items-center gap-2 py-4 px-2 rounded-2xl card-hover"
                style={{ background: "#FFFFFF", border: "1px solid rgba(13,33,55,0.06)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${item.color}10` }}>
                  <item.icon size={18} style={{ color: item.color }} strokeWidth={1.8} />
                </div>
                <span className="font-inter text-[11px] font-semibold text-center leading-tight" style={{ color: "#374151" }}>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* More stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-4 bg-white" style={{ border: "1px solid rgba(13,33,55,0.08)" }}>
            <p className="font-inter text-xs" style={{ color: "#6B7280" }}>Próximos Eventos</p>
            <p className="font-montserrat font-black text-3xl mt-1" style={{ color: "#071D33" }}>{stats?.nextEvents}</p>
          </div>
          <div className="rounded-2xl p-4 bg-white" style={{ border: "1px solid rgba(13,33,55,0.08)" }}>
            <p className="font-inter text-xs" style={{ color: "#6B7280" }}>Pontos Pendentes</p>
            <p className="font-montserrat font-black text-3xl mt-1" style={{ color: "#D99A22" }}>{stats?.pendingPoints}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: IconComp, color, onClick }) {
  const Icon = IconComp;
  return (
    <button onClick={onClick} className="rounded-2xl p-4 text-left card-hover w-full bg-white" style={{ border: "1px solid rgba(13,33,55,0.08)" }}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}12` }}>
          <Icon size={14} style={{ color }} strokeWidth={2} />
        </div>
      </div>
      <p className="font-montserrat font-black text-2xl" style={{ color }}>{value ?? 0}</p>
      <p className="font-inter text-xs mt-1" style={{ color: "#9CA3AF" }}>{label}</p>
    </button>
  );
}