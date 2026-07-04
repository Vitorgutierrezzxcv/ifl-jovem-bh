import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { CheckCircle2, XCircle, X } from "lucide-react";

const SEEN_KEY = "seen_extraordinary_reg_ids";

function getSeenIds() {
  try { return JSON.parse(localStorage.getItem(SEEN_KEY) || "[]"); } catch { return []; }
}

export default function ExtraordinaryStatusBanner({ member }) {
  const [reg, setReg] = useState(null);

  useEffect(() => {
    if (!member) return;
    base44.entities.ExtraordinaryRegistration.filter({ member_id: member.id }).then(regs => {
      const seen = getSeenIds();
      const decided = regs.find(r => (r.status === "aprovado" || r.status === "recusado") && !seen.includes(r.id));
      if (decided) setReg(decided);
    });
  }, [member]);

  function dismiss() {
    const seen = getSeenIds();
    localStorage.setItem(SEEN_KEY, JSON.stringify([...seen, reg.id]));
    setReg(null);
  }

  if (!reg) return null;

  const approved = reg.status === "aprovado";

  return (
    <div className="px-4 mt-4">
      <div className="rounded-2xl p-4 flex items-start gap-3"
        style={{
          background: approved ? "rgba(31,138,91,0.08)" : "rgba(180,35,24,0.08)",
          border: approved ? "1px solid rgba(31,138,91,0.25)" : "1px solid rgba(180,35,24,0.25)",
        }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: approved ? "rgba(31,138,91,0.15)" : "rgba(180,35,24,0.15)" }}>
          {approved ? <CheckCircle2 size={18} style={{ color: "#1F8A5B" }} /> : <XCircle size={18} style={{ color: "#B42318" }} />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-montserrat font-bold text-sm" style={{ color: approved ? "#1F8A5B" : "#B42318" }}>
            {approved ? "Você foi selecionado(a)! 🎉" : "Inscrição não selecionada"}
          </p>
          <p className="font-inter text-xs mt-0.5" style={{ color: "#6B7280" }}>
            {approved
              ? `Sua inscrição para "${reg.event_title}" foi aprovada.`
              : `Sua inscrição para "${reg.event_title}" não foi selecionada desta vez.`}
          </p>
        </div>
        <button onClick={dismiss} className="p-1 flex-shrink-0">
          <X size={15} style={{ color: "#9CA3AF" }} />
        </button>
      </div>
    </div>
  );
}