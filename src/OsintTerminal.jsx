import React, { useState, useEffect, useRef } from 'react';

const API = '';

const ASCII_BANNER = [
  { text: "  ██████╗ ███████╗██╗███╗  ██╗████████╗", color: "#00b4d8" },
  { text: "  ██╔══██╗██╔════╝██║████╗ ██║╚══██╔══╝", color: "#9b59b6" },
  { text: "  ██║  ██║███████╗██║██╔██╗██║   ██║   ", color: "#00b4d8" },
  { text: "  ██║  ██║╚════██║██║██║╚████║   ██║   ", color: "#9b59b6" },
  { text: "  ██████╔╝███████║██║██║ ╚███║   ██║   ", color: "#00b4d8" },
  { text: "  ╚═════╝ ╚══════╝╚═╝╚═╝  ╚══╝   ╚═╝   ", color: "#9b59b6" }
];

const DESC_TEXT = `kholis@cyber:~$ mrkey --osint --mode=name-recon

[ OSINT NAME RECON v4.0 — Social Profile Mapping ]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Platform yang di-probe (20+):

  [◈] Apify Social Finder — Instagram, Twitter, LinkedIn,
      GitHub, TikTok, YouTube, Facebook  (API-verified)
  [◈] Platform Link Map  — 20 platform (direct probe)

[!] Rate limit: 3x scan per IP per hari

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[>] Masukkan nama lengkap target: `;

// Category color mapping
const CAT_COLOR = {
  Social:       '#00b4d8',
  Professional: '#ff6b35',
  Developer:    '#00ff88',
  Community:    '#febc2e',
  Blog:         '#9b59b6',
  Messaging:    '#00b4d8',
  CyberSec:     '#00ff41',
  Gaming:       '#ff4444',
  Privacy:      '#aaaaaa',
};

const buildResultsArray = (data) => {
  const lines = [];
  const cyan   = '#00b4d8';
  const purple = '#9b59b6';
  const green  = '#00ff41';
  const yellow = '#febc2e';
  const gray   = '#888888';
  const dim    = '#444444';

  const push = (segs) => lines.push(segs);
  const div  = () => push([{ text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', color: cyan }]);
  const blank = () => push([{ text: '', color: '' }]);

  div();
  push([{ text: '  [TARGET] ', color: cyan }, { text: data.full_name, color: yellow }]);
  push([{ text: '  [DB ID]  ', color: purple }, { text: `#${data.id || '—'}`, color: dim }]);
  push([
    { text: '  [LIMIT]  ', color: purple },
    { text: `Sisa scan hari ini: `, color: gray },
    { text: `${data.remaining_today}/${data.limit}`, color: data.remaining_today > 0 ? green : '#ff4444' },
  ]);
  div();
  blank();

  // ── Username variants ──
  const v = data.username_variants || {};
  push([{ text: '┌─ [RECON] ', color: cyan }, { text: 'USERNAME VARIANTS', color: '#00b4d8' }]);
  push([{ text: '│  ├── ', color: purple }, { text: 'slug        : ', color: gray }, { text: v.slug || '—', color: green }]);
  push([{ text: '│  ├── ', color: purple }, { text: 'hyphen      : ', color: gray }, { text: v.hyphen || '—', color: green }]);
  push([{ text: '│  ├── ', color: purple }, { text: 'underscore  : ', color: gray }, { text: v.underscore || '—', color: green }]);
  push([{ text: '│  └── ', color: purple }, { text: 'dot         : ', color: gray }, { text: v.dot || '—', color: green }]);
  push([{ text: '└──────────────────────────────────────────────', color: dim }]);
  blank();

  // ── Platform results grouped by category ──
  const platforms = data.platforms || [];
  const byCategory = {};
  platforms.forEach(p => {
    if (!byCategory[p.category]) byCategory[p.category] = [];
    byCategory[p.category].push(p);
  });

  const catIcon = {
    Social: '👥', Professional: '💼', Developer: '⌨️',
    Community: '🌐', Blog: '✍️', Messaging: '💬',
    CyberSec: '🛡️', Gaming: '🎮', Privacy: '🔒',
  };

  Object.entries(byCategory).forEach(([cat, items], ci) => {
    const catColor = CAT_COLOR[cat] || cyan;
    push([
      { text: `┌─ [${catIcon[cat] || '◈'}] `, color: cyan },
      { text: cat.toUpperCase(), color: catColor },
      { text: ` — ${items.length} platform`, color: dim },
    ]);
    items.forEach((p, idx) => {
      const isLast = idx === items.length - 1;
      const pre = isLast ? '│  └── ' : '│  ├── ';
      const verifiedBadge = p.verified ? '[✓ VERIFIED] ' : '';
      push([
        { text: pre, color: purple },
        { text: p.icon + ' ' + p.platform.padEnd(12), color: catColor },
        { text: verifiedBadge, color: p.verified ? green : '' },
        { text: p.apifyUrl || p.url, color: p.verified ? green : dim },
      ]);
    });
    push([{ text: '└──────────────────────────────────────────────', color: dim }]);
    blank();
  });

  // ── Summary ──
  div();
  const totalVerified = platforms.filter(p => p.verified).length;
  push([
    { text: '  [✓] SCAN COMPLETE — ', color: green },
    { text: `${platforms.length} platform diprofile`, color: gray },
  ]);
  if (data.apify_active) {
    push([
      { text: '  [◈] Apify verified: ', color: purple },
      { text: `${totalVerified} akun ditemukan`, color: totalVerified > 0 ? yellow : gray },
    ]);
  } else {
    push([{ text: '  [!] Apify offline — isi APIFY_TOKEN di .env untuk verifikasi real-time', color: dim }]);
  }
  push([{ text: '  [DB] Tersimpan ke database — ID: ', color: purple }, { text: `#${data.id || 'ERROR'}`, color: yellow }]);
  div();

  return lines;
};

export default function OsintTerminal({ onClose }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const bodyRef = useRef(null);

  // 0=InitDesc, 1=Input, 2=Fetching, 3=ResultTyping, 4=Done, 5=Error, 6=RateLimit
  const [step, setStep] = useState(0);
  const [descChars, setDescChars] = useState('');
  const [nameInput, setNameInput] = useState('');

  const [resultsBuffer, setResultsBuffer] = useState([]);
  const [typedResults, setTypedResults] = useState([]);
  const [scanProgress, setScanProgress] = useState(0);
  const [spinnerIdx, setSpinnerIdx] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [rateInfo, setRateInfo] = useState(null); // { used, limit, remaining }
  const loadingChars = ['|', '/', '-', '\\'];

  // ── Drag ─────────────────────────────────────────────────────
  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  };
  useEffect(() => {
    const onMove = (e) => { if (!isDragging) return; setPos({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y }); };
    const onUp = () => setIsDragging(false);
    if (isDragging) { window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp); }
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [isDragging]);

  // ── Step 0: Typewriter ────────────────────────────────────────
  useEffect(() => {
    if (step !== 0) return;
    let i = 0;
    const intv = setInterval(() => {
      setDescChars(DESC_TEXT.slice(0, ++i));
      if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
      if (i > DESC_TEXT.length) { clearInterval(intv); setStep(1); }
    }, 15);
    return () => clearInterval(intv);
  }, [step]);

  // ── Step 1: Load rate info on open ───────────────────────────
  useEffect(() => {
    if (step !== 1) return;
    fetch(`${API}/api/osint/rate-check`)
      .then(r => r.json())
      .then(d => setRateInfo(d))
      .catch(() => {});
  }, [step]);

  // ── Step 2: Spinner ───────────────────────────────────────────
  useEffect(() => {
    if (step !== 2) return;
    const sInt = setInterval(() => setSpinnerIdx(v => (v + 1) % 4), 130);
    const pInt = setInterval(() => setScanProgress(v => Math.min(v + 3, 90)), 200);
    return () => { clearInterval(sInt); clearInterval(pInt); };
  }, [step]);

  // ── Step 3: Typewriter results ────────────────────────────────
  useEffect(() => {
    if (step !== 3 || resultsBuffer.length === 0) return;
    let line = 0, char = 0;
    const intv = setInterval(() => {
      const segs = resultsBuffer[line];
      let rem = char;
      const sliced = [];
      for (const s of segs) {
        if (rem >= s.text.length) { sliced.push(s); rem -= s.text.length; }
        else if (rem > 0) { sliced.push({ text: s.text.slice(0, rem), color: s.color }); rem = 0; }
      }
      const typed = resultsBuffer.slice(0, line);
      typed.push(sliced);
      setTypedResults(typed);
      if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
      const total = segs.reduce((a, s) => a + s.text.length, 0);
      char += 5;
      if (char > total) { char = 0; line++; if (line >= resultsBuffer.length) { clearInterval(intv); setStep(4); } }
    }, 10);
    return () => clearInterval(intv);
  }, [step, resultsBuffer]);

  // ── Scan ──────────────────────────────────────────────────────
  const handleScan = async () => {
    const name = nameInput.trim();
    if (name.length < 2) return;
    setStep(2);
    setScanProgress(0);
    setErrorMsg('');

    try {
      const res = await fetch(`${API}/api/osint/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: name }),
      });

      setScanProgress(100);
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          setErrorMsg(data.error || 'Rate limit tercapai');
          setRateInfo({ used: data.used, limit: data.limit, remaining: 0 });
          setStep(6);
          return;
        }
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      setRateInfo({ used: data.limit - data.remaining_today, limit: data.limit, remaining: data.remaining_today });
      await new Promise(r => setTimeout(r, 300));
      setResultsBuffer(buildResultsArray(data));
      setStep(3);

    } catch (err) {
      console.error('[OSINT_ERROR]', err);
      setErrorMsg(`[SCAN_FAILED] ${err.message}`);
      setStep(5);
    }
  };

  const handleReset = () => {
    setStep(1);
    setNameInput('');
    setResultsBuffer([]);
    setTypedResults([]);
    setScanProgress(0);
    setErrorMsg('');
    fetch(`${API}/api/osint/rate-check`).then(r => r.json()).then(d => setRateInfo(d)).catch(() => {});
  };

  const rateBars = rateInfo
    ? Array.from({ length: rateInfo.limit }, (_, i) => i < (rateInfo.limit - rateInfo.remaining))
    : [];

  return (
    <div
      className="fixed z-[9999] flex flex-col rounded shadow-[0_0_40px_rgba(0,180,216,0.12)] border"
      style={{
        width: 740, height: 530, maxWidth: '97vw',
        top: `calc(50% + ${pos.y}px)`, left: `calc(50% + ${pos.x}px)`,
        transform: 'translate(-50%, -50%)',
        animation: 'slideInTopOsint 0.3s ease-out forwards',
        background: '#06070f',
        borderColor: '#0d1020',
      }}
    >
      <style>{`
        @keyframes slideInTopOsint {
          from { transform: translate(-50%, calc(-50% - 28px)); opacity: 0; }
          to   { transform: translate(-50%, -50%); opacity: 1; }
        }
        .osint-bar { transition: width 0.4s cubic-bezier(0.4,0,0.2,1); }
      `}</style>

      {/* ── Title Bar ── */}
      <div
        className="h-[38px] select-none cursor-move flex items-center justify-between rounded-t pl-[14px] flex-shrink-0"
        style={{ background: '#0a0b15', borderBottom: '1px solid #111422' }}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="#00b4d8"><path d="M2 4h20v16H2V4zm2 2v12h16V6H4zm2 2h3v2H6V8zm0 3h8v2H6v-2z" /></svg>
          <span style={{ color: '#00b4d8', fontSize: '12px', fontFamily: 'monospace' }}>mrkey@osint:~$ name-recon --deep</span>
          <span className="ml-2 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded" style={{ background: 'rgba(0,180,216,0.08)', color: '#00b4d8', border: '1px solid rgba(0,180,216,0.15)' }}>v4.0</span>

          {/* Rate limit pills */}
          {rateInfo && (
            <div className="ml-3 flex items-center gap-1.5">
              {rateBars.map((used, i) => (
                <div key={i} className="w-3 h-3 rounded-sm" style={{ background: used ? '#ff4444' : '#00ff41', boxShadow: used ? '0 0 4px #ff4444' : '0 0 4px #00ff41', opacity: 0.85 }} />
              ))}
              <span style={{ color: '#444', fontSize: '9px', fontFamily: 'monospace', marginLeft: '4px' }}>{rateInfo.remaining}/{rateInfo.limit} left</span>
            </div>
          )}
        </div>

        <div className="flex h-full">
          <button className="w-[40px] h-full flex items-center justify-center text-gray-700 hover:bg-white/5 transition-colors">
            <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor"><path d="M19 13H5v-2h14v2z" /></svg>
          </button>
          <button className="w-[40px] h-full flex items-center justify-center text-gray-700 hover:bg-white/5 transition-colors">
            <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" /></svg>
          </button>
          <button onClick={onClose} className="w-[40px] h-full flex items-center justify-center text-gray-700 hover:bg-[#e81123] hover:text-white transition-colors rounded-tr">
            <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
          </button>
        </div>
      </div>

      {/* ── Terminal Body ── */}
      <div
        ref={bodyRef}
        className="flex-1 overflow-y-auto pb-6"
        style={{ background: '#06070f', fontFamily: "'Courier New', 'JetBrains Mono', monospace", fontSize: '12.5px', lineHeight: 1.5, padding: '14px 16px' }}
      >
        {/* ASCII Banner */}
        <div className="mb-3 whitespace-pre leading-tight overflow-x-hidden" style={{ fontSize: '11.5px' }}>
          {ASCII_BANNER.map((row, i) => (
            <div key={i} style={{ color: row.color }}>{row.text}</div>
          ))}
        </div>

        {/* Typewriter Description */}
        <div className="whitespace-pre-wrap" style={{ color: '#00ff41', lineHeight: 1.5 }}>
          {descChars}
          {step <= 1 && <span className="animate-pulse">_</span>}
        </div>

        {/* Input */}
        {step >= 1 && (
          <div className="flex items-center mt-1 gap-2">
            <span style={{ color: '#00b4d8', whiteSpace: 'nowrap' }}>kholis@cyber:~$ </span>
            {step === 1 ? (
              <>
                <input
                  autoFocus
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleScan()}
                  placeholder="Contoh: Budi Santoso"
                  disabled={rateInfo?.remaining === 0}
                  className="bg-transparent outline-none flex-1"
                  style={{
                    color: '#00b4d8',
                    borderBottom: `1px solid ${rateInfo?.remaining === 0 ? '#ff4444' : 'rgba(0,180,216,0.4)'}`,
                    minWidth: 0, maxWidth: '240px', padding: '0 4px',
                    opacity: rateInfo?.remaining === 0 ? 0.4 : 1,
                  }}
                />
                <button
                  onClick={handleScan}
                  disabled={rateInfo?.remaining === 0 || nameInput.trim().length < 2}
                  className="flex-shrink-0 px-3 py-0.5 text-[11px] font-black uppercase tracking-widest transition-all"
                  style={{
                    background: (rateInfo?.remaining === 0) ? '#1a1a1a' : 'linear-gradient(135deg, #00b4d8, #0077b6)',
                    color: (rateInfo?.remaining === 0) ? '#333' : '#000',
                    borderRadius: '4px',
                    boxShadow: (rateInfo?.remaining === 0) ? 'none' : '0 0 12px rgba(0,180,216,0.3)',
                    cursor: (rateInfo?.remaining === 0) ? 'not-allowed' : 'pointer',
                  }}
                >
                  {rateInfo?.remaining === 0 ? '[ LIMIT REACHED ]' : '[ SCAN → ]'}
                </button>
              </>
            ) : (
              <span style={{ color: '#febc2e' }}>{nameInput}</span>
            )}
          </div>
        )}

        {/* Scanning Loader */}
        {step === 2 && (
          <div className="mt-4 space-y-3">
            <div style={{ color: '#00b4d8', fontSize: '11px', letterSpacing: '0.15em' }}>
              [ PROBING 20+ PLATFORMS... ] {loadingChars[spinnerIdx]}
            </div>
            {/* Overall progress bar */}
            <div className="w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', height: '3px' }}>
              <div className="osint-bar h-full rounded-full" style={{ width: `${scanProgress}%`, background: 'linear-gradient(90deg, #00b4d8, #9b59b6)', boxShadow: '0 0 8px #00b4d8' }} />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2" style={{ fontSize: '10px' }}>
              {['Social Media', 'Professional', 'Dev / Tech'].map((m, i) => {
                const done = scanProgress > (i + 1) * 30;
                return (
                  <div key={m} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: done ? '#00ff41' : '#00b4d8', boxShadow: done ? '0 0 4px #00ff41' : '0 0 4px #00b4d8', animation: done ? 'none' : 'pulse 1s infinite' }} />
                    <span style={{ color: done ? '#00ff41' : '#555', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{m}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Typing Results */}
        {step >= 3 && step !== 5 && step !== 6 && (
          <div className="mt-3 whitespace-pre-wrap">
            {typedResults.map((line, lid) => (
              <div key={lid} style={{ lineHeight: 1.55 }}>
                {line.map((seg, sid) => (
                  <span key={sid} style={{ color: seg.color }}>{seg.text}</span>
                ))}
              </div>
            ))}
            {step === 3 && <span style={{ color: '#00ff41' }} className="animate-pulse">_</span>}
          </div>
        )}

        {/* Done actions */}
        {step === 4 && (
          <div className="mt-4 flex gap-3">
            <button onClick={handleReset} className="px-4 py-1.5 text-[11px] font-black uppercase tracking-widest transition-all hover:scale-105"
              style={{ background: 'rgba(0,180,216,0.1)', color: '#00b4d8', border: '1px solid rgba(0,180,216,0.3)', borderRadius: '4px' }}>
              ↩ SCAN LAGI
            </button>
            <button onClick={onClose} className="px-4 py-1.5 text-[11px] font-black uppercase tracking-widest transition-all hover:scale-105"
              style={{ background: 'rgba(255,68,68,0.1)', color: '#ff4444', border: '1px solid rgba(255,68,68,0.3)', borderRadius: '4px' }}>
              ✕ TUTUP
            </button>
          </div>
        )}

        {/* Rate Limit State */}
        {step === 6 && (
          <div className="mt-4">
            <div style={{ color: '#ff4444', fontFamily: 'monospace', fontSize: '12px', lineHeight: 1.6 }}>
              {'━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'}{'\n'}
              {'[RATE_LIMIT] ' + errorMsg}{'\n'}
              {'\n'}
              {'[!] Limit: 3 scan per IP per hari'}{'\n'}
              {'[!] Scan bisa dilakukan kembali besok pagi'}{'\n'}
              {'━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'}
            </div>
            <div className="flex gap-3 mt-3">
              <div className="flex gap-1.5 items-center">
                {Array.from({ length: rateInfo?.limit || 3 }, (_, i) => (
                  <div key={i} className="w-4 h-4 rounded" style={{ background: '#ff4444', boxShadow: '0 0 6px #ff4444', opacity: 0.9 }} />
                ))}
                <span style={{ color: '#ff4444', fontSize: '10px', marginLeft: '6px', fontFamily: 'monospace' }}>ALL SLOTS USED</span>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {step === 5 && (
          <div className="mt-4">
            <div style={{ color: '#ff4444', fontFamily: 'monospace', fontSize: '11px', lineHeight: 1.6 }}>
              {'━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'}{'\n'}
              {errorMsg}{'\n'}
              {'\n'}
              {'[!] Pastikan server berjalan: npm run server'}{'\n'}
              {'━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'}
            </div>
            <button onClick={handleReset} className="mt-3 px-4 py-1.5 text-[11px] font-black uppercase"
              style={{ background: 'rgba(0,180,216,0.1)', color: '#00b4d8', border: '1px solid rgba(0,180,216,0.3)', borderRadius: '4px' }}>
              ↩ COBA LAGI
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
