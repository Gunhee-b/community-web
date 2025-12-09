import { supabase } from './supabase';

/**
 * Content Report Reasons
 */
export const REPORT_REASONS = {
  spam: '스팸 또는 광고',
  harassment: '괴롭힘 또는 혐오 발언',
  hate_speech: '차별적 발언',
  violence: '폭력적 콘텐츠',
  nsfw: '성적 콘텐츠',
  misinformation: '허위 정보',
  other: '기타',
} as const;

export type ReportReason = keyof typeof REPORT_REASONS;

export type ContentType = 'answer' | 'comment' | 'meeting' | 'profile';

/**
 * Report content
 */
export async function reportContent(params: {
  contentType: ContentType;
  contentId: string;
  reportedUserId: string;
  reason: ReportReason;
  description?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: '로그인이 필요합니다' };
    }

    const { data, error } = await supabase.rpc('report_content', {
      p_reporter_id: user.id,
      p_content_type: params.contentType,
      p_content_id: params.contentId,
      p_reported_user_id: params.reportedUserId,
      p_reason: params.reason,
      p_description: params.description || null,
    });

    if (error) {
      console.error('Error reporting content:', error);
      return { success: false, error: error.message };
    }

    if (data && typeof data === 'object' && 'success' in data) {
      return data as { success: boolean; error?: string };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in reportContent:', error);
    return { success: false, error: '신고 처리 중 오류가 발생했습니다' };
  }
}

/**
 * Block user
 */
export async function blockUser(params: {
  blockedUserId: string;
  reason?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: '로그인이 필요합니다' };
    }

    console.log('🔵 Attempting to block user:', {
      blocker_id: user.id,
      blocked_id: params.blockedUserId,
      reason: params.reason,
    });

    const { data, error } = await supabase.rpc('block_user', {
      p_blocker_id: user.id,
      p_blocked_id: params.blockedUserId,
      p_reason: params.reason || null,
    });

    console.log('🔵 Block user response:', { data, error });

    if (error) {
      console.error('❌ Error blocking user:', error);
      return { success: false, error: error.message };
    }

    if (data && typeof data === 'object' && 'success' in data) {
      return data as { success: boolean; error?: string };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in blockUser:', error);
    return { success: false, error: '차단 처리 중 오류가 발생했습니다' };
  }
}

/**
 * Unblock user
 */
export async function unblockUser(params: {
  blockedUserId: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: '로그인이 필요합니다' };
    }

    const { data, error } = await supabase.rpc('unblock_user', {
      p_blocker_id: user.id,
      p_blocked_id: params.blockedUserId,
    });

    if (error) {
      console.error('Error unblocking user:', error);
      return { success: false, error: error.message };
    }

    if (data && typeof data === 'object' && 'success' in data) {
      return data as { success: boolean; error?: string };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in unblockUser:', error);
    return { success: false, error: '차단 해제 중 오류가 발생했습니다' };
  }
}

/**
 * Get blocked users list
 */
export async function getBlockedUsers(): Promise<{
  success: boolean;
  data?: Array<{ id: string; blocked_id: string; created_at: string }>;
  error?: string;
}> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: '로그인이 필요합니다' };
    }

    console.log('🔵 Fetching blocked users for user:', user.id);

    const { data, error } = await supabase
      .from('user_blocks')
      .select('*')
      .eq('blocker_id', user.id)
      .order('created_at', { ascending: false });

    console.log('🔵 Blocked users response:', { data, error, count: data?.length });

    if (error) {
      console.error('❌ Error fetching blocked users:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in getBlockedUsers:', error);
    return { success: false, error: '차단 목록 조회 중 오류가 발생했습니다' };
  }
}

/**
 * Check if user is blocked
 */
export async function isUserBlocked(userId: string): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return false;
    }

    const { data, error } = await supabase
      .from('user_blocks')
      .select('id')
      .eq('blocker_id', user.id)
      .eq('blocked_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is fine
      console.error('Error checking if user is blocked:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error in isUserBlocked:', error);
    return false;
  }
}
