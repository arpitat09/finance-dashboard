import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Lock, Mail, User, Globe, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Full name is required');
      return;
    }
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register({ name, email, password, currency });
      addToast('Welcome to FINORA! Your workspace is ready. 🎉', 'success');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--bg)',
        color: 'var(--fg)',
      }}
    >
      {/* Ambient Lighting Meshes */}
      <div className="bg-blob blob-1" />
      <div className="bg-blob blob-2" />
      <div className="grid-overlay" />

      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '28px',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '22px',
                color: '#FFFFFF',
                background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                boxShadow: '0 8px 20px rgba(249, 115, 22, 0.4)',
                flexShrink: 0,
              }}
            >
              F
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1, color: 'var(--fg)', fontFamily: 'var(--font-heading)' }}>
                FINORA
              </div>
              <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.12em', color: 'var(--accent)', textTransform: 'uppercase', marginTop: '4px' }}>
                Finance Intelligence
              </div>
            </div>
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--fg)', margin: '14px 0 6px 0', fontFamily: 'var(--font-heading)' }}>
            Create your financial workspace
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--fg-muted)', margin: 0, maxWidth: '360px', lineHeight: 1.5 }}>
            Join smart individuals tracking cashflow, budgets, and investments.
          </p>
        </div>

        {/* High-End Auth Card */}
        <div
          style={{
            width: '100%',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: '24px',
            padding: '32px 36px',
            boxShadow: 'var(--card-shadow)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {error && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#EF4444',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-secondary)', marginBottom: '8px' }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-muted)', pointerEvents: 'none' }}>
                  <User size={17} />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arpita Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  style={{ height: '48px', paddingLeft: '44px', borderRadius: '12px', fontSize: '14px', width: '100%' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-secondary)', marginBottom: '8px' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-muted)', pointerEvents: 'none' }}>
                  <Mail size={17} />
                </div>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  style={{ height: '48px', paddingLeft: '44px', borderRadius: '12px', fontSize: '14px', width: '100%' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-secondary)', marginBottom: '8px' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-muted)', pointerEvents: 'none' }}>
                    <Lock size={17} />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field"
                    style={{ height: '48px', paddingLeft: '44px', borderRadius: '12px', fontSize: '14px', width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-secondary)', marginBottom: '8px' }}>
                  Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-muted)', pointerEvents: 'none' }}>
                    <Lock size={17} />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field"
                    style={{ height: '48px', paddingLeft: '44px', borderRadius: '12px', fontSize: '14px', width: '100%' }}
                  />
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-secondary)', marginBottom: '8px' }}>
                Base Currency
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-muted)', pointerEvents: 'none' }}>
                  <Globe size={17} />
                </div>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  style={{
                    height: '48px',
                    paddingLeft: '44px',
                    paddingRight: '16px',
                    borderRadius: '12px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    color: 'var(--fg)',
                    fontSize: '14px',
                    width: '100%',
                    cursor: 'pointer',
                  }}
                >
                  <option value="INR">INR (₹ Indian Rupee)</option>
                  <option value="USD">USD ($ US Dollar)</option>
                  <option value="EUR">EUR (€ Euro)</option>
                  <option value="GBP">GBP (£ British Pound)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                height: '48px',
                borderRadius: '12px',
                background: 'var(--accent)',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '14.5px',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: 'var(--glow-orange)',
                marginTop: '6px',
              }}
              className="hover:opacity-95 transition-opacity"
            >
              {loading ? (
                'Creating Workspace...'
              ) : (
                <>
                  <UserPlus size={17} />
                  Create FINORA Account
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Login Footer */}
          <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--fg-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 700, color: 'var(--accent)', textDecoration: 'none', marginLeft: '4px' }} className="hover:underline">
              Sign In
            </Link>
          </div>
        </div>

        {/* Trust Badges */}
        <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'center', gap: '14px', fontSize: '12px', color: 'var(--fg-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} style={{ color: '#22C55E' }} /> End-to-end encrypted
          </span>
          <span>•</span>
          <span>Zero telemetry</span>
          <span>•</span>
          <span>100% private data</span>
        </div>
      </div>
    </div>
  );
}
