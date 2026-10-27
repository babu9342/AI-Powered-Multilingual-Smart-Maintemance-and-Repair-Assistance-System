import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { StarIcon, WrenchIcon } from '../../components/Icons';

export default function TechProfile() {
  const { user, t } = useAuth();

  return (
    <div style={{ maxWidth: 750, margin: '0 auto', paddingBottom: '3rem' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, borderBottom: '1px solid #e2e8f0', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
          <img
            src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Technician')}&background=2563eb&color=fff&size=140`}
            alt={user?.name || 'Technician'}
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid #2563eb',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
            }}
            onError={e => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Technician')}&background=2563eb&color=fff&size=140`;
            }}
          />
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827' }}>{user?.name || 'Suresh Kumar'}</h2>
            <span className="badge badge-accepted" style={{ marginTop: 6, display: 'inline-block' }}>Certified Field Technician</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Service Category</span>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#2563eb', marginTop: 4 }}>
              {user?.category?.toUpperCase() || 'PLUMBING'}
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Experience</span>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', marginTop: 4 }}>
              {user?.experienceYears || 8} Years Field Experience
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Verified Rating</span>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#d97706', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <StarIcon size={18} fill="#f59e0b" color="#f59e0b" /> {user?.rating || 4.88} / 5.0
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Completed Repairs</span>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#059669', marginTop: 4 }}>
              {user?.completedJobs || 114} Jobs Closed
            </div>
          </div>
        </div>

        <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 12, border: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div>📍 <strong style={{ color: '#111827' }}>Dispatch Zone:</strong> {user?.location || 'Hostel Zone & Dining Hall'}</div>
          <div>📞 <strong style={{ color: '#111827' }}>Contact:</strong> {user?.phone || '+91 97890 56789'}</div>
          <div>✉️ <strong style={{ color: '#111827' }}>Email:</strong> {user?.email || 'tech@fixlink.ai'}</div>
        </div>
      </div>
    </div>
  );
}
