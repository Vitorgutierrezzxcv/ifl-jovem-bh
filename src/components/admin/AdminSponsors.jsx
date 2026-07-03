import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, X, Handshake } from "lucide-react";

const tierColors = { prata: "#9CA3AF", ouro: "#D4A043", apoio: "#0D2137" };
const tierLabels = { prata: "Prata", ouro: "Ouro", apoio: "Apoio" };
const statusColors = { ativo: "#1F8A5B", atrasado: "#D99A22", encerrado: "#B42318" };

export default function AdminSponsors() {
  const [sponsors, setSponsors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", tier: "apoio", payment_mode: "mensal", amount: "", due_day: "", status: "ativo", contact_name: "", contact_email: "" });

  useEffect(() => { load(); }, []);

  async function load() {
    setSponsors(await base44.entities.Sponsor.list("-created_date", 200));
  }

  function openEdit(s) {
    setEditing(s);
    setForm({ name: s.name, tier: s.tier, payment_mode: s.payment_mode, amount: s.amount || "", due_day: s.due_day || "", status: s.status, contact_name: s.contact_name || "", contact_email: s.contact_email || "" });
    setShowForm(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    const data = { ...form, amount: form.amount ? Number(form.amount) : undefined, due_day: form.due_day ? Number(form.due_day) : undefined };
    if (editing) await base44.entities.Sponsor.update(editing.id, data);
    else await base44.entities.Sponsor.create(data);
    setShowForm(false);
    setEditing(null);
    setForm({ name: "", tier: "apoio", payment_mode: "mensal", amount: "", due_day: "", status: "ativo", contact_name: "", contact_email: "" });
    load();
  }

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-montserrat font-black text-2xl text-foreground">Patrocinadores</h1>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-inter text-sm font-semibold text-white" style={{ background: "#0D2137" }}>
          <Plus size={15} /> Novo
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="rounded-2xl p-5 mb-6 flex flex-col gap-3" style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.08)" }}>
          <div className="flex items-center justify-between">
            <p className="font-montserrat font-bold text-sm text-foreground">{editing ? "Editar" : "Novo"} Patrocinador</p>
            <button type="button" onClick={() => setShowForm(false)}><X size={16} /></button>
          </div>
          <input required placeholder="Nome da empresa" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl px-4 h-11 font-inter text-sm outline-none text-foreground" style={{ background: "hsl(var(--background))", border: "1px solid rgba(13,33,55,0.1)" }} />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.tier} onChange={e => setForm({ ...form, tier: e.target.value })} className="w-full rounded-xl px-4 h-11 font-inter text-sm outline-none text-foreground" style={{ background: "hsl(var(--background))", border: "1px solid rgba(13,33,55,0.1)" }}>
              <option value="prata">Prata</option><option value="ouro">Ouro</option><option value="apoio">Apoio</option>
            </select>
            <select value={form.payment_mode} onChange={e => setForm({ ...form, payment_mode: e.target.value })} className="w-full rounded-xl px-4 h-11 font-inter text-sm outline-none text-foreground" style={{ background: "hsl(var(--background))", border: "1px solid rgba(13,33,55,0.1)" }}>
              <option value="mensal">Mensalidade</option><option value="anual_unico">Pagamento único anual</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Valor (R$)" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="w-full rounded-xl px-4 h-11 font-inter text-sm outline-none text-foreground" style={{ background: "hsl(var(--background))", border: "1px solid rgba(13,33,55,0.1)" }} />
            <input placeholder="Dia de vencimento" type="number" value={form.due_day} onChange={e => setForm({ ...form, due_day: e.target.value })} className="w-full rounded-xl px-4 h-11 font-inter text-sm outline-none text-foreground" style={{ background: "hsl(var(--background))", border: "1px solid rgba(13,33,55,0.1)" }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Contato (nome)" value={form.contact_name} onChange={e => setForm({ ...form, contact_name: e.target.value })} className="w-full rounded-xl px-4 h-11 font-inter text-sm outline-none text-foreground" style={{ background: "hsl(var(--background))", border: "1px solid rgba(13,33,55,0.1)" }} />
            <input placeholder="Contato (email)" value={form.contact_email} onChange={e => setForm({ ...form, contact_email: e.target.value })} className="w-full rounded-xl px-4 h-11 font-inter text-sm outline-none text-foreground" style={{ background: "hsl(var(--background))", border: "1px solid rgba(13,33,55,0.1)" }} />
          </div>
          <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full rounded-xl px-4 h-11 font-inter text-sm outline-none text-foreground" style={{ background: "hsl(var(--background))", border: "1px solid rgba(13,33,55,0.1)" }}>
            <option value="ativo">Ativo</option><option value="atrasado">Atrasado</option><option value="encerrado">Encerrado</option>
          </select>
          <button type="submit" className="rounded-xl h-11 font-montserrat font-bold text-sm text-white" style={{ background: "#0D2137" }}>Salvar</button>
        </form>
      )}

      <div className="flex flex-col gap-2">
        {sponsors.length === 0 ? (
          <p className="font-inter text-sm" style={{ color: "#9CA3AF" }}>Nenhum patrocinador cadastrado.</p>
        ) : sponsors.map(s => (
          <button key={s.id} onClick={() => openEdit(s)} className="rounded-2xl p-4 flex items-center gap-3 text-left" style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.06)" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${tierColors[s.tier]}15` }}><Handshake size={16} style={{ color: tierColors[s.tier] }} /></div>
            <div className="flex-1 min-w-0">
              <p className="font-inter text-sm font-semibold text-foreground">{s.name}</p>
              <p className="font-inter text-xs" style={{ color: "#6B7280" }}>{tierLabels[s.tier]} · {s.payment_mode === "mensal" ? "Mensalidade" : "Único anual"}{s.amount ? ` · R$ ${s.amount}` : ""}</p>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: `${statusColors[s.status]}15`, color: statusColors[s.status] }}>{s.status}</span>
          </button>
        ))}
      </div>
    </div>
  );
}