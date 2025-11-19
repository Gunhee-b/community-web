export const APP_CONFIG = {
  APP_NAME: 'Rezom',
  APP_VERSION: '1.0.0',
  API_TIMEOUT: 30000, // 30 seconds
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_IMAGE_FORMATS: ['image/jpeg', 'image/png', 'image/jpg'],
  MAX_MEETING_PARTICIPANTS: 50,
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@auth_token',
  USER_DATA: '@user_data',
  THEME_MODE: '@theme_mode',
  LANGUAGE: '@language',
} as const;

export const QUERY_KEYS = {
  MEETINGS: 'meetings',
  MEETING_DETAIL: 'meeting_detail',
  QUESTIONS: 'questions',
  QUESTION_DETAIL: 'question_detail',
  ANSWERS: 'answers',
  CHAT_MESSAGES: 'chat_messages',
  NOTIFICATIONS: 'notifications',
  USER_PROFILE: 'user_profile',
  VOTING_PERIODS: 'voting_periods',
  POSTS: 'posts',
} as const;

export const ROUTES = {
  HOME: '/',
  MEETINGS: '/meetings',
  MEETING_DETAIL: '/meetings/:id',
  QUESTIONS: '/questions',
  QUESTION_DETAIL: '/questions/:id',
  PROFILE: '/profile',
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  ADMIN: '/admin',
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  AUTH_ERROR: 'Authentication error. Please login again.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
  IMAGE_SIZE_ERROR: 'Image size exceeds the maximum allowed size.',
  IMAGE_FORMAT_ERROR: 'Unsupported image format.',
} as const;
