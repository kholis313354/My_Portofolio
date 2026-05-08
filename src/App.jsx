import React, { useState } from 'react';
import SplashScreen from './SplashScreen';
import TerminalPage from './TerminalPage';
import AboutPage from './AboutPage';
import AdminDashboard from './AdminDashboard';
import ParrotBoot from './ParrotBoot';
import ParrotDesktop from './ParrotDesktop';
import CyberCursor from './components/CyberCursor';
import ParrotLoginPage from './ParrotLoginPage';

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
      {page === 4 && <AboutPage />}
    </div>
  );
}
