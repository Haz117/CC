export function SkeletonLine({ w = 'w-full', h = 'h-4' }) {
  return (
    <div className={`${w} ${h} rounded-lg`}
      style={{ background: 'linear-gradient(90deg,#EBF4FC 0%,#D4EAFB 50%,#EBF4FC 100%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s ease-in-out infinite' }} />
  )
}

export function SkeletonCard() {
  return (
    <div className="card p-5 space-y-3">
      <SkeletonLine w="w-1/3" h="h-3" />
      <SkeletonLine w="w-full" h="h-8" />
      <SkeletonLine w="w-2/3" h="h-3" />
    </div>
  )
}

export function SkeletonTableRows({ rows = 5 }) {
  const widths = ['32%', '18%', '14%', '14%', '12%', '10%']
  return (
    <div className="card overflow-hidden">
      <div className="flex gap-3 px-4 py-3" style={{ borderBottom: '1px solid #F2F3F5' }}>
        {widths.map((w, i) => (
          <div key={i} style={{ width: w }}><SkeletonLine h="h-3" /></div>
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-4" style={{ borderBottom: '1px solid #E2EAF2' }}>
          {widths.map((w, j) => (
            <div key={j} style={{ width: w }}>
              <SkeletonLine h={j === 0 ? 'h-4' : 'h-3'} />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export function SkeletonCardGrid({ count = 6, cols = 3 }) {
  const gridCls = cols === 5
    ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3'
    : cols === 4
    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
    : 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'
  return (
    <div className={gridCls}>
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  )
}

export function SkeletonReport() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
      </div>
      <div className="card p-5 space-y-4">
        <SkeletonLine w="w-1/3" h="h-4" />
        <div style={{ height: 240, borderRadius: 12, background: 'linear-gradient(90deg,#EBF4FC 0%,#D4EAFB 50%,#EBF4FC 100%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s ease-in-out infinite' }} />
      </div>
      <SkeletonTableRows rows={4} />
    </div>
  )
}

export default function Skeleton({ lines = 3 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => <SkeletonLine key={i} />)}
    </div>
  )
}
