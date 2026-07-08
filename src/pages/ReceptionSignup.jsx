import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { HandHelping, CheckCircle2, Clock, Star, MapPin, Calendar, Coffee, UserCircle } from "lucide-react";
import MobileHeader from "../components/layout/MobileHeader";

const HELP_TYPES = [
  { key: "recepcao", label: "Recepção", icon: UserCircle, color: "#B5862A", desc: "Receber e acompanhar convidados nos eventos" },
  { key: "lanche", label: "Lanche", icon: Coffee, color: "#1F8A5B", desc: "Ajudar na organização e servidura do lanche" },
  { key: "sombra", label: "Sombra", icon: HandHelping, color: "#071D33", desc: "Acompanhar um veterano e aprender a rotina" },
];

export default function ReceptionSignup() {
  const location = useLocation();
  const [member, setMember] = useState(null);
  const [signups, setSignups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeType, setActiveType] = useState(location.state?.presetType || "recepcao");

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const u = await base44.auth.me();
      // Try user-scoped first, then service role (bypasses RLS for admin-created records)
      let members = await base44.entities.Member.filter({ email: u.email });
      if (!members.length && u.id) members = await base44.entities.Member.filter({ user_id: u.id });
      if (!members.length) members = await base44.asServiceRole.entities.Member.filter({ email: u.email });
      if (!members.length && u.id) members = await base44.asServiceRole.entities.Member.filter({ user_id: u.id });
      const m = members[0] || null;
      setMember(m);
      if (m) {
        const list = await base44.asServiceRole.entities.ReceptionSignup.filter({ member_id: m.id }, "-created_date", 50);
        setSignups(list);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleSignup(type) {
    if (!member) return;
    setSubmitting(true);
    try {
      const created = await base44.entities.ReceptionSignup.create({
        member_id: member.id,
        member_name: member.full_name,
        help_type: type,
      });
      setSignups(prev => [created, ...prev]);
      setActiveType(type);
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0D2137" }}>
        <div className="w-8 h-8 rounded-full animate-spin" style={{ border: "3px solid rgba(181,134,42,0.3)", borderTopColor: "#D4A043" }} />
      </div>
    );
  }

  const currentSignup = signups.find(s => s.help_type === activeType);
  const signupByType = (type) => signups.find(s => s.help_type === type);

  return (
    <div className="min-h-screen" style={{ background: "#0D2137", paddingBottom: "calc(env(safe-area-inset-bottom) + 96px)" }}>
      <div style={{ background: "#0D2137" }}>
        <MobileHeader title="Ajuda em Eventos" dark />
        <div className="px-5 pb-4">
          <p className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>Inscreva-se para ajudar em Recepção, Lanche ou Sombra</p>
        </div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-4">
        <div className="rounded-2xl p-5 flex items-start gap-3" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(181,134,42,0.2)" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(31,138,91,0.15)" }}>
            <HandHelping size={17} style={{ color: "#1F8A5B" }} />
          </div>
          <p className="font-inter text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
            Escolha o tipo de ajuda e inscreva-se. A diretoria escolhe quem vai participar de cada evento e avisa aqui com as instruções.
          </p>
        </div>

        {!member && (
          <p className="font-inter text-sm text-center" style={{ color: "#B42318" }}>
            Não encontramos seu cadastro de associado. Fale com a diretoria.
          </p>
        )}

        {/* Type tabs */}
        {member && (
          <div className="flex gap-2">
            {HELP_TYPES.map(t => {
              const has = !!signupByType(t.key);
              const active = activeType === t.key;
              return (
                <button key={t.key} onClick={() => setActiveType(t.key)}
                  className="flex-1 flex flex-col items-center gap-1 py-3 rounded-xl font-inter text-xs font-semibold transition-all"
                  style={{
                    background: active ? t.color : "rgba(255,255,255,0.05)",
                    color: active ? "#FFFFFF" : "rgba(255,255,255,0.55)",
                    border: active ? `1px solid ${t.color}` : "1px solid rgba(255,255,255,0.1)",
                  }}>
                  <t.icon size={18} strokeWidth={1.8} />
                  {t.label}
                  {has && <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#D4A043" }} />}
                </button>
              );
            })}
          </div>
        )}

        {/* Active type content */}
        {member && (() => {
          const t = HELP_TYPES.find(t => t.key === activeType);
          const signup = signupByType(activeType);
          return (
            <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(181,134,42,0.2)" }}>
              <div className="flex items-center gap-3 pb-3 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${t.color}20` }}>
                  <t.icon size={20} style={{ color: t.color }} />
                </div>
                <div>
                  <p className="font-montserrat font-bold text-sm" style={{ color: "#FFFFFF" }}>{t.label}</p>
                  <p className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>{t.desc}</p>
                </div>
              </div>

              {!signup ? (
                <>
                  <p className="font-inter text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>Você ainda não se inscreveu para {t.label.toLowerCase()}.</p>
                  <button onClick={() => handleSignup(activeType)} disabled={submitting}
                    className="w-full rounded-2xl font-montserrat font-bold text-sm text-white flex items-center justify-center gap-2"
                    style={{ height: 48, background: t.color }}>
                    <HandHelping size={16} /> {submitting ? "Enviando..." : "Quero participar"}
                  </button>
                </>
              ) : (
                <>
                  {signup.status === "inscrito" && (
                    <>
                      <div className="flex items-center gap-2">
                        <Clock size={17} style={{ color: "#D99A22" }} />
                        <p className="font-montserrat font-bold text-sm" style={{ color: "#FFFFFF" }}>Inscrição enviada</p>
                      </div>
                      <p className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
                        Aguarde — a diretoria vai avisar aqui quando você for selecionado(a) para um evento.
                      </p>
                    </>
                  )}

                  {signup.status === "selecionado" && (
                    <>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={17} style={{ color: "#1F8A5B" }} />
                        <p className="font-montserrat font-bold text-sm" style={{ color: "#1F8A5B" }}>Você foi selecionado(a)! 🎉</p>
                      </div>
                      {signup.event_name && (
                        <div className="flex items-center gap-3">
                          <Star size={15} style={{ color: "#D4A043" }} />
                          <span className="font-inter text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>{signup.event_name}</span>
                        </div>
                      )}
                      {signup.area && (
                        <div className="flex items-center gap-3">
                          <MapPin size={15} style={{ color: "#D4A043" }} />
                          <span className="font-inter text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>{signup.area}</span>
                        </div>
                      )}
                      {signup.event_date && (
                        <div className="flex items-center gap-3">
                          <Calendar size={15} style={{ color: "#D4A043" }} />
                          <span className="font-inter text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>
                            {new Date(signup.event_date + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                          </span>
                        </div>
                      )}
                      {signup.instructions && (
                        <div className="p-3 rounded-xl" style={{ background: "rgba(31,138,91,0.1)", border: "1px solid rgba(31,138,91,0.25)" }}>
                          <p className="font-inter text-[11px] font-bold mb-1" style={{ color: "#1F8A5B" }}>📋 Instruções da Diretoria</p>
                          <p className="font-inter text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.8)" }}>{signup.instructions}</p>
                        </div>
                      )}
                    </>
                  )}

                  {signup.status === "nao_selecionado" && (
                    <p className="font-inter text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                      Você não foi selecionado(a) desta vez. Fique de olho para as próximas oportunidades!
                    </p>
                  )}
                </>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}