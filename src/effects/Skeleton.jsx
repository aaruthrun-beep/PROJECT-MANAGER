export function SkeletonCard() {
  return (
    <div className="glass rounded-2xl p-5 border border-zinc-700/60 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2 flex-1">
          <div className="h-5 bg-white/10 rounded-lg w-3/4" />
          <div className="h-3 bg-white/10 rounded-lg w-1/2" />
        </div>
        <div className="w-8 h-8 bg-white/10 rounded-lg" />
      </div>
      <div className="flex gap-3">
        <div className="h-6 bg-white/10 rounded-lg w-16" />
        <div className="h-6 bg-white/10 rounded-lg w-24" />
      </div>
    </div>
  )
}

export function SkeletonStat() {
  return (
    <div className="glass rounded-2xl p-4 border border-zinc-700/60 animate-pulse">
      <div className="w-10 h-10 bg-white/10 rounded-xl mb-3" />
      <div className="h-8 bg-white/10 rounded-lg w-16 mb-1" />
      <div className="h-3 bg-white/10 rounded-lg w-20" />
    </div>
  )
}

export function SkeletonChart() {
  return (
    <div className="glass rounded-2xl p-6 border border-zinc-700/60 animate-pulse">
      <div className="h-5 bg-white/10 rounded-lg w-40 mb-4" />
      <div className="h-[200px] bg-white/[0.03] rounded-xl" />
    </div>
  )
}

export function SkeletonPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 bg-white/10 rounded-lg w-48" />
        <div className="h-4 bg-white/10 rounded-lg w-72" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map(i => <SkeletonStat key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2"><SkeletonChart /></div>
        <div><SkeletonChart /></div>
      </div>
    </div>
  )
}
