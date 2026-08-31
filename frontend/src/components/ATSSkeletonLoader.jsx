export default function ATSSkeletonLoader({ isDark }) {
  const shimmer = isDark ? 'bg-slate-700/50' : 'bg-slate-200';
  const shimmerLight = isDark ? 'bg-slate-600/30' : 'bg-slate-100';
  const card = isDark
    ? 'bg-slate-800/80 border-slate-700/50'
    : 'bg-white border-indigo-100/50';

  return (
    <div className="max-w-4xl mx-auto animate-pulse">
      {/* Back link placeholder */}
      <div className={`h-4 w-24 rounded-lg mb-6 ${shimmerLight}`}></div>

      {/* Score header, mirrors the Shield icon + "ATS Score" + big % block */}
      <div className={`rounded-2xl shadow-xl border p-6 sm:p-8 mb-8 ${card}`}>
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-2xl ${shimmer}`}></div>
          <div>
            <div className={`h-6 w-28 rounded-lg ${shimmer}`}></div>
            <div className={`h-9 w-20 rounded-lg mt-2 ${shimmer}`}></div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Formatting Checklist, mirrors ChecklistItem rows */}
        <div className={`rounded-2xl shadow-xl border p-6 ${card}`}>
          <div className={`h-5 w-44 rounded-lg mb-4 ${shimmer}`}></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
                <div className={`w-8 h-8 rounded-full flex-shrink-0 ${shimmer}`}></div>
                <div className="flex-1">
                  <div className={`h-4 rounded-lg ${shimmer}`} style={{ width: `${60 - i * 6}%` }}></div>
                  <div className={`h-3 w-1/3 rounded-lg mt-2 ${shimmerLight}`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI-Suggested Rewrites, mirrors BulletRewriteCard blocks */}
        <div className={`rounded-2xl shadow-xl border p-6 ${card}`}>
          <div className={`h-5 w-48 rounded-lg mb-4 ${shimmer}`}></div>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className={`border rounded-xl p-4 ${isDark ? 'border-slate-700' : 'border-indigo-100'}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex-shrink-0 ${shimmer}`}></div>
                  <div className="flex-1 space-y-2">
                    <div className={`h-3 w-16 rounded-lg ${shimmerLight}`}></div>
                    <div className={`h-4 w-full rounded-lg ${shimmerLight}`}></div>
                    <div className={`h-3 w-20 rounded-lg mt-2 ${shimmerLight}`}></div>
                    <div className={`h-4 w-4/5 rounded-lg ${shimmer}`}></div>
                  </div>
                  <div className={`w-8 h-8 rounded-lg flex-shrink-0 ${shimmerLight}`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}