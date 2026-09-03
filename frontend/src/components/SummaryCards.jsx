import { Wallet, ArrowDownRight, ArrowUpRight, PiggyBank } from 'lucide-react';
import { usePreferences } from '../context/PreferencesContext';

export default function SummaryCards({ summary }) {
  const { fmt } = usePreferences();

  if (!summary) return null;

  const {
    totalBalance = 0,
    income = 0,
    expenses = 0,
    savings = 0,
    savingsRate = 0,
    incomeChange = 0,
    expenseChange = 0,
  } = summary;

  const cards = [
    {
      id: 'balance',
      label: 'Total Net Balance',
      value: fmt(totalBalance),
      accent: 'var(--accent)',
      icon: Wallet,
      badge: `${savingsRate}% Rate`,
      badgeColor: savingsRate >= 20 ? '#22C55E' : 'var(--accent)',
      badgeBg: savingsRate >= 20 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(var(--accent-rgb), 0.15)',
      subText: 'All accounts & assets',
    },
    {
      id: 'income',
      label: 'Monthly Income',
      value: fmt(income),
      accent: '#22C55E',
      icon: ArrowUpRight,
      badge: `${incomeChange >= 0 ? '+' : ''}${incomeChange}% MoM`,
      badgeColor: incomeChange >= 0 ? '#22C55E' : 'var(--fg-muted)',
      badgeBg: incomeChange >= 0 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.08)',
      subText: 'Salaries & dividends',
    },
    {
      id: 'expenses',
      label: 'Monthly Expenses',
      value: fmt(expenses),
      accent: '#EF4444',
      icon: ArrowDownRight,
      badge: `${expenseChange >= 0 ? '+' : ''}${expenseChange}% MoM`,
      badgeColor: expenseChange <= 0 ? '#22C55E' : '#EF4444',
      badgeBg: expenseChange <= 0 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
      subText: 'Outflows & bills',
    },
    {
      id: 'savings',
      label: 'Net Monthly Savings',
      value: fmt(savings),
      accent: '#06B6D4',
      icon: PiggyBank,
      badge: savingsRate >= 20 ? 'Healthy' : 'Caution',
      badgeColor: savingsRate >= 20 ? '#22C55E' : '#F59E0B',
      badgeBg: savingsRate >= 20 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
      subText: `${savingsRate}% retained`,
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
      }}
    >
      {cards.map((c) => (
        <div
          key={c.id}
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '24px 26px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '165px',
            gap: '16px',
            boxShadow: 'var(--card-shadow)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top subtle accent stripe */}
          <div
            style={{
              height: '3px',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              background: `linear-gradient(90deg, ${c.accent}, transparent)`,
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-muted)' }}>
              {c.label}
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(var(--accent-rgb), 0.12)',
                color: c.accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <c.icon size={18} />
            </div>
          </div>

          <div
            style={{
              fontSize: '26px',
              fontWeight: 800,
              fontFamily: 'monospace',
              color: 'var(--fg)',
              margin: '4px 0',
            }}
          >
            {c.value}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              paddingTop: '12px',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <span
              style={{
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                background: c.badgeBg,
                color: c.badgeColor,
                flexShrink: 0,
              }}
            >
              {c.badge}
            </span>
            <span
              style={{
                fontSize: '11.5px',
                color: 'var(--fg-muted)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                textAlign: 'right',
              }}
            >
              {c.subText}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}