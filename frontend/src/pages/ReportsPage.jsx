import { useState, useEffect, useCallback } from 'react';
import { FileSpreadsheet, Download, Printer, ArrowUpRight, ArrowDownRight, Percent, Calendar } from 'lucide-react';
import { exportApi } from '../api';
import { usePreferences } from '../context/PreferencesContext';
import { useToast } from '../context/ToastContext';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { exportToCSV, exportToJSON } from '../utils/helpers';

export default function ReportsPage() {
  const { fmt } = usePreferences();
  const { addToast } = useToast();

  const [period, setPeriod] = useState('this-month');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await exportApi.getReport(period);
      setReport(res.data || null);
    } catch (err) {
      console.error('Failed to load report:', err);
      addToast(err.message || 'Error generating report', 'error');
    } finally {
      setLoading(false);
    }
  }, [period, addToast]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const handleDownloadCSV = () => {
    if (!report) return;
    const summary = report.summary || {};
    const categories = report.categoryBreakdown?.categories || [];

    const rows = [
      ['FINORA Financial Summary Report'],
      ['Period', report.period],
      ['Generated At', report.generatedAt],
      [''],
      ['KPI Metrics', 'Amount'],
      ['Total Income', summary.income],
      ['Total Expenses', summary.expenses],
      ['Net Savings', summary.savings],
      ['Savings Rate (%)', `${summary.savingsRate}%`],
      ['Total Net Worth', summary.totalBalance],
      [''],
      ['Category Breakdown', 'Amount', 'Percentage (%)'],
      ...categories.map((c) => [c.name, c.amount, `${c.percentage}%`]),
    ];

    exportToCSV(`finora_financial_report_${period}_${new Date().toISOString().slice(0, 10)}.csv`, rows);
    addToast('Financial report CSV downloaded', 'success');
  };

  const handleDownloadJSON = () => {
    if (!report) return;
    exportToJSON(`finora_financial_report_${period}_${new Date().toISOString().slice(0, 10)}.json`, report);
    addToast('Financial report JSON downloaded', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  const summary = report?.summary || {};
  const categories = report?.categoryBreakdown?.categories || [];

  return (
    <PageContainer className="max-w-5xl mx-auto">
      {/* 1. Page Header */}
      <PageHeader
        title="Financial Reports"
        subtitle="Generate and export consolidated financial statements, breakdowns, and summaries."
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Period Toggle Pill */}
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

            {/* Export Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Button variant="secondary" size="md" icon={Download} onClick={handleDownloadCSV} style={{ height: '42px', padding: '0 16px' }}>
                CSV
              </Button>
              <Button variant="secondary" size="md" icon={Download} onClick={handleDownloadJSON} style={{ height: '42px', padding: '0 16px' }}>
                JSON
              </Button>
              <Button variant="primary" size="md" icon={Printer} onClick={handlePrint} style={{ height: '42px', padding: '0 18px' }}>
                Print
              </Button>
            </div>
          </div>
        }
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* 2. Core Summary Metrics (4 Distinct Cards) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
          }}
        >
          {/* Total Inflow */}
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
                Total Inflow
              </span>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.12)', color: '#22C55E', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}>
                <ArrowUpRight size={18} style={{ margin: 'auto' }} />
              </div>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#22C55E', fontFamily: 'monospace', marginTop: '12px' }}>
              {fmt(summary.income || 0)}
            </div>
          </div>

          {/* Total Outflow */}
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
                Total Outflow
              </span>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.12)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}>
                <ArrowDownRight size={18} style={{ margin: 'auto' }} />
              </div>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#EF4444', fontFamily: 'monospace', marginTop: '12px' }}>
              {fmt(summary.expenses || 0)}
            </div>
          </div>

          {/* Net Savings */}
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
                Net Savings
              </span>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.12)', color: '#06B6D4', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#06B6D4', margin: 'auto' }} />
              </div>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#06B6D4', fontFamily: 'monospace', marginTop: '12px' }}>
              {fmt(summary.savings || 0)}
            </div>
          </div>

          {/* Retention Rate */}
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
                Retention Rate
              </span>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(var(--accent-rgb), 0.12)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}>
                <Percent size={18} style={{ margin: 'auto' }} />
              </div>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--fg)', fontFamily: 'monospace', marginTop: '12px' }}>
              {summary.savingsRate || 0}%
            </div>
          </div>
        </div>

        {/* 3. Main Printable Report Document Card */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '28px 32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '28px',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          {/* Statement Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '20px',
              borderBottom: '1px solid var(--border-subtle)',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: 'rgba(var(--accent-rgb), 0.12)',
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                <FileSpreadsheet size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--fg)', margin: 0 }}>
                  FINORA Consolidated Statement
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--fg-muted)', margin: '4px 0 0 0' }}>
                  Accounting period: <span style={{ fontWeight: 700, color: 'var(--fg)', textTransform: 'uppercase' }}>{period}</span> &middot; Generated {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>

            <Badge variant="success" size="md">
              Verified Financial Audit
            </Badge>
          </div>

          {/* Category Breakdown Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--fg)', margin: 0 }}>
              Expenditure Breakdown by Category
            </h4>
            <div
              style={{
                borderRadius: '16px',
                border: '1px solid var(--border)',
                overflow: 'hidden',
              }}
            >
              <table style={{ width: '100%', textAlign: 'left', fontSize: '14px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--fg-muted)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '16px 24px' }}>Category</th>
                    <th style={{ padding: '16px 24px', textAlign: 'right' }}>Outflow Amount</th>
                    <th style={{ padding: '16px 24px', textAlign: 'right' }}>Percentage</th>
                  </tr>
                </thead>
                <tbody style={{ background: 'var(--bg-secondary)' }}>
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{ padding: '48px 24px', textAlign: 'center', fontSize: '14px', color: 'var(--fg-muted)' }}>
                        No expense records recorded for this accounting period.
                      </td>
                    </tr>
                  ) : (
                    categories.map((c, idx) => (
                      <tr
                        key={c.id || c.name}
                        style={{
                          borderBottom: idx < categories.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                        }}
                        className="hover:bg-[var(--bg-surface)] transition-colors"
                      >
                        <td style={{ padding: '18px 24px', fontWeight: 600, color: 'var(--fg)' }}>{c.name}</td>
                        <td style={{ padding: '18px 24px', textAlign: 'right', fontWeight: 800, color: 'var(--fg)', fontFamily: 'monospace' }}>{fmt(c.amount)}</td>
                        <td style={{ padding: '18px 24px', textAlign: 'right', color: 'var(--fg-muted)', fontFamily: 'monospace' }}>{c.percentage}%</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
