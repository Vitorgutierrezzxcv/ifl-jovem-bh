import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { CheckSquare, Clock, ChevronRight, ChevronLeft, Link, FileText, AlertCircle, Paperclip, X, CheckCircle2, AlertTriangle } from "lucide-react";
import MobileHeader from "../components/layout/MobileHeader";
import StatusBadge from "../components/ui/StatusBadge";

const filterTabs = [
  { key: "pendentes", label: "Pendentes" },
  { key: "enviadas", label: "Enviadas" },
  { key: "aprovadas", label: "Aprovadas" },
  { key: "recusadas", label: "Recusadas" },
  { key: "em_correcao", label: "Em Correção" },
  { key: "atrasadas", label: "Atrasadas" },
  { key: "todas", label: "Todas" },
];

export default function Tasks({ embedded = false }) {
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [member, setMember] = useState(null);
  const [activeFilter, setActiveFilter] = useState("pendentes");
  const [selectedTask, setSelectedTask] = useState(null);
  const [submissionText, setSubmissionText] = useState("");
  const [submissionLink, setSubmissionLink] = useState("");
  const [submissionFile, setSubmissionFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [tks, u] = await Promise.all([
        base44.entities.Task.filter({ status: "publicada" }),
        base44.auth.me().catch(() => null),
      ]);
      setTasks(tks);
      if (u) {
        const members = await base44.entities.Member.filter({ email: u.email });
        if (members.length > 0) {
          setMember(members[0]);
          const subs = await base44.entities.TaskSubmission.filter({ member_id: members[0].id });
          setSubmissions(subs);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  const today = new Date().toISOString().split("T")[0];

  function getSubmission(taskId) {
    return submissions.find(s => s.task_id === taskId);
  }

  function getFilteredTasks() {
    return tasks.filter(task => {
      const sub = getSubmission(task.id);
      const isLate = task.due_date < today && !sub;
      switch (activeFilter) {
        case "pendentes": return !sub && task.due_date >= today;
        case "enviadas": return sub && ["enviada", "enviada_atraso"].includes(sub.status);
        case "aprovadas": return sub && ["aprovada", "aprovada_ressalvas"].includes(sub.status);
        case "recusadas": return sub && sub.status === "recusada";
        case "em_correcao": return sub && sub.status === "em_correcao";
        case "atrasadas": return isLate;
        default: return true;
      }
    });
  }

  function countFilter(key) {
    return tasks.filter(task => {
      const sub = getSubmission(task.id);
      const isLate = task.due_date < today && !sub;
      switch (key) {
        case "pendentes": return !sub && task.due_date >= today;
        case "enviadas": return sub && ["enviada", "enviada_atraso"].includes(sub.status);
        case "aprovadas": return sub && ["aprovada", "aprovada_ressalvas"].includes(sub.status);
        case "recusadas": return sub && sub.status === "recusada";
        case "em_correcao": return sub && sub.status === "em_correcao";
        case "atrasadas": return isLate;
        default: return true;
      }
    }).length;
  }

  async function handleSubmit() {
    if (!member || !selectedTask) return;
    setSubmitting(true);
    const isLate = selectedTask.due_date < today;
    let fileUrl = "";

    if (submissionFile) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: submissionFile });
      fileUrl = file_url;
    }

    await base44.entities.TaskSubmission.create({
      task_id: selectedTask.id,
      member_id: member.id,
      member_name: member.full_name,
      content: submissionText + (submissionLink ? `\n\nLink: ${submissionLink}` : ""),
      file_url: fileUrl,
      status: isLate ? "enviada_atraso" : "enviada",
      submitted_at: new Date().toISOString(),
    });
    await loadData();
    setSelectedTask(null);
    setSubmissionText("");
    setSubmissionLink("");
    setSubmissionFile(null);
    setSubmitting(false);
  }

  const filtered = getFilteredTasks();

  // ── DETAIL VIEW ──
  if (selectedTask) {
    const sub = getSubmission(selectedTask.id);
    const isLate = selectedTask.due_date < today;
    const canSend = submissionText.trim() || submissionLink.trim() || submissionFile;

    return (
      <div className="min-h-screen" style={{ background: "#0D2137", paddingBottom: "calc(env(safe-area-inset-bottom) + 96px)" }}>
        {embedded ? (
          <div className="flex items-center gap-3 px-5" style={{ background: "#0D2137", paddingTop: "calc(env(safe-area-inset-top) + 12px)", paddingBottom: "12px" }}>
            <button onClick={() => setSelectedTask(null)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.1)" }}>
              <ChevronLeft size={20} color="#FFFFFF" strokeWidth={2} />
            </button>
            <p className="font-montserrat font-bold text-sm uppercase tracking-wider text-white">Detalhes da Tarefa</p>
          </div>
        ) : (
          <div style={{ background: "#0D2137" }}><MobileHeader title="Detalhes da Tarefa" dark showBack /></div>
        )}
        <div className="px-4 pt-4 flex flex-col gap-4">
          
          {/* Task Header */}
          <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(181,134,42,0.3)" }}>
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(181,134,42,0.15)" }}>
                <CheckSquare size={20} style={{ color: "#D4A043" }} />
              </div>
              <h1 className="font-montserrat font-black text-lg text-white flex-1">{selectedTask.title}</h1>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl p-2.5" style={{ background: "rgba(255,255,255,0.07)" }}>
                <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.5)" }}>PONTOS</p>
                <p className="font-montserrat font-black text-lg" style={{ color: "#D4A043" }}>
                  {selectedTask.points_value > 0 ? `+${selectedTask.points_value}` : "—"}
                </p>
              </div>
              <div className="rounded-xl p-2.5" style={{ background: "rgba(255,255,255,0.07)" }}>
                <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.5)" }}>PRAZO</p>
                <p className="font-inter font-bold text-sm" style={{ color: isLate && !sub ? "#FF7A6B" : "rgba(255,255,255,0.8)" }}>
                  {new Date(selectedTask.due_date + "T12:00:00").toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>
            
            {isLate && !sub && (
              <div className="mt-2 p-2 rounded-lg flex items-center gap-2" style={{ background: "rgba(180,35,24,0.15)", border: "1px solid rgba(180,35,24,0.2)" }}>
                <AlertCircle size={14} style={{ color: "#B42318" }} />
                <span className="font-inter text-xs font-semibold" style={{ color: "#B42318" }}>Esta tarefa está atrasada</span>
              </div>
            )}
          </div>

          {/* Task Description */}
          {selectedTask.description && (
            <div className="rounded-2xl p-4" style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.08)" }}>
              <p className="font-inter text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#9CA3AF" }}>O que você precisa fazer</p>
              <p className="font-inter text-sm leading-relaxed" style={{ color: "#374151" }}>{selectedTask.description}</p>
            </div>
          )}

          {/* Task Info */}
          {selectedTask.cycles_target?.length > 0 && (
            <div className="rounded-2xl p-4" style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.08)" }}>
              <p className="font-inter text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#9CA3AF" }}>Para quem é</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedTask.cycles_target.map(c => (
                  <span key={c} className="font-inter text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: "rgba(13,33,55,0.08)", color: "#0D2137" }}>
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Submission Status */}
          {sub ? (
            <>
              <div className="rounded-2xl p-4" style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.08)" }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="font-montserrat font-bold text-sm" style={{ color: "#111827" }}>Status da sua entrega</p>
                  <StatusBadge status={sub.status} size="md" />
                </div>
                
                {sub.status === "aprovada" && (
                  <div className="p-3 rounded-xl flex items-start gap-2" style={{ background: "rgba(31,138,91,0.1)", border: "1px solid rgba(31,138,91,0.2)" }}>
                    <CheckCircle2 size={18} style={{ color: "#1F8A5B", flexShrink: 0 }} />
                    <div>
                      <p className="font-inter font-semibold text-sm" style={{ color: "#1F8A5B" }}>
                        Tarefa aprovada!
                      </p>
                      {selectedTask.points_value > 0 && (
                        <p className="font-montserrat font-black text-lg" style={{ color: "#1F8A5B" }}>
                          +{selectedTask.points_value} pontos
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                {sub.status === "aprovada_ressalvas" && (
                  <div className="p-3 rounded-xl flex items-start gap-2" style={{ background: "rgba(217,154,34,0.1)", border: "1px solid rgba(217,154,34,0.2)" }}>
                    <AlertCircle size={18} style={{ color: "#D99A22", flexShrink: 0 }} />
                    <div>
                      <p className="font-inter font-semibold text-sm" style={{ color: "#D99A22" }}>
                        Aprovada com ressalvas
                      </p>
                      {selectedTask.points_value > 0 && (
                        <p className="font-montserrat font-bold text-sm mt-1" style={{ color: "#D99A22" }}>
                          +{selectedTask.points_value} pontos (ver feedback)
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {sub.status === "em_correcao" && (
                  <div className="p-3 rounded-xl flex items-start gap-2" style={{ background: "rgba(217,154,34,0.1)", border: "1px solid rgba(217,154,34,0.2)" }}>
                    <AlertCircle size={18} style={{ color: "#D99A22", flexShrink: 0 }} />
                    <p className="font-inter text-sm" style={{ color: "#D99A22" }}>A Diretoria está analisando sua entrega</p>
                  </div>
                )}

                {sub.status === "recusada" && (
                  <div className="p-3 rounded-xl flex items-start gap-2" style={{ background: "rgba(180,35,24,0.1)", border: "1px solid rgba(180,35,24,0.2)" }}>
                    <AlertCircle size={18} style={{ color: "#B42318", flexShrink: 0 }} />
                    <p className="font-inter text-sm" style={{ color: "#B42318" }}>Sua entrega foi recusada. Verifique o feedback e reenvie.</p>
                  </div>
                )}
              </div>

              {sub.content && (
                <div className="rounded-2xl p-4" style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.08)" }}>
                  <p className="font-inter text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#9CA3AF" }}>Sua resposta</p>
                  <p className="font-inter text-sm leading-relaxed" style={{ color: "#374151" }}>{sub.content}</p>
                </div>
              )}

              {sub.file_url && (
                <div className="rounded-2xl p-4" style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.08)" }}>
                  <p className="font-inter text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#9CA3AF" }}>Arquivo anexado</p>
                  <a href={sub.file_url} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 p-3 rounded-xl"
                    style={{ background: "rgba(13,33,55,0.05)", border: "1px solid rgba(13,33,55,0.1)" }}>
                    <Paperclip size={16} style={{ color: "#B5862A" }} />
                    <span className="font-inter text-sm font-semibold flex-1 truncate" style={{ color: "#0D2137" }}>Ver arquivo</span>
                    <ChevronRight size={16} style={{ color: "#B5862A" }} />
                  </a>
                </div>
              )}

              {sub.feedback && (
                <div className="rounded-2xl p-4" style={{ background: "rgba(184,135,42,0.12)", border: "1px solid rgba(184,135,42,0.3)" }}>
                  <p className="font-montserrat font-bold text-sm mb-2" style={{ color: "#D4A043" }}>💬 Feedback da Diretoria</p>
                  <p className="font-inter text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.8)" }}>{sub.feedback}</p>
                </div>
              )}

              {["ajuste_solicitado", "recusada"].includes(sub.status) && (
                <button
                  onClick={() => {
                    setSubmissions(prev => prev.filter(s => s.id !== sub.id));
                    setSubmissionText("");
                    setSubmissionLink("");
                    setSubmissionFile(null);
                  }}
                  className="w-full py-3 rounded-xl font-montserrat font-bold text-sm text-white"
                  style={{ background: "#0D2137" }}>
                  Reenviar Tarefa
                </button>
              )}
            </>
          ) : (
            <div className="rounded-2xl p-5" style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.08)" }}>
              <p className="font-montserrat font-bold text-sm mb-4" style={{ color: "#111827" }}>📤 Enviar sua entrega</p>

              {/* Text area */}
              <label className="font-inter text-xs font-semibold block mb-1.5" style={{ color: "#0D2137" }}>
                Sua resposta *
              </label>
              <textarea
                className="w-full rounded-xl p-3 font-inter text-sm border resize-none focus:outline-none"
                rows={4}
                placeholder="Escreva sua resposta, reflexão ou descreva o que você fez..."
                value={submissionText}
                onChange={e => setSubmissionText(e.target.value)}
                style={{ borderColor: "rgba(13,33,55,0.12)", background: "rgba(13,33,55,0.04)", color: "#111827" }}
              />

              {/* Link */}
              <label className="font-inter text-xs font-semibold block mt-3 mb-1.5" style={{ color: "#0D2137" }}>
                Link (opcional)
              </label>
              <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: "rgba(13,33,55,0.04)", border: "1px solid rgba(13,33,55,0.1)" }}>
                <Link size={15} style={{ color: "#6B7280" }} />
                <input
                  className="flex-1 bg-transparent font-inter text-sm outline-none"
                  placeholder="Drive, Docs, YouTube, etc."
                  value={submissionLink}
                  onChange={e => setSubmissionLink(e.target.value)}
                />
              </div>

              {/* File upload */}
              <label className="font-inter text-xs font-semibold block mt-3 mb-1.5" style={{ color: "#0D2137" }}>
                Anexar arquivo (opcional)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.mp4,.mov,.webm,.avi,.mkv"
                className="hidden"
                onChange={e => setSubmissionFile(e.target.files[0] || null)}
              />
              {submissionFile ? (
                <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: "rgba(31,138,91,0.06)", border: "1px solid rgba(31,138,91,0.2)" }}>
                  <Paperclip size={14} style={{ color: "#1F8A5B" }} />
                  <span className="font-inter text-sm flex-1 truncate" style={{ color: "#374151" }}>{submissionFile.name}</span>
                  <button onClick={() => setSubmissionFile(null)}><X size={14} style={{ color: "#9CA3AF" }} /></button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl font-inter text-sm"
                  style={{ background: "rgba(13,33,55,0.04)", border: "1px dashed rgba(13,33,55,0.2)", color: "#6B7280" }}>
                  <Paperclip size={15} />
                  Clique para anexar arquivo
                </button>
              )}

              <button
                onClick={handleSubmit}
                disabled={submitting || !canSend}
                className="w-full mt-4 py-3 rounded-xl font-montserrat font-bold text-sm text-white transition-all"
                style={{ background: !canSend || submitting ? "#9CA3AF" : "#B5862A" }}
              >
                {submitting ? "Enviando..." : isLate ? "Enviar (fora do prazo)" : "Enviar Tarefa"}
              </button>
              {isLate && (
                <p className="font-inter text-xs text-center mt-2" style={{ color: "#B42318" }}>
                  ⚠️ Esta tarefa está atrasada — a entrega será analisada pela Diretoria
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── LIST VIEW ──
  return (
    <div className="min-h-screen" style={{ background: "#0D2137", paddingBottom: "calc(env(safe-area-inset-bottom) + 96px)" }}>
      {!embedded && <MobileHeader title="Tarefas" dark />}

      <div className="flex gap-2 px-4 pt-4 pb-2 overflow-x-auto scrollbar-hide">
        {filterTabs.map(tab => {
          const count = countFilter(tab.key);
          const active = activeFilter === tab.key;
          return (
            <button key={tab.key} onClick={() => setActiveFilter(tab.key)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full font-inter text-xs font-semibold"
              style={{
                background: active ? "rgba(181,134,42,0.15)" : "rgba(255,255,255,0.06)",
                color: active ? "#D4A043" : "rgba(255,255,255,0.6)",
                border: active ? "1px solid rgba(181,134,42,0.3)" : "1px solid rgba(255,255,255,0.1)",
              }}>
              {tab.label}
              {count > 0 && (
                <span className="rounded-full px-1.5 py-0.5 text-[10px]"
                  style={{ background: active ? "rgba(255,255,255,0.2)" : "rgba(13,33,55,0.08)" }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="px-4 pt-2 flex flex-col gap-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-7 h-7 border-4 border-gray-200 border-t-ifl-navy rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <CheckSquare size={40} style={{ color: "#D1D5DB" }} />
            <p className="font-inter text-sm" style={{ color: "#9CA3AF" }}>Nenhuma tarefa nesta categoria</p>
          </div>
        ) : filtered.map(task => {
          const sub = getSubmission(task.id);
          const isLate = task.due_date < today && !sub;
          return (
            <button key={task.id} onClick={() => setSelectedTask(task)}
              className="rounded-2xl p-4 flex items-start gap-3 text-left card-hover w-full"
              style={{ background: "hsl(var(--card))", border: isLate ? "1px solid rgba(180,35,24,0.2)" : "1px solid rgba(13,33,55,0.06)", boxShadow: "0 2px 8px rgba(13,33,55,0.04)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: isLate ? "rgba(180,35,24,0.08)" : sub ? "rgba(31,138,91,0.08)" : "rgba(13,33,55,0.06)" }}>
                {isLate ? <AlertCircle size={18} style={{ color: "#B42318" }} /> : <FileText size={18} style={{ color: sub ? "#1F8A5B" : "#0D2137" }} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-montserrat font-bold text-sm" style={{ color: "#111827" }}>{task.title}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {sub ? <StatusBadge status={sub.status} /> : isLate
                    ? <span className="font-inter text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(180,35,24,0.1)", color: "#B42318" }}>Atrasada</span>
                    : <span className="font-inter text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(13,33,55,0.07)", color: "#0D2137" }}>Pendente</span>
                  }
                  <span className="font-inter text-xs" style={{ color: "#9CA3AF" }}>
                    {new Date(task.due_date + "T12:00:00").toLocaleDateString("pt-BR")}
                  </span>
                  {task.points_value > 0 && (
                    <span className="font-montserrat font-bold text-xs ml-auto" style={{ color: "#B5862A" }}>+{task.points_value} pts</span>
                  )}
                </div>
              </div>
              <ChevronRight size={16} style={{ color: "#B5862A", flexShrink: 0, marginTop: 2 }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}