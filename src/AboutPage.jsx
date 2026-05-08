import React, { useState, useEffect, useRef, useMemo } from 'react';
import { animate, createTimeline, stagger } from 'animejs';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';
import { FaReact, FaNodeJs, FaHtml5, FaCss3Alt, FaJsSquare, FaDatabase, FaGithub, FaLaravel, FaShieldAlt } from 'react-icons/fa';
import { SiGooglecloud, SiArduino, SiTypescript, SiMongodb, SiFirebase, SiMysql, SiPostgresql, SiExpress, SiElectron, SiVite, SiWebrtc } from 'react-icons/si';

import DitherEffect from './components/DitherEffect';

gsap.registerPlugin(TextPlugin);
// ─── Anime.js Clone Animation Component ───────────────────────────────────────
function CloneTickerText() {
  const text = "// TARGET ACQUIRED // INITIATING HANDSHAKE... // CONNECTION SECURE // DECRYPTING PROJECTS... // PORTFOLIO DATA STREAM ACTIVE ";
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const repetition = 3;
    const fullText = (text + " ").repeat(repetition);

    // Create clones for each character
    const chars = fullText.split('').map((char, i) => {
      const span = document.createElement('span');
      span.innerText = char === ' ' ? '\u00A0' : char;
      span.className = 'char';
      span.style.position = 'relative';
      span.style.display = 'inline-block';

      const clone = document.createElement('span');
      clone.innerText = span.innerText;
      clone.className = 'clone';
      clone.style.position = 'absolute';
      clone.style.top = '0';
      clone.style.left = '0';
      clone.style.opacity = '0';
      clone.style.color = '#ff00ff';
      clone.style.pointerEvents = 'none';

      span.appendChild(clone);
      return span;
    });

    containerRef.current.innerHTML = '';
    chars.forEach(c => containerRef.current.appendChild(c));

    const clones = containerRef.current.querySelectorAll('.clone');

    // Anime.js timeline for infinite clones
    const tl = createTimeline({
      loop: true,
    });

    tl.add({
      targets: clones,
      translateY: [0, -12, 0],
      translateX: [0, 4, 0],
      opacity: [0, 0.8, 0],
      duration: 2500,
      ease: 'inOutQuad',
      delay: stagger(40),
    });

    // Horizontal Scrolling
    const scrollAnim = animate(containerRef.current, {
      translateX: [0, -containerRef.current.offsetWidth / repetition],
      duration: 15000,
      ease: 'linear',
      loop: true
    });

    return () => {
      tl.pause();
      scrollAnim.pause();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        whiteSpace: 'nowrap',
        fontFamily: "'VT323',monospace",
        color: 'rgba(0,255,255,0.4)',
        fontSize: '20px',
        letterSpacing: '0.3em',
        width: 'max-content'
      }}
    />
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function AvatarModel() {
  const { scene, animations } = useGLTF('/models/kholis.glb');
  const safeAnims = useMemo(() => (Array.isArray(animations) ? animations : []), [animations]);
  const { actions } = useAnimations(safeAnims, scene);

  useEffect(() => {
    if (safeAnims.length > 0 && actions) {
      const firstActionName = Object.keys(actions)[0];
      if (firstActionName) {
        const action = actions[firstActionName];
        action.reset().fadeIn(0.5).play();
        action.setLoop(THREE.LoopRepeat, Infinity);
      }
    }
  }, [actions, safeAnims]);

  return (
    <group position={[0, -0.5, 0]} rotation={[0, -Math.PI / 2, 0]} scale={2.6}>
      <pointLight position={[-2, 4, 3]} intensity={4} color="#00f3ff" distance={10} />
      <pointLight position={[2, 2, 3]} intensity={3} color="#7000ff" distance={10} />
      <pointLight position={[0, 8, 2]} intensity={1.5} color="#ffffff" distance={15} />
      <primitive object={scene} />
    </group>
  );
}

// ─── Binary Rain with 0 and 1 ────────────────────────────────────────────────
function MatrixBg() {
  const count = 300;
  const ref0 = useRef();
  const ref1 = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const makeTex = (char) => {
    const c = document.createElement('canvas');
    c.width = 64; c.height = 64;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#00f3ff';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(char, 32, 32);
    return new THREE.CanvasTexture(c);
  };

  const tex0 = useMemo(() => makeTex('0'), []);
  const tex1 = useMemo(() => makeTex('1'), []);

  const [posA, spdA, posB, spdB] = useMemo(() => {
    const half = Math.floor(count / 2);
    const pA = new Float32Array(half * 3);
    const sA = new Float32Array(half);
    const pB = new Float32Array(half * 3);
    const sB = new Float32Array(half);
    for (let i = 0; i < half; i++) {
      const distribute = () => {
        const angle = Math.random() * Math.PI * 2;
        const isFront = Math.sin(angle) >= -0.2;
        const radius = isFront ? (3 + Math.random() * 15) : (3 + Math.random() * 7);
        return {
          x: Math.cos(angle) * radius,
          y: (Math.random() - 0.5) * 22,
          z: Math.sin(angle) * radius - 1
        };
      };
      const a = distribute();
      pA[i * 3] = a.x; pA[i * 3 + 1] = a.y; pA[i * 3 + 2] = a.z; sA[i] = Math.random() * 1.5 + 0.5;
      const b = distribute();
      pB[i * 3] = b.x; pB[i * 3 + 1] = b.y; pB[i * 3 + 2] = b.z; sB[i] = Math.random() * 1.5 + 0.5;
    }
    return [pA, sA, pB, sB];
  }, [count]);

  const animate = (pos, spd, ref, delta) => {
    if (!ref.current) return;
    const half = Math.floor(count / 2);
    for (let i = 0; i < half; i++) {
      pos[i * 3 + 1] -= delta * spd[i] * 3;
      if (pos[i * 3 + 1] < -11) {
        pos[i * 3 + 1] = 11;
        const angle = Math.random() * Math.PI * 2;
        const radius = (Math.sin(angle) >= -0.2) ? (3 + Math.random() * 15) : (3 + Math.random() * 7);
        pos[i * 3] = Math.cos(angle) * radius;
        pos[i * 3 + 2] = Math.sin(angle) * radius - 1;
      }
      dummy.position.set(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  };

  useFrame((_, delta) => {
    animate(posA, spdA, ref0, delta);
    animate(posB, spdB, ref1, delta);
  });

  const half = Math.floor(count / 2);
  const mat0 = useMemo(() => new THREE.MeshBasicMaterial({ map: tex0, transparent: true, opacity: 0.3, depthWrite: false }), [tex0]);
  const mat1 = useMemo(() => new THREE.MeshBasicMaterial({ map: tex1, transparent: true, opacity: 0.3, depthWrite: false }), [tex1]);

  // Requirement 9: GSAP opacity flicker for binary background
  useEffect(() => {
    gsap.to([mat0, mat1], {
      opacity: () => 0.1 + Math.random() * 0.4,
      yoyo: true,
      repeat: -1,
      duration: () => 1 + Math.random() * 2,
      ease: "power1.inOut"
    });
    return () => gsap.killTweensOf([mat0, mat1]);
  }, [mat0, mat1]);

  return (
    <>
      <instancedMesh ref={ref0} args={[new THREE.PlaneGeometry(0.4, 0.4), mat0, half]} />
      <instancedMesh ref={ref1} args={[new THREE.PlaneGeometry(0.4, 0.4), mat1, half]} />
    </>
  );
}

// ─── Penrose Triangle Animation ─────────────────────────────────────────────
function PenroseTriangle() {
  const bgRef = useRef(null);

  useEffect(() => {
    // Smooth opacity pulse for the bg glow
    if (bgRef.current) {
      gsap.to(bgRef.current, { opacity: 0.25, yoyo: true, duration: 3.5, repeat: -1, ease: 'sine.inOut' });
    }
    return () => {
      if (bgRef.current) gsap.killTweensOf(bgRef.current);
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes penrose-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .penrose-spinner-group {
          transform-box: fill-box;
          transform-origin: center;
          animation: penrose-spin 3s linear infinite;
        }
      `}</style>
      <svg width="502" height="480" viewBox="0 0 502 480" preserveAspectRatio="xMinYMin meet" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" style={{ display: 'block', maxWidth: '100%', margin: 'auto', height: '100%' }}>
      <defs>
        <linearGradient gradientUnits="userSpaceOnUse" x1="-819.2" x2="819.2" spreadMethod="pad" gradientTransform="matrix(0.257568359375 0 0 0.225189208984375 251 224.45)" id="penrose-grad-0">
          <stop offset="0.29411764705882354" stopColor="#00ffff"/>
          <stop offset="0.7490196078431373" stopColor="#00ff88"/>
        </linearGradient>
        <linearGradient gradientUnits="userSpaceOnUse" x1="-819.2" x2="819.2" spreadMethod="pad" gradientTransform="matrix(0.2105712890625 0 0 0.203826904296875 212.5 206.95)" id="penrose-grad-1">
          <stop offset="0" stopColor="#00ffff"/>
          <stop offset="1" stopColor="#00b4d8"/>
        </linearGradient>
        <linearGradient gradientUnits="userSpaceOnUse" x1="-819.2" x2="819.2" spreadMethod="pad" gradientTransform="matrix(-0.0947723388671875 -0.1638336181640625 0.17742919921875 -0.102630615234375 212.1 341.8)" id="penrose-grad-2">
          <stop offset="0" stopColor="#0a0f1e"/>
          <stop offset="1" stopColor="#050a14"/>
        </linearGradient>
        <linearGradient gradientUnits="userSpaceOnUse" x1="-819.2" x2="819.2" spreadMethod="pad" gradientTransform="matrix(0.220855712890625 0 0 0.22412109375 281.05 225.35)" id="penrose-grad-3">
          <stop offset="0" stopColor="#00ff88"/>
          <stop offset="1" stopColor="#00cc6a"/>
        </linearGradient>
        <linearGradient gradientUnits="userSpaceOnUse" x1="-819.2" x2="819.2" spreadMethod="pad" gradientTransform="matrix(0.069305419921875 0.1433563232421875 -0.05828857421875 0.0281829833984375 352.9 225.2)" id="penrose-grad-4">
          <stop offset="0" stopColor="#00ffff"/>
          <stop offset="1" stopColor="#7000ff"/>
        </linearGradient>
        <linearGradient gradientUnits="userSpaceOnUse" x1="-819.2" x2="819.2" spreadMethod="pad" gradientTransform="matrix(0.156219482421875 0.008209228515625 -0.0032806396484375 0.0624542236328125 245.3 388.45)" id="penrose-grad-5">
          <stop offset="0" stopColor="#00ff88"/>
          <stop offset="1" stopColor="#00ffff"/>
        </linearGradient>
        <linearGradient gradientUnits="userSpaceOnUse" x1="-819.2" x2="819.2" spreadMethod="pad" gradientTransform="matrix(0.0882568359375 -0.1304473876953125 0.0532379150390625 0.0360107421875 158.45 210.45)" id="penrose-grad-6">
          <stop offset="0" stopColor="#00ffff"/>
          <stop offset="1" stopColor="#00b4d8"/>
        </linearGradient>
        <linearGradient gradientUnits="userSpaceOnUse" x1="-819.2" x2="819.2" spreadMethod="pad" gradientTransform="matrix(0.0047760009765625 -0.0177764892578125 0.0206298828125 0.0055084228515625 359.5 353.8)" id="penrose-grad-7">
          <stop offset="0" stopColor="#00ffff" stopOpacity="0"/>
          <stop offset="1" stopColor="#00ff88" stopOpacity="0.5"/>
        </linearGradient>
        <linearGradient gradientUnits="userSpaceOnUse" x1="-819.2" x2="819.2" spreadMethod="pad" gradientTransform="matrix(-0.0160675048828125 0.0042572021484375 -0.0052337646484375 -0.019744873046875 259.35 127.75)" id="penrose-grad-8">
          <stop offset="0" stopColor="#7000ff" stopOpacity="0"/>
          <stop offset="1" stopColor="#0a0f1e" stopOpacity="0.5"/>
        </linearGradient>
        <linearGradient gradientUnits="userSpaceOnUse" x1="-819.2" x2="819.2" spreadMethod="pad" gradientTransform="matrix(0.0113525390625 0.011383056640625 -0.0138397216796875 0.0137786865234375 124.2 329.35)" id="penrose-grad-9">
          <stop offset="0" stopColor="#00ff88" stopOpacity="0"/>
          <stop offset="1" stopColor="#050a14" stopOpacity="0.25"/>
        </linearGradient>
        <filter id="penrose-glow">
          <feGaussianBlur stdDeviation="20" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="1.5" />
          </feComponentTransfer>
          <feBlend in2="SourceGraphic" />
        </filter>
      </defs>
      <g>
        <path ref={bgRef} fill="url(#penrose-grad-0)" filter="url(#penrose-glow)" d="M232 40 L270 40 462 373.95 445 408.95 57 408.95 40 373.95 232 40 M137.15 338.95 L364.9 338.95 251 140.9 137.15 338.95"/>
        <path fill="url(#penrose-grad-1)" d="M364.9 338.95 L385 373.95 40 373.95 232 40 270 40 271 41.75 100.15 338.95 137.15 338.95 364.9 338.95"/>
        <path fill="url(#penrose-grad-2)" d="M364.9 338.95 L251 140.9 269.5 108.75 445 408.95 57 408.95 40 373.95 385 373.95 364.9 338.95"/>
        <path fill="url(#penrose-grad-3)" d="M137.15 338.95 L100.15 338.95 271 41.75 462 373.95 445 408.95 269.5 108.75 251 140.9 137.15 338.95"/>
        <g className="penrose-spinner-group">
          <path fill="url(#penrose-grad-4)" d="M370.6 343.75 L374.2 337.35 Q388.85 309 388.85 274.55 388.85 236.55 370.85 205.95 361.9 190.75 348.55 177.4 313.55 142.3 265.8 137.8 L269.95 134.4 281 125.5 268.65 110.15 263.85 109.7 262.55 109.6 Q323.9 113.2 368.35 157.65 384.4 173.7 395.15 191.95 416.75 228.75 416.75 274.5 416.75 320.7 394.8 357.7 L375.6 362.75 370.65 343.9 370.6 343.75 M251.45 137 L255.75 137.15 251.35 137.1 251.45 137"/>
          <path fill="url(#penrose-grad-5)" d="M370.65 343.9 L366.95 349.8 362.7 355.8 365.7 375.2 385 372.3 376.75 382.45 375.75 383.6 368.35 391.4 Q319.95 439.85 251.45 439.85 L251.3 439.85 Q182.9 439.8 134.6 391.4 118.75 375.6 108.1 357.6 L108.2 357.35 113.2 338.55 132 343.6 132.1 343.8 Q140.95 358.7 154.1 371.85 194.35 412.1 251.3 412.1 L251.35 412.1 Q308.35 412.1 348.55 371.85 361.75 358.7 370.6 343.75 L370.65 343.9"/>
          <path fill="url(#penrose-grad-6)" d="M108.1 357.6 Q86.15 320.65 86.15 274.5 86.15 228.75 107.8 192 118.5 173.7 134.6 157.65 182.9 109.3 251.35 109.25 L265.3 123.2 255.25 133.25 251.45 137 251.35 137.1 Q194.35 137.1 154.1 177.4 140.75 190.75 131.85 205.9 113.8 236.5 113.8 274.55 113.8 304.95 125.25 330.65 L107.25 323.75 100.15 342.15 Q103.7 349.9 108.2 357.35 L108.1 357.6"/>
        </g>
        <path fill="url(#penrose-grad-7)" d="M364.9 338.95 L385 373.95 295.5 373.95 295.5 338.95 364.9 338.95"/>
        <path fill="url(#penrose-grad-8)" d="M251 140.9 L269.5 108.75 335.15 221.05 307.5 239.15 251 140.95 251 140.9"/>
        <path fill="url(#penrose-grad-9)" d="M100.15 338.95 L141 267.9 168.2 284.95 137.15 338.95 100.15 338.95"/>
        <path fill="url(#penrose-grad-2)" d="M40 373.95 L251 373.95 251 408.95 57 408.95 40 373.95"/>
        <path fill="url(#penrose-grad-3)" d="M163.1 229.45 L270 43.55 269.5 108.75 190.9 245.45 163.1 229.45"/>
        <path fill="url(#penrose-grad-1)" d="M163.1 229.45 L133.05 212.1 232 40 270 40 271 41.75 270 43.55 163.1 229.45 M40 373.95 L60.15 338.95 251 338.95 251 373.95 40 373.95"/>
        <path fill="url(#penrose-grad-3)" d="M342.5 235.15 L343.1 234.65 343.9 236 344.7 237.35 344.8 237.45 343.1 234.6 370.25 214.35 462 373.95 445 408.95 443.5 408.1 342.5 235.15"/>
        <path fill="url(#penrose-grad-2)" d="M343.1 234.65 L343.9 236 344.7 237.35 344.8 237.45 445 408.95 385 373.95 316.35 254.55 343.1 234.65"/>
      </g>
    </svg>
    </>
  );
}

// ─── Ghost Cybermask ─────────────────────────────────────────────────────────
function Cybermask() {
  const { scene } = useGLTF('/models/scene.gltf');
  const ref = useRef();

  useEffect(() => {
    scene.traverse(child => {
      if (child.isMesh && child.material) {
        const m = child.material.clone();
        m.metalness = 1; m.roughness = 0.2; m.envMapIntensity = 2;
        m.emissive = new THREE.Color('#00f3ff');
        m.emissiveIntensity = 0.4;
        m.transparent = true; m.opacity = 0.4;
        child.material = m;
      }
    });
  }, [scene]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.elapsedTime * 0.18;
    const pulse = Math.abs(Math.sin(clock.elapsedTime * 1.2)) * 0.5 + 0.2;
    scene.traverse(c => { if (c.isMesh && c.material) c.material.emissiveIntensity = pulse; });
  });

  return (
    <group ref={ref} position={[0, 0.5, -3]} scale={1.6}>
      <primitive object={scene} />
    </group>
  );
}

function ParallaxGroup({ children }) {
  const groupRef = useRef();
  useFrame((state) => {
    if (!groupRef.current) return;
    const targetX = (state.pointer.x * 0.15);
    const targetY = (state.pointer.y * -0.15);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetX, 0.05);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetY, 0.05);
  });
  return <group ref={groupRef}>{children}</group>;
}

const PROFILE = [
  { label: 'NAME', value: 'Kholis' },
  { label: 'ROLE', value: 'Senior Fullstack Dev & Creative Technologist' },
  { label: 'STACK', value: 'React · Three.js · Express · PostgreSQL · MySQL · Node.js · Codeigniter4 · Laravel' },
  { label: 'FIELD', value: 'Red TEAM(CTF) · Penetration Tester  · Full Stack Developer WEB' },
  { label: 'STATUS', value: 'ONLINE', green: true },
];

const TECH_ICONS = [
  { icon: <FaReact color="#61dafb" />, rx: -80, ry: -100, rr: -35 },
  { icon: <FaShieldAlt color="#ff0000" />, rx: 60, ry: -110, rr: 25 },
  { icon: <SiExpress color="#fff" />, rx: 100, ry: -40, rr: 55 },
  { icon: <SiPostgresql color="#336791" />, rx: -110, ry: 10, rr: -45 },
  { icon: <FaShieldAlt color="#00ffff" />, rx: 0, ry: 0, rr: 180 }, // Center explodes out
  { icon: <SiMysql color="#00758F" />, rx: -60, ry: 90, rr: -15 },
  { icon: <FaNodeJs color="#68a063" />, rx: 80, ry: 90, rr: 30 },
  { icon: <p style={{ fontWeight: 'bold', color: '#dd4814', margin: 0, fontSize: '18px' }}>CI4</p>, rx: 120, ry: -80, rr: -20 },
  { icon: <FaLaravel color="#ff2d20" />, rx: -120, ry: 80, rr: 60 },
];

const API = '';

export default function AboutPage() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showCard, setShowCard] = useState(false);
  const [cardPos, setCardPos] = useState({ x: 0, y: 0 });
  const [geoData, setGeoData] = useState(null);
  const [loadingGeo, setLoadingGeo] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // null | 'tech' | 'achieve' | 'project'
  const [selectedProject, setSelectedProject] = useState(null);
  const [techHovered, setTechHovered] = useState(false);
  const [showAllCerts, setShowAllCerts] = useState(false);
  const [viewAllProjects, setViewAllProjects] = useState(false);
  const [dbProjects, setDbProjects] = useState([]);
  const [dbCerts, setDbCerts] = useState([]);
  const [dbExperiences, setDbExperiences] = useState([]);
  const [contactForm, setContactForm] = useState({ email: '', content: '' });
  const [contactStatus, setContactStatus] = useState('');
  const [selectedCert, setSelectedCert] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const nameRef = useRef(null);

  const handleNameMouseMove = (e) => {
    const chars = nameRef.current?.querySelectorAll('.char-blur');
    if (!chars) return;
    const REVEAL_RADIUS = 120;
    const FULL_RADIUS = 40;

    chars.forEach((s) => {
      const rect = s.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy);

      if (dist < FULL_RADIUS) {
        s.style.filter = 'blur(0px)';
        s.style.opacity = '1';
        s.style.textShadow = '0 0 25px rgba(0,255,255,0.9), 0 0 50px rgba(0,255,255,0.4)';
      } else if (dist < REVEAL_RADIUS) {
        const t = 1 - (dist - FULL_RADIUS) / (REVEAL_RADIUS - FULL_RADIUS);
        s.style.filter = `blur(${((1 - t) * 14).toFixed(1)}px)`;
        s.style.opacity = (0.15 + t * 0.85).toFixed(2);
        s.style.textShadow = `0 0 ${Math.round(t * 25)}px rgba(0,255,255,${(t * 0.9).toFixed(2)})`;
      } else {
        s.style.filter = 'blur(14px)';
        s.style.opacity = '0.15';
        s.style.textShadow = 'none';
      }
    });
  };

  const handleNameMouseLeave = () => {
    const chars = nameRef.current?.querySelectorAll('.char-blur');
    chars?.forEach(s => {
      s.style.filter = 'blur(14px)';
      s.style.opacity = '0.15';
      s.style.textShadow = 'none';
    });
  };

  const scanlineRef = useRef(null);
  const identityRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    // Fetch dynamic data from API
    fetch(`${API}/api/projects`).then(r => r.json()).then(setDbProjects).catch(() => { });
    fetch(`${API}/api/certifications`).then(r => r.json()).then(data => {
      setDbCerts(data);
      if (data && data.length > 0) setSelectedCert(data[0]);
    }).catch(() => { });
    fetch(`${API}/api/experiences`).then(r => r.json()).then(setDbExperiences).catch(() => { });

    const r = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', r);

    // Requirement 10: Scan line effect
    if (scanlineRef.current) {
      gsap.fromTo(scanlineRef.current,
        { top: "0%" },
        { top: "100%", duration: 3, ease: "none", repeat: -1 }
      );
    }

    // Requirement 8: Identity text typewriter
    if (identityRef.current) {
      gsap.to(identityRef.current, {
        text: "IDENTITY: Kholis Kamaluddin Wahib | CLICK ANYWHERE TO TRACE",
        duration: 2,
        delay: 1.5,
        ease: "none"
      });
    }

    // Backsound Autoplay
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0.4;
      audio.loop = true;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsAudioPlaying(true))
          .catch(() => {
            // Autoplay blocked by browser policy — user interaction needed
            setIsAudioPlaying(false);
          });
      }
    }

    return () => {
      window.removeEventListener('resize', r);
      gsap.killTweensOf(scanlineRef.current);
      gsap.killTweensOf(identityRef.current);
      if (audio) audio.pause();
    };
  }, []);

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0, x: 80 },
    show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut", delay: 0.3 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const staggerItem = {
    hidden: { opacity: 0, x: -30 },
    show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } }
  };

  const handleCanvasClick = async (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCardPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setShowCard(true);

    if (!geoData) {
      setLoadingGeo(true);
      try {
        const { data } = await axios.post('/api/breach');
        if (data?.success) setGeoData(data.data);
      } catch {
        setGeoData({ ip: 'Unknown', city: 'Unknown', country: 'Unknown' });
      } finally { setLoadingGeo(false); }
    }
  };

  if (viewAllProjects) {
    return (
      <div style={{ height: '100vh', overflowY: 'auto', overflowX: 'hidden', background: '#11151c', padding: '40px 10%' }} className="hide-scrollbar">
        {/* Full Page Background TV Noise Textures */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1, backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,255,255,0.025) 0px, rgba(0,255,255,0.025) 1px, transparent 1px, transparent 4px)' }} />
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 2, backgroundImage: 'url(/images/noise.jpg)', opacity: 0.05, mixBlendMode: 'overlay' }} />

        <div style={{ position: 'relative', zIndex: 10, maxWidth: '1200px', margin: '0 auto' }}>
          {/* Top Home Button */}
          <button onClick={() => setViewAllProjects(false)} style={{ background: 'transparent', color: '#00ffff', border: '1px solid #00ffff', borderRadius: '30px', padding: '10px 20px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '30px', transition: 'all 0.3s', fontFamily: "'Orbitron', sans-serif" }} onMouseOver={(e) => { e.currentTarget.style.background = '#00ffff'; e.currentTarget.style.color = '#000' }} onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#00ffff' }}>
            &larr; HOME
          </button>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h1 style={{ color: '#fff', fontSize: '48px', marginBottom: '15px', fontFamily: "'Orbitron', sans-serif" }}>My Projects</h1>
            <p style={{ color: '#aaa', fontSize: '18px', margin: '5px 0' }}>A comprehensive showcase of my work across different technologies and domains.</p>
            <p style={{ color: '#aaa', fontSize: '18px', margin: '5px 0' }}>Each project represents a unique challenge and learning opportunity.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px', marginBottom: '60px' }}>
            {dbProjects.length === 0 ? (
              <div style={{ color: '#555', fontFamily: "'VT323',monospace", fontSize: '18px', padding: '40px 0' }}>[ NO_PROJECTS_FOUND // tambahkan via Admin Panel ]</div>
            ) : dbProjects.map((pj, i) => (
              <div key={i} style={{ background: '#11151c', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'all 0.3s', boxShadow: 'inset 0 0 15px rgba(0,255,255,0.02)' }} onMouseOver={(e) => { e.currentTarget.style.borderColor = 'rgba(0,255,255,0.3)'; e.currentTarget.style.transform = 'translateY(-3px)'; }} onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'none'; }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #00cc66, transparent)' }} />
                <div style={{ height: '220px', background: '#000', width: '100%', overflow: 'hidden' }}>
                  <img src={pj.image_url || '/images/profile2.png'} alt={pj.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderBottom: '1px solid rgba(255,255,255,0.05)' }} />
                </div>
                <div style={{ padding: '25px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h2 style={{ color: '#fff', fontSize: '22px', marginBottom: '10px', fontFamily: "'Orbitron', sans-serif" }}>{pj.title}</h2>
                  <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.6, marginBottom: '20px', flex: 1 }}>{pj.description}</p>
                  {pj.tech_stack && <p style={{ color: '#00ffff', fontSize: '12px', fontFamily: "'VT323',monospace", marginBottom: '20px', letterSpacing: '0.05em' }}>[ {pj.tech_stack} ]</p>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <button
                      onClick={() => { setSelectedProject(pj); setViewAllProjects(false); setActiveModal('project'); }}
                      style={{ background: 'transparent', color: '#00cc66', border: '1px solid #00cc66', padding: '8px 25px', borderRadius: '30px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', fontFamily: "'Orbitron', sans-serif", transition: 'all 0.3s' }}
                      onMouseOver={(e) => { e.currentTarget.style.background = '#00cc66'; e.currentTarget.style.color = '#000'; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#00cc66'; }}
                    >
                      [ SEE_DETAIL ]
                    </button>
                    <span style={{ color: '#777', fontSize: '12px', fontFamily: "'VT323', monospace", letterSpacing: '0.1em' }}>{pj.label}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>



        </div>
      </div>
    );
  }

  return (
    // Requirement 7: AnimatePresence for page transitions
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20, transition: { duration: 0.4 } }}
        style={{
          width: '100vw', height: '100vh', background: '#0a0e0e',
          overflowY: 'auto', overflowX: 'hidden', position: 'relative', cursor: 'none'
        }}
      >
        {/* Full Page Background TV Noise Textures */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1, backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,255,255,0.025) 0px, rgba(0,255,255,0.025) 1px, transparent 1px, transparent 4px)' }} />
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 2, backgroundImage: 'url(/images/noise.jpg)', opacity: 0.05, mixBlendMode: 'overlay' }} />

        {/* === BACKSOUND AUDIO === */}
        <audio ref={audioRef} src="/audio/backsound10.mp3" loop preload="auto" />

        {/* === FLOATING MUSIC CONTROL BUTTON === */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 1.2, type: 'spring', stiffness: 200, damping: 18 }}
          style={{
            position: 'fixed', bottom: '28px', right: '28px', zIndex: 9999,
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            border: '1px solid rgba(0,255,255,0.35)',
            borderRadius: '50px',
            padding: '10px 18px 10px 14px',
            boxShadow: '0 0 20px rgba(0,255,255,0.2), inset 0 0 12px rgba(0,255,255,0.04)',
            cursor: 'pointer',
          }}
          onClick={() => {
            const audio = audioRef.current;
            if (!audio) return;
            if (!isAudioPlaying) {
              audio.play().then(() => setIsAudioPlaying(true)).catch(() => { });
              setIsMuted(false);
              audio.muted = false;
            } else {
              const nextMuted = !isMuted;
              audio.muted = nextMuted;
              setIsMuted(nextMuted);
            }
          }}
          data-hoverable="true"
        >
          {/* Equalizer bars animation */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '20px' }}>
            {[1, 0.5, 0.9, 0.4, 0.8].map((h, i) => (
              <motion.div
                key={i}
                animate={(!isMuted && isAudioPlaying) ? {
                  scaleY: [h, h * 0.3, h * 1.1, h * 0.5, h],
                } : { scaleY: 0.15 }}
                transition={{ repeat: Infinity, duration: 0.6 + i * 0.15, ease: 'easeInOut', delay: i * 0.1 }}
                style={{
                  width: '3px',
                  height: '100%',
                  background: (!isMuted && isAudioPlaying) ? '#00ffff' : 'rgba(0,255,255,0.25)',
                  borderRadius: '2px',
                  transformOrigin: 'bottom',
                  boxShadow: (!isMuted && isAudioPlaying) ? '0 0 6px #00ffff' : 'none',
                  transition: 'background 0.3s, box-shadow 0.3s',
                }}
              />
            ))}
          </div>

          {/* Label */}
          <span style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '10px',
            letterSpacing: '0.15em',
            color: (!isMuted && isAudioPlaying) ? '#00ffff' : 'rgba(0,255,255,0.35)',
            textShadow: (!isMuted && isAudioPlaying) ? '0 0 8px rgba(0,255,255,0.7)' : 'none',
            userSelect: 'none',
            transition: 'color 0.3s',
          }}>
            {!isAudioPlaying ? 'PLAY' : isMuted ? 'MUTED' : 'SOUND ON'}
          </span>

          {/* Icon */}
          <span style={{
            fontSize: '16px',
            filter: (!isMuted && isAudioPlaying) ? 'drop-shadow(0 0 6px #00ffff)' : 'none',
            transition: 'filter 0.3s',
          }}>
            {isMuted || !isAudioPlaying ? '🔇' : '🔊'}
          </span>
        </motion.div>

        {/* === SECTION 1: HERO === */}
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', width: '100vw', height: '100vh', position: 'relative' }}>

          {/* ── LEFT: Avatar Canvas ── */}
          <div style={{ flex: isMobile ? 'none' : 1, height: isMobile ? '55vh' : '100%', position: 'relative', borderRight: isMobile ? 'none' : '1px solid rgba(0,255,255,0.12)', cursor: 'none' }} onClick={handleCanvasClick} data-hoverable="true">
            {/* GSAP Scanline */}
            <div ref={scanlineRef} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(to bottom, transparent, rgba(0,255,255,0.8), transparent)', zIndex: 15, pointerEvents: 'none', mixBlendMode: 'overlay', boxShadow: '0 0 10px rgba(0,255,255,0.5)' }} />

            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%', background: 'linear-gradient(to top, rgba(0,255,255,0.08), transparent)', pointerEvents: 'none', zIndex: 5 }} />

            <Canvas gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.5 }} camera={{ position: [0, 1.5, 6], fov: 40 }} style={{ width: '100%', height: '100%' }}>
              <ambientLight intensity={0.08} />
              <React.Suspense fallback={null}>
                <Environment files="/textures/blue_lagoon_night_1k.hdr" />
                <ParallaxGroup>
                  <MatrixBg />
                  <Cybermask />
                  <AvatarModel />
                </ParallaxGroup>
              </React.Suspense>
              <OrbitControls enableZoom={false} enablePan={false} />
            </Canvas>

            <AnimatePresence>
              {showCard && (
                <motion.div initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 10 }} transition={{ type: 'spring', damping: 20, stiffness: 300 }} style={{ position: 'absolute', left: Math.min(cardPos.x, (isMobile ? window.innerWidth : window.innerWidth * 0.55) - 220), top: Math.max(cardPos.y - 130, 10), zIndex: 30, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(0,255,255,0.6)', boxShadow: '0 0 20px rgba(0,255,255,0.4), inset 0 0 15px rgba(0,255,255,0.05)', padding: '16px 20px', minWidth: '200px', pointerEvents: 'auto' }}>
                  <button onClick={(e) => { e.stopPropagation(); setShowCard(false); }} style={{ position: 'absolute', top: '6px', right: '10px', background: 'transparent', border: 'none', color: '#ff4444', fontFamily: "'Orbitron',sans-serif", fontSize: '12px', cursor: 'pointer' }}>✕</button>
                  <p style={{ fontFamily: "'Orbitron',sans-serif", color: '#00ffff', fontSize: '10px', letterSpacing: '0.25em', marginBottom: '10px', textShadow: '0 0 6px #00ffff' }}>Lokasi Anda</p>
                  <div style={{ height: '1px', background: 'linear-gradient(to right, #00ffff, transparent)', marginBottom: '10px' }} />
                  {loadingGeo ? <p style={{ fontFamily: "'VT323',monospace", color: '#00ffff', fontSize: '18px' }}>Tracing IP...</p> : geoData ? <><Row label="IP" value={geoData.ip} /><Row label="CITY" value={geoData.city} /><Row label="COUNTRY" value={geoData.country} /></> : null}
                </motion.div>
              )}
            </AnimatePresence>

            <div style={{ position: 'absolute', bottom: '12px', left: 0, right: 0, textAlign: 'center', zIndex: 10, pointerEvents: 'none' }}>
              <p ref={identityRef} style={{ fontFamily: "'VT323',monospace", color: 'rgba(0,255,255,0.55)', fontSize: '14px', letterSpacing: '0.2em' }}></p>
            </div>
          </div>

          {/* ── RIGHT: Profile Panel (HUD Animations) ── */}
          <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ flex: 'none', width: isMobile ? '100%' : 'clamp(320px, 42vw, 520px)', height: isMobile ? '45vh' : '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', padding: isMobile ? '20px' : '80px 44px 32px 44px', background: isMobile ? 'rgba(10,14,14,0.97)' : 'linear-gradient(to right, rgba(10,14,14,0.85) 0%, rgba(10,14,14,0.98) 100%)', position: 'relative' }}>

            <style dangerouslySetInnerHTML={{
              __html: `
            @keyframes statusBlink {
              0%, 49% { opacity: 1; }
              50%, 100% { opacity: 0; }
            }
          `}} />

            {/* Stagger Container Wraps EVERYTHING */}
            <motion.div variants={staggerContainer} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column' }}>

              <motion.div variants={badgeVariants} style={{ marginBottom: '6px' }}>
                <motion.span animate={{ opacity: [1, 0.4, 1, 0.6, 1] }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '10px', letterSpacing: '0.3em', color: '#9b59b6', background: 'rgba(155,89,182,0.1)', padding: '3px 10px', border: '1px solid rgba(155,89,182,0.4)', display: 'inline-block' }}>● CLEARANCE: GRANTED</motion.span>
              </motion.div>

              {/* KHOLIS with Glitch Effect & Per-letter Reveal Stagger */}
              <motion.h1
                ref={nameRef}
                onMouseMove={handleNameMouseMove}
                onMouseLeave={handleNameMouseLeave}
                animate={{ x: [0, -3, 3, 0], opacity: [1, 0.8, 1] }}
                transition={{ repeat: Infinity, repeatDelay: 4, duration: 0.15 }}
                style={{
                  fontFamily: "'Orbitron',sans-serif",
                  color: '#00ffff',
                  fontSize: 'clamp(28px, 4vw, 48px)',
                  fontWeight: 900,
                  lineHeight: 1,
                  marginBottom: '4px',
                  display: 'flex',
                }}
              >
                {"Mr.Key".split("").map((c, i) => (
                  <motion.span
                    key={i}
                    variants={staggerItem}
                    className="char-blur"
                    style={{
                      display: 'inline-block',
                      filter: 'blur(14px)',
                      opacity: 0.15,
                      transition: 'filter 0.12s ease-out, opacity 0.12s ease-out, text-shadow 0.12s ease-out',
                      willChange: 'filter, opacity',
                    }}
                  >
                    {c}
                  </motion.span>
                ))}
              </motion.h1>


              {/* Description Paragraph */}
              <motion.p variants={staggerItem} style={{ fontFamily: "'VT323',monospace", color: '#00ffff', fontSize: 'clamp(18px, 2vw, 22px)', lineHeight: 1.6, textShadow: '0 0 3px rgba(0,255,255,0.3)', marginBottom: '15px' }}>
                I'm also an active Red Team member and penetration tester in CTF. I believe strong security comes from mastering both offense and defense. When I'm not coding or hacking, I'm exploring new attack vectors or optimizing.</motion.p>

              <motion.div variants={staggerItem} style={{ height: '1px', background: 'rgba(0,255,255,0.1)', margin: '18px 0' }} />
              <motion.a
                href="/Cv/cv.pdf"
                download="Kholis_CV.pdf"
                variants={staggerItem}
                style={{
                  fontFamily: "'Orbitron',sans-serif",
                  color: '#00ffff',
                  fontSize: '14px',
                  letterSpacing: '0.15em',
                  border: '1px solid #00ffff',
                  padding: '10px 25px',
                  borderRadius: '30px',
                  textDecoration: 'none',
                  display: 'inline-block',
                  textAlign: 'center',
                  background: 'rgba(0,255,255,0.05)',
                  boxShadow: '0 0 10px rgba(0,255,255,0.2)',
                  transition: 'all 0.3s',
                  alignSelf: 'flex-start'
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = '#00ffff'; e.currentTarget.style.color = '#000'; e.currentTarget.style.boxShadow = '0 0 20px rgba(0,255,255,0.6)'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(0,255,255,0.05)'; e.currentTarget.style.color = '#00ffff'; e.currentTarget.style.boxShadow = '0 0 10px rgba(0,255,255,0.2)'; }}
              >
                [ DOWNLOAD_CV ]
              </motion.a>

              {/* Scroll Indicator */}
              <motion.div variants={staggerItem} style={{ marginTop: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <motion.div animate={{ y: [0, 8, 0], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}>
                  <p style={{ fontFamily: "'Orbitron',sans-serif", color: '#00ffff', fontSize: '10px', letterSpacing: '0.3em', margin: 0, textShadow: '0 0 5px rgba(0,255,255,0.5)' }}>SCROLL TO EXPLORE</p>
                  <p style={{ color: '#00ffff', fontSize: '20px', margin: 0, textAlign: 'center', textShadow: '0 0 8px rgba(0,255,255,0.5)' }}>↓</p>
                </motion.div>
              </motion.div>

            </motion.div>
          </motion.div>
        </div> {/* Close HERO */}

        {/* === TRANSITION DIVIDER — anime.js Clone Text === */}
        <div style={{ width: '100vw', height: '70px', background: 'linear-gradient(180deg, rgba(0,255,255,0.05) 0%, transparent 100%)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', borderTop: '1px solid rgba(0,255,255,0.2)' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, #00ffff, transparent)', boxShadow: '0 0 15px #00ffff' }} />
          <CloneTickerText />
        </div>

        {/* === SECTION 5: MY EXPERIENCE === */}
        <motion.div initial={{ opacity: 0, y: 80 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8, ease: "easeOut" }} style={{ minHeight: '100vh', padding: '100px 10%' }}>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', justifyContent: 'space-between', gap: '40px' }}>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 'clamp(32px, 5vw, 64px)', color: '#00ffff' }}>My</h1>
              <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 'clamp(32px, 5vw, 64px)', color: '#00ffff', marginBottom: '20px' }}>Experience</h1>
              <p style={{ color: '#fff', fontSize: '20px', marginBottom: '50px' }}>Journey and Insights</p>
              <button onClick={() => setActiveModal('achieve')} style={{ background: '#fff', color: '#000', borderRadius: '30px', padding: '10px 40px', fontWeight: 'bold', cursor: 'pointer', border: 'none' }}>
                See all
              </button>
            </div>

            {/* Dither Effect Interactive Canvas */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', position: 'relative' }}>
              <DitherEffect />
            </div>
          </div>
        </motion.div>

        {/* === SECTION 2: PROJECT HIGHLIGHTS === */}
        <motion.div initial={{ opacity: 0, y: 80 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8, ease: "easeOut" }} style={{ minHeight: '100vh', padding: '100px 0 100px 10%' }}>
          <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 'clamp(32px, 5vw, 64px)', color: '#00ffff' }}>Project</h1>
          <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 'clamp(32px, 5vw, 64px)', color: '#00ffff', marginBottom: '10px', textShadow: '0 0 15px rgba(0,255,255,0.4)' }}>Highlights</h1>
          <p style={{ color: '#fff', fontSize: '20px', marginBottom: '50px', fontFamily: "'VT323',monospace", letterSpacing: '0.1em' }}>[ FROM_YEAR: 2023 // TO: 2026 ]</p>

          <style dangerouslySetInnerHTML={{
            __html: `
             .cyber-carousel {
               display: flex; flex-wrap: wrap; gap: 30px; padding-bottom: 40px; padding-right: 10%; justify-content: flex-start;
             }
             .cyber-card {
               flex: 0 1 calc(33.333% - 20px); min-width: 280px; max-width: 420px; background: rgba(17, 21, 28, 0.8);
               backdrop-filter: blur(5px); border-radius: 20px; border: 1px solid rgba(0,255,255,0.2); 
               padding: 25px; position: relative; overflow: hidden; transition: all 0.3s ease;
               box-shadow: inset 0 0 20px rgba(0,255,255,0.02);
             }
             .cyber-card:hover { border-color: rgba(0,255,255,0.6); box-shadow: 0 0 20px rgba(0,255,255,0.2), inset 0 0 20px rgba(0,255,255,0.05); transform: translateY(-5px); }
             @media(max-width: 1100px) { .cyber-card { flex: 0 1 calc(50% - 15px); max-width: 100%; } }
             @media(max-width: 768px) { .cyber-carousel { padding-right: 0; } .cyber-card { flex: 0 1 100%; max-width: 100%; } }
           `}} />

          <div className="cyber-carousel">
            {dbProjects.length === 0 ? (
              <div style={{ color: '#555', fontFamily: "'VT323',monospace", fontSize: '18px', padding: '40px 0' }}>[ NO_PROJECTS_FOUND // tambahkan via Admin Panel ]</div>
            ) : dbProjects.slice(0, 3).map((pj, i) => {
              // Rotate accent colors: cyan, purple, green
              const accentColors = ['#00ffff', '#9b59b6', '#00ff00'];
              const accent = accentColors[i % accentColors.length];
              return (
                <div key={pj.id || i} className="cyber-card">
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: `linear-gradient(90deg, ${accent}, transparent)` }} />
                  {/* Banner image or fallback title block */}
                  <div style={{ height: '180px', borderRadius: '15px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${accent}22`, overflow: 'hidden', background: pj.image_url ? '#000' : 'linear-gradient(45deg, #000, #1a222c)' }}>
                    {pj.image_url ? (
                      <img src={pj.image_url} alt={pj.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <p style={{ color: accent, fontSize: 'clamp(18px,2vw,28px)', fontFamily: "'Orbitron', sans-serif", fontWeight: 'bold', textShadow: `0 0 10px ${accent}88`, textAlign: 'center', padding: '0 10px' }}>{pj.title}</p>
                    )}
                  </div>
                  <h2 style={{ fontSize: '30px', color: '#fff', fontFamily: "'Orbitron', sans-serif" }}>{pj.title}</h2>
                  <p style={{ color: accent, fontSize: '14px', marginBottom: '20px', fontFamily: "'VT323',monospace", letterSpacing: '0.1em' }}>{"> ROLE:"} {pj.label || 'Developer'}</p>
                  <p style={{ color: '#eee', fontSize: '14px', marginBottom: '20px', lineHeight: 1.6 }}>{pj.description}</p>
                  {pj.tech_stack && (
                    <p style={{ color: accent, fontSize: '12px', fontFamily: "'VT323',monospace", marginBottom: '30px', letterSpacing: '0.08em', opacity: 0.8 }}>[ {pj.tech_stack} ]</p>
                  )}
                  <button
                    onClick={() => { setSelectedProject(pj); setActiveModal('project'); }}
                    style={{ background: 'transparent', color: accent, border: `1px solid ${accent}`, borderRadius: '30px', padding: '10px 30px', fontFamily: "'Orbitron',sans-serif", fontWeight: 'bold', cursor: 'pointer', float: 'right', transition: 'all 0.3s' }}
                    onMouseOver={(e) => { e.currentTarget.style.background = accent; e.currentTarget.style.color = '#000'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = accent; }}
                  >
                    [ SEE_DETAIL ]
                  </button>
                  <div style={{ clear: 'both' }}></div>
                </div>
              );
            })}
          </div>

          {/* View All Projects Button (Show only if more than 3) */}
          {dbProjects.length > 3 && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
              <button onClick={() => setViewAllProjects(true)} style={{ background: 'transparent', color: '#00ffff', border: '1px solid #00ffff', borderRadius: '30px', padding: '15px 40px', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px', fontFamily: "'Orbitron',sans-serif", transition: 'all 0.3s' }} onMouseOver={(e) => { e.currentTarget.style.background = '#00ffff'; e.currentTarget.style.color = '#000' }} onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#00ffff' }}>
                [ VIEW_ALL_PROJECTS ]
              </button>
            </div>
          )}
        </motion.div>

        {/* === SECTION 3: TECH KNOWLEDGE === */}
        <motion.div initial={{ opacity: 0, y: 80 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8, ease: "easeOut" }} style={{ minHeight: '100vh', padding: '100px 10%', display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', justifyContent: 'space-between', gap: '60px' }}>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>

            {/* Magic Scatter Grid */}
            <div
              onMouseEnter={() => setTechHovered(true)}
              onMouseLeave={() => setTechHovered(false)}
              style={{
                position: 'relative', width: '250px', height: '250px',
                display: 'flex', flexWrap: 'wrap', gap: '10px',
                justifyContent: 'center', alignContent: 'center', cursor: 'none'
              }}
            >
              {TECH_ICONS.map((t, idx) => (
                <motion.div
                  key={idx}
                  animate={{
                    x: techHovered ? t.rx : 0,
                    y: techHovered ? t.ry : 0,
                    rotate: techHovered ? t.rr : 0,
                    scale: techHovered ? 1.2 : 1
                  }}
                  transition={{ type: 'spring', damping: 12, stiffness: 150 }}
                  style={{
                    width: '74px', height: '74px', borderRadius: '15px',
                    background: 'rgba(20,25,35,0.9)', border: '1px solid rgba(0,255,255,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '35px', zIndex: techHovered ? 10 : 1, position: 'relative',
                    boxShadow: techHovered ? '0 0 15px rgba(0,255,255,0.3)' : 'inset 0 0 10px rgba(0,255,255,0.02)'
                  }}
                >
                  {t.icon}
                </motion.div>
              ))}

              {/* Cyberpunk Scanner overlay when hovering */}
              <AnimatePresence>
                {techHovered && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }}
                    style={{ position: 'absolute', inset: -50, border: '1px dashed rgba(0,255,255,0.2)', borderRadius: '50%', pointerEvents: 'none' }}
                  />
                )}
              </AnimatePresence>
            </div>

          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 'clamp(32px, 5vw, 64px)', color: '#00ffff', marginBottom: '40px' }}>Tech Knowledge</h1>
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ color: '#fff', fontSize: '20px', marginBottom: '5px' }}>Frontend</h3>
              <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.6 }}>React JS, React Native, Flutter, Three JS, React Three Fiber</p>
            </div>
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ color: '#fff', fontSize: '20px', marginBottom: '5px' }}>Backend</h3>
              <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.6 }}>Node JS, Firebase, MySQL, PostgreSQL</p>
            </div>
            <div style={{ marginBottom: '50px' }}>
              <h3 style={{ color: '#fff', fontSize: '20px', marginBottom: '5px' }}>Others</h3>
              <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.6 }}>Cybersecurity, Git, Github</p>
            </div>
            <button
              onClick={() => setActiveModal('tech')}
              style={{ background: '#fff', color: '#000', borderRadius: '30px', padding: '12px 40px', fontWeight: 'bold', cursor: 'pointer', border: 'none' }}>
              See all
            </button>
          </div>
        </motion.div>

        {/* === SECTION 4: CERTIFICATIONS === */}
        <motion.div initial={{ opacity: 0, y: 80 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8, ease: "easeOut" }} style={{ minHeight: '100vh', padding: '100px 10%' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 'clamp(32px, 5vw, 64px)', color: '#fff' }}>Certificates</h1>
          </div>

          {/* Featured Certificate Card */}
          <div id="featured-cert" style={{ background: '#1A1E26', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', padding: '30px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '40px', marginBottom: '50px' }}>
            <div
              style={{ flex: 1.5, background: '#000', borderRadius: '15px', overflow: 'hidden', cursor: 'pointer', position: 'relative' }}
              onClick={() => {
                const link = selectedCert?.pdf_url || selectedCert?.image_url || '/images/Sertifikat Codeigniter.pdf';
                window.open(link, '_blank');
              }}
              onMouseOver={(e) => { const overlay = e.currentTarget.querySelector('.cert-overlay'); if (overlay) overlay.style.opacity = 1; }}
              onMouseOut={(e) => { const overlay = e.currentTarget.querySelector('.cert-overlay'); if (overlay) overlay.style.opacity = 0; }}
            >
              <img src={selectedCert?.image_url || "/images/profile2.png"} style={{ width: '100%', height: '100%', objectFit: 'contain', transition: 'transform 0.3s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'} />

              {/* View Link Button Overlay */}
              <div className="cert-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.3s', pointerEvents: 'none' }}>
                <span style={{ background: 'rgba(0,0,0,0.8)', border: '1px solid #00ffff', color: '#00ffff', padding: '12px 25px', borderRadius: '30px', fontFamily: "'Orbitron', sans-serif", fontSize: '14px', backdropFilter: 'blur(5px)', boxShadow: '0 0 15px rgba(0,255,255,0.4)', pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  [ VIEW_CERTIFICATE ]
                </span>
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h2 style={{ color: '#fff', fontSize: '24px', marginBottom: '15px', fontFamily: "'Orbitron', sans-serif" }}>
                {selectedCert ? selectedCert.name : 'Certificate Full Stack Next JS'}
              </h2>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
                <span style={{ border: '1px solid #113322', color: '#00cc66', padding: '5px 15px', borderRadius: '30px', background: 'rgba(0,204,102,0.1)', fontSize: '13px' }}>
                  {selectedCert?.issued_date ? new Date(selectedCert.issued_date).getFullYear() : '2026'}
                </span>
                <span style={{ border: '1px solid #113344', color: '#0099ff', padding: '5px 15px', borderRadius: '30px', background: 'rgba(0,153,255,0.1)', fontSize: '13px' }}>
                  {selectedCert?.issuer || 'WPU Course'}
                </span>
              </div>
              <h3 style={{ color: '#fff', fontSize: '16px', marginBottom: '10px' }}>CERTIFICATE OF COMPLETION</h3>
              <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.6, marginBottom: '30px' }}>
                {selectedCert?.description || 'This certifies that for successfully demonstrating proficiency in'}
              </p>
              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 1, background: '#222', borderRadius: '15px', padding: '20px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.02)' }}>
                  <p style={{ color: '#00ffff', fontSize: '30px', fontWeight: 'bold', margin: '0 0 5px 0' }}>{dbCerts.length > 0 ? dbCerts.length : 8}</p>
                  <p style={{ color: '#777', fontSize: '13px', margin: 0 }}>Total Certificates</p>
                </div>
                <div style={{ flex: 1, background: '#222', borderRadius: '15px', padding: '20px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.02)' }}>
                  <p style={{ color: '#00ffff', fontSize: '30px', fontWeight: 'bold', margin: '0 0 5px 0' }}>5</p>
                  <p style={{ color: '#777', fontSize: '13px', margin: 0 }}>Years Active</p>
                </div>
              </div>
            </div>
          </div>

          {/* Grid of Certificates - dari API database */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px', marginBottom: '40px' }}>
            {dbCerts.length === 0 ? (
              <div style={{ color: '#555', fontFamily: "'VT323',monospace", fontSize: '18px', padding: '20px 0' }}>[ NO_CERTS_FOUND // tambahkan via Admin Panel ]</div>
            ) : dbCerts.slice(0, showAllCerts ? dbCerts.length : 3).map((cert, i) => (
              <div
                key={i}
                style={{ background: '#1A1E26', borderRadius: '15px', border: '1px solid', borderColor: selectedCert?.id === cert.id || selectedCert?.name === cert.name ? 'rgba(0,255,255,0.5)' : 'rgba(255,255,255,0.05)', boxShadow: selectedCert?.id === cert.id || selectedCert?.name === cert.name ? '0 0 15px rgba(0,255,255,0.1)' : 'none', overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'all 0.3s' }}
                onClick={() => { setSelectedCert(cert); document.getElementById('featured-cert')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = 'rgba(0,255,255,0.3)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = selectedCert?.id === cert.id || selectedCert?.name === cert.name ? 'rgba(0,255,255,0.5)' : 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'none' }}
              >
                <div style={{ height: '200px', background: '#fff' }}>
                  <img src={cert.image_url || '/images/profile2.png'} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h2 style={{ color: '#fff', fontSize: '18px', marginBottom: '10px', fontFamily: "'Orbitron', sans-serif" }}>{cert.name}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <span style={{ color: '#00cc66', fontSize: '12px' }}>📗 {cert.issuer}</span>
                    {cert.issued_date && <span style={{ color: '#555', fontSize: '11px' }}>{cert.issued_date}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button onClick={() => setShowAllCerts(!showAllCerts)} style={{ background: 'transparent', color: '#00ffff', border: '1px solid #00ffff', borderRadius: '30px', padding: '10px 30px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', fontFamily: "'Orbitron', sans-serif", transition: 'all 0.3s' }} onMouseOver={(e) => { e.currentTarget.style.background = '#00ffff'; e.currentTarget.style.color = '#000' }} onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#00ffff' }}>
              {showAllCerts ? '[ VIEW_LESS ]' : '[ VIEW_MORE ]'}
            </button>
          </div>
        </motion.div>

        {/* Removed Section 5, moved to above Project Highlights */}

        {/* === SECTION 6: CONTACT FORM === */}
        <motion.div initial={{ opacity: 0, y: 80 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8, ease: "easeOut" }} style={{ minHeight: '60vh', padding: '100px 10%' }}>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'center' : 'stretch', gap: '60px' }}>
            
            {/* Left Side: Form Container */}
            <div style={{ flex: 1, maxWidth: '600px', width: '100%' }}>
              <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 'clamp(32px, 5vw, 64px)', color: '#00ffff', marginBottom: '50px', whiteSpace: 'nowrap' }}>
                Let us Connect
              </h1>
              
              <input
                type="email"
                placeholder="example@anymail.com"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                style={{ width: '100%', background: 'transparent', border: '1px solid #555', borderRadius: '15px', padding: '15px 25px', color: '#fff', fontSize: '16px', marginBottom: '20px', fontFamily: "'Inter', sans-serif", outline: 'none' }}
                onFocus={(e) => e.target.style.borderColor = '#00ffff'}
                onBlur={(e) => e.target.style.borderColor = '#555'}
              />
              <textarea
                placeholder="Kindly type"
                value={contactForm.content}
                onChange={(e) => setContactForm({ ...contactForm, content: e.target.value })}
                style={{ width: '100%', minHeight: '200px', background: 'transparent', border: '1px solid #555', borderRadius: '15px', padding: '25px', color: '#fff', fontSize: '16px', marginBottom: '30px', fontFamily: "'Inter', sans-serif", outline: 'none', resize: 'vertical' }}
                onFocus={(e) => e.target.style.borderColor = '#00ffff'}
                onBlur={(e) => e.target.style.borderColor = '#555'}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                  <p style={{ color: '#aaa', fontSize: '14px', margin: 0, fontFamily: "'Inter', sans-serif" }}>The message will be sent to</p>
                  <p style={{ color: '#fff', fontSize: '14px', margin: 0, fontWeight: 'bold', fontFamily: "'Inter', sans-serif" }}>my personal email.</p>
                  {contactStatus && <p style={{ color: contactStatus.includes('sent') ? '#00ff88' : '#ff4444', fontSize: '13px', marginTop: '10px' }}>{contactStatus}</p>}
                </div>
              <button
                onClick={async () => {
                  if (!contactForm.email || !contactForm.content) return setContactStatus('Please fill all fields');
                  try {
                    await fetch(`${API}/api/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(contactForm) });
                    setContactStatus('Message sent successfully!');
                    setContactForm({ email: '', content: '' });
                    setTimeout(() => setContactStatus(''), 3000);
                  } catch (e) {
                    setContactStatus('Failed to send message');
                  }
                }}
                style={{ background: '#fff', color: '#000', borderRadius: '30px', padding: '12px 50px', fontWeight: 'bold', cursor: 'pointer', border: 'none', fontSize: '16px', transition: 'all 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
              Send Message ⟶
              </button>
            </div>
            </div> {/* Closing Left Side Form Container */}
            
            {/* Right Side: Triangle SVG (Hidden on Mobile) */}
            {!isMobile && (
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ width: '100%', maxWidth: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <PenroseTriangle />
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* === MODALS === */}
        <AnimatePresence>
          {activeModal === 'project' && selectedProject && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'center', padding: isMobile ? '10px' : '20px', cursor: 'auto', overflowY: 'auto' }}>

              <div style={{ width: '100%', maxWidth: '1000px', minHeight: isMobile ? 'auto' : '80vh', maxHeight: isMobile ? 'none' : '80vh', display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '16px', position: 'relative', marginTop: isMobile ? '40px' : '0' }}>

                {/* Left Panel */}
                <div style={{ flex: isMobile ? 'none' : 1.5, background: '#1E202C', borderRadius: '24px', padding: isMobile ? '20px' : '30px', display: 'flex', flexDirection: 'column', position: 'relative', overflowY: isMobile ? 'visible' : 'auto' }}>
                  {/* Hero Showcase Image — desktop only in left panel */}
                  {!isMobile && (
                    <div style={{ height: '35%', minHeight: '220px', background: selectedProject.image_url ? '#000' : 'linear-gradient(45deg, #111, #2b1d42)', borderRadius: '20px', marginBottom: '20px', position: 'relative', overflow: 'hidden' }}>
                      {selectedProject.image_url && (
                        <img src={selectedProject.image_url} alt={selectedProject.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                      {selectedProject.live_url && (
                        <div style={{ position: 'absolute', bottom: '15px', right: '15px' }}>
                          <button onClick={() => window.open(selectedProject.live_url, '_blank')} style={{ background: 'rgba(255,255,255,0.8)', color: '#000', border: 'none', borderRadius: '20px', padding: '8px 20px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>Visit Site &rarr;</button>
                        </div>
                      )}
                    </div>
                  )}

                  <h1 style={{ color: '#fff', fontSize: isMobile ? '22px' : '32px', marginBottom: '5px', fontFamily: "'Orbitron', sans-serif" }}>{selectedProject.title}</h1>
                  {selectedProject.label && (
                    <p style={{ color: '#ccc', marginBottom: '15px', fontSize: '13px', fontFamily: "'VT323', monospace", letterSpacing: '0.1em' }}>{selectedProject.label}</p>
                  )}

                  <div style={{ display: 'flex', marginBottom: '8px', fontSize: '13px' }}>
                    <p style={{ color: '#aaa', width: '160px', margin: 0 }}>My role</p>
                    <p style={{ color: '#fff', margin: 0 }}>: {selectedProject.label || 'Developer'}</p>
                  </div>
                  {selectedProject.tech_stack && (
                    <div style={{ display: 'flex', marginBottom: '25px', fontSize: '13px' }}>
                      <p style={{ color: '#aaa', width: '160px', margin: 0 }}>Tech Stack</p>
                      <p style={{ color: '#fff', margin: 0 }}>: {selectedProject.tech_stack}</p>
                    </div>
                  )}

                  <p style={{ color: '#bbb', fontSize: '13px', lineHeight: 1.6, marginBottom: 'auto' }}>
                    {selectedProject.description || 'No description available.'}
                  </p>

                  {selectedProject.tech_stack && (
                    <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <p style={{ color: '#777', fontSize: '11px', fontFamily: "'VT323', monospace", letterSpacing: '0.1em', margin: 0 }}>{selectedProject.tech_stack}</p>
                    </div>
                  )}
                </div>

                {/* Right Panel */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
                  {/* Close Button — fixed top-right corner on mobile */}
                  <button onClick={() => { setActiveModal(null); setSelectedProject(null); }} style={{ position: isMobile ? 'fixed' : 'absolute', top: isMobile ? '16px' : '-10px', right: isMobile ? '16px' : '-15px', background: 'rgba(30,30,40,0.95)', color: '#fff', borderRadius: '50%', width: '36px', height: '36px', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>✕</button>

                  {/* Card Thumbnail — mobile only, shown above banner slider */}
                  {isMobile && selectedProject.image_url && (
                    <div style={{ height: '200px', borderRadius: '20px', overflow: 'hidden', position: 'relative', background: '#000', flexShrink: 0 }}>
                      <img src={selectedProject.image_url} alt={selectedProject.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {selectedProject.live_url && (
                        <div style={{ position: 'absolute', bottom: '12px', right: '12px' }}>
                          <button onClick={() => window.open(selectedProject.live_url, '_blank')} style={{ background: 'rgba(255,255,255,0.9)', color: '#000', border: 'none', borderRadius: '20px', padding: '6px 16px', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer' }}>Visit Site →</button>
                        </div>
                      )}
                    </div>
                  )}

                  {(() => {
                    const banners = [selectedProject.image_url_2, selectedProject.image_url_3].filter(Boolean);
                    const hasBanners = banners.length > 0;
                    return (
                      <div style={{ height: isMobile ? '260px' : undefined, flex: isMobile ? 'none' : 1.2, background: hasBanners ? '#fff' : '#1E202C', borderRadius: '20px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'stretch' }}>
                        {hasBanners ? (
                          <>
                            <motion.div
                              animate={banners.length > 1 ? { x: ['0%', `-${100 / banners.length}%`, '0%'] } : {}}
                              transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut', times: [0, 0.5, 1] }}
                              style={{ display: 'flex', width: `${banners.length * 100}%`, height: '100%' }}
                            >
                              {banners.map((img, idx) => (
                                <div key={idx} style={{ width: `${100 / banners.length}%`, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', flexShrink: 0 }}>
                                  <img src={img} alt={`${selectedProject.title} banner ${idx + 1}`} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                </div>
                              ))}
                            </motion.div>
                            {/* Dot indicators */}
                            {banners.length > 1 && (
                              <div style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px' }}>
                                {banners.map((_, idx) => (
                                  <div key={idx} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(0,0,0,0.2)' }} />
                                ))}
                              </div>
                            )}
                            {/* Auto slide badge */}
                            {banners.length > 1 && (
                              <div style={{ position: 'absolute', top: '12px', right: '14px', background: 'rgba(0,0,0,0.55)', color: '#fff', borderRadius: '20px', padding: '4px 10px', fontSize: '9px', fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.08em' }}>AUTO SLIDE</div>
                            )}
                          </>
                        ) : (
                          <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <p style={{ color: '#555', fontSize: '40px', margin: 0 }}>📷</p>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  <div style={{ flex: 1, background: '#1E202C', borderRadius: '30px', padding: '20px', overflowY: 'auto' }}>
                    <p style={{ color: '#fff', textAlign: 'center', marginBottom: '15px', fontSize: '16px', fontFamily: "'VT323', monospace", letterSpacing: '0.1em' }}>Project Info :</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {selectedProject.github_url && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ color: '#aaa', fontSize: '12px', minWidth: '80px' }}>GitHub</span>
                          <a href={selectedProject.github_url} target="_blank" rel="noreferrer" style={{ color: '#00ffff', fontSize: '12px', fontFamily: "'VT323', monospace", wordBreak: 'break-all' }}>🔗 {selectedProject.github_url.replace('https://', '').slice(0, 30)}...</a>
                        </div>
                      )}
                      {selectedProject.live_url && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ color: '#aaa', fontSize: '12px', minWidth: '80px' }}>Live URL</span>
                          <a href={selectedProject.live_url} target="_blank" rel="noreferrer" style={{ color: '#00ffff', fontSize: '12px', fontFamily: "'VT323', monospace", wordBreak: 'break-all' }}>🌐 {selectedProject.live_url.replace('https://', '').slice(0, 30)}...</a>
                        </div>
                      )}
                      {selectedProject.tech_stack && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                          <span style={{ color: '#aaa', fontSize: '12px', minWidth: '80px' }}>Stack</span>
                          <span style={{ color: '#00ffff', fontSize: '12px', fontFamily: "'VT323', monospace" }}>{selectedProject.tech_stack}</span>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

              </div>
            </motion.div>
          )}

          {activeModal === 'tech' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', cursor: 'auto' }}>
              <div style={{ background: '#1A1E26', width: '100%', maxWidth: '650px', height: '75vh', borderRadius: '20px', padding: '40px', position: 'relative', overflowY: 'auto' }}>
                <button onClick={() => setActiveModal(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '50%', width: '35px', height: '35px', border: 'none', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>

                <div style={{ background: '#222733', padding: '10px 20px', borderRadius: '10px', marginBottom: '30px', display: 'flex', alignItems: 'center' }}>
                  <span style={{ color: '#888', marginRight: '10px' }}>🔍</span>
                  <input type="text" placeholder="Search skills" style={{ width: '100%', background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontFamily: "'Orbitron', sans-serif" }} />
                </div>

                <div style={{ display: 'flex', gap: '30px', borderBottom: '1px solid #333', marginBottom: '40px', paddingBottom: '10px' }}>
                  <span style={{ color: '#fff', borderBottom: '2px solid #fff', paddingBottom: '11px', cursor: 'pointer', fontWeight: 'bold' }}>Studied</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                  {TECH_ICONS.map((tech, idx) => {
                    const skillName = tech.icon.props && tech.icon.props.children === 'RED TEAM(CTF)' ? 'Red Team(CTF)' :
                      tech.icon.props && tech.icon.props.children === 'CI4' ? 'Codeigniter4' :
                        ['React', 'Penetration Tester', 'Express', 'PostgreSQL', 'Blue Team(CTF)', 'MySQL', 'Node.js', 'Codeigniter4', 'Laravel'][idx];

                    const desc = ['Frontend UI Library', 'OSIN', 'Backend Framework', 'Relational Database', 'Network Security', 'Database', 'Javascript Runtime', 'PHP Framework', 'PHP Framework'][idx];
                    const since = ['2023', '2024', '2023', '2024', '2023', '2023', '2023', '2023', '2024'][idx];

                    return (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                          <div style={{ width: '40px', height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '30px' }}>{tech.icon}</div>
                          <div><p style={{ color: '#fff', margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{skillName}</p><p style={{ color: '#aaa', fontSize: '13px', margin: 0 }}>{desc}</p></div>
                        </div>
                        <div style={{ textAlign: 'right' }}><p style={{ color: '#aaa', fontSize: '12px', margin: 0 }}>Since</p><p style={{ color: '#ccc', fontSize: '12px', margin: 0, fontFamily: "'VT323', monospace" }}>{since}</p></div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {activeModal === 'achieve' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '10px' : '40px', cursor: 'auto' }}>
              <div style={{ background: '#252936', width: '100%', maxWidth: '1000px', height: '90vh', borderRadius: '24px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                <button onClick={() => setActiveModal(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '50%', width: '38px', height: '38px', border: 'none', cursor: 'pointer', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', transition: 'all 0.2s', ...isMobile ? { top: '10px', right: '10px' } : {} }}>✕</button>

                <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '20px' : '40px' }} className="hide-scrollbar">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                    {dbExperiences.length === 0 ? (
                      <div style={{ color: '#888', textAlign: 'center', padding: '50px 0', fontFamily: "'VT323',monospace", fontSize: '18px' }}>[ NO_EVENTS_FOUND ]</div>
                    ) : (
                      dbExperiences.map((exp, idx) => {
                        const isEven = idx % 2 === 0;
                        const images = [exp.image_url, exp.image_url_2, exp.image_url_3].filter(Boolean);
                        const hasMultiple = images.length > 1;

                        return (
                          <div key={exp.id} style={{ display: 'flex', flexDirection: isMobile ? 'column' : (isEven ? 'row' : 'row-reverse'), gap: '40px', alignItems: 'center' }}>
                            <div style={{ flex: '1 1 50%', width: '100%', height: isMobile ? '250px' : '350px', background: '#000', borderRadius: '30px', overflow: 'hidden', position: 'relative', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                              {images.length > 0 ? (
                                <motion.div
                                  animate={hasMultiple ? { x: ['0%', `-${100 - (100 / images.length)}%`, '0%'] } : {}}
                                  transition={{ repeat: Infinity, duration: images.length * 4, ease: 'easeInOut' }}
                                  style={{ display: 'flex', width: `${images.length * 100}%`, height: '100%' }}
                                >
                                  {images.map((img, i) => (
                                    <div key={i} style={{ width: `${100 / images.length}%`, height: '100%', flexShrink: 0 }}>
                                      <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={exp.title} onError={e => e.target.src = '/images/profile2.png'} />
                                    </div>
                                  ))}
                                </motion.div>
                              ) : (
                                <img src="/images/profile2.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="default" />
                              )}
                            </div>
                            <div style={{ flex: '1 1 50%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                              <h2 style={{ color: '#fff', fontSize: '28px', marginBottom: '15px', fontFamily: "'Orbitron', sans-serif", lineHeight: 1.3 }}>{exp.title}</h2>
                              <p style={{ color: '#aaa', fontSize: '15px', marginBottom: '25px', fontFamily: "'VT323', monospace", letterSpacing: '0.05em' }}>{exp.date}</p>
                              <p style={{ color: '#ddd', fontSize: '15px', lineHeight: 1.8, marginBottom: '30px' }}>{exp.description}</p>
                              {exp.link_url && (
                                <button onClick={() => window.open(exp.link_url, '_blank')} style={{ background: '#fff', color: '#000', borderRadius: '30px', padding: '12px 28px', fontWeight: 'bold', cursor: 'pointer', border: 'none', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
                                  See more <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </AnimatePresence>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '6px', fontFamily: "'VT323',monospace", fontSize: '18px' }}>
      <span style={{ color: '#9b59b6', minWidth: '64px' }}>{label}</span>
      <span style={{ color: '#555' }}>:</span>
      <span style={{ color: '#00ffff', textShadow: '0 0 5px rgba(0,255,255,0.5)' }}>{value}</span>
    </div>
  );
}


