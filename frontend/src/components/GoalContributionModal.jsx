import { useState, useEffect } from 'react';
import { X, PiggyBank, CreditCard } from 'lucide-react';
import { goalApi, accountApi } from '../api';
import { useToast } from '../context/ToastContext';
import { usePreferences } from '../context/PreferencesContext';

export default function GoalContributionModal({ isOpen, onClose, goal, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { addToast } = useToast();
  const { fmt, currency } = usePreferences();

  useEffect(() => {
    if (!isOpen) {
      setAmount('');
      setError('');
      return;
    }

    async function loadAccounts() {
      try {
        const res = await accountApi.list();
        setAccounts(res.data || []);
        if (res.data?.[0]) setAccountId(res.data[0].id);
      } catch (err) {
        console.error('Failed to load accounts:', err);
      }
    }
    loadAccounts();
  }, [isOpen]);

  if (!isOpen || !goal) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a positive contribution amount');
      return;
    }

    setSubmitting(true);
    try {
      await goalApi.contribute(goal.id, {
        amount: parseFloat(amount),
        accountId: accountId || null,
      });

      addToast(`Added ${fmt(parseFloat(amount))} to ${goal.name}! 🎯`, 'success');
      onSuccess?.();
      onClose();
    } catch (err) {
      addToast(err.message || 'Failed to add contribution', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border p-6 shadow-2xl animate-in relative"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-surface)] transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-bold">
            <PiggyBank size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold font-heading text-[var(--fg)]">Add Contribution</h3>
            <p className="text-xs text-[var(--fg-muted)]">{goal.name}</p>
          </div>
        </div>

        {/* Goal Quick Summary */}
        <div className="p-3.5 rounded-xl border mb-5 flex items-center justify-between text-xs" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
          <div>
            <div className="text-[var(--fg-muted)]">Target: {fmt(goal.targetAmount)}</div>
            <div className="font-semibold text-[var(--fg)] mt-0.5">Saved: {fmt(goal.currentAmount)}</div>
          </div>
          <div className="text-right">
            <div className="font-bold text-emerald-500 font-mono-num">{goal.percentage}%</div>
            <div className="text-[var(--fg-muted)]">Remaining: {fmt(goal.remaining)}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--fg-secondary)] mb-1">
              Contribution Amount ({currency === 'INR' ? '₹' : currency}) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              autoFocus
              placeholder="e.g. 5000"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError('');
              }}
              className="input-field font-mono-num font-bold text-base"
            />
            {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--fg-secondary)] mb-1">
              Deduct from Account (Optional)
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="input-field cursor-pointer"
            >
              <option value="">No account deduction</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({fmt(a.balance)})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Adding...' : 'Confirm Contribution'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
