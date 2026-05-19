import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import {
  Library, Plus, Search, Upload, X, Edit2, Save, Archive,
  FileText, Video, BookOpen, Link, FileSpreadsheet, Image, File, ExternalLink,
  Star, Eye, Download, Filter, ChevronDown,
} from "lucide-react";
import AdminHeader from "./AdminHeader";

const deptConfig = {
  geral: { label: "Geral", color: "#071D33", bg: "rgba(7,29,51,0.08)" },
  presidencia: { label: "Presidência", color: "#B5862A", bg: "rgba(181,134,42,0.1)" },
  vice_presidencia: { label: "Vice-Presidência", color: "#0D2137", bg: "rgba(13,33,55,0.1)" },
  formacao: { label: "Formação", color: "#7C3AED", bg: "rgba(124,58,237,0.09)" },
  comunicacao: { label: "Comunicação", color: "#0EA5E9", bg: "rgba(14,165,233,0.09)" },
  projetos: { label: "Projetos", color: "#1F8A5B", bg: "rgba(31,138,91,0.09)" },
  financeiro: { label: "Financeiro", color: "#D99A22", bg: "rgba(217,154,34,0.09)" },
  pessoas: { label: "Pessoas", color: "#EC4899", bg: "rgba(236,72,153,0.09)" },
  captacao: { label: "Captação", color: "#F97316", bg: "rgba(249,115,22,0.09)" },
  eventos: { label: "Eventos", color: "#6366F1", bg: "rgba(99,102,241,0.09)" },
  marketing: { label: "Marketing", color: "#EF4444", bg: "rgba(239,68,68,0.09)" },
};

const fileTypeConfig = {
  pdf: { label: "PDF", icon: FileText, color: "#B42318" },
  video: { label: "Vídeo", icon: Video, color: "#7C3AED" },
  manual: { label: "Manual", icon: BookOpen, color: "#071D33" },
  planilha: { label: "Planilha", icon: FileSpreadsheet, color: "#1F8A5B" },
  apresentacao: { label: "Apresentação", icon: File, color: "#D99A22" },
  imagem: { label: "Imagem", icon: Image, color: "#EC4899" },
  link: { label: "Link", icon: Link, color: "#0EA5E9" },
  outro: { label: "Outro", icon: File, color: "#6B7280" },
};

const visibilityConfig = {
  todos: { label: "Todos", color: "#1F8A5B" },
  diretoria: { label: "Diretoria", color: "#D99A22" },
  presidencia: { label: "Presidência", color: "#B42318" },
};

const EMPTY_FORM = {
  title: "", description: "", file_type: "pdf", department: "geral",
  visibility: "todos", tags: "", content_text: "", external_url: "", featured: false,
};

export default function AdminLibrary({ isAdmin, memberRole }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("todos");
  const [filterType, setFilterType] = useState("todos");
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const data = await base44.entities.Library.list("-created_date", 200);
    setItems(data);
    setLoading(false);
  }

  const filtered = items.filter(item => {
    if (item.status === "arquivado") return false;
    const matchDept = filterDept === "todos" || item.department === filterDept;
    const matchType = filterType === "todos" || item.file_type === filterType;
    const q = search.toLowerCase();
    const matchSearch = !q || [item.title, item.description, item.tags, item.content_text]
      .filter(Boolean).some(f => f.toLowerCase().includes(q));
    return matchDept && matchType && matchSearch;
  });

  const grouped = {};
  filtered.forEach(item => {
    const dept = item.department || "geral";
    if (!grouped[dept]) grouped[dept] = [];
    grouped[dept].push(item);
  });

  function openAdd() {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setSelectedFile(null);
    setShowForm(true);
  }

  function openEdit(item) {
    setEditItem(item);
    setForm({
      title: item.title || "", description: item.description || "",
      file_type: item.file_type || "pdf", department: item.department || "geral",
      visibility: item.visibility || "todos", tags: item.tags || "",
      content_text: item.content_text || "", external_url: item.external_url || "",
      featured: item.featured || false,
    });
    setSelectedFile(null);
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.title) return;
    setSaving(true);
    let file_url = editItem?.file_url || "";
    if (selectedFile) {
      setUploading(true);
      const res = await base44.integrations.Core.UploadFile({ file: selectedFile });
      file_url = res.file_url;
      setUploading(false);
    }
    const payload = { ...form, file_url, status: "ativo" };
    if (editItem) {
      await base44.entities.Library.update(editItem.id, payload);
      setItems(prev => prev.map(i => i.id === editItem.id ? { ...i, ...payload } : i));
    } else {
      const created = await base44.entities.Library.create(payload);
      setItems(prev => [created, ...prev]);
    }
    setShowForm(false);
    setSaving(false);
  }

  async function handleArchive(id) {
    await base44.entities.Library.update(id, { status: "arquivado" });
    setItems(prev => prev.filter(i => i.id !== id));
  }

  const canEdit = isAdmin || ["presidente", "vice_presidente", "diretor"].includes(memberRole);

  return (
    <div className="min-h-screen" style={{ background: "#F4F5F7" }}>
      <AdminHeader title="Biblioteca de Materiais" subtitle="Vídeos, PDFs, manuais por diretoria" />

      {/* Filters & search bar */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 lg:px-6 py-3 flex flex-wrap gap-3 items-center"
        style={{ borderColor: "rgba(13,33,55,0.08)" }}>
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9CA3AF" }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por título, descrição, tags ou conteúdo..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm font-inter outline-none"
            style={{ background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.08)", color: "#111827" }}
          />
        </div>
        <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
          className="px-3 py-2 rounded-xl text-xs font-inter outline-none"
          style={{ background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.1)", color: "#374151" }}>
          <option value="todos">Todas as diretorias</option>
          {Object.entries(deptConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="px-3 py-2 rounded-xl text-xs font-inter outline-none"
          style={{ background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.1)", color: "#374151" }}>
          <option value="todos">Todos os tipos</option>
          {Object.entries(fileTypeConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        {canEdit && (
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-inter font-semibold text-white"
            style={{ background: "#0D2137" }}>
            <Plus size={15} /> Adicionar
          </button>
        )}
      </div>

      <div className="p-4 lg:p-6 space-y-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-4 border-gray-200 border-t-ifl-navy rounded-full animate-spin" />
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-3">
            <Library size={44} style={{ color: "#D1D5DB" }} />
            <p className="font-inter text-sm" style={{ color: "#9CA3AF" }}>Nenhum material encontrado</p>
            {canEdit && <button onClick={openAdd} className="font-inter text-sm font-semibold px-4 py-2 rounded-xl text-white" style={{ background: "#0D2137" }}>Adicionar primeiro material</button>}
          </div>
        ) : (
          Object.entries(grouped).map(([dept, deptItems]) => {
            const cfg = deptConfig[dept] || deptConfig.geral;
            return (
              <div key={dept}>
                {/* Dept header */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full" style={{ background: cfg.color }} />
                  <h2 className="font-montserrat font-bold text-sm" style={{ color: cfg.color }}>{cfg.label}</h2>
                  <span className="font-inter text-xs px-2 py-0.5 rounded-full" style={{ background: cfg.bg, color: cfg.color }}>
                    {deptItems.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                  {deptItems.map(item => {
                    const ftCfg = fileTypeConfig[item.file_type] || fileTypeConfig.outro;
                    const FtIcon = ftCfg.icon;
                    const href = item.file_url || item.external_url;
                    return (
                      <div key={item.id} className="bg-white rounded-2xl p-4 flex flex-col gap-3"
                        style={{ border: `1px solid ${item.featured ? cfg.color + "30" : "rgba(13,33,55,0.08)"}` }}>
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: ftCfg.color + "12" }}>
                            <FtIcon size={18} style={{ color: ftCfg.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {item.featured && <Star size={11} style={{ color: "#B5862A" }} fill="#B5862A" />}
                              <p className="font-inter text-sm font-semibold" style={{ color: "#111827" }}>{item.title}</p>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className="font-inter text-[10px] px-1.5 py-0.5 rounded-full"
                                style={{ background: ftCfg.color + "12", color: ftCfg.color }}>
                                {ftCfg.label}
                              </span>
                              <span className="font-inter text-[10px] px-1.5 py-0.5 rounded-full"
                                style={{ background: "rgba(107,114,128,0.1)", color: visibilityConfig[item.visibility]?.color || "#6B7280" }}>
                                {visibilityConfig[item.visibility]?.label}
                              </span>
                            </div>
                          </div>
                        </div>

                        {item.description && (
                          <p className="font-inter text-xs leading-relaxed line-clamp-2" style={{ color: "#6B7280" }}>
                            {item.description}
                          </p>
                        )}

                        {item.tags && (
                          <div className="flex flex-wrap gap-1">
                            {item.tags.split(",").map(t => t.trim()).filter(Boolean).map(tag => (
                              <span key={tag} className="font-inter text-[10px] px-2 py-0.5 rounded-full"
                                style={{ background: "rgba(13,33,55,0.05)", color: "#6B7280" }}>
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2 mt-auto pt-1">
                          {href ? (
                            <a href={href} target="_blank" rel="noopener noreferrer"
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-inter font-semibold text-white"
                              style={{ background: cfg.color }}>
                              {item.file_type === "video" ? <Video size={13} /> : item.file_url ? <Download size={13} /> : <ExternalLink size={13} />}
                              {item.file_type === "video" ? "Assistir" : item.file_url ? "Baixar" : "Acessar"}
                            </a>
                          ) : (
                            <div className="flex-1 py-2 rounded-xl text-xs font-inter font-semibold text-center"
                              style={{ background: "rgba(13,33,55,0.05)", color: "#9CA3AF" }}>
                              Sem arquivo
                            </div>
                          )}
                          {canEdit && (
                            <>
                              <button onClick={() => openEdit(item)}
                                className="p-2 rounded-xl"
                                style={{ background: "rgba(13,33,55,0.06)", color: "#374151" }}>
                                <Edit2 size={13} />
                              </button>
                              <button onClick={() => handleArchive(item.id)}
                                className="p-2 rounded-xl"
                                style={{ background: "rgba(180,35,24,0.07)", color: "#B42318" }}>
                                <Archive size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "rgba(13,33,55,0.08)" }}>
              <h2 className="font-montserrat font-bold text-base" style={{ color: "#071D33" }}>
                {editItem ? "Editar Material" : "Novo Material"}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg" style={{ background: "rgba(13,33,55,0.06)" }}>
                <X size={15} style={{ color: "#374151" }} />
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <FormField label="Título *" value={form.title} onChange={v => setForm({ ...form, title: v })} placeholder="Ex: Manual de Boas-vindas" />

              <div className="grid grid-cols-2 gap-3">
                <FormSelect label="Tipo" value={form.file_type} onChange={v => setForm({ ...form, file_type: v })}
                  options={Object.entries(fileTypeConfig).map(([k, v]) => ({ value: k, label: v.label }))} />
                <FormSelect label="Diretoria" value={form.department} onChange={v => setForm({ ...form, department: v })}
                  options={Object.entries(deptConfig).map(([k, v]) => ({ value: k, label: v.label }))} />
              </div>

              <FormSelect label="Visibilidade" value={form.visibility} onChange={v => setForm({ ...form, visibility: v })}
                options={Object.entries(visibilityConfig).map(([k, v]) => ({ value: k, label: v.label }))} />

              <FormField label="Descrição" value={form.description} onChange={v => setForm({ ...form, description: v })}
                placeholder="Descreva o conteúdo do material..." multiline />

              <FormField label="Tags (separadas por vírgula)" value={form.tags} onChange={v => setForm({ ...form, tags: v })}
                placeholder="boas-vindas, onboarding, formação" />

              <FormField label="Conteúdo indexável (para busca)" value={form.content_text} onChange={v => setForm({ ...form, content_text: v })}
                placeholder="Palavras-chave extras para facilitar a busca deste arquivo..." multiline />

              <FormField label="URL externa / Link" value={form.external_url} onChange={v => setForm({ ...form, external_url: v })}
                placeholder="https://..." />

              {/* File upload */}
              <div>
                <label className="font-inter text-xs font-semibold block mb-1.5" style={{ color: "#6B7280" }}>
                  Arquivo (PDF, vídeo, etc.)
                </label>
                <input ref={fileRef} type="file" className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.mp4,.mov,.webm,.jpg,.png"
                  onChange={e => setSelectedFile(e.target.files[0] || null)} />
                {selectedFile ? (
                  <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: "rgba(31,138,91,0.06)", border: "1px solid rgba(31,138,91,0.2)" }}>
                    <FileText size={14} style={{ color: "#1F8A5B" }} />
                    <span className="font-inter text-xs flex-1 truncate">{selectedFile.name}</span>
                    <button onClick={() => setSelectedFile(null)}><X size={13} style={{ color: "#9CA3AF" }} /></button>
                  </div>
                ) : editItem?.file_url ? (
                  <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: "rgba(13,33,55,0.04)", border: "1px solid rgba(13,33,55,0.08)" }}>
                    <FileText size={14} style={{ color: "#B5862A" }} />
                    <span className="font-inter text-xs flex-1 truncate" style={{ color: "#6B7280" }}>Arquivo atual (clique para substituir)</span>
                    <button onClick={() => fileRef.current?.click()} className="text-xs font-inter font-semibold px-2 py-1 rounded-lg" style={{ background: "#0D2137", color: "white" }}>Trocar</button>
                  </div>
                ) : (
                  <button onClick={() => fileRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl font-inter text-sm"
                    style={{ background: "#F4F5F7", border: "1px dashed rgba(13,33,55,0.2)", color: "#6B7280" }}>
                    <Upload size={15} /> Clique para selecionar arquivo
                  </button>
                )}
              </div>

              {/* Featured toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setForm({ ...form, featured: !form.featured })}
                  className="w-10 h-5 rounded-full relative transition-all"
                  style={{ background: form.featured ? "#B5862A" : "rgba(13,33,55,0.12)" }}>
                  <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                    style={{ left: form.featured ? "22px" : "2px" }} />
                </div>
                <span className="font-inter text-sm font-semibold" style={{ color: "#374151" }}>Destacar material</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-xl font-inter text-sm font-semibold"
                  style={{ background: "rgba(13,33,55,0.06)", color: "#374151" }}>
                  Cancelar
                </button>
                <button onClick={handleSave} disabled={saving || !form.title}
                  className="flex-1 py-2.5 rounded-xl font-inter text-sm font-semibold text-white"
                  style={{ background: saving || !form.title ? "#9CA3AF" : "#0D2137" }}>
                  {uploading ? "Enviando arquivo..." : saving ? "Salvando..." : editItem ? "Salvar alterações" : "Adicionar material"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({ label, value, onChange, placeholder, multiline }) {
  const cls = "w-full px-3 py-2.5 rounded-xl text-sm font-inter outline-none";
  const style = { background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.1)", color: "#374151" };
  return (
    <div>
      <label className="font-inter text-xs font-semibold block mb-1.5" style={{ color: "#6B7280" }}>{label}</label>
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} className={cls + " resize-none"} style={style} />
        : <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} style={style} />}
    </div>
  );
}

function FormSelect({ label, value, onChange, options }) {
  return (
    <div>
      <label className="font-inter text-xs font-semibold block mb-1.5" style={{ color: "#6B7280" }}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl text-sm font-inter outline-none"
        style={{ background: "#F4F5F7", border: "1px solid rgba(13,33,55,0.1)", color: "#374151" }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}