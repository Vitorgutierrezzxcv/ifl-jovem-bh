import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const { event, data, old_data } = payload;

    // Only care about update events where total_points changed
    if (event?.type !== 'update') {
      return Response.json({ skipped: true });
    }

    const newPoints = data?.total_points;
    const oldPoints = old_data?.total_points;

    if (newPoints === undefined || newPoints === oldPoints) {
      return Response.json({ skipped: true, reason: 'no points change' });
    }

    await base44.asServiceRole.entities.PointsAuditLog.create({
      member_id: data.id || event.entity_id,
      member_name: data.full_name || '',
      previous_points: oldPoints ?? null,
      new_points: newPoints,
      delta: (newPoints ?? 0) - (oldPoints ?? 0),
      changed_by: data.updated_by || 'sistema',
      changed_at: new Date().toISOString(),
      source: 'automatico'
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});