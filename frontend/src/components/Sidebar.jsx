import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Target,
  Wallet,
  Repeat,
  BarChart3,
  FileSpreadsheet,
  Bot,
  Bell,
  Settings,
  User,
  LogOut,
  Moon,
  Sun,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';

export default function Sidebar({ isOpen, onClose, unreadCount = 0 }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = usePreferences();

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
    { to: '/budgets', icon: PieChart, label: 'Budgets' },
    { to: '/goals', icon: Target, label: 'Savings Goals' },
    { to: '/accounts', icon: Wallet, label: 'Accounts' },
    { to: '/recurring', icon: Repeat, label: 'Recurring' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/reports', icon: FileSpreadsheet, label: 'Reports' },
    { to: '/assistant', icon: Bot, label: 'AI Assistant' },
    { to: '/notifications', icon: Bell, label: 'Notifications', badge: unreadCount },
  ];

  const bottomNavItems = [
    { to: '/settings', icon: Settings, label: 'Settings' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto z-40' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <aside
        className={`sidebar ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* 1. Brand Header */}
        <div className="sidebar-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '18px',
                color: '#FFFFFF',
                background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                boxShadow: '0 4px 12px rgba(249, 115, 22, 0.35)',
                flexShrink: 0,
              }}
            >
              F
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '16px', letterSpacing: '-0.02em', color: 'var(--fg)', lineHeight: 1.1 }}>
                FINORA
              </div>
              <div style={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--fg-muted)', textTransform: 'uppercase', marginTop: '3px' }}>
                Finance Intelligence
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden"
            style={{
              padding: '6px',
              borderRadius: '8px',
              color: 'var(--fg-muted)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
            }}
            aria-label="Close Sidebar"
          >
            <X size={16} />
          </button>
        </div>

        {/* 2. Main Navigation Area */}
        <div className="sidebar-nav">
          <div className="sidebar-section-title">
            Main Menu
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon size={17} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
              {Boolean(item.badge) && item.badge > 0 && (
                <span
                  style={{
                    padding: '2px 7px',
                    borderRadius: '20px',
                    fontSize: '10px',
                    fontWeight: 800,
                    background: 'var(--accent)',
                    color: '#FFFFFF',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}

          <div className="sidebar-section-title">
            Preferences
          </div>
          {bottomNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon size={17} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
            </NavLink>
          ))}
        </div>

        {/* 3. Footer Area (Theme Toggle + User Profile) */}
        <div className="sidebar-bottom">
          {/* Theme Toggle Container */}
          <button
            type="button"
            onClick={toggleTheme}
            className="sidebar-theme-switch"
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isDark ? (
                <Moon size={15} style={{ color: '#FBBF24' }} />
              ) : (
                <Sun size={15} style={{ color: '#F97316' }} />
              )}
              <span>{isDark ? 'Dark Theme' : 'Light Theme'}</span>
            </span>

            {/* Sliding Toggle Pill */}
            <div
              style={{
                width: '36px',
                height: '20px',
                borderRadius: '20px',
                background: isDark ? 'var(--accent)' : 'var(--border)',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: isDark ? 'flex-end' : 'flex-start',
                transition: 'all 0.2s ease',
              }}
            >
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: '#FFFFFF',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }}
              />
            </div>
          </button>

          {/* User Profile Container */}
          <div className="sidebar-profile-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  background: 'rgba(var(--accent-rgb), 0.15)',
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '13px',
                  flexShrink: 0,
                  border: '1px solid rgba(var(--accent-rgb), 0.25)',
                }}
              >
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.name || 'User'}
                </div>
                <div style={{ fontSize: '10.5px', color: 'var(--fg-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.email || 'demo@finora.app'}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              style={{
                padding: '6px',
                color: 'var(--fg-muted)',
                borderRadius: '8px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              className="hover:text-red-500 hover:bg-[var(--bg-elevated)] transition-colors"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}