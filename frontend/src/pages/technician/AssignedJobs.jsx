import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CheckIcon, CameraIcon } from '../../components/Icons';
import { apiFetch } from '../../api';
import { getLocalizedCategory, getLocalizedSeverity, getLocalizedStatus, getLocalizedDiagnosis } from '../../i18n';

export default function AssignedJobs() {
  const { user, lang, t, addToast } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Proof Modal State
  const [activeProofJob, setActiveProofJob] = useState(null);
  const [proofNotes, setProofNotes] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await apiFetch(`/api/complaints?technicianId=${user?.id || 'TECH-102'}`);
      const data = await res.json();
      setJobs(data);
    } catch (err) {
      console.error('Fetch jobs error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptJob = async (jobId) => {
    try {
      const res = await apiFetch(`/api/technicians/jobs/${jobId}/accept`, {
        method: 'POST'
      });
      if (res.ok) {
        addToast(`Job #${jobId} accepted. Client notified.`, 'success');
        fetchJobs();
      }
    } catch (err) {
      console.error('Accept job error:', err);
    }
  };

  const handleRejectJob = async (jobId) => {
    try {
      const res = await apiFetch(`/api/technicians/jobs/${jobId}/reject`, {
        method: 'POST'
      });
      if (res.ok) {
        addToast(`Job #${jobId} declined and returned to queue.`, 'info');
        fetchJobs();
      }
    } catch (err) {
      console.error('Reject job error:', err);
    }
  };

  const handleSetInProgress = async (jobId) => {
    try {
      const res = await apiFetch(`/api/technicians/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'In Progress',
          notes: 'Technician arrived on site and commenced repairs.'
        })
      });
      if (res.ok) {
        addToast(`Job #${jobId} marked In Progress!`, 'success');
        fetchJobs();
      }
    } catch (err) {
      console.error('Status error:', err);
    }
  };

  const handleSubmitProof = async () => {
    if (!activeProofJob) return;
    setIsSubmittingProof(true);

    try {
      let uploadedUrl = null;
      if (proofFile) {
        const formData = new FormData();
        formData.append('file', proofFile);
        const uploadRes = await apiFetch('/api/ai/upload', {
          method: 'POST',
          body: formData
        });
        const uploadData = await uploadRes.json();
        uploadedUrl = uploadData.imageUrl;
      }

      const res = await apiFetch(`/api/technicians/jobs/${activeProofJob.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'Completed',
          notes: proofNotes || 'Repair verified and tested against safety protocols.',
          proofImage: uploadedUrl
        })
      });

      if (res.ok) {
        addToast(`Job #${activeProofJob.id} completed & verified!`, 'success');
        setActiveProofJob(null);
        setProofNotes('');
        setProofFile(null);
        fetchJobs();
      }
    } catch (err) {
      console.error('Complete job error:', err);
      addToast('Failed to complete job', 'error');
    } finally {
      setIsSubmittingProof(false);
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: '3rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '0.82rem', color: '#2563eb', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          FIELD REPAIR QUEUE
        </span>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', marginTop: 2 }}>
          {t('assignedJobsTitle')}
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
          {t('techSubtitle')}
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading assigned jobs...</div>
      ) : jobs.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#64748b', fontSize: '1rem' }}>{t('noJobsAssigned')}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {jobs.map(job => {
            const isAccepted = job.status === 'Accepted';
            const isInProgress = job.status === 'In Progress';
            const isCompleted = job.status === 'Completed' || job.status === 'Resolved';
            const isSubmitted = job.status === 'Submitted' || job.status === 'Assigned';

            return (
              <div key={job.id} className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontFamily: 'monospace', color: '#2563eb', fontWeight: 700 }}>#{job.id}</span>
                      <span className={`badge badge-${job.category}`}>{getLocalizedCategory(job.category, lang)}</span>
                      <span className="badge badge-unsafe">{getLocalizedSeverity(job.severity, lang)}</span>
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111827' }}>{job.title}</h3>
                  </div>
                  <span className={`badge badge-${job.status?.toLowerCase().replace(/\s+/g, '-')}`} style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
                    {getLocalizedStatus(job.status, lang)}
                  </span>
                </div>

                {/* 2-Column Split: Client Info vs AI Diagnostic Summary */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>
                      {t('residentProblemStatement') || (lang === 'ta' ? 'குடியிருப்புவாசி பிரச்சனை விளக்கம்' : 'Resident Problem Statement')}
                    </div>
                    <p style={{ fontSize: '0.9rem', color: '#1f2937', marginBottom: 8, lineHeight: 1.5 }}>{job.description}</p>
                    <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                      <div>📍 <strong>{lang === 'ta' ? 'இருப்பிடம்' : 'Location'}:</strong> {job.location}</div>
                      <div>👤 <strong>{lang === 'ta' ? 'தொடர்பு' : 'Contact'}:</strong> {job.userName || (lang === 'ta' ? 'குடியிருப்புவாசி' : 'Resident')} ({job.userPhone})</div>
                    </div>
                  </div>

                  <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: 10, border: '1px solid #bbf7d0' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase', marginBottom: 6 }}>
                      {t('aiDiagnosticIntelligence') || (lang === 'ta' ? 'AI கண்டறிதல் நுண்ணறிவு' : 'AI Diagnostic Intelligence')}
                    </div>
                    <p style={{ fontSize: '0.88rem', color: '#166534', marginBottom: 6, lineHeight: 1.5 }}>
                      {getLocalizedDiagnosis(job, lang)}
                    </p>
                    {job.imageUrl && (
                      <div style={{ marginTop: 8 }}>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: 4, fontWeight: 600 }}>
                          {lang === 'ta' ? 'பழுது புகைப்படம்:' : 'Damage Photo:'}
                        </span>
                        <img src={job.imageUrl} alt="Defect" style={{ maxHeight: 90, borderRadius: 6, border: '1px solid #cbd5e1' }} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Workflow Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                  {isSubmitted && (
                    <>
                      <button className="btn btn-secondary" onClick={() => handleRejectJob(job.id)}>
                        Decline
                      </button>
                      <button className="btn btn-primary" onClick={() => handleAcceptJob(job.id)}>
                        ✓ {t('btnAccept')}
                      </button>
                    </>
                  )}

                  {isAccepted && (
                    <button className="btn btn-primary" onClick={() => handleSetInProgress(job.id)}>
                      🚀 {t('btnStartProgress')}
                    </button>
                  )}

                  {isInProgress && (
                    <button className="btn btn-success" onClick={() => setActiveProofJob(job)}>
                      ✅ {t('btnCompleteProof')}
                    </button>
                  )}

                  {isCompleted && (
                    <div style={{ color: '#059669', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CheckIcon size={18} color="#059669" /> Service Completed & Verified
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Completion Proof Upload Modal */}
      {activeProofJob && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 500 }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 4, color: '#111827' }}>
              {t('proofModalTitle')}
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Order #{activeProofJob.id} • {activeProofJob.title}
            </p>

            <div className="form-group">
              <label className="form-label">{t('proofNotesLabel')}</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={proofNotes}
                onChange={(e) => setProofNotes(e.target.value)}
                placeholder="e.g. Replaced 1/2 inch PVC coupling and pressure tested. No leaks observed."
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('proofPhotoLabel')}</label>
              <input
                type="file"
                accept="image/*"
                className="form-input"
                onChange={(e) => setProofFile(e.target.files[0])}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setActiveProofJob(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-success"
                disabled={isSubmittingProof}
                onClick={handleSubmitProof}
              >
                {isSubmittingProof ? 'Uploading Proof...' : t('btnSubmitProof')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
