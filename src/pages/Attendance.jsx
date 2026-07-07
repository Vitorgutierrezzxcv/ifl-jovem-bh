import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Calendar, CheckCircle2, XCircle, AlertCircle, Clock } from "lucide-react";
import MobileHeader from "../components/layout/MobileHeader";

let attendanceUnsubscribe;

const statusConfig = {
  presente: { label: "Presente", icon: CheckCircle2, color: "#1F8A5B", bg: "rgba(31,138,91,0.1)" },
  ausente: { label: "Ausente", icon: XCircle, color: "#B42318", bg: "rgba(180,35,24,0.1)" },
  ausencia_justificada: { label: "Justificada", icon: AlertCircle, color: "#D99A22", bg: "rgba(217,154,34,0.1)" },
  pendente: { label: "Pendente", icon: Clock, color: "#6B7280", bg: "rgba(107,114,128,0.1)" },
  validada: { label: "Validada", icon: CheckCircle2, color: "#1F8A5B", bg: "rgba(31,138,91,0.1)" },
  anulada: { label: "Anulada", icon: XCircle, color: "#B42318", bg: "rgba(180,35,24,0.1)" },
};

const filters = ["Todos", "Presente", "Ausente"];

export default function Attendance() {
  const [member, setMember] = useState(null);
  const [attendances, setAttendances] = useState([]);
  const [events, setEvents] = useState({});
  const [filter, setFilter] = useState("Todos");
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    loadData();
    // Subscribe to real-time attendance updates
    attendanceUnsubscribe = base44.entities.Attendance.subscribe((event) => {
      if (event.type === 'create' || event.type === 'update') {
        setAttendances(prev => {
          const existing = prev.findIndex(a => a.id === event.data.id);
          if (existing >= 0) {
            const updated = [...prev];
            updated[existing] = event.data;
            return updated;
          }
          return [event.data, ...prev];
        });
      }
    });
    return () => {
      if (attendanceUnsubscribe) attendanceUnsubscribe();
    };
  }, []);

  async function loadData() {
    try {
      const u = await base44.auth.me();
      let members = await base44.entities.Member.filter({ email: u.email });
      if (members.length === 0) {
        members = await base44.entities.Member.list("-total_points", 1);
      }
      const m = members[0];
      if (!m) return;
      setMember(m);
      const recs = await base44.entities.Attendance.filter({ member_id: m.id }, "-created_date", 50);
      setAttendances(recs);
      // fetch event names for display
      const evIds = [...new Set(recs.map(r => r.event_id).filter(Boolean))];
      if (evIds.length > 0) {
        const evList = await Promise.all(evIds.slice(0, 20).map(id =>
          base44.entities.Event.filter({ id }).then(r => r[0]).catch(() => null)
        ));
        const evMap = {};
        evList.forEach(ev => { if (ev) evMap[ev.id] = ev; });
        setEvents(evMap);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const present = attendances.filter(a => ["presente", "validada"].includes(a.status));
  const absent = attendances.filter(a => a.status === "ausente" || a.status === "anulada");
  const justified = attendances.filter(a => a.status === "ausencia_justificada");

  const pct = attendances.length > 0
    ? Math.round((present.length / attendances.length) * 100)
    : Math.round(member?.attendance_percentage || 0);

  const filtered = attendances.filter(a => {
    if (filter === "Presente") return ["presente", "validada"].includes(a.status);
    if (filter === "Ausente") return ["ausente", "anulada", "ausencia_justificada"].includes(a.status);
    return true;
  });

  function AttendanceRow({ record }) {
    const cfg = statusConfig[record.status] || statusConfig.pendente;
    const StatusIcon = cfg.icon;
    const ev = events[record.event_id];
    const name = record.event_name || ev?.name || "Evento";
    const date = ev?.date
      ? new Date(ev.date + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
      : record.checked_in_at
        ? new Date(record.checked_in_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
        : null;

    return (
      <div className="rounded-2xl px-4 py-3 flex items-center gap-3"
        style={{ background: "hsl(var(--card))", border: "1px solid rgba(7,29,51,0.06)", boxShadow: "0 2px 8px rgba(7,29,51,0.03)" }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: cfg.bg }}>
          <StatusIcon size={17} style={{ color: cfg.color }} strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-inter text-sm font-semibold truncate" style={{ color: "#111827" }}>{name}</p>
          {date && <p className="font-inter text-xs mt-0.5" style={{ color: "#9CA3AF" }}>{date}</p>}
        </div>
        <span className="font-inter text-xs font-bold px-2 py-1 rounded-full flex-shrink-0"
          style={{ background: cfg.bg, color: cfg.color }}>
          {cfg.label}
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ifl-gray-bg" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 96px)" }}>
      {/* Header */}
      <div className="hex-bg-dark relative overflow-hidden" style={{ background: "#0D2137" }}>
        <MobileHeader title="Minha Presença" dark />
        <div className="px-5 pb-6">
          <div className="flex items-end gap-4">
            <div>
              <p className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Taxa de presença</p>
              <p className="font-montserrat font-black text-5xl text-white leading-none mt-1">{pct}%</p>
            </div>
            <div className="ml-auto flex gap-2">
              <div className="rounded-xl px-3 py-2 text-center" style={{ background: "rgba(31,138,91,0.2)" }}>
                <p className="font-montserrat font-black text-xl" style={{ color: "#4ADE80" }}>{present.length}</p>
                <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.5)" }}>Presenças</p>
              </div>
              <div className="rounded-xl px-3 py-2 text-center" style={{ background: "rgba(180,35,24,0.2)" }}>
                <p className="font-montserrat font-black text-xl" style={{ color: "#F87171" }}>{absent.length}</p>
                <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.5)" }}>Faltas</p>
              </div>
              {justified.length > 0 && (
                <div className="rounded-xl px-3 py-2 text-center" style={{ background: "rgba(217,154,34,0.2)" }}>
                  <p className="font-montserrat font-black text-xl" style={{ color: "#FCD34D" }}>{justified.length}</p>
                  <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.5)" }}>Just.</p>
                </div>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-2 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
            <div className="h-2 rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: pct >= 70 ? "linear-gradient(90deg,#1F8A5B,#4ADE80)" : "linear-gradient(90deg,#B42318,#F87171)" }} />
          </div>
          <p className="font-inter text-xs mt-1.5" style={{ color: pct >= 70 ? "#4ADE80" : "#F87171" }}>
            {pct >= 70 ? "✓ Meta de 70% atingida" : `Faltam ${70 - pct}% para atingir a meta de 70%`}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="flex-shrink-0 px-4 py-2 rounded-2xl font-inter text-xs font-semibold transition-all"
            style={{
              background: filter === f ? "rgba(181,134,42,0.15)" : "rgba(255,255,255,0.06)",
              color: filter === f ? "#D4A043" : "rgba(255,255,255,0.6)",
              border: filter === f ? "1px solid rgba(181,134,42,0.3)" : "1px solid rgba(255,255,255,0.1)",
            }}>
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="px-4 mt-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-7 h-7 rounded-full animate-spin" style={{ border: "3px solid #B8872A", borderTopColor: "transparent" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-14 gap-2">
            <Calendar size={40} style={{ color: "rgba(7,29,51,0.12)" }} />
            <p className="font-inter text-sm" style={{ color: "#9CA3AF" }}>Nenhum registro encontrado</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map(rec => <AttendanceRow key={rec.id} record={rec} />)}
          </div>
        )}
      </div>

    </div>
  );
}