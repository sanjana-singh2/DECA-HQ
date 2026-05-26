# DECA HQ — Engineering Specification

Version 2.0 · Updated May 2026

---

# Project Overview

DECA HQ is a centralized mobile application for high school DECA chapters that replaces fragmented tools (Google Sheets, Slack, scattered documents) with a unified organizational platform.

Primary goals:

* Simplify chapter management
* Improve communication and member engagement
* Centralize all DECA operations in one place
* Reduce officer administrative workload
* Modernize chapter infrastructure

---

# TECH STACK

**Frontend**

* React Native 0.81 + Expo SDK 54
* TypeScript (strict mode)
* NativeWind v4 (Tailwind for React Native) — used selectively; most styling uses React Native inline style objects for precise color control
* expo-linear-gradient for gradient hero sections
* @expo-google-fonts/inter (Inter 400/500/600/700)
* @expo-google-fonts/dm-serif-display (DMSerifDisplay 400Regular) — editorial headings

**Backend**

* Supabase (PostgreSQL, Auth, Storage, Realtime) — replaces original Firebase spec
* @supabase/supabase-js v2

**Navigation**

* @react-navigation/native
* @react-navigation/bottom-tabs
* @react-navigation/native-stack

**Forms & Validation**

* react-hook-form + zod + @hookform/resolvers

**Other Libraries**

* date-fns — date formatting
* react-native-qrcode-svg — QR code generation
* expo-camera — QR scanning
* expo-image-picker — proof photo upload
* expo-notifications — push notifications
* react-native-gesture-handler, react-native-reanimated, react-native-screens

**Deployment**

* Expo EAS Build
* EAS Submit → App Store + Google Play
* EAS Update for OTA updates

---

# DESIGN SYSTEM

## Color Palette

The app uses a warm editorial aesthetic: cream backgrounds, soft lavender accents, and DM Serif Display for headings.

```
Background (main):  #F5F0E8   (warm cream)
Surface / cards:    #FDFAF5   (off-white)
Border:             #EDE8DF   (light sand)

Text primary:       #1A1612
Text secondary:     #6B6560
Text muted:         #A09A94
Text inverse:       #FDFAF5

Accent lavender:    #756FC9   (primary CTA, active states)
Accent lav light:   #E3E2F5   (icon backgrounds, badges)
Accent lav faint:   #F0EFF9   (info banners)

Success:            #6FAF8A
Warning:            #C9946F
Danger:             #C96F6F
```

Event type colors:
```
meeting:      #756FC9 (lavender)
competition:  #C96F9A (rose)
social:       #6FAF8A (sage)
deadline:     #C9946F (amber)
```

Gradient hero (used on Dashboard, Attendance, Scores, Resource Detail, Event Detail):
```
['#D4D3ED', '#C5C8E8', '#CBBFE8']   (soft periwinkle sweep)
```

## Typography

* **DM Serif Display** — screen titles, large numbers, hero headings (`fontFamily: 'DMSerifDisplay_400Regular'`)
* **Inter 500** — tab bar labels
* **Inter 600** — card titles, button labels, section headers
* **Inter 400** — body text, descriptions

## Component Patterns

Section labels: `fontSize: 11, fontWeight: '600', color: '#A09A94', letterSpacing: 0.8, textTransform: 'uppercase'`

Cards: `backgroundColor: '#FDFAF5', borderRadius: 16–20, padding: 16–18` (no border, no shadow)

Primary button: `backgroundColor: '#756FC9', borderRadius: 16, paddingVertical: 16`

Danger button: `backgroundColor: '#FEF2F2', borderColor: '#FECACA', borderWidth: 1`

Inputs: `backgroundColor: '#FDFAF5', borderColor: '#EDE8DF', borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14`

Pill/badge: `backgroundColor: '#E3E2F5', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3` with `color: '#756FC9'`

---

# USER ROLES

## Member

* View events, RSVP
* Check personal attendance history
* Scan QR code at meetings
* Submit credits (volunteer hours) with photo proof
* Access resource library
* Participate in forum channels
* View and log personal competition scores

## Officer

* All member permissions
* Create/edit/delete events
* Generate QR attendance codes
* Approve or reject credit submissions (ApprovalQueue)
* Upload resources to library
* Post in announcement channels
* Moderate forum (delete posts)

## Advisor

* Full admin control
* Analytics access
* Manage officers

---

# APP FEATURES

## 1. AUTHENTICATION

Screens: `LoginScreen`, `RegisterScreen`, `ForgotPasswordScreen`

* Supabase email/password auth
* Persistent session via AsyncStorage
* Grade selector on registration (9–12)
* Gradient hero header on all auth screens (same lavender sweep)

User schema (Supabase `users` table):
```
uid:             string (UUID)
fullName:        string
email:           string
role:            'member' | 'officer' | 'advisor'
grade:           number
profilePhoto:    string
attendanceCount: number
volunteerHours:  number   -- displayed as "Credits" in UI
createdAt:       timestamp
push_token:      string
```

> **UI note:** The `volunteerHours` field is labeled "Credits" everywhere in the UI. The TypeScript type name `VolunteerHour` is unchanged.

---

## 2. DASHBOARD

Screen: `DashboardScreen`

* LinearGradient hero with greeting + chapter name in DM Serif Display
* Stats row: Meetings attended · Credits earned · Grade
* Upcoming events list (`EventPreviewCard`)
* Announcements (`AnnouncementCard`)
* Quick actions grid (`QuickActionButton`): Scan QR, Credits, Scores, Calendar, Resources, Forum

Components:
* `StatsCard` — cream card, DM Serif value, muted label
* `QuickActionButton` — tinted icon circle + label
* `AnnouncementCard` — cream card, lavender "Pinned" badge
* `EventPreviewCard` — cream card with colored left accent bar

---

## 3. CALENDAR

Screens: `CalendarScreen`, `EventDetailScreen`, `CreateEventScreen`

* Full month grid with event dot indicators (colored by event type)
* Month navigation arrows
* Filter pills: All / meeting / competition / social / deadline
* RSVP system
* QR code display for officers (EventDetailScreen)
* Event creation form for officers (CreateEventScreen)

Event schema:
```
id:          string
title:       string
description: string
location:    string
startTime:   timestamp
endTime:     timestamp
type:        'meeting' | 'competition' | 'social' | 'deadline'
createdBy:   uid
rsvpList:    string[]
```

---

## 4. ATTENDANCE TRACKER

Screens: `AttendanceScreen`, `QRScannerScreen`

* LinearGradient hero showing total meetings attended (large DM Serif number)
* Upcoming events list with "Scan QR" tap target
* Attendance history list (`AttendanceCard`)
* QR scanner via expo-camera

Attendance schema:
```
id:        string
userId:    string
eventId:   string
timestamp: timestamp
method:    'qr' | 'manual'
```

Component: `AttendanceCard` — icon circle (📷 or ✏️), event title, formatted timestamp, method badge

---

## 5. SCORES TRACKER

Screens: `ScoresScreen`, `AddScoreScreen`

* LinearGradient hero with average score in DM Serif Display
* Practice vs competition toggle
* DECA event category picker (scrollable list)
* Score history list sorted by date
* Progress tracking

Score schema:
```
id:            string
userId:        string
eventCategory: string
scoreType:     'practice' | 'competition'
score:         number (0–100)
notes:         string
date:          timestamp
```

---

## 6. FORUM / COMMUNICATION

Screens: `ForumScreen`, `ChannelScreen`, `PostDetailScreen`

* Channel list with icon circles and "Officers only" amber badge for announcement channels
* Message thread (inverted FlatList) with lavender avatar initials
* Post composer with lavender send button
* Comment thread on PostDetailScreen
* Delete posts (author or officer)

ForumPost schema:
```
id:           string
authorId:     string
channelId:    string
content:      string
attachments:  string[]
reactions:    Record<string, string[]>
commentCount: number
createdAt:    timestamp
```

Default channels: announcements · competition-prep · roleplay-help · fundraising · general

Components: `ForumPostCard`

---

## 7. RESOURCE LIBRARY

Screens: `ResourceLibraryScreen`, `ResourceDetailScreen`

* Search bar + category filter pills
* File type icons: 📄 pdf · 📝 doc/docx · 📊 ppt/pptx · 📁 default
* Detail screen with gradient hero, description, open file (Linking.openURL) and delete (officers)

Resource schema:
```
id:          string
title:       string
description: string
category:    string
fileUrl:     string
uploadedBy:  uid
createdAt:   timestamp
```

---

## 8. CREDITS SYSTEM (Volunteer Hours)

Screens: `VolunteerHoursScreen`, `SubmitVolunteerHoursScreen`, `ApprovalQueueScreen`

> All user-facing text uses "Credits" instead of "Volunteer Hours". The TypeScript type `VolunteerHour` and database column names are unchanged.

* LinearGradient hero with ⭐ total approved credits (DM Serif large number)
* Submit form: title, description, hours, proof photo upload
* Officer approval queue: approve (green) / reject (red) with proof image preview

VolunteerHour schema:
```
id:          string
userId:      string
title:       string
description: string
hours:       number
proofUrl:    string
status:      'pending' | 'approved' | 'rejected'
submittedAt: timestamp
approvedBy:  uid
```

---

## 9. PUSH NOTIFICATIONS

Service: `notificationsService.ts`

* Expo Notifications (expo-notifications ~0.32)
* Push token saved to `users.push_token` on registration
* Scheduled reminders via `Notifications.scheduleNotificationAsync` with `SchedulableTriggerInputTypes.DATE`
* Notification handler sets `shouldShowAlert`, `shouldPlaySound`, `shouldSetBadge`, `shouldShowBanner`, `shouldShowList`

---

# NAVIGATION STRUCTURE

```
AuthStack
  └── LoginScreen
  └── RegisterScreen
  └── ForgotPasswordScreen

MainNavigator (Bottom Tabs)
  ├── Home (HomeStack)
  │     ├── DashboardScreen
  │     ├── AttendanceScreen
  │     ├── QRScannerScreen
  │     ├── VolunteerHoursScreen  ("Credits" in UI)
  │     ├── SubmitVolunteerHoursScreen
  │     ├── ApprovalQueueScreen
  │     ├── ScoresScreen
  │     └── AddScoreScreen
  │
  ├── Calendar (CalendarStack)
  │     ├── CalendarScreen
  │     ├── EventDetailScreen
  │     └── CreateEventScreen
  │
  ├── Forum (ForumStack)
  │     ├── ForumScreen
  │     ├── ChannelScreen
  │     └── PostDetailScreen
  │
  ├── Resources (ResourceStack)
  │     ├── ResourceLibraryScreen
  │     └── ResourceDetailScreen
  │
  └── Profile
        └── ProfileScreen
```

Tab bar: cream background `#F5F0E8`, lavender active `#756FC9`, muted inactive `#A09A94`, no shadow/elevation.

---

# FOLDER STRUCTURE

```
/Users/sanjana/DECA/
├── App.tsx                        # Font loading, AuthProvider, ThemeProvider, navigation root
├── app.json
├── package.json
├── tsconfig.json
├── tailwind.config.js             # cream + lav color palettes, serif font families
│
└── src/
    ├── components/
    │   ├── AnnouncementCard.tsx
    │   ├── AttendanceCard.tsx
    │   ├── EventPreviewCard.tsx
    │   ├── ForumPostCard.tsx
    │   ├── QuickActionButton.tsx
    │   └── StatsCard.tsx
    │
    ├── constants/
    │   ├── colors.ts              # Colors (light/dark), EventTypeColors, GradientHero
    │   └── config.ts              # CHANNELS, RESOURCE_CATEGORIES, DECA_EVENT_CATEGORIES
    │
    ├── context/
    │   ├── AuthContext.tsx        # Supabase session + userProfile
    │   └── ThemeContext.tsx       # light/dark/system mode, colors object
    │
    ├── hooks/
    │   ├── useAuth.ts
    │   ├── useEvents.ts
    │   └── ...
    │
    ├── navigation/
    │   ├── AuthNavigator.tsx
    │   └── MainNavigator.tsx
    │
    ├── screens/
    │   ├── attendance/
    │   │   ├── AttendanceScreen.tsx
    │   │   └── QRScannerScreen.tsx
    │   ├── auth/
    │   │   ├── ForgotPasswordScreen.tsx
    │   │   ├── LoginScreen.tsx
    │   │   └── RegisterScreen.tsx
    │   ├── calendar/
    │   │   ├── CalendarScreen.tsx
    │   │   ├── CreateEventScreen.tsx
    │   │   └── EventDetailScreen.tsx
    │   ├── dashboard/
    │   │   └── DashboardScreen.tsx
    │   ├── forum/
    │   │   ├── ChannelScreen.tsx
    │   │   ├── ForumScreen.tsx
    │   │   └── PostDetailScreen.tsx
    │   ├── profile/
    │   │   └── ProfileScreen.tsx
    │   ├── resources/
    │   │   ├── ResourceDetailScreen.tsx
    │   │   └── ResourceLibraryScreen.tsx
    │   ├── scores/
    │   │   ├── AddScoreScreen.tsx
    │   │   └── ScoresScreen.tsx
    │   └── volunteer/
    │       ├── ApprovalQueueScreen.tsx
    │       ├── SubmitVolunteerHoursScreen.tsx
    │       └── VolunteerHoursScreen.tsx
    │
    ├── services/
    │   ├── attendanceService.ts
    │   ├── eventsService.ts
    │   ├── forumService.ts
    │   ├── notificationsService.ts
    │   ├── resourcesService.ts
    │   ├── scoresService.ts
    │   ├── supabase.ts
    │   └── volunteerService.ts
    │
    ├── types/
    │   └── index.ts               # All shared TypeScript types
    │
    └── utils/
        ├── formatters.ts
        └── validators.ts          # Zod schemas for forms
```

---

# SECURITY

* Supabase Row Level Security (RLS) on all tables
* Officers only: create/edit events, approve credits, delete resources/posts
* Users can only read/write their own attendance and scores
* Authenticated users only for all protected routes

---

# PERFORMANCE

* Lazy loading per screen stack
* Supabase query pagination where applicable
* RefreshControl pull-to-refresh on list screens
* Minimal re-renders via local state + service layer

---

# DEVELOPMENT COMMANDS

```bash
# Start Expo dev server
npx expo start

# Type check
npx tsc --noEmit

# Lint
npm run lint

# Format
npm run format

# Build for production (EAS)
eas build --platform ios
eas build --platform android

# Submit to stores
eas submit --platform ios
eas submit --platform android

# OTA update
eas update --branch production --message "..."
```

---

# MVP STATUS

All core features are fully scaffolded and functional:

✅ Authentication (login, register, forgot password)
✅ Dashboard with stats, announcements, quick actions
✅ Calendar with monthly grid, RSVP, event creation (officers)
✅ Attendance tracking with QR scanner
✅ Competition score tracker with categories
✅ Forum with channels, posts, comments, reactions
✅ Resource library with search and category filters
✅ Credits system (volunteer hours) with approval workflow
✅ Profile screen with dark mode toggle
✅ Push notification scheduling

Remaining for full production:

⬜ Supabase project setup + environment variables (`.env`)
⬜ Apple Developer account + App Store Connect
⬜ Google Play Console account
⬜ EAS project configuration (`eas.json`)
⬜ `app.json` bundle ID configuration
⬜ Date/time picker integration (currently uses default values)
⬜ Analytics dashboard screen

---

# FUTURE FEATURES

* Statewide chapter networking
* AI competition prep assistant
* Integrated practice testing system
* Officer election platform
* Live competition leaderboard
* Chapter ranking system
* Sponsor portal

---

End of Specification v2.0
