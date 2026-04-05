import { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import SummaryCards from './components/SummaryCards';
import Charts from './components/Charts';
import TransactionList from './components/TransactionList';
import TransactionModal from './components/TransactionModal';
import Insights from './components/Insights';
import Toast from './components/Toast';
import { useStore } from './store/useStore';

export default function App() {
  const { darkMode, period, setPeriod, role, setEditingId } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const openModal = (id) => { setEditingId(id); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingId(null); };

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <div className="bg-blob blob-1" />
      <div className="bg-blob blob-2" />
      <div className="grid-overlay" />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile header */}
      <header className="mobile-header">
        <button onClick={() => setSidebarOpen(true)} className="menu-btn"><Menu size={22} /></button>
        <span className="mobile-logo">FinVault</span>
        <div style={{ width: 28 }} />
      </header>

      {/* Main content — uses .main-content class from CSS for sidebar offset */}
      <main className="main-content">
        {/* Header */}
        <div className="page-header">
          <div className="header-left">
            <h1 className="page-title">Dashboard</h1>
            {role === 'viewer' && (
              <span className="view-badge">View Only</span>
            )}
          </div>
          <div className="period-toggle">
            {[{ key: '1m', label: '1M' }, { key: '3m', label: '3M' }, { key: 'all', label: 'All' }].map(p => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`period-btn ${period === p.key ? 'active' : ''}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <SummaryCards />
        <Charts />
        <TransactionList onOpenModal={openModal} />
        <Insights />
      </main>

      {modalOpen && <TransactionModal onClose={closeModal} />}
      <Toast />
    </div>
  );
}