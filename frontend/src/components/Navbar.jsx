import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { languages } from '../i18n';
import { WrenchIcon, BellIcon, UserIcon, LogOut } from './Icons';
import { apiFetch } from '../api';

export default function Navbar({ activePage, setActivePage }) {
  const { user, lang, changeLanguage, logout, t, unreadNotifsCount, setUnreadNotifsCount } = useAuth();
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [liveNotifs, setLiveNotifs] = useState([]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await apiFetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setLiveNotifs(data);
        const unread = data.filter(n => !n.isRead).length;
        setUnreadNotifsCount(unread);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const markAllRead = async () => {
    try {
      await apiFetch('/api/notifications/read', {
        method: 'POST'
      });
      setUnreadNotifsCount(0);
      setLiveNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const notificationsList = liveNotifs.length > 0 ? liveNotifs : [
    {
      id: 'default-1',
      title: user?.role === 'technician' ? 'New Job Assigned' : 'Technician Assigned',
      message: user?.role === 'technician' ? 'Plumbing repair in Hostel Block C Washroom.' : 'Suresh Kumar (Plumber) has accepted your request.',
      createdAt: 'Just now'
    }
  ];

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(255, 255, 255, 0.96)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
      padding: '0.85rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => setActivePage('dashboard')}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)'
        }}>
          <WrenchIcon size={20} color="#fff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#111827', margin: 0 }}>
              <span style={{ color: '#2563eb' }}>Fix</span><span style={{ color: '#111827' }}>Link</span>
            </h1>
            <span className="badge" style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', fontSize: '0.72rem' }}>
              ✦ AI Smart Portal
            </span>
          </div>
          <p style={{ fontSize: '0.74rem', color: '#6b7280', margin: 0 }}>{t('tagline')}</p>
        </div>
      </div>

      {/* Navigation Pills */}
      <nav style={{
        display: 'flex',
        gap: 4,
        background: '#f1f5f9',
        padding: '4px',
        borderRadius: 10,
        border: '1px solid #e2e8f0'
      }}>
        {user?.role === 'technician' ? (
          <>
            <button
              id="nav-tech-dashboard"
              className={`btn ${activePage === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                padding: '6px 14px',
                fontSize: '0.84rem',
                borderRadius: 8,
                border: activePage === 'dashboard' ? 'none' : 'transparent',
                background: activePage === 'dashboard' ? 'var(--primary)' : 'transparent',
                color: activePage === 'dashboard' ? '#ffffff' : '#4b5563',
                boxShadow: 'none'
              }}
              onClick={() => setActivePage('dashboard')}
            >
              📊 {t('navDashboard')}
            </button>
            <button
              id="nav-tech-jobs"
              className={`btn ${activePage === 'jobs' ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                padding: '6px 14px',
                fontSize: '0.84rem',
                borderRadius: 8,
                border: activePage === 'jobs' ? 'none' : 'transparent',
                background: activePage === 'jobs' ? 'var(--primary)' : 'transparent',
                color: activePage === 'jobs' ? '#ffffff' : '#4b5563',
                boxShadow: 'none'
              }}
              onClick={() => setActivePage('jobs')}
            >
              🛠️ {t('navTechJobs')}
            </button>
            <button
              id="nav-tech-profile"
              className={`btn ${activePage === 'profile' ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                padding: '6px 14px',
                fontSize: '0.84rem',
                borderRadius: 8,
                border: activePage === 'profile' ? 'none' : 'transparent',
                background: activePage === 'profile' ? 'var(--primary)' : 'transparent',
                color: activePage === 'profile' ? '#ffffff' : '#4b5563',
                boxShadow: 'none'
              }}
              onClick={() => setActivePage('profile')}
            >
              👤 {t('navTechProfile')}
            </button>
          </>
        ) : (
          <>
            <button
              id="nav-user-dashboard"
              className={`btn ${activePage === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                padding: '6px 14px',
                fontSize: '0.84rem',
                borderRadius: 8,
                border: activePage === 'dashboard' ? 'none' : 'transparent',
                background: activePage === 'dashboard' ? 'var(--primary)' : 'transparent',
                color: activePage === 'dashboard' ? '#ffffff' : '#4b5563',
                boxShadow: 'none'
              }}
              onClick={() => setActivePage('dashboard')}
            >
              🏠 {t('navDashboard')}
            </button>
            <button
              id="nav-raise-btn"
              className={`btn ${activePage === 'raise' ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                padding: '6px 14px',
                fontSize: '0.84rem',
                borderRadius: 8,
                border: activePage === 'raise' ? 'none' : 'transparent',
                background: activePage === 'raise' ? 'var(--primary)' : 'transparent',
                color: activePage === 'raise' ? '#ffffff' : '#4b5563',
                boxShadow: 'none'
              }}
              onClick={() => setActivePage('raise')}
            >
              ⚡ {t('navRaiseComplaint')}
            </button>
            <button
              id="nav-chat-btn"
              className={`btn ${activePage === 'chat' ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                padding: '6px 14px',
                fontSize: '0.84rem',
                borderRadius: 8,
                border: activePage === 'chat' ? 'none' : 'transparent',
                background: activePage === 'chat' ? 'var(--primary)' : 'transparent',
                color: activePage === 'chat' ? '#ffffff' : '#4b5563',
                boxShadow: 'none'
              }}
              onClick={() => setActivePage('chat')}
            >
              🤖 {t('navChatAssistant')}
            </button>
            <button
              id="nav-history-btn"
              className={`btn ${activePage === 'history' ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                padding: '6px 14px',
                fontSize: '0.84rem',
                borderRadius: 8,
                border: activePage === 'history' ? 'none' : 'transparent',
                background: activePage === 'history' ? 'var(--primary)' : 'transparent',
                color: activePage === 'history' ? '#ffffff' : '#4b5563',
                boxShadow: 'none'
              }}
              onClick={() => setActivePage('history')}
            >
              📋 {t('navHistory')}
            </button>
          </>
        )}
      </nav>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Language Selector */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: '#ffffff',
          border: '1px solid #d1d5db',
          borderRadius: 8,
          padding: '4px 10px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
        }}>
          <span style={{ fontSize: '0.85rem' }}>🌐</span>
          <select
            id="lang-select"
            value={lang}
            onChange={(e) => changeLanguage(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#111827',
              fontFamily: 'inherit',
              fontSize: '0.84rem',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {languages.map(l => (
              <option key={l.code} value={l.code} style={{ background: '#ffffff', color: '#111827' }}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        {/* Notifications Bell */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn btn-secondary"
            style={{
              padding: '8px 10px',
              borderRadius: 8,
              position: 'relative',
              background: '#ffffff',
              borderColor: '#d1d5db'
            }}
            onClick={() => {
              setShowNotifMenu(!showNotifMenu);
              setUnreadNotifsCount(0);
            }}
          >
            <BellIcon size={18} color="#4b5563" />
            {unreadNotifsCount > 0 && (
              <span style={{
                position: 'absolute',
                top: -4,
                right: -4,
                width: 16,
                height: 16,
                background: '#ef4444',
                borderRadius: '50%',
                fontSize: '0.65rem',
                fontWeight: 700,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {unreadNotifsCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '120%',
              width: 320,
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              padding: '1rem',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
              zIndex: 200
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <strong style={{ fontSize: '0.88rem', color: '#111827' }}>Real-Time Alerts</strong>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  {unreadNotifsCount > 0 && (
                    <span style={{ fontSize: '0.75rem', color: '#10b981', cursor: 'pointer', fontWeight: 600 }} onClick={markAllRead}>
                      Mark Read
                    </span>
                  )}
                  <span style={{ fontSize: '0.8rem', color: '#9ca3af', cursor: 'pointer' }} onClick={() => setShowNotifMenu(false)}>✕</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 260, overflowY: 'auto' }}>
                {notificationsList.map(n => (
                  <div key={n.id} style={{
                    background: n.isRead ? '#f8fafc' : '#eff6ff',
                    padding: 10,
                    borderRadius: 8,
                    border: n.isRead ? '1px solid #f1f5f9' : '1px solid #bfdbfe'
                  }}>
                    <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#111827' }}>{n.title}</div>
                    <div style={{ fontSize: '0.78rem', color: '#4b5563', marginTop: 2 }}>{n.message || n.desc}</div>
                    <div style={{ fontSize: '0.7rem', color: '#2563eb', marginTop: 4, fontWeight: 500 }}>
                      {n.createdAt?.includes('T') ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (n.createdAt || n.time || 'Recently')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Role Pill & Quick Switcher */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: '#ffffff',
          padding: '4px 10px 4px 6px',
          borderRadius: 9999,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
        }}>
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name || 'User'}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                objectFit: 'cover',
                border: `1.5px solid ${user.role === 'technician' ? '#f59e0b' : '#2563eb'}`
              }}
              onError={e => {
                e.target.style.display = 'none';
                if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: user?.role === 'technician' ? '#f59e0b' : '#2563eb',
            color: '#fff',
            display: user?.avatar ? 'none' : 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.78rem',
            fontWeight: 700
          }}>
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#111827' }}>{user?.name}</div>
            <div style={{ fontSize: '0.68rem', color: user?.role === 'technician' ? '#b45309' : '#2563eb', fontWeight: 600 }}>
              {user?.role === 'technician' ? t('technicianRole') : t('userRole')}
            </div>
          </div>

          {/* Prominent Sign Out Button */}
          <button
            id="btn-signout"
            className="btn btn-secondary"
            title={t('logout')}
            style={{
              padding: '5px 10px',
              fontSize: '0.76rem',
              fontWeight: 600,
              marginLeft: 6,
              borderRadius: 'var(--radius-pill)',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              borderColor: '#e2e8f0',
              color: '#dc2626',
              background: '#fef2f2'
            }}
            onClick={logout}
          >
            <LogOut size={13} color="#dc2626" />
            <span>{t('logout')}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
