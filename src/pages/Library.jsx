import React, { useState, useEffect, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import {
  Search, Library as LibraryIcon, FileText, Video, BookOpen,
  Link, FileSpreadsheet, Image, File, Download, ExternalLink,
  Star, X, Filter, ChevronRight,
} from "lucide-react";
import MobileHeader from "../components/layout/MobileHeader";

const deptConfig = {
  geral: { label: "Geral", color: "#071D33", bg: "rgba(7,29,51,0.08)" },
  presidencia: { label: "Presidência", color: "#B5862A", bg: "rgba(181,134,42,0.1)" },
  vice_presidencia: { label: "Vice-Presidência", color: "#0D2137", bg: "rgba(13,33,55,0.1)" },
  formacao: { label: "Formação", color: "#7C3AED", bg: "rgba(124,58,237,0.09)" },
  comunicacao: { label: "Comunicação", color: "#0EA5E9", bg: "rgba(14,165,233,0.09)" },
  projetos: { label: "Projetos", color: "#1F8A5B", bg: "rgba(31,138,91,0.09)" },
  financeiro: { label: "Financeiro", color: "#D99A22", bg: "rgba(217,154,34,0.09)" },
  pessoas: { label: "Pessoas", color: "#EC4899", bg: "rgba(236,72,153,0.09)" },
  captacao: { label: "Captação", color: "#F97316", bg: "rgba(249,115,22,0.09)" },
  eventos: { label: "Eventos", color: "#6366F1", bg: "rgba(99,102,241,0.09)" },
  marketing: { label: "Marketing", color: "#EF4444", bg: "rgba(239,68,68,0.09)" },
};

const fileTypeConfig = {
  pdf: { label: "PDF", icon: FileText, color: "#B42318" },
  video: { label: "Vídeo", icon: Video, color: "#7C3AED" },
  manual: { label: "Manual", icon: BookOpen, color: "#071D33" },
  planilha: { label: "Planilha", icon: FileSpreadsheet, color: "#1F8A5B" },
  apresentacao: { label: "Apresentação", icon: File, color: "#D99A22" },
  imagem: { label: "Imagem", icon: Image, color: "#EC4899" },
  link: { label: "Link", icon: Link, color: "#0EA5E9" },
  outro: { label: "Outro", icon: File, color: "#6B7280" },
};

export default function LibraryPage() {
  const [member, setMember] = useState(null);
  const [userRole, setUserRole] = useState("associado");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [filterDept, setFilterDept] = useState("todos");
  const [showFilters, setShowFilters] = useState(false);
  const searchTimeout = React.useRef(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const u = await base44.auth.me().catch(() => null);
      let mRole = "associado";
      let mData = null;
      if (u) {
        const members = await base44.entities.Member.filter({ email: u.email });
        mData = members[0] || null;
        mRole = mData?.role || "associado";
        if (u.role === "admin") mRole = "admin";
      }
      setMember(mData);
      setUserRole(mRole);

      // Fetch items visible to this user
      const allItems = await base44.entities.Library.filter({ status: "ativo" }, "-created_date", 200);
      const visible = allItems.filter(item => canSeeItem(item, mRole, mData, u?.role));
      setItems(visible);
    } finally {
      setLoading(false);
    }
  }

  function canSeeItem(item, role, memberData, systemRole) {
    if (systemRole === "admin" || ["presidente", "vice_presidente"].includes(role)) return true;
    if (item.visibility === "presidencia") return false;
    if (item.visibility === "diretoria" && !["diretor", "gerente"].includes(role)) return false;

    // Department restriction: non-directors only see their dept or "geral"
    const isDirector = ["diretor", "gerente"].includes(role);
    if (!isDirector && item.department !== "geral") {
      const memberDept = (memberData?.department_name || "").toLowerCase();
      const itemDept = (deptConfig[item.department]?.label || "").toLowerCase();
      if (!memberDept.includes(itemDept.split(" ").pop()) && !itemDept.includes(memberDept.split(" ").pop())) {
        return false;
      }
    }
    return true;
  }

  // Debounced search via backend function
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!search.trim() || search.length < 2) {
      setSearchResults(null);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      const res = await base44.functions.invoke("searchLibrary", {
        query: search,
        department: filterDept !== "todos" ? filterDept : undefined,
      });
      setSearchResults(res.data?.results || []);
      setSearching(false);
    }, 400);
  }, [search, filterDept]);

  const displayItems = searchResults !== null ? searchResults : items.filter(item => {
    if (filterDept !== "todos" && item.department !== filterDept) return false;
    return true;
  });

  // Group by department
  const grouped = {};
  displayItems.forEach(item => {
    const dept = item.department || "geral";
    if (!grouped[dept]) grouped[dept] = [];
    grouped[dept].push(item);
  });

  // Featured items
  const featured = items.filter(i => i.featured).slice(0, 3);

  return (
    <div className="min-h-screen" style={{ background: "#F0F0F4", paddingBottom: "calc(env(safe-area-inset-bottom) + 96px)" }}>
      <div style={{ background: "#0D2137" }}>
        <MobileHeader title="Biblioteca" dark />
        <div className="px-5 pb-4">
          <h1 className="font-montserrat font-black text-2xl text-white">Materiais</h1>
          <p className="font-inter text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>
            Vídeos, PDFs, manuais e recursos
          </p>
        </div>

        {/* Search bar */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.4)" }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por título, conteúdo, tags..."
              className="w-full pl-10 pr-10 py-3 rounded-2xl font-inter text-sm outline-none"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "white",
              }}
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2">
                <X size={15} style={{ color: "rgba(255,255,255,0.5)" }} />
              </button>
            )}
          </div>
        </div>

        {/* Dept filter pills */}
        <div className="flex gap-2 px-4 pb-4 overflow-x-auto scrollbar-hide">
          {[{ key: "todos", label: "Tudo" }, ...Object.entries(deptConfig).map(([k, v]) => ({ key: k, label: v.label }))].map(d => (
            <button key={d.key} onClick={() => setFilterDept(d.key)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full font-inter text-xs font-semibold"
              style={{
                background: filterDept === d.key ? "#B5862A" : "rgba(255,255,255,0.1)",
                color: filterDept === d.key ? "white" : "rgba(255,255,255,0.65)",
                border: filterDept === d.key ? "none" : "1px solid rgba(255,255,255,0.1)",
              }}>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-5">
        {/* Search status */}
        {search.length >= 2 && (
          <div className="flex items-center gap-2">
            {searching ? (
              <div className="w-4 h-4 border-2 border-gray-300 border-t-ifl-navy rounded-full animate-spin" />
            ) : (
              <Search size={14} style={{ color: "#9CA3AF" }} />
            )}
            <span className="font-inter text-xs" style={{ color: "#9CA3AF" }}>
              {searching ? "Buscando..." : `${displayItems.length} resultado(s) para "${search}"`}
            </span>
          </div>
        )}

        {/* Featured (only when not searching) */}
        {!search && featured.length > 0 && filterDept === "todos" && (
          <div>
            <p className="font-montserrat font-bold text-xs uppercase tracking-wider mb-2" style={{ color: "#9CA3AF" }}>
              ⭐ Em Destaque
            </p>
            <div className="flex flex-col gap-2">
              {featured.map(item => <LibraryCard key={item.id} item={item} />)}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-4 border-gray-200 border-t-ifl-navy rounded-full animate-spin" />
          </div>
        ) : displayItems.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <LibraryIcon size={40} style={{ color: "#D1D5DB" }} />
            <p className="font-inter text-sm" style={{ color: "#9CA3AF" }}>
              {search ? "Nenhum material encontrado para essa busca" : "Nenhum material disponível"}
            </p>
          </div>
        ) : (
          Object.entries(grouped).map(([dept, deptItems]) => {
            const cfg = deptConfig[dept] || deptConfig.geral;
            return (
              <div key={dept}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: cfg.color }} />
                  <p className="font-montserrat font-bold text-xs uppercase tracking-wider" style={{ color: cfg.color }}>
                    {cfg.label}
                  </p>
                  <span className="font-inter text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: cfg.bg, color: cfg.color }}>
                    {deptItems.length}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {deptItems.map(item => <LibraryCard key={item.id} item={item} searchQuery={search} />)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function LibraryCard({ item, searchQuery }) {
  const cfg = deptConfig[item.department] || deptConfig.geral;
  const ftCfg = fileTypeConfig[item.file_type] || fileTypeConfig.outro;
  const FtIcon = ftCfg.icon;
  const href = item.file_url || item.external_url;

  // Highlight search terms in description
  function highlight(text) {
    if (!searchQuery || !text) return text;
    const words = searchQuery.trim().split(/\s+/);
    let result = text;
    words.forEach(w => {
      const re = new RegExp(`(${w})`, "gi");
      result = result.replace(re, `<mark style="background:rgba(181,134,42,0.25);border-radius:2px;padding:0 1px">$1</mark>`);
    });
    return result;
  }

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: "hsl(var(--card))", border: item.featured ? `1.5px solid ${cfg.color}30` : "1px solid rgba(13,33,55,0.07)" }}>
      <div className="flex items-start gap-3 p-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: ftCfg.color + "12" }}>
          <FtIcon size={18} style={{ color: ftCfg.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 flex-wrap">
            {item.featured && <Star size={10} style={{ color: "#B5862A" }} fill="#B5862A" />}
            <p className="font-montserrat font-bold text-sm" style={{ color: "#111827" }}
              dangerouslySetInnerHTML={{ __html: highlight(item.title) }} />
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span className="font-inter text-[10px] px-1.5 py-0.5 rounded-full"
              style={{ background: ftCfg.color + "12", color: ftCfg.color }}>
              {ftCfg.label}
            </span>
            <span className="font-inter text-[10px] px-1.5 py-0.5 rounded-full"
              style={{ background: cfg.bg, color: cfg.color }}>
              {cfg.label}
            </span>
          </div>
          {item.description && (
            <p className="font-inter text-xs mt-1.5 leading-relaxed line-clamp-2" style={{ color: "#6B7280" }}
              dangerouslySetInnerHTML={{ __html: highlight(item.description) }} />
          )}
          {item.tags && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {item.tags.split(",").map(t => t.trim()).filter(Boolean).slice(0, 4).map(tag => (
                <span key={tag} className="font-inter text-[10px] px-1.5 py-0.5 rounded-full"
                  style={{ background: "rgba(13,33,55,0.05)", color: "#9CA3AF" }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {href && (
        <a href={href} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-between px-4 py-3 border-t font-inter text-xs font-semibold"
          style={{ borderColor: "rgba(13,33,55,0.06)", color: cfg.color, background: cfg.bg + "80" }}>
          <span>{item.file_type === "video" ? "Assistir vídeo" : item.file_url ? "Baixar arquivo" : "Acessar link"}</span>
          {item.file_type === "video" ? <Video size={13} /> : item.file_url ? <Download size={13} /> : <ExternalLink size={13} />}
        </a>
      )}
    </div>
  );
}