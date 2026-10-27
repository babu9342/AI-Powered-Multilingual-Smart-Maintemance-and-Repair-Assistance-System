import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function UserProfile() {
  const { user, lang, changeLanguage, t, logout } = useAuth();

  return (
    <div style={{ maxWidth: 750, margin: '0 auto', paddingBottom: '2rem' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, borderBottom: '1px solid #e2e8f0', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            fontWeight: 800,
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
          }}>
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827' }}>{user?.name || 'Babu M'}</h2>
            <span className="badge badge-safe" style={{ marginTop: 6, display: 'inline-block' }}>Registered Campus Resident</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Account Role</span>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#2563eb', marginTop: 4 }}>
              Resident / End User
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Assigned Room / Unit</span>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', marginTop: 4 }}>
              {user?.address || 'Hostel Block C, Room 204'}
            </div>
          </div>
        </div>

        <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 12, border: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#334155', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>📞 <strong style={{ color: '#111827' }}>Registered Phone:</strong> {user?.phone || '+91 98765 43210'}</div>
          <div>✉️ <strong style={{ color: '#111827' }}>Email Address:</strong> {user?.email || 'user@fixlink.ai'}</div>
          <div>🌐 <strong style={{ color: '#111827' }}>Preferred Language:</strong> {lang.toUpperCase()}</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-danger" onClick={logout}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
