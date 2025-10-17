import { supabase } from '../lib/supabase'

const BUCKET_NAME = 'post-images'
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']

/**
 * Upload an image file to Supabase Storage
 * @param {File} file - The image file to upload
 * @param {string} userId - The ID of the user uploading the file
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
export const uploadImage = async (file, userId) => {
  try {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: '파일 크기는 5MB를 초과할 수 없습니다',
      }
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return {
        success: false,
        error: '지원하지 않는 파일 형식입니다. (JPG, PNG, GIF, WebP만 가능)',
      }
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${userId}/${fileName}`

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Error uploading file:', error)
      return {
        success: false,
        error: '파일 업로드 중 오류가 발생했습니다: ' + error.message,
      }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath)

    return {
      success: true,
      url: urlData.publicUrl,
      path: filePath,
    }
  } catch (error) {
    console.error('Error in uploadImage:', error)
    return {
      success: false,
      error: '파일 업로드 중 예기치 않은 오류가 발생했습니다',
    }
  }
}

/**
 * Delete an image file from Supabase Storage
 * @param {string} filePath - The path of the file to delete (e.g., "userId/filename.jpg")
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteImage = async (filePath) => {
  try {
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath])

    if (error) {
      console.error('Error deleting file:', error)
      return {
        success: false,
        error: '파일 삭제 중 오류가 발생했습니다',
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error in deleteImage:', error)
    return {
      success: false,
      error: '파일 삭제 중 예기치 않은 오류가 발생했습니다',
    }
  }
}

/**
 * Extract file path from Supabase Storage URL
 * @param {string} url - The full Supabase Storage URL
 * @returns {string|null} The file path or null if invalid
 */
export const getFilePathFromUrl = (url) => {
  if (!url) return null

  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/')
    const bucketIndex = pathParts.indexOf(BUCKET_NAME)

    if (bucketIndex === -1) return null

    // Get everything after the bucket name
    return pathParts.slice(bucketIndex + 1).join('/')
  } catch (error) {
    console.error('Error parsing URL:', error)
    return null
  }
}

/**
 * Validate image file before upload
 * @param {File} file - The file to validate
 * @returns {{valid: boolean, error?: string}}
 */
export const validateImageFile = (file) => {
  if (!file) {
    return { valid: false, error: '파일을 선택해주세요' }
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `파일 크기는 ${MAX_FILE_SIZE / (1024 * 1024)}MB를 초과할 수 없습니다`,
    }
  }

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: '지원하지 않는 파일 형식입니다. (JPG, PNG, GIF, WebP만 가능)',
    }
  }

  return { valid: true }
}
