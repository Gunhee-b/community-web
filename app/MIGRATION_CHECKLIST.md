# Web to Mobile Migration Checklist

This document outlines the migration plan for converting the React web application to React Native.

## Project Analysis Summary

### Total Files Analyzed
- **Utils**: 10 files
- **Hooks**: 7 files
- **Pages**: 19 files
- **Components**: 13+ files
- **Store**: 2 files

---

## ✅ Completed Migrations

### 1. Infrastructure & Configuration
- [x] Created Expo project with TypeScript
- [x] Set up Expo Router for file-based navigation
- [x] Configured Supabase client for React Native
- [x] Added AsyncStorage and SecureStore
- [x] Created type definitions

### 2. Services Created
- [x] `services/supabase.ts` - React Native compatible Supabase client
- [x] `services/api/auth.ts` - Authentication API
- [x] `services/api/meetings.ts` - Meetings API
- [x] `services/api/questions.ts` - Questions & Answers API
- [x] `services/api/chat.ts` - Real-time chat API

### 3. Storage Utilities
- [x] `utils/storage-native.ts` - AsyncStorage & SecureStore wrapper
- [x] Replaced Capacitor Preferences with Expo SecureStore
- [x] Replaced localStorage with AsyncStorage

---

## 📋 Ready to Migrate (Reusable Code)

### Utils (Already in /app/utils)
These files are mostly platform-agnostic and can be used with minor modifications:

#### ✅ Fully Reusable
- [x] `auth.js` - Authentication helpers (already migrated)
- [x] `date.js` - Date formatting utilities
- [x] `validation.js` - Form validation functions

#### ⚠️ Needs Minor Updates
- [ ] `storage.js` - **Replace with `storage-native.ts`**
  - Replace localStorage → AsyncStorage
  - All functions need async/await

- [ ] `secureStorage.js` - **Replace with `storage-native.ts`**
  - Replace Capacitor Preferences → Expo SecureStore
  - Update Platform detection

- [ ] `notifications.js` - **Needs major update**
  - Replace Capacitor PushNotifications → Expo Notifications
  - Replace window.location navigation → React Navigation
  - Add React Navigation linking configuration

- [ ] `socialAuth.js` - **Needs update**
  - Replace window.location → Expo AuthSession
  - Replace Capacitor Browser → Expo WebBrowser
  - Update OAuth redirect URLs for mobile

- [ ] `imageCrop.js` - **Needs React Native library**
  - Replace react-easy-crop → expo-image-manipulator or similar
  - Update canvas operations

- [ ] `imageResize.js` - **Needs React Native library**
  - Replace canvas operations → expo-image-manipulator
  - Update file handling for React Native

### Hooks (Already in /app/hooks)
- [x] `useModal.js` - Ready to use
- [x] `useToast.js` - Needs RN toast library (react-native-toast-message)
- [x] `useSupabaseQuery.js` - Ready to use
- [ ] `useCamera.js` - **Update to use expo-camera or expo-image-picker**
- [ ] `useImageUpload.js` - **Update file handling for RN**
- [ ] `useMeetingChat.js` - **Already compatible, minor updates**
- [ ] `useMeetingParticipants.js` - **Ready to use**

### Store (Already in /app/store)
- [ ] `authStore.js` - **Needs minor updates**
  - Update persist middleware for AsyncStorage
  - Remove window references

- [ ] `notificationStore.js` - **Ready to use**

---

## 🔄 Needs Conversion (Web-Specific Code)

### Components - Web Specific
These components use web-only APIs and need React Native equivalents:

#### Navigation Components
- [ ] `components/common/MainLayout.jsx`
  - Replace React Router → Expo Router layout
  - Replace HTML tags → React Native components
  - Convert Tailwind CSS → StyleSheet or NativeWind

- [ ] `components/common/AdminLayout.jsx`
  - Same as MainLayout
  - Add drawer navigation or tab navigation

#### UI Components (Need React Native conversion)
- [ ] `components/common/Button.jsx`
  - Replace `<button>` → `<Pressable>` or `<TouchableOpacity>`
  - Convert Tailwind → StyleSheet

- [ ] `components/common/Card.jsx`
  - Replace `<div>` → `<View>`
  - Convert Tailwind → StyleSheet

- [ ] `components/common/Input.jsx`
  - Replace `<input>` → `<TextInput>`
  - Convert Tailwind → StyleSheet

- [ ] `components/common/Modal.jsx`
  - Replace HTML modal → React Native Modal component

- [ ] `components/common/Loading.jsx`
  - Replace HTML → `<ActivityIndicator>`

- [ ] `components/common/NotificationBell.jsx`
  - Replace HTML → React Native components
  - Convert CSS → StyleSheet

#### Web-Only Components (Skip or Reimplement)
- [ ] `components/common/PWAInstallPrompt.jsx` - **NOT NEEDED** (mobile app)
- [ ] `components/common/AppUrlListener.jsx` - **Reimplement with Expo Linking**

#### Feature-Specific Components
- [ ] `components/meetings/NaverMapSearch.jsx`
  - Replace with react-native-maps
  - Use Expo Location API
  - May need different map provider (Google Maps, Apple Maps)

- [ ] `components/meetings/LocationMapPreview.jsx`
  - Replace with react-native-maps

- [ ] `components/meetings/ImageAdjustModal.jsx`
  - Update to use expo-image-manipulator
  - Replace canvas → RN image manipulation

- [ ] `components/questions/TodayQuestionBanner.jsx`
  - Convert to React Native components

- [ ] `components/auth/SocialLoginButtons.jsx`
  - Update OAuth flow for mobile
  - Use Expo AuthSession

### Pages (Need Complete Rewrite as Screens)
All pages need to be converted to React Native screens with Expo Router:

#### Authentication Screens
- [ ] `pages/auth/LoginPage.jsx` → `app/auth/login.tsx`
- [ ] `pages/auth/SignupPage.jsx` → `app/auth/signup.tsx`
- [ ] `pages/auth/CallbackPage.jsx` → `app/auth/callback.tsx`
- [ ] `pages/auth/LinkAccountPage.jsx` → `app/auth/link-account.tsx`

#### Main Screens
- [ ] `pages/HomePage.jsx` → `app/(tabs)/index.tsx`
- [ ] `pages/ProfilePage.jsx` → `app/(tabs)/profile.tsx`

#### Meeting Screens
- [ ] `pages/meetings/MeetingsPage.jsx` → `app/meetings/index.tsx`
- [ ] `pages/meetings/MeetingDetailPage.jsx` → `app/meetings/[id].tsx`
- [ ] `pages/meetings/CreateMeetingPage.jsx` → `app/meetings/create.tsx`

#### Question Screens
- [ ] `pages/questions/QuestionsListPage.jsx` → `app/questions/index.tsx`
- [ ] `pages/questions/QuestionDetailPage.jsx` → `app/questions/[id].tsx`
- [ ] `pages/questions/WriteAnswerPage.jsx` → `app/questions/[id]/answer.tsx`

#### Voting Screens
- [ ] `pages/voting/VotePage.jsx` → `app/voting/index.tsx`
- [ ] `pages/voting/NominatePage.jsx` → `app/voting/nominate.tsx`
- [ ] `pages/voting/BestPostsPage.jsx` → `app/voting/best-posts.tsx`

#### Admin Screens
- [ ] `pages/admin/AdminDashboardPage.jsx` → `app/admin/index.tsx`
- [ ] `pages/admin/AdminMeetingsPage.jsx` → `app/admin/meetings.tsx`
- [ ] `pages/admin/AdminQuestionsPage.jsx` → `app/admin/questions.tsx`
- [ ] `pages/admin/AdminUsersPage.jsx` → `app/admin/users.tsx`
- [ ] `pages/admin/AdminVotesPage.jsx` → `app/admin/votes.tsx`
- [ ] `pages/admin/AdminInvitesPage.jsx` → `app/admin/invites.tsx`

---

## 🚫 Web-Specific Code to Remove/Replace

### 1. DOM APIs (Not available in React Native)
- `window.location` → Use Expo Router navigation
- `document.*` → Not available
- `localStorage` → AsyncStorage
- `sessionStorage` → AsyncStorage

### 2. Browser APIs
- `navigator.geolocation` → Expo Location
- `FileReader` → React Native file handling
- `canvas` operations → expo-image-manipulator
- `URL` constructor (for some cases) → May need polyfill

### 3. Web Components
- All HTML elements (`<div>`, `<button>`, `<input>`, etc.) → React Native components
- CSS/Tailwind classes → StyleSheet or NativeWind

### 4. Libraries to Replace
- `react-router-dom` → Expo Router (already set up)
- `react-easy-crop` → expo-image-manipulator
- `@capacitor/*` → Expo equivalents
  - `@capacitor/camera` → expo-camera / expo-image-picker
  - `@capacitor/push-notifications` → expo-notifications
  - `@capacitor/preferences` → expo-secure-store / AsyncStorage
  - `@capacitor/browser` → expo-web-browser

---

## 📦 New Dependencies Needed

### UI & Styling
```bash
npm install nativewind  # Tailwind for React Native (optional)
npm install react-native-toast-message  # Toast notifications
npm install react-native-gesture-handler  # Gestures
```

### Maps & Location
```bash
npm install react-native-maps  # Maps
npm install expo-location  # Geolocation
```

### Camera & Images
```bash
npm install expo-camera  # Camera access
npm install expo-image-picker  # Image picker
npm install expo-image-manipulator  # Image cropping/resizing
```

### Notifications
```bash
npm install expo-notifications  # Push notifications
```

### Authentication
```bash
npm install expo-auth-session  # OAuth flows
npm install expo-web-browser  # In-app browser
```

### Other
```bash
npm install react-native-safe-area-context  # Safe areas
npm install @react-native-community/datetimepicker  # Date picker
npm install react-native-modal  # Improved modals
```

---

## 🎯 Migration Priority

### Phase 1: Core Infrastructure (Completed ✅)
- [x] Project setup
- [x] Supabase configuration
- [x] Storage utilities
- [x] API services
- [x] Type definitions

### Phase 2: Authentication & User Management
1. [ ] Update `authStore.js` for AsyncStorage
2. [ ] Create login screen
3. [ ] Create signup screen
4. [ ] Implement social OAuth (Google, Kakao, Apple)
5. [ ] Create profile screen
6. [ ] Test authentication flow

### Phase 3: Core Features
1. [ ] Home screen
2. [ ] Meetings list screen
3. [ ] Meeting detail screen
4. [ ] Create meeting screen
5. [ ] Real-time chat
6. [ ] Image upload functionality

### Phase 4: Questions & Answers
1. [ ] Questions list screen
2. [ ] Question detail screen
3. [ ] Write answer screen
4. [ ] Today's question banner

### Phase 5: Additional Features
1. [ ] Voting screens
2. [ ] Notifications
3. [ ] Maps integration
4. [ ] Camera integration

### Phase 6: Admin Features
1. [ ] Admin dashboard
2. [ ] Admin management screens

### Phase 7: Polish & Optimization
1. [ ] Add loading states
2. [ ] Error handling
3. [ ] Offline support
4. [ ] Performance optimization
5. [ ] Testing on iOS and Android

---

## 🔍 Key Web-Specific Issues Found

### 1. Window & Document References
**Files affected:**
- `utils/socialAuth.js` (lines 13, 64, 96)
- `utils/notifications.js` (lines 96, 102, 108, 113)

**Solution:** Replace with React Navigation or Expo Router

### 2. localStorage Usage
**Files affected:**
- `utils/secureStorage.js` (lines 23, 42, 59, 75, 93)
- `store/authStore.js` (implicit through zustand persist)

**Solution:** Use AsyncStorage or SecureStore

### 3. File/Canvas Operations
**Files affected:**
- `utils/imageCrop.js`
- `utils/imageResize.js`
- `hooks/useImageUpload.js`

**Solution:** Use expo-image-manipulator

### 4. Capacitor Dependencies
**Files affected:**
- `utils/secureStorage.js`
- `utils/notifications.js`
- `utils/socialAuth.js`
- `hooks/useCamera.js`

**Solution:** Replace with Expo equivalents

---

## 📝 Implementation Notes

### Navigation
- Use Expo Router for file-based navigation (already set up)
- Deep linking configured via `app.json`
- Use `router.push()`, `router.back()`, `router.replace()`

### Styling
Two options:
1. **StyleSheet (recommended for learning)**
2. **NativeWind (Tailwind for RN, easier migration)**

### State Management
- Zustand stores work the same
- Update persist middleware to use AsyncStorage
- TanStack Query works the same

### Real-time Features
- Supabase realtime works the same
- Polling intervals work the same
- May need to handle app state (background/foreground)

### Image Handling
- Use `expo-image-picker` for selecting images
- Use `expo-camera` for camera access
- Use `expo-image-manipulator` for cropping/resizing
- Upload to Supabase storage the same way

### Push Notifications
- Use `expo-notifications` instead of Capacitor
- Register for push token
- Handle notifications in foreground/background
- Deep link from notifications

---

## 🚀 Quick Start Guide

1. **Install new dependencies:**
   ```bash
   cd app
   npm install expo-notifications expo-image-picker expo-camera expo-image-manipulator react-native-maps expo-location react-native-toast-message nativewind
   ```

2. **Update existing files:**
   - Replace `utils/storage.js` with `utils/storage-native.ts`
   - Update `store/authStore.js` to use AsyncStorage
   - Update `utils/socialAuth.js` for Expo

3. **Start building screens:**
   - Begin with `app/auth/login.tsx`
   - Copy logic from web, replace UI with RN components
   - Test on iOS and Android simulators

4. **Test frequently:**
   ```bash
   npm run ios      # Test on iOS
   npm run android  # Test on Android
   ```

---

## ✅ Success Criteria

- [ ] User can login/signup
- [ ] User can view meetings list
- [ ] User can view meeting details
- [ ] User can join/leave meetings
- [ ] User can participate in real-time chat
- [ ] User can answer daily questions
- [ ] User can vote on posts
- [ ] Push notifications work
- [ ] Image upload works
- [ ] App works offline (basic functionality)
- [ ] App runs smoothly on iOS
- [ ] App runs smoothly on Android

---

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Supabase React Native Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)
- [NativeWind](https://www.nativewind.dev/) (optional)
