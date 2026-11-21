import React, { useLayoutEffect, useRef } from 'react';
import { IMAGES, TapeId } from '../data/tapes';
import { ensureGsapRegistered } from '../utils/gsapSetup';
import { TapeRollGraphic } from './TapeVisuals';
import { ScrollPeelTape, SplitChars } from './MotionPrimitives';

interface Chapter {
  index: string;
  verb: string;
  image: string;
  imageAlt: string;
  slotBadge: string;
  secondaryImage: string;
  secondaryAlt: string;
  storyCaption: string;
  moduleTag: string;
  tapeColor: string;
  tapeBack: string;
  noteLines: string[];
  accentTapeId: TapeId;
  tilt: number;
  flowClass: string;
  rowOffsetClass: string;
  notePosClass: string;
}

const CHAPTERS: Chapter[] = [
  {
    index: '01',
    verb: 'SCAN',
    image: IMAGES.grilledChicken,
    imageAlt: 'Plated grilled chicken meal scanned with VICALARY Meal Camera',
    slotBadge: 'PLATE → MACROS',
    secondaryImage: IMAGES.foodAllergies,
    secondaryAlt: 'Verified food allergen and ingredient check',
    storyCaption: 'ALLERGY & BARCODE TRUTH',
    moduleTag: 'MEAL CAMERA',
    tapeColor: '#F1CA9E',
    tapeBack: '#dfb17e',
    noteLines: ['every balanced', 'meal starts', 'in clear view.'],
    accentTapeId: 'camera',
    tilt: 3.2,
    flowClass: 'down-to-horizontal',
    rowOffsetClass: 'md:translate-y-4',
    notePosClass: 'lg:absolute lg:-bottom-12 lg:left-[24%]',
  },
  {
    index: '02',
    verb: 'PLAN',
    image: IMAGES.preparationTime,
    imageAlt: 'Home kitchen preparation matched to 7-day VICALARY meal plans',
    slotBadge: '7-DAY COOKBOOK',
    secondaryImage: IMAGES.weeklyBudget,
    secondaryAlt: 'Smart 30-day food budget and ledger planning in VICALARY',
    storyCaption: '30-DAY DAILY ALLOWANCE',
    moduleTag: 'FOOD BUDGET',
    tapeColor: '#0D2F4F',
    tapeBack: '#1B4973',
    noteLines: ['the daily plan', 'that honors', 'budget & health.'],
    accentTapeId: 'budget',
    tilt: -5.2,
    flowClass: 'diagdown-to-horizontal',
    rowOffsetClass: 'lg:translate-y-10',
    notePosClass: 'lg:absolute lg:-top-14 lg:left-[22%]',
  },
  {
    index: '03',
    verb: 'THRIVE',
    image: IMAGES.activityLevel,
    imageAlt: 'Active outdoor runner supported by VICALARY Health Coach',
    slotBadge: 'ACTIVE BODY',
    secondaryImage: IMAGES.calmRest,
    secondaryAlt: 'Peaceful evening rest and prayer-anchored wellness in VICALARY',
    storyCaption: 'EVENING CALM & PRAYER',
    moduleTag: 'FAITH & CALM',
    tapeColor: '#FFFFFF',
    tapeBack: '#DCEBF7',
    noteLines: ['body nourished,', 'prayer anchored,', 'arriving whole.'],
    accentTapeId: 'spiritual',
    tilt: 4.4,
    flowClass: 'diagup-to-horizontal',
    rowOffsetClass: 'lg:-translate-y-2',
    notePosClass: 'lg:absolute lg:-bottom-12 lg:left-[26%]',
  },
];

export function GiantPinning() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinViewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const { gsap, ScrollTrigger } = ensureGsapRegistered();
    const mm = gsap.matchMedia();

    const ctx = gsap.context(() => {
      // 1. Intro Header SplitChars reveal
      const introChars = gsap.utils.toArray<HTMLElement>('.giant-intro .char');
      if (introChars.length > 0 && pinViewportRef.current) {
        gsap.fromTo(
          introChars,
          { yPercent: 120 },
          {
            yPercent: 0,
            duration: 0.65,
            stagger: 0.018,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: pinViewportRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
              invalidateOnRefresh: true,
            },
          }
        );
      }

      // 2. Unified Pinned Horizontal Scrub Across Mobile, Tablet, and Desktop
      const buildHorizontalTimeline = (opts: {
        endMultiplier: number;
        minEndPx: number;
        trailPad: number;
        yDrift: number;
      }) => {
        const viewport = pinViewportRef.current;
        const canvas = canvasRef.current;
        if (!viewport || !canvas) return;

        const getTravel = () => Math.max(0, canvas.scrollWidth - viewport.clientWidth + opts.trailPad);

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: viewport,
            start: 'top top',
            end: () => `+=${Math.max(opts.minEndPx, getTravel() * opts.endMultiplier)}`,
            pin: true,
            scrub: 0.85,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        tl.fromTo(
          canvas,
          { x: 0, y: 0 },
          { x: () => -getTravel(), y: opts.yDrift, ease: 'none', duration: 1 },
          0
        );

        const rows = gsap.utils.toArray<HTMLElement>('.giant-row');
        rows.forEach((row, idx) => {
          const sliceStart = 0.14 + idx * 0.27;
          const rowChars = row.querySelectorAll<HTMLElement>('.char');
          const peelFace = row.querySelector<HTMLElement>('.peel-face');
          const peelFlap = row.querySelector<HTMLElement>('.peel-flap');
          const propFloat = row.querySelector<HTMLElement>('.giant-prop-float');
          const shotFloat = row.querySelector<HTMLElement>('.giant-prop-shot');
          const noteEl = row.querySelector<HTMLElement>('.giant-note');

          if (rowChars.length > 0) {
            tl.fromTo(
              rowChars,
              { yPercent: 110 },
              { yPercent: 0, duration: 0.14, stagger: 0.012, ease: 'power3.out' },
              sliceStart - 0.08
            );
          }

          if (peelFace && peelFlap) {
            tl.fromTo(
              peelFace,
              { scaleX: 0.38, opacity: 0.78 },
              { scaleX: 1, opacity: 0.94, duration: 0.22, ease: 'power2.out' },
              sliceStart
            ).fromTo(
              peelFlap,
              { scaleX: 1.4, opacity: 0.95 },
              { scaleX: 0.35, opacity: 0.25, duration: 0.22, ease: 'power2.out' },
              sliceStart
            );
          }

          if (propFloat) {
            tl.fromTo(
              propFloat,
              { x: 18, rotate: -8 },
              { x: -12, rotate: 8, duration: 0.4, ease: 'none' },
              sliceStart
            );
          }

          if (shotFloat) {
            tl.fromTo(
              shotFloat,
              { y: 14, rotate: -6 },
              { y: -10, rotate: -2, duration: 0.4, ease: 'none' },
              sliceStart
            );
          }

          if (noteEl) {
            tl.fromTo(
              noteEl,
              { y: 20, rotate: -5, opacity: 0.6 },
              { y: 0, rotate: -2, opacity: 1, duration: 0.22, ease: 'power2.out' },
              sliceStart
            );
          }
        });

        const arrows = gsap.utils.toArray<SVGPathElement>('.giant-connector path');
        arrows.forEach((pathEl, idx) => {
          const len = pathEl.getTotalLength();
          gsap.set(pathEl, { strokeDasharray: len, strokeDashoffset: len });
          const startAt = idx < 2 ? 0.32 : 0.62;
          tl.to(
            pathEl,
            {
              strokeDashoffset: 0,
              duration: 0.14,
              ease: 'power2.out',
            },
            startAt
          );
        });
      };

      mm.add('(min-width: 1024px)', () => {
        buildHorizontalTimeline({
          endMultiplier: 1.25,
          minEndPx: 2200,
          trailPad: 120,
          yDrift: -16,
        });
      });

      mm.add('(min-width: 768px) and (max-width: 1023px)', () => {
        buildHorizontalTimeline({
          endMultiplier: 1.3,
          minEndPx: 1900,
          trailPad: 80,
          yDrift: -10,
        });
      });

      mm.add('(max-width: 767px)', () => {
        buildHorizontalTimeline({
          endMultiplier: 1.35,
          minEndPx: 1650,
          trailPad: 48,
          yDrift: -6,
        });
      });

      ScrollTrigger.refresh();
    }, sectionRef);

    return () => {
      mm.revert();
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        ['--arc-h' as string]: 'var(--curve-depth)',
        marginTop: 'calc(var(--curve-depth) * -1)',
        paddingTop: 'calc(var(--curve-depth) * 0.5)',
      }}
      className="giant-pinning arc-bite-top relative z-10 bg-gradient-to-b from-[#D9F7C4] via-[#B8F088] to-[#A6EB67] text-[#0D2F4F] overflow-x-clip pb-8 md:pb-16"
    >
      <div
        ref={pinViewportRef}
        className="giant-canvas-viewport relative h-[100dvh] min-h-[540px] flex items-center overflow-hidden px-5 sm:px-8 lg:px-10"
      >
        <div
          ref={canvasRef}
          className="flex flex-row items-center w-max gap-8 sm:gap-10 md:gap-12 lg:gap-16 pr-12 sm:pr-20 lg:pr-28 will-change-transform"
        >
          {/* Centered Opening Header Panel inside the Pinned Canvas */}
          <div className="giant-intro flex flex-col items-center justify-center text-center min-w-[88vw] sm:min-w-[84vw] lg:min-w-[80vw]">
            <span className="inline-block -rotate-2 bg-[#0D2F4F] text-[#D9F7C4] px-3.5 sm:px-4 py-1.5 text-[11px] sm:text-sm font-black tracking-[0.18em] uppercase mb-4 sm:mb-5 shadow-md">
              WHY WE EXIST
            </span>
            <h2
              aria-label="WE'RE HERE FOR THE EVERYDAY ROUTINES."
              className="font-display font-black uppercase text-[#0D2F4F] leading-[0.82] tracking-[-0.02em]"
              style={{ fontSize: 'clamp(3.1rem, 11vw, 7.75rem)' }}
            >
              <SplitChars text="WE'RE HERE" engine="gsap" />
              <br />
              <SplitChars text="FOR THE EVERYDAY" engine="gsap" />
              <br />
              <SplitChars text="ROUTINES." engine="gsap" />
            </h2>
          </div>

          {/* 3 Story-Driven Chapters: every photo carries a clear routine caption & essence */}
          {CHAPTERS.map((chapter, idx) => (
            <React.Fragment key={chapter.index}>
              <div
                className={`giant-row ${chapter.flowClass} ${chapter.rowOffsetClass} relative flex flex-col lg:flex-row items-start lg:items-center gap-4 sm:gap-6 lg:gap-8 min-w-[88vw] sm:min-w-[82vw] lg:min-w-[76vw] max-w-[92vw] lg:max-w-none py-4 lg:py-16`}
              >
                {/* Giant Typography Phrase with captioned inline card */}
                <div className="relative z-10 flex flex-wrap items-center gap-2.5 sm:gap-4 lg:gap-5">
                  <span className="font-display text-2xl sm:text-4xl lg:text-5xl font-black text-[#0B3C7C] tabular-nums self-start mt-1 sm:mt-2">
                    {chapter.index}
                  </span>

                  <span
                    className="font-display font-black uppercase text-[#0D2F4F] leading-[0.8] tracking-[-0.02em]"
                    style={{ fontSize: 'clamp(3.25rem, 11vw, 9.5rem)' }}
                  >
                    <SplitChars text="TO" engine="gsap" />
                  </span>

                  {/* Inline tilted story photo card */}
                  <div
                    className="giant-slot relative w-24 sm:w-36 lg:w-52 bg-white p-1.5 sm:p-2 pb-2 sm:pb-2.5 rounded-xl sm:rounded-2xl shadow-2xl border-2 border-[#0D2F4F]/15 shrink-0 transition-transform duration-300 hover:scale-105"
                    style={{ transform: `rotate(${chapter.tilt}deg)` }}
                  >
                    <ScrollPeelTape
                      mode="manual"
                      color={chapter.tapeColor}
                      backColor={chapter.tapeBack}
                      rotate={-4}
                      className="absolute -top-3.5 sm:-top-4 left-1/2 -translate-x-1/2 scale-[0.6] sm:scale-75 lg:scale-90 z-10"
                    />
                    <img
                      src={chapter.image}
                      alt={chapter.imageAlt}
                      referrerPolicy="no-referrer"
                      className="w-full aspect-square object-cover rounded-lg sm:rounded-xl"
                    />
                    <span className="mt-1.5 sm:mt-2 block text-center text-[8px] sm:text-[10px] lg:text-[11px] font-black tracking-[0.1em] sm:tracking-[0.12em] uppercase text-[#0D2F4F] leading-tight">
                      {chapter.slotBadge}
                    </span>
                  </div>

                  <span
                    className="font-display font-black uppercase text-[#0D2F4F] leading-[0.8] tracking-[-0.02em]"
                    style={{ fontSize: 'clamp(3.25rem, 11vw, 9.5rem)' }}
                  >
                    <SplitChars text={chapter.verb} engine="gsap" />
                  </span>
                </div>

                {/* Handwritten Sticky Note */}
                <div
                  className={`giant-note ${chapter.notePosClass} z-20 sticky-note-surface px-4 py-3 sm:p-5 w-44 sm:w-52 lg:w-56 border border-[#0D2F4F]/15 -rotate-2`}
                >
                  <p className="font-hand text-base sm:text-xl leading-snug text-[#0D2F4F]">
                    {chapter.noteLines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </p>
                </div>

                {/* Companion Polaroid Story Shot + Purposeful Module Disc */}
                <div className="flex flex-row items-center gap-3.5 sm:gap-5 lg:ml-4 shrink-0">
                  <div className="giant-prop-shot relative w-32 sm:w-40 lg:w-48 bg-white p-1.5 sm:p-2 pb-2 sm:pb-2.5 rounded-xl sm:rounded-2xl shadow-xl border border-[#0D2F4F]/15 -rotate-3 will-change-transform">
                    <img
                      src={chapter.secondaryImage}
                      alt={chapter.secondaryAlt}
                      referrerPolicy="no-referrer"
                      className="w-full aspect-[4/3] object-cover rounded-lg sm:rounded-xl"
                    />
                    <p className="mt-1.5 sm:mt-2 text-center text-[8px] sm:text-[10px] font-black tracking-[0.09em] sm:tracking-[0.11em] uppercase text-[#0D2F4F]/85 leading-tight">
                      {chapter.storyCaption}
                    </p>
                  </div>

                  <div className="giant-prop-float flex flex-col items-center gap-1.5 sm:gap-2 shrink-0 will-change-transform">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24">
                      <TapeRollGraphic
                        id={chapter.accentTapeId}
                        className="w-full h-full drop-shadow-lg"
                      />
                    </div>
                    <span className="rounded-md bg-[#0D2F4F] px-2 sm:px-2.5 py-0.5 text-[9px] sm:text-[10px] font-black tracking-[0.1em] sm:tracking-[0.12em] text-[#D9F7C4] uppercase">
                      {chapter.moduleTag}
                    </span>
                  </div>
                </div>
              </div>

              {/* Curved Connector Arrow between Chapters */}
              {idx < CHAPTERS.length - 1 && (
                <div
                  className={`giant-connector ${
                    idx === 0 ? 'diag-down-arrow' : 'diag-up-arrow'
                  } flex justify-center items-center shrink-0`}
                  aria-hidden="true"
                >
                  {idx === 0 ? (
                    <svg viewBox="0 0 150 100" fill="none" className="w-20 sm:w-32 md:w-36 lg:w-44 text-[#0D2F4F]/65">
                      <path
                        d="M4 10 C 46 16 100 44 132 86"
                        stroke="currentColor"
                        strokeWidth="3.4"
                        strokeLinecap="round"
                      />
                      <path
                        d="M111 82 L132 86 L123 66"
                        stroke="currentColor"
                        strokeWidth="3.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 150 100" fill="none" className="w-20 sm:w-32 md:w-36 lg:w-44 text-[#0D2F4F]/65">
                      <path
                        d="M4 90 C 46 84 100 56 132 14"
                        stroke="currentColor"
                        strokeWidth="3.4"
                        strokeLinecap="round"
                      />
                      <path
                        d="M111 18 L132 14 L123 34"
                        stroke="currentColor"
                        strokeWidth="3.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
