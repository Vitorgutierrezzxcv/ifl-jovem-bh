import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Users, Calendar, TrendingUp, DollarSign, FileText, BarChart3, LogOut, ChevronRight } from "lucide-react";

const adminMenuItems = [
  { icon: Users, label: "Gerenciar Membros", path: "/admin/members" },
  { icon: Calendar, label: "Eventos", path: "/admin/events" },
  { icon: TrendingUp, label: "Presença", path: "/admin/attendance" },
  { icon: FileText, label: "Tarefas", path: "/admin/tasks" },
  { icon: BarChart3, label: "Pontuação", path: "/admin/points" },
  { icon: DollarSign, label: "Financeiro", path: "/admin/financial" },
];

export default function Admin() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { checkAccess(); }, []);

  async function checkAccess() {
    try {
      const u = await base44.auth.me();
      if (u.role !== "admin") {
        const members = await base44.entities.Member.filter({ email: u.email });
        const member = members[0];
        if (!member || !["presidente", "vice_presidente", "diretor", "gerente"].includes(member.role)) {
          navigate("/");
          return;
        }
      }
      setUser(u);
    } catch (e) { navigate("/"); }
    finally { setLoading(false); }
  }

  if (loading) return null;

  return (
    <div className="min-h-screen bg-ifl-gray-bg flex" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-5 hidden lg:flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg" style={{ background: "linear-gradient(135deg, #B8872A, #D4A043)" }} />
          <div>
            <p className="font-montserrat font-bold text-xs uppercase">Admin</p>
            <p className="font-inter text-xs" style={{ color: "#6B7280" }}>Painel Central</p>
          </div>
        </div>
        <nav className="flex flex-col gap-2 flex-1">
          {adminMenuItems.map(item => (
            <button key={item.path} onClick={() => navigate(item.path)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left"
              style={{ background: "rgba(7,29,51,0.04)" }}>
              <item.icon size={18} style={{ color: "#071D33" }} />
              <span className="font-inter text-sm font-medium" style={{ color: "#111827" }}>{item.label}</span>
            </button>
          ))}
        </nav>
        <button onClick={() => base44.auth.logout("/")}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-left" style={{ background: "rgba(180,35,24,0.06)" }}>
          <LogOut size={18} style={{ color: "#B42318" }} />
          <span className="font-inter text-sm font-medium" style={{ color: "#B42318" }}>Sair</span>
        </button>
      </div>

      {/* Mobile nav */}
      <div className="lg:hidden flex-1 px-4 py-6">
        <div className="mb-6">
          <h1 className="font-montserrat font-black text-2xl" style={{ color: "#071D33" }}>Painel Admin</h1>
          <p className="font-inter text-sm mt-1" style={{ color: "#6B7280" }}>Gerencie a plataforma</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {adminMenuItems.map(item => (
            <button key={item.path} onClick={() => navigate(item.path)}
              className="rounded-2xl p-4 flex flex-col items-center gap-2 card-hover min-h-[88px]"
              style={{ background: "#FFFFFF", border: "1px solid rgba(7,29,51,0.06)" }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "rgba(7,29,51,0.05)" }}>
                <item.icon size={20} style={{ color: "#071D33" }} strokeWidth={1.8} />
              </div>
              <span className="font-inter text-xs font-semibold text-center" style={{ color: "#111827" }}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Desktop dashboard */}
      <div className="hidden lg:flex-1 lg:flex lg:flex-col">
        <div className="px-8 py-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h1 className="font-montserrat font-black text-2xl" style={{ color: "#071D33" }}>Painel Administrativo</h1>
            <p className="font-inter text-sm mt-1" style={{ color: "#6B7280" }}>Gerencie todos os aspectos da plataforma</p>
          </div>
          <button onClick={() => base44.auth.logout("/")} className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: "rgba(180,35,24,0.1)" }}>
            <LogOut size={16} style={{ color: "#B42318" }} />
            <span className="font-inter text-sm font-semibold" style={{ color: "#B42318" }}>Sair</span>
          </button>
        </div>

        <div className="flex-1 p-8">
          <div className="grid grid-cols-3 gap-4 mb-8">
            <StatCard label="Total de Membros" value="24" color="#071D33" />
            <StatCard label="Eventos Este Mês" value="8" color="#B8872A" />
            <StatCard label="Pontos Distribuídos" value="1,240" color="#1F8A5B" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {adminMenuItems.slice(0, 6).map(item => (
              <button key={item.path} onClick={() => navigate(item.path)}
                className="rounded-2xl p-6 flex items-center gap-4 card-hover"
                style={{ background: "#FFFFFF", border: "1px solid rgba(7,29,51,0.06)", boxShadow: "0 2px 8px rgba(7,29,51,0.04)" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(7,29,51,0.05)" }}>
                  <item.icon size={22} style={{ color: "#071D33" }} strokeWidth={1.5} />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-montserrat font-bold text-sm" style={{ color: "#111827" }}>{item.label}</p>
                  <p className="font-inter text-xs mt-0.5" style={{ color: "#9CA3AF" }}>Acesse o módulo</p>
                </div>
                <ChevronRight size={16} style={{ color: "#D1D5DB" }} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="rounded-2xl p-6" style={{ background: "#FFFFFF", border: "1px solid rgba(7,29,51,0.06)" }}>
      <p className="font-inter text-xs" style={{ color: "#6B7280" }}>{label}</p>
      <p className="font-montserrat font-black text-3xl mt-2" style={{ color }}>{value}</p>
    </div>
  );
}