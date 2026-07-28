import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useThemeStore } from '@/store/theme.store';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
  phase: number;
  speed: number;
}

function makeParticles(w: number, h: number): Particle[] {
  return Array.from({ length: 48 }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.1,
    vy: (Math.random() - 0.5) * 0.1,
    r: Math.random() * 1.3 + 0.4,
    a: Math.random() * 0.3 + 0.07,
    phase: Math.random() * Math.PI * 2,
    speed: Math.random() * 0.012 + 0.004,
  }));
}

export function DashboardBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const { theme } = useThemeStore();

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let rafId: number;
    let particles: Particle[] = [];
    let frame = 0;
    let cssW = window.innerWidth;
    let cssH = window.innerHeight;

    const resize = () => {
      cssW = window.innerWidth;
      cssH = window.innerHeight;
      canvas.width = cssW * dpr;
      canvas.height = cssH * dpr;
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = makeParticles(cssW, cssH);
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const isDark = document.documentElement.classList.contains('dark');
    const [pr, pg, pb] = isDark ? [148, 163, 184] : [71, 85, 105];

    const draw = () => {
      ctx.clearRect(0, 0, cssW, cssH);
      frame++;

      for (const p of particles) {
        p.x += p.vx + Math.sin(frame * p.speed + p.phase) * 0.22;
        p.y += p.vy + Math.cos(frame * p.speed + p.phase * 1.3) * 0.16;
        if (p.x < 0) p.x = cssW;
        else if (p.x > cssW) p.x = 0;
        if (p.y < 0) p.y = cssH;
        else if (p.y > cssH) p.y = 0;

        const alpha = p.a * (0.55 + 0.45 * Math.sin(frame * 0.016 + p.phase));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${pr},${pg},${pb},${alpha.toFixed(3)})`;
        ctx.fill();
      }
      rafId = requestAnimationFrame(draw);
    };
    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, [reduced, theme]);

  if (reduced) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-20"
        style={{ opacity: 0.2 }}
      />

      {/* Animated ambient gradient blobs */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 1100,
            height: 1100,
            background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 62%)',
            top: '-30%',
            left: '-22%',
          }}
          animate={{ x: [0, 55, -28, 0], y: [0, -38, 22, 0] }}
          transition={{
            duration: 24,
            repeat: Infinity,
            ease: 'easeInOut',
            times: [0, 0.35, 0.65, 1],
          }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 900,
            height: 900,
            background: 'radial-gradient(circle, rgba(139,92,246,0.045) 0%, transparent 62%)',
            bottom: '-22%',
            right: '-18%',
          }}
          animate={{ x: [0, -45, 18, 0], y: [0, 32, -18, 0] }}
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: 'easeInOut',
            times: [0, 0.4, 0.7, 1],
          }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 650,
            height: 650,
            background: 'radial-gradient(circle, rgba(245,158,11,0.035) 0%, transparent 62%)',
            top: '38%',
            left: '42%',
          }}
          animate={{ x: [0, 38, -22, 0], y: [0, -28, 14, 0] }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
            times: [0, 0.3, 0.7, 1],
          }}
        />
      </div>

      {/* Noise texture overlay */}
      <svg aria-hidden className="pointer-events-none fixed inset-0 -z-20 h-full w-full">
        <defs>
          <filter id="tm-bg-noise">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.72"
              numOctaves="4"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
        <rect width="100%" height="100%" filter="url(#tm-bg-noise)" opacity="0.026" />
      </svg>
    </>
  );
}
