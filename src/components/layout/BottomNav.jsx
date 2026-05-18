import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, TrendingUp, Calendar, Trophy, User } from "lucide-react";

const ROOT_PATHS = ["/", "/jornada", "/agenda", "/ranking", "/perfil"];

const navItems = [
  { path: "/", icon: Home, label: "Início" },
  { path: "/jornada", icon: TrendingUp, label: "Jornada" },
  { path: "/agenda", icon: Calendar, label: "Agenda" },
  { path: "/ranking", icon: Trophy, label: "Ranking" },
  { path: "/perfil", icon: User, label: "Perfil" },
];

// Persists last visited route per tab across re-renders (not reset on navigate)
const tabHistory = {};

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine which root tab is active based on the current path
  function getActiveTab() {
    return ROOT_PATHS.find(root =>
      root === "/" ? location.pathname === "/" : location.pathname.startsWith(root)
    ) || "/";
  }

  const activeTab = getActiveTab();

  // Keep tab history updated as user navigates
  React.useEffect(() => {
    tabHistory[activeTab] = location.pathname;
  }, [location.pathname, activeTab]);

  function handleTabPress(tabPath) {
    if (activeTab === tabPath) {
      // Re-selecting active tab → reset to root
      if (location.pathname !== tabPath) {
        navigate(tabPath);
      }
    } else {
      // Navigate to last known route for this tab, or root
      const dest = tabHistory[tabPath] || tabPath;
      navigate(dest);
    }
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100"
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
        boxShadow: "0 -4px 20px rgba(7,29,51,0.08)",
      }}
    >
      <div className="flex items-center justify-around px-2 pt-2 pb-1">
        {navItems.map((item) => {
          const active = activeTab === item.path;
          return (
            <button
              key={item.path}
              onClick={() => handleTabPress(item.path)}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all duration-200 min-w-[56px] min-h-[44px] justify-center"
              style={{
                color: active ? "#B8872A" : "#6B7280",
                background: active ? "rgba(184,135,42,0.08)" : "transparent",
              }}
            >
              <item.icon
                size={22}
                strokeWidth={active ? 2.5 : 1.8}
                style={{ color: active ? "#B8872A" : "#6B7280" }}
              />
              <span
                className="font-inter text-[10px] font-medium"
                style={{ color: active ? "#B8872A" : "#6B7280" }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}