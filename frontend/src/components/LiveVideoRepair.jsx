import React, { useState, useRef, useEffect } from 'react';
import { VideoIcon, CheckIcon, AlertTriangleIcon } from './Icons';
import { speakText } from '../i18n';
import { useAuth } from '../context/AuthContext';

export default function LiveVideoRepair({ guide, onFinish }) {
  const { lang, addToast } = useAuth();
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const steps = guide?.steps || [
    "Verify appliance power switch and wall circuit breaker are in OFF position.",
    "Inspect component casing and tighten any loose mounting screws.",
    "Verify no fluid leaks or bare contact wires.",
    "Restore power and test operation."
  ];

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false
      });
      streamRef.current = stream;
      setIsCameraActive(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => console.warn(e));
        }
      }, 100);
    } catch (err) {
      console.warn('Live camera notice, fallback to AR graphic:', err);
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  const handleSpeakCurrentStep = () => {
    speakText(`Step ${currentStepIdx + 1}: ${steps[currentStepIdx]}`, lang);
    addToast(`Voice guiding step ${currentStepIdx + 1}...`, 'info');
  };

  const nextStep = () => {
    if (currentStepIdx < steps.length - 1) {
      setCurrentStepIdx(currentStepIdx + 1);
    } else {
      addToast('Live Video Repair completed successfully!', 'success');
      if (onFinish) onFinish();
    }
  };

  const isTa = lang === 'ta';

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.4rem' }}>📹</span>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#111827', margin: 0 }}>
              {isTa ? 'நேரடி வீடியோ வழிகாட்டல் சுய பழுதுபார்த்தல்' : 'Live Video Guided Repair Assistant'}
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 700, letterSpacing: '0.04em' }}>
              {isTa ? 'நிகழ்நேர AR வழிகாட்டல் காட்சி' : 'REAL-TIME AR DIAGNOSTIC VIEW'}
            </span>
          </div>
        </div>
        <button type="button" className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.82rem' }} onClick={handleSpeakCurrentStep}>
          🔊 {isTa ? 'படியை உரக்க வாசி' : 'Read Step Out Loud'}
        </button>
      </div>

      {/* Video Viewport with AR Overlay */}
      <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', minHeight: 320, background: '#0f172a', border: '1px solid #e2e8f0' }}>
        {isCameraActive ? (
          <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: 380, objectFit: 'cover' }} />
        ) : (
          <div style={{
            height: 380,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 80%)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: 10 }}>🔧</div>
            <p style={{ fontWeight: 600, color: '#f8fafc' }}>
              {isTa ? 'நேரடி AR பழுதுபார்த்தல் திரை இயக்கத்தில் உள்ளது' : 'Live AR Diagnostic View Active'}
            </p>
            <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
              {isTa ? 'கேமராவை பழுதடைந்த சாதனத்தின் மீது காட்டவும்' : 'Align camera with your damaged equipment'}
            </span>
          </div>
        )}

        {/* Live HUD AR Step Overlay */}
        <div style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          right: 16,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: '12px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <div>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>
              {isTa ? `படி ${currentStepIdx + 1} / மொத்தம் ${steps.length}` : `Action Step ${currentStepIdx + 1} of ${steps.length}`}
            </span>
            <p style={{ fontSize: '0.92rem', fontWeight: 700, color: '#111827', marginTop: 2, margin: 0 }}>
              {steps[currentStepIdx]}
            </p>
          </div>
          <button type="button" className="btn btn-success" style={{ whiteSpace: 'nowrap' }} onClick={nextStep}>
            {currentStepIdx < steps.length - 1 ? (isTa ? 'அடுத்த படி ➔' : 'Next Step ➔') : (isTa ? 'பழுதுபார்த்தல் முடிந்தது ✓' : 'Complete Repair ✓')}
          </button>
        </div>
      </div>
    </div>
  );
}
