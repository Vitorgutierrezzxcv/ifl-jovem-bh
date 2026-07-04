import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { MessageSquare, Send, CheckCircle2, Clock, X, ChevronRight, Plus, AlertCircle } from "lucide-react";
import MobileHeader from "../components/layout/MobileHeader";

const CATEGORIES = [
  "Alterar Pontuação de Presença",
  "Alterar Pontuação de Story",
  "Alterar Pontuação de Clube do Livro/Evento Ordinário de Formação",
  "Justificativa de Falta",
  "Questões Relativas ao Artigo Obrigatório",
  "Questões Relativas ao ROL Literário (vídeos)",
  "Outros Problemas do Ranking",
  "Inscrição para Recepção/Sombra em Eventos",
  "Outros",
];

const CYCLES = ["Qualifier", "Ciclo 1", "Ciclo 2", "Ciclo 3"];

const statusConfig = {
  pendente: { label: "Pendente", color: "#D99A22", bg: "rgba(217,154,34,0.1)", icon: Clock },
  em_analise: { label: "Em Análise", color: "#0EA5E9", bg: "rgba(14,165,233,0.1)", icon: Clock },
  respondida: { label: "Respondida", color: "#1F8A5B", bg: "rgba(31,138,91,0.1)", icon: CheckCircle2 },
  resolvida: { label: "Resolvida", color: "#1F8A5B", bg: "rgba(31,138,91,0.1)", icon: CheckCircle2 },
  indeferida: { label: "Indeferida", color: "#B42318", bg: "rgba(180,35,24,0.1)", icon: X },
};

export default function Demands() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [member, setMember] = useState(null);
  const [myDemands, setMyDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list"); // "list" | "new"
  const [form, setForm] = useState({ nome: "", telefone: "", ciclo: "", categoria: "", outro: "", justificativa: "" });
  const [submitting, setSubmitting] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);

  useEffect(() => {
    base44.auth.me().then(async u => {
      setUser(u);
      setForm(f => ({ ...f, nome: u.full_name || "" }));
      const members = await base44.entities.Member.filter({ email: u.email });
      const m = members[0] || null;
      if (m) {
        setMember(m);
        const cycleMap = { qualifier: "Qualifier", "1_ciclo": "Ciclo 1", "2_ciclo": "Ciclo 2", "3_ciclo": "Ciclo 3" };
        setForm(f => ({ ...f, ciclo: cycleMap[m.cycle] || "" }));
      }
      // Load this member's demands
      const demands = u ? await base44.entities.DemandRequest.filter({ member_email: u.email }, "-created_date", 50).catch(() => []) : [];
      setMyDemands(demands);
    }).catch(() => {}).finally(() => setLoading(false));
    if (location.state?.presetCategory) {
      setForm(f => ({ ...f, categoria: location.state.presetCategory }));
      setView("new");
    }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nome || !form.ciclo || !form.categoria || !form.justificativa) return;
    setSubmitting(true);
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
    setJustSubmitted(true);
    // Refresh list
    if (user?.email) {
      const updated = await base44.entities.DemandRequest.filter({ member_email: user.email }, "-created_date", 50).catch(() => []);
      setMyDemands(updated);
    }
    setTimeout(() => {
      setJustSubmitted(false);
      setView("list");
      setForm(f => ({ ...f, ciclo: f.ciclo, categoria: "", outro: "", justificativa: "" }));
    }, 2000);
  }

  return (
    <div className="min-h-screen" style={{ background: "#F0F0F4", paddingBottom: "calc(env(safe-area-inset-bottom) + 96px)" }}>
      <div style={{ background: "#0D2137" }}>
        <MobileHeader title="SAC — Demandas" dark />
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-montserrat font-black text-2xl text-white">Demandas</h1>
              <p className="font-inter text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>Diretoria de Formação 2026</p>
            </div>
            {view === "list" ? (
              <button onClick={() => setView("new")}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-inter text-sm font-semibold text-white"
                style={{ background: "rgba(181,134,42,0.3)", border: "1px solid rgba(181,134,42,0.4)" }}>
                <Plus size={15} /> Nova
              </button>
            ) : (
              <button onClick={() => setView("list")}
                className="p-2 rounded-xl"
                style={{ background: "rgba(255,255,255,0.1)" }}>
                <X size={16} className="text-white" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 mt-4">

        {/* View: My demands list */}
        {view === "list" && (
          <>
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-7 h-7 rounded-full animate-spin" style={{ border: "3px solid #B8872A", borderTopColor: "transparent" }} />
              </div>
            ) : myDemands.length === 0 ? (
              <div className="flex flex-col items-center py-16 gap-3">
                <MessageSquare size={44} style={{ color: "rgba(13,33,55,0.12)" }} />
                <p className="font-montserrat font-bold text-sm" style={{ color: "#9CA3AF" }}>Nenhuma demanda enviada ainda</p>
                <button onClick={() => setView("new")}
                  className="px-6 py-3 rounded-2xl font-montserrat font-bold text-sm text-white"
                  style={{ background: "#0D2137" }}>
                  Enviar primeira demanda
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="font-inter text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#9CA3AF" }}>
                  Suas solicitações ({myDemands.length})
                </p>
                {myDemands.map(d => {
                  const scfg = statusConfig[d.status] || statusConfig.pendente;
                  const StatusIcon = scfg.icon;
                  return (
                    <div key={d.id} className="rounded-2xl overflow-hidden"
                      style={{ background: "hsl(var(--card))", border: "1px solid rgba(7,29,51,0.06)" }}>
                      {/* Header */}
                      <div className="flex items-start gap-3 p-4">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: scfg.bg }}>
                          <StatusIcon size={16} style={{ color: scfg.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-inter text-sm font-semibold" style={{ color: "#111827" }}>{d.category}</p>
                            <span className="font-inter text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                              style={{ background: scfg.bg, color: scfg.color }}>
                              {scfg.label}
                            </span>
                          </div>
                          <p className="font-inter text-xs mt-0.5" style={{ color: "#9CA3AF" }}>
                            {new Date(d.created_date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                          </p>
                          <p className="font-inter text-xs mt-1.5 line-clamp-2" style={{ color: "#6B7280" }}>{d.justification}</p>
                        </div>
                      </div>

                      {/* Response from directorate */}
                      {d.response && (
                        <div className="px-4 pb-4">
                          <div className="p-3 rounded-xl" style={{ background: d.status === "indeferida" ? "rgba(180,35,24,0.05)" : "rgba(31,138,91,0.05)", border: `1px solid ${d.status === "indeferida" ? "rgba(180,35,24,0.15)" : "rgba(31,138,91,0.15)"}` }}>
                            <p className="font-inter text-[11px] font-bold mb-1" style={{ color: d.status === "indeferida" ? "#B42318" : "#1F8A5B" }}>
                              📋 Resposta da Diretoria de Formação
                            </p>
                            <p className="font-inter text-sm leading-relaxed" style={{ color: "#374151" }}>{d.response}</p>
                          </div>
                        </div>
                      )}

                      {/* Pending notice */}
                      {!d.response && d.status === "pendente" && (
                        <div className="px-4 pb-4">
                          <p className="font-inter text-xs" style={{ color: "#9CA3AF" }}>
                            ⏳ Aguardando análise — prazo de até 2 semanas
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* View: New demand form */}
        {view === "new" && (
          <>
            {justSubmitted ? (
              <div className="flex flex-col items-center py-16 gap-4">
                <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "rgba(31,138,91,0.1)" }}>
                  <CheckCircle2 size={40} style={{ color: "#1F8A5B" }} />
                </div>
                <h2 className="font-montserrat font-black text-xl text-center" style={{ color: "#0D2137" }}>Demanda enviada!</h2>
                <p className="font-inter text-sm text-center leading-relaxed" style={{ color: "#6B7280" }}>
                  Sua solicitação foi registrada. Acompanhe o status aqui no app.
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-2xl p-4 mb-4" style={{ background: "rgba(13,33,55,0.04)", border: "1px solid rgba(13,33,55,0.1)" }}>
                  <p className="font-inter text-sm leading-relaxed" style={{ color: "#374151" }}>
                    Todos os pedidos serão analisados em até <strong>2 semanas</strong>. A resposta aparecerá aqui no app.
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
                    <label className="font-inter text-xs font-semibold block mb-1.5" style={{ color: "#0D2137" }}>Telefone (WhatsApp)</label>
                    <input value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} placeholder="(31) 9 0000-0000" type="tel"
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
                    <label className="font-inter text-xs font-semibold block mb-1.5" style={{ color: "#0D2137" }}>Categoria <span style={{ color: "#B42318" }}>*</span></label>
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

                  <button type="submit" disabled={submitting || !form.nome || !form.ciclo || !form.categoria || !form.justificativa}
                    className="w-full rounded-2xl font-montserrat font-bold text-sm flex items-center justify-center gap-2"
                    style={{ height: 52, background: (!form.nome || !form.ciclo || !form.categoria || !form.justificativa) ? "rgba(13,33,55,0.1)" : "#0D2137", color: (!form.nome || !form.ciclo || !form.categoria || !form.justificativa) ? "#9CA3AF" : "#FFF" }}>
                    <Send size={16} />
                    {submitting ? "Enviando..." : "Enviar Demanda"}
                  </button>
                </form>
              </>
            )}
          </>
        )}

      </div>
    </div>
  );
}