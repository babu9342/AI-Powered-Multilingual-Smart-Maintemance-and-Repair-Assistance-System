import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api';

const categoryColors = {
  electrical: { bg: '#fffbeb', border: '#fde68a', text: '#d97706', icon: '⚡' },
  plumbing:   { bg: '#eff6ff', border: '#bfdbfe', text: '#2563eb', icon: '🚰' },
  infrastructure: { bg: '#faf5ff', border: '#e9d5ff', text: '#9333ea', icon: '🪚' },
  cleaning:   { bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a', icon: '🧹' },
  network:    { bg: '#ecfeff', border: '#a5f3fc', text: '#0891b2', icon: '📶' },
  security:   { bg: '#fef2f2', border: '#fecaca', text: '#dc2626', icon: '🔒' },
  other:      { bg: '#f8fafc', border: '#e2e8f0', text: '#64748b', icon: '⚙️' },
};

function StarRating({ rating }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.4;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
      {Array(full).fill(0).map((_, i) => (
        <span key={`f${i}`} style={{ color: '#f59e0b', fontSize: '0.85rem' }}>★</span>
      ))}
      {half && <span style={{ color: '#f59e0b', fontSize: '0.85rem' }}>½</span>}
      {Array(empty).fill(0).map((_, i) => (
        <span key={`e${i}`} style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>★</span>
      ))}
    </span>
  );
}

export default function TechnicianSelector({ complaintCategory, onSelect, onCancel }) {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [sortBy, setSortBy] = useState('rating');
  const [filterCat, setFilterCat] = useState(complaintCategory || 'all');
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const fetchTechnicians = async () => {
    try {
      const res = await apiFetch('/api/technicians');
      const data = await res.json();
      setTechnicians(data);
    } catch (err) {
      console.error('Fetch technicians error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = technicians
    .filter(t => filterCat === 'all' || t.category === filterCat)
    .sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'experience') return (b.experienceYears || 0) - (a.experienceYears || 0);
      if (sortBy === 'jobs') return (b.completedJobs || 0) - (a.completedJobs || 0);
      return 0;
    });

  const handleConfirmSelect = async () => {
    const tech = technicians.find(t => t.id === selectedId);
    if (!tech) return;
    setIsConfirming(true);
    await onSelect(tech);
    setIsConfirming(false);
  };

  const selectedTech = technicians.find(t => t.id === selectedId);
  const cats = ['all', ...new Set(technicians.map(t => t.category).filter(Boolean))];

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: 16,
      border: '1px solid #e2e8f0',
      padding: '1.75rem',
      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01)',
      animation: 'fadeIn 0.3s ease'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: '1.25rem' }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.4rem'
        }}>👨‍🔧</div>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', margin: 0 }}>
            Technician தேர்வு செய்க
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '2px 0 0' }}>
            Experience &amp; Rating பார்த்து சரியான expert-ஐ select பண்ணுங்க
          </p>
        </div>
      </div>

      {/* Sort + Filter Controls */}
      <div style={{ display: 'flex', gap: 10, marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
          {cats.map(cat => {
            const col = cat !== 'all' ? categoryColors[cat] : null;
            const isActive = filterCat === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCat(cat)}
                style={{
                  padding: '5px 12px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700,
                  border: isActive ? '1px solid #2563eb' : '1px solid #e2e8f0',
                  background: isActive ? '#2563eb' : '#f8fafc',
                  color: isActive ? '#ffffff' : '#475569',
                  cursor: 'pointer', transition: 'all 0.18s', textTransform: 'capitalize'
                }}
              >
                {cat !== 'all' && (categoryColors[cat]?.icon + ' ')}{cat === 'all' ? '🌐 All' : cat}
              </button>
            );
          })}
        </div>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          style={{
            background: '#ffffff', border: '1px solid #cbd5e1',
            borderRadius: 10, color: '#111827', padding: '6px 12px', fontSize: '0.82rem', cursor: 'pointer'
          }}
        >
          <option value="rating">⭐ Sort: Rating</option>
          <option value="experience">🏆 Sort: Experience</option>
          <option value="jobs">✅ Sort: Completed Jobs</option>
        </select>
      </div>

      {/* Technician Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>⏳</div>
          <p>Technicians loading...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
          No technicians available for this category.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {filtered.map(tech => {
            const col = categoryColors[tech.category] || categoryColors.other;
            const isSelected = selectedId === tech.id;
            const isAvailable = tech.status === 'Available';

            return (
              <div
                key={tech.id}
                onClick={() => isAvailable && setSelectedId(tech.id)}
                style={{
                  borderRadius: 14,
                  border: isSelected
                    ? '2px solid #2563eb'
                    : `1px solid ${isAvailable ? '#e2e8f0' : '#f1f5f9'}`,
                  background: isSelected ? '#eff6ff' : (isAvailable ? '#ffffff' : '#f8fafc'),
                  padding: '1.1rem',
                  cursor: isAvailable ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease',
                  opacity: isAvailable ? 1 : 0.6,
                  boxShadow: isSelected
                    ? '0 4px 14px rgba(37,99,235,0.15)'
                    : '0 1px 3px rgba(0,0,0,0.04)',
                  position: 'relative', overflow: 'hidden'
                }}
              >
                {isSelected && (
                  <div style={{
                    position: 'absolute', top: 10, right: 10,
                    width: 24, height: 24, borderRadius: '50%',
                    background: '#2563eb', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.8rem', fontWeight: 800, color: '#fff'
                  }}>✓</div>
                )}

                {/* Avatar + Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <img
                    src={tech.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(tech.name)}&background=2563eb&color=fff&size=80`}
                    alt={tech.name}
                    style={{
                      width: 46, height: 46, borderRadius: '50%', objectFit: 'cover',
                      border: `2px solid ${col.border}`
                    }}
                    onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(tech.name)}&background=2563eb&color=fff&size=80`; }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#111827' }}>{tech.name}</div>
                    <span style={{
                      display: 'inline-block', padding: '2px 8px', borderRadius: 20,
                      fontSize: '0.72rem', fontWeight: 700,
                      background: col.bg, border: `1px solid ${col.border}`,
                      color: col.text, textTransform: 'capitalize', marginTop: 2
                    }}>
                      {col.icon} {tech.category}
                    </span>
                  </div>
                </div>

                {/* Star Rating */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <StarRating rating={tech.rating || 0} />
                  <span style={{ fontWeight: 800, color: '#d97706', fontSize: '0.9rem' }}>
                    {(tech.rating || 0).toFixed(1)}
                  </span>
                  <span style={{ color: '#64748b', fontSize: '0.78rem' }}>
                    ({tech.reviewsCount || 0} reviews)
                  </span>
                </div>

                {/* Stats Row */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <div style={{
                    flex: 1, background: '#f8fafc', borderRadius: 8,
                    padding: '6px 10px', textAlign: 'center', border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#2563eb' }}>{tech.experienceYears || 0}</div>
                    <div style={{ fontSize: '0.67rem', color: '#64748b', fontWeight: 600 }}>YRS EXP</div>
                  </div>
                  <div style={{
                    flex: 1, background: '#f8fafc', borderRadius: 8,
                    padding: '6px 10px', textAlign: 'center', border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#059669' }}>{tech.completedJobs || 0}</div>
                    <div style={{ fontSize: '0.67rem', color: '#64748b', fontWeight: 600 }}>JOBS DONE</div>
                  </div>
                  <div style={{
                    flex: 1, background: '#f8fafc', borderRadius: 8,
                    padding: '6px 10px', textAlign: 'center', border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: isAvailable ? '#059669' : '#dc2626' }}>
                      {isAvailable ? '🟢' : '🔴'}
                    </div>
                    <div style={{ fontSize: '0.67rem', color: '#64748b', fontWeight: 600 }}>
                      {isAvailable ? 'AVAILABLE' : 'BUSY'}
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div style={{ marginTop: 8, fontSize: '0.75rem', color: '#64748b' }}>
                  📍 {tech.location}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Summary + Confirm */}
      {selectedTech && (
        <div style={{
          marginTop: '1.5rem',
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: 14, padding: '1rem 1.25rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 10, animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img
              src={selectedTech.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedTech.name)}&background=10b981&color=fff&size=60`}
              alt={selectedTech.name}
              style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid #10b981' }}
              onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedTech.name)}&background=10b981&color=fff&size=60`; }}
            />
            <div>
              <div style={{ fontWeight: 700, color: '#166534', fontSize: '0.92rem' }}>
                ✅ Selected: {selectedTech.name}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#15803d' }}>
                ⭐ {selectedTech.rating} | {selectedTech.experienceYears} yrs exp | {selectedTech.completedJobs} jobs done
              </div>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-success"
            onClick={handleConfirmSelect}
            disabled={isConfirming}
            style={{ padding: '9px 22px', fontWeight: 800, fontSize: '0.9rem' }}
          >
            {isConfirming ? '⏳ Sending Notification...' : '🔔 Confirm &amp; Notify Technician'}
          </button>
        </div>
      )}

      {/* Cancel */}
      <div style={{ marginTop: '1rem', textAlign: 'right' }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          style={{ padding: '8px 20px', fontSize: '0.85rem' }}
        >
          ← Back to AI Solution
        </button>
      </div>
    </div>
  );
}
