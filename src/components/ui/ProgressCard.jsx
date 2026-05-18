import React from "react";

export default function ProgressCard({ label, value, max, percentage, color = "#B8872A", dark = false }) {
  const pct = percentage !== undefined ? percentage : Math.round((value / max) * 100);

  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: dark ? "#071D33" : "#FFFFFF",
        border: dark ? "1px solid rgba(184,135,42,0.2)" : "1px solid rgba(7,29,51,0.06)",
        boxShadow: "0 2px 12px rgba(7,29,51,0.06)",
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="font-inter text-xs font-medium" style={{ color: dark ? "rgba(255,255,255,0.6)" : "#6B7280" }}>
          {label}
        </p>
        <p className="font-montserrat font-bold text-sm" style={{ color: dark ? "#D4A043" : color }}>
          {pct}%
        </p>
      </div>
      <div className="h-2 rounded-full" style={{ background: dark ? "rgba(255,255,255,0.1)" : "rgba(7,29,51,0.08)" }}>
        <div
          className="h-2 rounded-full transition-all duration-700"
          style={{ width: `${Math.min(pct, 100)}%`, background: color }}
        />
      </div>
      {value !== undefined && max !== undefined && (
        <p className="font-inter text-[10px] mt-1.5" style={{ color: dark ? "rgba(255,255,255,0.4)" : "#9CA3AF" }}>
          {value} de {max}
        </p>
      )}
    </div>
  );
}