-- ============================================================
-- DECA HQ — Bug fixes found during code audit
-- Run this in the Supabase SQL Editor against an ALREADY-DEPLOYED project.
-- (schema.sql has been updated to match — use that instead for a fresh project.)
--
-- Fixes:
--   1. Reacting to another member's forum post silently did nothing — the
--      "posts: author or officer can update" RLS policy only lets the post's
--      author (or an officer) UPDATE it, so a plain member's reaction update
--      was filtered to zero rows with no error. Adds a SECURITY DEFINER RPC
--      that any authenticated user can call to toggle their own reaction,
--      and does the read-modify-write atomically (closes a lost-update race
--      between two people reacting at the same moment).
-- ============================================================

CREATE OR REPLACE FUNCTION public.toggle_reaction(p_post_id UUID, p_emoji TEXT, p_add BOOLEAN)
RETURNS JSONB
LANGUAGE PLPGSQL SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reactions JSONB;
  v_users JSONB;
  v_uid TEXT := auth.uid()::text;
BEGIN
  SELECT reactions INTO v_reactions
  FROM public.forum_posts
  WHERE id = p_post_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Post not found';
  END IF;

  v_users := COALESCE(v_reactions->p_emoji, '[]'::jsonb);

  IF p_add THEN
    IF NOT (v_users @> to_jsonb(v_uid)) THEN
      v_users := v_users || to_jsonb(v_uid);
    END IF;
  ELSE
    SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb) INTO v_users
    FROM jsonb_array_elements(v_users) elem
    WHERE elem <> to_jsonb(v_uid);
  END IF;

  v_reactions := jsonb_set(COALESCE(v_reactions, '{}'::jsonb), ARRAY[p_emoji], v_users);

  UPDATE public.forum_posts SET reactions = v_reactions WHERE id = p_post_id;

  RETURN v_reactions;
END;
$$;
