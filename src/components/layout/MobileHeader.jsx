import React from "react";
import { Bell, ChevronLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import IFLLogo from "./IFLLogo";

const ROOT_ROUTES = ["/", "/jornada", "/agenda", "/ranking", "/perfil"];

export default function MobileHeader({ title, subtitle, dark = false, showNotification = true, showBack }) {
  const navigate = useNavigate();
  const location = useLocation();

  const shouldShowBack = showBack !== undefined
    ? showBack
    : !ROOT_ROUTES.includes(location.pathname);

  return (
    <div
      className="flex items-center justify-between px-5"
      style={{
        paddingTop: "calc(env(safe-area-inset-top) + 12px)",
        paddingBottom: "12px",
        background: dark ? "#071D33" : "transparent",
      }}
    >
      <div className="flex items-center gap-3">
        {shouldShowBack ? (
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: dark ? "rgba(255,255,255,0.1)" : "rgba(7,29,51,0.06)" }}
          >
            <ChevronLeft size={20} style={{ color: dark ? "#FFFFFF" : "#071D33" }} strokeWidth={2} />
          </button>
        ) : (
          <IFLLogo size={32} />
        )}
        {(title || subtitle) && (
          <div>
            {title && (
              <p className="font-montserrat font-bold text-sm uppercase tracking-wider" style={{ color: dark ? "#FFFFFF" : "#071D33" }}>
                {title}
              </p>
            )}
            {subtitle && (
              <p className="font-inter text-xs" style={{ color: dark ? "rgba(255,255,255,0.55)" : "#6B7280" }}>
                {subtitle}
              </p>
            )}
          </div>
        )}
      </div>
      {showNotification && (
        <button className="relative p-2 rounded-full" style={{ background: dark ? "rgba(255,255,255,0.1)" : "rgba(7,29,51,0.06)" }}>
          <Bell size={18} style={{ color: dark ? "#D4A043" : "#071D33" }} strokeWidth={1.8} />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-ifl-gold border border-white" />
        </button>
      )}
    </div>
  );
}