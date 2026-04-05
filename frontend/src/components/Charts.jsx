import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Filler, Tooltip, Legend } from 'chart.js';
import { useStore } from '../store/useStore';
import { fmt, fmtDate, fmtMonth, CATEGORY_COLORS } from '../utils/helpers';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Filler, Tooltip, Legend);

const centerTextPlugin = {
  id: 'centerText',
  afterDraw: (chart) => {
    if (chart.config.type !== 'doughnut') return;
    const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
    if (!total) return;
    const { ctx, chartArea: { top, bottom, left, right } } = chart;
    const cx = (left + right) / 2, cy = (top + bottom) / 2;
    ctx.save();
    ctx.font = '700 17px "Space Grotesk"'; ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--fg').trim();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('$' + total.toLocaleString('en-US', {maximumFractionDigits:0}), cx, cy - 6);
    ctx.font = '400 11px "DM Sans"'; ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--fg-muted').trim();
    ctx.fillText('Total Spent', cx, cy + 12);
    ctx.restore();
  }
};
ChartJS.register(centerTextPlugin);

export default function Charts() {
  const { transactions, period, darkMode } = useStore();

  let txs = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
  if (period === '1m') { const c = new Date(); c.setMonth(c.getMonth() - 1); txs = txs.filter(t => t.date >= c.toISOString().slice(0,10)); }
  else if (period === '3m') { const c = new Date(); c.setMonth(c.getMonth() - 3); txs = txs.filter(t => t.date >= c.toISOString().slice(0,10)); }

  let running = 0;
  const balanceData = [{ date: txs[0]?.date || new Date().toISOString().slice(0,10), balance: 0 }, ...txs.map(t => { running += (t.type === 'income' ? t.amount : -t.amount); return { date: t.date, balance: running }; })];

  const expenses = txs.filter(t => t.type === 'expense');
  const catTotals = {}; expenses.forEach(t => { catTotals[t.category] = (catTotals[t.category] || 0) + t.amount; });
  const cats = Object.keys(catTotals).sort((a, b) => catTotals[b] - catTotals[a]);

  const monthMap = {}; txs.forEach(t => { const m = fmtMonth(t.date); if (!monthMap[m]) monthMap[m] = { income: 0, expense: 0 }; monthMap[m][t.type] += t.amount; });
  const months = Object.keys(monthMap);

  const gridColor = darkMode ? '#24273A' : '#E0E2E8';
  const tickColor = darkMode ? '#5E6278' : '#6B7280';
  const tooltipBg = darkMode ? '#1C1F2B' : '#fff';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 mb-5">
      <div className="card lg:col-span-3 animate-in" style={{animationDelay: '0.2s'}}>
        <h3 className="text-sm font-semibold mb-3" style={{color:'var(--fg-secondary)'}}>Balance Trend</h3>
        <div style={{height: '190px'}}><Line data={{labels: balanceData.map(d => fmtDate(d.date)), datasets: [{data: balanceData.map(d => d.balance), borderColor: 'var(--accent)', backgroundColor: darkMode ? 'rgba(232,185,49,0.08)' : 'rgba(196,149,32,0.08)', fill: true, tension: 0.35, pointRadius: 0, pointHoverRadius: 5, borderWidth: 2}]}} options={{responsive:true, maintainAspectRatio:false, interaction:{mode:'index',intersect:false}, plugins:{legend:{display:false}, tooltip:{backgroundColor:tooltipBg, titleColor:'var(--fg)', bodyColor:tickColor, borderColor:gridColor, borderWidth:1, padding:10, cornerRadius:8, displayColors:false, callbacks:{label: c => 'Balance: ' + fmt(c.parsed.y)}}}, scales:{x:{ticks:{color:tickColor,font:{size:10},maxTicksLimit:8},grid:{display:false},border:{display:false}},y:{ticks:{color:tickColor,font:{size:10},callback:v=>'$'+(v>=1000?(v/1000).toFixed(1)+'k':v)},grid:{color:gridColor},border:{display:false}}}}} /></div>
      </div>
      <div className="card lg:col-span-2 animate-in" style={{animationDelay: '0.25s'}}>
        <h3 className="text-sm font-semibold mb-3" style={{color:'var(--fg-secondary)'}}>Spending Breakdown</h3>
        <div className="flex items-center justify-center" style={{height: '190px'}}><Doughnut key={darkMode?'d':'l'} data={{labels:cats, datasets:[{data:cats.map(c=>Math.round(catTotals[c]*100)/100), backgroundColor:cats.map(c=>CATEGORY_COLORS[c]||'#9CA3AF'), borderColor:darkMode?'#14171F':'#FFFFFF', borderWidth:2, hoverOffset:4}]}} options={{responsive:true, maintainAspectRatio:false, cutout:'68%', plugins:{legend:{position:'bottom',labels:{color:tickColor,font:{size:10},boxWidth:8,padding:8}}, tooltip:{backgroundColor:tooltipBg,titleColor:'var(--fg)',bodyColor:tickColor,borderColor:gridColor,borderWidth:1,padding:10,cornerRadius:8}}}} /></div>
      </div>
      <div className="card animate-in" style={{animationDelay: '0.3s'}}>
        <h3 className="text-sm font-semibold mb-3" style={{color:'var(--fg-secondary)'}}>Monthly Comparison</h3>
        <div style={{height: '160px'}}><Bar key={darkMode?'d':'l'} data={{labels:months, datasets:[{label:'Income',data:months.map(m=>Math.round(monthMap[m].income*100)/100),backgroundColor:darkMode?'rgba(52,211,153,0.7)':'rgba(5,150,105,0.7)',borderRadius:5,barPercentage:0.5},{label:'Expenses',data:months.map(m=>Math.round(monthMap[m].expense*100)/100),backgroundColor:darkMode?'rgba(248,113,113,0.7)':'rgba(220,38,38,0.7)',borderRadius:5,barPercentage:0.5}]}} options={{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'top',align:'end',labels:{color:tickColor,font:{size:11},boxWidth:8,padding:12}},tooltip:{backgroundColor:tooltipBg,titleColor:'var(--fg)',bodyColor:tickColor,borderColor:gridColor,borderWidth:1,padding:10,cornerRadius:8,callbacks:{label:c=>' '+c.dataset.label+': '+fmt(c.parsed.y)}}},scales:{x:{ticks:{color:tickColor,font:{size:10}},grid:{display:false},border:{display:false}},y:{ticks:{color:tickColor,font:{size:10},callback:v=>'$'+(v>=1000?(v/1000).toFixed(0)+'k':v)},grid:{color:gridColor},border:{display:false}}}}} /></div>
      </div>
    </div>
  );
}