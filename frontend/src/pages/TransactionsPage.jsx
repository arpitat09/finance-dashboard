import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  Download,
  Filter,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  X,
} from 'lucide-react';
import { transactionApi, categoryApi, accountApi } from '../api';
import { usePreferences } from '../context/PreferencesContext';
import { useToast } from '../context/ToastContext';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Badge from '../components/Badge';
import TransactionModal from '../components/TransactionModal';
import TransactionDetailDrawer from '../components/TransactionDetailDrawer';
import ConfirmDialog from '../components/ConfirmDialog';
import { TableSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { fmtDate, CATEGORY_COLORS, exportToCSV, exportToJSON } from '../utils/helpers';

export default function TransactionsPage() {
  const { fmt } = usePreferences();
  const { addToast } = useToast();

  const [transactions, setTransactions] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filter options
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);

  // Filters State
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [showFilters, setShowFilters] = useState(false);

  // Modals & Drawers
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [detailTx, setDetailTx] = useState(null);
  const [deleteConfirmTx, setDeleteConfirmTx] = useState(null);

  useEffect(() => {
    async function loadMetaFilters() {
      try {
        const [catRes, accRes] = await Promise.all([categoryApi.list(), accountApi.list()]);
        setCategories(catRes.data || []);
        setAccounts(accRes.data || []);
      } catch (err) {
        console.error('Failed to load filter options:', err);
      }
    }
    loadMetaFilters();
  }, []);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await transactionApi.list({
        page,
        limit,
        search: search || undefined,
        type: type || undefined,
        categoryId: categoryId || undefined,
        accountId: accountId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        sortBy,
        sortOrder,
      });

      setTransactions(res.data || []);
      setMeta(res.meta || { page: 1, limit, total: 0, totalPages: 1 });
    } catch (err) {
      console.error('Failed to load transactions:', err);
      addToast(err.message || 'Error fetching transactions', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, type, categoryId, accountId, startDate, endDate, sortBy, sortOrder, addToast]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleDelete = async () => {
    if (!deleteConfirmTx) return;
    try {
      await transactionApi.delete(deleteConfirmTx.id);
      addToast('Transaction deleted successfully', 'success');
      setDeleteConfirmTx(null);
      loadTransactions();
    } catch (err) {
      addToast(err.message || 'Failed to delete transaction', 'error');
    }
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) return addToast('No records to export', 'error');
    const rows = [
      ['Date', 'Description', 'Amount', 'Type', 'Category', 'Account', 'Payment Method', 'Notes'],
      ...transactions.map((t) => [
        t.date?.slice(0, 10),
        t.description,
        t.amount,
        t.type,
        t.category?.name || 'Uncategorized',
        t.account?.name || 'Default Account',
        t.paymentMethod || 'UPI',
        t.notes || '',
      ]),
    ];
    exportToCSV(`finora_transactions_${new Date().toISOString().slice(0, 10)}.csv`, rows);
    addToast('Transactions exported as CSV', 'success');
  };

  const handleExportJSON = () => {
    if (transactions.length === 0) return addToast('No records to export', 'error');
    exportToJSON(`finora_transactions_${new Date().toISOString().slice(0, 10)}.json`, transactions);
    addToast('Transactions exported as JSON', 'success');
  };

  const resetFilters = () => {
    setSearch('');
    setType('');
    setCategoryId('');
    setAccountId('');
    setStartDate('');
    setEndDate('');
    setSortBy('date');
    setSortOrder('desc');
    setPage(1);
  };

  const hasActiveFilters = search || type || categoryId || accountId || startDate || endDate;

  return (
    <PageContainer className="max-w-6xl mx-auto">
      {/* 1. Page Header */}
      <PageHeader
        title="Transactions"
        subtitle="Manage, filter, and inspect all financial inflows and outflows."
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button variant="secondary" size="md" icon={Download} onClick={handleExportCSV} style={{ height: '42px', padding: '0 16px' }}>
              CSV
            </Button>
            <Button variant="secondary" size="md" icon={Download} onClick={handleExportJSON} style={{ height: '42px', padding: '0 16px' }}>
              JSON
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={() => {
                setEditingTx(null);
                setModalOpen(true);
              }}
              style={{ height: '42px', padding: '0 18px' }}
            >
              Add Transaction
            </Button>
          </div>
        }
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* 2. Unified Filter Toolbar */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '18px 22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1 1 260px', minWidth: '220px' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--fg-muted)',
                  pointerEvents: 'none',
                }}
              />
              <input
                type="text"
                placeholder="Search by description or memo..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="input-field"
                style={{ height: '44px', paddingLeft: '40px', borderRadius: '12px', fontSize: '13.5px', width: '100%' }}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setPage(1);
                  }}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--fg-muted)',
                    cursor: 'pointer',
                  }}
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Quick Filter Selects */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {/* Type Select */}
              <select
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setPage(1);
                }}
                style={{
                  height: '44px',
                  padding: '0 14px',
                  borderRadius: '12px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--fg)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <option value="">All Types</option>
                <option value="INCOME">Income Only</option>
                <option value="EXPENSE">Expense Only</option>
              </select>

              {/* Category Select */}
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setPage(1);
                }}
                style={{
                  height: '44px',
                  padding: '0 14px',
                  borderRadius: '12px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--fg)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  maxWidth: '180px',
                }}
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Sort Order */}
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [sb, so] = e.target.value.split('-');
                  setSortBy(sb);
                  setSortOrder(so);
                  setPage(1);
                }}
                style={{
                  height: '44px',
                  padding: '0 14px',
                  borderRadius: '12px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--fg)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="amount-desc">Highest Amount</option>
                <option value="amount-asc">Lowest Amount</option>
              </select>

              {/* More Filters Toggle */}
              <Button
                variant="secondary"
                size="sm"
                icon={Filter}
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  height: '44px',
                  padding: '0 16px',
                  borderRadius: '12px',
                  background: showFilters ? 'rgba(var(--accent-rgb), 0.15)' : 'var(--bg-surface)',
                  borderColor: showFilters ? 'var(--accent)' : 'var(--border)',
                  color: showFilters ? 'var(--accent)' : 'var(--fg)',
                }}
              >
                More
              </Button>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  style={{
                    height: '44px',
                    padding: '0 12px',
                    fontSize: '13px',
                    color: '#EF4444',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: 'none',
                    border: 'none',
                  }}
                  className="hover:underline"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Advanced Filters Drawer */}
          {showFilters && (
            <div
              style={{
                paddingTop: '16px',
                borderTop: '1px solid var(--border-subtle)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '14px',
              }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--fg-secondary)', marginBottom: '6px' }}>
                  Filter by Account
                </label>
                <select
                  value={accountId}
                  onChange={(e) => {
                    setAccountId(e.target.value);
                    setPage(1);
                  }}
                  style={{
                    height: '42px',
                    padding: '0 12px',
                    borderRadius: '10px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    color: 'var(--fg)',
                    fontSize: '13px',
                    width: '100%',
                    cursor: 'pointer',
                  }}
                >
                  <option value="">All Accounts</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--fg-secondary)', marginBottom: '6px' }}>
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPage(1);
                  }}
                  style={{
                    height: '42px',
                    padding: '0 12px',
                    borderRadius: '10px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    color: 'var(--fg)',
                    fontSize: '13px',
                    width: '100%',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--fg-secondary)', marginBottom: '6px' }}>
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPage(1);
                  }}
                  style={{
                    height: '42px',
                    padding: '0 12px',
                    borderRadius: '10px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    color: 'var(--fg)',
                    fontSize: '13px',
                    width: '100%',
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 3. Transaction Data Table */}
        {loading ? (
          <TableSkeleton rows={8} />
        ) : transactions.length === 0 ? (
          <EmptyState
            title="No transactions found"
            description="Try adjusting your search query, type, or date range."
            actionLabel="Clear Filters"
            onAction={resetFilters}
          />
        ) : (
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: 'var(--card-shadow)',
            }}
          >
            {/* Desktop Table View */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left', fontSize: '13.5px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr
                    style={{
                      borderBottom: '1px solid var(--border)',
                      background: 'var(--bg-surface)',
                      color: 'var(--fg-muted)',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    <th style={{ padding: '16px 20px' }}>Date</th>
                    <th style={{ padding: '16px 20px' }}>Description</th>
                    <th style={{ padding: '16px 20px' }}>Category</th>
                    <th style={{ padding: '16px 20px' }}>Account</th>
                    <th style={{ padding: '16px 20px' }}>Method</th>
                    <th style={{ padding: '16px 20px', textAlign: 'right' }}>Amount</th>
                    <th style={{ padding: '16px 20px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t, idx) => {
                    const color = CATEGORY_COLORS[t.category?.name] || '#F97316';
                    const isIncome = t.type === 'INCOME';
                    return (
                      <tr
                        key={t.id}
                        onClick={() => setDetailTx(t)}
                        style={{
                          borderBottom: idx < transactions.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                          cursor: 'pointer',
                        }}
                        className="hover:bg-[var(--bg-surface)] transition-colors group"
                      >
                        <td style={{ padding: '16px 20px', fontFamily: 'monospace', color: 'var(--fg-muted)', whiteSpace: 'nowrap', fontSize: '12px' }}>
                          {fmtDate(t.date)}
                        </td>
                        <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--fg)', maxWidth: '280px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.description}</span>
                            {t.isRecurring && (
                              <span style={{ fontSize: '10px', fontWeight: 800, padding: '1px 6px', borderRadius: '4px', background: 'rgba(168, 85, 247, 0.15)', color: '#A855F7', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                                REC
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '3px 10px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              background: `${color}15`,
                              color: color,
                            }}
                          >
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: color }} />
                            {t.category?.name}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px', color: 'var(--fg-secondary)', whiteSpace: 'nowrap', fontSize: '13px' }}>
                          {t.account?.name || '—'}
                        </td>
                        <td style={{ padding: '16px 20px', color: 'var(--fg-muted)', fontWeight: 500, whiteSpace: 'nowrap', fontSize: '12px' }}>
                          {t.paymentMethod || 'UPI'}
                        </td>
                        <td
                          style={{
                            padding: '16px 20px',
                            textAlign: 'right',
                            fontFamily: 'monospace',
                            fontWeight: 800,
                            fontSize: '14px',
                            whiteSpace: 'nowrap',
                            color: isIncome ? '#22C55E' : '#EF4444',
                          }}
                        >
                          {isIncome ? '+' : '-'}{fmt(t.amount)}
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => setDetailTx(t)}
                              style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '8px',
                                background: 'var(--bg-surface)',
                                border: '1px solid var(--border)',
                                color: 'var(--fg-muted)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                              }}
                              className="hover:text-[var(--fg)] hover:border-[var(--fg-muted)]"
                              title="View details"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingTx(t);
                                setModalOpen(true);
                              }}
                              style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '8px',
                                background: 'var(--bg-surface)',
                                border: '1px solid var(--border)',
                                color: 'var(--fg-muted)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                              }}
                              className="hover:text-[var(--accent)] hover:border-[var(--accent)]"
                              title="Edit"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmTx(t)}
                              style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '8px',
                                background: 'var(--bg-surface)',
                                border: '1px solid var(--border)',
                                color: 'var(--fg-muted)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                              }}
                              className="hover:text-red-500 hover:border-red-500"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {meta.totalPages > 1 && (
              <div
                style={{
                  padding: '16px 24px',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '13px',
                  color: 'var(--fg-muted)',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  Showing page <strong style={{ color: 'var(--fg)' }}>{meta.page}</strong> of {meta.totalPages} ({meta.total} records)
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    disabled={meta.page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    style={{
                      height: '36px',
                      padding: '0 14px',
                      borderRadius: '10px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      color: meta.page <= 1 ? 'var(--fg-muted)' : 'var(--fg)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: meta.page <= 1 ? 'not-allowed' : 'pointer',
                      opacity: meta.page <= 1 ? 0.5 : 1,
                    }}
                  >
                    <ChevronLeft size={16} /> Prev
                  </button>

                  <button
                    type="button"
                    disabled={meta.page >= meta.totalPages}
                    onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                    style={{
                      height: '36px',
                      padding: '0 14px',
                      borderRadius: '10px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      color: meta.page >= meta.totalPages ? 'var(--fg-muted)' : 'var(--fg)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: meta.page >= meta.totalPages ? 'not-allowed' : 'pointer',
                      opacity: meta.page >= meta.totalPages ? 0.5 : 1,
                    }}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals & Detail Drawers */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTx(null);
        }}
        transaction={editingTx}
        onSaved={loadTransactions}
      />

      <TransactionDetailDrawer
        isOpen={!!detailTx}
        onClose={() => setDetailTx(null)}
        transaction={detailTx}
        onEdit={(tx) => {
          setDetailTx(null);
          setEditingTx(tx);
          setModalOpen(true);
        }}
        onDelete={(tx) => {
          setDetailTx(null);
          setDeleteConfirmTx(tx);
        }}
      />

      <ConfirmDialog
        isOpen={!!deleteConfirmTx}
        title="Delete Transaction"
        message={`Are you sure you want to permanently delete this ${deleteConfirmTx?.type?.toLowerCase()} record for ${fmt(deleteConfirmTx?.amount || 0)}?`}
        confirmLabel="Delete Record"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmTx(null)}
      />
    </PageContainer>
  );
}
