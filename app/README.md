# INGK Community Mobile App

A React Native mobile application built with Expo and TypeScript for the INGK Community platform.

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Backend**: Supabase
- **HTTP Client**: Axios
- **UI**: React Native Components
- **Animations**: React Native Reanimated
- **Date Handling**: date-fns

## Project Structure

```
/app
├── app/                    # Screens (Expo Router file-based navigation)
│   ├── (tabs)/            # Tab-based navigation screens
│   ├── _layout.tsx        # Root layout
│   ├── +not-found.tsx     # 404 screen
│   └── modal.tsx          # Modal example
├── components/            # Reusable UI components
│   ├── navigation/        # Navigation-related components
│   └── ...               # Other shared components
├── services/              # API services and business logic
│   └── supabase.js       # Supabase client configuration
├── hooks/                 # Custom React hooks
│   ├── useCamera.js
│   ├── useImageUpload.js
│   ├── useMeetingChat.js
│   ├── useMeetingParticipants.js
│   ├── useModal.js
│   ├── useSupabaseQuery.js
│   └── useToast.js
├── store/                 # Global state management (Zustand)
│   ├── authStore.js
│   └── notificationStore.js
├── utils/                 # Utility functions
│   ├── auth.js
│   ├── date.js
│   ├── imageCrop.js
│   ├── imageResize.js
│   ├── notifications.js
│   ├── secureStorage.js
│   ├── socialAuth.js
│   ├── storage.js
│   └── validation.js
├── constants/             # App constants and configuration
│   ├── theme/            # Theme configuration
│   └── Colors.ts         # Color definitions
├── types/                 # TypeScript type definitions
├── assets/               # Static assets (images, fonts, etc.)
│   ├── fonts/
│   └── images/
└── README.md             # This file
```

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Studio (for Android development)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Configure your Supabase credentials

### Running the App

Start the development server:

```bash
npm start
```

#### Platform-specific commands:

```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## Features

- **Authentication**: User authentication with Supabase (including social login)
- **Meetings**: Create, join, and manage community meetings
- **Chat**: Real-time chat functionality for meetings
- **Questions**: Daily questions and answers
- **Voting**: Community voting system
- **Notifications**: Push notifications for important events
- **Image Upload**: Camera integration and image handling
- **Offline Support**: Secure local storage

## Development Guidelines

### File-Based Routing

This app uses Expo Router for navigation. Routes are automatically generated based on the file structure in the `app/` directory.

- `app/(tabs)/index.tsx` → `/` (Home tab)
- `app/(tabs)/explore.tsx` → `/explore` (Explore tab)
- `app/modal.tsx` → `/modal` (Modal screen)

### State Management

Global state is managed using Zustand stores located in `store/`:

```typescript
// Example: Using auth store
import { useAuthStore } from '@/store/authStore';

const MyComponent = () => {
  const { user, signIn, signOut } = useAuthStore();
  // ...
};
```

### Data Fetching

Use TanStack Query for server state management:

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services/supabase';

const { data, isLoading } = useQuery({
  queryKey: ['meetings'],
  queryFn: async () => {
    const { data } = await supabase.from('meetings').select('*');
    return data;
  }
});
```

### Custom Hooks

Reusable hooks are located in `hooks/`:

- `useCamera` - Camera access and image capture
- `useImageUpload` - Image upload to storage
- `useMeetingChat` - Real-time chat functionality
- `useModal` - Modal state management
- `useToast` - Toast notifications
- `useSupabaseQuery` - Supabase query wrapper

### TypeScript

All new code should be written in TypeScript. Define types in the `types/` directory.

## Building for Production

### iOS

```bash
eas build --platform ios
```

### Android

```bash
eas build --platform android
```

## Shared Code with Web

The following utilities are shared between web and mobile:

- Authentication logic (`utils/auth.js`)
- Date utilities (`utils/date.js`)
- Validation functions (`utils/validation.js`)
- Storage helpers (`utils/storage.js`, `utils/secureStorage.js`)
- Notification utilities (`utils/notifications.js`)

## Contributing

1. Create a new branch for your feature
2. Follow the existing code structure and naming conventions
3. Write TypeScript for new components
4. Test on both iOS and Android before submitting
5. Update this README if you add new features or change structure

## Troubleshooting

### Common Issues

1. **Metro bundler issues**: Clear cache with `npx expo start -c`
2. **Module not found**: Try `rm -rf node_modules && npm install`
3. **iOS build errors**: Run `npx pod-install` in the ios directory
4. **TypeScript errors**: Check `tsconfig.json` and ensure all types are properly defined

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [React Native](https://reactnative.dev/)
- [Supabase](https://supabase.com/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [Zustand](https://github.com/pmndrs/zustand)

## License

Private - INGK Community
