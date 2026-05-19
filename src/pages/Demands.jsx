import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { MessageSquare, Send, CheckCircle2 } from "lucide-react";
import MobileHeader from "../components/layout/MobileHeader";

const CATEGORIES = [
  "Alterar Pontuação de Presença",
  "Alterar Pontuação de Story",
  "Alterar Pontuação de Clube do Livro/Evento Ordinário de Formação",
  "Justificativa de Falta",
  "Questões Relativas ao Artigo Obrigatório",
  "Questões Relativas ao ROL Literário (vídeos)",
  "Outros Problemas do Ranking",
  "Outros",
];

const CYCLES = ["Qualifier", "Ciclo 1", "Ciclo 2", "Ciclo 3"];

export default function Demands() {
  const [user, setUser] = useState(null);
  const [member, setMember] = useState(null);
  const [form, setForm] = useState({ nome: "", telefone: "", ciclo: "", categoria: "", outro: "", justificativa: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    base44.auth.me().then(async u => {
      setUser(u);
      setForm(f => ({ ...f, nome: u.full_name || "", telefone: "" }));
      const members = await base44.entities.Member.filter({ email: u.email });
      if (members.length > 0) setMember(members[0]);
    }).catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nome || !form.ciclo || !form.categoria || !form.justificativa) return;
    setSubmitting(true);

    // Save demand directly to DemandRequest entity
    await base44.entities.DemandRequest.create({
      member_id: member?.id || "",
      member_name: form.nome,
      member_email: user?.email || "",
      phone: form.telefone,
      cycle: form.ciclo,
      category: form.categoria,
      other_category: form.outro,
      justification: form.justificativa,
      status: "pendente",
    });

    setSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="min-h-screen" style={{ background: "#F0F0F4", paddingBottom: "calc(env(safe-area-inset-bottom) + 96px)" }}>
        <div style={{ background: "#0D2137" }}><MobileHeader title="Demandas" dark /></div>
        <div className="flex flex-col items-center justify-center px-6 py-20 gap-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "rgba(31,138,91,0.1)" }}>
            <CheckCircle2 size={40} style={{ color: "#1F8A5B" }} />
          </div>
          <h2 className="font-montserrat font-black text-xl text-center" style={{ color: "#0D2137" }}>Demanda enviada!</h2>
          <p className="font-inter text-sm text-center leading-relaxed" style={{ color: "#6B7280" }}>
            Sua solicitação foi registrada e enviada à Diretoria de Formação. Você receberá uma devolutiva em até <strong>2 semanas</strong> pelo WhatsApp.
          </p>
          <button onClick={() => { setSubmitted(false); setForm(f => ({ ...f, ciclo: "", categoria: "", outro: "", justificativa: "" })); }}
            className="mt-2 px-6 py-3 rounded-2xl font-montserrat font-bold text-sm text-white"
            style={{ background: "#0D2137" }}>
            Nova demanda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#F0F0F4", paddingBottom: "calc(env(safe-area-inset-bottom) + 96px)" }}>
      <div style={{ background: "#0D2137" }}>
        <MobileHeader title="SAC — Demandas" dark />
        <div className="px-5 pb-5">
          <h1 className="font-montserrat font-black text-2xl text-white">Demandas</h1>
          <p className="font-inter text-sm mt-1" style={{ color: "rgba(255,255,255,0.55)" }}>Diretoria de Formação 2026</p>
        </div>
      </div>

      <div className="px-4 mt-4">
        <div className="rounded-2xl p-4 mb-4" style={{ background: "rgba(13,33,55,0.04)", border: "1px solid rgba(13,33,55,0.1)" }}>
          <p className="font-inter text-sm leading-relaxed" style={{ color: "#374151" }}>
            Todos os pedidos serão analisados em até <strong>2 semanas</strong>, com devolutiva pelo <strong>WhatsApp</strong>.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="font-inter text-xs font-semibold block mb-1.5" style={{ color: "#0D2137" }}>Nome <span style={{ color: "#B42318" }}>*</span></label>
            <input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Seu nome completo" required
              className="w-full rounded-xl px-4 font-inter text-sm focus:outline-none"
              style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.1)", color: "#111827", height: 48 }} />
          </div>

          <div>
            <label className="font-inter text-xs font-semibold block mb-1.5" style={{ color: "#0D2137" }}>Telefone (WhatsApp) <span style={{ color: "#B42318" }}>*</span></label>
            <input value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} placeholder="(31) 9 0000-0000" type="tel" required
              className="w-full rounded-xl px-4 font-inter text-sm focus:outline-none"
              style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.1)", color: "#111827", height: 48 }} />
          </div>

          <div>
            <label className="font-inter text-xs font-semibold block mb-1.5" style={{ color: "#0D2137" }}>Ciclo de Formação <span style={{ color: "#B42318" }}>*</span></label>
            <div className="flex gap-2 flex-wrap">
              {CYCLES.map(c => (
                <button key={c} type="button" onClick={() => setForm({ ...form, ciclo: c })}
                  className="px-4 rounded-2xl font-inter text-xs font-semibold"
                  style={{ height: 44, background: form.ciclo === c ? "#0D2137" : "hsl(var(--card))", color: form.ciclo === c ? "#FFF" : "#6B7280", border: form.ciclo === c ? "1px solid rgba(181,134,42,0.3)" : "1px solid rgba(13,33,55,0.1)" }}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-inter text-xs font-semibold block mb-1.5" style={{ color: "#0D2137" }}>Categoria da Demanda <span style={{ color: "#B42318" }}>*</span></label>
            <div className="flex flex-col gap-2">
              {CATEGORIES.map(cat => (
                <button key={cat} type="button" onClick={() => setForm({ ...form, categoria: cat })}
                  className="flex items-center gap-3 w-full px-4 rounded-xl text-left"
                  style={{ height: 48, background: form.categoria === cat ? "rgba(13,33,55,0.06)" : "hsl(var(--card))", border: form.categoria === cat ? "1px solid rgba(13,33,55,0.25)" : "1px solid rgba(13,33,55,0.08)" }}>
                  <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                    style={{ borderColor: form.categoria === cat ? "#0D2137" : "#D1D5DB" }}>
                    {form.categoria === cat && <div className="w-2 h-2 rounded-full" style={{ background: "#0D2137" }} />}
                  </div>
                  <span className="font-inter text-sm" style={{ color: "#374151" }}>{cat}</span>
                </button>
              ))}
            </div>
          </div>

          {form.categoria === "Outros" && (
            <div>
              <label className="font-inter text-xs font-semibold block mb-1.5" style={{ color: "#0D2137" }}>Especifique</label>
              <input value={form.outro} onChange={e => setForm({ ...form, outro: e.target.value })} placeholder="Descreva sua demanda"
                className="w-full rounded-xl px-4 font-inter text-sm focus:outline-none"
                style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.1)", color: "#111827", height: 48 }} />
            </div>
          )}

          <div>
            <label className="font-inter text-xs font-semibold block mb-1.5" style={{ color: "#0D2137" }}>Justificativa <span style={{ color: "#B42318" }}>*</span></label>
            <textarea value={form.justificativa} onChange={e => setForm({ ...form, justificativa: e.target.value })}
              placeholder="Descreva detalhadamente sua demanda..." rows={4} required
              className="w-full rounded-xl px-4 py-3 font-inter text-sm resize-none focus:outline-none"
              style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.1)", color: "#111827" }} />
          </div>

          <button type="submit" disabled={submitting || !form.nome || !form.telefone || !form.ciclo || !form.categoria || !form.justificativa}
            className="w-full rounded-2xl font-montserrat font-bold text-sm flex items-center justify-center gap-2"
            style={{ height: 52, background: (!form.nome || !form.telefone || !form.ciclo || !form.categoria || !form.justificativa) ? "rgba(13,33,55,0.1)" : "#0D2137", color: (!form.nome || !form.telefone || !form.ciclo || !form.categoria || !form.justificativa) ? "#9CA3AF" : "#FFF" }}>
            <Send size={16} />
            {submitting ? "Enviando..." : "Enviar Demanda"}
          </button>
        </form>
      </div>
    </div>
  );
}