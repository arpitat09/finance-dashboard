import { Search, Pencil, Trash2, Plus, Download, Home, Utensils, Car, Film, ShoppingBag, Zap, HeartPulse, GraduationCap, Briefcase, Laptop, TrendingUp, CircleDot } from 'lucide-react';
import { useStore } from '../store/useStore';
import { fmt, fmtDate, hexToRgb, CATEGORY_COLORS, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../utils/helpers';

const ICON_MAP = {
  'Housing': Home, 'Food & Dining': Utensils, 'Transportation': Car,
  'Entertainment': Film, 'Shopping': ShoppingBag, 'Utilities': Zap,
  'Healthcare': HeartPulse, 'Education': GraduationCap, 'Salary': Briefcase,
  'Freelance': Laptop, 'Investment': TrendingUp, 'Other': CircleDot
};

export default function TransactionList({ onOpenModal }) {
  const { transactions, filters, setFilter, role, currentPage, setPage, deleteConfirmId, setDeleteConfirmId, deleteTransaction, addToast } = useStore();
  const PER_PAGE = 8;

  let filtered = [...transactions];
  if (filters.search) { const s = filters.search.toLowerCase(); filtered = filtered.filter(t => t.description.toLowerCase().includes(s) || t.category.toLowerCase().includes(s)); }
  if (filters.type !== 'all') filtered = filtered.filter(t => t.type === filters.type);
  if (filters.category !== 'all') filtered = filtered.filter(t => t.category === filters.category);
  
  switch (filters.sort) {
    case 'date-desc': filtered.sort((a,b) => b.date.localeCompare(a.date)); break;
    case 'date-asc': filtered.sort((a,b) => a.date.localeCompare(b.date)); break;
    case 'amount-desc': filtered.sort((a,b) => b.amount - a.amount); break;
    case 'amount-asc': filtered.sort((a,b) => a.amount - b.amount); break;
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);
  const cats = filters.type === 'income' ? INCOME_CATEGORIES : filters.type === 'expense' ? EXPENSE_CATEGORIES : [...new Set([...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES])];

  const handleDelete = (id) => {
    if (deleteConfirmId === id) { deleteTransaction(id); addToast('Transaction deleted', 'success'); }
    else { setDeleteConfirmId(id); setTimeout(() => setDeleteConfirmId(null), 3000); }
  };

  const handleExport = (type) => {
    if (!filtered.length) return addToast('No transactions to export', 'error');
    let content, mime, ext;
    if (type === 'csv') { content = ['Date,Description,Amount,Type,Category', ...filtered.map(t => `${t.date},"${t.description}",${t.amount},${t.type},${t.category}`)].join('\n'); mime = 'text/csv'; ext = 'transactions.csv'; }
    else { content = JSON.stringify(filtered, null, 2); mime = 'application/json'; ext = 'transactions.json'; }
    const blob = new Blob([content], { type: mime }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = ext; a.click(); URL.revokeObjectURL(url);
    addToast(`Exported ${filtered.length} transactions`, 'success');
  };

  const selectStyle = { backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' };

  return (
    <section id="transactions" className="mt-8 animate-in" style={{animationDelay: '0.35s'}}>
      <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
        <h2 className="text-2xl font-semibold tracking-tight" style={{fontFamily:"'Space Grotesk'"}}>Transactions</h2>
        <div className="flex gap-2">
          <button onClick={() => handleExport('csv')} className="btn-secondary text-xs"><Download size={14}/> CSV</button>
          <button onClick={() => handleExport('json')} className="btn-secondary text-xs"><Download size={14}/> JSON</button>
          {role === 'admin' && <button onClick={() => onOpenModal(null)} className="btn-primary text-xs"><Plus size={16}/> Add Transaction</button>}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{color:'var(--fg-muted)'}} />
          <input type="text" placeholder="Search transactions..." value={filters.search} onChange={e => setFilter('search', e.target.value)} className="input-field pl-9" aria-label="Search transactions" />
        </div>
        <select value={filters.type} onChange={e => setFilter('type', e.target.value)} className="input-field w-auto appearance-none pr-8 cursor-pointer" style={selectStyle} aria-label="Filter by type">
          <option value="all">All Types</option><option value="income">Income</option><option value="expense">Expense</option>
        </select>
        <select value={filters.category} onChange={e => setFilter('category', e.target.value)} className="input-field w-auto appearance-none pr-8 cursor-pointer" style={selectStyle} aria-label="Filter by category">
          <option value="all">All Categories</option>{cats.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filters.sort} onChange={e => setFilter('sort', e.target.value)} className="input-field w-auto appearance-none pr-8 cursor-pointer" style={selectStyle} aria-label="Sort by">
          <option value="date-desc">Newest First</option><option value="date-asc">Oldest First</option><option value="amount-desc">Highest Amount</option><option value="amount-asc">Lowest Amount</option>
        </select>
      </div>

      <div className="flex flex-col gap-[2px]">
        {!filtered.length ? (
          <div className="text-center py-16" style={{color:'var(--fg-muted)'}}>
            <Search size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium mb-1">No transactions found</p>
            <p className="text-xs">Try adjusting your search or filter criteria.</p>
          </div>
        ) : pageItems.map(t => {
          const color = CATEGORY_COLORS[t.category] || '#9CA3AF';
          const IconComponent = ICON_MAP[t.category] || CircleDot;
          const isConfirming = deleteConfirmId === t.id;
          return (
            <div key={t.id} className="grid grid-cols-[40px_1fr_auto] sm:grid-cols-[40px_1fr_auto_auto] items-center gap-3 px-4 py-3 rounded-[10px] transition-colors hover:bg-[var(--bg-tertiary)]">
              <div className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{background:`rgba(${hexToRgb(color)}, 0.1)`, color}}><IconComponent size={18} /></div>
              <div className="min-w-0"><div className="text-sm font-medium truncate">{t.description}</div><div className="text-xs mt-0.5" style={{color:'var(--fg-muted)'}}>{t.category} &middot; {fmtDate(t.date)}</div></div>
              <div className="font-semibold text-sm whitespace-nowrap" style={{fontFamily:"'Space Grotesk'", color: t.type === 'income' ? 'var(--success)' : 'var(--danger)'}}>{t.type === 'income' ? '+' : '-'}{fmt(t.amount)}</div>
              {role === 'admin' && (
                <div className="hidden sm:flex gap-1">
                  <button onClick={() => onOpenModal(t.id)} className="p-2 rounded-lg transition-colors" style={{color:'var(--fg-muted)', background:'transparent', border:'none', cursor:'pointer'}} title="Edit"><Pencil size={15}/></button>
                  <button onClick={() => handleDelete(t.id)} className="p-2 rounded-lg transition-all font-bold text-xs" style={isConfirming ? {background:'var(--danger)', color:'white', border:'none', cursor:'pointer', width:'auto', paddingLeft:10, paddingRight:10} : {color:'var(--fg-muted)', background:'transparent', border:'none', cursor:'pointer'}} title={isConfirming ? 'Click to confirm' : 'Delete'}>{isConfirming ? 'Sure?' : <Trash2 size={15}/>}</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t" style={{borderColor:'var(--border)'}}>
          <button disabled={safePage <= 1} onClick={() => setPage(safePage - 1)} className="btn-secondary text-xs disabled:opacity-40 disabled:cursor-not-allowed">Previous</button>
          <span className="text-xs" style={{color:'var(--fg-muted)'}}>Page {safePage} of {totalPages}</span>
          <button disabled={safePage >= totalPages} onClick={() => setPage(safePage + 1)} className="btn-secondary text-xs disabled:opacity-40 disabled:cursor-not-allowed">Next</button>
        </div>
      )}
    </section>
  );
}