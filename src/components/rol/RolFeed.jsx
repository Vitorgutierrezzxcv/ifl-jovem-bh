import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Users, FileText } from "lucide-react";

export default function RolFeed() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    base44.entities.RolArticle.filter({ status: "aprovado" }, "-created_date", 50).then(setArticles).catch(() => {});
  }, []);

  if (articles.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Users size={15} style={{ color: "#B5862A" }} />
        <h2 className="font-montserrat font-bold text-sm text-foreground">Artigos da Comunidade</h2>
      </div>
      <div className="flex flex-col gap-3">
        {articles.map(a => (
          <div key={a.id} className="rounded-2xl p-4" style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.06)", boxShadow: "0 2px 8px rgba(13,33,55,0.04)" }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-montserrat font-bold text-xs text-white flex-shrink-0" style={{ background: "linear-gradient(135deg, #B8872A, #D4A043)" }}>
                {a.member_name?.charAt(0) || "?"}
              </div>
              <div className="min-w-0">
                <p className="font-inter text-sm font-semibold text-foreground truncate">{a.member_name}</p>
                <p className="font-inter text-[11px]" style={{ color: "#9CA3AF" }}>sobre "{a.book_title}"</p>
              </div>
            </div>
            {a.content && <p className="font-inter text-sm leading-relaxed" style={{ color: "#374151" }}>{a.content}</p>}
            {a.file_url && (
              <a href={a.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 font-inter text-xs font-semibold mt-2" style={{ color: "#B5862A" }}>
                <FileText size={13} /> Ver artigo completo
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}