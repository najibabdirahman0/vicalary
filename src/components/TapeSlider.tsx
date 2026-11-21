import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { TAPES, TapeId } from '../data/tapes';
import { TapeRollGraphic } from './TapeVisuals';
import { ScrollPeelTape, SplitChars } from './MotionPrimitives';
import { vicalarySound } from '../utils/sound';
import { ensureGsapRegistered } from '../utils/gsapSetup';
import { RoutePath } from './SiteMenu';

interface TapeSliderProps {
  onNavigate: (path: RoutePath) => void;
}

export function TapeSlider({ onNavigate }: TapeSliderProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevBg, setPrevBg] = useState(TAPES[0].bg);
  const [direction, setDirection] = useState<1 | -1>(1);
  const activeTape = TAPES[activeIndex];

  const selectIndex = (nextIdx: number) => {
    const wrapped = (nextIdx + TAPES.length) % TAPES.length;
    if (wrapped !== activeIndex) {
      setPrevBg(activeTape.bg);
      setDirection(nextIdx > activeIndex ? 1 : -1);
      vicalarySound.playRollClick();
      setActiveIndex(wrapped);
    }
  };

  useLayoutEffect(() => {
    const { gsap } = ensureGsapRegistered();
    const ctx = gsap.context(() => {
      if (!sectionRef.current) return;
      gsap.fromTo(
        '.slider-reveal-header',
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.65,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 82%',
            toggleActions: 'play none none reverse',
            invalidateOnRefresh: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') selectIndex(activeIndex + 1);
      if (e.key === 'ArrowLeft') selectIndex(activeIndex - 1);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeIndex]);

  const isDarkBg = activeTape.id === 'budget';
  const copyTextColor = isDarkBg ? '#FDFCFB' : '#0D2F4F';

  return (
    <section
      ref={sectionRef}
      className="tape-slider-parent relative overflow-hidden pt-14 pb-24 sm:pt-20 sm:pb-32 lg:pt-24 lg:pb-36 px-5 sm:px-10"
      style={{ backgroundColor: prevBg }}
      aria-label="Meet your daily companion"
    >
      {/* Expanding arc-cut circular background sweep */}
      <motion.div
        key={`bg-${activeTape.id}`}
        initial={{ clipPath: 'circle(0% at 50% 100%)' }}
        animate={{ clipPath: 'circle(155% at 50% 100%)' }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        style={{ backgroundColor: activeTape.bg }}
        className="absolute inset-0 z-0 pointer-events-none"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-6xl relative z-10">
        {/* Top Row: Subhead & Interactive Module Rail */}
        <div className="slider-reveal-header flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-8 mb-10 sm:mb-14 lg:mb-16">
          <div>
            <p
              className="text-xs sm:text-sm font-black tracking-[0.18em] uppercase"
              style={{ color: isDarkBg ? '#D9F7C4' : '#0D2F4F' }}
            >
              MEET YOUR DAILY COMPANION
            </p>
            <p
              className="mt-1 text-sm font-medium opacity-80 tabular-nums"
              style={{ color: copyTextColor }}
            >
              {activeTape.name} — 0{activeIndex + 1} / 0{TAPES.length}
            </p>
          </div>

          {/* Interactive Module Rail */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-4">
            <span
              className="font-hand text-base sm:text-xl mr-1 select-none"
              style={{ color: copyTextColor }}
            >
              SPIN IT!
            </span>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3" role="tablist" aria-label="Choose a module">
              {TAPES.map((tape, idx) => {
                const selected = idx === activeIndex;
                return (
                  <button
                    key={tape.id}
                    type="button"
                    onClick={() => selectIndex(idx)}
                    className={`relative h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 rounded-full transition-all duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D2F4F] ${
                      selected
                        ? 'scale-110 sm:scale-115 ring-3 sm:ring-4 ring-white shadow-lg'
                        : 'opacity-85 hover:opacity-100 hover:scale-105'
                    }`}
                    aria-label={tape.name}
                    aria-selected={selected}
                    role="tab"
                  >
                    <TapeRollGraphic id={tape.id as TapeId} className="w-full h-full" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Active Module Slide */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTape.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center"
          >
            {/* Left Column: Use-case tags + Copy + Explore CTA */}
            <div className="lg:col-span-4 flex flex-col items-start gap-5 sm:gap-6 order-2 lg:order-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-black tracking-[0.14em] uppercase">
                {activeTape.tags.map((tag, i) => (
                  <React.Fragment key={tag}>
                    <span style={{ color: isDarkBg ? '#D9F7C4' : '#0D2F4F' }}>{tag}</span>
                    {i < activeTape.tags.length - 1 && (
                      <span aria-hidden="true" style={{ color: copyTextColor, opacity: 0.5 }}>
                        /
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>

              <h3
                className="text-lg sm:text-xl md:text-2xl font-medium leading-snug max-w-md"
                style={{ color: copyTextColor }}
              >
                {activeTape.copy}
              </h3>

              <button
                type="button"
                onClick={() => {
                  vicalarySound.playTapePeel();
                  onNavigate(`/products/${activeTape.id}`);
                }}
                className="group inline-flex items-center gap-3 rounded-full bg-[#0D2F4F] px-7 py-3.5 text-sm font-black tracking-[0.12em] text-[#D9F7C4] shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>EXPLORE</span>
                <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </div>

            {/* Center & Right Stage: Giant THE + Rolling Disc + Taped Photos + Persona */}
            <div className="lg:col-span-8 relative flex flex-col items-center justify-center order-1 lg:order-2 py-4 sm:py-6">
              {/* Top "THE" */}
              <span
                className="font-display font-black uppercase leading-none tracking-[0.06em] select-none"
                style={{
                  fontSize: 'clamp(2.1rem, 6vw, 4.5rem)',
                  color: activeTape.wordColor,
                }}
              >
                <SplitChars text="THE" stagger={0.04} engine="motion" />
              </span>

              {/* Central Interactive Disc & Tilted Showcase Cards (responsive across all devices) */}
              <div className="relative my-2 flex items-center justify-center w-full max-w-2xl">
                {/* Left tilted showcase photo */}
                <motion.div
                  initial={{ opacity: 0, x: -24 * direction, rotate: -14 }}
                  animate={{ opacity: 1, x: 0, rotate: -7 }}
                  transition={{ duration: 0.48, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="relative w-20 sm:w-36 md:w-44 bg-white p-1 sm:p-2 shadow-xl -mr-3 sm:-mr-6 z-10 shrink-0"
                >
                  <ScrollPeelTape
                    mode="auto"
                    color={activeTape.stripColor}
                    backColor={activeTape.stripBackColor}
                    rotate={-12}
                    className="absolute -top-3.5 sm:-top-4 left-1/2 -translate-x-1/2 scale-[0.55] sm:scale-75"
                  />
                  <img
                    src={activeTape.showcaseImages[0]}
                    alt={`${activeTape.name} preview`}
                    referrerPolicy="no-referrer"
                    className="w-full aspect-[4/3] object-cover"
                  />
                </motion.div>

                {/* Central Physically Rolling Module Dial */}
                <motion.div
                  initial={{ x: 50 * direction, rotate: 140 * direction, scale: 0.82 }}
                  animate={{ x: 0, rotate: 0, scale: 1 }}
                  whileHover={{ rotate: 18, scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 210, damping: 20 }}
                  onClick={() => selectIndex(activeIndex + 1)}
                  className="relative z-20 w-40 h-40 sm:w-56 sm:h-56 md:w-68 md:h-68 lg:w-72 lg:h-72 cursor-pointer shrink-0"
                  title="Tap or click to spin next module"
                >
                  <TapeRollGraphic
                    id={activeTape.id}
                    className="w-full h-full drop-shadow-2xl"
                    showLabel
                  />
                </motion.div>

                {/* Right tilted showcase photo */}
                <motion.div
                  initial={{ opacity: 0, x: 24 * direction, rotate: 14 }}
                  animate={{ opacity: 1, x: 0, rotate: 6 }}
                  transition={{ duration: 0.48, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
                  className="relative w-20 sm:w-36 md:w-44 bg-white p-1 sm:p-2 shadow-xl -ml-3 sm:-ml-6 z-10 shrink-0"
                >
                  <ScrollPeelTape
                    mode="auto"
                    color={activeTape.stripColor}
                    backColor={activeTape.stripBackColor}
                    rotate={10}
                    className="absolute -top-3.5 sm:-top-4 left-1/2 -translate-x-1/2 scale-[0.55] sm:scale-75"
                  />
                  <img
                    src={activeTape.showcaseImages[1]}
                    alt={`${activeTape.name} workflow`}
                    referrerPolicy="no-referrer"
                    className="w-full aspect-[4/3] object-cover"
                  />
                </motion.div>
              </div>

              {/* Giant Bottom Persona Word with staggered letter rise */}
              <h2
                className="font-display font-black uppercase leading-[0.82] tracking-[-0.02em] select-none text-center"
                style={{
                  fontSize: 'clamp(3.25rem, 12vw, 10.5rem)',
                  color: activeTape.wordColor,
                }}
              >
                <SplitChars text={activeTape.persona} stagger={0.032} engine="motion" />
              </h2>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Bottom Prev / Next Controls */}
        <div className="mt-8 sm:mt-10 flex items-center justify-between border-t border-black/10 pt-5 sm:pt-6">
          <button
            type="button"
            onClick={() => selectIndex(activeIndex - 1)}
            aria-label="Previous module"
            className="inline-flex items-center gap-2 rounded-full bg-white/95 px-5 py-2.5 text-xs font-black tracking-[0.12em] text-[#0D2F4F] shadow-sm transition-transform hover:-translate-x-1 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>PREV</span>
          </button>

          <div className="flex items-center gap-2">
            {TAPES.map((t, idx) => (
              <button
                key={t.id}
                type="button"
                aria-label={`Go to ${t.name}`}
                onClick={() => selectIndex(idx)}
                className={`h-2.5 rounded-full transition-all cursor-pointer ${
                  idx === activeIndex
                    ? isDarkBg ? 'w-8 bg-[#A6EB67]' : 'w-8 bg-[#0D2F4F]'
                    : isDarkBg ? 'w-2.5 bg-white/40 hover:bg-white/75' : 'w-2.5 bg-[#0D2F4F]/30 hover:bg-[#0D2F4F]/60'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => selectIndex(activeIndex + 1)}
            aria-label="Next module"
            className="inline-flex items-center gap-2 rounded-full bg-white/95 px-5 py-2.5 text-xs font-black tracking-[0.12em] text-[#0D2F4F] shadow-sm transition-transform hover:translate-x-1 cursor-pointer"
          >
            <span>NEXT</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
