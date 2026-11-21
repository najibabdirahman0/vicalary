import React from 'react';
import { ICON_IMAGES, IMAGES, TapeId } from '../data/tapes';

export function VicalaryMark({ className = 'w-12 h-12' }: { className?: string }) {
  return (
    <div
      className={`relative rounded-full bg-[#D9F7C4] border-[3px] border-[#0D2F4F] p-1 shadow-md overflow-hidden flex items-center justify-center ${className}`}
      aria-hidden="true"
    >
      <img
        src={IMAGES.appLogo}
        alt=""
        draggable={false}
        className="w-full h-full object-contain rounded-full bg-white"
      />
    </div>
  );
}

const DISC_PALETTE: Record<
  TapeId,
  {
    outer: string;
    rim: string;
    core: string;
    ink: string;
    label: string;
    titleTop: string;
    titleBottom: string;
    ringTag: string;
  }
> = {
  camera: {
    outer: '#F1CA9E',
    rim: '#E0AA6C',
    core: '#FFF8EE',
    ink: '#0D2F4F',
    label: 'CAMERA',
    titleTop: 'MEAL',
    titleBottom: 'CAMERA',
    ringTag: 'INSTANT MACROS • ZERO GUESSWORK',
  },
  scanner: {
    outer: '#CBE8FF',
    rim: '#6DBBFF',
    core: '#F4FAFF',
    ink: '#0B3C7C',
    label: 'SCANNER',
    titleTop: 'BARCODE',
    titleBottom: 'SCANNER',
    ringTag: 'ALLERGY GATE • LOCAL PRICING',
  },
  cookbook: {
    outer: '#FFD6DF',
    rim: '#FF3366',
    core: '#FFF5F7',
    ink: '#9D174D',
    label: 'COOKBOOK',
    titleTop: 'SMART',
    titleBottom: 'COOKBOOK',
    ringTag: '7-DAY MEAL PLANS • HALAL SAFE',
  },
  budget: {
    outer: '#0D2F4F',
    rim: '#A6EB67',
    core: '#D9F7C4',
    ink: '#0D2F4F',
    label: 'BUDGET',
    titleTop: 'FOOD',
    titleBottom: 'BUDGET',
    ringTag: '30-DAY CYCLE • DAILY ALLOWANCE',
  },
  coach: {
    outer: '#A6EB67',
    rim: '#75CF34',
    core: '#F5FFE8',
    ink: '#0D2F4F',
    label: 'COACH',
    titleTop: 'HEALTH',
    titleBottom: 'COACH',
    ringTag: 'VOICE GUIDANCE • WEEKLY CHECKINS',
  },
  spiritual: {
    outer: '#6A4DFD',
    rim: '#482CC9',
    core: '#F4F1FF',
    ink: '#241468',
    label: 'FAITH',
    titleTop: 'FAITH &',
    titleBottom: 'CALM',
    ringTag: 'PRAYER WINDOWS • HIJRI MILESTONES',
  },
};

/**
 * Circular medallion housing the actual VICALARY animated GIF icons from the project
 * (used in "Meet your daily companion" slider selector rail, main dial, and module views).
 */
export function TapeRollGraphic({
  id,
  className = 'w-full h-full',
  showLabel = false,
}: {
  id: TapeId;
  className?: string;
  showLabel?: boolean;
}) {
  const colors = DISC_PALETTE[id];
  const iconSrc = ICON_IMAGES[id];

  return (
    <div
      className={`relative rounded-full flex items-center justify-center select-none overflow-hidden shadow-md border-[3px] border-[#0D2F4F] ${className}`}
      style={{
        backgroundColor: colors.outer,
        boxShadow: `inset 0 0 0 5px ${colors.rim}`,
      }}
      aria-hidden="true"
    >
      {/* Crisp bright inner tile so the VICALARY black+teal animated icons read with high contrast */}
      <div
        className="w-[74%] h-[74%] rounded-full flex flex-col items-center justify-center p-[12%] border-2 border-[#0D2F4F]/15 shadow-inner"
        style={{ backgroundColor: colors.core }}
      >
        <img
          src={iconSrc}
          alt=""
          draggable={false}
          className={`w-full ${showLabel ? 'h-[76%]' : 'h-full'} object-contain mix-blend-multiply pointer-events-none`}
        />
        {showLabel && (
          <span
            className="mt-1 font-display font-black uppercase tracking-[0.14em] leading-none"
            style={{
              fontSize: 'clamp(0.65rem, 1.35vw, 0.9rem)',
              color: colors.ink,
            }}
          >
            {colors.label}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Typographic circular sticker disc for the footer (modeled faithfully after the reference roll labels
 * without decorative icons — bold centered stacked title, perimeter ring tagline, VICALARY crest & barcode).
 */
export function FooterStickerDisc({
  id,
  className = 'w-full h-full',
}: {
  id: TapeId;
  className?: string;
}) {
  const colors = DISC_PALETTE[id];
  const pathId = `footer-ring-${id}`;

  return (
    <svg
      viewBox="0 0 220 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <path
          id={pathId}
          d="M 110, 110 m -84, 0 a 84,84 0 1,1 168,0 a 84,84 0 1,1 -168,0"
        />
      </defs>

      {/* Outer colored band */}
      <circle cx="110" cy="110" r="106" fill={colors.rim} />
      {/* Inner sticker core */}
      <circle cx="110" cy="110" r="64" fill={colors.core} />
      {/* Subtle ring outline */}
      <circle
        cx="110"
        cy="110"
        r="104"
        stroke="rgba(13,47,79,0.22)"
        strokeWidth="2"
      />

      {/* Circular perimeter typography */}
      <text
        fill={id === 'spiritual' || id === 'budget' ? '#FDFCFB' : '#0D2F4F'}
        fontSize="8.8"
        fontWeight="900"
        letterSpacing="0.16em"
        fontFamily="var(--font-body)"
      >
        <textPath href={`#${pathId}`} startOffset="4%">
          {`VICALARY • ${colors.ringTag} • `}
        </textPath>
      </text>

      {/* Small VICALARY pill badge above main label */}
      <rect x="78" y="62" width="64" height="16" rx="8" fill="#0D2F4F" />
      <text
        x="110"
        y="73.2"
        textAnchor="middle"
        fill="#A6EB67"
        fontSize="8"
        fontWeight="900"
        letterSpacing="0.14em"
        fontFamily="var(--font-body)"
      >
        VICALARY
      </text>

      {/* Bold stacked module wordmark inside core */}
      <text
        x="110"
        y="107"
        textAnchor="middle"
        fill={colors.ink}
        fontSize="26"
        fontWeight="900"
        letterSpacing="-0.02em"
        fontFamily="var(--font-display)"
      >
        {colors.titleTop}
      </text>
      <text
        x="110"
        y="131"
        textAnchor="middle"
        fill={colors.ink}
        fontSize="26"
        fontWeight="900"
        letterSpacing="-0.02em"
        fontFamily="var(--font-display)"
      >
        {colors.titleBottom}
      </text>

      {/* Crisp mini barcode graphic underneath matching sticker core detail */}
      <g transform="translate(82, 140)" fill="#0D2F4F" opacity="0.82">
        <rect x="0" y="0" width="2.5" height="14" />
        <rect x="4.5" y="0" width="1.2" height="14" />
        <rect x="8" y="0" width="3.5" height="14" />
        <rect x="14" y="0" width="1.5" height="14" />
        <rect x="18" y="0" width="4" height="14" />
        <rect x="24" y="0" width="1.8" height="14" />
        <rect x="28" y="0" width="3" height="14" />
        <rect x="33.5" y="0" width="1.2" height="14" />
        <rect x="37" y="0" width="3.8" height="14" />
        <rect x="43" y="0" width="1.5" height="14" />
        <rect x="47" y="0" width="2.5" height="14" />
        <rect x="52" y="0" width="3" height="14" />
      </g>
    </svg>
  );
}

export function TapeStripPeel({
  color = '#D9F7C4',
  backColor = '#A6EB67',
  className = '',
  rotate = -3,
}: {
  color?: string;
  backColor?: string;
  className?: string;
  rotate?: number;
}) {
  return (
    <div
      className={`pointer-events-none select-none ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
      aria-hidden="true"
    >
      <div className="relative h-8 w-28 sm:h-9 sm:w-32 drop-shadow-sm">
        <div
          className="h-full w-full opacity-90"
          style={{
            backgroundColor: color,
            clipPath:
              'polygon(2% 0%, 96% 2%, 100% 18%, 97% 35%, 100% 54%, 97% 72%, 100% 90%, 95% 100%, 3% 98%, 0% 82%, 3% 64%, 0% 45%, 3% 26%, 0% 10%)',
          }}
        />
        <div
          className="absolute right-0 top-0 h-full w-6 origin-left"
          style={{
            backgroundColor: backColor,
            clipPath: 'polygon(0 0, 100% 16%, 85% 100%, 0 100%)',
            filter: 'brightness(0.92)',
          }}
        />
      </div>
    </div>
  );
}
