import { supabase } from './supabase';
import { Score, ScoreType } from '../types';

function mapScore(row: Record<string, any>): Score {
  return {
    id: row.id,
    userId: row.user_id,
    eventCategory: row.event_category,
    scoreType: row.score_type,
    score: row.score,
    date: row.date,
    notes: row.notes ?? undefined,
  };
}

export async function addScore(params: {
  userId: string;
  eventCategory: string;
  scoreType: ScoreType;
  score: number;
  notes?: string;
}): Promise<string> {
  const { data, error } = await supabase
    .from('scores')
    .insert({
      user_id: params.userId,
      event_category: params.eventCategory,
      score_type: params.scoreType,
      score: params.score,
      notes: params.notes ?? null,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function deleteScore(scoreId: string): Promise<void> {
  const { error } = await supabase.from('scores').delete().eq('id', scoreId);
  if (error) throw error;
}

export async function getUserScores(userId: string): Promise<Score[]> {
  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapScore);
}

export async function getUserScoresByCategory(
  userId: string,
  category: string
): Promise<Score[]> {
  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .eq('user_id', userId)
    .eq('event_category', category)
    .order('date', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapScore);
}

export async function getTopScores(category: string, limitCount = 10): Promise<Score[]> {
  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .eq('event_category', category)
    .eq('score_type', 'competition')
    .order('score', { ascending: false })
    .limit(limitCount);

  if (error) throw error;
  return (data ?? []).map(mapScore);
}

export function calculateAverage(scores: Score[]): number {
  if (scores.length === 0) return 0;
  return scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
}

export function groupScoresByCategory(scores: Score[]): Record<string, Score[]> {
  return scores.reduce((acc, score) => {
    const cat = score.eventCategory;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(score);
    return acc;
  }, {} as Record<string, Score[]>);
}
