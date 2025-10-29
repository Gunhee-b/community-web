import { useState } from 'react'
import { supabase } from '../lib/supabase'

/**
 * 이미지 업로드를 위한 재사용 가능한 커스텀 훅
 *
 * @param {Object} options - 옵션 설정
 * @param {string} options.bucket - Supabase storage bucket 이름
 * @param {number} options.maxSize - 최대 파일 크기 (바이트, 기본값: 5MB)
 * @param {boolean} options.multiple - 여러 이미지 지원 여부
 * @param {number} options.maxImages - 최대 이미지 개수 (기본값: 2)
 * @returns {Object} 이미지 업로드 관련 상태 및 함수
 */
export const useImageUpload = (options = {}) => {
  const {
    bucket = 'post-images',
    maxSize = 5 * 1024 * 1024, // 5MB
    multiple = false,
    maxImages = 2,
  } = options

  // 단일 이미지 모드
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  // 다중 이미지 모드
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])

  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  /**
   * 파일 유효성 검사
   */
  const validateFile = (file) => {
    if (!file) {
      return { valid: false, error: '파일을 선택해주세요' }
    }

    // 파일 타입 검사
    if (!file.type.startsWith('image/')) {
      return { valid: false, error: '이미지 파일만 업로드할 수 있습니다' }
    }

    // 파일 크기 검사
    if (file.size > maxSize) {
      const sizeMB = (maxSize / (1024 * 1024)).toFixed(0)
      return { valid: false, error: `이미지 크기는 ${sizeMB}MB 이하여야 합니다` }
    }

    return { valid: true }
  }

  /**
   * 파일 미리보기 생성
   */
  const createPreview = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  /**
   * 단일 이미지 선택 핸들러
   */
  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateFile(file)
    if (!validation.valid) {
      setError(validation.error)
      return
    }

    setError('')
    setImageFile(file)

    try {
      const preview = await createPreview(file)
      setImagePreview(preview)
    } catch (err) {
      console.error('Error creating preview:', err)
      setError('이미지 미리보기 생성 실패')
    }
  }

  /**
   * 다중 이미지 선택 핸들러
   */
  const handleMultipleImageSelect = async (e, index) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateFile(file)
    if (!validation.valid) {
      setError(validation.error)
      return
    }

    // 최대 이미지 개수 체크
    if (index >= maxImages) {
      setError(`최대 ${maxImages}개의 이미지만 업로드할 수 있습니다`)
      return
    }

    setError('')

    try {
      const preview = await createPreview(file)

      setImageFiles((prev) => {
        const newFiles = [...prev]
        newFiles[index] = file
        return newFiles
      })

      setImagePreviews((prev) => {
        const newPreviews = [...prev]
        newPreviews[index] = preview
        return newPreviews
      })
    } catch (err) {
      console.error('Error creating preview:', err)
      setError('이미지 미리보기 생성 실패')
    }
  }

  /**
   * 단일 이미지 제거
   */
  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setError('')
  }

  /**
   * 다중 이미지 중 특정 이미지 제거
   */
  const removeMultipleImage = (index) => {
    setImageFiles((prev) => {
      const newFiles = [...prev]
      newFiles[index] = null
      return newFiles
    })

    setImagePreviews((prev) => {
      const newPreviews = [...prev]
      newPreviews[index] = null
      return newPreviews
    })

    setError('')
  }

  /**
   * 이미지를 Supabase Storage에 업로드
   */
  const uploadToStorage = async (file, userId) => {
    if (!file) return null

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${fileName}`

      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      // 공개 URL 가져오기
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(filePath)

      return publicUrl
    } catch (err) {
      console.error('Error uploading image:', err)
      throw new Error('이미지 업로드 실패: ' + err.message)
    }
  }

  /**
   * 단일 이미지 업로드
   */
  const uploadImage = async (userId) => {
    if (!imageFile) return null

    setUploading(true)
    setError('')

    try {
      const url = await uploadToStorage(imageFile, userId)
      return url
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setUploading(false)
    }
  }

  /**
   * 다중 이미지 업로드
   */
  const uploadMultipleImages = async (userId) => {
    const filesToUpload = imageFiles.filter((file) => file !== null && file !== undefined)

    if (filesToUpload.length === 0) return []

    setUploading(true)
    setError('')

    try {
      const uploadPromises = filesToUpload.map((file) => uploadToStorage(file, userId))
      const urls = await Promise.all(uploadPromises)
      return urls
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setUploading(false)
    }
  }

  /**
   * 모든 상태 초기화
   */
  const reset = () => {
    setImageFile(null)
    setImagePreview(null)
    setImageFiles([])
    setImagePreviews([])
    setError('')
    setUploading(false)
  }

  // 다중 이미지 모드인 경우
  if (multiple) {
    return {
      imageFiles,
      imagePreviews,
      uploading,
      error,
      handleImageSelect: handleMultipleImageSelect,
      removeImage: removeMultipleImage,
      uploadImages: uploadMultipleImages,
      reset,
      hasImages: imageFiles.some((file) => file !== null),
    }
  }

  // 단일 이미지 모드
  return {
    imageFile,
    imagePreview,
    uploading,
    error,
    handleImageSelect,
    removeImage,
    uploadImage,
    reset,
    hasImage: !!imageFile,
  }
}
