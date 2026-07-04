import React, { useState } from "react";
import { CheckSquare, Library } from "lucide-react";
import AdminTasks from "./AdminTasks";
import AdminRolArticles from "./AdminRolArticles";

const tabs = [
  { key: "tarefas", label: "Envio de Tarefas", icon: CheckSquare },
  { key: "rol", label: "Envio de ROL", icon: Library },
];

export default function AdminTasksAndArticles({ isAdmin, memberRole }) {
  const [tab, setTab] = useState("tarefas");

  return (
    <div className="min-h-screen" style={{ background: "#F4F5F7" }}>
      <div className="flex gap-2 px-4 lg:px-6 pt-4 lg:pt-6">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-inter text-sm font-semibold"
            style={{
              background: tab === t.key ? "#071D33" : "#FFFFFF",
              color: tab === t.key ? "#FFF" : "#6B7280",
              border: tab === t.key ? "none" : "1px solid rgba(13,33,55,0.1)",
            }}>
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {tab === "tarefas" ? <AdminTasks isAdmin={isAdmin} memberRole={memberRole} /> : <AdminRolArticles isAdmin={isAdmin} memberRole={memberRole} />}
    </div>
  );
}