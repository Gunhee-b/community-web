import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.tongchalban.community',
  appName: '통찰방',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  // Deep linking configuration for OAuth redirects
  deepLinks: {
    enabled: true,
    scheme: 'ingk',
  },
  ios: {
    contentInset: 'automatic',
    limitsNavigationsToAppBoundDomains: true,
    // Handle OAuth callback URLs
    allowsLinkPreview: false,
  },
  android: {
    minWebViewVersion: 60,
    allowMixedContent: false,
    // Handle OAuth callback URLs
    customBuildGradle: {
      manifestPlaceholders: {
        'ingk-scheme': 'ingk',
      },
    },
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: false,
      androidSpinnerStyle: 'small',
      iosSpinnerStyle: 'small',
      spinnerColor: '#999999',
      splashFullScreen: false,
      splashImmersive: false,
    },
    StatusBar: {
      style: 'light',
      backgroundColor: '#ffffff',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },
  },
}

export default config
