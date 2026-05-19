import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { TrendingUp, CheckCircle, Users } from "lucide-react";

const MONTHS_PT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export default function ProfileAnalytics({ member }) {
  const [ledger, setLedger] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [cycleMembers, setCycleMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!member?.id) return;
    loadAnalytics();
  }, [member?.id]);

  async function loadAnalytics() {
    try {
      const [entries, subs, peers] = await Promise.all([
        base44.entities.PointsLedger.filter({ member_id: member.id, status: "aprovado" }, "-created_date", 100),
        base44.entities.TaskSubmission.filter({ member_id: member.id }),
        member.cycle ? base44.entities.Member.filter({ cycle: member.cycle, member_status: "ativo" }) : Promise.resolve([]),
      ]);
      setLedger(entries);
      setSubmissions(subs);
      setCycleMembers(peers);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // Points per month (last 6 months)
  const pointsByMonth = (() => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return { month: MONTHS_PT[d.getMonth()], year: d.getFullYear(), monthIdx: d.getMonth(), pts: 0 };
    });
    ledger.forEach(entry => {
      const d = new Date(entry.created_date);
      const idx = months.findIndex(m => m.year === d.getFullYear() && m.monthIdx === d.getMonth());
      if (idx !== -1) months[idx].pts += entry.points || 0;
    });
    return months.map(m => ({ name: m.month, Pontos: m.pts }));
  })();

  // Task approval pie
  const taskPie = (() => {
    const aprovadas = submissions.filter(s => s.status === "aprovada" || s.status === "aprovada_ressalvas").length;
    const recusadas = submissions.filter(s => s.status === "recusada").length;
    const pendentes = submissions.filter(s => !["aprovada", "aprovada_ressalvas", "recusada", "expirada"].includes(s.status)).length;
    const total = submissions.length;
    if (total === 0) return [];
    return [
      { name: "Aprovadas", value: aprovadas, color: "#1F8A5B" },
      { name: "Pendentes", value: pendentes, color: "#D99A22" },
      { name: "Recusadas", value: recusadas, color: "#B42318" },
    ].filter(d => d.value > 0);
  })();

  const approvalRate = submissions.length > 0
    ? Math.round((submissions.filter(s => s.status === "aprovada" || s.status === "aprovada_ressalvas").length / submissions.length) * 100)
    : 0;

  // Cycle comparison
  const myPoints = member?.total_points || 0;
  const avgCyclePoints = cycleMembers.length > 0
    ? Math.round(cycleMembers.reduce((a, m) => a + (m.total_points || 0), 0) / cycleMembers.length)
    : 0;
  const topCycle = cycleMembers.length > 0 ? Math.max(...cycleMembers.map(m => m.total_points || 0)) : 0;

  const compareData = [
    { name: "Você", Pontos: myPoints, fill: "#B8872A" },
    { name: "Média do ciclo", Pontos: avgCyclePoints, fill: "#071D33" },
    { name: "Topo do ciclo", Pontos: topCycle, fill: "#1F8A5B" },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div className="rounded-xl px-3 py-2 font-inter text-xs" style={{ background: "#071D33", color: "#fff", border: "1px solid rgba(184,135,42,0.3)" }}>
          <p className="font-bold" style={{ color: "#D4A043" }}>{label}</p>
          <p>{payload[0].value} pts</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full animate-spin" style={{ border: "3px solid #B8872A", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div className="px-4 pb-4 flex flex-col gap-5 mt-4">

      {/* Pontuação por mês */}
      <div className="rounded-2xl p-4" style={{ background: "hsl(var(--card))", border: "1px solid rgba(7,29,51,0.06)", boxShadow: "0 2px 8px rgba(7,29,51,0.04)" }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(184,135,42,0.1)" }}>
            <TrendingUp size={16} style={{ color: "#B8872A" }} strokeWidth={1.8} />
          </div>
          <div>
            <p className="font-montserrat font-bold text-sm" style={{ color: "#111827" }}>Evolução de Pontos</p>
            <p className="font-inter text-xs" style={{ color: "#9CA3AF" }}>Últimos 6 meses</p>
          </div>
        </div>
        {pointsByMonth.every(m => m.Pontos === 0) ? (
          <p className="font-inter text-sm text-center py-6" style={{ color: "#9CA3AF" }}>Sem dados de pontuação ainda</p>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={pointsByMonth} barSize={26}>
              <XAxis dataKey="name" tick={{ fontFamily: "Inter", fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(184,135,42,0.07)" }} />
              <Bar dataKey="Pontos" radius={[6, 6, 0, 0]}>
                {pointsByMonth.map((_, i) => (
                  <Cell key={i} fill={i === pointsByMonth.length - 1 ? "#B8872A" : "#0D2137"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Taxa de aprovação */}
      <div className="rounded-2xl p-4" style={{ background: "hsl(var(--card))", border: "1px solid rgba(7,29,51,0.06)", boxShadow: "0 2px 8px rgba(7,29,51,0.04)" }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(31,138,91,0.1)" }}>
            <CheckCircle size={16} style={{ color: "#1F8A5B" }} strokeWidth={1.8} />
          </div>
          <div>
            <p className="font-montserrat font-bold text-sm" style={{ color: "#111827" }}>Taxa de Aprovação</p>
            <p className="font-inter text-xs" style={{ color: "#9CA3AF" }}>Tarefas enviadas</p>
          </div>
          <div className="ml-auto">
            <span className="font-montserrat font-black text-2xl" style={{ color: approvalRate >= 70 ? "#1F8A5B" : "#D99A22" }}>{approvalRate}%</span>
          </div>
        </div>
        {taskPie.length === 0 ? (
          <p className="font-inter text-sm text-center py-6" style={{ color: "#9CA3AF" }}>Nenhuma tarefa enviada ainda</p>
        ) : (
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={taskPie}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {taskPie.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontFamily: "Inter", fontSize: 11, color: "#6B7280" }}
                />
                <Tooltip
                  formatter={(val, name) => [`${val} tarefa(s)`, name]}
                  contentStyle={{ fontFamily: "Inter", fontSize: 12, borderRadius: 10, border: "1px solid rgba(7,29,51,0.1)" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Comparativo do ciclo */}
      <div className="rounded-2xl p-4" style={{ background: "hsl(var(--card))", border: "1px solid rgba(7,29,51,0.06)", boxShadow: "0 2px 8px rgba(7,29,51,0.04)" }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(7,29,51,0.07)" }}>
            <Users size={16} style={{ color: "#071D33" }} strokeWidth={1.8} />
          </div>
          <div>
            <p className="font-montserrat font-bold text-sm" style={{ color: "#111827" }}>Comparativo do Ciclo</p>
            <p className="font-inter text-xs" style={{ color: "#9CA3AF" }}>{cycleMembers.length} membros ativos no seu ciclo</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={compareData} barSize={38} layout="vertical">
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" tick={{ fontFamily: "Inter", fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} width={80} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(184,135,42,0.07)" }} />
            <Bar dataKey="Pontos" radius={[0, 6, 6, 0]}>
              {compareData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        {/* Summary pills */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {[
            { label: "Você", val: myPoints, color: "#B8872A" },
            { label: "Média", val: avgCyclePoints, color: "#071D33" },
            { label: "Topo", val: topCycle, color: "#1F8A5B" },
          ].map(item => (
            <div key={item.label} className="flex-1 rounded-xl p-2 text-center min-w-0" style={{ background: `${item.color}10`, border: `1px solid ${item.color}20` }}>
              <p className="font-montserrat font-black text-base" style={{ color: item.color }}>{item.val}</p>
              <p className="font-inter text-[10px]" style={{ color: "#9CA3AF" }}>{item.label}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}