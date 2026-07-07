import React, { useState, useEffect } from "react";
import { Bell, ChevronLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import IFLLogo from "./IFLLogo";
import NotificationsPanel from "../home/NotificationsPanel";

const ROOT_ROUTES = ["/", "/jornada", "/agenda", "/ranking", "/perfil"];

export default function MobileHeader({ title, subtitle, dark = false, showNotification = true, showBack, onNotificationClick, hasUnreadNotifications }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [announcements, setAnnouncements] = useState([]);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    base44.entities.Announcement.list("-created_date", 20)
      .then(anns => setAnnouncements(anns.filter(a => a.status === "publicado")))
      .catch(() => {});
  }, []);

  const shouldShowBack = showBack !== undefined ? showBack : !ROOT_ROUTES.includes(location.pathname);
  const unread = hasUnreadNotifications !== undefined ? hasUnreadNotifications : announcements.length > 0;

  const handleBellClick = () => {
    if (onNotificationClick) onNotificationClick();
    else setShowPanel(true);
  };

  return (
    <>
      <div
        className="flex items-center justify-between px-5"
        style={{
          paddingTop: "calc(env(safe-area-inset-top) + 12px)",
          paddingBottom: "12px",
          background: dark ? "#071D33" : "#071D33",
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
          <button onClick={handleBellClick} className="relative p-2 rounded-full" style={{ background: dark ? "rgba(255,255,255,0.1)" : "rgba(7,29,51,0.06)" }}>
            <Bell size={18} style={{ color: dark ? "#D4A043" : "#071D33" }} strokeWidth={1.8} />
            {unread && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-ifl-gold border border-white" />}
          </button>
        )}
      </div>
      {showPanel && !onNotificationClick && (
        <NotificationsPanel announcements={announcements} onClose={() => setShowPanel(false)} />
      )}
    </>
  );
}