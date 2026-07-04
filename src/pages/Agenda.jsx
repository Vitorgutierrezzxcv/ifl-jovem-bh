import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Calendar, MapPin, Clock, Users, ChevronRight, Star, Zap, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileHeader from "../components/layout/MobileHeader";

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

function MonthCalendar({ events, month, onMonthChange, selectedDay, onSelectDay }) {
  const year = month.getFullYear();
  const monthIdx = month.getMonth();
  const firstDay = new Date(year, monthIdx, 1);
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
  const startOffset = firstDay.getDay();

  const eventsByDay = {};
  events.forEach(ev => {
    const d = new Date(ev.date + "T12:00:00");
    if (d.getFullYear() === year && d.getMonth() === monthIdx) {
      eventsByDay[d.getDate()] = (eventsByDay[d.getDate()] || 0) + 1;
    }
  });

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="rounded-2xl p-4" style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.08)" }}>
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => onMonthChange(-1)} className="p-1.5 rounded-lg" style={{ background: "rgba(13,33,55,0.06)" }}><ChevronLeft size={16} /></button>
        <p className="font-montserrat font-bold text-sm text-foreground capitalize">{month.toLocaleString("pt-BR", { month: "long", year: "numeric" })}</p>
        <button onClick={() => onMonthChange(1)} className="p-1.5 rounded-lg" style={{ background: "rgba(13,33,55,0.06)" }}><ChevronRight size={16} /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((w, i) => (
          <div key={i} className="text-center font-inter text-[10px] font-semibold" style={{ color: "#9CA3AF" }}>{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const isSelected = selectedDay === d;
          const hasEvents = !!eventsByDay[d];
          const isToday = new Date().toDateString() === new Date(year, monthIdx, d).toDateString();
          return (
            <button key={i} onClick={() => onSelectDay(isSelected ? null : d)}
              className="aspect-square rounded-lg flex flex-col items-center justify-center relative"
              style={{
                background: isSelected ? "#0D2137" : "transparent",
                border: isToday && !isSelected ? "1px solid rgba(181,134,42,0.4)" : "1px solid transparent",
              }}>
              <span className="font-inter text-xs" style={{ color: isSelected ? "#FFF" : "#374151" }}>{d}</span>
              {hasEvents && <div className="w-1 h-1 rounded-full absolute bottom-1" style={{ background: isSelected ? "#D4A043" : "#B5862A" }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const typeLabels = {
  palestra_ordinaria: "Palestra",
  evento_ordinario_formacao: "Formação",
  clube_do_livro: "Clube do Livro",
  evento_extraordinario: "Extraordinário",
  viagem: "Viagem",
  visita_tecnica: "Visita Técnica",
  forum: "Fórum",
  iflxp: "IFL XP",
  reuniao_diretoria: "Reunião",
  processo_seletivo: "Processo Seletivo",
  evento_externo: "Externo",
  evento_institucional: "Institucional",
};

const statusColors = {
  publicado: { bg: "rgba(13,33,55,0.08)", color: "#0D2137", label: "Publicado" },
  inscricoes_abertas: { bg: "rgba(31,138,91,0.1)", color: "#1F8A5B", label: "Inscrições Abertas" },
  inscricoes_encerradas: { bg: "rgba(180,35,24,0.1)", color: "#B42318", label: "Inscrições Encerradas" },
  realizado: { bg: "rgba(107,114,128,0.1)", color: "#6B7280", label: "Realizado" },
  cancelado: { bg: "rgba(180,35,24,0.1)", color: "#B42318", label: "Cancelado" },
};

export default function Agenda() {
  const navigateTo = useNavigate();
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("proximos");
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  function changeMonth(delta) {
    setSelectedDay(null);
    setMonth(m => new Date(m.getFullYear(), m.getMonth() + delta, 1));
  }

  useEffect(() => {
    Promise.all([
      base44.entities.Event.list("-date", 50),
      base44.entities.ExtraordinaryEvent.list("-date", 50).catch(() => []),
    ]).then(([evs, extras]) => {
      const mappedExtras = extras.map(e => ({
        id: `extra_${e.id}`,
        name: e.title,
        type: "evento_extraordinario",
        date: e.date,
        location: e.location,
        description: e.description,
        status: e.status === "encerrado" ? "realizado" : "publicado",
      }));
      setEvents([...evs, ...mappedExtras]);
      setLoading(false);
    });
  }, []);

  const today = new Date().toISOString().split("T")[0];

  const filtered = events.filter(ev => {
    if (filter === "proximos") return ev.date >= today && ev.status !== "cancelado";
    if (filter === "realizados") return ev.date < today || ev.status === "realizado";
    return true;
  }).filter(ev => {
    if (!selectedDay) return true;
    const d = new Date(ev.date + "T12:00:00");
    return d.getFullYear() === month.getFullYear() && d.getMonth() === month.getMonth() && d.getDate() === selectedDay;
  });

  if (selected) {
    const sc = statusColors[selected.status] || statusColors.publicado;
    const isExtraordinary = selected.type === "evento_extraordinario";
    return (
      <div className="min-h-screen" style={{ background: "#F0F0F4", paddingBottom: "calc(env(safe-area-inset-bottom) + 96px)" }}>
        <div style={{ background: "#0D2137" }}>
          <MobileHeader title="Evento" dark showBack />
        </div>
        <div className="px-4 pt-4 flex flex-col gap-4">
          {isExtraordinary && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(181,134,42,0.12)", border: "1px solid rgba(181,134,42,0.3)" }}>
              <Zap size={14} style={{ color: "#B5862A" }} />
              <span className="font-inter text-xs font-semibold" style={{ color: "#B5862A" }}>Evento Extraordinário — participação gera pontos extras</span>
            </div>
          )}
          <div className="rounded-2xl p-5" style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.08)" }}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <h2 className="font-montserrat font-bold text-xl flex-1" style={{ color: "#111827" }}>{selected.name}</h2>
              <span className="text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: "rgba(13,33,55,0.08)", color: "#0D2137" }}>
              {typeLabels[selected.type] || selected.type}
            </span>
          </div>

          <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.08)" }}>
            {selected.date && (
              <div className="flex items-center gap-3">
                <Calendar size={16} style={{ color: "#B5862A" }} />
                <span className="font-inter text-sm" style={{ color: "#374151" }}>
                  {new Date(selected.date + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  {selected.time && ` · ${selected.time}`}
                </span>
              </div>
            )}
            {selected.location && (
              <div className="flex items-center gap-3">
                <MapPin size={16} style={{ color: "#B5862A" }} />
                <span className="font-inter text-sm" style={{ color: "#374151" }}>{selected.location}</span>
              </div>
            )}
            {selected.speaker && (
              <div className="flex items-center gap-3">
                <Users size={16} style={{ color: "#B5862A" }} />
                <span className="font-inter text-sm" style={{ color: "#374151" }}>{selected.speaker}</span>
              </div>
            )}
            {selected.points_value > 0 && (
              <div className="flex items-center gap-3">
                <Star size={16} style={{ color: "#B5862A" }} />
                <span className="font-inter text-sm font-semibold" style={{ color: "#B5862A" }}>+{selected.points_value} pontos por presença</span>
              </div>
            )}
          </div>

          {selected.description && (
            <div className="rounded-2xl p-5" style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.08)" }}>
              <p className="font-montserrat font-bold text-sm mb-2" style={{ color: "#111827" }}>Descrição</p>
              <p className="font-inter text-sm leading-relaxed" style={{ color: "#6B7280" }}>{selected.description}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#F0F0F4", paddingBottom: "calc(env(safe-area-inset-bottom) + 96px)" }}>
      <MobileHeader title="Agenda" dark />

      <div className="px-4 pt-4">
        <MonthCalendar events={events} month={month} onMonthChange={changeMonth} selectedDay={selectedDay} onSelectDay={setSelectedDay} />
      </div>

      <div className="flex gap-2 px-4 pt-4 pb-2">
        {[{ key: "proximos", label: "Próximos" }, { key: "realizados", label: "Realizados" }, { key: "todos", label: "Todos" }].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className="px-4 py-1.5 rounded-full font-inter text-xs font-semibold"
            style={{ background: filter === f.key ? "#0D2137" : "hsl(var(--card))", color: filter === f.key ? "#FFF" : "#6B7280", border: filter === f.key ? "none" : "1px solid rgba(13,33,55,0.1)" }}>
            {f.label}
          </button>
        ))}
        {selectedDay && (
          <button onClick={() => setSelectedDay(null)} className="px-3 py-1.5 rounded-full font-inter text-xs font-semibold" style={{ background: "rgba(181,134,42,0.12)", color: "#B5862A" }}>
            Dia {selectedDay} ✕
          </button>
        )}
      </div>

      <div className="px-4 pb-2">
        <button onClick={() => navigateTo("/eventos-extraordinarios")}
          className="w-full flex items-center gap-3 rounded-2xl p-3.5"
          style={{ background: "rgba(181,134,42,0.08)", border: "1px solid rgba(181,134,42,0.2)" }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(181,134,42,0.15)" }}>
            <Zap size={15} style={{ color: "#B5862A" }} />
          </div>
          <span className="flex-1 text-left font-inter text-sm font-semibold" style={{ color: "#B5862A" }}>Eventos Extraordinários — inscreva-se</span>
          <ChevronRight size={15} style={{ color: "#B5862A" }} />
        </button>
      </div>

      <div className="px-4 flex flex-col gap-3 pt-2">
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-7 h-7 border-4 border-gray-200 border-t-ifl-navy rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <Calendar size={40} style={{ color: "#D1D5DB" }} />
            <p className="font-inter text-sm" style={{ color: "#9CA3AF" }}>Nenhum evento encontrado</p>
          </div>
        ) : filtered.map(ev => (
          <button key={ev.id} onClick={() => setSelected(ev)}
            className="rounded-2xl p-4 flex items-center gap-3 card-hover text-left w-full"
            style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.06)", boxShadow: "0 2px 8px rgba(13,33,55,0.04)" }}>
            <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0" style={{ background: "#0D2137" }}>
              <span className="font-montserrat font-black text-lg text-white leading-none">{new Date(ev.date + "T12:00:00").getDate()}</span>
              <span className="font-inter text-[9px] uppercase" style={{ color: "#C9973A" }}>{new Date(ev.date + "T12:00:00").toLocaleString("pt-BR", { month: "short" })}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-montserrat font-bold text-sm truncate" style={{ color: "#111827" }}>{ev.name}</p>
              <p className="font-inter text-xs mt-0.5" style={{ color: "#6B7280" }}>
                {typeLabels[ev.type] || ev.type}{ev.location ? ` · ${ev.location}` : ""}
              </p>
              {ev.type === "evento_extraordinario" && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold mt-1" style={{ color: "#B5862A" }}>
                  <Zap size={10} /> Extraordinário
                </span>
              )}
            </div>
            <ChevronRight size={16} style={{ color: "#B5862A", flexShrink: 0 }} />
          </button>
        ))}
      </div>
    </div>
  );
}