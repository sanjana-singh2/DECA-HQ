-- ============================================================
-- DECA HQ — Supabase Database Schema
-- Run this in the Supabase SQL Editor (Settings → SQL Editor)
-- ============================================================

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.users (
  id             UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name      TEXT        NOT NULL DEFAULT '',
  email          TEXT        NOT NULL DEFAULT '',
  role           TEXT        NOT NULL DEFAULT 'member'
                             CHECK (role IN ('member', 'officer', 'advisor')),
  grade          INTEGER     NOT NULL DEFAULT 10
                             CHECK (grade BETWEEN 9 AND 12),
  profile_photo  TEXT        NOT NULL DEFAULT '',
  attendance_count INTEGER   NOT NULL DEFAULT 0,
  volunteer_hours  NUMERIC(8,2) NOT NULL DEFAULT 0,
  push_token     TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.events (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT        NOT NULL,
  description TEXT        NOT NULL DEFAULT '',
  location    TEXT        NOT NULL DEFAULT '',
  start_time  TIMESTAMPTZ NOT NULL,
  end_time    TIMESTAMPTZ NOT NULL,
  type        TEXT        NOT NULL CHECK (type IN ('meeting','competition','social','deadline')),
  created_by  UUID        REFERENCES public.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RSVPs stored in a junction table (cleaner than an array column)
CREATE TABLE IF NOT EXISTS public.event_rsvps (
  event_id   UUID        NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (event_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.attendance (
  id        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_id  UUID        NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  method    TEXT        NOT NULL CHECK (method IN ('qr','manual')),
  UNIQUE (user_id, event_id)
);

CREATE TABLE IF NOT EXISTS public.scores (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_category TEXT        NOT NULL,
  score_type     TEXT        NOT NULL CHECK (score_type IN ('practice','competition')),
  score          NUMERIC(5,2) NOT NULL CHECK (score BETWEEN 0 AND 100),
  notes          TEXT,
  date           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.channels (
  id              TEXT    PRIMARY KEY,
  name            TEXT    NOT NULL,
  description     TEXT    NOT NULL DEFAULT '',
  icon            TEXT    NOT NULL DEFAULT '💬',
  is_announcement BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS public.forum_posts (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id     UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  channel_id    TEXT        NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  content       TEXT        NOT NULL,
  attachments   TEXT[]      NOT NULL DEFAULT '{}',
  reactions     JSONB       NOT NULL DEFAULT '{}',
  comment_count INTEGER     NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.comments (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID        NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  author_id  UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content    TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.resources (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT        NOT NULL,
  description TEXT        NOT NULL DEFAULT '',
  category    TEXT        NOT NULL,
  file_url    TEXT        NOT NULL,
  file_type   TEXT        NOT NULL DEFAULT '',
  uploaded_by UUID        REFERENCES public.users(id) ON DELETE SET NULL,
  is_featured BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.volunteer_hours (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID          NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title       TEXT          NOT NULL,
  description TEXT,
  hours       NUMERIC(6,2)  NOT NULL CHECK (hours > 0),
  proof_url   TEXT          NOT NULL DEFAULT '',
  status      TEXT          NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending','approved','rejected')),
  submitted_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  reviewed_by  UUID         REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_at  TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.announcements (
  id        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title     TEXT        NOT NULL,
  content   TEXT        NOT NULL,
  author_id UUID        REFERENCES public.users(id) ON DELETE SET NULL,
  is_pinned BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT        NOT NULL,
  body           TEXT        NOT NULL,
  type           TEXT        NOT NULL,
  target_user_id UUID        REFERENCES public.users(id) ON DELETE CASCADE,
  read           BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Returns the role of the currently authenticated user
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE SQL STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

-- Atomically increments attendance_count.
-- Callable by any authenticated user, so it is self-defending: only the
-- subject user or an officer/advisor may call it, and the result is capped
-- at the real number of recorded attendance rows so repeated/blind calls
-- can never inflate the count past reality.
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

-- Recomputes a user's total approved volunteer hours from the ledger.
-- Only officers/advisors may call it, and the total is derived from
-- public.volunteer_hours rows with status = 'approved' rather than trusting
-- a client-supplied hours value, so it cannot be used to fabricate hours.
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

-- Recomputes comment_count from the real rows in public.comments, so blind/
-- repeated RPC calls (this function has no way to check who's allowed to
-- comment) just settle to the true count instead of drifting arbitrarily.
CREATE OR REPLACE FUNCTION public.increment_comment_count(p_post_id UUID)
RETURNS VOID
LANGUAGE SQL SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.forum_posts
  SET comment_count = (SELECT COUNT(*) FROM public.comments WHERE post_id = p_post_id)
  WHERE id = p_post_id;
$$;

-- See increment_comment_count: recomputes rather than decrements blindly.
CREATE OR REPLACE FUNCTION public.decrement_comment_count(p_post_id UUID)
RETURNS VOID
LANGUAGE SQL SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.forum_posts
  SET comment_count = (SELECT COUNT(*) FROM public.comments WHERE post_id = p_post_id)
  WHERE id = p_post_id;
$$;

-- Auto-creates a public.users row when a new auth user is created.
-- Role always starts as 'member' — never trust raw_user_meta_data.role,
-- since that field is client-supplied at signup (auth.signUp options.data)
-- and would otherwise let anyone self-register as officer/advisor.
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

-- Attach trigger to auth schema
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Blocks non-advisors from changing role/email/attendance_count/volunteer_hours
-- on the users table. RLS policies below only restrict which ROWS a user can
-- update, not which COLUMNS — without this trigger, "users: can update own
-- profile" would let any member promote themselves to advisor.
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


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications   ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- RLS POLICIES
-- ============================================================

-- USERS
CREATE POLICY "users: authenticated can read all"
  ON public.users FOR SELECT TO authenticated USING (TRUE);

DROP POLICY IF EXISTS "users: can insert own profile" ON public.users;
CREATE POLICY "users: can insert own profile"
  ON public.users FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id AND role = 'member');

CREATE POLICY "users: can update own profile"
  ON public.users FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "users: advisors can update any profile"
  ON public.users FOR UPDATE TO authenticated
  USING (public.get_my_role() = 'advisor');

-- EVENTS
CREATE POLICY "events: authenticated can read"
  ON public.events FOR SELECT TO authenticated USING (TRUE);

DROP POLICY IF EXISTS "events: officers can insert" ON public.events;
CREATE POLICY "events: officers can insert"
  ON public.events FOR INSERT TO authenticated
  WITH CHECK (
    public.get_my_role() IN ('officer','advisor')
    AND (created_by = auth.uid() OR created_by IS NULL)
  );

CREATE POLICY "events: officers can update"
  ON public.events FOR UPDATE TO authenticated
  USING (public.get_my_role() IN ('officer','advisor'));

CREATE POLICY "events: officers can delete"
  ON public.events FOR DELETE TO authenticated
  USING (public.get_my_role() IN ('officer','advisor'));

-- EVENT_RSVPS
CREATE POLICY "rsvps: authenticated can read"
  ON public.event_rsvps FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "rsvps: users can add own RSVP"
  ON public.event_rsvps FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "rsvps: users can remove own RSVP"
  ON public.event_rsvps FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ATTENDANCE
CREATE POLICY "attendance: users see own; officers see all"
  ON public.attendance FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.get_my_role() IN ('officer','advisor'));

CREATE POLICY "attendance: users or officers can record"
  ON public.attendance FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR public.get_my_role() IN ('officer','advisor'));

CREATE POLICY "attendance: officers can update"
  ON public.attendance FOR UPDATE TO authenticated
  USING (public.get_my_role() IN ('officer','advisor'));

-- SCORES
CREATE POLICY "scores: users see own; officers see all"
  ON public.scores FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.get_my_role() IN ('officer','advisor'));

CREATE POLICY "scores: users can add own"
  ON public.scores FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "scores: users can delete own"
  ON public.scores FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- CHANNELS
CREATE POLICY "channels: authenticated can read"
  ON public.channels FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "channels: advisors can manage"
  ON public.channels FOR ALL TO authenticated
  USING (public.get_my_role() = 'advisor');

-- FORUM_POSTS
CREATE POLICY "posts: authenticated can read"
  ON public.forum_posts FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "posts: authenticated can create"
  ON public.forum_posts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "posts: author or officer can update"
  ON public.forum_posts FOR UPDATE TO authenticated
  USING (auth.uid() = author_id OR public.get_my_role() IN ('officer','advisor'));

CREATE POLICY "posts: author or officer can delete"
  ON public.forum_posts FOR DELETE TO authenticated
  USING (auth.uid() = author_id OR public.get_my_role() IN ('officer','advisor'));

-- COMMENTS
CREATE POLICY "comments: authenticated can read"
  ON public.comments FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "comments: authenticated can create"
  ON public.comments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "comments: author or officer can delete"
  ON public.comments FOR DELETE TO authenticated
  USING (auth.uid() = author_id OR public.get_my_role() IN ('officer','advisor'));

-- RESOURCES
CREATE POLICY "resources: authenticated can read"
  ON public.resources FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "resources: officers can manage"
  ON public.resources FOR ALL TO authenticated
  USING (public.get_my_role() IN ('officer','advisor'));

-- VOLUNTEER_HOURS
CREATE POLICY "volunteer: users see own; officers see all"
  ON public.volunteer_hours FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.get_my_role() IN ('officer','advisor'));

CREATE POLICY "volunteer: users can submit own"
  ON public.volunteer_hours FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Officers/advisors only — no self-service branch. The app never lets a
-- submitter edit their own pending row; a "can edit while pending" clause
-- here would let a member inflate hours/proof_url after submission but
-- before review, since RLS re-checks against the NEW row too.
DROP POLICY IF EXISTS "volunteer: officers can approve/reject" ON public.volunteer_hours;
CREATE POLICY "volunteer: officers can approve/reject"
  ON public.volunteer_hours FOR UPDATE TO authenticated
  USING (public.get_my_role() IN ('officer','advisor'));

-- ANNOUNCEMENTS
CREATE POLICY "announcements: authenticated can read"
  ON public.announcements FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "announcements: officers can manage"
  ON public.announcements FOR ALL TO authenticated
  USING (public.get_my_role() IN ('officer','advisor'));

-- NOTIFICATIONS
CREATE POLICY "notifications: users see own or broadcast"
  ON public.notifications FOR SELECT TO authenticated
  USING (
    target_user_id = auth.uid()
    OR target_user_id IS NULL
    OR public.get_my_role() IN ('officer','advisor')
  );

CREATE POLICY "notifications: officers can create"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (public.get_my_role() IN ('officer','advisor'));

CREATE POLICY "notifications: users can mark own as read"
  ON public.notifications FOR UPDATE TO authenticated
  USING (target_user_id = auth.uid());


-- ============================================================
-- STORAGE BUCKETS & POLICIES
-- ============================================================
-- If these buckets already exist in your project with different settings
-- (e.g. volunteer-proof created as public), the ON CONFLICT below will NOT
-- change the existing bucket — fix visibility manually in
-- Dashboard → Storage → (bucket) → Edit bucket.

INSERT INTO storage.buckets (id, name, public)
VALUES ('resources', 'resources', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('volunteer-proof', 'volunteer-proof', false)
ON CONFLICT (id) DO NOTHING;

-- resources: publicly readable (study guides etc.), only officers/advisors manage
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

-- volunteer-proof: private. Objects are stored under "<user_id>/<file>", so a
-- user may only touch their own folder; officers/advisors may read all
-- (needed for the approval queue) but not upload/delete on a user's behalf.
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
