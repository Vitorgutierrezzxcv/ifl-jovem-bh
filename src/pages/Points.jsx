import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Star, Trophy, TrendingUp, ChevronRight, Clock, XCircle, CheckCircle } from "lucide-react";
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
  { label: "Participar de palestras ordinárias", pts: "+2 pts", color: "#B5862A" },
  { label: "Auxiliar na organização de eventos", pts: "+3 pts", color: "#1F8A5B" },
  { label: "Participar do Clube do Livro", pts: "+1–3 pts", color: "#B8872A" },
  { label: "Publicar artigo no ROL Literário", pts: "+5 pts", color: "#B8872A" },
  { label: "Completar tarefas mensais", pts: "+2 pts", color: "#B5862A" },
  { label: "Participar de eventos extraordinários", pts: "+5 pts", color: "#1F8A5B" },
  { label: "Atividades de gestão", pts: "+3–8 pts", color: "#B5862A" },
  { label: "Presença em eventos institucionais", pts: "+2 pts", color: "#B8872A" },
];

export default function Points() {
  const [member, setMember] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [rankMembers, setRankMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [pendingLedger, setPendingLedger] = useState([]);
  const [rejectedLedger, setRejectedLedger] = useState([]);
  const [tab, setTab] = useState("aprovado");

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
        const [approved, pending, rejected] = await Promise.all([
          base44.entities.PointsLedger.filter({ member_id: m.id, status: "aprovado" }, "-created_date", 50),
          base44.entities.PointsLedger.filter({ member_id: m.id, status: "pendente" }, "-created_date", 20),
          base44.entities.PointsLedger.filter({ member_id: m.id, status: "recusado" }, "-created_date", 20),
        ]);
        setLedger(approved);
        setPendingLedger(pending);
        setRejectedLedger(rejected);
      }
      setRankMembers(allMembers.map((rm, i) => ({ ...rm, _rank: i + 1 })));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const myRank = rankMembers.find(m => m.id === member?.id);

  return (
    <div className="min-h-screen bg-ifl-gray-bg" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 96px)" }}>
      {/* Header */}
      <div className="hex-bg-dark relative overflow-hidden" style={{ background: "#0D2137" }}>
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

      {/* Tabs */}
      <div className="px-4 mt-5">
        <div className="flex gap-2 mb-4">
          {[
            { key: "aprovado", label: "Aprovados", count: ledger.length },
            { key: "pendente", label: "Pendentes", count: pendingLedger.length },
            { key: "recusado", label: "Recusados", count: rejectedLedger.length },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-inter text-xs font-semibold"
              style={{ background: tab === t.key ? "rgba(181,134,42,0.15)" : "rgba(255,255,255,0.06)", color: tab === t.key ? "#D4A043" : "rgba(255,255,255,0.6)", border: tab === t.key ? "1px solid rgba(181,134,42,0.3)" : "1px solid rgba(255,255,255,0.1)" }}>
              {t.label}
              {t.count > 0 && <span className="text-[10px]">({t.count})</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-7 h-7 rounded-full animate-spin" style={{ border: "3px solid #B8872A", borderTopColor: "transparent" }} />
          </div>
        ) : (
          <>
            {tab === "aprovado" && (ledger.length === 0 ? (
              <div className="flex flex-col items-center py-10 gap-2">
                <Star size={36} style={{ color: "rgba(255,255,255,0.15)" }} />
                <p className="font-inter text-sm" style={{ color: "#9CA3AF" }}>Nenhum ponto aprovado ainda</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {ledger.map(entry => (
                  <div key={entry.id} className="rounded-2xl px-4 py-3 flex items-center gap-3"
                    style={{ background: "hsl(var(--card))", border: "1px solid rgba(7,29,51,0.06)" }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(184,135,42,0.1)" }}>
                      <CheckCircle size={16} style={{ color: "#1F8A5B" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-inter text-sm font-semibold truncate" style={{ color: "#111827" }}>
                        {entry.action || categoryLabels[entry.category] || entry.category}
                      </p>
                      <p className="font-inter text-xs mt-0.5" style={{ color: "#9CA3AF" }}>
                        {categoryLabels[entry.category] || entry.category}
                        {entry.created_date && ` · ${new Date(entry.created_date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}`}
                        {entry.notes && ` · ${entry.notes}`}
                      </p>
                    </div>
                    <span className="font-montserrat font-black text-base" style={{ color: "#1F8A5B" }}>
                      +{entry.points}
                    </span>
                  </div>
                ))}
              </div>
            ))}

            {tab === "pendente" && (pendingLedger.length === 0 ? (
              <div className="flex flex-col items-center py-10 gap-2">
                <Clock size={36} style={{ color: "rgba(255,255,255,0.15)" }} />
                <p className="font-inter text-sm" style={{ color: "#9CA3AF" }}>Nenhum ponto pendente</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {pendingLedger.map(entry => (
                  <div key={entry.id} className="rounded-2xl px-4 py-3 flex items-center gap-3"
                    style={{ background: "hsl(var(--card))", border: "1px solid rgba(217,154,34,0.2)" }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(217,154,34,0.1)" }}>
                      <Clock size={16} style={{ color: "#D99A22" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-inter text-sm font-semibold truncate" style={{ color: "#111827" }}>
                        {entry.action || categoryLabels[entry.category] || entry.category}
                      </p>
                      <p className="font-inter text-xs mt-0.5" style={{ color: "#9CA3AF" }}>
                        Aguardando aprovação · {new Date(entry.created_date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                      </p>
                    </div>
                    <span className="font-montserrat font-black text-base" style={{ color: "#D99A22" }}>
                      +{entry.points}
                    </span>
                  </div>
                ))}
              </div>
            ))}

            {tab === "recusado" && (rejectedLedger.length === 0 ? (
              <div className="flex flex-col items-center py-10 gap-2">
                <XCircle size={36} style={{ color: "rgba(255,255,255,0.15)" }} />
                <p className="font-inter text-sm" style={{ color: "#9CA3AF" }}>Nenhum ponto recusado</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {rejectedLedger.map(entry => (
                  <div key={entry.id} className="rounded-2xl px-4 py-3 flex items-center gap-3"
                    style={{ background: "hsl(var(--card))", border: "1px solid rgba(180,35,24,0.15)" }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(180,35,24,0.08)" }}>
                      <XCircle size={16} style={{ color: "#B42318" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-inter text-sm font-semibold truncate" style={{ color: "#374151" }}>
                        {entry.action || categoryLabels[entry.category] || entry.category}
                      </p>
                      <p className="font-inter text-xs mt-0.5" style={{ color: "#9CA3AF" }}>
                        {new Date(entry.created_date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                        {entry.notes && ` · ${entry.notes}`}
                      </p>
                    </div>
                    <span className="font-montserrat font-black text-base" style={{ color: "#B42318" }}>
                      {entry.points}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </>
        )}
      </div>

      {/* How to earn */}
      <div className="px-4 mt-6">
        <h2 className="font-montserrat font-bold text-xs uppercase tracking-wider mb-3"
          style={{ color: "#D4A043" }}>
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