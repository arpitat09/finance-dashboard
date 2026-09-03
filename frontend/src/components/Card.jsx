/**
 * Reusable Card component supporting consistent borders, shadows, padding,
 * and variants (default, surface, interactive).
 */
export default function Card({
  children,
  variant = 'default',
  padding = 'default',
  className = '',
  onClick,
  style,
  ...props
}) {
  const variantClass = {
    default: 'card',
    surface: 'card-surface',
    interactive: 'card card-interactive cursor-pointer',
  }[variant] || 'card';

  const paddingClass = {
    none: '!p-0',
    sm: '!p-4',
    default: '',
    lg: '!p-6 sm:!p-7',
  }[padding] || '';

  return (
    <div
      className={`${variantClass} ${paddingClass} ${className}`}
      onClick={onClick}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}
