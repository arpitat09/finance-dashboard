/**
 * Standardized PageHeader component for consistent page titles, subtitles,
 * and aligned right-hand action controls across all views.
 */
export default function PageHeader({
  title,
  subtitle,
  actions,
  className = '',
}) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 ${className}`}>
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-[var(--fg)] tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-[var(--fg-muted)] mt-1">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2.5 flex-wrap">
          {actions}
        </div>
      )}
    </div>
  );
}
