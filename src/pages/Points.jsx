import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Star, Trophy, TrendingUp, ChevronRight } from "lucide-react";
import MobileHeader from "../components/layout/MobileHeader";

const categoryLabels = {
  palestra: "Palestra",
  auxilio_palestra: "Auxílio Palestra",
  evento_extraordinario: "Evento Extraordinário",
  patrocinio: "Patrocínio",
  iflxp: "IFLXP",
  evento_externo: "Evento Externo",
  gestao: "Gestão",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  evento_ordinario: "Evento Ordinário",
  tarefa: "Tarefa",
  clube_livro: "Clube do Livro",
  artigo_rol: "Artigo ROL",
  conteudo_rol: "Conteúdo ROL",
  gerencia: "Gerência",
  institucional: "Institucional",
  comunicacao: "Comunicação",
  formacao: "Formação",
};

const howToEarn = [
  { label: "Participar de palestras ordinárias", pts: "+2 pts", color: "#071D33" },
  { label: "Auxiliar na organização de eventos", pts: "+3 pts", color: "#1F8A5B" },
  { label: "Participar do Clube do Livro", pts: "+1–3 pts", color: "#B8872A" },
  { label: "Publicar artigo no ROL Literário", pts: "+5 pts", color: "#B8872A" },
  { label: "Completar tarefas mensais", pts: "+2 pts", color: "#071D33" },
  { label: "Participar de eventos extraordinários", pts: "+5 pts", color: "#1F8A5B" },
  { label: "Atividades de gestão", pts: "+3–8 pts", color: "#071D33" },
  { label: "Presença em eventos institucionais", pts: "+2 pts", color: "#B8872A" },
];

export default function Points() {
  const [member, setMember] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [rankMembers, setRankMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const u = await base44.auth.me();
      const [members, allMembers] = await Promise.all([
        base44.entities.Member.filter({ email: u.email }),
        base44.entities.Member.filter({ member_status: "ativo" }, "-total_points", 50),
      ]);
      const m = members[0] || allMembers[0];
      if (m) {
        setMember(m);
        const entries = await base44.entities.PointsLedger.filter(
          { member_id: m.id, status: "aprovado" },
          "-created_date",
          30
        );
        setLedger(entries);
      }
      setRankMembers(allMembers.map((rm, i) => ({ ...rm, _rank: i + 1 })));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const myRank = rankMembers.find(m => m.id === member?.id);

  return (
    <div className="min-h-screen bg-ifl-gray-bg" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 96px)" }}>
      {/* Header */}
      <div className="hex-bg-dark relative overflow-hidden" style={{ background: "#071D33" }}>
        <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(184,135,42,0.14) 0%, transparent 70%)", transform: "translate(20%, -20%)" }} />
        <MobileHeader title="Meus Pontos" dark />
        <div className="px-5 pb-6">
          <div className="flex items-end gap-4">
            <div>
              <p className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Total acumulado</p>
              <p className="font-montserrat font-black text-5xl text-white leading-none mt-1">
                {member?.total_points || 0}
              </p>
              <p className="font-inter text-sm mt-1" style={{ color: "#D4A043" }}>pontos</p>
            </div>
            {myRank && (
              <div className="ml-auto rounded-2xl px-4 py-3 text-center"
                style={{ background: "rgba(184,135,42,0.18)", border: "1px solid rgba(184,135,42,0.3)" }}>
                <p className="font-montserrat font-black text-2xl" style={{ color: "#D4A043" }}>#{myRank._rank}</p>
                <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.5)" }}>no ranking</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* History */}
      <div className="px-4 mt-5">
        <h2 className="font-montserrat font-bold text-xs uppercase tracking-wider mb-3"
          style={{ color: "#6B7280" }}>
          Histórico de pontos
        </h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-7 h-7 rounded-full animate-spin" style={{ border: "3px solid #B8872A", borderTopColor: "transparent" }} />
          </div>
        ) : ledger.length === 0 ? (
          <div className="flex flex-col items-center py-10 gap-2">
            <Star size={36} style={{ color: "rgba(7,29,51,0.12)" }} />
            <p className="font-inter text-sm" style={{ color: "#9CA3AF" }}>Nenhum ponto registrado ainda</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {ledger.map(entry => (
              <div key={entry.id} className="rounded-2xl px-4 py-3 flex items-center gap-3"
                style={{ background: "hsl(var(--card))", border: "1px solid rgba(7,29,51,0.06)", boxShadow: "0 2px 8px rgba(7,29,51,0.03)" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(184,135,42,0.1)" }}>
                  <Star size={16} style={{ color: "#B8872A" }} strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-inter text-sm font-semibold truncate" style={{ color: "#111827" }}>
                    {entry.action || categoryLabels[entry.category] || entry.category}
                  </p>
                  <p className="font-inter text-xs mt-0.5" style={{ color: "#9CA3AF" }}>
                    {entry.source_name || categoryLabels[entry.category]}
                    {entry.created_date && ` · ${new Date(entry.created_date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}`}
                  </p>
                </div>
                <span className="font-montserrat font-black text-base" style={{ color: "#1F8A5B" }}>
                  +{entry.points}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* How to earn */}
      <div className="px-4 mt-6">
        <h2 className="font-montserrat font-bold text-xs uppercase tracking-wider mb-3"
          style={{ color: "#6B7280" }}>
          Como ganhar mais pontos
        </h2>
        <div className="rounded-2xl overflow-hidden" style={{ background: "hsl(var(--card))", border: "1px solid rgba(7,29,51,0.06)" }}>
          {howToEarn.map((item, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3"
              style={{ borderBottom: i < howToEarn.length - 1 ? "1px solid rgba(7,29,51,0.05)" : "none" }}>
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
              <p className="flex-1 font-inter text-sm" style={{ color: "#374151" }}>{item.label}</p>
              <span className="font-montserrat font-bold text-sm" style={{ color: item.color }}>{item.pts}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}