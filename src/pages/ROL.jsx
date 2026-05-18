import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { FileText, ChevronRight } from "lucide-react";
import MobileHeader from "../components/layout/MobileHeader";

export default function ROL() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const data = await base44.entities.Post.filter({ pinned: false }, "-created_date", 20);
      setPosts(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-ifl-gray-bg" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 72px)" }}>
      <div style={{ background: "linear-gradient(160deg, #071D33 0%, #0A2640 100%)" }}>
        <MobileHeader title="ROL Literário" dark />
        <div className="px-5 pb-5">
          <h1 className="font-montserrat font-black text-2xl text-white">ROL Literário</h1>
          <p className="font-inter text-sm mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
            Conteúdo e contribuições dos associados
          </p>
        </div>
      </div>

      <div className="px-4 mt-4">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full animate-spin" style={{ border: "3px solid #B8872A", borderTopColor: "transparent" }} />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-2">
            <FileText size={40} style={{ color: "rgba(7,29,51,0.12)" }} />
            <p className="font-montserrat font-bold text-sm" style={{ color: "#9CA3AF" }}>Nenhum conteúdo publicado</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {posts.map(p => (
              <div key={p.id} className="rounded-2xl p-4 card-hover" style={{ background: "#FFFFFF", border: "1px solid rgba(7,29,51,0.06)", boxShadow: "0 2px 8px rgba(7,29,51,0.04)" }}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-montserrat font-bold text-sm" style={{ color: "#111827" }}>{p.title}</p>
                    <p className="font-inter text-xs mt-0.5" style={{ color: "#6B7280" }}>por {p.author_name || "Anônimo"}</p>
                  </div>
                  <ChevronRight size={16} style={{ color: "#B8872A" }} />
                </div>
                {p.image_url && (
                  <img src={p.image_url} alt={p.title} className="w-full h-32 object-cover rounded-xl mb-2" />
                )}
                <p className="font-inter text-xs line-clamp-2" style={{ color: "#6B7280" }}>{p.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}