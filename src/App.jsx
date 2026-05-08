import React, { useState } from 'react';
import SplashScreen from './SplashScreen';
import TerminalPage from './TerminalPage';
import AboutPage from './AboutPage';
import AdminDashboard from './AdminDashboard';
import ParrotBoot from './ParrotBoot';
import ParrotDesktop from './ParrotDesktop';
import CyberCursor from './components/CyberCursor';
import ParrotLoginPage from './ParrotLoginPage';

// ── ErrorBoundary: mencegah blank screen ketika komponen 3D crash ──
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.warn('[ErrorBoundary] Caught error:', error.message);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{
          width: '100vw', height: '100vh', background: '#0a0e0e',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', color: '#00f3ff',
          fontFamily: "'VT323', monospace", fontSize: '24px'
        }}>
          <div style={{ marginBottom: '20px', fontSize: '40px' }}>⚠</div>
          <div>SYSTEM_ERROR: 3D_MODULE_FAILED_TO_LOAD</div>
          <div style={{ fontSize: '16px', color: 'rgba(0,243,255,0.5)', marginTop: '10px' }}>
            Model files not found in production environment
          </div>
          <button
            onClick={() => this.setState({ hasError: false })}
            style={{
              marginTop: '30px', padding: '10px 30px',
              background: 'transparent', color: '#00f3ff',
              border: '1px solid #00f3ff', borderRadius: '30px',
              cursor: 'pointer', fontFamily: "'VT323', monospace",
              fontSize: '18px', letterSpacing: '0.2em'
            }}
          >
            [ RETRY ]
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Stages: 0=ParrotBoot, 1=ParrotDesktop, 2=Splash, 3=Terminal, 4=ProfilePage
export default function App() {
  const [page, setPage] = useState(0);
  const [adminAuthed, setAdminAuthed] = useState(
    () => sessionStorage.getItem('adminAuthed') === 'true'
  );
  const path = window.location.pathname;

  const handleAdminSuccess = () => {
    sessionStorage.setItem('adminAuthed', 'true');
    setAdminAuthed(true);
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('adminAuthed');
    setAdminAuthed(false);
  };

  if (path === '/v1/kernel-access' || path === '/v1/kernel-access/') {
    return (
      <div style={{ cursor: 'none' }}>
        <CyberCursor />
        {!adminAuthed
          ? <ParrotLoginPage onSuccess={handleAdminSuccess} />
          : <AdminDashboard onLogout={handleAdminLogout} />
        }
      </div>
    );
  }

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#050505]" style={{ fontFamily: "'VT323', monospace", cursor: 'none' }}>
      <CyberCursor />
      {page === 0 && <ParrotBoot setPage={setPage} />}
      {page === 1 && <ParrotDesktop setPage={setPage} />}
      {page === 2 && <SplashScreen onComplete={() => setPage(3)} />}
      {page === 3 && <TerminalPage onAccessGranted={() => setPage(4)} />}
      {page === 4 && (
        <ErrorBoundary>
          <AboutPage />
        </ErrorBoundary>
      )}
    </div>
  );
}
