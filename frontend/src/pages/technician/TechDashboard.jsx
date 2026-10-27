import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { WrenchIcon, CheckIcon } from '../../components/Icons';
import { apiFetch } from '../../api';
import { getLocalizedCategory, getLocalizedSeverity, getLocalizedStatus } from '../../i18n';

export default function TechDashboard({ setActivePage }) {
  const { user, lang, t, addToast } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [isAvailable, setIsAvailable] = useState(user?.status !== 'Busy');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTechJobs();
  }, []);

  const fetchTechJobs = async () => {
    try {
      const res = await apiFetch(`/api/complaints?technicianId=${user?.id || 'TECH-102'}`);
      const data = await res.json();
      setJobs(data);
    } catch (err) {
      console.error('Failed to load tech jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async () => {
    const nextStatus = isAvailable ? 'Busy' : 'Available';
    try {
      const res = await apiFetch(`/api/technicians/status?status=${nextStatus}`, {
        method: 'PATCH'
      });
      if (res.ok) {
        setIsAvailable(!isAvailable);
        addToast(`Availability set to ${nextStatus}`, 'info');
      } else {
        addToast('Failed to update status on server', 'error');
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
      addToast('Network error updating status', 'error');
    }
  };

  const activeJobs = jobs.filter(j => j.status !== 'Completed' && j.status !== 'Resolved');
  const completedJobs = jobs.filter(j => j.status === 'Completed' || j.status === 'Resolved');

  return (
    <div style={{ maxWidth: 1050, margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Header & Status Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img
            src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Technician')}&background=2563eb&color=fff&size=100`}
            alt={user?.name || 'Technician'}
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2.5px solid #2563eb',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
            }}
            onError={e => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Technician')}&background=2563eb&color=fff&size=100`;
            }}
          />
          <div>
            <span style={{ fontSize: '0.82rem', color: '#2563eb', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              TECHNICIAN DISPATCH HUB
            </span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', marginTop: 2 }}>
              Welcome, {user?.name || 'Suresh Kumar'} 🛠️
            </h2>
            <span style={{ fontSize: '0.88rem', color: '#64748b' }}>
              Specialty: <strong style={{ color: '#111827' }}>{user?.category?.toUpperCase() || 'PLUMBING'}</strong> • {user?.experienceYears || 8} Years Exp
            </span>
          </div>
        </div>

        {/* Availability Switch */}
        <div className="glass-panel" style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>DISPATCH STATUS</div>
            <strong style={{ color: isAvailable ? '#059669' : '#dc2626', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>●</span> {isAvailable ? 'Ready for New Jobs' : 'Currently Busy'}
            </strong>
          </div>
          <button
            className={`btn ${isAvailable ? 'btn-danger' : 'btn-success'}`}
            style={{ padding: '6px 14px', fontSize: '0.82rem' }}
            onClick={handleToggleAvailability}
          >
            {isAvailable ? 'Set Busy' : 'Set Available'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', fontSize: '1.4rem' }}>
            ⚡
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827' }}>{activeJobs.length}</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Assigned Orders</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#ecfdf5', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', fontSize: '1.4rem' }}>
            ✓
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827' }}>{completedJobs.length + 114}</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Completed Repairs</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#fffbeb', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706', fontSize: '1.4rem' }}>
            ★
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827' }}>{user?.rating || 4.88}</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Client Rating</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7', fontSize: '1.4rem' }}>
            ⏱️
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827' }}>18 min</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Avg Response Time</div>
          </div>
        </div>
      </div>

      {/* Active Jobs Queue */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#111827' }}>
            Active Assigned Orders ({activeJobs.length})
          </h3>
          <button
            className="btn btn-secondary"
            style={{ padding: '5px 14px', fontSize: '0.8rem' }}
            onClick={() => setActivePage('jobs')}
          >
            Open Job Console ➔
          </button>
        </div>

        {activeJobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
            🎉 You have no pending repair orders. Great job!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {activeJobs.map(job => (
              <div
                key={job.id}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: '14px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12
                }}
              >
                <div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontFamily: 'monospace', color: '#2563eb', fontSize: '0.85rem', fontWeight: 700 }}>#{job.id}</span>
                    <span className={`badge badge-${job.category}`}>{getLocalizedCategory(job.category, lang)}</span>
                    <span className="badge badge-unsafe">{getLocalizedSeverity(job.severity, lang)}</span>
                  </div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827' }}>{job.title}</h4>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 4 }}>
                    📍 <strong>{lang === 'ta' ? 'இருப்பிடம்' : 'Location'}:</strong> {job.location} • 👤 <strong>{lang === 'ta' ? 'தொடர்பு' : 'Client'}:</strong> {job.userName || (lang === 'ta' ? 'குடியிருப்புவாசி' : 'Resident')} ({job.userPhone})
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span className={`badge badge-${job.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                    {getLocalizedStatus(job.status, lang)}
                  </span>
                  <button
                    className="btn btn-primary"
                    style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                    onClick={() => setActivePage('jobs')}
                  >
                    View & Progress ➔
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
