import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Inbox, Plus, Check, X, ChevronDown, Search, Users,
  Calendar, Star, AlertCircle, CheckCircle, Clock,
} from "lucide-react";
import AdminHeader from "./AdminHeader";

const activityTypes = [
  { value: "mesa_redonda", label: "Mesa Redonda" },
  { value: "evento_extraordinario", label: "Evento Extraordinário" },
  { value: "evento_ordinario", label: "Evento Ordinário" },
  { value: "lanche_recepcao_sombra", label: "Lanche / Recepção / Sombra" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "stories_nichat", label: "Stories / NiChat" },
  { value: "clube_livro_presenca", label: "Clube do Livro — Presença" },
  { value: "clube_livro_leitura", label: "Clube do Livro — Leitura" },
  { value: "clube_livro_participacao", label: "Clube do Livro — Participação Ativa" },
  { value: "tarefa", label: "Tarefa" },
  { value: "outros", label: "Outros" },
];

const sourceDepts = [
  { value: "comunicacao", label: "Comunicação", color: "#0EA5E9" },
  { value: "eventos", label: "Eventos", color: "#6366F1" },
  { value: "formacao", label: "Formação", color: "#7C3AED" },
  { value: "financeiro", label: "Financeiro", color: "#D99A22" },
  { value: "institucional", label: "Institucional", color: "#1F8A5B" },
  { value: "presidencia", label: "Presidência", color: "#B5862A" },
  { value: "outros", label: "Outros", color: "#6B7280" },
];

const statusConfig = {
  recebido: { label: "Recebido", color: "#0EA5E9", bg: "rgba(14,165,233,0.08)" },
  em_analise: { label: "Em Análise", color: "#D99A22", bg: "rgba(217,154,34,0.08)" },
  aprovado: { label: "Aprovado", color: "#1F8A5B", bg: "rgba(31,138,91,0.08)" },
  rejeitado: { label: "Rejeitado", color: "#B42318", bg: "rgba(180,35,24,0.08)" },
  aplicado: { label: "Aplicado", color: "#071D33", bg: "rgba(7,29,51,0.07)" },
};

// Activity → PointsLedger category mapping
const activityToCategory = {
  mesa_redonda: "evento_ordinario",
  evento_extraordinario: "evento_extraordinario",
  evento_ordinario: "evento_ordinario",
  lanche_recepcao_sombra: "gestao",
  linkedin: "linkedin",
  stories_nichat: "instagram",
  clube_livro_presenca: "clube_livro",
  clube_livro_leitura: "clube_livro",
  clube_livro_participacao: "clube_livro",
  tarefa: "tarefa",
  outros: "institucional",
};

const EMPTY_FORM = {
  title: "", activity_type: "evento_extraordinario", source_department: "eventos",
  event_date: "", suggested_points: 2, member_ids: "", member_names: "", notes: "",
};

export default function AdminPointsQueue({ isAdmin, memberRole }) {
  const [queue, setQueue] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("recebido");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const [q, m, u] = await Promise.all([
      base44.entities.PointsQueue.list("-created_date", 200),
      base44.entities.Member.filter({ member_status: "ativo" }),
      base44.auth.me().catch(() => null),
    ]);
    setQueue(q);
    setMembers(m);
    setUser(u);
    setLoading(false);
  }

  const tabs = [
    { key: "recebido", label: "Recebidos" },
    { key: "em_analise", label: "Em Análise" },
    { key: "aprovado", label: "Aprovados" },
    { key: "aplicado", label: "Aplicados" },
    { key: "rejeitado", label: "Rejeitados" },
    { key: "todos", label: "Todos" },
  ];

  const filtered = queue.filter(q => tab === "todos" || q.status === tab);

  const filteredMembers = members.filter(m =>
    !memberSearch || m.full_name.toLowerCase().includes(memberSearch.toLowerCase())
  );

  function toggleMember(m) {
    setSelectedMembers(prev => {
      const exists = prev.find(p => p.id === m.id);
      return exists ? prev.filter(p => p.id !== m.id) : [...prev, m];
    });
  }

  async function submitForm() {
    if (!form.title || selectedMembers.length === 0) return;
    setSaving(true);
    const payload = {
      ...form,
      suggested_points: Number(form.suggested_points),
      member_ids: selectedMembers.map(m => m.id).join(","),
      member_names: selectedMembers.map(m => m.full_name).join(", "),
      status: "recebido",
      submitted_by: user?.full_name || user?.email || "",
      submitted_by_dept: form.source_department,
    };
    await base44.entities.PointsQueue.create(payload);
    setShowForm(false);
    setForm(EMPTY_FORM);
    setSelectedMembers([]);
    setMemberSearch("");
    setSaving(false);
    load();
  }

  async function updateStatus(id, newStatus, notes) {
    setSaving(true);
    const item = queue.find(q => q.id === id);
    await base44.entities.PointsQueue.update(id, {
      status: newStatus,
      reviewed_by: user?.full_name || user?.email || "",
      review_notes: notes || "",
    });

    // If applying, create PointsLedger entries for each member
    if (newStatus === "aplicado" && item) {
      const memberIdList = (item.member_ids || "").split(",").map(s => s.trim()).filter(Boolean);
      const memberNameList = (item.member_names || "").split(",").map(s => s.trim()).filter(Boolean);
      const category = activityToCategory[item.activity_type] || "institucional";

      for (let i = 0; i < memberIdList.length; i++) {
        const mId = memberIdList[i];
        const mName = memberNameList[i] || "";
        const member = members.find(m => m.id === mId);
        await base44.entities.PointsLedger.create({
          member_id: mId,
          member_name: mName,
          points: item.suggested_points,
          category,
          action: item.title,
          source_type: "queue",
          source_id: item.id,
          source_name: item.title,
          status: "aprovado",
          notes: item.notes || "",
        });
        if (member) {
          await base44.entities.Member.update(mId, {
            total_points: (member.total_points || 0) + item.suggested_points,
          });
        }
      }
    }

    setSaving(false);
    setSelected(null);
    setReviewNotes("");
    load();
  }

  const canReview = isAdmin || ["presidente", "vice_presidente", "diretor"].includes(memberRole);

  return (
    <div className="min-h-screen" style={{ background: "#F4F5F7" }}>
      <AdminHeader
        title="Fila de Pontuação"
        subtitle="Lançamentos das diretorias aguardando validação da Formação"
        actions={
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-inter font-semibold text-white"
            style={{ background: "#0D2137" }}>
            <Plus size={14} /> Enviar Lista
          </button>
        }
      />

      <div className="p-4 lg:p-6">
        {/* Status tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4">
          {tabs.map(t => {
            const cnt = t.key === "todos" ? queue.length : queue.filter(q => q.status === t.key).length;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-inter text-xs font-semibold flex-shrink-0"
                style={{ background: tab === t.key ? "#0D2137" : "#FFFFFF", color: tab === t.key ? "white" : "#6B7280", border: tab === t.key ? "none" : "1px solid rgba(13,33,55,0.1)" }}>
                {t.label}
                {cnt > 0 && (
                  <span className="font-inter text-[10px] px-1 rounded"
                    style={{ background: tab === t.key ? "rgba(255,255,255,0.2)" : "rgba(13,33,55,0.07)" }}>
                    {cnt}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-4 border-gray-200 border-t-ifl-navy rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-2">
            <Inbox size={36} style={{ color: "#D1D5DB" }} />
            <p className="font-inter text-sm" style={{ color: "#9CA3AF" }}>Nenhum item nesta fila</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(item => {
              const dept = sourceDepts.find(d => d.value === item.source_department);
              const act = activityTypes.find(a => a.value === item.activity_type);
              const scfg = statusConfig[item.status] || statusConfig.recebido;
              const memberList = (item.member_names || "").split(",").map(s => s.trim()).filter(Boolean);

              return (
                <div key={item.id} className="bg-white rounded-2xl p-4" style={{ border: "1px solid rgba(13,33,55,0.08)" }}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${dept?.color || "#6B7280"}12` }}>
                      <Inbox size={16} style={{ color: dept?.color || "#6B7280" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-montserrat font-bold text-sm" style={{ color: "#111827" }}>{item.title}</p>
                        <span className="font-inter text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{ background: scfg.bg, color: scfg.color }}>
                          {scfg.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="font-inter text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                          style={{ background: `${dept?.color || "#6B7280"}12`, color: dept?.color || "#6B7280" }}>
                          {dept?.label}
                        </span>
                        <span className="font-inter text-xs" style={{ color: "#9CA3AF" }}>{act?.label}</span>
                        {item.event_date && (
                          <span className="font-inter text-xs" style={{ color: "#9CA3AF" }}>
                            · {new Date(item.event_date + "T12:00:00").toLocaleDateString("pt-BR")}
                          </span>
                        )}
                      </div>

                      {/* Members */}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {memberList.slice(0, 6).map(name => (
                          <span key={name} className="font-inter text-[10px] px-1.5 py-0.5 rounded-full"
                            style={{ background: "rgba(13,33,55,0.06)", color: "#374151" }}>
                            {name}
                          </span>
                        ))}
                        {memberList.length > 6 && (
                          <span className="font-inter text-[10px]" style={{ color: "#9CA3AF" }}>+{memberList.length - 6} mais</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <span className="font-montserrat font-bold text-sm" style={{ color: "#B5862A" }}>
                          {item.suggested_points} pts/pessoa
                        </span>
                        <span className="font-inter text-[10px]" style={{ color: "#9CA3AF" }}>
                          Total: {memberList.length * item.suggested_points} pts · Por: {item.submitted_by}
                        </span>
                      </div>

                      {item.notes && (
                        <p className="font-inter text-xs italic mt-1" style={{ color: "#9CA3AF" }}>{item.notes}</p>
                      )}
                      {item.review_notes && (
                        <p className="font-inter text-xs mt-1 p-2 rounded-lg" style={{ background: "rgba(31,138,91,0.06)", color: "#374151" }}>
                          📋 {item.review_notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {canReview && ["recebido", "em_analise"].includes(item.status) && (
                    <>
                      {selected === item.id ? (
                        <div className="mt-3 pt-3 border-t" style={{ borderColor: "rgba(13,33,55,0.06)" }}>
                          <textarea value={reviewNotes} onChange={e => setReviewNotes(e.target.value)}
                            placeholder="Observação da revisão (opcional)..." rows={2}
                            className="w-full px-3 py-2 rounded-xl text-xs font-inter resize-none outline-none mb-2"
                            style={{ background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.1)", color: "#374151" }} />
                          <div className="flex gap-2 flex-wrap">
                            <button onClick={() => updateStatus(item.id, "em_analise", reviewNotes)} disabled={saving}
                              className="px-3 py-1.5 rounded-lg text-xs font-inter font-semibold"
                              style={{ background: "rgba(217,154,34,0.1)", color: "#D99A22" }}>
                              Em Análise
                            </button>
                            <button onClick={() => updateStatus(item.id, "aplicado", reviewNotes)} disabled={saving}
                              className="px-3 py-1.5 rounded-lg text-xs font-inter font-semibold text-white"
                              style={{ background: "#1F8A5B" }}>
                              ✓ Aprovar e Aplicar Pontos
                            </button>
                            <button onClick={() => updateStatus(item.id, "rejeitado", reviewNotes)} disabled={saving}
                              className="px-3 py-1.5 rounded-lg text-xs font-inter font-semibold"
                              style={{ background: "rgba(180,35,24,0.08)", color: "#B42318" }}>
                              Rejeitar
                            </button>
                            <button onClick={() => { setSelected(null); setReviewNotes(""); }}
                              className="text-xs font-inter px-2" style={{ color: "#9CA3AF" }}>
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setSelected(item.id)}
                          className="mt-2 flex items-center gap-1 font-inter text-xs font-semibold"
                          style={{ color: "#B5862A" }}>
                          Revisar / Validar <ChevronDown size={12} />
                        </button>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add to queue modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.55)" }}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "rgba(13,33,55,0.08)" }}>
              <h2 className="font-montserrat font-bold text-base" style={{ color: "#071D33" }}>Enviar Lista para Formação</h2>
              <button onClick={() => { setShowForm(false); setSelectedMembers([]); setForm(EMPTY_FORM); }}
                className="p-1.5 rounded-lg" style={{ background: "rgba(13,33,55,0.06)" }}>
                <X size={15} style={{ color: "#374151" }} />
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4">

              <div>
                <label className="font-inter text-xs font-semibold block mb-1.5" style={{ color: "#6B7280" }}>Título da atividade *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Ex: Mesa Redonda — Liderança — 15/05"
                  className="w-full px-3 py-2.5 rounded-xl text-sm font-inter outline-none"
                  style={{ background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.1)", color: "#374151" }} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-inter text-xs font-semibold block mb-1.5" style={{ color: "#6B7280" }}>Tipo de atividade</label>
                  <select value={form.activity_type} onChange={e => setForm({ ...form, activity_type: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl text-sm font-inter outline-none"
                    style={{ background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.1)", color: "#374151" }}>
                    {activityTypes.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-inter text-xs font-semibold block mb-1.5" style={{ color: "#6B7280" }}>Diretoria responsável</label>
                  <select value={form.source_department} onChange={e => setForm({ ...form, source_department: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl text-sm font-inter outline-none"
                    style={{ background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.1)", color: "#374151" }}>
                    {sourceDepts.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-inter text-xs font-semibold block mb-1.5" style={{ color: "#6B7280" }}>Data do evento</label>
                  <input type="date" value={form.event_date} onChange={e => setForm({ ...form, event_date: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl text-sm font-inter outline-none"
                    style={{ background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.1)", color: "#374151" }} />
                </div>
                <div>
                  <label className="font-inter text-xs font-semibold block mb-1.5" style={{ color: "#6B7280" }}>Pontos por pessoa</label>
                  <input type="number" value={form.suggested_points} onChange={e => setForm({ ...form, suggested_points: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl text-sm font-inter outline-none"
                    style={{ background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.1)", color: "#374151" }} />
                </div>
              </div>

              {/* Member picker */}
              <div>
                <label className="font-inter text-xs font-semibold block mb-1.5" style={{ color: "#6B7280" }}>
                  Selecionar associados * ({selectedMembers.length} selecionados)
                </label>
                <div className="relative mb-2">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9CA3AF" }} />
                  <input value={memberSearch} onChange={e => setMemberSearch(e.target.value)}
                    placeholder="Buscar por nome..."
                    className="w-full pl-8 pr-3 py-2 rounded-xl text-sm font-inter outline-none"
                    style={{ background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.1)", color: "#374151" }} />
                </div>
                {selectedMembers.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {selectedMembers.map(m => (
                      <button key={m.id} onClick={() => toggleMember(m)}
                        className="flex items-center gap-1 font-inter text-[11px] px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(7,29,51,0.08)", color: "#071D33" }}>
                        {m.full_name} <X size={9} />
                      </button>
                    ))}
                  </div>
                )}
                <div className="max-h-40 overflow-y-auto rounded-xl border" style={{ borderColor: "rgba(13,33,55,0.1)" }}>
                  {filteredMembers.map(m => {
                    const sel = selectedMembers.find(s => s.id === m.id);
                    return (
                      <button key={m.id} onClick={() => toggleMember(m)}
                        className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-50"
                        style={{ borderBottom: "1px solid rgba(13,33,55,0.04)" }}>
                        <div className="w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0"
                          style={{ borderColor: sel ? "#0D2137" : "#D1D5DB", background: sel ? "#0D2137" : "white" }}>
                          {sel && <Check size={10} className="text-white" />}
                        </div>
                        <span className="font-inter text-sm" style={{ color: "#374151" }}>{m.full_name}</span>
                        <span className="font-inter text-[10px] ml-auto" style={{ color: "#9CA3AF" }}>{m.cycle}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="font-inter text-xs font-semibold block mb-1.5" style={{ color: "#6B7280" }}>Observações</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Detalhes sobre a atividade, contexto, etc." rows={2}
                  className="w-full px-3 py-2 rounded-xl text-sm font-inter outline-none resize-none"
                  style={{ background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.1)", color: "#374151" }} />
              </div>

              <div className="flex gap-3">
                <button onClick={() => { setShowForm(false); setSelectedMembers([]); setForm(EMPTY_FORM); }}
                  className="flex-1 py-2.5 rounded-xl font-inter text-sm font-semibold"
                  style={{ background: "rgba(13,33,55,0.06)", color: "#374151" }}>
                  Cancelar
                </button>
                <button onClick={submitForm} disabled={saving || !form.title || selectedMembers.length === 0}
                  className="flex-1 py-2.5 rounded-xl font-inter text-sm font-semibold text-white"
                  style={{ background: saving || !form.title || selectedMembers.length === 0 ? "#9CA3AF" : "#0D2137" }}>
                  {saving ? "Enviando..." : "Enviar para Formação"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}