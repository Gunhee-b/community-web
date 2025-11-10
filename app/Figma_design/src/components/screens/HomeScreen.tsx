import { Calendar, Users, MessageCircle, TrendingUp } from 'lucide-react';
import TopNavBar from '../TopNavBar';

interface HomeScreenProps {
  onNotifications: () => void;
  onQuestionDetail: (id: number) => void;
  onMeetingDetail: (id: number) => void;
  onVoting?: () => void;
  theme: 'light' | 'dark';
  notificationCount: number;
}

export default function HomeScreen({
  onNotifications,
  onQuestionDetail,
  onMeetingDetail,
  onVoting,
  theme,
  notificationCount,
}: HomeScreenProps) {
  const isDark = theme === 'dark';

  const todayQuestion = {
    id: 1,
    question: '오늘 가장 기억에 남는 순간은 무엇인가요?',
    answerCount: 24,
  };

  const upcomingMeetings = [
    {
      id: 1,
      title: '강남 카페 모임',
      date: '11월 9일',
      time: '14:00',
      participants: 8,
      maxParticipants: 12,
      image: 'cafe',
    },
    {
      id: 2,
      title: '주말 등산',
      date: '11월 10일',
      time: '09:00',
      participants: 15,
      maxParticipants: 20,
      image: 'mountain',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      user: '김민수',
      action: '님이 "강남 카페 모임"에 참여했습니다',
      time: '5분 전',
      avatar: '김',
    },
    {
      id: 2,
      user: '이지은',
      action: '님이 오늘의 질문에 답변했습니다',
      time: '15분 전',
      avatar: '이',
    },
    {
      id: 3,
      user: '박준영',
      action: '님이 "주말 등산"을 만들었습니다',
      time: '1시간 전',
      avatar: '박',
    },
    {
      id: 4,
      user: '최수진',
      action: '님이 "정기 모임" 투표를 시작했습니다',
      time: '2시간 전',
      avatar: '최',
    },
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gray-50'} pb-20`}>
      <TopNavBar
        title="INGK Community"
        onNotifications={onNotifications}
        notificationCount={notificationCount}
        theme={theme}
      />

      <div className="px-4 py-4 max-w-md mx-auto space-y-6">
        {/* Today's Question Banner */}
        <div
          onClick={() => onQuestionDetail(todayQuestion.id)}
          className="bg-gradient-to-br from-[#007AFF] to-[#5856D6] rounded-2xl p-6 text-white cursor-pointer shadow-lg"
        >
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle size={20} />
            <span className="text-sm opacity-90">오늘의 질문</span>
          </div>
          <h2 className="text-lg mb-4">{todayQuestion.question}</h2>
          <div className="flex items-center justify-between">
            <span className="text-sm opacity-90">{todayQuestion.answerCount}개의 답변</span>
            <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm transition-colors">
              답변하기 →
            </button>
          </div>
        </div>

        {/* Upcoming Meetings */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`${isDark ? 'text-white' : 'text-gray-900'}`}>다가오는 모임</h3>
            <button className="text-sm text-[#007AFF]">전체보기</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {upcomingMeetings.map((meeting) => (
              <div
                key={meeting.id}
                onClick={() => onMeetingDetail(meeting.id)}
                className={`flex-shrink-0 w-64 ${
                  isDark ? 'bg-gray-900' : 'bg-white'
                } rounded-xl overflow-hidden shadow cursor-pointer`}
              >
                <div className="h-32 bg-gradient-to-br from-blue-400 to-purple-400"></div>
                <div className="p-4">
                  <h4 className={`mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{meeting.title}</h4>
                  <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                    <Calendar size={14} />
                    <span>{meeting.date} {meeting.time}</span>
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <Users size={14} />
                    <span>{meeting.participants}/{meeting.maxParticipants}명 참여</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Voting Banner */}
        {onVoting && (
          <div
            onClick={onVoting}
            className="bg-gradient-to-br from-[#FF9500] to-[#FF3B30] rounded-2xl p-6 text-white cursor-pointer shadow-lg"
          >
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={20} />
              <span className="text-sm opacity-90">11월 베스트 투표</span>
            </div>
            <h2 className="text-lg mb-4">이달의 베스트를 선택해주세요!</h2>
            <div className="flex items-center justify-between">
              <span className="text-sm opacity-90">마감: 11월 15일</span>
              <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm transition-colors">
                투표하기 →
              </button>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={20} className={isDark ? 'text-white' : 'text-gray-900'} />
            <h3 className={isDark ? 'text-white' : 'text-gray-900'}>최근 활동</h3>
          </div>
          <div className={`${isDark ? 'bg-gray-900' : 'bg-white'} rounded-xl overflow-hidden shadow`}>
            {recentActivities.map((activity, index) => (
              <div
                key={activity.id}
                className={`p-4 flex items-center gap-3 ${
                  index !== recentActivities.length - 1
                    ? isDark
                      ? 'border-b border-gray-800'
                      : 'border-b border-gray-100'
                    : ''
                }`}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-[#007AFF] to-[#5856D6] rounded-full flex items-center justify-center text-white flex-shrink-0">
                  {activity.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>{activity.user}</span>
                    {activity.action}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} mt-1`}>{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
