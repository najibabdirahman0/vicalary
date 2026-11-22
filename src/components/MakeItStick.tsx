import React, { useCallback, useLayoutEffect, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { IMAGES } from '../data/tapes';
import { ensureGsapRegistered } from '../utils/gsapSetup';
import { ScrollPeelTape, SplitChars, SplitWords } from './MotionPrimitives';
import { RoutePath } from './SiteMenu';
import { vicalarySound } from '../utils/sound';

interface MakeItStickProps {
  onNavigate: (path: RoutePath) => void;
}

// =========================================================================
// CC PAGE TURN STICKER PEEL MODEL (from Leadership.tsx — Ismail Abdurahman)
// Physical paper peel with fold line sweeping diagonally top-to-bottom,
// reflected sticker flap with cream adhesive backing, 3D cylindrical roll
// highlight, and moving contact drop shadow over pure cutout silhouette.
// =========================================================================

function clipPolygonToHalfPlane(
  poly: [number, number][],
  nx: number,
  ny: number,
  d: number,
  keepGreater: boolean
): [number, number][] {
  const out: [number, number][] = [];
  const n = poly.length;
  for (let i = 0; i < n; i++) {
    const A = poly[i];
    const B = poly[(i + 1) % n];
    const dA = (A[0] * nx + A[1] * ny - d) * (keepGreater ? 1 : -1);
    const dB = (B[0] * nx + B[1] * ny - d) * (keepGreater ? 1 : -1);
    if (dA >= 0) {
      if (dB >= 0) {
        out.push(B);
      } else {
        const t = dA / (dA - dB);
        out.push([A[0] + t * (B[0] - A[0]), A[1] + t * (B[1] - A[1])]);
      }
    } else if (dB >= 0) {
      const t = dA / (dA - dB);
      out.push([A[0] + t * (B[0] - A[0]), A[1] + t * (B[1] - A[1])]);
      out.push(B);
    }
  }
  return out;
}

function findFoldIntersections(
  W: number,
  H: number,
  nx: number,
  ny: number,
  d: number
): [number, number][] {
  const pts: [number, number][] = [];
  if (Math.abs(nx) > 1e-6) {
    const x = d / nx;
    if (x >= -1 && x <= W + 1) pts.push([Math.max(0, Math.min(W, x)), 0]);
  }
  if (Math.abs(ny) > 1e-6) {
    const y = (d - W * nx) / ny;
    if (y >= -1 && y <= H + 1) pts.push([W, Math.max(0, Math.min(H, y))]);
  }
  if (Math.abs(nx) > 1e-6) {
    const x = (d - H * ny) / nx;
    if (x >= -1 && x <= W + 1) pts.push([Math.max(0, Math.min(W, x)), H]);
  }
  if (Math.abs(ny) > 1e-6) {
    const y = d / ny;
    if (y >= -1 && y <= H + 1) pts.push([0, Math.max(0, Math.min(H, y))]);
  }
  const unique: [number, number][] = [];
  for (const p of pts) {
    if (!unique.some((u) => Math.hypot(u[0] - p[0], u[1] - p[1]) < 1.0)) {
      unique.push(p);
    }
  }
  return unique;
}

const STICKER_VB_W = 500;
const STICKER_VB_H = 500;
const STICKER_RECT: [number, number][] = [
  [0, 0],
  [STICKER_VB_W, 0],
  [STICKER_VB_W, STICKER_VB_H],
  [0, STICKER_VB_H],
];
const PEEL_ANGLE_RAD = (22 * Math.PI) / 180;
const PEEL_NX = -Math.sin(PEEL_ANGLE_RAD);
const PEEL_NY = Math.cos(PEEL_ANGLE_RAD);
const PEEL_TX = Math.cos(PEEL_ANGLE_RAD);
const PEEL_TY = Math.sin(PEEL_ANGLE_RAD);

const STICKER_PROJS = STICKER_RECT.map((p) => p[0] * PEEL_NX + p[1] * PEEL_NY);
const STICKER_S_MIN = Math.min(...STICKER_PROJS);
const STICKER_S_MAX = Math.max(...STICKER_PROJS);
const STICKER_S_RANGE = STICKER_S_MAX - STICKER_S_MIN;

function polyToSvgPath(pts: [number, number][]): string {
  if (pts.length < 3) return '';
  return 'M' + pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' L') + ' Z';
}

function calculateCCPageTurn(t: number) {
  if (t <= 0) {
    return {
      unpeeledPath: `M0,0 L${STICKER_VB_W},0 L${STICKER_VB_W},${STICKER_VB_H} L0,${STICKER_VB_H} Z`,
      peeledPath: '',
      cylinderPath: '',
      shadowPath: '',
      matrix: { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 },
      cylinderGrad: { x1: 0, y1: 0, x2: 0, y2: 0 },
      hasFlap: false,
      hasCylinder: false,
    };
  }

  if (t >= 1) {
    return {
      unpeeledPath: '',
      peeledPath: `M0,0 L${STICKER_VB_W},0 L${STICKER_VB_W},${STICKER_VB_H} L0,${STICKER_VB_H} Z`,
      cylinderPath: '',
      shadowPath: '',
      matrix: {
        a: 1 - 2 * PEEL_NX * PEEL_NX,
        b: -2 * PEEL_NX * PEEL_NY,
        c: -2 * PEEL_NX * PEEL_NY,
        d: 1 - 2 * PEEL_NY * PEEL_NY,
        e: 2 * STICKER_S_MAX * PEEL_NX,
        f: 2 * STICKER_S_MAX * PEEL_NY,
      },
      cylinderGrad: { x1: 0, y1: 0, x2: 0, y2: 0 },
      hasFlap: true,
      hasCylinder: false,
    };
  }

  const s0 = STICKER_S_MIN + t * STICKER_S_RANGE;
  const unpeeledPoly = clipPolygonToHalfPlane(STICKER_RECT, PEEL_NX, PEEL_NY, s0, true);
  const peeledPoly = clipPolygonToHalfPlane(STICKER_RECT, PEEL_NX, PEEL_NY, s0, false);
  const inter = findFoldIntersections(STICKER_VB_W, STICKER_VB_H, PEEL_NX, PEEL_NY, s0);

  const a = 1 - 2 * PEEL_NX * PEEL_NX;
  const b = -2 * PEEL_NX * PEEL_NY;
  const c = -2 * PEEL_NX * PEEL_NY;
  const d = 1 - 2 * PEEL_NY * PEEL_NY;
  const e = 2 * s0 * PEEL_NX;
  const f = 2 * s0 * PEEL_NY;

  let cylinderPath = '';
  let shadowPath = '';
  let gradX1 = 0;
  let gradY1 = 0;
  let gradX2 = 0;
  let gradY2 = 0;
  let hasCylinder = false;

  if (inter.length >= 2) {
    const I1 = inter[0];
    const I2 = inter[1];
    const R = 22;

    const ext = 40;
    const E1: [number, number] = [I1[0] - ext * PEEL_TX, I1[1] - ext * PEEL_TY];
    const E2: [number, number] = [I2[0] + ext * PEEL_TX, I2[1] + ext * PEEL_TY];

    const C1: [number, number] = [E1[0] - R * PEEL_NX, E1[1] - R * PEEL_NY];
    const C2: [number, number] = [E2[0] - R * PEEL_NX, E2[1] - R * PEEL_NY];
    const C3: [number, number] = [E2[0] + 0.4 * R * PEEL_NX, E2[1] + 0.4 * R * PEEL_NY];
    const C4: [number, number] = [E1[0] + 0.4 * R * PEEL_NX, E1[1] + 0.4 * R * PEEL_NY];
    cylinderPath = polyToSvgPath([C1, C2, C3, C4]);

    const S1: [number, number] = [E1[0] + 0.1 * R * PEEL_NX, E1[1] + 0.1 * R * PEEL_NY];
    const S2: [number, number] = [E2[0] + 0.1 * R * PEEL_NX, E2[1] + 0.1 * R * PEEL_NY];
    const S3: [number, number] = [E2[0] + 2.5 * R * PEEL_NX, E2[1] + 2.5 * R * PEEL_NY];
    const S4: [number, number] = [E1[0] + 2.5 * R * PEEL_NX, E1[1] + 2.5 * R * PEEL_NY];
    shadowPath = polyToSvgPath([S1, S2, S3, S4]);

    const midX = (I1[0] + I2[0]) / 2;
    const midY = (I1[1] + I2[1]) / 2;
    gradX1 = midX - R * PEEL_NX;
    gradY1 = midY - R * PEEL_NY;
    gradX2 = midX + 0.4 * R * PEEL_NX;
    gradY2 = midY + 0.4 * R * PEEL_NY;
    hasCylinder = true;
  }

  return {
    unpeeledPath: polyToSvgPath(unpeeledPoly),
    peeledPath: polyToSvgPath(peeledPoly),
    cylinderPath,
    shadowPath,
    matrix: { a, b, c, d, e, f },
    cylinderGrad: { x1: gradX1, y1: gradY1, x2: gradX2, y2: gradY2 },
    hasFlap: peeledPoly.length >= 3,
    hasCylinder,
  };
}

export function MakeItStick({ onNavigate }: MakeItStickProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const stickerWrapperRef = useRef<HTMLDivElement>(null);
  const stickerSvgRef = useRef<SVGSVGElement>(null);
  const imgClipPathRef = useRef<SVGPathElement>(null);
  const flapClipPathRef = useRef<SVGPathElement>(null);
  const flapGroupRef = useRef<SVGGElement>(null);
  const cylinderPathRef = useRef<SVGPathElement>(null);
  const cylinderGradRef = useRef<SVGLinearGradientElement>(null);
  const shadowPathRef = useRef<SVGPathElement>(null);

  const updateStickerPeel = useCallback((t: number) => {
    const data = calculateCCPageTurn(t);

    if (imgClipPathRef.current) {
      imgClipPathRef.current.setAttribute('d', data.unpeeledPath);
    }

    if (flapClipPathRef.current) {
      flapClipPathRef.current.setAttribute('d', data.peeledPath);
    }

    if (flapGroupRef.current) {
      if (data.hasFlap) {
        const m = data.matrix;
        flapGroupRef.current.setAttribute(
          'transform',
          `matrix(${m.a.toFixed(4)}, ${m.b.toFixed(4)}, ${m.c.toFixed(4)}, ${m.d.toFixed(4)}, ${m.e.toFixed(2)}, ${m.f.toFixed(2)})`
        );
        flapGroupRef.current.style.opacity = '1';
      } else {
        flapGroupRef.current.style.opacity = '0';
      }
    }

    if (cylinderPathRef.current) {
      if (data.hasCylinder && data.cylinderPath) {
        cylinderPathRef.current.setAttribute('d', data.cylinderPath);
        cylinderPathRef.current.style.opacity = '1';
      } else {
        cylinderPathRef.current.style.opacity = '0';
      }
    }

    if (cylinderGradRef.current && data.hasCylinder) {
      cylinderGradRef.current.setAttribute('x1', data.cylinderGrad.x1.toFixed(1));
      cylinderGradRef.current.setAttribute('y1', data.cylinderGrad.y1.toFixed(1));
      cylinderGradRef.current.setAttribute('x2', data.cylinderGrad.x2.toFixed(1));
      cylinderGradRef.current.setAttribute('y2', data.cylinderGrad.y2.toFixed(1));
    }

    if (shadowPathRef.current) {
      if (data.hasCylinder && data.shadowPath) {
        shadowPathRef.current.setAttribute('d', data.shadowPath);
        shadowPathRef.current.style.opacity = '0.75';
      } else {
        shadowPathRef.current.style.opacity = '0';
      }
    }
  }, []);

  useLayoutEffect(() => {
    const { gsap, ScrollTrigger } = ensureGsapRegistered();
    const ctx = gsap.context(() => {
      if (!sectionRef.current) return;

      // Initial resting state: 0 (100% attached pristine silhouette cutout)
      updateStickerPeel(0);

      const prefersReduced =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Ismail-style CC Page Turn Sticker Peel (Top-to-Bottom Sweep -> 3D Lift-Off + Dry Scroll-Only Peel SFX)
      if (!prefersReduced && stickerWrapperRef.current) {
        let lastScroll = typeof window !== 'undefined' ? window.scrollY : 0;
        let lastTime = performance.now();
        let hasUserScrolled = false;

        ScrollTrigger.create({
          trigger: stickerWrapperRef.current,
          start: 'top 45%',
          end: 'bottom -10%',
          scrub: 0.8,
          invalidateOnRefresh: true,
          onRefresh: (self) => {
            lastScroll = self.scroll();
            lastTime = performance.now();
            vicalarySound.stopScrollPeel();
          },
          onUpdate: (self) => {
            const now = performance.now();
            const scroll = self.scroll();
            const rawDelta = Math.abs(scroll - lastScroll);
            const dtSec = Math.max(0.008, (now - lastTime) / 1000);
            const velocityPxPerSec = rawDelta / dtSec;

            if (rawDelta >= 1.5) {
              hasUserScrolled = true;
            }
            lastScroll = scroll;
            lastTime = now;

            const p = self.progress;
            if (p <= 0.08) {
              vicalarySound.stopScrollPeel();
              updateStickerPeel(0);
              if (stickerSvgRef.current) {
                stickerSvgRef.current.style.transform =
                  'perspective(1000px) translate3d(0, 0, 0)';
                stickerSvgRef.current.style.opacity = '1';
              }
            } else if (p < 0.74) {
              const peelT = (p - 0.08) / 0.66;
              updateStickerPeel(peelT);
              if (stickerSvgRef.current) {
                stickerSvgRef.current.style.transform =
                  'perspective(1000px) translate3d(0, 0, 0)';
                stickerSvgRef.current.style.opacity = '1';
              }

              if (hasUserScrolled) {
                vicalarySound.updateScrollPeel(true, velocityPxPerSec, peelT, self.direction >= 0);
              }
            } else {
              vicalarySound.stopScrollPeel();
              updateStickerPeel(1);
              if (stickerSvgRef.current) {
                const liftP = (p - 0.74) / 0.26;
                const transX = liftP * 65;
                const transY = -liftP * 340;
                const transZ = liftP * 50;
                const rotZ = -liftP * 14;
                const rotX = -liftP * 12;
                const rotY = liftP * 8;
                const opacity = Math.max(0, 1 - Math.pow(liftP, 1.4));

                stickerSvgRef.current.style.transform = `perspective(1000px) translate3d(${transX.toFixed(1)}px, ${transY.toFixed(1)}px, ${transZ.toFixed(1)}px) rotateZ(${rotZ.toFixed(1)}deg) rotateX(${rotX.toFixed(1)}deg) rotateY(${rotY.toFixed(1)}deg)`;
                stickerSvgRef.current.style.opacity = `${opacity.toFixed(2)}`;
              }
            }
          },
          onLeave: () => {
            vicalarySound.stopScrollPeel();
          },
          onLeaveBack: () => {
            vicalarySound.stopScrollPeel();
            updateStickerPeel(0);
            if (stickerSvgRef.current) {
              stickerSvgRef.current.style.transform =
                'perspective(1000px) translate3d(0, 0, 0)';
              stickerSvgRef.current.style.opacity = '1';
            }
          },
        });
      }

      // Headline staggered character rise
      const chars = gsap.utils.toArray<HTMLElement>('.stick-headline .char');
      gsap.fromTo(
        chars,
        { yPercent: 115 },
        {
          yPercent: 0,
          duration: 0.65,
          stagger: 0.025,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.stick-card',
            start: 'top 82%',
            toggleActions: 'play none none reverse',
            invalidateOnRefresh: true,
          },
        }
      );

      // Word-by-word body-rise subcopy
      const words = gsap.utils.toArray<HTMLElement>('.stick-sub .body-rise');
      gsap.fromTo(
        words,
        { yPercent: 115 },
        {
          yPercent: 0,
          duration: 0.55,
          stagger: 0.06,
          delay: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.stick-card',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
            invalidateOnRefresh: true,
          },
        }
      );
    }, sectionRef);

    return () => {
      vicalarySound.stopScrollPeel();
      ctx.revert();
    };
  }, [updateStickerPeel]);

  return (
    <section
      ref={sectionRef}
      style={{ paddingBottom: 'calc(var(--curve-depth) + 3.5rem)' }}
      className="make-it-stick relative bg-[#A6EB67] pt-14 sm:pt-20 lg:pt-24 px-5 sm:px-10 overflow-x-clip -mt-px"
    >
      <div className="mx-auto max-w-6xl relative">
        <div className="stick-row relative grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center">
          {/* Left: Pure Die-Cut Photographic Silhouette Sticker with CC Page Turn Peel (NO Box / NO Frame) */}
          <div className="md:col-span-6 flex justify-center">
            <div
              ref={stickerWrapperRef}
              role="img"
              aria-label="Smiling woman holding fresh vegetable bowl for VICALARY daily nutrition"
              className="stick-shot relative w-full max-w-[320px] sm:max-w-[400px] lg:max-w-[480px] aspect-square flex items-center justify-center select-none"
            >
              <svg
                ref={stickerSvgRef}
                viewBox={`0 0 ${STICKER_VB_W} ${STICKER_VB_H}`}
                shapeRendering="geometricPrecision"
                className="w-full h-full overflow-visible will-change-transform"
                style={{ filter: 'drop-shadow(0 20px 30px rgba(13, 47, 79, 0.45))' }}
              >
                <defs>
                  {/* Silhouette alpha mask ensuring zero bleed outside cutout */}
                  <filter id="stick-alpha-to-white">
                    <feColorMatrix
                      type="matrix"
                      values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0"
                    />
                  </filter>

                  <mask
                    id="stick-silhouette-mask"
                    maskUnits="userSpaceOnUse"
                    x="0"
                    y="0"
                    width={STICKER_VB_W}
                    height={STICKER_VB_H}
                  >
                    <image
                      href={IMAGES.hijabBowlSticker}
                      crossOrigin="anonymous"
                      x="0"
                      y="0"
                      width={STICKER_VB_W}
                      height={STICKER_VB_H}
                      preserveAspectRatio="xMidYMid meet"
                      filter="url(#stick-alpha-to-white)"
                    />
                  </mask>

                  {/* Soft blur for contact drop shadow under curled fold */}
                  <filter id="cp-blur-stick" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="6" />
                  </filter>

                  {/* Cream cotton paper sticker adhesive backing gradient */}
                  <linearGradient id="stick-paper-back" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="25%" stopColor="#FAF8F5" />
                    <stop offset="60%" stopColor="#EDE6D6" />
                    <stop offset="100%" stopColor="#DDD3BF" />
                  </linearGradient>

                  {/* 3D cylindrical roll highlight gradient along peel normal */}
                  <linearGradient
                    id="stick-cylinder-grad"
                    gradientUnits="userSpaceOnUse"
                    x1="0"
                    y1="0"
                    x2="100"
                    y2="100"
                    ref={cylinderGradRef}
                  >
                    <stop offset="0%" stopColor="#25211E" stopOpacity="0.8" />
                    <stop offset="25%" stopColor="#A89E8D" stopOpacity="0.85" />
                    <stop offset="48%" stopColor="#FFFFFF" stopOpacity="0.95" />
                    <stop offset="72%" stopColor="#FAF8F5" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#FAF8F5" stopOpacity="0" />
                  </linearGradient>

                  {/* Unpeeled base clip path */}
                  <clipPath id="cp-img-clip-stick">
                    <path
                      ref={imgClipPathRef}
                      d={`M0,0 L${STICKER_VB_W},0 L${STICKER_VB_W},${STICKER_VB_H} L0,${STICKER_VB_H} Z`}
                    />
                  </clipPath>

                  {/* Peeled flap clip path (local coords) */}
                  <clipPath id="cp-peeled-clip-stick">
                    <path ref={flapClipPathRef} d="" />
                  </clipPath>
                </defs>

                {/* 1. Pure Cutout Silhouette Photo Sticker */}
                <image
                  href={IMAGES.hijabBowlSticker}
                  crossOrigin="anonymous"
                  x="0"
                  y="0"
                  width={STICKER_VB_W}
                  height={STICKER_VB_H}
                  preserveAspectRatio="xMidYMid meet"
                  clipPath="url(#cp-img-clip-stick)"
                />

                {/* 2. Soft Contact Drop Shadow under roll (clipped to unpeeled base & silhouette) */}
                <g clipPath="url(#cp-img-clip-stick)" mask="url(#stick-silhouette-mask)">
                  <path
                    ref={shadowPathRef}
                    fill="rgba(0,0,0,0.65)"
                    filter="url(#cp-blur-stick)"
                    style={{ opacity: 0 }}
                  />
                </g>

                {/* 3. Reflected Flap — Back of sticker with cream adhesive paper */}
                <g
                  ref={flapGroupRef}
                  clipPath="url(#cp-peeled-clip-stick)"
                  mask="url(#stick-silhouette-mask)"
                  style={{ opacity: 0, willChange: 'transform' }}
                >
                  <rect
                    x="0"
                    y="0"
                    width={STICKER_VB_W}
                    height={STICKER_VB_H}
                    fill="url(#stick-paper-back)"
                    stroke="#DDD4C4"
                    strokeWidth="1"
                  />
                </g>

                {/* 4. 3D Cylindrical Roll Specular Highlight & Crease Strip */}
                <g mask="url(#stick-silhouette-mask)">
                  <path
                    ref={cylinderPathRef}
                    fill="url(#stick-cylinder-grad)"
                    style={{ opacity: 0 }}
                  />
                </g>
              </svg>
            </div>
          </div>

          {/* Right Dark Navy Bold Card */}
          <div className="stick-card md:col-span-6 relative flex flex-col justify-between bg-[#0D2F4F] text-[#A6EB67] rounded-[2.25rem] sm:rounded-[3rem] lg:rounded-[3.5rem] p-8 sm:p-10 lg:p-16 shadow-2xl border-2 border-[#0D2F4F]/20">
            {/* Scroll-peeling strip across the seam (top seam on mobile, side seam on tablet/desktop) */}
            <ScrollPeelTape
              mode="scroll"
              color="#D9F7C4"
              backColor="#A6EB67"
              rotate={0}
              fromRatio={0.36}
              className="stick-tape md:hidden absolute -top-5 left-1/2 -translate-x-1/2 z-20"
            />
            <ScrollPeelTape
              mode="scroll"
              color="#D9F7C4"
              backColor="#A6EB67"
              rotate={90}
              fromRatio={0.36}
              className="stick-tape hidden md:block absolute -left-14 lg:-left-16 top-1/2 -translate-y-1/2 z-20 md:scale-110 lg:scale-125"
            />

            <div className="text-center md:text-left">
              <h2
                aria-label="START YOUR JOURNEY!"
                className="stick-headline font-display font-black uppercase leading-[0.84] tracking-[-0.02em]"
                style={{ fontSize: 'clamp(3.25rem, 6.8vw, 6rem)' }}
              >
                <SplitChars text="START" engine="gsap" />
                <br />
                <SplitChars text="YOUR" engine="gsap" />
                <br />
                <SplitChars text="JOURNEY!" engine="gsap" />
              </h2>

              <p className="stick-sub mt-5 sm:mt-6 text-base sm:text-lg lg:text-xl font-semibold text-[#D9F7C4]">
                <SplitWords text="For body, budget & soul." />
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <button
                type="button"
                onClick={() => {
                  vicalarySound.playTapePeel();
                  onNavigate('/products');
                }}
                className="group inline-flex items-center gap-2.5 rounded-full bg-[#A6EB67] px-7 py-3.5 text-sm font-black tracking-[0.12em] text-[#0D2F4F] transition-transform duration-200 hover:scale-105 cursor-pointer"
              >
                <span>OUR MODULES</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  vicalarySound.playRollClick();
                  onNavigate('/contact');
                }}
                className="inline-flex items-center gap-2 rounded-full border-2 border-[#D9F7C4] px-6 py-3 text-sm font-black tracking-[0.12em] text-[#D9F7C4] transition-colors hover:bg-[#D9F7C4] hover:text-[#0D2F4F] cursor-pointer"
              >
                <span>SAY HELLO</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
