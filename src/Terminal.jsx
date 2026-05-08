import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const BOOT_LINES = [
  "SYSTEM_BOOT...",
  "ESTABLISHING SECURE CONNECTION...",
  "CONNECTION ESTABLISHED.",
  "WARNING: UNAUTHORIZED ACCESS DETECTED.",
  "INITIATING DEFENSE PROTOCOLS...",
  "SOLVE THE FOLLOWING CHALLENGES TO PROVE CLEARANCE.",
];

const QUESTIONS = [
  {
    q: "Q1. Which protocol is used for SECURE network communication?",
    opts: ["A) HTTP", "B) HTTPS", "C) FTP", "D) Telnet"],
    answer: "B",
  },
  {
    q: "Q2. Which attack sends fraudulent emails to steal credentials?",
    opts: ["A) Phishing", "B) DDoS", "C) Man-in-the-Middle", "D) SQL Injection"],
    answer: "A",
  },
  {
    q: "Q3. Which algorithm is a SYMMETRIC key cipher?",
    opts: ["A) RSA", "B) ECC", "C) AES", "D) Diffie-Hellman"],
    answer: "C",
  }
];

export default function Terminal({ triggerGlitch, onAccessGranted, stage, setStage }) {
  const [lines, setLines] = useState([]);
  const [bootIdx, setBootIdx] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [qIdx, setQIdx] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const endRef = useRef(null);
  
  const correctAudio = useRef(null);
  const wrongAudio = useRef(null);

  useEffect(() => {
    correctAudio.current = new Audio('/audio/freesound_community-keyboard-space.mp3');
    wrongAudio.current = new Audio('/audio/dragon-studio-glitch-effect.mp3');
  }, []);

  useEffect(() => {
    if (!endRef.current) return;
    endRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  // Boot sequence
  useEffect(() => {
    if (stage < 3) return;
    if (bootIdx < BOOT_LINES.length) {
      const t = setTimeout(() => {
        setLines(p => [...p, BOOT_LINES[bootIdx]]);
        setBootIdx(p => p + 1);
      }, bootIdx === 0 ? 50 : 700);
      return () => clearTimeout(t);
    } else if (!quizStarted) {
      const t = setTimeout(() => {
        setQuizStarted(true);
        const q = QUESTIONS[0];
        setLines(p => [...p, '', q.q, ...q.opts]);
      }, 600);
      return () => clearTimeout(t);
    }
  }, [bootIdx, quizStarted, stage]);

  const breach = async (baseLines) => {
    setStage(4);
    const tracingLines = [...baseLines, '', 'ACCESS GRANTED. TRACING_IP...'];
    setLines(tracingLines);
    try {
      const { data } = await axios.post('http://localhost:5000/api/breach');
      setTimeout(() => {
        const extra = data?.success
          ? [
              `> IP DETECTED   : ${data.data.ip}`,
              `> CITY         : ${data.data.city}`,
              `> COUNTRY      : ${data.data.country}`,
              '',
              'LOGGING COMPLETE. WELCOME TO THE MAINFRAME.',
            ]
          : ['TRACKING FAILED. WELCOME.'];
        setLines([...tracingLines, ...extra]);
        setTimeout(() => onAccessGranted(), 1500);
      }, 1200);
    } catch {
      setTimeout(() => {
        setLines([...tracingLines, 'TRACKING BLOCKED. WELCOME.']);
        setTimeout(() => onAccessGranted(), 1200);
      }, 1200);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    if (!quizStarted || quizDone) return;
    const ans = inputVal.trim().toUpperCase();
    setInputVal('');
    if (!ans) return;

    if (ans === QUESTIONS[qIdx].answer) {
      correctAudio.current?.play().catch(() => {});
      const updated = [...lines, `> ${ans}`, '✓ CORRECT.'];
      const next = qIdx + 1;
      if (next < QUESTIONS.length) {
        const q = QUESTIONS[next];
        updated.push('', q.q, ...q.opts);
        setQIdx(next);
        setLines(updated);
      } else {
        setQuizDone(true);
        breach([...updated, '', 'ALL CHALLENGES PASSED. VERIFYING IDENTITY...']);
      }
    } else {
      wrongAudio.current?.play().catch(() => {});
      if (triggerGlitch) triggerGlitch();
      setLines([...lines, `> ${ans}`, '✗ ACCESS DENIED. TRY AGAIN.']);
    }
  };

  if (stage < 3) return null;

  return (
    <section
      className="absolute top-0 left-0 h-full z-10 pointer-events-auto flex flex-col"
      style={{
        width: 'clamp(280px, 40vw, 460px)',
        background: 'linear-gradient(to right, rgba(5,5,5,0.97) 0%, rgba(5,5,5,0.80) 80%, transparent 100%)',
        borderRight: '1px solid rgba(0,243,255,0.15)',
        padding: 'clamp(12px, 4vw, 32px)',
        fontFamily: "'VT323', monospace",
      }}
    >
      {/* Terminal header */}
      <header className="mb-4 pb-2" style={{ borderBottom: '1px solid rgba(0,243,255,0.2)' }}>
        <span style={{ color: '#00f3ff', fontFamily: "'Orbitron',sans-serif", fontSize: 'clamp(10px,1.5vw,14px)', letterSpacing: '0.2em', opacity: 0.7 }}>
          CYBER-TERMINAL v2.6 // AUTH MODULE
        </span>
      </header>

      {/* Output lines */}
      <div className="flex-1 overflow-y-auto flex flex-col justify-end" style={{ scrollbarWidth: 'thin', scrollbarColor: '#00f3ff transparent' }}>
        {lines.map((l, i) => (
          <p
            key={i}
            style={{
              color: l.startsWith('✓') ? '#00ff99' : l.startsWith('✗') ? '#ff4444' : l.startsWith('>') ? '#7000ff' : '#00f3ff',
              fontSize: 'clamp(14px, 2.2vw, 22px)',
              lineHeight: 1.5,
              textShadow: l.startsWith('✓') ? '0 0 8px #00ff99' : l.startsWith('✗') ? '0 0 8px #ff4444' : '0 0 5px #00f3ff',
              marginBottom: '4px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {l || '\u00A0'}
          </p>
        ))}

        {quizStarted && !quizDone && (
          <form onSubmit={submit} style={{ display: 'flex', alignItems: 'center', marginTop: '12px', gap: '8px' }}>
            <span style={{ color: '#7000ff', fontSize: 'clamp(18px,2.5vw,26px)', textShadow: '0 0 8px #7000ff' }}>▶</span>
            <input
              autoFocus
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              maxLength={1}
              placeholder="A / B / C / D"
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid #00f3ff',
                color: '#7000ff',
                fontFamily: "'VT323',monospace",
                fontSize: 'clamp(18px,2.5vw,26px)',
                padding: '4px 6px',
                width: '80%',
                outline: 'none',
                textShadow: '0 0 6px #7000ff',
              }}
            />
          </form>
        )}

        <div ref={endRef} />
      </div>

      {/* Footer status */}
      <footer style={{ marginTop: '12px', borderTop: '1px solid rgba(0,243,255,0.15)', paddingTop: '8px' }}>
        <span style={{ color: 'rgba(0,243,255,0.4)', fontFamily: "'Orbitron',sans-serif", fontSize: 'clamp(8px,1vw,11px)', letterSpacing: '0.15em' }}>
          {stage >= 5 ? '● BREACH COMPLETE' : stage === 4 ? '● TRACING...' : '● AUTH REQUIRED'}
        </span>
      </footer>
    </section>
  );
}
