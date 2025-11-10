import { useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useNotificationStore } from '../store/notificationStore'
import { useToast } from './useToast'

/**
 * 모임 참가자 관리를 위한 커스텀 훅
 * 참가, 나가기, 확정, 출석 체크 등의 기능 제공
 *
 * @param {string} meetingId - 모임 ID
 * @param {Object} meeting - 모임 정보
 * @param {Array} participants - 참가자 목록
 * @param {Object} user - 현재 로그인한 사용자 정보
 * @param {Function} refetchMeetingData - 모임 데이터 다시 가져오는 함수
 * @returns {Object} 참가자 관련 함수들
 */
export const useMeetingParticipants = (
  meetingId,
  meeting,
  participants,
  user,
  refetchMeetingData
) => {
  const toast = useToast()
  const addNotification = useNotificationStore((state) => state.addNotification)

  /**
   * 모임 참가
   */
  const joinMeeting = useCallback(async () => {
    if (!user) {
      toast.info('로그인 후 이용 부탁드립니다')
      return { success: false, redirectToLogin: true }
    }

    if (meeting?.status === 'confirmed') {
      toast.error('이미 확정된 모임입니다. 더 이상 참가할 수 없습니다.')
      return { success: false }
    }

    try {
      await supabase.from('meeting_participants').insert([
        {
          meeting_id: meetingId,
          user_id: user.id,
        },
      ])

      toast.success('모임 참가가 완료되었습니다! 카카오톡 오픈채팅방으로 이동합니다.')

      // Fetch updated meeting data
      await refetchMeetingData()

      // Return kakao chat link if exists
      return {
        success: true,
        kakaoOpenchatLink: meeting?.kakao_openchat_link,
      }
    } catch (error) {
      console.error('Error joining meeting:', error)
      toast.error('참가 신청 중 오류가 발생했습니다')
      return { success: false, error }
    }
  }, [meetingId, meeting, user, refetchMeetingData, toast])

  /**
   * 모임 확정
   */
  const confirmMeeting = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('confirm_meeting', {
        p_meeting_id: meetingId,
        p_user_id: user.id,
      })

      if (error) {
        throw new Error(error.message || '모임 확정 중 오류가 발생했습니다')
      }

      if (!data.success) {
        throw new Error(data.error || '모임 확정 중 오류가 발생했습니다')
      }

      toast.success('모임이 확정되었습니다!')
      await refetchMeetingData()
      return { success: true }
    } catch (error) {
      console.error('Error confirming meeting:', error)
      toast.error(error.message)
      return { success: false, error }
    }
  }, [meetingId, user, refetchMeetingData, toast])

  /**
   * 모임 확정 취소
   */
  const unconfirmMeeting = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('unconfirm_meeting', {
        p_meeting_id: meetingId,
        p_user_id: user.id,
      })

      if (error) {
        throw new Error(error.message || '확정 취소 중 오류가 발생했습니다')
      }

      if (!data.success) {
        throw new Error(data.error || '확정 취소 중 오류가 발생했습니다')
      }

      toast.success('모임 확정이 취소되었습니다. 다시 참가자를 받을 수 있습니다.')
      await refetchMeetingData()
      return { success: true }
    } catch (error) {
      console.error('Error unconfirming meeting:', error)
      toast.error(error.message)
      return { success: false, error }
    }
  }, [meetingId, user, refetchMeetingData, toast])

  /**
   * 모임 나가기
   */
  const leaveMeeting = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('leave_meeting', {
        p_meeting_id: meetingId,
        p_user_id: user.id,
      })

      if (error) {
        throw new Error(error.message || '모임 나가기 중 오류가 발생했습니다')
      }

      if (!data.success) {
        throw new Error(data.error || '모임 나가기 중 오류가 발생했습니다')
      }

      // Send notification to host
      if (data.host_id && data.anonymous_name) {
        console.log(`Participant ${data.anonymous_name} left the meeting. Host ID: ${data.host_id}`)

        const notificationEvent = {
          type: 'meeting_leave',
          title: '모임 참가자 퇴장',
          message: `${data.anonymous_name}님이 모임에서 나갔습니다.`,
          meetingId: meetingId,
          timestamp: new Date().toISOString(),
          hostId: data.host_id,
        }

        // If current user is the host, add notification directly
        if (user.id === data.host_id) {
          addNotification({
            type: notificationEvent.type,
            title: notificationEvent.title,
            message: notificationEvent.message,
            meetingId: notificationEvent.meetingId,
          })
        }

        // Store in localStorage to trigger events in other tabs
        localStorage.setItem('temp_meeting_notification', JSON.stringify(notificationEvent))
        localStorage.removeItem('temp_meeting_notification')
      }

      toast.success('모임에서 나갔습니다.')
      return { success: true }
    } catch (error) {
      console.error('Error leaving meeting:', error)
      toast.error(error.message)
      return { success: false, error }
    }
  }, [meetingId, user, addNotification, toast])

  /**
   * 출석 체크
   */
  const markAttendance = useCallback(
    async (participantId) => {
      try {
        const { data, error } = await supabase.rpc('mark_attendance', {
          p_participant_id: participantId,
          p_host_id: user.id,
        })

        if (error) throw error

        if (!data.success) {
          throw new Error(data.error || '출석 체크 중 오류가 발생했습니다')
        }

        toast.success(data.attended ? '출석 처리되었습니다' : '출석이 취소되었습니다')
        await refetchMeetingData()
        return { success: true, attended: data.attended }
      } catch (error) {
        console.error('Error marking attendance:', error)
        toast.error(error.message || '출석 체크 중 오류가 발생했습니다')
        return { success: false, error }
      }
    },
    [user, refetchMeetingData, toast]
  )

  return {
    joinMeeting,
    confirmMeeting,
    unconfirmMeeting,
    leaveMeeting,
    markAttendance,
  }
}
