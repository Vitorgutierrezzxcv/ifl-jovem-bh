import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { HandHelping, CheckCircle2, Clock, Star, MapPin, Calendar } from "lucide-react";
import MobileHeader from "../components/layout/MobileHeader";

export default function ReceptionSignup() {
  const [member, setMember] = useState(null);
  const [signup, setSignup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const u = await base44.auth.me();
      const members = await base44.entities.Member.filter({ email: u.email });
      const m = members[0] || null;
      setMember(m);
      if (m) {
        const signups = await base44.entities.ReceptionSignup.filter({ member_id: m.id }, "-created_date", 1);
        setSignup(signups[0] || null);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleSignup() {
    if (!member) return;
    setSubmitting(true);
    const created = await base44.entities.ReceptionSignup.create({
      member_id: member.id,
      member_name: member.full_name,
    });
    setSignup(created);
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F0F0F4" }}>
        <div className="w-8 h-8 border-4 border-gray-200 border-t-ifl-navy rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#F0F0F4", paddingBottom: "calc(env(safe-area-inset-bottom) + 96px)" }}>
      <div style={{ background: "#0D2137" }}>
        <MobileHeader title="Recepção & Sombra" dark />
        <div className="px-5 pb-4">
          <p className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>Ajude a receber convidados nos eventos do IFL</p>
        </div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-4">
        <div className="rounded-2xl p-5 flex items-start gap-3" style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.08)" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(31,138,91,0.1)" }}>
            <HandHelping size={17} style={{ color: "#1F8A5B" }} />
          </div>
          <p className="font-inter text-sm leading-relaxed" style={{ color: "#374151" }}>
            Inscreva-se para servir na recepção ou como sombra em nossos eventos. A diretoria escolhe quem vai participar e avisa aqui o evento e as instruções.
          </p>
        </div>

        {!member && (
          <p className="font-inter text-sm text-center" style={{ color: "#B42318" }}>
            Não encontramos seu cadastro de associado. Fale com a diretoria.
          </p>
        )}

        {member && !signup && (
          <button onClick={handleSignup} disabled={submitting}
            className="w-full rounded-2xl font-montserrat font-bold text-sm text-white flex items-center justify-center gap-2"
            style={{ height: 52, background: "#0D2137" }}>
            <HandHelping size={16} /> {submitting ? "Enviando..." : "Quero participar"}
          </button>
        )}

        {signup && (
          <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.08)" }}>
            {signup.status === "inscrito" && (
              <div className="flex items-center gap-2">
                <Clock size={17} style={{ color: "#D99A22" }} />
                <p className="font-montserrat font-bold text-sm" style={{ color: "#111827" }}>Inscrição enviada</p>
              </div>
            )}
            {signup.status === "inscrito" && (
              <p className="font-inter text-xs" style={{ color: "#6B7280" }}>
                Aguarde — a diretoria vai avisar aqui quando você for selecionado(a) para um evento.
              </p>
            )}

            {signup.status === "selecionado" && (
              <>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={17} style={{ color: "#1F8A5B" }} />
                  <p className="font-montserrat font-bold text-sm" style={{ color: "#1F8A5B" }}>Você foi selecionado(a)! 🎉</p>
                </div>
                {signup.event_name && (
                  <div className="flex items-center gap-3">
                    <Star size={15} style={{ color: "#B5862A" }} />
                    <span className="font-inter text-sm" style={{ color: "#374151" }}>{signup.event_name}</span>
                  </div>
                )}
                {signup.event_date && (
                  <div className="flex items-center gap-3">
                    <Calendar size={15} style={{ color: "#B5862A" }} />
                    <span className="font-inter text-sm" style={{ color: "#374151" }}>
                      {new Date(signup.event_date + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                    </span>
                  </div>
                )}
                {signup.instructions && (
                  <div className="p-3 rounded-xl" style={{ background: "rgba(31,138,91,0.06)", border: "1px solid rgba(31,138,91,0.15)" }}>
                    <p className="font-inter text-[11px] font-bold mb-1" style={{ color: "#1F8A5B" }}>📋 Instruções da Diretoria</p>
                    <p className="font-inter text-sm leading-relaxed" style={{ color: "#374151" }}>{signup.instructions}</p>
                  </div>
                )}
              </>
            )}

            {signup.status === "nao_selecionado" && (
              <p className="font-inter text-sm" style={{ color: "#6B7280" }}>
                Você não foi selecionado(a) desta vez. Fique de olho para as próximas oportunidades!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}