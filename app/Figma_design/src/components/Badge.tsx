interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'gray';
  size?: 'sm' | 'md';
  className?: string;
}

export default function Badge({ children, variant = 'primary', size = 'md', className = '' }: BadgeProps) {
  const variantClasses = {
    primary: 'bg-[#007AFF] text-white',
    secondary: 'bg-[#5856D6] text-white',
    success: 'bg-[#34C759] text-white',
    warning: 'bg-[#FF9500] text-white',
    error: 'bg-[#FF3B30] text-white',
    gray: 'bg-gray-500 text-white',
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
  };

  return (
    <span className={`${variantClasses[variant]} ${sizeClasses[size]} rounded ${className}`}>
      {children}
    </span>
  );
}
