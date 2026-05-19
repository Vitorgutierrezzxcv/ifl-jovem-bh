import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Shield, Search, Edit2, Save, X, ChevronDown, Users, Crown, Star } from "lucide-react";
import AdminHeader from "./AdminHeader";
import StatusBadge from "../ui/StatusBadge";

const cycleLabels = {
  qualifier: "Qualifier", "1_ciclo": "1º Ciclo", "2_ciclo": "2º Ciclo",
  "3_ciclo": "3º Ciclo", fellow: "Fellow", honorario: "Honorário"
};

const roleConfig = {
  presidente: { label: "Presidente", color: "#B5862A", bg: "rgba(181,134,42,0.12)", icon: Crown, level: 5, desc: "Acesso total ao sistema" },
  vice_presidente: { label: "Vice-Presidente", color: "#0D2137", bg: "rgba(13,33,55,0.1)", icon: Shield, level: 4, desc: "Acesso administrativo completo" },
  diretor: { label: "Diretor", color: "#1565C0", bg: "rgba(21,101,192,0.1)", icon: Shield, level: 3, desc: "Gerencia diretoria e membros" },
  gerente: { label: "Gerente", color: "#1F8A5B", bg: "rgba(31,138,91,0.1)", icon: Star, level: 2, desc: "Coordena projetos e equipes" },
  associado: { label: "Associado", color: "#6B7280", bg: "rgba(107,114,128,0.1)", icon: Users, level: 1, desc: "Membro regular sem acesso admin" },
};

const deptOptions = [
  "Presidência", "Vice-Presidência", "Diretoria de Formação", "Diretoria de Comunicação",
  "Diretoria de Projetos", "Diretoria Financeira", "Diretoria de Pessoas", "Diretoria de Captação",
  "Diretoria de Eventos", "Diretoria de Marketing"
];

const roleOrder = ["presidente", "vice_presidente", "diretor", "gerente", "associado"];

export default function AdminAccessLevels({ isAdmin, memberRole }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("todos");
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadMembers(); }, []);

  async function loadMembers() {
    const data = await base44.entities.Member.list("-total_points");
    setMembers(data);
    setLoading(false);
  }

  const filtered = members.filter(m => {
    const matchSearch = !search || m.full_name?.toLowerCase().includes(search.toLowerCase()) || m.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "todos" || m.role === filterRole;
    return matchSearch && matchRole;
  });

  // Group by role
  const grouped = roleOrder.reduce((acc, role) => {
    const group = filtered.filter(m => m.role === role);
    if (group.length > 0) acc[role] = group;
    return acc;
  }, {});

  function startEdit(m) {
    setEditingId(m.id);
    setEditData({ role: m.role, department_name: m.department_name, cycle: m.cycle, member_status: m.member_status });
  }

  async function saveEdit(id) {
    setSaving(true);
    await base44.entities.Member.update(id, editData);
    setMembers(prev => prev.map(m => m.id === id ? { ...m, ...editData } : m));
    setEditingId(null);
    setSaving(false);
  }

  const canEdit = isAdmin || ["presidente", "vice_presidente"].includes(memberRole);

  return (
    <div className="min-h-screen" style={{ background: "#F4F5F7" }}>
      <AdminHeader
        title="Níveis de Acesso"
        subtitle="Gerencie cargos, diretoria e permissões dos associados"
      />

      <div className="p-4 lg:p-6">
        {/* Role summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
          {roleOrder.map(role => {
            const cfg = roleConfig[role];
            const count = members.filter(m => m.role === role).length;
            const Icon = cfg.icon;
            return (
              <button
                key={role}
                onClick={() => setFilterRole(filterRole === role ? "todos" : role)}
                className="rounded-2xl p-4 text-left transition-all"
                style={{
                  background: filterRole === role ? cfg.bg : "white",
                  border: filterRole === role ? `1.5px solid ${cfg.color}40` : "1px solid rgba(13,33,55,0.08)",
                  boxShadow: filterRole === role ? `0 2px 12px ${cfg.color}18` : "none"
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: cfg.bg }}>
                    <Icon size={13} style={{ color: cfg.color }} />
                  </div>
                  <span className="font-montserrat font-black text-xl" style={{ color: cfg.color }}>{count}</span>
                </div>
                <p className="font-inter text-xs font-semibold" style={{ color: "#374151" }}>{cfg.label}</p>
                <p className="font-inter text-[10px] mt-0.5" style={{ color: "#9CA3AF" }}>{cfg.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 mb-4" style={{ border: "1px solid rgba(13,33,55,0.08)" }}>
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9CA3AF" }} />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar associado..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm font-inter outline-none"
                style={{ background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.08)", color: "#111827" }}
              />
            </div>
            <select
              value={filterRole} onChange={e => setFilterRole(e.target.value)}
              className="px-3 py-2 rounded-xl text-sm font-inter outline-none"
              style={{ background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.1)", color: "#374151" }}
            >
              <option value="todos">Todos os cargos</option>
              {roleOrder.map(r => <option key={r} value={r}>{roleConfig[r].label}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-7 h-7 border-4 border-gray-200 border-t-ifl-navy rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {Object.entries(grouped).map(([role, group]) => {
              const cfg = roleConfig[role];
              const Icon = cfg.icon;
              return (
                <div key={role} className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(13,33,55,0.08)" }}>
                  {/* Group header */}
                  <div className="flex items-center gap-3 px-5 py-3 border-b" style={{ borderColor: "rgba(13,33,55,0.06)", background: cfg.bg }}>
                    <Icon size={15} style={{ color: cfg.color }} />
                    <span className="font-montserrat font-bold text-sm" style={{ color: cfg.color }}>{cfg.label}</span>
                    <span className="font-inter text-xs px-2 py-0.5 rounded-full ml-auto" style={{ background: `${cfg.color}20`, color: cfg.color }}>
                      {group.length} membro(s)
                    </span>
                  </div>

                  {group.map((m, i) => (
                    <div key={m.id} className="border-b last:border-0" style={{ borderColor: "rgba(13,33,55,0.04)" }}>
                      {editingId === m.id ? (
                        <div className="px-5 py-4">
                          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 mb-3">
                            <div>
                              <label className="font-inter text-xs font-semibold block mb-1" style={{ color: "#6B7280" }}>Cargo</label>
                              <select
                                value={editData.role}
                                onChange={e => setEditData({ ...editData, role: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl text-sm font-inter outline-none"
                                style={{ background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.1)", color: "#374151" }}
                              >
                                {roleOrder.map(r => <option key={r} value={r}>{roleConfig[r].label}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="font-inter text-xs font-semibold block mb-1" style={{ color: "#6B7280" }}>Diretoria</label>
                              <select
                                value={editData.department_name || ""}
                                onChange={e => setEditData({ ...editData, department_name: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl text-sm font-inter outline-none"
                                style={{ background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.1)", color: "#374151" }}
                              >
                                <option value="">Sem diretoria</option>
                                {deptOptions.map(d => <option key={d} value={d}>{d}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="font-inter text-xs font-semibold block mb-1" style={{ color: "#6B7280" }}>Ciclo</label>
                              <select
                                value={editData.cycle || "qualifier"}
                                onChange={e => setEditData({ ...editData, cycle: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl text-sm font-inter outline-none"
                                style={{ background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.1)", color: "#374151" }}
                              >
                                {Object.entries(cycleLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="font-inter text-xs font-semibold block mb-1" style={{ color: "#6B7280" }}>Status</label>
                              <select
                                value={editData.member_status || "ativo"}
                                onChange={e => setEditData({ ...editData, member_status: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl text-sm font-inter outline-none"
                                style={{ background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.1)", color: "#374151" }}
                              >
                                {["ativo", "em_atencao", "em_risco", "suspenso", "licenciado", "inadimplente", "desligado", "fellow", "honorario", "alumni"].map(s => (
                                  <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingId(null)}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-inter font-semibold"
                              style={{ background: "rgba(180,35,24,0.08)", color: "#B42318" }}
                            >
                              <X size={12} /> Cancelar
                            </button>
                            <button
                              onClick={() => saveEdit(m.id)}
                              disabled={saving}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-inter font-semibold text-white"
                              style={{ background: "#0D2137" }}
                            >
                              <Save size={12} /> {saving ? "Salvando..." : "Salvar alterações"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 px-5 py-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: "rgba(13,33,55,0.07)" }}>
                            <span className="font-montserrat font-bold text-sm" style={{ color: "#071D33" }}>
                              {m.full_name?.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-inter text-sm font-semibold truncate" style={{ color: "#111827" }}>{m.full_name}</p>
                            <div className="flex items-center gap-2 flex-wrap mt-0.5">
                              <p className="font-inter text-xs" style={{ color: "#9CA3AF" }}>{m.email}</p>
                              {m.department_name && (
                                <span className="font-inter text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: "rgba(13,33,55,0.06)", color: "#6B7280" }}>
                                  {m.department_name}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="hidden lg:flex items-center gap-2">
                            <span className="font-inter text-xs" style={{ color: "#9CA3AF" }}>{cycleLabels[m.cycle] || m.cycle}</span>
                            <StatusBadge status={m.member_status} />
                          </div>
                          {canEdit && (
                            <button
                              onClick={() => startEdit(m)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-inter font-semibold flex-shrink-0"
                              style={{ background: "rgba(13,33,55,0.06)", color: "#374151" }}
                            >
                              <Edit2 size={12} /> Editar
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="flex flex-col items-center py-16 gap-3">
                <Shield size={40} style={{ color: "#D1D5DB" }} />
                <p className="font-inter text-sm" style={{ color: "#9CA3AF" }}>Nenhum associado encontrado</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}