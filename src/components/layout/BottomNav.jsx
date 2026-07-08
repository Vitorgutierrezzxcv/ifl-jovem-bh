import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, TrendingUp, Calendar, Trophy, User } from "lucide-react";

const ROOT_PATHS = ["/", "/jornada", "/agenda", "/ranking", "/perfil"];

// Sub-pages reached from "Minha Conta" (Perfil) that should keep the Perfil tab
// active in the bottom nav, so navigation context stays consistent
const PERFIL_SUB_PAGES = [
  "/financeiro", "/tarefas", "/clube-livro", "/rol", "/oportunidades",
  "/documentos", "/diretorio", "/eventos-extraordinarios", "/criterios-pontuacao",
  "/colaboracoes", "/biblioteca", "/ciclo", "/demandas", "/diretoria", "/recepcao-sombra",
];

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
    if (PERFIL_SUB_PAGES.some(p => location.pathname.startsWith(p))) return "/perfil";
    return ROOT_PATHS.find(root =>
      root === "/" ? location.pathname === "/" : location.pathname.startsWith(root)
    );
  }

  const activeTab = getActiveTab();

  // Keep tab history updated as user navigates (only for actual root tabs,
  // so visiting a non-root page like /financeiro doesn't corrupt another tab's history)
  React.useEffect(() => {
    if (activeTab) tabHistory[activeTab] = location.pathname;
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

  const AUTH_PATHS = ["/login", "/register", "/forgot-password", "/reset-password"];
  if (location.pathname.startsWith("/admin") || AUTH_PATHS.includes(location.pathname)) return null;

  return (
    <nav
      className="fixed left-1/2 z-[9999]"
      style={{
        bottom: "calc(env(safe-area-inset-bottom) + 0px)",
        transform: "translateX(-50%)",
        width: "calc(100% - 24px)",
        maxWidth: 420,
        background: "rgba(13,33,55,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRadius: 28,
        border: "1px solid rgba(184,135,42,0.18)",
        boxShadow: "0 8px 32px rgba(7,29,51,0.28), 0 2px 8px rgba(0,0,0,0.18)",
        padding: "6px 6px",
        pointerEvents: "auto",
      }}
    >
      <div className="flex items-center justify-around mx-auto" style={{ maxWidth: 480 }}>
        {navItems.map((item) => {
          const active = activeTab === item.path;
          return (
            <button
              key={item.path}
              onClick={() => handleTabPress(item.path)}
              className="flex flex-col items-center gap-0.5 transition-all duration-200 min-w-[52px] min-h-[44px] justify-center rounded-2xl"
              style={{
                padding: "6px 10px",
                background: active ? "rgba(184,135,42,0.18)" : "transparent",
              }}
            >
              <item.icon
                size={22}
                strokeWidth={active ? 2.4 : 1.7}
                style={{ color: active ? "#D4A043" : "rgba(255,255,255,0.5)" }}
              />
              <span
                className="font-inter text-[10px] font-medium"
                style={{ color: active ? "#D4A043" : "rgba(255,255,255,0.45)" }}
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