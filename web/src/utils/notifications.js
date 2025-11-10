import { supabase } from '../lib/supabase'

/**
 * 푸시 알림을 초기화하고 권한을 요청합니다
 * @param {string} userId - 사용자 ID
 * @returns {Promise<boolean>} 성공 여부
 */
export const initPushNotifications = async (userId) => {
  let isNative = false
  try {
    const { Capacitor } = await import('@capacitor/core')
    isNative = Capacitor.isNativePlatform()
  } catch {
    console.log('Push notifications are only available on native platforms')
    return false
  }

  if (!isNative) {
    console.log('Push notifications are only available on native platforms')
    return false
  }

  try {
    const { PushNotifications } = await import('@capacitor/push-notifications')
    const { Capacitor } = await import('@capacitor/core')

    // 권한 요청
    const permStatus = await PushNotifications.requestPermissions()

    if (permStatus.receive !== 'granted') {
      console.log('Push notification permission denied')
      return false
    }

    // 푸시 알림 등록
    await PushNotifications.register()

    // 토큰 등록 리스너
    await PushNotifications.addListener('registration', async (token) => {
      console.log('Push registration success, token:', token.value)

      try {
        // Supabase에 디바이스 토큰 저장
        const { error } = await supabase.from('device_tokens').upsert(
          {
            user_id: userId,
            token: token.value,
            platform: Capacitor.getPlatform(),
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id,platform',
          }
        )

        if (error) {
          console.error('Error saving device token:', error)
        } else {
          console.log('Device token saved successfully')
        }
      } catch (err) {
        console.error('Error in registration listener:', err)
      }
    })

    // 토큰 등록 실패 리스너
    await PushNotifications.addListener('registrationError', (error) => {
      console.error('Push registration error:', error)
    })

    // 푸시 알림 수신 리스너 (앱이 포그라운드일 때)
    await PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push notification received:', notification)
      // 여기서 인앱 알림 UI를 표시할 수 있습니다
      // 예: toast 알림 표시
    })

    // 푸시 알림 액션 리스너 (사용자가 알림을 탭했을 때)
    await PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push notification action performed:', notification)
      // 여기서 특정 화면으로 네비게이션할 수 있습니다
      handleNotificationAction(notification.notification.data)
    })

    return true
  } catch (error) {
    console.error('Error initializing push notifications:', error)
    return false
  }
}

/**
 * 알림 액션 처리 (사용자가 알림을 탭했을 때)
 * @param {Object} data - 알림 데이터
 */
const handleNotificationAction = (data) => {
  if (!data) return

  // 알림 타입에 따라 다른 화면으로 이동
  switch (data.type) {
    case 'vote':
      // 투표 상세 페이지로 이동
      if (data.voteId) {
        window.location.href = `/voting/${data.voteId}`
      }
      break
    case 'meeting':
      // 모임 상세 페이지로 이동
      if (data.meetingId) {
        window.location.href = `/meetings/${data.meetingId}`
      }
      break
    case 'question':
      // 질문 상세 페이지로 이동
      if (data.questionId) {
        window.location.href = `/questions/${data.questionId}`
      }
      break
    default:
      // 홈으로 이동
      window.location.href = '/'
  }
}

/**
 * 푸시 알림 권한 상태 확인
 * @returns {Promise<string>} 권한 상태 ('granted', 'denied', 'prompt')
 */
export const checkPushPermissions = async () => {
  let isNative = false
  try {
    const { Capacitor } = await import('@capacitor/core')
    isNative = Capacitor.isNativePlatform()
  } catch {
    return 'denied'
  }

  if (!isNative) {
    return 'denied'
  }

  try {
    const { PushNotifications } = await import('@capacitor/push-notifications')
    const permStatus = await PushNotifications.checkPermissions()
    return permStatus.receive
  } catch (error) {
    console.error('Error checking push permissions:', error)
    return 'denied'
  }
}

/**
 * 디바이스 토큰을 삭제합니다 (로그아웃 시)
 * @param {string} userId - 사용자 ID
 */
export const removePushToken = async (userId) => {
  let isNative = false
  try {
    const { Capacitor } = await import('@capacitor/core')
    isNative = Capacitor.isNativePlatform()
  } catch {
    return
  }

  if (!isNative) {
    return
  }

  try {
    const { Capacitor } = await import('@capacitor/core')
    const platform = Capacitor.getPlatform()

    // Supabase에서 디바이스 토큰 삭제
    const { error } = await supabase
      .from('device_tokens')
      .delete()
      .eq('user_id', userId)
      .eq('platform', platform)

    if (error) {
      console.error('Error removing device token:', error)
    } else {
      console.log('Device token removed successfully')
    }
  } catch (err) {
    console.error('Error in removePushToken:', err)
  }
}

/**
 * 모든 푸시 알림 리스너 제거
 */
export const removeAllPushListeners = async () => {
  let isNative = false
  try {
    const { Capacitor } = await import('@capacitor/core')
    isNative = Capacitor.isNativePlatform()
  } catch {
    return
  }

  if (!isNative) {
    return
  }

  try {
    const { PushNotifications } = await import('@capacitor/push-notifications')
    await PushNotifications.removeAllListeners()
    console.log('All push notification listeners removed')
  } catch (error) {
    console.error('Error removing push listeners:', error)
  }
}
