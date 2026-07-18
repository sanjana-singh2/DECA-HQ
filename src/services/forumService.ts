import { supabase } from './supabase';
import { ForumPost, Comment } from '../types';

function mapPost(row: Record<string, any>): ForumPost {
  return {
    id: row.id,
    authorId: row.author_id,
    authorName: row.author?.full_name ?? 'Member',
    channelId: row.channel_id,
    content: row.content,
    attachments: row.attachments ?? [],
    createdAt: row.created_at,
    reactions: row.reactions ?? {},
    commentCount: row.comment_count ?? 0,
  };
}

function mapComment(row: Record<string, any>): Comment {
  return {
    id: row.id,
    postId: row.post_id,
    authorId: row.author_id,
    authorName: row.author?.full_name ?? 'Member',
    content: row.content,
    createdAt: row.created_at,
  };
}

export async function createPost(params: {
  authorId: string;
  channelId: string;
  content: string;
  attachments?: string[];
}): Promise<string> {
  const { data, error } = await supabase
    .from('forum_posts')
    .insert({
      author_id: params.authorId,
      channel_id: params.channelId,
      content: params.content,
      attachments: params.attachments ?? [],
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function getChannelPosts(channelId: string, limitCount = 30): Promise<ForumPost[]> {
  const { data, error } = await supabase
    .from('forum_posts')
    .select('*, author:users(full_name)')
    .eq('channel_id', channelId)
    .order('created_at', { ascending: false })
    .limit(limitCount);

  if (error) throw error;
  return (data ?? []).map(mapPost);
}

export async function deletePost(postId: string): Promise<void> {
  const { error } = await supabase.from('forum_posts').delete().eq('id', postId);
  if (error) throw error;
}

export async function addReaction(postId: string, emoji: string, userId: string): Promise<void> {
  const { data } = await supabase
    .from('forum_posts')
    .select('reactions')
    .eq('id', postId)
    .single();

  const reactions = (data?.reactions ?? {}) as Record<string, string[]>;
  const users = reactions[emoji] ?? [];
  if (!users.includes(userId)) {
    reactions[emoji] = [...users, userId];
    await supabase.from('forum_posts').update({ reactions }).eq('id', postId);
  }
}

export async function removeReaction(postId: string, emoji: string, userId: string): Promise<void> {
  const { data } = await supabase
    .from('forum_posts')
    .select('reactions')
    .eq('id', postId)
    .single();

  const reactions = (data?.reactions ?? {}) as Record<string, string[]>;
  reactions[emoji] = (reactions[emoji] ?? []).filter(id => id !== userId);
  await supabase.from('forum_posts').update({ reactions }).eq('id', postId);
}

export async function addComment(params: {
  postId: string;
  authorId: string;
  content: string;
}): Promise<string> {
  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: params.postId,
      author_id: params.authorId,
      content: params.content,
    })
    .select('id')
    .single();

  if (error) throw error;

  await supabase.rpc('increment_comment_count', { p_post_id: params.postId });

  return data.id;
}

export async function getPostComments(postId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('*, author:users(full_name)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapComment);
}

export async function deleteComment(commentId: string, postId: string): Promise<void> {
  const { error } = await supabase.from('comments').delete().eq('id', commentId);
  if (error) throw error;
  await supabase.rpc('decrement_comment_count', { p_post_id: postId });
}
