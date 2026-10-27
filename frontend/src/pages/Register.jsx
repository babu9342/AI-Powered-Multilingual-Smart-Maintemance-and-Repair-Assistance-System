import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { WrenchIcon, UserIcon } from '../components/Icons';
import { languages } from '../i18n';

export default function Register({ onSwitchToLogin }) {
  const { register, addToast } = useAuth();
  const [role, setRole] = useState('user'); // 'user' | 'technician'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [language, setLanguage] = useState('en');
  
  // User specific
  const [address, setAddress] = useState('');

  // Technician specific
  const [category, setCategory] = useState('electrical');
  const [experienceYears, setExperienceYears] = useState(3);
  const [location, setLocation] = useState('Campus Central & Hostels');

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      addToast('Please fill in all mandatory fields', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const extraData = role === 'technician'
        ? { category, experienceYears: Number(experienceYears), location }
        : { address };

      const ok = await register({
        name,
        email,
        phone,
        password,
        role,
        language,
        ...extraData
      });

      if (ok) {
        onSwitchToLogin({ email, role });
      }
    } catch (err) {
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: '2rem auto 3rem auto', padding: '0 1rem' }}>
      <div className="glass-panel" style={{ padding: '2.5rem 2rem' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 50,
            height: 50,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            marginBottom: 12,
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
          }}>
            <WrenchIcon size={24} color="#fff" />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', margin: 0 }}>
            Create Your FixLink Account
          </h2>
          <p style={{ fontSize: '0.86rem', color: '#6b7280', marginTop: 6, marginBottom: 0 }}>
            Select your role to configure your personalized AI maintenance workspace
          </p>
        </div>

        {/* ================= STEP 1: CHOOSE ROLE PROMINENTLY ================= */}
        <div style={{ marginBottom: '2rem' }}>
          <label className="form-label" style={{ textAlign: 'center', marginBottom: '0.75rem', fontSize: '0.84rem', color: '#2563eb', fontWeight: 700 }}>
            ✦ Step 1: Select Your Role / உங்கள் பங்கை தேர்வு செய்யவும்
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* User Role Card */}
            <div
              onClick={() => setRole('user')}
              style={{
                background: role === 'user' ? '#eff6ff' : '#ffffff',
                border: `2px solid ${role === 'user' ? '#2563eb' : '#e2e8f0'}`,
                borderRadius: 12,
                padding: '1.25rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                boxShadow: role === 'user' ? '0 4px 12px rgba(37, 99, 235, 0.12)' : '0 1px 2px rgba(0,0,0,0.03)'
              }}
            >
              {role === 'user' && (
                <div style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: '#2563eb',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  fontWeight: 800
                }}>
                  ✓
                </div>
              )}
              <div style={{ fontSize: '1.75rem', marginBottom: 6 }}>👤</div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                Resident / User
              </h4>
              <p style={{ fontSize: '0.78rem', color: '#4b5563', marginTop: 4, lineHeight: 1.4, marginBottom: 0 }}>
                Report machinery, plumbing, or electrical breakdowns. Get instant AI diagnosis & self-repair guidance.
              </p>
              <div style={{ marginTop: 10 }}>
                <span className="badge" style={{ background: '#dbeafe', color: '#1e40af', fontSize: '0.7rem' }}>
                  Standard Access
                </span>
              </div>
            </div>

            {/* Technician Role Card */}
            <div
              onClick={() => setRole('technician')}
              style={{
                background: role === 'technician' ? '#fffbeb' : '#ffffff',
                border: `2px solid ${role === 'technician' ? '#f59e0b' : '#e2e8f0'}`,
                borderRadius: 12,
                padding: '1.25rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                boxShadow: role === 'technician' ? '0 4px 12px rgba(245, 158, 11, 0.12)' : '0 1px 2px rgba(0,0,0,0.03)'
              }}
            >
              {role === 'technician' && (
                <div style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: '#f59e0b',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  fontWeight: 800
                }}>
                  ✓
                </div>
              )}
              <div style={{ fontSize: '1.75rem', marginBottom: 6 }}>🛠️</div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                Field Technician
              </h4>
              <p style={{ fontSize: '0.78rem', color: '#4b5563', marginTop: 4, lineHeight: 1.4, marginBottom: 0 }}>
                Accept assigned maintenance jobs, review AI defect diagnostics, and verify completed repairs.
              </p>
              <div style={{ marginTop: 10 }}>
                <span className="badge" style={{ background: '#fef3c7', color: '#b45309', fontSize: '0.7rem' }}>
                  Technician Console
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= STEP 2: REGISTRATION FORM ================= */}
        <form onSubmit={handleSubmit}>
          <div style={{
            borderTop: '1px solid #e2e8f0',
            paddingTop: '1.5rem',
            marginBottom: '1rem'
          }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>
              ✦ Step 2: Account Details ({role === 'technician' ? 'Technician Profile' : 'Resident User Profile'})
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={role === 'technician' ? 'e.g. Suresh Kumar' : 'e.g. Babu M'}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === 'technician' ? 'tech@fixlink.ai' : 'user@fixlink.ai'}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Preferred Language</label>
              <select
                className="form-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                {languages.map(l => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* DYNAMIC FIELDS: USER ONLY */}
          {role === 'user' && (
            <div className="form-group">
              <label className="form-label">Campus Room / Unit Address</label>
              <input
                type="text"
                className="form-input"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Hostel Block C, Room 204 or Lab 304"
                required
              />
            </div>
          )}

          {/* DYNAMIC FIELDS: TECHNICIAN ONLY */}
          {role === 'technician' && (
            <div style={{
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: 10,
              padding: '1.25rem',
              marginBottom: '1.25rem'
            }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>
                🛠️ Technician Specialization & Credentials
              </span>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Service Category</label>
                  <select
                    className="form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="electrical">⚡ Electrical Specialist</option>
                    <option value="plumbing">💧 Plumbing & Pipe Specialist</option>
                    <option value="infrastructure">🔨 Infrastructure & Civil</option>
                    <option value="cleaning">✨ Sanitation & Pest Control</option>
                    <option value="security">🛡️ Security & Access Gates</option>
                    <option value="network">🌐 Network & Server IT</option>
                    <option value="other">⚙️ General Machinery</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Field Experience</label>
                  <input
                    type="number"
                    className="form-input"
                    min="1"
                    max="40"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    placeholder="e.g. 5"
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Assigned Campus / Service Zone</label>
                <input
                  type="text"
                  className="form-input"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Hostel Zone & Dining Hall or Academic Block A"
                  required
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '0.94rem',
              marginTop: '0.75rem',
              background: role === 'technician' ? '#f59e0b' : 'var(--primary)',
              borderColor: role === 'technician' ? '#f59e0b' : 'var(--primary)'
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : `Register as ${role === 'technician' ? 'Field Technician' : 'Resident User'}`}
          </button>
        </form>

        {/* Footer Login Link */}
        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.86rem', color: '#6b7280' }}>
          Already registered?{' '}
          <span
            style={{ color: '#2563eb', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
            onClick={onSwitchToLogin}
          >
            Sign In to your account
          </span>
        </div>

      </div>
    </div>
  );
}
