import React, { useLayoutEffect, useRef } from 'react';
import { PRELOADER_LAYERS } from '../data/tapes';
import { ensureGsapRegistered } from '../utils/gsapSetup';
import { VicalaryMark } from './TapeVisuals';

interface PreloaderProps {
  onRevealStart?: () => void;
  onDone: () => void;
}

export function Preloader({ onRevealStart, onDone }: PreloaderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const revealFiredRef = useRef(false);
  const doneFiredRef = useRef(false);

  useLayoutEffect(() => {
    const { gsap, ScrollTrigger } = ensureGsapRegistered();
    document.documentElement.setAttribute('data-loading', 'true');

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const finishReveal = () => {
      if (!revealFiredRef.current) {
        revealFiredRef.current = true;
        onRevealStart?.();
      }
    };

    const finishAll = () => {
      if (!doneFiredRef.current) {
        doneFiredRef.current = true;
        document.documentElement.removeAttribute('data-loading');
        ScrollTrigger.refresh();
        onDone();
      }
    };

    if (prefersReduced) {
      const timer = window.setTimeout(() => {
        finishReveal();
        finishAll();
      }, 150);
      return () => {
        window.clearTimeout(timer);
        document.documentElement.removeAttribute('data-loading');
      };
    }

    const ctx = gsap.context(() => {
      const layers = gsap.utils.toArray<HTMLElement>('.preloader-layer');
      // Sort top-to-bottom by CSS z-index (z=6 stationery first down to z=1 cloth last)
      const orderedLayers = [...layers].sort(
        (a, b) => Number(b.style.zIndex || 0) - Number(a.style.zIndex || 0)
      );

      const tl = gsap.timeline({
        onComplete: finishAll,
      });

      // 1. Sticker mark pops in & settles on cream top sheet
      tl.fromTo(
        '.preloader-mark',
        { scale: 0.55, rotate: -32, opacity: 0, y: 24 },
        {
          scale: 1,
          rotate: 0,
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: 'back.out(1.7)',
        }
      )
        .fromTo(
          '.preloader-tagline',
          { yPercent: 115, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.4, ease: 'power3.out' },
          '-=0.25'
        )
        // Quick roll spin of the mark before peeling away
        .to('.preloader-mark-svg', {
          rotate: 360,
          duration: 0.55,
          ease: 'power2.inOut',
        })
        // 2. Cream sheet (z:7) sweeps up with arc-cut skirt
        .to(
          '.preloader-sheet',
          {
            yPercent: -118,
            duration: 0.65,
            ease: 'power3.inOut',
          },
          '-=0.12'
        )
        // 3. Staggered 6-tape color arc-cut layers peel upward one by one
        .to(
          orderedLayers,
          {
            yPercent: -118,
            duration: 0.62,
            stagger: 0.085,
            ease: 'power3.inOut',
          },
          '-=0.52'
        )
        // Trigger hero reveal + menu tab drop-in right as the final cloth layer clears
        .call(finishReveal, undefined, '-=0.32');
    }, rootRef);

    return () => {
      ctx.revert();
      document.documentElement.removeAttribute('data-loading');
    };
  }, [onDone, onRevealStart]);

  return (
    <div
      ref={rootRef}
      className="site-preloader fixed inset-0 z-50 pointer-events-auto overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 6 layered arc-cut color sheets matching the 6 tapes (z: 6 down to 1) */}
      {PRELOADER_LAYERS.map((layer) => (
        <div
          key={layer.id}
          data-tape={layer.id}
          style={{ backgroundColor: layer.bg, zIndex: layer.z }}
          className="preloader-layer arc-cut-curtain absolute -top-12 left-[-4vw] right-[-4vw] -bottom-24 shadow-[0_24px_48px_rgba(0,0,0,0.16)] will-change-transform"
        />
      ))}

      {/* Top cream paper sheet with VICALARY sticker mark (z: 7) */}
      <div
        style={{ zIndex: 7 }}
        className="preloader-sheet arc-cut-curtain absolute -top-12 left-[-4vw] right-[-4vw] -bottom-24 flex flex-col items-center justify-center bg-[#FDFCFB] paper-grain shadow-[0_24px_48px_rgba(13,47,79,0.18)] will-change-transform"
      >
        <div className="preloader-mark flex flex-col items-center gap-4 pt-12">
          <div className="relative">
            {/* Subtle peel-back mint shadow */}
            <div
              className="absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-full bg-[#A6EB67]/55 blur-[1px]"
              aria-hidden="true"
            />
            <div className="preloader-mark-svg relative">
              <VicalaryMark className="w-24 h-24 sm:w-28 sm:h-28 drop-shadow-md" />
            </div>
          </div>

          <div className="overflow-hidden">
            <span className="preloader-tagline inline-block font-display text-2xl sm:text-3xl font-black tracking-[0.14em] text-[#0D2F4F]">
              VICALARY
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
