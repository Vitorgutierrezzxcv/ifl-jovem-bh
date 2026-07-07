import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { LogOut, Send, CheckCircle2, Clock } from "lucide-react";
import MobileHeader from "../components/layout/MobileHeader";

const cycleLabels = { qualifier: "Qualifier", "1_ciclo": "Ciclo 1", "2_ciclo": "Ciclo 2", "3_ciclo": "Ciclo 3", fellow: "Fellow", honorario: "Honorário" };

const statusConfig = {
  pendente: { label: "Pendente", color: "#D99A22", bg: "rgba(217,154,34,0.1)" },
  em_analise: { label: "Em Análise", color: "#0EA5E9", bg: "rgba(14,165,233,0.1)" },
  concluido: { label: "Concluído", color: "#1F8A5B", bg: "rgba(31,138,91,0.1)" },
};

export default function TerminationRequest() {
  const [user, setUser] = useState(null);
  const [member, setMember] = useState(null);
  const [existingRequest, setExistingRequest] = useState(null);
  const [reason, setReason] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const u = await base44.auth.me();
      setUser(u);
      const members = await base44.entities.Member.filter({ email: u.email });
      const m = members[0] || null;
      setMember(m);
      if (m) setPhone(m.phone || "");
      const reqs = await base44.entities.TerminationRequest.filter({ member_email: u.email }, "-created_date", 1).catch(() => []);
      if (reqs.length > 0) setExistingRequest(reqs[0]);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!reason) return;
    setSubmitting(true);
    const req = await base44.entities.TerminationRequest.create({
      member_id: member?.id || "",
      member_name: user?.full_name || member?.full_name || "",
      member_email: user?.email || "",
      phone,
      cycle: member?.cycle || "",
      reason,
      status: "pendente",
    });
    setSubmitting(false);
    setJustSubmitted(true);
    setExistingRequest(req);
  }

  return (
    <div className="min-h-screen" style={{ background: "#0D2137", paddingBottom: "calc(env(safe-area-inset-bottom) + 96px)" }}>
      <div style={{ background: "#0D2137" }}>
        <MobileHeader title="Solicitar Desligamento" dark />
        <div className="px-5 pb-4">
          <p className="font-inter text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>Este pedido é enviado diretamente à diretoria</p>
        </div>
      </div>

      <div className="px-4 pt-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 rounded-full animate-spin" style={{ border: "3px solid #B8872A", borderTopColor: "transparent" }} />
          </div>
        ) : existingRequest ? (
          <div className="rounded-2xl p-5" style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.08)" }}>
            <div className="flex items-center gap-2 mb-3">
              <Clock size={16} style={{ color: statusConfig[existingRequest.status]?.color }} />
              <span className="font-inter text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: statusConfig[existingRequest.status]?.bg, color: statusConfig[existingRequest.status]?.color }}>
                {statusConfig[existingRequest.status]?.label}
              </span>
            </div>
            <p className="font-montserrat font-bold text-sm text-foreground mb-1">Sua solicitação de desligamento foi enviada</p>
            <p className="font-inter text-xs" style={{ color: "#6B7280" }}>
              Enviado em {new Date(existingRequest.created_date).toLocaleDateString("pt-BR")}. A diretoria entrará em contato.
            </p>
            {existingRequest.response && (
              <div className="mt-3 p-3 rounded-xl" style={{ background: "rgba(31,138,91,0.06)", border: "1px solid rgba(31,138,91,0.15)" }}>
                <p className="font-inter text-[11px] font-bold mb-1" style={{ color: "#1F8A5B" }}>📋 Resposta da Diretoria</p>
                <p className="font-inter text-sm" style={{ color: "#374151" }}>{existingRequest.response}</p>
              </div>
            )}
          </div>
        ) : justSubmitted ? (
          <div className="flex flex-col items-center py-16 gap-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "rgba(31,138,91,0.1)" }}>
              <CheckCircle2 size={40} style={{ color: "#1F8A5B" }} />
            </div>
            <h2 className="font-montserrat font-black text-xl text-center" style={{ color: "#0D2137" }}>Solicitação enviada!</h2>
            <p className="font-inter text-sm text-center leading-relaxed" style={{ color: "#6B7280" }}>
              A diretoria foi notificada e entrará em contato em breve.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="rounded-2xl p-4" style={{ background: "rgba(180,35,24,0.05)", border: "1px solid rgba(180,35,24,0.15)" }}>
              <div className="flex items-start gap-3">
                <LogOut size={18} style={{ color: "#B42318", marginTop: 1, flexShrink: 0 }} />
                <p className="font-inter text-sm leading-relaxed" style={{ color: "#374151" }}>
                  Este formulário envia sua solicitação de desligamento diretamente para a diretoria, que entrará em contato para finalizar o processo.
                </p>
              </div>
            </div>

            <div>
              <label className="font-inter text-xs font-semibold block mb-1.5" style={{ color: "#0D2137" }}>Nome</label>
              <input value={user?.full_name || ""} disabled
                className="w-full rounded-xl px-4 font-inter text-sm outline-none"
                style={{ background: "rgba(13,33,55,0.05)", border: "1px solid rgba(13,33,55,0.1)", color: "#6B7280", height: 48 }} />
            </div>

            {member?.cycle && (
              <div>
                <label className="font-inter text-xs font-semibold block mb-1.5" style={{ color: "#0D2137" }}>Ciclo</label>
                <input value={cycleLabels[member.cycle] || member.cycle} disabled
                  className="w-full rounded-xl px-4 font-inter text-sm outline-none"
                  style={{ background: "rgba(13,33,55,0.05)", border: "1px solid rgba(13,33,55,0.1)", color: "#6B7280", height: 48 }} />
              </div>
            )}

            <div>
              <label className="font-inter text-xs font-semibold block mb-1.5" style={{ color: "#0D2137" }}>Telefone (WhatsApp)</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(31) 9 0000-0000" type="tel"
                className="w-full rounded-xl px-4 font-inter text-sm focus:outline-none"
                style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.1)", color: "#111827", height: 48 }} />
            </div>

            <div>
              <label className="font-inter text-xs font-semibold block mb-1.5" style={{ color: "#0D2137" }}>Motivo do desligamento <span style={{ color: "#B42318" }}>*</span></label>
              <textarea value={reason} onChange={e => setReason(e.target.value)}
                placeholder="Descreva o motivo da sua solicitação..." rows={5} required
                className="w-full rounded-xl px-4 py-3 font-inter text-sm resize-none focus:outline-none"
                style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.1)", color: "#111827" }} />
            </div>

            <button type="submit" disabled={submitting || !reason}
              className="w-full rounded-2xl font-montserrat font-bold text-sm flex items-center justify-center gap-2"
              style={{ height: 52, background: !reason ? "rgba(13,33,55,0.1)" : "#B42318", color: !reason ? "#9CA3AF" : "#FFF" }}>
              <Send size={16} />
              {submitting ? "Enviando..." : "Enviar Solicitação"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}