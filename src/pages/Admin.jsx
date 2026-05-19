import React, { useState, useEffect } from "react";
import { useNavigate, Routes, Route, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminDashboard from "../components/admin/AdminDashboard";
import AdminMembers from "../components/admin/AdminMembers";
import AdminEvents from "../components/admin/AdminEvents";
import AdminTasks from "../components/admin/AdminTasks";
import AdminFinancial from "../components/admin/AdminFinancial";
import AdminPoints from "../components/admin/AdminPoints";
import AdminAnnouncements from "../components/admin/AdminAnnouncements";
import AdminOpportunities from "../components/admin/AdminOpportunities";
import AdminDemands from "../components/admin/AdminDemands";
import AdminMemberDetail from "../components/admin/AdminMemberDetail";

const ADMIN_SECTIONS = {
  dashboard: AdminDashboard,
  members: AdminMembers,
  "members/:id": AdminMemberDetail,
  events: AdminEvents,
  tasks: AdminTasks,
  financial: AdminFinancial,
  points: AdminPoints,
  announcements: AdminAnnouncements,
  opportunities: AdminOpportunities,
  demands: AdminDemands,
};

export default function Admin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [detailId, setDetailId] = useState(null);

  useEffect(() => { checkAccess(); }, []);

  async function checkAccess() {
    try {
      const u = await base44.auth.me();
      const members = await base44.entities.Member.filter({ email: u.email });
      const m = members[0];
      if (u.role !== "admin") {
        if (!m || !["presidente", "vice_presidente", "diretor", "gerente"].includes(m.role)) {
          navigate("/");
          return;
        }
      }
      setUser(u);
      setMember(m);
    } catch (e) { navigate("/"); }
    finally { setLoading(false); }
  }

  if (loading) return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: "#071D33" }}>
      <div className="w-8 h-8 border-4 border-ifl-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const isAdmin = user?.role === "admin";
  const memberRole = member?.role;

  const renderSection = () => {
    if (activeSection === "members" && detailId) {
      return <AdminMemberDetail memberId={detailId} onBack={() => { setDetailId(null); }} isAdmin={isAdmin} memberRole={memberRole} />;
    }
    const sections = {
      dashboard: <AdminDashboard onNavigate={setActiveSection} isAdmin={isAdmin} memberRole={memberRole} />,
      members: <AdminMembers onSelectMember={(id) => setDetailId(id)} isAdmin={isAdmin} memberRole={memberRole} />,
      events: <AdminEvents isAdmin={isAdmin} memberRole={memberRole} />,
      tasks: <AdminTasks isAdmin={isAdmin} memberRole={memberRole} />,
      financial: <AdminFinancial isAdmin={isAdmin} memberRole={memberRole} />,
      points: <AdminPoints isAdmin={isAdmin} memberRole={memberRole} />,
      announcements: <AdminAnnouncements isAdmin={isAdmin} memberRole={memberRole} />,
      opportunities: <AdminOpportunities isAdmin={isAdmin} memberRole={memberRole} />,
      demands: <AdminDemands isAdmin={isAdmin} memberRole={memberRole} />,
    };
    return sections[activeSection] || sections.dashboard;
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#F4F5F7" }}>
      <AdminSidebar
        active={activeSection}
        onNavigate={(s) => { setActiveSection(s); setDetailId(null); }}
        user={user}
        member={member}
        isAdmin={isAdmin}
        memberRole={memberRole}
      />
      <main className="flex-1 overflow-y-auto lg:pt-0" style={{ paddingTop: "var(--mobile-header-h, 0)" }}>
        {/* Mobile offset */}
        <div className="lg:hidden" style={{ height: "calc(env(safe-area-inset-top) + 52px)" }} />
        {renderSection()}
      </main>
    </div>
  );
}