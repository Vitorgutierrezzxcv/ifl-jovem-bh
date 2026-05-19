import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Target, TrendingUp, AlertTriangle, CheckCircle2, ChevronRight, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Metas mensais de pontuação por ciclo
const CYCLE_MONTHLY_GOALS = {
  qualifier:  20,
  "1_ciclo":  30,
  "2_ciclo":  40,
  "3_ciclo":  50,
  fellow:     25,
  honorario:  15,
};

const CYCLE_LABELS = {
  qualifier: "Qualifier",
  "1_ciclo": "1º Ciclo",
  "2_ciclo": "2º Ciclo",
  "3_ciclo": "3º Ciclo",
  fellow: "Fellow",
  honorario: "Honorário",
};

function getMonthName(monthIndex) {
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return months[monthIndex];
}

function getAlertConfig(pct, daysLeft, totalDays) {
  const dayProgress = (totalDays - daysLeft) / totalDays; // quanto do mês passou

  if (pct >= 100) {
    return { type: "success", color: "#1F8A5B", bg: "rgba(31,138,91,0.1)", border: "rgba(31,138,91,0.2)", icon: CheckCircle2, label: "Meta atingida!" };
  }
  if (dayProgress > 0.75 && pct < 50) {
    return { type: "danger", color: "#B42318", bg: "rgba(180,35,24,0.1)", border: "rgba(180,35,24,0.2)", icon: AlertTriangle, label: "⚠️ Muito abaixo da meta" };
  }
  if (dayProgress > 0.5 && pct < 60) {
    return { type: "warning", color: "#D99A22", bg: "rgba(217,154,34,0.1)", border: "rgba(217,154,34,0.2)", icon: AlertTriangle, label: "Atenção: pontuação baixa" };
  }
  return { type: "ok", color: "#1F8A5B", bg: "rgba(31,138,91,0.08)", border: "rgba(31,138,91,0.15)", icon: TrendingUp, label: "No caminho certo" };
}

export default function CycleGoals({ member }) {
  const navigate = useNavigate();
  const [monthlyPoints, setMonthlyPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysLeft = totalDays - now.getDate();

  useEffect(() => {
    if (!member) { setLoading(false); return; }

    async function load() {
      // Busca pontos do mês atual
      const allPoints = await base44.entities.PointsLedger.filter({ member_id: member.id });
      const monthStart = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-01`;
      const monthEnd = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(totalDays).padStart(2, "0")}`;

      const thisMonthApproved = allPoints.filter(p => {
        const date = p.created_date?.split("T")[0];
        return p.status === "aprovado" && date >= monthStart && date <= monthEnd;
      });

      const total = thisMonthApproved.reduce((acc, p) => acc + (p.points || 0), 0);
      setMonthlyPoints(total);
      setLoading(false);
    }
    load();
  }, [member]);

  if (!member || loading) return null;

  const goal = CYCLE_MONTHLY_GOALS[member.cycle] || 30;
  const pct = Math.min(100, Math.round((monthlyPoints / goal) * 100));
  const alert = getAlertConfig(pct, daysLeft, totalDays);
  const AlertIcon = alert.icon;

  // Bar color based on progress
  const barColor = pct >= 100
    ? "linear-gradient(90deg, #1F8A5B, #2EA87A)"
    : pct >= 60
    ? "linear-gradient(90deg, #B8872A, #D4A043)"
    : pct >= 30
    ? "linear-gradient(90deg, #D99A22, #E8B53C)"
    : "linear-gradient(90deg, #B42318, #D94236)";

  return (
    <div className="px-4 mt-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-montserrat font-bold text-sm uppercase tracking-wider" style={{ color: "#071D33" }}>
          <span style={{ borderBottom: "2px solid #B8872A", paddingBottom: 2 }}>Meta do Mês</span>
        </h2>
        <button onClick={() => navigate("/pontos")} className="font-inter text-xs font-medium" style={{ color: "#B8872A" }}>
          Ver pontos
        </button>
      </div>

      <div className="rounded-2xl p-4" style={{ background: "hsl(var(--card))", border: "1px solid rgba(7,29,51,0.07)", boxShadow: "0 2px 8px rgba(7,29,51,0.04)" }}>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#071D33" }}>
              <Target size={15} style={{ color: "#D4A043" }} />
            </div>
            <div>
              <p className="font-montserrat font-bold text-sm" style={{ color: "#111827" }}>
                {getMonthName(currentMonth)} · {CYCLE_LABELS[member.cycle]}
              </p>
              <p className="font-inter text-[11px]" style={{ color: "#9CA3AF" }}>
                {daysLeft} dia{daysLeft !== 1 ? "s" : ""} restante{daysLeft !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-montserrat font-black text-xl" style={{ color: pct >= 100 ? "#1F8A5B" : "#0D2137" }}>
              {monthlyPoints}
              <span className="font-inter font-normal text-sm ml-0.5" style={{ color: "#9CA3AF" }}>/{goal}</span>
            </p>
            <p className="font-inter text-[10px]" style={{ color: "#9CA3AF" }}>pontos</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-2">
          <div className="flex justify-between items-center mb-1.5">
            <span className="font-inter text-xs" style={{ color: "#6B7280" }}>Progresso da meta</span>
            <span className="font-montserrat font-bold text-sm" style={{ color: pct >= 100 ? "#1F8A5B" : "#B8872A" }}>{pct}%</span>
          </div>
          <div className="h-3 rounded-full relative overflow-hidden" style={{ background: "rgba(13,33,55,0.07)" }}>
            <div
              className="h-3 rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: barColor }}
            />
            {/* Day progress marker */}
            {pct < 100 && (
              <div
                className="absolute top-0 h-full w-0.5"
                style={{
                  left: `${Math.round(((totalDays - daysLeft) / totalDays) * 100)}%`,
                  background: "rgba(255,255,255,0.6)",
                }}
                title="Progresso do mês"
              />
            )}
          </div>
          <div className="flex justify-between mt-1">
            <span className="font-inter text-[10px]" style={{ color: "#9CA3AF" }}>0</span>
            <span className="font-inter text-[10px]" style={{ color: "#9CA3AF" }}>Meta: {goal} pts</span>
          </div>
        </div>

        {/* Alert / Status */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl mt-1" style={{ background: alert.bg, border: `1px solid ${alert.border}` }}>
          <AlertIcon size={14} style={{ color: alert.color, flexShrink: 0 }} />
          <p className="font-inter text-xs font-semibold flex-1" style={{ color: alert.color }}>
            {alert.label}
          </p>
          {pct < 100 && (
            <span className="font-inter text-[10px]" style={{ color: alert.color }}>
              Faltam {Math.max(0, goal - monthlyPoints)} pts
            </span>
          )}
        </div>

        {/* Quick action */}
        {pct < 100 && (
          <button
            onClick={() => navigate("/tarefas")}
            className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl font-inter text-xs font-semibold card-hover"
            style={{ background: "rgba(7,29,51,0.05)", color: "#071D33" }}
          >
            <Zap size={13} />
            Ver tarefas disponíveis
            <ChevronRight size={13} />
          </button>
        )}
      </div>
    </div>
  );
}