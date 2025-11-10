import { Settings, LogOut, Shield, User, Mail } from 'lucide-react';
import TopNavBar from '../TopNavBar';

interface ProfileScreenProps {
  onSettings: () => void;
  onLogout: () => void;
  theme: 'light' | 'dark';
  isAdmin: boolean;
  onAdminDashboard: () => void;
}

export default function ProfileScreen({
  onSettings,
  onLogout,
  theme,
  isAdmin,
  onAdminDashboard,
}: ProfileScreenProps) {
  const isDark = theme === 'dark';

  const userProfile = {
    username: '김민수',
    email: 'minsu.kim@example.com',
    role: isAdmin ? 'Admin' : 'Member',
    joinDate: '2024년 1월',
    meetingsJoined: 12,
    questionsAnswered: 45,
    votesParticipated: 3,
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gray-50'} pb-20`}>
      <TopNavBar
        title="프로필"
        theme={theme}
        rightAction={
          <button onClick={onSettings} className="p-2 -mr-2">
            <Settings size={24} className={isDark ? 'text-white' : 'text-gray-900'} />
          </button>
        }
      />

      <div className="px-4 py-6 max-w-md mx-auto space-y-6">
        {/* Profile Header */}
        <div className={`${isDark ? 'bg-gray-900' : 'bg-white'} rounded-2xl p-6 shadow text-center`}>
          <div className="w-24 h-24 bg-gradient-to-br from-[#007AFF] to-[#5856D6] rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl">
            {userProfile.username[0]}
          </div>
          <h2 className={`mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{userProfile.username}</h2>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-3`}>{userProfile.email}</p>
          <div className="flex items-center justify-center gap-2">
            <span
              className={`text-xs px-3 py-1 rounded-full ${
                isAdmin
                  ? 'bg-[#FF3B30] text-white'
                  : 'bg-[#007AFF] text-white'
              }`}
            >
              {userProfile.role}
            </span>
            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {userProfile.joinDate} 가입
            </span>
          </div>
          <button className="mt-4 w-full py-2.5 rounded-lg border border-[#007AFF] text-[#007AFF] hover:bg-[#007AFF] hover:text-white transition-colors">
            프로필 수정
          </button>
        </div>

        {/* Stats */}
        <div className={`${isDark ? 'bg-gray-900' : 'bg-white'} rounded-xl p-6 shadow`}>
          <h3 className={`mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>활동 통계</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl text-[#007AFF] mb-1">{userProfile.meetingsJoined}</div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>참여한 모임</div>
            </div>
            <div className="text-center">
              <div className="text-2xl text-[#5856D6] mb-1">{userProfile.questionsAnswered}</div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>답변한 질문</div>
            </div>
            <div className="text-center">
              <div className="text-2xl text-[#34C759] mb-1">{userProfile.votesParticipated}</div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>투표 참여</div>
            </div>
          </div>
        </div>

        {/* Admin Section */}
        {isAdmin && (
          <div className={`${isDark ? 'bg-gray-900' : 'bg-white'} rounded-xl overflow-hidden shadow`}>
            <button
              onClick={onAdminDashboard}
              className={`w-full p-4 flex items-center gap-3 hover:bg-opacity-50 transition-colors ${
                isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
              }`}
            >
              <div className="w-10 h-10 bg-[#FF3B30] rounded-full flex items-center justify-center">
                <Shield size={20} className="text-white" />
              </div>
              <div className="flex-1 text-left">
                <h4 className={isDark ? 'text-white' : 'text-gray-900'}>관리자 대시보드</h4>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  커뮤니티 관리 및 설정
                </p>
              </div>
            </button>
          </div>
        )}

        {/* Menu Items */}
        <div className={`${isDark ? 'bg-gray-900' : 'bg-white'} rounded-xl overflow-hidden shadow`}>
          <button
            className={`w-full p-4 flex items-center gap-3 border-b ${
              isDark ? 'border-gray-800' : 'border-gray-100'
            } hover:bg-opacity-50 transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}
          >
            <User size={20} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
            <span className={isDark ? 'text-white' : 'text-gray-900'}>내가 참여한 모임</span>
          </button>
          <button
            className={`w-full p-4 flex items-center gap-3 border-b ${
              isDark ? 'border-gray-800' : 'border-gray-100'
            } hover:bg-opacity-50 transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}
          >
            <Mail size={20} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
            <span className={isDark ? 'text-white' : 'text-gray-900'}>내 답변 모아보기</span>
          </button>
          <button
            onClick={onSettings}
            className={`w-full p-4 flex items-center gap-3 hover:bg-opacity-50 transition-colors ${
              isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
            }`}
          >
            <Settings size={20} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
            <span className={isDark ? 'text-white' : 'text-gray-900'}>설정</span>
          </button>
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="w-full py-3 rounded-xl bg-[#FF3B30] text-white hover:bg-[#D62D20] transition-colors flex items-center justify-center gap-2"
        >
          <LogOut size={20} />
          로그아웃
        </button>
      </div>
    </div>
  );
}
