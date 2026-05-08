import React, { useState, useEffect, useRef } from 'react';

export default function HackTheBoxWindow({ onClose }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      setPos({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, pos]);

  // Generate particles based on spec
  const particles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: 2 + Math.random() * 2,
    delay: Math.random() * -2,
    duration: 3 + Math.random() * 2
  }));

  return (
    <div
      className="fixed flex flex-col pointer-events-auto"
      style={{
        width: 700, height: 480, maxWidth: '95vw',
        top: `calc(50% + ${pos.y}px)`, left: `calc(50% + ${pos.x}px)`,
        transform: 'translate(-50%, -50%)',
        zIndex: 9994,
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(159, 239, 0, 0.3), 0 0 0 1px rgba(159,239,0,0.2)',
        background: '#141d2b',
        animation: 'windowBounceIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
      }}
    >
      <style>{`
        @keyframes floatHTB {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>

      {/* Title Bar - Windows Style */}
      <div
        className="flex items-center justify-between select-none cursor-move overflow-hidden"
        style={{
          height: 38,
          background: 'linear-gradient(135deg, #0a1628, #111d2e)',
          borderBottom: '1px solid rgba(159, 239, 0, 0.2)'
        }}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center pointer-events-none pl-[16px]" style={{ fontFamily: 'monospace', fontSize: 13 }}>
          <span style={{ color: '#9fef00' }}>{`{ `}</span>
          <span style={{ color: '#ffffff' }}>HackTheBox</span>
          <span style={{ color: '#9fef00' }}>{` }`}</span>
        </div>

        <div className="flex h-full">
          <button className="w-[45px] h-full flex items-center justify-center hover:bg-white/10 text-gray-400 transition-colors">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M19 13H5v-2h14v2z" /></svg>
          </button>
          <button className="w-[45px] h-full flex items-center justify-center hover:bg-white/10 text-gray-400 transition-colors">
            <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" /></svg>
          </button>
          <button onClick={onClose} className="w-[45px] h-full flex items-center justify-center hover:bg-[#e81123] hover:text-white text-gray-400 transition-colors">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
          </button>
        </div>
      </div>

      {/* Window Body */}
      <div className="flex flex-col flex-1" style={{ background: '#141d2b', overflow: 'hidden' }}>

        {/* Top Banner */}
        <div className="htb-banner flex items-center shrink-0"
          style={{
            height: 160,
            background: 'linear-gradient(180deg, #1a2d45 0%, #0f1d2d 100%)',
            borderBottom: '1px solid rgba(159, 239, 0, 0.13)',
            position: 'relative',
            overflow: 'hidden',
            padding: '20px 24px',
            justifyContent: 'space-between'
          }}
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ mixBlendMode: 'screen' }}>
            {/* 3D Cyber Grid / Boxes landscape simulation */}
            <div style={{
              position: 'absolute',
              bottom: '-20%', left: '-50%', width: '200%', height: '120%',
              backgroundImage: `
                linear-gradient(rgba(92, 136, 5, 0.8) 2px, transparent 2px),
                linear-gradient(90deg, rgba(159, 239, 0, 0.8) 2px, transparent 2px)
              `,
              backgroundSize: '50px 50px',
              transform: 'perspective(400px) rotateX(60deg)',
              transformOrigin: 'bottom center',
              maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 90%)',
              WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 90%)',
            }} />
          </div>

          {/* Left Side */}
          <div className="flex items-center relative z-10 w-full" style={{ justifyContent: 'space-between' }}>

            <div className="flex items-center">
              {/* Profile Avatar wrapper (Circle) */}
              <div style={{
                position: 'relative',
                width: 90, height: 90,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                filter: 'drop-shadow(0 0 15px rgba(159, 239, 0, 0.6))',
                borderRadius: '50%',
                background: '#9fef00',
                marginRight: '20px'
              }}>

                {/* Inner Image Container */}
                <div style={{
                  position: 'absolute', inset: '4px', // border width
                  borderRadius: '50%',
                  background: '#141d2b',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  <img src="/images/profile2.png" alt="Profile"
                    style={{
                      width: '100%', height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
              </div>

              <div className="flex flex-col ml-5">
                <span style={{ fontSize: 20, color: '#9fef00', fontFamily: 'monospace', fontWeight: 'bold' }}>MR.Key</span>
                <span style={{ fontSize: 11, color: '#4a5568', fontFamily: 'monospace', letterSpacing: 3, marginTop: 4 }}>HTB RANK</span>
              </div>
            </div>

            {/* Right Side: Rank Progress */}
            <div className="flex flex-col text-right items-end">
              <span style={{ color: '#4a5568', fontSize: 11, fontFamily: 'monospace', letterSpacing: 2 }}>RANK PROGRESS</span>
              <span style={{ color: '#9fef00', fontSize: 13, fontFamily: 'monospace', marginTop: 4, marginBottom: 8 }}>80% towards Pro Hacker</span>
              <div style={{ width: 200, height: 4, background: '#1a2d45', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: '80%', height: '100%', background: '#9fef00' }} />
              </div>
            </div>

          </div>
        </div>

        {/* Stats Row */}
        <div className="flex-1" style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: '#0a1628'
        }}>

          {/* Card 1 */}
          <div className="flex flex-col items-center justify-center" style={{ background: '#141d2b', padding: '20px 16px', textAlign: 'center' }}>
            <span style={{ fontSize: 28, color: '#f59e0b' }}>🏆</span>
            <span style={{ fontSize: 26, fontWeight: 'bold', color: '#ffffff', fontFamily: 'monospace', marginTop: 8 }}>#3546</span>
            <span style={{ color: '#4a5568', fontSize: 10, fontFamily: 'monospace', letterSpacing: 1.5, marginTop: 4 }}>GLOBAL RANKING</span>
          </div>

          {/* Card 2 */}
          <div className="flex flex-col items-center justify-center" style={{ background: '#141d2b', padding: '20px 16px', textAlign: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <polygon points="12,2 22,9 18,22 6,22 2,9" fill="none" stroke="#9fef00" strokeWidth="1.5" />
            </svg>
            <span style={{ fontSize: 26, fontWeight: 'bold', color: '#ffffff', fontFamily: 'monospace', marginTop: 8 }}>65</span>
            <span style={{ color: '#4a5568', fontSize: 10, fontFamily: 'monospace', letterSpacing: 1.5, marginTop: 4 }}>FINAL SCORE</span>
          </div>

          {/* Card 3 */}
          <div className="flex flex-col items-center justify-center" style={{ background: '#141d2b', padding: '20px 16px', textAlign: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="14" rx="2" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
              <path d="M3 17 L3 21" stroke="#f59e0b" strokeWidth="1.5" />
            </svg>
            <span style={{ fontSize: 26, fontWeight: 'bold', color: '#f59e0b', fontFamily: 'monospace', marginTop: 8 }}>11</span>
            <span style={{ color: '#4a5568', fontSize: 10, fontFamily: 'monospace', letterSpacing: 1.5, marginTop: 4 }}>USER OWNS</span>
          </div>

          {/* Card 4 */}
          <div className="flex flex-col items-center justify-center" style={{ background: '#141d2b', padding: '20px 16px', textAlign: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="14" rx="2" fill="none" stroke="#60a5fa" strokeWidth="1.5" />
              <path d="M3 17 L3 21" stroke="#60a5fa" strokeWidth="1.5" />
            </svg>
            <span style={{ fontSize: 26, fontWeight: 'bold', color: '#60a5fa', fontFamily: 'monospace', marginTop: 8 }}>12</span>
            <span style={{ color: '#4a5568', fontSize: 10, fontFamily: 'monospace', letterSpacing: 1.5, marginTop: 4 }}>SYSTEM OWNS</span>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="shrink-0 flex justify-between items-center px-[20px]"
          style={{ height: 40, background: '#0a1628', borderTop: '1px solid rgba(159, 239, 0, 0.1)' }}
        >
          <span style={{ color: '#9fef00', fontSize: 11, fontFamily: 'monospace', animation: 'blink 2s infinite' }}>
            ● CONNECTED
          </span>
          <span style={{ color: '#4a5568', fontSize: 11, fontFamily: 'monospace' }}>
            app.hackthebox.com/profile/kholis
          </span>
        </div>

      </div>
    </div>
  );
}
