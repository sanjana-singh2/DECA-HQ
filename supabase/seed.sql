-- ============================================================
-- DECA HQ — Seed Data
-- Run after schema.sql in the Supabase SQL Editor
-- ============================================================

-- Default channels (matches src/constants/config.ts CHANNELS constant)
INSERT INTO public.channels (id, name, description, icon, is_announcement) VALUES
  ('announcements',   'Announcements',   'Official chapter announcements',    '📢', TRUE),
  ('general',         'General',         'General discussion',                '💬', FALSE),
  ('competition-prep','Competition Prep','Study tips and competition prep',   '🏆', FALSE),
  ('roleplay-help',   'Roleplay Help',   'Roleplay strategies and help',      '🎭', FALSE),
  ('fundraising',     'Fundraising',     'Fundraising ideas and updates',     '💰', FALSE)
ON CONFLICT (id) DO NOTHING;
