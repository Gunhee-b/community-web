import { Preferences } from '@capacitor/preferences'
import { Capacitor } from '@capacitor/core'

/**
 * 플랫폼별 안전한 스토리지 유틸리티
 * 네이티브 앱: Capacitor Preferences 사용 (iOS Keychain, Android EncryptedSharedPreferences)
 * 웹: localStorage 사용
 */

const isNative = Capacitor.isNativePlatform()

export const secureStorage = {
  /**
   * 값을 안전하게 저장
   * @param {string} key - 저장할 키
   * @param {string} value - 저장할 값
   */
  async setItem(key, value) {
    try {
      if (isNative) {
        await Preferences.set({ key, value })
      } else {
        localStorage.setItem(key, value)
      }
    } catch (error) {
      console.error('Error setting item in secure storage:', error)
      throw error
    }
  },

  /**
   * 값을 안전하게 가져오기
   * @param {string} key - 가져올 키
   * @returns {Promise<string|null>} 저장된 값 또는 null
   */
  async getItem(key) {
    try {
      if (isNative) {
        const { value } = await Preferences.get({ key })
        return value
      } else {
        return localStorage.getItem(key)
      }
    } catch (error) {
      console.error('Error getting item from secure storage:', error)
      return null
    }
  },

  /**
   * 값을 안전하게 삭제
   * @param {string} key - 삭제할 키
   */
  async removeItem(key) {
    try {
      if (isNative) {
        await Preferences.remove({ key })
      } else {
        localStorage.removeItem(key)
      }
    } catch (error) {
      console.error('Error removing item from secure storage:', error)
      throw error
    }
  },

  /**
   * 모든 값을 안전하게 삭제
   */
  async clear() {
    try {
      if (isNative) {
        await Preferences.clear()
      } else {
        localStorage.clear()
      }
    } catch (error) {
      console.error('Error clearing secure storage:', error)
      throw error
    }
  },

  /**
   * 모든 키 목록 가져오기
   * @returns {Promise<string[]>} 저장된 키 배열
   */
  async keys() {
    try {
      if (isNative) {
        const { keys } = await Preferences.keys()
        return keys
      } else {
        return Object.keys(localStorage)
      }
    } catch (error) {
      console.error('Error getting keys from secure storage:', error)
      return []
    }
  },
}
