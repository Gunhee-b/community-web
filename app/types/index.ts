// Common Types
export interface User {
  id: string;
  username: string;
  email?: string;
  role: 'admin' | 'user' | 'host';
  created_at: string;
  kakao_id?: string;
  google_id?: string;
  apple_id?: string;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  location?: string;
  location_detail?: string;
  latitude?: number;
  longitude?: number;
  start_datetime: string;
  end_datetime?: string;
  max_participants?: number;
  current_participants: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  image_url?: string;
  kakao_openchat_link?: string;
  meeting_type?: 'regular' | 'special';
  host_id?: string;
  host_name?: string;
  host_introduction?: string;
  created_at: string;
}

export interface Question {
  id: string;
  title?: string;          // 질문 제목
  short_description?: string; // 짧은 설명
  content?: string;        // 상세 내용
  scheduled_date: string;
  is_published: boolean;
  created_at: string;
  image_url?: string;      // 질문 이미지
  external_link?: string;  // 외부 링크
  external_link_text?: string; // 외부 링크 텍스트
  reference_links?: string; // 참고 문헌 (JSON)
  // Legacy fields for backward compatibility
  question_title?: string;
  question_text?: string;
  date?: string;
  is_active?: boolean;
}

export interface Answer {
  id: string;
  question_id: string;
  user_id: string;
  content: string;         // 답변 내용 (웹 DB 필드명)
  answer_text?: string;    // Legacy field
  image_url?: string;
  image_url_2?: string;
  is_public: boolean;
  created_at: string;
  updated_at?: string;
  user?: {
    username: string;
  };
  users?: {              // Supabase join 결과
    username: string;
  };
}

export interface ChatMessage {
  id: string;
  meeting_id: string;
  user_id: string;
  message: string;
  created_at: string;
  user?: {
    username: string;
  };
}

export interface AnswerComment {
  id: string;
  answer_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at?: string;
  user?: {
    username: string;
  };
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'meeting_join' | 'meeting_chat' | 'new_question' | 'answer_comment' | 'vote' | 'system';
  meeting_id?: string;
  related_id?: string;
  read: boolean;
  created_at: string;
}

export interface VotingPeriod {
  id: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed';
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  image_url?: string;
  created_at: string;
  vote_count?: number;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

// Navigation Types
export type RootStackParamList = {
  Home: undefined;
  MeetingDetail: { id: string };
  QuestionDetail: { id: string };
  Profile: undefined;
  // Add more routes as needed
};

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface MeetingFormData {
  title: string;
  description?: string;
  location?: string;
  location_detail?: string;
  latitude?: number;
  longitude?: number;
  start_datetime: string;
  end_datetime?: string;
  max_participants?: number;
  image_url?: string;
  kakao_openchat_link?: string;
}
