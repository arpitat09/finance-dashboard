import { useState, useEffect, useCallback } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  BarChart3,
  TrendingUp,
  PiggyBank,
  Calendar,
  Wallet,
  Sparkles,
  Trophy,
  CreditCard,
  Layers,
} from 'lucide-react';
import { analyticsApi, dashboardApi } from '../api';
import { usePreferences } from '../context/PreferencesContext';
import { useToast } from '../context/ToastContext';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import { ChartSkeleton } from '../components/LoadingSkeleton';

export default function AnalyticsPage() {
  const { fmt, isDark } = usePreferences();
  const { addToast } = useToast();

  const [analytics, setAnalytics] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = useCallback(async () => {
    try {
      const [anRes, inRes] = await Promise.all([
        analyticsApi.getOverview(),
        dashboardApi.getInsights(),
      ]);
      setAnalytics(anRes.data || null);
      setInsights(inRes.data || []);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      addToast(err.message || 'Error loading analytics', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const gridColor = isDark ? '#26262E' : '#E5E1D8';
  const tickColor = isDark ? '#9CA3AF' : '#736E68';
  const tooltipBg = isDark ? '#141416' : '#FFFFFF';

  // Monthly Trends Bar Data
  const monthlyTrends = analytics?.monthlyTrends || [];
  const barData = {
    labels: monthlyTrends.map((m) => m.month),
    datasets: [
      {
        label: 'Income',
        data: monthlyTrends.map((m) => m.income),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderRadius: 6,
        barPercentage: 0.6,
      },
      {
        label: 'Expenses',
        data: monthlyTrends.map((m) => m.expense),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderRadius: 6,
        barPercentage: 0.6,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: { color: tickColor, font: { size: 12, weight: '600' }, boxWidth: 12, padding: 16 },
      },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: isDark ? '#F5F5F4' : '#181615',
        bodyColor: tickColor,
        borderColor: gridColor,
        borderWidth: 1,
        padding: 12,
        cornerRadius: 10,
        callbacks: {
          label: (c) => ` ${c.dataset.label}: ${fmt(c.parsed.y)}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: tickColor, font: { size: 11 } },
        grid: { display: false },
        border: { display: false },
      },
      y: {
        ticks: {
          color: tickColor,
          font: { size: 11 },
          callback: (v) => fmt(v),
        },
        grid: { color: gridColor },
        border: { display: false },
      },
    },
  };

  const stats = analytics?.statistics || {};
  const heatmap = analytics?.dayHeatmap || [];

  return (
    <PageContainer className="max-w-5xl mx-auto">
      {/* 1. Page Header */}
      <PageHeader
        title="Financial Analytics & Intelligence"
        subtitle="Historical multi-month comparisons, spending behavior patterns, and algorithmic insights."
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* 2. Top Analytics Metrics (4 Columns) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
          }}
        >
          {/* Avg Daily Spend */}
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              padding: '24px 28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '135px',
              boxShadow: 'var(--card-shadow)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-muted)' }}>
                Avg Daily Spend
              </span>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(249, 115, 22, 0.12)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={18} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--fg)', fontFamily: 'monospace', marginTop: '10px' }}>
                {fmt(stats.avgDailySpend || 0)}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--fg-muted)', marginTop: '4px' }}>Across recorded active days</div>
            </div>
          </div>

          {/* Largest Expense */}
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              padding: '24px 28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '135px',
              boxShadow: 'var(--card-shadow)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-muted)' }}>
                Largest Single Expense
              </span>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.12)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CreditCard size={18} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#EF4444', fontFamily: 'monospace', marginTop: '10px' }}>
                {fmt(stats.largestExpense?.amount || 0)}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--fg-muted)', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {stats.largestExpense?.description || 'None'}
              </div>
            </div>
          </div>

          {/* Total Transactions */}
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              padding: '24px 28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '135px',
              boxShadow: 'var(--card-shadow)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-muted)' }}>
                Total Transactions
              </span>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.12)', color: '#06B6D4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarChart3 size={18} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--fg)', fontFamily: 'monospace', marginTop: '10px' }}>
                {stats.totalTransactions || 0}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--fg-muted)', marginTop: '4px' }}>Ledger entries tracked</div>
            </div>
          </div>

          {/* Net Savings Rate */}
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              padding: '24px 28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '135px',
              boxShadow: 'var(--card-shadow)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-muted)' }}>
                Net Savings Rate
              </span>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.12)', color: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PiggyBank size={18} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#22C55E', fontFamily: 'monospace', marginTop: '10px' }}>
                {stats.savingsRate || 0}%
              </div>
              <div style={{ fontSize: '12px', color: '#22C55E', fontWeight: 600, marginTop: '4px' }}>Overall retention</div>
            </div>
          </div>
        </div>

        {/* 3. Monthly Comparison Bar Chart */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '28px 32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--fg)', margin: 0 }}>
              Multi-Month Income vs Expenditure
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--fg-muted)', margin: '3px 0 0 0' }}>
              Historical performance across the last 6 calendar months
            </p>
          </div>

          <div style={{ height: '280px', width: '100%', paddingTop: '8px' }}>
            {loading ? (
              <ChartSkeleton />
            ) : (
              <Bar data={barData} options={barOptions} />
            )}
          </div>
        </div>

        {/* 4. Spending Heatmap by Day of Week */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '28px 32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          {/* Header */}
          <div style={{ paddingBottom: '18px', borderBottom: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--fg)', margin: 0 }}>
              Day-of-Week Spending Distribution
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--fg-muted)', margin: '3px 0 0 0' }}>
              Identify which days of the week incur the highest financial outflow
            </p>
          </div>

          {/* 7 Day Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
              gap: '12px',
            }}
          >
            {heatmap.map((day) => (
              <div
                key={day.day}
                style={{
                  padding: '16px 12px',
                  borderRadius: '14px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  gap: '6px',
                }}
              >
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {day.day}
                </span>
                <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--fg)', fontFamily: 'monospace' }}>
                  {fmt(day.amount)}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--fg-muted)', opacity: 0.8 }}>
                  {day.percentage}% of weekly
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Algorithmic Smart Insights Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={18} style={{ color: 'var(--accent)' }} />
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--fg)', margin: 0 }}>
              Algorithmic Financial Findings
            </h3>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '18px',
            }}
          >
            {insights.map((ins) => (
              <div
                key={ins.id}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: '18px',
                  padding: '22px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                  boxShadow: 'var(--card-shadow)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <span
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      padding: '3px 9px',
                      borderRadius: '8px',
                      background: 'rgba(var(--accent-rgb), 0.12)',
                      color: 'var(--accent)',
                      border: '1px solid rgba(var(--accent-rgb), 0.25)',
                    }}
                  >
                    {ins.type}
                  </span>
                  <span style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--accent)', fontFamily: 'monospace' }}>
                    {ins.value}
                  </span>
                </div>

                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--fg)', margin: '0 0 6px 0' }}>
                    {ins.title}
                  </h4>
                  <p style={{ fontSize: '12.5px', color: 'var(--fg-muted)', margin: 0, lineHeight: 1.55 }}>
                    {ins.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
