import React from "react";

const statusConfig = {
  // Member status
  ativo: { label: "Ativo", bg: "rgba(31,138,91,0.12)", color: "#1F8A5B" },
  em_atencao: { label: "Atenção", bg: "rgba(217,154,34,0.12)", color: "#D99A22" },
  em_risco: { label: "Em Risco", bg: "rgba(180,35,24,0.12)", color: "#B42318" },
  suspenso: { label: "Suspenso", bg: "rgba(180,35,24,0.12)", color: "#B42318" },
  inadimplente: { label: "Inadimplente", bg: "rgba(180,35,24,0.12)", color: "#B42318" },
  desligado: { label: "Desligado", bg: "rgba(107,114,128,0.12)", color: "#6B7280" },
  fellow: { label: "Fellow", bg: "rgba(184,135,42,0.15)", color: "#B8872A" },
  honorario: { label: "Honorário", bg: "rgba(7,29,51,0.12)", color: "#071D33" },
  alumni: { label: "Alumni", bg: "rgba(107,114,128,0.12)", color: "#6B7280" },
  // Progress
  em_dia: { label: "Em Dia", bg: "rgba(31,138,91,0.12)", color: "#1F8A5B" },
  atencao: { label: "Atenção", bg: "rgba(217,154,34,0.12)", color: "#D99A22" },
  apto: { label: "Apto p/ Análise", bg: "rgba(184,135,42,0.15)", color: "#B8872A" },
  aprovado: { label: "Aprovado", bg: "rgba(31,138,91,0.12)", color: "#1F8A5B" },
  reprovado: { label: "Reprovado", bg: "rgba(180,35,24,0.12)", color: "#B42318" },
  // Financial
  pendente: { label: "Pendente", bg: "rgba(217,154,34,0.12)", color: "#D99A22" },
  vencido: { label: "Vencido", bg: "rgba(180,35,24,0.12)", color: "#B42318" },
  isento: { label: "Isento", bg: "rgba(31,138,91,0.12)", color: "#1F8A5B" },
  // Task status
  enviada: { label: "Enviada", bg: "rgba(7,29,51,0.1)", color: "#071D33" },
  em_correcao: { label: "Em Correção", bg: "rgba(217,154,34,0.12)", color: "#D99A22" },
  aprovada: { label: "Aprovada", bg: "rgba(31,138,91,0.12)", color: "#1F8A5B" },
  recusada: { label: "Recusada", bg: "rgba(180,35,24,0.12)", color: "#B42318" },
  ajuste_solicitado: { label: "Ajuste Solicitado", bg: "rgba(217,154,34,0.12)", color: "#D99A22" },
  expirada: { label: "Expirada", bg: "rgba(107,114,128,0.12)", color: "#6B7280" },
  // Attendance
  presente: { label: "Presente", bg: "rgba(31,138,91,0.12)", color: "#1F8A5B" },
  ausente: { label: "Ausente", bg: "rgba(180,35,24,0.12)", color: "#B42318" },
  ausencia_justificada: { label: "Justificada", bg: "rgba(217,154,34,0.12)", color: "#D99A22" },
  // Roles
  presidente: { label: "Presidente", bg: "rgba(7,29,51,0.15)", color: "#071D33" },
  vice_presidente: { label: "Vice-Presidente", bg: "rgba(7,29,51,0.1)", color: "#071D33" },
  diretor: { label: "Diretor", bg: "rgba(184,135,42,0.15)", color: "#B8872A" },
  gerente: { label: "Gerente", bg: "rgba(184,135,42,0.1)", color: "#9A6E1F" },
  associado: { label: "Associado", bg: "rgba(107,114,128,0.1)", color: "#6B7280" },
  // Cycles
  qualifier: { label: "Qualifier", bg: "rgba(107,114,128,0.1)", color: "#6B7280" },
  "1_ciclo": { label: "1º Ciclo", bg: "rgba(7,29,51,0.1)", color: "#071D33" },
  "2_ciclo": { label: "2º Ciclo", bg: "rgba(7,29,51,0.12)", color: "#071D33" },
  "3_ciclo": { label: "3º Ciclo", bg: "rgba(7,29,51,0.15)", color: "#071D33" },
};

export default function StatusBadge({ status, size = "sm" }) {
  const config = statusConfig[status] || { label: status, bg: "rgba(107,114,128,0.1)", color: "#6B7280" };
  const padding = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center ${padding} rounded-full font-inter font-semibold`}
      style={{ background: config.bg, color: config.color }}
    >
      {config.label}
    </span>
  );
}