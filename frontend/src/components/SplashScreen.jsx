import React, { useState, useEffect } from 'react';
import { WrenchIcon } from './Icons';

export default function SplashScreen({ onFinish }) {
  const [progress, setProgress] = useState(15);
  const [statusText, setStatusText] = useState('Initializing FixLink Core Engine...');
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const steps = [
      { pct: 35, text: 'Loading Multilingual NLP & Speech Models...' },
      { pct: 65, text: 'Connecting to MongoDB Maintenance Cluster...' },
      { pct: 90, text: 'Calibrating Computer Vision Defect Scanner...' },
      { pct: 100, text: 'FixLink AI System Ready ✓' }
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        setProgress(steps[stepIndex].pct);
        setStatusText(steps[stepIndex].text);
        stepIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsFading(true);
          setTimeout(() => {
            if (onFinish) onFinish();
          }, 450);
        }, 300);
      }
    }, 450);

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 99999,
      background: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      transition: 'opacity 0.45s ease, transform 0.45s ease',
      opacity: isFading ? 0 : 1,
      transform: isFading ? 'scale(1.02)' : 'scale(1)'
    }}>
      {/* Icon Emblem */}
      <div style={{ position: 'relative', marginBottom: '1.75rem' }}>
        <div style={{
          width: 76,
          height: 76,
          borderRadius: 20,
          background: '#2563eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.3)',
          position: 'relative',
          zIndex: 2
        }}>
          <WrenchIcon size={38} color="#ffffff" />
        </div>
      </div>

      {/* Brand Title */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <h1 style={{
            fontSize: '2.4rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#111827',
            margin: 0
          }}>
            FixLink
          </h1>
          <span className="badge" style={{
            background: '#eff6ff',
            color: '#2563eb',
            border: '1px solid #bfdbfe',
            fontSize: '0.75rem',
            padding: '4px 10px',
            fontWeight: 700
          }}>
            AI-POWERED
          </span>
        </div>
        <p style={{ fontSize: '0.95rem', color: '#64748b', marginTop: 8, letterSpacing: '0.01em' }}>
          Multilingual Smart Maintenance & Repair Assistance System
        </p>
      </div>

      {/* Progress Bar & Status Message */}
      <div style={{ width: '100%', maxWidth: 360, textAlign: 'center' }}>
        <div style={{
          height: 6,
          width: '100%',
          background: '#e2e8f0',
          borderRadius: 9999,
          overflow: 'hidden',
          marginBottom: 12
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: '#2563eb',
            borderRadius: 9999,
            transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }} />
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.82rem',
          color: '#64748b'
        }}>
          <span style={{ color: '#2563eb', fontWeight: 600 }}>{statusText}</span>
          <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#111827' }}>{progress}%</span>
        </div>
      </div>

      {/* Footer System Meta */}
      <div style={{
        position: 'absolute',
        bottom: 24,
        fontSize: '0.78rem',
        color: '#94a3b8',
        letterSpacing: '0.02em'
      }}>
        FixLink v1.0.0 • Connected to MongoDB Cluster
      </div>
    </div>
  );
}
