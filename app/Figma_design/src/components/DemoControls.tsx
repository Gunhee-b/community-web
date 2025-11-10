import { Sun, Moon, Shield, User } from 'lucide-react';

interface DemoControlsProps {
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  isAdmin?: boolean;
  onAdminToggle?: () => void;
  showAdminToggle?: boolean;
}

export default function DemoControls({
  theme,
  onThemeToggle,
  isAdmin = false,
  onAdminToggle,
  showAdminToggle = false,
}: DemoControlsProps) {
  const isDark = theme === 'dark';

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2">
      {/* Theme Toggle */}
      <button
        onClick={onThemeToggle}
        className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center ${
          isDark ? 'bg-gray-800 text-yellow-400' : 'bg-white text-gray-700'
        } hover:scale-110 transition-transform`}
        title="Toggle theme"
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* Admin Toggle (only shown when applicable) */}
      {showAdminToggle && onAdminToggle && (
        <button
          onClick={onAdminToggle}
          className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center ${
            isAdmin
              ? 'bg-[#FF3B30] text-white'
              : isDark
              ? 'bg-gray-800 text-gray-400'
              : 'bg-white text-gray-700'
          } hover:scale-110 transition-transform`}
          title={isAdmin ? 'Switch to Member' : 'Switch to Admin'}
        >
          {isAdmin ? <Shield size={20} /> : <User size={20} />}
        </button>
      )}

      {/* Demo Label */}
      <div
        className={`px-3 py-1 rounded-full text-xs ${
          isDark ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-600'
        } shadow-lg text-center`}
      >
        Demo
      </div>
    </div>
  );
}
