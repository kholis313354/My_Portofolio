import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

// Deteksi apakah device touch (mobile/tablet)
const isTouchDevice = () =>
  ('ontouchstart' in window) ||
  (navigator.maxTouchPoints > 0) ||
  window.matchMedia('(pointer: coarse)').matches;

export default function CyberCursor() {
  // Jangan render cursor custom di touch devices (mobile/tablet)
  if (isTouchDevice()) return null;
  const innerCursorRef = useRef(null);
  const outerCursorRef = useRef(null);
  const requestRef = useRef(null);

  // Track real mouse vs smooth mouse
  const mouse = useRef({ x: -100, y: -100 });
  const smoothedMouse = useRef({ x: -100, y: -100 });

  useEffect(() => {
    const inner = innerCursorRef.current;
    const outer = outerCursorRef.current;
    if (!inner || !outer) return;

    // Reset and Center cursors
    gsap.set([inner, outer], { border: 'none', outline: 'none', boxShadow: 'none' });
    gsap.set(inner, { xPercent: 0, yPercent: 0 });
    gsap.set(outer, { xPercent: -50, yPercent: -50, opacity: 0 });

    const onMouseMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;

      // Inner cursor instantly follows
      gsap.to(inner, {
        x: mouse.current.x,
        y: mouse.current.y,
        duration: 0.1,
        ease: "power2.out"
      });
    };

    const render = () => {
      smoothedMouse.current.x += (mouse.current.x - smoothedMouse.current.x) * 0.1;
      smoothedMouse.current.y += (mouse.current.y - smoothedMouse.current.y) * 0.1;

      gsap.set(outer, {
        x: smoothedMouse.current.x,
        y: smoothedMouse.current.y
      });

      requestRef.current = requestAnimationFrame(render);
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      if (target.closest('button, a, .cursor-pointer, [data-hoverable="true"]')) {
        gsap.to(outer, {
          opacity: 0.6,
          scale: 1.5,
          duration: 0.4,
          ease: "power2.out"
        });
        gsap.to(inner, {
          scale: 1.2,
          filter: 'drop-shadow(0 0 12px rgba(168, 85, 247, 0.8))',
          duration: 0.3
        });
      }
    };

    const handleMouseOut = (e) => {
      const target = e.target;
      if (target.closest('button, a, .cursor-pointer, [data-hoverable="true"]')) {
        gsap.to(outer, {
          opacity: 0,
          scale: 1,
          duration: 0.4,
          ease: "power2.out"
        });
        gsap.to(inner, {
          scale: 1,
          filter: 'drop-shadow(0 0 5px rgba(168, 85, 247, 0.5))',
          duration: 0.3
        });
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    requestRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <>
      <style>{`
        @media (pointer: fine) {
          body, html, * { cursor: none !important; }
        }
        .no-border-cursor { border: none !important; outline: none !important; box-shadow: none !important; }
      `}</style>

      <div
        ref={innerCursorRef}
        className="no-border-cursor"
        style={{
          position: 'fixed', top: 0, left: 0, width: '22px', height: '22px',
          backgroundImage: "url('/cursor/Cursor4.png')",
          backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center',
          pointerEvents: 'none', zIndex: 999999,
          filter: 'drop-shadow(0 0 5px rgba(168, 85, 247, 0.5))',
          transition: 'filter 0.3s ease',
          border: 'none', outline: 'none'
        }}
      />

      <div
        ref={outerCursorRef}
        className="no-border-cursor"
        style={{
          position: 'fixed', top: 0, left: 0, width: '35px', height: '35px',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, rgba(168, 85, 247, 0) 70%)',
          borderRadius: '50%',
          pointerEvents: 'none', zIndex: 999998,
          filter: 'blur(4px)',
          opacity: 0,
          border: 'none', outline: 'none'
        }}
      />
    </>
  );
}
