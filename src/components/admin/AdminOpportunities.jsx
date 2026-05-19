import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Edit2, Trash2 } from "lucide-react";
import AdminHeader from "./AdminHeader";
import StatusBadge from "../ui/StatusBadge";

const typeLabels = {
  viagem_sp: "Viagem SP", evento_extraordinario: "Evento Extraordinário", visita_tecnica: "Visita Técnica",
  jantar_convidado: "Jantar c/ Convidado", forum: "Fórum", iflxp: "IFL XP",
  processo_seletivo_interno: "Processo Seletivo", vaga_gerente: "Vaga de Gerente",
  vaga_projeto: "Vaga de Projeto", premiacao: "Premiação", publicacao_artigo: "Publicação de Artigo",
  oportunidade_externa: "Oportunidade Externa",
};

const emptyForm = { title: "", type: "evento_extraordinario", description: "", vacancies: 1, deadline: "", status: "aberta", criteria: "", ranking_criteria: false };

export default function AdminOpportunities({ isAdmin, memberRole }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const data = await base44.entities.Opportunity.list("-created_date", 100);
    setItems(data);
    setLoading(false);
  }

  async function save() {
    setSaving(true);
    if (editId) await base44.entities.Opportunity.update(editId, form);
    else await base44.entities.Opportunity.create(form);
    setSaving(false);
    setShowForm(false);
    setEditId(null);
    setForm(emptyForm);
    load();
  }

  async function deleteItem(id) {
    await base44.entities.Opportunity.delete(id);
    setDeleteConfirm(null);
    load();
  }

  function openEdit(item) {
    setForm({ ...item });
    setEditId(item.id);
    setShowForm(true);
  }

  const statusColor = { aberta: "#1F8A5B", encerrada: "#B42318", resultado_publicado: "#071D33", rascunho: "#9CA3AF" };

  return (
    <div className="min-h-screen" style={{ background: "#F4F5F7" }}>
      <div>
        <AdminHeader title="Oportunidades" subtitle={`${items.filter(i => i.status === "aberta").length} abertas`}
          actions={
            <button onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-inter font-semibold text-white"
              style={{ background: "#071D33" }}>
              <Plus size={14} /> Nova Oportunidade
            </button>
          }
        />
      </div>

      <div className="p-4 lg:p-6">
        <div className="flex flex-col gap-3">
          {loading ? (
            <div className="flex justify-center py-12"><div className="w-6 h-6 border-4 border-gray-200 border-t-ifl-navy rounded-full animate-spin" /></div>
          ) : items.map(item => (
            <div key={item.id} className="bg-white rounded-2xl p-4" style={{ border: "1px solid rgba(13,33,55,0.08)" }}>
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-inter text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: `${statusColor[item.status] || "#9CA3AF"}15`, color: statusColor[item.status] || "#9CA3AF" }}>
                      {item.status?.toUpperCase()}
                    </span>
                    <span className="font-inter text-[10px]" style={{ color: "#9CA3AF" }}>{typeLabels[item.type] || item.type}</span>
                  </div>
                  <p className="font-montserrat font-bold text-sm" style={{ color: "#111827" }}>{item.title}</p>
                  {item.vacancies && <p className="font-inter text-xs mt-1" style={{ color: "#9CA3AF" }}>{item.vacancies} vaga(s) · Prazo: {item.deadline}</p>}
                  {item.criteria && <p className="font-inter text-xs mt-1 line-clamp-1" style={{ color: "#9CA3AF" }}>Critério: {item.criteria}</p>}
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
          ))}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white w-full lg:max-w-lg rounded-t-2xl lg:rounded-2xl overflow-y-auto" style={{ maxHeight: "90vh" }}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(13,33,55,0.08)" }}>
              <h3 className="font-montserrat font-bold text-base" style={{ color: "#071D33" }}>{editId ? "Editar" : "Nova Oportunidade"}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400">✕</button>
            </div>
            <div className="p-5 flex flex-col gap-3">
              <div>
                <label className="font-inter text-xs font-semibold mb-1 block" style={{ color: "#6B7280" }}>Título *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm font-inter outline-none"
                  style={{ background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.1)", color: "#374151" }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-inter text-xs font-semibold mb-1 block" style={{ color: "#6B7280" }}>Tipo</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-sm font-inter outline-none"
                    style={{ background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.1)", color: "#374151" }}>
                    {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-inter text-xs font-semibold mb-1 block" style={{ color: "#6B7280" }}>Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-sm font-inter outline-none"
                    style={{ background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.1)", color: "#374151" }}>
                    <option value="rascunho">Rascunho</option>
                    <option value="aberta">Aberta</option>
                    <option value="encerrada">Encerrada</option>
                    <option value="resultado_publicado">Resultado Publicado</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-inter text-xs font-semibold mb-1 block" style={{ color: "#6B7280" }}>Vagas</label>
                  <input type="number" value={form.vacancies} onChange={e => setForm({ ...form, vacancies: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl text-sm font-inter outline-none"
                    style={{ background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.1)", color: "#374151" }} />
                </div>
                <div>
                  <label className="font-inter text-xs font-semibold mb-1 block" style={{ color: "#6B7280" }}>Prazo</label>
                  <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-sm font-inter outline-none"
                    style={{ background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.1)", color: "#374151" }} />
                </div>
              </div>
              <div>
                <label className="font-inter text-xs font-semibold mb-1 block" style={{ color: "#6B7280" }}>Critérios de seleção</label>
                <textarea value={form.criteria || ""} onChange={e => setForm({ ...form, criteria: e.target.value })} rows={3}
                  className="w-full px-3 py-2 rounded-xl text-sm font-inter resize-none outline-none"
                  style={{ background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.1)", color: "#374151" }} />
              </div>
              <div>
                <label className="font-inter text-xs font-semibold mb-1 block" style={{ color: "#6B7280" }}>Descrição</label>
                <textarea value={form.description || ""} onChange={e => setForm({ ...form, description: e.target.value })} rows={2}
                  className="w-full px-3 py-2 rounded-xl text-sm font-inter resize-none outline-none"
                  style={{ background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.1)", color: "#374151" }} />
              </div>
              <button onClick={save} disabled={saving || !form.title}
                className="w-full py-3 rounded-xl font-inter font-semibold text-sm text-white"
                style={{ background: saving || !form.title ? "#9CA3AF" : "#071D33" }}>
                {saving ? "Salvando..." : editId ? "Salvar" : "Criar Oportunidade"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="font-montserrat font-bold text-lg mb-2" style={{ color: "#071D33" }}>Excluir Oportunidade?</h3>
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