import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Target,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import { dashboardApi, transactionApi, budgetApi, goalApi, recurringApi } from '../api';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import SummaryCards from '../components/SummaryCards';
import Charts from '../components/Charts';
import FinancialHealthModal from '../components/FinancialHealthModal';
import TransactionModal from '../components/TransactionModal';
import TransactionDetailDrawer from '../components/TransactionDetailDrawer';
import ConfirmDialog from '../components/ConfirmDialog';
import { StatCardSkeleton, ChartSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { fmtDate, CATEGORY_COLORS } from '../utils/helpers';
import { useToast } from '../context/ToastContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const { fmt } = usePreferences();
  const { addToast } = useToast();

  const [period, setPeriod] = useState('this-month');
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [breakdown, setBreakdown] = useState(null);
  const [healthData, setHealthData] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [recurring, setRecurring] = useState([]);
  const [insights, setInsights] = useState([]);

  // Modals & Drawers
  const [healthModalOpen, setHealthModalOpen] = useState(false);
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [detailTx, setDetailTx] = useState(null);
  const [deleteConfirmTx, setDeleteConfirmTx] = useState(null);

  const loadDashboard = useCallback(async () => {
    try {
      const [sumRes, breakRes, healthRes, txRes, bgRes, glRes, rcRes, insRes] = await Promise.all([
        dashboardApi.getSummary(period),
        dashboardApi.getCategoryBreakdown(period),
        dashboardApi.getHealthScore(),
        transactionApi.list({ limit: 5, sortBy: 'date', sortOrder: 'desc' }),
        budgetApi.list(),
        goalApi.list(),
        recurringApi.list(),
        dashboardApi.getInsights(),
      ]);

      setSummary(sumRes.data);
      setBreakdown(breakRes.data);
      setHealthData(healthRes.data);
      setRecentTransactions(txRes.data || []);
      setBudgets(bgRes.data || []);
      setGoals(glRes.data?.goals || []);
      setRecurring(rcRes.data?.recurring || []);
      setInsights(insRes.data || []);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      addToast(err.message || 'Error loading dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  }, [period, addToast]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const getTimeOfDayGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <PageContainer className="max-w-6xl mx-auto">
      {/* 1. Page Header */}
      <PageHeader
        title={`${getTimeOfDayGreeting()}, ${user?.name?.split(' ')[0] || 'Member'} 👋`}
        subtitle="Here is your financial portfolio health, recent transactions, and cashflow trajectory."
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Period Filter Dropdown Pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px',
                borderRadius: '12px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
              }}
            >
              {[
                { key: 'this-month', label: 'This Month' },
                { key: 'last-month', label: 'Last Month' },
                { key: '3m', label: '3 Months' },
                { key: 'this-year', label: 'This Year' },
              ].map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setPeriod(p.key)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    border: 'none',
                    background: period === p.key ? 'var(--accent)' : 'transparent',
                    color: period === p.key ? '#FFFFFF' : 'var(--fg-muted)',
                  }}
                  className={period === p.key ? 'font-bold shadow-xs' : 'hover:text-[var(--fg)]'}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={() => {
                setEditingTx(null);
                setTxModalOpen(true);
              }}
              style={{ height: '42px', padding: '0 18px' }}
            >
              Add Transaction
            </Button>
          </div>
        }
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* 2. Top Summary KPI Cards */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
        ) : (
          <SummaryCards summary={summary} />
        )}

        {/* 3. Health Score + Smart Insights */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Financial Health Score Card */}
          <div
            onClick={() => setHealthModalOpen(true)}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              padding: '24px 28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer',
              gap: '16px',
              boxShadow: 'var(--card-shadow)',
            }}
            className="hover:border-[var(--accent)] transition-all"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} style={{ color: '#22C55E' }} />
                Financial Health Rating
              </span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Details <ArrowRight size={13} />
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', margin: '4px 0' }}>
              <span style={{ fontSize: '38px', fontWeight: 800, color: '#22C55E', fontFamily: 'monospace' }}>
                {healthData?.score || 0}
              </span>
              <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--fg-muted)' }}>/ 100</span>
              <span
                style={{
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 700,
                  background: 'rgba(34, 197, 94, 0.15)',
                  color: '#22C55E',
                  marginLeft: '4px',
                }}
              >
                {healthData?.status || 'Good'}
              </span>
            </div>

            <p style={{ fontSize: '12.5px', color: 'var(--fg-muted)', lineHeight: 1.5, margin: 0 }}>
              {healthData?.summaryText || 'Strong savings habit and disciplined budget tracking across accounts.'}
            </p>
          </div>

          {/* Smart Insights Card */}
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              padding: '24px 28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '16px',
              boxShadow: 'var(--card-shadow)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={17} style={{ color: 'var(--accent)' }} />
                Smart Financial Insights
              </span>
              <Link to="/analytics" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                Deep Analytics <ArrowRight size={13} />
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              {insights.slice(0, 2).map((ins) => (
                <div
                  key={ins.id}
                  style={{
                    padding: '16px',
                    borderRadius: '14px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        padding: '2px 7px',
                        borderRadius: '6px',
                        background: 'rgba(var(--accent-rgb), 0.12)',
                        color: 'var(--accent)',
                      }}
                    >
                      {ins.type}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent)', fontFamily: 'monospace' }}>
                      {ins.value}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--fg)', margin: '4px 0 2px 0' }}>{ins.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--fg-muted)', lineHeight: 1.45 }}>{ins.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Financial Trend + Spending Breakdown Charts */}
        {loading ? <ChartSkeleton /> : <Charts breakdownData={breakdown} />}

        {/* 5. Lower Section: Recent Activity + Budgets/Goals */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', alignItems: 'start' }}>
          {/* Recent Activity List */}
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              padding: '24px 28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              boxShadow: 'var(--card-shadow)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--fg)', margin: 0 }}>
                  Recent Transactions
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--fg-muted)', margin: '2px 0 0 0' }}>
                  Latest inflows and expenditures
                </p>
              </div>
              <Link to="/transactions" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                View All <ArrowRight size={13} />
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentTransactions.length === 0 ? (
                <EmptyState
                  title="No transactions yet"
                  description="Add your first transaction to start monitoring cash flow."
                  actionLabel="Add Transaction"
                  onAction={() => { setEditingTx(null); setTxModalOpen(true); }}
                />
              ) : (
                recentTransactions.map((t) => {
                  const color = CATEGORY_COLORS[t.category?.name] || '#F97316';
                  const isIncome = t.type === 'INCOME';
                  return (
                    <div
                      key={t.id}
                      onClick={() => setDetailTx(t)}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '14px',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      className="hover:border-[var(--accent)]"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            background: `${color}18`,
                            color: color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            flexShrink: 0,
                          }}
                        >
                          {isIncome ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {t.description}
                          </div>
                          <div style={{ fontSize: '11.5px', color: 'var(--fg-muted)', marginTop: '2px' }}>
                            {t.category?.name} &middot; {fmtDate(t.date)}
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: 800,
                          fontFamily: 'monospace',
                          whiteSpace: 'nowrap',
                          color: isIncome ? '#22C55E' : '#EF4444',
                        }}
                      >
                        {isIncome ? '+' : '-'}{fmt(t.amount)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Budgets & Goals Widgets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Active Budgets Mini */}
            <div
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '20px',
                padding: '24px 28px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                boxShadow: 'var(--card-shadow)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '1px solid var(--border-subtle)' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--fg)', margin: 0 }}>Budget Status</h3>
                  <p style={{ fontSize: '12px', color: 'var(--fg-muted)', margin: '2px 0 0 0' }}>Monthly allocation</p>
                </div>
                <Link to="/budgets" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)', textDecoration: 'none' }}>
                  Manage
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {budgets.slice(0, 3).map((b) => {
                  const spent = b.spent || 0;
                  const limit = b.amount || 1;
                  const pct = Math.min(100, Math.round((spent / limit) * 100));
                  const isOver = spent > limit;
                  return (
                    <div
                      key={b.id}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                        <span style={{ fontWeight: 700, color: 'var(--fg)' }}>{b.category?.name || 'Category'}</span>
                        <span style={{ color: 'var(--fg-muted)', fontFamily: 'monospace' }}>
                          {fmt(spent)} / {fmt(limit)}
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '6px', borderRadius: '6px', background: 'var(--bg-secondary)', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            borderRadius: '6px',
                            background: isOver ? '#EF4444' : pct > 80 ? '#F59E0B' : '#22C55E',
                            width: `${pct}%`,
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Savings Goals Mini */}
            <div
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '20px',
                padding: '24px 28px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                boxShadow: 'var(--card-shadow)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '1px solid var(--border-subtle)' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--fg)', margin: 0 }}>Savings Goals</h3>
                  <p style={{ fontSize: '12px', color: 'var(--fg-muted)', margin: '2px 0 0 0' }}>Target wealth milestones</p>
                </div>
                <Link to="/goals" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)', textDecoration: 'none' }}>
                  View Goals
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {goals.length === 0 ? (
                  <div style={{ fontSize: '12px', color: 'var(--fg-muted)', padding: '12px 0' }}>No active savings goals.</div>
                ) : (
                  goals.slice(0, 2).map((g) => {
                    const current = g.currentAmount || 0;
                    const target = g.targetAmount || 1;
                    const pct = Math.min(100, Math.round((current / target) * 100));
                    return (
                      <div
                        key={g.id}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '12px',
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                          <span style={{ fontWeight: 700, color: 'var(--fg)' }}>{g.name}</span>
                          <span style={{ color: 'var(--accent)', fontFamily: 'monospace', fontWeight: 700 }}>{pct}%</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', borderRadius: '6px', background: 'var(--bg-secondary)', overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              borderRadius: '6px',
                              background: 'linear-gradient(90deg, #F97316 0%, #F59E0B 100%)',
                              width: `${pct}%`,
                              transition: 'width 0.3s ease',
                            }}
                          />
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--fg-muted)', fontFamily: 'monospace' }}>
                          {fmt(current)} saved of {fmt(target)}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals & Drawers */}
      <FinancialHealthModal
        isOpen={healthModalOpen}
        onClose={() => setHealthModalOpen(false)}
        healthData={healthData}
      />

      <TransactionModal
        isOpen={txModalOpen}
        onClose={() => { setTxModalOpen(false); setEditingTx(null); }}
        transaction={editingTx}
        onSaved={loadDashboard}
      />

      <TransactionDetailDrawer
        isOpen={!!detailTx}
        onClose={() => setDetailTx(null)}
        transaction={detailTx}
        onEdit={(tx) => {
          setDetailTx(null);
          setEditingTx(tx);
          setTxModalOpen(true);
        }}
        onDelete={(tx) => {
          setDetailTx(null);
          setDeleteConfirmTx(tx);
        }}
      />

      <ConfirmDialog
        isOpen={!!deleteConfirmTx}
        title="Delete Transaction"
        message={`Are you sure you want to delete this transaction for ${fmt(deleteConfirmTx?.amount || 0)}?`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={async () => {
          if (!deleteConfirmTx) return;
          try {
            await transactionApi.delete(deleteConfirmTx.id);
            addToast('Transaction deleted', 'success');
            setDeleteConfirmTx(null);
            loadDashboard();
          } catch (err) {
            addToast(err.message || 'Failed to delete transaction', 'error');
          }
        }}
        onCancel={() => setDeleteConfirmTx(null)}
      />
    </PageContainer>
  );
}
