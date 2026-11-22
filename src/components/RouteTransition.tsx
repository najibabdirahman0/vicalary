import React, { useLayoutEffect, useRef } from 'react';
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
      const tl = gsap.timeline({
        onComplete: fireDone,
      });

      // 1. Curved arc-cut color sheets sweep up from below to cover viewport
      tl.fromTo(
        '.route-layer-back',
        { yPercent: 118 },
        { yPercent: 0, duration: 0.36, ease: 'power3.inOut' }
      )
        .fromTo(
          '.route-layer-main',
          { yPercent: 122 },
          { yPercent: 0, duration: 0.4, ease: 'power3.inOut' },
          '-=0.28'
        )
        .fromTo(
          '.route-mark-wrap',
          { scale: 0.72, rotate: -24, opacity: 0 },
          { scale: 1, rotate: 0, opacity: 1, duration: 0.28, ease: 'back.out(1.6)' },
          '-=0.14'
        )
        // 2. Swap underlying page + reset scroll while 100% covered
        .call(fireCovered)
        .to({}, { duration: 0.08 })
        // 3. Peel upward off-screen just like Preloader to reveal new section
        .to('.route-layer-main', {
          yPercent: -120,
          duration: 0.46,
          ease: 'power3.inOut',
        })
        .to(
          '.route-layer-back',
          {
            yPercent: -120,
            duration: 0.46,
            ease: 'power3.inOut',
          },
          '-=0.38'
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
      {/* Trailing accent arc-cut layer */}
      <div
        style={{ backgroundColor: config.accent, zIndex: 1 }}
        className="route-layer-back arc-cut-curtain absolute -top-12 left-[-4vw] right-[-4vw] -bottom-24 shadow-[0_24px_48px_rgba(0,0,0,0.16)] will-change-transform"
      />

      {/* Primary colored arc-cut curtain sheet */}
      <div
        style={{ backgroundColor: config.bg, color: config.ink, zIndex: 2 }}
        className="route-layer-main arc-cut-curtain paper-grain absolute -top-12 left-[-4vw] right-[-4vw] -bottom-24 flex flex-col items-center justify-center shadow-[0_24px_48px_rgba(13,47,79,0.22)] will-change-transform"
      >
        <div className="route-mark-wrap flex flex-col items-center gap-3.5 px-6 text-center">
          <VicalaryMark className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-md" />
          <span className="font-display text-2xl sm:text-4xl font-black uppercase tracking-[0.1em]">
            {config.label}
          </span>
        </div>
      </div>
    </div>
  );
}
