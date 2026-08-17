-- ============================================================
-- DECA HQ — Flat 1-credit-per-submission model
-- Run this in the Supabase SQL Editor against an ALREADY-DEPLOYED project.
-- (schema.sql has been updated to match — use that instead for a fresh project.)
--
-- Every volunteer_hours row is now worth exactly one credit — there is no
-- more variable hours/quantity input. Drops the hours column and switches
-- increment_volunteer_hours() from SUM(hours) to COUNT(*) of approved rows.
-- ============================================================

DROP FUNCTION IF EXISTS public.increment_volunteer_hours(UUID, NUMERIC);

CREATE OR REPLACE FUNCTION public.increment_volunteer_hours(p_user_id UUID)
RETURNS VOID
LANGUAGE PLPGSQL SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_approved_count INTEGER;
BEGIN
  IF public.get_my_role() NOT IN ('officer', 'advisor') THEN
    RAISE EXCEPTION 'Only officers or advisors may approve volunteer hours';
  END IF;

  SELECT COUNT(*) INTO v_approved_count
  FROM public.volunteer_hours
  WHERE user_id = p_user_id AND status = 'approved';

  UPDATE public.users
  SET volunteer_hours = v_approved_count
  WHERE id = p_user_id;
END;
$$;

ALTER TABLE public.volunteer_hours DROP COLUMN IF EXISTS hours;

-- Resync every user's stored total to their actual approved-row count, in
-- case any existing rows had a real (non-1) hours value under the old model.
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT DISTINCT user_id FROM public.volunteer_hours LOOP
    UPDATE public.users u
    SET volunteer_hours = (
      SELECT COUNT(*) FROM public.volunteer_hours v
      WHERE v.user_id = r.user_id AND v.status = 'approved'
    )
    WHERE u.id = r.user_id;
  END LOOP;
END $$;

-- ============================================================
-- MANUAL STEPS AFTER RUNNING THIS SCRIPT
-- ============================================================
-- Redeploy the app — src/services/volunteerService.ts, the submit/approval
-- screens, VolunteerHour type, and submitVolunteerSchema all changed
-- alongside this migration to drop the hours field entirely.
-- ============================================================
