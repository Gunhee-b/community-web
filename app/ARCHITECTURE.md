# Mobile App Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     INGK Community Mobile App                │
└─────────────────────────────────────────────────────────────┘

┌──────────────────── PRESENTATION LAYER ─────────────────────┐
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │             Expo Router (File-based)                │    │
│  │  app/                                               │    │
│  │  ├── (tabs)/          Tab Navigation               │    │
│  │  │   ├── index.tsx    Home Screen                  │    │
│  │  │   └── profile.tsx  Profile Screen               │    │
│  │  ├── auth/            Authentication               │    │
│  │  ├── meetings/        Meeting Screens              │    │
│  │  ├── questions/       Question Screens             │    │
│  │  └── admin/           Admin Screens                │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         React Native Components                     │    │
│  │  components/                                        │    │
│  │  ├── common/          Reusable UI components       │    │
│  │  ├── auth/            Auth components              │    │
│  │  ├── meetings/        Meeting components           │    │
│  │  └── questions/       Question components          │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└──────────────────────────────────────────────────────────────┘

                              ↓ ↑

┌────────────────── STATE MANAGEMENT LAYER ───────────────────┐
│                                                              │
│  ┌────────────────┐     ┌─────────────────┐               │
│  │ Zustand Stores │     │ TanStack Query  │               │
│  │                │     │ (Server State)  │               │
│  │ • authStore    │     │                 │               │
│  │ • notification │     │ • Caching       │               │
│  │   Store        │     │ • Refetching    │               │
│  └────────────────┘     │ • Optimistic UI │               │
│                         └─────────────────┘               │
│                                                              │
└──────────────────────────────────────────────────────────────┘

                              ↓ ↑

┌───────────────────── BUSINESS LOGIC LAYER ──────────────────┐
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              Custom Hooks                           │    │
│  │  hooks/                                             │    │
│  │  ├── useCamera.js         Camera & photos          │    │
│  │  ├── useImageUpload.js    Image uploads            │    │
│  │  ├── useMeetingChat.js    Real-time chat           │    │
│  │  ├── useMeetingParticipants.js  Participants       │    │
│  │  ├── useModal.js          Modal management         │    │
│  │  ├── useSupabaseQuery.js  DB queries               │    │
│  │  └── useToast.js          Notifications            │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │                 Utilities                           │    │
│  │  utils/                                             │    │
│  │  ├── auth.js           Authentication helpers      │    │
│  │  ├── date.js           Date formatting             │    │
│  │  ├── validation.js     Form validation             │    │
│  │  ├── storage-native.ts Local storage               │    │
│  │  ├── imageCrop.js      Image processing            │    │
│  │  └── imageResize.js    Image resizing              │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└──────────────────────────────────────────────────────────────┘

                              ↓ ↑

┌───────────────────── DATA ACCESS LAYER ─────────────────────┐
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              API Services (TypeScript)              │    │
│  │  services/api/                                      │    │
│  │  ├── auth.ts          Authentication API           │    │
│  │  ├── meetings.ts      Meetings API                 │    │
│  │  ├── questions.ts     Questions & Answers API      │    │
│  │  ├── chat.ts          Real-time Chat API           │    │
│  │  └── index.ts         Barrel exports               │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │            Supabase Client (Mobile)                 │    │
│  │  services/supabase.ts                               │    │
│  │  • SecureStore (Native)                             │    │
│  │  • AsyncStorage (Web)                               │    │
│  │  • Auto-refresh tokens                              │    │
│  │  • Session persistence                              │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└──────────────────────────────────────────────────────────────┘

                              ↓ ↑

┌──────────────────────── BACKEND ────────────────────────────┐
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │                  Supabase Cloud                     │    │
│  │                                                      │    │
│  │  ├── PostgreSQL Database                           │    │
│  │  │   • users, meetings, questions                  │    │
│  │  │   • meeting_chats, notifications                │    │
│  │  │   • voting_periods, posts                       │    │
│  │  │                                                  │    │
│  │  ├── Authentication                                │    │
│  │  │   • Email/Password (Local)                      │    │
│  │  │   • Google OAuth                                │    │
│  │  │   • Kakao OAuth                                 │    │
│  │  │   • Apple OAuth                                 │    │
│  │  │                                                  │    │
│  │  ├── Storage                                       │    │
│  │  │   • meeting-images                              │    │
│  │  │   • post-images                                 │    │
│  │  │   • answer-images                               │    │
│  │  │                                                  │    │
│  │  ├── Realtime                                      │    │
│  │  │   • Chat messages                               │    │
│  │  │   • Typing indicators                           │    │
│  │  │   • Read receipts                               │    │
│  │  │                                                  │    │
│  │  └── Functions (RPC)                               │    │
│  │      • login_user                                  │    │
│  │      • register_user                               │    │
│  │      • confirm_meeting                             │    │
│  │      • mark_meeting_chats_as_read                  │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### 1. Authentication Flow

```
User Input (Login Screen)
    ↓
Form Validation (utils/validation.js)
    ↓
API Call (services/api/auth.ts → loginWithEmail)
    ↓
Supabase Client (services/supabase.ts)
    ↓
Backend (Supabase Auth + RPC)
    ↓
Response
    ↓
Update Auth Store (store/authStore.js)
    ↓
Store in SecureStore (Platform-dependent)
    ↓
Navigate to Home (Expo Router)
```

### 2. Fetch Data Flow (e.g., Meetings List)

```
Component Mount (app/meetings/index.tsx)
    ↓
TanStack Query Hook
    ↓
API Service (services/api/meetings.ts → fetchMeetings)
    ↓
Supabase Query (services/supabase.ts)
    ↓
Backend (PostgreSQL)
    ↓
Response (Meeting[])
    ↓
Cache in TanStack Query
    ↓
Render UI (React Native Components)
```

### 3. Real-time Chat Flow

```
Send Message (Meeting Detail Screen)
    ↓
API Call (services/api/chat.ts → sendChatMessage)
    ↓
Insert to Database
    ↓
Supabase Realtime Trigger
    ↓
WebSocket Broadcast
    ↓
All Subscribed Clients Receive
    ↓
Custom Hook (hooks/useMeetingChat.js)
    ↓
Update Local State
    ↓
Re-render Chat UI
```

### 4. Image Upload Flow

```
User Selects Image (expo-image-picker)
    ↓
Optional: Crop/Resize (expo-image-manipulator)
    ↓
Validation (utils/storage-native.ts)
    ↓
Convert to Blob
    ↓
Upload (services/api/chat.ts → uploadChatImage)
    ↓
Supabase Storage
    ↓
Get Public URL
    ↓
Save URL to Database
    ↓
Display in UI
```

---

## State Management Strategy

### Global State (Zustand)
- **authStore**: User session, authentication status
- **notificationStore**: In-app notifications, unread counts

### Server State (TanStack Query)
- **Meetings**: List, details, participants
- **Questions**: Questions, answers
- **Chat**: Messages, typing indicators
- **Voting**: Periods, posts, votes

### Local State (React useState)
- Form inputs
- Modal visibility
- Loading states
- UI-specific state

---

## Storage Strategy

### SecureStore (Sensitive Data)
- Authentication tokens
- User credentials
- Session data

### AsyncStorage (Non-sensitive Data)
- User preferences
- Theme settings
- Cache data
- Zustand persistence

---

## Navigation Structure

```
Stack Navigator (Root)
  │
  ├── Auth Stack (Not Authenticated)
  │   ├── Login Screen
  │   ├── Signup Screen
  │   └── OAuth Callback Screen
  │
  └── Main App (Authenticated)
      │
      ├── Tab Navigator (Bottom Tabs)
      │   ├── Home Tab
      │   ├── Meetings Tab
      │   ├── Questions Tab
      │   └── Profile Tab
      │
      ├── Modal Screens
      │   ├── Create Meeting
      │   ├── Write Answer
      │   └── Settings
      │
      └── Detail Screens
          ├── Meeting Detail
          ├── Question Detail
          ├── User Profile
          └── Admin Screens
```

---

## Real-time Features

### Supabase Realtime Subscriptions

1. **Chat Messages**
   - Subscribe to `meeting_chats` table
   - Listen for INSERT events
   - Update UI in real-time

2. **Typing Indicators**
   - Subscribe to `meeting_typing_indicators` table
   - Show/hide typing status
   - Auto-expire after 10 seconds

3. **Read Receipts**
   - Subscribe to `meeting_chat_read_receipts` table
   - Show who read messages
   - Update in real-time

4. **Meeting Updates**
   - Subscribe to `offline_meetings` table
   - Show status changes (confirmed, cancelled)
   - Update participant count

---

## Security

### Authentication
- Supabase Auth handles all authentication
- Tokens stored in SecureStore (native) or AsyncStorage (web)
- Auto-refresh tokens

### Row-Level Security (RLS)
- All Supabase tables protected by RLS policies
- User can only access their own data
- Admin role for management features

### Data Validation
- Client-side validation (utils/validation.js)
- Server-side validation (Supabase RPC functions)
- Type safety with TypeScript

---

## Performance Optimizations

### Data Fetching
- TanStack Query caching
- Stale-while-revalidate strategy
- Background refetching
- Optimistic updates

### Images
- Resize before upload
- Compress images
- Progressive loading
- Cache with expo-image

### Navigation
- React Navigation optimizations
- Lazy loading screens
- Gesture-based navigation

### Offline Support
- AsyncStorage for critical data
- Queue failed requests
- Sync when online
- Optimistic UI updates

---

## Error Handling

### API Errors
```typescript
try {
  const { data, error } = await apiFunction();
  if (error) throw error;
  return data;
} catch (error) {
  console.error('Error:', error);
  showToast('Error message');
  return null;
}
```

### Network Errors
- Retry logic with TanStack Query
- Offline detection
- User-friendly error messages

### Validation Errors
- Display inline validation
- Form-level error handling
- Server error mapping

---

## Testing Strategy

### Unit Tests
- Utility functions (date, validation, auth)
- API services
- Custom hooks

### Integration Tests
- Screen navigation
- Form submissions
- API integration

### E2E Tests (Future)
- Detox for React Native
- Critical user flows

---

## Deployment

### Development
```bash
npm start          # Start Expo dev server
npm run ios        # Run on iOS simulator
npm run android    # Run on Android emulator
```

### Production Build
```bash
eas build --platform ios      # iOS build
eas build --platform android  # Android build
eas submit                     # Submit to stores
```

### Environment Management
- `.env.local` - Local development
- `.env.staging` - Staging environment
- `.env.production` - Production environment

---

## Monitoring

### Error Tracking (Future)
- Sentry for error monitoring
- Crash reporting
- Performance monitoring

### Analytics (Future)
- User behavior tracking
- Screen analytics
- Feature usage

---

*Last Updated: 2025-11-08*
