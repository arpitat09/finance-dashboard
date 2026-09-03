import { useState, useEffect } from 'react';
import { X, Target, ShieldCheck, Laptop, Plane, Car, Home, GraduationCap } from 'lucide-react';
import { goalApi } from '../api';
import { useToast } from '../context/ToastContext';
import { usePreferences } from '../context/PreferencesContext';

const COLORS = ['#22C55E', '#F97316', '#06B6D4', '#8B5CF6', '#EC4899', '#F59E0B', '#38BDF8'];

export default function GoalModal({ isOpen, onClose, goal, onSaved }) {
  const [form, setForm] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '0',
    deadline: '',
    color: '#22C55E',
    icon: 'Target',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const { addToast } = useToast();
  const { currency } = usePreferences();

  useEffect(() => {
    if (!isOpen) return;

    if (goal) {
      setForm({
        name: goal.name || '',
        targetAmount: String(goal.targetAmount || ''),
        currentAmount: String(goal.currentAmount || '0'),
        deadline: goal.deadline ? goal.deadline.slice(0, 10) : '',
        color: goal.color || '#22C55E',
        icon: goal.icon || 'Target',
      });
    } else {
      setForm({
        name: '',
        targetAmount: '',
        currentAmount: '0',
        deadline: '',
        color: '#22C55E',
        icon: 'Target',
      });
    }
  }, [isOpen, goal]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};

    if (!form.name.trim()) errs.name = 'Goal name is required';
    if (!form.targetAmount || parseFloat(form.targetAmount) <= 0) errs.targetAmount = 'Valid positive target required';

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        targetAmount: parseFloat(form.targetAmount),
        currentAmount: parseFloat(form.currentAmount || '0'),
        deadline: form.deadline || null,
      };

      if (goal?.id) {
        await goalApi.update(goal.id, payload);
        addToast('Goal updated successfully', 'success');
      } else {
        await goalApi.create(payload);
        addToast('Savings goal created successfully', 'success');
      }

      onSaved?.();
      onClose();
    } catch (err) {
      addToast(err.message || 'Failed to save goal', 'error');
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
              {goal ? 'Edit Savings Goal' : 'New Savings Goal'}
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--fg-muted)', margin: '4px 0 0 0' }}>
              Define financial milestones like emergency funds, purchases, or travel
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
              Goal Name <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Emergency Fund 6-Months, MacBook Pro M3"
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
                Target Amount ({currency === 'INR' ? '₹' : currency}) <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.targetAmount}
                onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
                className="input-field"
                style={{ height: '42px', borderRadius: '10px', fontSize: '14px', fontFamily: 'monospace', fontWeight: 800, width: '100%' }}
              />
              {errors.targetAmount && <p style={{ fontSize: '11px', color: '#EF4444', margin: '4px 0 0 0' }}>{errors.targetAmount}</p>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--fg-secondary)', marginBottom: '6px' }}>
                Current Saved
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.currentAmount}
                onChange={(e) => setForm({ ...form, currentAmount: e.target.value })}
                className="input-field"
                style={{ height: '42px', borderRadius: '10px', fontSize: '14px', fontFamily: 'monospace', fontWeight: 800, width: '100%' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--fg-secondary)', marginBottom: '6px' }}>
              Target Deadline (Optional)
            </label>
            <input
              type="date"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              className="input-field"
              style={{ height: '42px', borderRadius: '10px', fontSize: '13.5px', width: '100%' }}
            />
          </div>

          {/* Color Pickers */}
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--fg-secondary)', marginBottom: '8px' }}>
              Goal Color Theme
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: c,
                    border: form.color === c ? '3px solid #FFFFFF' : 'none',
                    cursor: 'pointer',
                    transform: form.color === c ? 'scale(1.15)' : 'scale(1)',
                    transition: 'all 0.15s ease',
                  }}
                />
              ))}
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
              {submitting ? 'Saving...' : goal ? 'Update Goal' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
