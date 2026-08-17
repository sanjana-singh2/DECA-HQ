import { supabase } from './supabase';
import { User, UserRole } from '../types';

function mapUser(row: Record<string, any>): User {
  return {
    uid: row.id,
    fullName: row.full_name,
    email: row.email,
    role: row.role,
    grade: row.grade,
    profilePhoto: row.profile_photo ?? '',
    attendanceCount: row.attendance_count ?? 0,
    volunteerHours: row.volunteer_hours ?? 0,
    createdAt: row.created_at,
  };
}

export async function registerUser(params: {
  email: string;
  password: string;
  fullName: string;
  grade: number;
}): Promise<User> {
  const { email, password, fullName, grade } = params;
  // Role is always 'member' at self-registration — the DB enforces this too
  // (handle_new_user trigger + "users: can insert own profile" RLS policy),
  // so officer/advisor accounts must be granted afterward by an advisor.
  const role: UserRole = 'member';

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, grade },
    },
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('Registration failed');

  // Upsert in case the DB trigger runs async
  const { error: profileError } = await supabase.from('users').upsert({
    id: authData.user.id,
    full_name: fullName,
    email,
    role,
    grade,
    profile_photo: '',
    attendance_count: 0,
    volunteer_hours: 0,
  });

  if (profileError) throw profileError;

  return {
    uid: authData.user.id,
    fullName,
    email,
    role,
    grade,
    profilePhoto: '',
    attendanceCount: 0,
    volunteerHours: 0,
    createdAt: new Date().toISOString(),
  };
}

export async function loginUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

export async function logoutUser(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function resetPassword(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
}

export async function getUserProfile(uid: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', uid)
    .single();

  if (error || !data) return null;
  return mapUser(data);
}
