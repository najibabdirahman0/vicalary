import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Volume2, VolumeX, ArrowUpRight, X } from 'lucide-react';
import { IMAGES } from '../data/tapes';
import { vicalarySound } from '../utils/sound';

export type RoutePath =
  | '/'
  | '/about'
  | '/products'
  | '/news'
  | '/contact'
  | '/faq'
  | '/launch'
  | '/launch/play'
  | '/launch/apple'
  | `/products/${string}`;

interface SiteMenuProps {
  currentPath: RoutePath;
  onNavigate: (path: RoutePath) => void;
  revealed?: boolean;
}

const MENU_ITEMS: Array<{ label: string; href: RoutePath; thumb: string }> = [
  { label: 'HOME', href: '/', thumb: IMAGES.landingHero },
  { label: 'ABOUT', href: '/about', thumb: IMAGES.cookingWoman },
  { label: 'OUR MODULES', href: '/products', thumb: IMAGES.grilledChicken },
  { label: 'UPDATES', href: '/news', thumb: IMAGES.foodAllergies },
  { label: 'CONTACT', href: '/contact', thumb: IMAGES.weeklyBudget },
  { label: 'FAQ', href: '/faq', thumb: IMAGES.favicon },
];

export function SiteMenu({ currentPath, onNavigate, revealed = true }: SiteMenuProps) {
  const [open, setOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(false);

  const toggleMenu = () => {
    vicalarySound.playTapePeel();
    setOpen((prev) => !prev);
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    vicalarySound.setEnabled(next);
  };

  const handleLinkClick = (href: RoutePath) => {
    vicalarySound.playRollClick();
    setOpen(false);
    onNavigate(href);
  };

  return (
    <>
      {/* TOP-RIGHT FIXED SITE MENU ("PULL ME" tab + drop-down paper sheet) */}
      <nav
        className="site-menu fixed top-0 right-4 sm:right-6 z-40 pointer-events-none flex flex-col items-end"
        data-open={open ? 'true' : 'false'}
        aria-label="Main"
      >
        <AnimatePresence>
          {open && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                onClick={() => setOpen(false)}
                className="fixed inset-0 bg-[#0D2F4F]/55 backdrop-blur-xs pointer-events-auto"
                aria-hidden="true"
              />
              <motion.div
                id="site-menu-panel"
                initial={{ y: '-100%' }}
                animate={{ y: '0%' }}
                exit={{ y: '-100%' }}
                transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-[min(92vw,440px)] max-h-[85dvh] overflow-y-auto rounded-b-2xl bg-[#FDFCFB] text-[#0D2F4F] shadow-2xl border-x-2 border-b-2 border-[#0D2F4F]/20 pointer-events-auto"
              >
                <div className="px-6 pt-6 pb-6 sm:px-8 sm:pt-7 sm:pb-8">
                  <div className="flex items-center justify-between pb-4 border-b border-[#0D2F4F]/15">
                    <button
                      type="button"
                      onClick={() => handleLinkClick('/')}
                      className="font-display text-3xl font-black tracking-tight text-[#0D2F4F] hover:opacity-80 transition-opacity cursor-pointer"
                    >
                      VICALARY
                    </button>
                    <button
                      type="button"
                      onClick={toggleMenu}
                      aria-label="Close menu"
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#0D2F4F] px-3.5 py-1.5 text-xs font-bold tracking-wider text-[#D9F7C4] hover:bg-[#0B3C7C] transition-colors cursor-pointer"
                    >
                      <span>CLOSE</span>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <ul className="divide-y divide-[#0D2F4F]/12">
                    {MENU_ITEMS.filter((item) => !(currentPath === '/' && item.href === '/')).map(
                      (item, idx) => {
                        const isActive =
                          item.href === '/'
                            ? currentPath === '/'
                            : currentPath.startsWith(item.href);

                        return (
                          <motion.li
                            key={item.href}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 + idx * 0.04, duration: 0.28 }}
                          >
                            <button
                              type="button"
                              onClick={() => handleLinkClick(item.href)}
                              className="group flex w-full items-center justify-between py-3.5 text-left transition-colors hover:bg-[#D9F7C4]/35 px-2 rounded-xl cursor-pointer"
                            >
                              <div className="flex items-center gap-4">
                                <span className="h-12 w-16 overflow-hidden rounded-lg border border-[#0D2F4F]/15 bg-[#F3F7F3] shrink-0">
                                  <img
                                    src={item.thumb}
                                    alt=""
                                    referrerPolicy="no-referrer"
                                    className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-2"
                                  />
                                </span>
                                <span
                                  className={`font-display text-3xl sm:text-4xl font-black tracking-tight leading-none transition-transform duration-200 group-hover:translate-x-1.5 ${
                                    isActive ? 'text-[#0B3C7C]' : 'text-[#0D2F4F]'
                                  }`}
                                >
                                  {item.label}
                                </span>
                              </div>
                              <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#0D2F4F] text-[#0D2F4F] transition-all duration-200 group-hover:bg-[#A6EB67] group-hover:rotate-12 shrink-0">
                                <ArrowUpRight className="w-4 h-4" />
                              </span>
                            </button>
                          </motion.li>
                        );
                      }
                    )}
                  </ul>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Top-Right Pull-Tab with perforated tear line & serrated tooth edge */}
        <motion.button
          type="button"
          onClick={toggleMenu}
          aria-expanded={open}
          aria-controls="site-menu-panel"
          initial={{ y: '-140%' }}
          animate={{ y: revealed ? '0%' : '-140%' }}
          transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="menu-tab pointer-events-auto relative ml-auto cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A6EB67]"
        >
          <span className="menu-tab-sheet menu-tab-teeth relative block bg-[#FDFCFB] px-6 pt-5 pb-5 text-sm sm:text-base font-display font-black tracking-[0.06em] text-[#0D2F4F] drop-shadow-md transition-transform duration-200 hover:translate-y-0.5">
            {/* Dashed tear-off perforation line */}
            <span
              className="pointer-events-none absolute top-2.5 left-2 right-2 border-t-2 border-dashed border-[#0D2F4F]/35"
              aria-hidden="true"
            />
            <span className="whitespace-nowrap">{open ? 'CLOSE' : 'PULL ME'}</span>
          </span>
        </motion.button>
      </nav>

      {/* BOTTOM-RIGHT FIXED SOOTHING SOUND PILL TOGGLE */}
      <motion.button
        type="button"
        onClick={toggleSound}
        aria-label={soundOn ? 'Mute soothing wellness tune' : 'Play soothing wellness tune'}
        aria-pressed={soundOn}
        title={soundOn ? 'Soothing Tune: On' : 'Soothing Tune: Off'}
        initial={{ y: '180%', opacity: 0 }}
        animate={{ y: revealed ? '0%' : '180%', opacity: revealed ? 1 : 0 }}
        transition={{ duration: 0.55, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
        className={`menu-sound fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 pointer-events-auto flex items-center rounded-full border-2 border-[#0D2F4F] shadow-lg transition-colors duration-300 cursor-pointer w-[84px] h-[40px] px-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A6EB67] ${
          soundOn ? 'bg-[#A6EB67] text-[#0D2F4F]' : 'bg-white text-[#0D2F4F]/60'
        }`}
      >
        {/* Sliding disc inside the pill */}
        <span
          className={`absolute top-1/2 -translate-y-1/2 w-[30px] h-[30px] rounded-full border border-[#0D2F4F] bg-[#D9F7C4] flex items-center justify-center transition-all duration-300 ${
            soundOn ? 'left-[48px]' : 'left-[4px]'
          }`}
          aria-hidden="true"
        >
          <img
            src={IMAGES.appLogo}
            alt=""
            className="w-full h-full object-contain rounded-full bg-white p-0.5"
          />
        </span>
        {/* Speaker icon on the opposite end */}
        <span
          className={`absolute top-1/2 -translate-y-1/2 transition-all duration-300 ${
            soundOn ? 'left-[14px]' : 'left-[50px]'
          }`}
        >
          {soundOn ? (
            <Volume2 className="w-4 h-4 text-[#0D2F4F]" />
          ) : (
            <VolumeX className="w-4 h-4 text-[#0D2F4F]/70" />
          )}
        </span>
      </motion.button>
    </>
  );
}
