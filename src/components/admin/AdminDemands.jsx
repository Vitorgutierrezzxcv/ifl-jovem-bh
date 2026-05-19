import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { MessageSquare, ChevronDown } from "lucide-react";
import AdminHeader from "./AdminHeader";
import StatusBadge from "../ui/StatusBadge";

const statusTabs = [
  { key: "todos", label: "Todas" },
  { key: "pendente", label: "Pendentes" },
  { key: "em_analise", label: "Em Análise" },
  { key: "respondida", label: "Respondidas" },
  { key: "resolvida", label: "Resolvidas" },
  { key: "indeferida", label: "Indeferidas" },
];

export default function AdminDemands({ isAdmin, memberRole }) {
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("pendente");
  const [selected, setSelected] = useState(null);
  const [response, setResponse] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const data = await base44.entities.DemandRequest.list("-created_date", 200);
    setDemands(data);
    setLoading(false);
  }

  async function updateDemand(id) {
    if (!newStatus) return;
    setSaving(true);
    await base44.entities.DemandRequest.update(id, {
      status: newStatus,
      response: response || undefined,
      responded_by: "admin",
    });
    setSaving(false);
    setSelected(null);
    setResponse("");
    setNewStatus("");
    load();
  }

  const filtered = demands.filter(d => tab === "todos" || d.status === tab);
  const counts = {};
  statusTabs.forEach(t => { counts[t.key] = t.key === "todos" ? demands.length : demands.filter(d => d.status === t.key).length; });

  return (
    <div className="min-h-screen" style={{ background: "#F4F5F7" }}>
      <div>
        <AdminHeader title="Demandas Internas" subtitle={`${counts["pendente"] || 0} pendentes`} />
      </div>

      <div className="p-4 lg:p-6">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4">
          {statusTabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full font-inter text-xs font-semibold flex-shrink-0"
              style={{ background: tab === t.key ? "#071D33" : "#FFFFFF", color: tab === t.key ? "#FFF" : "#6B7280", border: tab === t.key ? "none" : "1px solid rgba(13,33,55,0.1)" }}>
              {t.label} {counts[t.key] > 0 && <span className="ml-1 px-1 py-0.5 rounded text-[10px]" style={{ background: tab === t.key ? "rgba(255,255,255,0.2)" : "rgba(13,33,55,0.08)" }}>{counts[t.key]}</span>}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {loading ? (
            <div className="flex justify-center py-12"><div className="w-6 h-6 border-4 border-gray-200 border-t-ifl-navy rounded-full animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center"><p className="font-inter text-sm" style={{ color: "#9CA3AF" }}>Nenhuma demanda encontrada</p></div>
          ) : filtered.map(d => (
            <div key={d.id} className="bg-white rounded-2xl p-4" style={{ border: "1px solid rgba(13,33,55,0.08)" }}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(13,33,55,0.06)" }}>
                  <MessageSquare size={16} style={{ color: "#071D33" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-inter text-sm font-semibold" style={{ color: "#111827" }}>{d.member_name}</p>
                    <StatusBadge status={d.status} />
                  </div>
                  <p className="font-inter text-xs font-semibold" style={{ color: "#B5862A" }}>{d.category}</p>
                  <p className="font-inter text-xs mt-1 line-clamp-3" style={{ color: "#6B7280" }}>{d.justification}</p>
                  <p className="font-inter text-[10px] mt-1" style={{ color: "#9CA3AF" }}>Ciclo: {d.cycle} · {new Date(d.created_date).toLocaleDateString("pt-BR")}</p>
                  {d.response && (
                    <div className="mt-2 p-2 rounded-lg" style={{ background: "rgba(31,138,91,0.06)" }}>
                      <p className="font-inter text-xs font-semibold" style={{ color: "#1F8A5B" }}>Resposta da diretoria:</p>
                      <p className="font-inter text-xs mt-0.5" style={{ color: "#374151" }}>{d.response}</p>
                    </div>
                  )}
                </div>
              </div>

              {selected === d.id ? (
                <div className="mt-3 pt-3 border-t" style={{ borderColor: "rgba(13,33,55,0.06)" }}>
                  <textarea value={response} onChange={e => setResponse(e.target.value)} placeholder="Resposta para o associado (opcional)..." rows={2}
                    className="w-full px-3 py-2 rounded-xl text-xs font-inter resize-none outline-none mb-2"
                    style={{ background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.1)", color: "#374151" }} />
                  <div className="flex gap-2 flex-wrap items-center">
                    <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                      className="px-3 py-1.5 rounded-lg text-xs font-inter outline-none"
                      style={{ background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.1)", color: "#374151" }}>
                      <option value="">Novo status...</option>
                      <option value="em_analise">Em Análise</option>
                      <option value="respondida">Respondida</option>
                      <option value="resolvida">Resolvida</option>
                      <option value="indeferida">Indeferida</option>
                    </select>
                    <button onClick={() => updateDemand(d.id)} disabled={saving || !newStatus}
                      className="px-3 py-1.5 rounded-lg text-xs font-inter font-semibold text-white"
                      style={{ background: saving || !newStatus ? "#9CA3AF" : "#071D33" }}>
                      {saving ? "..." : "Salvar"}
                    </button>
                    <button onClick={() => { setSelected(null); setResponse(""); setNewStatus(""); }} className="text-xs font-inter" style={{ color: "#9CA3AF" }}>Cancelar</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setSelected(d.id)} className="mt-2 flex items-center gap-1 font-inter text-xs font-semibold" style={{ color: "#B5862A" }}>
                  Responder / Atualizar <ChevronDown size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}