import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Edit2, Save, X, Star, Calendar, CheckSquare, DollarSign, MessageSquare } from "lucide-react";
import StatusBadge from "../ui/StatusBadge";

const cycleOptions = ["qualifier", "1_ciclo", "2_ciclo", "3_ciclo", "fellow", "honorario"];
const cycleLabels = { qualifier: "Qualifier", "1_ciclo": "1º Ciclo", "2_ciclo": "2º Ciclo", "3_ciclo": "3º Ciclo", fellow: "Fellow", honorario: "Honorário" };
const statusOptions = ["ativo", "em_atencao", "em_risco", "suspenso", "licenciado", "inadimplente", "desligado", "concluido", "fellow", "honorario", "alumni"];
const roleOptions = ["associado", "gerente", "diretor", "vice_presidente", "presidente"];
const tabs = ["Resumo", "Jornada", "Pontos", "Presença", "Tarefas", "Financeiro", "Demandas"];

export default function AdminMemberDetail({ memberId, onBack, isAdmin, memberRole }) {
  const [member, setMember] = useState(null);
  const [points, setPoints] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [charges, setCharges] = useState([]);
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Resumo");
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => { loadAll(); }, [memberId]);

  async function loadAll() {
    setLoading(true);
    const [m, pts, att, subs, chs, dems] = await Promise.all([
      base44.entities.Member.filter({ id: memberId }),
      base44.entities.PointsLedger.filter({ member_id: memberId }),
      base44.entities.Attendance.filter({ member_id: memberId }),
      base44.entities.TaskSubmission.filter({ member_id: memberId }),
      base44.entities.FinancialCharge.filter({ member_id: memberId }),
      base44.entities.DemandRequest.filter({ member_id: memberId }),
    ]);
    const mem = m[0] || null;
    setMember(mem);
    setEditData(mem || {});
    setPoints(pts.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
    setAttendance(att.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
    setSubmissions(subs.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
    setCharges(chs.sort((a, b) => new Date(b.due_date) - new Date(a.due_date)));
    setDemands(dems.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
    setLoading(false);
  }

  async function saveEdit() {
    setSaving(true);
    await base44.entities.Member.update(memberId, editData);
    setMember(editData);
    setEditing(false);
    setSaving(false);
  }

  async function addNote() {
    if (!note.trim()) return;
    const newNotes = member.notes ? `${member.notes}\n\n[${new Date().toLocaleDateString("pt-BR")}] ${note}` : `[${new Date().toLocaleDateString("pt-BR")}] ${note}`;
    await base44.entities.Member.update(memberId, { notes: newNotes });
    setMember({ ...member, notes: newNotes });
    setNote("");
    setAddingNote(false);
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-gray-200 border-t-ifl-navy rounded-full animate-spin" /></div>;
  if (!member) return <div className="flex items-center justify-center min-h-screen"><p>Associado não encontrado</p></div>;

  const totalApprovedPoints = points.filter(p => p.status === "aprovado").reduce((s, p) => s + (p.points || 0), 0);
  const presentCount = attendance.filter(a => a.status === "presente").length;
  const approvedSubmissions = submissions.filter(s => s.status === "aprovada" || s.status === "aprovada_ressalvas").length;

  return (
    <div className="min-h-screen" style={{ background: "#F4F5F7", paddingTop: "calc(env(safe-area-inset-top) + 56px)" }}>
      {/* Header */}
      <div className="bg-white border-b px-4 py-4 lg:pt-4" style={{ borderColor: "rgba(13,33,55,0.08)" }}>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(13,33,55,0.06)" }}>
            <ArrowLeft size={16} style={{ color: "#071D33" }} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-montserrat font-black text-lg truncate" style={{ color: "#071D33" }}>{member.full_name}</h1>
            <p className="font-inter text-xs" style={{ color: "#9CA3AF" }}>{member.email}</p>
          </div>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-inter font-semibold"
              style={{ background: "rgba(13,33,55,0.08)", color: "#071D33" }}>
              <Edit2 size={13} /> Editar
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="p-2 rounded-lg" style={{ background: "rgba(180,35,24,0.08)" }}>
                <X size={14} style={{ color: "#B42318" }} />
              </button>
              <button onClick={saveEdit} disabled={saving} className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-inter font-semibold text-white" style={{ background: "#071D33" }}>
                <Save size={13} /> {saving ? "..." : "Salvar"}
              </button>
            </div>
          )}
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="text-center p-2 rounded-xl" style={{ background: "rgba(181,134,42,0.08)" }}>
            <p className="font-montserrat font-black text-lg" style={{ color: "#B5862A" }}>{totalApprovedPoints}</p>
            <p className="font-inter text-[10px]" style={{ color: "#9CA3AF" }}>Pontos</p>
          </div>
          <div className="text-center p-2 rounded-xl" style={{ background: "rgba(13,33,55,0.06)" }}>
            <p className="font-montserrat font-black text-lg" style={{ color: "#071D33" }}>#{member.ranking_position || "—"}</p>
            <p className="font-inter text-[10px]" style={{ color: "#9CA3AF" }}>Ranking</p>
          </div>
          <div className="text-center p-2 rounded-xl" style={{ background: "rgba(31,138,91,0.08)" }}>
            <p className="font-montserrat font-black text-lg" style={{ color: "#1F8A5B" }}>{Math.round(member.attendance_percentage || 0)}%</p>
            <p className="font-inter text-[10px]" style={{ color: "#9CA3AF" }}>Presença</p>
          </div>
          <div className="text-center p-2 rounded-xl" style={{ background: "rgba(13,33,55,0.06)" }}>
            <p className="font-montserrat font-black text-lg" style={{ color: "#071D33" }}>{approvedSubmissions}</p>
            <p className="font-inter text-[10px]" style={{ color: "#9CA3AF" }}>Tarefas</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {tabs.map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className="px-3 py-1.5 rounded-full font-inter text-xs font-semibold flex-shrink-0"
              style={{ background: activeTab === t ? "#071D33" : "rgba(13,33,55,0.06)", color: activeTab === t ? "#FFF" : "#6B7280" }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {activeTab === "Resumo" && (
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid rgba(13,33,55,0.08)" }}>
              <h3 className="font-montserrat font-bold text-sm mb-4" style={{ color: "#071D33" }}>Dados Pessoais</h3>
              {editing ? (
                <div className="flex flex-col gap-3">
                  <Field label="Nome" value={editData.full_name} onChange={v => setEditData({ ...editData, full_name: v })} />
                  <Field label="E-mail" value={editData.email} onChange={v => setEditData({ ...editData, email: v })} />
                  <Field label="Telefone" value={editData.phone} onChange={v => setEditData({ ...editData, phone: v })} />
                  <Field label="Universidade" value={editData.university} onChange={v => setEditData({ ...editData, university: v })} />
                  <Field label="Curso" value={editData.course} onChange={v => setEditData({ ...editData, course: v })} />
                  <SelectField label="Ciclo" value={editData.cycle} options={cycleOptions} labels={cycleLabels} onChange={v => setEditData({ ...editData, cycle: v })} />
                  <SelectField label="Status" value={editData.member_status} options={statusOptions} onChange={v => setEditData({ ...editData, member_status: v })} />
                  <SelectField label="Cargo" value={editData.role} options={roleOptions} onChange={v => setEditData({ ...editData, role: v })} />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["Ciclo", cycleLabels[member.cycle] || member.cycle],
                    ["Cargo", member.role],
                    ["Status", <StatusBadge status={member.member_status} />],
                    ["Financeiro", <StatusBadge status={member.financial_status || "em_dia"} />],
                    ["Universidade", member.university],
                    ["Curso", member.course],
                    ["Telefone", member.phone],
                    ["Diretoria", member.department_name],
                  ].map(([label, val]) => val ? (
                    <div key={label}>
                      <p className="font-inter text-xs mb-1" style={{ color: "#9CA3AF" }}>{label}</p>
                      <div className="font-inter text-sm font-semibold" style={{ color: "#374151" }}>{val}</div>
                    </div>
                  ) : null)}
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid rgba(13,33,55,0.08)" }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-montserrat font-bold text-sm" style={{ color: "#071D33" }}>Observações Internas</h3>
                <button onClick={() => setAddingNote(!addingNote)} className="text-xs font-inter font-semibold px-2 py-1 rounded-lg"
                  style={{ background: "rgba(13,33,55,0.06)", color: "#071D33" }}>+ Nota</button>
              </div>
              {addingNote && (
                <div className="mb-3">
                  <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
                    placeholder="Escreva uma observação interna..."
                    className="w-full p-3 rounded-xl text-sm font-inter resize-none outline-none"
                    style={{ background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.1)", color: "#374151" }} />
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => setAddingNote(false)} className="px-3 py-1.5 rounded-lg text-xs font-inter" style={{ background: "#F4F5F7", color: "#6B7280" }}>Cancelar</button>
                    <button onClick={addNote} className="px-3 py-1.5 rounded-lg text-xs font-inter font-semibold text-white" style={{ background: "#071D33" }}>Salvar</button>
                  </div>
                </div>
              )}
              {member.notes ? (
                <p className="font-inter text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "#374151" }}>{member.notes}</p>
              ) : (
                <p className="font-inter text-sm" style={{ color: "#D1D5DB" }}>Nenhuma observação registrada.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "Pontos" && (
          <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(13,33,55,0.08)" }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(13,33,55,0.06)" }}>
              <h3 className="font-montserrat font-bold text-sm" style={{ color: "#071D33" }}>Extrato de Pontos ({points.length})</h3>
            </div>
            {points.length === 0 ? <p className="p-5 font-inter text-sm" style={{ color: "#9CA3AF" }}>Nenhum ponto registrado.</p> :
              points.map(p => (
                <div key={p.id} className="flex items-center gap-3 px-5 py-3 border-b" style={{ borderColor: "rgba(13,33,55,0.04)" }}>
                  <div className="flex-1 min-w-0">
                    <p className="font-inter text-sm font-semibold truncate" style={{ color: "#111827" }}>{p.action || p.category}</p>
                    <p className="font-inter text-xs" style={{ color: "#9CA3AF" }}>{p.source_name || p.category} · {new Date(p.created_date).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <StatusBadge status={p.status} />
                  <span className="font-montserrat font-bold text-sm" style={{ color: p.points > 0 ? "#1F8A5B" : "#B42318" }}>
                    {p.points > 0 ? "+" : ""}{p.points}
                  </span>
                </div>
              ))
            }
          </div>
        )}

        {activeTab === "Presença" && (
          <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(13,33,55,0.08)" }}>
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "rgba(13,33,55,0.06)" }}>
              <h3 className="font-montserrat font-bold text-sm" style={{ color: "#071D33" }}>Histórico de Presença</h3>
              <span className="font-inter text-xs font-semibold" style={{ color: (member.attendance_percentage || 0) >= 70 ? "#1F8A5B" : "#B42318" }}>
                {Math.round(member.attendance_percentage || 0)}% geral
              </span>
            </div>
            {attendance.length === 0 ? <p className="p-5 font-inter text-sm" style={{ color: "#9CA3AF" }}>Nenhuma presença registrada.</p> :
              attendance.map(a => (
                <div key={a.id} className="flex items-center gap-3 px-5 py-3 border-b" style={{ borderColor: "rgba(13,33,55,0.04)" }}>
                  <div className="flex-1 min-w-0">
                    <p className="font-inter text-sm font-semibold truncate" style={{ color: "#111827" }}>{a.event_name}</p>
                    <p className="font-inter text-xs" style={{ color: "#9CA3AF" }}>{new Date(a.created_date).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))
            }
          </div>
        )}

        {activeTab === "Tarefas" && (
          <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(13,33,55,0.08)" }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(13,33,55,0.06)" }}>
              <h3 className="font-montserrat font-bold text-sm" style={{ color: "#071D33" }}>Envios de Tarefas ({submissions.length})</h3>
            </div>
            {submissions.length === 0 ? <p className="p-5 font-inter text-sm" style={{ color: "#9CA3AF" }}>Nenhum envio registrado.</p> :
              submissions.map(s => (
                <div key={s.id} className="flex items-center gap-3 px-5 py-3 border-b" style={{ borderColor: "rgba(13,33,55,0.04)" }}>
                  <div className="flex-1 min-w-0">
                    <p className="font-inter text-sm font-semibold truncate" style={{ color: "#111827" }}>Tarefa #{s.task_id?.slice(-6)}</p>
                    <p className="font-inter text-xs" style={{ color: "#9CA3AF" }}>{new Date(s.created_date).toLocaleDateString("pt-BR")}</p>
                    {s.feedback && <p className="font-inter text-xs mt-1 italic" style={{ color: "#9CA3AF" }}>"{s.feedback}"</p>}
                  </div>
                  <StatusBadge status={s.status} />
                </div>
              ))
            }
          </div>
        )}

        {activeTab === "Financeiro" && (
          <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(13,33,55,0.08)" }}>
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "rgba(13,33,55,0.06)" }}>
              <h3 className="font-montserrat font-bold text-sm" style={{ color: "#071D33" }}>Histórico Financeiro</h3>
              <StatusBadge status={member.financial_status || "em_dia"} />
            </div>
            {charges.length === 0 ? <p className="p-5 font-inter text-sm" style={{ color: "#9CA3AF" }}>Nenhuma cobrança registrada.</p> :
              charges.map(c => (
                <div key={c.id} className="flex items-center gap-3 px-5 py-3 border-b" style={{ borderColor: "rgba(13,33,55,0.04)" }}>
                  <div className="flex-1 min-w-0">
                    <p className="font-inter text-sm font-semibold" style={{ color: "#111827" }}>R$ {c.amount?.toFixed(2)}</p>
                    <p className="font-inter text-xs" style={{ color: "#9CA3AF" }}>Venc: {c.due_date} · {c.plan}</p>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
              ))
            }
          </div>
        )}

        {activeTab === "Demandas" && (
          <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(13,33,55,0.08)" }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(13,33,55,0.06)" }}>
              <h3 className="font-montserrat font-bold text-sm" style={{ color: "#071D33" }}>Demandas ({demands.length})</h3>
            </div>
            {demands.length === 0 ? <p className="p-5 font-inter text-sm" style={{ color: "#9CA3AF" }}>Nenhuma demanda registrada.</p> :
              demands.map(d => (
                <div key={d.id} className="px-5 py-3 border-b" style={{ borderColor: "rgba(13,33,55,0.04)" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-inter text-sm font-semibold flex-1" style={{ color: "#111827" }}>{d.category}</p>
                    <StatusBadge status={d.status} />
                  </div>
                  <p className="font-inter text-xs" style={{ color: "#9CA3AF" }}>{d.justification?.slice(0, 80)}...</p>
                </div>
              ))
            }
          </div>
        )}

        {activeTab === "Jornada" && (
          <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid rgba(13,33,55,0.08)" }}>
            <h3 className="font-montserrat font-bold text-sm mb-4" style={{ color: "#071D33" }}>Progresso na Jornada</h3>
            <div className="flex flex-col gap-3">
              {[
                { label: "Presença em Eventos", value: `${Math.round(member.attendance_percentage || 0)}%`, target: "≥ 70%", ok: (member.attendance_percentage || 0) >= 70 },
                { label: "Pontos Acumulados", value: totalApprovedPoints, target: "Ver ranking", ok: true },
                { label: "Tarefas Aprovadas", value: approvedSubmissions, target: "Mínimo do ciclo", ok: approvedSubmissions > 0 },
                { label: "Status Financeiro", value: member.financial_status, target: "Em dia", ok: member.financial_status === "em_dia" },
                { label: "Status Geral", value: <StatusBadge status={member.progress_status || "em_dia"} />, target: "", ok: true },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: item.ok ? "rgba(31,138,91,0.05)" : "rgba(180,35,24,0.05)" }}>
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.ok ? "#1F8A5B" : "#B42318" }} />
                  <div className="flex-1">
                    <p className="font-inter text-xs font-semibold" style={{ color: "#374151" }}>{item.label}</p>
                    {item.target && <p className="font-inter text-xs" style={{ color: "#9CA3AF" }}>Meta: {item.target}</p>}
                  </div>
                  <div className="font-inter text-sm font-bold" style={{ color: item.ok ? "#1F8A5B" : "#B42318" }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <div>
      <label className="font-inter text-xs font-semibold mb-1 block" style={{ color: "#6B7280" }}>{label}</label>
      <input value={value || ""} onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-xl text-sm font-inter outline-none"
        style={{ background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.1)", color: "#374151" }} />
    </div>
  );
}

function SelectField({ label, value, options, labels = {}, onChange }) {
  return (
    <div>
      <label className="font-inter text-xs font-semibold mb-1 block" style={{ color: "#6B7280" }}>{label}</label>
      <select value={value || ""} onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-xl text-sm font-inter outline-none"
        style={{ background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.1)", color: "#374151" }}>
        {options.map(o => <option key={o} value={o}>{labels[o] || o}</option>)}
      </select>
    </div>
  );
}