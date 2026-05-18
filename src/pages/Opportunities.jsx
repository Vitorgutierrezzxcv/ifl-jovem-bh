import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Star, Calendar, Users, ChevronRight } from "lucide-react";
import MobileHeader from "../components/layout/MobileHeader";

const typeLabels = {
  viagem_sp: "Viagem SP",
  evento_extraordinario: "Extraordinário",
  visita_tecnica: "Visita Técnica",
  forum: "Fórum",
  iflxp: "IFLXP",
  vaga_gerente: "Vaga de Gerente",
  oportunidade_externa: "Oportunidade Externa",
};

export default function Opportunities() {
  const [opps, setOpps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const data = await base44.entities.Opportunity.filter({ status: ["aberta", "encerrada"] }, "-deadline", 15);
      setOpps(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const open = opps.filter(o => o.status === "aberta");
  const closed = opps.filter(o => o.status === "encerrada");

  return (
    <div className="min-h-screen bg-ifl-gray-bg" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 72px)" }}>
      <div style={{ background: "#071D33" }}>
        <MobileHeader title="Oportunidades" dark />
        <div className="px-5 pb-5">
          <h1 className="font-montserrat font-black text-2xl text-white">Oportunidades</h1>
          <p className="font-inter text-sm mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
            {open.length} abertas agora
          </p>
        </div>
      </div>

      <div className="px-4 mt-4">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full animate-spin" style={{ border: "3px solid #B8872A", borderTopColor: "transparent" }} />
          </div>
        ) : (
          <>
            {open.length > 0 && (
              <>
                <h2 className="font-montserrat font-bold text-sm uppercase tracking-wider mb-3" style={{ color: "#071D33" }}>
                  <span style={{ borderBottom: "2px solid #B8872A", paddingBottom: 2 }}>Abertas Agora</span>
                </h2>
                <div className="flex flex-col gap-2 mb-5">
                  {open.map(o => (
                    <OppCard key={o.id} opp={o} />
                  ))}
                </div>
              </>
            )}

            {closed.length > 0 && (
              <>
                <h2 className="font-montserrat font-bold text-sm uppercase tracking-wider mb-3" style={{ color: "#9CA3AF" }}>
                  Encerradas
                </h2>
                <div className="flex flex-col gap-2" style={{ opacity: 0.6 }}>
                  {closed.map(o => (
                    <OppCard key={o.id} opp={o} />
                  ))}
                </div>
              </>
            )}

            {open.length === 0 && closed.length === 0 && (
              <div className="flex flex-col items-center py-16 gap-2">
                <Star size={40} style={{ color: "rgba(7,29,51,0.12)" }} />
                <p className="font-montserrat font-bold text-sm" style={{ color: "#9CA3AF" }}>Nenhuma oportunidade</p>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
}

function OppCard({ opp }) {
  return (
    <div className="rounded-2xl p-4 flex items-start gap-3 card-hover" style={{ background: "#FFFFFF", border: "1px solid rgba(7,29,51,0.06)", boxShadow: "0 2px 8px rgba(7,29,51,0.04)" }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(7,29,51,0.05)" }}>
        <Star size={18} style={{ color: "#B8872A" }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-montserrat font-bold text-sm" style={{ color: "#111827" }}>{opp.title}</p>
        <p className="font-inter text-xs mt-0.5" style={{ color: "#6B7280" }}>
          {typeLabels[opp.type] || opp.type}
        </p>
        {opp.vacancies && (
          <div className="flex items-center gap-2 mt-1">
            <Users size={11} style={{ color: "#9CA3AF" }} />
            <span className="font-inter text-xs" style={{ color: "#9CA3AF" }}>{opp.vacancies} vagas</span>
          </div>
        )}
      </div>
      <ChevronRight size={16} style={{ color: "#D1D5DB" }} />
    </div>
  );
}