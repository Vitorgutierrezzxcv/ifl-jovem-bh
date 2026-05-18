import React from "react";

export default function IFLLogo({ size = 40, showText = false, textColor = "white" }) {
  return (
    <div className="flex items-center gap-3">
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M50 2L95 27V73L50 98L5 73V27L50 2Z"
          fill="#B8872A"
        />
        <text x="50" y="68" textAnchor="middle" fontFamily="Montserrat, sans-serif" fontWeight="900" fontSize="38" fill="white" letterSpacing="-1">
          iFL
        </text>
      </svg>
      {showText && (
        <div>
          <div className={`font-montserrat font-800 text-sm tracking-wider uppercase`} style={{ color: textColor === "white" ? "#FFFFFF" : "#071D33" }}>
            Central IFL
          </div>
          <div className={`font-inter text-xs`} style={{ color: textColor === "white" ? "rgba(255,255,255,0.6)" : "#6B7280" }}>
            Jovem BH
          </div>
        </div>
      )}
    </div>
  );
}