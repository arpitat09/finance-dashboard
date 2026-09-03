import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { recurringApi, categoryApi, accountApi } from '../api';
import { useToast } from '../context/ToastContext';
import { usePreferences } from '../context/PreferencesContext';

export default function RecurringModal({ isOpen, onClose, recurring, onSaved }) {
  const [form, setForm] = useState({
    description: '',
    amount: '',
    type: 'EXPENSE',
    categoryId: '',
    accountId: '',
    frequency: 'MONTHLY',
    nextDate: new Date().toISOString().slice(0, 10),
    isActive: true,
  });

  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const { addToast } = useToast();
  const { currency } = usePreferences();

  useEffect(() => {
    if (!isOpen) return;

    async function loadData() {
      try {
        const [catRes, accRes] = await Promise.all([
          categoryApi.list('EXPENSE'),
          accountApi.list(),
        ]);
        setCategories(catRes.data || []);
        setAccounts(accRes.data || []);

        if (recurring) {
          setForm({
            description: recurring.description || '',
            amount: String(recurring.amount || ''),
            type: recurring.type || 'EXPENSE',
            categoryId: recurring.categoryId || '',
            accountId: recurring.accountId || '',
            frequency: recurring.frequency || 'MONTHLY',
            nextDate: recurring.nextDate ? recurring.nextDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
            isActive: recurring.isActive !== undefined ? recurring.isActive : true,
          });
        } else {
          setForm({
            description: '',
            amount: '',
            type: 'EXPENSE',
            categoryId: catRes.data?.[0]?.id || '',
            accountId: accRes.data?.[0]?.id || '',
            frequency: 'MONTHLY',
            nextDate: new Date().toISOString().slice(0, 10),
            isActive: true,
          });
        }
      } catch (err) {
        console.error('Failed to load categories/accounts:', err);
      }
    }
    loadData();
  }, [isOpen, recurring]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};

    if (!form.description.trim()) errs.description = 'Description is required';
    if (!form.amount || parseFloat(form.amount) <= 0) errs.amount = 'Valid positive amount required';
    if (!form.categoryId) errs.categoryId = 'Category selection required';
    if (!form.nextDate) errs.nextDate = 'Next payment date required';

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount),
        accountId: form.accountId || null,
      };

      if (recurring?.id) {
        await recurringApi.update(recurring.id, payload);
        addToast('Recurring payment updated successfully', 'success');
      } else {
        await recurringApi.create(payload);
        addToast('Recurring subscription scheduled', 'success');
      }

      onSaved?.();
      onClose();
    } catch (err) {
      addToast(err.message || 'Failed to save recurring item', 'error');
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
              {recurring ? 'Edit Recurring Payment' : 'New Recurring Payment'}
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--fg-muted)', margin: '4px 0 0 0' }}>
              Schedule subscriptions, utility bills, rent, or automated income
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
              Description <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Netflix 4K, Apartment Rent, Spotify Family"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input-field"
              style={{ height: '42px', borderRadius: '10px', fontSize: '13.5px', width: '100%' }}
            />
            {errors.description && <p style={{ fontSize: '11px', color: '#EF4444', margin: '4px 0 0 0' }}>{errors.description}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--fg-secondary)', marginBottom: '6px' }}>
                Amount ({currency === 'INR' ? '₹' : currency}) <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="input-field"
                style={{ height: '42px', borderRadius: '10px', fontSize: '14px', fontFamily: 'monospace', fontWeight: 800, width: '100%' }}
              />
              {errors.amount && <p style={{ fontSize: '11px', color: '#EF4444', margin: '4px 0 0 0' }}>{errors.amount}</p>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--fg-secondary)', marginBottom: '6px' }}>
                Frequency
              </label>
              <select
                value={form.frequency}
                onChange={(e) => setForm({ ...form, frequency: e.target.value })}
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
                <option value="MONTHLY">Monthly</option>
                <option value="WEEKLY">Weekly</option>
                <option value="DAILY">Daily</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--fg-secondary)', marginBottom: '6px' }}>
                Category <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
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
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && <p style={{ fontSize: '11px', color: '#EF4444', margin: '4px 0 0 0' }}>{errors.categoryId}</p>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--fg-secondary)', marginBottom: '6px' }}>
                Next Payment Date <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="date"
                value={form.nextDate}
                onChange={(e) => setForm({ ...form, nextDate: e.target.value })}
                className="input-field"
                style={{ height: '42px', borderRadius: '10px', fontSize: '13.5px', width: '100%' }}
              />
              {errors.nextDate && <p style={{ fontSize: '11px', color: '#EF4444', margin: '4px 0 0 0' }}>{errors.nextDate}</p>}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--fg-secondary)', marginBottom: '6px' }}>
              Account (Optional)
            </label>
            <select
              value={form.accountId}
              onChange={(e) => setForm({ ...form, accountId: e.target.value })}
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
              <option value="">No specific account</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.type})
                </option>
              ))}
            </select>
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
              {submitting ? 'Saving...' : recurring ? 'Update Payment' : 'Schedule Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
