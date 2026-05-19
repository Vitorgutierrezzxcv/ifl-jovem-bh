import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { CheckCircle, XCircle, AlertCircle, Clock, ChevronDown, Filter } from "lucide-react";
import AdminHeader from "./AdminHeader";
import StatusBadge from "../ui/StatusBadge";

const statusTabs = [
  { key: "todos", label: "Todos" },
  { key: "enviada", label: "Aguardando" },
  { key: "em_correcao", label: "Em Correção" },
  { key: "aprovada", label: "Aprovadas" },
  { key: "recusada", label: "Recusadas" },
  { key: "ajuste_solicitado", label: "Ajuste" },
];

export default function AdminTasks({ isAdmin, memberRole }) {
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("enviada");
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const [t, s] = await Promise.all([
      base44.entities.Task.list("-due_date", 100),
      base44.entities.TaskSubmission.list("-created_date", 200),
    ]);
    setTasks(t);
    setSubmissions(s);
    setLoading(false);
  }

  const getTaskName = (id) => tasks.find(t => t.id === id)?.title || `Tarefa`;

  const filtered = submissions.filter(s => tab === "todos" || s.status === tab);

  async function updateStatus(id, status) {
    setSaving(true);
    const updates = { status, feedback };
    if (status === "aprovada" || status === "aprovada_ressalvas") {
      updates.reviewed_by = "admin";
    }
    await base44.entities.TaskSubmission.update(id, updates);
    setSaving(false);
    setSelected(null);
    setFeedback("");
    load();
  }

  const counts = {};
  statusTabs.forEach(t => {
    counts[t.key] = t.key === "todos" ? submissions.length : submissions.filter(s => s.status === t.key).length;
  });

  return (
    <div className="min-h-screen" style={{ background: "#F4F5F7" }}>
      <div>
        <AdminHeader title="Fila de Tarefas" subtitle={`${counts["enviada"] || 0} aguardando correção`} />
      </div>

      <div className="p-4 lg:p-6">
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4">
          {statusTabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-inter text-xs font-semibold flex-shrink-0"
              style={{ background: tab === t.key ? "#071D33" : "#FFFFFF", color: tab === t.key ? "#FFF" : "#6B7280", border: tab === t.key ? "none" : "1px solid rgba(13,33,55,0.1)" }}>
              {t.label}
              {counts[t.key] > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px]"
                  style={{ background: tab === t.key ? "rgba(255,255,255,0.2)" : "rgba(13,33,55,0.08)" }}>
                  {counts[t.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {loading ? (
            <div className="flex justify-center py-12"><div className="w-6 h-6 border-4 border-gray-200 border-t-ifl-navy rounded-full animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center">
              <p className="font-inter text-sm" style={{ color: "#9CA3AF" }}>Nenhum envio encontrado</p>
            </div>
          ) : filtered.map(sub => (
            <div key={sub.id} className="bg-white rounded-2xl p-4" style={{ border: "1px solid rgba(13,33,55,0.08)" }}>
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-montserrat font-bold text-sm" style={{ color: "#111827" }}>{getTaskName(sub.task_id)}</p>
                  <p className="font-inter text-xs mt-0.5" style={{ color: "#9CA3AF" }}>{sub.member_name} · {new Date(sub.created_date).toLocaleDateString("pt-BR")}</p>
                  {sub.content && <p className="font-inter text-xs mt-2 line-clamp-2" style={{ color: "#6B7280" }}>{sub.content}</p>}
                  {sub.file_url && (
                    <a href={sub.file_url} target="_blank" rel="noopener noreferrer" className="font-inter text-xs mt-1 inline-block" style={{ color: "#B5862A" }}>
                      Ver anexo →
                    </a>
                  )}
                </div>
                <StatusBadge status={sub.status} />
              </div>

              {(sub.status === "enviada" || sub.status === "reenvio_enviado" || sub.status === "em_correcao") && (
                <div className="mt-3 pt-3 border-t" style={{ borderColor: "rgba(13,33,55,0.06)" }}>
                  {selected === sub.id ? (
                    <div>
                      <textarea value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Feedback (opcional)..." rows={2}
                        className="w-full px-3 py-2 rounded-xl text-xs font-inter resize-none outline-none mb-2"
                        style={{ background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.1)", color: "#374151" }} />
                      <div className="flex gap-2 flex-wrap">
                        <button onClick={() => updateStatus(sub.id, "aprovada")} disabled={saving}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-inter font-semibold text-white"
                          style={{ background: "#1F8A5B" }}>
                          <CheckCircle size={12} /> Aprovar
                        </button>
                        <button onClick={() => updateStatus(sub.id, "aprovada_ressalvas")} disabled={saving}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-inter font-semibold text-white"
                          style={{ background: "#D99A22" }}>
                          <AlertCircle size={12} /> Aprovada c/ ressalvas
                        </button>
                        <button onClick={() => updateStatus(sub.id, "ajuste_solicitado")} disabled={saving}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-inter font-semibold"
                          style={{ background: "rgba(217,154,34,0.1)", color: "#D99A22" }}>
                          <Clock size={12} /> Pedir Ajuste
                        </button>
                        <button onClick={() => updateStatus(sub.id, "recusada")} disabled={saving}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-inter font-semibold"
                          style={{ background: "rgba(180,35,24,0.08)", color: "#B42318" }}>
                          <XCircle size={12} /> Recusar
                        </button>
                        <button onClick={() => { setSelected(null); setFeedback(""); }} className="px-3 py-1.5 rounded-lg text-xs font-inter" style={{ color: "#9CA3AF" }}>
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setSelected(sub.id)} className="flex items-center gap-1 font-inter text-xs font-semibold" style={{ color: "#B5862A" }}>
                      Corrigir tarefa <ChevronDown size={12} />
                    </button>
                  )}
                </div>
              )}

              {sub.feedback && sub.status !== "enviada" && (
                <div className="mt-2 pt-2 border-t" style={{ borderColor: "rgba(13,33,55,0.06)" }}>
                  <p className="font-inter text-xs italic" style={{ color: "#9CA3AF" }}>Feedback: "{sub.feedback}"</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}