import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
  onSignup: () => void;
  onResetPassword: () => void;
  theme: 'light' | 'dark';
}

export default function LoginScreen({ onLogin, onSignup, onResetPassword, theme }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const isDark = theme === 'dark';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gray-50'} flex flex-col`}>
      <div className="flex-1 flex flex-col justify-center px-6 max-w-md mx-auto w-full">
        {/* Logo and Title */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-[#007AFF] to-[#5856D6] rounded-3xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-3xl">R</span>
          </div>
          <h1 className={`text-2xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Rezom Community</h1>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>한국 커뮤니티에 오신 것을 환영합니다</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email Input */}
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
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>비밀번호</label>
            <div className="relative">
              <Lock size={20} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-11 pr-11 py-3 rounded-xl ${
                  isDark
                    ? 'bg-gray-900 border-gray-800 text-white placeholder-gray-500'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                } border focus:outline-none focus:ring-2 focus:ring-[#007AFF]`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff size={20} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
                ) : (
                  <Eye size={20} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
                )}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <button
              type="button"
              onClick={onResetPassword}
              className="text-sm text-[#007AFF]"
            >
              비밀번호를 잊으셨나요?
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-[#007AFF] text-white py-3 rounded-xl hover:bg-[#0062CC] transition-colors"
          >
            로그인
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className={`flex-1 h-px ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
          <span className={`px-4 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>또는</span>
          <div className={`flex-1 h-px ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
        </div>

        {/* Social Login Buttons */}
        <div className="space-y-3">
          <button
            className={`w-full py-3 rounded-xl border ${
              isDark ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'
            } flex items-center justify-center gap-3 hover:opacity-80 transition-opacity`}
          >
            <div className="w-5 h-5 bg-red-500 rounded"></div>
            Google로 계속하기
          </button>
          <button
            className={`w-full py-3 rounded-xl border ${
              isDark ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'
            } flex items-center justify-center gap-3 hover:opacity-80 transition-opacity`}
          >
            <div className="w-5 h-5 bg-yellow-400 rounded"></div>
            Kakao로 계속하기
          </button>
          <button
            className={`w-full py-3 rounded-xl border ${
              isDark ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'
            } flex items-center justify-center gap-3 hover:opacity-80 transition-opacity`}
          >
            <div className="w-5 h-5 bg-green-500 rounded"></div>
            Naver로 계속하기
          </button>
        </div>

        {/* Signup Link */}
        <div className="text-center mt-6">
          <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>계정이 없으신가요? </span>
          <button onClick={onSignup} className="text-[#007AFF]">
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
}
