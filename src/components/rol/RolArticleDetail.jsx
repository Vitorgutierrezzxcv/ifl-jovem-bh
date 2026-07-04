import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X, FileText, Send, MessageCircle } from "lucide-react";

export default function RolArticleDetail({ article, member, onClose }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    base44.entities.RolArticleComment.filter({ article_id: article.id }, "-created_date", 100).then(setComments).catch(() => {});
  }, [article.id]);

  async function handlePost(e) {
    e.preventDefault();
    if (!text.trim() || !member) return;
    setPosting(true);
    const comment = await base44.entities.RolArticleComment.create({
      article_id: article.id, member_id: member.id, member_name: member.full_name, content: text.trim(),
    });
    setComments(prev => [comment, ...prev]);
    setText("");
    setPosting(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "#F0F0F4" }}>
      <div className="flex items-center justify-between px-5" style={{ background: "#0D2137", paddingTop: "calc(env(safe-area-inset-top) + 12px)", paddingBottom: "12px" }}>
        <p className="font-montserrat font-bold text-sm text-white">Artigo</p>
        <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.1)" }}>
          <X size={18} style={{ color: "#FFF" }} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4">
        <div className="rounded-2xl p-4" style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.06)" }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-montserrat font-bold text-sm text-white flex-shrink-0" style={{ background: "linear-gradient(135deg, #B8872A, #D4A043)" }}>
              {article.member_name?.charAt(0) || "?"}
            </div>
            <div className="min-w-0">
              <p className="font-inter text-sm font-semibold text-foreground">{article.member_name}</p>
              <p className="font-inter text-[11px]" style={{ color: "#9CA3AF" }}>sobre "{article.book_title}"</p>
            </div>
          </div>
          {article.content && <p className="font-inter text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "#374151" }}>{article.content}</p>}
          {article.file_url && (
            <a href={article.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 font-inter text-xs font-semibold mt-3" style={{ color: "#B5862A" }}>
              <FileText size={13} /> Ver arquivo anexado
            </a>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <MessageCircle size={15} style={{ color: "#B5862A" }} />
          <p className="font-montserrat font-bold text-sm text-foreground">Comentários ({comments.length})</p>
        </div>
        <div className="flex flex-col gap-2 mt-3 pb-4">
          {comments.length === 0 ? (
            <p className="font-inter text-sm" style={{ color: "#9CA3AF" }}>Seja o primeiro a comentar.</p>
          ) : comments.map(c => (
            <div key={c.id} className="rounded-xl p-3" style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.06)" }}>
              <p className="font-inter text-xs font-semibold text-foreground">{c.member_name}</p>
              <p className="font-inter text-sm mt-1" style={{ color: "#374151" }}>{c.content}</p>
            </div>
          ))}
        </div>
      </div>

      {member && (
        <form onSubmit={handlePost} className="flex items-center gap-2 px-4 py-3" style={{ background: "hsl(var(--card))", borderTop: "1px solid rgba(13,33,55,0.08)", paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}>
          <input value={text} onChange={e => setText(e.target.value)} placeholder="Escreva um comentário..."
            className="flex-1 rounded-full px-4 h-10 font-inter text-sm outline-none text-foreground" style={{ background: "hsl(var(--background))", border: "1px solid rgba(13,33,55,0.1)" }} />
          <button type="submit" disabled={posting || !text.trim()} className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#0D2137" }}>
            <Send size={15} style={{ color: "#D4A043" }} />
          </button>
        </form>
      )}
    </div>
  );
}