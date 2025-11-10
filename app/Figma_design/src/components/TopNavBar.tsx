import { ArrowLeft, Bell } from 'lucide-react';

interface TopNavBarProps {
  title: string;
  onBack?: () => void;
  onNotifications?: () => void;
  notificationCount?: number;
  theme: 'light' | 'dark';
  rightAction?: React.ReactNode;
}

export default function TopNavBar({
  title,
  onBack,
  onNotifications,
  notificationCount = 0,
  theme,
  rightAction,
}: TopNavBarProps) {
  const isDark = theme === 'dark';

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-b safe-top`}>
      <div className="flex items-center justify-between h-14 px-4 max-w-md mx-auto">
        <div className="w-10">
          {onBack && (
            <button onClick={onBack} className="p-2 -ml-2">
              <ArrowLeft size={24} className={isDark ? 'text-white' : 'text-gray-900'} />
            </button>
          )}
        </div>
        <h1 className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h1>
        <div className="w-10 flex justify-end">
          {rightAction}
          {onNotifications && (
            <button onClick={onNotifications} className="p-2 -mr-2 relative">
              <Bell size={24} className={isDark ? 'text-white' : 'text-gray-900'} />
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 bg-[#FF3B30] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
