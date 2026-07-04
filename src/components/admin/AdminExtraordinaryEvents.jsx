import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, X, Zap, Users, Check, XCircle, Clock, Pencil } from "lucide-react";

const emptyForm = { title: "", description: "", date: "", location: "", capacity: "", custom_questions: [""], status: "aberto" };

export default function AdminExtraordinaryEvents() {
  const [events, setEvents] = useState([]);
  const [regs, setRegs] = useState([]);
  const [openEvent, setOpenEvent] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { load(); }, []);

  async function load() {
    const [evs, rs] = await Promise.all([
      base44.entities.ExtraordinaryEvent.list("-date", 100),
      base44.entities.ExtraordinaryRegistration.list("-created_date", 500),
    ]);
    setEvents(evs);
    setRegs(rs);
  }

  function openNewForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEditForm(ev) {
    setEditingId(ev.id);
    setForm({
      title: ev.title || "",
      description: ev.description || "",
      date: ev.date || "",
      location: ev.location || "",
      capacity: ev.capacity ?? "",
      custom_questions: ev.custom_questions && ev.custom_questions.length ? ev.custom_questions : [""],
      status: ev.status || "aberto",
    });
    setShowForm(true);
  }

  function updateQuestion(i, value) {
    const qs = [...form.custom_questions];
    qs[i] = value;
    setForm({ ...form, custom_questions: qs });
  }

  function addQuestion() {
    setForm({ ...form, custom_questions: [...form.custom_questions, ""] });
  }

  function removeQuestion(i) {
    const qs = form.custom_questions.filter((_, idx) => idx !== i);
    setForm({ ...form, custom_questions: qs.length ? qs : [""] });
  }

  async function handleSave(e) {
    e.preventDefault();
    const payload = {
      title: form.title,
      description: form.description,
      date: form.date,
      location: form.location,
      capacity: form.capacity ? Number(form.capacity) : undefined,
      custom_questions: form.custom_questions.map(q => q.trim()).filter(Boolean),
      status: form.status,
    };
    if (editingId) {
      await base44.entities.ExtraordinaryEvent.update(editingId, payload);
    } else {
      await base44.entities.ExtraordinaryEvent.create(payload);
    }
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    load();
  }

  async function decide(reg, status) {
    await base44.entities.ExtraordinaryRegistration.update(reg.id, { status, selected: status === "aprovado" });
    load();
  }

  const eventRegs = openEvent ? regs.filter(r => r.event_id === openEvent.id) : [];

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-montserrat font-black text-2xl text-foreground">Eventos Extraordinários</h1>
        <button onClick={openNewForm} className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-inter text-sm font-semibold text-white" style={{ background: "#0D2137" }}>
          <Plus size={15} /> Novo Evento
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="rounded-2xl p-5 mb-6 flex flex-col gap-3" style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.08)" }}>
          <div className="flex items-center justify-between">
            <p className="font-montserrat font-bold text-sm text-foreground">{editingId ? "Editar Evento Extraordinário" : "Novo Evento Extraordinário"}</p>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }}><X size={16} /></button>
          </div>
          <input required placeholder="Título" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full rounded-xl px-4 h-11 font-inter text-sm outline-none text-foreground" style={{ background: "hsl(var(--background))", border: "1px solid rgba(13,33,55,0.1)" }} />
          <textarea placeholder="Descrição" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full rounded-xl px-4 py-3 font-inter text-sm outline-none text-foreground resize-none" style={{ background: "hsl(var(--background))", border: "1px solid rgba(13,33,55,0.1)" }} />
          <div className="grid grid-cols-2 gap-3">
            <input required type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full rounded-xl px-4 h-11 font-inter text-sm outline-none text-foreground" style={{ background: "hsl(var(--background))", border: "1px solid rgba(13,33,55,0.1)" }} />
            <input placeholder="Local" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="w-full rounded-xl px-4 h-11 font-inter text-sm outline-none text-foreground" style={{ background: "hsl(var(--background))", border: "1px solid rgba(13,33,55,0.1)" }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Vagas (capacidade)" type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} className="w-full rounded-xl px-4 h-11 font-inter text-sm outline-none text-foreground" style={{ background: "hsl(var(--background))", border: "1px solid rgba(13,33,55,0.1)" }} />
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full rounded-xl px-4 h-11 font-inter text-sm outline-none text-foreground" style={{ background: "hsl(var(--background))", border: "1px solid rgba(13,33,55,0.1)" }}>
              <option value="aberto">Aberto</option>
              <option value="selecao">Em seleção</option>
              <option value="encerrado">Encerrado</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <p className="font-inter text-xs font-semibold" style={{ color: "#0D2137" }}>Perguntas personalizadas da inscrição</p>
            {form.custom_questions.map((q, i) => (
              <div key={i} className="flex items-center gap-2">
                <input placeholder={`Pergunta ${i + 1}`} value={q} onChange={e => updateQuestion(i, e.target.value)}
                  className="flex-1 rounded-xl px-4 h-11 font-inter text-sm outline-none text-foreground" style={{ background: "hsl(var(--background))", border: "1px solid rgba(13,33,55,0.1)" }} />
                <button type="button" onClick={() => removeQuestion(i)} className="p-2 rounded-lg flex-shrink-0" style={{ background: "rgba(180,35,24,0.1)" }}>
                  <X size={15} style={{ color: "#B42318" }} />
                </button>
              </div>
            ))}
            <button type="button" onClick={addQuestion} className="flex items-center gap-1.5 font-inter text-xs font-semibold self-start" style={{ color: "#B5862A" }}>
              <Plus size={14} /> Adicionar pergunta
            </button>
          </div>

          <button type="submit" className="rounded-xl h-11 font-montserrat font-bold text-sm text-white" style={{ background: "#0D2137" }}>{editingId ? "Salvar alterações" : "Criar evento"}</button>
        </form>
      )}

      {openEvent ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setOpenEvent(null)} className="font-inter text-sm" style={{ color: "#B5862A" }}>← Voltar</button>
            <button onClick={() => openEditForm(openEvent)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-inter text-xs font-semibold" style={{ background: "rgba(13,33,55,0.06)", color: "#0D2137" }}>
              <Pencil size={13} /> Editar evento
            </button>
          </div>
          <h2 className="font-montserrat font-bold text-lg mb-3 text-foreground">{openEvent.title} — Inscritos ({eventRegs.length})</h2>
          <div className="flex flex-col gap-2">
            {eventRegs.length === 0 ? (
              <p className="font-inter text-sm" style={{ color: "#9CA3AF" }}>Nenhuma inscrição ainda.</p>
            ) : eventRegs.map(r => {
              const status = r.status || "pendente";
              return (
                <div key={r.id} className="rounded-xl p-3 flex flex-col gap-2" style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.08)" }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-inter text-sm font-semibold text-foreground">{r.member_name}</p>
                      {r.answers && Object.entries(JSON.parse(r.answers || "{}")).map(([q, a]) => (
                        <p key={q} className="font-inter text-xs mt-1" style={{ color: "#6B7280" }}><span className="font-semibold">{q}</span> {a}</p>
                      ))}
                      {r.confirmed && <span className="text-[10px] font-semibold" style={{ color: "#1F8A5B" }}>✓ presença confirmada</span>}
                      {status === "aprovado" && !r.confirmed && (
                        <span className="text-[10px] font-semibold" style={{ color: "#D99A22" }}>⏳ aguardando confirmação — vaga pode ser realocada</span>
                      )}
                      {r.nps_score !== undefined && r.nps_score !== null && (
                        <p className="font-inter text-[11px] mt-1" style={{ color: "#6B7280" }}>
                          NPS: <span className="font-semibold" style={{ color: "#B5862A" }}>{r.nps_score}/5</span>{r.nps_comment && ` — "${r.nps_comment}"`}
                        </p>
                      )}
                    </div>
                    <span className="flex items-center gap-1 px-2 py-1 rounded-lg font-inter text-[11px] font-semibold flex-shrink-0"
                      style={{
                        background: status === "aprovado" ? "rgba(31,138,91,0.1)" : status === "recusado" ? "rgba(180,35,24,0.1)" : "rgba(217,154,34,0.1)",
                        color: status === "aprovado" ? "#1F8A5B" : status === "recusado" ? "#B42318" : "#D99A22",
                      }}>
                      {status === "aprovado" ? <Check size={12} /> : status === "recusado" ? <XCircle size={12} /> : <Clock size={12} />}
                      {status === "aprovado" ? "Aprovado" : status === "recusado" ? "Recusado" : "Pendente"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => decide(r, "aprovado")}
                      className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg font-inter text-xs font-semibold"
                      style={{ background: status === "aprovado" ? "#1F8A5B" : "rgba(31,138,91,0.1)", color: status === "aprovado" ? "#FFF" : "#1F8A5B" }}>
                      <Check size={13} /> Aprovar
                    </button>
                    <button onClick={() => decide(r, "recusado")}
                      className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg font-inter text-xs font-semibold"
                      style={{ background: status === "recusado" ? "#B42318" : "rgba(180,35,24,0.1)", color: status === "recusado" ? "#FFF" : "#B42318" }}>
                      <XCircle size={13} /> Recusar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {events.map(ev => {
            const count = regs.filter(r => r.event_id === ev.id).length;
            return (
              <div key={ev.id} className="rounded-2xl p-4 flex items-center gap-3" style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.06)" }}>
                <button onClick={() => setOpenEvent(ev)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(181,134,42,0.1)" }}><Zap size={16} style={{ color: "#B5862A" }} /></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-inter text-sm font-semibold text-foreground">{ev.title}</p>
                    <p className="font-inter text-xs" style={{ color: "#6B7280" }}>{new Date(ev.date + "T12:00:00").toLocaleDateString("pt-BR")} · {ev.location}</p>
                  </div>
                </button>
                <div className="flex items-center gap-1 flex-shrink-0 font-inter text-xs" style={{ color: "#9CA3AF" }}><Users size={13} /> {count}</div>
                <button onClick={() => openEditForm(ev)} className="p-2 rounded-lg flex-shrink-0" style={{ background: "rgba(13,33,55,0.06)" }}>
                  <Pencil size={14} style={{ color: "#0D2137" }} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}