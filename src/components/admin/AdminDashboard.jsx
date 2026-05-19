import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Users, Calendar, CheckSquare, DollarSign, AlertTriangle,
  Star, MessageSquare, Target, Bell, TrendingUp, ArrowUpRight,
  CircleAlert, Info, Trophy, Activity, Percent, BookOpen,
  UserCheck, UserX, Clock, Shield,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid,
} from "recharts";
import AdminHeader from "./AdminHeader";

const COLORS_CYCLE = ["#6B7280", "#071D33", "#1565C0", "#1F8A5B", "#B5862A", "#9CA3AF"];
const COLORS_STATUS = ["#1F8A5B", "#D99A22", "#B42318", "#6B7280", "#B5862A", "#0EA5E9"];

const cycleLabels = {
  qualifier: "Qualifier", "1_ciclo": "1º Ciclo", "2_ciclo": "2º Ciclo",
  "3_ciclo": "3º Ciclo", fellow: "Fellow", honorario: "Honorário"
};

const alertColors = {
  danger: { bg: "rgba(180,35,24,0.06)", border: "rgba(180,35,24,0.2)", icon: "#B42318", text: "#991B1B" },
  warning: { bg: "rgba(217,154,34,0.06)", border: "rgba(217,154,34,0.25)", icon: "#D99A22", text: "#92400E" },
  info: { bg: "rgba(7,29,51,0.04)", border: "rgba(7,29,51,0.12)", icon: "#4B6CB7", text: "#374151" },
};
const alertIcon = { danger: CircleAlert, warning: AlertTriangle, info: Info };

function MiniBar({ value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-2 rounded-full w-full" style={{ background: "rgba(13,33,55,0.07)" }}>
      <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon, color, bg, section, onNavigate }) {
  return (
    <button
      onClick={() => onNavigate(section)}
      className="bg-white rounded-2xl p-4 text-left group hover:shadow-md transition-all duration-200 w-full"
      style={{ border: "1px solid rgba(13,33,55,0.08)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: bg }}>
          <Icon size={15} style={{ color }} strokeWidth={2} />
        </div>
        <ArrowUpRight size={13} style={{ color: "#D1D5DB" }} className="group-hover:text-gray-500 transition-colors" />
      </div>
      <p className="font-montserrat font-black text-3xl leading-none" style={{ color }}>{value ?? 0}</p>
      <p className="font-inter text-[11px] font-semibold mt-1.5 leading-tight" style={{ color: "#374151" }}>{label}</p>
      <p className="font-inter text-[10px] mt-0.5" style={{ color: "#9CA3AF" }}>{sub}</p>
    </button>
  );
}

export default function AdminDashboard({ onNavigate, isAdmin, memberRole }) {
  const [data, setData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStats(); }, []);

  async function loadStats() {
    try {
      const [members, events, submissions, charges, demands, points, attendance, tasks] = await Promise.all([
        base44.entities.Member.list(),
        base44.entities.Event.list("-date", 100),
        base44.entities.TaskSubmission.list(),
        base44.entities.FinancialCharge.list(),
        base44.entities.DemandRequest.list(),
        base44.entities.PointsLedger.list(),
        base44.entities.Attendance.list(),
        base44.entities.Task.list(),
      ]);

      const today = new Date().toISOString().split("T")[0];
      const nowMs = Date.now();

      // ── MEMBERS ──
      const activeMembers = members.filter(m => m.member_status === "ativo");
      const atRisk = members.filter(m => ["em_risco", "atencao"].includes(m.progress_status));
      const inadimplentes = members.filter(m => ["inadimplente", "vencido"].includes(m.financial_status));

      // Members by cycle
      const cycleKeys = ["qualifier", "1_ciclo", "2_ciclo", "3_ciclo", "fellow", "honorario"];
      const byCycle = cycleKeys.map(c => ({
        name: cycleLabels[c],
        value: members.filter(m => m.cycle === c).length,
      })).filter(c => c.value > 0);

      // Members by status
      const statusMap = {};
      members.forEach(m => { statusMap[m.member_status] = (statusMap[m.member_status] || 0) + 1; });
      const byStatus = Object.entries(statusMap).map(([k, v]) => ({ name: k, value: v }));

      // Members by role
      const roleMap = {};
      members.forEach(m => { roleMap[m.role] = (roleMap[m.role] || 0) + 1; });

      // Top members by points
      const topMembers = [...members]
        .filter(m => (m.total_points || 0) > 0)
        .sort((a, b) => (b.total_points || 0) - (a.total_points || 0))
        .slice(0, 8);

      // Average points
      const avgPoints = activeMembers.length > 0
        ? Math.round(activeMembers.reduce((s, m) => s + (m.total_points || 0), 0) / activeMembers.length)
        : 0;

      // ── EVENTS ──
      const pastEvents = events.filter(e => e.date < today);
      const nextEvents = events.filter(e => e.date >= today);

      // Events by month (last 6 months)
      const monthlyEvents = {};
      for (let i = 5; i >= 0; i--) {
        const d = new Date(); d.setMonth(d.getMonth() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        monthlyEvents[key] = { month: d.toLocaleDateString("pt-BR", { month: "short" }), eventos: 0, presencas: 0 };
      }
      pastEvents.forEach(e => {
        const key = e.date?.slice(0, 7);
        if (monthlyEvents[key]) monthlyEvents[key].eventos++;
      });

      // ── ATTENDANCE ──
      const presentCount = attendance.filter(a => a.status === "presente").length;
      const absentCount = attendance.filter(a => a.status === "ausente").length;
      const justifiedCount = attendance.filter(a => a.status === "ausencia_justificada").length;
      const attendanceRate = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0;

      // Attendance by event (for chart)
      attendance.forEach(a => {
        const ev = events.find(e => e.id === a.event_id);
        if (ev) {
          const key = ev.date?.slice(0, 7);
          if (monthlyEvents[key]) monthlyEvents[key].presencas++;
        }
      });
      const monthlyEventsArr = Object.values(monthlyEvents);

      // ── TASKS ──
      const approvedSubs = submissions.filter(s => ["aprovada", "aprovada_ressalvas"].includes(s.status)).length;
      const pendingSubs = submissions.filter(s => ["enviada", "em_correcao"].includes(s.status)).length;
      const rejectedSubs = submissions.filter(s => s.status === "recusada").length;
      const taskApprovalRate = submissions.length > 0 ? Math.round((approvedSubs / submissions.length) * 100) : 0;

      // ── POINTS ──
      const approvedPoints = points.filter(p => p.status === "aprovado");
      const pendingPoints = points.filter(p => p.status === "pendente").length;
      const totalPointsDistributed = approvedPoints.reduce((s, p) => s + (p.points || 0), 0);

      // Points by category (top 6)
      const ptsByCat = {};
      approvedPoints.forEach(p => { ptsByCat[p.category] = (ptsByCat[p.category] || 0) + p.points; });
      const topCategories = Object.entries(ptsByCat)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([k, v]) => ({ name: k.replace(/_/g, " "), value: v }));

      // ── FINANCIAL ──
      const totalReceivable = charges.reduce((s, c) => s + (c.amount || 0), 0);
      const totalReceived = charges.filter(c => c.status === "em_dia").reduce((s, c) => s + (c.amount || 0), 0);
      const totalOverdue = charges.filter(c => ["vencido", "inadimplente"].includes(c.status)).reduce((s, c) => s + (c.amount || 0), 0);
      const collectionRate = totalReceivable > 0 ? Math.round((totalReceived / totalReceivable) * 100) : 0;

      // ── DEMANDS ──
      const openDemands = demands.filter(d => ["pendente", "em_analise"].includes(d.status)).length;
      const resolvedDemands = demands.filter(d => ["respondida", "resolvida"].includes(d.status)).length;

      setData({
        members, activeMembers, atRisk, inadimplentes,
        byCycle, byStatus, topMembers, avgPoints, roleMap,
        nextEvents, pastEvents, monthlyEventsArr,
        presentCount, absentCount, justifiedCount, attendanceRate,
        approvedSubs, pendingSubs, rejectedSubs, taskApprovalRate,
        pendingPoints, totalPointsDistributed, topCategories,
        totalReceivable, totalReceived, totalOverdue, collectionRate,
        openDemands, resolvedDemands,
      });

      const a = [];
      if (inadimplentes.length > 0) a.push({ type: "danger", msg: `${inadimplentes.length} associado(s) inadimplentes`, section: "financial" });
      if (atRisk.length > 0) a.push({ type: "danger", msg: `${atRisk.length} associado(s) em risco de desligamento`, section: "members" });
      if (pendingSubs > 0) a.push({ type: "warning", msg: `${pendingSubs} tarefa(s) aguardando correção`, section: "tasks" });
      if (openDemands > 0) a.push({ type: "warning", msg: `${openDemands} demanda(s) em aberto`, section: "demands" });
      if (pendingPoints > 0) a.push({ type: "info", msg: `${pendingPoints} ponto(s) aguardando aprovação`, section: "points" });
      setAlerts(a);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  if (loading) return (
    <div className="flex-1 flex items-center justify-center min-h-screen" style={{ background: "#F4F5F7" }}>
      <div className="w-8 h-8 border-4 border-gray-200 border-t-ifl-navy rounded-full animate-spin" />
    </div>
  );

  const d = data;

  const primaryStats = [
    { label: "Total Associados", value: d.members.length, sub: `${d.activeMembers.length} ativos`, icon: Users, color: "#071D33", bg: "rgba(7,29,51,0.07)", section: "members" },
    { label: "Inadimplentes", value: d.inadimplentes.length, sub: "financeiro vencido", icon: DollarSign, color: "#B42318", bg: "rgba(180,35,24,0.07)", section: "financial" },
    { label: "Em Risco", value: d.atRisk.length, sub: "de desligamento", icon: UserX, color: "#D99A22", bg: "rgba(217,154,34,0.08)", section: "members" },
    { label: "Tarefas Pendentes", value: d.pendingSubs, sub: "aguardando revisão", icon: CheckSquare, color: "#7C3AED", bg: "rgba(124,58,237,0.07)", section: "tasks" },
    { label: "Demandas Abertas", value: d.openDemands, sub: "pendentes ou em análise", icon: MessageSquare, color: "#B5862A", bg: "rgba(181,134,42,0.08)", section: "demands" },
    { label: "Próximos Eventos", value: d.nextEvents.length, sub: "agendados", icon: Calendar, color: "#1F8A5B", bg: "rgba(31,138,91,0.07)", section: "events" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#F4F5F7" }}>
      <AdminHeader title="Dashboard Analítico" subtitle="Visão geral completa — IFL Jovem BH" />

      <div className="p-4 lg:p-6 max-w-[1600px] space-y-6">

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="flex flex-col gap-2">
            {alerts.map((a, i) => {
              const cfg = alertColors[a.type];
              const Icon = alertIcon[a.type];
              return (
                <button key={i} onClick={() => onNavigate(a.section)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-left w-full group transition-all hover:brightness-95"
                  style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                  <Icon size={15} style={{ color: cfg.icon, flexShrink: 0 }} />
                  <span className="font-inter text-sm flex-1" style={{ color: cfg.text }}>{a.msg}</span>
                  <ArrowUpRight size={13} style={{ color: cfg.icon, opacity: 0.6 }} className="group-hover:opacity-100" />
                </button>
              );
            })}
          </div>
        )}

        {/* Primary KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {primaryStats.map(s => (
            <StatCard key={s.label} {...s} onNavigate={onNavigate} />
          ))}
        </div>

        {/* Health indicators row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              label: "Taxa de Presença", value: `${d.attendanceRate}%`,
              sub: `${d.presentCount} presenças registradas`,
              color: d.attendanceRate >= 70 ? "#1F8A5B" : d.attendanceRate >= 50 ? "#D99A22" : "#B42318",
              icon: UserCheck,
            },
            {
              label: "Taxa de Aprovação", value: `${d.taskApprovalRate}%`,
              sub: `${d.approvedSubs} de ${d.approvedSubs + d.pendingSubs + d.rejectedSubs} tarefas`,
              color: d.taskApprovalRate >= 70 ? "#1F8A5B" : "#D99A22",
              icon: CheckSquare,
            },
            {
              label: "Arrecadação", value: `${d.collectionRate}%`,
              sub: `R$ ${d.totalReceived?.toFixed(0)} de R$ ${d.totalReceivable?.toFixed(0)}`,
              color: d.collectionRate >= 80 ? "#1F8A5B" : d.collectionRate >= 60 ? "#D99A22" : "#B42318",
              icon: DollarSign,
            },
            {
              label: "Média de Pontos", value: d.avgPoints,
              sub: `entre ${d.activeMembers.length} membros ativos`,
              color: "#7C3AED",
              icon: Star,
            },
          ].map(item => (
            <div key={item.label} className="bg-white rounded-2xl p-4" style={{ border: "1px solid rgba(13,33,55,0.08)" }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${item.color}15` }}>
                  <item.icon size={15} style={{ color: item.color }} />
                </div>
                <span className="font-inter text-xs font-semibold" style={{ color: "#9CA3AF" }}>{item.label}</span>
              </div>
              <p className="font-montserrat font-black text-3xl" style={{ color: item.color }}>{item.value}</p>
              <p className="font-inter text-[10px] mt-1" style={{ color: "#9CA3AF" }}>{item.sub}</p>
            </div>
          ))}
        </div>

        {/* Charts row 1: Monthly events + attendance / Points by category */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Monthly activity chart */}
          <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid rgba(13,33,55,0.08)" }}>
            <h3 className="font-montserrat font-bold text-sm mb-4" style={{ color: "#071D33" }}>
              📅 Atividade Mensal (últimos 6 meses)
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={d.monthlyEventsArr} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(13,33,55,0.05)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={25} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid rgba(13,33,55,0.1)", fontSize: 12 }} />
                <Bar dataKey="eventos" name="Eventos" fill="#071D33" radius={[4, 4, 0, 0]} />
                <Bar dataKey="presencas" name="Presenças" fill="#B5862A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Points by category */}
          <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid rgba(13,33,55,0.08)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-montserrat font-bold text-sm" style={{ color: "#071D33" }}>
                ⭐ Pontos por Categoria
              </h3>
              <span className="font-inter text-xs" style={{ color: "#9CA3AF" }}>Total: {d.totalPointsDistributed.toLocaleString("pt-BR")} pts</span>
            </div>
            {d.topCategories.length === 0 ? (
              <p className="font-inter text-sm text-center py-8" style={{ color: "#D1D5DB" }}>Sem dados</p>
            ) : (
              <div className="space-y-2.5">
                {d.topCategories.map((cat, i) => (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-inter text-xs font-semibold capitalize" style={{ color: "#374151" }}>{cat.name}</span>
                      <span className="font-montserrat font-bold text-xs" style={{ color: COLORS_CYCLE[i % COLORS_CYCLE.length] }}>
                        {cat.value} pts
                      </span>
                    </div>
                    <MiniBar value={cat.value} max={d.topCategories[0]?.value || 1} color={COLORS_CYCLE[i % COLORS_CYCLE.length]} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Charts row 2: Cycle distribution + Member status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Cycle breakdown - bar */}
          <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid rgba(13,33,55,0.08)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-montserrat font-bold text-sm" style={{ color: "#071D33" }}>👥 Membros por Ciclo</h3>
              <button onClick={() => onNavigate("members")} className="font-inter text-xs font-semibold flex items-center gap-1" style={{ color: "#B5862A" }}>
                Ver todos <ArrowUpRight size={11} />
              </button>
            </div>
            <div className="space-y-3">
              {d.byCycle.map((item, i) => (
                <div key={item.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-inter text-xs font-medium" style={{ color: "#374151" }}>{item.name}</span>
                    <span className="font-montserrat font-bold text-sm" style={{ color: COLORS_CYCLE[i] }}>
                      {item.value} <span className="font-inter text-[10px] font-normal" style={{ color: "#9CA3AF" }}>
                        ({d.members.length > 0 ? Math.round(item.value / d.members.length * 100) : 0}%)
                      </span>
                    </span>
                  </div>
                  <MiniBar value={item.value} max={d.members.length} color={COLORS_CYCLE[i]} />
                </div>
              ))}
            </div>
          </div>

          {/* Membership status pie */}
          <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid rgba(13,33,55,0.08)" }}>
            <h3 className="font-montserrat font-bold text-sm mb-2" style={{ color: "#071D33" }}>📊 Status dos Membros</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={d.byStatus} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {d.byStatus.map((_, i) => <Cell key={i} fill={COLORS_STATUS[i % COLORS_STATUS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} formatter={(v, n) => [v, n.replace(/_/g, " ")]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {d.byStatus.map((s, i) => (
                <span key={s.name} className="flex items-center gap-1 font-inter text-[10px]" style={{ color: "#6B7280" }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: COLORS_STATUS[i % COLORS_STATUS.length] }} />
                  {s.name.replace(/_/g, " ")} ({s.value})
                </span>
              ))}
            </div>
          </div>

          {/* Attendance breakdown */}
          <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid rgba(13,33,55,0.08)" }}>
            <h3 className="font-montserrat font-bold text-sm mb-4" style={{ color: "#071D33" }}>📍 Resumo de Presença</h3>
            <div className="space-y-3">
              {[
                { label: "Presentes", value: d.presentCount, color: "#1F8A5B", total: d.presentCount + d.absentCount + d.justifiedCount },
                { label: "Ausentes", value: d.absentCount, color: "#B42318", total: d.presentCount + d.absentCount + d.justifiedCount },
                { label: "Justificadas", value: d.justifiedCount, color: "#D99A22", total: d.presentCount + d.absentCount + d.justifiedCount },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-inter text-xs font-medium" style={{ color: "#374151" }}>{item.label}</span>
                    <span className="font-montserrat font-bold text-sm" style={{ color: item.color }}>
                      {item.value} <span className="font-inter text-[10px] font-normal" style={{ color: "#9CA3AF" }}>
                        ({item.total > 0 ? Math.round(item.value / item.total * 100) : 0}%)
                      </span>
                    </span>
                  </div>
                  <MiniBar value={item.value} max={item.total} color={item.color} />
                </div>
              ))}
              <div className="mt-3 p-3 rounded-xl text-center" style={{ background: "rgba(13,33,55,0.04)" }}>
                <p className="font-montserrat font-black text-2xl" style={{ color: d.attendanceRate >= 70 ? "#1F8A5B" : "#B42318" }}>
                  {d.attendanceRate}%
                </p>
                <p className="font-inter text-xs" style={{ color: "#9CA3AF" }}>taxa geral de presença</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks & Financial row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Tasks overview */}
          <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid rgba(13,33,55,0.08)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-montserrat font-bold text-sm" style={{ color: "#071D33" }}>✅ Tarefas — Visão Geral</h3>
              <button onClick={() => onNavigate("tasks")} className="font-inter text-xs font-semibold" style={{ color: "#B5862A" }}>
                Gerenciar →
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: "Aprovadas", value: d.approvedSubs, color: "#1F8A5B", bg: "rgba(31,138,91,0.08)" },
                { label: "Pendentes", value: d.pendingSubs, color: "#D99A22", bg: "rgba(217,154,34,0.08)" },
                { label: "Recusadas", value: d.rejectedSubs, color: "#B42318", bg: "rgba(180,35,24,0.08)" },
              ].map(item => (
                <div key={item.label} className="rounded-xl p-3 text-center" style={{ background: item.bg }}>
                  <p className="font-montserrat font-black text-xl" style={{ color: item.color }}>{item.value}</p>
                  <p className="font-inter text-[10px] font-semibold mt-0.5" style={{ color: item.color }}>{item.label}</p>
                </div>
              ))}
            </div>
            <div className="p-3 rounded-xl" style={{ background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.12)" }}>
              <div className="flex items-center justify-between">
                <span className="font-inter text-xs" style={{ color: "#6B7280" }}>Taxa de aprovação</span>
                <span className="font-montserrat font-black text-lg" style={{ color: "#7C3AED" }}>{d.taskApprovalRate}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full" style={{ background: "rgba(124,58,237,0.1)" }}>
                <div className="h-2 rounded-full" style={{ width: `${d.taskApprovalRate}%`, background: "#7C3AED" }} />
              </div>
            </div>
          </div>

          {/* Financial overview */}
          <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid rgba(13,33,55,0.08)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-montserrat font-bold text-sm" style={{ color: "#071D33" }}>💰 Financeiro — Visão Geral</h3>
              <button onClick={() => onNavigate("financial")} className="font-inter text-xs font-semibold" style={{ color: "#B5862A" }}>
                Gerenciar →
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: "Recebido", value: `R$${(d.totalReceived || 0).toFixed(0)}`, color: "#1F8A5B", bg: "rgba(31,138,91,0.08)" },
                { label: "A Receber", value: `R$${((d.totalReceivable || 0) - (d.totalReceived || 0) - (d.totalOverdue || 0)).toFixed(0)}`, color: "#D99A22", bg: "rgba(217,154,34,0.08)" },
                { label: "Inadimplente", value: `R$${(d.totalOverdue || 0).toFixed(0)}`, color: "#B42318", bg: "rgba(180,35,24,0.08)" },
              ].map(item => (
                <div key={item.label} className="rounded-xl p-3 text-center" style={{ background: item.bg }}>
                  <p className="font-montserrat font-black text-base leading-tight" style={{ color: item.color }}>{item.value}</p>
                  <p className="font-inter text-[10px] font-semibold mt-0.5" style={{ color: item.color }}>{item.label}</p>
                </div>
              ))}
            </div>
            <div className="p-3 rounded-xl" style={{ background: "rgba(31,138,91,0.05)", border: "1px solid rgba(31,138,91,0.12)" }}>
              <div className="flex items-center justify-between">
                <span className="font-inter text-xs" style={{ color: "#6B7280" }}>Taxa de arrecadação</span>
                <span className="font-montserrat font-black text-lg" style={{ color: "#1F8A5B" }}>{d.collectionRate}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full" style={{ background: "rgba(31,138,91,0.1)" }}>
                <div className="h-2 rounded-full" style={{ width: `${d.collectionRate}%`, background: "#1F8A5B" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Top members ranking */}
        <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid rgba(13,33,55,0.08)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-montserrat font-bold text-sm" style={{ color: "#071D33" }}>🏆 Top Membros por Pontuação</h3>
            <button onClick={() => onNavigate("members")} className="font-inter text-xs font-semibold" style={{ color: "#B5862A" }}>
              Ver ranking completo →
            </button>
          </div>
          {d.topMembers.length === 0 ? (
            <p className="font-inter text-sm text-center py-6" style={{ color: "#D1D5DB" }}>Nenhum ponto registrado ainda</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
              {d.topMembers.map((m, i) => (
                <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: i === 0 ? "rgba(181,134,42,0.07)" : "rgba(13,33,55,0.03)" }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-montserrat font-black text-sm"
                    style={{
                      background: i === 0 ? "rgba(181,134,42,0.2)" : i === 1 ? "rgba(107,114,128,0.15)" : i === 2 ? "rgba(180,100,30,0.15)" : "rgba(13,33,55,0.06)",
                      color: i === 0 ? "#B5862A" : i === 1 ? "#6B7280" : i === 2 ? "#B46418" : "#374151"
                    }}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-inter text-sm font-semibold truncate" style={{ color: "#111827" }}>{m.full_name}</p>
                    <p className="font-inter text-[10px]" style={{ color: "#9CA3AF" }}>
                      {cycleLabels[m.cycle] || m.cycle} · {m.department_name || "Sem diretoria"}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-montserrat font-black text-base" style={{ color: i === 0 ? "#B5862A" : "#071D33" }}>
                      {m.total_points}
                    </p>
                    <p className="font-inter text-[10px]" style={{ color: "#9CA3AF" }}>pts</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid rgba(13,33,55,0.08)" }}>
          <h3 className="font-montserrat font-bold text-sm mb-4" style={{ color: "#071D33" }}>⚡ Ações Rápidas</h3>
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { icon: Calendar, label: "Criar Evento", section: "events", color: "#071D33" },
              { icon: CheckSquare, label: "Corrigir Tarefas", section: "tasks", color: "#D99A22" },
              { icon: Star, label: "Lançar Pontos", section: "points", color: "#7C3AED" },
              { icon: Bell, label: "Novo Aviso", section: "announcements", color: "#1F8A5B" },
              { icon: Target, label: "Oportunidades", section: "opportunities", color: "#B5862A" },
              { icon: MessageSquare, label: "Ver Demandas", section: "demands", color: "#B42318" },
            ].map(item => (
              <button key={item.section} onClick={() => onNavigate(item.section)}
                className="flex flex-col items-center gap-2 py-4 px-2 rounded-xl transition-all hover:shadow-sm"
                style={{ background: `${item.color}07`, border: `1px solid ${item.color}18` }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${item.color}14` }}>
                  <item.icon size={16} style={{ color: item.color }} strokeWidth={1.8} />
                </div>
                <span className="font-inter text-[11px] font-semibold text-center leading-tight" style={{ color: "#374151" }}>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}