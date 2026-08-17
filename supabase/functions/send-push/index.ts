// DECA HQ — Push notification delivery
//
// Reads Expo push tokens from public.users.push_token and relays a
// notification through Expo's push API. Callers must be an authenticated
// officer/advisor (checked against their own row via their own JWT, before
// the service-role client is used to read other users' tokens and send).
//
// Deploy: supabase functions deploy send-push
// Invoke (from the app): supabase.functions.invoke('send-push', { body: {...} })
//
// Body shape:
//   { broadcast: true, title, body, data? }              — notify every member with a token
//   { userIds: string[], title, body, data? }             — notify specific members

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface SendPushBody {
  userIds?: string[];
  broadcast?: boolean;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const CHUNK_SIZE = 100;

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return jsonResponse({ error: 'Missing Authorization header' }, 401);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  // Scoped to the caller's own JWT — used only to verify who's calling.
  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user }, error: authError } = await callerClient.auth.getUser();
  if (authError || !user) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const { data: callerRow, error: roleError } = await callerClient
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (roleError || !callerRow || !['officer', 'advisor'].includes(callerRow.role)) {
    return jsonResponse({ error: 'Forbidden — officers or advisors only' }, 403);
  }

  let body: SendPushBody;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const { userIds, broadcast, title, body: messageBody, data } = body;
  if (!title || !messageBody) {
    return jsonResponse({ error: 'title and body are required' }, 400);
  }
  if (!broadcast && (!Array.isArray(userIds) || userIds.length === 0)) {
    return jsonResponse({ error: 'userIds is required unless broadcast is true' }, 400);
  }

  // Service-role client to read tokens across users — bypasses RLS
  // deliberately, since the caller's authority was already checked above.
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  let query = adminClient.from('users').select('push_token').not('push_token', 'is', null);
  if (!broadcast && userIds) {
    query = query.in('id', userIds);
  }

  const { data: rows, error: tokensError } = await query;
  if (tokensError) {
    return jsonResponse({ error: tokensError.message }, 500);
  }

  const tokens = (rows ?? [])
    .map((r: { push_token: string | null }) => r.push_token)
    .filter((t: string | null): t is string => !!t);

  if (tokens.length === 0) {
    return jsonResponse({ sent: 0 });
  }

  let sent = 0;
  for (let i = 0; i < tokens.length; i += CHUNK_SIZE) {
    const chunk = tokens.slice(i, i + CHUNK_SIZE);
    const messages = chunk.map(to => ({
      to,
      title,
      body: messageBody,
      data: data ?? {},
      sound: 'default',
    }));

    const res = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(messages),
    });

    if (res.ok) sent += chunk.length;
  }

  return jsonResponse({ sent, total: tokens.length });
});
