import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';

// User Pages
import UserDashboard from './pages/user/UserDashboard';
import RaiseComplaint from './pages/user/RaiseComplaint';
import AiChatAssistant from './pages/user/AiChatAssistant';
import ComplaintHistory from './pages/user/ComplaintHistory';
import UserProfile from './pages/user/UserProfile';

// Technician Pages
import TechDashboard from './pages/technician/TechDashboard';
import AssignedJobs from './pages/technician/AssignedJobs';
import TechProfile from './pages/technician/TechProfile';

function MainApp() {
  const { user } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authPrefill, setAuthPrefill] = useState({ email: '', role: 'user' });
  const [complaintPrefill, setComplaintPrefill] = useState(null);

  // Ensure activePage is valid for the current role upon sign in / role change
  useEffect(() => {
    if (user) {
      if (user.role === 'technician') {
        if (!['dashboard', 'jobs', 'profile'].includes(activePage)) {
          setActivePage('dashboard');
        }
      } else {
        if (!['dashboard', 'raise', 'chat', 'history', 'profile'].includes(activePage)) {
          setActivePage('dashboard');
        }
      }
    }
  }, [user?.role]);

  // 1. Authentication Screen (when not logged in)
  if (!user) {
    return (
      <div style={{ maxWidth: 520, margin: '2.5rem auto 4rem auto', padding: '0 1rem' }}>
        {/* Modern SaaS Segmented Auth Switcher */}
        <div style={{
          display: 'flex',
          background: '#f1f5f9',
          padding: 4,
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          marginBottom: '1.5rem',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
        }}>
          <button
            type="button"
            className={`btn ${authMode === 'login' ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              flex: 1,
              padding: '9px 16px',
              fontSize: '0.9rem',
              borderRadius: 8,
              border: authMode === 'login' ? 'none' : 'transparent',
              background: authMode === 'login' ? 'var(--primary)' : 'transparent',
              color: authMode === 'login' ? '#ffffff' : '#4b5563',
              boxShadow: authMode === 'login' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              fontWeight: 600
            }}
            onClick={() => setAuthMode('login')}
          >
            🔑 Sign In / உள்நுழை
          </button>
          <button
            type="button"
            className={`btn ${authMode === 'register' ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              flex: 1,
              padding: '9px 16px',
              fontSize: '0.9rem',
              borderRadius: 8,
              border: authMode === 'register' ? 'none' : 'transparent',
              background: authMode === 'register' ? 'var(--primary)' : 'transparent',
              color: authMode === 'register' ? '#ffffff' : '#4b5563',
              boxShadow: authMode === 'register' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              fontWeight: 600
            }}
            onClick={() => setAuthMode('register')}
          >
            📝 Register / புதிய பதிவு
          </button>
        </div>

        {authMode === 'login' ? (
          <Login
            onSwitchToRegister={() => setAuthMode('register')}
            initialEmail={authPrefill.email}
            initialRole={authPrefill.role}
          />
        ) : (
          <Register
            onSwitchToLogin={(prefill) => {
              if (prefill && prefill.email) {
                setAuthPrefill(prefill);
              }
              setAuthMode('login');
            }}
          />
        )}
      </div>
    );
  }

  // 2. Authenticated Portal View
  const isTechnician = user.role === 'technician';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Navbar activePage={activePage} setActivePage={setActivePage} />

      <main className="app-container">
        {isTechnician ? (
          // Technician Portal
          <>
            {activePage === 'dashboard' && <TechDashboard setActivePage={setActivePage} />}
            {activePage === 'jobs' && <AssignedJobs />}
            {activePage === 'profile' && <TechProfile />}
          </>
        ) : (
          // Resident User Portal
          <>
            {activePage === 'dashboard' && <UserDashboard setActivePage={setActivePage} />}
            {activePage === 'raise' && (
              <RaiseComplaint
                setActivePage={setActivePage}
                prefillData={complaintPrefill}
              />
            )}
            {activePage === 'chat' && (
              <AiChatAssistant
                setActivePage={setActivePage}
                onFileTicket={(ticketData) => {
                  setComplaintPrefill(ticketData);
                  setActivePage('raise');
                }}
              />
            )}
            {activePage === 'history' && <ComplaintHistory setActivePage={setActivePage} />}
            {activePage === 'profile' && <UserProfile />}
          </>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
