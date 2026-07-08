import React from "react";
import IFLLogo from "@/components/layout/IFLLogo";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10 hex-bg-dark relative overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #0D2137 0%, #0A2640 60%, #040F1A 100%)",
        paddingTop: "calc(env(safe-area-inset-top) + 24px)",
        paddingBottom: "calc(env(safe-area-inset-bottom) + 24px)",
      }}
    >
      {/* Glowing orbs */}
      <div
        className="absolute top-[-80px] right-[-60px] w-72 h-72 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(184,135,42,0.18) 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-[-80px] left-[-80px] w-64 h-64 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(10,38,64,0.8) 0%, transparent 70%)" }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Logo + Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <IFLLogo size={80} />
          </div>
          <h1
            className="font-montserrat font-black text-2xl leading-tight"
            style={{ color: "#FFFFFF" }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="font-inter text-sm mt-2" style={{ color: "rgba(255,255,255,0.55)" }}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: "rgba(255,255,255,0.06)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(184,135,42,0.22)",
            boxShadow: "0 8px 32px rgba(7,29,51,0.28)",
          }}
        >
          {children}
        </div>

        {footer && (
          <p
            className="text-center font-inter text-sm mt-6"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            {footer}
          </p>
        )}
      </div>
    </div>
  );
}