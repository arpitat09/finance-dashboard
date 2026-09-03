import { useState, useEffect, useCallback } from 'react';
import { Plus, Target, CheckCircle2, Pencil, Trash2, ArrowUpRight, DollarSign } from 'lucide-react';
import { goalApi } from '../api';
import { usePreferences } from '../context/PreferencesContext';
import { useToast } from '../context/ToastContext';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Badge from '../components/Badge';
import GoalModal from '../components/GoalModal';
import GoalContributionModal from '../components/GoalContributionModal';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import { fmtDate } from '../utils/helpers';

export default function GoalsPage() {
  const { fmt } = usePreferences();
  const { addToast } = useToast();

  const [goals, setGoals] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [contributeGoal, setContributeGoal] = useState(null);
  const [deleteConfirmGoal, setDeleteConfirmGoal] = useState(null);

  const loadGoals = useCallback(async () => {
    try {
      const res = await goalApi.list();
      setGoals(res.data?.goals || []);
      setSummary(res.data?.summary || null);
    } catch (err) {
      console.error('Failed to load goals:', err);
      addToast(err.message || 'Error loading goals', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const handleDelete = async () => {
    if (!deleteConfirmGoal) return;
    try {
      await goalApi.delete(deleteConfirmGoal.id);
      addToast('Goal deleted successfully', 'success');
      setDeleteConfirmGoal(null);
      loadGoals();
    } catch (err) {
      addToast(err.message || 'Failed to delete goal', 'error');
    }
  };

  return (
    <PageContainer className="max-w-5xl mx-auto">
      {/* 1. Page Header */}
      <PageHeader
        title="Savings Goals"
        subtitle="Set wealth milestones, emergency funds, and monitor your target completion."
        actions={
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => {
              setEditingGoal(null);
              setModalOpen(true);
            }}
            style={{ height: '42px', padding: '0 18px' }}
          >
            Create Goal
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
              <div style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-muted)' }}>
                Total Target Goal Value
              </div>
              <div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--fg)', fontFamily: 'monospace', marginTop: '8px' }}>
                  {fmt(summary.totalTarget)}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--fg-muted)', marginTop: '4px' }}>
                  Across {summary.totalGoals} active milestones
                </div>
              </div>
            </div>

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
              <div style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-muted)' }}>
                Total Accumulated
              </div>
              <div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#22C55E', fontFamily: 'monospace', marginTop: '8px' }}>
                  {fmt(summary.totalSaved)}
                </div>
                <div style={{ fontSize: '12px', color: '#22C55E', fontWeight: 600, marginTop: '4px' }}>
                  {summary.overallProgress}% of all targets achieved
                </div>
              </div>
            </div>

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
              <div style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-muted)' }}>
                Remaining to Save
              </div>
              <div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--accent)', fontFamily: 'monospace', marginTop: '8px' }}>
                  {fmt(summary.totalRemaining)}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--fg-muted)', marginTop: '4px' }}>
                  {summary.completedGoals} completed milestone(s)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. Goals Card Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ height: '220px', borderRadius: '20px', background: 'var(--bg-secondary)' }} className="animate-pulse" />
            ))}
          </div>
        ) : goals.length === 0 ? (
          <EmptyState
            icon={Target}
            title="No savings goals yet"
            description="Start saving for an emergency fund, gadget, vacation, or investment goal."
            actionLabel="Create Goal"
            onAction={() => {
              setEditingGoal(null);
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
            {goals.map((g) => {
              const isCompleted = g.isCompleted || g.percentage >= 100;
              return (
                <div
                  key={g.id}
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
                          background: `${g.color || '#22C55E'}18`,
                          color: g.color || '#22C55E',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        <Target size={22} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--fg)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {g.name}
                        </h3>
                        <div style={{ fontSize: '12px', color: 'var(--fg-muted)', marginTop: '2px' }}>
                          {g.deadline ? `Target: ${fmtDate(g.deadline)}` : 'Ongoing milestone'}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingGoal(g);
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
                        title="Edit Goal"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmGoal(g)}
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
                        title="Delete Goal"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar & Status */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: 'var(--fg-muted)' }}>
                        Saved <strong style={{ color: 'var(--fg)', fontFamily: 'monospace' }}>{fmt(g.currentAmount)}</strong> of {fmt(g.targetAmount)}
                      </span>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: isCompleted ? 'rgba(34, 197, 94, 0.15)' : 'rgba(var(--accent-rgb), 0.15)',
                          color: isCompleted ? '#22C55E' : 'var(--accent)',
                        }}
                      >
                        {g.percentage}%
                      </span>
                    </div>

                    <div style={{ width: '100%', height: '8px', borderRadius: '8px', background: 'var(--bg-surface)', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          borderRadius: '8px',
                          background: 'linear-gradient(90deg, #F97316 0%, #F59E0B 100%)',
                          width: `${Math.min(100, g.percentage)}%`,
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  </div>

                  {/* Action Row */}
                  <div
                    style={{
                      paddingTop: '14px',
                      borderTop: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ fontSize: '12px', color: 'var(--fg-muted)' }}>
                      Remaining: <strong style={{ color: 'var(--fg)', fontFamily: 'monospace' }}>{fmt(Math.max(0, g.targetAmount - g.currentAmount))}</strong>
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Plus}
                      onClick={() => setContributeGoal(g)}
                      style={{ height: '34px', padding: '0 14px' }}
                    >
                      Add Funds
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <GoalModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingGoal(null);
        }}
        goal={editingGoal}
        onSaved={loadGoals}
      />

      <GoalContributionModal
        isOpen={!!contributeGoal}
        onClose={() => setContributeGoal(null)}
        goal={contributeGoal}
        onSaved={loadGoals}
      />

      <ConfirmDialog
        isOpen={!!deleteConfirmGoal}
        title="Delete Savings Goal"
        message={`Are you sure you want to remove the goal "${deleteConfirmGoal?.name}"?`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmGoal(null)}
      />
    </PageContainer>
  );
}
