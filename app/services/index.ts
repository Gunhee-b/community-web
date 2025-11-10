/**
 * Services Barrel Export
 *
 * 모든 서비스를 중앙에서 관리하고 export합니다.
 */

// API Service
export * from './api';
export { default as api } from './api';

// Authentication Service
export { AuthService, default as authService } from './auth';
export type { LoginCredentials, SignupData, AuthResponse, TokenPair } from './auth';

// Supabase Client
export { supabase } from './supabase';

// API Modules
export * from './api/auth';
export * from './api/meetings';
export * from './api/questions';
export * from './api/chat';
