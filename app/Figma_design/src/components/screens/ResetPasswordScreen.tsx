import { Mail } from 'lucide-react';
import TopNavBar from '../TopNavBar';

interface ResetPasswordScreenProps {
  onBack: () => void;
  theme: 'light' | 'dark';
}

export default function ResetPasswordScreen({ onBack, theme }: ResetPasswordScreenProps) {
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <TopNavBar title="비밀번호 재설정" onBack={onBack} theme={theme} />
      
      <div className="px-6 py-12 max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#007AFF]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail size={32} className="text-[#007AFF]" />
          </div>
          <h2 className={`text-xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            비밀번호를 잊으셨나요?
          </h2>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            등록된 이메일 주소로 비밀번호 재설정 링크를 보내드립니다
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              이메일 주소
            </label>
            <input
              type="email"
              placeholder="your@email.com"
              className={`w-full px-4 py-3 rounded-xl ${
                isDark
                  ? 'bg-gray-900 border-gray-800 text-white placeholder-gray-500'
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
              } border focus:outline-none focus:ring-2 focus:ring-[#007AFF]`}
            />
          </div>

          <button className="w-full py-3 rounded-xl bg-[#007AFF] text-white hover:bg-[#0062CC] transition-colors">
            재설정 링크 전송
          </button>

          <button
            onClick={onBack}
            className={`w-full text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
          >
            로그인으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
