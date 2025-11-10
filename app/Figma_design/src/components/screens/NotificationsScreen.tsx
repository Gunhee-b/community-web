import { Calendar, Users, MessageCircle, TrendingUp, X } from 'lucide-react';
import TopNavBar from '../TopNavBar';

interface NotificationsScreenProps {
  onBack: () => void;
  theme: 'light' | 'dark';
  onClearNotifications: () => void;
}

export default function NotificationsScreen({ onBack, theme, onClearNotifications }: NotificationsScreenProps) {
  const isDark = theme === 'dark';

  const notifications = [
    {
      id: 1,
      type: 'meeting',
      icon: Users,
      iconBg: 'bg-[#007AFF]',
      title: '모임 참여 확인',
      message: '김민수님이 "강남 카페 모임"에 참여했습니다',
      time: '5분 전',
      isRead: false,
    },
    {
      id: 2,
      type: 'question',
      icon: MessageCircle,
      iconBg: 'bg-[#5856D6]',
      title: '새로운 질문',
      message: '오늘의 질문이 업데이트되었습니다',
      time: '30분 전',
      isRead: false,
    },
    {
      id: 3,
      type: 'meeting',
      icon: Calendar,
      iconBg: 'bg-[#007AFF]',
      title: '모임 시작 알림',
      message: '"주말 등산" 모임이 1시간 후 시작됩니다',
      time: '1시간 전',
      isRead: false,
    },
    {
      id: 4,
      type: 'vote',
      icon: TrendingUp,
      iconBg: 'bg-[#34C759]',
      title: '투표 시작',
      message: '11월 베스트 게시물 투표가 시작되었습니다',
      time: '2시간 전',
      isRead: true,
    },
    {
      id: 5,
      type: 'chat',
      icon: MessageCircle,
      iconBg: 'bg-[#FF9500]',
      title: '새로운 메시지',
      message: '이지은님이 채팅방에 메시지를 보냈습니다',
      time: '3시간 전',
      isRead: true,
    },
    {
      id: 6,
      type: 'meeting',
      icon: Users,
      iconBg: 'bg-[#007AFF]',
      title: '모임 취소',
      message: '"보드게임 카페" 모임이 취소되었습니다',
      time: '어제',
      isRead: true,
    },
    {
      id: 7,
      type: 'question',
      icon: MessageCircle,
      iconBg: 'bg-[#5856D6]',
      title: '답변 좋아요',
      message: '박준영님이 회원님의 답변을 좋아합니다',
      time: '어제',
      isRead: true,
    },
    {
      id: 8,
      type: 'meeting',
      icon: Calendar,
      iconBg: 'bg-[#007AFF]',
      title: '모임 확정',
      message: '"강남 카페 모임"이 확정되었습니다',
      time: '2일 전',
      isRead: true,
    },
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gray-50'} pb-6`}>
      <TopNavBar
        title="알림"
        onBack={onBack}
        theme={theme}
        rightAction={
          <button onClick={onClearNotifications} className="text-sm text-[#007AFF]">
            모두 읽음
          </button>
        }
      />

      <div className="px-4 py-4 max-w-md mx-auto">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <div className={`text-6xl mb-4`}>🔔</div>
            <h3 className={`mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>알림이 없습니다</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              새로운 알림이 오면 여기에 표시됩니다
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => {
              const Icon = notification.icon;
              return (
                <div
                  key={notification.id}
                  className={`${
                    isDark ? 'bg-gray-900' : 'bg-white'
                  } rounded-xl p-4 shadow cursor-pointer hover:shadow-md transition-shadow ${
                    !notification.isRead ? 'border-l-4 border-[#007AFF]' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 ${notification.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <Icon size={20} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-[#007AFF] rounded-full flex-shrink-0 mt-1.5"></div>
                        )}
                      </div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                        {notification.message}
                      </p>
                      <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {notification.time}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
