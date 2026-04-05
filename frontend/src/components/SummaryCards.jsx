import { useEffect, useState, useCallback, useMemo } from 'react';
import { useStore } from '../store/useStore';

export default function SummaryCards() {
  const { transactions, period } = useStore();
  const [displayed, setDisplayed] = useState({ income: '0.00', expense: '0.00', balance: '0.00', rate: '0.0' });

  const data = useMemo(() => {
    let txs = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
    if (period === '1m') { const c = new Date(); c.setMonth(c.getMonth() - 1); txs = txs.filter(t => t.date >= c.toISOString().slice(0, 10)); }
    else if (period === '3m') { const c = new Date(); c.setMonth(c.getMonth() - 3); txs = txs.filter(t => t.date >= c.toISOString().slice(0, 10)); }
    const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const balance = income - expense;
    const rate = income > 0 ? ((income - expense) / income * 100) : 0;
    const incCount = txs.filter(t => t.type === 'income').length;
    const expCount = txs.filter(t => t.type === 'expense').length;
    return { income, expense, balance, rate, incCount, expCount };
  }, [transactions, period]);

  const animateValues = useCallback((target) => {
    const duration = 700;
    const startTime = performance.now();
    function update(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const e = 1 - Math.pow(1 - progress, 3);
      setDisplayed({ income: (target.income * e).toFixed(2), expense: (target.expense * e).toFixed(2), balance: (target.balance * e).toFixed(2), rate: (target.rate * e).toFixed(1) });
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }, []);

  useEffect(() => { animateValues(data); }, [data, animateValues]);

  const cards = [
    { label: 'Total Balance', value: (data.balance < 0 ? '-' : '') + '$' + Math.abs(parseFloat(displayed.balance)).toLocaleString('en-US', {minimumFractionDigits:2}), accent: 'var(--accent)', sub: `${data.balance >= 0 ? '+' : ''}${data.rate.toFixed(1)}% savings`, subColor: data.balance >= 0 ? 'var(--success)' : 'var(--danger)' },
    { label: 'Total Income', value: '$' + parseFloat(displayed.income).toLocaleString('en-US', {minimumFractionDigits:2}), accent: 'var(--success)', sub: `${data.incCount} transactions`, subColor: 'var(--success)' },
    { label: 'Total Expenses', value: '$' + parseFloat(displayed.expense).toLocaleString('en-US', {minimumFractionDigits:2}), accent: 'var(--danger)', sub: `${data.expCount} transactions`, subColor: 'var(--danger)' },
    { label: 'Savings Rate', value: displayed.rate + '%', accent: '#06B6D4', sub: data.rate >= 20 ? 'Healthy' : data.rate >= 10 ? 'Moderate' : 'Needs attention', subColor: 'var(--fg-muted)' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      {cards.map((c, i) => (
        <div key={c.label} className="card overflow-hidden animate-in" style={{animationDelay: `${i * 0.05}s`}}>
          <div className="h-[3px] absolute top-0 left-0 right-0" style={{background: `linear-gradient(90deg, ${c.accent}, transparent)`}} />
          <div className="text-[12px] font-medium mb-1.5" style={{color: 'var(--fg-muted)'}}>{c.label}</div>
          <div className="text-lg lg:text-xl font-bold tracking-tight" style={{fontFamily: "'Space Grotesk'"}}>{c.value}</div>
          <div className="text-[11px] mt-1" style={{color: c.subColor}}>{c.sub}</div>
        </div>
      ))}
    </div>
  );
}