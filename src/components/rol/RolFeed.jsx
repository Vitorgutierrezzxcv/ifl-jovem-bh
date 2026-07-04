import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Users, MessageCircle, ChevronRight } from "lucide-react";
import RolArticleDetail from "./RolArticleDetail";

export default function RolFeed({ member }) {
  const [articles, setArticles] = useState([]);
  const [selected, setSelected] = useState(null);

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
          <button key={a.id} onClick={() => setSelected(a)} className="rounded-2xl p-4 text-left w-full card-hover"
            style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.06)", boxShadow: "0 2px 8px rgba(13,33,55,0.04)" }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-montserrat font-bold text-xs text-white flex-shrink-0" style={{ background: "linear-gradient(135deg, #B8872A, #D4A043)" }}>
                {a.member_name?.charAt(0) || "?"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-inter text-sm font-semibold text-foreground truncate">{a.member_name}</p>
                <p className="font-inter text-[11px]" style={{ color: "#9CA3AF" }}>sobre "{a.book_title}"</p>
              </div>
              <ChevronRight size={15} style={{ color: "#B5862A", flexShrink: 0 }} />
            </div>
            {a.content && <p className="font-inter text-sm leading-relaxed line-clamp-3" style={{ color: "#374151" }}>{a.content}</p>}
            <span className="flex items-center gap-1 mt-2 font-inter text-xs font-semibold" style={{ color: "#B5862A" }}>
              <MessageCircle size={13} /> Ler e comentar
            </span>
          </button>
        ))}
      </div>

      {selected && <RolArticleDetail article={selected} member={member} onClose={() => setSelected(null)} />}
    </div>
  );
}