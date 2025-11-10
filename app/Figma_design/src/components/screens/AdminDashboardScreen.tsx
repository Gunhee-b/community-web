import { Users, Calendar, MessageCircle, TrendingUp, Key, Settings } from 'lucide-react';
import TopNavBar from '../TopNavBar';

interface AdminDashboardScreenProps {
  onBack: () => void;
  theme: 'light' | 'dark';
}

export default function AdminDashboardScreen({ onBack, theme }: AdminDashboardScreenProps) {
  const isDark = theme === 'dark';

  const stats = [
    { label: '전체 회원', value: '234', icon: Users, color: 'bg-[#007AFF]' },
    { label: '진행 중인 모임', value: '12', icon: Calendar, color: 'bg-[#5856D6]' },
    { label: '오늘의 답변', value: '45', icon: MessageCircle, color: 'bg-[#34C759]' },
    { label: '활성 투표', value: '1', icon: TrendingUp, color: 'bg-[#FF9500]' },
  ];

  const recentUsers = [
    { id: 1, name: '김민수', email: 'minsu@example.com', joinDate: '2024-11-08', role: 'Member' },
    { id: 2, name: '이지은', email: 'jieun@example.com', joinDate: '2024-11-07', role: 'Member' },
    { id: 3, name: '박준영', email: 'junyoung@example.com', joinDate: '2024-11-06', role: 'Host' },
    { id: 4, name: '최수진', email: 'sujin@example.com', joinDate: '2024-11-05', role: 'Member' },
  ];

  const managementOptions = [
    { title: '회원 관리', description: '회원 목록 및 권한 관리', icon: Users, color: 'bg-[#007AFF]' },
    { title: '모임 관리', description: '모임 승인 및 관리', icon: Calendar, color: 'bg-[#5856D6]' },
    { title: '질문 관리', description: '일일 질문 생성 및 관리', icon: MessageCircle, color: 'bg-[#34C759]' },
    { title: '투표 관리', description: '투표 기간 및 항목 관리', icon: TrendingUp, color: 'bg-[#FF9500]' },
    { title: '초대 코드', description: '초대 코드 생성 및 관리', icon: Key, color: 'bg-[#FF3B30]' },
    { title: '시스템 설정', description: '앱 설정 및 환경 관리', icon: Settings, color: 'bg-gray-500' },
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gray-50'} pb-6`}>
      <TopNavBar title="관리자 대시보드" onBack={onBack} theme={theme} />

      <div className="px-4 py-4 max-w-md mx-auto space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className={`${isDark ? 'bg-gray-900' : 'bg-white'} rounded-xl p-4 shadow`}>
                <div className={`w-10 h-10 ${stat.color} rounded-full flex items-center justify-center mb-3`}>
                  <Icon size={20} className="text-white" />
                </div>
                <div className={`text-2xl mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Management Options */}
        <div>
          <h3 className={`mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>관리 메뉴</h3>
          <div className="space-y-3">
            {managementOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <button
                  key={index}
                  className={`w-full ${
                    isDark ? 'bg-gray-900' : 'bg-white'
                  } rounded-xl p-4 shadow flex items-center gap-3 hover:shadow-md transition-shadow`}
                >
                  <div className={`w-12 h-12 ${option.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <Icon size={22} className="text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className={`mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{option.title}</h4>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{option.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Users */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className={isDark ? 'text-white' : 'text-gray-900'}>최근 가입 회원</h3>
            <button className="text-sm text-[#007AFF]">전체보기</button>
          </div>
          <div className={`${isDark ? 'bg-gray-900' : 'bg-white'} rounded-xl overflow-hidden shadow`}>
            {recentUsers.map((user, index) => (
              <div
                key={user.id}
                className={`p-4 flex items-center justify-between ${
                  index !== recentUsers.length - 1
                    ? isDark
                      ? 'border-b border-gray-800'
                      : 'border-b border-gray-100'
                    : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#007AFF] to-[#5856D6] rounded-full flex items-center justify-center text-white">
                    {user.name[0]}
                  </div>
                  <div>
                    <div className={isDark ? 'text-white' : 'text-gray-900'}>{user.name}</div>
                    <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{user.email}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      user.role === 'Host'
                        ? 'bg-[#5856D6] text-white'
                        : isDark
                        ? 'bg-gray-800 text-gray-400'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {user.role}
                  </span>
                  <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                    {user.joinDate}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className={`mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>빠른 작업</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="py-3 rounded-xl bg-[#007AFF] text-white hover:bg-[#0062CC] transition-colors">
              초대 코드 생성
            </button>
            <button className="py-3 rounded-xl bg-[#5856D6] text-white hover:bg-[#4745C2] transition-colors">
              새 질문 등록
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
