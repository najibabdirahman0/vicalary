import React, { useLayoutEffect, useRef } from 'react';
import { ICON_IMAGES } from '../data/tapes';
import { ensureGsapRegistered } from '../utils/gsapSetup';

export function WaveBand() {
  const sectionRef = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const textPathRef = useRef<SVGTextPathElement>(null);
  const badgesRef = useRef<Array<SVGGElement | null>>([]);

  const phrase = 'WHEN MEALS GET BUSY,      MINDFUL HEALTH TAKES HOLD      ';
  const repeated = phrase.repeat(6);

  useLayoutEffect(() => {
    const { gsap } = ensureGsapRegistered();
    const ctx = gsap.context(() => {
      const pathEl = pathRef.current;
      const textPathEl = textPathRef.current;
      if (!pathEl || !textPathEl || !sectionRef.current) return;

      const totalLength = pathEl.getTotalLength();

      const updateAlongWave = (progress: number) => {
        const offsetPx = -progress * 720;
        textPathEl.setAttribute('startOffset', `${offsetPx}px`);

        const baseFractions = [0.16, 0.34, 0.52, 0.7, 0.88];
        badgesRef.current.forEach((badge, idx) => {
          if (!badge) return;
          const frac = (baseFractions[idx] - progress * 0.14 + 1) % 1;
          const pt = pathEl.getPointAtLength(frac * totalLength);
          const rot = progress * 160 + idx * 24;
          badge.setAttribute(
            'transform',
            `translate(${pt.x}, ${pt.y}) rotate(${rot})`
          );
        });
      };

      updateAlongWave(0);

      gsap.to(
        { p: 0 },
        {
          p: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.75,
            invalidateOnRefresh: true,
          },
          onUpdate: function () {
            updateAlongWave(this.targets()[0].p);
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="wave-band relative w-full overflow-hidden bg-[#FDFCFB] py-3 sm:py-5 lg:py-6 select-none"
      aria-hidden="true"
    >
      <div className="w-full overflow-hidden">
        <svg
          viewBox="80 85 1440 350"
          preserveAspectRatio="xMidYMid slice"
          className="w-full h-28 sm:h-40 md:h-48 lg:h-56"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <path
              ref={pathRef}
              id="vicalary-wave-path"
              d="M -1200,260 Q -800,390 -400,260 Q 0,130 400,260 Q 800,390 1200,260 Q 1600,130 2000,260 Q 2400,390 2800,260 Q 3200,130 3600,260"
              fill="none"
            />
          </defs>

          <use
            href="#vicalary-wave-path"
            stroke="#0D2F4F"
            strokeWidth="104"
            strokeOpacity="0.14"
            fill="none"
          />

          <use
            href="#vicalary-wave-path"
            className="band-tape"
            stroke="#A6EB67"
            strokeWidth="96"
            strokeLinecap="round"
            fill="none"
          />

          <text
            fill="#0D2F4F"
            fontFamily="var(--font-display)"
            fontWeight="900"
            fontSize="54"
            letterSpacing="0.04em"
            dy="18"
          >
            <textPath ref={textPathRef} href="#vicalary-wave-path" startOffset="0">
              {repeated}
            </textPath>
          </text>

          {/* Circular VICALARY project icon tokens riding on the curve */}
          {[0, 1, 2, 3, 4].map((idx) => (
            <g
              key={idx}
              ref={(el) => {
                badgesRef.current[idx] = el;
              }}
              className="band-badge"
            >
              <circle r="34" fill="#FDFCFB" stroke="#0D2F4F" strokeWidth="4" />
              <image
                href={idx % 2 === 0 ? ICON_IMAGES.camera : ICON_IMAGES.cookbook}
                x="-21"
                y="-21"
                width="42"
                height="42"
              />
            </g>
          ))}
        </svg>
      </div>
    </section>
  );
}
