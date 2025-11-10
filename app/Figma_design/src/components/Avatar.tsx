interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  badge?: string;
  badgeColor?: string;
  className?: string;
}

export default function Avatar({ name, size = 'md', badge, badgeColor = 'bg-[#007AFF]', className = '' }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const badgeSizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-0.5',
    lg: 'text-xs px-2 py-1',
    xl: 'text-sm px-2.5 py-1',
  };

  return (
    <div className="relative inline-flex flex-col items-center gap-1">
      <div
        className={`${sizeClasses[size]} bg-gradient-to-br from-[#007AFF] to-[#5856D6] rounded-full flex items-center justify-center text-white ${className}`}
      >
        {name[0]}
      </div>
      {badge && (
        <span className={`${badgeSizeClasses[size]} ${badgeColor} text-white rounded`}>
          {badge}
        </span>
      )}
    </div>
  );
}
