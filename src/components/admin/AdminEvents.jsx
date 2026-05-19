import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Edit2, Trash2, ChevronRight, Calendar, MapPin, Users } from "lucide-react";
import AdminHeader from "./AdminHeader";

const typeLabels = {
  palestra_ordinaria: "Palestra", evento_ordinario_formacao: "Formação", clube_do_livro: "Clube do Livro",
  evento_extraordinario: "Extraordinário", viagem: "Viagem", visita_tecnica: "Visita Técnica",
  forum: "Fórum", iflxp: "IFL XP", reuniao_diretoria: "Reunião", processo_seletivo: "Processo Seletivo",
  evento_externo: "Externo", evento_institucional: "Institucional",
};

const emptyEvent = { name: "", type: "palestra_ordinaria", date: "", time: "", location: "", description: "", speaker: "", points_value: 0, status: "publicado", requires_presence: true };

export default function AdminEvents({ isAdmin, memberRole }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyEvent);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState("todos");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const data = await base44.entities.Event.list("-date", 100);
    setEvents(data);
    setLoading(false);
  }

  async function save() {
    setSaving(true);
    if (editId) await base44.entities.Event.update(editId, form);
    else await base44.entities.Event.create(form);
    setSaving(false);
    setShowForm(false);
    setEditId(null);
    setForm(emptyEvent);
    load();
  }

  async function deleteEvent(id) {
    await base44.entities.Event.delete(id);
    setDeleteConfirm(null);
    load();
  }

  function openEdit(ev) {
    setForm({ ...ev });
    setEditId(ev.id);
    setShowForm(true);
  }

  const today = new Date().toISOString().split("T")[0];
  const filtered = events.filter(e => filterStatus === "todos" || (filterStatus === "proximos" ? e.date >= today : e.date < today));

  return (
    <div className="min-h-screen" style={{ background: "#F4F5F7" }}>
      <div>
        <AdminHeader title="Gestão de Eventos" subtitle={`${events.length} eventos`}
          actions={
            <button onClick={() => { setForm(emptyEvent); setEditId(null); setShowForm(true); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-inter font-semibold text-white"
              style={{ background: "#071D33" }}>
              <Plus size={14} /> Novo Evento
            </button>
          }
        />
      </div>

      <div className="p-4 lg:p-6">
        <div className="flex gap-2 mb-4">
          {[{ k: "todos", l: "Todos" }, { k: "proximos", l: "Próximos" }, { k: "realizados", l: "Realizados" }].map(f => (
            <button key={f.k} onClick={() => setFilterStatus(f.k)}
              className="px-3 py-1.5 rounded-full font-inter text-xs font-semibold"
              style={{ background: filterStatus === f.k ? "#071D33" : "#FFFFFF", color: filterStatus === f.k ? "#FFF" : "#6B7280", border: filterStatus === f.k ? "none" : "1px solid rgba(13,33,55,0.1)" }}>
              {f.l}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {loading ? (
            <div className="flex justify-center py-12"><div className="w-6 h-6 border-4 border-gray-200 border-t-ifl-navy rounded-full animate-spin" /></div>
          ) : filtered.map(ev => (
            <div key={ev.id} className="bg-white rounded-2xl p-4 flex items-center gap-3" style={{ border: "1px solid rgba(13,33,55,0.08)" }}>
              <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0" style={{ background: "#071D33" }}>
                <span className="font-montserrat font-black text-lg text-white leading-none">{new Date(ev.date + "T12:00:00").getDate()}</span>
                <span className="font-inter text-[9px] uppercase" style={{ color: "#C9973A" }}>{new Date(ev.date + "T12:00:00").toLocaleString("pt-BR", { month: "short" })}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-montserrat font-bold text-sm" style={{ color: "#111827" }}>{ev.name}</p>
                <p className="font-inter text-xs" style={{ color: "#9CA3AF" }}>{typeLabels[ev.type]}{ev.location ? ` · ${ev.location}` : ""}</p>
                {ev.points_value > 0 && <p className="font-inter text-xs mt-0.5" style={{ color: "#B5862A" }}>+{ev.points_value} pts</p>}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(ev)} className="p-2 rounded-lg" style={{ background: "rgba(13,33,55,0.06)" }}>
                  <Edit2 size={14} style={{ color: "#071D33" }} />
                </button>
                <button onClick={() => setDeleteConfirm(ev.id)} className="p-2 rounded-lg" style={{ background: "rgba(180,35,24,0.08)" }}>
                  <Trash2 size={14} style={{ color: "#B42318" }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-0 lg:p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white w-full lg:max-w-lg rounded-t-2xl lg:rounded-2xl overflow-y-auto" style={{ maxHeight: "90vh" }}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(13,33,55,0.08)" }}>
              <h3 className="font-montserrat font-bold text-base" style={{ color: "#071D33" }}>{editId ? "Editar Evento" : "Novo Evento"}</h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg" style={{ background: "rgba(13,33,55,0.06)" }}>✕</button>
            </div>
            <div className="p-5 flex flex-col gap-3">
              <Input label="Nome do Evento *" value={form.name} onChange={v => setForm({ ...form, name: v })} />
              <div className="grid grid-cols-2 gap-3">
                <Select label="Tipo" value={form.type} options={Object.entries(typeLabels).map(([k, v]) => ({ k, v }))} onChange={v => setForm({ ...form, type: v })} />
                <Select label="Status" value={form.status} options={[{ k: "rascunho", v: "Rascunho" }, { k: "publicado", v: "Publicado" }, { k: "inscricoes_abertas", v: "Inscrições Abertas" }, { k: "realizado", v: "Realizado" }, { k: "cancelado", v: "Cancelado" }]} onChange={v => setForm({ ...form, status: v })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Data *" type="date" value={form.date} onChange={v => setForm({ ...form, date: v })} />
                <Input label="Horário" value={form.time} onChange={v => setForm({ ...form, time: v })} placeholder="19:00" />
              </div>
              <Input label="Local" value={form.location} onChange={v => setForm({ ...form, location: v })} />
              <Input label="Palestrante" value={form.speaker} onChange={v => setForm({ ...form, speaker: v })} />
              <Input label="Pontos por Presença" type="number" value={form.points_value} onChange={v => setForm({ ...form, points_value: Number(v) })} />
              <div>
                <label className="font-inter text-xs font-semibold mb-1 block" style={{ color: "#6B7280" }}>Descrição</label>
                <textarea value={form.description || ""} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
                  className="w-full px-3 py-2 rounded-xl text-sm font-inter resize-none outline-none"
                  style={{ background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.1)", color: "#374151" }} />
              </div>
              <button onClick={save} disabled={saving || !form.name || !form.date}
                className="w-full py-3 rounded-xl font-inter font-semibold text-sm text-white"
                style={{ background: saving || !form.name || !form.date ? "#9CA3AF" : "#071D33" }}>
                {saving ? "Salvando..." : editId ? "Salvar Alterações" : "Criar Evento"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="font-montserrat font-bold text-lg mb-2" style={{ color: "#071D33" }}>Excluir Evento?</h3>
            <p className="font-inter text-sm mb-4" style={{ color: "#6B7280" }}>Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl font-inter text-sm font-semibold" style={{ background: "#F4F5F7", color: "#374151" }}>Cancelar</button>
              <button onClick={() => deleteEvent(deleteConfirm)} className="flex-1 py-2.5 rounded-xl font-inter text-sm font-semibold text-white" style={{ background: "#B42318" }}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder }) {
  return (
    <div>
      <label className="font-inter text-xs font-semibold mb-1 block" style={{ color: "#6B7280" }}>{label}</label>
      <input type={type} value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 rounded-xl text-sm font-inter outline-none"
        style={{ background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.1)", color: "#374151" }} />
    </div>
  );
}

function Select({ label, value, options, onChange }) {
  return (
    <div>
      <label className="font-inter text-xs font-semibold mb-1 block" style={{ color: "#6B7280" }}>{label}</label>
      <select value={value || ""} onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-xl text-sm font-inter outline-none"
        style={{ background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.1)", color: "#374151" }}>
        {options.map(o => <option key={o.k} value={o.k}>{o.v}</option>)}
      </select>
    </div>
  );
}