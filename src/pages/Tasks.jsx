import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { CheckSquare, Clock, ChevronRight, Link, FileText, AlertCircle, Paperclip, X, CheckCircle2 } from "lucide-react";
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

export default function Tasks() {
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
      <div className="min-h-screen" style={{ background: "#F0F0F4", paddingBottom: "calc(env(safe-area-inset-bottom) + 96px)" }}>
        <div style={{ background: "#0D2137" }}><MobileHeader title="Tarefa" dark showBack /></div>
        <div className="px-4 pt-4 flex flex-col gap-4">
          {/* Info card */}
          <div className="rounded-2xl p-5" style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.08)" }}>
            <h2 className="font-montserrat font-bold text-lg" style={{ color: "#111827" }}>{selectedTask.title}</h2>
            {selectedTask.description && (
              <p className="font-inter text-sm mt-2 leading-relaxed" style={{ color: "#6B7280" }}>{selectedTask.description}</p>
            )}
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Clock size={13} style={{ color: "#B5862A" }} />
                <span className="font-inter text-xs" style={{ color: "#6B7280" }}>
                  Prazo: {new Date(selectedTask.due_date + "T12:00:00").toLocaleDateString("pt-BR")}
                </span>
              </div>
              {isLate && !sub && (
                <span className="font-inter text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(180,35,24,0.1)", color: "#B42318" }}>ATRASADA</span>
              )}
              {selectedTask.points_value > 0 && (
                <span className="ml-auto font-montserrat font-bold text-sm" style={{ color: "#B5862A" }}>+{selectedTask.points_value} pts</span>
              )}
            </div>
            {selectedTask.cycles_target?.length > 0 && (
              <p className="font-inter text-xs mt-2" style={{ color: "#9CA3AF" }}>Ciclos: {selectedTask.cycles_target.join(", ")}</p>
            )}
          </div>

          {/* Submission area */}
          {sub ? (
            <div className="rounded-2xl p-5" style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.08)" }}>
              <div className="flex items-center justify-between mb-3">
                <p className="font-montserrat font-bold text-sm" style={{ color: "#111827" }}>Sua entrega</p>
                <StatusBadge status={sub.status} />
              </div>
              {sub.content && <p className="font-inter text-sm mt-2 leading-relaxed" style={{ color: "#6B7280" }}>{sub.content}</p>}
              {sub.file_url && (
                <a href={sub.file_url} target="_blank" rel="noreferrer"
                  className="mt-3 flex items-center gap-2 text-xs font-semibold"
                  style={{ color: "#B5862A" }}>
                  <Paperclip size={13} /> Ver arquivo anexado
                </a>
              )}
              {sub.feedback && (
                <div className="mt-4 p-3 rounded-xl" style={{ background: "rgba(13,33,55,0.05)", border: "1px solid rgba(13,33,55,0.08)" }}>
                  <p className="font-inter text-xs font-semibold mb-1" style={{ color: "#0D2137" }}>Feedback da Diretoria</p>
                  <p className="font-inter text-sm" style={{ color: "#374151" }}>{sub.feedback}</p>
                </div>
              )}
              {sub.status === "aprovada" && (
                <div className="mt-3 flex items-center gap-2">
                  <CheckCircle2 size={16} style={{ color: "#1F8A5B" }} />
                  <span className="font-inter text-sm font-semibold" style={{ color: "#1F8A5B" }}>
                    {selectedTask.points_value > 0 ? `+${selectedTask.points_value} pontos creditados!` : "Aprovada!"}
                  </span>
                </div>
              )}
              {["ajuste_solicitado", "recusada"].includes(sub.status) && (
                <button
                  onClick={() => {
                    setSubmissions(prev => prev.filter(s => s.id !== sub.id));
                  }}
                  className="mt-4 w-full py-3 rounded-xl font-montserrat font-bold text-sm"
                  style={{ background: "#0D2137", color: "#FFF" }}>
                  Reenviar tarefa
                </button>
              )}
            </div>
          ) : (
            <div className="rounded-2xl p-5" style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.08)" }}>
              <p className="font-montserrat font-bold text-sm mb-4" style={{ color: "#111827" }}>Enviar Entrega</p>

              {/* Text area */}
              <label className="font-inter text-xs font-semibold block mb-1.5" style={{ color: "#0D2137" }}>
                Descrição / Resposta
              </label>
              <textarea
                className="w-full rounded-xl p-3 font-inter text-sm border resize-none focus:outline-none"
                rows={4}
                placeholder="Descreva sua entrega, resposta ou reflexão sobre a tarefa..."
                value={submissionText}
                onChange={e => setSubmissionText(e.target.value)}
                style={{ borderColor: "rgba(13,33,55,0.12)", background: "#F0F0F4" }}
              />

              {/* Link */}
              <label className="font-inter text-xs font-semibold block mt-3 mb-1.5" style={{ color: "#0D2137" }}>
                Link (Drive, Docs, YouTube, etc.)
              </label>
              <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: "#F0F0F4", border: "1px solid rgba(13,33,55,0.1)" }}>
                <Link size={15} style={{ color: "#6B7280" }} />
                <input
                  className="flex-1 bg-transparent font-inter text-sm outline-none"
                  placeholder="https://..."
                  value={submissionLink}
                  onChange={e => setSubmissionLink(e.target.value)}
                />
              </div>

              {/* File upload */}
              <label className="font-inter text-xs font-semibold block mt-3 mb-1.5" style={{ color: "#0D2137" }}>
                Arquivo (PDF, imagem, etc.)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
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
                  style={{ background: "#F0F0F4", border: "1px dashed rgba(13,33,55,0.2)", color: "#6B7280" }}>
                  <Paperclip size={15} />
                  Anexar arquivo (PDF, imagem...)
                </button>
              )}

              <button
                onClick={handleSubmit}
                disabled={submitting || !canSend}
                className="w-full mt-4 py-3 rounded-xl font-montserrat font-bold text-sm text-white transition-all"
                style={{ background: !canSend || submitting ? "#9CA3AF" : "#0D2137" }}
              >
                {submitting ? "Enviando..." : isLate ? "Enviar (fora do prazo)" : "Enviar Tarefa"}
              </button>
              {isLate && (
                <p className="font-inter text-xs text-center mt-2" style={{ color: "#B42318" }}>
                  Envio fora do prazo — sujeito a análise da Diretoria
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
    <div className="min-h-screen" style={{ background: "#F0F0F4", paddingBottom: "calc(env(safe-area-inset-bottom) + 96px)" }}>
      <MobileHeader title="Tarefas" dark />

      <div className="flex gap-2 px-4 pt-4 pb-2 overflow-x-auto scrollbar-hide">
        {filterTabs.map(tab => {
          const count = countFilter(tab.key);
          const active = activeFilter === tab.key;
          return (
            <button key={tab.key} onClick={() => setActiveFilter(tab.key)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full font-inter text-xs font-semibold"
              style={{
                background: active ? "#0D2137" : "hsl(var(--card))",
                color: active ? "#FFFFFF" : "#6B7280",
                border: active ? "none" : "1px solid rgba(13,33,55,0.1)",
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