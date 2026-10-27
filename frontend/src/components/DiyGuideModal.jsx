import React, { useState, useEffect } from 'react';
import { CheckIcon, AlertTriangleIcon } from './Icons';
import { getLocalizedDiyGuide } from '../i18n';

/* ─── Step visual icons by keyword ─────────────────────── */
const STEP_ICONS = [
  { keys: ['power','off','unplug','switch','breaker','isolator','mcb','shut'], icon: '🔌', color: '#dc2626' },
  { keys: ['open','lift','remove','panel','cover','grille','access','shroud'], icon: '🔓', color: '#d97706' },
  { keys: ['wash','clean','rinse','water','filter','dust','wipe','brush'],     icon: '🧹', color: '#0284c7' },
  { keys: ['dry','shade','air','wait','allow','cool'],                         icon: '☀️', color: '#d97706' },
  { keys: ['insert','re-insert','replace','reinstall','close','fit','test'],   icon: '✅', color: '#059669' },
  { keys: ['tighten','screw','bolt','secure','fix','clamp'],                   icon: '🔧', color: '#2563eb' },
  { keys: ['check','inspect','verify','confirm','look','tester'],              icon: '🔍', color: '#65a30d' },
];

function getStepIcon(stepText) {
  const lower = (stepText || '').toLowerCase();
  for (const entry of STEP_ICONS) {
    if (entry.keys.some(k => lower.includes(k))) return entry;
  }
  return { icon: '📋', color: '#64748b' };
}

/* ─── Difficulty badge ──────────────────────────────────── */
const DIFFICULTY = {
  easy:       { label: 'Easy Guided',       color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', icon: '😊' },
  medium:     { label: 'Medium Difficulty', color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: '🧐' },
  hard:       { label: 'Needs Technician',  color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: '👨‍🔧' },
};

function getDifficulty(steps, isSafe) {
  if (!isSafe) return DIFFICULTY.hard;
  if ((steps || []).length <= 3) return DIFFICULTY.easy;
  if ((steps || []).length <= 5) return DIFFICULTY.medium;
  return DIFFICULTY.hard;
}

/* ─── Per-step extra tip by keyword ────────────────────── */
function getStepTip(stepText) {
  const lower = (stepText || '').toLowerCase();
  if (lower.includes('water') || lower.includes('wash') || lower.includes('rinse')) {
    return '💡 Pro Tip: Use only lukewarm water — hot water can warp plastic mesh or degrade sealing gaskets.';
  }
  if (lower.includes('dry') || lower.includes('shade')) {
    return '💡 Pro Tip: Dry for ~30 mins in shaded air. Never use a high-heat hairdryer as it may distort parts.';
  }
  if (lower.includes('power') || lower.includes('switch') || lower.includes('mcb') || lower.includes('breaker')) {
    return '⚡ Critical Safety: Ensure the room MCB circuit breaker is fully switched OFF before touching any terminal.';
  }
  if (lower.includes('tighten') || lower.includes('screw')) {
    return '💡 Pro Tip: Hand-tighten screws evenly in a criss-cross pattern to avoid overtightening or thread stripping.';
  }
  return null;
}

/* ─── UI strings ────────────────────────────────────────── */
const UI = {
  en: {
    badge: 'SAFE DIY REPAIR ASSISTANT',
    subtitle: 'Step-by-Step Interactive Guided Solution',
    progress: 'Overall Progress',
    stepsLabel: 'Steps',
    tools: 'Required Tools & Materials',
    parts: 'Spare Parts & Replacements',
    precautions: 'Safety Precautions & Mandates',
    stepByStep: 'Interactive Step-by-Step Timeline',
    stepPrefix: 'Step',
    close: 'Exit Assistant',
    back: '← Back to Dashboard',
    completeAll: 'Complete All Steps',
    markResolved: '🎉 Mark Repair as Completed!',
    locked: 'Complete previous step first',
    difficulty: 'Difficulty',
    estTime: 'Est. Time',
    minutes: 'mins',
    stillNotWorking: 'Encountering issues? Request Certified Technician',
    greatJob: '🎉 Outstanding Work! All Repair Steps Completed!',
    prevStep: '◀ Previous Step',
    nextStep: 'Next Step ▶',
    markStepDone: 'Mark Step Done ✓',
    stepCompleted: 'Completed',
    stepInProgress: 'In Progress',
    stepLocked: 'Locked'
  },
  ta: {
    badge: 'சுய பழுதுபார்த்தல் உதவியாளர்',
    subtitle: 'படிப்படியான ஊடாடும் வழிகாட்டல் தீர்வு',
    progress: 'பழுது நீக்கும் நிலை',
    stepsLabel: 'படிகள்',
    tools: 'தேவையான கருவிகள் & பொருட்கள்',
    parts: 'மாற்று பாகங்கள்',
    precautions: 'பாதுகாப்பு குறிப்புகள் & எச்சரிக்கைகள்',
    stepByStep: 'படிப்படியான பழுது நீக்கும் காலவரிசை',
    stepPrefix: 'படி',
    close: 'வெளியேறு',
    back: '← முதன்மைப் பக்கத்திற்குத் திரும்பு',
    completeAll: 'அனைத்து படிகளையும் முடிக்கவும்',
    markResolved: '🎉 பழுது நீங்கியது என பதிவு செய்க!',
    locked: 'முந்தைய படியை முதலில் முடிக்கவும்',
    difficulty: 'சிரம நிலை',
    estTime: 'மதிப்பிடப்பட்ட நேரம்',
    minutes: 'நிமிடம்',
    stillNotWorking: 'இன்னும் சரியாகவில்லையா? → Technician அழையுங்கள்',
    greatJob: '🎉 சிறப்பு! அனைத்து படிகளும் வெற்றிகரமாக முடிந்தன!',
    prevStep: '◀ முந்தைய படி',
    nextStep: 'அடுத்த படி ▶',
    markStepDone: 'இந்த படி முடிந்தது ✓',
    stepCompleted: 'முடிந்தது',
    stepInProgress: 'நடப்பில் உள்ளது',
    stepLocked: 'பூட்டப்பட்டுள்ளது'
  },
};

export default function DiyGuideModal({ guide, onClose, onComplete, onEscalate, lang = 'en' }) {
  if (!guide) return null;

  const [completedSteps, setCompletedSteps] = useState([]);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  const ui = UI[lang] || UI.en;
  const locGuide = getLocalizedDiyGuide ? getLocalizedDiyGuide(guide, lang) : guide;
  const steps = locGuide.steps || [
    "Verify room MCB and power isolation switch are in OFF position.",
    "Inspect component casing and clean dust accumulation.",
    "Replace worn components or tighten mounting screws.",
    "Restore power supply and perform operational stability test."
  ];

  const hasParts = locGuide.parts && locGuide.parts.length > 0 &&
                   !(locGuide.parts.length === 1 && locGuide.parts[0].toLowerCase() === 'none');

  const checkedCount = completedSteps.length;
  const progressPct = steps.length > 0 ? Math.round((checkedCount / steps.length) * 100) : 0;
  const allDone = checkedCount === steps.length && steps.length > 0;
  const diff = getDifficulty(steps, locGuide.isSafeForDIY !== false);

  // Auto-scroll to active step card smoothly
  const scrollToStep = (idx) => {
    setCurrentStepIdx(idx);
    const el = document.getElementById(`repair-step-card-${idx}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const toggleStep = (idx) => {
    if (completedSteps.includes(idx)) {
      if (idx === completedSteps[completedSteps.length - 1]) {
        setCompletedSteps(prev => prev.slice(0, -1));
      }
    } else {
      if (idx === completedSteps.length) {
        const next = [...completedSteps, idx];
        setCompletedSteps(next);
        if (next.length === steps.length) {
          setShowCelebration(true);
        } else {
          setCurrentStepIdx(idx + 1);
        }
      }
    }
  };

  const handleNextStep = () => {
    if (!completedSteps.includes(currentStepIdx)) {
      toggleStep(currentStepIdx);
    }
    if (currentStepIdx < steps.length - 1) {
      scrollToStep(currentStepIdx + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIdx > 0) {
      scrollToStep(currentStepIdx - 1);
    }
  };

  const handleComplete = () => {
    if (onComplete) onComplete();
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 99999,
      backgroundColor: '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      animation: 'fadeIn 0.25s ease'
    }}>
      
      {/* ================= 1. FIXED TOP HEADER ================= */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '1rem 2rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          
          {/* Title & Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: 280 }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem'
            }}>
              🛠️
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                <span className="badge badge-safe" style={{ fontSize: '0.72rem', padding: '3px 10px' }}>
                  {ui.badge}
                </span>
                <span style={{
                  padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700,
                  background: diff.bg, color: diff.color, border: `1px solid ${diff.border}`
                }}>
                  {diff.icon} {diff.label}
                </span>
                <span style={{
                  padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700,
                  background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe'
                }}>
                  ⏱ {locGuide.estimatedMinutes || 15} {ui.minutes}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                  Category: <strong style={{ color: '#111827', textTransform: 'capitalize' }}>{locGuide.category || 'General'}</strong>
                </span>
              </div>

              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.02em' }}>
                {locGuide.title || "Ceiling Fan Blade Cleaning & Regulator Check"}
              </h1>
            </div>
          </div>

          {/* Close / Back Action */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{
                padding: '9px 18px',
                fontSize: '0.88rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
              onClick={onClose}
            >
              ✕ {ui.close}
            </button>
          </div>
        </div>

        {/* Full-width Progress Bar attached to header */}
        <div style={{ marginTop: '0.85rem', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>
            <span style={{ color: '#475569' }}>
              {ui.progress}: <strong style={{ color: '#2563eb' }}>{progressPct}% Completed</strong> ({checkedCount} of {steps.length} {ui.stepsLabel} Done)
            </span>
            <span style={{ color: progressPct === 100 ? '#059669' : '#2563eb' }}>
              {allDone ? '✓ All Steps Verified' : `Current: Step ${completedSteps.length + 1}`}
            </span>
          </div>
          <div style={{ height: 6, background: '#e2e8f0', borderRadius: 9999, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${progressPct}%`,
              background: progressPct === 100 ? '#10b981' : '#2563eb',
              borderRadius: 9999,
              transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
            }} />
          </div>
        </div>
      </header>

      {/* ================= 2. MAIN 2-COLUMN / 3-COLUMN CONTENT ================= */}
      <main style={{
        flex: 1,
        maxWidth: 1440,
        margin: '0 auto',
        width: '100%',
        padding: '2rem',
        display: 'grid',
        gridTemplateColumns: 'minmax(300px, 360px) minmax(450px, 1fr) minmax(220px, 280px)',
        gap: '24px',
        alignItems: 'start'
      }}>
        
        {/* ── LEFT COLUMN: Essential Repair Info, Tools & Warnings ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Required Tools */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: '1.2rem' }}>🛠️</span>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#111827', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {ui.tools}
              </h3>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {(locGuide.tools || ['Insulated Screwdriver', 'Adjustable Spanner', 'Cleaning Cloth']).map((t, i) => (
                <div key={i} style={{
                  padding: '6px 12px',
                  borderRadius: 10,
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  background: '#f0f9ff',
                  color: '#0369a1',
                  border: '1px solid #bae6fd',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <span>✓</span> {t}
                </div>
              ))}
            </div>
          </div>

          {/* Spare Parts (if any) */}
          {hasParts && (
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 14,
              padding: '1.25rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: '1.2rem' }}>🔩</span>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#111827', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {ui.parts}
                </h3>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {locGuide.parts.map((p, i) => (
                  <div key={i} style={{
                    padding: '6px 12px',
                    borderRadius: 10,
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    background: '#faf5ff',
                    color: '#7e22ce',
                    border: '1px solid #e9d5ff'
                  }}>
                    {p}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Safety Precautions & Mandates (Red Warning Alert) */}
          <div style={{
            background: '#fef2f2',
            border: '1.5px solid #fecaca',
            borderRadius: 14,
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(239,68,68,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#dc2626', marginBottom: 10 }}>
              <AlertTriangleIcon size={20} color="#dc2626" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#dc2626', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {ui.precautions}
              </h3>
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(locGuide.precautions && locGuide.precautions.length > 0 ? locGuide.precautions : [
                "Always turn OFF the main circuit breaker (MCB) or main valve before servicing.",
                "Ensure dry hands and wear insulated rubber footwear."
              ]).map((p, i) => (
                <li key={i} style={{ fontSize: '0.86rem', color: '#991b1b', lineHeight: 1.5 }}>
                  {p.replace(/AC main isolator switch/gi, 'Main switch (MCB)')
                    .replace(/isolator switch/gi, 'MCB (Main Circuit Breaker)')
                    .replace(/Luke-warm water/gi, 'lukewarm water')}
                </li>
              ))}
            </ul>
          </div>

          {/* Escalation Card */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: '1.25rem',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '0.84rem', color: '#64748b', marginBottom: 12 }}>
              Need hands-on assistance or encountering unexpected damage?
            </p>
            <button
              type="button"
              onClick={() => { if (onEscalate) onEscalate(); onClose(); }}
              style={{
                width: '100%',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 10,
                color: '#dc2626',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                padding: '10px 14px',
                transition: 'all 0.2s ease'
              }}
            >
              🔧 {ui.stillNotWorking}
            </button>
          </div>

        </div>

        {/* ── CENTER COLUMN: Interactive Step-by-Step Timeline Cards ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#111827', margin: 0 }}>
              {ui.stepByStep}
            </h2>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
              Click any step card or checkbox to update progress
            </span>
          </div>

          {/* Step Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {steps.map((step, idx) => {
              const isDone = completedSteps.includes(idx);
              const isCurrent = idx === completedSteps.length;
              const isLocked = idx > completedSteps.length;
              const stepIcon = getStepIcon(step);
              const tip = getStepTip(step);
              const isSelected = currentStepIdx === idx;

              return (
                <div
                  id={`repair-step-card-${idx}`}
                  key={idx}
                  onClick={() => {
                    if (!isLocked) setCurrentStepIdx(idx);
                  }}
                  style={{
                    background: isDone
                      ? '#f0fdf4'
                      : isCurrent || isSelected
                        ? '#ffffff'
                        : '#ffffff',
                    border: isDone
                      ? '1.5px solid #10b981'
                      : isCurrent || isSelected
                        ? '2px solid #2563eb'
                        : '1px solid #e2e8f0',
                    borderRadius: 14,
                    padding: '1.25rem',
                    boxShadow: isCurrent || isSelected
                      ? '0 4px 14px rgba(37,99,235,0.12)'
                      : '0 1px 3px rgba(0,0,0,0.03)',
                    cursor: isLocked ? 'not-allowed' : 'pointer',
                    opacity: isLocked ? 0.5 : 1,
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    
                    {/* Step Icon Badge */}
                    <div style={{
                      width: 44,
                      height: 44,
                      minWidth: 44,
                      borderRadius: '50%',
                      background: isDone ? '#d1fae5' : isCurrent ? '#eff6ff' : '#f8fafc',
                      border: `2px solid ${isDone ? '#10b981' : isCurrent ? '#2563eb' : '#cbd5e1'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                      flexShrink: 0
                    }}>
                      {isDone ? '✓' : stepIcon.icon}
                    </div>

                    {/* Step Content */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          color: isDone ? '#059669' : isCurrent ? '#2563eb' : '#64748b',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em'
                        }}>
                          {ui.stepPrefix} {idx + 1} {idx === 0 ? '• 🔒 Safety Isolation' : ''}
                        </span>

                        <span style={{
                          padding: '2px 8px',
                          borderRadius: 12,
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          background: isDone ? '#d1fae5' : isCurrent ? '#eff6ff' : '#f1f5f9',
                          color: isDone ? '#059669' : isCurrent ? '#2563eb' : '#64748b'
                        }}>
                          {isDone ? ui.stepCompleted : isCurrent ? ui.stepInProgress : ui.stepLocked}
                        </span>
                      </div>

                      <p style={{
                        fontSize: '0.98rem',
                        fontWeight: 600,
                        color: isDone ? '#4b5563' : '#111827',
                        lineHeight: 1.6,
                        margin: 0,
                        textDecoration: isDone ? 'line-through' : 'none'
                      }}>
                        {step
                          .replace(/AC main isolator switch/gi, 'Main switch (MCB)')
                          .replace(/Luke-warm water/gi, 'lukewarm water')}
                      </p>

                      {/* Pro-Tip Box */}
                      {tip && !isDone && (
                        <div style={{
                          marginTop: 10,
                          background: '#fffbeb',
                          border: '1px solid #fde68a',
                          borderRadius: 10,
                          padding: '8px 12px',
                          fontSize: '0.82rem',
                          color: '#92400e',
                          lineHeight: 1.5
                        }}>
                          {tip}
                        </div>
                      )}
                    </div>

                    {/* Checkbox Trigger */}
                    <div style={{ display: 'flex', alignItems: 'center', alignSelf: 'center' }}>
                      <input
                        type="checkbox"
                        checked={isDone}
                        disabled={isLocked}
                        onChange={() => toggleStep(idx)}
                        style={{
                          width: 22,
                          height: 22,
                          accentColor: '#10b981',
                          cursor: isLocked ? 'not-allowed' : 'pointer'
                        }}
                      />
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* Celebration Card */}
          {showCelebration && (
            <div style={{
              background: '#ecfdf5',
              border: '2px solid #10b981',
              borderRadius: 16,
              padding: '2rem',
              textAlign: 'center',
              marginTop: 12,
              animation: 'fadeIn 0.3s ease'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: 8 }}>🎉 🛠️ 🏆</div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#059669', marginBottom: 6 }}>
                {ui.greatJob}
              </h3>
              <p style={{ fontSize: '0.92rem', color: '#065f46', maxWidth: 540, margin: '0 auto 1.5rem auto' }}>
                All {steps.length} procedural checks passed. Your equipment is restored to standard operational safety.
              </p>
              <button
                type="button"
                className="btn btn-success"
                onClick={handleComplete}
                style={{ padding: '12px 32px', fontSize: '1rem', fontWeight: 800, boxShadow: '0 4px 14px rgba(16,185,129,0.35)' }}
              >
                {ui.markResolved}
              </button>
            </div>
          )}

        </div>

        {/* ── RIGHT COLUMN: Live Stepper & Mini Progress Roadmap ── */}
        <div style={{
          position: 'sticky',
          top: 130,
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          padding: '1.25rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}>
          <h3 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#111827', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            📍 Step Roadmap
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '6px 0' }}>
            {steps.map((st, i) => {
              const isDone = completedSteps.includes(i);
              const isCurrent = i === completedSteps.length;
              const isLocked = i > completedSteps.length;
              return (
                <div
                  key={i}
                  onClick={() => !isLocked && scrollToStep(i)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 8,
                    background: isCurrent ? '#eff6ff' : isDone ? '#f0fdf4' : '#f8fafc',
                    border: `1px solid ${isCurrent ? '#bfdbfe' : isDone ? '#bbf7d0' : '#e2e8f0'}`,
                    cursor: isLocked ? 'not-allowed' : 'pointer',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: isCurrent ? '#2563eb' : isDone ? '#059669' : '#64748b'
                  }}
                >
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 170 }}>
                    Step {i + 1}: {st.slice(0, 22)}...
                  </span>
                  <span>{isDone ? '✓' : isCurrent ? '🔄' : '🔒'}</span>
                </div>
              );
            })}
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 10, fontSize: '0.78rem', color: '#64748b' }}>
            <div>Total Actions: <strong>{steps.length}</strong></div>
            <div>Completed: <strong style={{ color: '#059669' }}>{checkedCount}</strong></div>
            <div>Remaining: <strong style={{ color: '#2563eb' }}>{steps.length - checkedCount}</strong></div>
          </div>
        </div>

      </main>

      {/* ================= 3. STICKY BOTTOM ACTION BAR ================= */}
      <footer style={{
        position: 'sticky',
        bottom: 0,
        zIndex: 100,
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        padding: '1rem 2rem',
        boxShadow: '0 -4px 12px rgba(0,0,0,0.04)'
      }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          
          {/* Previous Step Button */}
          <button
            type="button"
            className="btn btn-secondary"
            disabled={currentStepIdx === 0}
            onClick={handlePrevStep}
            style={{ padding: '9px 18px', fontSize: '0.88rem', fontWeight: 600, opacity: currentStepIdx === 0 ? 0.4 : 1 }}
          >
            {ui.prevStep}
          </button>

          {/* Middle Step Indicator */}
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>
            Step <span style={{ color: '#2563eb' }}>{Math.min(currentStepIdx + 1, steps.length)}</span> of {steps.length}
          </div>

          {/* Next / Complete Step Button */}
          <div style={{ display: 'flex', gap: 10 }}>
            {!allDone ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleNextStep}
                style={{ padding: '9px 24px', fontSize: '0.92rem', fontWeight: 700 }}
              >
                {completedSteps.includes(currentStepIdx) ? ui.nextStep : `${ui.markStepDone} (${currentStepIdx + 1})`}
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-success"
                onClick={handleComplete}
                style={{ padding: '9px 26px', fontSize: '0.95rem', fontWeight: 800, boxShadow: '0 4px 14px rgba(16,185,129,0.3)' }}
              >
                {ui.markResolved}
              </button>
            )}
          </div>

        </div>
      </footer>

    </div>
  );
}
