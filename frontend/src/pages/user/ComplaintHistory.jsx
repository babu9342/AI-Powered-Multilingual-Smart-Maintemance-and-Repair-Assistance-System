import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../../context/AuthContext';
import { StarIcon, FileTextIcon } from '../../components/Icons';
import ReportModal from '../../components/ReportModal';
import { apiFetch } from '../../api';
import { getLocalizedCategory, getLocalizedSeverity, getLocalizedStatus, getLocalizedDiagnosis } from '../../i18n';

export default function ComplaintHistory({ setActivePage }) {
  const { user, lang, t, addToast } = useAuth();
  const [activeTab, setActiveTab] = useState('complaints'); // 'complaints' | 'ai_chat'
  const [complaints, setComplaints] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);

  // Feedback Modal State
  const [feedbackComplaint, setFeedbackComplaint] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const stages = [
    t('statusSubmitted') || (lang === 'ta' ? 'சமர்ப்பிக்கப்பட்டது' : 'Submitted'),
    t('statusAccepted') || (lang === 'ta' ? 'ஏற்கப்பட்டது' : 'Accepted'),
    t('statusInProgress') || (lang === 'ta' ? 'வேலை நடக்கிறது' : 'In Progress'),
    t('statusCompleted') || (lang === 'ta' ? 'முடிக்கப்பட்டது' : 'Completed')
  ];

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const compUrl = user?.id ? `/api/complaints?userId=${encodeURIComponent(user.id)}` : '/api/complaints';
      const [compRes, chatRes] = await Promise.all([
        apiFetch(compUrl).catch(() => ({ ok: false })),
        apiFetch('/api/chat/history').catch(() => ({ ok: false }))
      ]);

      if (compRes.ok) {
        const compData = await compRes.json();
        setComplaints(Array.isArray(compData) ? compData : []);
      }
      if (chatRes.ok) {
        const chatData = await chatRes.json();
        setChatHistory(Array.isArray(chatData) ? chatData : []);
      }
    } catch (err) {
      console.error('Failed to load history data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReport = async (complaintId) => {
    try {
      const res = await apiFetch(`/api/reports/${complaintId}`);
      const data = await res.json();
      setSelectedReport(data);
    } catch (err) {
      console.error('Failed to generate report:', err);
      addToast('Failed to load AI report', 'error');
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackComplaint) return;
    try {
      const res = await apiFetch(`/api/complaints/${feedbackComplaint.id}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rating, comment })
      });
      if (res.ok) {
        addToast('Feedback & star rating recorded! Thank you.', 'success');
        setFeedbackComplaint(null);
        fetchData();
      }
    } catch (err) {
      console.error('Feedback error:', err);
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: '3rem' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <span style={{ fontSize: '0.82rem', color: '#2563eb', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            TRACKING & AUDIT LOG
          </span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', marginTop: 2 }}>
            Maintenance & AI History
          </h2>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => setActivePage('chat')}>
            🤖 AI Troubleshooter
          </button>
          <button className="btn btn-primary" onClick={() => setActivePage('raise')}>
            ⚡ New Complaint
          </button>
        </div>
      </div>

      {/* Segmented Tab Switcher */}
      <div style={{
        display: 'flex',
        background: '#f1f5f9',
        padding: 4,
        borderRadius: 12,
        border: '1px solid #e2e8f0',
        marginBottom: '1.5rem',
        width: 'fit-content'
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('complaints')}
          style={{
            background: activeTab === 'complaints' ? '#2563eb' : 'transparent',
            color: activeTab === 'complaints' ? '#ffffff' : '#475569',
            border: 'none',
            borderRadius: 8,
            padding: '8px 18px',
            fontSize: '0.88rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: activeTab === 'complaints' ? '0 2px 6px rgba(37,99,235,0.25)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          📋 Official Complaints ({complaints.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ai_chat')}
          style={{
            background: activeTab === 'ai_chat' ? '#2563eb' : 'transparent',
            color: activeTab === 'ai_chat' ? '#ffffff' : '#475569',
            border: 'none',
            borderRadius: 8,
            padding: '8px 18px',
            fontSize: '0.88rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: activeTab === 'ai_chat' ? '0 2px 6px rgba(37,99,235,0.25)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          🤖 AI Diagnostic Logs ({chatHistory.length})
        </button>
      </div>

      {/* TAB 1: Official Complaints */}
      {activeTab === 'complaints' && (
        loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading tickets...</div>
        ) : complaints.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: '#64748b', fontSize: '1rem' }}>No maintenance complaints filed yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {complaints.map(c => {
              const isCompleted = c.status === 'Completed' || c.status === 'Resolved';
              let currentStageIdx = 0;
              if (c.status === 'Submitted') currentStageIdx = 0;
              else if (c.status === 'Accepted') currentStageIdx = 1;
              else if (c.status === 'In Progress') currentStageIdx = 2;
              else if (isCompleted) currentStageIdx = 3;

              return (
                <div key={c.id} className="glass-panel" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontFamily: 'monospace', color: '#2563eb', fontSize: '0.88rem', fontWeight: 700 }}>#{c.id}</span>
                        <span className={`badge badge-${c.category}`}>{getLocalizedCategory(c.category, lang)}</span>
                        <span className={`badge ${c.isSafeForDIY ? 'badge-safe' : 'badge-unsafe'}`}>
                          {getLocalizedSeverity(c.isSafeForDIY ? 'Safe DIY' : 'Certified Tech Dispatched', lang)}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111827' }}>{c.title || c.description}</h3>
                      <p style={{ fontSize: '0.9rem', color: '#4b5563', marginTop: 4 }}>{c.description}</p>
                    </div>
                    <span className={`badge badge-${c.status?.toLowerCase().replace(/\s+/g, '-')}`} style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
                      {getLocalizedStatus(c.status, lang)}
                    </span>
                  </div>

                  {/* Multi-step timeline progress bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', margin: '1.5rem 0 1rem 0' }}>
                    <div style={{ position: 'absolute', top: 13, left: 20, right: 20, height: 2, background: '#e2e8f0', zIndex: 1 }} />
                    {stages.map((stage, idx) => {
                      const done = idx < currentStageIdx || isCompleted;
                      const current = idx === currentStageIdx && !isCompleted;
                      return (
                        <div key={stage} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
                          <div style={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            background: done ? '#10b981' : current ? '#2563eb' : '#ffffff',
                            border: `2px solid ${done ? '#10b981' : current ? '#2563eb' : '#cbd5e1'}`,
                            color: done || current ? '#ffffff' : '#64748b',
                            fontSize: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            boxShadow: current ? '0 0 0 4px rgba(37,99,235,0.15)' : 'none'
                          }}>
                            {done ? '✓' : idx + 1}
                          </div>
                          <span style={{ fontSize: '0.75rem', marginTop: 6, color: current ? '#2563eb' : done ? '#059669' : '#64748b', fontWeight: current ? 700 : 500 }}>
                            {stage}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer details */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid #e2e8f0',
                    paddingTop: '1rem',
                    marginTop: '0.5rem',
                    fontSize: '0.82rem',
                    color: '#64748b',
                    flexWrap: 'wrap',
                    gap: 10
                  }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span>📍 {c.location}</span>
                      <span>🕒 {new Date(c.createdAt).toLocaleDateString()}</span>
                      {c.assignedTechnician && (
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          padding: '4px 10px',
                          borderRadius: 20
                        }}>
                          <img
                            src={c.assignedTechnician.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.assignedTechnician.name)}&background=2563eb&color=fff&size=50`}
                            alt={c.assignedTechnician.name}
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '1.5px solid #2563eb'
                            }}
                            onError={e => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(c.assignedTechnician.name)}&background=2563eb&color=fff&size=50`;
                            }}
                          />
                          <span style={{ color: '#111827', fontWeight: 600 }}>
                            {c.assignedTechnician.name}
                          </span>
                          <span style={{ color: '#64748b', fontSize: '0.75rem' }}>
                            ({c.assignedTechnician.phone || '+91 98450 12345'})
                          </span>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      {/* View Formal AI Report */}
                      <button
                        type="button"
                        data-testid="btn-open-report"
                        className="btn btn-secondary btn-open-report"
                        style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                        onClick={() => handleOpenReport(c.id)}
                      >
                        <FileTextIcon size={14} /> AI Report
                      </button>

                      {/* Star Rating Button for completed jobs */}
                      {isCompleted && (
                        c.feedback ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#d97706', fontWeight: 600 }}>
                            <StarIcon size={16} fill="#f59e0b" color="#f59e0b" /> {c.feedback.rating}/5 Rated
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-primary"
                            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                            onClick={() => setFeedbackComplaint(c)}
                          >
                            ★ Rate Service
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* TAB 2: AI Diagnostic History */}
      {activeTab === 'ai_chat' && (
        chatHistory.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: '#64748b', fontSize: '1rem' }}>No AI troubleshooting sessions recorded yet.</p>
            <button className="btn btn-primary" onClick={() => setActivePage('chat')} style={{ marginTop: '1rem' }}>
              🤖 Start AI Diagnostics
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {chatHistory.map((item, idx) => (
              <div key={item.id || idx} className="glass-panel" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: item.role === 'user' ? '#2563eb' : '#059669',
                    background: item.role === 'user' ? '#eff6ff' : '#ecfdf5',
                    border: `1px solid ${item.role === 'user' ? '#bfdbfe' : '#a7f3d0'}`,
                    padding: '3px 10px',
                    borderRadius: 12
                  }}>
                    {item.role === 'user' ? '👤 Resident Query' : `🤖 AI Assistant (${item.provider || 'FixLink AI'})`}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Recent'}
                  </span>
                </div>
                <div style={{ fontSize: '0.92rem', color: '#1f2937', lineHeight: 1.6 }}>
                  <ReactMarkdown>{item.content}</ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Feedback & Star Rating Modal */}
      {feedbackComplaint && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 450, textAlign: 'center' }}>
            {feedbackComplaint.assignedTechnician && (
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                <img
                  src={feedbackComplaint.assignedTechnician.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(feedbackComplaint.assignedTechnician.name)}&background=2563eb&color=fff&size=80`}
                  alt={feedbackComplaint.assignedTechnician.name}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid #10b981',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
                  }}
                  onError={e => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(feedbackComplaint.assignedTechnician.name)}&background=2563eb&color=fff&size=80`;
                  }}
                />
              </div>
            )}
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 4, color: '#111827' }}>
              Rate Technician &amp; Service
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '1.25rem' }}>
              How was your repair experience with <strong>{feedbackComplaint.assignedTechnician?.name || 'our service technician'}</strong>?
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, margin: '1rem 0' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}
                  onClick={() => setRating(star)}
                >
                  <StarIcon
                    size={32}
                    color="#f59e0b"
                    fill={star <= rating ? '#f59e0b' : 'none'}
                  />
                </button>
              ))}
            </div>

            <div className="form-group" style={{ textAlign: 'left' }}>
              <label className="form-label">Feedback Comments (Optional)</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Technician arrived promptly and fixed the pipe joint cleanly."
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: '1.25rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setFeedbackComplaint(null)}>
                Cancel
              </button>
              <button type="button" className="btn btn-success" onClick={handleSubmitFeedback}>
                Submit Rating
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Report Modal */}
      {selectedReport && (
        <ReportModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </div>
  );
}
