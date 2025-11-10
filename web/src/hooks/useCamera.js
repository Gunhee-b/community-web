import { useState } from 'react'

/**
 * 네이티브 카메라/갤러리 기능을 제공하는 커스텀 훅
 * 웹에서는 기존 input file 방식 사용
 * 네이티브 앱에서는 Capacitor Camera 플러그인 사용
 */
export const useCamera = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isNative, setIsNative] = useState(false)

  // Check if native on first use
  const checkNativePlatform = async () => {
    try {
      const { Capacitor } = await import('@capacitor/core')
      const native = Capacitor.isNativePlatform()
      setIsNative(native)
      return native
    } catch {
      setIsNative(false)
      return false
    }
  }

  /**
   * 이미지 크기를 검증하는 함수
   * @param {string} dataUrl - base64 data URL
   * @param {number} maxSizeMB - 최대 크기 (MB)
   * @returns {boolean} 유효성 여부
   */
  const validateImageSize = (dataUrl, maxSizeMB = 10) => {
    const sizeInMB = (dataUrl.length * 0.75) / 1000000
    if (sizeInMB > maxSizeMB) {
      setError(`이미지 크기는 ${maxSizeMB}MB를 초과할 수 없습니다.`)
      return false
    }
    return true
  }

  /**
   * 카메라로 사진 촬영 또는 갤러리에서 선택
   * @param {Object} options - 옵션 설정
   * @param {string} options.source - 카메라 소스 (CAMERA, PHOTOS, PROMPT)
   * @param {number} options.quality - 이미지 품질 (0-100)
   * @param {number} options.width - 이미지 최대 너비
   * @param {number} options.height - 이미지 최대 높이
   * @returns {Promise<string|null>} base64 data URL 또는 null
   */
  const takePicture = async (options = {}) => {
    const native = await checkNativePlatform()

    // 웹 환경에서는 null 반환 (기존 input file 사용)
    if (!native) {
      return null
    }

    const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera')

    const {
      source = CameraSource.Prompt, // 카메라/갤러리 선택 프롬프트
      quality = 90,
      width = 1024,
      height = 1024,
    } = options

    setLoading(true)
    setError(null)

    try {
      // 카메라 권한 확인 및 요청
      const permissions = await Camera.checkPermissions()

      if (permissions.camera === 'denied' || permissions.photos === 'denied') {
        const requestResult = await Camera.requestPermissions()
        if (requestResult.camera === 'denied' || requestResult.photos === 'denied') {
          setError('카메라 및 갤러리 접근 권한이 필요합니다.')
          return null
        }
      }

      // 사진 촬영 또는 선택
      const image = await Camera.getPhoto({
        quality,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source,
        width,
        height,
      })

      if (!image.dataUrl) {
        setError('이미지를 가져오는데 실패했습니다.')
        return null
      }

      // 크기 검증
      if (!validateImageSize(image.dataUrl)) {
        return null
      }

      return image.dataUrl
    } catch (err) {
      console.error('Error taking picture:', err)

      // 사용자가 취소한 경우
      if (err.message && err.message.includes('User cancelled')) {
        setError(null)
        return null
      }

      setError('이미지를 가져오는 중 오류가 발생했습니다.')
      return null
    } finally {
      setLoading(false)
    }
  }

  /**
   * 카메라로만 사진 촬영
   * @param {Object} options - 옵션 설정
   * @returns {Promise<string|null>} base64 data URL 또는 null
   */
  const takePhoto = async (options = {}) => {
    return takePicture({ ...options, source: CameraSource.Camera })
  }

  /**
   * 갤러리에서만 사진 선택
   * @param {Object} options - 옵션 설정
   * @returns {Promise<string|null>} base64 data URL 또는 null
   */
  const pickFromGallery = async (options = {}) => {
    return takePicture({ ...options, source: CameraSource.Photos })
  }

  /**
   * Data URL을 File 객체로 변환
   * @param {string} dataUrl - base64 data URL
   * @param {string} fileName - 파일 이름
   * @returns {File} File 객체
   */
  const dataUrlToFile = (dataUrl, fileName = 'image.jpg') => {
    const arr = dataUrl.split(',')
    const mime = arr[0].match(/:(.*?);/)[1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }

    return new File([u8arr], fileName, { type: mime })
  }

  return {
    takePicture,
    takePhoto,
    pickFromGallery,
    dataUrlToFile,
    loading,
    error,
    isNative,
  }
}
