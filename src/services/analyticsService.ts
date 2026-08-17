import { supabase } from './supabase';

export interface ChapterStats {
  totalMembers: number;
  totalMeetingsAttended: number;
  totalCreditsLogged: number;
  membersByGrade: { grade: number; count: number }[];
  avgScoreByCategory: { category: string; average: number }[];
}

export async function getChapterStats(): Promise<ChapterStats> {
  const [{ data: users, error: usersError }, { data: scores, error: scoresError }] = await Promise.all([
    supabase.from('users').select('grade, attendance_count, volunteer_hours'),
    supabase.from('scores').select('event_category, score').eq('score_type', 'competition'),
  ]);

  if (usersError) throw usersError;
  if (scoresError) throw scoresError;

  const totalMembers = users?.length ?? 0;
  const totalMeetingsAttended = (users ?? []).reduce((sum, u) => sum + (u.attendance_count ?? 0), 0);
  const totalCreditsLogged = (users ?? []).reduce((sum, u) => sum + Number(u.volunteer_hours ?? 0), 0);

  const gradeCounts: Record<number, number> = {};
  (users ?? []).forEach(u => {
    gradeCounts[u.grade] = (gradeCounts[u.grade] ?? 0) + 1;
  });
  const membersByGrade = Object.entries(gradeCounts)
    .map(([grade, count]) => ({ grade: Number(grade), count }))
    .sort((a, b) => a.grade - b.grade);

  const categoryTotals: Record<string, { sum: number; count: number }> = {};
  (scores ?? []).forEach(s => {
    const cat = s.event_category;
    if (!categoryTotals[cat]) categoryTotals[cat] = { sum: 0, count: 0 };
    categoryTotals[cat].sum += Number(s.score);
    categoryTotals[cat].count += 1;
  });
  const avgScoreByCategory = Object.entries(categoryTotals)
    .map(([category, { sum, count }]) => ({ category, average: sum / count }))
    .sort((a, b) => b.average - a.average);

  return { totalMembers, totalMeetingsAttended, totalCreditsLogged, membersByGrade, avgScoreByCategory };
}
