import { Loader2 } from 'lucide-react';

/**
 * Standardized Button primitive for FINORA:
 * Variants: primary, secondary, ghost, danger
 * Sizes: sm, md, lg
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  const variantClass = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
  }[variant] || 'btn-primary';

  const sizeClass = {
    sm: 'h-[34px] px-3 text-xs',
    md: 'h-[40px] px-4 text-xs sm:text-sm',
    lg: 'h-[44px] px-5 text-sm sm:text-base font-bold',
  }[size] || 'h-[40px] px-4 text-xs sm:text-sm';

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`btn ${variantClass} ${sizeClass} ${disabled || loading ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : Icon ? (
        <Icon size={size === 'sm' ? 14 : 16} className="flex-shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
}
