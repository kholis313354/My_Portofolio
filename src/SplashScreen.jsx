import React, { useState, useRef, useEffect } from 'react';

export default function SplashScreen({ onComplete }) {
  const [fading, setFading] = useState(false);
  const [blink, setBlink] = useState(true);
  const clicked = useRef(false);

  useEffect(() => {
    const t = setInterval(() => setBlink(b => !b), 600);
    return () => clearInterval(t);
  }, []);

  const handleInit = () => {
    if (clicked.current) return;
    clicked.current = true;

    const voice = new Audio('/audio/phatphrogstudio-android-voice-access-granted.mp3');
    const bg = new Audio('/audio/backsound.mp3');
    bg.loop = true;
    bg.volume = 0.35;

    voice.play().catch(() => { });
    bg.play().catch(() => { });

    setFading(true);
    setTimeout(() => onComplete(), 900);
  };

  return (
    <div
      className={`absolute inset-0 flex items-center justify-center bg-[#050505] z-50 transition-opacity duration-900 font-cyber px-4`}
      style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.9s ease' }}
    >
      {/* Scanlines overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,243,255,0.04) 0px, rgba(0,243,255,0.04) 1px, transparent 1px, transparent 4px)',
        }}
      />

      {/* Main card */}
      <div className="relative z-10 text-center border-2 border-[#00f3ff] bg-black/90 px-8 py-12 md:px-16 md:py-16 shadow-[0_0_40px_rgba(0,243,255,0.5),inset_0_0_40px_rgba(0,243,255,0.05)] max-w-xl w-full">

        {/* Corner decorations */}
        <span className="absolute top-2 left-2 text-[#00f3ff] text-xs font-orbitron opacity-60">SYS://</span>
        <span className="absolute top-2 right-2 text-[#00f3ff] text-xs font-orbitron opacity-60">v2.6</span>
        <span className="absolute bottom-2 left-2 text-[#7000ff] text-xs font-orbitron opacity-60">BOOT::OK</span>
        <span className="absolute bottom-2 right-2 text-[#7000ff] text-xs font-orbitron opacity-60">ENC://AES</span>

        <h1
          className="text-3xl md:text-5xl font-orbitron text-[#00f3ff] mb-6 md:mb-8"
          style={{ textShadow: '0 0 10px #00f3ff, 0 0 30px #00f3ff, 0 0 60px rgba(0,243,255,0.5)', animation: 'pulse 2s ease-in-out infinite' }}
        >
          Portofolio Kholis
        </h1>

        <div className="flex items-center justify-center gap-2 mb-6 md:mb-8">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#00f3ff]" />
          <p className="text-gray-400 text-base md:text-xl tracking-[0.3em] uppercase">Awaiting Initialization</p>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#00f3ff]" />
        </div>

        <div style={{ position: 'relative', display: 'inline-block' }}>
          {/* Blinking side arrows */}
          <span style={{
            position: 'absolute', left: '-32px', top: '50%', transform: 'translateY(-50%)',
            color: '#00f3ff', fontSize: '20px', opacity: blink ? 1 : 0,
            textShadow: '0 0 8px #00f3ff', transition: 'opacity 0.1s',
            fontFamily: 'monospace',
          }}>▶▶</span>

          <button
            onClick={handleInit}
            className="relative bg-transparent text-[#00f3ff] font-orbitron border border-[#00f3ff] px-8 py-3 md:px-12 md:py-4 text-base md:text-xl uppercase tracking-widest cursor-pointer"
            style={{ transition: 'box-shadow 0.3s', animation: 'btnPop 0.5s ease-out' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 25px rgba(0,243,255,0.8), inset 0 0 25px rgba(0,243,255,0.15)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
          >
            <span className="relative z-10">[ INITIALIZE_SYSTEM ]</span>
          </button>

          <span style={{
            position: 'absolute', right: '-32px', top: '50%', transform: 'translateY(-50%)',
            color: '#00f3ff', fontSize: '20px', opacity: blink ? 0 : 1,
            textShadow: '0 0 8px #00f3ff', transition: 'opacity 0.1s',
            fontFamily: 'monospace',
          }}>◀◀</span>
        </div>

        {/* Bouncing click hint */}
        <p style={{
          marginTop: '16px',
          color: 'rgba(0,243,255,0.5)',
          fontFamily: "'Orbitron',sans-serif",
          fontSize: '11px',
          letterSpacing: '0.3em',
          animation: 'bounce 1.2s ease-in-out infinite',
        }}>▼ &nbsp; CLICK TO ENTER &nbsp; ▼</p>

        <p className="mt-6 text-gray-600 text-sm font-cyber tracking-widest animate-pulse">
          WARNING: UNAUTHORIZED ACCESS WILL BE TRACKED
        </p>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes pulse  { 0%,100% { opacity:1; } 50% { opacity:0.7; } }
        @keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(5px); } }
        @keyframes btnPop { from { transform: scale(0.95); opacity:0; } to { transform: scale(1); opacity:1; } }
      ` }} />
    </div>
  );
}
