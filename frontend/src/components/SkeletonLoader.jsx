export default function SkeletonLoader({ isDark }) {
  const shimmer = isDark ? 'bg-slate-700/50' : 'bg-slate-200';
  const shimmerLight = isDark ? 'bg-slate-600/30' : 'bg-slate-100';

  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className={`rounded-2xl p-6 sm:p-8 ${isDark ? 'bg-slate-800/80' : 'bg-white'} border ${isDark ? 'border-slate-700/50' : 'border-slate-200'}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${shimmer}`}></div>
            <div>
              <div className={`h-7 w-48 rounded-lg ${shimmer}`}></div>
              <div className={`h-4 w-32 rounded-lg mt-1 ${shimmerLight}`}></div>
            </div>
          </div>
          <div className={`h-8 w-24 rounded-full ${shimmer}`}></div>
        </div>
      </div>

      {/* Job Navigation Skeleton */}
      <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-slate-50 border border-slate-200'}`}>
        <div className="flex items-center justify-between gap-4">
          <div className={`w-10 h-10 rounded-lg ${shimmer}`}></div>
          <div className="flex gap-2 flex-1 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`h-10 w-24 rounded-lg ${shimmer}`}></div>
            ))}
          </div>
          <div className={`w-10 h-10 rounded-lg ${shimmer}`}></div>
        </div>
      </div>

      {/* Score Section Skeleton */}
      <div className={`rounded-2xl p-6 sm:p-8 ${isDark ? 'bg-slate-800/80' : 'bg-white'} border ${isDark ? 'border-slate-700/50' : 'border-slate-200'}`}>
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="flex justify-center">
            <div className={`w-48 h-48 rounded-full ${shimmer}`}></div>
          </div>
          <div>
            <div className={`h-8 w-40 rounded-lg ${shimmer}`}></div>
            <div className={`h-4 w-64 rounded-lg mt-2 ${shimmerLight}`}></div>
            <div className="flex gap-4 mt-4">
              <div className={`h-6 w-24 rounded-full ${shimmer}`}></div>
              <div className={`h-6 w-24 rounded-full ${shimmer}`}></div>
              <div className={`h-6 w-24 rounded-full ${shimmer}`}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Section Skeleton */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className={`rounded-2xl p-6 ${isDark ? 'bg-slate-800/80' : 'bg-white'} border ${isDark ? 'border-slate-700/50' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`h-6 w-32 rounded-lg ${shimmer}`}></div>
            <div className={`h-5 w-8 rounded-lg ${shimmerLight}`}></div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`h-8 w-20 rounded-full ${shimmer}`}></div>
            ))}
          </div>
        </div>
        <div className={`rounded-2xl p-6 ${isDark ? 'bg-slate-800/80' : 'bg-white'} border ${isDark ? 'border-slate-700/50' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`h-6 w-32 rounded-lg ${shimmer}`}></div>
            <div className={`h-5 w-8 rounded-lg ${shimmerLight}`}></div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`h-8 w-20 rounded-full ${shimmer}`}></div>
            ))}
          </div>
        </div>
      </div>

      {/* Feedback Skeleton */}
      <div className={`rounded-2xl p-6 ${isDark ? 'bg-slate-800/80' : 'bg-white'} border ${isDark ? 'border-slate-700/50' : 'border-slate-200'}`}>
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl ${shimmer}`}></div>
          <div className="flex-1">
            <div className={`h-6 w-32 rounded-lg ${shimmer}`}></div>
            <div className={`h-4 w-full rounded-lg mt-2 ${shimmerLight}`}></div>
            <div className={`h-4 w-3/4 rounded-lg mt-1 ${shimmerLight}`}></div>
            <div className={`h-4 w-1/2 rounded-lg mt-1 ${shimmerLight}`}></div>
          </div>
        </div>
      </div>
    </div>
  );
}