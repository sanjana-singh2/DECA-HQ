import { supabase } from './supabase';
import { Announcement } from '../types';

function mapAnnouncement(row: Record<string, any>): Announcement {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    authorId: row.author_id,
    createdAt: row.created_at,
    isPinned: row.is_pinned ?? false,
  };
}

export async function getAnnouncements(limitCount = 3): Promise<Announcement[]> {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limitCount);

  if (error) throw error;
  return (data ?? []).map(mapAnnouncement);
}

export async function createAnnouncement(params: {
  title: string;
  content: string;
  authorId: string;
  isPinned?: boolean;
}): Promise<string> {
  const { data, error } = await supabase
    .from('announcements')
    .insert({
      title: params.title,
      content: params.content,
      author_id: params.authorId,
      is_pinned: params.isPinned ?? false,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function deleteAnnouncement(id: string): Promise<void> {
  const { error } = await supabase.from('announcements').delete().eq('id', id);
  if (error) throw error;
}
