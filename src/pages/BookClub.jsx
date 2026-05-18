import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { BookOpen, Calendar, Users, CheckCircle } from "lucide-react";
import MobileHeader from "../components/layout/MobileHeader";

export default function BookClub() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const data = await base44.entities.BookClub.filter({ status: ["agendado", "realizado"] }, "-session_date", 10);
      setBooks(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const months = ["", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  return (
    <div className="min-h-screen bg-ifl-gray-bg" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 72px)" }}>
      <div style={{ background: "#071D33" }}>
        <MobileHeader title="Clube do Livro" dark />
        <div className="px-5 pb-5">
          <h1 className="font-montserrat font-black text-2xl text-white">Clube do Livro</h1>
          <p className="font-inter text-sm mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
            Leituras colaborativas e formação
          </p>
        </div>
      </div>

      <div className="px-4 mt-4">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full animate-spin" style={{ border: "3px solid #B8872A", borderTopColor: "transparent" }} />
          </div>
        ) : books.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-2">
            <BookOpen size={40} style={{ color: "rgba(7,29,51,0.12)" }} />
            <p className="font-montserrat font-bold text-sm" style={{ color: "#9CA3AF" }}>Nenhuma sessão agendada</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {books.map(b => (
              <div key={b.id} className="rounded-2xl overflow-hidden" style={{ background: "#FFFFFF", border: "1px solid rgba(7,29,51,0.06)", boxShadow: "0 2px 8px rgba(7,29,51,0.04)" }}>
                <div className="flex">
                  {b.cover_url && (
                    <img src={b.cover_url} alt={b.title} className="w-24 h-32 object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                    <div>
                      <p className="font-montserrat font-bold text-sm" style={{ color: "#111827" }}>{b.title}</p>
                      <p className="font-inter text-xs mt-0.5" style={{ color: "#6B7280" }}>por {b.author}</p>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100 mt-2">
                      <Calendar size={12} style={{ color: "#6B7280" }} />
                      <span className="font-inter text-xs" style={{ color: "#6B7280" }}>
                        {new Date(b.session_date + "T12:00:00").getDate()} de {months[parseInt(b.session_date.split("-")[1])]}
                      </span>
                      {b.status === "realizado" && (
                        <CheckCircle size={12} style={{ color: "#1F8A5B" }} />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}