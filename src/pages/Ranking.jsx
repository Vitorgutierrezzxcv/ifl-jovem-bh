import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Trophy, Star, TrendingUp, ChevronRight } from "lucide-react";
import MobileHeader from "../components/layout/MobileHeader";

const cycleFilters = ["Geral", "Qualifier", "1º Ciclo", "2º Ciclo", "3º Ciclo", "Fellow"];
const cycleMap = { "Qualifier": "qualifier", "1º Ciclo": "1_ciclo", "2º Ciclo": "2_ciclo", "3º Ciclo": "3_ciclo", "Fellow": "fellow" };

export default function Ranking() {
  const [members, setMembers] = useState([]);
  const [me, setMe] = useState(null);
  const [filter, setFilter] = useState("Geral");
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const u = await base44.auth.me();
      const all = await base44.entities.Member.list("-total_points", 50);
      const active = all.filter(m => m.member_status !== "desligado" && m.member_status !== "suspenso");
      // assign ranks
      const ranked = active.map((m, i) => ({ ...m, _rank: i + 1 }));
      setMembers(ranked);
      const mine = ranked.find(m => m.email === u.email) || ranked[0];
      setMe(mine);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const cycleLabels = { qualifier: "Qualifier", "1_ciclo": "1º Ciclo", "2_ciclo": "2º Ciclo", "3_ciclo": "3º Ciclo", fellow: "Fellow" };

  function getFiltered() {
    if (filter === "Geral") return members;
    const c = cycleMap[filter];
    return members.filter(m => m.cycle === c).map((m, i) => ({ ...m, _rank: i + 1 }));
  }

  const list = getFiltered();

  function MedalIcon({ rank }) {
    if (rank === 1) return <div className="w-7 h-7 rounded-full flex items-center justify-center font-montserrat font-black text-sm" style={{ background: "linear-gradient(135deg,#B8872A,#D4A043)", color: "#071D33" }}>1</div>;
    if (rank === 2) return <div className="w-7 h-7 rounded-full flex items-center justify-center font-montserrat font-black text-sm" style={{ background: "linear-gradient(135deg,#9CA3AF,#D1D5DB)", color: "#374151" }}>2</div>;
    if (rank === 3) return <div className="w-7 h-7 rounded-full flex items-center justify-center font-montserrat font-black text-sm" style={{ background: "linear-gradient(135deg,#92400E,#B45309)", color: "white" }}>3</div>;
    return <span className="font-montserrat font-bold text-sm w-7 text-center" style={{ color: "#6B7280" }}>{rank}</span>;
  }

  const top3 = list.slice(0, 3);

  return (
    <div className="min-h-screen bg-ifl-gray-bg" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 96px)" }}>
      {/* Header */}
      <div className="hex-bg-dark relative overflow-hidden" style={{ background: "#071D33" }}>

        <MobileHeader title="Ranking" dark />
        <div className="px-5 pb-6">
          <div className="flex items-center gap-3">
            <Trophy size={28} style={{ color: "#D4A043" }} />
            <div>
              <h1 className="font-montserrat font-black text-2xl text-white">RANKING 2026</h1>
              <p className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Classificação por pontuação</p>
            </div>
          </div>

          {/* My position */}
          {me && (
            <div className="mt-4 rounded-2xl p-3 flex items-center gap-3"
              style={{ background: "rgba(184,135,42,0.15)", border: "1px solid rgba(184,135,42,0.3)" }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "#B8872A" }}>
                <span className="font-montserrat font-black text-sm text-white">#{me._rank}</span>
              </div>
              <div className="flex-1">
                <p className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Sua posição</p>
                <p className="font-montserrat font-bold text-sm text-white">{me.full_name}</p>
              </div>
              <div className="text-right">
                <p className="font-montserrat font-bold text-lg" style={{ color: "#D4A043" }}>{me.total_points || 0}</p>
                <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>pts</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {cycleFilters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="flex-shrink-0 px-4 py-2 rounded-2xl font-inter text-xs font-semibold transition-all"
            style={{
              background: filter === f ? "#071D33" : "#FFFFFF",
              color: filter === f ? "#D4A043" : "#6B7280",
              border: filter === f ? "1px solid rgba(184,135,42,0.3)" : "1px solid rgba(7,29,51,0.08)",
            }}>
            {f}
          </button>
        ))}
      </div>

      {/* Podium top 3 */}
      {top3.length >= 3 && (
        <div className="px-4 mt-5">
          <div className="flex items-end justify-center gap-3">
            {/* 2nd */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-montserrat font-black text-lg text-white" style={{ background: "#071D33" }}>
                {top3[1]?.full_name?.charAt(0)}
              </div>
              <div className="text-center">
                <p className="font-inter text-xs font-bold" style={{ color: "#111827" }}>{top3[1]?.full_name?.split(" ")[0]}</p>
                <p className="font-montserrat font-bold text-sm" style={{ color: "#9CA3AF" }}>{top3[1]?.total_points || 0} pts</p>
              </div>
              <div className="w-full h-16 rounded-t-xl flex items-center justify-center" style={{ background: "linear-gradient(180deg,#9CA3AF,#D1D5DB)", minWidth: 72 }}>
                <span className="font-montserrat font-black text-2xl" style={{ color: "white" }}>2</span>
              </div>
            </div>
            {/* 1st */}
            <div className="flex flex-col items-center gap-2">
              <Trophy size={20} style={{ color: "#D4A043" }} />
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-montserrat font-black text-xl text-white" style={{ background: "#071D33" }}>
                {top3[0]?.full_name?.charAt(0)}
              </div>
              <div className="text-center">
                <p className="font-inter text-xs font-bold" style={{ color: "#111827" }}>{top3[0]?.full_name?.split(" ")[0]}</p>
                <p className="font-montserrat font-bold text-sm" style={{ color: "#B8872A" }}>{top3[0]?.total_points || 0} pts</p>
              </div>
              <div className="w-full h-24 rounded-t-xl flex items-center justify-center" style={{ background: "linear-gradient(180deg,#B8872A,#D4A043)", minWidth: 80 }}>
                <span className="font-montserrat font-black text-3xl" style={{ color: "#071D33" }}>1</span>
              </div>
            </div>
            {/* 3rd */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-montserrat font-black text-lg text-white" style={{ background: "#071D33" }}>
                {top3[2]?.full_name?.charAt(0)}
              </div>
              <div className="text-center">
                <p className="font-inter text-xs font-bold" style={{ color: "#111827" }}>{top3[2]?.full_name?.split(" ")[0]}</p>
                <p className="font-montserrat font-bold text-sm" style={{ color: "#92400E" }}>{top3[2]?.total_points || 0} pts</p>
              </div>
              <div className="w-full h-12 rounded-t-xl flex items-center justify-center" style={{ background: "linear-gradient(180deg,#92400E,#B45309)", minWidth: 72 }}>
                <span className="font-montserrat font-black text-2xl text-white">3</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full list */}
      <div className="px-4 mt-5">
        <div className="flex flex-col gap-2">
          {list.slice(3).map((m) => (
            <div key={m.id} className="rounded-2xl p-4 flex items-center gap-3"
              style={{
                background: m.id === me?.id ? "rgba(7,29,51,0.05)" : "#FFFFFF",
                border: m.id === me?.id ? "1px solid rgba(7,29,51,0.2)" : "1px solid rgba(7,29,51,0.06)",
                boxShadow: "0 2px 8px rgba(7,29,51,0.04)",
              }}>
              <MedalIcon rank={m._rank} />
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-montserrat font-bold text-sm text-white flex-shrink-0" style={{ background: "#071D33" }}>
                {m.full_name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-inter text-sm font-semibold truncate" style={{ color: "#111827" }}>{m.full_name}</p>
                <p className="font-inter text-xs mt-0.5" style={{ color: "#6B7280" }}>{cycleLabels[m.cycle] || m.cycle}</p>
              </div>
              <div className="text-right">
                <p className="font-montserrat font-bold text-base" style={{ color: "#071D33" }}>{m.total_points || 0}</p>
                <p className="font-inter text-[10px]" style={{ color: "#9CA3AF" }}>pts</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}