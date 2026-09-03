import { useState, useEffect } from 'react';
import { User, Mail, Lock, KeyRound, Shield, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authApi } from '../api';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) return addToast('Name cannot be empty', 'error');

    setSavingProfile(true);
    try {
      await updateProfile({ name });
      addToast('Profile details updated successfully', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!currentPassword) return setPasswordError('Please provide your current password');
    if (newPassword.length < 6) return setPasswordError('New password must be at least 6 characters');
    if (newPassword !== confirmPassword) return setPasswordError('New passwords do not match');

    setChangingPassword(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      addToast('Password changed successfully', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <PageContainer className="max-w-5xl mx-auto">
      {/* 1. Page Header */}
      <PageHeader
        title="Account & Security"
        subtitle="Manage your personal profile, credentials, and access permissions."
      />

      {/* 2. Responsive 2-Column Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '32px',
          alignItems: 'start',
        }}
      >
        {/* Left: User Overview Card */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '32px 28px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '24px',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          {/* Avatar Squircle with Active Indicator */}
          <div style={{ position: 'relative', marginTop: '4px' }}>
            <div
              style={{
                width: '88px',
                height: '88px',
                borderRadius: '24px',
                background: 'linear-gradient(135deg, #F97316 0%, #F59E0B 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '34px',
                boxShadow: '0 12px 24px rgba(249, 115, 22, 0.35)',
                border: '2px solid rgba(249, 115, 22, 0.3)',
              }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span
              style={{
                position: 'absolute',
                bottom: '-2px',
                right: '-2px',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: '#10B981',
                border: '3px solid var(--bg-secondary)',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.4)',
              }}
              title="Active Account"
            />
          </div>

          {/* Name & Role */}
          <div>
            <h3 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--fg)', margin: 0 }}>
              {user?.name || 'User'}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--fg-muted)', margin: '4px 0 10px 0' }}>
              {user?.email}
            </p>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                background: 'rgba(var(--accent-rgb), 0.15)',
                color: 'var(--accent)',
                border: '1px solid rgba(var(--accent-rgb), 0.3)',
              }}
            >
              <ShieldCheck size={13} />
              {user?.role || 'Administrator'}
            </span>
          </div>

          {/* Metadata Section */}
          <div
            style={{
              width: '100%',
              paddingTop: '20px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              fontSize: '13px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--fg-muted)' }}>
              <span>Account Status</span>
              <span style={{ fontWeight: 700, color: '#10B981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} /> Active
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--fg-muted)' }}>
              <span>Base Currency</span>
              <span style={{ fontWeight: 800, color: 'var(--accent)', padding: '2px 8px', borderRadius: '6px', background: 'rgba(var(--accent-rgb), 0.12)' }}>
                {user?.currency || 'INR'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--fg-muted)' }}>
              <span>Member Since</span>
              <span style={{ fontWeight: 600, color: 'var(--fg)' }}>
                {user?.createdAt ? user.createdAt.slice(0, 10) : '2026-09-03'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Personal Info & Password Forms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Personal Information Form */}
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              padding: '28px 32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              boxShadow: 'var(--card-shadow)',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                paddingBottom: '20px',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'rgba(var(--accent-rgb), 0.12)',
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <User size={22} />
              </div>
              <div>
                <h4 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--fg)', margin: 0 }}>
                  Personal Information
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--fg-muted)', margin: '3px 0 0 0' }}>
                  Update your display name and public credentials
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-secondary)' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <div className="input-icon-wrapper">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field input-with-icon"
                    style={{ height: '48px', borderRadius: '12px', fontSize: '14px', width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-secondary)' }}>
                  Email Address (Read-only)
                </label>
                <div style={{ position: 'relative' }}>
                  <div className="input-icon-wrapper">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="input-field input-with-icon"
                    style={{ height: '48px', borderRadius: '12px', fontSize: '14px', width: '100%', opacity: 0.6, cursor: 'not-allowed' }}
                  />
                </div>
                <p style={{ fontSize: '12px', color: 'var(--fg-muted)', margin: '2px 0 0 0' }}>
                  Email address is linked to your primary authentication and cannot be changed directly.
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' }}>
                <Button type="submit" variant="primary" size="md" loading={savingProfile} style={{ height: '46px', padding: '0 24px' }}>
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </div>

          {/* Security & Password Form */}
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              padding: '28px 32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              boxShadow: 'var(--card-shadow)',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                paddingBottom: '20px',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'rgba(249, 115, 22, 0.12)',
                  color: '#F97316',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <KeyRound size={22} />
              </div>
              <div>
                <h4 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--fg)', margin: 0 }}>
                  Security & Password
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--fg-muted)', margin: '3px 0 0 0' }}>
                  Ensure your account is protected with a strong passphrase
                </p>
              </div>
            </div>

            {passwordError && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  color: '#EF4444',
                  fontSize: '13px',
                }}
              >
                {passwordError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-secondary)' }}>
                  Current Password
                </label>
                <div style={{ position: 'relative' }}>
                  <div className="input-icon-wrapper">
                    <KeyRound size={18} />
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="input-field input-with-icon"
                    style={{ height: '48px', borderRadius: '12px', fontSize: '14px', width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-secondary)' }}>
                    New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div className="input-icon-wrapper">
                      <Lock size={18} />
                    </div>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="input-field input-with-icon"
                      style={{ height: '48px', borderRadius: '12px', fontSize: '14px', width: '100%' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-secondary)' }}>
                    Confirm Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div className="input-icon-wrapper">
                      <Lock size={18} />
                    </div>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input-field input-with-icon"
                      style={{ height: '48px', borderRadius: '12px', fontSize: '14px', width: '100%' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' }}>
                <Button type="submit" variant="primary" size="md" loading={changingPassword} style={{ height: '46px', padding: '0 24px' }}>
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
