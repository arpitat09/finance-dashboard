import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../utils/helpers';

export default function TransactionModal({ onClose }) {
  const { editingId, transactions, addTransaction, updateTransaction, addToast } = useStore();
  const existing = editingId ? transactions.find(t => t.id === editingId) : null;
  
  const [form, setForm] = useState({ description: '', amount: '', date: new Date().toISOString().slice(0,10), type: 'expense', category: EXPENSE_CATEGORIES[0] });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (existing) setForm({ description: existing.description, amount: existing.amount, date: existing.date, type: existing.type, category: existing.category });
  }, [existing]);

  const cats = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.description.trim()) errs.description = true;
    if (!form.amount || parseFloat(form.amount) <= 0) errs.amount = true;
    if (!form.date) errs.date = true;
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const data = { ...form, amount: parseFloat(parseFloat(form.amount).toFixed(2)) };
    if (editingId) { updateTransaction(editingId, data); addToast('Transaction updated', 'success'); }
    else { addTransaction(data); addToast('Transaction added', 'success'); }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex items-center justify-center p-5" onClick={onClose}>
      <div className="card w-full max-w-[460px] p-7" style={{animation: 'fadeInUp 0.3s ease', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'}} onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-bold mb-5">{editingId ? 'Edit Transaction' : 'Add Transaction'}</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[13px] font-semibold mb-1" style={{color:'var(--fg-secondary)'}}>Description</label>
            <input type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field" />
            {errors.description && <p className="text-xs mt-1" style={{color:'var(--danger)'}}>Required</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-semibold mb-1" style={{color:'var(--fg-secondary)'}}>Amount ($)</label>
              <input type="number" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="input-field" />
              {errors.amount && <p className="text-xs mt-1" style={{color:'var(--danger)'}}>Invalid amount</p>}
            </div>
            <div>
              <label className="block text-[13px] font-semibold mb-1" style={{color:'var(--fg-secondary)'}}>Date</label>
              <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="input-field" />
              {errors.date && <p className="text-xs mt-1" style={{color:'var(--danger)'}}>Required</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-semibold mb-1" style={{color:'var(--fg-secondary)'}}>Type</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value, category: e.target.value === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]})} className="input-field cursor-pointer">
                <option value="expense">Expense</option><option value="income">Income</option>
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-semibold mb-1" style={{color:'var(--fg-secondary)'}}>Category</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="input-field cursor-pointer">
                {cats.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 py-3">Cancel</button>
            <button type="submit" className="btn-primary flex-1 py-3">{editingId ? 'Update' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}