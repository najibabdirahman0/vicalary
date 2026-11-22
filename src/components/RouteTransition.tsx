import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { PRELOADER_LAYERS } from '../data/tapes';
import { ensureGsapRegistered } from '../utils/gsapSetup';
import { VicalaryMark } from './TapeVisuals';

export interface RouteTransitionConfig {
  id: number;
  bg: string;
  accent: string;
  ink: string;
  label: string;
}

export const ROUTE_TRANSITION_COLORS: Array<Omit<RouteTransitionConfig, 'id' | 'label'>> = [
  { bg: '#A6EB67', accent: '#D9F7C4', ink: '#0D2F4F' },
  { bg: '#F1CA9E', accent: '#FFF3DF', ink: '#0D2F4F' },
  { bg: '#CBE8FF', accent: '#EBF6FF', ink: '#0D2F4F' },
  { bg: '#FFD6DF', accent: '#FFF0F3', ink: '#0D2F4F' },
  { bg: '#E4DFFF', accent: '#F4F1FF', ink: '#0D2F4F' },
  { bg: '#0D2F4F', accent: '#A6EB67', ink: '#FDFCFB' },
  { bg: '#D9F7C4', accent: '#0B3C7C', ink: '#0D2F4F' },
  { bg: '#0B3C7C', accent: '#F1CA9E', ink: '#D9F7C4' },
];

interface RouteTransitionProps {
  config: RouteTransitionConfig;
  onCovered: () => void;
  onDone: () => void;
}

export function RouteTransition({ config, onCovered, onDone }: RouteTransitionProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const coveredFiredRef = useRef(false);
  const doneFiredRef = useRef(false);

  // Build the 6-layer multi-color stack rotated per transition so every click has a fresh color order
  const stackedLayers = useMemo(() => {
    const baseColors = PRELOADER_LAYERS.map((l) => l.bg);
    const rotated = baseColors.map((_, i) => baseColors[(i + config.id) % baseColors.length]);
    return rotated.map((bg, idx) => ({
      id: `rt-layer-${config.id}-${idx}`,
      bg: bg === config.bg ? config.accent : bg,
      z: PRELOADER_LAYERS.length - idx, // 6 down to 1
    }));
  }, [config.accent, config.bg, config.id]);

  useLayoutEffect(() => {
    const { gsap, ScrollTrigger } = ensureGsapRegistered();

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const fireCovered = () => {
      if (!coveredFiredRef.current) {
        coveredFiredRef.current = true;
        onCovered();
      }
    };

    const fireDone = () => {
      if (!doneFiredRef.current) {
        doneFiredRef.current = true;
        ScrollTrigger.refresh();
        onDone();
      }
    };

    if (prefersReduced) {
      fireCovered();
      const t = window.setTimeout(fireDone, 40);
      return () => window.clearTimeout(t);
    }

    const ctx = gsap.context(() => {
      const layers = gsap.utils.toArray<HTMLElement>('.route-layer');
      // Peel order top-to-bottom by CSS z-index (z=6 down to z=1), exact Preloader behavior
      const orderedDown = [...layers].sort(
        (a, b) => Number(b.style.zIndex || 0) - Number(a.style.zIndex || 0)
      );
      // Enter order bottom-to-top so stack builds cleanly from z=1 to z=6
      const orderedUp = [...orderedDown].reverse();

      const tl = gsap.timeline({
        onComplete: fireDone,
      });

      // 1. Multi-color stacked layers sweep up from bottom to build the stack
      tl.fromTo(
        orderedUp,
        { yPercent: 120 },
        {
          yPercent: 0,
          duration: 0.36,
          stagger: 0.032,
          ease: 'power3.inOut',
        }
      )
        .fromTo(
          '.route-sheet',
          { yPercent: 122 },
          { yPercent: 0, duration: 0.4, ease: 'power3.inOut' },
          '-=0.22'
        )
        .fromTo(
          '.route-mark',
          { scale: 0.58, rotate: -28, opacity: 0, y: 18 },
          { scale: 1, rotate: 0, opacity: 1, y: 0, duration: 0.34, ease: 'back.out(1.7)' },
          '-=0.14'
        )
        // Swap underlying route & reset scroll silently while covered
        .call(fireCovered)
        .to('.route-mark-svg', {
          rotate: 360,
          duration: 0.42,
          ease: 'power2.inOut',
        })
        // 2. Top sheet peels up first, then all 6 multi-color layers peel in staggered cascade (exact Preloader finish)
        .to(
          '.route-sheet',
          {
            yPercent: -118,
            duration: 0.52,
            ease: 'power3.inOut',
          },
          '-=0.08'
        )
        .to(
          orderedDown,
          {
            yPercent: -118,
            duration: 0.52,
            stagger: 0.072,
            ease: 'power3.inOut',
          },
          '-=0.42'
        );
    }, rootRef);

    return () => {
      ctx.revert();
    };
  }, [config.id, onCovered, onDone]);

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-50 pointer-events-auto overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 6 stacked arc-cut color sheets (z: 6 down to 1) mirroring Preloader */}
      {stackedLayers.map((layer) => (
        <div
          key={layer.id}
          style={{ backgroundColor: layer.bg, zIndex: layer.z }}
          className="route-layer arc-cut-curtain absolute -top-12 left-[-4vw] right-[-4vw] -bottom-24 shadow-[0_24px_48px_rgba(0,0,0,0.16)] will-change-transform"
        />
      ))}

      {/* Top colored sheet (z: 7) with VICALARY crest & destination label */}
      <div
        style={{ backgroundColor: config.bg, color: config.ink, zIndex: 7 }}
        className="route-sheet arc-cut-curtain paper-grain absolute -top-12 left-[-4vw] right-[-4vw] -bottom-24 flex flex-col items-center justify-center shadow-[0_24px_48px_rgba(13,47,79,0.2)] will-change-transform"
      >
        <div className="route-mark flex flex-col items-center gap-3.5 px-6 text-center pt-10">
          <div className="route-mark-svg">
            <VicalaryMark className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-md" />
          </div>
          <span className="font-display text-2xl sm:text-4xl font-black uppercase tracking-[0.12em]">
            {config.label}
          </span>
        </div>
      </div>
    </div>
  );
}
