import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckIcon, AlertTriangleIcon } from './Icons';
import { apiFetch } from '../api';

export default function AiConfirmBox({ diagnosis, onConfirmed, onRefined }) {
  const { t, lang, addToast } = useAuth();
  const [isRefining, setIsRefining] = useState(false);
  const [userClarification, setUserClarification] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!diagnosis) return null;

  const handleYes = () => {
    addToast('Diagnosis confirmed by user. Passing to AI Safety Engine...', 'success');
    if (onConfirmed) onConfirmed(diagnosis);
  };

  const handleNo = () => {
    setIsRefining(true);
  };

  const submitClarification = async () => {
    if (!userClarification.trim()) {
      addToast('Please describe what is different with your issue.', 'info');
      return;
    }
    setIsLoading(true);
    try {
      const res = await apiFetch('/api/ai/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmed: false,
          additionalNotes: userClarification,
          category: diagnosis.category
        })
      });
      const data = await res.json();
      addToast('AI refined understanding using your feedback.', 'success');
      setIsRefining(false);
      if (onRefined) onRefined(userClarification);
    } catch (err) {
      console.error('Clarification error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{
      background: '#ffffff',
      border: '1px solid #bfdbfe',
      borderRadius: 16,
      padding: '1.5rem',
      marginBottom: '1.5rem',
      position: 'relative',
      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.08)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: '1.4rem' }}>🤖</span>
        <div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827' }}>
            {t('confirmTitle')}
          </h4>
          <span className="badge" style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }}>
            {diagnosis.category?.toUpperCase()} ({Math.round((diagnosis.confidence || 0.95) * 100)}% Confidence)
          </span>
        </div>
      </div>

      {/* AI Explanation & Understanding Question */}
      <div style={{
        background: '#f8fafc',
        borderRadius: 12,
        padding: '14px 18px',
        margin: '12px 0',
        border: '1px solid #e2e8f0'
      }}>
        <p style={{ fontSize: '1rem', fontWeight: 500, color: '#1e293b', lineHeight: 1.6 }}>
          "{diagnosis.explanation || `I detected that your ${diagnosis.category} system has a possible ${diagnosis.possibleIssue}.`}"
        </p>
        <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0284c7', marginTop: 10 }}>
          👉 {diagnosis.confirmationQuestion || t('confirmQuestion')}
        </p>
      </div>

      {/* Decision Buttons (YES / NO) */}
      {!isRefining ? (
        <div style={{ display: 'flex', gap: 12, marginTop: '1rem' }}>
          <button
            type="button"
            className="btn btn-success"
            style={{ flex: 1, padding: '10px 18px', fontSize: '0.95rem' }}
            onClick={handleYes}
          >
            <CheckIcon size={18} color="#fff" /> {t('btnYes')}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ flex: 1, padding: '10px 18px', fontSize: '0.95rem' }}
            onClick={handleNo}
          >
            ✕ {t('btnNo')}
          </button>
        </div>
      ) : (
        /* Clarification form if user clicked NO */
        <div style={{ marginTop: '1rem', animation: 'fadeIn 0.2s ease' }}>
          <label className="form-label" style={{ color: '#d97706' }}>
            Help AI Understand: What looks, sounds, or feels different?
          </label>
          <textarea
            className="form-textarea"
            rows={2}
            value={userClarification}
            onChange={(e) => setUserClarification(e.target.value)}
            placeholder="e.g. Actually the pipe isn't leaking, but the valve handle is stuck and won't turn..."
            style={{ marginBottom: 10 }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsRefining(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={isLoading}
              onClick={submitClarification}
            >
              {isLoading ? 'Updating AI...' : 'Refine & Re-diagnose'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
