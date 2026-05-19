import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Star, Calendar, Users, ChevronRight, Award } from "lucide-react";
import MobileHeader from "../components/layout/MobileHeader";

const typeLabels = {
  viagem_sp: "Viagem SP",
  evento_extraordinario: "Evento Extraordinário",
  visita_tecnica: "Visita Técnica",
  jantar_convidado: "Jantar c/ Convidado",
  forum: "Fórum",
  iflxp: "IFL XP",
  processo_seletivo_interno: "Processo Seletivo",
  vaga_gerente: "Vaga de Gerente",
  vaga_projeto: "Vaga de Projeto",
  premiacao: "Premiação",
  publicacao_artigo: "Publicação de Artigo",
  oportunidade_externa: "Oportunidade Externa",
};

const statusColors = {
  aberta: { bg: "rgba(31,138,91,0.1)", color: "#1F8A5B", label: "Aberta" },
  encerrada: { bg: "rgba(107,114,128,0.1)", color: "#6B7280", label: "Encerrada" },
  resultado_publicado: { bg: "rgba(181,134,42,0.1)", color: "#B5862A", label: "Resultado Publicado" },
};

export default function Opportunities() {
  const [opps, setOpps] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Opportunity.list("-created_date", 50).then(o => {
      setOpps(o.filter(op => op.status !== "rascunho"));
      setLoading(false);
    });
  }, []);

  if (selected) {
    const sc = statusColors[selected.status] || statusColors.aberta;
    return (
      <div className="min-h-screen" style={{ background: "#F0F0F4", paddingBottom: "calc(env(safe-area-inset-bottom) + 96px)" }}>
        <div style={{ background: "#0D2137" }}><MobileHeader title="Oportunidade" dark showBack /></div>
        <div className="px-4 pt-4 flex flex-col gap-4">
          <div className="rounded-2xl p-5" style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.08)" }}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <h2 className="font-montserrat font-bold text-xl flex-1" style={{ color: "#111827" }}>{selected.title}</h2>
              <span className="text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: "rgba(13,33,55,0.08)", color: "#0D2137" }}>
              {typeLabels[selected.type] || selected.type}
            </span>
          </div>
          <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.08)" }}>
            {selected.deadline && (
              <div className="flex items-center gap-3">
                <Calendar size={15} style={{ color: "#B5862A" }} />
                <span className="font-inter text-sm" style={{ color: "#374151" }}>Prazo: {new Date(selected.deadline + "T12:00:00").toLocaleDateString("pt-BR")}</span>
              </div>
            )}
            {selected.vacancies && (
              <div className="flex items-center gap-3">
                <Users size={15} style={{ color: "#B5862A" }} />
                <span className="font-inter text-sm" style={{ color: "#374151" }}>{selected.vacancies} vaga{selected.vacancies > 1 ? "s" : ""}</span>
              </div>
            )}
            {selected.ranking_criteria && (
              <div className="flex items-center gap-3">
                <Award size={15} style={{ color: "#B5862A" }} />
                <span className="font-inter text-sm font-semibold" style={{ color: "#B5862A" }}>Seleção por ranking de pontos</span>
              </div>
            )}
          </div>
          {selected.description && (
            <div className="rounded-2xl p-5" style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.08)" }}>
              <p className="font-montserrat font-bold text-sm mb-2" style={{ color: "#111827" }}>Descrição</p>
              <p className="font-inter text-sm leading-relaxed" style={{ color: "#6B7280" }}>{selected.description}</p>
            </div>
          )}
          {selected.criteria && (
            <div className="rounded-2xl p-5" style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.08)" }}>
              <p className="font-montserrat font-bold text-sm mb-2" style={{ color: "#111827" }}>Critérios</p>
              <p className="font-inter text-sm leading-relaxed" style={{ color: "#6B7280" }}>{selected.criteria}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#F0F0F4", paddingBottom: "calc(env(safe-area-inset-bottom) + 96px)" }}>
      <MobileHeader title="Oportunidades" dark />
      <div className="px-4 pt-4 flex flex-col gap-3">
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-7 h-7 border-4 border-gray-200 border-t-ifl-navy rounded-full animate-spin" /></div>
        ) : opps.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <Star size={40} style={{ color: "#D1D5DB" }} />
            <p className="font-inter text-sm" style={{ color: "#9CA3AF" }}>Nenhuma oportunidade disponível</p>
          </div>
        ) : opps.map(op => {
          const sc = statusColors[op.status] || statusColors.aberta;
          return (
            <button key={op.id} onClick={() => setSelected(op)}
              className="rounded-2xl p-4 flex items-center gap-3 card-hover text-left w-full"
              style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.06)", boxShadow: "0 2px 8px rgba(13,33,55,0.04)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(181,134,42,0.1)" }}>
                <Star size={18} style={{ color: "#B5862A" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-montserrat font-bold text-sm truncate" style={{ color: "#111827" }}>{op.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                  <span className="font-inter text-xs" style={{ color: "#9CA3AF" }}>{typeLabels[op.type] || op.type}</span>
                </div>
              </div>
              <ChevronRight size={16} style={{ color: "#B5862A", flexShrink: 0 }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}