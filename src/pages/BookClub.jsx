import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { BookOpen, Calendar, MapPin, Users, ChevronRight, Star } from "lucide-react";
import MobileHeader from "../components/layout/MobileHeader";

export default function BookClub() {
  const [books, setBooks] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.BookClub.list("-year,-month", 30)
      .then(b => setBooks(b))
      .catch(e => { console.error(e); setBooks([]); })
      .finally(() => setLoading(false));
  }, []);

  if (selected) {
    return (
      <div className="min-h-screen" style={{ background: "#F0F0F4", paddingBottom: "calc(env(safe-area-inset-bottom) + 96px)" }}>
        <div style={{ background: "#0D2137" }}><MobileHeader title="Clube do Livro" dark showBack /></div>
        <div className="px-4 pt-4 flex flex-col gap-4">
          <div className="rounded-2xl p-5" style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.08)" }}>
            <div className="w-16 h-20 rounded-xl mb-4 flex items-center justify-center" style={{ background: "rgba(181,134,42,0.1)" }}>
              <BookOpen size={28} style={{ color: "#B5862A" }} />
            </div>
            <h2 className="font-montserrat font-bold text-xl" style={{ color: "#111827" }}>{selected.title}</h2>
            <p className="font-inter text-sm mt-1" style={{ color: "#6B7280" }}>{selected.author}</p>
          </div>
          <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.08)" }}>
            {selected.session_date && (
              <div className="flex items-center gap-3">
                <Calendar size={15} style={{ color: "#B5862A" }} />
                <span className="font-inter text-sm" style={{ color: "#374151" }}>
                  {new Date(selected.session_date + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
                  {selected.session_time && ` · ${selected.session_time}`}
                </span>
              </div>
            )}
            {selected.location && <div className="flex items-center gap-3"><MapPin size={15} style={{ color: "#B5862A" }} /><span className="font-inter text-sm" style={{ color: "#374151" }}>{selected.location}</span></div>}
            {selected.guest && <div className="flex items-center gap-3"><Users size={15} style={{ color: "#B5862A" }} /><span className="font-inter text-sm" style={{ color: "#374151" }}>Convidado: {selected.guest}</span></div>}
            {selected.moderator && <div className="flex items-center gap-3"><Users size={15} style={{ color: "#B5862A" }} /><span className="font-inter text-sm" style={{ color: "#374151" }}>Moderador: {selected.moderator}</span></div>}
          </div>
          <div className="rounded-2xl p-5" style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.08)" }}>
            <p className="font-montserrat font-bold text-sm mb-3" style={{ color: "#111827" }}>Pontuação</p>
            {[
              { label: "Ouvinte (presença)", pts: selected.points_listener },
              { label: "Leu o livro", pts: selected.points_read },
              { label: "Participação ativa", pts: selected.points_active },
            ].map(p => (
              <div key={p.label} className="flex items-center justify-between py-2 border-b" style={{ borderColor: "rgba(13,33,55,0.06)" }}>
                <span className="font-inter text-sm" style={{ color: "#374151" }}>{p.label}</span>
                <span className="font-montserrat font-bold text-sm" style={{ color: "#B5862A" }}>+{p.pts || 0} pts</span>
              </div>
            ))}
          </div>
          {selected.description && (
            <div className="rounded-2xl p-5" style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.08)" }}>
              <p className="font-montserrat font-bold text-sm mb-2" style={{ color: "#111827" }}>Sobre</p>
              <p className="font-inter text-sm leading-relaxed" style={{ color: "#6B7280" }}>{selected.description}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#F0F0F4", paddingBottom: "calc(env(safe-area-inset-bottom) + 96px)" }}>
      <MobileHeader title="Clube do Livro" dark />
      <div className="px-4 pt-4 flex flex-col gap-3">
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-7 h-7 border-4 border-gray-200 border-t-ifl-navy rounded-full animate-spin" /></div>
        ) : books.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <BookOpen size={40} style={{ color: "#D1D5DB" }} />
            <p className="font-inter text-sm" style={{ color: "#9CA3AF" }}>Nenhum livro cadastrado</p>
          </div>
        ) : books.map(book => (
          <button key={book.id} onClick={() => setSelected(book)}
            className="rounded-2xl p-4 flex items-center gap-4 card-hover text-left w-full"
            style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.06)", boxShadow: "0 2px 8px rgba(13,33,55,0.04)" }}>
            <div className="w-12 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(181,134,42,0.1)" }}>
              <BookOpen size={20} style={{ color: "#B5862A" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-montserrat font-bold text-sm truncate" style={{ color: "#111827" }}>{book.title}</p>
              <p className="font-inter text-xs mt-0.5 truncate" style={{ color: "#6B7280" }}>{book.author}</p>
              <p className="font-inter text-xs mt-1" style={{ color: "#9CA3AF" }}>
                {book.month}/{book.year}{book.session_date ? ` · ${new Date(book.session_date + "T12:00:00").toLocaleDateString("pt-BR")}` : ""}
              </p>
            </div>
            <ChevronRight size={16} style={{ color: "#B5862A", flexShrink: 0 }} />
          </button>
        ))}
      </div>
    </div>
  );
}