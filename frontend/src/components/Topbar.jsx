import { useState, useRef, useEffect } from 'react';
import { Menu, Search, Bell, Moon, Sun, ChevronDown, User, Settings, LogOut, Check, ShieldCheck, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import { Link } from 'react-router-dom';

export default function Topbar({ onToggleSidebar, onOpenSearch, unreadCount = 0, title = 'Overview' }) {
  const { user, logout } = useAuth();
  const { currency, setCurrency, isDark, toggleTheme } = usePreferences();
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [currencyDropdown, setCurrencyDropdown] = useState(false);

  const profileRef = useRef(null);
  const currencyRef = useRef(null);

  // Close dropdowns on outside click or ESC key
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdown(false);
      }
      if (currencyRef.current && !currencyRef.current.contains(e.target)) {
        setCurrencyDropdown(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setProfileDropdown(false);
        setCurrencyDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const currencies = [
    { code: 'INR', symbol: '₹', label: 'Indian Rupee', region: 'India' },
    { code: 'USD', symbol: '$', label: 'US Dollar', region: 'United States' },
    { code: 'EUR', symbol: '€', label: 'Euro', region: 'European Union' },
    { code: 'GBP', symbol: '£', label: 'British Pound', region: 'United Kingdom' },
  ];

  return (
    <header className="top-header">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-4 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-[var(--fg-secondary)] hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
          aria-label="Toggle Navigation"
        >
          <Menu size={22} />
        </button>
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold font-heading text-[var(--fg)] tracking-tight truncate">
            {title}
          </h1>
        </div>
      </div>

      {/* Right Controls: Search, Currency, Notifications, Theme, Profile */}
      <div className="flex items-center gap-3 sm:gap-3.5 flex-shrink-0">
        {/* Global Search Button */}
        <button
          onClick={onOpenSearch}
          type="button"
          style={{
            height: '42px',
            paddingLeft: '14px',
            paddingRight: '10px',
            borderRadius: '12px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            minWidth: '220px',
            maxWidth: '260px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          className="hover:border-[var(--accent)] hover:text-[var(--fg)] shadow-xs text-xs text-[var(--fg-muted)]"
          title="Search finances (⌘K / Ctrl+K)"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Search size={16} className="text-[var(--accent)] flex-shrink-0" />
            <span className="hidden sm:inline font-medium text-[var(--fg-muted)]">Search finances...</span>
            <span className="sm:hidden font-medium text-[var(--fg-muted)]">Search...</span>
          </div>
          <kbd
            style={{
              padding: '3px 7px',
              fontSize: '11px',
              fontWeight: 700,
              borderRadius: '6px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              color: 'var(--fg-muted)',
              letterSpacing: '0.02em',
              display: 'inline-flex',
              alignItems: 'center',
              flexShrink: 0,
            }}
            className="hidden sm:inline-flex"
          >
            ⌘K
          </kbd>
        </button>

        {/* Currency Selector */}
        <div className="relative" ref={currencyRef}>
          <button
            onClick={() => setCurrencyDropdown(!currencyDropdown)}
            className="flex items-center gap-2.5 h-[42px] px-3.5 rounded-xl border text-xs font-semibold bg-[var(--bg-surface)] text-[var(--fg-secondary)] hover:border-[var(--accent)] hover:text-[var(--fg)] transition-all cursor-pointer shadow-xs"
            style={{ borderColor: 'var(--border)' }}
            title="Base Currency"
          >
            <span className="w-5 h-5 rounded-md bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center font-bold text-xs">
              {currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'}
            </span>
            <span className="font-bold text-xs">{currency}</span>
            <ChevronDown size={14} className="text-[var(--fg-muted)]" />
          </button>

          {currencyDropdown && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 12px)',
                right: 0,
                width: '280px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '20px',
                padding: '12px',
                boxShadow: '0 24px 50px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.07)',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div
                style={{
                  padding: '4px 8px 8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--fg-muted)',
                  borderBottom: '1px solid var(--border-subtle)',
                  marginBottom: '4px',
                }}
              >
                Select Base Currency
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {currencies.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => {
                      setCurrency(c.code);
                      setCurrencyDropdown(false);
                    }}
                    style={{
                      height: '48px',
                      padding: '0 12px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: currency === c.code ? 'var(--accent-light)' : 'transparent',
                      border: '1px solid',
                      borderColor: currency === c.code ? 'rgba(var(--accent-rgb), 0.3)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      width: '100%',
                    }}
                    className="hover:bg-[var(--bg-surface)]"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '10px',
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '15px',
                          color: currency === c.code ? 'var(--accent)' : 'var(--fg)',
                          flexShrink: 0,
                        }}
                      >
                        {c.symbol}
                      </span>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--fg)' }}>{c.code}</div>
                        <div style={{ fontSize: '11.5px', color: 'var(--fg-muted)' }}>{c.region}</div>
                      </div>
                    </div>
                    {currency === c.code && <Check size={18} className="text-[var(--accent)] flex-shrink-0 ml-2" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Button */}
        <Link
          to="/notifications"
          className="relative h-[42px] w-[42px] flex items-center justify-center rounded-xl text-[var(--fg-secondary)] hover:text-[var(--fg)] hover:bg-[var(--bg-surface)] hover:border-[var(--accent)] transition-all border shadow-xs"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
          title="Notifications"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--accent)] text-white text-[9px] font-extrabold flex items-center justify-center shadow-sm">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* Theme Quick Toggle */}
        <button
          onClick={toggleTheme}
          className="h-[42px] w-[42px] flex items-center justify-center rounded-xl text-[var(--fg-secondary)] hover:text-[var(--fg)] hover:bg-[var(--bg-surface)] hover:border-[var(--accent)] transition-all border shadow-xs cursor-pointer"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
          title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-stone-700" />}
        </button>

        {/* Profile Avatar Dropdown */}
        <div className="relative profile-menu-wrapper" ref={profileRef}>
          <button
            onClick={() => setProfileDropdown(!profileDropdown)}
            className="flex items-center gap-2 p-1 rounded-xl border border-[var(--border)] hover:border-[var(--accent)] bg-[var(--bg-surface)] transition-all cursor-pointer shadow-xs"
            aria-label="User profile menu"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-orange-500 to-amber-400 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <ChevronDown size={14} className="text-[var(--fg-muted)] pr-0.5" />
          </button>

          {profileDropdown && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 12px)',
                right: 0,
                width: '290px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '20px',
                padding: '12px',
                boxShadow: '0 24px 50px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.07)',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              {/* User Header Profile Card */}
              <div
                style={{
                  padding: '12px 14px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '4px',
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '13px',
                    background: 'linear-gradient(135deg, #F97316 0%, #F59E0B 100%)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '18px',
                    boxShadow: '0 4px 12px rgba(249, 115, 22, 0.35)',
                    flexShrink: 0,
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--fg)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user?.name || 'User'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--fg-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '1px' }}>
                    {user?.email || 'demo@finora.app'}
                  </div>
                  <div style={{ marginTop: '5px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '10px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        background: 'rgba(var(--accent-rgb), 0.15)',
                        color: 'var(--accent)',
                        border: '1px solid rgba(var(--accent-rgb), 0.3)',
                      }}
                    >
                      <ShieldCheck size={12} />
                      {user?.role || 'Admin'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <Link
                  to="/profile"
                  onClick={() => setProfileDropdown(false)}
                  style={{
                    height: '42px',
                    padding: '0 12px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    color: 'var(--fg-secondary)',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                  }}
                  className="hover:bg-[var(--bg-surface)] hover:text-[var(--fg)]"
                >
                  <User size={17} className="text-[var(--accent)] flex-shrink-0" />
                  <span>Profile & Security</span>
                </Link>

                <Link
                  to="/settings"
                  onClick={() => setProfileDropdown(false)}
                  style={{
                    height: '42px',
                    padding: '0 12px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    color: 'var(--fg-secondary)',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                  }}
                  className="hover:bg-[var(--bg-surface)] hover:text-[var(--fg)]"
                >
                  <Settings size={17} className="text-stone-400 flex-shrink-0" />
                  <span>Preferences & Settings</span>
                </Link>
              </div>

              <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '4px 0' }} />

              {/* Sign Out Button */}
              <button
                type="button"
                onClick={() => {
                  setProfileDropdown(false);
                  logout();
                }}
                style={{
                  height: '42px',
                  padding: '0 12px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  color: '#EF4444',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'background 0.15s ease',
                }}
                className="hover:bg-red-500/10"
              >
                <LogOut size={17} className="flex-shrink-0" />
                <span>Sign Out of FINORA</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
