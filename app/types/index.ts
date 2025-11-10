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
  question_text: string;
  date: string;
  is_active: boolean;
  created_at: string;
}

export interface Answer {
  id: string;
  question_id: string;
  user_id: string;
  answer_text: string;
  image_url?: string;
  image_url_2?: string;
  is_public: boolean;
  created_at: string;
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

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'meeting' | 'chat' | 'question' | 'vote' | 'system';
  related_id?: string;
  is_read: boolean;
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
