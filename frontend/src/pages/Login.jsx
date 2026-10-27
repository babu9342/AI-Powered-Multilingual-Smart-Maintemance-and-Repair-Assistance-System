import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { WrenchIcon, KeyIcon, LockIcon } from '../components/Icons';

export default function Login({ onSwitchToRegister, initialEmail = '', initialRole = 'user' }) {
  const { login, forgotPassword, resetPassword, t, addToast } = useAuth();
  const [isForgotView, setIsForgotView] = useState(false);
  const [role, setRole] = useState(initialRole || 'user');
  const [email, setEmail] = useState(initialEmail || (initialRole === 'technician' ? 'tech@fixlink.ai' : 'user@fixlink.ai'));
  const [password, setPassword] = useState(initialEmail ? '' : 'password123');
  const [isLoading, setIsLoading] = useState(false);

  // Forgot / Reset Password state
  const [forgotStep, setForgotStep] = useState(1); // 1 = request OTP, 2 = enter OTP & new password
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password, role);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      addToast('Please enter your registered email address', 'error');
      return;
    }
    setIsLoading(true);
    try {
      const data = await forgotPassword(email, role);
      if (data && data.otp) {
        setResetOtp(data.otp);
        setForgotStep(2);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 4) {
      addToast('New password must be at least 4 characters long', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('Passwords do not match! Please check and retry.', 'error');
      return;
    }
    setIsLoading(true);
    try {
      await resetPassword(email, newPassword, role, resetOtp);
      setPassword(newPassword);
      setIsForgotView(false);
      setForgotStep(1);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = (selectedRole) => {
    setRole(selectedRole);
    if (selectedRole === 'technician') {
      setEmail('tech@fixlink.ai');
      setPassword('password123');
      addToast('Filled demo credentials for Master Plumber Suresh Kumar', 'info');
    } else {
      setEmail('user@fixlink.ai');
      setPassword('password123');
      addToast('Filled demo credentials for Resident Babu M', 'info');
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: '2.5rem auto 0 auto', padding: '0 1rem' }}>
      <div className="glass-panel" style={{ padding: '2.5rem 2rem' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: isForgotView
              ? 'linear-gradient(135deg, #0ea5e9, #2563eb)'
              : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            marginBottom: 12,
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
          }}>
            {isForgotView ? <KeyIcon size={24} color="#fff" /> : <WrenchIcon size={26} color="#fff" />}
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', margin: 0 }}>
            {isForgotView ? 'Reset Your Password' : 'Sign in to FixLink'}
          </h2>
          <p style={{ fontSize: '0.86rem', color: '#6b7280', marginTop: 6, marginBottom: 0 }}>
            {isForgotView
              ? 'Verify your registered email to set a new password'
              : 'AI-Powered Multilingual Smart Maintenance Portal'}
          </p>
        </div>

        {initialEmail && !isForgotView && (
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 8,
            padding: '10px 14px',
            marginBottom: '1.5rem',
            color: '#15803d',
            fontSize: '0.84rem',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <span>✓</span>
            <span>Registration completed! Please authenticate with your password to continue.</span>
          </div>
        )}

        {/* Role Tabs */}
        <div style={{
          display: 'flex',
          gap: 4,
          background: '#f1f5f9',
          padding: 4,
          borderRadius: 10,
          marginBottom: '1.5rem',
          border: '1px solid #e2e8f0'
        }}>
          <button
            type="button"
            className="btn"
            style={{
              flex: 1,
              padding: '8px 14px',
              fontSize: '0.86rem',
              borderRadius: 8,
              border: role === 'user' ? 'none' : 'transparent',
              background: role === 'user' ? 'var(--primary)' : 'transparent',
              color: role === 'user' ? '#ffffff' : '#4b5563',
              boxShadow: role === 'user' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              fontWeight: 600
            }}
            onClick={() => setRole('user')}
          >
            👤 Resident User
          </button>
          <button
            type="button"
            className="btn"
            style={{
              flex: 1,
              padding: '8px 14px',
              fontSize: '0.86rem',
              borderRadius: 8,
              border: role === 'technician' ? 'none' : 'transparent',
              background: role === 'technician' ? '#f59e0b' : 'transparent',
              color: role === 'technician' ? '#ffffff' : '#4b5563',
              boxShadow: role === 'technician' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              fontWeight: 600
            }}
            onClick={() => setRole('technician')}
          >
            🛠️ Field Technician
          </button>
        </div>

        {/* FORGOT PASSWORD VIEW */}
        {isForgotView ? (
          <div>
            {forgotStep === 1 ? (
              <form onSubmit={handleRequestOtp}>
                <div className="form-group">
                  <label className="form-label">Registered Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. user@fixlink.ai"
                    required
                  />
                  <small style={{ color: '#6b7280', fontSize: '0.78rem', marginTop: 4, display: 'block' }}>
                    We will verify your account and generate a 6-digit reset code.
                  </small>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    marginTop: '0.75rem',
                    padding: '11px',
                    fontSize: '0.92rem'
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? 'Generating Code...' : 'Send Verification OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword}>
                <div style={{
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  padding: '10px 14px',
                  borderRadius: 8,
                  marginBottom: '1rem',
                  fontSize: '0.82rem',
                  color: '#1d4ed8'
                }}>
                  Verification code generated for <strong>{email}</strong>.
                </div>

                <div className="form-group">
                  <label className="form-label">6-Digit Verification Code (OTP)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value)}
                    placeholder="e.g. 123456"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 4 characters"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-success"
                  style={{
                    width: '100%',
                    marginTop: '0.75rem',
                    padding: '11px',
                    fontSize: '0.92rem'
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating Password...' : 'Save New Password & Sign In'}
                </button>
              </form>
            )}

            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ width: '100%', padding: '9px' }}
                onClick={() => {
                  setIsForgotView(false);
                  setForgotStep(1);
                }}
              >
                ← Back to Sign In
              </button>
            </div>
          </div>
        ) : (
          /* STANDARD SIGN IN VIEW */
          <div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. name@fixlink.ai"
                  required
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">Password</label>
                  <span
                    style={{
                      fontSize: '0.8rem',
                      color: '#2563eb',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      marginBottom: 4,
                      fontWeight: 500
                    }}
                    onClick={() => {
                      setIsForgotView(true);
                      setForgotStep(1);
                    }}
                  >
                    Forgot Password?
                  </span>
                </div>
                <input
                  type="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  width: '100%',
                  marginTop: '0.75rem',
                  padding: '11px',
                  fontSize: '0.94rem',
                  background: role === 'technician' ? '#f59e0b' : 'var(--primary)',
                  borderColor: role === 'technician' ? '#f59e0b' : 'var(--primary)'
                }}
                disabled={isLoading}
              >
                {isLoading ? 'Authenticating...' : `Sign In as ${role === 'technician' ? 'Field Technician' : 'Resident User'}`}
              </button>
            </form>

            {/* Quick Demo Credentials Assistant */}
            <div style={{
              marginTop: '1.5rem',
              padding: '12px 14px',
              background: '#f8fafc',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              fontSize: '0.8rem'
            }}>
              <span style={{ color: '#2563eb', fontWeight: 600, display: 'block', marginBottom: 8 }}>
                💡 Quick Demo Credentials (1-Click Fill):
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '6px 10px', fontSize: '0.76rem', background: '#ffffff' }}
                  onClick={() => handleQuickDemo('user')}
                >
                  👤 User: Babu M
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '6px 10px', fontSize: '0.76rem', background: '#ffffff' }}
                  onClick={() => handleQuickDemo('technician')}
                >
                  🛠️ Tech: Suresh Kumar
                </button>
              </div>
            </div>

            {/* Footer Register Link */}
            <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.86rem', color: '#6b7280' }}>
              Don't have an account?{' '}
              <span
                style={{ color: '#2563eb', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                onClick={onSwitchToRegister}
              >
                Register here
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
