import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Edit2 } from "lucide-react";
import AdminHeader from "./AdminHeader";

const audienceOptions = [
  { k: "todos", v: "Todos" }, { k: "qualifier", v: "Qualifier" }, { k: "1_ciclo", v: "1º Ciclo" },
  { k: "2_ciclo", v: "2º Ciclo" }, { k: "3_ciclo", v: "3º Ciclo" }, { k: "fellow", v: "Fellow" },
  { k: "diretoria", v: "Diretoria" }, { k: "individual", v: "Individual" },
];

const priorityColors = {
  normal: { bg: "rgba(13,33,55,0.06)", color: "#071D33" },
  importante: { bg: "rgba(217,154,34,0.1)", color: "#D99A22" },
  urgente: { bg: "rgba(180,35,24,0.1)", color: "#B42318" },
};

const emptyForm = { title: "", content: "", audience: "todos", priority: "normal", status: "publicado", department_name: "" };

export default function AdminAnnouncements({ isAdmin, memberRole }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const data = await base44.entities.Announcement.list("-created_date", 100);
    setItems(data);
    setLoading(false);
  }

  async function save() {
    setSaving(true);
    if (editId) await base44.entities.Announcement.update(editId, form);
    else await base44.entities.Announcement.create(form);
    setSaving(false);
    setShowForm(false);
    setEditId(null);
    setForm(emptyForm);
    load();
  }

  async function deleteItem(id) {
    await base44.entities.Announcement.delete(id);
    setDeleteConfirm(null);
    load();
  }

  function openEdit(item) {
    setForm({ ...item });
    setEditId(item.id);
    setShowForm(true);
  }

  return (
    <div className="min-h-screen" style={{ background: "#F4F5F7", paddingTop: "calc(env(safe-area-inset-top) + 56px)" }}>
      <div className="lg:pt-0">
        <AdminHeader title="Avisos e Comunicados" subtitle={`${items.length} avisos`}
          actions={
            <button onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-inter font-semibold text-white"
              style={{ background: "#071D33" }}>
              <Plus size={14} /> Novo Aviso
            </button>
          }
        />
      </div>

      <div className="p-4 lg:p-6">
        <div className="flex flex-col gap-3">
          {loading ? (
            <div className="flex justify-center py-12"><div className="w-6 h-6 border-4 border-gray-200 border-t-ifl-navy rounded-full animate-spin" /></div>
          ) : items.map(item => {
            const pc = priorityColors[item.priority] || priorityColors.normal;
            return (
              <div key={item.id} className="bg-white rounded-2xl p-4" style={{ border: `1px solid ${pc.bg}`, borderColor: "rgba(13,33,55,0.08)" }}>
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-inter text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: pc.bg, color: pc.color }}>
                        {item.priority?.toUpperCase()}
                      </span>
                      <span className="font-inter text-[10px]" style={{ color: "#9CA3AF" }}>
                        Para: {audienceOptions.find(a => a.k === item.audience)?.v || item.audience}
                      </span>
                      {item.department_name && <span className="font-inter text-[10px]" style={{ color: "#9CA3AF" }}>{item.department_name}</span>}
                    </div>
                    <p className="font-montserrat font-bold text-sm" style={{ color: "#111827" }}>{item.title}</p>
                    <p className="font-inter text-xs mt-1 line-clamp-2" style={{ color: "#6B7280" }}>{item.content}</p>
                    <p className="font-inter text-[10px] mt-2" style={{ color: "#9CA3AF" }}>{new Date(item.created_date).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg" style={{ background: "rgba(13,33,55,0.06)" }}>
                      <Edit2 size={13} style={{ color: "#071D33" }} />
                    </button>
                    <button onClick={() => setDeleteConfirm(item.id)} className="p-1.5 rounded-lg" style={{ background: "rgba(180,35,24,0.08)" }}>
                      <Trash2 size={13} style={{ color: "#B42318" }} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white w-full lg:max-w-lg rounded-t-2xl lg:rounded-2xl overflow-y-auto" style={{ maxHeight: "90vh" }}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(13,33,55,0.08)" }}>
              <h3 className="font-montserrat font-bold text-base" style={{ color: "#071D33" }}>{editId ? "Editar Aviso" : "Novo Aviso"}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400">✕</button>
            </div>
            <div className="p-5 flex flex-col gap-3">
              <div>
                <label className="font-inter text-xs font-semibold mb-1 block" style={{ color: "#6B7280" }}>Título *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm font-inter outline-none"
                  style={{ background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.1)", color: "#374151" }} />
              </div>
              <div>
                <label className="font-inter text-xs font-semibold mb-1 block" style={{ color: "#6B7280" }}>Conteúdo *</label>
                <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={4}
                  className="w-full px-3 py-2 rounded-xl text-sm font-inter resize-none outline-none"
                  style={{ background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.1)", color: "#374151" }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-inter text-xs font-semibold mb-1 block" style={{ color: "#6B7280" }}>Público-alvo</label>
                  <select value={form.audience} onChange={e => setForm({ ...form, audience: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-sm font-inter outline-none"
                    style={{ background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.1)", color: "#374151" }}>
                    {audienceOptions.map(o => <option key={o.k} value={o.k}>{o.v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-inter text-xs font-semibold mb-1 block" style={{ color: "#6B7280" }}>Prioridade</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-sm font-inter outline-none"
                    style={{ background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.1)", color: "#374151" }}>
                    <option value="normal">Normal</option>
                    <option value="importante">Importante</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="font-inter text-xs font-semibold mb-1 block" style={{ color: "#6B7280" }}>Diretoria (opcional)</label>
                <input value={form.department_name || ""} onChange={e => setForm({ ...form, department_name: e.target.value })}
                  placeholder="Ex: Diretoria de Formação"
                  className="w-full px-3 py-2 rounded-xl text-sm font-inter outline-none"
                  style={{ background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.1)", color: "#374151" }} />
              </div>
              <button onClick={save} disabled={saving || !form.title || !form.content}
                className="w-full py-3 rounded-xl font-inter font-semibold text-sm text-white"
                style={{ background: saving || !form.title ? "#9CA3AF" : "#071D33" }}>
                {saving ? "Salvando..." : editId ? "Salvar Alterações" : "Publicar Aviso"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="font-montserrat font-bold text-lg mb-2" style={{ color: "#071D33" }}>Excluir Aviso?</h3>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl font-inter text-sm" style={{ background: "#F4F5F7", color: "#374151" }}>Cancelar</button>
              <button onClick={() => deleteItem(deleteConfirm)} className="flex-1 py-2.5 rounded-xl font-inter text-sm font-semibold text-white" style={{ background: "#B42318" }}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}