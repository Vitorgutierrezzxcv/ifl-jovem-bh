import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Zap, MapPin, Calendar, Star, CheckCircle2, Send } from "lucide-react";
import MobileHeader from "../components/layout/MobileHeader";

export default function ExtraordinaryEvents() {
  const [user, setUser] = useState(null);
  const [member, setMember] = useState(null);
  const [events, setEvents] = useState([]);
  const [myRegs, setMyRegs] = useState({});
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [npsScore, setNpsScore] = useState(0);
  const [npsComment, setNpsComment] = useState("");
  const [regError, setRegError] = useState("");

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const u = await base44.auth.me();
      setUser(u);
      const members = await base44.entities.Member.filter({ email: u.email });
      const m = members[0] || null;
      setMember(m);
      const evs = await base44.entities.ExtraordinaryEvent.list("-date", 50);
      setEvents(evs);
      const urlId = new URLSearchParams(window.location.search).get("id");
      if (urlId) {
        const match = evs.find(e => e.id === urlId);
        if (match) setSelected(match);
      }
      if (m) {
        const regs = await base44.entities.ExtraordinaryRegistration.filter({ member_id: m.id }, undefined, 200);
        const byEvent = {};
        regs.forEach(r => { byEvent[r.event_id] = r; });
        setMyRegs(byEvent);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleRegister(e) {
    e.preventDefault();
    if (!selected) return;
    setRegError("");
    if (!member) {
      setRegError("Não encontramos seu cadastro de associado. Fale com a diretoria para liberar sua inscrição.");
      return;
    }
    setSubmitting(true);
    try {
      const reg = await base44.entities.ExtraordinaryRegistration.create({
        event_id: selected.id,
        event_title: selected.title,
        member_id: member.id,
        member_name: member.full_name,
        answers: JSON.stringify(answers),
      });
      setMyRegs(prev => ({ ...prev, [selected.id]: reg }));
      setAnswers({});
    } catch (err) {
      setRegError("Não foi possível enviar sua inscrição. Tente novamente.");
    }
    setSubmitting(false);
  }

  async function handleConfirm(reg) {
    const updated = await base44.entities.ExtraordinaryRegistration.update(reg.id, { confirmed: true });
    setMyRegs(prev => ({ ...prev, [reg.event_id]: updated }));
  }

  async function handleNps(reg) {
    if (!npsScore) return;
    const updated = await base44.entities.ExtraordinaryRegistration.update(reg.id, { nps_score: npsScore, nps_comment: npsComment });
    setMyRegs(prev => ({ ...prev, [reg.event_id]: updated }));
    setNpsScore(0);
    setNpsComment("");
  }

  const today = new Date().toISOString().split("T")[0];

  if (selected) {
    const reg = myRegs[selected.id];
    const daysUntil = Math.ceil((new Date(selected.date) - new Date(today)) / (1000 * 60 * 60 * 24));
    const eventPassed = selected.date < today;
    const canGiveNps = eventPassed && reg?.status === "aprovado" && selected.collect_nps && reg?.nps_score === undefined;

    return (
      <div className="min-h-screen" style={{ background: "#0D2137", paddingBottom: "calc(env(safe-area-inset-bottom) + 96px)" }}>
        <div style={{ background: "#0D2137" }}><MobileHeader title="Evento Extraordinário" dark showBack /></div>
        <div className="px-4 pt-4 flex flex-col gap-4">
          <div className="rounded-2xl p-5" style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.08)" }}>
            <div className="flex items-center gap-2 mb-2">
              <Zap size={14} style={{ color: "#B5862A" }} />
              <span className="font-inter text-xs font-semibold" style={{ color: "#B5862A" }}>Evento Extraordinário</span>
            </div>
            <h2 className="font-montserrat font-bold text-xl text-foreground mb-3">{selected.title}</h2>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <Calendar size={16} style={{ color: "#B5862A" }} />
                <span className="font-inter text-sm" style={{ color: "#374151" }}>
                  {new Date(selected.date + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </span>
              </div>
              {selected.location && (
                <div className="flex items-center gap-3">
                  <MapPin size={16} style={{ color: "#B5862A" }} />
                  <span className="font-inter text-sm" style={{ color: "#374151" }}>{selected.location}</span>
                </div>
              )}
            </div>
            {selected.description && <p className="font-inter text-sm mt-3 leading-relaxed" style={{ color: "#6B7280" }}>{selected.description}</p>}
          </div>

          {/* Not registered yet */}
          {!reg && selected.status === "aberto" && (
            <form onSubmit={handleRegister} className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.08)" }}>
              <p className="font-montserrat font-bold text-sm text-foreground">Inscreva-se</p>
              {(selected.custom_questions || []).map((q, i) => (
                <div key={i}>
                  <label className="font-inter text-xs font-semibold block mb-1.5" style={{ color: "#0D2137" }}>{q}</label>
                  <input value={answers[q] || ""} onChange={e => setAnswers({ ...answers, [q]: e.target.value })}
                    className="w-full rounded-xl px-4 font-inter text-sm outline-none text-foreground"
                    style={{ background: "hsl(var(--background))", border: "1px solid rgba(13,33,55,0.1)", height: 46 }} />
                </div>
              ))}
              {regError && <p className="font-inter text-xs font-semibold" style={{ color: "#B42318" }}>{regError}</p>}
              <button type="submit" disabled={submitting}
                className="w-full rounded-2xl font-montserrat font-bold text-sm text-white flex items-center justify-center gap-2 mt-1"
                style={{ height: 50, background: "#0D2137" }}>
                <Send size={15} /> {submitting ? "Enviando..." : "Confirmar Inscrição"}
              </button>
            </form>
          )}

          {/* Registered — status */}
          {reg && (
            <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.08)" }}>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} style={{ color: "#1F8A5B" }} />
                <p className="font-montserrat font-bold text-sm text-foreground">Inscrição enviada</p>
              </div>
              <p className="font-inter text-xs" style={{ color: "#6B7280" }}>
                {reg.status === "aprovado" ? "Você foi selecionado(a) pela diretoria! 🎉"
                  : reg.status === "recusado" ? "Sua inscrição não foi selecionada desta vez."
                  : "Aguardando seleção da diretoria."}
              </p>

              {reg.status === "aprovado" && !reg.confirmed && !eventPassed && daysUntil <= 5 && (
                <button onClick={() => handleConfirm(reg)}
                  className="w-full rounded-2xl font-montserrat font-bold text-sm text-white mt-1"
                  style={{ height: 48, background: "#1F8A5B" }}>
                  Confirmar minha presença
                </button>
              )}
              {reg.status === "aprovado" && reg.confirmed && <p className="font-inter text-xs font-semibold" style={{ color: "#1F8A5B" }}>✓ Presença confirmada</p>}
            </div>
          )}

          {/* NPS after event */}
          {canGiveNps && (
            <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.08)" }}>
              <p className="font-montserrat font-bold text-sm text-foreground">Como foi sua experiência?</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => setNpsScore(n)}
                    className="flex-1 rounded-xl py-2.5 font-montserrat font-bold text-sm"
                    style={{ background: npsScore >= n ? "#B5862A" : "hsl(var(--background))", color: npsScore >= n ? "#FFF" : "#9CA3AF", border: "1px solid rgba(13,33,55,0.1)" }}>
                    {n}
                  </button>
                ))}
              </div>
              <textarea value={npsComment} onChange={e => setNpsComment(e.target.value)} rows={3} placeholder="Comentário (opcional)"
                className="w-full rounded-xl px-4 py-3 font-inter text-sm resize-none outline-none text-foreground"
                style={{ background: "hsl(var(--background))", border: "1px solid rgba(13,33,55,0.1)" }} />
              <button onClick={() => handleNps(reg)} disabled={!npsScore}
                className="w-full rounded-2xl font-montserrat font-bold text-sm text-white"
                style={{ height: 48, background: npsScore ? "#0D2137" : "rgba(13,33,55,0.2)" }}>
                Enviar avaliação
              </button>
            </div>
          )}
          {reg?.nps_score && <p className="font-inter text-xs text-center" style={{ color: "#6B7280" }}>Obrigado pela avaliação! ⭐ {reg.nps_score}/5</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#0D2137", paddingBottom: "calc(env(safe-area-inset-bottom) + 96px)" }}>
      <div style={{ background: "#0D2137" }}>
        <MobileHeader title="Eventos Extraordinários" dark />
        <div className="px-5 pb-4">
          <p className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>Visitas técnicas, workshops, cases e mais</p>
        </div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-3">
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-7 h-7 border-4 border-gray-200 border-t-ifl-navy rounded-full animate-spin" /></div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-2">
            <Zap size={40} style={{ color: "#D1D5DB" }} />
            <p className="font-inter text-sm" style={{ color: "#9CA3AF" }}>Nenhum evento extraordinário no momento</p>
          </div>
        ) : events.map(ev => {
          const reg = myRegs[ev.id];
          return (
            <button key={ev.id} onClick={() => setSelected(ev)}
              className="rounded-2xl p-4 flex items-center gap-3 card-hover text-left w-full"
              style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.06)", boxShadow: "0 2px 8px rgba(13,33,55,0.04)" }}>
              <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0" style={{ background: "#0D2137" }}>
                <span className="font-montserrat font-black text-lg text-white leading-none">{new Date(ev.date + "T12:00:00").getDate()}</span>
                <span className="font-inter text-[9px] uppercase" style={{ color: "#C9973A" }}>{new Date(ev.date + "T12:00:00").toLocaleString("pt-BR", { month: "short" })}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-montserrat font-bold text-sm truncate text-foreground">{ev.title}</p>
                <p className="font-inter text-xs mt-0.5" style={{ color: "#6B7280" }}>{ev.location || "Local a definir"}</p>
                {reg && <span className="inline-block text-[10px] font-semibold mt-1 px-2 py-0.5 rounded-full" style={{ background: "rgba(31,138,91,0.1)", color: "#1F8A5B" }}>Inscrito</span>}
              </div>
              <Star size={16} style={{ color: "#B5862A", flexShrink: 0 }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}