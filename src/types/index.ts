// All date/time fields are ISO 8601 strings (from Supabase PostgreSQL)

export type UserRole = 'member' | 'officer' | 'advisor';

export interface User {
  uid: string;
  fullName: string;
  email: string;
  role: UserRole;
  grade: number;
  profilePhoto: string;
  attendanceCount: number;
  volunteerHours: number;
  createdAt: string;
}

export type EventType = 'meeting' | 'competition' | 'social' | 'deadline';

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
  type: EventType;
  createdBy: string;
  rsvpList?: string[];
}

export type AttendanceMethod = 'qr' | 'manual';

export interface Attendance {
  id: string;
  userId: string;
  eventId: string;
  timestamp: string;
  method: AttendanceMethod;
}

export type ScoreType = 'practice' | 'competition';

export interface Score {
  id: string;
  userId: string;
  eventCategory: string;
  scoreType: ScoreType;
  score: number;
  date: string;
  notes?: string;
}

export interface ForumPost {
  id: string;
  authorId: string;
  authorName: string;
  channelId: string;
  content: string;
  attachments: string[];
  createdAt: string;
  reactions?: Record<string, string[]>;
  commentCount?: number;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  fileUrl: string;
  fileType: string;
  uploadedBy: string;
  createdAt: string;
  isFeatured?: boolean;
}

export type VolunteerStatus = 'pending' | 'approved' | 'rejected';

export interface VolunteerHour {
  id: string;
  userId: string;
  title: string;
  description?: string;
  hours: number;
  proofUrl: string;
  status: VolunteerStatus;
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
  isPinned?: boolean;
}

// Navigation types
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Calendar: undefined;
  Forum: undefined;
  Resources: undefined;
  Profile: undefined;
};

