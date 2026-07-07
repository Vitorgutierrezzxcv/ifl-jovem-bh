import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Circle, AlertCircle, ChevronRight, BookOpen, CheckSquare, Calendar, DollarSign, FileText, Star } from "lucide-react";
import MobileHeader from "../components/layout/MobileHeader";
import StatusBadge from "../components/ui/StatusBadge";

const cycleLabels = {
  qualifier: "Qualifier", "1_ciclo": "1º Ciclo", "2_ciclo": "2º Ciclo",
  "3_ciclo": "3º Ciclo", fellow: "Fellow", honorario: "Honorário",
};

export default function Journey() {
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const u = await base44.auth.me();
      const members = await base44.entities.Member.filter({ email: u.email });
      if (members.length > 0) {
        setMember(members[0]);
      } else {
        const all = await base44.entities.Member.list("-total_points", 1);

        if (all.length > 0) setMember(all[0]);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const requirements = [
    { key: "presenca", icon: Calendar, label: "Presença em Eventos Ordinários", target: "≥ 70%", value: `${Math.round(member?.attendance_percentage || 0)}%`, done: (member?.attendance_percentage || 0) >= 70, color: "#D4A043", path: "/presenca" },
    { key: "clube", icon: BookOpen, label: "Clube do Livro", target: "3 de 5", value: "—", done: false, color: "#B5862A", path: "/clube-livro" },
    { key: "formacao", icon: Calendar, label: "Eventos de Formação", target: "3 de 5", value: "—", done: false, color: "#1F8A5B", path: "/agenda" },
    { key: "tarefas", icon: CheckSquare, label: "Tarefas Mensais", target: "3 tarefas", value: "—", done: false, color: "#D4A043", path: "/tarefas" },
    { key: "artigo", icon: FileText, label: "Artigo ROL Literário", target: "1 artigo", value: "—", done: false, color: "#B5862A", path: "/rol" },
    { key: "financeiro", icon: DollarSign, label: "Pendências Financeiras", target: "Sem pendências", value: member?.financial_status === "em_dia" ? "Em dia" : "Pendente", done: member?.financial_status === "em_dia", color: "#1F8A5B", path: "/financeiro" },
  ];

  const donePct = Math.round((requirements.filter(r => r.done).length / requirements.length) * 100);

  const tips = requirements.filter(r => !r.done).map(r => {
    const msgs = {
      presenca: { text: "Sua presença está abaixo de 70%. Compareça aos próximos eventos.", path: "/presenca" },
      clube: { text: "Você precisa participar de mais encontros do Clube do Livro.", path: "/clube-livro" },
      formacao: { text: "Participe dos próximos Eventos Ordinários de Formação.", path: "/agenda" },
      tarefas: { text: "Há tarefas pendentes de envio. Acesse a seção de Tarefas.", path: "/tarefas" },
      artigo: { text: "Envie seu artigo do ROL Literário para análise.", path: "/rol" },
      financeiro: { text: "Regularize sua pendência financeira.", path: "/financeiro" },
    };
    return msgs[r.key];
  });

  return (
    <div className="min-h-screen bg-ifl-gray-bg" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 96px)" }}>
      <div className="hex-bg-dark relative overflow-hidden" style={{ background: "#0D2137" }}>
        <MobileHeader title="Minha Jornada" dark />
        <div className="px-5 pb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-montserrat font-black text-3xl text-white">{donePct}%</p>
              <p className="font-inter text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>requisitos cumpridos</p>
            </div>
            <div className="text-right">
              <p className="font-montserrat font-bold text-base" style={{ color: "#C9973A" }}>
                {member ? cycleLabels[member.cycle] : "—"}
              </p>
              <StatusBadge status={member?.progress_status || "em_dia"} />
            </div>
          </div>
          <div className="h-3 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
            <div className="h-3 rounded-full transition-all duration-700"
              style={{ width: `${donePct}%`, background: "linear-gradient(90deg, #B5862A, #C9973A)" }} />
          </div>
          <p className="font-inter text-xs mt-2" style={{ color: "rgba(255,255,255,0.45)" }}>
            {requirements.filter(r => r.done).length} de {requirements.length} requisitos concluídos
          </p>
        </div>
      </div>

      <div className="px-4 mt-4">
        <div className="rounded-2xl p-4" style={{ background: donePct >= 80 ? "rgba(31,138,91,0.08)" : "rgba(217,154,34,0.08)", border: `1px solid ${donePct >= 80 ? "rgba(31,138,91,0.2)" : "rgba(217,154,34,0.2)"}` }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: donePct >= 80 ? "rgba(31,138,91,0.15)" : "rgba(217,154,34,0.15)" }}>
              {donePct >= 80 ? <Star size={16} style={{ color: "#1F8A5B" }} /> : <AlertCircle size={16} style={{ color: "#D99A22" }} />}
            </div>
            <div>
              <p className="font-montserrat font-bold text-sm" style={{ color: donePct >= 80 ? "#1F8A5B" : "#D99A22" }}>
                {donePct >= 80 ? "Você está apto para análise!" : "Faltam poucos passos"}
              </p>
              <p className="font-inter text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>
                {donePct >= 80 ? "Aguarde a validação da Diretoria de Formação." : `Conclua mais ${requirements.filter(r => !r.done).length} requisito(s) para avançar.`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 mt-5">
        <h2 className="font-montserrat font-bold text-sm uppercase tracking-wider mb-3" style={{ color: "#D4A043" }}>
          <span style={{ borderBottom: "2px solid #B5862A", paddingBottom: 2 }}>Requisitos Anuais</span>
        </h2>
        <div className="flex flex-col gap-2">
          {requirements.map(req => (
            <button key={req.key} onClick={() => navigate(req.path)}
              className="rounded-2xl p-4 flex items-center gap-3 card-hover w-full text-left"
              style={{ background: "#FFFFFF", border: "1px solid rgba(13,33,55,0.06)", boxShadow: "0 2px 8px rgba(13,33,55,0.04)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: req.done ? "rgba(31,138,91,0.1)" : `${req.color}12` }}>
                <req.icon size={18} style={{ color: req.done ? "#1F8A5B" : req.color }} strokeWidth={1.8} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-inter text-sm font-semibold" style={{ color: "#111827" }}>{req.label}</p>
                <p className="font-inter text-xs mt-0.5" style={{ color: "#6B7280" }}>Meta: {req.target}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="font-montserrat font-bold text-sm" style={{ color: req.done ? "#1F8A5B" : "#0D2137" }}>{req.value}</span>
                {req.done ? <CheckCircle2 size={18} style={{ color: "#1F8A5B" }} /> : <ChevronRight size={16} style={{ color: "#B5862A" }} />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {tips.length > 0 && (
        <div className="px-4 mt-5">
          <h2 className="font-montserrat font-bold text-sm uppercase tracking-wider mb-3" style={{ color: "#D4A043" }}>
            <span style={{ borderBottom: "2px solid #B5862A", paddingBottom: 2 }}>Recomendações</span>
          </h2>
          <div className="flex flex-col gap-2">
            {tips.map((tip, i) => (
              <button key={i} onClick={() => navigate(tip.path)}
                className="rounded-2xl p-3 flex items-center gap-3 card-hover w-full text-left"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <ChevronRight size={14} style={{ color: "#D4A043", flexShrink: 0 }} />
                <p className="font-inter text-sm flex-1" style={{ color: "rgba(255,255,255,0.8)" }}>{tip.text}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}