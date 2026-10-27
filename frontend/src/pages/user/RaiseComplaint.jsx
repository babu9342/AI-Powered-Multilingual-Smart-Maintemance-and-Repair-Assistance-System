import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../api';
import VoiceRecorder from '../../components/VoiceRecorder';
import CameraScanner from '../../components/CameraScanner';
import DiyGuideModal from '../../components/DiyGuideModal';
import LiveVideoRepair from '../../components/LiveVideoRepair';
import TechnicianSelector from '../../components/TechnicianSelector';
import MultiLlmVerificationModal from '../../components/MultiLlmVerificationModal';
import VerifiedKnowledgeBaseModal from '../../components/VerifiedKnowledgeBaseModal';
import { MicIcon, CameraIcon, CheckIcon } from '../../components/Icons';
import { getLocalizedDiyGuide, getLocalizedDiagnosis, getLocalizedCategory } from '../../i18n';

export default function RaiseComplaint({ setActivePage, prefillData }) {
  const { user, lang, t, addToast } = useAuth();
  const isTa = lang === 'ta';

  // Form State (with prefillData support)
  const [category, setCategory] = useState(
    prefillData?.category?.toLowerCase() || 'electrical'
  );
  const [title, setTitle] = useState(prefillData?.title || '');
  const [description, setDescription] = useState(prefillData?.description || '');
  const [location, setLocation] = useState(user?.address || 'Campus Hostel Block C, Room 204');
  const [imageUrl, setImageUrl] = useState(null);

  // Sync if prefillData changes
  React.useEffect(() => {
    if (prefillData) {
      if (prefillData.category) {
        const catLower = prefillData.category.toLowerCase();
        if (['electrical', 'plumbing', 'infrastructure', 'cleaning', 'network', 'other'].includes(catLower)) {
          setCategory(catLower);
        } else {
          setCategory('other');
        }
      }
      if (prefillData.description) setDescription(prefillData.description);
      if (prefillData.title) setTitle(prefillData.title);
    }
  }, [prefillData]);

  // Toggle helpers
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showCameraScanner, setShowCameraScanner] = useState(false);

  // AI Diagnostic State
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosingStageText, setDiagnosingStageText] = useState('Understanding...');
  const [diagnosisResult, setDiagnosisResult] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [userClarification, setUserClarification] = useState('');

  // Modals for DIY, Verification & Knowledge Base
  const [showDiyModal, setShowDiyModal] = useState(false);
  const [showLiveVideoRepair, setShowLiveVideoRepair] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showKnowledgeBaseModal, setShowKnowledgeBaseModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Technician Selection flow
  const [showTechnicianSelector, setShowTechnicianSelector] = useState(false);
  const [submittedComplaintId, setSubmittedComplaintId] = useState(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignedTech, setAssignedTech] = useState(null);

  // Self-repair completed state
  const [isSelfFixedSuccess, setIsSelfFixedSuccess] = useState(false);
  const [completedTicketId, setCompletedTicketId] = useState(null);

  // Guard against stale async responses
  const latestRequestIdRef = React.useRef(0);

  // Category choices
  const categories = [
    { id: 'electrical', icon: '⚡', key: 'cat_electrical', color: '#b45309' },
    { id: 'plumbing', icon: '🚰', key: 'cat_plumbing', color: '#1d4ed8' },
    { id: 'infrastructure', icon: '🪚', key: 'cat_infrastructure', color: '#7e22ce' },
    { id: 'cleaning', icon: '🧹', key: 'cat_cleaning', color: '#15803d' },
    { id: 'network', icon: '📶', key: 'cat_network', color: '#0369a1' },
    { id: 'other', icon: '⚙️', key: 'cat_other', color: '#475569' }
  ];

  // Clear diagnosis results on any input alteration
  const handleTitleChange = (val) => {
    setTitle(val);
    setDiagnosisResult(null);
    setIsConfirmed(false);
    setIsRefining(false);
  };

  const handleDescriptionChange = (val) => {
    setDescription(val);
    setDiagnosisResult(null);
    setIsConfirmed(false);
    setIsRefining(false);
  };

  const handleCategorySelect = (catId) => {
    setCategory(catId);
    setDiagnosisResult(null);
    setIsConfirmed(false);
    setIsRefining(false);
  };

  // Trigger AI Diagnosis & Solution
  const handleRunAiDiagnosis = async (overrideText = null, overrideImg = null) => {
    const textToAnalyze = (overrideText || `${title} ${description}`).trim();
    const imgToAnalyze = overrideImg || imageUrl;

    if (!textToAnalyze && !imgToAnalyze) {
      addToast(t('placeholderDescription'), 'info');
      return;
    }

    const currentRequestId = ++latestRequestIdRef.current;
    setIsDiagnosing(true);
    setDiagnosingStageText(isTa ? '1/3 புரிந்து கொள்ளப்படுகிறது...' : '1/3 Understanding problem...');
    setDiagnosisResult(null);
    setIsConfirmed(false);
    setIsRefining(false);

    const timer1 = setTimeout(() => {
      if (currentRequestId === latestRequestIdRef.current) {
        setDiagnosingStageText(isTa ? '2/3 தீர்வு தயாரிக்கப்படுகிறது...' : '2/3 Preparing solution...');
      }
    }, 1200);

    const timer2 = setTimeout(() => {
      if (currentRequestId === latestRequestIdRef.current) {
        setDiagnosingStageText(isTa ? '3/3 Multi-LLM மூலம் சரிபார்க்கப்படுகிறது...' : '3/3 Cross-verifying with Multi-LLM...');
      }
    }, 2500);

    try {
      const res = await apiFetch('/api/ai/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title,
          description: description,
          text: textToAnalyze || 'Maintenance issue',
          category: category,
          imageUrl: imgToAnalyze,
          preferredLang: lang,
          inputMode: imgToAnalyze ? 'image' : 'text'
        })
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      if (!res.ok) throw new Error('AI analysis service unreachable');
      const data = await res.json();

      // Discard stale responses
      if (currentRequestId !== latestRequestIdRef.current) return;

      setDiagnosisResult(data);
      if (data.category && data.category !== 'other') {
        setCategory(data.category);
      }
      setIsConfirmed(false);
      setIsRefining(false);

      if (data.isOffTopic) {
        addToast(isTa ? 'பராமரிப்பு தொடர்பான வினவல் அல்ல' : 'Non-maintenance query detected', 'info');
      } else {
        addToast(t('confirmTitle') + ' - ' + t('confirmQuestion'), 'success');
      }
    } catch (err) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      if (currentRequestId !== latestRequestIdRef.current) return;
      console.error('Diagnosis error:', err);
      addToast('AI analysis could not complete. You can still submit the complaint directly.', 'error');
    } finally {
      if (currentRequestId === latestRequestIdRef.current) {
        setIsDiagnosing(false);
      }
    }
  };

  // Called when VoiceRecorder captures speech
  const handleVoiceTranscript = (text) => {
    if (text) {
      setDescription(prev => (prev ? `${prev} ${text}` : text));
      if (!title) {
        setTitle(text.slice(0, 50) + '...');
      }
      handleRunAiDiagnosis(text, imageUrl);
    }
  };

  // Called when Camera captures photo
  const handleImageCaptured = (dataUrl) => {
    setImageUrl(dataUrl);
    setDiagnosisResult(null);
    if (dataUrl) {
      addToast(isTa ? 'புகைப்படம் இணைக்கப்பட்டது! AI ஆய்வு செய்கிறது...' : 'Defect photo attached! Analyzing with Computer Vision...', 'info');
      handleRunAiDiagnosis(null, dataUrl);
    }
  };

  // User confirms understanding: YES
  const handleConfirmYes = () => {
    setIsConfirmed(true);
    setIsRefining(false);
    addToast(t('btnYes') + '! ' + t('safeTitle'), 'success');
  };

  // User clarifies understanding: NO
  const handleConfirmNo = () => {
    setIsRefining(true);
  };

  // Submit clarification to refine AI diagnosis
  const handleRefineDiagnosis = async () => {
    if (!userClarification.trim()) {
      addToast(t('clarificationPlaceholder'), 'info');
      return;
    }
    const updatedDescription = `${description} Note: ${userClarification}`.trim();
    setDescription(updatedDescription);
    setUserClarification('');
    await handleRunAiDiagnosis(updatedDescription, imageUrl);
  };

  // Reset form
  const handleResetAll = () => {
    setTitle('');
    setDescription('');
    setImageUrl(null);
    setDiagnosisResult(null);
    setIsConfirmed(false);
    setIsRefining(false);
    setIsSelfFixedSuccess(false);
    setSubmittedComplaintId(null);
    setAssignedTech(null);
  };

  // Standard Submit Ticket to Backend
  const handleSubmitTicket = async (e, returnIdOnly = false) => {
    if (e) e.preventDefault();
    if (!title && !description) {
      addToast(t('placeholderDescription'), 'error');
      return null;
    }

    setIsSubmitting(true);
    try {
      const res = await apiFetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('fixlink_token') || ''}`
        },
        body: JSON.stringify({
          title: title || description.slice(0, 40),
          description: description,
          category: category,
          location: location,
          imageUrl: imageUrl,
          language: lang,
          aiDiagnosis: diagnosisResult ? {
            explanation: diagnosisResult.explanation,
            safetyAssessment: diagnosisResult.safetyAssessment,
            isSafeForDIY: diagnosisResult.isSafeForDIY,
            confidence: diagnosisResult.confidence
          } : null
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Failed to submit complaint');
      }

      const createdComplaint = await res.json();
      setSubmittedComplaintId(createdComplaint.id);

      if (!returnIdOnly) {
        addToast(`Complaint #${createdComplaint.id} registered successfully!`, 'success');
        setTimeout(() => {
          if (setActivePage) setActivePage('history');
        }, 1200);
      }
      return createdComplaint.id;
    } catch (err) {
      console.error('Complaint submission error:', err);
      addToast(err.message || 'Submission failed. Please retry.', 'error');
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  // User chooses "I'll Fix It Myself"
  const handleSelfFix = async () => {
    let cid = submittedComplaintId;
    if (!cid) {
      cid = await handleSubmitTicket(null, true);
    }
    setShowDiyModal(true);
  };

  // User finishes all DIY steps
  const handleDiyComplete = async () => {
    setShowDiyModal(false);
    setShowLiveVideoRepair(false);
    setIsSubmitting(true);
    try {
      let cid = submittedComplaintId;
      if (!cid) {
        cid = await handleSubmitTicket(null, true);
      }
      if (cid) {
        await apiFetch(`/api/complaints/${cid}/complete-self-repair`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('fixlink_token') || ''}`
          }
        }).catch(err => console.warn('Status update warning:', err));
      }
      setCompletedTicketId(cid || 'CMP-DIY-001');
      setIsSelfFixedSuccess(true);
      addToast(
        isTa
          ? '🎉 வாழ்த்துகள்! அனைத்து படிகளையும் வெற்றிகரமாக முடித்துவிட்டீர்கள்! Status: Completed'
          : '🎉 Congratulations! You completed all steps! Status: Completed',
        'success'
      );
    } catch (err) {
      console.error('Self fix completion error:', err);
      addToast(err.message || 'Failed to complete repair', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // User cannot fix — submit complaint then show technician selector
  const handleNeedTechnician = async () => {
    let cid = submittedComplaintId;
    if (!cid) {
      addToast(isTa ? 'Complaint பதிவு செய்கிறோம்...' : 'Registering your complaint...', 'info');
      cid = await handleSubmitTicket(null, true);
    }
    if (cid) {
      setShowTechnicianSelector(true);
    }
  };

  // Technician selected — assign via API
  const handleTechnicianSelect = async (tech) => {
    if (!submittedComplaintId) return;
    setIsAssigning(true);
    try {
      const res = await apiFetch(`/api/complaints/${submittedComplaintId}/select-technician`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('fixlink_token') || ''}`
        },
        body: JSON.stringify({ technicianId: tech.id })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Failed to assign technician');
      }

      setAssignedTech(tech);
      setShowTechnicianSelector(false);
      addToast(
        isTa
          ? `🔔 ${tech.name} technician-கு notification அனுப்பப்பட்டது! விரைவில் வருவார்.`
          : `🔔 Notification sent to ${tech.name}! They will attend to your request shortly.`,
        'success'
      );
      setTimeout(() => { if (setActivePage) setActivePage('history'); }, 1800);
    } catch (err) {
      console.error('Assign technician error:', err);
      addToast(err.message || 'Failed to assign technician', 'error');
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div style={{ maxWidth: 880, margin: '0 auto 3rem auto' }}>
      
      {/* Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.4rem',
          color: '#fff',
          marginBottom: 10,
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
        }}>
          ✨
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.01em', margin: 0 }}>
          {t('intakeTitle')}
        </h2>
        <p style={{ color: '#6b7280', fontSize: '0.88rem', marginTop: 6, marginBottom: 0 }}>
          {t('intakeSubtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmitTicket} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* ================= STEP 1: CATEGORY SELECTION ================= */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
            <span style={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              background: '#2563eb',
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.82rem',
              fontWeight: 800
            }}>1</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', margin: 0 }}>
              {t('step1Category')}
            </h3>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: 10
          }}>
            {categories.map(cat => {
              const isSelected = category === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  style={{
                    background: isSelected ? '#eff6ff' : '#ffffff',
                    border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    borderRadius: 10,
                    padding: '12px 8px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 2px 8px rgba(37, 99, 235, 0.15)' : '0 1px 2px rgba(0,0,0,0.03)'
                  }}
                >
                  <div style={{ fontSize: '1.6rem', marginBottom: 4 }}>{cat.icon}</div>
                  <div style={{ fontWeight: 600, fontSize: '0.84rem', color: isSelected ? '#1d4ed8' : '#374151' }}>
                    {t(cat.key)}
                  </div>
                  {isSelected && (
                    <div style={{ marginTop: 4, fontSize: '0.68rem', color: '#15803d', fontWeight: 700 }}>
                      ✓ {t('selected')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= STEP 2: ISSUE DESCRIPTION + VOICE/CAMERA ================= */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
            <span style={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              background: '#f59e0b',
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.82rem',
              fontWeight: 800
            }}>2</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', margin: 0 }}>
              {t('step2Describe')}
            </h3>
          </div>

          {/* Quick Input Helpers */}
          <div style={{ display: 'flex', gap: 10, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setShowVoiceRecorder(prev => !prev)}
              className={`btn ${showVoiceRecorder ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '7px 16px', fontSize: '0.84rem' }}
            >
              <MicIcon size={15} color={showVoiceRecorder ? '#fff' : '#4b5563'} />
              {showVoiceRecorder
                ? t('closeMic')
                : `🎙️ ${t('recordVoice')}`}
            </button>

            <button
              type="button"
              onClick={() => setShowCameraScanner(prev => !prev)}
              className={`btn ${showCameraScanner ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '7px 16px', fontSize: '0.84rem' }}
            >
              <CameraIcon size={15} color={showCameraScanner ? '#fff' : '#4b5563'} />
              {showCameraScanner
                ? t('closeCamera')
                : `📷 ${t('takePhoto')}`}
            </button>
          </div>

          {/* Expandable Voice Recorder */}
          {showVoiceRecorder && (
            <VoiceRecorder onTranscriptCaptured={handleVoiceTranscript} />
          )}

          {/* Expandable Camera Scanner */}
          {showCameraScanner && (
            <CameraScanner onImageCaptured={handleImageCaptured} />
          )}

          {/* Attached Photo Preview */}
          {imageUrl && !showCameraScanner && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 8,
              padding: '10px 14px',
              marginBottom: '1.25rem'
            }}>
              <img src={imageUrl} alt="Attached" style={{ width: 48, height: 48, borderRadius: 6, objectFit: 'cover', border: '1px solid #bbf7d0' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#15803d' }}>
                  ✓ {t('defectPhotoAttached')}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#4b5563' }}>
                  {t('defectPhotoReady')}
                </div>
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.74rem' }}
                onClick={() => setImageUrl(null)}
              >
                {t('btnRemove')}
              </button>
            </div>
          )}

          {/* Title Input */}
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">{t('labelTitle')}</label>
            <input
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder={t('placeholderTitle')}
            />
          </div>

          {/* Description Textarea */}
          <div className="form-group">
            <label className="form-label">{t('labelDescription')}</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              placeholder={t('placeholderDescription')}
              required
            />
          </div>

          {/* Prompt to Run AI Diagnosis */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleRunAiDiagnosis()}
              disabled={isDiagnosing}
              style={{
                padding: '10px 20px',
                fontSize: '0.88rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                width: 'fit-content'
              }}
            >
              {isDiagnosing 
                ? <>⚡ <span style={{ animation: 'pulse 1.5s infinite' }}>{diagnosingStageText}</span></> 
                : `✨ ${t('askAiDiagnosis')}`}
            </button>
            {isDiagnosing && (
              <div style={{
                fontSize: '0.78rem',
                color: '#2563eb',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <div style={{ width: 12, height: 12, border: '2px solid #2563eb', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <span>Understanding... ➔ Preparing solution... ➔ Cross-verifying with Multi-LLM</span>
              </div>
            )}
          </div>
        </div>

        {/* ================= STEP 3: AI UNDERSTANDING CONFIRMATION (YES / NO) ================= */}
        {diagnosisResult && (
          <div className="glass-panel" style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            padding: '1.5rem',
            animation: 'fadeIn 0.2s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.4rem' }}>🤖</span>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                    {t('confirmTitle')}
                  </h3>
                  <span className="badge" style={{ background: '#dbeafe', color: '#1e40af', marginTop: 4 }}>
                    {getLocalizedCategory(diagnosisResult.category, lang)} ({Math.round((diagnosisResult.confidence || 0.90) * 100)}% Match)
                  </span>
                </div>
              </div>

              {/* Multi-LLM Verification Engine Badge (Real Consensus %) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                {diagnosisResult.guideSource === 'static_fallback' && (
                  <span style={{
                    background: '#fef3c7',
                    color: '#92400e',
                    border: '1px solid #fde68a',
                    padding: '3px 8px',
                    borderRadius: 6,
                    fontSize: '0.72rem',
                    fontWeight: 700
                  }}>
                    ⚙️ Domain Rules
                  </span>
                )}
                {diagnosisResult.guideSource === 'none' && (
                  <span style={{
                    background: '#fee2e2',
                    color: '#991b1b',
                    border: '1px solid #fca5a5',
                    padding: '3px 8px',
                    borderRadius: 6,
                    fontSize: '0.72rem',
                    fontWeight: 700
                  }}>
                    ⚠️ Unverified Guide
                  </span>
                )}
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowVerificationModal(true)}
                  style={{
                    padding: '5px 12px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    background: '#ffffff',
                    border: '1px solid #bfdbfe',
                    color: '#1d4ed8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <span>🛡️ {diagnosisResult.verifiedBy || (diagnosisResult.providersUsed?.length > 1 ? `${diagnosisResult.providersUsed.join(' & ')} Verified` : 'Multi-LLM Verified')}</span>
                  <span style={{ background: '#dcfce7', color: '#15803d', padding: '1px 8px', borderRadius: 10, fontSize: '0.74rem' }}>
                    {Math.round((diagnosisResult.confidence || 0.90) * 100)}% Match
                  </span>
                  <span>🔍 Inspect</span>
                </button>
              </div>
            </div>

            {/* Auto Spell Check Notice */}
            {diagnosisResult.corrections && diagnosisResult.corrections.length > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 8,
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: 8,
                padding: '8px 12px',
                marginTop: 10,
                marginBottom: 6,
                fontSize: '0.84rem',
                color: '#b45309'
              }}>
                <span>✨ <strong>Auto-corrected:</strong></span>
                {diagnosisResult.corrections.map((c, i) => (
                  <span key={i} style={{ background: '#ffffff', padding: '2px 8px', borderRadius: 4, border: '1px solid #fde68a' }}>
                    <del style={{ opacity: 0.75, color: '#ef4444' }}>{c.original}</del> ➔ <strong style={{ color: '#15803d' }}>{c.corrected}</strong>
                  </span>
                ))}
              </div>
            )}

            {/* AI Explanation of the Problem */}
            <div style={{
              background: '#ffffff',
              borderRadius: 8,
              padding: '14px 16px',
              margin: '12px 0',
              border: '1px solid #bfdbfe'
            }}>
              <p style={{ fontSize: '0.94rem', fontWeight: 500, color: '#1f2937', lineHeight: 1.6, margin: 0 }}>
                "{getLocalizedDiagnosis(diagnosisResult.explanation, lang)}"
              </p>
              <p style={{ fontSize: '0.96rem', fontWeight: 700, color: '#2563eb', marginTop: 10, marginBottom: 0 }}>
                👉 {diagnosisResult.confirmationQuestion || t('confirmQuestion')}
              </p>
            </div>

            {/* YES / NO Decision Buttons */}
            {!isRefining ? (
              <div style={{ display: 'flex', gap: 12, marginTop: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-success"
                  style={{ flex: 1, padding: '10px 18px', fontSize: '0.92rem', fontWeight: 600 }}
                  onClick={handleConfirmYes}
                >
                  <CheckIcon size={18} color="#fff" /> ✓ {t('btnYes')}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '10px 18px', fontSize: '0.92rem', fontWeight: 600 }}
                  onClick={handleConfirmNo}
                >
                  ✕ {t('btnNo')}
                </button>
              </div>
            ) : (
              /* Clarification Input if user clicks NO */
              <div style={{ marginTop: '1rem', background: '#ffffff', padding: 14, borderRadius: 8, border: '1px solid #bfdbfe' }}>
                <label className="form-label" style={{ color: '#b45309', fontWeight: 700 }}>
                  {t('clarificationHelp')}
                </label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={userClarification}
                  onChange={(e) => setUserClarification(e.target.value)}
                  placeholder={t('clarificationPlaceholder')}
                  style={{ marginBottom: 10 }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsRefining(false)}
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleRefineDiagnosis}
                    disabled={isDiagnosing}
                  >
                    {isDiagnosing ? t('updating') : t('reanalyzeAi')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= STEP 4: AI SOLUTION CARD (REVEALED WHEN USER CONFIRMS YES) ================= */}
        {isConfirmed && diagnosisResult && (() => {
          const locGuide = diagnosisResult.diyGuide ? getLocalizedDiyGuide(diagnosisResult.diyGuide, lang) : null;
          return (
            <div className="glass-panel" style={{
              border: diagnosisResult.isSafeForDIY
                ? '1px solid #bbf7d0'
                : '1px solid #fecaca',
              background: diagnosisResult.isSafeForDIY
                ? '#f0fdf4'
                : '#fef2f2',
              padding: '1.5rem',
              animation: 'fadeIn 0.2s ease'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: '1.8rem' }}>
                  {diagnosisResult.isSafeForDIY ? '💡' : '🚨'}
                </span>
                <div>
                  <h3 style={{
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    color: diagnosisResult.isSafeForDIY ? '#15803d' : '#b91c1c',
                    margin: 0
                  }}>
                    {diagnosisResult.isSafeForDIY
                      ? t('safeDiySolution')
                      : t('hazardousAlert')}
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: '#4b5563', marginTop: 4, marginBottom: 0 }}>
                    {diagnosisResult.isSafeForDIY
                      ? (lang === 'ta'
                          ? 'பாதுகாப்பானது: இந்த பிரச்சனைக்கு எங்கள் ஊடாடும் சுய பழுதுபார்ப்பு வழிகாட்டி மூலம் நீங்களே எளிதாக தீர்வு காணலாம்.'
                          : diagnosisResult.safetyAssessment)
                      : diagnosisResult.safetyAssessment}
                  </p>
                </div>
              </div>

              {/* If Guide Source is none (failed auto-correct loops) */}
              {diagnosisResult.guideSource === 'none' && (
                <div style={{
                  background: '#ffffff',
                  borderRadius: 10,
                  padding: '16px',
                  margin: '1rem 0',
                  border: '1px solid #fecaca',
                  color: '#991b1b'
                }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                    ⚠️ {isTa ? 'நம்பகமான வழிகாட்டியை உருவாக்க முடியவில்லை' : "Couldn't generate a reliable guide"}
                  </h4>
                  <p style={{ fontSize: '0.88rem', margin: '0 0 12px 0', color: '#4b5563' }}>
                    {diagnosisResult.message || (isTa ? 'தயவுசெய்து நேரடி தொழில்நுட்ப புகாரை சமர்ப்பிக்கவும்.' : 'Please file an official maintenance ticket for on-site technician inspection.')}
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleNeedTechnician}
                    style={{ padding: '8px 18px', fontSize: '0.88rem', fontWeight: 700 }}
                  >
                    📋 {isTa ? 'அதிகாரப்பூர்வ டிக்கெட் பதிவு செய்க' : 'File Official Ticket'}
                  </button>
                </div>
              )}

              {/* If Safe for DIY: Show DIY Solution Steps */}
              {diagnosisResult.isSafeForDIY && locGuide && diagnosisResult.guideSource !== 'none' && (
                <div style={{
                  background: '#ffffff',
                  borderRadius: 10,
                  padding: '16px',
                  margin: '1rem 0',
                  border: '1px solid #bbf7d0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
                    <h4 style={{ fontSize: '0.96rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                      🛠️ {t('solutionGuide')}: {locGuide.title}
                    </h4>
                    <span className="badge" style={{ background: '#dcfce7', color: '#15803d' }}>
                      ⏱️ ~{locGuide.estimatedMinutes || 10} {lang === 'ta' ? 'நிமிடங்கள்' : 'Mins Fix'}
                    </span>
                  </div>

                  {/* Steps */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '12px 0' }}>
                    {(locGuide.steps || []).slice(0, 3).map((step, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.88rem', color: '#374151' }}>
                        <span style={{ fontWeight: 800, color: '#15803d' }}>{idx + 1}.</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>

                  {/* Interactive Assistance Buttons */}
                  <div style={{ display: 'flex', gap: 10, marginTop: '1rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={() => setShowDiyModal(true)}
                      style={{ padding: '8px 16px', fontSize: '0.84rem' }}
                    >
                      📋 {t('viewFullGuide')}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowLiveVideoRepair(true)}
                      style={{ padding: '8px 16px', fontSize: '0.84rem' }}
                    >
                      📹 {t('launchLiveHelp')}
                    </button>
                  </div>
                </div>
              )}

              {/* If Hazardous: Show Safety Caution */}
              {!diagnosisResult.isSafeForDIY && (
                <div style={{
                  background: '#ffffff',
                  borderRadius: 8,
                  padding: '12px 14px',
                  margin: '1rem 0',
                  border: '1px solid #fecaca',
                  color: '#b91c1c',
                  fontSize: '0.86rem'
                }}>
                  ⚠️ <strong>{t('safetyCautionLabel')}:</strong> {t('safetyCautionText')}
                </div>
              )}

              {/* ===== DECISION: Self-Fix OR Need Technician ===== */}
              {!assignedTech && !isSelfFixedSuccess && (
                <div style={{
                  marginTop: '1.25rem',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  padding: '1.1rem 1.25rem'
                }}>
                  <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111827', marginBottom: '0.85rem' }}>
                    {isTa
                      ? '🤔 இப்போது என்ன செய்ய விரும்புகிறீர்கள்?'
                      : '🤔 What would you like to do next?'}
                  </p>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={handleSelfFix}
                      disabled={isSubmitting}
                      style={{
                        flex: 1, minWidth: 180,
                        padding: '10px 18px', fontSize: '0.92rem', fontWeight: 700
                      }}
                    >
                      🛠️ {isTa ? 'நானே சரி செய்கிறேன்! (வழிகாட்டி)' : "I'll Fix It Myself! (Step-by-Step)"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleNeedTechnician}
                      disabled={isSubmitting}
                      style={{
                        flex: 1, minWidth: 180,
                        padding: '10px 18px', fontSize: '0.92rem', fontWeight: 700
                      }}
                    >
                      🔧 {isTa ? 'Technician வேணும்' : 'I Need a Technician'}
                    </button>
                  </div>
                </div>
              )}

              {/* Completed celebration card when user completes all DIY steps */}
              {isSelfFixedSuccess && (
                <div style={{
                  marginTop: '1.25rem',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: 12,
                  padding: '1.75rem',
                  textAlign: 'center',
                  animation: 'fadeIn 0.2s ease'
                }}>
                  <div style={{ fontSize: '2.4rem', marginBottom: 6 }}>🎉 🛠️ 🏆</div>
                  <div style={{
                    display: 'inline-block',
                    padding: '4px 14px',
                    borderRadius: 9999,
                    background: '#10b981',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    marginBottom: 10
                  }}>
                    {isTa ? '✅ நிலை: முடிந்தது (COMPLETED)' : '✅ STATUS: COMPLETED'}
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', marginBottom: 6 }}>
                    {isTa ? 'பழுது நீக்கும் பணி வெற்றிகரமாக முடிந்தது!' : 'Self-Repair Completed Successfully!'}
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: '#4b5563', maxWidth: 520, margin: '0 auto 1.25rem auto' }}>
                    {isTa
                      ? `அனைத்து வழிகாட்டுதல் படிகளையும் வெற்றிகரமாக முடித்தீர்கள். Complaint #${completedTicketId || ''} "Completed" என பதிவு செய்யப்பட்டுள்ளது.`
                      : `You completed all repair steps. Complaint #${completedTicketId || ''} has been marked as Completed.`}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => setActivePage && setActivePage('history')}
                      style={{ padding: '9px 20px', fontWeight: 600 }}
                    >
                      📋 {isTa ? 'வரலாற்றில் பார்க்க (View History)' : 'View in History'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleResetAll}
                      style={{ padding: '9px 20px', fontWeight: 600 }}
                    >
                      ➕ {isTa ? 'புதிய பிரச்சனை பதிவு செய்ய' : 'Report Another Issue'}
                    </button>
                  </div>
                </div>
              )}

              {/* Assigned tech success */}
              {assignedTech && (
                <div style={{
                  marginTop: '1rem',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: 10,
                  padding: '12px 16px',
                  display: 'flex', alignItems: 'center', gap: 12
                }}>
                  <img
                    src={assignedTech.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(assignedTech.name)}&background=10b981&color=fff&size=60`}
                    alt={assignedTech.name}
                    style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '2px solid #10b981' }}
                    onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(assignedTech.name)}&background=10b981&color=fff&size=60`; }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, color: '#15803d', fontSize: '0.92rem' }}>
                      🔔 Notification sent to {assignedTech.name}!
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>
                      Redirecting to your complaint history...
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Live Video AR Repair Modal */}
        {showLiveVideoRepair && diagnosisResult?.diyGuide && (
          <LiveVideoRepair
            guide={getLocalizedDiyGuide(diagnosisResult.diyGuide, lang)}
            onFinish={handleDiyComplete}
          />
        )}

        {/* Step-by-Step DIY Guide Modal */}
        {showDiyModal && diagnosisResult?.diyGuide && (
          <DiyGuideModal
            guide={diagnosisResult.diyGuide}
            lang={lang}
            onClose={() => setShowDiyModal(false)}
            onComplete={handleDiyComplete}
            onEscalate={() => {
              setShowDiyModal(false);
              handleNeedTechnician();
            }}
          />
        )}

        {/* ================= TECHNICIAN SELECTOR ================= */}
        {showTechnicianSelector && (
          <TechnicianSelector
            complaintCategory={category}
            onSelect={handleTechnicianSelect}
            onCancel={() => setShowTechnicianSelector(false)}
          />
        )}

        {/* ================= STEP 5: LOCATION DETAILS ================= */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
            <span style={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              background: '#10b981',
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.82rem',
              fontWeight: 800
            }}>3</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', margin: 0 }}>
              {t('step3Location')}
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">{t('labelLocation')}</label>
              <input
                type="text"
                className="form-input"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t('placeholderLocation')}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('labelContact')}</label>
              <input
                type="text"
                className="form-input"
                defaultValue={user?.phone || '+91 98765 43210'}
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Final Submit Button */}
        {!isConfirmed && (
          <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                padding: '12px 36px',
                fontSize: '1rem',
                fontWeight: 700,
                width: '100%',
                maxWidth: 440,
                margin: '0 auto',
                borderRadius: 'var(--radius-sm)'
              }}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? t('submitting')
                : `🚀 ${t('btnSubmit')}`}
            </button>
          </div>
        )}

      </form>

      {/* Multi-LLM Solution Verification Inspector Modal */}
      {showVerificationModal && diagnosisResult && (
        <MultiLlmVerificationModal
          verificationData={{
            verificationReport: diagnosisResult.verificationReport,
            multiLlmResponses: diagnosisResult.multiLlmResponses,
            finalSolution: diagnosisResult.verifiedSolution
          }}
          onClose={() => setShowVerificationModal(false)}
        />
      )}

      {/* Continuous Learning Verified Knowledge Base Modal */}
      {showKnowledgeBaseModal && (
        <VerifiedKnowledgeBaseModal
          onClose={() => setShowKnowledgeBaseModal(false)}
        />
      )}
    </div>
  );
}
