import { useState, useEffect, useCallback, useRef } from 'react'
import Cropper from 'react-easy-crop'
import Button from '../common/Button'

function ImageAdjustModal({ isOpen, onClose, imagePreview, onConfirm }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [startY, setStartY] = useState(0)
  const [startZoom, setStartZoom] = useState(1)
  const [touchDistance, setTouchDistance] = useState(null)
  const containerRef = useRef(null)

  // Reset crop and zoom when modal opens
  useEffect(() => {
    if (isOpen) {
      setCrop({ x: 0, y: 0 })
      setZoom(1)
    }
  }, [isOpen])

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  // Calculate distance between two touch points
  const getTouchDistance = useCallback((touch1, touch2) => {
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }, [])

  // Handle touch start for pinch zoom
  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      e.preventDefault()
      const distance = getTouchDistance(e.touches[0], e.touches[1])
      setTouchDistance(distance)
      setStartZoom(zoom)
    }
  }, [zoom, getTouchDistance])

  // Handle touch move for pinch zoom
  const handleTouchMove = useCallback((e) => {
    if (e.touches.length === 2 && touchDistance !== null) {
      e.preventDefault()
      const distance = getTouchDistance(e.touches[0], e.touches[1])
      const scale = distance / touchDistance
      const newZoom = Math.min(Math.max(startZoom * scale, 1), 3)
      setZoom(newZoom)
    }
  }, [touchDistance, startZoom, getTouchDistance])

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    setTouchDistance(null)
  }, [])

  // Handle mouse down for diagonal drag zoom
  const handleMouseDown = useCallback((e) => {
    // Right click or Shift+click for zoom
    if (e.button === 2 || e.shiftKey) {
      e.preventDefault()
      setIsDragging(true)
      setStartX(e.clientX)
      setStartY(e.clientY)
      setStartZoom(zoom)
    }
  }, [zoom])

  // Handle mouse move for diagonal drag zoom
  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      e.preventDefault()
      const deltaX = e.clientX - startX
      const deltaY = startY - e.clientY // Inverted Y for natural feel

      // Calculate diagonal distance (combination of horizontal and vertical movement)
      const diagonalDelta = (deltaX + deltaY) / 2
      const zoomDelta = diagonalDelta * 0.01
      const newZoom = Math.min(Math.max(startZoom + zoomDelta, 1), 3)
      setZoom(newZoom)
    }
  }, [isDragging, startX, startY, startZoom])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm(croppedAreaPixels)
    onClose()
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">이미지 크기 조정</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Image Cropper */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이미지 조정 (확대/축소: {zoom.toFixed(1)}x)
            </label>
            <div
              ref={containerRef}
              className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden cursor-move touch-none"
              onMouseDown={handleMouseDown}
              onContextMenu={(e) => e.preventDefault()}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <Cropper
                image={imagePreview}
                crop={crop}
                zoom={zoom}
                aspect={4 / 3}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">💡 이미지 조정 방법</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>한 손가락 드래그</strong>: 이미지 위치 이동</li>
              <li>• <strong>두 손가락 핀치</strong> (모바일) 또는 <strong>마우스 휠</strong>: 확대/축소</li>
              <li>• <strong>Shift + 대각선 드래그</strong> (PC): 확대/축소</li>
              <li>• 인물 사진의 경우 얼굴이 중앙에 오도록 조정하세요</li>
              <li>• 가로:세로 비율은 4:3으로 고정됩니다</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex space-x-4 p-6 border-t bg-gray-50">
          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={onClose}
          >
            취소
          </Button>
          <Button
            type="button"
            fullWidth
            onClick={handleConfirm}
          >
            적용
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ImageAdjustModal
