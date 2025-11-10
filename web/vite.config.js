import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  build: {
    rollupOptions: {
      external: [
        '@capacitor/app',
        '@capacitor/status-bar',
        '@capacitor/splash-screen',
        '@capacitor/core'
      ]
    }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Rezom 커뮤니티',
        short_name: 'Rezom',
        description: '250명 규모 커뮤니티를 위한 투표 및 오프라인 모임 플랫폼',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            // Only cache GET requests for storage/static content
            // IMPORTANT: Exclude ALL authentication-related endpoints
            urlPattern: ({ url, request }) => {
              // Only cache GET requests
              if (request.method !== 'GET') return false

              // Must be from supabase.co domain
              if (!url.hostname.includes('supabase.co')) return false

              // Exclude authentication endpoints
              if (url.pathname.includes('/auth/')) return false
              if (url.pathname.includes('/oauth/')) return false

              // Exclude RPC endpoints (these are for dynamic operations)
              if (url.pathname.includes('/rpc/')) return false

              // Exclude REST API write operations
              if (url.pathname.includes('/rest/')) {
                // Only cache storage/static reads
                return url.pathname.includes('/storage/')
              }

              return true
            },
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-static-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
              networkTimeoutSeconds: 10
            }
          }
        ],
        // Don't cache navigation requests to auth URLs
        navigateFallbackDenylist: [/^\/auth/, /^\/oauth/],
        // Clean old caches
        cleanupOutdatedCaches: true
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  server: {
    port: 3000,
  },
})
