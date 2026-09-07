export default function PageHeader({ breadcrumb, title, subtitle, children }) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap mb-6 animate-fade-in">
      <div>
        {breadcrumb && (
          <p className="text-[10px] font-bold uppercase tracking-[.15em] mb-1.5" style={{ color: '#8FA1B2' }}>
            Panel &rsaquo; {breadcrumb}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 4, height: 28, borderRadius: 99, background: 'linear-gradient(180deg,#F97316,#C2410C)', flexShrink: 0 }} />
          <h1
            className="font-black leading-none tracking-tight"
            style={{ fontSize: 'clamp(1.375rem, 3.5vw, 2rem)', color: '#1A2738' }}
          >
            {title}
          </h1>
        </div>
        {subtitle && (
          <p className="text-sm mt-2 font-medium page-header-sub" style={{ color: '#627080', paddingLeft: 14 }}>{subtitle}</p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
          {children}
        </div>
      )}
    </div>
  )
}
