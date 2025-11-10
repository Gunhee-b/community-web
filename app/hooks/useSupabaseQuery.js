import { useState, useEffect, useCallback } from 'react'

/**
 * Supabase 쿼리를 위한 재사용 가능한 커스텀 훅
 * 반복되는 데이터 fetch 패턴을 통합하여 코드 중복 제거
 *
 * @param {Function} queryFn - Supabase 쿼리를 실행하는 비동기 함수
 * @param {Array} dependencies - useEffect 의존성 배열
 * @param {Object} options - 옵션 설정
 * @param {boolean} options.immediate - 즉시 실행 여부 (기본값: true)
 * @param {Function} options.onSuccess - 성공 시 콜백
 * @param {Function} options.onError - 에러 시 콜백
 * @returns {Object} 쿼리 결과 및 제어 함수
 */
export const useSupabaseQuery = (queryFn, dependencies = [], options = {}) => {
  const { immediate = true, onSuccess, onError } = options

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState(null)

  const execute = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await queryFn()

      if (result.error) {
        throw result.error
      }

      setData(result.data)

      if (onSuccess) {
        onSuccess(result.data)
      }

      return result.data
    } catch (err) {
      console.error('Supabase query error:', err)
      setError(err)

      if (onError) {
        onError(err)
      }

      throw err
    } finally {
      setLoading(false)
    }
  }, [queryFn, onSuccess, onError])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, dependencies)

  const refetch = useCallback(() => {
    return execute()
  }, [execute])

  return {
    data,
    loading,
    error,
    refetch,
    execute,
  }
}

/**
 * Supabase mutation을 위한 커스텀 훅 (insert, update, delete)
 *
 * @param {Function} mutationFn - Supabase mutation을 실행하는 비동기 함수
 * @param {Object} options - 옵션 설정
 * @returns {Object} mutation 실행 함수 및 상태
 */
export const useSupabaseMutation = (mutationFn, options = {}) => {
  const { onSuccess, onError } = options

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const mutate = useCallback(
    async (variables) => {
      setLoading(true)
      setError(null)

      try {
        const result = await mutationFn(variables)

        if (result.error) {
          throw result.error
        }

        if (onSuccess) {
          onSuccess(result.data, variables)
        }

        return result.data
      } catch (err) {
        console.error('Supabase mutation error:', err)
        setError(err)

        if (onError) {
          onError(err, variables)
        }

        throw err
      } finally {
        setLoading(false)
      }
    },
    [mutationFn, onSuccess, onError]
  )

  return {
    mutate,
    loading,
    error,
  }
}
