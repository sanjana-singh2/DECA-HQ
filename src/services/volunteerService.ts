import { supabase } from './supabase';
import { VolunteerHour, VolunteerStatus } from '../types';

const BUCKET = 'volunteer-proof';

function mapVolunteerHour(row: Record<string, any>): VolunteerHour {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description ?? undefined,
    proofUrl: row.proof_url,
    status: row.status,
    submittedAt: row.submitted_at,
    reviewedBy: row.reviewed_by ?? undefined,
    reviewedAt: row.reviewed_at ?? undefined,
  };
}

// volunteer-proof is a private bucket (proof photos may contain personal
// info), so we store the storage path and resolve it to a short-lived
// signed URL on read instead of a permanent public URL.
async function withSignedProofUrl(hour: VolunteerHour): Promise<VolunteerHour> {
  if (!hour.proofUrl) return hour;
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(hour.proofUrl, 3600);
  return { ...hour, proofUrl: data?.signedUrl ?? '' };
}

export async function uploadProofImage(uri: string, userId: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();
  const storagePath = `${userId}/${Date.now()}.jpg`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, blob, { contentType: 'image/jpeg', upsert: false });

  if (error) throw error;

  return storagePath;
}

export async function submitVolunteerHours(params: {
  userId: string;
  title: string;
  description?: string;
  proofUrl: string;
}): Promise<string> {
  const { data, error } = await supabase
    .from('volunteer_hours')
    .insert({
      user_id: params.userId,
      title: params.title,
      description: params.description ?? null,
      proof_url: params.proofUrl,
      status: 'pending' as VolunteerStatus,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function getUserVolunteerHours(userId: string): Promise<VolunteerHour[]> {
  const { data, error } = await supabase
    .from('volunteer_hours')
    .select('*')
    .eq('user_id', userId)
    .order('submitted_at', { ascending: false });

  if (error) throw error;
  return Promise.all((data ?? []).map(mapVolunteerHour).map(withSignedProofUrl));
}

export async function getPendingApprovals(): Promise<VolunteerHour[]> {
  const { data, error } = await supabase
    .from('volunteer_hours')
    .select('*')
    .eq('status', 'pending')
    .order('submitted_at', { ascending: true });

  if (error) throw error;
  return Promise.all((data ?? []).map(mapVolunteerHour).map(withSignedProofUrl));
}

export async function approveVolunteerHours(
  hourId: string,
  userId: string,
  reviewerId: string
): Promise<void> {
  const { error } = await supabase
    .from('volunteer_hours')
    .update({
      status: 'approved' as VolunteerStatus,
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', hourId);

  if (error) throw error;

  // Atomically recompute the user's total from their approved-row count
  // (each row is worth exactly one credit)
  await supabase.rpc('increment_volunteer_hours', { p_user_id: userId });
}

export async function rejectVolunteerHours(
  hourId: string,
  reviewerId: string
): Promise<void> {
  const { error } = await supabase
    .from('volunteer_hours')
    .update({
      status: 'rejected' as VolunteerStatus,
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', hourId);

  if (error) throw error;
}
