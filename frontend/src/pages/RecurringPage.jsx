import { useState, useEffect, useCallback } from 'react';
import { Plus, Repeat, Calendar, Clock, Pencil, Trash2, CheckCircle2, Play, AlertCircle } from 'lucide-react';
import { recurringApi } from '../api';
import { usePreferences } from '../context/PreferencesContext';
import { useToast } from '../context/ToastContext';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Badge from '../components/Badge';
import RecurringModal from '../components/RecurringModal';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import { fmtDate, CATEGORY_COLORS } from '../utils/helpers';

export default function RecurringPage() {
  const { fmt } = usePreferences();
  const { addToast } = useToast();

  const [recurring, setRecurring] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);

  const loadRecurring = useCallback(async () => {
    try {
      const res = await recurringApi.list();
      setRecurring(res.data || []);
      setSummary(res.summary || null);
    } catch (err) {
      console.error('Failed to load recurring items:', err);
      addToast(err.message || 'Error loading recurring items', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadRecurring();
  }, [loadRecurring]);

  const handleProcessDue = async () => {
    setProcessing(true);
    try {
      const res = await recurringApi.processDue();
      addToast(res.message || 'Processed due recurring payments', 'success');
      loadRecurring();
    } catch (err) {
      addToast(err.message || 'Failed to process due recurring items', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmItem) return;
    try {
      await recurringApi.delete(deleteConfirmItem.id);
      addToast('Recurring payment deleted', 'success');
      setDeleteConfirmItem(null);
      loadRecurring();
    } catch (err) {
      addToast(err.message || 'Failed to delete recurring payment', 'error');
    }
  };

  return (
    <PageContainer className="max-w-5xl mx-auto">
      {/* 1. Page Header */}
      <PageHeader
        title="Recurring Bills & Subscriptions"
        subtitle="Track fixed monthly commitments, utilities, and scheduled payments."
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Button
              variant="secondary"
              size="md"
              icon={Play}
              loading={processing}
              onClick={handleProcessDue}
              title="Scan and auto-record due subscriptions"
              style={{ height: '42px', padding: '0 16px' }}
            >
              Run Due Scheduler
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={() => {
                setEditingItem(null);
                setModalOpen(true);
              }}
              style={{ height: '42px', padding: '0 18px' }}
            >
              Schedule Payment
            </Button>
          </div>
        }
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* 2. Summary KPI Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px',
          }}
        >
          {/* Monthly Commitment */}
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
              Total Monthly Commitment
            </div>
            <div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--fg)', fontFamily: 'monospace', marginTop: '8px' }}>
                {fmt(summary?.monthlyCommitment || 0)}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--fg-muted)', marginTop: '4px' }}>
                Across {summary?.activeCount || recurring.length} active subscriptions
              </div>
            </div>
          </div>

          {/* Upcoming in Next 7 Days */}
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
              Upcoming in Next 7 Days
            </div>
            <div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--accent)', fontFamily: 'monospace', marginTop: '8px' }}>
                {summary?.upcomingThisWeek || 0}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 600, marginTop: '4px' }}>
                Bill(s) scheduled this week
              </div>
            </div>
          </div>

          {/* Active Subscriptions */}
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
              Active Subscriptions
            </div>
            <div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#22C55E', fontFamily: 'monospace', marginTop: '8px' }}>
                {summary?.activeCount || recurring.length}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--fg-muted)', marginTop: '4px' }}>
                Auto-tracked & scheduled
              </div>
            </div>
          </div>
        </div>

        {/* 3. Recurring Cards Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ height: '180px', borderRadius: '20px', background: 'var(--bg-secondary)' }} className="animate-pulse" />
            ))}
          </div>
        ) : recurring.length === 0 ? (
          <EmptyState
            icon={Repeat}
            title="No recurring payments"
            description="Add your Netflix, rent, gym membership, or SaaS subscriptions to automate tracking."
            actionLabel="Add Subscription"
            onAction={() => {
              setEditingItem(null);
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
            {recurring.map((item) => {
              const color = CATEGORY_COLORS[item.category?.name] || '#F97316';
              const daysLeft = item.daysUntil !== undefined
                ? item.daysUntil
                : Math.ceil((new Date(item.nextDate) - new Date()) / (1000 * 60 * 60 * 24));
              const isDueSoon = daysLeft >= 0 && daysLeft <= 3;
              const isOverdue = daysLeft < 0;

              return (
                <div
                  key={item.id}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '20px',
                    padding: '24px 26px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '180px',
                    gap: '20px',
                    boxShadow: 'var(--card-shadow)',
                  }}
                  className="hover:border-[var(--accent)] transition-all"
                >
                  {/* Top Row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
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
                        <Repeat size={20} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--fg)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.description}
                        </h3>
                        <div style={{ fontSize: '12px', color: 'var(--fg-muted)', textTransform: 'capitalize', marginTop: '2px' }}>
                          {item.frequency.toLowerCase()} &middot; {item.category?.name}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingItem(item);
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
                        title="Edit Subscription"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmItem(item)}
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
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Middle Row: Amount */}
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-muted)' }}>
                      Billing Amount
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--fg)', fontFamily: 'monospace', marginTop: '4px' }}>
                      {fmt(item.amount)}
                    </div>
                  </div>

                  {/* Bottom Row: Next Date + Badge */}
                  <div
                    style={{
                      paddingTop: '14px',
                      borderTop: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--fg-muted)', fontFamily: 'monospace' }}>
                      <Calendar size={13} />
                      <span>Next: {fmtDate(item.nextDate)}</span>
                    </div>

                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        background: isOverdue ? 'rgba(239, 68, 68, 0.15)' : isDueSoon ? 'rgba(245, 158, 11, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                        color: isOverdue ? '#EF4444' : isDueSoon ? '#F59E0B' : '#22C55E',
                        border: `1px solid ${isOverdue ? 'rgba(239, 68, 68, 0.3)' : isDueSoon ? 'rgba(245, 158, 11, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
                      }}
                    >
                      {isOverdue ? 'Overdue' : isDueSoon ? `In ${daysLeft} days` : 'Active'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals & Dialogs */}
      <RecurringModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        item={editingItem}
        onSuccess={loadRecurring}
      />

      <ConfirmDialog
        isOpen={!!deleteConfirmItem}
        title="Delete Recurring Payment"
        message={`Are you sure you want to delete "${deleteConfirmItem?.description}"?`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmItem(null)}
      />
    </PageContainer>
  );
}
