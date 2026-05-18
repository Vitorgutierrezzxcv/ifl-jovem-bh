import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { MessageSquare, Send, CheckCircle2, ExternalLink } from "lucide-react";
import MobileHeader from "../components/layout/MobileHeader";
import BottomNav from "../components/layout/BottomNav";

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

const CYCLES = ["Ciclo 1", "Ciclo 2", "Ciclo 3", "Qualifier"];

export default function Demands() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ nome: "", telefone: "", ciclo: "", categoria: "", outro: "", justificativa: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setForm(f => ({ ...f, nome: u.full_name || "" }));
    }).catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nome || !form.ciclo || !form.categoria || !form.justificativa) return;
    setSubmitting(true);
    // Open the actual Google Form in a new tab pre-filled where possible
    const googleFormUrl = "https://docs.google.com/forms/d/e/1FAIpQLSfo6x839hPeTKVyfjO_kpb-ccltd99oriP4NdBPRC86fUtkLQ/viewform";
    window.open(googleFormUrl, "_blank");
    setSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-ifl-gray-bg" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 96px)" }}>
        <MobileHeader title="Demandas" dark />
        <div className="flex flex-col items-center justify-center px-6 py-20 gap-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "rgba(31,138,91,0.1)" }}>
            <CheckCircle2 size={40} style={{ color: "#1F8A5B" }} />
          </div>
          <h2 className="font-montserrat font-black text-xl text-center" style={{ color: "#071D33" }}>
            Formulário aberto!
          </h2>
          <p className="font-inter text-sm text-center leading-relaxed" style={{ color: "#6B7280" }}>
            O formulário oficial da Diretoria de Formação foi aberto no seu navegador. Preencha e envie por lá.
          </p>
          <p className="font-inter text-xs text-center" style={{ color: "#9CA3AF" }}>
            Após o envio, você receberá uma devolutiva pelo WhatsApp em até 2 semanas.
          </p>
          <button onClick={() => setSubmitted(false)}
            className="mt-2 px-6 py-3 rounded-2xl font-montserrat font-bold text-sm"
            style={{ background: "#071D33", color: "#D4A043" }}>
            Nova demanda
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ifl-gray-bg" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 96px)" }}>
      {/* Header */}
      <div className="hex-bg-dark relative overflow-hidden" style={{ background: "linear-gradient(160deg, #071D33 0%, #0A2640 100%)" }}>
        <div className="absolute top-0 right-0 w-40 h-40 pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(184,135,42,0.14) 0%, transparent 70%)", transform: "translate(20%, -20%)" }} />
        <MobileHeader title="SAC — Demandas" dark />
        <div className="px-5 pb-6">
          <h1 className="font-montserrat font-black text-2xl text-white">Demandas</h1>
          <p className="font-inter text-sm mt-1" style={{ color: "rgba(255,255,255,0.55)" }}>Diretoria de Formação 2026</p>
        </div>
      </div>

      <div className="px-4 mt-4">
        {/* Info card */}
        <div className="rounded-2xl p-4 mb-4" style={{ background: "rgba(7,29,51,0.04)", border: "1px solid rgba(7,29,51,0.1)" }}>
          <p className="font-inter text-sm leading-relaxed" style={{ color: "#374151" }}>
            Todos os pedidos relacionados à Diretoria de Formação devem ser enviados pelo formulário oficial. A solicitação será analisada em até <strong>2 semanas</strong>, com devolutiva pelo <strong>WhatsApp</strong>.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Nome */}
          <div>
            <label className="font-inter text-xs font-semibold block mb-1.5" style={{ color: "#071D33" }}>
              Nome <span style={{ color: "#B42318" }}>*</span>
            </label>
            <input
              value={form.nome}
              onChange={e => setForm({ ...form, nome: e.target.value })}
              placeholder="Seu nome completo"
              required
              className="w-full rounded-xl px-4 font-inter text-sm focus:outline-none"
              style={{ background: "hsl(var(--card))", border: "1px solid rgba(7,29,51,0.1)", color: "#111827", height: 48 }}
            />
          </div>

          {/* Telefone */}
          <div>
            <label className="font-inter text-xs font-semibold block mb-1.5" style={{ color: "#071D33" }}>
              Telefone <span style={{ color: "#B42318" }}>*</span>
            </label>
            <input
              value={form.telefone}
              onChange={e => setForm({ ...form, telefone: e.target.value })}
              placeholder="(31) 9 0000-0000"
              type="tel"
              required
              className="w-full rounded-xl px-4 font-inter text-sm focus:outline-none"
              style={{ background: "hsl(var(--card))", border: "1px solid rgba(7,29,51,0.1)", color: "#111827", height: 48 }}
            />
          </div>

          {/* Ciclo */}
          <div>
            <label className="font-inter text-xs font-semibold block mb-1.5" style={{ color: "#071D33" }}>
              Ciclo de Formação <span style={{ color: "#B42318" }}>*</span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {CYCLES.map(c => (
                <button key={c} type="button" onClick={() => setForm({ ...form, ciclo: c })}
                  className="px-4 rounded-2xl font-inter text-xs font-semibold transition-all"
                  style={{
                    height: 44,
                    background: form.ciclo === c ? "#071D33" : "hsl(var(--card))",
                    color: form.ciclo === c ? "#D4A043" : "#6B7280",
                    border: form.ciclo === c ? "1px solid rgba(184,135,42,0.3)" : "1px solid rgba(7,29,51,0.1)",
                  }}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Categoria */}
          <div>
            <label className="font-inter text-xs font-semibold block mb-1.5" style={{ color: "#071D33" }}>
              Categoria da Demanda <span style={{ color: "#B42318" }}>*</span>
            </label>
            <div className="flex flex-col gap-2">
              {CATEGORIES.map(cat => (
                <button key={cat} type="button" onClick={() => setForm({ ...form, categoria: cat })}
                  className="flex items-center gap-3 w-full px-4 rounded-xl text-left transition-all"
                  style={{
                    height: 48,
                    background: form.categoria === cat ? "rgba(7,29,51,0.06)" : "hsl(var(--card))",
                    border: form.categoria === cat ? "1px solid rgba(7,29,51,0.25)" : "1px solid rgba(7,29,51,0.08)",
                  }}>
                  <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                    style={{ borderColor: form.categoria === cat ? "#071D33" : "#D1D5DB" }}>
                    {form.categoria === cat && <div className="w-2 h-2 rounded-full" style={{ background: "#071D33" }} />}
                  </div>
                  <span className="font-inter text-sm" style={{ color: "#374151" }}>{cat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Outro (conditional) */}
          {form.categoria === "Outros" && (
            <div>
              <label className="font-inter text-xs font-semibold block mb-1.5" style={{ color: "#071D33" }}>Especifique</label>
              <input
                value={form.outro}
                onChange={e => setForm({ ...form, outro: e.target.value })}
                placeholder="Descreva sua demanda"
                className="w-full rounded-xl px-4 font-inter text-sm focus:outline-none"
                style={{ background: "hsl(var(--card))", border: "1px solid rgba(7,29,51,0.1)", color: "#111827", height: 48 }}
              />
            </div>
          )}

          {/* Justificativa */}
          <div>
            <label className="font-inter text-xs font-semibold block mb-1.5" style={{ color: "#071D33" }}>
              Justificativa da demanda <span style={{ color: "#B42318" }}>*</span>
            </label>
            <textarea
              value={form.justificativa}
              onChange={e => setForm({ ...form, justificativa: e.target.value })}
              placeholder="Descreva detalhadamente sua demanda..."
              rows={4}
              required
              className="w-full rounded-xl px-4 py-3 font-inter text-sm resize-none focus:outline-none"
              style={{ background: "hsl(var(--card))", border: "1px solid rgba(7,29,51,0.1)", color: "#111827" }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !form.nome || !form.ciclo || !form.categoria || !form.justificativa}
            className="w-full rounded-2xl font-montserrat font-bold text-sm flex items-center justify-center gap-2 transition-all"
            style={{
              height: 52,
              background: (!form.nome || !form.ciclo || !form.categoria || !form.justificativa) ? "rgba(7,29,51,0.1)" : "#071D33",
              color: (!form.nome || !form.ciclo || !form.categoria || !form.justificativa) ? "#9CA3AF" : "#D4A043",
            }}>
            <ExternalLink size={16} />
            Abrir Formulário Oficial
          </button>

          <p className="font-inter text-xs text-center" style={{ color: "#9CA3AF" }}>
            O formulário oficial do Google será aberto para envio
          </p>
        </form>
      </div>

      <BottomNav />
    </div>
  );
}