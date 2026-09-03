import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { budgetApi, categoryApi } from '../api';
import { useToast } from '../context/ToastContext';
import { usePreferences } from '../context/PreferencesContext';

export default function BudgetModal({ isOpen, onClose, budget, onSaved }) {
  const [form, setForm] = useState({
    name: '',
    categoryId: '',
    amount: '',
    period: 'MONTHLY',
  });

  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const { addToast } = useToast();
  const { currency } = usePreferences();

  useEffect(() => {
    if (!isOpen) return;

    async function loadCats() {
      try {
        const res = await categoryApi.list('EXPENSE');
        setCategories(res.data || []);

        if (budget) {
          setForm({
            name: budget.name || '',
            categoryId: budget.categoryId || '',
            amount: String(budget.amount || ''),
            period: budget.period || 'MONTHLY',
          });
        } else {
          const firstCat = res.data?.[0];
          setForm({
            name: firstCat ? `${firstCat.name} Monthly Cap` : '',
            categoryId: firstCat?.id || '',
            amount: '',
            period: 'MONTHLY',
          });
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    }
    loadCats();
  }, [isOpen, budget]);

  if (!isOpen) return null;

  const handleCategoryChange = (e) => {
    const catId = e.target.value;
    const selected = categories.find((c) => c.id === catId);
    setForm((prev) => ({
      ...prev,
      categoryId: catId,
      name: prev.name.includes('Cap') || !prev.name ? (selected ? `${selected.name} Limit` : prev.name) : prev.name,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};

    if (!form.name.trim()) errs.name = 'Budget name is required';
    if (!form.categoryId) errs.categoryId = 'Category selection required';
    if (!form.amount || parseFloat(form.amount) <= 0) errs.amount = 'Valid positive amount required';

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount),
      };

      if (budget?.id) {
        await budgetApi.update(budget.id, payload);
        addToast('Budget updated successfully', 'success');
      } else {
        await budgetApi.create(payload);
        addToast('Budget created successfully', 'success');
      }

      onSaved?.();
      onClose();
    } catch (err) {
      addToast(err.message || 'Failed to save budget', 'error');
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
              {budget ? 'Edit Budget' : 'Create Category Budget'}
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--fg-muted)', margin: '4px 0 0 0' }}>
              Set monthly spending boundaries to keep your cash flow disciplined
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
              Category <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <select
              value={form.categoryId}
              onChange={handleCategoryChange}
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
              <option value="">Select Expense Category</option>
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
              Budget Name <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Dining Out Budget"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field"
              style={{ height: '42px', borderRadius: '10px', fontSize: '13.5px', width: '100%' }}
            />
            {errors.name && <p style={{ fontSize: '11px', color: '#EF4444', margin: '4px 0 0 0' }}>{errors.name}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--fg-secondary)', marginBottom: '6px' }}>
                Limit ({currency === 'INR' ? '₹' : currency}) <span style={{ color: '#EF4444' }}>*</span>
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
                Frequency Period
              </label>
              <select
                value={form.period}
                onChange={(e) => setForm({ ...form, period: e.target.value })}
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
                <option value="YEARLY">Yearly</option>
              </select>
            </div>
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
              {submitting ? 'Saving...' : budget ? 'Update Budget' : 'Create Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
