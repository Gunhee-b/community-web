interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  theme?: 'light' | 'dark';
  text?: string;
}

export default function LoadingSpinner({ size = 'md', theme = 'light', text }: LoadingSpinnerProps) {
  const isDark = theme === 'dark';
  
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeClasses[size]} border-[#007AFF] border-t-transparent rounded-full animate-spin`}
      ></div>
      {text && (
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{text}</p>
      )}
    </div>
  );
}
