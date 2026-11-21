import React, { useLayoutEffect, useRef } from 'react';
import { IMAGES } from '../data/tapes';
import { ensureGsapRegistered } from '../utils/gsapSetup';
import { SplitChars } from './MotionPrimitives';

interface FaqItem {
  id: string;
  question: string;
  answerParagraphs: string[];
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'photo-calories',
    question: 'How does VICALARY calculate calories and macros from a photo?',
    answerParagraphs: [
      'Just snap your plate—no manual food weighing.',
      'Meal Camera decomposes every visible ingredient into normalized calories, protein, carbs, fat, and key micronutrients with an honest portion range.',
      'One tap logs it straight to your daily diary.',
    ],
  },
  {
    id: 'barcode-accuracy',
    question: 'Are barcode nutrition facts and allergy checks actually reliable?',
    answerParagraphs: [
      'Yes—zero AI guessing on packaged foods.',
      'Our Barcode Scanner runs deterministic lookups with automatic allergy safety gates, dietary checks (Halal, Vegan, Gluten-Free), parent-company ethical flags, and real local pricing.',
    ],
  },
  {
    id: 'budget-allowance',
    question: 'How does the 30-day food budget and daily allowance work?',
    answerParagraphs: [
      'Your onboarding goal automatically converts into a clear daily food allowance.',
      'Across 20+ currencies, every grocery barcode or meal you scan deducts in real time so you stay nourished without overspending.',
    ],
  },
  {
    id: 'busy-cookbook',
    question: 'What if I only have 15 minutes to cook?',
    answerParagraphs: [
      'Smart Cookbook adapts to your clock and kitchen comfort level.',
      'Morning, midday, and evening suggestions build your 7-day meal plan around 15–60 minute recipes—strictly obeying your allergies and dietary rules.',
    ],
  },
  {
    id: 'health-coach',
    question: 'How does the Health Coach support me every day?',
    answerParagraphs: [
      'Both by real-time voice and live messaging.',
      'Talk hands-free while cooking or shopping, message your coach with reactions and voice notes, and review 7-day checkpoints synced to your goals.',
    ],
  },
  {
    id: 'faith-calm',
    question: 'How does VICALARY weave faith and daily calm into nutrition?',
    answerParagraphs: [
      'True health nourishes both body and soul.',
      'Faith & Calm tracks your local prayer windows (Fajr through Isha) and Hijri milestones, pairing daily nutrition with contextual Quranic and Hadith reflections in 21+ languages.',
    ],
  },
];

export function FaqSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const { gsap, ScrollTrigger } = ensureGsapRegistered();
    const ctx = gsap.context(() => {
      if (!sectionRef.current) return;

      // Title staggered character rise
      const titleChars = gsap.utils.toArray<HTMLElement>('.faq-title .char');
      if (titleChars.length > 0) {
        gsap.fromTo(
          titleChars,
          { yPercent: 115 },
          {
            yPercent: 0,
            duration: 0.65,
            stagger: 0.02,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: '.faq-title',
              start: 'top 88%',
              toggleActions: 'play none none reverse',
              invalidateOnRefresh: true,
            },
          }
        );
      }

      const prefersReduced =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const items = gsap.utils.toArray<HTMLElement>('.chat-item');

      if (prefersReduced) {
        items.forEach((item) => {
          item.classList.add('visible');
          item.querySelector('.question-block')?.classList.add('open');
          item.querySelector('.answer-block')?.classList.add('open');
        });
        return;
      }

      // 1. Reset initial bubble states synchronously before paint (matching Crency exactly)
      const resetEls: HTMLElement[] = [];
      items.forEach((item, idx) => {
        item.querySelectorAll<HTMLElement>('.question-block, .answer-block').forEach((el) => {
          el.style.transition = 'none';
          el.classList.remove('open');
          resetEls.push(el);
        });
        if (idx === 0) {
          item.classList.add('visible');
        } else {
          item.classList.remove('visible');
        }
      });

      // Force style flush then restore CSS transitions on the next animation frame
      void document.body.offsetHeight;
      window.requestAnimationFrame(() => {
        resetEls.forEach((el) => {
          el.style.transition = '';
        });
      });

      // 2. Per-item bidirectional ScrollTrigger with wider scroll window (top 80% -> top 18%)
      //    so Question -> Typing Dots Beat -> Slow Answer -> Next Question unfold naturally in both directions
      items.forEach((itemEl, idx) => {
        const qEl = itemEl.querySelector<HTMLElement>('.question-block');
        const aEl = itemEl.querySelector<HTMLElement>('.answer-block');
        const nextItemEl = items[idx + 1];
        if (!qEl || !aEl) return;

        let lastScroll = window.scrollY;
        let hasUserScrolled = false;

        ScrollTrigger.create({
          trigger: itemEl,
          start: 'top 80%',
          end: 'top 18%',
          invalidateOnRefresh: true,
          onRefresh: (self) => {
            lastScroll = self.scroll();
          },
          onUpdate: (self) => {
            const scroll = self.scroll();
            const delta = scroll - lastScroll;
            if (Math.abs(delta) < 2) return;
            hasUserScrolled = true;
            lastScroll = scroll;

            const p = self.progress;
            if (delta > 0) {
              // Scrolling down (top to bottom): unhurried 3-beat conversational unfold
              if (p >= 0.04) qEl.classList.add('open');
              if (p >= 0.52) aEl.classList.add('open');
              if (p >= 0.72) nextItemEl?.classList.add('visible');
            } else {
              // Scrolling up (bottom to top): graceful reverse collapse
              if (p <= 0.78) nextItemEl?.classList.remove('visible');
              if (p <= 0.50) aEl.classList.remove('open');
              if (p <= 0.12) qEl.classList.remove('open');
            }
          },
          onLeave: () => {
            if (!hasUserScrolled) return;
            qEl.classList.add('open');
            aEl.classList.add('open');
            nextItemEl?.classList.add('visible');
          },
          onLeaveBack: () => {
            if (!hasUserScrolled) return;
            aEl.classList.remove('open');
            qEl.classList.remove('open');
            nextItemEl?.classList.remove('visible');
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{ paddingBottom: 'calc(var(--curve-depth) + 10rem)' }}
      className="section faq relative bg-[#081F36] text-[#FDFCFB] pt-24 sm:pt-28 px-5 sm:px-10 overflow-x-clip"
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto max-w-5xl">
        {/* Opening Header fills upper viewport cleanly so Chat Item 1 starts below the 80% scroll trigger line */}
        <div className="min-h-[70dvh] sm:min-h-[74dvh] flex flex-col items-center justify-center text-center">
          <h1
            id="faq-heading"
            className="faq-title font-display font-black uppercase text-center text-[#A6EB67] leading-[0.82] tracking-[-0.02em] select-none"
            style={{ fontSize: 'clamp(3.75rem, 11.5vw, 8.75rem)' }}
          >
            <SplitChars text="MOST COMMON" engine="gsap" className="justify-center" />
            <br />
            <SplitChars text="QUESTIONS" engine="gsap" className="justify-center" />
          </h1>

          <p className="mt-6 text-center text-sm sm:text-base font-medium text-[#D9F7C4]/80 max-w-md mx-auto">
            Scroll down slowly to follow the conversation—and scroll back up to watch it rewind.
          </p>
        </div>

        {/* Chat FAQ Thread */}
        <div className="chat-block mt-6 sm:mt-8 pl-1 pr-10 sm:pl-4 sm:pr-16 md:pr-20">
          <ul role="list" className="chat-list flex flex-col gap-20 sm:gap-28 lg:gap-32">
            {FAQ_ITEMS.map((item, idx) => (
              <li
                key={item.id}
                className={`chat-item flex flex-col gap-6 sm:gap-8 ${idx === 0 ? 'visible' : ''}`}
              >
                {/* Left Question Bubble */}
                <div
                  className="question-block mr-auto max-w-[90%] sm:max-w-[78%] lg:max-w-[560px] rounded-[22px] sm:rounded-[28px] border-[3px] border-[#FDFCFB] bg-[#0D2F4F] text-[#D9F7C4] [&.open]:bg-[#D9F7C4] [&.open]:text-[#0D2F4F] px-5 py-4 sm:px-7 sm:py-5 shadow-lg"
                >
                  <p className="hidden-text text-sm sm:text-base lg:text-[17px] font-bold leading-snug">
                    {item.question}
                  </p>
                  <div className="proggress" aria-hidden="true">
                    <div className="dot" />
                    <div className="dot" />
                    <div className="dot" />
                  </div>
                </div>

                {/* Right Answer Bubble + GitHub Repo Favicon Avatar */}
                <div className="answer-block ml-auto max-w-[90%] sm:max-w-[78%] lg:max-w-[580px] rounded-[22px] sm:rounded-[28px] border-[3px] border-[#FDFCFB] bg-[#A6EB67] text-[#0D2F4F] px-5 py-4 sm:px-7 sm:py-5 shadow-xl">
                  <div className="hidden-text text-sm sm:text-base lg:text-[17px] leading-snug space-y-3 font-bold">
                    {item.answerParagraphs.map((paragraph, pIdx) => (
                      <p key={pIdx}>{paragraph}</p>
                    ))}
                  </div>

                  {/* Typing dots before answer expands */}
                  <div className="proggress" aria-hidden="true">
                    <div className="dot" />
                    <div className="dot" />
                    <div className="dot" />
                  </div>

                  {/* Reply Avatar anchored outside bottom-right corner using GitHub repo favicon.png */}
                  <span
                    className="answer-avatar absolute -right-2.5 sm:-right-4 bottom-0 w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white border-2 border-[#FDFCFB] shadow-md overflow-hidden flex items-center justify-center p-0.5 pointer-events-none"
                    aria-hidden="true"
                  >
                    <img
                      src={IMAGES.favicon}
                      alt=""
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
