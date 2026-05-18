import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { CheckSquare, Clock, ChevronRight, Upload, AlertCircle } from "lucide-react";
import MobileHeader from "../components/layout/MobileHeader";
import StatusBadge from "../components/ui/StatusBadge";

const statusFilters = ["Todas", "Pendentes", "Enviadas", "Aprovadas"];

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [filter, setFilter] = useState("Todas");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [me, setMe] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const u = await base44.auth.me();
      setMe(u);
      const members = await base44.entities.Member.filter({ email: u.email });
      const member = members[0];
      const [ts, subs] = await Promise.all([
        base44.entities.Task.filter({ status: "publicada" }, "-due_date", 20),
        member ? base44.entities.TaskSubmission.filter({ member_id: member.id }) : Promise.resolve([]),
      ]);
      setTasks(ts);
      setSubmissions(subs);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  function getSubmission(taskId) {
    return submissions.find(s => s.task_id === taskId);
  }

  function getTaskStatus(task) {
    const sub = getSubmission(task.id);
    if (!sub) {
      const today = new Date().toISOString().split("T")[0];
      if (task.due_date < today) return "expirada";
      return "pendente";
    }
    return sub.status;
  }

  function getDaysLeft(due) {
    const diff = Math.ceil((new Date(due + "T12:00:00") - new Date()) / 86400000);
    if (diff < 0) return { text: "Expirou", color: "#B42318" };
    if (diff === 0) return { text: "Hoje!", color: "#D99A22" };
    if (diff === 1) return { text: "Amanhã", color: "#D99A22" };
    return { text: `${diff} dias`, color: "#6B7280" };
  }

  const filtered = tasks.filter(t => {
    const st = getTaskStatus(t);
    if (filter === "Todas") return true;
    if (filter === "Pendentes") return st === "pendente";
    if (filter === "Enviadas") return ["enviada", "em_correcao", "ajuste_solicitado"].includes(st);
    if (filter === "Aprovadas") return ["aprovada", "aprovada_ressalvas"].includes(st);
    return true;
  });

  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  if (selected) {
    // optimistic: show newly added submission immediately
    const sub = getSubmission(selected.id);
    const dl = getDaysLeft(selected.due_date);
    return (
      <div className="min-h-screen bg-ifl-gray-bg" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)" }}>
        <div style={{ background: "#071D33" }}>
          <div style={{ paddingTop: "env(safe-area-inset-top)" }}>
            <div className="flex items-center gap-3 px-4 py-3">
              <button onClick={() => setSelected(null)} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.1)" }}>
                <ChevronRight size={18} style={{ color: "white", transform: "rotate(180deg)" }} />
              </button>
              <span className="font-montserrat font-bold text-sm text-white">Detalhes da Tarefa</span>
            </div>
          </div>
        </div>
        <div className="px-4 mt-4 flex flex-col gap-3">
          <div className="rounded-2xl p-5" style={{ background: "#FFFFFF", border: "1px solid rgba(7,29,51,0.06)", boxShadow: "0 2px 8px rgba(7,29,51,0.04)" }}>
            <div className="flex items-start justify-between gap-2 mb-3">
              <h2 className="font-montserrat font-bold text-lg flex-1" style={{ color: "#111827" }}>{selected.title}</h2>
              <StatusBadge status={getTaskStatus(selected)} />
            </div>
            {selected.description && <p className="font-inter text-sm leading-relaxed" style={{ color: "#6B7280" }}>{selected.description}</p>}
            <div className="flex items-center gap-2 mt-3">
              <Clock size={14} style={{ color: dl.color }} />
              <span className="font-inter text-xs font-semibold" style={{ color: dl.color }}>{dl.text} — Prazo: {new Date(selected.due_date + "T12:00:00").toLocaleDateString("pt-BR")}</span>
            </div>
            {selected.points_value > 0 && (
              <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: "rgba(184,135,42,0.1)" }}>
                <span className="font-inter text-xs font-bold" style={{ color: "#B8872A" }}>+{selected.points_value} pontos</span>
              </div>
            )}
          </div>

          {sub ? (
            <div className="rounded-2xl p-4" style={{ background: "#FFFFFF", border: "1px solid rgba(7,29,51,0.06)" }}>
              <div className="flex items-center justify-between mb-2">
                <p className="font-montserrat font-bold text-sm" style={{ color: "#071D33" }}>Sua entrega</p>
                {sub._optimistic && (
                  <span className="font-inter text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(31,138,91,0.1)", color: "#1F8A5B" }}>Enviando…</span>
                )}
              </div>
              {sub.content && <p className="font-inter text-sm" style={{ color: "#374151" }}>{sub.content}</p>}
              {sub.feedback && (
                <div className="mt-3 p-3 rounded-xl" style={{ background: "rgba(7,29,51,0.04)" }}>
                  <p className="font-inter text-xs font-bold mb-1" style={{ color: "#071D33" }}>Feedback</p>
                  <p className="font-inter text-sm" style={{ color: "#6B7280" }}>{sub.feedback}</p>
                </div>
              )}
            </div>
          ) : getTaskStatus(selected) !== "expirada" && (
            <SubmitForm
              task={selected}
              me={me}
              onOptimistic={(optimisticSub) => {
                setSubmissions(prev => [...prev, optimisticSub]);
                setSelected(null);
              }}
              onSubmit={(realSub, tempId) => {
                setSubmissions(prev => prev.map(s => s.id === tempId ? realSub : s));
                loadData();
              }}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ifl-gray-bg" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 72px)" }}>
      <div className="hex-bg-dark" style={{ background: "linear-gradient(160deg, #071D33 0%, #0A2640 100%)" }}>
        <MobileHeader title="Tarefas" dark />
        <div className="px-5 pb-5">
          <h1 className="font-montserrat font-black text-2xl text-white">Minhas Tarefas</h1>
          <p className="font-inter text-sm mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
            {tasks.filter(t => getTaskStatus(t) === "pendente").length} pendentes
          </p>
        </div>
      </div>

      <div className="px-4 mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {statusFilters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="flex-shrink-0 px-4 py-2 rounded-2xl font-inter text-xs font-semibold transition-all"
            style={{ background: filter === f ? "#071D33" : "#FFFFFF", color: filter === f ? "#D4A043" : "#6B7280", border: filter === f ? "1px solid rgba(184,135,42,0.3)" : "1px solid rgba(7,29,51,0.08)" }}>
            {f}
          </button>
        ))}
      </div>

      <div className="px-4 mt-4 flex flex-col gap-2">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full animate-spin" style={{ border: "3px solid #B8872A", borderTopColor: "transparent" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-2">
            <CheckSquare size={40} style={{ color: "rgba(7,29,51,0.12)" }} />
            <p className="font-montserrat font-bold text-sm" style={{ color: "#9CA3AF" }}>Nenhuma tarefa</p>
          </div>
        ) : filtered.map(task => {
          const st = getTaskStatus(task);
          const dl = getDaysLeft(task.due_date);
          const isPending = st === "pendente";
          return (
            <button key={task.id} onClick={() => setSelected(task)}
              className="rounded-2xl p-4 flex items-center gap-3 card-hover text-left w-full"
              style={{ background: "#FFFFFF", border: `1px solid ${isPending && dl.color === "#D99A22" ? "rgba(217,154,34,0.25)" : "rgba(7,29,51,0.06)"}`, boxShadow: "0 2px 8px rgba(7,29,51,0.04)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: isPending ? "rgba(7,29,51,0.06)" : "rgba(31,138,91,0.1)" }}>
                {isPending ? <Clock size={18} style={{ color: "#071D33" }} strokeWidth={1.8} />
                  : <CheckSquare size={18} style={{ color: "#1F8A5B" }} strokeWidth={1.8} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-inter text-sm font-semibold truncate" style={{ color: "#111827" }}>{task.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Clock size={11} style={{ color: dl.color }} />
                  <span className="font-inter text-xs" style={{ color: dl.color }}>{dl.text}</span>
                  {task.month && <span className="font-inter text-xs" style={{ color: "#9CA3AF" }}>· {months[task.month - 1]}</span>}
                </div>
              </div>
              <StatusBadge status={st} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SubmitForm({ task, me, onOptimistic, onSubmit }) {
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!content.trim()) return;
    setSaving(true);
    const tempId = `optimistic_${Date.now()}`;
    // Optimistic: show immediately
    const optimisticSub = {
      id: tempId,
      task_id: task.id,
      member_id: me?.id,
      member_name: me?.full_name,
      content,
      status: "enviada",
      submitted_at: new Date().toISOString(),
      _optimistic: true,
    };
    onOptimistic(optimisticSub);
    try {
      const members = await base44.entities.Member.filter({ email: me?.email });
      const member = members[0];
      const sub = await base44.entities.TaskSubmission.create({
        task_id: task.id,
        member_id: member?.id || me?.id,
        member_name: me?.full_name,
        content,
        status: "enviada",
        submitted_at: new Date().toISOString(),
      });
      onSubmit(sub, tempId);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  }

  return (
    <div className="rounded-2xl p-4" style={{ background: "#FFFFFF", border: "1px solid rgba(7,29,51,0.06)" }}>
      <p className="font-montserrat font-bold text-sm mb-3" style={{ color: "#071D33" }}>Enviar resposta</p>
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Escreva sua resposta aqui..."
        rows={5}
        className="w-full rounded-xl p-3 font-inter text-sm resize-none focus:outline-none"
        style={{ background: "#F4F5F6", color: "#111827", border: "1px solid rgba(7,29,51,0.08)" }}
      />
      <button
        onClick={handleSubmit}
        disabled={saving || !content.trim()}
        className="mt-3 w-full h-12 rounded-2xl font-montserrat font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-98"
        style={{ background: saving || !content.trim() ? "rgba(7,29,51,0.1)" : "#071D33", color: saving || !content.trim() ? "#9CA3AF" : "#D4A043" }}>
        <Upload size={16} />
        {saving ? "Enviando..." : "Enviar Tarefa"}
      </button>
    </div>
  );
}