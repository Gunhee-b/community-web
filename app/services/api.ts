import axios, { AxiosInstance, AxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';
import { storage } from '../utils/storage-native';

/**
 * API 응답 타입 정의
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * API 에러 타입 정의
 */
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

/**
 * API 엔드포인트 상수
 * 모든 API 경로를 중앙에서 관리
 */
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  // Meetings
  MEETINGS: {
    LIST: '/meetings',
    DETAIL: (id: string) => `/meetings/${id}`,
    CREATE: '/meetings',
    UPDATE: (id: string) => `/meetings/${id}`,
    DELETE: (id: string) => `/meetings/${id}`,
    JOIN: (id: string) => `/meetings/${id}/join`,
    LEAVE: (id: string) => `/meetings/${id}/leave`,
  },
  // Questions
  QUESTIONS: {
    LIST: '/questions',
    DETAIL: (id: string) => `/questions/${id}`,
    TODAY: '/questions/today',
    ANSWERS: (id: string) => `/questions/${id}/answers`,
    SUBMIT_ANSWER: (id: string) => `/questions/${id}/answers`,
  },
  // Chat
  CHAT: {
    MESSAGES: (meetingId: string) => `/meetings/${meetingId}/chat`,
    SEND: (meetingId: string) => `/meetings/${meetingId}/chat`,
  },
  // Users
  USERS: {
    PROFILE: '/users/profile',
    UPDATE: '/users/profile',
  },
} as const;

/**
 * Axios 인스턴스 생성 및 설정
 * - Base URL 설정
 * - 타임아웃 설정
 * - 공통 헤더 설정
 */
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com',
    timeout: 30000, // 30초
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  return instance;
};

/**
 * API 클라이언트 인스턴스
 */
export const apiClient = createApiInstance();

/**
 * 요청 인터셉터
 * - 모든 요청에 인증 토큰 추가
 * - 요청 로깅 (개발 모드)
 */
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // AsyncStorage에서 토큰 가져오기
      const token = await storage.getItem('auth_token');

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // 개발 모드에서 요청 로깅
      if (__DEV__) {
        console.log('🚀 API Request:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          data: config.data,
        });
      }

      return config;
    } catch (error) {
      console.error('Error in request interceptor:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 응답 인터셉터
 * - 성공 응답 처리
 * - 에러 응답 처리
 * - 토큰 갱신 처리
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // 개발 모드에서 응답 로깅
    if (__DEV__) {
      console.log('✅ API Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data,
      });
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // 개발 모드에서 에러 로깅
    if (__DEV__) {
      console.error('❌ API Error:', {
        url: originalRequest?.url,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      });
    }

    // 401 에러 (Unauthorized) 처리
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 리프레시 토큰으로 새 액세스 토큰 요청
        const refreshToken = await storage.getItem('refresh_token');

        if (refreshToken) {
          const response = await axios.post(
            `${apiClient.defaults.baseURL}${API_ENDPOINTS.AUTH.REFRESH}`,
            { refresh_token: refreshToken }
          );

          const { access_token } = response.data;

          // 새 토큰 저장
          await storage.setItem('auth_token', access_token);

          // 원래 요청 재시도
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
          }

          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // 리프레시 실패 시 로그아웃 처리
        await storage.removeItem('auth_token');
        await storage.removeItem('refresh_token');
        // 로그인 화면으로 리다이렉트 (Navigation 필요)
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * API 에러를 사용자 친화적인 메시지로 변환
 *
 * @param error - Axios 에러 객체
 * @returns 에러 정보 객체
 */
export const handleApiError = (error: any): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;

    // 서버 응답이 있는 경우
    if (axiosError.response) {
      const { status, data } = axiosError.response;

      return {
        message: data?.message || data?.error || '요청 처리 중 오류가 발생했습니다',
        status,
        code: data?.code,
        details: data?.details,
      };
    }

    // 요청은 했지만 응답을 받지 못한 경우
    if (axiosError.request) {
      return {
        message: '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.',
        code: 'NETWORK_ERROR',
      };
    }
  }

  // 기타 에러
  return {
    message: error?.message || '알 수 없는 오류가 발생했습니다',
    code: 'UNKNOWN_ERROR',
  };
};

/**
 * HTTP GET 요청
 *
 * @param url - 요청 URL
 * @param config - Axios 설정
 * @returns API 응답
 *
 * @example
 * ```typescript
 * const meetings = await get<Meeting[]>('/meetings');
 * if (meetings.data) {
 *   console.log(meetings.data);
 * }
 * ```
 */
export const get = async <T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiClient.get<T>(url, config);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    const apiError = handleApiError(error);
    return {
      success: false,
      error: apiError.message,
    };
  }
};

/**
 * HTTP POST 요청
 *
 * @param url - 요청 URL
 * @param data - 전송할 데이터
 * @param config - Axios 설정
 * @returns API 응답
 *
 * @example
 * ```typescript
 * const result = await post('/meetings', { title: 'New Meeting' });
 * if (result.success) {
 *   console.log('Meeting created:', result.data);
 * }
 * ```
 */
export const post = async <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiClient.post<T>(url, data, config);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    const apiError = handleApiError(error);
    return {
      success: false,
      error: apiError.message,
    };
  }
};

/**
 * HTTP PUT 요청
 *
 * @param url - 요청 URL
 * @param data - 전송할 데이터
 * @param config - Axios 설정
 * @returns API 응답
 *
 * @example
 * ```typescript
 * const result = await put('/meetings/123', { title: 'Updated Title' });
 * ```
 */
export const put = async <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiClient.put<T>(url, data, config);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    const apiError = handleApiError(error);
    return {
      success: false,
      error: apiError.message,
    };
  }
};

/**
 * HTTP PATCH 요청
 *
 * @param url - 요청 URL
 * @param data - 전송할 데이터
 * @param config - Axios 설정
 * @returns API 응답
 */
export const patch = async <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiClient.patch<T>(url, data, config);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    const apiError = handleApiError(error);
    return {
      success: false,
      error: apiError.message,
    };
  }
};

/**
 * HTTP DELETE 요청
 *
 * @param url - 요청 URL
 * @param config - Axios 설정
 * @returns API 응답
 *
 * @example
 * ```typescript
 * const result = await del('/meetings/123');
 * if (result.success) {
 *   console.log('Meeting deleted');
 * }
 * ```
 */
export const del = async <T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiClient.delete<T>(url, config);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    const apiError = handleApiError(error);
    return {
      success: false,
      error: apiError.message,
    };
  }
};

/**
 * 파일 업로드를 위한 multipart/form-data POST 요청
 *
 * @param url - 요청 URL
 * @param formData - FormData 객체
 * @param onProgress - 업로드 진행률 콜백
 * @returns API 응답
 *
 * @example
 * ```typescript
 * const formData = new FormData();
 * formData.append('file', file);
 *
 * const result = await uploadFile('/upload', formData, (progress) => {
 *   console.log(`Upload progress: ${progress}%`);
 * });
 * ```
 */
export const uploadFile = async <T = any>(
  url: string,
  formData: FormData,
  onProgress?: (progress: number) => void
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiClient.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    const apiError = handleApiError(error);
    return {
      success: false,
      error: apiError.message,
    };
  }
};

/**
 * API 클라이언트 기본 설정 업데이트
 *
 * @param config - 업데이트할 설정
 *
 * @example
 * ```typescript
 * updateApiConfig({
 *   baseURL: 'https://new-api.example.com',
 *   timeout: 60000,
 * });
 * ```
 */
export const updateApiConfig = (config: Partial<AxiosRequestConfig>) => {
  Object.assign(apiClient.defaults, config);
};

/**
 * 네트워크 연결 상태 확인
 *
 * @returns 연결 가능 여부
 */
export const checkNetworkConnection = async (): Promise<boolean> => {
  try {
    const response = await apiClient.get('/health', { timeout: 5000 });
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

// 기본 export
export default {
  get,
  post,
  put,
  patch,
  del,
  uploadFile,
  handleApiError,
  updateApiConfig,
  checkNetworkConnection,
  API_ENDPOINTS,
  apiClient,
};
