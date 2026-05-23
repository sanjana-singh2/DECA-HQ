export const APP_CONFIG = {
  name: 'DECA HQ',
  version: '1.0.0',
  supportEmail: 'support@decahq.app',
} as const;

export const CHANNELS = [
  { id: 'announcements', name: 'Announcements', icon: '📢', isAnnouncement: true, description: 'Official chapter announcements' },
  { id: 'general', name: 'General', icon: '💬', isAnnouncement: false, description: 'General discussion' },
  { id: 'competition-prep', name: 'Competition Prep', icon: '🏆', isAnnouncement: false, description: 'Study tips and competition prep' },
  { id: 'roleplay-help', name: 'Roleplay Help', icon: '🎭', isAnnouncement: false, description: 'Roleplay strategies and help' },
  { id: 'fundraising', name: 'Fundraising', icon: '💰', isAnnouncement: false, description: 'Fundraising ideas and updates' },
] as const;

export const RESOURCE_CATEGORIES = [
  'Study Guides',
  'Roleplay Examples',
  'Testing Strategies',
  'Officer Documents',
  'Fundraising Resources',
  'Competition Rules',
  'Practice Tests',
] as const;

export const DECA_EVENT_CATEGORIES = [
  'Accounting Applications Series',
  'Business Finance Series',
  'Business Management & Administration',
  'Entrepreneurship Series',
  'Finance Series',
  'Hospitality & Tourism',
  'Marketing Series',
  'Personal Financial Literacy',
  'Principles of Business',
  'Principles of Finance',
  'Principles of Hospitality & Tourism',
  'Principles of Marketing',
  'Public Speaking',
  'Team Decision Making',
] as const;

export const FIRESTORE_COLLECTIONS = {
  USERS: 'users',
  EVENTS: 'events',
  ATTENDANCE: 'attendance',
  SCORES: 'scores',
  RESOURCES: 'resources',
  FORUM_POSTS: 'forumPosts',
  CHANNELS: 'channels',
  COMMENTS: 'comments',
  VOLUNTEER_HOURS: 'volunteerHours',
  NOTIFICATIONS: 'notifications',
  ANNOUNCEMENTS: 'announcements',
} as const;
