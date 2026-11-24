import React, { useCallback, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { ensureGsapRegistered } from './utils/gsapSetup';
import { Preloader } from './components/Preloader';
import {
  ROUTE_TRANSITION_COLORS,
  RouteTransition,
  RouteTransitionConfig,
} from './components/RouteTransition';
import { RoutePath, SiteMenu } from './components/SiteMenu';
import { HeroSection } from './components/HeroSection';
import { WaveBand } from './components/WaveBand';
import { TapeSlider } from './components/TapeSlider';
import { GiantPinning } from './components/GiantPinning';
import { MakeItStick } from './components/MakeItStick';
import { SiteFooter } from './components/SiteFooter';
import {
  AboutPage,
  ContactPage,
  FaqPage,
  LaunchPage,
  NewsPage,
  ProductDetailPage,
  ProductsPage,
} from './components/SubPages';
import { TAPES } from './data/tapes';

function getRouteLabel(path: RoutePath): string {
  if (path === '/') return 'HOME';
  if (path === '/about') return 'ABOUT';
  if (path === '/products') return 'OUR MODULES';
  if (path === '/news') return 'UPDATES';
  if (path === '/contact') return 'CONTACT';
  if (path === '/faq') return 'FAQ';
  if (path === '/launch/play') return 'GOOGLE PLAY';
  if (path === '/launch/apple') return 'APP STORE';
  if (path === '/launch') return 'COMING SOON';
  if (path.startsWith('/products/')) {
    const id = path.replace('/products/', '');
    const found = TAPES.find((t) => t.id === id);
    return found ? found.name.toUpperCase() : 'MODULE';
  }
  return 'VICALARY';
}

export default function App() {
  const [route, setRoute] = useState<RoutePath>('/');
  const [preloaderDone, setPreloaderDone] = useState(false);
  const [heroRevealed, setHeroRevealed] = useState(false);
  const [activeTransition, setActiveTransition] = useState<RouteTransitionConfig | null>(null);
  const pendingPathRef = useRef<RoutePath | null>(null);
  const colorCursorRef = useRef(0);
  const transitionSeqRef = useRef(0);
  const lenisRef = useRef<Lenis | null>(null);

  // Sync Lenis smooth scroll with GSAP ScrollTrigger
  useEffect(() => {
    const { gsap, ScrollTrigger } = ensureGsapRegistered();
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    if (!preloaderDone) {
      lenis.stop();
    }

    const onScrollUpdate = () => ScrollTrigger.update();
    lenis.on('scroll', onScrollUpdate);

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Refresh Lenis & all ScrollTriggers on viewport width/orientation changes & webfont load
    let lastWidth = window.innerWidth;
    let resizeTimer = 0;
    const scheduleRefresh = (force = false) => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        const nextWidth = window.innerWidth;
        if (force || nextWidth !== lastWidth) {
          lastWidth = nextWidth;
          lenis.resize();
          ScrollTrigger.refresh(true);
        }
      }, 140);
    };

    const handleResize = () => scheduleRefresh(false);
    const handleOrientation = () => scheduleRefresh(true);

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientation);

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        lenis.resize();
        ScrollTrigger.refresh();
      });
    }

    return () => {
      window.clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientation);
      lenis.off('scroll', onScrollUpdate);
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Start Lenis & refresh ScrollTrigger once preloader finishes
  useEffect(() => {
    const { ScrollTrigger } = ensureGsapRegistered();
    if (preloaderDone) {
      lenisRef.current?.start();
      lenisRef.current?.resize();
      ScrollTrigger.refresh(true);
    } else {
      lenisRef.current?.stop();
    }
  }, [preloaderDone]);

  // Refresh ScrollTrigger whenever route changes
  useEffect(() => {
    const { ScrollTrigger } = ensureGsapRegistered();
    const id = window.requestAnimationFrame(() => {
      lenisRef.current?.resize();
      ScrollTrigger.refresh(true);
    });
    return () => window.cancelAnimationFrame(id);
  }, [route]);

  const scrollToTopImmediate = useCallback(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo({ top: 0 });
    }
  }, []);

  // Color-cycling curved arc-cut transition on every section/page navigation
  const navigate = useCallback(
    (nextPath: RoutePath) => {
      if (nextPath === route && !pendingPathRef.current) {
        scrollToTopImmediate();
        return;
      }
      if (activeTransition) return;

      const paletteEntry =
        ROUTE_TRANSITION_COLORS[colorCursorRef.current % ROUTE_TRANSITION_COLORS.length];
      colorCursorRef.current += 1;
      transitionSeqRef.current += 1;
      pendingPathRef.current = nextPath;

      setActiveTransition({
        id: transitionSeqRef.current,
        ...paletteEntry,
        label: getRouteLabel(nextPath),
      });
    },
    [activeTransition, route, scrollToTopImmediate]
  );

  const handleTransitionCovered = useCallback(() => {
    if (pendingPathRef.current) {
      setRoute(pendingPathRef.current);
      pendingPathRef.current = null;
    }
    scrollToTopImmediate();
  }, [scrollToTopImmediate]);

  const handleTransitionDone = useCallback(() => {
    setActiveTransition(null);
  }, []);

  const handleRevealStart = useCallback(() => {
    setHeroRevealed(true);
  }, []);

  const handlePreloaderDone = useCallback(() => {
    setHeroRevealed(true);
    setPreloaderDone(true);
  }, []);

  const renderMainContent = () => {
    if (route === '/products') {
      return <ProductsPage onNavigate={navigate} />;
    }
    if (route.startsWith('/products/')) {
      const id = route.replace('/products/', '');
      return <ProductDetailPage tapeId={id} onNavigate={navigate} />;
    }
    if (route === '/about') {
      return <AboutPage onNavigate={navigate} />;
    }
    if (route === '/news') {
      return <NewsPage />;
    }
    if (route === '/contact') {
      return <ContactPage />;
    }
    if (route === '/faq') {
      return <FaqPage />;
    }
    if (route === '/launch/play') {
      return <LaunchPage store="play" onNavigate={navigate} />;
    }
    if (route === '/launch/apple') {
      return <LaunchPage store="apple" onNavigate={navigate} />;
    }
    if (route === '/launch') {
      return <LaunchPage onNavigate={navigate} />;
    }

    return (
      <>
        <HeroSection revealed={heroRevealed} onNavigate={navigate} />
        <WaveBand />
        <TapeSlider onNavigate={navigate} />
        <GiantPinning />
        <MakeItStick onNavigate={navigate} />
      </>
    );
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#0D2F4F]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-[#A6EB67] focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-[#0D2F4F]"
      >
        Skip to content
      </a>

      {!preloaderDone && (
        <Preloader
          onRevealStart={handleRevealStart}
          onDone={handlePreloaderDone}
        />
      )}

      {activeTransition && (
        <RouteTransition
          config={activeTransition}
          onCovered={handleTransitionCovered}
          onDone={handleTransitionDone}
        />
      )}

      <SiteMenu
        currentPath={route}
        onNavigate={navigate}
        revealed={heroRevealed}
      />

      <main id="main" tabIndex={-1}>
        {renderMainContent()}
      </main>

      <SiteFooter onNavigate={navigate} />
    </div>
  );
}
