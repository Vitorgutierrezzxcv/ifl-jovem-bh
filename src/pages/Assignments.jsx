import React, { useState } from "react";
import { CheckSquare, BookOpen } from "lucide-react";
import MobileHeader from "../components/layout/MobileHeader";
import Tasks from "./Tasks";
import ROL from "./ROL";

export default function Assignments({ initialTab = "tarefas" }) {
  const [tab, setTab] = useState(initialTab);

  return (
    <div className="min-h-screen" style={{ background: "#0D2137", paddingBottom: "calc(env(safe-area-inset-bottom) + 96px)" }}>
      <div style={{ background: "#0D2137" }}>
        <MobileHeader title="Entregas" dark showNotification={false} />
        <div className="px-5 pb-3 flex gap-2">
          <button
            onClick={() => setTab("tarefas")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-inter text-sm font-semibold transition-all"
            style={{
              background: tab === "tarefas" ? "rgba(181,134,42,0.2)" : "rgba(255,255,255,0.05)",
              color: tab === "tarefas" ? "#D4A043" : "rgba(255,255,255,0.5)",
              border: tab === "tarefas" ? "1px solid rgba(181,134,42,0.3)" : "1px solid transparent",
            }}
          >
            <CheckSquare size={15} /> Tarefas
          </button>
          <button
            onClick={() => setTab("rol")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-inter text-sm font-semibold transition-all"
            style={{
              background: tab === "rol" ? "rgba(181,134,42,0.2)" : "rgba(255,255,255,0.05)",
              color: tab === "rol" ? "#D4A043" : "rgba(255,255,255,0.5)",
              border: tab === "rol" ? "1px solid rgba(181,134,42,0.3)" : "1px solid transparent",
            }}
          >
            <BookOpen size={15} /> ROL
          </button>
        </div>
      </div>
      {tab === "tarefas" ? <Tasks embedded /> : <ROL embedded />}
    </div>
  );
}