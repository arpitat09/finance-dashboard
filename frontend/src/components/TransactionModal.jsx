import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { transactionApi, categoryApi, accountApi } from '../api';
import { useToast } from '../context/ToastContext';
import { usePreferences } from '../context/PreferencesContext';

export default function TransactionModal({ isOpen, onClose, transaction, onSaved }) {
  const [form, setForm] = useState({
    description: '',
    amount: '',
    type: 'EXPENSE',
    categoryId: '',
    accountId: '',
    date: new Date().toISOString().slice(0, 10),
    paymentMethod: 'UPI',
    notes: '',
    isRecurring: false,
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
          categoryApi.list(),
          accountApi.list(),
        ]);
        setCategories(catRes.data || []);
        setAccounts(accRes.data || []);

        if (transaction) {
          setForm({
            description: transaction.description || '',
            amount: String(transaction.amount || ''),
            type: transaction.type || 'EXPENSE',
            categoryId: transaction.categoryId || '',
            accountId: transaction.accountId || '',
            date: transaction.date ? transaction.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
            paymentMethod: transaction.paymentMethod || 'UPI',
            notes: transaction.notes || '',
            isRecurring: transaction.isRecurring || false,
          });
        } else {
          const defaultCats = catRes.data || [];
          const expenseCat = defaultCats.find((c) => c.type === 'EXPENSE');
          const defaultAccs = accRes.data || [];
          setForm({
            description: '',
            amount: '',
            type: 'EXPENSE',
            categoryId: expenseCat?.id || '',
            accountId: defaultAccs[0]?.id || '',
            date: new Date().toISOString().slice(0, 10),
            paymentMethod: 'UPI',
            notes: '',
            isRecurring: false,
          });
        }
      } catch (err) {
        console.error('Failed to load categories/accounts:', err);
      }
    }
    loadData();
  }, [isOpen, transaction]);

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) => c.type === form.type);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};

    if (!form.description.trim()) errs.description = 'Description is required';
    if (!form.amount || parseFloat(form.amount) <= 0) errs.amount = 'Valid positive amount required';
    if (!form.categoryId) errs.categoryId = 'Category selection required';
    if (!form.date) errs.date = 'Date is required';

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount),
        accountId: form.accountId || null,
        notes: form.notes?.trim() || null,
      };

      if (transaction?.id) {
        await transactionApi.update(transaction.id, payload);
        addToast('Transaction updated successfully', 'success');
      } else {
        await transactionApi.create(payload);
        addToast('Transaction recorded successfully', 'success');
      }

      onSaved?.();
      onClose();
    } catch (err) {
      addToast(err.message || 'Failed to save transaction', 'error');
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
          maxWidth: '520px',
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
        {/* Modal Header */}
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
              {transaction ? 'Edit Transaction' : 'Record Transaction'}
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--fg-muted)', margin: '4px 0 0 0' }}>
              {transaction ? 'Modify existing financial ledger entry' : 'Add an income or expense to update balances and budgets'}
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

        {/* Type Toggle Tabs */}
        <div
          style={{
            display: 'flex',
            padding: '4px',
            borderRadius: '12px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            marginBottom: '20px',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setForm((prev) => {
                const newCat = categories.find((c) => c.type === 'EXPENSE');
                return { ...prev, type: 'EXPENSE', categoryId: newCat?.id || '' };
              });
            }}
            style={{
              flex: 1,
              height: '38px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.15s ease',
              background: form.type === 'EXPENSE' ? '#EF4444' : 'transparent',
              color: form.type === 'EXPENSE' ? '#FFFFFF' : 'var(--fg-muted)',
            }}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => {
              setForm((prev) => {
                const newCat = categories.find((c) => c.type === 'INCOME');
                return { ...prev, type: 'INCOME', categoryId: newCat?.id || '' };
              });
            }}
            style={{
              flex: 1,
              height: '38px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.15s ease',
              background: form.type === 'INCOME' ? '#22C55E' : 'transparent',
              color: form.type === 'INCOME' ? '#FFFFFF' : 'var(--fg-muted)',
            }}
          >
            Income
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--fg-secondary)', marginBottom: '6px' }}>
              Description <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Zepto Supermarket Grocery, Client Project Milestone"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input-field"
              style={{ height: '42px', borderRadius: '10px', fontSize: '13.5px', width: '100%' }}
            />
            {errors.description && <p style={{ fontSize: '11px', color: '#EF4444', margin: '4px 0 0 0' }}>{errors.description}</p>}
          </div>

          {/* Amount & Date Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
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
                Date <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="input-field"
                style={{ height: '42px', borderRadius: '10px', fontSize: '13.5px', width: '100%' }}
              />
              {errors.date && <p style={{ fontSize: '11px', color: '#EF4444', margin: '4px 0 0 0' }}>{errors.date}</p>}
            </div>
          </div>

          {/* Category & Account */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
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
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && <p style={{ fontSize: '11px', color: '#EF4444', margin: '4px 0 0 0' }}>{errors.categoryId}</p>}
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
          </div>

          {/* Payment Method & Recurring */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', alignItems: 'center' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--fg-secondary)', marginBottom: '6px' }}>
                Payment Method
              </label>
              <select
                value={form.paymentMethod}
                onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
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
                <option value="UPI">UPI (GPay / PhonePe / PayTM)</option>
                <option value="CARD">Credit / Debit Card</option>
                <option value="NET_BANKING">Net Banking / IMPS</option>
                <option value="CASH">Cash</option>
                <option value="TRANSFER">Direct Bank Transfer</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div style={{ paddingTop: '22px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--fg)', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  checked={form.isRecurring}
                  onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })}
                  style={{ width: '16px', height: '16px', borderRadius: '4px', cursor: 'pointer' }}
                />
                Mark as Recurring
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--fg-secondary)', marginBottom: '6px' }}>
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Add extra context, invoice number, or memo..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="input-field resize-none"
              style={{ padding: '10px 14px', borderRadius: '10px', fontSize: '13px', width: '100%' }}
            />
          </div>

          {/* Modal Action Buttons */}
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
              {submitting ? 'Saving...' : transaction ? 'Update Transaction' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}