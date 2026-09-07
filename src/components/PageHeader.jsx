export default function PageHeader({ breadcrumb, title, subtitle, children }) {
  return (
    <div
      className="flex items-start justify-between gap-4 flex-wrap mb-5 animate-fade-in rounded-[18px] px-5 py-4"
      style={{
        background: '#fff',
        border: '1px solid #FDE8D0',
        boxShadow: '0 2px 12px rgba(194,65,12,.07)',
      }}
    >
      <div>
        {breadcrumb && (
          <p className="text-[10px] font-bold uppercase tracking-[.14em] mb-2" style={{ color: '#8FA1B2' }}>
            Panel &rsaquo; {breadcrumb}
          </p>
        )}
        <h1
          className="font-black leading-none tracking-tight"
          style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', color: '#C2410C' }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm mt-1.5 font-medium page-header-sub" style={{ color: '#627080' }}>{subtitle}</p>
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
