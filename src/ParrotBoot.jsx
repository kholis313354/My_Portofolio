import React, { useEffect, useRef } from 'react';

export default function ParrotBoot({ setPage }) {
  const tickRef = useRef(null);

  useEffect(() => {
    // Draw tick marks on SVG ring
    const g = tickRef.current;
    if (g) {
      g.innerHTML = '';
      for (let i = 0; i < 72; i++) {
        const angle = i * 5;
        const rad = (angle * Math.PI) / 180;
        const isMajor = i % 6 === 0;
        const r1 = 134;
        const r2 = isMajor ? 124 : 129;
        const x1 = 146 + r1 * Math.sin(rad);
        const y1 = 146 - r1 * Math.cos(rad);
        const x2 = 146 + r2 * Math.sin(rad);
        const y2 = 146 - r2 * Math.cos(rad);
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', isMajor ? '#00b4d8' : '#0d3040');
        line.setAttribute('stroke-width', isMajor ? '1.5' : '0.8');
        g.appendChild(line);
      }
    }

    const timer = setTimeout(() => {
      setPage(1);
    }, 5000);
    return () => clearTimeout(timer);
  }, [setPage]);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: '#000',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        zIndex: 50, overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes rotCW  { to { transform: rotate(360deg);  } }
        @keyframes rotCCW { to { transform: rotate(-360deg); } }
        @keyframes blink  { 0%,49%{opacity:1} 50%,100%{opacity:0} }
        @keyframes fadeInBoot { from{opacity:0} to{opacity:1} }

        .hud-wrap { animation: fadeInBoot .8s ease forwards; }

        .ring-r1 {
          position: absolute; border-radius: 50%;
          width: 310px; height: 310px;
          border: 1px dashed #0d3040;
          animation: rotCW 30s linear infinite;
        }
        .ring-r5 {
          position: absolute; border-radius: 50%;
          width: 185px; height: 185px;
          border: 1.5px solid #0a2a38;
          border-top-color: #00b4d8;
          border-bottom-color: #00b4d8;
          animation: rotCW 7s linear infinite;
        }
        .ring-r6 {
          position: absolute; border-radius: 50%;
          width: 155px; height: 155px;
          border: 1px dashed #0a2532;
          border-top-color: #005f73;
          animation: rotCCW 5s linear infinite;
        }
        .svg-r2 { position: absolute; width: 292px; height: 292px; animation: rotCCW 20s linear infinite; }
        .svg-r3 { position: absolute; width: 258px; height: 258px; animation: rotCW 14s linear infinite; }
        .svg-r4 { position: absolute; width: 220px; height: 220px; animation: rotCCW 10s linear infinite; }
        .svg-scan { position: absolute; width: 190px; height: 190px; animation: rotCW 4s linear infinite; opacity: .18; }

        .data-blink { animation: blink 1.2s step-end infinite; }
      `}</style>

      {/* HUD Container */}
      <div
        className="hud-wrap"
        style={{ position: 'relative', width: 320, height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {/* Floating data labels */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: 0, height: 0, pointerEvents: 'none' }}>
          {[
            { text: 'SYS:OK', x: -178, y: -88, size: 9 },
            { text: '0x4F2A', x: 92, y: -118, size: 8, opacity: .5 },
            { text: 'NET:ON', x: 96, y: 82, size: 8 },
            { text: 'CPU:03%', x: -182, y: 62, size: 8, opacity: .5 },
            { text: 'BOOT', x: -18, y: 150, size: 8, opacity: .4 },
          ].map((d, i) => (
            <span
              key={i}
              style={{
                position: 'absolute',
                transform: `translate(${d.x}px, ${d.y}px)`,
                color: '#00b4d8',
                fontFamily: '"Courier New", monospace',
                fontSize: d.size || 9,
                letterSpacing: '1.5px',
                opacity: d.opacity || .7,
                whiteSpace: 'nowrap',
              }}
            >
              {d.text}
            </span>
          ))}
          {/* Blinking corner diamonds */}
          {[{ x: -58, y: -158 }, { x: 47, y: -158 }].map((d, i) => (
            <span
              key={i}
              className="data-blink"
              style={{
                position: 'absolute',
                transform: `translate(${d.x}px, ${d.y}px)`,
                color: '#00b4d8',
                fontFamily: '"Courier New", monospace',
                fontSize: 8,
                opacity: .6,
              }}
            >◆</span>
          ))}
        </div>

        {/* Ring 1 – outermost dotted */}
        <div className="ring-r1" />

        {/* Ring 2 – tick marks */}
        <svg className="svg-r2" viewBox="0 0 292 292">
          <g ref={tickRef} />
          <circle cx="146" cy="146" r="140" stroke="#0d3040" strokeWidth="6" fill="none" strokeDasharray="30 8 15 8 50 8 20 8" />
          <circle cx="146" cy="146" r="140" stroke="#00b4d8" strokeWidth="2" fill="none" strokeDasharray="8 132" strokeDashoffset="-10" opacity=".8" />
          <circle cx="146" cy="146" r="140" stroke="#005f73" strokeWidth="1.5" fill="none" strokeDasharray="20 60 12 60" strokeDashoffset="-45" opacity=".6" />
        </svg>

        {/* Ring 3 – data arcs + corner blocks */}
        <svg className="svg-r3" viewBox="0 0 258 258">
          <circle cx="129" cy="129" r="122" fill="none" stroke="#061a24" strokeWidth="10" />
          <circle cx="129" cy="129" r="122" fill="none" stroke="#0d3d52" strokeWidth="10" strokeDasharray="60 15 30 10 20 60 40 20" opacity=".9" />
          <circle cx="129" cy="129" r="122" fill="none" stroke="#00b4d8" strokeWidth="2" strokeDasharray="18 200" opacity=".9" />
          <circle cx="129" cy="129" r="122" fill="none" stroke="#005f73" strokeWidth="1.5" strokeDasharray="10 80 25 100" opacity=".6" />
          {/* Cardinal corner blocks */}
          <rect x="124" y="2" width="10" height="14" fill="#00b4d8" rx="1" />
          <rect x="124" y="242" width="10" height="14" fill="#00b4d8" rx="1" />
          <rect x="2" y="124" width="14" height="10" fill="#00b4d8" rx="1" />
          <rect x="242" y="124" width="14" height="10" fill="#00b4d8" rx="1" />
          <rect x="90" y="4" width="6" height="8" fill="#005f73" rx="1" opacity=".7" />
          <rect x="162" y="4" width="6" height="8" fill="#005f73" rx="1" opacity=".7" />
        </svg>

        {/* Ring 4 – gear dashes */}
        <svg className="svg-r4" viewBox="0 0 220 220">
          <circle cx="110" cy="110" r="104" fill="#040d14" stroke="#0d2535" strokeWidth="7" strokeDasharray="8 6" />
          <circle cx="110" cy="110" r="96" fill="none" stroke="#061820" strokeWidth="4" strokeDasharray="15 10 5 10" />
          <circle cx="110" cy="110" r="90" fill="none" stroke="#0a2d3e" strokeWidth="1" strokeDasharray="3 12" />
          <circle cx="110" cy="110" r="104" fill="none" stroke="#00b4d8" strokeWidth="1.5" strokeDasharray="2 40" opacity=".5" />
        </svg>

        {/* Ring 5 */}
        <div className="ring-r5" />

        {/* Ring 6 */}
        <div className="ring-r6" />

        {/* Scan sweep */}
        <svg className="svg-scan" viewBox="0 0 190 190">
          <defs>
            <linearGradient id="parrot-sweep" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#00b4d8" stopOpacity="0" />
              <stop offset="100%" stopColor="#00b4d8" stopOpacity="1" />
            </linearGradient>
          </defs>
          <line x1="95" y1="95" x2="95" y2="5" stroke="url(#parrot-sweep)" strokeWidth="2" />
        </svg>

        {/* Center Logo */}
        <div
          style={{
            position: 'relative', zIndex: 10,
            width: 92, height: 92, borderRadius: '50%',
            border: '2px solid #00b4d8',
            background: '#001824',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 18px rgba(0,180,216,.3), inset 0 0 12px rgba(0,180,216,.05)',
          }}
        >
          <img 
            src="/images/parrot-logo.jpg" 
            alt="Parrot Logo"
            style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%',
              objectFit: 'cover'
            }} 
          />
        </div>
      </div>

      {/* Bottom labels */}
      <div style={{ position: 'absolute', bottom: 32, textAlign: 'center' }}>
        <div
          style={{
            color: '#00b4d8',
            fontFamily: '"Courier New", monospace',
            fontSize: 14,
            letterSpacing: '5px',
            fontWeight: 'bold',
            textShadow: '0 0 10px rgba(0,180,216,.3)',
          }}
        >
          Parrot OS
        </div>
        <div
          style={{
            color: '#2a6a7a',
            fontFamily: '"Courier New", monospace',
            fontSize: 9,
            letterSpacing: '6px',
            marginTop: 4,
            textTransform: 'uppercase',
          }}
        >
          Security Edition
        </div>
      </div>
    </div>
  );
}