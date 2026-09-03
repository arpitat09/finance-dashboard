import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import SearchModal from './SearchModal';
import { notificationApi } from '../api';

export default function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Global search shortcut ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Periodic unread notification count
  useEffect(() => {
    async function fetchUnread() {
      try {
        const res = await notificationApi.getUnreadCount();
        setUnreadCount(res.data?.count || 0);
      } catch (err) {
        // quiet fail on network/auth transitions
      }
    }
    fetchUnread();
    const interval = setInterval(fetchUnread, 45000);
    return () => clearInterval(interval);
  }, []);

  const getPageTitle = () => {
    const p = location.pathname;
    if (p.includes('/dashboard')) return 'Overview';
    if (p.includes('/transactions')) return 'Transactions';
    if (p.includes('/budgets')) return 'Budgets';
    if (p.includes('/goals')) return 'Savings Goals';
    if (p.includes('/accounts')) return 'Financial Accounts';
    if (p.includes('/recurring')) return 'Recurring Expenses';
    if (p.includes('/analytics')) return 'Financial Analytics';
    if (p.includes('/reports')) return 'Financial Reports';
    if (p.includes('/assistant')) return 'FINORA AI Assistant';
    if (p.includes('/notifications')) return 'Notifications';
    if (p.includes('/settings')) return 'Preferences & Settings';
    if (p.includes('/profile')) return 'Account Profile';
    return 'Financial Dashboard';
  };

  return (
    <div className="app-shell-root">
      {/* Background Decorative Blur Meshes */}
      <div className="bg-blob blob-1" />
      <div className="bg-blob blob-2" />
      <div className="grid-overlay" />

      {/* Fixed Full-Height Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        unreadCount={unreadCount}
      />

      {/* Main Content Area */}
      <div className="app-main-area">
        <Topbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenSearch={() => setSearchOpen(true)}
          unreadCount={unreadCount}
          title={getPageTitle()}
        />

        <main className="main-content">
          {children}
        </main>
      </div>

      {/* Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
