# 기존 컴포넌트와 네이티브 기능 통합 가이드

## 이미지 업로드 기능 업데이트

기존 프로젝트에서 이미지 업로드를 사용하는 컴포넌트들을 네이티브 카메라와 통합하는 방법입니다.

### 1. useImageUpload 훅 업데이트

기존 `src/hooks/useImageUpload.js`를 수정하여 네이티브 카메라를 지원하도록 합니다:

```jsx
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useCamera } from './useCamera'
import { Capacitor } from '@capacitor/core'

export const useImageUpload = (options = {}) => {
  const {
    bucket = 'post-images',
    maxSize = 5 * 1024 * 1024,
    multiple = false,
    maxImages = 2,
  } = options

  const { takePicture, dataUrlToFile, isNative } = useCamera()

  // 기존 상태들...
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  // 네이티브 카메라로 사진 촬영 (단일)
  const handleNativeCamera = async () => {
    try {
      const dataUrl = await takePicture({
        quality: 90,
        width: 1024,
      })

      if (dataUrl) {
        const file = dataUrlToFile(dataUrl, `photo-${Date.now()}.jpg`)
        setImageFile(file)
        setImagePreview(dataUrl)
        setError('')
      }
    } catch (err) {
      console.error('Error taking picture:', err)
      setError('사진 촬영 중 오류가 발생했습니다')
    }
  }

  // 네이티브 카메라로 사진 촬영 (다중)
  const handleNativeCameraMultiple = async (index) => {
    try {
      const dataUrl = await takePicture({
        quality: 90,
        width: 1024,
      })

      if (dataUrl) {
        const file = dataUrlToFile(dataUrl, `photo-${Date.now()}.jpg`)

        setImageFiles((prev) => {
          const newFiles = [...prev]
          newFiles[index] = file
          return newFiles
        })

        setImagePreviews((prev) => {
          const newPreviews = [...prev]
          newPreviews[index] = dataUrl
          return newPreviews
        })

        setError('')
      }
    } catch (err) {
      console.error('Error taking picture:', err)
      setError('사진 촬영 중 오류가 발생했습니다')
    }
  }

  // 기존 파일 선택 핸들러는 그대로 유지...
  const handleImageSelect = async (e) => {
    // 웹에서만 사용
    if (isNative) return

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

  // 나머지 함수들 (uploadImage, removeImage 등)은 그대로...

  if (multiple) {
    return {
      imageFiles,
      imagePreviews,
      uploading,
      error,
      handleImageSelect: handleMultipleImageSelect,
      handleNativeCamera: handleNativeCameraMultiple,
      removeImage: removeMultipleImage,
      uploadImages: uploadMultipleImages,
      reset,
      hasImages: imageFiles.some((file) => file !== null),
      isNative,
    }
  }

  return {
    imageFile,
    imagePreview,
    uploading,
    error,
    handleImageSelect,
    handleNativeCamera,
    removeImage,
    uploadImage,
    reset,
    hasImage: !!imageFile,
    isNative,
  }
}
```

### 2. 컴포넌트에서 사용 예제

```jsx
// 예: src/pages/questions/WriteAnswerPage.jsx
import { useImageUpload } from '../../hooks/useImageUpload'

function WriteAnswerPage() {
  const {
    imageFile,
    imagePreview,
    uploading,
    error,
    handleImageSelect,
    handleNativeCamera,
    removeImage,
    uploadImage,
    isNative,
  } = useImageUpload({ bucket: 'post-images' })

  const handleSubmit = async () => {
    let imageUrl = null

    if (imageFile) {
      // 이미지 업로드
      imageUrl = await uploadImage(user.id)
    }

    // 답변 저장...
  }

  return (
    <div>
      {/* 네이티브 앱에서는 카메라 버튼 표시 */}
      {isNative ? (
        <button onClick={handleNativeCamera}>
          카메라로 촬영
        </button>
      ) : (
        /* 웹에서는 기존 input file */
        <input
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
        />
      )}

      {/* 미리보기는 동일하게 표시 */}
      {imagePreview && (
        <div>
          <img src={imagePreview} alt="Preview" />
          <button onClick={removeImage}>삭제</button>
        </div>
      )}

      {error && <p className="error">{error}</p>}

      <button onClick={handleSubmit} disabled={uploading}>
        {uploading ? '업로드 중...' : '답변 작성'}
      </button>
    </div>
  )
}
```

### 3. 모임 이미지 업로드 (다중 이미지)

```jsx
// 예: src/pages/meetings/CreateMeetingPage.jsx
function CreateMeetingPage() {
  const {
    imageFiles,
    imagePreviews,
    handleImageSelect,
    handleNativeCamera,
    removeImage,
    uploadImages,
    isNative,
  } = useImageUpload({
    bucket: 'post-images',
    multiple: true,
    maxImages: 2,
  })

  const handleSubmit = async () => {
    // 이미지 업로드
    const imageUrls = await uploadImages(user.id)

    // 모임 생성...
  }

  return (
    <div>
      {[0, 1].map((index) => (
        <div key={index}>
          {imagePreviews[index] ? (
            <div>
              <img src={imagePreviews[index]} alt={`Image ${index + 1}`} />
              <button onClick={() => removeImage(index)}>삭제</button>
            </div>
          ) : (
            <div>
              {isNative ? (
                <button onClick={() => handleNativeCamera(index)}>
                  사진 {index + 1} 촬영
                </button>
              ) : (
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageSelect(e, index)}
                />
              )}
            </div>
          )}
        </div>
      ))}

      <button onClick={handleSubmit}>모임 만들기</button>
    </div>
  )
}
```

---

## authStore 보안 스토리지 통합

기존 zustand persist를 네이티브 앱에서는 보안 스토리지로 교체:

```jsx
// src/store/authStore.js
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { secureStorage } from '../utils/secureStorage'
import { Capacitor } from '@capacitor/core'

// 네이티브용 스토리지 어댑터
const capacitorStorage = {
  getItem: async (name) => {
    return await secureStorage.getItem(name)
  },
  setItem: async (name, value) => {
    await secureStorage.setItem(name, value)
  },
  removeItem: async (name) => {
    await secureStorage.removeItem(name)
  },
}

const isNative = Capacitor.isNativePlatform()

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      session: null,
      isLoading: false,

      setUser: (user) => {
        const session = user ? {
          user: { id: user.id },
          access_token: 'custom_session',
          expires_at: Date.now() + (7 * 24 * 60 * 60 * 1000)
        } : null
        set({ user, session, isLoading: false })
      },
      setSession: (session) => set({ session }),
      logout: () => set({ user: null, session: null }),
    }),
    {
      name: 'auth-storage',
      storage: isNative
        ? createJSONStorage(() => capacitorStorage)
        : undefined, // 웹에서는 기본 localStorage
      partialize: (state) => ({
        user: state.user,
        session: state.session
      }),
    }
  )
)
```

---

## 네트워크 상태 모니터링

```jsx
// src/hooks/useNetworkStatus.js
import { useState, useEffect } from 'react'
import { Network } from '@capacitor/network'
import { Capacitor } from '@capacitor/core'

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true)
  const [connectionType, setConnectionType] = useState('unknown')

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      // 웹에서는 기존 방식
      const handleOnline = () => setIsOnline(true)
      const handleOffline = () => setIsOnline(false)

      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)

      return () => {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
      }
    }

    // 네이티브: Capacitor Network 플러그인 사용
    let handler

    const setupNetworkListener = async () => {
      // 초기 상태 확인
      const status = await Network.getStatus()
      setIsOnline(status.connected)
      setConnectionType(status.connectionType)

      // 네트워크 변경 리스너
      handler = await Network.addListener('networkStatusChange', (status) => {
        setIsOnline(status.connected)
        setConnectionType(status.connectionType)
      })
    }

    setupNetworkListener()

    return () => {
      if (handler) {
        handler.remove()
      }
    }
  }, [])

  return { isOnline, connectionType }
}

// 사용 예제
function MyComponent() {
  const { isOnline, connectionType } = useNetworkStatus()

  if (!isOnline) {
    return <div>오프라인입니다. 인터넷 연결을 확인하세요.</div>
  }

  return <div>연결됨: {connectionType}</div>
}
```

---

## 주의사항

1. **플랫폼 감지**: 항상 `Capacitor.isNativePlatform()`으로 웹/네이티브 구분
2. **권한 처리**: 카메라 등 권한이 필요한 기능은 에러 핸들링 필수
3. **파일 크기**: 네이티브에서도 이미지 크기 제한 유지
4. **테스트**: 웹과 네이티브 양쪽에서 모두 테스트 필요

---

## 업데이트할 주요 파일들

1. ✅ `src/hooks/useImageUpload.js` - 네이티브 카메라 통합
2. ✅ `src/store/authStore.js` - 보안 스토리지 사용
3. ✅ `src/pages/questions/WriteAnswerPage.jsx` - 카메라 버튼 추가
4. ✅ `src/pages/meetings/CreateMeetingPage.jsx` - 카메라 버튼 추가
5. ✅ `src/components/meetings/ImageAdjustModal.jsx` - 카메라 옵션 추가

각 컴포넌트에서 `isNative` 값에 따라 UI를 조건부로 렌더링하면 됩니다.
