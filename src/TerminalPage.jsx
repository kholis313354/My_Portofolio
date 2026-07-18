import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import useDraggable from './hooks/useDraggable';
import WindowControls from './components/WindowControls';

const BOOT_LINES_DESKTOP = [
  { text: "kholis@cyber:~$ mr.key --quiz", color: "#00f3ff" },
  { text: "", color: "#aaa" },
  { text: "  ███╗   ███╗██████╗     ██╗  ██╗███████╗██╗   ██╗", color: "#00f3ff" },
  { text: "  ████╗ ████║██╔══██╗    ██║ ██╔╝██╔════╝╚██╗ ██╔╝", color: "#00f3ff" },
  { text: "  ██╔████╔██║██████╔╝    █████╔╝ █████╗   ╚████╔╝ ", color: "#7000ff" },
  { text: "  ██║╚██╔╝██║██╔══██╗    ██╔═██╗ ██╔══╝    ╚██╔╝  ", color: "#7000ff" },
  { text: "  ██║ ╚═╝ ██║██║  ██║    ██║  ██╗███████╗   ██║   ", color: "#00f3ff" },
  { text: "  ╚═╝     ╚═╝╚═╝  ╚═╝ █  ╚═╝  ╚═╝╚══════╝   ╚═╝   ", color: "#00f3ff" },
  { text: "", color: "#aaa" },
  { text: "  [ Mr.Key - Quiz ] v1.0 :: Identity Verification System", color: "#ffaa00" },
  { text: "  ─────────────────────────────────────────────────────", color: "#2a2a2a" },
  { text: "", color: "#aaa" },
  { text: "  [*] Target  : ACCESS CONTROL GATEWAY", color: "#888" },
  { text: "  [*] Status  : LOCKED — Solve challenges to override", color: "#ff4444" },
  { text: "  [*] Mode    : INTERACTIVE QUIZ", color: "#888" },
  { text: "  ─────────────────────────────────────────────────────", color: "#2a2a2a" },
];

const BOOT_LINES_MOBILE = [
  { text: "kholis@cyber:~$ mrkey --quiz", color: "#00f3ff" },
  { text: "", color: "#aaa" },
  { text: "  ╔══════════════════════════════╗", color: "#00f3ff" },
  { text: "  ║   MR.KEY — QUIZ  v1.0       ║", color: "#00f3ff" },
  { text: "  ║   Identity Verification Sys ║", color: "#7000ff" },
  { text: "  ╚══════════════════════════════╝", color: "#00f3ff" },
  { text: "", color: "#aaa" },
  { text: "  [*] Target  : ACCESS CONTROL GATEWAY", color: "#888" },
  { text: "  [*] Status  : LOCKED", color: "#ff4444" },
  { text: "  [*] Mode    : INTERACTIVE QUIZ", color: "#888" },
  { text: "  ──────────────────────────────────", color: "#2a2a2a" },
];

const QUESTIONS = [
  {
    q: 'Q1. [Pengetahuan Dasar] Untuk menghidupkan komputer, tombol mana yang biasanya harus Anda tekan?',
    opts: ["  [A] Tombol Delete", "  [B] Tombol Escape", "  [C] Tombol Power", "  [D] Tombol Spasi"],
    answer: "C",
  },
  {
    q: 'Q2. [Logika Warna] Dalam lampu lalu lintas, warna apa yang menandakan kendaraan harus BERHENTI?',
    opts: ["  [A] Hijau", "  [B] Kuning", "  [C] Merah", "  [D] Biru Neon"],
    answer: "C",
  },
  {
    q: 'Q3. [Logika Umum] Untuk melihat pantulan wajah Anda sendiri, benda apa yang Anda gunakan?',
    opts: ["  [A] Jendela", "  [B] Pintu", "  [C] Cermin", "  [D] Tembok"],
    answer: "C",
  }
];

export default function TerminalPage({ onAccessGranted, onClose }) {
  const isMobile = window.innerWidth < 768;
  const BOOT_LINES = isMobile ? BOOT_LINES_MOBILE : BOOT_LINES_DESKTOP;

  const [lines, setLines] = useState([]);
  const [bootIdx, setBootIdx] = useState(0);
  const [quizActive, setQuizActive] = useState(false);
  const [qIdx, setQIdx] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [blink, setBlink] = useState(true);

  // Use one ref to scroll to the latest question, another for input
  const questionRef = useRef(null);
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const correctAudio = useRef(null);
  const wrongAudio = useRef(null);

  const { pos, handleMouseDown } = useDraggable();

  useEffect(() => {
    correctAudio.current = new Audio('/audio/dragon-studio-glitch-effect-1-397982.mp3');
    wrongAudio.current = new Audio('/audio/phatphrogstudio-android-voice-access-granted-477825.mp3');
    const t = setInterval(() => setBlink(b => !b), 530);
    return () => clearInterval(t);
  }, []);

  // Auto-scroll: when a new question appears, scroll to show it (not the bottom)
  // When other lines are added, scroll to end to show input
  useEffect(() => {
    if (questionRef.current) {
      questionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [lines, quizActive]);

  // Boot sequence runner
  useEffect(() => {
    if (bootIdx < BOOT_LINES.length) {
      const t = setTimeout(() => {
        setLines(p => [...p, BOOT_LINES[bootIdx]]);
        setBootIdx(p => p + 1);
      }, bootIdx === 0 ? 50 : 280);
      return () => clearTimeout(t);
    }
    if (!quizActive) {
      const t = setTimeout(() => {
        setLines(p => [
          ...p,
          { text: '', color: '#aaa' },
          { text: QUESTIONS[0].q, color: '#ffcc00' },
          ...QUESTIONS[0].opts.map(o => ({ text: o, color: '#aaa' })),
        ]);
        setQuizActive(true);
      }, 350);
      return () => clearTimeout(t);
    }
  }, [bootIdx, quizActive]);

  const addLines = (...newLines) => setLines(p => [...p, ...newLines]);

  const showQuestion = (idx) => {
    const q = QUESTIONS[idx];
    setLines(p => [
      ...p,
      { text: '', color: '#aaa' },
      { text: q.q, color: '#ffcc00' },
      ...q.opts.map(o => ({ text: o, color: '#aaa' })),
    ]);
    setQIdx(idx);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const breach = async () => {
    addLines(
      { text: '', color: '#aaa' },
      { text: '─────────────────────────────────────────────────', color: '#2a2a2a' },
      { text: 'ACCESS GRANTED.', color: '#00ff88' },
      { text: 'kholis@cyber:~$ ./trace_ip.sh', color: '#00f3ff' },
      { text: 'Connecting to ip-api.com...', color: '#888' },
    );
    try {
      const { data } = await axios.post('/api/breach');
      setTimeout(() => {
        if (data?.success) {
          addLines(
            { text: `> IP ADDRESS : ${data.data.ip}`, color: '#00f3ff' },
            { text: `> CITY       : ${data.data.city}`, color: '#00f3ff' },
            { text: `> COUNTRY    : ${data.data.country}`, color: '#00f3ff' },
          );
        }
        addLines(
          { text: '', color: '#aaa' },
          { text: 'BREACH COMPLETE. Launching mainframe...', color: '#00ff88' },
        );
        setTimeout(() => onAccessGranted(), 1800);
      }, 1000);
    } catch {
      addLines({ text: 'Tracking unavailable. Launching mainframe...', color: '#ffaa00' });
      setTimeout(() => onAccessGranted(), 1500);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const ans = inputVal.trim().toUpperCase();
    if (!ans || quizDone || !quizActive) return;
    setInputVal('');

    const isCorrect = ans === QUESTIONS[qIdx].answer;

    if (isCorrect) {
      correctAudio.current?.play().catch(() => { });
      addLines(
        { text: `  kholis@cyber:~$ ${ans}`, color: '#7000ff' },
        { text: `  ✓ Correct. Challenge ${qIdx + 1} cleared.`, color: '#00ff88' },
      );
      const next = qIdx + 1;
      if (next < QUESTIONS.length) {
        // Show next question after a short delay
        setTimeout(() => showQuestion(next), 350);
      } else {
        setQuizDone(true);
        addLines({ text: 'All challenges passed. Verifying identity...', color: '#888' });
        setTimeout(() => breach(), 400);
      }
    } else {
      wrongAudio.current?.play().catch(() => { });
      addLines(
        { text: `  kholis@cyber:~$ ${ans}`, color: '#7000ff' },
        { text: '  ✗ Incorrect. Try again.', color: '#ff4444' },
      );
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  return (
    <div
      className="fixed flex flex-col pointer-events-auto"
      style={{
        width: 700, height: 480, maxWidth: '95vw',
        top: `calc(50% + ${pos.y}px)`, left: `calc(50% + ${pos.x}px)`,
        transform: 'translate(-50%, -50%)',
        zIndex: 9993,
        borderRadius: 8,
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px #333',
        background: '#0d0d0d', cursor: 'text', userSelect: 'none'
      }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Windows-style title bar */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: '38px', paddingLeft: '16px', background: '#181818',
          borderBottom: '1px solid #2a2a2a', flexShrink: 0, cursor: 'move'
        }}
      >
        <div className="flex items-center space-x-2">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="#a0a0a0"><path d="M2 4h20v16H2V4zm2 2v12h16V6H4zm2 2h3v2H6V8zm0 3h8v2H6v-2z" /></svg>
          <span style={{ color: '#555', fontSize: 13, fontFamily: 'monospace' }}>
            kholis@cyber — bash — 120×40
          </span>
        </div>
        
        <WindowControls onClose={onClose} roundedClose />
      </div>

      {/* Output area */}
      <div
        className="flex-1 overflow-y-auto p-5"
        style={{ fontFamily: "'VT323', monospace", fontSize: 'clamp(16px, 2.2vw, 22px)', lineHeight: 1.55 }}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            // Mark the last question start with the ref so we can scroll to it
            ref={line.color === '#ffcc00' ? questionRef : null}
            style={{ color: line.color, whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginBottom: 2 }}
          >
            {line.text || '\u00A0'}
          </div>
        ))}

        {/* Input line */}
        {quizActive && !quizDone && (
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 8, background: 'transparent' }}>
            <span style={{ color: '#00f3ff', marginRight: 6, background: 'transparent' }}>kholis@cyber:~$</span>
            {/* Single char typed, shown as colored text — no background */}
            {inputVal && (
              <span style={{ color: '#7000ff', background: 'transparent', caretColor: 'transparent' }}>{inputVal}</span>
            )}
            {/* Blinking cursor block */}
            <span style={{
              color: '#00f3ff',
              background: 'transparent',
              display: 'inline-block',
              width: '0.65ch',
              opacity: blink ? 1 : 0,
            }}>█</span>
            {/* Invisible capture input */}
            <input
              ref={inputRef}
              autoFocus
              value={inputVal}
              onChange={e => setInputVal(e.target.value.toUpperCase().slice(-1))}
              onKeyDown={handleKeyDown}
              maxLength={1}
              style={{
                position: 'fixed',
                top: '-9999px',
                left: '-9999px',
                opacity: 0,
                width: 0,
                height: 0,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                color: 'transparent',
                caretColor: 'transparent',
              }}
            />
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={endRef} style={{ height: 8 }} />
      </div>
    </div>
  );
}
