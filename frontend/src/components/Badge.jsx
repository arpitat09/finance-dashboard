/**
 * Standardized status Badge component for financial indicators:
 * Variants: success, warning, danger, info, neutral, accent, purple
 */
export default function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  icon: Icon,
}) {
  const variantStyles = {
    success: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20',
    warning: 'bg-amber-500/15 text-amber-500 border-amber-500/20',
    danger: 'bg-red-500/15 text-red-500 border-red-500/20',
    info: 'bg-sky-500/15 text-sky-500 border-sky-500/20',
    accent: 'bg-orange-500/15 text-orange-500 border-orange-500/20',
    purple: 'bg-purple-500/15 text-purple-500 border-purple-500/20',
    neutral: 'bg-stone-500/15 text-[var(--fg-muted)] border-stone-500/20',
  }[variant] || 'bg-stone-500/15 text-[var(--fg-muted)] border-stone-500/20';

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-xs sm:text-sm font-bold',
  }[size] || 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold font-mono-num rounded-full border ${variantStyles} ${sizeStyles} ${className}`}
    >
      {Icon && <Icon size={size === 'sm' ? 11 : 13} className="flex-shrink-0" />}
      <span>{children}</span>
    </span>
  );
}
