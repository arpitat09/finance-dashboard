import { Trophy, TrendingUp, PiggyBank, Calendar, Wallet, Lightbulb } from 'lucide-react';
import { useStore } from '../store/useStore';
import { fmt, fmtMonth, CATEGORY_COLORS } from '../utils/helpers';

export default function Insights() {
  const { transactions, period } = useStore();
  let txs = [...transactions];
  if (period === '1m') { const c = new Date(); c.setMonth(c.getMonth() - 1); txs = txs.filter(t => t.date >= c.toISOString().slice(0,10)); }
  else if (period === '3m') { const c = new Date(); c.setMonth(c.getMonth() - 3); txs = txs.filter(t => t.date >= c.toISOString().slice(0,10)); }
  
  const expenses = txs.filter(t => t.type === 'expense');
  const income = txs.filter(t => t.type === 'income').reduce((s,t) => s+t.amount, 0);
  const expense = expenses.reduce((s,t) => s+t.amount, 0);
  const savingsRate = income > 0 ? ((income - expense) / income * 100) : 0;

  const catTotals = {}; expenses.forEach(t => { catTotals[t.category] = (catTotals[t.category] || 0) + t.amount; });
  const topCat = Object.entries(catTotals).sort((a,b) => b[1] - a[1])[0];
  const topCatPct = expense > 0 ? ((topCat[1] / expense) * 100).toFixed(1) : '0';

  const monthMap = {}; txs.forEach(t => { const m = t.date.slice(0,7); if(!monthMap[m]) monthMap[m]={i:0,e:0}; if(t.type==='income') monthMap[m].i+=t.amount; else monthMap[m].e+=t.amount; });
  const months = Object.keys(monthMap).sort();
  let mom = null;
  if (months.length >= 2) { const l = monthMap[months[months.length-1]].e; const p = monthMap[months[months.length-2]].e; mom = p > 0 ? (((l-p)/p)*100).toFixed(1) : null; }

  const days = months.length > 0 ? (new Date(months[months.length-1]+'-28').getTime() - new Date(months[0]+'-01').getTime()) / 86400000 : 1;
  const dailyAvg = expense / days;

  const incCats = {}; txs.filter(t=>t.type==='income').forEach(t => { incCats[t.category] = (incCats[t.category]||0)+t.amount; });
  const topInc = Object.entries(incCats).sort((a,b) => b[1]-a[1])[0];
  const topIncPct = income > 0 ? ((topInc[1]/income)*100).toFixed(0) : '0';

  const data = [
    { icon: Trophy, bg: 'var(--accent-light)', color: 'var(--accent)', title: 'Top Spending', value: topCat?.[0]||'N/A', desc: `${topCat ? fmt(topCat[1]) : '0'} spent — ${topCatPct}% of expenses` },
    { icon: TrendingUp, bg: mom!==null && parseFloat(mom)<=0 ? 'var(--success-light)' : 'var(--danger-light)', color: mom!==null && parseFloat(mom)<=0 ? 'var(--success)' : 'var(--danger)', title: 'Monthly Trend', value: mom!==null ? (parseFloat(mom)>=0?'+':'')+mom+'%' : 'N/A', desc: mom!==null ? (parseFloat(mom)>=0?'Spending increased':'Spending decreased')+' vs last month' : 'Need more data' },
    { icon: PiggyBank, bg: 'var(--success-light)', color: 'var(--success)', title: 'Savings Rate', value: savingsRate.toFixed(1)+'%', desc: savingsRate>=20?'Great habit':savingsRate>=10?'Room to improve':'Reduce discretionary spend' },
    { icon: Calendar, bg: 'rgba(6,182,212,0.1)', color: '#06B6D4', title: 'Daily Average', value: fmt(dailyAvg), desc: `Across ${Math.round(days)} days in this period` },
    { icon: Wallet, bg: 'rgba(52,211,153,0.1)', color: 'var(--success)', title: 'Primary Income', value: topInc?.[0]||'N/A', desc: topInc ? `${topIncPct}% of income (${fmt(topInc[1])})` : 'No income' },
    { icon: Lightbulb, bg: 'var(--accent-light)', color: 'var(--accent)', title: 'Quick Tip', value: `Save ${fmt(parseFloat((topCat?.[1]||0)*0.15))}/mo`, desc: `Cutting ${topCat?.[0]||'spend'} by 15% saves this much` },
  ];

  return (
    <section id="insights" className="mt-8 animate-in" style={{animationDelay: '0.4s'}}>
      <h2 className="text-2xl font-semibold tracking-tight mb-5" style={{fontFamily:"'Space Grotesk'"}}>Insights</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((d, i) => (
          <div key={i} className="card">
            <div className="w-9 h-9 rounded-[10px] flex items-center justify-center mb-3" style={{background: d.bg, color: d.color}}><d.icon size={18} /></div>
            <div className="text-xs font-medium uppercase tracking-wider mb-1" style={{color:'var(--fg-muted)'}}>{d.title}</div>
            <div className="text-lg font-bold mb-1" style={{fontFamily:"'Space Grotesk'"}}>{d.value}</div>
            <div className="text-[13px] leading-relaxed" style={{color:'var(--fg-muted)'}}>{d.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}