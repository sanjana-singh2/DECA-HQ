import { supabase } from './supabase';
import { Resource } from '../types';

const BUCKET = 'resources';

function mapResource(row: Record<string, any>): Resource {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    category: row.category,
    fileUrl: row.file_url,
    fileType: row.file_type ?? '',
    uploadedBy: row.uploaded_by,
    createdAt: row.created_at,
    isFeatured: row.is_featured ?? false,
  };
}

export async function uploadResourceFile(
  uri: string,
  filename: string,
  mimeType: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();

  const storagePath = `${Date.now()}_${filename}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, blob, { contentType: mimeType, upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

export async function createResource(params: {
  title: string;
  description: string;
  category: string;
  fileUrl: string;
  fileType: string;
  uploadedBy: string;
}): Promise<string> {
  const { data, error } = await supabase
    .from('resources')
    .insert({
      title: params.title,
      description: params.description,
      category: params.category,
      file_url: params.fileUrl,
      file_type: params.fileType,
      uploaded_by: params.uploadedBy,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function getAllResources(): Promise<Resource[]> {
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapResource);
}

export async function getResourcesByCategory(category: string): Promise<Resource[]> {
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapResource);
}

export async function getResourceById(id: string): Promise<Resource | null> {
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return mapResource(data);
}

export async function deleteResource(resource: Resource): Promise<void> {
  // Extract storage path from public URL
  const urlParts = resource.fileUrl.split(`/${BUCKET}/`);
  if (urlParts.length === 2) {
    await supabase.storage.from(BUCKET).remove([urlParts[1]]);
  }

  const { error } = await supabase.from('resources').delete().eq('id', resource.id);
  if (error) throw error;
}

export function filterResources(resources: Resource[], search: string): Resource[] {
  const term = search.toLowerCase();
  return resources.filter(
    r =>
      r.title.toLowerCase().includes(term) ||
      r.description.toLowerCase().includes(term) ||
      r.category.toLowerCase().includes(term)
  );
}
