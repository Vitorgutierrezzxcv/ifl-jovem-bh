import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { DollarSign, Calendar, CheckCircle, AlertCircle } from "lucide-react";
import MobileHeader from "../components/layout/MobileHeader";
import StatusBadge from "../components/ui/StatusBadge";

export default function Financial() {
  const [charges, setCharges] = useState([]);
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const u = await base44.auth.me();
      const members = await base44.entities.Member.filter({ email: u.email });
      if (members[0]) {
        setMember(members[0]);
        const chgs = await base44.entities.FinancialCharge.filter({ member_id: members[0].id }, "-due_date");
        setCharges(chgs);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const total = charges.filter(c => c.status === "pendente").reduce((a, c) => a + (c.amount || 0), 0);
  const paid = charges.filter(c => c.status === "em_dia").length;

  return (
    <div className="min-h-screen bg-ifl-gray-bg" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 72px)" }}>
      <div style={{ background: "#071D33" }}>
        <MobileHeader title="Financeiro" dark />
        <div className="px-5 pb-6">
          <h1 className="font-montserrat font-black text-2xl text-white mb-4">Situação Financeira</h1>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(184,135,42,0.15)" }}>
              <p className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Status</p>
              <StatusBadge status={member?.financial_status || "em_dia"} />
            </div>
            <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(184,135,42,0.15)" }}>
              <p className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Débito Total</p>
              <p className="font-montserrat font-black text-xl mt-1" style={{ color: total > 0 ? "#D99A22" : "#1F8A5B" }}>
                R$ {total.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {total > 0 && (
        <div className="px-4 mt-4">
          <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: "rgba(217,154,34,0.08)", border: "1px solid rgba(217,154,34,0.2)" }}>
            <AlertCircle size={18} style={{ color: "#D99A22", marginTop: 1, flexShrink: 0 }} />
            <div>
              <p className="font-montserrat font-bold text-sm" style={{ color: "#D99A22" }}>Você tem débitos</p>
              <p className="font-inter text-xs mt-0.5" style={{ color: "#6B7280" }}>Entre em contato com a Diretoria Financeira para regularizar.</p>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 mt-5">
        <h2 className="font-montserrat font-bold text-sm uppercase tracking-wider mb-3" style={{ color: "#071D33" }}>
          <span style={{ borderBottom: "2px solid #B8872A", paddingBottom: 2 }}>Histórico de Cobranças</span>
        </h2>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full animate-spin" style={{ border: "3px solid #B8872A", borderTopColor: "transparent" }} />
          </div>
        ) : charges.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-2">
            <DollarSign size={40} style={{ color: "rgba(7,29,51,0.12)" }} />
            <p className="font-montserrat font-bold text-sm" style={{ color: "#9CA3AF" }}>Sem cobranças</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {charges.map(c => (
              <div key={c.id} className="rounded-2xl p-4 flex items-center gap-3" style={{ background: "#FFFFFF", border: "1px solid rgba(7,29,51,0.06)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: c.status === "em_dia" ? "rgba(31,138,91,0.1)" : "rgba(217,154,34,0.1)" }}>
                  {c.status === "em_dia" ? <CheckCircle size={18} style={{ color: "#1F8A5B" }} /> : <Calendar size={18} style={{ color: "#D99A22" }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-inter text-sm font-semibold" style={{ color: "#111827" }}>Cobrança {c.plan}</p>
                  <p className="font-inter text-xs mt-0.5" style={{ color: "#6B7280" }}>
                    Vencimento: {new Date(c.due_date + "T12:00:00").toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-montserrat font-bold text-base" style={{ color: "#071D33" }}>R$ {c.amount}</p>
                  <StatusBadge status={c.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}