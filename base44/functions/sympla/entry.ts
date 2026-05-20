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

function normalizeCPF(cpf) {
  if (!cpf) return "";
  return cpf.replace(/\D/g, "");
}

function normalizeName(name) {
  if (!name) return "";
  return name.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const token = Deno.env.get("SYMPLA_TOKEN");
    if (!token) return Response.json({ error: "SYMPLA_TOKEN não configurado" }, { status: 500 });

    const body = await req.json();
    const { action, event_id } = body;

    // List events from Sympla
    if (action === "list_events") {
      const data = await symplaFetch(`/events?page_size=100&sort=DESC&field_sort=start_date`, token);
      return Response.json({ events: data.data || [] });
    }

    // List participants for an event (only checked-in)
    if (action === "list_participants") {
      if (!event_id) return Response.json({ error: "event_id obrigatório" }, { status: 400 });
      const data = await symplaFetch(`/events/${event_id}/participants?page_size=200`, token);
      const all = data.data || [];
      // Filter only who checked in
      const checkedIn = all.filter(p => p.checkin?.check_in === true);
      return Response.json({ participants: checkedIn, total_registered: all.length, total_checkin: checkedIn.length });
    }

    // Import attendance: match by CPF (primary), then email, then name
    // Also creates PointsLedger entry and updates member total_points
    if (action === "import_attendance") {
      if (!event_id) return Response.json({ error: "event_id obrigatório" }, { status: 400 });
      const { internal_event_id, event_name, points_value = 0, category = "palestra", only_checkin = true } = body;

      // Fetch all participants from Sympla
      const data = await symplaFetch(`/events/${event_id}/participants?page_size=200`, token);
      const allParticipants = data.data || [];
      const participants = only_checkin
        ? allParticipants.filter(p => p.checkin?.check_in === true)
        : allParticipants;

      // Fetch all members
      const members = await base44.asServiceRole.entities.Member.list();

      // Build lookup maps
      const memberByCPF = {};
      const memberByEmail = {};
      const memberByName = {};
      members.forEach(m => {
        const cpf = normalizeCPF(m.cpf);
        if (cpf) memberByCPF[cpf] = m;
        if (m.email) memberByEmail[m.email.toLowerCase().trim()] = m;
        const name = normalizeName(m.full_name);
        if (name) memberByName[name] = m;
      });

      // Pre-fetch all existing attendance and points for this event in one query
      const [existingAttendances, existingPoints] = await Promise.all([
        internal_event_id
          ? base44.asServiceRole.entities.Attendance.filter({ event_id: internal_event_id }, undefined, 500)
          : Promise.resolve([]),
        internal_event_id && points_value > 0
          ? base44.asServiceRole.entities.PointsLedger.filter({ source_id: internal_event_id, source_type: "event" }, undefined, 500)
          : Promise.resolve([]),
      ]);

      const attendanceByMember = {};
      existingAttendances.forEach(a => { attendanceByMember[a.member_id] = a; });
      const pointsByMember = {};
      // Track existing ledger entries — their total_points may not have been applied yet (e.g. from a failed previous import)
      existingPoints.forEach(p => { pointsByMember[p.member_id] = p; });

      let matched = 0, unmatched = 0;
      const results = [];
      const membersToRecalc = new Set();
      // Always recalc members who already had points from this event (may have been created but total_points not updated)
      existingPoints.forEach(p => membersToRecalc.add(p.member_id));

      for (const p of participants) {
        // Extract CPF from custom_form
        const cpfField = (p.custom_form || []).find(f => f.name?.toLowerCase().includes("cpf"));
        const cpfRaw = cpfField?.value || "";
        const cpfNorm = normalizeCPF(cpfRaw);
        const emailNorm = (p.email || "").toLowerCase().trim();
        const fullName = `${p.first_name || ""} ${p.last_name || ""}`.trim();
        const nameNorm = normalizeName(fullName);

        // Match: basta UM bater — CPF > email > nome completo
        let member = null;
        let matchMethod = "";

        if (cpfNorm && memberByCPF[cpfNorm]) {
          member = memberByCPF[cpfNorm];
          matchMethod = "CPF";
        }

        if (!member && emailNorm && memberByEmail[emailNorm]) {
          member = memberByEmail[emailNorm];
          matchMethod = "email";
        }

        if (!member && nameNorm) {
          if (memberByName[nameNorm]) {
            member = memberByName[nameNorm];
            matchMethod = "nome";
          } else {
            const symplaWords = nameNorm.split(/\s+/).filter(w => w.length > 2);
            for (const [mName, m] of Object.entries(memberByName)) {
              if (symplaWords.length >= 2 && symplaWords.every(w => mName.includes(w))) {
                member = m;
                matchMethod = "nome (parcial)";
                break;
              }
            }
          }
        }

        if (!member) {
          unmatched++;
          results.push({ sympla_name: fullName, sympla_email: p.email, sympla_cpf: cpfRaw, status: "não encontrado", match_method: null });
          continue;
        }

        // Attendance record (use pre-fetched data)
        if (internal_event_id) {
          const existing = attendanceByMember[member.id];
          if (!existing) {
            await base44.asServiceRole.entities.Attendance.create({
              event_id: internal_event_id,
              event_name: event_name || "Importado via Sympla",
              member_id: member.id,
              member_name: member.full_name,
              status: "presente",
              method: "importacao",
              recorded_by: user.email,
              notes: `Sympla check-in: ${p.checkin?.check_in_date || ""} | Cruzado por ${matchMethod}`
            });
          } else if (existing.status !== "presente") {
            await base44.asServiceRole.entities.Attendance.update(existing.id, {
              status: "presente",
              method: "importacao",
              notes: `Sympla check-in via importação | Cruzado por ${matchMethod}`
            });
          }
        }

        // Points (use pre-fetched data)
        if (points_value > 0 && internal_event_id && !pointsByMember[member.id]) {
          await base44.asServiceRole.entities.PointsLedger.create({
            member_id: member.id,
            member_name: member.full_name,
            points: points_value,
            category: category,
            action: `Presença: ${event_name || "Evento via Sympla"}`,
            source_type: "event",
            source_id: internal_event_id,
            source_name: event_name || "Evento via Sympla",
            status: "aprovado",
            notes: `Importado do Sympla | Cruzado por ${matchMethod}`,
            created_by: user.email
          });
          // Mark this member as needing points recalculation
          pointsByMember[member.id] = true; // prevent duplicate
          membersToRecalc.add(member.id);
        }

        matched++;
        results.push({ sympla_name: fullName, sympla_email: p.email, sympla_cpf: cpfRaw, member_name: member.full_name, status: "importado", match_method: matchMethod });
      }

      // Recalculate total_points for all affected members from PointsLedger (source of truth)
      for (const memberId of membersToRecalc) {
        const allLedger = await base44.asServiceRole.entities.PointsLedger.filter(
          { member_id: memberId, status: "aprovado" }, undefined, 1000
        );
        const total = allLedger.reduce((sum, l) => sum + (l.points || 0), 0);
        await base44.asServiceRole.entities.Member.update(memberId, { total_points: total });
      }

      return Response.json({
        matched,
        unmatched,
        total_checkin: participants.length,
        total_registered: allParticipants.length,
        results
      });
    }

    return Response.json({ error: "action inválida" }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});