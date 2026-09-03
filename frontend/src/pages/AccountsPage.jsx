import { useState, useEffect, useCallback } from 'react';
import { Plus, Wallet, Landmark, CreditCard, PiggyBank, Pencil, Trash2, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { accountApi } from '../api';
import { usePreferences } from '../context/PreferencesContext';
import { useToast } from '../context/ToastContext';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import AccountModal from '../components/AccountModal';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';

export default function AccountsPage() {
  const { fmt } = usePreferences();
  const { addToast } = useToast();

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [deleteConfirmAccount, setDeleteConfirmAccount] = useState(null);

  const loadAccounts = useCallback(async () => {
    try {
      const res = await accountApi.list();
      setAccounts(res.data || []);
    } catch (err) {
      console.error('Failed to load accounts:', err);
      addToast(err.message || 'Error loading accounts', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const handleDelete = async () => {
    if (!deleteConfirmAccount) return;
    try {
      await accountApi.delete(deleteConfirmAccount.id);
      addToast('Account deleted successfully', 'success');
      setDeleteConfirmAccount(null);
      loadAccounts();
    } catch (err) {
      addToast(err.message || 'Failed to delete account', 'error');
    }
  };

  const netWorth = accounts.reduce((sum, a) => {
    if (a.type === 'CREDIT') return sum - Math.abs(a.balance);
    return sum + a.balance;
  }, 0);

  const totalAssets = accounts
    .filter((a) => a.type !== 'CREDIT')
    .reduce((sum, a) => sum + (a.balance > 0 ? a.balance : 0), 0);

  const totalLiabilities = accounts
    .filter((a) => a.type === 'CREDIT')
    .reduce((sum, a) => sum + (a.balance > 0 ? a.balance : 0), 0);

  const getAccountIcon = (type) => {
    switch (type) {
      case 'BANK': return Landmark;
      case 'CREDIT': return CreditCard;
      case 'INVESTMENT': return PiggyBank;
      default: return Wallet;
    }
  };

  return (
    <PageContainer className="max-w-5xl mx-auto">
      {/* 1. Page Header */}
      <PageHeader
        title="Financial Accounts"
        subtitle="Manage your liquid cash, bank balances, mutual funds, and credit lines."
        actions={
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => {
              setEditingAccount(null);
              setModalOpen(true);
            }}
            style={{ height: '42px', padding: '0 18px' }}
          >
            Add Account
          </Button>
        }
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* 2. Net Worth KPI Header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px',
          }}
        >
          {/* Total Net Worth */}
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
                Total Net Worth
              </span>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(249, 115, 22, 0.12)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wallet size={18} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--fg)', fontFamily: 'monospace', marginTop: '8px' }}>
                {fmt(netWorth)}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--fg-muted)', marginTop: '4px' }}>
                Total Assets minus Liabilities
              </div>
            </div>
          </div>

          {/* Liquid & Invested Assets */}
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
                Liquid & Invested Assets
              </span>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.12)', color: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PiggyBank size={18} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#22C55E', fontFamily: 'monospace', marginTop: '8px' }}>
                {fmt(totalAssets)}
              </div>
              <div style={{ fontSize: '12px', color: '#22C55E', fontWeight: 600, marginTop: '4px' }}>
                Across {accounts.filter((a) => a.type !== 'CREDIT').length} asset accounts
              </div>
            </div>
          </div>

          {/* Credit & Liabilities */}
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
                Credit & Liabilities
              </span>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.12)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CreditCard size={18} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#EF4444', fontFamily: 'monospace', marginTop: '8px' }}>
                {fmt(totalLiabilities)}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--fg-muted)', marginTop: '4px' }}>
                Outstanding debt / credit balances
              </div>
            </div>
          </div>
        </div>

        {/* 3. Account Cards Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ height: '180px', borderRadius: '20px', background: 'var(--bg-secondary)' }} className="animate-pulse" />
            ))}
          </div>
        ) : accounts.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="No accounts linked"
            description="Add your checking bank account, credit cards, or digital wallets to track balances."
            actionLabel="Add First Account"
            onAction={() => {
              setEditingAccount(null);
              setModalOpen(true);
            }}
          />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
            }}
          >
            {accounts.map((acc) => {
              const Icon = getAccountIcon(acc.type);
              const isCredit = acc.type === 'CREDIT';
              return (
                <div
                  key={acc.id}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '20px',
                    padding: '24px 26px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '180px',
                    gap: '20px',
                    boxShadow: 'var(--card-shadow)',
                  }}
                  className="hover:border-[var(--accent)] transition-all"
                >
                  {/* Top Row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '12px',
                          background: isCredit ? 'rgba(239, 68, 68, 0.12)' : 'rgba(var(--accent-rgb), 0.12)',
                          color: isCredit ? '#EF4444' : 'var(--accent)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={20} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--fg)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {acc.name}
                        </h3>
                        <div style={{ fontSize: '12px', color: 'var(--fg-muted)', textTransform: 'capitalize', marginTop: '2px' }}>
                          {acc.type.toLowerCase()} Account
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAccount(acc);
                          setModalOpen(true);
                        }}
                        style={{
                          width: '32px',
                          height: '32px',
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
                        title="Edit Account"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmAccount(acc)}
                        style={{
                          width: '32px',
                          height: '32px',
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
                        title="Delete Account"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Middle Row: Current Balance */}
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-muted)' }}>
                      Current Balance
                    </div>
                    <div
                      style={{
                        fontSize: '24px',
                        fontWeight: 800,
                        color: isCredit ? '#EF4444' : 'var(--fg)',
                        fontFamily: 'monospace',
                        marginTop: '4px',
                      }}
                    >
                      {fmt(acc.balance)}
                    </div>
                  </div>

                  {/* Bottom Row: Account Number & Badges */}
                  <div
                    style={{
                      paddingTop: '14px',
                      borderTop: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ fontSize: '12px', color: 'var(--fg-muted)', fontFamily: 'monospace' }}>
                      {acc.accountNumber ? `•••• ${acc.accountNumber.slice(-4)}` : 'Active'}
                    </span>

                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        background: acc.isDefault
                          ? 'rgba(var(--accent-rgb), 0.15)'
                          : 'rgba(255, 255, 255, 0.08)',
                        color: acc.isDefault ? 'var(--accent)' : 'var(--fg-muted)',
                        border: acc.isDefault
                          ? '1px solid rgba(var(--accent-rgb), 0.3)'
                          : '1px solid var(--border)',
                      }}
                    >
                      {acc.isDefault ? 'Primary' : acc.type}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals & Dialogs */}
      <AccountModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        account={editingAccount}
        onSuccess={loadAccounts}
      />

      <ConfirmDialog
        isOpen={!!deleteConfirmAccount}
        title="Delete Financial Account"
        message={`Are you sure you want to delete "${deleteConfirmAccount?.name}"?`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmAccount(null)}
      />
    </PageContainer>
  );
}
