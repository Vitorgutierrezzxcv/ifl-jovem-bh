import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Library, Check, XCircle, Clock, FileText } from "lucide-react";

const statusStyle = {
  pendente: { label: "Em análise", bg: "rgba(217,154,34,0.1)", color: "#D99A22", icon: Clock },
  aprovado: { label: "Aprovado", bg: "rgba(31,138,91,0.1)", color: "#1F8A5B", icon: Check },
  recusado: { label: "Recusado", bg: "rgba(180,35,24,0.1)", color: "#B42318", icon: XCircle },
};

export default function AdminRolArticles() {
  const [articles, setArticles] = useState([]);
  const [filter, setFilter] = useState("pendente");
  const [feedback, setFeedback] = useState({});

  useEffect(() => { load(); }, []);

  async function load() {
    const arts = await base44.entities.RolArticle.list("-created_date", 200);
    setArticles(arts);
  }

  async function decide(article, status) {
    await base44.entities.RolArticle.update(article.id, { status, feedback: feedback[article.id] ?? article.feedback });
    load();
  }

  const filtered = filter === "todos" ? articles : articles.filter(a => (a.status || "pendente") === filter);

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(181,134,42,0.1)" }}>
          <Library size={18} style={{ color: "#B5862A" }} />
        </div>
        <h1 className="font-montserrat font-black text-2xl text-foreground">Artigos do ROL Literário</h1>
      </div>

      <div className="flex gap-2 mb-5">
        {["pendente", "aprovado", "recusado", "todos"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-4 py-1.5 rounded-full font-inter text-xs font-semibold"
            style={{ background: filter === f ? "#0D2137" : "hsl(var(--card))", color: filter === f ? "#FFF" : "#6B7280", border: filter === f ? "none" : "1px solid rgba(13,33,55,0.1)" }}>
            {f === "todos" ? "Todos" : statusStyle[f].label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <p className="font-inter text-sm" style={{ color: "#9CA3AF" }}>Nenhum artigo aqui.</p>
        ) : filtered.map(a => {
          const status = a.status || "pendente";
          const s = statusStyle[status];
          return (
            <div key={a.id} className="rounded-2xl p-4 flex flex-col gap-2" style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.08)" }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-montserrat font-bold text-sm text-foreground">{a.member_name}</p>
                  <p className="font-inter text-xs mt-0.5" style={{ color: "#6B7280" }}>Livro: {a.book_title}</p>
                </div>
                <span className="flex items-center gap-1 px-2 py-1 rounded-lg font-inter text-[11px] font-semibold flex-shrink-0" style={{ background: s.bg, color: s.color }}>
                  <s.icon size={12} /> {s.label}
                </span>
              </div>
              {a.content && <p className="font-inter text-sm" style={{ color: "#374151" }}>{a.content}</p>}
              {a.file_url && (
                <a href={a.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 font-inter text-xs font-semibold" style={{ color: "#B5862A" }}>
                  <FileText size={13} /> Ver arquivo anexado
                </a>
              )}
              <textarea
                placeholder="Feedback (opcional)"
                defaultValue={a.feedback || ""}
                onChange={e => setFeedback(f => ({ ...f, [a.id]: e.target.value }))}
                rows={2}
                className="w-full rounded-xl px-3 py-2 font-inter text-xs outline-none text-foreground resize-none"
                style={{ background: "hsl(var(--background))", border: "1px solid rgba(13,33,55,0.1)" }}
              />
              <div className="flex gap-2">
                <button onClick={() => decide(a, "aprovado")}
                  className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg font-inter text-xs font-semibold"
                  style={{ background: status === "aprovado" ? "#1F8A5B" : "rgba(31,138,91,0.1)", color: status === "aprovado" ? "#FFF" : "#1F8A5B" }}>
                  <Check size={13} /> Aprovar
                </button>
                <button onClick={() => decide(a, "recusado")}
                  className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg font-inter text-xs font-semibold"
                  style={{ background: status === "recusado" ? "#B42318" : "rgba(180,35,24,0.1)", color: status === "recusado" ? "#FFF" : "#B42318" }}>
                  <XCircle size={13} /> Recusar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}