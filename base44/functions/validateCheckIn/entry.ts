import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { event_id } = await req.json();

    if (!event_id) {
      return Response.json({ error: 'Missing event_id' }, { status: 400 });
    }

    // Get member data
    const members = await base44.entities.Member.filter({ email: user.email });
    if (!members || members.length === 0) {
      return Response.json({ error: 'Member not found' }, { status: 404 });
    }
    const member = members[0];

    // Get event data
    const events = await base44.entities.Event.filter({ id: event_id });
    if (!events || events.length === 0) {
      return Response.json({ error: 'Event not found' }, { status: 404 });
    }
    const event = events[0];

    // Check if already checked in
    const existingAttendance = await base44.entities.Attendance.filter({
      event_id,
      member_id: member.id,
    });

    let attendance;
    if (existingAttendance && existingAttendance.length > 0) {
      // Update existing record
      attendance = existingAttendance[0];
      if (attendance.status === 'presente' || attendance.status === 'validada') {
        return Response.json({ 
          status: 'already_checked', 
          attendance,
          message: 'Você já realizou check-in neste evento' 
        });
      }
      attendance = await base44.entities.Attendance.update(attendance.id, {
        status: 'validada',
        checked_in_at: new Date().toISOString(),
        method: 'qrcode',
      });
    } else {
      // Create new attendance record
      attendance = await base44.entities.Attendance.create({
        event_id,
        event_name: event.name,
        member_id: member.id,
        member_name: member.full_name,
        status: 'validada',
        checked_in_at: new Date().toISOString(),
        method: 'qrcode',
        points_generated: event.points_value || 0,
      });
    }

    // Create points ledger entry if points awarded
    if (event.points_value && event.points_value > 0) {
      await base44.entities.PointsLedger.create({
        member_id: member.id,
        member_name: member.full_name,
        points: event.points_value,
        category: 'evento_ordinario',
        action: `Check-in em ${event.name}`,
        source_type: 'event',
        source_id: event_id,
        source_name: event.name,
        status: 'aprovado',
      });

      // Update member total points
      const newTotal = (member.total_points || 0) + event.points_value;
      await base44.entities.Member.update(member.id, {
        total_points: newTotal,
      });
    }

    return Response.json({
      status: 'checked_in',
      attendance,
      event,
      points_awarded: event.points_value || 0,
      message: `Check-in realizado com sucesso em ${event.name}!`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});