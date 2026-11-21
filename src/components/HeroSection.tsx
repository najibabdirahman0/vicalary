import React, { useLayoutEffect, useRef } from 'react';
import { IMAGES } from '../data/tapes';
import { ensureGsapRegistered } from '../utils/gsapSetup';
import { VicalaryMark } from './TapeVisuals';
import { ScrollPeelTape, SplitChars } from './MotionPrimitives';

interface HeroSectionProps {
  revealed?: boolean;
}

const CARDBOARD_WORDS = [
  'MEAL',
  'PREP',
  'CHAOS,',
  'CALORIE',
  'GUESSWORK,',
  'GROCERY',
  'BUDGET',
  'SLIPS,',
  'LATE-NIGHT',
  'CRAVINGS.',
  'WE',
  'ALWAYS',
  'GUIDE',
  'YOUR',
  'WAY.',
];

export function HeroSection({ revealed = true }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const collageRef = useRef<HTMLDivElement>(null);

  // 1. Hero Entrance Timeline (runs in sync when Preloader finishes peeling)
  useLayoutEffect(() => {
    const { gsap } = ensureGsapRegistered();
    const ctx = gsap.context(() => {
      const heroChars = gsap.utils.toArray<HTMLElement>('.hero-top .char');
      const stamp = '.corner-mark';
      const mark = '.hero-mark-slot';

      if (!revealed) {
        gsap.set(heroChars, { yPercent: 115 });
        gsap.set(stamp, { opacity: 0, rotate: -10, y: -18 });
        gsap.set(mark, { scale: 0.45, rotate: -45, opacity: 0 });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      tl.to(
        stamp,
        {
          opacity: 1,
          rotate: -3,
          y: 0,
          duration: 0.65,
        },
        0
      )
        .to(
          mark,
          {
            scale: 1,
            rotate: 0,
            opacity: 1,
            duration: 0.65,
            ease: 'back.out(1.7)',
          },
          0.05
        )
        .to(
          heroChars,
          {
            yPercent: 0,
            duration: 0.72,
            stagger: 0.022,
          },
          0.06
        );

      // Gentle ambient wobble on the Vicalary mark
      gsap.to('.hero-mark-inner', {
        rotate: 8,
        duration: 2.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 0.7,
      });
    }, topRef);

    return () => ctx.revert();
  }, [revealed]);

  // 2. Bottom Collage ScrollTrigger (Responsive Parallax + Cardboard Split Chars + Handwritten Ink Rules)
  useLayoutEffect(() => {
    const { gsap } = ensureGsapRegistered();
    const mm = gsap.matchMedia();

    const ctx = gsap.context(() => {
      if (!collageRef.current) return;

      // Desktop 12-col parallel parallax vs Mobile/Tablet stacked per-card parallax
      mm.add('(min-width: 1024px)', () => {
        gsap.fromTo(
          '#lemon',
          { y: 36, rotate: -4 },
          {
            y: -42,
            rotate: -1.5,
            ease: 'none',
            scrollTrigger: {
              trigger: collageRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.8,
              invalidateOnRefresh: true,
            },
          }
        );

        gsap.fromTo(
          '#gift',
          { y: 54, rotate: -6 },
          {
            y: -60,
            rotate: -2,
            ease: 'none',
            scrollTrigger: {
              trigger: collageRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.8,
              invalidateOnRefresh: true,
            },
          }
        );
      });

      mm.add('(max-width: 1023px)', () => {
        gsap.fromTo(
          '#lemon',
          { y: 20, rotate: -3 },
          {
            y: -22,
            rotate: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: '#lemon',
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.75,
              invalidateOnRefresh: true,
            },
          }
        );

        gsap.fromTo(
          '#gift',
          { y: 26, rotate: -5 },
          {
            y: -26,
            rotate: 1.5,
            ease: 'none',
            scrollTrigger: {
              trigger: '#gift',
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.75,
              invalidateOnRefresh: true,
            },
          }
        );
      });

      // Cardboard headline staggered character rise
      const cardboardChars = gsap.utils.toArray<HTMLElement>('.cardboard-headline .char');
      gsap.fromTo(
        cardboardChars,
        { yPercent: 115 },
        {
          yPercent: 0,
          duration: 0.6,
          stagger: 0.012,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.cardboard-wrapper',
            start: 'top 86%',
            toggleActions: 'play none none reverse',
            invalidateOnRefresh: true,
          },
        }
      );

      // Handwritten sticky note rise + SVG ink rule draw
      gsap.fromTo(
        '.hero-hand-note',
        { opacity: 0, y: 28, rotate: 6 },
        {
          opacity: 1,
          y: 0,
          rotate: 3,
          duration: 0.65,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.hero-hand-note',
            start: 'top 88%',
            toggleActions: 'play none none reverse',
            invalidateOnRefresh: true,
          },
        }
      );

      const rules = gsap.utils.toArray<SVGPathElement>('.hero-hand-note .hand-rule path');
      rules.forEach((pathEl) => {
        const len = pathEl.getTotalLength();
        gsap.set(pathEl, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(pathEl, {
          strokeDashoffset: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.hero-hand-note',
            start: 'top 84%',
            toggleActions: 'play none none reverse',
            invalidateOnRefresh: true,
          },
        });
      });
    }, collageRef);

    return () => {
      mm.revert();
      ctx.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className="hero-section relative overflow-hidden">
      {/* TOP VICALARY DEEP NAVY HERO CANVAS */}
      <div
        ref={topRef}
        className="hero-top relative bg-[#0D2F4F] text-[#FDFCFB] pt-20 pb-24 sm:pt-24 sm:pb-32 md:pb-36 px-5 sm:px-10"
      >
        {/* Corner perforated stamp (desktop/tablet top-left) */}
        <div className="corner-mark hidden md:flex flex-col items-start absolute top-8 left-8 lg:left-12 bg-[#D9F7C4] text-[#0D2F4F] px-4 py-2.5 rounded-sm shadow-md border border-[#0D2F4F]/20">
          <span className="text-[11px] font-black tracking-[0.14em] leading-tight">
            <SplitChars text="BUILT WITH CARE FOR" engine="gsap" />
          </span>
          <span className="text-[11px] font-black tracking-[0.14em] leading-tight">
            <SplitChars text="EVERYDAY WELLNESS" engine="gsap" />
          </span>
        </div>

        <div className="mx-auto max-w-6xl flex flex-col items-center text-center">
          {/* Eyebrow split around Vicalary Mark */}
          <div className="flex items-center justify-center gap-2.5 sm:gap-5 mb-4 sm:mb-6">
            <span className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-[0.06em] text-[#FDFCFB]">
              <SplitChars text="WE'RE" engine="gsap" />
            </span>
            <div className="hero-mark-slot">
              <div className="hero-mark-inner">
                <VicalaryMark className="w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 drop-shadow-md" />
              </div>
            </div>
            <span className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-[0.06em] text-[#FDFCFB]">
              <SplitChars text="HERE FOR" engine="gsap" />
            </span>
          </div>

          {/* Massive warped display headline: BODY & SOUL */}
          <h1
            aria-label="BODY & SOUL"
            className="font-display font-black uppercase text-[#A6EB67] leading-[0.82] tracking-[-0.02em] select-none flex flex-col items-center"
            style={{ fontSize: 'clamp(4rem, 18.5vw, 17rem)' }}
          >
            <SplitChars text="BODY" engine="gsap" />
            <SplitChars text="& SOUL" engine="gsap" />
          </h1>

          {/* Mobile animated perforated stamp */}
          <div className="corner-mark mt-6 md:hidden inline-flex flex-col items-center bg-[#D9F7C4] text-[#0D2F4F] px-3.5 py-2 rounded-sm shadow-md border border-[#0D2F4F]/20">
            <span className="text-[10px] font-black tracking-[0.14em] leading-tight uppercase">
              BUILT WITH CARE FOR EVERYDAY WELLNESS
            </span>
          </div>
        </div>

        {/* Curved paper arc-foot transition */}
        <div
          className="arc-foot absolute bottom-0 left-0 right-0 h-12 sm:h-16 md:h-20 bg-[#FDFCFB]"
          style={{
            clipPath: 'ellipse(62% 100% at 50% 100%)',
          }}
          aria-hidden="true"
        />
      </div>

      {/* BOTTOM TACTILE COLLAGE PART */}
      <div
        ref={collageRef}
        className="bottom-part relative bg-[#FDFCFB] paper-grain pt-10 pb-20 sm:pt-16 sm:pb-28 lg:pb-32 px-5 sm:px-10"
      >
        <div className="mx-auto max-w-6xl relative">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-8 items-center">
            {/* Left Collage Props: Vicalary Hero Bowl + Scroll-Peeling Strip */}
            <div id="lemon" className="md:col-span-4 lg:col-span-3 flex flex-col items-center lg:items-start gap-6 will-change-transform">
              <div className="relative w-48 sm:w-56 md:w-full max-w-[260px] bg-white p-2.5 shadow-lg border border-[#0D2F4F]/12">
                <ScrollPeelTape
                  mode="scroll"
                  color="#D9F7C4"
                  backColor="#A6EB67"
                  rotate={-8}
                  fromRatio={0.4}
                  className="absolute -top-4 left-1/2 -translate-x-1/2 z-10"
                />
                <img
                  src={IMAGES.landingHero}
                  alt="Smiling woman holding a bowl of fresh vegetables for VICALARY"
                  referrerPolicy="no-referrer"
                  className="w-full aspect-[3/4] object-cover object-top"
                />
              </div>
            </div>

            {/* Center Cardboard Headline */}
            <div className="cardboard-wrapper md:col-span-8 lg:col-span-6 relative">
              <ScrollPeelTape
                mode="scroll"
                color="#F1CA9E"
                backColor="#dfb17e"
                rotate={2}
                fromRatio={0.38}
                className="absolute -top-5 left-1/2 -translate-x-1/2 z-20"
              />

              <div className="cardboard-surface relative rounded-md p-6 sm:p-10 lg:p-11 shadow-xl border-2 border-[#0D2F4F]/20 rotate-[-0.8deg]">
                <h2
                  aria-label="MEAL PREP CHAOS, CALORIE GUESSWORK, GROCERY BUDGET SLIPS, LATE-NIGHT CRAVINGS. WE ALWAYS GUIDE YOUR WAY."
                  className="cardboard-headline font-display font-black uppercase text-[#0D2F4F] leading-[0.94] tracking-[-0.01em] flex flex-wrap gap-x-[0.22em] gap-y-0.5"
                  style={{ fontSize: 'clamp(2.1rem, 5.2vw, 3.75rem)' }}
                >
                  {CARDBOARD_WORDS.map((word, wIdx) => (
                    <span key={`${word}-${wIdx}`} className="inline-flex">
                      {Array.from(word).map((ch, cIdx) => (
                        <span key={`${ch}-${cIdx}`} className="clip" aria-hidden="true">
                          <span className="char">{ch}</span>
                        </span>
                      ))}
                    </span>
                  ))}
                </h2>
              </div>
            </div>

            {/* Right Collage Props: Handwritten Sticky Note + Balanced Meal Photo */}
            <div className="md:col-span-12 lg:col-span-3 flex flex-col sm:flex-row lg:flex-col items-center justify-center lg:items-end gap-8">
              <div className="hero-hand-note relative w-56 sm:w-64 sticky-note-surface p-6 border border-[#0D2F4F]/12">
                <ScrollPeelTape
                  mode="scroll"
                  color="#CBE8FF"
                  backColor="#9ED3FF"
                  rotate={4}
                  fromRatio={0.42}
                  className="absolute -top-4 left-1/2 -translate-x-1/2 z-10"
                />
                <svg
                  className="hand-rule hand-rule--x w-full h-2.5 text-[#0D2F4F]/30 mb-1"
                  viewBox="0 0 100 10"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path d="M 0 3 C 30 8 65 8 100 1" stroke="currentColor" strokeWidth="1.6" fill="none" />
                </svg>
                <p className="font-hand text-xl sm:text-2xl leading-snug text-[#0D2F4F]">
                  built for real
                  <br />
                  daily routines.
                  <br />
                  mindful nutrition,
                  <br />
                  faith &amp; calm.
                </p>
                <svg
                  className="hand-rule hand-rule--y w-full h-2.5 text-[#0D2F4F]/25 mt-2"
                  viewBox="0 0 100 10"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path d="M 0 6 C 33 2 70 3 100 6" stroke="currentColor" strokeWidth="1.6" fill="none" />
                </svg>
              </div>

              {/* Balanced meal photo with ScrollTrigger parallax */}
              <div
                id="gift"
                data-parallax="-0.12"
                className="relative w-44 sm:w-52 shadow-lg rounded-md overflow-hidden border border-[#0D2F4F]/12 bg-white p-1.5 will-change-transform"
              >
                <img
                  src={IMAGES.grilledChicken}
                  alt="Balanced grilled chicken meal analyzed with VICALARY"
                  referrerPolicy="no-referrer"
                  className="w-full aspect-square object-cover rounded-xs"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
