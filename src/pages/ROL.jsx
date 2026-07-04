import React, { useState, useEffect } from "react";
import { BookOpen, Search, ExternalLink, Send, X, FileUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import MobileHeader from "../components/layout/MobileHeader";
import RolFeed from "../components/rol/RolFeed";

// ROL Literário completo — baseado no documento oficial IFL Jovem BH
const livros = [
  // LIBERALISMO CLÁSSICO
  { title: "Liberalismo", author: "Ludwig von Mises", tema: "Liberalismo", ciclo: "1_ciclo" },
  { title: "O Caminho da Servidão", author: "Friedrich Hayek", tema: "Liberalismo", ciclo: "1_ciclo" },
  { title: "Capitalismo e Liberdade", author: "Milton Friedman", tema: "Liberalismo", ciclo: "1_ciclo" },
  { title: "A Ética da Liberdade", author: "Murray Rothbard", tema: "Liberalismo", ciclo: "1_ciclo" },
  { title: "Fundamentos da Liberdade", author: "Friedrich Hayek", tema: "Liberalismo", ciclo: "1_ciclo" },
  { title: "A Constituição da Liberdade", author: "Friedrich Hayek", tema: "Liberalismo", ciclo: "2_ciclo" },
  { title: "Direito, Legislação e Liberdade", author: "Friedrich Hayek", tema: "Liberalismo", ciclo: "2_ciclo" },
  { title: "Sobre a Liberdade", author: "John Stuart Mill", tema: "Liberalismo", ciclo: "2_ciclo" },
  // ECONOMIA AUSTRÍACA
  { title: "A Ação Humana", author: "Ludwig von Mises", tema: "Economia Austríaca", ciclo: "2_ciclo" },
  { title: "Princípios de Economia Política", author: "Carl Menger", tema: "Economia Austríaca", ciclo: "2_ciclo" },
  { title: "A Teoria do Desenvolvimento Econômico", author: "Joseph Schumpeter", tema: "Economia Austríaca", ciclo: "3_ciclo" },
  { title: "Princípios de Economia", author: "N. Gregory Mankiw", tema: "Economia Austríaca", ciclo: "1_ciclo" },
  // FILOSOFIA POLÍTICA
  { title: "Segundo Tratado do Governo Civil", author: "John Locke", tema: "Filosofia Política", ciclo: "3_ciclo" },
  { title: "O Espírito das Leis", author: "Montesquieu", tema: "Filosofia Política", ciclo: "3_ciclo" },
  { title: "O Contrato Social", author: "Jean-Jacques Rousseau", tema: "Filosofia Política", ciclo: "3_ciclo" },
  { title: "Os Federalistas", author: "Hamilton, Madison, Jay", tema: "Filosofia Política", ciclo: "3_ciclo" },
  { title: "A República", author: "Platão", tema: "Filosofia Política", ciclo: "2_ciclo" },
  // FILOSOFIA GERAL
  { title: "Utilitarismo", author: "John Stuart Mill", tema: "Filosofia", ciclo: "2_ciclo" },
  { title: "Ética a Nicômaco", author: "Aristóteles", tema: "Filosofia", ciclo: "2_ciclo" },
  { title: "A Teoria dos Sentimentos Morais", author: "Adam Smith", tema: "Filosofia", ciclo: "3_ciclo" },
  { title: "Crítica da Razão Pura", author: "Immanuel Kant", tema: "Filosofia", ciclo: "3_ciclo" },
  // CRÍTICA AO SOCIALISMO / ANTILIBERALISMO
  { title: "O Socialismo", author: "Ludwig von Mises", tema: "Crítica ao Socialismo", ciclo: "1_ciclo" },
  { title: "A Mentalidade Anticapitalista", author: "Ludwig von Mises", tema: "Crítica ao Socialismo", ciclo: "1_ciclo" },
  { title: "O Manifesto Comunista", author: "Karl Marx & Friedrich Engels", tema: "Crítica ao Socialismo", ciclo: "2_ciclo" },
  { title: "Arquipélago Gulag", author: "Aleksandr Solzhenitsyn", tema: "Crítica ao Socialismo", ciclo: "3_ciclo" },
  // HISTÓRIA E CIVILIZAÇÃO
  { title: "A Riqueza das Nações", author: "Adam Smith", tema: "História e Civilização", ciclo: "3_ciclo" },
  { title: "O Ocidente Globalizado", author: "Niall Ferguson", tema: "História e Civilização", ciclo: "2_ciclo" },
  { title: "Sapiens", author: "Yuval Noah Harari", tema: "História e Civilização", ciclo: "1_ciclo" },
  // EMPREENDEDORISMO E LIDERANÇA
  { title: "De Zero a Um", author: "Peter Thiel", tema: "Negócios e Liderança", ciclo: "1_ciclo" },
  { title: "A Startup Enxuta", author: "Eric Ries", tema: "Negócios e Liderança", ciclo: "1_ciclo" },
  { title: "O Gerente de Alta Performance", author: "Andrew Grove", tema: "Negócios e Liderança", ciclo: "2_ciclo" },
  { title: "Princípios", author: "Ray Dalio", tema: "Negócios e Liderança", ciclo: "2_ciclo" },
];

const temaColors = {
  "Liberalismo": { bg: "rgba(181,134,42,0.12)", color: "#B5862A" },
  "Economia Austríaca": { bg: "rgba(13,33,55,0.08)", color: "#0D2137" },
  "Filosofia Política": { bg: "rgba(107,114,128,0.1)", color: "#6B7280" },
  "Filosofia": { bg: "rgba(31,138,91,0.08)", color: "#1F8A5B" },
  "Crítica ao Socialismo": { bg: "rgba(180,35,24,0.08)", color: "#B42318" },
  "História e Civilização": { bg: "rgba(217,154,34,0.1)", color: "#D99A22" },
  "Negócios e Liderança": { bg: "rgba(181,134,42,0.08)", color: "#9A6E1F" },
};

const cicloLabels = { "1_ciclo": "1º Ciclo", "2_ciclo": "2º Ciclo", "3_ciclo": "3º Ciclo", "todos": "Todos os Ciclos" };
const temas = ["Todos", ...Array.from(new Set(livros.map(l => l.tema)))];

const statusLabels = { pendente: { label: "Em análise", color: "#D99A22" }, aprovado: { label: "Aprovado", color: "#1F8A5B" }, recusado: { label: "Recusado", color: "#B42318" } };

export default function ROL() {
  const [search, setSearch] = useState("");
  const [activeCiclo, setActiveCiclo] = useState("todos");
  const [activeTema, setActiveTema] = useState("Todos");
  const [showForm, setShowForm] = useState(false);
  const [member, setMember] = useState(null);
  const [myArticles, setMyArticles] = useState([]);
  const [form, setForm] = useState({ book_title: "", content: "" });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    base44.auth.me().then(async u => {
      const members = await base44.entities.Member.filter({ email: u.email });
      const m = members[0];
      if (m) {
        setMember(m);
        const arts = await base44.entities.RolArticle.filter({ member_id: m.id }, "-created_date", 50).catch(() => []);
        setMyArticles(arts);
      }
    }).catch(() => {});
  }, []);

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, file_url }));
    setUploading(false);
  }

  async function handleSubmitArticle(e) {
    e.preventDefault();
    if (!member || !form.book_title) return;
    setSubmitting(true);
    const article = await base44.entities.RolArticle.create({
      member_id: member.id, member_name: member.full_name,
      book_title: form.book_title, content: form.content, file_url: form.file_url,
    });
    setMyArticles(prev => [article, ...prev]);
    setForm({ book_title: "", content: "" });
    setSubmitting(false);
    setShowForm(false);
  }

  const filtered = livros.filter(b => {
    const matchSearch = b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase());
    const matchCiclo = activeCiclo === "todos" || b.ciclo === activeCiclo;
    const matchTema = activeTema === "Todos" || b.tema === activeTema;
    return matchSearch && matchCiclo && matchTema;
  });

  return (
    <div className="min-h-screen" style={{ background: "#F0F0F4", paddingBottom: "calc(env(safe-area-inset-bottom) + 96px)" }}>
      <div style={{ background: "#0D2137" }}>
        <MobileHeader title="ROL Literário" dark />
        <div className="px-5 pb-4">
          <p className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
            {livros.length} livros · Trilha oficial IFL Jovem BH
          </p>
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* Article submission */}
        {member && (
          <div className="rounded-2xl p-4 mb-4" style={{ background: "hsl(var(--card))", border: "1px solid rgba(181,134,42,0.25)" }}>
            {!showForm ? (
              <button onClick={() => setShowForm(true)} className="w-full flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(181,134,42,0.12)" }}>
                  <Send size={16} style={{ color: "#B5862A" }} />
                </div>
                <span className="flex-1 text-left font-montserrat font-bold text-sm text-foreground">Enviar artigo baseado no ROL</span>
              </button>
            ) : (
              <form onSubmit={handleSubmitArticle} className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="font-montserrat font-bold text-sm text-foreground">Enviar Artigo</p>
                  <button type="button" onClick={() => setShowForm(false)}><X size={16} /></button>
                </div>
                <input required placeholder="Livro base do artigo" value={form.book_title} onChange={e => setForm({ ...form, book_title: e.target.value })}
                  className="w-full rounded-xl px-4 h-11 font-inter text-sm outline-none text-foreground" style={{ background: "hsl(var(--background))", border: "1px solid rgba(13,33,55,0.1)" }} />
                <textarea placeholder="Cole o texto do artigo (opcional se enviar arquivo)" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={3}
                  className="w-full rounded-xl px-4 py-3 font-inter text-sm resize-none outline-none text-foreground" style={{ background: "hsl(var(--background))", border: "1px solid rgba(13,33,55,0.1)" }} />
                <label className="flex items-center gap-2 px-4 h-11 rounded-xl font-inter text-sm cursor-pointer" style={{ background: "hsl(var(--background))", border: "1px solid rgba(13,33,55,0.1)", color: "#6B7280" }}>
                  <FileUp size={15} /> {uploading ? "Enviando..." : form.file_url ? "Arquivo anexado ✓" : "Anexar arquivo (opcional)"}
                  <input type="file" className="hidden" onChange={handleFile} />
                </label>
                <button type="submit" disabled={submitting || uploading} className="w-full rounded-2xl h-12 font-montserrat font-bold text-sm text-white" style={{ background: "#0D2137" }}>
                  {submitting ? "Enviando..." : "Enviar Artigo"}
                </button>
              </form>
            )}
            {myArticles.length > 0 && !showForm && (
              <div className="mt-3 pt-3 flex flex-col gap-2" style={{ borderTop: "1px solid rgba(13,33,55,0.06)" }}>
                {myArticles.map(a => (
                  <div key={a.id} className="flex items-center justify-between">
                    <span className="font-inter text-xs text-foreground truncate">{a.book_title}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: `${statusLabels[a.status]?.color}15`, color: statusLabels[a.status]?.color }}>
                      {statusLabels[a.status]?.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <RolFeed member={member} />

        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-3" style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.1)" }}>
          <Search size={15} style={{ color: "#9CA3AF" }} />
          <input className="flex-1 bg-transparent font-inter text-sm outline-none" placeholder="Buscar livro ou autor..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Ciclo filter */}
        <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide">
          {Object.entries(cicloLabels).map(([key, label]) => (
            <button key={key} onClick={() => setActiveCiclo(key)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full font-inter text-xs font-semibold"
              style={{ background: activeCiclo === key ? "#0D2137" : "hsl(var(--card))", color: activeCiclo === key ? "#FFF" : "#6B7280", border: activeCiclo === key ? "none" : "1px solid rgba(13,33,55,0.1)" }}>
              {label}
            </button>
          ))}
        </div>

        {/* Tema filter */}
        <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
          {temas.map(tema => (
            <button key={tema} onClick={() => setActiveTema(tema)}
              className="flex-shrink-0 px-3 py-1 rounded-full font-inter text-[11px] font-semibold"
              style={{ background: activeTema === tema ? "#B5862A" : "hsl(var(--card))", color: activeTema === tema ? "#FFF" : "#6B7280", border: activeTema === tema ? "none" : "1px solid rgba(13,33,55,0.1)" }}>
              {tema}
            </button>
          ))}
        </div>

        <p className="font-inter text-xs mb-3" style={{ color: "#9CA3AF" }}>{filtered.length} livro{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}</p>

        <div className="flex flex-col gap-3">
          {filtered.map((book, i) => {
            const tc = temaColors[book.tema] || { bg: "rgba(13,33,55,0.08)", color: "#0D2137" };
            const cicloColor = book.ciclo === "1_ciclo" ? "#0D2137" : book.ciclo === "2_ciclo" ? "#B5862A" : "#1F8A5B";
            return (
              <div key={i} className="rounded-2xl p-4 flex items-start gap-3"
                style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.06)", boxShadow: "0 2px 8px rgba(13,33,55,0.04)" }}>
                <div className="w-10 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(181,134,42,0.1)" }}>
                  <BookOpen size={16} style={{ color: "#B5862A" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-montserrat font-bold text-sm leading-tight" style={{ color: "#111827" }}>{book.title}</p>
                  <p className="font-inter text-xs mt-0.5" style={{ color: "#6B7280" }}>{book.author}</p>
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: tc.bg, color: tc.color }}>{book.tema}</span>
                    <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: `${cicloColor}12`, color: cicloColor }}>{cicloLabels[book.ciclo]}</span>
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center py-12 gap-2">
              <BookOpen size={36} style={{ color: "#D1D5DB" }} />
              <p className="font-inter text-sm" style={{ color: "#9CA3AF" }}>Nenhum livro encontrado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}