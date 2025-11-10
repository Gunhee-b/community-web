# Project Structure Overview

This document provides an overview of the reorganized project structure after splitting web and mobile applications.

## Directory Structure

```
vote-example/
├── web/                    # Web application (Vite + React)
│   ├── src/               # Web source code
│   ├── public/            # Static assets
│   ├── supabase/          # Database migrations and functions
│   ├── package.json       # Web dependencies
│   ├── vite.config.js     # Vite configuration
│   └── ...                # Other web configs
│
└── app/                    # Mobile application (React Native + Expo)
    ├── app/               # Screens (Expo Router)
    │   ├── (tabs)/       # Tab navigation
    │   ├── _layout.tsx   # Root layout
    │   └── ...
    ├── components/        # Reusable components
    ├── services/          # API and business logic
    │   └── supabase.js   # Supabase client
    ├── hooks/            # Custom React hooks
    │   ├── useCamera.js
    │   ├── useImageUpload.js
    │   ├── useMeetingChat.js
    │   ├── useMeetingParticipants.js
    │   ├── useModal.js
    │   ├── useSupabaseQuery.js
    │   └── useToast.js
    ├── store/            # State management (Zustand)
    │   ├── authStore.js
    │   └── notificationStore.js
    ├── utils/            # Shared utilities
    │   ├── auth.js
    │   ├── date.js
    │   ├── imageCrop.js
    │   ├── imageResize.js
    │   ├── notifications.js
    │   ├── secureStorage.js
    │   ├── socialAuth.js
    │   ├── storage.js
    │   └── validation.js
    ├── constants/        # App constants
    │   ├── app.ts       # App configuration
    │   ├── Colors.ts    # Color definitions
    │   └── theme/       # Theme configuration
    ├── types/           # TypeScript definitions
    │   └── index.ts
    ├── assets/          # Static assets
    ├── package.json     # Mobile dependencies
    ├── app.json         # Expo configuration
    └── README.md        # Mobile app documentation
```

## Shared Code

The following utilities and logic are shared between web and mobile apps:

### Utils (app/utils/)
- `auth.js` - Authentication logic
- `date.js` - Date formatting and manipulation
- `validation.js` - Form validation
- `storage.js` / `secureStorage.js` - Local storage management
- `notifications.js` - Notification utilities
- `imageCrop.js` / `imageResize.js` - Image processing
- `socialAuth.js` - Social authentication

### State Management (app/store/)
- `authStore.js` - Authentication state
- `notificationStore.js` - Notification state

### Hooks (app/hooks/)
- `useCamera.js` - Camera functionality
- `useImageUpload.js` - Image upload
- `useMeetingChat.js` - Chat functionality
- `useMeetingParticipants.js` - Meeting participants
- `useModal.js` - Modal management
- `useSupabaseQuery.js` - Supabase queries
- `useToast.js` - Toast notifications

## Technology Stack

### Web Application
- **Framework**: React 18 + Vite
- **Routing**: React Router DOM
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Backend**: Supabase
- **Build Tool**: Vite

### Mobile Application
- **Framework**: React Native + Expo
- **Language**: TypeScript
- **Routing**: Expo Router (file-based)
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Backend**: Supabase
- **HTTP Client**: Axios
- **Animations**: React Native Reanimated
- **Date Handling**: date-fns

## Getting Started

### Web Application
```bash
cd web
npm install
npm run dev
```

### Mobile Application
```bash
cd app
npm install
npm start

# For specific platforms:
npm run ios
npm run android
npm run web
```

## Features Implemented

### Web
- User authentication (email + social login)
- Meeting management
- Daily questions and answers
- Voting system
- Admin panel
- Real-time chat
- Push notifications
- Image uploads

### Mobile (To Be Implemented)
All web features will be implemented in the mobile app with native components and optimized UX:
- [ ] Authentication screens
- [ ] Meeting list and details
- [ ] Question browsing and answering
- [ ] Voting interface
- [ ] Profile management
- [ ] Real-time chat
- [ ] Push notifications
- [ ] Camera integration
- [ ] Offline support

## Development Workflow

### Adding New Features

1. **Web**: Add components in `web/src/components/`, pages in `web/src/pages/`
2. **Mobile**: Add screens in `app/app/`, components in `app/components/`
3. **Shared Logic**: Add to `app/utils/`, `app/hooks/`, or `app/store/`

### Database Changes

1. Create migration files in `web/supabase/migrations/`
2. Test locally with Supabase CLI
3. Deploy to production

### Building for Production

**Web:**
```bash
cd web
npm run build
```

**Mobile:**
```bash
cd app
eas build --platform ios
eas build --platform android
```

## Environment Variables

### Web (.env)
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

### Mobile (app/.env)
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

## Next Steps

1. Implement authentication screens in mobile app
2. Create meeting list and detail screens
3. Implement question browsing and answering
4. Add real-time chat functionality
5. Integrate push notifications
6. Add camera functionality for image uploads
7. Implement offline support with local storage
8. Set up CI/CD for mobile builds
9. Prepare for App Store and Play Store submissions

## Notes

- The web application remains in the `web/` directory with all existing functionality
- The mobile application is a fresh Expo project in `app/` with shared utilities
- Supabase backend is shared between web and mobile
- Database migrations remain in `web/supabase/migrations/`
- Both apps use the same Zustand stores for consistent state management
