import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Calendar, Users, Download, CheckCircle, XCircle, AlertCircle, RefreshCw, ChevronRight } from "lucide-react";

export default function SymplaIntegration({ onClose }) {
  const [step, setStep] = useState("events"); // events | participants | result
  const [symplaEvents, setSymplaEvents] = useState([]);
  const [internalEvents, setInternalEvents] = useState([]);
  const [selectedSympla, setSelectedSympla] = useState(null);
  const [selectedInternal, setSelectedInternal] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { loadEvents(); }, []);

  async function loadEvents() {
    setLoading(true);
    setError(null);
    try {
      const [symplaRes, internalRes] = await Promise.all([
        base44.functions.invoke("sympla", { action: "list_events" }),
        base44.entities.Event.list("-date", 50),
      ]);
      setSymplaEvents(symplaRes.data?.events || []);
      setInternalEvents(internalRes);
    } catch (e) {
      setError(e.message || "Erro ao carregar eventos");
    } finally {
      setLoading(false);
    }
  }

  async function loadParticipants() {
    if (!selectedSympla) return;
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("sympla", {
        action: "list_participants",
        event_id: selectedSympla.id
      });
      setParticipants(res.data?.participants || []);
      setStep("participants");
    } catch (e) {
      setError(e.message || "Erro ao carregar participantes");
    } finally {
      setLoading(false);
    }
  }

  async function importAttendance() {
    if (!selectedSympla || !selectedInternal) return;
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("sympla", {
        action: "import_attendance",
        event_id: selectedSympla.id,
        internal_event_id: selectedInternal.id,
        event_name: selectedInternal.name,
      });
      setResult(res.data);
      setStep("result");
    } catch (e) {
      setError(e.message || "Erro na importação");
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="w-full max-w-2xl rounded-3xl overflow-hidden flex flex-col" style={{ background: "#FFFFFF", maxHeight: "90vh" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "rgba(13,33,55,0.08)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(16,110,200,0.1)" }}>
              <Calendar size={18} style={{ color: "#106EC8" }} />
            </div>
            <div>
              <p className="font-montserrat font-bold text-sm" style={{ color: "#071D33" }}>Integração Sympla</p>
              <p className="font-inter text-xs" style={{ color: "#9CA3AF" }}>
                {step === "events" ? "Selecione o evento" : step === "participants" ? "Confirmar importação" : "Resultado"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="font-inter text-xs px-3 py-1.5 rounded-lg" style={{ background: "rgba(13,33,55,0.06)", color: "#6B7280" }}>
            Fechar
          </button>
        </div>

        {/* Steps indicator */}
        <div className="flex px-6 py-3 gap-2" style={{ borderBottom: "1px solid rgba(13,33,55,0.06)" }}>
          {[
            { key: "events", label: "1. Eventos" },
            { key: "participants", label: "2. Confirmar" },
            { key: "result", label: "3. Resultado" },
          ].map((s, i) => (
            <div key={s.key} className="flex items-center gap-1">
              <span className="font-inter text-xs font-semibold" style={{ color: step === s.key ? "#106EC8" : "#9CA3AF" }}>{s.label}</span>
              {i < 2 && <ChevronRight size={12} style={{ color: "#D1D5DB" }} />}
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4" style={{ background: "rgba(180,35,24,0.07)", border: "1px solid rgba(180,35,24,0.2)" }}>
              <AlertCircle size={15} style={{ color: "#B42318" }} />
              <p className="font-inter text-sm" style={{ color: "#B42318" }}>{error}</p>
            </div>
          )}

          {/* STEP 1: Select events */}
          {step === "events" && (
            <div className="space-y-5">
              {/* Sympla event */}
              <div>
                <p className="font-inter text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#6B7280" }}>
                  Evento no Sympla
                </p>
                {loading ? (
                  <div className="flex justify-center py-6">
                    <div className="w-6 h-6 rounded-full animate-spin" style={{ border: "3px solid #106EC8", borderTopColor: "transparent" }} />
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 max-h-52 overflow-y-auto">
                    {symplaEvents.length === 0 && (
                      <p className="font-inter text-sm text-center py-4" style={{ color: "#9CA3AF" }}>Nenhum evento encontrado no Sympla</p>
                    )}
                    {symplaEvents.map(ev => (
                      <button key={ev.id} onClick={() => setSelectedSympla(ev)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                        style={{
                          background: selectedSympla?.id === ev.id ? "rgba(16,110,200,0.08)" : "rgba(13,33,55,0.03)",
                          border: selectedSympla?.id === ev.id ? "1.5px solid rgba(16,110,200,0.4)" : "1px solid rgba(13,33,55,0.08)"
                        }}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(16,110,200,0.1)" }}>
                          <Calendar size={14} style={{ color: "#106EC8" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-inter text-sm font-semibold truncate" style={{ color: "#111827" }}>{ev.name}</p>
                          <p className="font-inter text-xs" style={{ color: "#9CA3AF" }}>{formatDate(ev.start_date)}</p>
                        </div>
                        {selectedSympla?.id === ev.id && <CheckCircle size={16} style={{ color: "#106EC8" }} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Internal event */}
              <div>
                <p className="font-inter text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#6B7280" }}>
                  Evento no IFL (vincular presença)
                </p>
                <div className="flex flex-col gap-2 max-h-52 overflow-y-auto">
                  {internalEvents.length === 0 && (
                    <p className="font-inter text-sm text-center py-4" style={{ color: "#9CA3AF" }}>Nenhum evento interno encontrado</p>
                  )}
                  {internalEvents.map(ev => (
                    <button key={ev.id} onClick={() => setSelectedInternal(ev)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                      style={{
                        background: selectedInternal?.id === ev.id ? "rgba(31,138,91,0.07)" : "rgba(13,33,55,0.03)",
                        border: selectedInternal?.id === ev.id ? "1.5px solid rgba(31,138,91,0.4)" : "1px solid rgba(13,33,55,0.08)"
                      }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(31,138,91,0.1)" }}>
                        <Calendar size={14} style={{ color: "#1F8A5B" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-inter text-sm font-semibold truncate" style={{ color: "#111827" }}>{ev.name}</p>
                        <p className="font-inter text-xs" style={{ color: "#9CA3AF" }}>{formatDate(ev.date)}</p>
                      </div>
                      {selectedInternal?.id === ev.id && <CheckCircle size={16} style={{ color: "#1F8A5B" }} />}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={loadParticipants}
                disabled={!selectedSympla || !selectedInternal || loading}
                className="w-full py-3 rounded-xl font-inter font-semibold text-sm text-white transition-all"
                style={{ background: !selectedSympla || !selectedInternal ? "#D1D5DB" : "#106EC8" }}>
                {loading ? "Carregando..." : "Ver participantes →"}
              </button>
            </div>
          )}

          {/* STEP 2: Confirm */}
          {step === "participants" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: "rgba(16,110,200,0.05)", border: "1px solid rgba(16,110,200,0.15)" }}>
                <div>
                  <p className="font-inter text-xs font-semibold" style={{ color: "#106EC8" }}>Sympla → {selectedSympla?.name}</p>
                  <p className="font-inter text-xs" style={{ color: "#9CA3AF" }}>IFL → {selectedInternal?.name}</p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: "rgba(16,110,200,0.1)" }}>
                  <Users size={13} style={{ color: "#106EC8" }} />
                  <span className="font-montserrat font-bold text-sm" style={{ color: "#106EC8" }}>{participants.length}</span>
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto flex flex-col gap-1.5">
                {participants.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: "rgba(13,33,55,0.03)" }}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(16,110,200,0.1)" }}>
                      <span className="font-montserrat font-bold text-[11px]" style={{ color: "#106EC8" }}>
                        {(p.first_name || "?")[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-inter text-sm font-medium truncate" style={{ color: "#111827" }}>{p.first_name} {p.last_name}</p>
                      <p className="font-inter text-xs truncate" style={{ color: "#9CA3AF" }}>{p.email}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep("events")} className="flex-1 py-3 rounded-xl font-inter font-semibold text-sm"
                  style={{ background: "rgba(13,33,55,0.06)", color: "#374151" }}>
                  ← Voltar
                </button>
                <button onClick={importAttendance} disabled={loading}
                  className="flex-1 py-3 rounded-xl font-inter font-semibold text-sm text-white"
                  style={{ background: loading ? "#D1D5DB" : "#1F8A5B" }}>
                  {loading ? "Importando..." : `Importar ${participants.length} presenças`}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Result */}
          {step === "result" && result && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Total Sympla", value: result.total, color: "#106EC8", bg: "rgba(16,110,200,0.08)" },
                  { label: "Importados", value: result.matched, color: "#1F8A5B", bg: "rgba(31,138,91,0.08)" },
                  { label: "Não encontrados", value: result.unmatched, color: "#D99A22", bg: "rgba(217,154,34,0.08)" },
                ].map(s => (
                  <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: s.bg }}>
                    <p className="font-montserrat font-black text-2xl" style={{ color: s.color }}>{s.value}</p>
                    <p className="font-inter text-[10px] font-semibold mt-0.5" style={{ color: s.color }}>{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="max-h-64 overflow-y-auto flex flex-col gap-1.5">
                {(result.results || []).map((r, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: "rgba(13,33,55,0.03)" }}>
                    {r.status === "importado" ? <CheckCircle size={14} style={{ color: "#1F8A5B" }} />
                      : r.status === "já existia" ? <CheckCircle size={14} style={{ color: "#106EC8" }} />
                      : <XCircle size={14} style={{ color: "#D99A22" }} />}
                    <div className="flex-1 min-w-0">
                      <p className="font-inter text-sm font-medium truncate" style={{ color: "#111827" }}>{r.name}</p>
                      <p className="font-inter text-xs" style={{ color: "#9CA3AF" }}>{r.email}</p>
                    </div>
                    <span className="font-inter text-xs px-2 py-0.5 rounded-full" style={{
                      background: r.status === "importado" ? "rgba(31,138,91,0.1)" : r.status === "já existia" ? "rgba(16,110,200,0.1)" : "rgba(217,154,34,0.1)",
                      color: r.status === "importado" ? "#1F8A5B" : r.status === "já existia" ? "#106EC8" : "#D99A22"
                    }}>{r.status}</span>
                  </div>
                ))}
              </div>

              <button onClick={onClose} className="w-full py-3 rounded-xl font-inter font-semibold text-sm text-white"
                style={{ background: "#071D33" }}>
                Concluir
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}