import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Lock, FileText, ExternalLink } from "lucide-react";
import MobileHeader from "../components/layout/MobileHeader";

const categoryLabels = {
  apresentacao_institucional: "Apresentações Institucionais",
  viagem_sp: "Viagem de São Paulo",
  iflxp: "IFL Jovem Experience",
  outro: "Outros",
};

export default function BoardArea() {
  const navigate = useNavigate();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => { checkAccess(); }, []);

  async function checkAccess() {
    try {
      const u = await base44.auth.me();
      const members = await base44.entities.Member.filter({ email: u.email });
      const m = members[0];
      const ok = u.role === "admin" || ["presidente", "vice_presidente", "diretor", "gerente"].includes(m?.role);
      if (!ok) { navigate("/perfil"); return; }
      setAllowed(true);
      const items = await base44.entities.BoardDocument.list("-created_date", 200);
      setDocs(items);
    } catch (e) { navigate("/perfil"); }
    finally { setLoading(false); }
  }

  if (!allowed) return null;

  const grouped = docs.reduce((acc, d) => {
    const cat = d.category || "outro";
    acc[cat] = acc[cat] || [];
    acc[cat].push(d);
    return acc;
  }, {});

  return (
    <div className="min-h-screen" style={{ background: "#0D2137", paddingBottom: "calc(env(safe-area-inset-bottom) + 96px)" }}>
      <div style={{ background: "#0D2137" }}>
        <MobileHeader title="Acesso da Diretoria" dark />
        <div className="px-5 pb-4 flex items-center gap-2">
          <Lock size={14} style={{ color: "#B5862A" }} />
          <p className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>Área restrita — documentos institucionais</p>
        </div>
      </div>

      <div className="px-4 pt-4">
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-7 h-7 border-4 border-gray-200 border-t-ifl-navy rounded-full animate-spin" /></div>
        ) : docs.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-2">
            <FileText size={40} style={{ color: "#D1D5DB" }} />
            <p className="font-inter text-sm" style={{ color: "#9CA3AF" }}>Nenhum documento disponível ainda</p>
          </div>
        ) : (
          Object.entries(grouped).map(([cat, items]) => (
            <div key={cat} className="mb-5">
              <h2 className="font-montserrat font-bold text-xs uppercase tracking-wider mb-2" style={{ color: "#D4A043" }}>{categoryLabels[cat] || cat}</h2>
              <div className="flex flex-col gap-2">
                {items.map(d => (
                  <a key={d.id} href={d.file_url} target="_blank" rel="noopener noreferrer"
                    className="rounded-2xl p-4 flex items-center gap-3 card-hover"
                    style={{ background: "hsl(var(--card))", border: "1px solid rgba(13,33,55,0.06)", boxShadow: "0 2px 8px rgba(13,33,55,0.04)" }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(181,134,42,0.1)" }}>
                      <FileText size={16} style={{ color: "#B5862A" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-inter text-sm font-semibold truncate text-foreground">{d.title}</p>
                      {d.description && <p className="font-inter text-xs mt-0.5 truncate" style={{ color: "#6B7280" }}>{d.description}</p>}
                    </div>
                    <ExternalLink size={14} style={{ color: "#B5862A", flexShrink: 0 }} />
                  </a>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}