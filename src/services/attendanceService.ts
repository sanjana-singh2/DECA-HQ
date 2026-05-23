import { supabase } from './supabase';
import { Attendance, AttendanceMethod } from '../types';

function mapAttendance(row: Record<string, any>): Attendance {
  return {
    id: row.id,
    userId: row.user_id,
    eventId: row.event_id,
    timestamp: row.timestamp,
    method: row.method,
  };
}

export async function recordAttendance(params: {
  userId: string;
  eventId: string;
  method: AttendanceMethod;
}): Promise<string> {
  const existing = await getUserAttendanceForEvent(params.userId, params.eventId);
  if (existing) throw new Error('Attendance already recorded for this event');

  const { data, error } = await supabase
    .from('attendance')
    .insert({
      user_id: params.userId,
      event_id: params.eventId,
      method: params.method,
    })
    .select('id')
    .single();

  if (error) throw error;

  // Atomically increment attendance count via RPC
  await supabase.rpc('increment_attendance_count', { p_user_id: params.userId });

  return data.id;
}

export async function getUserAttendanceForEvent(
  userId: string,
  eventId: string
): Promise<Attendance | null> {
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('user_id', userId)
    .eq('event_id', eventId)
    .maybeSingle();

  if (error || !data) return null;
  return mapAttendance(data);
}

export async function getUserAttendanceHistory(userId: string): Promise<Attendance[]> {
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapAttendance);
}

export async function getEventAttendance(eventId: string): Promise<Attendance[]> {
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('event_id', eventId);

  if (error) throw error;
  return (data ?? []).map(mapAttendance);
}

export function generateQRPayload(eventId: string): string {
  return JSON.stringify({ eventId, timestamp: Date.now() });
}

export function parseQRPayload(raw: string): { eventId: string; timestamp: number } | null {
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed.eventId === 'string' && typeof parsed.timestamp === 'number') {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}
