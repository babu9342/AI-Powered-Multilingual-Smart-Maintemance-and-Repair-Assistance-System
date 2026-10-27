import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n';
import { apiFetch } from '../api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('fixlink_token') || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('fixlink_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [lang, setLang] = useState(() => localStorage.getItem('fixlink_lang') || 'en');
  const [toasts, setToasts] = useState([]);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(2);


  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem('fixlink_lang', newLang);
  };



  const parseResponse = async (res) => {
    try {
      return await res.json();
    } catch (e) {
      if (res.status === 502 || res.status === 504 || res.status === 500) {
        return { detail: 'Backend server is unreachable or offline (Port 8000). Please start the backend server: python -m uvicorn backend.main:app --port 8000' };
      }
      return { detail: `Server returned error (${res.status} ${res.statusText || 'Error'}). Please check backend.` };
    }
  };

  const login = async (email, password, role = 'user') => {
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });
      const data = await parseResponse(res);
      if (!res.ok) {
        throw new Error(data.detail || 'Login failed');
      }
      setToken(data.accessToken);
      setUser(data.user);
      localStorage.setItem('fixlink_token', data.accessToken);
      localStorage.setItem('fixlink_user', JSON.stringify(data.user));
      addToast(`Welcome, ${data.user.name}! Signed in as ${data.user.role}.`, 'success');
      return data;
    } catch (err) {
      addToast(err.message || 'Unable to connect to server', 'error');
      throw err;
    }
  };

  const registerUser = async (formData) => {
    try {
      const res = await apiFetch('/api/auth/register/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await parseResponse(res);
      if (!res.ok) {
        throw new Error(data.detail || 'Registration failed');
      }
      addToast('Registration successful! Please sign in with your email and password.', 'success');
      return data;
    } catch (err) {
      addToast(err.message || 'Unable to connect to server', 'error');
      throw err;
    }
  };

  const registerTechnician = async (formData) => {
    try {
      const res = await apiFetch('/api/auth/register/technician', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await parseResponse(res);
      if (!res.ok) {
        throw new Error(data.detail || 'Technician registration failed');
      }
      addToast('Technician profile registered! Please sign in to access your dispatch console.', 'success');
      return data;
    } catch (err) {
      addToast(err.message || 'Unable to connect to server', 'error');
      throw err;
    }
  };

  const forgotPassword = async (email, role = 'user') => {
    try {
      const res = await apiFetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role })
      });
      const data = await parseResponse(res);
      if (!res.ok) {
        throw new Error(data.detail || 'Unable to process forgot password request');
      }
      addToast(`OTP generated: ${data.otp}`, 'info');
      return data;
    } catch (err) {
      addToast(err.message || 'Unable to connect to server', 'error');
      throw err;
    }
  };

  const resetPassword = async (email, newPassword, role = 'user', otp = '') => {
    try {
      const res = await apiFetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword, role, otp })
      });
      const data = await parseResponse(res);
      if (!res.ok) {
        throw new Error(data.detail || 'Password reset failed');
      }
      addToast('Password updated successfully! Please sign in with your new password.', 'success');
      return data;
    } catch (err) {
      addToast(err.message || 'Unable to connect to server', 'error');
      throw err;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('fixlink_token');
    localStorage.removeItem('fixlink_user');
    addToast('Signed out successfully. Session closed.', 'info');
  };


  const t = (key) => {
    return (translations[lang] && translations[lang][key]) || (translations.en && translations.en[key]) || key;
  };

  return (
    <AuthContext.Provider value={{
      token,
      user,
      lang,
      changeLanguage,
      login,
      registerUser,
      registerTechnician,
      forgotPassword,
      resetPassword,
      logout,
      addToast,
      t,
      unreadNotifsCount,
      setUnreadNotifsCount
    }}>
      {children}

      {/* Global Toast Toaster */}
      <div style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        pointerEvents: 'none'
      }}>
        {toasts.map(toast => (
          <div key={toast.id} style={{
            background: '#ffffff',
            border: toast.type === 'error' ? '1px solid #fecaca' : toast.type === 'success' ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
            borderRadius: 12,
            padding: '12px 18px',
            color: '#111827',
            fontSize: '0.88rem',
            fontWeight: 500,
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            animation: 'fadeIn 0.2s ease',
            pointerEvents: 'auto'
          }}>
            <span>{toast.type === 'success' ? '✅' : toast.type === 'error' ? '⚠️' : 'ℹ️'}</span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
