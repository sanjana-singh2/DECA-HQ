# DECA HQ — Full Engineering Specification

Version 1.0

# Project Overview

DECA HQ is a centralized iPhone application for high school DECA chapters that replaces fragmented tools such as Google Sheets, Slack, and scattered documents with a unified organizational platform.

The app should be modern, scalable, fast, and intuitive for high school students.

Primary goals:

* Simplify chapter management
* Improve communication
* Increase student engagement
* Centralize all DECA operations
* Reduce officer administrative workload
* Modernize chapter infrastructure

The app should feel like a combination of:

* Discord
* Notion
* Google Classroom
* Canvas LMS

while maintaining a clean mobile-first design.

---

# TECH STACK

Frontend:

* React Native
* Expo
* TypeScript
* NativeWind (Tailwind CSS for React Native)

Backend:

* Firebase Authentication
* Firestore Database
* Firebase Storage
* Firebase Cloud Functions
* Firebase Cloud Messaging

Navigation:

* React Navigation

Charts:

* Victory Native or Recharts

State Management:

* React Context API
* Optional Redux later

Deployment:

* Expo EAS Build
* TestFlight

---

# DESIGN REQUIREMENTS

The UI should:

* support dark mode
* use modern card-based layouts
* feel clean and minimal
* prioritize mobile responsiveness
* use smooth animations
* avoid clutter

Design inspiration:

* Discord
* Notion
* Apple Human Interface Guidelines

Primary colors:

* DECA blue
* white
* dark gray

Typography:

* Inter font family

---

# USER ROLES

## Member

Permissions:

* view events
* check attendance
* access resources
* submit volunteer hours
* participate in forum
* view personal scores

## Officer

Permissions:

* all member permissions
* create/edit events
* approve volunteer hours
* manage attendance
* upload resources
* moderate forums
* post announcements

## Advisor

Permissions:

* full admin control
* analytics access
* manage officers
* export data

---

# APP FEATURES

# 1. AUTHENTICATION SYSTEM

Features:

* email/password login
* Google sign-in
* password reset
* persistent login session

Screens:

* LoginScreen
* RegisterScreen
* ForgotPasswordScreen

Database collection:
users

User schema:
{
uid: string
fullName: string
email: string
role: "member" | "officer" | "advisor"
grade: number
profilePhoto: string
attendanceCount: number
volunteerHours: number
createdAt: timestamp
}

---

# 2. DASHBOARD

Purpose:
Central home page for users.

Features:

* upcoming meetings
* announcements
* attendance summary
* volunteer hours summary
* quick actions
* event countdowns

Components:

* AnnouncementCard
* EventPreviewCard
* QuickActionButton
* StatsCard

---

# 3. CALENDAR SYSTEM

Purpose:
Centralized event management.

Features:

* monthly calendar
* event detail pages
* RSVP system
* push reminders
* Google Calendar sync
* officer-created events

Event schema:
{
id: string
title: string
description: string
location: string
startTime: timestamp
endTime: timestamp
type: "meeting" | "competition" | "social" | "deadline"
createdBy: uid
}

Screens:

* CalendarScreen
* EventDetailScreen
* CreateEventScreen

---

# 4. ATTENDANCE TRACKER

Purpose:
Replace Google Sheets attendance.

Features:

* QR code attendance
* manual attendance override
* attendance history
* attendance analytics

Attendance schema:
{
id: string
userId: string
eventId: string
timestamp: timestamp
method: "qr" | "manual"
}

Officer tools:

* generate QR code
* export attendance
* attendance leaderboard

Screens:

* AttendanceScreen
* QRScannerScreen
* AttendanceAnalyticsScreen

Components:

* QRScanner
* AttendanceList
* AttendanceCard

---

# 5. COMPETITION SCORE TRACKER

Purpose:
Track student competition preparation.

Features:

* practice test scores
* roleplay scores
* progress graphs
* analytics dashboard

Score schema:
{
id: string
userId: string
eventCategory: string
scoreType: "practice" | "competition"
score: number
date: timestamp
}

Graphs:

* score improvement over time
* average scores
* ranking comparisons

Screens:

* ScoresScreen
* AnalyticsScreen
* AddScoreScreen

---

# 6. FORUM / COMMUNICATION SYSTEM

Purpose:
Replace Slack.

Features:

* channels
* announcements
* comments
* reactions
* notifications
* file uploads

ForumPost schema:
{
id: string
authorId: string
channelId: string
content: string
attachments: string[]
createdAt: timestamp
}

Channels:

* announcements
* competition-prep
* roleplay-help
* fundraising
* general

Screens:

* ForumScreen
* ChannelScreen
* PostDetailScreen

Components:

* ForumPostCard
* CommentSection
* ChannelList

---

# 7. RESOURCE LIBRARY

Purpose:
Centralized educational resources.

Features:

* upload PDFs
* categorize resources
* search functionality
* save favorites
* preview files

Categories:

* study guides
* roleplay examples
* testing strategies
* officer documents
* fundraising resources

Resource schema:
{
id: string
title: string
description: string
category: string
fileUrl: string
uploadedBy: uid
}

Screens:

* ResourceLibraryScreen
* ResourceDetailScreen

---

# 8. VOLUNTEER HOURS SYSTEM

Purpose:
Track volunteer credits.

Features:

* submit hours
* upload proof
* officer approval workflow
* automatic totals

VolunteerHour schema:
{
id: string
userId: string
title: string
hours: number
proofUrl: string
status: "pending" | "approved" | "rejected"
}

Screens:

* VolunteerHoursScreen
* SubmitVolunteerHoursScreen
* ApprovalQueueScreen

---

# 9. PUSH NOTIFICATIONS

Features:

* meeting reminders
* announcements
* attendance confirmations
* competition reminders

Use:
Firebase Cloud Messaging

---

# 10. ANALYTICS SYSTEM

Purpose:
Give officers insights.

Features:

* attendance analytics
* active member rankings
* engagement metrics
* volunteer hour statistics

Charts:

* line graphs
* bar charts
* leaderboards

---

# FIREBASE DATABASE STRUCTURE

Collections:

* users
* events
* attendance
* scores
* resources
* forumPosts
* channels
* volunteerHours
* notifications

---

# FOLDER STRUCTURE

deca-hq/
│
├── assets/
├── docs/
├── firebase/
├── src/
├── tests/
├── scripts/
│
├── .env
├── package.json
├── app.json
├── tsconfig.json
├── README.md

---

# SOURCE STRUCTURE

src/
│
├── components/
├── screens/
├── navigation/
├── services/
├── hooks/
├── context/
├── utils/
├── constants/
├── types/
└── styles/

---

# COMPONENT REQUIREMENTS

All components should:

* use TypeScript
* be reusable
* use functional components
* use hooks
* support dark mode
* avoid inline styling when possible

---

# NAVIGATION STRUCTURE

Bottom Tab Navigation:

* Home
* Calendar
* Forum
* Resources
* Profile

Stack Navigators:

* Auth stack
* Main app stack
* Admin stack

---

# SECURITY REQUIREMENTS

Use Firebase security rules:

* only officers can edit events
* only advisors can manage officers
* users can only edit their own profile
* authenticated users only

---

# PERFORMANCE REQUIREMENTS

The app should:

* load quickly
* support offline caching where possible
* minimize re-renders
* lazy load heavy screens
* optimize Firestore reads

---

# MVP REQUIREMENTS

Phase 1 MVP should include:

* authentication
* dashboard
* calendar
* attendance tracking
* announcements

Later phases:

* forum
* analytics
* volunteer hours
* score tracking
* AI study assistant

---

# FUTURE FEATURES

Potential future additions:

* statewide chapter networking
* AI competition prep assistant
* integrated testing system
* officer election platform
* live competition leaderboard
* chapter ranking system
* sponsor portal

---

# DEVELOPMENT GUIDELINES

Code Style:

* strict TypeScript
* ESLint
* Prettier

Git Workflow:

* feature branches
* pull requests
* meaningful commits

Naming Conventions:

* PascalCase for components
* camelCase for functions
* kebab-case for folders

---

# REQUIRED PACKAGES

Install:

* expo
* react-native
* firebase
* react-navigation
* nativewind
* react-native-svg
* react-native-qrcode-svg
* expo-camera
* expo-notifications
* react-hook-form
* zod
* victory-native

---

# FIRST DEVELOPMENT PRIORITIES

1. Initialize Expo project
2. Configure Firebase
3. Create authentication flow
4. Build navigation system
5. Build dashboard
6. Create event calendar
7. Implement attendance QR system

---

# FINAL PRODUCT GOAL

The final app should:

* fully replace Google Sheets for DECA operations
* reduce officer workload
* improve member engagement
* modernize chapter infrastructure
* scale to multiple schools in the future

The app should feel polished enough to eventually support:

* thousands of users
* multiple chapters
* statewide deployment

End of Specification
