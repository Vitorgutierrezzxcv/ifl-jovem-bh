import React from "react";

export default function AdminHeader({ title, subtitle, actions, breadcrumb }) {
  return (
    <div
      className="flex items-start justify-between px-6 py-5 bg-white sticky top-0 z-10"
      style={{ borderBottom: "1px solid rgba(13,33,55,0.08)" }}
    >
      <div>
        {breadcrumb && (
          <p className="font-inter text-xs mb-1" style={{ color: "#9CA3AF" }}>{breadcrumb}</p>
        )}
        <h1 className="font-montserrat font-black text-[22px] leading-tight" style={{ color: "#071D33" }}>
          {title}
        </h1>
        {subtitle && (
          <p className="font-inter text-sm mt-0.5" style={{ color: "#6B7280" }}>{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 ml-4 flex-shrink-0 pt-0.5">{actions}</div>
      )}
    </div>
  );
}