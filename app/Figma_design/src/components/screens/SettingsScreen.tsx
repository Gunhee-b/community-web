import { Moon, Sun, Monitor, Globe, Type, Bell, Volume2, ChevronRight } from 'lucide-react';
import TopNavBar from '../TopNavBar';

interface SettingsScreenProps {
  onBack: () => void;
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
}

export default function SettingsScreen({ onBack, theme, onThemeChange }: SettingsScreenProps) {
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gray-50'} pb-6`}>
      <TopNavBar title="설정" onBack={onBack} theme={theme} />

      <div className="px-4 py-4 max-w-md mx-auto space-y-6">
        {/* Appearance */}
        <div>
          <h3 className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>화면 설정</h3>
          <div className={`${isDark ? 'bg-gray-900' : 'bg-white'} rounded-xl overflow-hidden shadow`}>
            {/* Theme */}
            <div className={`p-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Moon size={20} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>테마</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onThemeChange('light')}
                  className={`flex-1 py-2.5 rounded-lg border ${
                    theme === 'light'
                      ? 'border-[#007AFF] bg-[#007AFF]/10 text-[#007AFF]'
                      : isDark
                      ? 'border-gray-700 text-gray-400'
                      : 'border-gray-200 text-gray-600'
                  } flex items-center justify-center gap-2`}
                >
                  <Sun size={18} />
                  라이트
                </button>
                <button
                  onClick={() => onThemeChange('dark')}
                  className={`flex-1 py-2.5 rounded-lg border ${
                    theme === 'dark'
                      ? 'border-[#007AFF] bg-[#007AFF]/10 text-[#007AFF]'
                      : isDark
                      ? 'border-gray-700 text-gray-400'
                      : 'border-gray-200 text-gray-600'
                  } flex items-center justify-center gap-2`}
                >
                  <Moon size={18} />
                  다크
                </button>
                <button
                  className={`flex-1 py-2.5 rounded-lg border ${
                    isDark ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-600'
                  } flex items-center justify-center gap-2`}
                >
                  <Monitor size={18} />
                  시스템
                </button>
              </div>
            </div>

            {/* Language */}
            <div className={`p-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
              <button className="w-full flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe size={20} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>언어</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>한국어</span>
                  <ChevronRight size={20} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
                </div>
              </button>
            </div>

            {/* Font Size */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Type size={20} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>글자 크기</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>A</span>
                <input
                  type="range"
                  min="12"
                  max="18"
                  defaultValue="14"
                  className="flex-1"
                />
                <span className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>A</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div>
          <h3 className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>알림 설정</h3>
          <div className={`${isDark ? 'bg-gray-900' : 'bg-white'} rounded-xl overflow-hidden shadow`}>
            <div className={`p-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell size={20} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>푸시 알림</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#007AFF]"></div>
                </label>
              </div>
            </div>

            <div className={`p-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
              <div className="flex items-center justify-between">
                <span className={`ml-9 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>모임 알림</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#007AFF]"></div>
                </label>
              </div>
            </div>

            <div className={`p-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
              <div className="flex items-center justify-between">
                <span className={`ml-9 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>질문 알림</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#007AFF]"></div>
                </label>
              </div>
            </div>

            <div className={`p-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
              <div className="flex items-center justify-between">
                <span className={`ml-9 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>채팅 알림</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#007AFF]"></div>
                </label>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Volume2 size={20} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>알림 소리</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#007AFF]"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* About */}
        <div>
          <h3 className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>정보</h3>
          <div className={`${isDark ? 'bg-gray-900' : 'bg-white'} rounded-xl overflow-hidden shadow`}>
            <button className={`w-full p-4 flex items-center justify-between border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
              <span className={isDark ? 'text-white' : 'text-gray-900'}>이용약관</span>
              <ChevronRight size={20} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
            </button>
            <button className={`w-full p-4 flex items-center justify-between border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
              <span className={isDark ? 'text-white' : 'text-gray-900'}>개인정보처리방침</span>
              <ChevronRight size={20} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
            </button>
            <button className="w-full p-4 flex items-center justify-between">
              <span className={isDark ? 'text-white' : 'text-gray-900'}>버전 정보</span>
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>1.0.0</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
