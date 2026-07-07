import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ChevronRight, BookOpen, CheckCircle2, Calendar, FileText, Star, ExternalLink } from "lucide-react";
import MobileHeader from "../components/layout/MobileHeader";
import BottomNav from "../components/layout/BottomNav";
import StatusBadge from "../components/ui/StatusBadge";

const cycleInfo = {
  qualifier: {
    label: "Qualifier",
    color: "#6B7280",
    description: "Associados que ingressam no segundo semestre, ainda não fazem parte efetivamente do ciclo de formação.",
    focus: "Adaptação e conhecimento do instituto",
    books: [],
  },
  "1_ciclo": {
    label: "1º Ciclo",
    color: "#071D33",
    description: "Novos associados que ingressaram no primeiro semestre e qualifiers que entraram no ano anterior.",
    focus: "Foco em Liberalismo",
    books: [
      { month: "Março · 12/03", title: "Revolução dos Bichos", author: "George Orwell" },
      { month: "Julho · 01/07", title: "As Seis Lições", author: "Ludwig von Mises" },
    ],
    rolAxes: ["Liberalismo", "Filosofia", "Negócios e Liderança", "Política e Economia"],
    rolBooks: [
      { axis: "Liberalismo", books: ["Capitalismo e Liberdade — Milton Friedman"] },
      { axis: "Filosofia", books: ["Como Ser um Conservador — Roger Scruton", "Hereges — G. K. Chesterton", "Ortodoxia — G. K. Chesterton", "A Vida dos Estoicos — Ryan Holiday", "Discurso da Servidão Voluntária — Étienne de La Boétie"] },
      { axis: "Negócios e Liderança", books: ["O Lado Difícil das Situações Difíceis — Ben Horowitz", "Empresas Feitas para Vencer — Jim Collins", "A Meta — Eliyahu Goldratt", "Sonho Grande — Cristiane Correa", "Líderes se Servem por Último — Simon Sinek", "12 Regras para a Vida — Jordan Peterson", "O Poder do Hábito — Charles Duhigg", "Responsabilidade Extrema — Jocko Willink", "Como Fazer Amigos e Influenciar Pessoas — Dale Carnegie", "Psicologia Financeira — Morgan Housel", "Antifrágil — Nassim Taleb"] },
      { axis: "Política e Economia", books: ["Crash — Alexandre Versignassi", "Privatize Já — Rodrigo Constantino", "Economia numa Única Lição — Henry Hazlitt", "O Essencial sobre o Coletivismo — Dennys Xavier"] },
    ],
  },
  "2_ciclo": {
    label: "2º Ciclo",
    color: "#B8872A",
    description: "Associados que estavam no 1º ciclo no ano anterior e foram aprovados para progressão.",
    focus: "Foco em Liberalismo e Liderança",
    books: [
      { month: "Março · 18/03", title: "1984", author: "George Orwell" },
      { month: "Junho · 25/06", title: "O Monge e o Executivo", author: "James C. Hunter" },
    ],
    rolAxes: ["Liberalismo", "Filosofia", "Negócios e Liderança", "Política e Economia", "Antiliberalismo"],
    rolBooks: [
      { axis: "Liberalismo", books: ["O Caminho da Servidão — Friedrich Hayek", "Economia do Indivíduo — Rodrigo Constantino", "Liberalismo — Ludwig von Mises"] },
      { axis: "Filosofia", books: ["As Ideias Têm Consequências — Richard Weaver", "A Virtude do Egoísmo — Ayn Rand", "A Mentalidade Conservadora — Russell Kirk", "O Príncipe — Nicolau Maquiavel", "Os Intelectuais e a Sociedade — Thomas Sowell"] },
      { axis: "Negócios e Liderança", books: ["O Mais Importante para o Investidor — Howard Marks", "Avalie o Que Importa — John Doerr", "Time de Times — Stanley McChrystal", "Nudge — Richard Thaler", "Superprevisões — Philip Tetlock"] },
      { axis: "Política e Economia", books: ["A Lanterna na Popa — Roberto Campos", "Por Que as Nações Fracassam — Daron Acemoglu", "Cartas a um Jovem Economista — Gustavo Franco", "Origens do Totalitarismo — Hannah Arendt"] },
      { axis: "Antiliberalismo", books: ["O Mínimo Sobre Marx — Marize Schons", "Marx e Engels: O Que Não Te Contaram — Rodrigo Jungmann"] },
    ],
  },
  "3_ciclo": {
    label: "3º Ciclo",
    color: "#1F8A5B",
    description: "Associados que estavam no 2º ciclo no ano anterior e foram aprovados para progressão.",
    focus: "Foco em Liberalismo e Antiliberalismo",
    books: [
      { month: "Março · 26/03", title: "Admirável Mundo Novo", author: "Aldous Huxley" },
      { month: "Junho · 18/06", title: "O Manifesto Libertário", author: "Murray Rothbard" },
    ],
    rolAxes: ["Liberalismo", "Filosofia", "Política e Economia", "Antiliberalismo"],
    rolBooks: [
      { axis: "Liberalismo", books: ["Ação Humana — Ludwig von Mises", "A Ética da Liberdade — Murray Rothbard", "A Revolta de Atlas — Ayn Rand", "Direito, Legislação e Liberdade — F. A. Hayek", "Passaporte 2030 — Guilherme Fiuza"] },
      { axis: "Filosofia", books: ["A História Perdida do Liberalismo — Helena Rosenblatt", "Razão Prática — Immanuel Kant", "O Problema do Sofrimento — C. S. Lewis", "A Abolição do Homem — C. S. Lewis", "Meditação — Marco Aurélio"] },
      { axis: "Política e Economia", books: ["Democracia: o Deus que Falhou — Hans-Hermann Hoppe", "Arquipélago Gulag — Aleksandr Soljenítsin", "A Grande Depressão Americana — Murray Rothbard", "A Ascensão do Dinheiro — Niall Ferguson", "História da Riqueza do Brasil — Jorge Caldeira"] },
      { axis: "Antiliberalismo", books: ["Democracia e Luta de Classes — Vladímir Lênin", "O Livro Vermelho — Mao Tsé-Tung", "O Estado e a Revolução — Vladimir Lenin", "Socialismo — Ludwig von Mises"] },
    ],
  },
  fellow: {
    label: "Fellow",
    color: "#B8872A",
    description: "Associados que concluíram integralmente o ciclo de formação.",
    focus: "Conclusão do ciclo completo",
    books: [],
  },
  honorario: {
    label: "Honorário",
    color: "#071D33",
    description: "Ex-diretores e ex-presidentes do IFL Jovem BH.",
    focus: "Reconhecimento e contribuição histórica",
    books: [],
  },
};

const requirements = [
  { icon: "📊", label: "Presença em 70% das palestras ordinárias" },
  { icon: "📚", label: "3 de 5 Clubes do Livro" },
  { icon: "🏛️", label: "3 de 5 Eventos Ordinários de Formação" },
  { icon: "✅", label: "3 tarefas mensais entregues" },
  { icon: "✍️", label: "1 artigo obrigatório (ROL Literário)" },
];

const formationEvents = [
  { date: "27/04", month: "Abril", title: "Problemas Reais de BH — Case feat. Marcela Trópia" },
  { date: "18/05", month: "Maio", title: "Mesa de Debates — Estratégias de Negociação feat. IBMEC" },
  { date: "06/07", month: "Julho", title: "IFL Talk — Um dia sendo Palestrante do IFL Jovem!" },
];

export default function CycleInfo() {
  const [member, setMember] = useState(null);
  const [tab, setTab] = useState("visao");
  const [expandedAxis, setExpandedAxis] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const u = await base44.auth.me();
      const members = await base44.entities.Member.filter({ email: u.email });
      if (members[0]) setMember(members[0]);
    } catch (e) { console.error(e); }
  }

  const cycle = member?.cycle || "1_ciclo";
  const info = cycleInfo[cycle] || cycleInfo["1_ciclo"];

  return (
    <div className="min-h-screen bg-ifl-gray-bg" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 96px)" }}>
      {/* Header */}
      <div className="hex-bg-dark relative overflow-hidden" style={{ background: "#071D33" }}>
        <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(184,135,42,0.14) 0%, transparent 70%)", transform: "translate(20%, -20%)" }} />
        <MobileHeader title="Ciclo de Formação" dark />
        <div className="px-5 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-2" style={{ background: "rgba(184,135,42,0.2)" }}>
            <span className="font-montserrat font-bold text-xs" style={{ color: "#D4A043" }}>{info.label}</span>
          </div>
          <h1 className="font-montserrat font-black text-2xl text-white">{info.focus}</h1>
          <p className="font-inter text-sm mt-1 leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>{info.description}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {[
          { key: "visao", label: "Visão Geral" },
          { key: "requisitos", label: "Requisitos" },
          { key: "clube", label: "Clube do Livro" },
          { key: "rol", label: "ROL Literário" },
          { key: "formacao", label: "Eventos de Formação" },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="flex-shrink-0 px-4 py-2 rounded-2xl font-inter text-xs font-semibold transition-all"
            style={{
              background: tab === t.key ? "rgba(181,134,42,0.15)" : "rgba(255,255,255,0.06)",
              color: tab === t.key ? "#D4A043" : "rgba(255,255,255,0.6)",
              border: tab === t.key ? "1px solid rgba(181,134,42,0.3)" : "1px solid rgba(255,255,255,0.1)",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="px-4 mt-4">

        {/* Visão Geral */}
        {tab === "visao" && (
          <div className="flex flex-col gap-3">
            {/* Ciclos */}
            <h2 className="font-montserrat font-bold text-xs uppercase tracking-wider" style={{ color: "#D4A043" }}>Divisão dos Ciclos</h2>
            {Object.entries(cycleInfo).map(([key, c]) => (
              <div key={key} className="rounded-2xl p-4 flex items-start gap-3"
                style={{
                  background: key === cycle ? "#071D33" : "hsl(var(--card))",
                  border: key === cycle ? "1px solid rgba(184,135,42,0.3)" : "1px solid rgba(7,29,51,0.06)",
                }}>
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: c.color }} />
                <div>
                  <p className="font-montserrat font-bold text-sm" style={{ color: key === cycle ? "#D4A043" : "#111827" }}>
                    {c.label} {key === cycle && "← você"}
                  </p>
                  <p className="font-inter text-xs mt-0.5 leading-relaxed" style={{ color: key === cycle ? "rgba(255,255,255,0.6)" : "#6B7280" }}>
                    {c.description}
                  </p>
                </div>
              </div>
            ))}

            {/* Ranking info */}
            <div className="rounded-2xl p-4 mt-1" style={{ background: "rgba(184,135,42,0.08)", border: "1px solid rgba(184,135,42,0.2)" }}>
              <p className="font-montserrat font-bold text-sm mb-2" style={{ color: "#B8872A" }}>⭐ Sobre o Ranking</p>
              <p className="font-inter text-xs leading-relaxed" style={{ color: "#374151" }}>
                A avaliação é multifatorial. O ranking considera entregas de tarefas, participação nos eventos (formação e ordinários) e envolvimento no funcionamento do IFL. O ranking é critério relevante para seleção em eventos extraordinários e na viagem para São Paulo.
              </p>
            </div>
          </div>
        )}

        {/* Requisitos */}
        {tab === "requisitos" && (
          <div className="flex flex-col gap-3">
            <div className="rounded-2xl p-4" style={{ background: "#071D33", border: "1px solid rgba(184,135,42,0.2)" }}>
              <p className="font-montserrat font-bold text-sm text-white mb-1">Requisitos Obrigatórios</p>
              <p className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Para todos os ciclos · 2026</p>
            </div>
            {requirements.map((req, i) => (
              <div key={i} className="rounded-2xl p-4 flex items-center gap-3"
                style={{ background: "hsl(var(--card))", border: "1px solid rgba(7,29,51,0.06)" }}>
                <span className="text-xl">{req.icon}</span>
                <p className="font-inter text-sm font-medium flex-1" style={{ color: "#111827" }}>{req.label}</p>
              </div>
            ))}
            <div className="rounded-2xl p-3 mt-1" style={{ background: "rgba(217,154,34,0.08)", border: "1px solid rgba(217,154,34,0.2)" }}>
              <p className="font-inter text-xs" style={{ color: "#D99A22" }}>
                * Justificativas de falta serão analisadas pela respectiva diretoria do evento.
              </p>
            </div>
          </div>
        )}

        {/* Clube do Livro */}
        {tab === "clube" && (
          <div className="flex flex-col gap-3">
            <div className="rounded-2xl p-4" style={{ background: "#071D33" }}>
              <p className="font-montserrat font-bold text-sm text-white">Clube do Livro — {info.label}</p>
              <p className="font-inter text-xs mt-0.5" style={{ color: "#D4A043" }}>{info.focus}</p>
              <p className="font-inter text-xs mt-2" style={{ color: "rgba(255,255,255,0.5)" }}>
                Eventos exclusivos por ciclo, com diferentes dinâmicas e convidados · Quarta ou Quinta-feira
              </p>
            </div>
            {info.books?.length > 0 ? info.books.map((book, i) => (
              <div key={i} className="rounded-2xl p-4 flex items-center gap-4"
                style={{ background: "hsl(var(--card))", border: "1px solid rgba(7,29,51,0.06)" }}>
                <div className="w-12 h-16 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(184,135,42,0.1)" }}>
                  <BookOpen size={22} style={{ color: "#B8872A" }} />
                </div>
                <div>
                  <p className="font-inter text-xs font-semibold" style={{ color: "#B8872A" }}>{book.month}</p>
                  <p className="font-montserrat font-bold text-sm" style={{ color: "#111827" }}>{book.title}</p>
                  <p className="font-inter text-xs mt-0.5" style={{ color: "#6B7280" }}>{book.author}</p>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center py-10 gap-2">
                <BookOpen size={36} style={{ color: "rgba(7,29,51,0.12)" }} />
                <p className="font-inter text-sm" style={{ color: "#9CA3AF" }}>Programa do Clube do Livro em breve</p>
              </div>
            )}
            <div className="rounded-2xl p-4" style={{ background: "rgba(7,29,51,0.04)", border: "1px solid rgba(7,29,51,0.08)" }}>
              <p className="font-montserrat font-bold text-xs mb-2" style={{ color: "#071D33" }}>Pontuação do Clube do Livro</p>
              {[
                { label: "Participar como ouvinte", pts: "1 pt/encontro" },
                { label: "Realizar leitura do livro do mês", pts: "2 pts" },
                { label: "Participar ativamente do debate", pts: "3 pts" },
              ].map((p, i) => (
                <div key={i} className="flex items-center justify-between py-1">
                  <span className="font-inter text-xs" style={{ color: "#374151" }}>{p.label}</span>
                  <span className="font-montserrat font-bold text-xs" style={{ color: "#1F8A5B" }}>+{p.pts}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ROL Literário */}
        {tab === "rol" && (
          <div className="flex flex-col gap-3">
            <div className="rounded-2xl p-4" style={{ background: "#071D33" }}>
              <p className="font-montserrat font-bold text-sm text-white">ROL Literário 2026</p>
              <p className="font-inter text-xs mt-1 leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                Roadmap de leitura complementar ao Clube do Livro, organizado por eixos e ciclos. O artigo obrigatório é necessário para progressão de ciclo.
              </p>
              <a href="mailto:formacao.ifljovembh@iflbrasil.com.br"
                className="mt-2 flex items-center gap-1 font-inter text-xs font-semibold"
                style={{ color: "#D4A043" }}>
                formacao.ifljovembh@iflbrasil.com.br <ExternalLink size={11} />
              </a>
            </div>
            <div className="rounded-2xl p-3" style={{ background: "rgba(31,138,91,0.08)", border: "1px solid rgba(31,138,91,0.2)" }}>
              <p className="font-inter text-xs leading-relaxed" style={{ color: "#1F8A5B" }}>
                <strong>🏆 Oportunidade:</strong> Em julho e dezembro, dois artigos de destaque serão publicados em parceria com o Instituto Millenium.
              </p>
            </div>
            {info.rolBooks?.map((section, i) => (
              <div key={i} className="rounded-2xl overflow-hidden" style={{ background: "hsl(var(--card))", border: "1px solid rgba(7,29,51,0.06)" }}>
                <button
                  className="w-full flex items-center justify-between px-4 py-3"
                  onClick={() => setExpandedAxis(expandedAxis === section.axis ? null : section.axis)}>
                  <span className="font-montserrat font-bold text-sm" style={{ color: "#071D33" }}>{section.axis}</span>
                  <ChevronRight size={16} style={{ color: "#B8872A", transform: expandedAxis === section.axis ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
                </button>
                {expandedAxis === section.axis && (
                  <div className="px-4 pb-3 flex flex-col gap-1.5" style={{ borderTop: "1px solid rgba(7,29,51,0.06)" }}>
                    {section.books.map((book, j) => (
                      <div key={j} className="flex items-start gap-2 py-1">
                        <BookOpen size={12} style={{ color: "#B8872A", marginTop: 2, flexShrink: 0 }} />
                        <span className="font-inter text-xs" style={{ color: "#374151" }}>{book}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {(!info.rolBooks || info.rolBooks.length === 0) && (
              <div className="flex flex-col items-center py-10 gap-2">
                <BookOpen size={36} style={{ color: "rgba(7,29,51,0.12)" }} />
                <p className="font-inter text-sm" style={{ color: "#9CA3AF" }}>Lista de livros em breve</p>
              </div>
            )}
          </div>
        )}

        {/* Eventos de Formação */}
        {tab === "formacao" && (
          <div className="flex flex-col gap-3">
            <div className="rounded-2xl p-4" style={{ background: "#071D33" }}>
              <p className="font-montserrat font-bold text-sm text-white">Eventos Ordinários de Formação</p>
              <p className="font-inter text-xs mt-1" style={{ color: "rgba(255,255,255,0.55)" }}>
                Abril, Maio, Julho, Setembro e Novembro · Todos os ciclos · Segundas-feiras
              </p>
            </div>
            {formationEvents.map((ev, i) => (
              <div key={i} className="rounded-2xl p-4 flex items-center gap-4"
                style={{ background: "hsl(var(--card))", border: "1px solid rgba(7,29,51,0.06)" }}>
                <div className="w-14 flex flex-col items-center justify-center flex-shrink-0">
                  <span className="font-montserrat font-black text-xl" style={{ color: "#071D33" }}>{ev.date}</span>
                  <span className="font-inter text-[10px] uppercase font-bold" style={{ color: "#B8872A" }}>{ev.month}</span>
                </div>
                <div className="w-px self-stretch" style={{ background: "rgba(7,29,51,0.08)" }} />
                <p className="font-inter text-sm flex-1" style={{ color: "#374151" }}>{ev.title}</p>
              </div>
            ))}
            <div className="rounded-2xl p-4" style={{ background: "rgba(7,29,51,0.04)", border: "1px solid rgba(7,29,51,0.08)" }}>
              <p className="font-montserrat font-bold text-xs mb-2" style={{ color: "#071D33" }}>Pontuação</p>
              {[
                { label: "Participar ativamente", pts: "5 pts" },
                { label: "Participar como ouvinte", pts: "2 pts" },
              ].map((p, i) => (
                <div key={i} className="flex items-center justify-between py-1">
                  <span className="font-inter text-xs" style={{ color: "#374151" }}>{p.label}</span>
                  <span className="font-montserrat font-bold text-xs" style={{ color: "#1F8A5B" }}>+{p.pts}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}