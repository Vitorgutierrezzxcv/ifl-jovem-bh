import React, { useState } from "react";
import { BookOpen, Search } from "lucide-react";
import MobileHeader from "../components/layout/MobileHeader";

const livros = {
  "1_ciclo": [
    { title: "A Democracia Liberal", author: "Giovanni Sartori", tema: "Liberalismo" },
    { title: "O Caminho da Servidão", author: "Friedrich Hayek", tema: "Liberalismo" },
    { title: "Fundamentos da Liberdade", author: "Friedrich Hayek", tema: "Liberalismo" },
    { title: "A Constituição da Liberdade", author: "Friedrich Hayek", tema: "Liberalismo" },
    { title: "Capitalismo e Liberdade", author: "Milton Friedman", tema: "Liberalismo" },
    { title: "A Ética da Liberdade", author: "Murray Rothbard", tema: "Liberalismo" },
    { title: "O Liberalismo", author: "Ludwig von Mises", tema: "Liberalismo" },
    { title: "Direito, Legislação e Liberdade", author: "Friedrich Hayek", tema: "Liberalismo" },
  ],
  "2_ciclo": [
    { title: "A Ação Humana", author: "Ludwig von Mises", tema: "Economia" },
    { title: "Princípios de Economia Política", author: "Carl Menger", tema: "Economia" },
    { title: "O Socialismo", author: "Ludwig von Mises", tema: "Antiliberalismo" },
    { title: "A Mentalidade Anticapitalista", author: "Ludwig von Mises", tema: "Antiliberalismo" },
    { title: "Epistemologia e Ciências Humanas", author: "Friedrich Hayek", tema: "Filosofia" },
    { title: "Utilitarismo", author: "John Stuart Mill", tema: "Filosofia" },
    { title: "Sobre a Liberdade", author: "John Stuart Mill", tema: "Filosofia" },
    { title: "O Manifesto Comunista", author: "Karl Marx", tema: "Antiliberalismo" },
  ],
  "3_ciclo": [
    { title: "Segundo Tratado do Governo Civil", author: "John Locke", tema: "Filosofia Política" },
    { title: "O Espírito das Leis", author: "Montesquieu", tema: "Filosofia Política" },
    { title: "O Contrato Social", author: "Jean-Jacques Rousseau", tema: "Filosofia Política" },
    { title: "Princípios de Ética", author: "Herbert Spencer", tema: "Filosofia" },
    { title: "As Aventuras das Ideias", author: "Alfred Whitehead", tema: "Filosofia" },
    { title: "A Riqueza das Nações", author: "Adam Smith", tema: "Economia" },
    { title: "A Teoria dos Sentimentos Morais", author: "Adam Smith", tema: "Filosofia" },
    { title: "Federalistas", author: "Hamilton, Madison, Jay", tema: "Política" },
  ],
};

const temaColors = {
  Liberalismo: { bg: "rgba(181,134,42,0.1)", color: "#B5862A" },
  Economia: { bg: "rgba(13,33,55,0.08)", color: "#0D2137" },
  Filosofia: { bg: "rgba(31,138,91,0.08)", color: "#1F8A5B" },
  "Filosofia Política": { bg: "rgba(107,114,128,0.08)", color: "#6B7280" },
  Política: { bg: "rgba(13,33,55,0.08)", color: "#0D2137" },
  Antiliberalismo: { bg: "rgba(180,35,24,0.08)", color: "#B42318" },
};

const cycleLabels = { "1_ciclo": "1º Ciclo", "2_ciclo": "2º Ciclo", "3_ciclo": "3º Ciclo" };

export default function ROL() {
  const [search, setSearch] = useState("");
  const [activeCycle, setActiveCycle] = useState("1_ciclo");

  const filtered = livros[activeCycle].filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen" style={{ background: "#F0F0F4", paddingBottom: "calc(env(safe-area-inset-bottom) + 96px)" }}>
      <MobileHeader title="ROL Literário" dark />

      <div className="px-4 pt-4">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-4" style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.1)" }}>
          <Search size={15} style={{ color: "#9CA3AF" }} />
          <input className="flex-1 bg-transparent font-inter text-sm outline-none" placeholder="Buscar livro ou autor..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
          {Object.keys(livros).map(cycle => (
            <button key={cycle} onClick={() => setActiveCycle(cycle)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full font-inter text-xs font-semibold"
              style={{ background: activeCycle === cycle ? "#0D2137" : "hsl(var(--card))", color: activeCycle === cycle ? "#FFF" : "#6B7280", border: activeCycle === cycle ? "none" : "1px solid rgba(13,33,55,0.1)" }}>
              {cycleLabels[cycle]}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {filtered.map((book, i) => {
            const tc = temaColors[book.tema] || temaColors.Filosofia;
            return (
              <div key={i} className="rounded-2xl p-4 flex items-center gap-3"
                style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.06)", boxShadow: "0 2px 8px rgba(13,33,55,0.04)" }}>
                <div className="w-10 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(181,134,42,0.1)" }}>
                  <BookOpen size={16} style={{ color: "#B5862A" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-montserrat font-bold text-sm" style={{ color: "#111827" }}>{book.title}</p>
                  <p className="font-inter text-xs mt-0.5" style={{ color: "#6B7280" }}>{book.author}</p>
                  <span className="inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: tc.bg, color: tc.color }}>{book.tema}</span>
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