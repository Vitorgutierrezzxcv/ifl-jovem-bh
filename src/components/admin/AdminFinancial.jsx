import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Download, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import AdminHeader from "./AdminHeader";
import StatusBadge from "../ui/StatusBadge";

const statusTabs = [
  { key: "todos", label: "Todos" },
  { key: "pendente", label: "Pendentes" },
  { key: "vencido", label: "Vencidos" },
  { key: "inadimplente", label: "Inadimplentes" },
  { key: "em_dia", label: "Em Dia" },
  { key: "isento", label: "Isentos" },
];

export default function AdminFinancial({ isAdmin, memberRole }) {
  const [charges, setCharges] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("todos");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ member_id: "", amount: "", due_date: "", plan: "mensal", status: "pendente", notes: "" });
  const [saving, setSaving] = useState(false);
  const [markPaid, setMarkPaid] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const [c, m] = await Promise.all([
      base44.entities.FinancialCharge.list("-due_date", 200),
      base44.entities.Member.list("-full_name"),
    ]);
    setCharges(c);
    setMembers(m);
    setLoading(false);
  }

  const getMemberName = (id) => members.find(m => m.id === id)?.full_name || "Associado";

  async function createCharge() {
    if (!form.member_id || !form.amount || !form.due_date) return;
    setSaving(true);
    const member = members.find(m => m.id === form.member_id);
    await base44.entities.FinancialCharge.create({
      ...form, amount: Number(form.amount),
      member_name: member?.full_name || "",
      recorded_by: "admin",
    });
    setSaving(false);
    setShowForm(false);
    setForm({ member_id: "", amount: "", due_date: "", plan: "mensal", status: "pendente", notes: "" });
    load();
  }

  async function markAsPaid(id) {
    await base44.entities.FinancialCharge.update(id, { status: "em_dia", paid_at: new Date().toISOString() });
    setMarkPaid(null);
    load();
  }

  function exportCSV() {
    const rows = [["Nome", "Valor", "Vencimento", "Plano", "Status", "Pago em"]];
    filtered.forEach(c => rows.push([getMemberName(c.member_id), `R$ ${c.amount}`, c.due_date, c.plan, c.status, c.paid_at || ""]));
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "financeiro.csv"; a.click();
  }

  const filtered = charges.filter(c => tab === "todos" || c.status === tab);

  const totalPendente = charges.filter(c => ["pendente", "vencido", "inadimplente"].includes(c.status)).reduce((s, c) => s + (c.amount || 0), 0);
  const totalRecebido = charges.filter(c => c.status === "em_dia").reduce((s, c) => s + (c.amount || 0), 0);

  return (
    <div className="min-h-screen" style={{ background: "#F4F5F7", paddingTop: "calc(env(safe-area-inset-top) + 56px)" }}>
      <div className="lg:pt-0">
        <AdminHeader title="Gestão Financeira" subtitle="Cobranças e inadimplência"
          actions={
            <div className="flex gap-2">
              <button onClick={exportCSV} className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-inter font-semibold" style={{ background: "rgba(13,33,55,0.08)", color: "#071D33" }}>
                <Download size={13} /> CSV
              </button>
              <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-inter font-semibold text-white" style={{ background: "#071D33" }}>
                <Plus size={14} /> Nova Cobrança
              </button>
            </div>
          }
        />
      </div>

      <div className="p-4 lg:p-6">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-2xl p-4" style={{ border: "1px solid rgba(13,33,55,0.08)" }}>
            <p className="font-inter text-xs" style={{ color: "#9CA3AF" }}>Total Pendente</p>
            <p className="font-montserrat font-black text-2xl mt-1" style={{ color: "#B42318" }}>R$ {totalPendente.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-2xl p-4" style={{ border: "1px solid rgba(13,33,55,0.08)" }}>
            <p className="font-inter text-xs" style={{ color: "#9CA3AF" }}>Total Recebido</p>
            <p className="font-montserrat font-black text-2xl mt-1" style={{ color: "#1F8A5B" }}>R$ {totalRecebido.toFixed(2)}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4">
          {statusTabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="px-3 py-1.5 rounded-full font-inter text-xs font-semibold flex-shrink-0"
              style={{ background: tab === t.key ? "#071D33" : "#FFFFFF", color: tab === t.key ? "#FFF" : "#6B7280", border: tab === t.key ? "none" : "1px solid rgba(13,33,55,0.1)" }}>
              {t.label} ({charges.filter(c => t.key === "todos" || c.status === t.key).length})
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {loading ? (
            <div className="flex justify-center py-12"><div className="w-6 h-6 border-4 border-gray-200 border-t-ifl-navy rounded-full animate-spin" /></div>
          ) : filtered.map(c => (
            <div key={c.id} className="bg-white rounded-2xl p-4" style={{ border: "1px solid rgba(13,33,55,0.08)" }}>
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-montserrat font-bold text-sm" style={{ color: "#111827" }}>{c.member_name || getMemberName(c.member_id)}</p>
                  <p className="font-inter text-xs mt-0.5" style={{ color: "#9CA3AF" }}>
                    Venc: {c.due_date} · {c.plan} · R$ {Number(c.amount || 0).toFixed(2)}
                  </p>
                  {c.notes && <p className="font-inter text-xs mt-1 italic" style={{ color: "#9CA3AF" }}>{c.notes}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={c.status} />
                  {["pendente", "vencido", "inadimplente"].includes(c.status) && (
                    <button onClick={() => setMarkPaid(c.id)} className="px-2 py-1 rounded-lg text-xs font-inter font-semibold"
                      style={{ background: "rgba(31,138,91,0.1)", color: "#1F8A5B" }}>
                      Pago
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Charge Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white w-full lg:max-w-md rounded-t-2xl lg:rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-montserrat font-bold text-base" style={{ color: "#071D33" }}>Nova Cobrança</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400">✕</button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="font-inter text-xs font-semibold mb-1 block" style={{ color: "#6B7280" }}>Associado *</label>
                <select value={form.member_id} onChange={e => setForm({ ...form, member_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm font-inter outline-none"
                  style={{ background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.1)", color: "#374151" }}>
                  <option value="">Selecionar associado...</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-inter text-xs font-semibold mb-1 block" style={{ color: "#6B7280" }}>Valor (R$) *</label>
                  <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-sm font-inter outline-none"
                    style={{ background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.1)", color: "#374151" }} />
                </div>
                <div>
                  <label className="font-inter text-xs font-semibold mb-1 block" style={{ color: "#6B7280" }}>Vencimento *</label>
                  <input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-sm font-inter outline-none"
                    style={{ background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.1)", color: "#374151" }} />
                </div>
              </div>
              <div>
                <label className="font-inter text-xs font-semibold mb-1 block" style={{ color: "#6B7280" }}>Plano</label>
                <select value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm font-inter outline-none"
                  style={{ background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.1)", color: "#374151" }}>
                  <option value="mensal">Mensal</option>
                  <option value="semestral">Semestral</option>
                  <option value="anual">Anual</option>
                </select>
              </div>
              <div>
                <label className="font-inter text-xs font-semibold mb-1 block" style={{ color: "#6B7280" }}>Observações</label>
                <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm font-inter outline-none"
                  style={{ background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.1)", color: "#374151" }} />
              </div>
              <button onClick={createCharge} disabled={saving || !form.member_id || !form.amount || !form.due_date}
                className="w-full py-3 rounded-xl font-inter font-semibold text-sm text-white mt-2"
                style={{ background: saving || !form.member_id ? "#9CA3AF" : "#071D33" }}>
                {saving ? "Criando..." : "Criar Cobrança"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark Paid Confirm */}
      {markPaid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="font-montserrat font-bold text-lg mb-2" style={{ color: "#071D33" }}>Confirmar Pagamento</h3>
            <p className="font-inter text-sm mb-4" style={{ color: "#6B7280" }}>Marcar esta cobrança como paga manualmente?</p>
            <div className="flex gap-3">
              <button onClick={() => setMarkPaid(null)} className="flex-1 py-2.5 rounded-xl font-inter text-sm" style={{ background: "#F4F5F7", color: "#374151" }}>Cancelar</button>
              <button onClick={() => markAsPaid(markPaid)} className="flex-1 py-2.5 rounded-xl font-inter text-sm font-semibold text-white" style={{ background: "#1F8A5B" }}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}