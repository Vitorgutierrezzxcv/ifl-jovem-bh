import React from "react";
import { RefreshCw } from "lucide-react";

export default function PullToRefreshIndicator({ pullDistance, refreshing, progress }) {
  const visible = pullDistance > 0 || refreshing;
  if (!visible) return null;

  return (
    <div
      className="absolute left-0 right-0 flex justify-center pointer-events-none z-30"
      style={{ top: `calc(env(safe-area-inset-top) + ${Math.max(pullDistance - 16, 8)}px)`, transition: refreshing ? "top 0.2s ease" : "none" }}
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center shadow-lg"
        style={{
          background: "#071D33",
          opacity: Math.max(progress, refreshing ? 1 : 0),
          transform: `scale(${0.6 + progress * 0.4})`,
          transition: refreshing ? "all 0.2s ease" : "none",
        }}
      >
        <RefreshCw
          size={16}
          style={{
            color: "#D4A043",
            transform: `rotate(${progress * 360}deg)`,
            transition: refreshing ? "none" : "transform 0.05s linear",
            animation: refreshing ? "spin 0.8s linear infinite" : "none",
          }}
        />
      </div>
    </div>
  );
}