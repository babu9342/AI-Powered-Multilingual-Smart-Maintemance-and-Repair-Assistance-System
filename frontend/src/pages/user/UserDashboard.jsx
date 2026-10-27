import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../api';
import { getLocalizedCategory, getLocalizedStatus } from '../../i18n';
import VerifiedKnowledgeBaseModal from '../../components/VerifiedKnowledgeBaseModal';

export default function UserDashboard({ setActivePage }) {
  const { user, t, lang } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showKbModal, setShowKbModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const compUrl = user?.id
        ? `/api/complaints?userId=${encodeURIComponent(user.id)}`
        : '/api/complaints';
      const compRes = await apiFetch(compUrl);
      const compData = await compRes.json();
      setComplaints(Array.isArray(compData) ? compData : []);
    } catch (err) {
      console.error('Failed to load user dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeCount = complaints.filter(c => c.status !== 'Completed' && c.status !== 'Resolved').length;
  const completedCount = complaints.filter(c => c.status === 'Completed' || c.status === 'Resolved').length;
  const totalCount = complaints.length;

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto 3rem auto' }}>
      
      {/* Welcome Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <span style={{ fontSize: '0.82rem', color: '#2563eb', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {t('residentPortal')}
          </span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', marginTop: 4, margin: 0 }}>
            {t('welcomeBack')}, {user?.name || 'Resident'} 👋
          </h2>
          <p style={{ fontSize: '0.86rem', color: '#6b7280', margin: '4px 0 0 0' }}>
            {t('roomLocation')}: <strong style={{ color: '#374151' }}>{user?.address || 'Campus Hostel'}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setShowKbModal(true)}
            style={{ padding: '11px 18px', fontSize: '0.9rem', fontWeight: 700, background: '#ffffff', border: '1px solid #bfdbfe', color: '#1d4ed8' }}
          >
            🧠 Verified Knowledge Base
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setActivePage('raise')}
            style={{ padding: '11px 22px', fontSize: '0.92rem', fontWeight: 600 }}
          >
            ⚡ {t('btnNewComplaint')}
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        {/* Active / In Progress */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: 16, borderLeft: '4px solid #f59e0b' }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: '#fffbeb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#b45309',
            fontSize: '1.4rem'
          }}>
            ⚡
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', lineHeight: 1 }}>
              {activeCount}
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#6b7280', marginTop: 4 }}>
              {t('statPending')}
            </div>
          </div>
        </div>

        {/* Resolved */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: 16, borderLeft: '4px solid #10b981' }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: '#f0fdf4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#15803d',
            fontSize: '1.4rem'
          }}>
            ✓
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', lineHeight: 1 }}>
              {completedCount}
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#6b7280', marginTop: 4 }}>
              {t('statResolved')}
            </div>
          </div>
        </div>

        {/* Total */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: 16, borderLeft: '4px solid #2563eb' }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: '#eff6ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1d4ed8',
            fontSize: '1.4rem'
          }}>
            📁
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', lineHeight: 1 }}>
              {totalCount}
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#6b7280', marginTop: 4 }}>
              {t('statTotal')}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Complaints & Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
        {/* Left: Recent Complaints List */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', margin: 0 }}>
              {t('recentComplaints')}
            </h3>
            <button
              className="btn btn-secondary"
              style={{ padding: '4px 12px', fontSize: '0.78rem' }}
              onClick={() => setActivePage('history')}
            >
              {t('viewAll')} ➔
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: '#6b7280' }}>
              Loading complaints...
            </div>
          ) : complaints.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: '#6b7280' }}>
              <div style={{ fontSize: '2.2rem', marginBottom: 8 }}>📋</div>
              <p style={{ fontWeight: 600, color: '#111827', margin: 0 }}>{t('noComplaints')}</p>
              <p style={{ fontSize: '0.82rem', marginTop: 4, color: '#6b7280' }}>
                {t('noComplaintsDesc')}
              </p>
              <button
                className="btn btn-primary"
                onClick={() => setActivePage('raise')}
                style={{ marginTop: 14, padding: '7px 16px', fontSize: '0.84rem' }}
              >
                + {t('btnNewComplaint')}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {complaints.slice(0, 5).map(c => (
                <div
                  key={c.id}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 10,
                    padding: '12px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: '0.75rem', color: '#2563eb', fontFamily: 'monospace', fontWeight: 700 }}>
                        #{c.id}
                      </span>
                      <span className={`badge badge-${c.category || 'other'}`}>
                        {getLocalizedCategory(c.category, lang)}
                      </span>
                    </div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#111827', margin: 0 }}>
                      {c.title || c.description}
                    </h4>
                    <span style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: 2, display: 'inline-block' }}>
                      📍 {c.location}
                    </span>
                  </div>

                  <div style={{ textAlign: 'right', whiteSpace: 'nowrap', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span className={`badge badge-${(c.status || 'Submitted').toLowerCase().replace(/\s+/g, '-')}`}>
                      {getLocalizedStatus(c.status, lang)}
                    </span>
                    {c.assignedTechnician && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        padding: '2px 8px',
                        borderRadius: 12,
                        marginTop: 2
                      }}>
                        <img
                          src={c.assignedTechnician.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.assignedTechnician.name)}&background=2563eb&color=fff&size=40`}
                          alt={c.assignedTechnician.name}
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '1px solid #2563eb'
                          }}
                          onError={e => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(c.assignedTechnician.name)}&background=2563eb&color=fff&size=40`;
                          }}
                        />
                        <span style={{ fontSize: '0.72rem', color: '#374151', fontWeight: 600 }}>
                          {c.assignedTechnician.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Quick Actions Navigation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          
          <div
            className="glass-panel"
            style={{
              padding: '1.25rem',
              cursor: 'pointer',
              border: '1px solid #bfdbfe',
              background: '#eff6ff',
              transition: 'all 0.2s ease'
            }}
            onClick={() => setActivePage('raise')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: '1.8rem' }}>⚡</span>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                  {t('raiseNewComplaint')}
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#4b5563', marginTop: 2, margin: 0 }}>
                  {t('raiseNewComplaintDesc')}
                </p>
              </div>
            </div>
          </div>

          <div
            className="glass-panel"
            style={{
              padding: '1.25rem',
              cursor: 'pointer',
              border: '1px solid #bbf7d0',
              background: '#f0fdf4',
              transition: 'all 0.2s ease'
            }}
            onClick={() => setActivePage('history')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: '1.8rem' }}>📋</span>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                  {t('trackStatus')}
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#4b5563', marginTop: 2, margin: 0 }}>
                  {t('trackStatusDesc')}
                </p>
              </div>
            </div>
          </div>

          <div
            className="glass-panel"
            style={{
              padding: '1.25rem',
              cursor: 'pointer',
              border: '1px solid #bae6fd',
              background: '#f0f9ff',
              transition: 'all 0.2s ease'
            }}
            onClick={() => setActivePage('chat')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: '1.8rem' }}>🤖</span>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                  {t('aiRepairChatbot')}
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#4b5563', marginTop: 2, margin: 0 }}>
                  {t('aiRepairChatbotDesc')}
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {showKbModal && (
        <VerifiedKnowledgeBaseModal onClose={() => setShowKbModal(false)} />
      )}

    </div>
  );
}
