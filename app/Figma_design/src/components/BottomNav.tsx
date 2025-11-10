import { Home, Users, HelpCircle, User } from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  theme: 'light' | 'dark';
}

export default function BottomNav({ currentTab, onTabChange, theme }: BottomNavProps) {
  const tabs = [
    { id: 'home', label: '홈', icon: Home },
    { id: 'meetings', label: '모임', icon: Users },
    { id: 'questions', label: '질문', icon: HelpCircle },
    { id: 'profile', label: '프로필', icon: User },
  ];

  const isDark = theme === 'dark';

  return (
    <div className={`fixed bottom-0 left-0 right-0 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-t safe-bottom`}>
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center justify-center flex-1 h-full"
            >
              <Icon
                size={24}
                className={isActive ? 'text-[#007AFF]' : isDark ? 'text-gray-400' : 'text-gray-500'}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={`text-[10px] mt-1 ${
                  isActive ? 'text-[#007AFF]' : isDark ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
