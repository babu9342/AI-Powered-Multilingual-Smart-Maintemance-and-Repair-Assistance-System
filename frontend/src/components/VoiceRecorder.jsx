import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { MicIcon } from './Icons';

export default function VoiceRecorder({ onTranscriptCaptured }) {
  const { lang, addToast } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [micStatus, setMicStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [isPermissionDenied, setIsPermissionDenied] = useState(false);

  const recognitionRef = useRef(null);
  const streamRef = useRef(null);

  const langCodeMap = {
    en: 'en-IN',
    ta: 'ta-IN',
    hi: 'hi-IN',
    te: 'te-IN',
    ml: 'ml-IN',
    kn: 'kn-IN'
  };

  const isTa = lang === 'ta';

  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, []);

  const requestBrowserPermission = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        setShowPermissionModal(false);
        setIsPermissionDenied(false);
        addToast(isTa ? 'மைக்ரோஃபோன் அனுமதி வழங்கப்பட்டது! இப்போது பேசலாம்.' : 'Microphone permission granted! Starting...', 'success');
        startRecordingDirect();
      } else {
        throw new Error('getUserMedia not available');
      }
    } catch (err) {
      console.warn('Microphone permission request error:', err);
      setIsPermissionDenied(true);
      const permMsg = isTa
        ? 'மைக்ரோஃபோன் அனுமதி மறுக்கப்பட்டுள்ளது. முகவரிப் பட்டியில் (URL Bar) உள்ள 🔒 ஐகானை கிளிக் செய்து Microphone-ஐ Allow செய்யவும்.'
        : 'Microphone access is blocked. Please click the 🔒 icon in the browser URL bar and set Microphone to Allow.';
      setErrorMessage(permMsg);
      addToast(permMsg, 'error');
    }
  };

  const startRecordingDirect = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicStatus('unsupported');
      const errUnsupported = isTa
        ? 'இந்த உலாவியில் பேச்சு அறிதல் ஆதரிக்கப்படவில்லை. Google Chrome அல்லது Edge பயன்படுத்தவும்.'
        : 'Speech recognition is not supported in this browser. Please use Google Chrome or Edge.';
      setErrorMessage(errUnsupported);
      addToast(errUnsupported, 'info');
      return;
    }

    try {
      const recognizer = new SpeechRecognition();
      recognizer.continuous = true;
      recognizer.interimResults = true;
      recognizer.lang = langCodeMap[lang] || 'ta-IN';

      recognizer.onresult = (event) => {
        let interimText = '';
        let finalText = '';

        for (let i = 0; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalText += event.results[i][0].transcript + ' ';
          } else {
            interimText += event.results[i][0].transcript;
          }
        }

        const fullText = (finalText + interimText).trim();
        if (fullText) {
          setTranscript(fullText);
          if (onTranscriptCaptured) {
            onTranscriptCaptured(fullText);
          }
        }
      };

      recognizer.onerror = (event) => {
        console.warn('Speech recognition error event:', event.error);
        if (event.error === 'no-speech') return;
        if (event.error === 'not-allowed') {
          setIsPermissionDenied(true);
          setShowPermissionModal(true);
          setErrorMessage(isTa ? 'மைக்ரோஃபோன் அனுமதி மறுக்கப்பட்டுள்ளது.' : 'Microphone access was blocked.');
          setMicStatus('error');
          stopRecording();
        }
      };

      recognizer.onend = () => {
        if (isRecording) {
          try {
            recognizer.start();
          } catch (e) {}
        }
      };

      recognizer.start();
      recognitionRef.current = recognizer;
      setIsRecording(true);
      setMicStatus('recording');
      addToast(isTa ? 'மைக்ரோஃபோன் தயார்! உங்கள் மொழியில் பேசவும்...' : 'Microphone active! Speak now in your language...', 'info');
    } catch (err) {
      console.error('Failed to initialize speech recognition:', err);
      setErrorMessage('Failed to start speech recognition.');
      setMicStatus('error');
      stopRecording();
    }
  };

  const handleToggle = async () => {
    if (isRecording) {
      stopRecording();
      return;
    }

    // Always show popup modal if stream is not already active to request explicit permission
    if (!streamRef.current) {
      // Check permission state if supported
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const perm = await navigator.permissions.query({ name: 'microphone' });
          if (perm.state === 'granted') {
            // Already granted, proceed directly
            try {
              const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
              streamRef.current = stream;
              startRecordingDirect();
              return;
            } catch (e) {
              // fall through to modal
            }
          } else if (perm.state === 'denied') {
            setIsPermissionDenied(true);
            setShowPermissionModal(true);
            return;
          }
        } catch (e) {
          // Permissions API query not available, show modal
        }
      }
      setShowPermissionModal(true);
    } else {
      startRecordingDirect();
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    setMicStatus('idle');

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }

    if (transcript) {
      addToast(isTa ? 'குரல் உரை வெற்றிகரமாக பதிவு செய்யப்பட்டது!' : 'Voice transcript captured successfully!', 'success');
    }
  };

  const handleClear = () => {
    setTranscript('');
    if (onTranscriptCaptured) {
      onTranscriptCaptured('');
    }
  };

  return (
    <>
      <div style={{
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: 16,
        padding: '1.25rem',
        marginBottom: '1rem',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          
          {/* Large Animated Microphone Button */}
          <button
            type="button"
            onClick={handleToggle}
            style={{
              width: 68,
              height: 68,
              borderRadius: '50%',
              background: isRecording
                ? '#dc2626'
                : '#2563eb',
              border: isRecording ? '4px solid #fca5a5' : 'none',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: isRecording
                ? '0 0 20px rgba(220, 38, 38, 0.4)'
                : '0 4px 14px rgba(37, 99, 235, 0.25)',
              transition: 'all 0.2s ease'
            }}
            title={isRecording ? 'Click to Stop Recording' : 'Click to Speak'}
          >
            <MicIcon size={28} color="#fff" />
          </button>

          {/* Status Text & Dynamic Waveform */}
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: isRecording ? '#dc2626' : '#111827' }}>
              {isRecording
                ? '🎙️ Listening... Speak now / பேசுங்கள்...'
                : 'Click to Record Voice / குரல் பதிவு செய்ய அழுத்தவும்'}
            </h4>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 2 }}>
              Selected Language: <strong style={{ color: '#111827' }}>{lang.toUpperCase()}</strong> ({isTa ? 'தமிழ்' : lang === 'hi' ? 'हिन्दी' : 'English'})
            </p>
          </div>

          {/* Audio Pulse Waveform (Visible while recording) */}
          {isRecording && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, height: 28, margin: '4px 0' }}>
              {[40, 75, 100, 60, 90, 45, 80, 50, 95, 60].map((h, i) => (
                <span
                  key={i}
                  style={{
                    width: 4,
                    height: `${h}%`,
                    background: '#dc2626',
                    borderRadius: 4,
                    animation: `pulseWave 0.8s ease-in-out infinite alternate ${i * 0.08}s`
                  }}
                />
              ))}
            </div>
          )}

          {/* Real-time Transcript Output */}
          {transcript && (
            <div style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: 12,
              padding: '12px 16px',
              maxWidth: 580,
              width: '100%',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>
                  ✓ Transcribed Speech / பேசிய உரை:
                </span>
                <button
                  type="button"
                  onClick={handleClear}
                  style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.74rem', cursor: 'pointer' }}
                >
                  Clear
                </button>
              </div>
              <p style={{ fontSize: '0.92rem', color: '#1e40af', lineHeight: 1.5, margin: 0 }}>
                "{transcript}"
              </p>
            </div>
          )}

          {/* Error / Instructions */}
          {errorMessage && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              borderRadius: 10,
              padding: '8px 12px',
              fontSize: '0.82rem',
              maxWidth: 540,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8
            }}>
              <span>ℹ️ {errorMessage}</span>
              <button
                type="button"
                onClick={() => setShowPermissionModal(true)}
                style={{
                  background: '#dc2626',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {isTa ? 'அனுமதிக்க 🔒' : 'Allow 🔒'}
              </button>
            </div>
          )}

          {isRecording && (
            <button
              type="button"
              className="btn btn-danger"
              onClick={stopRecording}
              style={{ padding: '6px 18px', fontSize: '0.85rem' }}
            >
              ⏹️ Stop & Save Speech / உரையை சேமி
            </button>
          )}
        </div>
      </div>

      {/* ── MICROPHONE PERMISSION POPUP MODAL ───────────────────────── */}
      {showPermissionModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 20,
            maxWidth: 480,
            width: '100%',
            padding: '1.75rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              fontSize: '2rem'
            }}>
              🎙️
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              {isTa ? 'மைக்ரோஃபோன் அனுமதி தேவை' : 'Microphone Access Required'}
            </h3>

            <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              {isTa
                ? 'உங்கள் புகாரை குரல் மூலம் துல்லியமாக பதிவு செய்ய FixLink-க்கு மைக்ரோஃபோன் அணுகல் தேவைப்படுகிறது.'
                : 'FixLink needs access to your microphone to accurately capture and transcribe your maintenance problem.'}
            </p>

            {isPermissionDenied && (
              <div style={{
                background: '#fffbeb',
                border: '1px solid #fef3c7',
                borderRadius: 12,
                padding: '1rem',
                textAlign: 'left',
                marginBottom: '1.25rem'
              }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#92400e', marginBottom: 6 }}>
                  {isTa ? '📌 அனுமதி வழங்கும் முறை (How to Enable):' : '📌 How to enable in browser:'}
                </div>
                <ol style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', color: '#78350f', lineHeight: 1.6 }}>
                  <li>{isTa ? 'உலாவியின் முகவரிப் பட்டியில் உள்ள 🔒 (பூட்டு) ஐகானை கிளிக் செய்யவும்.' : 'Click the 🔒 lock icon in the browser address bar.'}</li>
                  <li>{isTa ? 'Microphone அமைப்பை "Allow" (அனுமதி) என மாற்றவும்.' : 'Toggle Microphone setting to "Allow".'}</li>
                  <li>{isTa ? 'பக்கத்தை Refresh (மறுஏற்றம்) செய்து மீண்டும் முயற்சிக்கவும்.' : 'Reload the page and try recording again.'}</li>
                </ol>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setShowPermissionModal(false)}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: 10,
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                {isTa ? 'ரத்து செய்' : 'Cancel'}
              </button>

              <button
                type="button"
                onClick={requestBrowserPermission}
                style={{
                  padding: '0.65rem 1.5rem',
                  borderRadius: 10,
                  border: 'none',
                  background: '#2563eb',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)'
                }}
              >
                {isTa ? '🎙️ அனுமதி வழங்கவும்' : '🎙️ Grant Access'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
