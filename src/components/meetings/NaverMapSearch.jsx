import { useState, useEffect } from 'react'
import Button from '../common/Button'

function NaverMapSearch({ location, onLocationSelect }) {
  const [searchResults, setSearchResults] = useState([])
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [loading, setLoading] = useState(false)

  // Search places using Naver Maps API
  const searchPlace = async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([])
      return
    }

    setLoading(true)
    try {
      // Use Naver Local Search API
      const response = await fetch(
        `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(
          query
        )}&display=5`,
        {
          headers: {
            'X-Naver-Client-Id': import.meta.env.VITE_NAVER_CLIENT_ID,
            'X-Naver-Client-Secret': import.meta.env.VITE_NAVER_CLIENT_SECRET,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.items || [])
      }
    } catch (error) {
      console.error('Error searching place:', error)
      // Fallback: Create a simple search result with the query
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      searchPlace(location)
    }, 500)

    return () => clearTimeout(timer)
  }, [location])

  const handleSelectPlace = (place) => {
    setSelectedPlace(place)
    if (onLocationSelect) {
      onLocationSelect({
        name: place.title.replace(/<[^>]*>/g, ''), // Remove HTML tags
        address: place.address,
        roadAddress: place.roadAddress,
        mapx: place.mapx,
        mapy: place.mapy,
      })
    }
  }

  const getNaverMapUrl = (place) => {
    // Naver Map URL format
    const title = place.title.replace(/<[^>]*>/g, '')
    return `https://map.naver.com/v5/search/${encodeURIComponent(title)}`
  }

  return (
    <div className="space-y-3">
      {/* Search Results */}
      {loading && (
        <div className="text-sm text-gray-500 p-2">장소를 검색하는 중...</div>
      )}

      {!loading && searchResults.length > 0 && (
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700">
            검색 결과
          </div>
          <div className="divide-y divide-gray-200">
            {searchResults.map((place, index) => (
              <div
                key={index}
                className={`p-3 hover:bg-blue-50 cursor-pointer transition ${
                  selectedPlace === place ? 'bg-blue-100' : ''
                }`}
                onClick={() => handleSelectPlace(place)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4
                      className="font-medium text-gray-900"
                      dangerouslySetInnerHTML={{
                        __html: place.title,
                      }}
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      {place.roadAddress || place.address}
                    </p>
                    {place.category && (
                      <p className="text-xs text-gray-500 mt-1">
                        {place.category}
                      </p>
                    )}
                  </div>
                  {selectedPlace === place && (
                    <span className="ml-2 text-blue-600 text-sm">✓</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Place Map Link */}
      {selectedPlace && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">선택된 장소</h4>
          <p
            className="text-sm text-gray-700 mb-1"
            dangerouslySetInnerHTML={{
              __html: selectedPlace.title,
            }}
          />
          <p className="text-xs text-gray-600 mb-3">
            {selectedPlace.roadAddress || selectedPlace.address}
          </p>
          <a
            href={getNaverMapUrl(selectedPlace)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            <Button variant="secondary" size="sm">
              네이버 지도에서 보기 →
            </Button>
          </a>
        </div>
      )}

      {/* No Results */}
      {!loading && location && location.length >= 2 && searchResults.length === 0 && (
        <div className="text-sm text-gray-500 p-2">
          검색 결과가 없습니다. 장소 이름을 직접 입력해주세요.
        </div>
      )}
    </div>
  )
}

export default NaverMapSearch
