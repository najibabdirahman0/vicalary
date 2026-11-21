# VICALARY — Body & Soul

An interactive showcase for **VICALARY (VicCalary)**—a mindful nutrition, barcode scanner, grocery budgeting, and spiritual wellness platform—built with React 19, TypeScript, Tailwind CSS v4, GSAP ScrollTrigger, Lenis, and Motion.

---

## Overview

VICALARY brings together everyday physical health, honest food pricing, and quiet spiritual reflection in one cohesive daily experience. Every section preserves the tactile collage aesthetic, color-sweeping interaction model, proportional typography cadence, and ScrollTrigger choreography using VICALARY's official deep navy (`#0D2F4F` / `#0B3C7C`), signature mint-green (`#D9F7C4` → `#A6EB67`), and warm alabaster (`#FDFCFB`) palette across six core modules:

1. **Meal Camera** (`VISION`) — Instant meal decomposition, normalized ingredient breakdowns, and realistic portion ranges.
2. **Barcode Scanner** (`VERIFIER`) — Zero-hallucination barcode lookups, allergy and ethical responsibility gates, and live local pricing.
3. **Smart Cookbook** (`CHEF`) — Time-aware 7-day meal plans matched to 15–60 minute schedules, Halal standards, and allergy guardrails.
4. **Food Budget** (`KEEPER`) — Onboarding-derived 30-day cycle converted into a clear daily allowance across 20+ currencies.
5. **Health Coach** (`COACH`) — Low-latency two-way voice dialogue, WhatsApp-style coaching chat, and 7-day progress checkpoints.
6. **Faith & Calm** (`ANCHOR`) — IP-aware local prayer windows paired with contextual Quranic & Hadith reflections, evening rest cues, and Hijri milestones.

---

## Key Features Implemented

1. **7-Layer Arc-Cut GSAP Preloader (`Preloader.tsx`)**
   - Alabaster top sheet (`#FDFCFB`) featuring the VICALARY badge mark followed by 6 staggered arc-cut color curtains representing all six VICALARY modules (`#FF3366`, `#F1CA9E`, `#6A4DFD`, `#A6EB67`, `#0B3C7C`, `#50CBFF`).
   - Locks scroll via `html[data-loading="true"]` and Lenis pause until all curtains peel upward, then triggers hero entrance, top-right `PULL ME` menu tab drop-in, and `ScrollTrigger.refresh()`.
2. **Top-Right Pull-Tab Navigation & Bottom-Right Soothing Sound Toggle (`SiteMenu.tsx`, `sound.ts`)**
   - Top-right `"PULL ME"` pull-tab with dashed perforation tear line and serrated tooth edge revealing a full-width paper navigation sheet (`HOME`, `ABOUT`, `OUR MODULES`, `UPDATES`, `CONTACT`) with curated VICALARY imagery previews.
   - Bottom-right fixed pill sound slider (`w-[84px] h-[40px]`) powered by Web Audio API (`VicalarySoundEngine`), synthesizing a soothing Fmaj9 ambient pad + F-major pentatonic chime loop alongside subtle tactile UI cues.
3. **Hero & Tactile Collage (`HeroSection.tsx`)**
   - Deep VICALARY navy (`#0D2F4F`) hero featuring the perforated `"BUILT WITH CARE FOR EVERYDAY WELLNESS"` stamp, `"WE'RE HERE FOR"` eyebrow split around the VICALARY badge, mint-green (`#A6EB67`) `"BODY & SOUL"` headline, and curved arc-foot transition.
   - ScrollTrigger-driven collage with corrugated cardboard typography, VICALARY dish & dashboard imagery, handwritten sticky note, SVG rules, and scroll-peeling tape strips.
4. **ScrollTrigger Sinusoidal Wave Marquee (`WaveBand.tsx`)**
   - Full-width SVG sine-wave ribbon scrubbing *"WHEN MEALS GET BUSY, MINDFUL HEALTH TAKES HOLD"* along the curve on scroll.
5. **Interactive 6-Module Color-Sweeping Slider (`TapeSlider.tsx`, `TapeVisuals.tsx`)**
   - Expanding circular arc-cut background transitions across all six VICALARY modules displaying the VICALARY platform's own animated feature icons (`cute-camera.gif`, `scan.gif`, `chef.gif`, `money-bag.gif`, `dinner.gif`, `clock.gif`), interactive `"SPIN IT!"` rail, keyboard navigation (`←` / `→`), and deep links to module detail views.
6. **Cross-Device Pinned GSAP ScrollTrigger Why-We-Exist Canvas (`GiantPinning.tsx`)**
   - Concave `.arc-bite-top` mint-green canvas (`#D9F7C4` → `#A6EB67`) with centered tilted `"WHY WE EXIST"` pill and `"WE'RE HERE / FOR THE EVERYDAY / ROUTINES."` opening inside a unified pinned stage (`100dvh`) across **desktop, tablet, and mobile**, scrubbing horizontally across `01 TO SCAN`, `02 TO PLAN`, and `03 TO THRIVE`—with synchronized `SplitChars`, peel strips, floating module discs, and drawn SVG arrows recalculated automatically on every resize.
7. **Start Your Journey CTA & Interactive Bouncy Arc-Bite Footer (`MakeItStick.tsx`, `SiteFooter.tsx`)**
   - Split editorial CTA card with ScrollTrigger-scrubbed seam peel, image scale scrub, and word-by-word text reveal.
   - Deep VICALARY navy (`#0D2F4F`) footer with concave `.arc-bite-top` edge, ScrollTrigger-revealed dot-underlined navigation links with hover bounce, centered crest pop-in, arced `"BODY / & SOUL"` display wordmark kept unobstructed for readability, and a real-time 2D bouncy physics floor stage containing the 4 VICALARY typographic circular roll stickers (`FooterStickerDisc`) plus 3 mint-green (`#A6EB67`) social discs for **X**, **Instagram**, and **WhatsApp**—supporting cursor hover shuffling, tap-to-bounce, pointer/touch drag & throw, and circle-circle floor collisions above the `#081F36` copyright badge (`Copyright © 2026. VICALARY — Body & Soul`).
8. **Complete Client-Side Sub-Pages (`SubPages.tsx`, `FaqSection.tsx`)**
   - Dedicated views for **Our Modules** (`/products`), **Module Detail** (`/products/:id`), **About** (`/about`), **Updates** (`/news`), **Contact** (`/contact`), and **FAQ** (`/faq`, placed directly below `CONTACT` in the pull-tab menu).
   - **Scroll-Triggered Chat FAQ (`FaqSection.tsx`)**: Bidirectional GSAP ScrollTrigger chat-bubble choreography with animated typing-dot pills that morph sequentially from `0fr` → `1fr` as each question and VICALARY reply unfolds alongside the repository `favicon.png` avatar.

---

## Project Structure

```text
├── index.html                  # Document head, SEO metadata, Google Fonts, favicon.png
├── metadata.json               # VICALARY app metadata
├── README.md                   # Project documentation
└── src/
    ├── main.tsx                # React 19 entry point
    ├── index.css               # Tailwind CSS v4 tokens, arc-bite, clip & chat-FAQ classes
    ├── App.tsx                 # Lenis smooth scroll, preloader sync, routing
    ├── data/
    │   └── tapes.ts            # VICALARY 6-module catalog, palettes, specs, updates
    ├── utils/
    │   ├── gsapSetup.ts        # GSAP + ScrollTrigger registration
    │   └── sound.ts            # Web Audio API ambient tune & tactile sound engine
    ├── assets/vicalary/        # VICALARY platform photography, icons & favicon.png
    └── components/
        ├── MotionPrimitives.tsx # SplitChars, SplitWords, ScrollPeelTape
        ├── Preloader.tsx       # 7-layer GSAP arc-cut preloader
        ├── SiteMenu.tsx        # Top-right "PULL ME" drawer (including FAQ) + sound pill
        ├── TapeVisuals.tsx     # VicalaryMark & domain-specific module disc graphics
        ├── HeroSection.tsx     # Deep navy hero + ScrollTrigger collage
        ├── WaveBand.tsx        # ScrollTrigger sinusoidal SVG wave ribbon
        ├── TapeSlider.tsx      # 6-module interactive color-sweeping showcase
        ├── GiantPinning.tsx    # Concave-top pinned Why-We-Exist 3-chapter showcase
        ├── MakeItStick.tsx     # Split CTA section with seam peel
        ├── SiteFooter.tsx      # Deep navy arc-bite footer with bouncy physics discs
        ├── FaqSection.tsx      # Scroll-triggered chat FAQ with favicon reply avatar
        └── SubPages.tsx        # Modules, Detail, About, Updates, Contact, FAQ pages
```

---

## Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **Scroll & Animation**: GSAP + ScrollTrigger, Lenis smooth scroll, Motion (`motion/react`)
- **Icons**: Lucide React + custom VICALARY module SVGs
- **Typography**: *Big Shoulders Display* (condensed display), *DM Sans* (body), *Nothing You Could Do* (handwritten sticky notes)

---

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Type-check and build for production
npm run build
```
