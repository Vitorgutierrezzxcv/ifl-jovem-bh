import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { CheckCircle2, XCircle, X } from "lucide-react";

const SEEN_KEY = "seen_status_notification_ids";

function getSeenIds() {
  try { return JSON.parse(localStorage.getItem(SEEN_KEY) || "[]"); } catch { return []; }
}

export default function StatusNotifications({ member }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!member) return;
    load();
  }, [member]);

  async function load() {
    const seen = getSeenIds();
    const [regs, tasks, articles, reception, extraEvents] = await Promise.all([
      base44.entities.ExtraordinaryRegistration.filter({ member_id: member.id }).catch(() => []),
      base44.entities.TaskSubmission.filter({ member_id: member.id }).catch(() => []),
      base44.entities.RolArticle.filter({ member_id: member.id }).catch(() => []),
      base44.entities.ReceptionSignup.filter({ member_id: member.id }).catch(() => []),
      base44.entities.ExtraordinaryEvent.list("-date", 100).catch(() => []),
    ]);

    const items = [];
    const today = new Date().toISOString().split("T")[0];

    regs.filter(r => r.status === "aprovado" || r.status === "recusado").forEach(r => {
      const approved = r.status === "aprovado";
      items.push({
        uid: `reg_${r.id}`, approved,
        title: approved ? "Você foi selecionado(a)! 🎉" : "Inscrição não selecionada",
        message: approved ? `Sua inscrição para "${r.event_title}" foi aprovada.` : `Sua inscrição para "${r.event_title}" não foi selecionada desta vez.`,
        path: `/eventos-extraordinarios?id=${r.event_id}`,
      });
    });

    // Confirmation reminders (approved, not confirmed, event within 5 days) and NPS requests (event passed)
    regs.filter(r => r.status === "aprovado").forEach(r => {
      const ev = extraEvents.find(e => e.id === r.event_id);
      if (!ev) return;
      const daysUntil = Math.ceil((new Date(ev.date) - new Date(today)) / (1000 * 60 * 60 * 24));
      const eventPassed = ev.date < today;

      if (!r.confirmed && !eventPassed && daysUntil <= 5) {
        items.push({
          uid: `confirm_${r.id}`, approved: true,
          title: "Confirme sua presença 📌",
          message: `O evento "${ev.title}" está próximo. Confirme sua presença ou sua vaga poderá ser realocada.`,
          path: `/eventos-extraordinarios?id=${r.event_id}`,
        });
      }

      if (eventPassed && ev.collect_nps && r.nps_score === undefined) {
        items.push({
          uid: `nps_${r.id}`, approved: true,
          title: "Como foi sua experiência? ⭐",
          message: `Conte pra gente o que achou do evento "${ev.title}".`,
          path: `/eventos-extraordinarios?id=${r.event_id}`,
        });
      }
    });

    tasks.filter(t => t.status === "aprovada" || t.status === "aprovada_ressalvas" || t.status === "recusada").forEach(t => {
      const approved = t.status === "aprovada" || t.status === "aprovada_ressalvas";
      items.push({
        uid: `task_${t.id}`, approved,
        title: approved ? "Tarefa aprovada! 🎉" : "Tarefa recusada",
        message: approved ? "Sua tarefa enviada foi aprovada pela diretoria." : "Sua tarefa enviada foi recusada. Confira o feedback.",
        path: "/tarefas",
      });
    });

    articles.filter(a => a.status === "aprovado" || a.status === "recusado").forEach(a => {
      const approved = a.status === "aprovado";
      items.push({
        uid: `rol_${a.id}`, approved,
        title: approved ? "Artigo aprovado! 🎉" : "Artigo não aprovado",
        message: approved ? `Seu artigo sobre "${a.book_title}" foi aprovado e já está no ROL Literário.` : `Seu artigo sobre "${a.book_title}" não foi aprovado desta vez.`,
        path: "/rol",
      });
    });

    reception.filter(r => r.status === "selecionado" || r.status === "nao_selecionado").forEach(r => {
      const approved = r.status === "selecionado";
      items.push({
        uid: `reception_${r.id}`, approved,
        title: approved ? "Você foi selecionado(a)! 🎉" : "Recepção/Sombra — não selecionado(a)",
        message: approved ? `Você foi escolhido(a) para servir em "${r.event_name || "um evento"}". Confira as instruções.` : "Você não foi selecionado(a) para Recepção/Sombra desta vez.",
        path: "/recepcao-sombra",
      });
    });

    setNotifications(items.filter(i => !seen.includes(i.uid)));
  }

  function dismiss(uid) {
    const seen = getSeenIds();
    localStorage.setItem(SEEN_KEY, JSON.stringify([...seen, uid]));
    setNotifications(prev => prev.filter(n => n.uid !== uid));
  }

  if (notifications.length === 0) return null;

  return (
    <div className="px-4 mt-4 flex flex-col gap-2">
      {notifications.map(n => (
        <div key={n.uid} onClick={() => navigate(n.path)} className="rounded-2xl p-4 flex items-start gap-3 cursor-pointer"
          style={{
            background: n.approved ? "rgba(31,138,91,0.08)" : "rgba(180,35,24,0.08)",
            border: n.approved ? "1px solid rgba(31,138,91,0.25)" : "1px solid rgba(180,35,24,0.25)",
          }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: n.approved ? "rgba(31,138,91,0.15)" : "rgba(180,35,24,0.15)" }}>
            {n.approved ? <CheckCircle2 size={18} style={{ color: "#1F8A5B" }} /> : <XCircle size={18} style={{ color: "#B42318" }} />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-montserrat font-bold text-sm" style={{ color: n.approved ? "#1F8A5B" : "#B42318" }}>{n.title}</p>
            <p className="font-inter text-xs mt-0.5" style={{ color: "#6B7280" }}>{n.message}</p>
          </div>
          <button onClick={(e) => { e.stopPropagation(); dismiss(n.uid); }} className="p-1 flex-shrink-0">
            <X size={15} style={{ color: "#9CA3AF" }} />
          </button>
        </div>
      ))}
    </div>
  );
}