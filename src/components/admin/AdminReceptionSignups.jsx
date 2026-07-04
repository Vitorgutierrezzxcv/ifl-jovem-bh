import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { HandHelping, Save } from "lucide-react";
import AdminHeader from "./AdminHeader";

const statusConfig = {
  inscrito: { label: "Inscrito", color: "#D99A22", bg: "rgba(217,154,34,0.1)" },
  selecionado: { label: "Selecionado", color: "#1F8A5B", bg: "rgba(31,138,91,0.1)" },
  nao_selecionado: { label: "Não selecionado", color: "#B42318", bg: "rgba(180,35,24,0.1)" },
};

export default function AdminReceptionSignups() {
  const [signups, setSignups] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ event_id: "", area: "", instructions: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const [data, evs] = await Promise.all([
      base44.entities.ReceptionSignup.list("-created_date", 200),
      base44.entities.Event.list("-date", 100),
    ]);
    setSignups(data);
    setEvents(evs);
    setLoading(false);
  }

  function startEdit(s) {
    setEditing(s.id);
    setForm({ event_id: s.event_id || "", area: s.area || "", instructions: s.instructions || "" });
  }

  async function handleSelect(s, status) {
    setSaving(true);
    const ev = events.find(e => e.id === form.event_id);
    await base44.entities.ReceptionSignup.update(s.id, {
      status,
      event_id: form.event_id,
      event_name: ev?.name || "",
      event_date: ev?.date || "",
      area: form.area,
      instructions: form.instructions,
    });
    setEditing(null);
    setSaving(false);
    load();
  }

  return (
    <div className="min-h-screen" style={{ background: "#F4F5F7" }}>
      <AdminHeader title="Recepção & Sombra" subtitle="Inscrições de associados para servir nos eventos" />
      <div className="p-4 lg:p-6 max-w-4xl">
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-7 h-7 border-4 border-gray-200 border-t-ifl-navy rounded-full animate-spin" /></div>
        ) : signups.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <HandHelping size={40} style={{ color: "#D1D5DB" }} />
            <p className="font-inter text-sm" style={{ color: "#9CA3AF" }}>Nenhuma inscrição ainda</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {signups.map(s => {
              const cfg = statusConfig[s.status] || statusConfig.inscrito;
              const isEditing = editing === s.id;
              return (
                <div key={s.id} className="bg-white rounded-2xl p-4" style={{ border: "1px solid rgba(13,33,55,0.08)" }}>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="font-inter text-sm font-semibold" style={{ color: "#111827" }}>{s.member_name}</p>
                    <span className="font-inter text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                  </div>
                  {s.status === "selecionado" && !isEditing && (
                    <div className="text-xs font-inter mb-2" style={{ color: "#6B7280" }}>
                      {s.event_name} {s.event_date && `· ${new Date(s.event_date + "T12:00:00").toLocaleDateString("pt-BR")}`} {s.area && `· ${s.area}`}
                    </div>
                  )}

                  {isEditing ? (
                    <div className="flex flex-col gap-2 mt-2">
                      <select value={form.event_id} onChange={e => setForm({ ...form, event_id: e.target.value })}
                        className="w-full rounded-lg px-3 py-2 text-sm border" style={{ borderColor: "rgba(13,33,55,0.15)" }}>
                        <option value="">Selecione o evento</option>
                        {events.map(ev => (
                          <option key={ev.id} value={ev.id}>{ev.name} — {new Date(ev.date + "T12:00:00").toLocaleDateString("pt-BR")}</option>
                        ))}
                      </select>
                      <input value={form.area} onChange={e => setForm({ ...form, area: e.target.value })}
                        placeholder="Área que vai servir (ex: Recepção, Sombra)" className="w-full rounded-lg px-3 py-2 text-sm border" style={{ borderColor: "rgba(13,33,55,0.15)" }} />
                      <textarea value={form.instructions} onChange={e => setForm({ ...form, instructions: e.target.value })}
                        placeholder="Instruções para o associado" rows={3} className="w-full rounded-lg px-3 py-2 text-sm border resize-none" style={{ borderColor: "rgba(13,33,55,0.15)" }} />
                      <div className="flex gap-2">
                        <button disabled={saving || !form.event_id} onClick={() => handleSelect(s, "selecionado")}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "#1F8A5B" }}>
                          <Save size={14} /> Selecionar
                        </button>
                        <button onClick={() => setEditing(null)} className="px-3 py-2 rounded-lg text-sm font-semibold" style={{ background: "#F0F0F4", color: "#6B7280" }}>
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2 mt-2">
                      {s.status !== "selecionado" && (
                        <button onClick={() => startEdit(s)} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: "#0D2137" }}>
                          Selecionar para evento
                        </button>
                      )}
                      {s.status !== "nao_selecionado" && (
                        <button onClick={() => handleSelect(s, "nao_selecionado")} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: "rgba(180,35,24,0.08)", color: "#B42318" }}>
                          Não selecionar
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}