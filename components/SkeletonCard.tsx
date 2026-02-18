/**
 * SkeletonCard Component
 * Skeleton loader for card-based content
 * Requirements: 17.2 - Loading states and animations
 */

interface SkeletonCardProps {
  variant?: 'league' | 'team' | 'fixture' | 'season';
}

export default function SkeletonCard({ variant = 'league' }: SkeletonCardProps) {
  if (variant === 'league' || variant === 'team') {
    return (
      <div className="bg-white rounded-xl p-6 shadow-md animate-pulse">
        <div className="flex flex-col items-center gap-4">
          {/* Logo skeleton */}
          <div className="w-20 h-20 bg-gray-200 rounded-lg" />
          
          {/* Name skeleton */}
          <div className="w-32 h-5 bg-gray-200 rounded" />
          
          {/* Subtitle skeleton */}
          <div className="w-20 h-4 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (variant === 'season') {
    return (
      <div className="bg-white rounded-lg p-4 shadow-md animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="w-32 h-6 bg-gray-200 rounded mb-2" />
            <div className="w-48 h-4 bg-gray-200 rounded" />
          </div>
          <div className="w-8 h-8 bg-gray-200 rounded-full" />
        </div>
      </div>
    );
  }

  if (variant === 'fixture') {
    return (
      <div className="bg-white rounded-lg p-4 shadow-md animate-pulse">
        <div className="space-y-3">
          <div className="w-40 h-4 bg-gray-200 rounded" />
          <div className="flex items-center justify-between">
            <div className="w-32 h-5 bg-gray-200 rounded" />
            <div className="w-16 h-5 bg-gray-200 rounded" />
            <div className="w-32 h-5 bg-gray-200 rounded" />
          </div>
          <div className="w-48 h-4 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return null;
}
