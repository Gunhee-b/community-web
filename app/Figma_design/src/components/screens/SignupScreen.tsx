import { useState } from 'react';
import { User, Mail, Lock, Key } from 'lucide-react';
import TopNavBar from '../TopNavBar';

interface SignupScreenProps {
  onBack: () => void;
  onSignup: () => void;
  theme: 'light' | 'dark';
}

export default function SignupScreen({ onBack, onSignup, theme }: SignupScreenProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const isDark = theme === 'dark';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSignup();
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <TopNavBar title="회원가입" onBack={onBack} theme={theme} />
      
      <div className="px-6 py-6 max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>사용자 이름</label>
            <div className="relative">
              <User size={20} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="사용자 이름"
                className={`w-full pl-11 pr-4 py-3 rounded-xl ${
                  isDark
                    ? 'bg-gray-900 border-gray-800 text-white placeholder-gray-500'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                } border focus:outline-none focus:ring-2 focus:ring-[#007AFF]`}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>이메일</label>
            <div className="relative">
              <Mail size={20} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className={`w-full pl-11 pr-4 py-3 rounded-xl ${
                  isDark
                    ? 'bg-gray-900 border-gray-800 text-white placeholder-gray-500'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                } border focus:outline-none focus:ring-2 focus:ring-[#007AFF]`}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>비밀번호</label>
            <div className="relative">
              <Lock size={20} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8자 이상"
                className={`w-full pl-11 pr-4 py-3 rounded-xl ${
                  isDark
                    ? 'bg-gray-900 border-gray-800 text-white placeholder-gray-500'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                } border focus:outline-none focus:ring-2 focus:ring-[#007AFF]`}
                required
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>비밀번호 확인</label>
            <div className="relative">
              <Lock size={20} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="비밀번호 재입력"
                className={`w-full pl-11 pr-4 py-3 rounded-xl ${
                  isDark
                    ? 'bg-gray-900 border-gray-800 text-white placeholder-gray-500'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                } border focus:outline-none focus:ring-2 focus:ring-[#007AFF]`}
                required
              />
            </div>
          </div>

          {/* Invite Code */}
          <div>
            <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>초대 코드</label>
            <div className="relative">
              <Key size={20} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="초대 코드 입력"
                className={`w-full pl-11 pr-4 py-3 rounded-xl ${
                  isDark
                    ? 'bg-gray-900 border-gray-800 text-white placeholder-gray-500'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                } border focus:outline-none focus:ring-2 focus:ring-[#007AFF]`}
                required
              />
            </div>
          </div>

          {/* Terms */}
          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} pt-2`}>
            가입하면 <span className="text-[#007AFF]">이용약관</span>과 <span className="text-[#007AFF]">개인정보처리방침</span>에 동의하는 것으로 간주됩니다.
          </div>

          {/* Signup Button */}
          <button
            type="submit"
            className="w-full bg-[#007AFF] text-white py-3 rounded-xl hover:bg-[#0062CC] transition-colors mt-6"
          >
            가입하기
          </button>
        </form>
      </div>
    </div>
  );
}
