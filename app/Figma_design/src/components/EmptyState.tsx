interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  theme: 'light' | 'dark';
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  theme,
}: EmptyStateProps) {
  const isDark = theme === 'dark';

  return (
    <div className="text-center py-12 px-6">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className={`text-xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
      <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-3 rounded-xl bg-[#007AFF] text-white hover:bg-[#0062CC] transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
