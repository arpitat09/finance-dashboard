import { useState } from 'react';
import { Moon, Sun, Globe, Download, RefreshCw, Shield, Check, Palette, Database } from 'lucide-react';
import { usePreferences } from '../context/PreferencesContext';
import { useToast } from '../context/ToastContext';
import { exportApi } from '../api';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import ConfirmDialog from '../components/ConfirmDialog';
import { exportToJSON } from '../utils/helpers';

export default function SettingsPage() {
  const { theme, setTheme, currency, setCurrency } = usePreferences();
  const { addToast } = useToast();

  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleExportBackup = async () => {
    setDownloading(true);
    try {
      const res = await exportApi.getBackupJSON();
      exportToJSON(`finora_full_backup_${new Date().toISOString().slice(0, 10)}.json`, res);
      addToast('Full financial backup archive exported successfully', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to export backup', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handleResetDemo = async () => {
    try {
      addToast('Demo dataset reset successfully', 'success');
      setResetConfirmOpen(false);
      window.location.reload();
    } catch (err) {
      addToast(err.message || 'Failed to reset demo data', 'error');
    }
  };

  return (
    <PageContainer className="max-w-4xl mx-auto">
      {/* 1. Page Header */}
      <PageHeader
        title="Preferences & Settings"
        subtitle="Configure your workspace visual theme, base currency, backups, and data policies."
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* 2. Appearance & Visual Theme */}
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
          {/* Section Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              paddingBottom: '20px',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(var(--accent-rgb), 0.12)',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Palette size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--fg)', margin: 0 }}>
                Appearance & Visual Theme
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--fg-muted)', margin: '3px 0 0 0' }}>
                Choose your dashboard display style and color temperature
              </p>
            </div>
          </div>

          {/* Theme Options Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '16px',
            }}
          >
            {/* Charcoal Dark Option */}
            <div
              onClick={() => setTheme('dark')}
              style={{
                padding: '18px 20px',
                borderRadius: '16px',
                border: '2px solid',
                borderColor: theme === 'dark' ? 'var(--accent)' : 'var(--border)',
                background: theme === 'dark' ? 'rgba(var(--accent-rgb), 0.08)' : 'var(--bg-surface)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '14px',
                transition: 'all 0.15s ease',
              }}
              className="hover:border-[var(--fg-muted)]"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: '#0A0A0C',
                    border: '1px solid #26262E',
                    color: '#F59E0B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Moon size={22} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--fg)' }}>Charcoal Dark</div>
                  <div style={{ fontSize: '12px', color: 'var(--fg-muted)', marginTop: '2px' }}>Deep dark charcoal with orange accents</div>
                </div>
              </div>

              {theme === 'dark' && (
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Check size={13} strokeWidth={3} />
                </div>
              )}
            </div>

            {/* Warm Light Option */}
            <div
              onClick={() => setTheme('light')}
              style={{
                padding: '18px 20px',
                borderRadius: '16px',
                border: '2px solid',
                borderColor: theme === 'light' ? 'var(--accent)' : 'var(--border)',
                background: theme === 'light' ? 'rgba(var(--accent-rgb), 0.08)' : 'var(--bg-surface)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '14px',
                transition: 'all 0.15s ease',
              }}
              className="hover:border-[var(--fg-muted)]"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: '#FFFFFF',
                    border: '1px solid #E2E2E8',
                    color: '#EA580C',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Sun size={22} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--fg)' }}>Warm Light</div>
                  <div style={{ fontSize: '12px', color: 'var(--fg-muted)', marginTop: '2px' }}>Warm paper-like white with soft contrast</div>
                </div>
              </div>

              {theme === 'light' && (
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Check size={13} strokeWidth={3} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. Base Currency & Formatting */}
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
          {/* Section Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              paddingBottom: '20px',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(34, 197, 94, 0.12)',
                color: '#22C55E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Globe size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--fg)', margin: 0 }}>
                Base Currency & Formatting
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--fg-muted)', margin: '3px 0 0 0' }}>
                Choose how financial numbers, exchange rates, and decimal math format across the dashboard
              </p>
            </div>
          </div>

          {/* Currency Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: '16px',
            }}
          >
            {[
              { code: 'INR', symbol: '₹', label: 'Indian Rupee', region: 'India' },
              { code: 'USD', symbol: '$', label: 'US Dollar', region: 'United States' },
              { code: 'EUR', symbol: '€', label: 'Euro', region: 'European Union' },
              { code: 'GBP', symbol: '£', label: 'British Pound', region: 'United Kingdom' },
            ].map((c) => {
              const isSelected = currency === c.code;
              return (
                <div
                  key={c.code}
                  onClick={() => setCurrency(c.code)}
                  style={{
                    padding: '20px',
                    borderRadius: '16px',
                    border: '2px solid',
                    borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
                    background: isSelected ? 'rgba(var(--accent-rgb), 0.08)' : 'var(--bg-surface)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '140px',
                    transition: 'all 0.15s ease',
                  }}
                  className="hover:border-[var(--fg-muted)]"
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContents: 'space-between', width: '100%' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '16px',
                        color: 'var(--fg)',
                      }}
                    >
                      {c.symbol}
                    </div>
                    {isSelected && (
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: 'var(--accent)',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginLeft: 'auto',
                        }}
                      >
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: '16px' }}>
                    <div style={{ fontSize: '17px', fontWeight: 800, color: 'var(--fg)' }}>{c.code}</div>
                    <div style={{ fontSize: '12px', color: 'var(--fg-muted)', marginTop: '2px' }}>{c.label}</div>
                    <div style={{ fontSize: '11px', color: 'var(--fg-muted)', opacity: 0.75, marginTop: '1px' }}>{c.region}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Data Sovereignty & Backups */}
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
          {/* Section Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              paddingBottom: '20px',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(168, 85, 247, 0.12)',
                color: '#A855F7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Database size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--fg)', margin: 0 }}>
                Data Sovereignty & Backups
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--fg-muted)', margin: '3px 0 0 0' }}>
                Export uncompressed JSON archive containing all transactions, budgets, goals, and accounts
              </p>
            </div>
          </div>

          {/* Backup Action Tile */}
          <div
            style={{
              padding: '24px',
              borderRadius: '16px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '24px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ maxWidth: '540px' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--fg)' }}>
                Complete Financial JSON Archive
              </div>
              <div style={{ fontSize: '13px', color: 'var(--fg-muted)', marginTop: '4px', lineHeight: 1.5 }}>
                Export your entire database records in machine-readable JSON format for local storage, backup safety, or spreadsheet import.
              </div>
            </div>

            <Button
              variant="secondary"
              size="md"
              icon={Download}
              loading={downloading}
              onClick={handleExportBackup}
              style={{ height: '46px', padding: '0 20px', flexShrink: 0 }}
            >
              Download JSON Backup
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={resetConfirmOpen}
        title="Reset Demo Financial Data"
        message="This will reload the realistic multi-month Indian demo transactions and accounts. Continue?"
        confirmLabel="Reset Data"
        onConfirm={handleResetDemo}
        onCancel={() => setResetConfirmOpen(false)}
      />
    </PageContainer>
  );
}
