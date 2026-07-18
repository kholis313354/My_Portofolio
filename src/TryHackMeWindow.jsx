import React from 'react';
import useDraggable from './hooks/useDraggable';
import WindowControls from './components/WindowControls';

export default function TryHackMeWindow({ onClose }) {
  const { pos, handleMouseDown } = useDraggable();

  return (
    <div
      className="fixed flex flex-col pointer-events-auto"
      style={{
        width: 700, height: 520, maxWidth: '95vw',
        top: `calc(50% + ${pos.y}px)`, left: `calc(50% + ${pos.x}px)`,
        transform: 'translate(-50%, -50%)',
        zIndex: 9995,
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(193, 17, 17, 0.4), 0 0 0 1px rgba(193,17,17,0.3)',
        background: '#1a1a2e',
        animation: 'windowBounceIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
      }}
    >
      <style>{`
        @keyframes windowBounceIn {
          0%   { transform: translate(-50%,-50%) scale(0.85); opacity: 0; }
          60%  { transform: translate(-50%,-50%) scale(1.02); opacity: 1; }
          100% { transform: translate(-50%,-50%) scale(1); opacity: 1; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
        @keyframes drift {
          0%   { background-position: 0 0; }
          100% { background-position: 20px 20px; }
        }
        .thm-banner::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, #c1111122 1px, transparent 1px);
          background-size: 20px 20px;
          animation: drift 8s linear infinite;
        }
      `}</style>

      {/* Title Bar - Windows Style */}
      <div
        className="flex items-center justify-between select-none cursor-move overflow-hidden"
        style={{
          height: 38,
          background: 'linear-gradient(135deg, #0d0d1a, #1a0a0a)',
          borderBottom: '1px solid #c11111'
        }}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center pointer-events-none pl-[16px]">
          <svg viewBox="0 0 120 24" width="120" height="24">
            <text x="0" y="18" fontFamily="monospace" fontSize="14" fill="#c11111" fontWeight="bold">Try</text>
            <text x="28" y="18" fontFamily="monospace" fontSize="14" fill="#ffffff" fontWeight="bold">HackMe</text>
          </svg>
        </div>

        <WindowControls onClose={onClose} />
      </div>

      {/* Window Body */}
      <div className="flex flex-col flex-1" style={{ background: '#12121f', overflow: 'hidden' }}>

        {/* Banner Section */}
        <div className="thm-banner flex items-center shrink-0"
          style={{
            height: 140,
            background: 'linear-gradient(135deg, #0d1117 0%, #1a0a20 50%, #0d1117 100%)',
            borderBottom: '1px solid #c11111',
            position: 'relative',
            overflow: 'hidden',
            padding: 20
          }}
        >
          {/* Internal content positioned relative to sit above ::before pseudo element */}
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', width: '100%' }}>

            <div style={{ position: 'relative', marginRight: 20 }}>
              <img src="/images/profile2.png" alt="Profile"
                style={{
                  width: 72, height: 72, borderRadius: '50%',
                  border: '3px solid #c11111', boxShadow: '0 0 20px rgba(193,17,17,0.4)',
                  objectFit: 'cover'
                }}
              />
              <div style={{
                position: 'absolute', bottom: -4, left: -4,
                background: 'linear-gradient(135deg, #8b5cf6, #c11111)',
                borderRadius: '50%', width: 24, height: 24,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, border: '2px solid #12121f'
              }}>👑</div>
            </div>

            <div className="flex flex-col">
              <span style={{ fontSize: 22, fontWeight: 'bold', color: '#ffffff', fontFamily: 'monospace' }}>Kholis</span>
              <span style={{ fontSize: 14, color: '#9fef00', fontFamily: 'monospace', marginTop: 4 }}>[0xD][GOD] 🇮🇩</span>

              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button style={{
                  border: '1px solid #444', background: '#1e1e2e', color: '#ccc',
                  padding: '5px 12px', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontFamily: 'monospace'
                }}>📋 Get profile badge ID</button>
                <button style={{
                  border: '1px solid #444', background: '#1e1e2e', color: '#ccc',
                  padding: '5px 12px', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontFamily: 'monospace'
                }}>↗ Share room badges</button>
              </div>
            </div>

          </div>
        </div>

        {/* Stats Grid */}
        <div className="flex-1 overflow-y-auto" style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: '#222235'
        }}>

          {/* Card 1 */}
          <div style={{ background: '#12121f', padding: '18px 24px', position: 'relative' }}>
            <div style={{
              position: 'absolute', top: 18, right: 24, background: '#9fef00', color: '#000',
              fontSize: 10, padding: '2px 8px', borderRadius: 4, fontFamily: 'monospace', fontWeight: 'bold'
            }}>top 1%</div>
            <div style={{ color: '#aaa', fontSize: 13, fontFamily: 'monospace' }}>Rank</div>
            <div style={{ marginTop: 8 }}>
              <span style={{ fontSize: 28, color: '#f59e0b' }}>🏆</span>
              <span style={{ fontSize: 28, fontWeight: 'bold', color: '#ffffff', fontFamily: 'monospace', marginLeft: 8 }}>31354</span>
            </div>
          </div>

          {/* Card 2 */}
          <div style={{ background: '#12121f', padding: '18px 24px' }}>
            <div style={{ color: '#aaa', fontSize: 13, fontFamily: 'monospace' }}>Badges</div>
            <div style={{ marginTop: 8 }}>
              <span style={{ fontSize: 28 }}>🔰</span>
              <span style={{ fontSize: 28, fontWeight: 'bold', color: '#ffffff', fontFamily: 'monospace', marginLeft: 8 }}>21</span>
            </div>
          </div>

          {/* Card 3 */}
          <div style={{ background: '#12121f', padding: '18px 24px' }}>
            <div style={{ color: '#aaa', fontSize: 13, fontFamily: 'monospace' }}>Streak</div>
            <div style={{ marginTop: 8 }}>
              <span style={{ fontSize: 28, color: '#f97316' }}>🔥</span>
              <span style={{ fontSize: 28, fontWeight: 'bold', color: '#ffffff', fontFamily: 'monospace', marginLeft: 8 }}>11</span>
            </div>
            <div style={{ color: '#666', fontSize: 11, fontFamily: 'monospace', marginTop: 4 }}>day streak</div>
          </div>

          {/* Card 4 */}
          <div style={{ background: '#12121f', padding: '18px 24px' }}>
            <div style={{ color: '#aaa', fontSize: 13, fontFamily: 'monospace' }}>Completed rooms</div>
            <div style={{ marginTop: 8 }}>
              <span style={{ fontSize: 28 }}>📗</span>
              <span style={{ fontSize: 28, fontWeight: 'bold', color: '#ffffff', fontFamily: 'monospace', marginLeft: 8 }}>120</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="shrink-0 flex justify-between items-center px-[10px]"
          style={{ height: 40, background: '#0d0d1a', borderTop: '1px solid #c1111144' }}
        >
          <span style={{ color: '#c11111', fontSize: 10, fontFamily: 'monospace', animation: 'blink 2s infinite' }}>
            ● CONNECTED
          </span>
          <span style={{ color: '#666', fontSize: 10, fontFamily: 'monospace', marginLeft: -10 }}>
            tryhackme.com/p/kholis
          </span>
        </div>

      </div>
    </div>
  );
}
