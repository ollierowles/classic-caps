/**
 * LoadingSpinner Component
 * Reusable loading spinner with football theme
 * Requirements: 17.2 - Loading states and animations
 */

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export default function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 border-2',
    md: 'h-12 w-12 border-4',
    lg: 'h-16 w-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div
        className={`animate-spin rounded-full border-pitch-light border-t-pitch-dark ${sizeClasses[size]}`}
        role="status"
        aria-label="Loading"
      />
      {text && <p className="text-gray-600 text-sm sm:text-base">{text}</p>}
    </div>
  );
}
