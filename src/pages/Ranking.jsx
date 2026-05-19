import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Trophy, Star, Flame, Award, ChevronRight } from "lucide-react";
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

// Gamification levels based on points
function getLevel(pts) {
  if (pts >= 500) return { name: "Líder em Serviço", icon: "👑", color: "#FFD700", min: 500 };
  if (pts >= 300) return { name: "Influenciador", icon: "🔥", color: "#FF6B35", min: 300 };
  if (pts >= 200) return { name: "Engajado", icon: "⚡", color: "#B5862A", min: 200 };
  if (pts >= 100) return { name: "Participante", icon: "🌟", color: "#1F8A5B", min: 100 };
  if (pts >= 50) return { name: "Iniciante", icon: "🎯", color: "#6B7280", min: 50 };
  return { name: "Observador", icon: "👁️", color: "#9CA3AF", min: 0 };
}

function LevelBadge({ pts, small }) {
  const level = getLevel(pts);
  return (
    <span className={`inline-flex items-center gap-1 font-inter font-semibold rounded-full ${small ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1"}`}
      style={{ background: `${level.color}18`, color: level.color }}>
      {level.icon} {level.name}
    </span>
  );
}

export default function Ranking() {
  const [members, setMembers] = useState([]);
  const [activeTab, setActiveTab] = useState("geral");
  const [myMember, setMyMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [all, u] = await Promise.all([
        base44.entities.Member.list("-total_points", 200),
        base44.auth.me().catch(() => null),
      ]);
      setMembers(all);
      if (u) {
        const mine = all.find(m => m.email === u.email);
        if (mine) setMyMember(mine);
      }
      setLoading(false);
    }
    load();
  }, []);

  const filtered = activeTab === "geral"
    ? members
    : members.filter(m => m.cycle === activeTab);

  const ranked = filtered.map((m, i) => ({ ...m, pos: i + 1 }));

  const myRanked = myMember ? ranked.find(m => m.id === myMember.id) : null;

  return (
    <div className="min-h-screen" style={{ background: "#F0F0F4", paddingBottom: "calc(env(safe-area-inset-bottom) + 96px)" }}>
      <div style={{ background: "#0D2137" }}>
        <MobileHeader title="Ranking" dark />
        {myRanked && (
          <div className="px-4 pb-4">
            <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: "rgba(181,134,42,0.15)", border: "1px solid rgba(181,134,42,0.3)" }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-montserrat font-black text-base"
                style={{ background: "rgba(181,134,42,0.25)", color: "#C9973A", border: "2px solid rgba(181,134,42,0.4)" }}>
                {(myRanked.full_name || "?")[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-inter text-xs font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>Sua posição</p>
                <p className="font-montserrat font-black text-white text-base">#{myRanked.pos} · {myRanked.total_points || 0} pts</p>
                <LevelBadge pts={myRanked.total_points || 0} small />
              </div>
              <div className="text-right">
                <p className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Ciclo</p>
                <p className="font-inter text-sm font-semibold" style={{ color: "#C9973A" }}>{cycleLabels[myRanked.cycle] || myRanked.cycle}</p>
              </div>
            </div>
          </div>
        )}
      </div>

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
      {ranked.length >= 3 && !loading && (
        <div className="px-4 pt-2 pb-4">
          <div className="rounded-2xl p-5" style={{ background: "#0D2137", border: "1px solid rgba(181,134,42,0.2)" }}>
            <p className="font-montserrat font-bold text-xs text-center mb-4 uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>
              🏆 Pódio — {tabs.find(t => t.key === activeTab)?.label}
            </p>
            <div className="flex items-end justify-center gap-4">
              {[ranked[1], ranked[0], ranked[2]].map((m, idx) => {
                const realPos = idx === 0 ? 2 : idx === 1 ? 1 : 3;
                const heightClass = realPos === 1 ? "h-20" : "h-14";
                const mc = medalColor(realPos);
                return (
                  <div key={m.id} className="flex flex-col items-center gap-1">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center font-montserrat font-black text-sm"
                      style={{ background: `${mc}22`, color: mc, border: `2px solid ${mc}` }}>
                      {(m.full_name || "?")[0]}
                    </div>
                    <p className="font-inter text-[10px] text-center leading-tight" style={{ color: "rgba(255,255,255,0.7)", maxWidth: 64 }}>{m.full_name?.split(" ")[0]}</p>
                    <div className={`w-14 ${heightClass} rounded-t-xl flex flex-col items-center justify-end pb-2`}
                      style={{ background: `${mc}20`, border: `1px solid ${mc}44` }}>
                      <span style={{ color: mc, fontSize: 20, fontWeight: 900, lineHeight: 1 }}>#{realPos}</span>
                    </div>
                    <p className="font-montserrat font-bold text-xs" style={{ color: "#B5862A" }}>{m.total_points || 0} pts</p>
                    <LevelBadge pts={m.total_points || 0} small />
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
        ) : ranked.slice(ranked.length < 3 ? 0 : 3).map(m => {
          const isMe = myMember?.id === m.id;
          return (
            <div key={m.id} className="rounded-2xl p-4 flex items-center gap-3"
              style={{ background: isMe ? "rgba(181,134,42,0.08)" : "hsl(var(--card))", border: isMe ? "1px solid rgba(181,134,42,0.25)" : "1px solid rgba(13,33,55,0.06)" }}>
              <span className="font-montserrat font-black text-base w-7 text-center" style={{ color: "#9CA3AF" }}>#{m.pos}</span>
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-montserrat font-bold text-sm"
                style={{ background: isMe ? "rgba(181,134,42,0.2)" : "rgba(13,33,55,0.08)", color: isMe ? "#B5862A" : "#0D2137" }}>
                {(m.full_name || "?")[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-inter text-sm font-semibold truncate" style={{ color: "#111827" }}>{m.full_name}</p>
                  {isMe && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(181,134,42,0.15)", color: "#B5862A" }}>Você</span>}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-inter text-xs" style={{ color: "#9CA3AF" }}>{cycleLabels[m.cycle] || m.cycle}</span>
                  <span className="text-gray-300">·</span>
                  <LevelBadge pts={m.total_points || 0} small />
                </div>
              </div>
              <span className="font-montserrat font-bold text-sm" style={{ color: "#B5862A" }}>{m.total_points || 0} pts</span>
            </div>
          );
        })}
      </div>

      {/* Level guide */}
      {!loading && (
        <div className="px-4 mt-6 mb-2">
          <div className="rounded-2xl p-4" style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.08)" }}>
            <p className="font-montserrat font-bold text-sm mb-3" style={{ color: "#0D2137" }}>🎮 Níveis de Engajamento</p>
            {[
              { name: "Observador", icon: "👁️", pts: "0–49 pts", color: "#9CA3AF" },
              { name: "Iniciante", icon: "🎯", pts: "50–99 pts", color: "#6B7280" },
              { name: "Participante", icon: "🌟", pts: "100–199 pts", color: "#1F8A5B" },
              { name: "Engajado", icon: "⚡", pts: "200–299 pts", color: "#B5862A" },
              { name: "Influenciador", icon: "🔥", pts: "300–499 pts", color: "#FF6B35" },
              { name: "Líder em Serviço", icon: "👑", pts: "500+ pts", color: "#FFD700" },
            ].map(l => (
              <div key={l.name} className="flex items-center gap-2 py-1.5 border-b last:border-0" style={{ borderColor: "rgba(13,33,55,0.06)" }}>
                <span className="text-base">{l.icon}</span>
                <span className="font-inter text-sm font-semibold flex-1" style={{ color: l.color }}>{l.name}</span>
                <span className="font-inter text-xs" style={{ color: "#9CA3AF" }}>{l.pts}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}