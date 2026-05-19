import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Users, CheckCircle2, Send, Bell } from "lucide-react";
import MobileHeader from "../components/layout/MobileHeader";

const AREAS = [
  { id: "recepcao", label: "Recepção", desc: "18h30 · Controle de ingressos e fluxo de entrada" },
  { id: "lanche", label: "Lanche", desc: "18h00 · Preparo, organização e limpeza" },
];

export default function Collaboration() {
  const [user, setUser] = useState(null);
  const [member, setMember] = useState(null);
  const [myCollaboration, setMyCollaboration] = useState(null);
  const [form, setForm] = useState({ nome: "", email: "", telefone: "", areas: [], ciente1: false, ciente2: false, ciente3: false });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    base44.auth.me().then(async u => {
      setUser(u);
      setForm(f => ({ ...f, nome: u.full_name || "", email: u.email || "" }));
      const members = await base44.entities.Member.filter({ email: u.email });
      if (members.length > 0) {
        setMember(members[0]);
        // Check if already submitted — we look for an announcement with their name
        const existing = await base44.entities.Announcement.filter({ department_name: "Colaboração" });
        const mine = existing.find(a => a.content?.includes(u.email));
        if (mine) setMyCollaboration(mine);
      }
    }).catch(() => {});
  }, []);

  function toggleArea(id) {
    setForm(f => ({ ...f, areas: f.areas.includes(id) ? f.areas.filter(a => a !== id) : [...f.areas, id] }));
  }

  const canSubmit = form.nome && form.email && form.telefone && form.areas.length > 0 && form.ciente1 && form.ciente2 && form.ciente3;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);

    await base44.entities.Announcement.create({
      title: `[COLABORAÇÃO] ${form.nome}`,
      content: `Nome: ${form.nome}\nEmail: ${form.email}\nTelefone: ${form.telefone}\nÁreas: ${form.areas.join(", ")}`,
      audience: "diretoria",
      priority: "normal",
      status: "publicado",
      department_name: "Colaboração",
    });

    setSubmitting(false);
    setSubmitted(true);
  }

  // Already registered view
  if (myCollaboration && !submitted) {
    return (
      <div className="min-h-screen" style={{ background: "#F0F0F4", paddingBottom: "calc(env(safe-area-inset-bottom) + 96px)" }}>
        <div style={{ background: "#0D2137" }}><MobileHeader title="Colaborações" dark /></div>
        <div className="flex flex-col items-center px-6 py-16 gap-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "rgba(181,134,42,0.1)" }}>
            <Bell size={36} style={{ color: "#B5862A" }} />
          </div>
          <h2 className="font-montserrat font-black text-xl text-center" style={{ color: "#0D2137" }}>Você já está inscrito!</h2>
          <p className="font-inter text-sm text-center leading-relaxed" style={{ color: "#6B7280" }}>
            Sua inscrição foi registrada. Você será chamado conforme a ordem da fila quando um evento precisar de colaboradores.
          </p>
          <div className="w-full rounded-2xl p-4" style={{ background: "rgba(181,134,42,0.08)", border: "1px solid rgba(181,134,42,0.2)" }}>
            <p className="font-inter text-xs text-center font-semibold" style={{ color: "#B5862A" }}>
              ⭐ Cada colaboração válida garante <strong>5 pontos</strong> na trilha de engajamento!
            </p>
          </div>
          <div className="w-full rounded-2xl p-4" style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.08)" }}>
            <p className="font-montserrat font-bold text-sm mb-2" style={{ color: "#0D2137" }}>Status da sua inscrição</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              <span className="font-inter text-sm" style={{ color: "#6B7280" }}>Aguardando convocação</span>
            </div>
            <p className="font-inter text-xs mt-2" style={{ color: "#9CA3AF" }}>
              Quando você for selecionado, receberá um aviso pelo WhatsApp e terá 2h para confirmar.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen" style={{ background: "#F0F0F4", paddingBottom: "calc(env(safe-area-inset-bottom) + 96px)" }}>
        <div style={{ background: "#0D2137" }}><MobileHeader title="Colaborações" dark /></div>
        <div className="flex flex-col items-center justify-center px-6 py-16 gap-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "rgba(31,138,91,0.1)" }}>
            <CheckCircle2 size={40} style={{ color: "#1F8A5B" }} />
          </div>
          <h2 className="font-montserrat font-black text-xl text-center" style={{ color: "#0D2137" }}>Inscrição enviada!</h2>
          <p className="font-inter text-sm text-center leading-relaxed" style={{ color: "#6B7280" }}>
            Você foi adicionado à lista de colaboradores. Quando for convocado, receberá aviso pelo WhatsApp e terá <strong>2 horas</strong> para confirmar.
          </p>
          <p className="font-inter text-xs text-center px-4 py-3 rounded-2xl" style={{ background: "rgba(181,134,42,0.08)", color: "#B5862A", border: "1px solid rgba(181,134,42,0.2)" }}>
            ⭐ Cada colaboração válida garante <strong>5 pontos</strong> na trilha de engajamento!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#F0F0F4", paddingBottom: "calc(env(safe-area-inset-bottom) + 96px)" }}>
      <div style={{ background: "#0D2137" }}>
        <MobileHeader title="Colaborações" dark />
        <div className="px-5 pb-5 flex items-center gap-3">
          <Users size={24} style={{ color: "#B5862A" }} />
          <div>
            <h1 className="font-montserrat font-black text-xl text-white">Colaborações</h1>
            <p className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Eventos IFL Jovem BH · 2026</p>
          </div>
        </div>
      </div>

      <div className="px-4 mt-4 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          {[
            { icon: "📌", text: "A inscrição é válida para todos os eventos de 2026 e deve ser realizada apenas uma vez." },
            { icon: "🔢", text: "Os colaboradores serão chamados por ordem de fila. Após o convite, você terá 2 horas para confirmar." },
            { icon: "⭐", text: "Cada colaboração válida garante 5 pontos na trilha de engajamento." },
            { icon: "📘", text: "Ao ser convocado, você receberá um manual completo com as funções e obrigações." },
          ].map((item, i) => (
            <div key={i} className="rounded-2xl px-4 py-3 flex items-start gap-3"
              style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.06)" }}>
              <span className="text-base flex-shrink-0">{item.icon}</span>
              <p className="font-inter text-sm leading-relaxed" style={{ color: "#374151" }}>{item.text}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="font-inter text-xs font-semibold block mb-1.5" style={{ color: "#0D2137" }}>Nome Completo <span style={{ color: "#B42318" }}>*</span></label>
            <input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} required placeholder="Seu nome completo"
              className="w-full rounded-xl px-4 font-inter text-sm focus:outline-none"
              style={{ height: 48, background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.1)", color: "#111827" }} />
          </div>
          <div>
            <label className="font-inter text-xs font-semibold block mb-1.5" style={{ color: "#0D2137" }}>E-mail <span style={{ color: "#B42318" }}>*</span></label>
            <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required type="email" placeholder="seu@email.com"
              className="w-full rounded-xl px-4 font-inter text-sm focus:outline-none"
              style={{ height: 48, background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.1)", color: "#111827" }} />
          </div>
          <div>
            <label className="font-inter text-xs font-semibold block mb-1.5" style={{ color: "#0D2137" }}>Telefone (WhatsApp) <span style={{ color: "#B42318" }}>*</span></label>
            <input value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} required type="tel" placeholder="(31) 9 0000-0000"
              className="w-full rounded-xl px-4 font-inter text-sm focus:outline-none"
              style={{ height: 48, background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.1)", color: "#111827" }} />
          </div>

          <div>
            <label className="font-inter text-xs font-semibold block mb-2" style={{ color: "#0D2137" }}>Área de colaboração <span style={{ color: "#B42318" }}>*</span></label>
            {AREAS.map(area => (
              <button key={area.id} type="button" onClick={() => toggleArea(area.id)}
                className="w-full flex items-start gap-3 px-4 py-3 rounded-xl mb-2 text-left"
                style={{ background: form.areas.includes(area.id) ? "rgba(13,33,55,0.06)" : "hsl(var(--card))", border: form.areas.includes(area.id) ? "1px solid rgba(13,33,55,0.25)" : "1px solid rgba(13,33,55,0.08)", minHeight: 56 }}>
                <div className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ borderColor: form.areas.includes(area.id) ? "#0D2137" : "#D1D5DB", background: form.areas.includes(area.id) ? "#0D2137" : "transparent" }}>
                  {form.areas.includes(area.id) && <span className="text-white text-xs font-bold">✓</span>}
                </div>
                <div>
                  <p className="font-inter text-sm font-semibold" style={{ color: "#111827" }}>{area.label}</p>
                  <p className="font-inter text-xs" style={{ color: "#6B7280" }}>{area.desc}</p>
                </div>
              </button>
            ))}
          </div>

          {[
            { key: "ciente1", text: "Estou ciente de que a colaboração me dará 5 pontos e que, em caso de descumprimento, posso perder os pontos e ser impedido de futuras colaborações." },
            { key: "ciente2", text: "Estou ciente de que, ao ser convocado, receberei um manual completo e me comprometo a seguir integralmente." },
            { key: "ciente3", text: "Estou ciente de que devo confirmar minha presença em até 2 horas após o convite, ou minha vez será pulada." },
          ].map(item => (
            <button key={item.key} type="button" onClick={() => setForm(f => ({ ...f, [item.key]: !f[item.key] }))}
              className="flex items-start gap-3 w-full px-4 py-3 rounded-xl text-left"
              style={{ background: form[item.key] ? "rgba(31,138,91,0.06)" : "hsl(var(--card))", border: form[item.key] ? "1px solid rgba(31,138,91,0.25)" : "1px solid rgba(13,33,55,0.08)", minHeight: 56 }}>
              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ borderColor: form[item.key] ? "#1F8A5B" : "#D1D5DB" }}>
                {form[item.key] && <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#1F8A5B" }} />}
              </div>
              <p className="font-inter text-xs leading-relaxed" style={{ color: "#374151" }}>{item.text}</p>
            </button>
          ))}

          <button type="submit" disabled={!canSubmit || submitting}
            className="w-full rounded-2xl font-montserrat font-bold text-sm flex items-center justify-center gap-2"
            style={{ height: 52, background: canSubmit ? "#0D2137" : "rgba(13,33,55,0.1)", color: canSubmit ? "#FFF" : "#9CA3AF" }}>
            <Send size={16} />
            {submitting ? "Enviando..." : "Enviar Inscrição"}
          </button>
          <p className="font-inter text-xs text-center" style={{ color: "#9CA3AF" }}>
            Para cancelar sua inscrição, entre em contato com o Diretor de Eventos.
          </p>
        </form>
      </div>
    </div>
  );
}