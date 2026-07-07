import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { FileText, Download } from "lucide-react";
import MobileHeader from "../components/layout/MobileHeader";

const categoryLabels = {
  codigo_etica: "Código de Ética",
  estatuto: "Estatuto",
  ciclo_formacao: "Ciclo de Formação",
  termo_associado: "Termo de Associado",
  rol_literario: "ROL Literário",
  criterios_pontuacao: "Critérios de Pontuação",
  manual: "Manual",
  financeiro: "Financeiro",
  eventos: "Eventos",
  formacao: "Formação",
  comunicacao: "Comunicação",
  ata: "Ata",
  interno: "Interno",
};

export default function Documents() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const data = await base44.entities.Document.filter({ status: "ativo" }, "-created_date", 30);
      setDocs(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const grouped = {};
  docs.forEach(d => {
    if (!grouped[d.category]) grouped[d.category] = [];
    grouped[d.category].push(d);
  });

  return (
    <div className="min-h-screen bg-ifl-gray-bg" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 72px)" }}>
      <div style={{ background: "#0D2137" }}>
        <MobileHeader title="Documentos" dark />
        <div className="px-5 pb-5">
          <h1 className="font-montserrat font-black text-2xl text-white">Documentos</h1>
          <p className="font-inter text-sm mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
            Políticas, manuais e referências
          </p>
        </div>
      </div>

      <div className="px-4 mt-4">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full animate-spin" style={{ border: "3px solid #B8872A", borderTopColor: "transparent" }} />
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-2">
            <FileText size={40} style={{ color: "rgba(7,29,51,0.12)" }} />
            <p className="font-montserrat font-bold text-sm" style={{ color: "#9CA3AF" }}>Nenhum documento disponível</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {Object.entries(grouped).map(([cat, items]) => (
              <div key={cat}>
                <h3 className="font-montserrat font-bold text-xs uppercase tracking-wider mb-2" style={{ color: "#D4A043" }}>
                  {categoryLabels[cat] || cat}
                </h3>
                <div className="flex flex-col gap-1.5">
                  {items.map(d => (
                    <a key={d.id} href={d.file_url} target="_blank" rel="noopener noreferrer"
                      className="rounded-xl p-3 flex items-center gap-3 card-hover"
                      style={{ background: "#FFFFFF", border: "1px solid rgba(7,29,51,0.06)" }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(7,29,51,0.05)" }}>
                        <FileText size={14} style={{ color: "#071D33" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-inter text-sm font-semibold truncate" style={{ color: "#111827" }}>{d.title}</p>
                        {d.version && <p className="font-inter text-xs" style={{ color: "#9CA3AF" }}>v{d.version}</p>}
                      </div>
                      <Download size={14} style={{ color: "#B8872A" }} />
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}