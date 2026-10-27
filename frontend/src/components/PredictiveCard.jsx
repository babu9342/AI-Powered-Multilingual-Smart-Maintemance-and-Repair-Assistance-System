import React from 'react';
import { AlertTriangleIcon } from './Icons';

export default function PredictiveCard({ alert, onAction }) {
  if (!alert) return null;

  return (
    <div style={{
      background: '#fffbeb',
      border: '1px solid #fde68a',
      borderRadius: 14,
      padding: '1.25rem',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 2px 6px rgba(245, 158, 11, 0.08)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangleIcon size={18} color="#d97706" />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            AI Predictive Maintenance Warning
          </span>
        </div>
        <span className="badge badge-unsafe" style={{ fontSize: '0.72rem' }}>
          {alert.severity || 'Critical Failure Risk'}
        </span>
      </div>

      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#92400e', marginBottom: 4 }}>
        {alert.item} in {alert.location}
      </h4>

      <p style={{ fontSize: '0.9rem', color: '#78350f', lineHeight: 1.5, marginBottom: 10 }}>
        "{alert.message}"
      </p>

      <div style={{
        background: '#ffffff',
        border: '1px solid #fde68a',
        padding: '8px 12px',
        borderRadius: 8,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.85rem',
        marginBottom: 10
      }}>
        <span style={{ color: '#64748b' }}>Proactive Savings:</span>
        <strong style={{ color: '#059669' }}>{alert.estimatedCostSaved || '₹ 2,800'}</strong>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontSize: '0.78rem', color: '#92400e' }}>
          💡 {alert.recommendation}
        </span>
        {onAction && (
          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: '5px 12px', fontSize: '0.78rem', whiteSpace: 'nowrap', borderColor: '#fde68a', color: '#92400e' }}
            onClick={() => onAction(alert)}
          >
            Order Replacement
          </button>
        )}
      </div>
    </div>
  );
}
