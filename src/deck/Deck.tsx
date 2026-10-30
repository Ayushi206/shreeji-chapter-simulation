import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState, type MouseEvent, type TouchEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { ChapterQuote } from '../components/notes';
import { ProblemPlayer } from '../components/ProblemPlayer';
import { RoleLegend } from '../components/TriangleFigure';
import { SECTIONS } from '../content';
import { revealLimit, useTeacherMode } from '../lib/exerciseGate';
import { useProgress } from '../lib/progress';
import { HeroTriangle } from '../simulations/IdentityLab';
import { Contents } from './Contents';
import { SLIDES, slideTitle, type Slide } from './slides';

/** Taps on these never navigate — they keep working as normal controls. */
const INTERACTIVE = 'button, a, input, select, textarea, label, summary, [role="slider"], [data-no-nav]';
const SAVED_KEY = 'trig-lab:lesson-slide';
const HINT_KEY = 'trig-lab:lesson-hint-seen';
const PIN_KEY = 'trig-lab:contents-pinned';
const SWIPE_PX = 50;
const DESKTOP = '(min-width: 1024px)';

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

function readNumber(key: string): number | null {
  try {
    const v = localStorage.getItem(key);
    return v === null ? null : Number(v);
  } catch {
    return null;
  }
}
function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage unavailable */
  }
}

export default function Deck() {
  const { n } = useParams();
  const navigate = useNavigate();
  const total = SLIDES.length;
  // `n` is a screen number (#/play/22) or a slide id from a link (#/play/p-8.1-q1).
  const isNumber = n === undefined || /^\d+$/.test(n);
  const byId = isNumber ? -1 : SLIDES.findIndex((s) => s.id === n);
  const index = byId >= 0 ? byId : Math.min(Math.max((Number(n) || 1) - 1, 0), total - 1);
  const slide = SLIDES[index];

  const [step, setStep] = useState(-1);
  const [dir, setDir] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hint, setHint] = useState(() => readNumber(HINT_KEY) === null);
  const isDesktop = useMediaQuery(DESKTOP);
  const [pinPref, setPinPref] = useState(() => readNumber(PIN_KEY) !== 0); // pinned by default on desktop
  const pinned = isDesktop && pinPref;
  const togglePin = () => {
    write(PIN_KEY, pinPref ? '0' : '1');
    setPinPref(!pinPref);
    setMenuOpen(false);
  };
  const openContents = () => (isDesktop ? togglePin() : setMenuOpen(true));
  const stageRef = useRef<HTMLDivElement>(null);
  const touch = useRef<{ x: number; y: number; skip: boolean } | null>(null);
  const swiped = useRef(false);

  // A locked exercise only reveals up to its hint, so a tap moves on instead of giving the solution away.
  const { exercises } = useProgress();
  const teacher = useTeacherMode();
  const lastStepOf = useCallback((s: Slide | undefined) => (s?.kind === 'problem' ? revealLimit(s.problem, exercises[s.problem.id], teacher) : -1), [exercises, teacher]);

  // No slide in the URL → resume where the learner left off.
  useEffect(() => {
    if (n === undefined) {
      const saved = readNumber(SAVED_KEY);
      navigate(`/play/${saved && saved >= 1 && saved <= total ? saved : 1}`, { replace: true });
    } else if (!isNumber) {
      navigate(`/play/${index + 1}`, { replace: true });
    }
  }, [n, isNumber, index, navigate, total]);

  useEffect(() => {
    // Remember only real screen numbers; a bare #/play is about to redirect to the saved one.
    if (n !== undefined && isNumber) write(SAVED_KEY, String(index + 1));
    stageRef.current?.scrollTo({ top: 0 });
  }, [index, n, isNumber]);

  const goTo = useCallback(
    (i: number, nextStep: number, direction: number) => {
      setDir(direction);
      setStep(nextStep);
      setMenuOpen(false);
      navigate(`/play/${i + 1}`, { replace: true });
    },
    [navigate],
  );

  const dismissHint = () => {
    if (hint) {
      setHint(false);
      write(HINT_KEY, '1');
    }
  };

  const next = useCallback(() => {
    dismissHint();
    if (slide.kind === 'problem' && step < lastStepOf(slide)) return setStep(step + 1);
    if (index < total - 1) goTo(index + 1, -1, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slide, step, index, total, goTo, lastStepOf]);

  const prev = useCallback(() => {
    dismissHint();
    if (slide.kind === 'problem' && step > -1) return setStep(step - 1);
    if (index > 0) goTo(index - 1, lastStepOf(SLIDES[index - 1]), -1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slide, step, index, goTo, lastStepOf]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest('input, textarea, select')) return;
      if (['ArrowRight', 'PageDown', ' '].includes(e.key)) {
        e.preventDefault();
        next();
      } else if (['ArrowLeft', 'PageUp'].includes(e.key)) {
        e.preventDefault();
        prev();
      } else if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev]);

  const onStageClick = (e: MouseEvent<HTMLDivElement>) => {
    if (swiped.current) {
      swiped.current = false;
      return;
    }
    if ((e.target as HTMLElement).closest(INTERACTIVE)) return;
    if (window.getSelection()?.toString()) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (e.clientX - rect.left > rect.width / 2) next();
    else prev();
  };

  const onTouchStart = (e: TouchEvent) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY, skip: Boolean((e.target as HTMLElement).closest(INTERACTIVE)) };
  };
  const onTouchEnd = (e: TouchEvent) => {
    const start = touch.current;
    touch.current = null;
    if (!start || start.skip) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy) * 1.5) {
      swiped.current = true;
      if (dx < 0) next();
      else prev();
    }
  };

  const toggleFullscreen = () => {
    try {
      if (document.fullscreenElement) void document.exitFullscreen();
      else void document.documentElement.requestFullscreen();
    } catch {
      /* not allowed (e.g. iframe without allowfullscreen) */
    }
  };

  const section = SECTIONS.find((s) => s.id === slide.section);
  const atStart = index === 0 && step <= -1;
  const atEnd = index === total - 1;

  const jump = (i: number) => goTo(i, -1, i >= index ? 1 : -1);

  return (
    <div className="fixed inset-0 flex flex-col bg-slate-50">
      {/* Top bar */}
      <header className="z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="flex h-12 items-center gap-2 px-3 sm:px-4">
          <button type="button" onClick={openContents} className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold transition ${pinned ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`} aria-label="Contents" title={isDesktop ? (pinned ? 'Hide contents' : 'Show contents') : 'Contents'}>
            <Icon name="menu" /> <span className="hidden sm:inline">Contents</span>
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">
              {section && <span className="mr-2 text-indigo-600">{section.id}</span>}
              {slideTitle(slide)}
            </p>
          </div>
          <span className="hidden text-xs font-semibold text-slate-500 tabular-nums sm:inline">
            {index + 1} / {total}
          </span>
          <button type="button" onClick={toggleFullscreen} className="hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100 sm:block" aria-label="Toggle full screen" title="Full screen">
            <Icon name="fullscreen" className="size-4" />
          </button>
        </div>
        <div className="h-1 bg-slate-100">
          <motion.div className="h-full bg-indigo-500" animate={{ width: `${((index + 1) / total) * 100}%` }} transition={{ duration: 0.3 }} />
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Pinned chapter navigator (desktop) */}
        {pinned && (
          <aside className="w-80 shrink-0 border-r border-slate-200">
            <Contents current={index} onJump={jump} pinned canPin onTogglePin={togglePin} onClose={togglePin} />
          </aside>
        )}

        <div className="relative min-w-0 flex-1">
          {/* Stage: tap right half → next, left half → previous */}
          <div ref={stageRef} className="absolute inset-0 overflow-y-auto overscroll-contain" onClick={onStageClick} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <AnimatePresence mode="wait" custom={dir} initial={false}>
              <motion.div
                key={slide.id}
                custom={dir}
                variants={{
                  enter: (d: number) => ({ opacity: 0, x: d * 60 }),
                  center: { opacity: 1, x: 0 },
                  exit: (d: number) => ({ opacity: 0, x: d * -60 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.28, ease: 'easeOut' }}
                className="mx-auto flex min-h-full w-full max-w-6xl flex-col px-4 py-6 sm:px-14 sm:py-8"
              >
                <SlideBody slide={slide} step={step} onStepChange={setStep} onRestart={() => goTo(0, -1, -1)} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Edge arrows (also clickable) */}
          <button type="button" onClick={prev} disabled={atStart} className="absolute top-1/2 left-1 z-10 hidden h-24 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-2xl text-slate-300 transition hover:bg-white/80 hover:text-indigo-600 disabled:opacity-0 sm:flex" aria-label="Previous">
            <Icon name="chevron-left" className="size-7" />
          </button>
          <button type="button" onClick={next} disabled={atEnd} className="absolute top-1/2 right-1 z-10 hidden h-24 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-2xl text-slate-300 transition hover:bg-white/80 hover:text-indigo-600 disabled:opacity-0 sm:flex" aria-label="Next">
            <Icon name="chevron-right" className="size-7" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {hint && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex justify-center px-4">
            <div className="flex items-center gap-3 rounded-full bg-slate-900/90 px-4 py-2 text-xs font-medium text-white shadow-lg sm:text-sm">
              <span className="inline-flex items-center gap-1">
                <Icon name="chevron-left" /> Tap left to go back
              </span>
              <span className="h-4 w-px bg-white/30" />
              <span className="inline-flex items-center gap-1">
                Tap right to continue <Icon name="chevron-right" />
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide-in navigator (mobile, or desktop when not pinned) */}
      <AnimatePresence>
        {menuOpen && !pinned && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-slate-900/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMenuOpen(false)} />
            <motion.nav className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] shadow-xl" initial={{ x: -340 }} animate={{ x: 0 }} exit={{ x: -340 }} transition={{ type: 'spring', stiffness: 300, damping: 32 }}>
              <Contents
                current={index}
                onJump={(i) => {
                  jump(i);
                  setMenuOpen(false);
                }}
                pinned={false}
                canPin={isDesktop}
                onTogglePin={togglePin}
                onClose={() => setMenuOpen(false)}
              />
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function SlideBody({ slide, step, onStepChange, onRestart }: { slide: Slide; step: number; onStepChange: (s: number) => void; onRestart: () => void }) {
  switch (slide.kind) {
    case 'cover':
      return (
        <div className="m-auto grid w-full items-center gap-8 md:grid-cols-2">
          <div>
            <p className="mb-3 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold tracking-wide text-indigo-700 uppercase">NCERT · Class 10 · Chapter 8</p>
            <h1 className="font-display text-4xl leading-tight font-extrabold text-slate-900 sm:text-5xl">
              Introduction to <span className="bg-linear-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Trigonometry</span>
            </h1>
            <ChapterQuote className="mt-5" />
            <p className="mt-5 text-lg text-slate-600">An interactive lesson. Tap the right side of the screen to move forward and the left side to go back.</p>
            <RoleLegend className="mt-6" />
          </div>
          <div className="card p-5">
            <HeroTriangle />
          </div>
        </div>
      );
    case 'section':
      return (
        <div className="m-auto max-w-3xl text-center">
          <motion.p initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="font-display text-7xl font-extrabold text-indigo-200 sm:text-8xl">
            {slide.section}
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="font-display mt-2 text-3xl font-extrabold text-slate-900 sm:text-5xl">
            {slide.title}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="mt-4 text-lg text-slate-600">
            {slide.blurb}
          </motion.p>
        </div>
      );
    case 'view':
      return (
        <div className="my-auto w-full">
          {!slide.bare && (
            <>
              <p className="mb-1 text-xs font-bold tracking-wider text-indigo-600 uppercase">{slide.kicker}</p>
              <h2 className="font-display mb-5 text-2xl font-bold text-slate-900 sm:text-3xl">{slide.title}</h2>
            </>
          )}
          {slide.body()}
        </div>
      );
    case 'problem':
      return (
        <div className="my-auto w-full">
          <ProblemPlayer key={slide.problem.id} problem={slide.problem} embedded step={step} onStepChange={onStepChange} />
        </div>
      );
    case 'end':
      return (
        <div className="m-auto max-w-xl text-center">
          <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 12 }} className="mx-auto grid size-24 place-items-center rounded-full bg-amber-100 text-amber-500">
            <Icon name="trophy" className="size-12" />
          </motion.p>
          <h1 className="font-display mt-4 text-3xl font-extrabold text-slate-900">Chapter complete!</h1>
          <p className="mt-2 text-slate-600">You have worked through every concept, example and exercise of Chapter 8.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/practice" className="btn-primary">
              Take the practice quiz
            </Link>
            <Link to="/progress" className="btn-ghost">
              My progress
            </Link>
            <button type="button" className="btn-ghost" onClick={onRestart}>
              <Icon name="replay" /> Start again
            </button>
          </div>
        </div>
      );
  }
}
