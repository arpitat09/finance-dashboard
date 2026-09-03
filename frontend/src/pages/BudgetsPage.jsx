import { useState, useEffect, useCallback } from 'react';
import { Plus, PieChart, AlertCircle, CheckCircle2, Pencil, Trash2, TrendingUp, PiggyBank, ShieldCheck } from 'lucide-react';
import { budgetApi } from '../api';
import { usePreferences } from '../context/PreferencesContext';
import { useToast } from '../context/ToastContext';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Badge from '../components/Badge';
import BudgetModal from '../components/BudgetModal';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import { CATEGORY_COLORS } from '../utils/helpers';

export default function BudgetsPage() {
  const { fmt } = usePreferences();
  const { addToast } = useToast();

  const [budgets, setBudgets] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [deleteConfirmBudget, setDeleteConfirmBudget] = useState(null);

  const loadBudgets = useCallback(async () => {
    try {
      const res = await budgetApi.list();
      setBudgets(res.data || []);
      setSummary(res.summary || null);
    } catch (err) {
      console.error('Failed to load budgets:', err);
      addToast(err.message || 'Error loading budgets', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  const handleDelete = async () => {
    if (!deleteConfirmBudget) return;
    try {
      await budgetApi.delete(deleteConfirmBudget.id);
      addToast('Budget deleted successfully', 'success');
      setDeleteConfirmBudget(null);
      loadBudgets();
    } catch (err) {
      addToast(err.message || 'Failed to delete budget', 'error');
    }
  };

  return (
    <PageContainer className="max-w-5xl mx-auto">
      {/* 1. Page Header */}
      <PageHeader
        title="Budgets"
        subtitle="Monitor category spending limits and maintain healthy cash flow."
        actions={
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => {
              setEditingBudget(null);
              setModalOpen(true);
            }}
            style={{ height: '42px', padding: '0 18px' }}
          >
            Create Budget
          </Button>
        }
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* 2. Summary KPI Row */}
        {summary && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '20px',
            }}
          >
            {/* Total Monthly Budget */}
            <div
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '20px',
                padding: '24px 28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '130px',
                boxShadow: 'var(--card-shadow)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-muted)' }}>
                  Total Monthly Budget
                </span>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(249, 115, 22, 0.12)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PieChart size={18} />
                </div>
              </div>
              <div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--fg)', fontFamily: 'monospace', marginTop: '8px' }}>
                  {fmt(summary.totalBudget)}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--fg-muted)', marginTop: '4px' }}>
                  Across {budgets.length} allocated categories
                </div>
              </div>
            </div>

            {/* Total Spent */}
            <div
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '20px',
                padding: '24px 28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '130px',
                boxShadow: 'var(--card-shadow)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-muted)' }}>
                  Total Spent This Month
                </span>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(249, 115, 22, 0.12)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={18} />
                </div>
              </div>
              <div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--accent)', fontFamily: 'monospace', marginTop: '8px' }}>
                  {fmt(summary.totalSpent)}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 600, marginTop: '4px' }}>
                  {summary.overallPercentage}% of total budget utilized
                </div>
              </div>
            </div>

            {/* Remaining Allowance */}
            <div
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '20px',
                padding: '24px 28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '130px',
                boxShadow: 'var(--card-shadow)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-muted)' }}>
                  Remaining Allowance
                </span>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.12)', color: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={18} />
                </div>
              </div>
              <div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#22C55E', fontFamily: 'monospace', marginTop: '8px' }}>
                  {fmt(summary.totalRemaining)}
                </div>
                <div style={{ fontSize: '12px', color: '#22C55E', fontWeight: 600, marginTop: '4px' }}>
                  {summary.exceededCount > 0
                    ? `${summary.exceededCount} budget(s) exceeded`
                    : 'All budgets currently on track'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. Budgets Card Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ height: '220px', borderRadius: '20px', background: 'var(--bg-secondary)' }} className="animate-pulse" />
            ))}
          </div>
        ) : budgets.length === 0 ? (
          <EmptyState
            icon={PieChart}
            title="No budgets created yet"
            description="Set spending caps on your food, housing, or shopping expenses to avoid overspending."
            actionLabel="Create First Budget"
            onAction={() => {
              setEditingBudget(null);
              setModalOpen(true);
            }}
          />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
            }}
          >
            {budgets.map((b) => {
              const color = CATEGORY_COLORS[b.category?.name] || '#F97316';
              const isExceeded = b.status === 'EXCEEDED';
              const isApproaching = b.status === 'APPROACHING';

              return (
                <div
                  key={b.id}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '20px',
                    padding: '24px 26px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '220px',
                    gap: '20px',
                    boxShadow: 'var(--card-shadow)',
                  }}
                  className="hover:border-[var(--accent)] transition-all"
                >
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '12px',
                          background: `${color}18`,
                          color: color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        <PieChart size={22} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--fg)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {b.name}
                        </h3>
                        <div style={{ fontSize: '12px', color: 'var(--fg-muted)', marginTop: '2px' }}>
                          {b.category?.name}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingBudget(b);
                          setModalOpen(true);
                        }}
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
                        }}
                        className="hover:text-[var(--accent)] hover:border-[var(--accent)]"
                        title="Edit Budget"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmBudget(b)}
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
                        }}
                        className="hover:text-red-500 hover:border-red-500"
                        title="Delete Budget"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar & Status */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: 'var(--fg-muted)' }}>
                        Spent <strong style={{ color: 'var(--fg)', fontFamily: 'monospace' }}>{fmt(b.spent)}</strong> of {fmt(b.amount)}
                      </span>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: isExceeded
                            ? 'rgba(239, 68, 68, 0.15)'
                            : isApproaching
                            ? 'rgba(245, 158, 11, 0.15)'
                            : 'rgba(34, 197, 94, 0.15)',
                          color: isExceeded ? '#EF4444' : isApproaching ? '#F59E0B' : '#22C55E',
                        }}
                      >
                        {b.percentage}%
                      </span>
                    </div>

                    <div style={{ width: '100%', height: '8px', borderRadius: '8px', background: 'var(--bg-surface)', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          borderRadius: '8px',
                          background: isExceeded ? '#EF4444' : isApproaching ? '#F59E0B' : '#22C55E',
                          width: `${Math.min(100, b.percentage)}%`,
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  </div>

                  {/* Bottom Stats Footer */}
                  <div
                    style={{
                      paddingTop: '14px',
                      borderTop: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                    }}
                  >
                    <span style={{ color: 'var(--fg-muted)' }}>Remaining Cap</span>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: 800,
                        fontSize: '15px',
                        color: b.remaining < 0 ? '#EF4444' : '#22C55E',
                      }}
                    >
                      {fmt(b.remaining)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <BudgetModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingBudget(null);
        }}
        budget={editingBudget}
        onSaved={loadBudgets}
      />

      <ConfirmDialog
        isOpen={!!deleteConfirmBudget}
        title="Delete Budget Cap"
        message={`Are you sure you want to remove the budget cap for "${deleteConfirmBudget?.name}"?`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmBudget(null)}
      />
    </PageContainer>
  );
}
