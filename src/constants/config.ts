export const CHANNELS = [
  { id: 'announcements',  name: 'Announcements',   icon: 'volume-2',       isAnnouncement: true,  description: 'Official chapter announcements' },
  { id: 'general',        name: 'General',          icon: 'message-circle', isAnnouncement: false, description: 'General discussion' },
  { id: 'competition-prep', name: 'Competition Prep', icon: 'award',        isAnnouncement: false, description: 'Study tips and competition prep' },
  { id: 'roleplay-help',  name: 'Roleplay Help',    icon: 'users',          isAnnouncement: false, description: 'Roleplay strategies and help' },
  { id: 'fundraising',    name: 'Fundraising',      icon: 'dollar-sign',    isAnnouncement: false, description: 'Fundraising ideas and updates' },
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
