import { useState, useEffect } from 'react';
import { Search, X, ArrowLeftRight, Wallet, PieChart, Target, Repeat, CornerDownLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { transactionApi, accountApi, budgetApi, goalApi, recurringApi } from '../api';
import { usePreferences } from '../context/PreferencesContext';

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    transactions: [],
    accounts: [],
    budgets: [],
    goals: [],
    recurring: [],
  });

  const { fmt } = usePreferences();
  const navigate = useNavigate();

  // Global Keyboard listener: Cmd+K / Ctrl+K and ESC
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(true);
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Search Debounced API Call
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults({ transactions: [], accounts: [], budgets: [], goals: [], recurring: [] });
      return;
    }

    if (!query.trim()) {
      setResults({ transactions: [], accounts: [], budgets: [], goals: [], recurring: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const q = query.toLowerCase();
        const [txRes, accRes, bgRes, glRes, rcRes] = await Promise.all([
          transactionApi.list({ search: query, limit: 5 }),
          accountApi.list(),
          budgetApi.list(),
          goalApi.list(),
          recurringApi.list(),
        ]);

        const filteredAccounts = (accRes.data || []).filter((a) => a.name.toLowerCase().includes(q));
        const filteredBudgets = (bgRes.data || []).filter((b) => b.name.toLowerCase().includes(q) || b.category?.name?.toLowerCase().includes(q));
        const filteredGoals = (glRes.data || []).filter((g) => g.name.toLowerCase().includes(q));
        const filteredRecurring = (rcRes.data?.recurring || []).filter((r) => r.description.toLowerCase().includes(q));

        setResults({
          transactions: txRes.data || [],
          accounts: filteredAccounts,
          budgets: filteredBudgets,
          goals: filteredGoals,
          recurring: filteredRecurring,
        });
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  if (!isOpen) return null;

  const handleSelect = (path) => {
    onClose();
    navigate(path);
  };

  const totalResults =
    results.transactions.length +
    results.accounts.length +
    results.budgets.length +
    results.goals.length +
    results.recurring.length;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(5, 5, 8, 0.82)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingTop: '110px',
        paddingLeft: '16px',
        paddingRight: '16px',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '620px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: '24px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.06)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '75vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar (64px height) */}
        <div
          style={{
            height: '64px',
            padding: '0 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            background: 'var(--bg-secondary)',
            flexShrink: 0,
          }}
        >
          <Search size={22} className="text-[var(--accent)] flex-shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search transactions, budgets, goals, recurring bills..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '16px',
              fontWeight: 500,
              color: 'var(--fg)',
            }}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1.5 text-[var(--fg-muted)] hover:text-[var(--fg)] rounded-lg hover:bg-[var(--bg-surface)] cursor-pointer"
            >
              <X size={18} />
            </button>
          )}
          <kbd
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 700,
              borderRadius: '8px',
              background: 'var(--bg-surface)',
              color: 'var(--fg-muted)',
              border: '1px solid var(--border)',
              flexShrink: 0,
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results / Empty State Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {loading && (
            <div className="py-12 text-center text-sm text-[var(--fg-muted)] animate-pulse">
              Searching your financial workspace...
            </div>
          )}

          {!loading && !query && (
            <div style={{ padding: '36px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '18px',
                  background: 'rgba(var(--accent-rgb), 0.12)',
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <Search size={26} />
              </div>
              <h4 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--fg)', marginBottom: '6px' }}>
                Global Financial Spotlight
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--fg-muted)', maxWidth: '400px', marginBottom: '24px', lineHeight: 1.5 }}>
                Type any keyword to instantly search across accounts, expenses, budgets, and goals.
              </p>

              {/* Quick Jump Shortcuts */}
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
                {[
                  { label: 'Transactions', path: '/transactions' },
                  { label: 'Budgets', path: '/budgets' },
                  { label: 'Savings Goals', path: '/goals' },
                  { label: 'Accounts', path: '/accounts' },
                  { label: 'Recurring Bills', path: '/recurring' },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleSelect(item.path)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '12px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      background: 'var(--bg-surface)',
                      color: 'var(--fg-secondary)',
                      border: '1px solid var(--border)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    className="hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!loading && query && totalResults === 0 && (
            <div className="py-12 text-center space-y-2">
              <p className="text-base font-bold text-[var(--fg)]">No results found for "{query}"</p>
              <p className="text-xs sm:text-sm text-[var(--fg-muted)]">Try searching for a different keyword, merchant, or category name.</p>
            </div>
          )}

          {/* Transactions Group */}
          {results.transactions.length > 0 && (
            <div className="pb-3">
              <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)] flex items-center gap-2">
                <ArrowLeftRight size={14} className="text-orange-500" /> Transactions ({results.transactions.length})
              </div>
              <div className="space-y-1 mt-1">
                {results.transactions.map((tx) => (
                  <button
                    key={tx.id}
                    onClick={() => handleSelect('/transactions')}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-[var(--bg-surface)] text-left transition-colors cursor-pointer border border-transparent hover:border-[var(--border)]"
                  >
                    <div className="min-w-0 pr-3 space-y-0.5">
                      <div className="text-sm font-bold text-[var(--fg)] truncate">{tx.description || tx.category?.name}</div>
                      <div className="text-xs text-[var(--fg-muted)] truncate">{tx.category?.name} • {tx.account?.name}</div>
                    </div>
                    <div className={`text-sm font-bold font-mono-num flex-shrink-0 ${tx.type === 'INCOME' ? 'text-emerald-500' : 'text-[var(--fg)]'}`}>
                      {tx.type === 'INCOME' ? '+' : '-'}{fmt(tx.amount)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Budgets Group */}
          {results.budgets.length > 0 && (
            <div className="pb-3">
              <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)] flex items-center gap-2">
                <PieChart size={14} className="text-amber-500" /> Budgets ({results.budgets.length})
              </div>
              <div className="space-y-1 mt-1">
                {results.budgets.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => handleSelect('/budgets')}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-[var(--bg-surface)] text-left transition-colors cursor-pointer border border-transparent hover:border-[var(--border)]"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="text-sm font-bold text-[var(--fg)] truncate">{b.name}</div>
                      <div className="text-xs text-[var(--fg-muted)] truncate">Limit: {fmt(b.amount)}/mo</div>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-500">
                      Budget
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Goals Group */}
          {results.goals.length > 0 && (
            <div className="pb-3">
              <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)] flex items-center gap-2">
                <Target size={14} className="text-emerald-500" /> Savings Goals ({results.goals.length})
              </div>
              <div className="space-y-1 mt-1">
                {results.goals.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => handleSelect('/goals')}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-[var(--bg-surface)] text-left transition-colors cursor-pointer border border-transparent hover:border-[var(--border)]"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="text-sm font-bold text-[var(--fg)] truncate">{g.name}</div>
                      <div className="text-xs text-[var(--fg-muted)] truncate">{fmt(g.currentAmount)} / {fmt(g.targetAmount)} ({g.percentage}%)</div>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500">
                      Goal
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Accounts Group */}
          {results.accounts.length > 0 && (
            <div className="pb-3">
              <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)] flex items-center gap-2">
                <Wallet size={14} className="text-cyan-500" /> Accounts ({results.accounts.length})
              </div>
              <div className="space-y-1 mt-1">
                {results.accounts.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => handleSelect('/accounts')}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-[var(--bg-surface)] text-left transition-colors cursor-pointer border border-transparent hover:border-[var(--border)]"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="text-sm font-bold text-[var(--fg)] truncate">{a.name}</div>
                      <div className="text-xs text-[var(--fg-muted)] truncate">{a.type} • {a.currency}</div>
                    </div>
                    <div className="text-sm font-bold font-mono-num text-[var(--fg)]">
                      {fmt(a.currentBalance)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recurring Group */}
          {results.recurring.length > 0 && (
            <div className="pb-3">
              <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)] flex items-center gap-2">
                <Repeat size={14} className="text-purple-500" /> Recurring Bills ({results.recurring.length})
              </div>
              <div className="space-y-1 mt-1">
                {results.recurring.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleSelect('/recurring')}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-[var(--bg-surface)] text-left transition-colors cursor-pointer border border-transparent hover:border-[var(--border)]"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="text-sm font-bold text-[var(--fg)] truncate">{r.description}</div>
                      <div className="text-xs text-[var(--fg-muted)] truncate">{r.frequency} • Next: {r.nextDueDate ? r.nextDueDate.slice(0, 10) : 'Active'}</div>
                    </div>
                    <div className="text-sm font-bold font-mono-num text-orange-500">
                      {fmt(r.amount)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div
          style={{
            padding: '14px 24px',
            background: 'var(--bg-surface)',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '12px',
            color: 'var(--fg-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <kbd style={{ padding: '2px 6px', borderRadius: '4px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', fontSize: '11px', fontWeight: 700 }}>
                ↵
              </kbd>
              to select
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <kbd style={{ padding: '2px 6px', borderRadius: '4px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', fontSize: '11px', fontWeight: 700 }}>
                ESC
              </kbd>
              to close
            </span>
          </div>
          <span style={{ fontWeight: 600, color: 'var(--accent)' }}>FINORA Intelligence</span>
        </div>
      </div>
    </div>
  );
}
