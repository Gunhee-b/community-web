import { useState, useEffect } from 'react'

function LocationMapPreview({ location, showInDetail = false }) {
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    // Show preview when location has at least 2 characters
    setShowPreview(location && location.trim().length >= 2)
  }, [location])

  const getNaverMapSearchUrl = () => {
    return `https://map.naver.com/v5/search/${encodeURIComponent(location)}`
  }

  if (!showPreview) {
    return null
  }

  if (showInDetail) {
    // Simplified version for detail page - just show the link
    return (
      <div className="mb-4">
        <a
          href={getNaverMapSearchUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 hover:underline text-sm"
        >
          🗺️ 네이버 지도에서 위치 확인하기 →
        </a>
      </div>
    )
  }

  return (
    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-blue-900 mb-2">
            📍 가게 이름 확인 필수
          </h4>
          <p className="text-sm text-blue-800 mb-3 leading-relaxed">
            아래 링크를 클릭하여 네이버 지도에서 <strong>정확한 가게 이름</strong>을 확인하고,<br />
            그 가게 이름을 위에 입력해주세요. (예: "강남역 스타벅스 R점")
          </p>
          <a
            href={getNaverMapSearchUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-white border border-blue-300 rounded-lg text-sm font-medium text-blue-700 hover:bg-blue-100 transition shadow-sm"
          >
            🔍 네이버 지도에서 정확한 가게 이름 찾기 →
          </a>
          <p className="text-xs text-blue-600 mt-3">
            💡 참가자들이 쉽게 찾을 수 있도록 정확한 가게 이름을 입력해주세요
          </p>
        </div>
      </div>
    </div>
  )
}

export default LocationMapPreview
