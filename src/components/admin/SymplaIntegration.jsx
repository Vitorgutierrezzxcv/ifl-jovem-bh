import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Calendar, Users, CheckCircle, XCircle, AlertCircle, ChevronRight, Fingerprint, Mail, User } from "lucide-react";

export default function SymplaIntegration({ onClose }) {
  const [step, setStep] = useState("events");
  const [symplaEvents, setSymplaEvents] = useState([]);
  const [internalEvents, setInternalEvents] = useState([]);
  const [selectedSympla, setSelectedSympla] = useState(null);
  const [selectedInternal, setSelectedInternal] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [totalRegistered, setTotalRegistered] = useState(0);
  const [pointsValue, setPointsValue] = useState(2);
  const [category, setCategory] = useState("palestra");
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
      setTotalRegistered(res.data?.total_registered || 0);
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
        points_value: pointsValue,
        category: category,
        only_checkin: true,
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

  const matchIcon = (method) => {
    if (method === "CPF") return <Fingerprint size={12} style={{ color: "#1F8A5B" }} />;
    if (method === "email") return <Mail size={12} style={{ color: "#106EC8" }} />;
    if (method === "nome") return <User size={12} style={{ color: "#D99A22" }} />;
    return null;
  };

  const pointCategories = [
    { k: "palestra", v: "Palestra" }, { k: "evento_ordinario", v: "Evento Ordinário" },
    { k: "evento_extraordinario", v: "Evento Extraordinário" }, { k: "iflxp", v: "IFL XP" },
    { k: "evento_externo", v: "Evento Externo" }, { k: "institucional", v: "Institucional" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.55)" }}>
      <div className="w-full max-w-2xl rounded-3xl overflow-hidden flex flex-col" style={{ background: "#FFFFFF", maxHeight: "92vh" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(13,33,55,0.08)", background: "#071D33" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.12)" }}>
              <Calendar size={16} className="text-white" />
            </div>
            <div>
              <p className="font-montserrat font-bold text-sm text-white">Importar Presenças via Sympla</p>
              <p className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                Cruza por CPF → Email → Nome
              </p>
            </div>
          </div>
          <button onClick={onClose} className="font-inter text-xs px-3 py-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}>
            Fechar
          </button>
        </div>

        {/* Steps */}
        <div className="flex items-center px-6 py-3 gap-1" style={{ borderBottom: "1px solid rgba(13,33,55,0.06)", background: "#F8F9FA" }}>
          {[
            { key: "events", label: "1. Selecionar eventos" },
            { key: "participants", label: "2. Confirmar" },
            { key: "result", label: "3. Resultado" },
          ].map((s, i) => (
            <React.Fragment key={s.key}>
              <span className="font-inter text-xs font-semibold" style={{ color: step === s.key ? "#071D33" : "#9CA3AF" }}>{s.label}</span>
              {i < 2 && <ChevronRight size={11} style={{ color: "#D1D5DB" }} />}
            </React.Fragment>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4" style={{ background: "rgba(180,35,24,0.07)", border: "1px solid rgba(180,35,24,0.2)" }}>
              <AlertCircle size={15} style={{ color: "#B42318" }} />
              <p className="font-inter text-sm" style={{ color: "#B42318" }}>{error}</p>
            </div>
          )}

          {/* STEP 1 */}
          {step === "events" && (
            <div className="space-y-5">
              {/* Sympla event */}
              <div>
                <p className="font-inter text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#6B7280" }}>
                  Evento no Sympla
                </p>
                {loading ? (
                  <div className="flex justify-center py-6">
                    <div className="w-6 h-6 rounded-full animate-spin" style={{ border: "3px solid #071D33", borderTopColor: "transparent" }} />
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                    {symplaEvents.map(ev => (
                      <button key={ev.id} onClick={() => setSelectedSympla(ev)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                        style={{
                          background: selectedSympla?.id === ev.id ? "rgba(7,29,51,0.07)" : "rgba(13,33,55,0.02)",
                          border: selectedSympla?.id === ev.id ? "1.5px solid #071D33" : "1px solid rgba(13,33,55,0.08)"
                        }}>
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0" style={{ background: "rgba(13,33,55,0.06)" }}>
                          {ev.image ? <img src={ev.image} className="w-full h-full object-cover" alt="" /> : <Calendar size={16} style={{ color: "#071D33", margin: "auto", marginTop: 8 }} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-inter text-sm font-semibold truncate" style={{ color: "#111827" }}>{ev.name}</p>
                          <p className="font-inter text-xs" style={{ color: "#9CA3AF" }}>{formatDate(ev.start_date)}</p>
                        </div>
                        {selectedSympla?.id === ev.id && <CheckCircle size={16} style={{ color: "#071D33" }} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Internal event */}
              <div>
                <p className="font-inter text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#6B7280" }}>
                  Evento IFL (para registrar presença)
                </p>
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                  {internalEvents.map(ev => (
                    <button key={ev.id} onClick={() => setSelectedInternal(ev)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                      style={{
                        background: selectedInternal?.id === ev.id ? "rgba(181,134,42,0.08)" : "rgba(13,33,55,0.02)",
                        border: selectedInternal?.id === ev.id ? "1.5px solid #B5862A" : "1px solid rgba(13,33,55,0.08)"
                      }}>
                      <div className="w-10 h-10 rounded-lg flex flex-col items-center justify-center flex-shrink-0" style={{ background: "#071D33" }}>
                        <span className="font-montserrat font-black text-base text-white leading-none">{new Date((ev.date || "") + "T12:00:00").getDate()}</span>
                        <span className="font-inter text-[9px] uppercase" style={{ color: "#C9973A" }}>{new Date((ev.date || "") + "T12:00:00").toLocaleString("pt-BR", { month: "short" })}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-inter text-sm font-semibold truncate" style={{ color: "#111827" }}>{ev.name}</p>
                        <p className="font-inter text-xs" style={{ color: "#9CA3AF" }}>{formatDate(ev.date)}{ev.points_value > 0 ? ` · ${ev.points_value} pts` : ""}</p>
                      </div>
                      {selectedInternal?.id === ev.id && <CheckCircle size={16} style={{ color: "#B5862A" }} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Points config */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl" style={{ background: "rgba(13,33,55,0.04)", border: "1px solid rgba(13,33,55,0.08)" }}>
                <div>
                  <label className="font-inter text-xs font-semibold block mb-1" style={{ color: "#6B7280" }}>Pontos por presença</label>
                  <input type="number" min={0} value={pointsValue} onChange={e => setPointsValue(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg text-sm font-inter outline-none"
                    style={{ background: "#FFFFFF", border: "1px solid rgba(13,33,55,0.12)", color: "#111827" }} />
                </div>
                <div>
                  <label className="font-inter text-xs font-semibold block mb-1" style={{ color: "#6B7280" }}>Categoria dos pontos</label>
                  <select value={category} onChange={e => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm font-inter outline-none"
                    style={{ background: "#FFFFFF", border: "1px solid rgba(13,33,55,0.12)", color: "#111827" }}>
                    {pointCategories.map(c => <option key={c.k} value={c.k}>{c.v}</option>)}
                  </select>
                </div>
              </div>

              <div className="px-3 py-2 rounded-lg" style={{ background: "rgba(16,110,200,0.06)", border: "1px solid rgba(16,110,200,0.15)" }}>
                <p className="font-inter text-xs" style={{ color: "#106EC8" }}>
                  ℹ️ Só serão importados participantes que fizeram <strong>check-in</strong> no Sympla. O cruzamento usa: CPF → Email → Nome.
                </p>
              </div>

              <button
                onClick={loadParticipants}
                disabled={!selectedSympla || !selectedInternal || loading}
                className="w-full py-3 rounded-xl font-inter font-semibold text-sm text-white transition-all"
                style={{ background: !selectedSympla || !selectedInternal ? "#D1D5DB" : "#071D33" }}>
                {loading ? "Carregando..." : "Ver quem fez check-in →"}
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === "participants" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl p-3 text-center" style={{ background: "rgba(13,33,55,0.05)" }}>
                  <p className="font-montserrat font-black text-2xl" style={{ color: "#071D33" }}>{totalRegistered}</p>
                  <p className="font-inter text-[10px] font-semibold mt-0.5" style={{ color: "#6B7280" }}>Inscritos</p>
                </div>
                <div className="rounded-xl p-3 text-center" style={{ background: "rgba(31,138,91,0.08)" }}>
                  <p className="font-montserrat font-black text-2xl" style={{ color: "#1F8A5B" }}>{participants.length}</p>
                  <p className="font-inter text-[10px] font-semibold mt-0.5" style={{ color: "#1F8A5B" }}>Check-in feito</p>
                </div>
                <div className="rounded-xl p-3 text-center" style={{ background: pointsValue > 0 ? "rgba(181,134,42,0.08)" : "rgba(13,33,55,0.04)" }}>
                  <p className="font-montserrat font-black text-2xl" style={{ color: pointsValue > 0 ? "#B5862A" : "#6B7280" }}>{pointsValue > 0 ? `+${pointsValue}` : "0"}</p>
                  <p className="font-inter text-[10px] font-semibold mt-0.5" style={{ color: "#6B7280" }}>Pts por membro</p>
                </div>
              </div>

              <p className="font-inter text-xs font-bold uppercase tracking-wider" style={{ color: "#6B7280" }}>
                Participantes com check-in
              </p>

              <div className="max-h-64 overflow-y-auto flex flex-col gap-1.5">
                {participants.map((p, i) => {
                  const cpfField = (p.custom_form || []).find(f => f.name?.toLowerCase().includes("cpf"));
                  return (
                    <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: "rgba(13,33,55,0.03)" }}>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(31,138,91,0.12)" }}>
                        <span className="font-montserrat font-bold text-[11px]" style={{ color: "#1F8A5B" }}>
                          {(p.first_name || "?")[0]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-inter text-sm font-medium truncate" style={{ color: "#111827" }}>{p.first_name} {p.last_name}</p>
                        <p className="font-inter text-xs" style={{ color: "#9CA3AF" }}>
                          {p.email}{cpfField?.value ? ` · CPF: ${cpfField.value}` : ""}
                        </p>
                      </div>
                      <CheckCircle size={13} style={{ color: "#1F8A5B" }} />
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep("events")} className="flex-1 py-3 rounded-xl font-inter font-semibold text-sm"
                  style={{ background: "rgba(13,33,55,0.06)", color: "#374151" }}>
                  ← Voltar
                </button>
                <button onClick={importAttendance} disabled={loading}
                  className="flex-1 py-3 rounded-xl font-inter font-semibold text-sm text-white"
                  style={{ background: loading ? "#D1D5DB" : "#071D33" }}>
                  {loading ? "Importando..." : `Importar ${participants.length} presenças${pointsValue > 0 ? ` + ${pointsValue}pts` : ""}`}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === "result" && result && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Check-ins Sympla", value: result.total_checkin, color: "#071D33", bg: "rgba(13,33,55,0.06)" },
                  { label: "Cruzados e importados", value: result.matched, color: "#1F8A5B", bg: "rgba(31,138,91,0.08)" },
                  { label: "Não encontrados", value: result.unmatched, color: "#D99A22", bg: "rgba(217,154,34,0.08)" },
                ].map(s => (
                  <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: s.bg }}>
                    <p className="font-montserrat font-black text-2xl" style={{ color: s.color }}>{s.value}</p>
                    <p className="font-inter text-[10px] font-semibold mt-0.5" style={{ color: s.color }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {result.unmatched > 0 && (
                <div className="px-3 py-2 rounded-lg" style={{ background: "rgba(217,154,34,0.07)", border: "1px solid rgba(217,154,34,0.2)" }}>
                  <p className="font-inter text-xs" style={{ color: "#92400E" }}>
                    ⚠️ {result.unmatched} participante(s) não foram encontrados nos membros do IFL. Verifique se o CPF ou email estão cadastrados.
                  </p>
                </div>
              )}

              <p className="font-inter text-xs font-bold uppercase tracking-wider" style={{ color: "#6B7280" }}>Detalhes do cruzamento</p>

              <div className="max-h-60 overflow-y-auto flex flex-col gap-1.5">
                {(result.results || []).map((r, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: "rgba(13,33,55,0.03)" }}>
                    {r.status === "importado"
                      ? <CheckCircle size={14} style={{ color: "#1F8A5B" }} />
                      : <XCircle size={14} style={{ color: "#D99A22" }} />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-inter text-sm font-medium truncate" style={{ color: "#111827" }}>
                          {r.member_name || r.sympla_name}
                        </p>
                        {r.match_method && (
                          <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-inter"
                            style={{ background: r.match_method === "CPF" ? "rgba(31,138,91,0.1)" : r.match_method === "email" ? "rgba(16,110,200,0.1)" : "rgba(217,154,34,0.1)", color: r.match_method === "CPF" ? "#1F8A5B" : r.match_method === "email" ? "#106EC8" : "#D99A22" }}>
                            {matchIcon(r.match_method)} {r.match_method}
                          </span>
                        )}
                      </div>
                      {r.status !== "importado" && (
                        <p className="font-inter text-xs" style={{ color: "#9CA3AF" }}>{r.sympla_email}{r.sympla_cpf ? ` · ${r.sympla_cpf}` : ""}</p>
                      )}
                    </div>
                    <span className="font-inter text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{
                      background: r.status === "importado" ? "rgba(31,138,91,0.1)" : "rgba(217,154,34,0.1)",
                      color: r.status === "importado" ? "#1F8A5B" : "#D99A22"
                    }}>{r.status}</span>
                  </div>
                ))}
              </div>

              <button onClick={onClose} className="w-full py-3 rounded-xl font-inter font-semibold text-sm text-white"
                style={{ background: "#071D33" }}>
                Concluir ✓
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}