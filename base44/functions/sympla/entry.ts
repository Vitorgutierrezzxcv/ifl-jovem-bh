import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SYMPLA_BASE = "https://api.sympla.com.br/public/v1.5.1";

async function symplaFetch(path, token) {
  const res = await fetch(`${SYMPLA_BASE}${path}`, {
    headers: { "s_token": token }
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || `Sympla API error: ${res.status}`);
  return json;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const token = Deno.env.get("SYMPLA_TOKEN");
    if (!token) return Response.json({ error: "SYMPLA_TOKEN não configurado" }, { status: 500 });

    const body = await req.json();
    const { action, event_id, page_size = 200 } = body;

    // List events from Sympla
    if (action === "list_events") {
      const data = await symplaFetch(`/events?page_size=100&sort=DESC&field_sort=start_date`, token);
      return Response.json({ events: data.data || [] });
    }

    // List participants for an event
    if (action === "list_participants") {
      if (!event_id) return Response.json({ error: "event_id obrigatório" }, { status: 400 });
      const data = await symplaFetch(`/events/${event_id}/participants?page_size=${page_size}`, token);
      return Response.json({ participants: data.data || [], total: data.pagination?.quantity || 0 });
    }

    // Import attendance: match participants by email to members, create Attendance records
    if (action === "import_attendance") {
      if (!event_id) return Response.json({ error: "event_id obrigatório" }, { status: 400 });
      const { internal_event_id, event_name } = body;

      // Fetch all participants from Sympla
      const data = await symplaFetch(`/events/${event_id}/participants?page_size=200`, token);
      const participants = data.data || [];

      // Fetch members to match by email
      const members = await base44.asServiceRole.entities.Member.list();
      const memberByEmail = {};
      members.forEach(m => { if (m.email) memberByEmail[m.email.toLowerCase()] = m; });

      let matched = 0, unmatched = 0;
      const results = [];

      for (const p of participants) {
        const email = (p.email || "").toLowerCase();
        const member = memberByEmail[email];

        if (!member) {
          unmatched++;
          results.push({ name: `${p.first_name} ${p.last_name}`, email, status: "não encontrado" });
          continue;
        }

        // Check if attendance already exists
        const existing = await base44.asServiceRole.entities.Attendance.filter({
          event_id: internal_event_id,
          member_id: member.id
        });

        if (existing.length === 0) {
          await base44.asServiceRole.entities.Attendance.create({
            event_id: internal_event_id,
            event_name: event_name || "Importado via Sympla",
            member_id: member.id,
            member_name: member.full_name,
            status: "presente",
            method: "importacao",
            recorded_by: user.email,
            notes: `Importado do Sympla (ticket: ${p.ticket_num_qr_code || p.id})`
          });
          matched++;
          results.push({ name: member.full_name, email, status: "importado" });
        } else {
          // Update existing to presente if not already
          if (existing[0].status !== "presente") {
            await base44.asServiceRole.entities.Attendance.update(existing[0].id, { status: "presente", method: "importacao" });
          }
          matched++;
          results.push({ name: member.full_name, email, status: "já existia" });
        }
      }

      return Response.json({ matched, unmatched, total: participants.length, results });
    }

    return Response.json({ error: "action inválida" }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});