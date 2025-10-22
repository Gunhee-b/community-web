import { supabase } from '../lib/supabase'

/**
 * Register new user (server-side password hashing)
 */
export const registerUser = async ({ username, password, invitationCode }) => {
  const { data, error } = await supabase.rpc('register_user', {
    p_username: username,
    p_password: password,
    p_invitation_code: invitationCode,
  })

  if (error) {
    throw new Error(error.message || '회원가입 중 오류가 발생했습니다')
  }

  if (!data.success) {
    throw new Error(data.error || '회원가입 중 오류가 발생했습니다')
  }

  return data.user
}

/**
 * Login user (server-side password verification)
 */
export const loginUser = async ({ username, password }) => {
  const { data, error } = await supabase.rpc('login_user', {
    p_username: username,
    p_password: password,
  })

  if (error) {
    console.error('Supabase RPC error:', error)
    throw new Error(error.message || '로그인 중 오류가 발생했습니다')
  }

  if (!data) {
    throw new Error('서버 응답이 없습니다')
  }

  if (!data.success) {
    throw new Error(data.error || '로그인 중 오류가 발생했습니다')
  }

  return data.user
}

/**
 * Logout user
 */
export const logoutUser = async () => {
  // No server-side action needed for custom auth
  return true
}
