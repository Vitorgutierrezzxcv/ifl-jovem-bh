import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Users, CheckCircle2, ExternalLink, Star } from "lucide-react";
import MobileHeader from "../components/layout/MobileHeader";
import BottomNav from "../components/layout/BottomNav";

const AREAS = [
  { id: "recepcao", label: "Recepção", desc: "18h30 · Controle de ingressos e fluxo de entrada" },
  { id: "lanche", label: "Lanche", desc: "18h00 · Preparo, organização e limpeza" },
];

export default function Collaboration() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ nome: "", email: "", telefone: "", areas: [], ciente1: false, ciente2: false, ciente3: false });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setForm(f => ({ ...f, nome: u.full_name || "", email: u.email || "" }));
    }).catch(() => {});
  }, []);

  function toggleArea(id) {
    setForm(f => ({
      ...f,
      areas: f.areas.includes(id) ? f.areas.filter(a => a !== id) : [...f.areas, id],
    }));
  }

  const canSubmit = form.nome && form.email && form.telefone && form.areas.length > 0 && form.ciente1 && form.ciente2 && form.ciente3;

  function handleSubmit(e) {
    e.preventDefault();
    const url = "https://docs.google.com/forms/d/e/1FAIpQLSfo6x839hPeTKVyfjO_kpb-ccltd99oriP4NdBPRC86fUtkLQ/viewform";
    window.open(url, "_blank");
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-ifl-gray-bg" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 96px)" }}>
        <div style={{ background: "linear-gradient(160deg, #071D33 0%, #0A2640 100%)" }}>
          <MobileHeader title="Colaborações" dark />
        </div>
        <div className="flex flex-col items-center justify-center px-6 py-16 gap-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "rgba(184,135,42,0.1)" }}>
            <CheckCircle2 size={40} style={{ color: "#B8872A" }} />
          </div>
          <h2 className="font-montserrat font-black text-xl text-center" style={{ color: "#071D33" }}>Inscrição enviada!</h2>
          <p className="font-inter text-sm text-center leading-relaxed" style={{ color: "#6B7280" }}>
            O formulário oficial foi aberto. Complete o envio por lá. Você será chamado conforme a ordem da fila.
          </p>
          <p className="font-inter text-xs text-center px-4 py-3 rounded-2xl" style={{ background: "rgba(184,135,42,0.08)", color: "#B8872A", border: "1px solid rgba(184,135,42,0.2)" }}>
            ⭐ Cada colaboração válida garante <strong>5 pontos</strong> na sua trilha de engajamento!
          </p>
          <button onClick={() => setSubmitted(false)}
            className="px-6 py-3 rounded-2xl font-montserrat font-bold text-sm"
            style={{ background: "#071D33", color: "#D4A043" }}>
            Voltar
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
        <MobileHeader title="Colaborações" dark />
        <div className="px-5 pb-6">
          <div className="flex items-center gap-3">
            <Users size={26} style={{ color: "#D4A043" }} />
            <div>
              <h1 className="font-montserrat font-black text-2xl text-white">Colaborações</h1>
              <p className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Eventos IFL Jovem BH · 2026</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 mt-4 flex flex-col gap-4">
        {/* Info cards */}
        <div className="flex flex-col gap-2">
          {[
            { icon: "📌", text: "A inscrição é válida para os eventos de 2026 e deve ser realizada apenas uma vez ao longo do ano." },
            { icon: "🔢", text: "Os colaboradores serão chamados de acordo com a ordem da fila. Após receber o convite, você terá até 2 horas para confirmar." },
            { icon: "⭐", text: "Cada colaboração válida garante 5 pontos na trilha de engajamento." },
            { icon: "📘", text: "Ao ser convidado, você receberá um manual completo com as funções e obrigações." },
          ].map((item, i) => (
            <div key={i} className="rounded-2xl px-4 py-3 flex items-start gap-3"
              style={{ background: "hsl(var(--card))", border: "1px solid rgba(7,29,51,0.06)" }}>
              <span className="text-base flex-shrink-0">{item.icon}</span>
              <p className="font-inter text-sm leading-relaxed" style={{ color: "#374151" }}>{item.text}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Nome */}
          <div>
            <label className="font-inter text-xs font-semibold block mb-1.5" style={{ color: "#071D33" }}>Nome Completo <span style={{ color: "#B42318" }}>*</span></label>
            <input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} required
              placeholder="Seu nome completo"
              className="w-full rounded-xl px-4 font-inter text-sm focus:outline-none"
              style={{ height: 48, background: "hsl(var(--card))", border: "1px solid rgba(7,29,51,0.1)", color: "#111827" }} />
          </div>

          {/* Email */}
          <div>
            <label className="font-inter text-xs font-semibold block mb-1.5" style={{ color: "#071D33" }}>E-mail <span style={{ color: "#B42318" }}>*</span></label>
            <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required type="email"
              placeholder="seu@email.com"
              className="w-full rounded-xl px-4 font-inter text-sm focus:outline-none"
              style={{ height: 48, background: "hsl(var(--card))", border: "1px solid rgba(7,29,51,0.1)", color: "#111827" }} />
          </div>

          {/* Telefone */}
          <div>
            <label className="font-inter text-xs font-semibold block mb-1.5" style={{ color: "#071D33" }}>Telefone <span style={{ color: "#B42318" }}>*</span></label>
            <input value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} required type="tel"
              placeholder="(31) 9 0000-0000"
              className="w-full rounded-xl px-4 font-inter text-sm focus:outline-none"
              style={{ height: 48, background: "hsl(var(--card))", border: "1px solid rgba(7,29,51,0.1)", color: "#111827" }} />
          </div>

          {/* Áreas */}
          <div>
            <label className="font-inter text-xs font-semibold block mb-2" style={{ color: "#071D33" }}>
              Qual área você gostaria de colaborar? <span style={{ color: "#B42318" }}>*</span>
            </label>
            {AREAS.map(area => (
              <button key={area.id} type="button" onClick={() => toggleArea(area.id)}
                className="w-full flex items-start gap-3 px-4 py-3 rounded-xl mb-2 text-left"
                style={{
                  background: form.areas.includes(area.id) ? "rgba(7,29,51,0.06)" : "hsl(var(--card))",
                  border: form.areas.includes(area.id) ? "1px solid rgba(7,29,51,0.25)" : "1px solid rgba(7,29,51,0.08)",
                  minHeight: 56,
                }}>
                <div className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ borderColor: form.areas.includes(area.id) ? "#071D33" : "#D1D5DB", background: form.areas.includes(area.id) ? "#071D33" : "transparent" }}>
                  {form.areas.includes(area.id) && <span className="text-white text-xs font-bold">✓</span>}
                </div>
                <div>
                  <p className="font-inter text-sm font-semibold" style={{ color: "#111827" }}>{area.label}</p>
                  <p className="font-inter text-xs" style={{ color: "#6B7280" }}>{area.desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Cientes */}
          {[
            { key: "ciente1", text: "Estou ciente de que a colaboração me dará 5 pontos e que, em caso de descumprimento das instruções, posso perder os pontos e ser impedido de futuras colaborações." },
            { key: "ciente2", text: "Estou ciente de que, ao ser convidado, receberei um manual completo das funções e obrigações e me comprometo a ler e seguir na íntegra todo o proposto." },
            { key: "ciente3", text: "Estou ciente de que, ao ser convidado, devo confirmar minha presença em até 2 horas. Caso não haja confirmação dentro desse prazo, minha vez será automaticamente pulada na lista de convocação." },
          ].map(item => (
            <button key={item.key} type="button"
              onClick={() => setForm(f => ({ ...f, [item.key]: !f[item.key] }))}
              className="flex items-start gap-3 w-full px-4 py-3 rounded-xl text-left"
              style={{
                background: form[item.key] ? "rgba(31,138,91,0.06)" : "hsl(var(--card))",
                border: form[item.key] ? "1px solid rgba(31,138,91,0.25)" : "1px solid rgba(7,29,51,0.08)",
                minHeight: 56,
              }}>
              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ borderColor: form[item.key] ? "#1F8A5B" : "#D1D5DB" }}>
                {form[item.key] && <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#1F8A5B" }} />}
              </div>
              <p className="font-inter text-xs leading-relaxed" style={{ color: "#374151" }}>
                {item.text} <strong>Estou ciente</strong>
              </p>
            </button>
          ))}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-2xl font-montserrat font-bold text-sm flex items-center justify-center gap-2 transition-all"
            style={{
              height: 52,
              background: canSubmit ? "#071D33" : "rgba(7,29,51,0.1)",
              color: canSubmit ? "#D4A043" : "#9CA3AF",
            }}>
            <ExternalLink size={16} />
            Abrir Formulário Oficial
          </button>
          <p className="font-inter text-xs text-center" style={{ color: "#9CA3AF" }}>
            Caso deseje retirar sua inscrição, entre em contato com o Diretor de Eventos.
          </p>
        </form>
      </div>

      <BottomNav />
    </div>
  );
}