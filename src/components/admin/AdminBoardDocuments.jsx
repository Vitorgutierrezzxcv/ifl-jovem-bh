import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, X, FileText, Trash2 } from "lucide-react";

const categoryLabels = { apresentacao_institucional: "Apresentações Institucionais", viagem_sp: "Viagem de São Paulo", iflxp: "IFL Jovem Experience", outro: "Outros" };

export default function AdminBoardDocuments() {
  const [docs, setDocs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: "", category: "outro", file_url: "", description: "" });

  useEffect(() => { load(); }, []);

  async function load() {
    setDocs(await base44.entities.BoardDocument.list("-created_date", 200));
  }

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, file_url }));
    setUploading(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.file_url) return;
    await base44.entities.BoardDocument.create(form);
    setForm({ title: "", category: "outro", file_url: "", description: "" });
    setShowForm(false);
    load();
  }

  async function handleDelete(id) {
    await base44.entities.BoardDocument.delete(id);
    load();
  }

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-montserrat font-black text-2xl text-foreground">Documentos da Diretoria</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-inter text-sm font-semibold text-white" style={{ background: "#0D2137" }}>
          <Plus size={15} /> Novo Documento
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="rounded-2xl p-5 mb-6 flex flex-col gap-3" style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.08)" }}>
          <div className="flex items-center justify-between">
            <p className="font-montserrat font-bold text-sm text-foreground">Novo Documento</p>
            <button type="button" onClick={() => setShowForm(false)}><X size={16} /></button>
          </div>
          <input required placeholder="Título" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full rounded-xl px-4 h-11 font-inter text-sm outline-none text-foreground" style={{ background: "hsl(var(--background))", border: "1px solid rgba(13,33,55,0.1)" }} />
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full rounded-xl px-4 h-11 font-inter text-sm outline-none text-foreground" style={{ background: "hsl(var(--background))", border: "1px solid rgba(13,33,55,0.1)" }}>
            {Object.entries(categoryLabels).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
          <input placeholder="Descrição" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full rounded-xl px-4 h-11 font-inter text-sm outline-none text-foreground" style={{ background: "hsl(var(--background))", border: "1px solid rgba(13,33,55,0.1)" }} />
          <input type="file" onChange={handleFile} className="font-inter text-sm text-foreground" />
          <button type="submit" disabled={uploading || !form.file_url} className="rounded-xl h-11 font-montserrat font-bold text-sm text-white" style={{ background: (!form.file_url || uploading) ? "rgba(13,33,55,0.2)" : "#0D2137" }}>
            {uploading ? "Enviando arquivo..." : "Salvar"}
          </button>
        </form>
      )}

      <div className="flex flex-col gap-2">
        {docs.length === 0 ? (
          <p className="font-inter text-sm" style={{ color: "#9CA3AF" }}>Nenhum documento cadastrado.</p>
        ) : docs.map(d => (
          <div key={d.id} className="rounded-2xl p-4 flex items-center gap-3" style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.06)" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(181,134,42,0.1)" }}><FileText size={16} style={{ color: "#B5862A" }} /></div>
            <div className="flex-1 min-w-0">
              <p className="font-inter text-sm font-semibold text-foreground">{d.title}</p>
              <p className="font-inter text-xs" style={{ color: "#6B7280" }}>{categoryLabels[d.category]}</p>
            </div>
            <button onClick={() => handleDelete(d.id)} className="p-2 rounded-lg flex-shrink-0" style={{ background: "rgba(180,35,24,0.08)" }}><Trash2 size={14} style={{ color: "#B42318" }} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}