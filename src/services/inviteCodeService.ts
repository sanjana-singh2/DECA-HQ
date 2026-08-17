import { supabase } from './supabase';
import { UserRole } from '../types';

export interface InviteCode {
  id: string;
  code: string;
  role: Extract<UserRole, 'officer' | 'advisor'>;
  maxUses: number;
  useCount: number;
  expiresAt: string | null;
  revoked: boolean;
  createdAt: string;
}

function mapInviteCode(row: Record<string, any>): InviteCode {
  return {
    id: row.id,
    code: row.code,
    role: row.role,
    maxUses: row.max_uses,
    useCount: row.use_count,
    expiresAt: row.expires_at,
    revoked: row.revoked,
    createdAt: row.created_at,
  };
}

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I/l — hard to misread

function generateCode(): string {
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return `DECA-${suffix}`;
}

export async function getInviteCodes(): Promise<InviteCode[]> {
  const { data, error } = await supabase
    .from('invite_codes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapInviteCode);
}

export async function createInviteCode(params: {
  role: Extract<UserRole, 'officer' | 'advisor'>;
  createdBy: string;
  maxUses?: number;
  expiresInDays?: number;
}): Promise<InviteCode> {
  const expiresAt = params.expiresInDays
    ? new Date(Date.now() + params.expiresInDays * 24 * 60 * 60 * 1000).toISOString()
    : null;

  // Retry once on the (rare) chance a randomly generated code already exists.
  for (let attempt = 0; attempt < 2; attempt++) {
    const { data, error } = await supabase
      .from('invite_codes')
      .insert({
        code: generateCode(),
        role: params.role,
        max_uses: params.maxUses ?? 1,
        expires_at: expiresAt,
        created_by: params.createdBy,
      })
      .select('*')
      .single();

    if (!error) return mapInviteCode(data);
    if (error.code !== '23505' || attempt === 1) throw error; // 23505 = unique_violation
  }

  throw new Error('Failed to generate a unique invite code');
}

export async function revokeInviteCode(id: string): Promise<void> {
  const { error } = await supabase.from('invite_codes').update({ revoked: true }).eq('id', id);
  if (error) throw error;
}

// Calls the SECURITY DEFINER RPC that validates the code and promotes the
// current user server-side — the client never sets its own role directly.
export async function redeemInviteCode(code: string): Promise<UserRole> {
  const { data, error } = await supabase.rpc('redeem_invite_code', { p_code: code.trim() });
  if (error) throw error;
  return data as UserRole;
}
