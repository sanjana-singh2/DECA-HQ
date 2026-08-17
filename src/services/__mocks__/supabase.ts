// Manual mock so unit tests can import service modules (for their pure
// helper functions) without constructing a real Supabase client — the real
// client's Auth initialization touches window.localStorage, which doesn't
// exist under Jest's node test environment and crashes the process.
export const supabase = {} as any;
