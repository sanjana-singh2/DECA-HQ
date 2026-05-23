import { supabase } from './supabase';
import { Event, EventType } from '../types';

function mapEvent(row: Record<string, any>): Event {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    location: row.location ?? '',
    startTime: row.start_time,
    endTime: row.end_time,
    type: row.type,
    createdBy: row.created_by,
    rsvpList: row.rsvp_list ?? [],
  };
}

export async function createEvent(params: {
  title: string;
  description: string;
  location: string;
  startTime: Date;
  endTime: Date;
  type: EventType;
  createdBy: string;
}): Promise<string> {
  const { data, error } = await supabase
    .from('events')
    .insert({
      title: params.title,
      description: params.description,
      location: params.location,
      start_time: params.startTime.toISOString(),
      end_time: params.endTime.toISOString(),
      type: params.type,
      created_by: params.createdBy,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function getUpcomingEvents(limitCount = 5): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      rsvp_list:event_rsvps(user_id)
    `)
    .gte('start_time', new Date().toISOString())
    .order('start_time', { ascending: true })
    .limit(limitCount);

  if (error) throw error;
  return (data ?? []).map(row => ({
    ...mapEvent(row),
    rsvpList: (row.rsvp_list ?? []).map((r: any) => r.user_id),
  }));
}

export async function getAllEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      rsvp_list:event_rsvps(user_id)
    `)
    .order('start_time', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(row => ({
    ...mapEvent(row),
    rsvpList: (row.rsvp_list ?? []).map((r: any) => r.user_id),
  }));
}

export async function getEventById(eventId: string): Promise<Event | null> {
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      rsvp_list:event_rsvps(user_id)
    `)
    .eq('id', eventId)
    .single();

  if (error || !data) return null;
  return {
    ...mapEvent(data),
    rsvpList: (data.rsvp_list ?? []).map((r: any) => r.user_id),
  };
}

export async function updateEvent(eventId: string, updates: Partial<Event>): Promise<void> {
  const mapped: Record<string, any> = {};
  if (updates.title !== undefined) mapped.title = updates.title;
  if (updates.description !== undefined) mapped.description = updates.description;
  if (updates.location !== undefined) mapped.location = updates.location;
  if (updates.startTime !== undefined) mapped.start_time = updates.startTime;
  if (updates.endTime !== undefined) mapped.end_time = updates.endTime;
  if (updates.type !== undefined) mapped.type = updates.type;

  const { error } = await supabase.from('events').update(mapped).eq('id', eventId);
  if (error) throw error;
}

export async function deleteEvent(eventId: string): Promise<void> {
  const { error } = await supabase.from('events').delete().eq('id', eventId);
  if (error) throw error;
}

export async function rsvpEvent(eventId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('event_rsvps')
    .upsert({ event_id: eventId, user_id: userId });
  if (error) throw error;
}

export async function unrsvpEvent(eventId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('event_rsvps')
    .delete()
    .eq('event_id', eventId)
    .eq('user_id', userId);
  if (error) throw error;
}
