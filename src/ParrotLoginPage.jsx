import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

// Username shown at the email step (cosmetic gate only).
// Password is verified server-side against KERNEL_PASSWORD — never in the client.
const EMAIL = 'kholiskamal354@gmail.com';

/* ──────────────────────────────────────────────
   Animated Network Canvas (Parrot OS login bg)
────────────────────────────────────────────── */
function NetworkCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Generate nodes
    const makeNodes = (count, color, xRange, yRange) =>
      Array.from({ length: count }, () => ({
        x: xRange[0] + Math.random() * (xRange[1] - xRange[0]),
        y: yRange[0] + Math.random() * (yRange[1] - yRange[0]),
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: 3 + Math.random() * 3,
        color,
      }));

    const cyanNodes = makeNodes(12, '#00b4d8', [0, 0.55], [0, 1]);
    const redNodes = makeNodes(14, '#e63946', [0.45, 1], [0, 1]);
    const allNodes = [...cyanNodes, ...redNodes];

    let raf;
    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Draw starfield
      ctx.fillStyle = '#070b10';
      ctx.fillRect(0, 0, W, H);

      // Soft red glow top-right
      const grd = ctx.createRadialGradient(W * 0.85, H * 0.15, 0, W * 0.85, H * 0.15, W * 0.4);
      grd.addColorStop(0, 'rgba(150,20,20,0.18)');
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);

      // Move nodes
      allNodes.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > 1) n.vx *= -1;
        if (n.y < 0 || n.y > 1) n.vy *= -1;
      });

      // Draw edges within groups
      const drawEdges = (nodes, threshold) => {
        nodes.forEach((a, i) => {
          nodes.slice(i + 1).forEach(b => {
            const dist = Math.hypot((a.x - b.x) * W, (a.y - b.y) * H);
            if (dist < threshold) {
              ctx.beginPath();
              ctx.moveTo(a.x * W, a.y * H);
              ctx.lineTo(b.x * W, b.y * H);
              ctx.strokeStyle = a.color + '55';
              ctx.lineWidth = 0.8;
              ctx.stroke();
            }
          });
        });
      };

      drawEdges(cyanNodes, 200);
      drawEdges(redNodes, 200);

      // Draw nodes
      allNodes.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x * W, n.y * H, n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.shadowColor = n.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Central white bridge node
      const cx = 0.52, cy = 0.5;
      ctx.beginPath();
      ctx.arc(cx * W, cy * H, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

/* ──────────────────────────────────────────────
   Main Login Page Component
────────────────────────────────────────────── */
export default function ParrotLoginPage({ onSuccess }) {
  const [step, setStep] = useState('email'); // 'email' | 'password'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const inputRef = useRef(null);

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  useEffect(() => {
    inputRef.current?.focus();
  }, [step]);

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (email.trim().toLowerCase() !== EMAIL.toLowerCase()) {
      setError('Email tidak ditemukan.');
      return;
    }
    setError('');
    setStep('password');
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await axios.post('/v1/kernel-access/login', { password });
      if (data?.success && data?.token) {
        onSuccess(data.token);
      } else {
        setError('Password salah. Akses ditolak.');
        setPassword('');
      }
    } catch (err) {
      const msg = err?.response?.status === 401
        ? 'Password salah. Akses ditolak.'
        : 'Login gagal. Coba lagi.';
      setError(msg);
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#070b10] select-none">
      {/* Animated background */}
      <NetworkCanvas />

      {/* Top bar (Parrot style) */}
      <div className="absolute top-0 left-0 right-0 h-7 flex items-center justify-between px-3 z-10 text-[12px] text-[#a0a0a0]" style={{ background: 'rgba(0,0,0,0.55)', fontFamily: 'monospace' }}>
        <span className="text-[#00b4d8] font-bold">parrot</span>
        <span>{timeStr}</span>
      </div>

      {/* Login Card */}
      <div
        className="absolute z-20 flex flex-col"
        style={{ left: '5%', top: '50%', transform: 'translateY(-50%)', width: 'min(220px, 90vw)' }}
      >
        {/* Avatar + Username */}
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-8 h-8 rounded flex items-center justify-center text-[11px] font-bold text-black"
            style={{ background: 'linear-gradient(135deg, #00b4d8, #0077b6)' }}
          >
            K
          </div>
          <span className="text-[#00b4d8] text-[13px] font-mono font-semibold">Kholis</span>
        </div>

        {/* Form box */}
        <div
          className="rounded-sm overflow-hidden"
          style={{ background: 'rgba(10,14,20,0.82)', border: '1px solid rgba(0,180,216,0.25)' }}
        >
          {step === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="flex flex-col">
              <div className="px-3 pt-2 pb-1">
                <label className="text-[10px] text-[#888] font-mono block mb-1">Email</label>
                <input
                  ref={inputRef}
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="user@parrot.sh"
                  className="w-full bg-transparent text-[#cfcfcf] text-[12px] font-mono outline-none border-b border-[#00b4d8]/40 pb-0.5 placeholder-[#555]"
                />
              </div>
              {error && <p className="text-[10px] text-[#e63946] font-mono px-3 pb-1">{error}</p>}
              <button
                type="submit"
                className="flex items-center justify-between px-3 py-2 border-t border-[#00b4d8]/20 text-[#00b4d8] text-[11px] font-mono hover:bg-[#00b4d8]/10 transition-colors"
              >
                <span>Lanjut</span>
                <span>›</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="flex flex-col">
              <div className="flex items-center justify-between px-3 pt-2 mb-1">
                <span className="text-[10px] text-[#888] font-mono">{email}</span>
                <button type="button" onClick={() => { setStep('email'); setPassword(''); setError(''); }} className="text-[10px] text-[#00b4d8] font-mono hover:underline">←</button>
              </div>
              <div className="px-3 pb-1 relative">
                <label className="text-[10px] text-[#888] font-mono block mb-1">Password</label>
                <div className="flex items-center border-b border-[#00b4d8]/40">
                  <input
                    ref={inputRef}
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    placeholder="••••••••"
                    className="flex-1 bg-transparent text-[#cfcfcf] text-[12px] font-mono outline-none pb-0.5 placeholder-[#555]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="text-[#555] hover:text-[#00b4d8] text-[10px] ml-1 pb-0.5"
                  >
                    {showPass ? '🙈' : '👁'}
                  </button>
                </div>
              </div>
              {error && <p className="text-[10px] text-[#e63946] font-mono px-3 pb-1">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-between px-3 py-2 border-t border-[#00b4d8]/20 text-[#00b4d8] text-[11px] font-mono hover:bg-[#00b4d8]/10 transition-colors disabled:opacity-50"
              >
                <span>{loading ? 'Verifying...' : 'Login'}</span>
                {loading ? (
                  <span className="animate-spin text-[10px]">⟳</span>
                ) : (
                  <span>›</span>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Hint text */}
        <p className="text-[9px] text-[#444] font-mono mt-2">
          {step === 'email' ? 'Masukkan email untuk melanjutkan.' : 'Sesi terenkripsi. Parrot OS Auth.'}
        </p>
      </div>
    </div>
  );
}
