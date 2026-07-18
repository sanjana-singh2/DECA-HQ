-- ============================================================
-- DECA HQ — Security Hardening Migration
-- Run this in the Supabase SQL Editor against an ALREADY-DEPLOYED project.
-- (schema.sql has been updated to match — use that instead for a fresh project.)
--
-- Fixes:
--   1. Role escalation at signup (handle_new_user trusted client metadata)
--   2. Role escalation via self-update (no column guard on users UPDATE)
--   3. Unauthenticated stat-inflation via increment_* RPCs
--   4. Volunteer-hours self-edit-while-pending fraud vector
--   5. Event created_by spoofing
--   6. volunteer-proof storage bucket had no RLS / used permanent public URLs
-- ============================================================

-- 1 & 3: stop trusting client-supplied role at signup, and stop counters
-- from being blindly incrementable via RPC.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, grade)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'member',
    COALESCE((NEW.raw_user_meta_data->>'grade')::INTEGER, 10)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_attendance_count(p_user_id UUID)
RETURNS VOID
LANGUAGE PLPGSQL SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actual_count INTEGER;
BEGIN
  IF auth.uid() <> p_user_id AND public.get_my_role() NOT IN ('officer', 'advisor') THEN
    RAISE EXCEPTION 'Not authorized to modify attendance count';
  END IF;

  SELECT COUNT(*) INTO v_actual_count
  FROM public.attendance
  WHERE user_id = p_user_id;

  UPDATE public.users
  SET attendance_count = LEAST(v_actual_count, attendance_count + 1)
  WHERE id = p_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_volunteer_hours(p_user_id UUID, p_hours NUMERIC)
RETURNS VOID
LANGUAGE PLPGSQL SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_approved_total NUMERIC;
BEGIN
  IF public.get_my_role() NOT IN ('officer', 'advisor') THEN
    RAISE EXCEPTION 'Only officers or advisors may approve volunteer hours';
  END IF;

  SELECT COALESCE(SUM(hours), 0) INTO v_approved_total
  FROM public.volunteer_hours
  WHERE user_id = p_user_id AND status = 'approved';

  UPDATE public.users
  SET volunteer_hours = v_approved_total
  WHERE id = p_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_comment_count(p_post_id UUID)
RETURNS VOID
LANGUAGE SQL SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.forum_posts
  SET comment_count = (SELECT COUNT(*) FROM public.comments WHERE post_id = p_post_id)
  WHERE id = p_post_id;
$$;

CREATE OR REPLACE FUNCTION public.decrement_comment_count(p_post_id UUID)
RETURNS VOID
LANGUAGE SQL SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.forum_posts
  SET comment_count = (SELECT COUNT(*) FROM public.comments WHERE post_id = p_post_id)
  WHERE id = p_post_id;
$$;

-- 2: block non-advisors from changing role/email/attendance_count/volunteer_hours
CREATE OR REPLACE FUNCTION public.enforce_user_profile_update()
RETURNS TRIGGER
LANGUAGE PLPGSQL SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.get_my_role() <> 'advisor' THEN
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

DROP TRIGGER IF EXISTS enforce_user_profile_update_trigger ON public.users;
CREATE TRIGGER enforce_user_profile_update_trigger
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.enforce_user_profile_update();

-- 1 (insert path): block role escalation via direct insert/upsert too
DROP POLICY IF EXISTS "users: can insert own profile" ON public.users;
CREATE POLICY "users: can insert own profile"
  ON public.users FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id AND role = 'member');

-- 4: officers/advisors only, no self-service branch
DROP POLICY IF EXISTS "volunteer: officers can approve/reject" ON public.volunteer_hours;
CREATE POLICY "volunteer: officers can approve/reject"
  ON public.volunteer_hours FOR UPDATE TO authenticated
  USING (public.get_my_role() IN ('officer','advisor'));

-- 5: prevent an officer from attributing an event to someone else
DROP POLICY IF EXISTS "events: officers can insert" ON public.events;
CREATE POLICY "events: officers can insert"
  ON public.events FOR INSERT TO authenticated
  WITH CHECK (
    public.get_my_role() IN ('officer','advisor')
    AND (created_by = auth.uid() OR created_by IS NULL)
  );

-- 6: storage buckets & RLS (see manual note below re: existing buckets)
INSERT INTO storage.buckets (id, name, public)
VALUES ('resources', 'resources', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('volunteer-proof', 'volunteer-proof', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "resources bucket: public read" ON storage.objects;
CREATE POLICY "resources bucket: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'resources');

DROP POLICY IF EXISTS "resources bucket: officers can upload" ON storage.objects;
CREATE POLICY "resources bucket: officers can upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'resources' AND public.get_my_role() IN ('officer','advisor'));

DROP POLICY IF EXISTS "resources bucket: officers can delete" ON storage.objects;
CREATE POLICY "resources bucket: officers can delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'resources' AND public.get_my_role() IN ('officer','advisor'));

DROP POLICY IF EXISTS "volunteer-proof: users upload own folder" ON storage.objects;
CREATE POLICY "volunteer-proof: users upload own folder"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'volunteer-proof' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "volunteer-proof: users read own; officers read all" ON storage.objects;
CREATE POLICY "volunteer-proof: users read own; officers read all"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'volunteer-proof'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.get_my_role() IN ('officer','advisor')
    )
  );

-- ============================================================
-- MANUAL STEPS AFTER RUNNING THIS SCRIPT
-- ============================================================
-- 1. If `volunteer-proof` already existed as a PUBLIC bucket before this
--    migration, the INSERT ... ON CONFLICT DO NOTHING above will NOT flip it
--    to private. Go to Dashboard → Storage → volunteer-proof → Edit bucket
--    and uncheck "Public bucket" manually.
--
-- 2. Audit existing data for prior exploitation of the role-escalation bugs:
--      SELECT id, email, role FROM public.users WHERE role IN ('officer','advisor');
--    Confirm every officer/advisor row is legitimate. Demote any that aren't:
--      UPDATE public.users SET role = 'member' WHERE id = '<uuid>';
--    (Run as the project owner in the SQL Editor — this bypasses RLS/the
--    new trigger since the SQL Editor runs as postgres, not as an app user.)
--
-- 3. Audit volunteer_hours/attendance for values that don't reconcile with
--    the underlying rows, in case increment_volunteer_hours was abused
--    before this fix:
--      SELECT u.id, u.volunteer_hours, COALESCE(SUM(v.hours), 0) AS should_be
--      FROM public.users u
--      LEFT JOIN public.volunteer_hours v ON v.user_id = u.id AND v.status = 'approved'
--      GROUP BY u.id, u.volunteer_hours
--      HAVING u.volunteer_hours <> COALESCE(SUM(v.hours), 0);
--    For any mismatches, run: SELECT public.increment_volunteer_hours(id, 0);
--    as an officer/advisor to resync from the ledger.
--
-- 4. Redeploy the app — src/services/authService.ts and
--    src/services/volunteerService.ts changed alongside this migration
--    (role is no longer client-controlled at signup; proof photos are now
--    served via short-lived signed URLs instead of permanent public URLs).
-- ============================================================
