import { Plus } from 'lucide-react';

export default function EmptyState({
  icon: Icon,
  title = 'No records found',
  description = 'Get started by creating your first record to track your finances.',
  actionLabel,
  onAction,
}) {
  return (
    <div
      style={{
        width: '100%',
        minHeight: '260px',
        padding: '36px 32px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-secondary)',
        border: '1.5px dashed var(--border)',
        borderRadius: '20px',
        boxShadow: 'var(--card-shadow)',
      }}
    >
      {Icon && (
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'rgba(var(--accent-rgb), 0.12)',
            color: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '14px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
          }}
        >
          <Icon size={24} />
        </div>
      )}
      <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--fg)', margin: '0 0 6px 0' }}>{title}</h4>
      <p style={{ fontSize: '13px', color: 'var(--fg-muted)', maxWidth: '420px', margin: '0 0 20px 0', lineHeight: 1.5 }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          style={{
            height: '42px',
            padding: '0 20px',
            borderRadius: '12px',
            background: 'var(--accent)',
            color: '#FFFFFF',
            fontSize: '13px',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            border: 'none',
            boxShadow: '0 4px 12px rgba(249, 115, 22, 0.35)',
            transition: 'all 0.15s ease',
          }}
        >
          <Plus size={16} />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
