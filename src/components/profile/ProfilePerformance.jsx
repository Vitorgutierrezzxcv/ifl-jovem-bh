import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Trophy, CheckCircle2, MessageSquare, Star, TrendingUp, Award } from "lucide-react";

const categoryLabels = {
  palestra: "Palestra",
  auxilio_palestra: "Auxílio Palestra",
  evento_extraordinario: "Evento Extraordinário",
  patrocinio: "Patrocínio",
  iflxp: "IFL XP",
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

const categoryColors = {
  palestra: "#B5862A",
  tarefa: "#1F8A5B",
  evento_ordinario: "#071D33",
  clube_livro: "#6366F1",
  gestao: "#EC4899",
  evento_externo: "#0EA5E9",
  instagram: "#F97316",
  linkedin: "#0D7DB5",
  formacao: "#8B5CF6",
  institucional: "#D99A22",
};

function getCategoryColor(cat) {
  return categoryColors[cat] || "#9CA3AF";
}

const cycleLabels = {
  qualifier: "Qualifier",
  "1_ciclo": "1º Ciclo",
  "2_ciclo": "2º Ciclo",
  "3_ciclo": "3º Ciclo",
  fellow: "Fellow",
};

export default function ProfilePerformance({ member }) {
  const [points, setPoints] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (!member) { setLoading(false); return; }
    async function load() {
      try {
        const [pts, subs, members, tks] = await Promise.all([
          base44.entities.PointsLedger.filter({ member_id: member.id }).catch(() => []),
          base44.entities.TaskSubmission.filter({ member_id: member.id }).catch(() => []),
          base44.entities.Member.filter({ cycle: member.cycle }).catch(() => []),
          base44.entities.Task.list("-due_date", 100).catch(() => []),
        ]);
        setPoints(pts.filter(p => p.status === "aprovado"));
        setSubmissions(subs);
        setAllMembers(members.sort((a, b) => (b.total_points || 0) - (a.total_points || 0)));
        setTasks(tks);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [member]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-7 h-7 rounded-full animate-spin" style={{ border: "3px solid rgba(181,134,42,0.3)", borderTopColor: "#D4A043" }} />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="px-4 pt-8">
        <p className="font-inter text-sm text-center" style={{ color: "rgba(255,255,255,0.5)" }}>
          Não foi possível carregar seus dados de associado.
        </p>
      </div>
    );
  }

  // Points by category
  const byCategory = {};
  points.forEach(p => {
    byCategory[p.category] = (byCategory[p.category] || 0) + p.points;
  });
  const sortedCategories = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  const totalPoints = member?.total_points || 0;

  // Approved submissions with feedback
  const approvedSubs = submissions.filter(s =>
    ["aprovada", "aprovada_ressalvas"].includes(s.status)
  ).sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  // Cycle ranking position
  const cyclePos = allMembers.findIndex(m => m.id === member.id) + 1;
  const cycleTotal = allMembers.length;

  return (
    <div className="px-4 pt-4 flex flex-col gap-4">

      {/* Ranking no ciclo */}
      <div className="rounded-2xl p-4" style={{ background: "#0D2137", border: "1px solid rgba(181,134,42,0.25)" }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "rgba(181,134,42,0.2)" }}>
            <Trophy size={22} style={{ color: "#D4A043" }} />
          </div>
          <div className="flex-1">
            <p className="font-inter text-xs font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>
              Ranking — {cycleLabels[member.cycle] || member.cycle}
            </p>
            <p className="font-montserrat font-black text-2xl text-white">
              {cyclePos > 0 ? `#${cyclePos}` : "—"}
              <span className="font-inter font-normal text-sm ml-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                de {cycleTotal}
              </span>
            </p>
          </div>
          <div className="text-right">
            <p className="font-montserrat font-black text-xl" style={{ color: "#D4A043" }}>{totalPoints}</p>
            <p className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>pontos totais</p>
          </div>
        </div>
      </div>

      {/* Pontos por categoria */}
      <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(181,134,42,0.2)" }}>
        <p className="font-montserrat font-bold text-sm mb-3" style={{ color: "#FFFFFF" }}>
          📊 Pontos por Categoria
        </p>
        {sortedCategories.length === 0 ? (
          <p className="font-inter text-sm text-center py-4" style={{ color: "rgba(255,255,255,0.4)" }}>Nenhum ponto registrado ainda</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {sortedCategories.map(([cat, pts]) => {
              const pct = totalPoints > 0 ? (pts / totalPoints) * 100 : 0;
              const color = getCategoryColor(cat);
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-inter text-xs font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>
                      {categoryLabels[cat] || cat}
                    </span>
                    <span className="font-montserrat font-bold text-xs" style={{ color }}>
                      {pts} pts
                    </span>
                  </div>
                  <div className="h-2 rounded-full w-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ width: `${pct}%`, background: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tarefas aprovadas */}
      <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(181,134,42,0.2)" }}>
        <p className="font-montserrat font-bold text-sm mb-3" style={{ color: "#FFFFFF" }}>
          ✅ Tarefas Aprovadas ({approvedSubs.length})
        </p>
        {approvedSubs.length === 0 ? (
          <p className="font-inter text-sm text-center py-4" style={{ color: "rgba(255,255,255,0.4)" }}>Nenhuma tarefa aprovada ainda</p>
        ) : (
          <div className="flex flex-col gap-3">
            {approvedSubs.map(sub => (
              <div key={sub.id} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="flex-shrink-0 mt-0.5" style={{ color: "#1F8A5B" }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-inter text-sm font-semibold truncate" style={{ color: "#FFFFFF" }}>
                        {tasks.find(t => t.id === sub.task_id)?.title || "Tarefa"}
                      </p>
                      <span className="font-inter text-[10px] flex-shrink-0" style={{ color: "rgba(255,255,255,0.4)" }}>
                        {sub.submitted_at
                          ? new Date(sub.submitted_at).toLocaleDateString("pt-BR")
                          : new Date(sub.created_date).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    {sub.status === "aprovada_ressalvas" && (
                      <span className="font-inter text-[10px] font-semibold px-1.5 py-0.5 rounded-full inline-block mt-0.5"
                        style={{ background: "rgba(217,154,34,0.15)", color: "#D99A22" }}>
                        Aprovada c/ ressalvas
                      </span>
                    )}
                    {sub.feedback && (
                      <div className="mt-2 p-2 rounded-lg flex items-start gap-1.5"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <MessageSquare size={12} className="flex-shrink-0 mt-0.5" style={{ color: "#D4A043" }} />
                        <p className="font-inter text-xs italic leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
                          "{sub.feedback}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}