import { useState, useEffect, useCallback } from 'react';
import { Bell, Check, CheckCheck, Trash2, AlertTriangle, Calendar, Target, ShieldAlert, Info } from 'lucide-react';
import { notificationApi } from '../api';
import { useToast } from '../context/ToastContext';
import { fmtDateTime } from '../utils/helpers';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';

const TYPE_CONFIG = {
  BUDGET_WARNING: { icon: AlertTriangle, label: 'Budget Warning', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' },
  BUDGET_EXCEEDED: { icon: ShieldAlert, label: 'Budget Exceeded', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)' },
  RECURRING_DUE: { icon: Calendar, label: 'Bill Due', color: '#06B6D4', bg: 'rgba(6, 182, 212, 0.15)' },
  GOAL_MILESTONE: { icon: Target, label: 'Goal Milestone', color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' },
  LARGE_TRANSACTION: { icon: AlertTriangle, label: 'Large Expense', color: '#F97316', bg: 'rgba(249, 115, 22, 0.15)' },
  SYSTEM: { icon: Info, label: 'System Notice', color: '#6366F1', bg: 'rgba(99, 102, 241, 0.15)' },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');

  const { addToast } = useToast();

  const loadNotifications = useCallback(async () => {
    try {
      const res = await notificationApi.list();
      setNotifications(res.data || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      addToast(err.message || 'Error loading notifications', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkRead = async (id) => {
    try {
      await notificationApi.markRead(id);
      loadNotifications();
    } catch (err) {
      addToast(err.message || 'Failed to update notification', 'error');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      addToast('All notifications marked as read', 'success');
      loadNotifications();
    } catch (err) {
      addToast(err.message || 'Failed to mark all as read', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationApi.delete(id);
      addToast('Notification deleted', 'success');
      loadNotifications();
    } catch (err) {
      addToast(err.message || 'Failed to delete notification', 'error');
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'UNREAD') return !n.isRead;
    if (activeFilter === 'BUDGETS') return n.type?.includes('BUDGET');
    if (activeFilter === 'BILLS') return n.type === 'RECURRING_DUE';
    if (activeFilter === 'GOALS') return n.type === 'GOAL_MILESTONE';
    return true;
  });

  return (
    <PageContainer className="max-w-4xl mx-auto">
      {/* 1. Page Header */}
      <PageHeader
        title="Notification Center"
        subtitle="Automated alerts and insights for budget thresholds, recurring bills, and savings achievements."
        actions={
          unreadCount > 0 ? (
            <Button variant="secondary" size="md" icon={CheckCheck} onClick={handleMarkAllRead}>
              Mark all as read
            </Button>
          ) : null
        }
      />

      {/* 2. Filter Navigation Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          overflowX: 'auto',
          paddingBottom: '12px',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        {[
          { id: 'ALL', label: `All Alerts (${notifications.length})` },
          { id: 'UNREAD', label: `Unread (${unreadCount})` },
          { id: 'BUDGETS', label: 'Budgets' },
          { id: 'BILLS', label: 'Bills & Recurring' },
          { id: 'GOALS', label: 'Savings' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
              border: 'none',
              background: activeFilter === tab.id ? 'var(--accent)' : 'transparent',
              color: activeFilter === tab.id ? '#FFFFFF' : 'var(--fg-muted)',
            }}
            className={activeFilter === tab.id ? 'shadow-xs font-bold' : 'hover:text-[var(--fg)] hover:bg-[var(--bg-surface)]'}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Notifications List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ height: '90px', borderRadius: '16px', background: 'var(--bg-secondary)' }} className="animate-pulse" />
          ))}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications found"
          description="You're all caught up! Real-time alerts will trigger automatically when finances need attention."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredNotifications.map((n) => {
            const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.SYSTEM;
            const Icon = config.icon;

            return (
              <div
                key={n.id}
                style={{
                  padding: '20px 24px',
                  borderRadius: '16px',
                  border: '1px solid',
                  borderColor: !n.isRead ? 'var(--border)' : 'var(--border-subtle)',
                  background: !n.isRead ? 'var(--bg-secondary)' : 'rgba(19, 19, 22, 0.65)',
                  boxShadow: !n.isRead ? '0 4px 16px rgba(0, 0, 0, 0.4)' : 'none',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '18px',
                  transition: 'all 0.15s ease',
                }}
                className={!n.isRead ? 'hover:border-[var(--accent)]' : 'opacity-80 hover:opacity-100'}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', minWidth: 0, flex: 1 }}>
                  {/* Category Icon */}
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: config.bg,
                      color: config.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  >
                    <Icon size={20} />
                  </div>

                  {/* Notification Body */}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--fg)' }}>{n.title}</span>
                      <span
                        style={{
                          fontSize: '10.5px',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: config.bg,
                          color: config.color,
                        }}
                      >
                        {config.label}
                      </span>
                      {!n.isRead && (
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
                      )}
                    </div>

                    <p style={{ fontSize: '13.5px', color: 'var(--fg-secondary)', marginTop: '6px', lineHeight: 1.5, margin: '6px 0 0 0' }}>
                      {n.message}
                    </p>

                    <div style={{ fontSize: '12px', color: 'var(--fg-muted)', marginTop: '8px', fontFamily: 'monospace' }}>
                      {fmtDateTime(n.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginTop: '2px' }}>
                  {!n.isRead && (
                    <button
                      type="button"
                      onClick={() => handleMarkRead(n.id)}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border)',
                        color: 'var(--fg-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      className="hover:text-emerald-500 hover:border-emerald-500/30"
                      title="Mark as read"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(n.id)}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      color: 'var(--fg-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    className="hover:text-red-500 hover:border-red-500/30"
                    title="Delete alert"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
