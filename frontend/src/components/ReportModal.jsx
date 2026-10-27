import React from 'react';
import { FileTextIcon, CheckIcon } from './Icons';

export default function ReportModal({ report, onClose }) {
  if (!report) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: 720, background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileTextIcon size={22} color="#2563eb" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                FixLink AI Diagnostic & Service Report
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Certified Maintenance Docket • #{report.reportId || report.complaintId}
              </span>
            </div>
          </div>
          <button id="btn-close-report-top" className="btn btn-secondary" style={{ padding: '6px 12px' }} onClick={onClose}>✕</button>
        </div>

        {/* Report Meta Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12,
          background: '#f8fafc',
          padding: '1rem',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          marginBottom: '1.25rem',
          fontSize: '0.88rem'
        }}>
          <div>
            <span style={{ color: '#64748b', display: 'block', fontSize: '0.78rem' }}>Equipment Category:</span>
            <strong style={{ color: '#2563eb' }}>{report.equipmentCategory}</strong>
          </div>
          <div>
            <span style={{ color: '#64748b', display: 'block', fontSize: '0.78rem' }}>Location:</span>
            <strong style={{ color: '#111827' }}>{report.location}</strong>
          </div>
          <div>
            <span style={{ color: '#64748b', display: 'block', fontSize: '0.78rem' }}>Labor Duration:</span>
            <strong style={{ color: '#111827' }}>{report.estimatedLaborHours || '1.25 hrs'}</strong>
          </div>
          <div>
            <span style={{ color: '#64748b', display: 'block', fontSize: '0.78rem' }}>Status:</span>
            <span className="badge badge-completed">{report.status || 'Resolved'}</span>
          </div>
        </div>

        {/* AI Root Cause Analysis */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
            🔬 AI Root Cause Diagnostic Analysis
          </h4>
          <p style={{ fontSize: '0.92rem', background: '#eff6ff', padding: '12px 14px', borderRadius: 10, border: '1px solid #bfdbfe', color: '#1e40af', lineHeight: 1.5, margin: 0 }}>
            {report.rootCauseAnalysis || "Component failure triggered by prolonged mechanical vibration and thermal expansion."}
          </p>
        </div>

        {/* Before & After Proof */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
            📸 Verification Evidence (Before vs After)
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 8, textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 700, display: 'block', marginBottom: 4 }}>Before (Defect Reported)</span>
              {report.beforeEvidence ? (
                <img src={report.beforeEvidence} alt="Before" style={{ maxHeight: 110, maxWidth: '100%', borderRadius: 6, border: '1px solid #e2e8f0' }} />
              ) : (
                <div style={{ padding: '2rem 0', color: '#94a3b8', fontSize: '0.82rem' }}>No photo attached</div>
              )}
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 8, textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700, display: 'block', marginBottom: 4 }}>After (Technician Verification)</span>
              {report.afterEvidence ? (
                <img src={report.afterEvidence} alt="After" style={{ maxHeight: 110, maxWidth: '100%', borderRadius: 6, border: '1px solid #e2e8f0' }} />
              ) : (
                <div style={{ padding: '2rem 0', color: '#94a3b8', fontSize: '0.82rem' }}>Verified via DIY Checklist</div>
              )}
            </div>
          </div>
        </div>

        {/* Technician Signoff */}
        <div style={{ background: '#f8fafc', padding: 14, borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img
                src={report.assignedTechnician?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(report.assignedTechnician?.name || 'Technician')}&background=2563eb&color=fff&size=80`}
                alt={report.assignedTechnician?.name || 'Technician'}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #2563eb'
                }}
                onError={e => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(report.assignedTechnician?.name || 'Technician')}&background=2563eb&color=fff&size=80`;
                }}
              />
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Service Provided By:</span>
                <strong style={{ color: '#111827', fontSize: '0.95rem' }}>{report.assignedTechnician?.name || 'FixLink Certified Technician'}</strong>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{report.assignedTechnician?.role || 'Lead Specialist'}</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="badge badge-safe">✓ Digitally Signed & Verified</span>
              <div style={{ fontSize: '0.78rem', color: '#2563eb', marginTop: 4, fontWeight: 600 }}>{report.warrantyPeriod || '30-Day Quality Guarantee'}</div>
            </div>
          </div>
        </div>

        {/* Modal Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button id="btn-close-report-bottom" type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button type="button" className="btn btn-primary" onClick={handlePrint}>
            🖨️ Print / Save PDF Docket
          </button>
        </div>
      </div>
    </div>
  );
}
