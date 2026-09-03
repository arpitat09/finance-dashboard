import { useState, useEffect } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { usePreferences } from '../context/PreferencesContext';
import { dashboardApi } from '../api';
import { CATEGORY_COLORS } from '../utils/helpers';
import Card from './Card';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend
);

export default function Charts({ breakdownData, onSelectCategory }) {
  const { isDark, fmt } = usePreferences();
  const [timeframe, setTimeframe] = useState('30D');
  const [trendData, setTrendData] = useState([]);
  const [loadingTrend, setLoadingTrend] = useState(false);

  useEffect(() => {
    async function loadTrend() {
      setLoadingTrend(true);
      try {
        const res = await dashboardApi.getCashFlow(timeframe);
        setTrendData(res.data?.trend || []);
      } catch (err) {
        console.error('Failed to load cash flow trend:', err);
      } finally {
        setLoadingTrend(false);
      }
    }
    loadTrend();
  }, [timeframe]);

  const gridColor = isDark ? '#26262E' : '#E2E2E8';
  const tickColor = isDark ? '#9CA3AF' : '#6B7280';
  const tooltipBg = isDark ? '#131316' : '#FFFFFF';

  // 1. Trend Line Chart Data
  const lineLabels = trendData.map((d) => d.date);
  const lineIncomes = trendData.map((d) => d.income);
  const lineExpenses = trendData.map((d) => d.expense);
  const lineNet = trendData.map((d) => d.net);

  const lineChartData = {
    labels: lineLabels,
    datasets: [
      {
        label: 'Income',
        data: lineIncomes,
        borderColor: '#22C55E',
        backgroundColor: 'rgba(34, 197, 94, 0.08)',
        fill: true,
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 5,
      },
      {
        label: 'Expenses',
        data: lineExpenses,
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        fill: true,
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 5,
      },
      {
        label: 'Net Savings',
        data: lineNet,
        borderColor: 'var(--accent)',
        borderDash: [4, 4],
        fill: false,
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 5,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          color: tickColor,
          font: { family: 'Inter', size: 12, weight: '500' },
          boxWidth: 10,
          boxHeight: 10,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: isDark ? '#F9FAFB' : '#111827',
        bodyColor: isDark ? '#D1D5DB' : '#374151',
        borderColor: gridColor,
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ${fmt(context.parsed.y)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'transparent' },
        ticks: { color: tickColor, font: { family: 'Inter', size: 11 } },
      },
      y: {
        grid: { color: gridColor },
        ticks: {
          color: tickColor,
          font: { family: 'IBM Plex Mono', size: 11 },
          callback: (val) => fmt(val),
        },
      },
    },
  };

  // 2. Spending Breakdown Donut Data
  const categories = breakdownData?.categories || [];
  const totalExpense = breakdownData?.totalExpense || 0;

  const doughnutData = {
    labels: categories.map((c) => c.name),
    datasets: [
      {
        data: categories.map((c) => c.amount),
        backgroundColor: categories.map(
          (c) => CATEGORY_COLORS[c.name] || '#F97316'
        ),
        borderWidth: 2,
        borderColor: isDark ? '#131316' : '#FFFFFF',
        hoverOffset: 6,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: isDark ? '#F9FAFB' : '#111827',
        bodyColor: isDark ? '#D1D5DB' : '#374151',
        borderColor: gridColor,
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context) => {
            const cat = categories[context.dataIndex];
            return ` ${fmt(cat.amount)} (${cat.percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
      {/* Financial Trend Line Chart (65% width on desktop) */}
      <Card className="xl:col-span-8 p-8 flex flex-col justify-between space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div>
            <h3 className="text-base sm:text-lg font-bold font-heading text-[var(--fg)]">
              Cash Flow Trajectory
            </h3>
            <p className="text-xs sm:text-sm text-[var(--fg-muted)] mt-0.5">
              Income, expenditures, and net savings trajectory
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-[var(--bg-surface)] border text-xs" style={{ borderColor: 'var(--border)' }}>
            {['7D', '30D', '3M', '6M', '1Y'].map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  timeframe === tf
                    ? 'bg-[var(--accent)] text-white shadow-xs font-bold'
                    : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        <div className="h-72 sm:h-80 w-full relative pt-2">
          {loadingTrend ? (
            <div className="h-full flex items-center justify-center text-xs text-[var(--fg-muted)] animate-pulse">
              Updating chart...
            </div>
          ) : lineLabels.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-[var(--fg-muted)]">
              No cash flow records for this period.
            </div>
          ) : (
            <Line key={`${isDark ? 'dark' : 'light'}-${timeframe}`} data={lineChartData} options={lineOptions} />
          )}
        </div>
      </Card>

      {/* Spending Breakdown Donut Chart (35% width on desktop) */}
      <Card className="xl:col-span-4 p-8 flex flex-col justify-between space-y-6">
        <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div>
            <h3 className="text-base sm:text-lg font-bold font-heading text-[var(--fg)]">
              Spending Breakdown
            </h3>
            <p className="text-xs sm:text-sm text-[var(--fg-muted)] mt-0.5">
              Where your money goes
            </p>
          </div>
          <span className="text-base font-mono-num font-extrabold text-[var(--fg)]">
            {fmt(totalExpense)}
          </span>
        </div>

        <div className="h-56 sm:h-60 flex items-center justify-center relative my-2">
          {categories.length === 0 ? (
            <div className="text-xs text-[var(--fg-muted)]">No expenses recorded for this period.</div>
          ) : (
            <>
              <Doughnut key={isDark ? 'dark-d' : 'light-d'} data={doughnutData} options={doughnutOptions} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs uppercase font-bold tracking-wider text-[var(--fg-muted)]">Total Outflow</span>
                <span className="text-lg font-extrabold font-heading font-mono-num text-[var(--fg)] mt-1">
                  {fmt(totalExpense)}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Category Legend Pills */}
        <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
          {categories.slice(0, 4).map((c) => (
            <div
              key={c.id || c.name}
              onClick={() => onSelectCategory && onSelectCategory(c.name)}
              className="flex items-center justify-between text-xs p-2.5 rounded-xl hover:bg-[var(--bg-surface)] cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ background: CATEGORY_COLORS[c.name] || '#F97316' }}
                />
                <span className="text-[var(--fg-secondary)] font-medium truncate">{c.name}</span>
              </div>
              <div className="font-mono-num font-semibold text-[var(--fg)] flex-shrink-0">
                {fmt(c.amount)} ({c.percentage}%)
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}