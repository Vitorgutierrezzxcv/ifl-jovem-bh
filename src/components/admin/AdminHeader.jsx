import React from "react";

export default function AdminHeader({ title, subtitle, actions }) {
  return (
    <div className="flex items-center justify-between px-6 py-5 border-b bg-white"
      style={{ borderColor: "rgba(13,33,55,0.08)", paddingTop: "calc(env(safe-area-inset-top) + 20px)" }}
    >
      <div className="lg:pt-0" style={{ paddingTop: 0 }}>
        <h1 className="font-montserrat font-black text-xl" style={{ color: "#071D33" }}>{title}</h1>
        {subtitle && <p className="font-inter text-sm mt-0.5" style={{ color: "#6B7280" }}>{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}