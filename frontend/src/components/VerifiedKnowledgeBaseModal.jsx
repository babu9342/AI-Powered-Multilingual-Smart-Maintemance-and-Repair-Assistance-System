import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api';

const categoryBadges = {
  electrical: { bg: '#fffbeb', color: '#d97706', border: '#fde68a', icon: '⚡' },
  plumbing:   { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe', icon: '🚰' },
  network:    { bg: '#ecfeff', color: '#0891b2', border: '#a5f3fc', icon: '📶' },
  infrastructure: { bg: '#faf5ff', color: '#9333ea', border: '#e9d5ff', icon: '🪚' },
  cleaning:   { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', icon: '🧹' },
  security:   { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', icon: '🔒' },
  general:    { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0', icon: '⚙️' }
};

export default function VerifiedKnowledgeBaseModal({ onClose }) {
  const [knowledgeList, setKnowledgeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchKnowledgeBase();
  }, [selectedCategory]);

  const fetchKnowledgeBase = async () => {
    setLoading(true);
    try {
      let url = '/api/ai/knowledge-base';
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (searchQuery.trim()) params.append('q', searchQuery.trim());
      if (params.toString()) url += `?${params.toString()}`;

      const res = await apiFetch(url);
      const data = await res.json();
      setKnowledgeList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch knowledge base:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchKnowledgeBase();
  };

  const categories = ['all', 'electrical', 'plumbing', 'network', 'infrastructure', 'cleaning', 'security'];

  return (
    <div className="modal-overlay" style={{ alignItems: 'flex-start', paddingTop: '3vh', overflowY: 'auto' }}>
      <div className="modal-content" style={{ maxWidth: 840, width: '100%', margin: '0 auto', maxHeight: '94vh', overflowY: 'auto', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
              🧠
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                Continuous Learning Verified Knowledge Base
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Repository of AI Verified &amp; User Feedback Approved Maintenance Solutions
              </span>
            </div>
          </div>
          <button className="btn btn-secondary" style={{ padding: '6px 12px' }} onClick={onClose}>✕</button>
        </div>

        {/* Search Bar & Category Filter */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="form-input"
            style={{ flex: 1, minWidth: 200 }}
            placeholder="Search verified solutions (e.g. tap leak, fan capacitor, router wifi)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '8px 18px' }}>
            🔍 Search
          </button>
        </form>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {categories.map(cat => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '5px 14px',
                  borderRadius: 20,
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  border: isActive ? '1px solid #2563eb' : '1px solid #e2e8f0',
                  background: isActive ? '#2563eb' : '#f8fafc',
                  color: isActive ? '#ffffff' : '#475569',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat === 'all' ? '🌐 All Verified' : `${(categoryBadges[cat] || {}).icon || '🔧'} ${cat}`}
              </button>
            );
          })}
        </div>

        {/* Knowledge List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading verified solutions repository...</div>
        ) : knowledgeList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>No verified solutions found matching your query.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: '1.5rem' }}>
            {knowledgeList.map(item => {
              const badge = categoryBadges[item.category] || categoryBadges.general;
              const isExpanded = expandedId === item.id;
              const vScorePct = Math.round((item.verificationScore || 0.95) * 100);

              return (
                <div
                  key={item.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 14,
                    padding: '1.25rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{
                          background: badge.bg,
                          color: badge.color,
                          border: `1px solid ${badge.border}`,
                          padding: '2px 8px',
                          borderRadius: 12,
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          textTransform: 'uppercase'
                        }}>
                          {badge.icon} {item.category}
                        </span>
                        <span className="badge badge-safe" style={{ fontSize: '0.72rem' }}>
                          ✓ {vScorePct}% Multi-LLM Verified
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 700 }}>
                          ⭐ {item.userRating || 5.0} ({item.successCount || 1} Resolved)
                        </span>
                      </div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                        {item.title}
                      </h4>
                    </div>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '4px 12px', fontSize: '0.78rem' }}
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    >
                      {isExpanded ? 'Hide Steps ▲' : 'View Verified Steps ▼'}
                    </button>
                  </div>

                  <p style={{ fontSize: '0.88rem', color: '#4b5563', margin: '4px 0 8px 0' }}>
                    <strong style={{ color: '#111827' }}>Root Cause:</strong> {item.identifiedProblem}
                  </p>

                  {/* Expanded Procedure */}
                  {isExpanded && (
                    <div style={{
                      marginTop: 12,
                      paddingTop: 12,
                      borderTop: '1px solid #e2e8f0',
                      animation: 'fadeIn 0.2s ease'
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                        <div style={{ background: '#f8fafc', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                          <strong style={{ color: '#059669', fontSize: '0.78rem', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                            Required Tools:
                          </strong>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {(item.requiredTools || []).map((t, i) => (
                              <span key={i} style={{ background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: 12, fontSize: '0.75rem' }}>{t}</span>
                            ))}
                          </div>
                        </div>

                        <div style={{ background: '#fef2f2', padding: 10, borderRadius: 8, border: '1px solid #fecaca' }}>
                          <strong style={{ color: '#dc2626', fontSize: '0.78rem', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                            Safety Mandate:
                          </strong>
                          <span style={{ fontSize: '0.78rem', color: '#991b1b' }}>
                            {(item.safetyInstructions || [])[0] || 'Shut off main breaker / valve before repair.'}
                          </span>
                        </div>
                      </div>

                      <div style={{ background: '#eff6ff', padding: '10px 14px', borderRadius: 10, border: '1px solid #bfdbfe' }}>
                        <strong style={{ color: '#1d4ed8', fontSize: '0.82rem', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                          Verified Step-by-Step Resolution:
                        </strong>
                        <ol style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.86rem', color: '#1e3a8a', lineHeight: 1.5 }}>
                          {(item.verifiedSolution || []).map((step, i) => (
                            <li key={i} style={{ marginBottom: 3 }}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} style={{ padding: '8px 20px' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
