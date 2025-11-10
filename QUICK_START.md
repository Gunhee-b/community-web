# Quick Start Guide

## Project Overview

This project contains two separate applications:
- **Web Application** (`/web`) - Vite + React web app
- **Mobile Application** (`/app`) - React Native + Expo mobile app

Both applications share common utilities and connect to the same Supabase backend.

## Initial Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd vote-example
```

### 2. Set Up Web Application

```bash
cd web
npm install

# Copy environment variables
cp .env.example .env
# Edit .env and add your Supabase credentials

# Start development server
npm run dev
```

The web app will be available at `http://localhost:5173`

### 3. Set Up Mobile Application

```bash
cd app
npm install

# Copy environment variables
cp .env.example .env
# Edit .env and add your Supabase credentials with EXPO_PUBLIC_ prefix

# Start Expo development server
npm start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your phone

## Environment Variables

### Web (.env)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Mobile (app/.env)
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Common Commands

### Web Application
```bash
cd web

# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build

# Linting
npm run lint         # Run ESLint
```

### Mobile Application
```bash
cd app

# Development
npm start            # Start Expo dev server
npm run android      # Run on Android
npm run ios          # Run on iOS
npm run web          # Run in web browser

# Production Build (requires EAS account)
eas build --platform ios
eas build --platform android
```

## Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from Settings > API
3. Run migrations from `web/supabase/migrations/` in order
4. Set up authentication providers (email, Google, Kakao, Apple)
5. Configure storage buckets for images

## Project Structure

```
vote-example/
├── web/                # Web application
│   ├── src/           # Source code
│   └── supabase/      # Database migrations
│
├── app/               # Mobile application
│   ├── app/          # Screens (Expo Router)
│   ├── components/   # UI components
│   ├── services/     # API services
│   ├── hooks/        # Custom hooks
│   ├── store/        # State management
│   ├── utils/        # Shared utilities
│   └── constants/    # App constants
│
├── PROJECT_STRUCTURE.md  # Detailed structure docs
└── QUICK_START.md       # This file
```

## Troubleshooting

### Web Issues

**Port already in use:**
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

**Module not found:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Mobile Issues

**Metro bundler cache:**
```bash
npm start -- --clear
```

**iOS simulator not opening:**
```bash
# Check if Xcode is installed
xcode-select -p

# Install Xcode command line tools if needed
xcode-select --install
```

**Android emulator issues:**
```bash
# Make sure Android Studio is installed
# Set ANDROID_HOME environment variable
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

## Development Workflow

### Adding a New Feature

1. **Plan the feature**
   - Define requirements
   - Design UI/UX
   - Plan database schema changes

2. **Database Changes** (if needed)
   ```bash
   cd web/supabase/migrations
   # Create new migration file
   # Test locally
   # Deploy to production
   ```

3. **Implement in Web**
   ```bash
   cd web/src
   # Add components, pages, hooks
   # Test in browser
   ```

4. **Implement in Mobile**
   ```bash
   cd app
   # Add screens in app/
   # Add components in components/
   # Reuse hooks and utilities
   # Test on iOS and Android
   ```

5. **Shared Logic**
   - Put shared code in `app/utils/`, `app/hooks/`, or `app/store/`
   - Both web and mobile can use these utilities

## Testing

### Web
```bash
cd web
npm run lint          # Check code quality
npm run build         # Ensure builds successfully
```

### Mobile
```bash
cd app
# Test on multiple devices
npm run ios          # Test iOS
npm run android      # Test Android
npm run web          # Test web version
```

## Deployment

### Web
```bash
cd web
npm run build
# Deploy dist/ folder to Vercel, Netlify, or your hosting
```

### Mobile
```bash
cd app
# Set up EAS Build
npm install -g eas-cli
eas login
eas build:configure

# Build for stores
eas build --platform ios
eas build --platform android
```

## Resources

- [Web README](web/README.md) - Web app documentation
- [Mobile README](app/README.md) - Mobile app documentation
- [Project Structure](PROJECT_STRUCTURE.md) - Detailed structure overview
- [Expo Documentation](https://docs.expo.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev/)

## Support

For issues or questions:
1. Check existing documentation
2. Search closed issues
3. Create a new issue with detailed description

## License

Private - INGK Community
