import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Search, Filter, ChevronRight, UserCheck, UserX, AlertTriangle, Download } from "lucide-react";
import AdminHeader from "./AdminHeader";
import StatusBadge from "../ui/StatusBadge";

const cycleLabels = { qualifier: "Qualifier", "1_ciclo": "1º Ciclo", "2_ciclo": "2º Ciclo", "3_ciclo": "3º Ciclo", fellow: "Fellow", honorario: "Honorário" };
const roleLabels = { associado: "Associado", gerente: "Gerente", diretor: "Diretor", vice_presidente: "Vice-Pres.", presidente: "Presidente" };

export default function AdminMembers({ onSelectMember, isAdmin, memberRole }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCycle, setFilterCycle] = useState("todos");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterFinancial, setFilterFinancial] = useState("todos");
  const [selected, setSelected] = useState([]);
  const [bulkAction, setBulkAction] = useState("");
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  useEffect(() => { loadMembers(); }, []);

  async function loadMembers() {
    const data = await base44.entities.Member.list("-total_points");
    setMembers(data);
    setLoading(false);
  }

  const filtered = members.filter(m => {
    const matchSearch = !search || m.full_name?.toLowerCase().includes(search.toLowerCase()) || m.email?.toLowerCase().includes(search.toLowerCase());
    const matchCycle = filterCycle === "todos" || m.cycle === filterCycle;
    const matchStatus = filterStatus === "todos" || m.member_status === filterStatus;
    const matchFinancial = filterFinancial === "todos" || m.financial_status === filterFinancial;
    return matchSearch && matchCycle && matchStatus && matchFinancial;
  });

  function toggleSelect(id) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function toggleAll() {
    setSelected(selected.length === filtered.length ? [] : filtered.map(m => m.id));
  }

  async function executeBulkAction() {
    if (!bulkAction || selected.length === 0) return;
    const updates = {};
    if (bulkAction === "ativar") updates.member_status = "ativo";
    if (bulkAction === "inativar") updates.member_status = "em_atencao";
    if (bulkAction === "licenciar") updates.member_status = "licenciado";
    if (bulkAction === "desligar") updates.member_status = "desligado";

    for (const id of selected) {
      await base44.entities.Member.update(id, updates);
    }
    setSelected([]);
    setBulkAction("");
    setShowBulkConfirm(false);
    loadMembers();
  }

  function exportCSV() {
    const rows = [["Nome", "E-mail", "Ciclo", "Status", "Financeiro", "Pontos", "Cargo", "Presença"]];
    filtered.forEach(m => rows.push([m.full_name, m.email, cycleLabels[m.cycle] || m.cycle, m.member_status, m.financial_status, m.total_points, m.role, `${Math.round(m.attendance_percentage || 0)}%`]));
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "associados.csv"; a.click();
  }

  return (
    <div className="min-h-screen" style={{ background: "#F4F5F7" }}>
      <div>
        <AdminHeader
          title="Gestão de Associados"
          subtitle={`${filtered.length} de ${members.length} associados`}
          actions={
            <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-inter font-semibold"
              style={{ background: "rgba(13,33,55,0.08)", color: "#071D33" }}>
              <Download size={14} /> Exportar
            </button>
          }
        />
      </div>

      <div className="p-4 lg:p-6">
        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 mb-4" style={{ border: "1px solid rgba(13,33,55,0.08)" }}>
          <div className="relative mb-3">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9CA3AF" }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nome ou e-mail..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm font-inter outline-none"
              style={{ background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.08)", color: "#111827" }}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select value={filterCycle} onChange={e => setFilterCycle(e.target.value)}
              className="px-3 py-2 rounded-lg text-xs font-inter outline-none"
              style={{ background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.1)", color: "#374151" }}>
              <option value="todos">Todos os ciclos</option>
              {Object.entries(cycleLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-lg text-xs font-inter outline-none"
              style={{ background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.1)", color: "#374151" }}>
              <option value="todos">Todos os status</option>
              <option value="ativo">Ativo</option>
              <option value="em_atencao">Atenção</option>
              <option value="em_risco">Em Risco</option>
              <option value="licenciado">Licenciado</option>
              <option value="desligado">Desligado</option>
            </select>
            <select value={filterFinancial} onChange={e => setFilterFinancial(e.target.value)}
              className="px-3 py-2 rounded-lg text-xs font-inter outline-none"
              style={{ background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.1)", color: "#374151" }}>
              <option value="todos">Financeiro: Todos</option>
              <option value="em_dia">Em dia</option>
              <option value="pendente">Pendente</option>
              <option value="vencido">Vencido</option>
              <option value="inadimplente">Inadimplente</option>
            </select>
          </div>
        </div>

        {/* Bulk actions */}
        {selected.length > 0 && (
          <div className="bg-white rounded-2xl p-3 mb-4 flex items-center gap-3 flex-wrap" style={{ border: "1px solid rgba(181,134,42,0.3)", background: "rgba(181,134,42,0.05)" }}>
            <span className="font-inter text-sm font-semibold" style={{ color: "#B5862A" }}>{selected.length} selecionado(s)</span>
            <select value={bulkAction} onChange={e => setBulkAction(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-inter outline-none"
              style={{ background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.1)" }}>
              <option value="">Ação em massa...</option>
              <option value="ativar">Marcar como Ativo</option>
              <option value="inativar">Marcar como Atenção</option>
              <option value="licenciar">Marcar como Licenciado</option>
              <option value="desligar">Marcar como Desligado</option>
            </select>
            {bulkAction && (
              <button onClick={() => setShowBulkConfirm(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-inter font-semibold text-white"
                style={{ background: "#071D33" }}>
                Aplicar
              </button>
            )}
            <button onClick={() => setSelected([])} className="text-xs font-inter" style={{ color: "#9CA3AF" }}>Cancelar</button>
          </div>
        )}

        {/* Table header */}
        <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(13,33,55,0.08)" }}>
          <div className="hidden lg:grid grid-cols-12 px-4 py-2.5 border-b" style={{ borderColor: "rgba(13,33,55,0.06)", background: "#F9FAFB" }}>
            <div className="col-span-1 flex items-center">
              <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll} className="rounded" />
            </div>
            <div className="col-span-3 font-inter text-xs font-semibold" style={{ color: "#6B7280" }}>Nome</div>
            <div className="col-span-2 font-inter text-xs font-semibold" style={{ color: "#6B7280" }}>Ciclo / Cargo</div>
            <div className="col-span-2 font-inter text-xs font-semibold" style={{ color: "#6B7280" }}>Status</div>
            <div className="col-span-1 font-inter text-xs font-semibold" style={{ color: "#6B7280" }}>Pontos</div>
            <div className="col-span-1 font-inter text-xs font-semibold" style={{ color: "#6B7280" }}>Presença</div>
            <div className="col-span-2 font-inter text-xs font-semibold" style={{ color: "#6B7280" }}>Financeiro</div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><div className="w-6 h-6 border-4 border-gray-200 border-t-ifl-navy rounded-full animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-inter text-sm" style={{ color: "#9CA3AF" }}>Nenhum associado encontrado</p>
            </div>
          ) : filtered.map((m, i) => (
            <div key={m.id}
              className="flex lg:grid lg:grid-cols-12 items-center px-4 py-3 border-b card-hover cursor-pointer"
              style={{ borderColor: "rgba(13,33,55,0.04)", borderBottom: i === filtered.length - 1 ? "none" : undefined }}
            >
              {/* Checkbox */}
              <div className="hidden lg:flex col-span-1 items-center" onClick={e => e.stopPropagation()}>
                <input type="checkbox" checked={selected.includes(m.id)} onChange={() => toggleSelect(m.id)} className="rounded" />
              </div>

              {/* Name */}
              <div className="flex-1 lg:col-span-3 flex items-center gap-3 min-w-0" onClick={() => onSelectMember(m.id)}>
                <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center"
                  style={{ background: "rgba(13,33,55,0.08)" }}>
                  <span className="font-montserrat font-bold text-xs" style={{ color: "#071D33" }}>
                    {m.full_name?.charAt(0)}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-inter text-sm font-semibold truncate" style={{ color: "#111827" }}>{m.full_name}</p>
                  <p className="font-inter text-xs truncate" style={{ color: "#9CA3AF" }}>{m.email}</p>
                </div>
              </div>

              {/* Cycle / Role */}
              <div className="hidden lg:block col-span-2" onClick={() => onSelectMember(m.id)}>
                <p className="font-inter text-xs font-semibold" style={{ color: "#374151" }}>{cycleLabels[m.cycle] || m.cycle}</p>
                <p className="font-inter text-xs" style={{ color: "#9CA3AF" }}>{roleLabels[m.role] || m.role}</p>
              </div>

              {/* Status */}
              <div className="hidden lg:block col-span-2" onClick={() => onSelectMember(m.id)}>
                <StatusBadge status={m.member_status} />
              </div>

              {/* Points */}
              <div className="hidden lg:block col-span-1" onClick={() => onSelectMember(m.id)}>
                <p className="font-montserrat font-bold text-sm" style={{ color: "#B5862A" }}>{m.total_points || 0}</p>
              </div>

              {/* Attendance */}
              <div className="hidden lg:block col-span-1" onClick={() => onSelectMember(m.id)}>
                <p className="font-inter text-xs font-semibold" style={{ color: (m.attendance_percentage || 0) >= 70 ? "#1F8A5B" : "#B42318" }}>
                  {Math.round(m.attendance_percentage || 0)}%
                </p>
              </div>

              {/* Financial */}
              <div className="hidden lg:flex col-span-2 items-center gap-2" onClick={() => onSelectMember(m.id)}>
                <StatusBadge status={m.financial_status || "em_dia"} />
              </div>

              <ChevronRight size={16} style={{ color: "#D1D5DB", flexShrink: 0 }} onClick={() => onSelectMember(m.id)} />
            </div>
          ))}
        </div>
      </div>

      {/* Bulk Confirm Modal */}
      {showBulkConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="font-montserrat font-bold text-lg mb-2" style={{ color: "#071D33" }}>Confirmar Edição em Massa</h3>
            <p className="font-inter text-sm mb-4" style={{ color: "#6B7280" }}>
              Isso alterará o status de <strong>{selected.length}</strong> associado(s) para <strong>{bulkAction}</strong>. Confirmar?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowBulkConfirm(false)} className="flex-1 py-2.5 rounded-xl font-inter text-sm font-semibold" style={{ background: "#F4F5F7", color: "#374151" }}>Cancelar</button>
              <button onClick={executeBulkAction} className="flex-1 py-2.5 rounded-xl font-inter text-sm font-semibold text-white" style={{ background: "#071D33" }}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}