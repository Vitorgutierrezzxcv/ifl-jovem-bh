import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { query, department } = await req.json();
    if (!query || query.trim().length < 2) {
      return Response.json({ results: [] });
    }

    // Get member role to determine visibility
    const members = await base44.entities.Member.filter({ email: user.email });
    const member = members[0] || null;
    const memberRole = member?.role || "associado";
    const memberDept = member?.department_name || "";

    const isHighRole = user.role === "admin" || ["presidente", "vice_presidente", "diretor"].includes(memberRole);
    const isDirectoria = isHighRole || memberRole === "gerente";

    // Fetch all active items
    const allItems = await base44.entities.Library.filter({ status: "ativo" });

    const q = query.toLowerCase().trim();
    const words = q.split(/\s+/);

    const results = allItems.filter(item => {
      // Visibility filter
      if (item.visibility === "presidencia" && !["presidente", "vice_presidente"].includes(memberRole) && user.role !== "admin") return false;
      if (item.visibility === "diretoria" && !isDirectoria) return false;

      // Department filter: associados and gerentes only see their own dept or "geral"
      if (!isHighRole) {
        const normalizedDept = item.department?.toLowerCase().replace(/_/g, " ");
        const normalizedMemberDept = memberDept?.toLowerCase();
        if (item.department !== "geral" && !normalizedMemberDept.includes(normalizedDept) && !normalizedDept.includes(normalizedMemberDept)) {
          return false;
        }
      }

      // Department query filter
      if (department && department !== "todos" && item.department !== department) return false;

      // Text search across fields
      const searchable = [
        item.title || "",
        item.description || "",
        item.tags || "",
        item.content_text || "",
      ].join(" ").toLowerCase();

      return words.every(w => searchable.includes(w));
    });

    // Score by relevance (title matches score higher)
    const scored = results.map(item => {
      const titleMatch = words.filter(w => (item.title || "").toLowerCase().includes(w)).length;
      const descMatch = words.filter(w => (item.description || "").toLowerCase().includes(w)).length;
      const score = titleMatch * 3 + descMatch * 2;
      return { ...item, _score: score };
    }).sort((a, b) => b._score - a._score);

    return Response.json({ results: scored.slice(0, 30) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});