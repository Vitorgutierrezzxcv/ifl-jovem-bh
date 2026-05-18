import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Calendar, MapPin, Clock, ChevronRight, Users } from "lucide-react";
import MobileHeader from "../components/layout/MobileHeader";
import BottomNav from "../components/layout/BottomNav";
import usePullToRefresh from "../hooks/usePullToRefresh";
import PullToRefreshIndicator from "../components/ui/PullToRefreshIndicator";

const typeConfig = {
  palestra_ordinaria: { label: "Palestra", color: "#071D33" },
  evento_ordinario_formacao: { label: "Formação", color: "#1F8A5B" },
  clube_do_livro: { label: "Clube do Livro", color: "#B8872A" },
  evento_extraordinario: { label: "Extraordinário", color: "#B8872A" },
  viagem: { label: "Viagem", color: "#071D33" },
  visita_tecnica: { label: "Visita Técnica", color: "#1F8A5B" },
  forum: { label: "Fórum", color: "#B8872A" },
  iflxp: { label: "IFLXP", color: "#B8872A" },
  reuniao_diretoria: { label: "Reunião", color: "#6B7280" },
  processo_seletivo: { label: "Proc. Seletivo", color: "#071D33" },
  evento_externo: { label: "Externo", color: "#6B7280" },
  evento_institucional: { label: "Institucional", color: "#071D33" },
};

const filters = ["Todos", "Palestra", "Formação", "Clube do Livro", "Extraordinário"];

export default function Agenda() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Todos");

  useEffect(() => { loadEvents(); }, []);

  async function loadEvents() {
    try {
      const data = await base44.entities.Event.list("-date", 30);
      setEvents(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const handleRefresh = useCallback(async () => {
    setLoading(true);
    await loadEvents();
  }, []);

  const { containerRef, pullDistance, refreshing, progress: pullProgress } = usePullToRefresh(handleRefresh);

  const today = new Date().toISOString().split("T")[0];
  const upcoming = events.filter(e => e.date >= today);
  const past = events.filter(e => e.date < today);

  const filterMap = { "Palestra": "palestra_ordinaria", "Formação": "evento_ordinario_formacao", "Clube do Livro": "clube_do_livro", "Extraordinário": "evento_extraordinario" };

  function applyFilter(list) {
    if (filter === "Todos") return list;
    return list.filter(e => e.type === filterMap[filter]);
  }

  function formatDate(d) {
    const dt = new Date(d + "T12:00:00");
    return dt.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });
  }

  function EventCard({ ev }) {
    const tc = typeConfig[ev.type] || { label: ev.type, color: "#071D33" };
    const dt = new Date(ev.date + "T12:00:00");
    return (
      <div className="rounded-2xl overflow-hidden card-hover" style={{ background: "hsl(var(--card))", border: "1px solid rgba(7,29,51,0.06)", boxShadow: "0 2px 8px rgba(7,29,51,0.04)" }}>
        <div className="flex">
          {/* Date column */}
          <div className="w-16 flex flex-col items-center justify-center py-4 flex-shrink-0" style={{ background: "#071D33" }}>
            <span className="font-montserrat font-black text-2xl text-white leading-none">{dt.getDate()}</span>
            <span className="font-inter text-[10px] uppercase mt-0.5" style={{ color: "#D4A043" }}>
              {dt.toLocaleString("pt-BR", { month: "short" })}
            </span>
            <span className="font-inter text-[9px] mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
              {dt.toLocaleString("pt-BR", { weekday: "short" })}
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 p-4 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-inter text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: `${tc.color}12`, color: tc.color }}>
                {tc.label}
              </span>
            </div>
            <p className="font-montserrat font-bold text-sm" style={{ color: "#111827" }}>{ev.name}</p>
            {ev.time && (
              <div className="flex items-center gap-1 mt-1.5">
                <Clock size={11} style={{ color: "#6B7280" }} />
                <span className="font-inter text-xs" style={{ color: "#6B7280" }}>{ev.time}</span>
              </div>
            )}
            {ev.location && (
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin size={11} style={{ color: "#6B7280" }} />
                <span className="font-inter text-xs truncate" style={{ color: "#6B7280" }}>{ev.location}</span>
              </div>
            )}
          </div>
          <div className="flex items-center pr-3">
            <ChevronRight size={16} style={{ color: "#B8872A" }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-ifl-gray-bg relative overflow-auto" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 72px)" }}>
      <PullToRefreshIndicator pullDistance={pullDistance} refreshing={refreshing} progress={pullProgress} />
      <div className="hex-bg-dark" style={{ background: "linear-gradient(160deg, #071D33 0%, #0A2640 100%)" }}>
        <MobileHeader title="Agenda" dark />
        <div className="px-5 pb-5">
          <h1 className="font-montserrat font-black text-2xl text-white">Eventos e Agenda</h1>
          <p className="font-inter text-sm mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
            {upcoming.length} eventos próximos
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="flex-shrink-0 px-4 py-2 rounded-2xl font-inter text-xs font-semibold transition-all duration-200"
            style={{
              background: filter === f ? "#071D33" : "hsl(var(--card))",
              color: filter === f ? "#D4A043" : "#6B7280",
              border: filter === f ? "1px solid rgba(184,135,42,0.3)" : "1px solid rgba(7,29,51,0.08)",
            }}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-3 border-ifl-gold border-t-transparent rounded-full animate-spin" style={{ borderWidth: 3, borderColor: "#B8872A", borderTopColor: "transparent" }} />
        </div>
      ) : (
        <div className="px-4 mt-4">
          {applyFilter(upcoming).length > 0 && (
            <>
              <h2 className="font-montserrat font-bold text-xs uppercase tracking-wider mb-3" style={{ color: "#6B7280" }}>Próximos</h2>
              <div className="flex flex-col gap-2 mb-5">
                {applyFilter(upcoming).map(ev => <EventCard key={ev.id} ev={ev} />)}
              </div>
            </>
          )}

          {applyFilter(past).length > 0 && (
            <>
              <h2 className="font-montserrat font-bold text-xs uppercase tracking-wider mb-3 mt-2" style={{ color: "#9CA3AF" }}>Realizados</h2>
              <div className="flex flex-col gap-2" style={{ opacity: 0.6 }}>
                {applyFilter(past).slice(0, 5).map(ev => <EventCard key={ev.id} ev={ev} />)}
              </div>
            </>
          )}

          {applyFilter(upcoming).length === 0 && applyFilter(past).length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Calendar size={40} style={{ color: "rgba(7,29,51,0.15)" }} />
              <p className="font-montserrat font-bold text-sm" style={{ color: "#9CA3AF" }}>Nenhum evento encontrado</p>
            </div>
          )}
        </div>
      )}

      <BottomNav />
    </div>
  );
}