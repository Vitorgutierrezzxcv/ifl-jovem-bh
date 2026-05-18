import React, { useState } from "react";
import { Star, ExternalLink } from "lucide-react";
import MobileHeader from "../components/layout/MobileHeader";
import BottomNav from "../components/layout/BottomNav";

const criteria = [
  { diretoria: "Eventos", categoria: "Palestra", acao: "Presença em evento regular (palestra)", pts: "1", criterio: "Por evento" },
  { diretoria: "Eventos", categoria: "Auxílio em Palestras", acao: "Contribuir na recepção ou organização do lanche", pts: "5", criterio: "Por evento" },
  { diretoria: "Eventos", categoria: "Auxílio em Palestras", acao: 'Apresentar palestrante como "Sombra"', pts: "5", criterio: "Por apresentação" },
  { diretoria: "Eventos", categoria: "Auxílio em Palestras", acao: "Indicar palestrante para evento regular", pts: "10", criterio: "Palestrante efetivamente realizado" },
  { diretoria: "Institucional", categoria: "Eventos Extraordinários", acao: "Participar em evento extraordinário", pts: "3", criterio: "Por evento" },
  { diretoria: "Institucional", categoria: "Patrocínio", acao: "Captar patrocínio", pts: "5–30", criterio: "Conforme valor arrecadado" },
  { diretoria: "Institucional", categoria: "IFLXP / Fórum", acao: "Indicar palestrante para o IFLXP", pts: "18", criterio: "Palestrante realizado" },
  { diretoria: "Institucional", categoria: "IFLXP / Fórum", acao: "Vender ingresso de evento", pts: "2", criterio: "Por ingresso vendido" },
  { diretoria: "Institucional", categoria: "IFLXP / Fórum", acao: "Contribuir na organização do IFLXP", pts: "7", criterio: "Por participação confirmada" },
  { diretoria: "Institucional", categoria: "Eventos Externos", acao: "Atuar como voluntário no Jovens pelo Futuro", pts: "6", criterio: "Por participação confirmada" },
  { diretoria: "Gerência", categoria: "Gestão", acao: "Exercer cargo de gerente de diretoria (por semestre)", pts: "20", criterio: "Por semestre completo" },
  { diretoria: "Comunicação", categoria: "Instagram", acao: "Criar conteúdo para redes sociais", pts: "4", criterio: "Por conteúdo publicado" },
  { diretoria: "Comunicação", categoria: "Instagram", acao: "Publicar story de palestra", pts: "1", criterio: "Por story" },
  { diretoria: "Comunicação", categoria: "LinkedIn", acao: "Publicar postagem no LinkedIn sobre palestra", pts: "2", criterio: "Por publicação" },
  { diretoria: "Formação", categoria: "Eventos Ordinários", acao: "Participar ativamente em Evento Ordinário de Formação", pts: "5", criterio: "Participação com contribuição" },
  { diretoria: "Formação", categoria: "Eventos Ordinários", acao: "Participar como ouvinte em Evento Ordinário de Formação", pts: "2", criterio: "Por presença" },
  { diretoria: "Formação", categoria: "Tarefa", acao: "Entregar tarefa no prazo", pts: "2", criterio: "Por tarefa" },
  { diretoria: "Formação", categoria: "Clube do Livro", acao: "Participar como ouvinte no Clube do Livro", pts: "1", criterio: "Por encontro" },
  { diretoria: "Formação", categoria: "Clube do Livro", acao: "Realizar leitura do livro do mês", pts: "2", criterio: "Mediante confirmação" },
  { diretoria: "Formação", categoria: "Clube do Livro", acao: "Participar ativamente do debate", pts: "3", criterio: "Contribuição relevante" },
  { diretoria: "Formação", categoria: "Artigo (ROL)", acao: "Escrever artigo obrigatório", pts: "8–15", criterio: "Conforme avaliação da Diretoria de Formação" },
  { diretoria: "Formação", categoria: "Artigo (ROL)", acao: "Publicar artigo mediado pelo IFL", pts: "5", criterio: "Por publicação" },
  { diretoria: "Formação", categoria: "Conteúdo (ROL)", acao: "Produzir conteúdo sobre livro do ROL Literário", pts: "5", criterio: "Por conteúdo publicado" },
];

const dirColors = {
  "Eventos": "#071D33",
  "Institucional": "#B8872A",
  "Gerência": "#1F8A5B",
  "Comunicação": "#3B82F6",
  "Formação": "#8B5CF6",
};

export default function PointsCriteria() {
  const [filter, setFilter] = useState("Todos");
  const diretorias = ["Todos", ...Object.keys(dirColors)];

  const filtered = filter === "Todos" ? criteria : criteria.filter(c => c.diretoria === filter);

  // Group by diretoria for display
  const grouped = {};
  filtered.forEach(item => {
    if (!grouped[item.diretoria]) grouped[item.diretoria] = [];
    grouped[item.diretoria].push(item);
  });

  return (
    <div className="min-h-screen bg-ifl-gray-bg" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 96px)" }}>
      {/* Header */}
      <div className="hex-bg-dark relative overflow-hidden" style={{ background: "linear-gradient(160deg, #071D33 0%, #0A2640 100%)" }}>
        <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(184,135,42,0.14) 0%, transparent 70%)", transform: "translate(20%, -20%)" }} />
        <MobileHeader title="Critérios de Pontuação" dark />
        <div className="px-5 pb-6">
          <div className="flex items-center gap-3">
            <Star size={26} style={{ color: "#D4A043" }} />
            <div>
              <h1 className="font-montserrat font-black text-2xl text-white">Pontuação 2026</h1>
              <p className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Critérios oficiais · Sujeito a alterações</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {diretorias.map(d => (
          <button key={d} onClick={() => setFilter(d)}
            className="flex-shrink-0 px-4 py-2 rounded-2xl font-inter text-xs font-semibold transition-all"
            style={{
              background: filter === d ? "#071D33" : "hsl(var(--card))",
              color: filter === d ? "#D4A043" : "#6B7280",
              border: filter === d ? "1px solid rgba(184,135,42,0.3)" : "1px solid rgba(7,29,51,0.08)",
              height: 36,
            }}>
            {d}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="px-4 mt-4 flex flex-col gap-4">
        {Object.entries(grouped).map(([dir, items]) => (
          <div key={dir}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ background: dirColors[dir] || "#6B7280" }} />
              <h2 className="font-montserrat font-bold text-xs uppercase tracking-wider" style={{ color: dirColors[dir] || "#6B7280" }}>
                {dir}
              </h2>
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ background: "hsl(var(--card))", border: "1px solid rgba(7,29,51,0.06)" }}>
              {items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3"
                  style={{ borderBottom: i < items.length - 1 ? "1px solid rgba(7,29,51,0.05)" : "none" }}>
                  <div className="flex-1 min-w-0">
                    <p className="font-inter text-sm font-medium" style={{ color: "#111827" }}>{item.acao}</p>
                    <p className="font-inter text-xs mt-0.5" style={{ color: "#9CA3AF" }}>{item.criterio}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <span className="font-montserrat font-black text-base" style={{ color: "#1F8A5B" }}>+{item.pts}</span>
                    <p className="font-inter text-[9px]" style={{ color: "#9CA3AF" }}>pts</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Link to official sheet */}
      <div className="px-4 mt-4">
        <a
          href="https://docs.google.com/spreadsheets/d/1_sAU-z-_kUDt9CWgHDD7lHdOOQ4LZZgxt9AmA0lyn8o/edit#gid=783643453"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 w-full rounded-2xl font-montserrat font-bold text-sm"
          style={{ height: 52, background: "rgba(7,29,51,0.05)", border: "1px solid rgba(7,29,51,0.1)", color: "#071D33" }}>
          <ExternalLink size={16} />
          Ver planilha oficial do ranking
        </a>
      </div>

      <BottomNav />
    </div>
  );
}