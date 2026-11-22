import React, { useState } from 'react';
import { ArrowLeft, ArrowUpRight, CheckCircle2, Mail, MapPin, Phone } from 'lucide-react';
import { IMAGES, NEWS_ITEMS, TAPES, TapeId } from '../data/tapes';
import { TapeRollGraphic, TapeStripPeel } from './TapeVisuals';
import { RoutePath } from './SiteMenu';
import { vicalarySound } from '../utils/sound';
import { FaqSection } from './FaqSection';

interface SubPageProps {
  onNavigate: (path: RoutePath) => void;
}

export function ProductsPage({ onNavigate }: SubPageProps) {
  return (
    <div className="bg-[#FDFCFB] paper-grain pt-28 pb-32 px-6 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-black tracking-[0.18em] text-[#0D2F4F]/70 uppercase mb-3">
          OUR MODULES
        </p>
        <h1 className="font-display font-black uppercase text-[#0D2F4F] text-5xl sm:text-7xl lg:text-8xl leading-[0.86] tracking-[-0.02em] mb-6">
          SIX TOOLS. ONE DAILY ROUTINE.
        </h1>
        <p className="text-lg text-[#0D2F4F]/80 max-w-2xl mb-14">
          Crafted inside VICALARY to unite nutrition clarity, grocery discipline, and calm faith.
          Pick the companion that supports your day.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TAPES.map((tape) => {
            const isDark = tape.id === 'budget';
            return (
              <button
                key={tape.id}
                type="button"
                onClick={() => {
                  vicalarySound.playRollClick();
                  onNavigate(`/products/${tape.id}`);
                }}
                style={{ backgroundColor: tape.bg }}
                className="group relative flex flex-col justify-between rounded-2xl p-7 text-left shadow-md transition-transform duration-200 hover:-translate-y-1 cursor-pointer overflow-hidden border border-[#0D2F4F]/12"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p
                        className="text-xs font-black tracking-[0.14em] uppercase opacity-80"
                        style={{ color: isDark ? '#D9F7C4' : '#0D2F4F' }}
                      >
                        THE {tape.persona}
                      </p>
                      <h2
                        className="font-display text-4xl font-black uppercase leading-none mt-1"
                        style={{ color: isDark ? '#FDFCFB' : '#0D2F4F' }}
                      >
                        {tape.name}
                      </h2>
                    </div>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0D2F4F] text-[#D9F7C4] shrink-0 transition-transform group-hover:rotate-12">
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </div>

                  <div className="my-7 flex justify-center">
                    <div className="w-36 h-36 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-105">
                      <TapeRollGraphic id={tape.id} className="w-full h-full drop-shadow-xl" />
                    </div>
                  </div>
                </div>

                <p
                  className="text-sm leading-relaxed font-medium"
                  style={{ color: isDark ? '#FDFCFB' : '#0D2F4F' }}
                >
                  {tape.copy}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function ProductDetailPage({
  tapeId,
  onNavigate,
}: SubPageProps & { tapeId: string }) {
  const tape = TAPES.find((t) => t.id === tapeId) ?? TAPES[0];
  const isDark = tape.id === 'budget';

  return (
    <div className="bg-[#FDFCFB] paper-grain pb-16">
      <div
        className="pt-28 pb-20 px-6 sm:px-10 transition-colors"
        style={{ backgroundColor: tape.bg }}
      >
        <div className="mx-auto max-w-6xl">
          <button
            type="button"
            onClick={() => onNavigate('/products')}
            className="inline-flex items-center gap-2 text-xs font-black tracking-[0.14em] uppercase mb-8 cursor-pointer hover:opacity-75"
            style={{ color: isDark ? '#FDFCFB' : '#0D2F4F' }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO OUR MODULES</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <p
                className="text-xs font-black tracking-[0.18em] uppercase mb-2"
                style={{ color: isDark ? '#D9F7C4' : '#0D2F4F' }}
              >
                THE {tape.persona}
              </p>
              <h1
                className="font-display font-black uppercase text-5xl sm:text-7xl lg:text-8xl leading-[0.86] tracking-[-0.02em]"
                style={{ color: isDark ? '#FDFCFB' : '#0D2F4F' }}
              >
                {tape.name}
              </h1>
              <p
                className="mt-6 text-xl sm:text-2xl font-medium leading-snug max-w-xl"
                style={{ color: isDark ? '#FDFCFB' : '#0D2F4F' }}
              >
                {tape.copy}
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-xs font-black tracking-[0.12em] uppercase">
                {tape.tags.map((tag, idx) => (
                  <React.Fragment key={tag}>
                    <span style={{ color: isDark ? '#D9F7C4' : '#0D2F4F' }}>{tag}</span>
                    {idx < tape.tags.length - 1 && (
                      <span style={{ color: isDark ? '#D9F7C4' : '#0D2F4F', opacity: 0.45 }}>/</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="w-60 h-60 sm:w-72 sm:h-72">
                <TapeRollGraphic
                  id={tape.id as TapeId}
                  className="w-full h-full drop-shadow-2xl"
                  showLabel
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl py-16 px-6 sm:px-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-6 space-y-6">
          <h2 className="font-display text-4xl font-black uppercase text-[#0D2F4F]">
            BUILT FOR EVERYDAY WELLNESS
          </h2>
          <ul className="space-y-3 text-base text-[#0D2F4F]/85">
            {tape.idealFor.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#13EC37] shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-6 rounded-2xl bg-white p-8 border border-[#0D2F4F]/12 shadow-sm">
          <h2 className="font-display text-3xl font-black uppercase text-[#0D2F4F] mb-6">
            CAPABILITIES
          </h2>
          <dl className="divide-y divide-[#0D2F4F]/10 text-sm">
            <div className="py-3 flex justify-between gap-4">
              <dt className="font-bold text-[#0D2F4F]/60 uppercase">Focus Metrics</dt>
              <dd className="font-semibold text-[#0D2F4F] text-right tabular-nums">
                {tape.specs.widths}
              </dd>
            </div>
            <div className="py-3 flex justify-between gap-4">
              <dt className="font-bold text-[#0D2F4F]/60 uppercase">Core Engine</dt>
              <dd className="font-semibold text-[#0D2F4F] text-right tabular-nums">
                {tape.specs.length}
              </dd>
            </div>
            <div className="py-3 flex justify-between gap-4">
              <dt className="font-bold text-[#0D2F4F]/60 uppercase">Data Foundation</dt>
              <dd className="font-semibold text-[#0D2F4F] text-right">{tape.specs.backing}</dd>
            </div>
            <div className="py-3 flex justify-between gap-4">
              <dt className="font-bold text-[#0D2F4F]/60 uppercase">Daily Integration</dt>
              <dd className="font-semibold text-[#0D2F4F] text-right">{tape.specs.adhesion}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

export function AboutPage({ onNavigate }: SubPageProps) {
  return (
    <div className="bg-[#FDFCFB] paper-grain pt-28 pb-32 px-6 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-black tracking-[0.18em] text-[#0D2F4F]/70 uppercase mb-3">
          ABOUT VICALARY
        </p>
        <h1 className="font-display font-black uppercase text-[#0D2F4F] text-5xl sm:text-7xl lg:text-8xl leading-[0.86] tracking-[-0.02em] mb-8">
          MINDFUL NUTRITION MEETS DAILY FAITH.
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-16">
          <div className="lg:col-span-7 space-y-5 text-lg text-[#0D2F4F]/85 leading-relaxed">
            <p>
              Built as an all-in-one holistic companion, <strong>VICALARY (VicCalary)</strong>{' '}
              replaces fragmented calorie counters with calm, trustworthy guidance spanning meal
              camera logging, verified barcode truth, and realistic 30-day grocery budgeting.
            </p>
            <p>
              With time-aware 7-day recipes, warm two-way voice health coaching, and local
              prayer-window Quranic &amp; Hadith reflections in 21+ languages, every routine honors
              both body and soul.
            </p>
          </div>
          <div className="lg:col-span-5 relative bg-white p-3 shadow-xl rotate-2 border border-[#0D2F4F]/12">
            <TapeStripPeel
              color="#D9F7C4"
              backColor="#A6EB67"
              rotate={-6}
              className="absolute -top-4 left-1/2 -translate-x-1/2 z-10"
            />
            <img
              src={IMAGES.landingHero}
              alt="Smiling woman holding fresh vegetables for VICALARY wellness"
              referrerPolicy="no-referrer"
              className="w-full aspect-[4/3] object-cover object-top"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('/products')}
          className="inline-flex items-center gap-2.5 rounded-full bg-[#0D2F4F] px-7 py-3.5 text-sm font-black tracking-[0.12em] text-[#D9F7C4] hover:scale-105 transition-transform cursor-pointer"
        >
          <span>EXPLORE ALL SIX MODULES</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function NewsPage() {
  return (
    <div className="bg-[#FDFCFB] paper-grain pt-28 pb-32 px-6 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-black tracking-[0.18em] text-[#0D2F4F]/70 uppercase mb-3">
          UPDATES &amp; RELEASES
        </p>
        <h1 className="font-display font-black uppercase text-[#0D2F4F] text-5xl sm:text-7xl lg:text-8xl leading-[0.86] tracking-[-0.02em] mb-12">
          WHAT&apos;S NEW.
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {NEWS_ITEMS.map((item) => (
            <article
              key={item.id}
              className="flex flex-col rounded-2xl overflow-hidden bg-white border border-[#0D2F4F]/12 shadow-sm"
            >
              <img
                src={item.image}
                alt={item.title}
                referrerPolicy="no-referrer"
                className="w-full aspect-[4/3] object-cover"
              />
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0D2F4F]/60 uppercase mb-2">
                  <span>{item.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{item.date}</span>
                </div>
                <h2 className="font-display text-3xl font-black uppercase text-[#0D2F4F] leading-tight mb-3">
                  {item.title}
                </h2>
                <p className="text-sm text-[#0D2F4F]/80 leading-relaxed">{item.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    vicalarySound.playTapePeel();
    setSubmitted(true);
  };

  return (
    <div className="bg-[#FDFCFB] paper-grain pt-28 pb-32 px-6 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-black tracking-[0.18em] text-[#0D2F4F]/70 uppercase mb-3">
          CONTACT
        </p>
        <h1 className="font-display font-black uppercase text-[#0D2F4F] text-5xl sm:text-7xl lg:text-8xl leading-[0.86] tracking-[-0.02em] mb-12">
          LET&apos;S CONNECT.
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5 space-y-6">
            <p className="text-base text-[#0D2F4F]/80 leading-relaxed">
              Nutrition partnerships, halal database suggestions, or questions about your VICALARY
              daily wellness routine? Drop us a note.
            </p>
            <div className="space-y-4 text-sm font-medium text-[#0D2F4F]">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-[#0B3C7C]" />
                <span>VICALARY Wellness Platform</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#0B3C7C]" />
                <span>hello@vicalary.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#0B3C7C]" />
                <span>21+ Languages Supported Worldwide</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            {submitted ? (
              <div className="rounded-2xl bg-[#D9F7C4] p-8 sm:p-10 text-[#0D2F4F] border-2 border-[#0D2F4F]">
                <CheckCircle2 className="w-10 h-10 mb-4" />
                <h2 className="font-display text-4xl font-black uppercase mb-2">
                  NOTE RECEIVED!
                </h2>
                <p className="text-base font-medium mb-6">
                  Thanks, {name}. Our team at VICALARY has received your message and will reply to{' '}
                  <strong>{email}</strong> shortly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setName('');
                    setEmail('');
                    setMessage('');
                  }}
                  className="rounded-full bg-[#0D2F4F] px-6 py-2.5 text-xs font-black tracking-wider text-[#D9F7C4] cursor-pointer"
                >
                  SEND ANOTHER NOTE
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="rounded-2xl bg-white p-8 border border-[#0D2F4F]/15 shadow-sm space-y-5"
              >
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-black uppercase tracking-wider text-[#0D2F4F] mb-2">
                    Your Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Yusuf Al-Mansoor"
                    className="w-full rounded-xl border border-[#0D2F4F]/20 bg-[#F3F7F3] px-4 py-3 text-sm text-[#0D2F4F] focus:border-[#0D2F4F] focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="block text-xs font-black uppercase tracking-wider text-[#0D2F4F] mb-2">
                    Email Address
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-[#0D2F4F]/20 bg-[#F3F7F3] px-4 py-3 text-sm text-[#0D2F4F] focus:border-[#0D2F4F] focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="contact-message" className="block text-xs font-black uppercase tracking-wider text-[#0D2F4F] mb-2">
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about your nutrition, budget, or wellness goals..."
                    className="w-full rounded-xl border border-[#0D2F4F]/20 bg-[#F3F7F3] px-4 py-3 text-sm text-[#0D2F4F] focus:border-[#0D2F4F] focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full bg-[#0D2F4F] px-7 py-3.5 text-xs font-black tracking-[0.14em] text-[#D9F7C4] hover:bg-[#0B3C7C] transition-colors cursor-pointer"
                >
                  <span>SEND MESSAGE</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function FaqPage() {
  return <FaqSection />;
}

export function LaunchPage({
  store,
  onNavigate,
}: SubPageProps & { store?: 'play' | 'apple' }) {
  const storeName =
    store === 'play'
      ? 'Google Play'
      : store === 'apple'
        ? 'Apple App Store'
        : 'iOS & Android';

  return (
    <section
      style={{ paddingBottom: 'calc(var(--curve-depth) + 5rem)' }}
      className="bg-[#FDFCFB] paper-grain pt-28 sm:pt-36 px-6 sm:px-10 text-[#0D2F4F]"
    >
      <div className="mx-auto max-w-4xl text-center flex flex-col items-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#0D2F4F] px-4 py-1.5 text-[11px] sm:text-xs font-black tracking-[0.18em] text-[#A6EB67] uppercase mb-6 shadow-md">
          <span>{storeName}</span>
          <span aria-hidden="true">·</span>
          <span>COMING SOON</span>
        </span>

        <h1
          className="font-display font-black uppercase text-[#0D2F4F] leading-[0.86] tracking-[-0.02em]"
          style={{ fontSize: 'clamp(2.6rem, 7.5vw, 5.75rem)' }}
        >
          THANK YOU FOR STAYING FOR THIS PLATFORM&apos;S LAUNCH.
        </h1>

        <p className="mt-6 sm:mt-8 text-base sm:text-xl font-medium text-[#0D2F4F]/80 max-w-2xl leading-relaxed">
          VICALARY for {storeName} is completing final nutrition accuracy, barcode truth, and
          calm daily-routine tuning. We appreciate you being here early for a companion built for
          both body and soul.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => {
              vicalarySound.playTapePeel();
              onNavigate('/');
            }}
            className="inline-flex items-center gap-2.5 rounded-full bg-[#0D2F4F] px-7 py-3.5 text-sm font-black tracking-[0.12em] text-[#D9F7C4] shadow-lg transition-transform duration-200 hover:scale-105 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO HOME</span>
          </button>
          <button
            type="button"
            onClick={() => {
              vicalarySound.playRollClick();
              onNavigate('/products');
            }}
            className="inline-flex items-center gap-2 rounded-full bg-[#A6EB67] border-2 border-[#0D2F4F] px-7 py-3.5 text-sm font-black tracking-[0.12em] text-[#0D2F4F] transition-transform duration-200 hover:scale-105 cursor-pointer"
          >
            <span>EXPLORE MODULES</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
