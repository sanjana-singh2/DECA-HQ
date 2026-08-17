-- ============================================================
-- DECA HQ — Invite-code role assignment
-- Run this in the Supabase SQL Editor against an ALREADY-DEPLOYED project.
-- (schema.sql has been updated to match — use that instead for a fresh project.)
--
-- Replaces "pick your own role at signup" (already removed) and "an advisor
-- manually runs UPDATE users SET role = ... in the SQL Editor" with an
-- in-app flow: an advisor generates a code tied to a role (officer or
-- advisor), and a member redeems it to be promoted. Redemption is a
-- SECURITY DEFINER RPC — the client never sets its own role directly.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.invite_codes (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT        NOT NULL UNIQUE,
  role        TEXT        NOT NULL CHECK (role IN ('officer', 'advisor')),
  max_uses    INTEGER     NOT NULL DEFAULT 1 CHECK (max_uses > 0),
  use_count   INTEGER     NOT NULL DEFAULT 0,
  expires_at  TIMESTAMPTZ,
  revoked     BOOLEAN     NOT NULL DEFAULT FALSE,
  created_by  UUID        REFERENCES public.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;

-- Advisors only — members/officers have no SELECT access at all, so codes
-- can't be browsed or enumerated; the only way to use one is to already
-- know it and redeem it via the RPC below.
DROP POLICY IF EXISTS "invite_codes: advisors can manage" ON public.invite_codes;
CREATE POLICY "invite_codes: advisors can manage"
  ON public.invite_codes FOR ALL TO authenticated
  USING (public.get_my_role() = 'advisor')
  WITH CHECK (public.get_my_role() = 'advisor');

-- Redeems an invite code and promotes the CALLING user (auth.uid()) to the
-- code's role. Runs as SECURITY DEFINER so it can read invite_codes (which
-- non-advisors have no SELECT grant on) and write users.role despite the
-- enforce_user_profile_update trigger — it authorizes that one write via a
-- transaction-local flag rather than weakening the trigger's normal checks.
CREATE OR REPLACE FUNCTION public.redeem_invite_code(p_code TEXT)
RETURNS TEXT
LANGUAGE PLPGSQL SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.invite_codes%ROWTYPE;
  v_current_role TEXT;
  v_rank CONSTANT JSONB := '{"member": 0, "officer": 1, "advisor": 2}'::JSONB;
BEGIN
  SELECT * INTO v_row
  FROM public.invite_codes
  WHERE code = UPPER(TRIM(p_code)) AND revoked = FALSE
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or revoked invite code';
  END IF;

  IF v_row.expires_at IS NOT NULL AND v_row.expires_at < NOW() THEN
    RAISE EXCEPTION 'This invite code has expired';
  END IF;

  IF v_row.use_count >= v_row.max_uses THEN
    RAISE EXCEPTION 'This invite code has already reached its use limit';
  END IF;

  SELECT role INTO v_current_role FROM public.users WHERE id = auth.uid();

  IF v_current_role IS NULL THEN
    RAISE EXCEPTION 'No profile found for the current user';
  END IF;

  IF (v_rank->>v_current_role)::INT >= (v_rank->>v_row.role)::INT THEN
    RAISE EXCEPTION 'You already have % access or higher', v_current_role;
  END IF;

  UPDATE public.invite_codes SET use_count = use_count + 1 WHERE id = v_row.id;

  PERFORM set_config('deca.allow_role_change', 'true', TRUE);
  UPDATE public.users SET role = v_row.role WHERE id = auth.uid();

  RETURN v_row.role;
END;
$$;

-- Lets redeem_invite_code's UPDATE through: same protected-column checks as
-- before, plus an escape hatch for the transaction-local flag that only
-- this function sets (clients can't call set_config directly — they only
-- get PostgREST table/RPC access, never raw SQL).
CREATE OR REPLACE FUNCTION public.enforce_user_profile_update()
RETURNS TRIGGER
LANGUAGE PLPGSQL SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.get_my_role() <> 'advisor'
     AND current_setting('deca.allow_role_change', TRUE) IS DISTINCT FROM 'true' THEN
    IF NEW.role IS DISTINCT FROM OLD.role
       OR NEW.email IS DISTINCT FROM OLD.email
       OR NEW.attendance_count IS DISTINCT FROM OLD.attendance_count
       OR NEW.volunteer_hours IS DISTINCT FROM OLD.volunteer_hours THEN
      RAISE EXCEPTION 'Not authorized to modify protected profile fields';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- ============================================================
-- MANUAL STEPS AFTER RUNNING THIS SCRIPT
-- ============================================================
-- 1. Redeploy the app — src/services/inviteCodeService.ts, RegisterScreen,
--    and ProfileScreen changed alongside this migration.
-- 2. There is no bootstrap advisor account yet on a fresh project — the
--    very first advisor still has to be promoted manually once:
--      UPDATE public.users SET role = 'advisor' WHERE id = '<your-uuid>';
--    (Run as the project owner in the SQL Editor.) After that, all further
--    officer/advisor promotions can go through the in-app invite-code flow.
-- ============================================================
