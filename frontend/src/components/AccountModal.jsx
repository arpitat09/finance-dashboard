import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { accountApi } from '../api';
import { useToast } from '../context/ToastContext';
import { usePreferences } from '../context/PreferencesContext';

export default function AccountModal({ isOpen, onClose, account, onSaved }) {
  const [form, setForm] = useState({
    name: '',
    type: 'BANK',
    balance: '0',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const { addToast } = useToast();
  const { currency } = usePreferences();

  useEffect(() => {
    if (!isOpen) return;

    if (account) {
      setForm({
        name: account.name || '',
        type: account.type || 'BANK',
        balance: String(account.balance || '0'),
      });
    } else {
      setForm({
        name: '',
        type: 'BANK',
        balance: '0',
      });
    }
  }, [isOpen, account]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};

    if (!form.name.trim()) errs.name = 'Account name is required';

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        balance: parseFloat(form.balance || '0'),
      };

      if (account?.id) {
        await accountApi.update(account.id, payload);
        addToast('Account updated successfully', 'success');
      } else {
        await accountApi.create(payload);
        addToast('Financial account created successfully', 'success');
      }

      onSaved?.();
      onClose();
    } catch (err) {
      addToast(err.message || 'Failed to save account', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          borderRadius: '24px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          padding: '28px 32px',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.5)',
          position: 'relative',
          margin: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '16px',
            paddingBottom: '18px',
            borderBottom: '1px solid var(--border-subtle)',
            marginBottom: '20px',
          }}
        >
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--fg)', margin: 0 }}>
              {account ? 'Edit Account' : 'Add Financial Account'}
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--fg-muted)', margin: '4px 0 0 0' }}>
              Connect your bank accounts, credit cards, investments, or cash wallets
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              color: 'var(--fg-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
            className="hover:text-[var(--fg)] hover:border-[var(--fg-muted)]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--fg-secondary)', marginBottom: '6px' }}>
              Account Name <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. HDFC Salary, ICICI Savings, Zerodha Demat"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field"
              style={{ height: '42px', borderRadius: '10px', fontSize: '13.5px', width: '100%' }}
            />
            {errors.name && <p style={{ fontSize: '11px', color: '#EF4444', margin: '4px 0 0 0' }}>{errors.name}</p>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--fg-secondary)', marginBottom: '6px' }}>
              Account Type
            </label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              style={{
                height: '42px',
                padding: '0 12px',
                borderRadius: '10px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                color: 'var(--fg)',
                fontSize: '13px',
                width: '100%',
                cursor: 'pointer',
              }}
            >
              <option value="BANK">Bank Account (Checking / Current)</option>
              <option value="SAVINGS">Savings Account</option>
              <option value="INVESTMENT">Investment / Demat / Stocks</option>
              <option value="WALLET">Digital Wallet (PayTM / GPay / Cash)</option>
              <option value="CREDIT">Credit Card / Line of Credit</option>
              <option value="CASH">Physical Cash</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--fg-secondary)', marginBottom: '6px' }}>
              Current Balance ({currency === 'INR' ? '₹' : currency})
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={form.balance}
              onChange={(e) => setForm({ ...form, balance: e.target.value })}
              className="input-field"
              style={{ height: '42px', borderRadius: '10px', fontSize: '14px', fontFamily: 'monospace', fontWeight: 800, width: '100%' }}
            />
            <p style={{ fontSize: '11.5px', color: 'var(--fg-muted)', margin: '4px 0 0 0' }}>
              Transactions linked to this account will automatically adjust this balance.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              paddingTop: '20px',
              marginTop: '6px',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                height: '42px',
                padding: '0 20px',
                borderRadius: '10px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                color: 'var(--fg)',
                fontSize: '13.5px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
              className="hover:border-[var(--fg-muted)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                height: '42px',
                padding: '0 24px',
                borderRadius: '10px',
                background: 'var(--accent)',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: submitting ? 'not-allowed' : 'pointer',
                boxShadow: 'var(--glow-orange)',
              }}
              className="hover:opacity-90 transition-opacity"
            >
              {submitting ? 'Saving...' : account ? 'Update Account' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
