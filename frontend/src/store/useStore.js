import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { defaultTransactions } from '../data/mockData';

export const useStore = create(
  persist(
    (set, get) => ({
      transactions: defaultTransactions,
      filters: { search: '', type: 'all', category: 'all', sort: 'date-desc' },
      role: 'admin',
      darkMode: true,
      period: '3m',
      currentPage: 1,
      editingId: null,
      deleteConfirmId: null,
      toasts: [],

      setFilter: (key, value) => set((s) => ({ filters: { ...s.filters, [key]: value }, currentPage: 1 })),
      setRole: (role) => set({ role }),
      toggleTheme: () => set((s) => ({ darkMode: !s.darkMode })),
      setPeriod: (period) => set({ period }),
      setEditingId: (id) => set({ editingId: id }),
      setPage: (p) => set({ currentPage: p }),

      addTransaction: (tx) => set((s) => ({
        transactions: [...s.transactions, { ...tx, id: Math.max(0, ...s.transactions.map(t=>t.id)) + 1 }]
      })),
      updateTransaction: (id, data) => set((s) => ({
        transactions: s.transactions.map(t => t.id === id ? { ...t, ...data } : t)
      })),
      deleteTransaction: (id) => set((s) => ({
        transactions: s.transactions.filter(t => t.id !== id),
        deleteConfirmId: null
      })),
      setDeleteConfirmId: (id) => set({ deleteConfirmId: id }),

      addToast: (message, type = 'info') => {
        const id = Date.now();
        set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
        setTimeout(() => set((s) => ({ toasts: s.toasts.filter(t => t.id !== id) })), 3000);
      }
    }),
    { name: 'finvault-storage' }
  )
);