import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Trophy, Star, ChevronRight } from "lucide-react";
import MobileHeader from "../components/layout/MobileHeader";

const cycleLabels = {
  qualifier: "Qualifier",
  "1_ciclo": "1º Ciclo",
  "2_ciclo": "2º Ciclo",
  "3_ciclo": "3º Ciclo",
  fellow: "Fellow",
};

const tabs = [
  { key: "geral", label: "Geral" },
  { key: "qualifier", label: "Qualifier" },
  { key: "1_ciclo", label: "1º Ciclo" },
  { key: "2_ciclo", label: "2º Ciclo" },
  { key: "3_ciclo", label: "3º Ciclo" },
  { key: "fellow", label: "Fellow" },
];

function medalColor(pos) {
  if (pos === 1) return "#FFD700";
  if (pos === 2) return "#C0C0C0";
  if (pos === 3) return "#CD7F32";
  return "#6B7280";
}

export default function Ranking() {
  const [members, setMembers] = useState([]);
  const [activeTab, setActiveTab] = useState("geral");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Member.list("-total_points", 100).then(m => {
      setMembers(m);
      setLoading(false);
    });
  }, []);

  const filtered = activeTab === "geral"
    ? members
    : members.filter(m => m.cycle === activeTab);

  const ranked = filtered.map((m, i) => ({ ...m, pos: i + 1 }));

  return (
    <div className="min-h-screen" style={{ background: "#F0F0F4", paddingBottom: "calc(env(safe-area-inset-bottom) + 96px)" }}>
      <MobileHeader title="Ranking" dark />

      {/* Tabs */}
      <div className="flex gap-2 px-4 pt-4 pb-2 overflow-x-auto scrollbar-hide">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full font-inter text-xs font-semibold"
            style={{ background: activeTab === t.key ? "#0D2137" : "hsl(var(--card))", color: activeTab === t.key ? "#FFF" : "#6B7280", border: activeTab === t.key ? "none" : "1px solid rgba(13,33,55,0.1)" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Podium top 3 */}
      {ranked.length >= 3 && (
        <div className="px-4 pt-2 pb-4">
          <div className="rounded-2xl p-5" style={{ background: "#0D2137", border: "1px solid rgba(181,134,42,0.2)" }}>
            <div className="flex items-end justify-center gap-4">
              {[ranked[1], ranked[0], ranked[2]].map((m, idx) => {
                const realPos = idx === 0 ? 2 : idx === 1 ? 1 : 3;
                const height = realPos === 1 ? "h-24" : "h-16";
                return (
                  <div key={m.id} className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-montserrat font-black text-sm"
                      style={{ background: `${medalColor(realPos)}22`, color: medalColor(realPos), border: `2px solid ${medalColor(realPos)}` }}>
                      {(m.full_name || "?")[0]}
                    </div>
                    <p className="font-inter text-[10px] text-center" style={{ color: "rgba(255,255,255,0.7)", maxWidth: 64 }}>{m.full_name?.split(" ")[0]}</p>
                    <div className={`w-14 ${height} rounded-t-lg flex flex-col items-center justify-end pb-2`}
                      style={{ background: `${medalColor(realPos)}22`, border: `1px solid ${medalColor(realPos)}44` }}>
                      <span style={{ color: medalColor(realPos), fontSize: 18, fontWeight: 900 }}>#{realPos}</span>
                    </div>
                    <p className="font-montserrat font-bold text-xs" style={{ color: "#B5862A" }}>{m.total_points || 0} pts</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="px-4 flex flex-col gap-2">
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-7 h-7 border-4 border-gray-200 border-t-ifl-navy rounded-full animate-spin" /></div>
        ) : ranked.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-3">
            <Trophy size={40} style={{ color: "#D1D5DB" }} />
            <p className="font-inter text-sm" style={{ color: "#9CA3AF" }}>Nenhum membro nesta categoria</p>
          </div>
        ) : ranked.slice(3).map(m => (
          <div key={m.id} className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.06)" }}>
            <span className="font-montserrat font-black text-base w-7 text-center" style={{ color: "#9CA3AF" }}>#{m.pos}</span>
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-montserrat font-bold text-sm"
              style={{ background: "rgba(13,33,55,0.08)", color: "#0D2137" }}>
              {(m.full_name || "?")[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-inter text-sm font-semibold truncate" style={{ color: "#111827" }}>{m.full_name}</p>
              <p className="font-inter text-xs" style={{ color: "#9CA3AF" }}>{cycleLabels[m.cycle] || m.cycle}</p>
            </div>
            <span className="font-montserrat font-bold text-sm" style={{ color: "#B5862A" }}>{m.total_points || 0} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
}