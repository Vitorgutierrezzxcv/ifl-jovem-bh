import React from "react";
import { X, Bell } from "lucide-react";

export default function NotificationsPanel({ announcements, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ background: "rgba(7,29,51,0.5)" }} onClick={onClose}>
      <div
        className="w-full max-w-sm h-full bg-white flex flex-col"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(7,29,51,0.08)" }}>
          <h2 className="font-montserrat font-bold text-base" style={{ color: "#071D33" }}>Notificações</h2>
          <button onClick={onClose} className="p-2 rounded-full" style={{ background: "rgba(7,29,51,0.06)" }}>
            <X size={18} style={{ color: "#071D33" }} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
          {announcements.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-2">
              <Bell size={36} style={{ color: "#D1D5DB" }} />
              <p className="font-inter text-sm" style={{ color: "#9CA3AF" }}>Nenhuma notificação</p>
            </div>
          ) : announcements.map(ann => (
            <div key={ann.id} className="rounded-2xl p-4" style={{ background: "#F0F0F4", border: "1px solid rgba(7,29,51,0.06)" }}>
              <div className="flex items-center gap-2 mb-0.5">
                {ann.priority === "urgente" && <span className="font-inter text-[10px] font-bold" style={{ color: "#B42318" }}>URGENTE</span>}
                {ann.priority === "importante" && <span className="font-inter text-[10px] font-bold" style={{ color: "#D99A22" }}>IMPORTANTE</span>}
                {ann.department_name && <span className="font-inter text-[10px]" style={{ color: "#9CA3AF" }}>{ann.department_name}</span>}
              </div>
              <p className="font-montserrat font-bold text-sm" style={{ color: "#111827" }}>{ann.title}</p>
              <p className="font-inter text-xs mt-0.5" style={{ color: "#6B7280" }}>{ann.content}</p>
              <p className="font-inter text-[10px] mt-1.5" style={{ color: "#9CA3AF" }}>
                {new Date(ann.created_date).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}