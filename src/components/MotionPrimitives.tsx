import React, { useLayoutEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ensureGsapRegistered } from '../utils/gsapSetup';

interface SplitCharsProps {
  text: string;
  className?: string;
  charClassName?: string;
  delay?: number;
  stagger?: number;
  /**
   * 'gsap' renders raw `.clip > .char` spans controlled by a parent GSAP timeline / ScrollTrigger.
   * 'motion' uses Framer/Motion for dynamic tab/slide transitions (like TapeSlider).
   */
  engine?: 'gsap' | 'motion';
}

/**
 * Staggered `.clip > .char` character rise reveal used across VICALARY headlines.
 */
export function SplitChars({
  text,
  className = '',
  charClassName = '',
  delay = 0,
  stagger = 0.028,
  engine = 'motion',
}: SplitCharsProps) {
  const chars = Array.from(text);

  if (engine === 'gsap') {
    return (
      <span className={`inline-flex flex-wrap ${className}`} aria-label={text}>
        {chars.map((char, idx) => (
          <span
            key={`${char}-${idx}`}
            className="clip"
            style={{ '--i': idx } as React.CSSProperties}
            aria-hidden="true"
          >
            <span className={`char ${charClassName}`}>
              {char === ' ' ? '\u00A0' : char}
            </span>
          </span>
        ))}
      </span>
    );
  }

  return (
    <span className={`inline-flex flex-wrap ${className}`} aria-label={text}>
      {chars.map((char, idx) => (
        <span
          key={`${char}-${idx}`}
          className="clip"
          style={{ '--i': idx } as React.CSSProperties}
          aria-hidden="true"
        >
          <motion.span
            className={`char ${charClassName}`}
            initial={{ y: '112%' }}
            animate={{ y: '0%' }}
            transition={{
              duration: 0.52,
              delay: delay + idx * stagger,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

interface SplitWordsProps {
  text: string;
  className?: string;
}

/**
 * Staggered `.body-clip > .body-rise` word-by-word rise reveal.
 */
export function SplitWords({ text, className = '' }: SplitWordsProps) {
  const words = text.split(' ');

  return (
    <span className={`inline-flex flex-wrap gap-x-[0.26em] ${className}`} aria-label={text}>
      {words.map((word, idx) => (
        <span key={`${word}-${idx}`} className="body-clip" aria-hidden="true">
          <span className="body-rise">{word}</span>
        </span>
      ))}
    </span>
  );
}

interface ScrollPeelTapeProps {
  color?: string;
  backColor?: string;
  className?: string;
  rotate?: number;
  mode?: 'scroll' | 'auto' | 'manual';
  /** Starting stuck ratio (0..1), default 0.42 */
  fromRatio?: number;
}

/**
 * Scroll-scrubbed or parent-timeline peel strip (`data-peel="scroll"` & `data-peel="manual"`).
 */
export function ScrollPeelTape({
  color = '#EDE0B8',
  backColor = '#d3c393',
  className = '',
  rotate = -3,
  mode = 'scroll',
  fromRatio = 0.42,
}: ScrollPeelTapeProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const faceRef = useRef<HTMLDivElement>(null);
  const flapRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (mode === 'manual') {
      // Controlled directly by parent GSAP timeline (e.g., GiantPinning)
      return;
    }

    const { gsap } = ensureGsapRegistered();
    const ctx = gsap.context(() => {
      if (!faceRef.current || !flapRef.current || !rootRef.current) return;

      if (mode === 'auto') {
        gsap.fromTo(
          faceRef.current,
          { scaleX: fromRatio, opacity: 0.72 },
          { scaleX: 1, opacity: 0.94, duration: 0.58, delay: 0.14, ease: 'power3.out' }
        );
        gsap.fromTo(
          flapRef.current,
          { scaleX: 1.45, opacity: 0.96, x: -4 },
          { scaleX: 0.35, opacity: 0.25, x: 0, duration: 0.58, delay: 0.14, ease: 'power3.out' }
        );
        return;
      }

      // mode === 'scroll' -> GSAP ScrollTrigger scrub
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top 92%',
          end: 'center 52%',
          scrub: 0.65,
          invalidateOnRefresh: true,
        },
      });

      tl.fromTo(
        faceRef.current,
        { scaleX: fromRatio, opacity: 0.78 },
        { scaleX: 1, opacity: 0.94, ease: 'none' },
        0
      ).fromTo(
        flapRef.current,
        { scaleX: 1.4, opacity: 0.95, x: -6 },
        { scaleX: 0.35, opacity: 0.28, x: 0, ease: 'none' },
        0
      );
    }, rootRef);

    return () => ctx.revert();
  }, [fromRatio, mode]);

  return (
    <div
      ref={rootRef}
      data-peel={mode}
      className={`peel pointer-events-none select-none ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
      aria-hidden="true"
    >
      <div className="relative h-8 w-28 sm:h-9 sm:w-32 drop-shadow-sm">
        <div
          ref={faceRef}
          className="peel-face h-full w-full origin-left opacity-92 will-change-transform"
          style={{
            backgroundColor: color,
            clipPath:
              'polygon(2% 0%, 96% 2%, 100% 18%, 97% 35%, 100% 54%, 97% 72%, 100% 90%, 95% 100%, 3% 98%, 0% 82%, 3% 64%, 0% 45%, 3% 26%, 0% 10%)',
          }}
        />
        <div
          ref={flapRef}
          className="peel-flap absolute right-0 top-0 h-full w-6 origin-right will-change-transform"
          style={{
            backgroundColor: backColor,
            clipPath: 'polygon(0 0, 100% 16%, 85% 100%, 0 100%)',
          }}
        />
      </div>
    </div>
  );
}
