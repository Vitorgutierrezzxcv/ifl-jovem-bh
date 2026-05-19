import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, CheckCircle, XCircle, Download } from "lucide-react";
import AdminHeader from "./AdminHeader";
import StatusBadge from "../ui/StatusBadge";

const categories = [
  "palestra", "auxilio_palestra", "evento_extraordinario", "patrocinio", "iflxp",
  "evento_externo", "gestao", "instagram", "linkedin", "evento_ordinario", "tarefa",
  "clube_livro", "artigo_rol", "conteudo_rol", "gerencia", "institucional", "comunicacao", "formacao"
];

export default function AdminPoints({ isAdmin, memberRole }) {
  const [points, setPoints] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("pendente");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ member_id: "", points: "", category: "evento_ordinario", action: "", notes: "", status: "aprovado" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const [p, m] = await Promise.all([
      base44.entities.PointsLedger.list("-created_date", 200),
      base44.entities.Member.list(),
    ]);
    setPoints(p);
    setMembers(m);
    setLoading(false);
  }

  async function approvePoint(id) {
    await base44.entities.PointsLedger.update(id, { status: "aprovado" });
    // update member total
    const pt = points.find(p => p.id === id);
    if (pt) {
      const m = members.find(m => m.id === pt.member_id);
      if (m) await base44.entities.Member.update(m.id, { total_points: (m.total_points || 0) + (pt.points || 0) });
    }
    load();
  }

  async function rejectPoint(id) {
    await base44.entities.PointsLedger.update(id, { status: "recusado" });
    load();
  }

  async function addPoint() {
    if (!form.member_id || !form.points) return;
    setSaving(true);
    const member = members.find(m => m.id === form.member_id);
    await base44.entities.PointsLedger.create({
      ...form,
      points: Number(form.points),
      member_name: member?.full_name || "",
    });
    if (form.status === "aprovado" && member) {
      await base44.entities.Member.update(member.id, { total_points: (member.total_points || 0) + Number(form.points) });
    }
    setSaving(false);
    setShowForm(false);
    setForm({ member_id: "", points: "", category: "evento_ordinario", action: "", notes: "", status: "aprovado" });
    load();
  }

  function exportCSV() {
    const rows = [["Associado", "Pontos", "Categoria", "Ação", "Status", "Data"]];
    points.forEach(p => rows.push([p.member_name, p.points, p.category, p.action || "", p.status, new Date(p.created_date).toLocaleDateString("pt-BR")]));
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "pontos.csv"; a.click();
  }

  const tabs = [
    { key: "pendente", label: "Pendentes" },
    { key: "aprovado", label: "Aprovados" },
    { key: "recusado", label: "Recusados" },
    { key: "todos", label: "Todos" },
  ];

  const filtered = points.filter(p => tab === "todos" || p.status === tab);
  const pendingCount = points.filter(p => p.status === "pendente").length;

  return (
    <div className="min-h-screen" style={{ background: "#F4F5F7", paddingTop: "calc(env(safe-area-inset-top) + 56px)" }}>
      <div className="lg:pt-0">
        <AdminHeader title="Gestão de Pontos" subtitle={`${pendingCount} pendentes de aprovação`}
          actions={
            <div className="flex gap-2">
              <button onClick={exportCSV} className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-inter font-semibold" style={{ background: "rgba(13,33,55,0.08)", color: "#071D33" }}>
                <Download size={13} /> CSV
              </button>
              <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-inter font-semibold text-white" style={{ background: "#071D33" }}>
                <Plus size={14} /> Lançar Ponto
              </button>
            </div>
          }
        />
      </div>

      <div className="p-4 lg:p-6">
        <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="px-3 py-1.5 rounded-full font-inter text-xs font-semibold flex-shrink-0"
              style={{ background: tab === t.key ? "#071D33" : "#FFFFFF", color: tab === t.key ? "#FFF" : "#6B7280", border: tab === t.key ? "none" : "1px solid rgba(13,33,55,0.1)" }}>
              {t.label} ({points.filter(p => t.key === "todos" || p.status === t.key).length})
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {loading ? (
            <div className="flex justify-center py-12"><div className="w-6 h-6 border-4 border-gray-200 border-t-ifl-navy rounded-full animate-spin" /></div>
          ) : filtered.map(p => (
            <div key={p.id} className="bg-white rounded-2xl p-4" style={{ border: "1px solid rgba(13,33,55,0.08)" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: p.points > 0 ? "rgba(31,138,91,0.1)" : "rgba(180,35,24,0.1)" }}>
                  <span className="font-montserrat font-black text-sm" style={{ color: p.points > 0 ? "#1F8A5B" : "#B42318" }}>
                    {p.points > 0 ? "+" : ""}{p.points}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-inter text-sm font-semibold" style={{ color: "#111827" }}>{p.member_name}</p>
                  <p className="font-inter text-xs" style={{ color: "#9CA3AF" }}>{p.action || p.category} · {new Date(p.created_date).toLocaleDateString("pt-BR")}</p>
                  {p.notes && <p className="font-inter text-xs italic mt-0.5" style={{ color: "#9CA3AF" }}>{p.notes}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={p.status} />
                  {p.status === "pendente" && (
                    <>
                      <button onClick={() => approvePoint(p.id)} className="p-1.5 rounded-lg" style={{ background: "rgba(31,138,91,0.1)" }}>
                        <CheckCircle size={14} style={{ color: "#1F8A5B" }} />
                      </button>
                      <button onClick={() => rejectPoint(p.id)} className="p-1.5 rounded-lg" style={{ background: "rgba(180,35,24,0.08)" }}>
                        <XCircle size={14} style={{ color: "#B42318" }} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Point Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white w-full lg:max-w-md rounded-t-2xl lg:rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-montserrat font-bold text-base" style={{ color: "#071D33" }}>Lançar Ponto Manual</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400">✕</button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="font-inter text-xs font-semibold mb-1 block" style={{ color: "#6B7280" }}>Associado *</label>
                <select value={form.member_id} onChange={e => setForm({ ...form, member_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm font-inter outline-none"
                  style={{ background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.1)", color: "#374151" }}>
                  <option value="">Selecionar...</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-inter text-xs font-semibold mb-1 block" style={{ color: "#6B7280" }}>Pontos *</label>
                  <input type="number" value={form.points} onChange={e => setForm({ ...form, points: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-sm font-inter outline-none"
                    style={{ background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.1)", color: "#374151" }} />
                </div>
                <div>
                  <label className="font-inter text-xs font-semibold mb-1 block" style={{ color: "#6B7280" }}>Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-sm font-inter outline-none"
                    style={{ background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.1)", color: "#374151" }}>
                    <option value="aprovado">Aprovado</option>
                    <option value="pendente">Pendente</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="font-inter text-xs font-semibold mb-1 block" style={{ color: "#6B7280" }}>Categoria</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm font-inter outline-none"
                  style={{ background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.1)", color: "#374151" }}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="font-inter text-xs font-semibold mb-1 block" style={{ color: "#6B7280" }}>Descrição / Ação</label>
                <input value={form.action} onChange={e => setForm({ ...form, action: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm font-inter outline-none"
                  style={{ background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.1)", color: "#374151" }} />
              </div>
              <div>
                <label className="font-inter text-xs font-semibold mb-1 block" style={{ color: "#6B7280" }}>Observações</label>
                <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm font-inter outline-none"
                  style={{ background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.1)", color: "#374151" }} />
              </div>
              <button onClick={addPoint} disabled={saving || !form.member_id || !form.points}
                className="w-full py-3 rounded-xl font-inter font-semibold text-sm text-white mt-1"
                style={{ background: saving || !form.member_id ? "#9CA3AF" : "#071D33" }}>
                {saving ? "Lançando..." : "Lançar Ponto"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}