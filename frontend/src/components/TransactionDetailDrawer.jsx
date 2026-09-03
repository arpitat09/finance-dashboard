import { X, Pencil, Trash2, Calendar, CreditCard, Tag, DollarSign, Clock, FileText, CheckCircle2 } from 'lucide-react';
import { usePreferences } from '../context/PreferencesContext';
import { fmtDate, fmtDateTime, CATEGORY_COLORS } from '../utils/helpers';

export default function TransactionDetailDrawer({
  isOpen,
  onClose,
  transaction,
  onEdit,
  onDelete,
}) {
  const { fmt } = usePreferences();

  if (!isOpen || !transaction) return null;

  const isIncome = transaction.type === 'INCOME';
  const color = CATEGORY_COLORS[transaction.category?.name] || '#F97316';

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex justify-end" onClick={onClose}>
      <div
        className="w-full max-w-md h-full bg-[var(--bg-secondary)] border-l p-6 lg:p-7 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in"
        style={{ borderColor: 'var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                isIncome ? 'bg-emerald-500/15 text-emerald-500' : 'bg-red-500/15 text-red-500'
              }`}>
                {transaction.type}
              </span>
              {transaction.isRecurring && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/15 text-purple-400">
                  Recurring
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-surface)] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Amount Hero */}
          <div className="py-6 text-center border-b" style={{ borderColor: 'var(--border)' }}>
            <div className={`text-3xl lg:text-4xl font-extrabold font-heading font-mono-num ${
              isIncome ? 'text-emerald-500' : 'text-red-500'
            }`}>
              {isIncome ? '+' : '-'}{fmt(transaction.amount)}
            </div>
            <div className="text-base font-semibold text-[var(--fg)] mt-2">
              {transaction.description}
            </div>
            <div className="text-xs text-[var(--fg-muted)] mt-1">
              {fmtDate(transaction.date)}
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="py-5 flex flex-col gap-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[var(--fg-muted)] flex items-center gap-2">
                <Tag size={15} style={{ color }} />
                Category
              </span>
              <span className="font-semibold text-[var(--fg)]">{transaction.category?.name || 'Unassigned'}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[var(--fg-muted)] flex items-center gap-2">
                <CreditCard size={15} />
                Account
              </span>
              <span className="font-semibold text-[var(--fg)]">{transaction.account?.name || 'General Cash/UPI'}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[var(--fg-muted)] flex items-center gap-2">
                <DollarSign size={15} />
                Payment Method
              </span>
              <span className="font-semibold text-[var(--fg)]">{transaction.paymentMethod || 'UPI'}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[var(--fg-muted)] flex items-center gap-2">
                <Clock size={15} />
                Logged At
              </span>
              <span className="font-mono-num text-[var(--fg-secondary)]">{fmtDateTime(transaction.createdAt)}</span>
            </div>

            {transaction.notes && (
              <div className="pt-2">
                <div className="text-[var(--fg-muted)] flex items-center gap-2 mb-1.5">
                  <FileText size={15} />
                  Notes & Details
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-surface)] text-[var(--fg)] border text-xs leading-relaxed" style={{ borderColor: 'var(--border)' }}>
                  {transaction.notes}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-5 border-t flex items-center gap-3" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={() => {
              onClose();
              onEdit(transaction);
            }}
            className="btn-secondary flex-1 py-2.5"
          >
            <Pencil size={15} />
            Edit
          </button>
          <button
            onClick={() => {
              onClose();
              onDelete(transaction);
            }}
            className="btn-danger flex-1 py-2.5"
          >
            <Trash2 size={15} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
