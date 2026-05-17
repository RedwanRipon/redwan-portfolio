'use client';

import { useEffect, useRef } from 'react';

/**
 * Canvas neural-network background — drifting nodes connected by edges
 * whose opacity scales with distance, plus occasional pulse "signals"
 * that travel along an edge from one node to a neighbour (synaptic
 * firing). Pure aesthetic, sits behind Hero content.
 *
 * Palette aligned to the site:
 *   nodes  → gold   (#f0bb62)
 *   edges  → violet (#c4b5fd) with low alpha
 *   pulses → violet bright
 *
 * Respects prefers-reduced-motion: renders a single static frame for
 * users who've opted out of motion.
 */
export function NeuralNetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---------- sizing ----------
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    // ---------- nodes ----------
    type Node = { x: number; y: number; vx: number; vy: number; r: number };
    const nodeCount = Math.max(28, Math.min(64, Math.floor((width * height) / 22000)));
    const nodes: Node[] = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: 0.8 + Math.random() * 1.6,
    }));

    // ---------- pulses (synaptic firings travelling along an edge) ----------
    type Pulse = { from: number; to: number; t: number; speed: number };
    const pulses: Pulse[] = [];
    const MAX_PULSES = 5;

    const spawnPulse = () => {
      if (pulses.length >= MAX_PULSES) return;
      const from = Math.floor(Math.random() * nodes.length);
      // pick a nearby neighbour
      const neighbours: number[] = [];
      for (let i = 0; i < nodes.length; i++) {
        if (i === from) continue;
        const dx = nodes[from].x - nodes[i].x;
        const dy = nodes[from].y - nodes[i].y;
        if (dx * dx + dy * dy < CONNECT_DIST_SQ) neighbours.push(i);
      }
      if (!neighbours.length) return;
      const to = neighbours[Math.floor(Math.random() * neighbours.length)];
      pulses.push({ from, to, t: 0, speed: 0.006 + Math.random() * 0.01 });
    };

    const CONNECT_DIST = 140;
    const CONNECT_DIST_SQ = CONNECT_DIST * CONNECT_DIST;

    // ---------- drawing ----------
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // edges
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < CONNECT_DIST_SQ) {
            const d = Math.sqrt(d2);
            const alpha = (1 - d / CONNECT_DIST) * 0.28;
            ctx.strokeStyle = `rgba(196,181,253,${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // pulses
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        const a = nodes[p.from];
        const b = nodes[p.to];
        const x = a.x + (b.x - a.x) * p.t;
        const y = a.y + (b.y - a.y) * p.t;
        // soft glow
        const grad = ctx.createRadialGradient(x, y, 0, x, y, 14);
        grad.addColorStop(0, 'rgba(216,180,254,0.85)');
        grad.addColorStop(1, 'rgba(216,180,254,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, 14, 0, Math.PI * 2);
        ctx.fill();
        // bright core
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.beginPath();
        ctx.arc(x, y, 1.6, 0, Math.PI * 2);
        ctx.fill();
        p.t += p.speed;
        if (p.t >= 1) pulses.splice(i, 1);
      }

      // nodes
      for (const n of nodes) {
        // gentle outer glow
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 4);
        g.addColorStop(0, 'rgba(240,187,98,0.5)');
        g.addColorStop(1, 'rgba(240,187,98,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 4, 0, Math.PI * 2);
        ctx.fill();
        // bright core
        ctx.fillStyle = 'rgba(240,187,98,0.95)';
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    if (reduceMotion) {
      draw();
      return () => {
        window.removeEventListener('resize', resize);
      };
    }

    // ---------- animation loop ----------
    let raf = 0;
    let lastSpawn = 0;
    const tick = (now: number) => {
      // drift nodes
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -10) n.x = width + 10;
        else if (n.x > width + 10) n.x = -10;
        if (n.y < -10) n.y = height + 10;
        else if (n.y > height + 10) n.y = -10;
      }
      // spawn a pulse every ~1.2s
      if (now - lastSpawn > 1200) {
        spawnPulse();
        lastSpawn = now;
      }
      draw();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
