import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { ensureGsapRegistered } from '../utils/gsapSetup';
import { FooterStickerDisc, VicalaryMark } from './TapeVisuals';
import { SplitChars } from './MotionPrimitives';
import { RoutePath } from './SiteMenu';
import { vicalarySound } from '../utils/sound';
import { TapeId } from '../data/tapes';

interface SiteFooterProps {
  onNavigate: (path: RoutePath) => void;
}

const FOOTER_LINKS: Array<{ label: string; href: RoutePath }> = [
  { label: 'OUR MODULES', href: '/products' },
  { label: 'ABOUT', href: '/about' },
  { label: 'UPDATES', href: '/news' },
  { label: 'CONTACT', href: '/contact' },
];

type SocialKind = 'x' | 'whatsapp' | 'instagram';

type DiscSpec =
  | {
      kind: 'module';
      key: string;
      id: TapeId;
      label: string;
      href: RoutePath;
      initXFrac: number;
      initRot: number;
    }
  | {
      kind: 'social';
      key: string;
      social: SocialKind;
      label: string;
      externalUrl: string;
      initXFrac: number;
      initRot: number;
    };

const DISCS: DiscSpec[] = [
  {
    kind: 'module',
    key: 'mod-spiritual',
    id: 'spiritual',
    label: 'Faith & Calm',
    href: '/products/spiritual',
    initXFrac: 0.09,
    initRot: -16,
  },
  {
    kind: 'module',
    key: 'mod-camera',
    id: 'camera',
    label: 'Meal Camera',
    href: '/products/camera',
    initXFrac: 0.27,
    initRot: 146,
  },
  {
    kind: 'social',
    key: 'soc-x',
    social: 'x',
    label: 'X',
    externalUrl: 'https://x.com',
    initXFrac: 0.41,
    initRot: -10,
  },
  {
    kind: 'social',
    key: 'soc-ig',
    social: 'instagram',
    label: 'Instagram',
    externalUrl: 'https://instagram.com',
    initXFrac: 0.49,
    initRot: 8,
  },
  {
    kind: 'module',
    key: 'mod-cookbook',
    id: 'cookbook',
    label: 'Smart Cookbook',
    href: '/products/cookbook',
    initXFrac: 0.65,
    initRot: -22,
  },
  {
    kind: 'social',
    key: 'soc-wa',
    social: 'whatsapp',
    label: 'WhatsApp',
    externalUrl: 'https://wa.me',
    initXFrac: 0.78,
    initRot: -14,
  },
  {
    kind: 'module',
    key: 'mod-scanner',
    id: 'scanner',
    label: 'Barcode Scanner',
    href: '/products/scanner',
    initXFrac: 0.91,
    initRot: -88,
  },
];

function SocialIconSvg({ kind }: { kind: SocialKind }) {
  if (kind === 'x') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[42%] h-[42%]" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }
  if (kind === 'whatsapp') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[46%] h-[46%]" aria-hidden="true">
        <path d="M12.031 2c-5.516 0-9.969 4.453-9.969 9.969 0 1.766.469 3.484 1.344 5l-1.406 5.156 5.281-1.375c1.469.797 3.109 1.219 4.75 1.219 5.516 0 9.969-4.453 9.969-9.969S17.547 2 12.031 2zm5.813 14.125c-.25.703-1.438 1.344-2 1.422-.516.078-1.172.109-1.891-.125-.438-.141-1-.328-1.719-.641-3.031-1.313-5-4.375-5.156-4.578-.156-.203-1.234-1.641-1.234-3.125s.781-2.219 1.063-2.516c.281-.297.609-.375.813-.375.203 0 .406.002.578.009.188.008.438-.07.688.531.25.609.859 2.094.938 2.25.078.156.125.344.031.547-.094.203-.141.328-.297.5-.156.172-.328.391-.469.516-.156.156-.313.328-.141.641.172.313.781 1.281 1.672 2.078 1.156 1.031 2.125 1.344 2.438 1.5.313.156.484.125.672-.078.188-.203.766-.891.969-1.203.203-.313.406-.266.688-.156.281.109 1.797.844 2.109 1 .313.156.516.234.594.359.078.125.078.734-.172 1.438z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[44%] h-[44%]" aria-hidden="true">
      <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.8A3.95 3.95 0 0 0 3.8 7.75v8.5a3.95 3.95 0 0 0 3.95 3.95h8.5a3.95 3.95 0 0 0 3.95-3.95v-8.5a3.95 3.95 0 0 0-3.95-3.95h-8.5zm9.5 1.95a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 1.8A3.2 3.2 0 1 0 12 15.2 3.2 3.2 0 0 0 12 8.8z" />
    </svg>
  );
}

function GooglePlayIconSvg({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M3.4 2.75 Q3.4 1.85 4.2 2.05 L13.2 12 L4.2 21.95 Q3.4 22.15 3.4 21.25 Z" opacity="0.92" />
      <path d="M4.65 2.08 L16.55 9.35 L13.6 11.72 Z" opacity="0.72" />
      <path d="M4.65 21.92 L13.6 12.28 L16.55 14.65 Z" opacity="0.58" />
      <path d="M17.0 9.62 L20.4 11.7 Q21.05 12 20.4 12.3 L17.0 14.38 L14.0 12 Z" opacity="1" />
    </svg>
  );
}

function AppleIconSvg({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-.13.09-2.383 1.37-2.383 4.19 0 3.26 2.854 4.42 2.955 4.45z" />
    </svg>
  );
}

// Arched character tilt across the display wordmark
function ArcChar({
  ch,
  index,
  total,
}: {
  ch: string;
  index: number;
  total: number;
}) {
  const u = total > 1 ? (2 * index) / (total - 1) - 1 : 0;
  const dropRem = (1 - u * u) * 0.65;
  const tiltDeg = -u * 5.5;

  return (
    <span
      className="clip inline-block overflow-hidden align-bottom px-[0.04em]"
      style={{
        transform: `translateY(${dropRem.toFixed(2)}rem) rotate(${tiltDeg.toFixed(2)}deg)`,
        transformOrigin: '50% 100%',
      }}
      aria-hidden="true"
    >
      <span className="char inline-block will-change-transform">
        {ch === ' ' ? '\u00A0' : ch}
      </span>
    </span>
  );
}

interface BodyState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  rot: number;
  vRot: number;
  hoverCooldown: number;
}

export function SiteFooter({ onNavigate }: SiteFooterProps) {
  const footerRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const discElsRef = useRef<Array<HTMLElement | null>>([]);
  const bodiesRef = useRef<BodyState[]>([]);
  const dragRef = useRef<{
    idx: number;
    offsetX: number;
    offsetY: number;
    lastX: number;
    lastY: number;
    moved: number;
  } | null>(null);
  const inViewRef = useRef(false);
  const dropTriggeredRef = useRef(false);
  const suppressClickIdxRef = useRef<number | null>(null);

  // 1. GSAP ScrollTrigger Reveals for Navigation, Crest & Headline
  useLayoutEffect(() => {
    const { gsap } = ensureGsapRegistered();
    const ctx = gsap.context(() => {
      if (!footerRef.current) return;

      const navChars = gsap.utils.toArray<HTMLElement>('.footer-nav .char');
      gsap.fromTo(
        navChars,
        { yPercent: 120 },
        {
          yPercent: 0,
          duration: 0.55,
          stagger: 0.015,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.footer-nav',
            start: 'top 92%',
            toggleActions: 'play none none reverse',
            invalidateOnRefresh: true,
          },
        }
      );

      gsap.fromTo(
        '.footer-mark-wrap',
        { scale: 0.65, y: 20, opacity: 0 },
        {
          scale: 1,
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: '.footer-bottom',
            start: 'top 88%',
            toggleActions: 'play none none reverse',
            invalidateOnRefresh: true,
          },
        }
      );

      const headlineChars = gsap.utils.toArray<HTMLElement>('.footer-headline .char');
      gsap.fromTo(
        headlineChars,
        { yPercent: 125 },
        {
          yPercent: 0,
          duration: 0.72,
          stagger: 0.032,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: '.footer-bottom',
            start: 'top 86%',
            toggleActions: 'play none none reverse',
            invalidateOnRefresh: true,
          },
        }
      );
    }, footerRef);

    return () => ctx.revert();
  }, []);

  // 2. Real 2D Bouncy Circle Physics (Gravity Settle + Floor & Wall Collisions + Cursor Hover Shuffle + Tap/Drag)
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const getStageMetrics = () => {
      const w = stage.clientWidth || 1000;
      const h = stage.clientHeight || 540;
      const headlineRect = headlineRef.current?.getBoundingClientRect();
      const stageRect = stage.getBoundingClientRect();
      // Keep resting ceiling safely below "BODY / & SOUL" so typography stays 100% readable
      const headlineBottom = headlineRect
        ? Math.max(0, headlineRect.bottom - stageRect.top)
        : h * 0.48;
      const isPhone = w < 640;
      const isTablet = w >= 640 && w < 1024;
      const bigR = isPhone
        ? Math.max(38, Math.min(54, w * 0.115))
        : isTablet
          ? Math.max(54, Math.min(78, w * 0.088))
          : Math.max(74, Math.min(122, w * 0.088));
      const smallR = isPhone
        ? Math.max(26, Math.min(38, w * 0.082))
        : isTablet
          ? Math.max(38, Math.min(54, w * 0.058))
          : Math.max(48, Math.min(78, w * 0.056));
      return { w, h, headlineBottom, bigR, smallR };
    };

    const syncDomFromBodies = () => {
      const bodies = bodiesRef.current;
      for (let i = 0; i < bodies.length; i++) {
        const el = discElsRef.current[i];
        const b = bodies[i];
        if (!el || !b) continue;
        const size = b.r * 2;
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.style.transform = `translate3d(${b.x - b.r}px, ${b.y - b.r}px, 0) rotate(${b.rot.toFixed(1)}deg)`;
      }
    };

    const initBodies = (dropFromAbove: boolean) => {
      const { w, h, headlineBottom, bigR, smallR } = getStageMetrics();
      const floorY = h - 18;
      bodiesRef.current = DISCS.map((d, i) => {
        const r = d.kind === 'module' ? bigR : smallR;
        const targetY = floorY - r;
        const dropOffset = dropFromAbove ? 70 + (i % 3) * 45 : 0;
        return {
          x: Math.max(r * 0.5, Math.min(w - r * 0.5, d.initXFrac * w)),
          y: Math.max(headlineBottom + r * 0.45, targetY - dropOffset),
          vx: (i % 2 === 0 ? 1 : -1) * (dropFromAbove ? 22 : 0),
          vy: dropFromAbove ? 40 + i * 18 : 0,
          r,
          rot: d.initRot,
          vRot: 0,
          hoverCooldown: 0,
        };
      });
      syncDomFromBodies();
    };

    initBodies(false);

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        inViewRef.current = entry.isIntersecting;
        if (entry.isIntersecting && !dropTriggeredRef.current) {
          dropTriggeredRef.current = true;
          initBodies(true);
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(stage);

    const handleResize = () => {
      const { w, h, headlineBottom, bigR, smallR } = getStageMetrics();
      const ceilingY = Math.max(headlineBottom + 12, h * 0.44);
      bodiesRef.current.forEach((b, i) => {
        b.r = DISCS[i].kind === 'module' ? bigR : smallR;
        b.x = Math.max(b.r * 0.45, Math.min(w - b.r * 0.45, DISCS[i].initXFrac * w));
        b.y = Math.max(ceilingY + b.r * 0.25, Math.min(h - b.r - 14, h - b.r - 18));
        b.vx = 0;
        b.vy = 0;
      });
      syncDomFromBodies();
    };

    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(handleResize) : null;
    resizeObserver?.observe(stage);
    window.addEventListener('resize', handleResize);

    let rafId = 0;
    let lastTime = performance.now();

    const step = (now: number) => {
      rafId = window.requestAnimationFrame(step);
      const dt = Math.min(0.032, (now - lastTime) / 1000);
      lastTime = now;

      if (!inViewRef.current && !dragRef.current) return;

      const { w, h, headlineBottom } = getStageMetrics();
      const bodies = bodiesRef.current;
      const floorY = h - 14;
      const ceilingY = Math.max(headlineBottom + 12, h * 0.44);
      const gravity = 1280;

      // Integrate velocity & gravity
      for (let i = 0; i < bodies.length; i++) {
        const b = bodies[i];
        if (b.hoverCooldown > 0) b.hoverCooldown = Math.max(0, b.hoverCooldown - dt);

        if (dragRef.current && dragRef.current.idx === i) {
          b.rot += b.vx * dt * 0.18;
          continue;
        }

        b.vy += gravity * dt;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.rot += b.vRot * dt;

        b.vx *= 0.986;
        b.vy *= 0.992;
        b.vRot *= 0.96;

        // Floor bounce
        const maxBottom = floorY - b.r;
        if (b.y > maxBottom) {
          b.y = maxBottom;
          if (Math.abs(b.vy) > 35) {
            b.vy = -b.vy * 0.56;
            b.vRot += b.vx * 0.15;
          } else {
            b.vy = 0;
          }
          b.vx *= 0.92;
        }

        // Ceiling keep-out beneath BODY & SOUL so text remains 100% readable
        const minTop = ceilingY + b.r * 0.25;
        if (b.y < minTop) {
          b.y = minTop;
          if (b.vy < 0) b.vy = -b.vy * 0.45;
        }

        // Left / right walls (allow outer edge slight kiss just like screenshot)
        const minX = b.r * 0.4;
        const maxX = w - b.r * 0.4;
        if (b.x < minX) {
          b.x = minX;
          b.vx = Math.abs(b.vx) * 0.65;
          b.vRot -= 40;
        } else if (b.x > maxX) {
          b.x = maxX;
          b.vx = -Math.abs(b.vx) * 0.65;
          b.vRot += 40;
        }
      }

      // Circle-to-circle elastic bouncy collisions
      for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
          const a = bodies[i];
          const b = bodies[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy) || 0.001;
          const minDist = a.r + b.r + 3;

          if (dist < minDist) {
            const nx = dx / dist;
            const ny = dy / dist;
            const overlap = minDist - dist;

            const dragA = dragRef.current?.idx === i;
            const dragB = dragRef.current?.idx === j;

            if (!dragA && !dragB) {
              a.x -= nx * overlap * 0.5;
              a.y -= ny * overlap * 0.5;
              b.x += nx * overlap * 0.5;
              b.y += ny * overlap * 0.5;
            } else if (dragA) {
              b.x += nx * overlap;
              b.y += ny * overlap;
            } else if (dragB) {
              a.x -= nx * overlap;
              a.y -= ny * overlap;
            }

            const rvx = b.vx - a.vx;
            const rvy = b.vy - a.vy;
            const velAlongNormal = rvx * nx + rvy * ny;
            if (velAlongNormal < 0) {
              const restitution = 0.68;
              const impulse = -(1 + restitution) * velAlongNormal * 0.5;
              if (!dragA) {
                a.vx -= impulse * nx;
                a.vy -= impulse * ny;
                a.vRot -= impulse * 0.35;
              }
              if (!dragB) {
                b.vx += impulse * nx;
                b.vy += impulse * ny;
                b.vRot += impulse * 0.35;
              }
            }
          }
        }
      }

      // Sync DOM nodes cleanly via transform3d
      for (let i = 0; i < bodies.length; i++) {
        const el = discElsRef.current[i];
        const b = bodies[i];
        if (!el) continue;
        const size = b.r * 2;
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.style.transform = `translate3d(${b.x - b.r}px, ${b.y - b.r}px, 0) rotate(${b.rot.toFixed(1)}deg)`;
      }
    };

    rafId = window.requestAnimationFrame(step);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      resizeObserver?.disconnect();
      observer.disconnect();
    };
  }, []);

  // Hover shuffle impulse (mouse passing over a disc nudges & hops it playfully)
  const handleHoverShuffle = (idx: number, e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType === 'touch') return;
    const b = bodiesRef.current[idx];
    const stage = stageRef.current;
    if (!b || !stage || b.hoverCooldown > 0 || dragRef.current) return;

    const rect = stage.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const dir = px < b.x ? 1 : -1;
    b.vx += dir * (160 + Math.random() * 110);
    b.vy -= 210 + Math.random() * 90;
    b.vRot += dir * (80 + Math.random() * 70);
    b.hoverCooldown = 0.24;
  };

  // Pointer/Touch Press, Drag & Tap-Bounce handlers
  const handlePointerDown = (idx: number, e: React.PointerEvent<HTMLElement>) => {
    const b = bodiesRef.current[idx];
    const stage = stageRef.current;
    if (!b || !stage) return;

    const rect = stage.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      idx,
      offsetX: b.x - px,
      offsetY: b.y - py,
      lastX: px,
      lastY: py,
      moved: 0,
    };
  };

  const handlePointerMove = (idx: number, e: React.PointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    const stage = stageRef.current;
    if (!drag || drag.idx !== idx || !stage) return;

    const rect = stage.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const dx = px - drag.lastX;
    const dy = py - drag.lastY;

    drag.moved += Math.hypot(dx, dy);
    drag.lastX = px;
    drag.lastY = py;

    const b = bodiesRef.current[idx];
    if (b) {
      const headlineRect = headlineRef.current?.getBoundingClientRect();
      const ceilingY = headlineRect
        ? Math.max(stage.clientHeight * 0.42, headlineRect.bottom - rect.top + b.r * 0.25)
        : stage.clientHeight * 0.44;
      b.x = px + drag.offsetX;
      b.y = Math.max(ceilingY, py + drag.offsetY);
      b.vx = dx * 28;
      b.vy = dy * 28;
    }
  };

  const handlePointerUp = (idx: number, e: React.PointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.idx !== idx) return;

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    const wasTap = drag.moved < 8;
    dragRef.current = null;
    suppressClickIdxRef.current = wasTap ? null : idx;

    if (wasTap) {
      const b = bodiesRef.current[idx];
      if (b) {
        b.vy -= 280;
        b.vx += (Math.random() - 0.5) * 180;
        b.vRot += (Math.random() - 0.5) * 140;
      }
      vicalarySound.playRollClick();
    }
  };

  const handleDiscClick = (idx: number, spec: DiscSpec, e: React.MouseEvent<HTMLElement>) => {
    if (suppressClickIdxRef.current === idx) {
      e.preventDefault();
      suppressClickIdxRef.current = null;
      return;
    }
    if (spec.kind === 'module') {
      onNavigate(spec.href);
    }
  };

  const line1 = Array.from('BODY');
  const line2 = Array.from('& SOUL');

  return (
    <footer
      ref={footerRef}
      style={{
        ['--arc-h' as string]: 'var(--curve-depth)',
        marginTop: 'calc(var(--curve-depth) * -1)',
        paddingTop: 'var(--curve-depth)',
      }}
      className="site-footer arc-bite-top relative z-20 bg-[#0D2F4F] text-[#A6EB67] overflow-hidden"
    >
      {/* Top Footer Navigation — label stacked above persistent dot */}
      <nav aria-label="Footer" className="footer-nav relative z-30 px-5 sm:px-10 pt-6 pb-4 sm:pb-6">
        <ul className="grid grid-cols-2 md:flex md:items-start md:justify-between gap-4 sm:gap-6">
          {FOOTER_LINKS.map((link) => (
            <li key={link.href}>
              <button
                type="button"
                onClick={() => {
                  vicalarySound.playRollClick();
                  onNavigate(link.href);
                }}
                className="footer-link group flex flex-col items-center gap-1.5 sm:gap-2 mx-auto font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#A6EB67] hover:text-[#D9F7C4] transition-colors cursor-pointer"
              >
                <span className="footer-link-label transition-transform duration-300">
                  <SplitChars text={link.label} engine="gsap" />
                </span>
                <span className="footer-link-dot h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-current" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Full-Width Interactive Physics Stage */}
      <div
        ref={stageRef}
        className="footer-bottom relative w-full h-[460px] sm:h-[540px] md:h-[560px] lg:h-[46vw] lg:min-h-[580px] lg:max-h-[720px] pt-2 pb-14 sm:pb-16 flex flex-col items-center text-center overflow-hidden select-none"
      >
        {/* Left: Standalone Google Play Store Icon */}
        <button
          type="button"
          onClick={() => {
            vicalarySound.playTapePeel();
            onNavigate('/launch/play');
          }}
          aria-label="Google Play Store — Launch updates"
          title="Google Play Store"
          className="footer-store-icon absolute left-4 sm:left-10 top-3 sm:top-6 z-30 inline-flex items-center justify-center p-1.5 text-[#A6EB67] hover:text-[#D9F7C4] transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A6EB67] rounded-lg"
        >
          <GooglePlayIconSvg className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 drop-shadow-md" />
        </button>

        {/* Right: Standalone Apple App Store Icon */}
        <button
          type="button"
          onClick={() => {
            vicalarySound.playTapePeel();
            onNavigate('/launch/apple');
          }}
          aria-label="Apple App Store — Launch updates"
          title="Apple App Store"
          className="footer-store-icon absolute right-4 sm:right-10 top-3 sm:top-6 z-30 inline-flex items-center justify-center p-1.5 text-[#A6EB67] hover:text-[#D9F7C4] transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A6EB67] rounded-lg"
        >
          <AppleIconSvg className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 drop-shadow-md" />
        </button>

        {/* Centered VICALARY Crest sitting cleanly above headline */}
        <div className="footer-mark-wrap relative z-20 -mb-1 sm:-mb-3">
          <VicalaryMark className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 transition-transform duration-500 hover:rotate-180" />
        </div>

        {/* Giant Arced Headline — sits cleanly above the bouncing floor zone so it's 100% readable */}
        <h2
          ref={headlineRef}
          aria-label="BODY & SOUL"
          className="footer-headline relative z-10 font-display font-black uppercase text-[#A6EB67] leading-[0.76] tracking-[-0.02em] select-none flex flex-col items-center pt-2"
          style={{ fontSize: 'clamp(3.75rem, 12.2vw, 10.5rem)' }}
        >
          <span className="line flex justify-center">
            {line1.map((ch, i) => (
              <ArcChar key={`l1-${i}`} ch={ch} index={i} total={line1.length} />
            ))}
          </span>
          <span className="line flex justify-center">
            {line2.map((ch, i) => (
              <ArcChar key={`l2-${i}`} ch={ch} index={i} total={line2.length} />
            ))}
          </span>
        </h2>

        {/* Interactive Bouncy Physics Discs: 4 VICALARY typographic module discs + 3 social discs (X, Instagram, WhatsApp) */}
        <div className="footer-balls absolute inset-0 pointer-events-none z-20">
          {DISCS.map((spec, idx) => {
            const commonClass = `footer-ball pointer-events-auto absolute top-0 left-0 rounded-full will-change-transform cursor-grab active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A6EB67] ${
              spec.kind === 'social'
                ? 'bg-[#A6EB67] text-[#0D2F4F] flex items-center justify-center shadow-xl border-2 border-[#0D2F4F]/25'
                : 'drop-shadow-2xl'
            }`;

            if (spec.kind === 'social') {
              return (
                <a
                  key={spec.key}
                  ref={(el) => {
                    discElsRef.current[idx] = el;
                  }}
                  href={spec.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  draggable={false}
                  onPointerEnter={(e) => handleHoverShuffle(idx, e)}
                  onPointerDown={(e) => handlePointerDown(idx, e)}
                  onPointerMove={(e) => handlePointerMove(idx, e)}
                  onPointerUp={(e) => handlePointerUp(idx, e)}
                  onPointerCancel={() => {
                    dragRef.current = null;
                  }}
                  onClick={(e) => handleDiscClick(idx, spec, e)}
                  aria-label={spec.label}
                  title={`${spec.label} — hover, tap, or drag to bounce`}
                  style={{ touchAction: 'none' }}
                  className={commonClass}
                >
                  <SocialIconSvg kind={spec.social} />
                </a>
              );
            }

            return (
              <button
                key={spec.key}
                ref={(el) => {
                  discElsRef.current[idx] = el;
                }}
                type="button"
                onPointerEnter={(e) => handleHoverShuffle(idx, e)}
                onPointerDown={(e) => handlePointerDown(idx, e)}
                onPointerMove={(e) => handlePointerMove(idx, e)}
                onPointerUp={(e) => handlePointerUp(idx, e)}
                onPointerCancel={() => {
                  dragRef.current = null;
                }}
                onClick={(e) => handleDiscClick(idx, spec, e)}
                aria-label={spec.label}
                title={`${spec.label} — hover, tap, or drag to bounce`}
                style={{ touchAction: 'none' }}
                className={commonClass}
              >
                <FooterStickerDisc id={spec.id} className="w-full h-full pointer-events-none" />
              </button>
            );
          })}
        </div>

        {/* Centered Dark Navy Legal Pill anchored cleanly at bottom edge */}
        <p className="footer-legal absolute bottom-3 left-1/2 -translate-x-1/2 z-40 whitespace-nowrap rounded-lg bg-[#081F36] px-4 py-1.5 text-xs sm:text-sm font-medium text-[#D9F7C4] shadow-md">
          Copyright © 2026. VICALARY — Body &amp; Soul
        </p>
      </div>
    </footer>
  );
}
