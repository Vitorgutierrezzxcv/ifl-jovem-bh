import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Search, Users } from "lucide-react";
import MobileHeader from "../components/layout/MobileHeader";

const cycleLabels = { qualifier: "Qualifier", "1_ciclo": "1º Ciclo", "2_ciclo": "2º Ciclo", "3_ciclo": "3º Ciclo", fellow: "Fellow", honorario: "Honorário" };
const cycleColor = { qualifier: "#6B7280", "1_ciclo": "#0D2137", "2_ciclo": "#B5862A", "3_ciclo": "#1F8A5B", fellow: "#B5862A", honorario: "#B5862A" };

export default function Directory() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Member.list("full_name", 500).then(all => {
      setMembers(all.filter(m => m.show_in_directory !== false));
      setLoading(false);
    });
  }, []);

  const filtered = members.filter(m =>
    m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.course?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen" style={{ background: "#0D2137", paddingBottom: "calc(env(safe-area-inset-bottom) + 96px)" }}>
      <div style={{ background: "#0D2137" }}>
        <MobileHeader title="Diretório de Associados" dark />
        <div className="px-5 pb-4">
          <p className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>{members.length} associados</p>
        </div>
      </div>

      <div className="px-4 pt-4">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-4" style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.1)" }}>
          <Search size={15} style={{ color: "#9CA3AF" }} />
          <input className="flex-1 bg-transparent font-inter text-sm outline-none text-foreground" placeholder="Buscar por nome ou curso..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><div className="w-7 h-7 border-4 border-gray-200 border-t-ifl-navy rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-2">
            <Users size={40} style={{ color: "#D1D5DB" }} />
            <p className="font-inter text-sm" style={{ color: "#9CA3AF" }}>Nenhum associado encontrado</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map(m => (
              <div key={m.id} className="rounded-2xl p-4 flex items-start gap-3"
                style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.06)", boxShadow: "0 2px 8px rgba(13,33,55,0.04)" }}>
                <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 font-montserrat font-black text-white"
                  style={{ background: "linear-gradient(135deg, #B8872A, #D4A043)" }}>
                  {m.avatar_url ? <img src={m.avatar_url} alt={m.full_name} className="w-11 h-11 rounded-full object-cover" /> : m.full_name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-montserrat font-bold text-sm text-foreground">{m.full_name}</p>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: `${cycleColor[m.cycle] || "#6B7280"}15`, color: cycleColor[m.cycle] || "#6B7280" }}>
                      {cycleLabels[m.cycle] || m.cycle}
                    </span>
                  </div>
                  {m.course && <p className="font-inter text-xs mt-0.5" style={{ color: "#6B7280" }}>{m.course}{m.university ? ` · ${m.university}` : ""}</p>}
                  {m.mini_bio && <p className="font-inter text-xs mt-1.5 leading-relaxed" style={{ color: "#6B7280" }}>{m.mini_bio}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}