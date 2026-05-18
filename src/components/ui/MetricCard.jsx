import React from "react";

export default function MetricCard({ icon: Icon, label, value, sub, color = "#071D33", dark = false, onClick }) {
  return (
    <div
      className="rounded-2xl p-4 card-hover cursor-pointer flex flex-col gap-2"
      style={{
        background: dark ? "#071D33" : "var(--card)",
        border: dark ? "1px solid rgba(184,135,42,0.2)" : "1px solid rgba(7,29,51,0.06)",
        boxShadow: "0 2px 12px rgba(7,29,51,0.06)",
      }}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: dark ? "rgba(184,135,42,0.15)" : `${color}12` }}
        >
          <Icon size={18} style={{ color: dark ? "#D4A043" : color }} strokeWidth={1.8} />
        </div>
      </div>
      <div>
        <p
          className="font-montserrat font-bold text-xl leading-tight"
          style={{ color: dark ? "#FFFFFF" : "#111827" }}
        >
          {value}
        </p>
        <p
          className="font-inter text-xs font-medium mt-0.5"
          style={{ color: dark ? "rgba(255,255,255,0.55)" : "#6B7280" }}
        >
          {label}
        </p>
        {sub && (
          <p className="font-inter text-[10px] mt-0.5" style={{ color: dark ? "#D4A043" : color }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}