import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from './Icon';
import { canHint, isExercise, isLocked, revealLimit, useTeacherMode } from '../lib/exerciseGate';
import { displayFractions, Rich, Tex } from '../lib/tex';
import { progress, useProgress } from '../lib/progress';
import { EquilateralSplit } from '../simulations/EquilateralSplit';
import { SimilarTriangles } from '../simulations/SimilarTriangles';
import type { Problem } from '../types';
import { RoleLegend, TriangleFigure } from './TriangleFigure';

const AUTOPLAY_MS = 2800;

/** Figure state at step i: reveals / angle marks / ref accumulate; highlight is per-step. */
function figureStateAt(problem: Problem, i: number) {
  const reveal: Record<string, string> = {};
  const marks: Record<string, string> = {};
  let ref: string | undefined;
  let stage = 0;
  let angle: number | undefined;
  for (let k = 0; k <= i; k++) {
    const f = problem.steps[k]?.fig;
    if (!f) continue;
    Object.assign(reveal, f.reveal);
    Object.assign(marks, f.angleMarks);
    if (f.ref !== undefined) ref = f.ref;
    if (f.stage !== undefined) stage = f.stage;
    if (f.angle !== undefined) angle = f.angle;
  }
  return { reveal, marks, ref, stage, angle, highlight: problem.steps[i]?.fig?.highlight ?? [] };
}

interface ProblemPlayerProps {
  problem: Problem;
  /** Embedded in a page: no global keyboard shortcuts, no inner scroll box. */
  embedded?: boolean;
  /** Controlled mode (lesson mode drives the step from outside). -1 = question only. */
  step?: number;
  onStepChange?: (step: number) => void;
}

export function ProblemPlayer({ problem, embedded = false, step: controlledStep, onStepChange }: ProblemPlayerProps) {
  const { exercises } = useProgress();
  const teacher = useTeacherMode();
  const rec = exercises[problem.id];
  const locked = isLocked(problem, rec, teacher);
  const limit = revealLimit(problem, rec, teacher);
  /** Learner data is only recorded for exercises, and never in teacher mode. */
  const tracked = isExercise(problem) && !teacher;

  const [innerStep, setInnerStep] = useState(-1);
  const step = Math.min(controlledStep ?? innerStep, limit);
  const applyStep = (next: number) => (onStepChange ? onStepChange(next) : setInnerStep(next));
  const setStep = (update: number | ((s: number) => number)) => applyStep(Math.min(typeof update === 'function' ? update(step) : update, limit));
  const [playing, setPlaying] = useState(false);
  const [choice, setChoice] = useState<number | null>(null);
  const listRef = useRef<HTMLOListElement>(null);

  const n = problem.steps.length;
  const done = step >= n - 1;

  const takeHint = () => {
    progress.updateExercise(problem.id, { hint: true });
    applyStep(0);
  };
  // Not clamped: the new limit only applies after the store update re-renders.
  const unlock = () => {
    progress.updateExercise(problem.id, { unlocked: true });
    applyStep(step + 1);
  };
  const pick = (i: number) => {
    setChoice(i);
    if (tracked) progress.updateExercise(problem.id, { unlocked: true, result: rec?.result ?? (i === problem.correct ? 'right' : 'wrong') });
  };
  const fig = useMemo(() => figureStateAt(problem, step), [problem, step]);

  useEffect(() => {
    if (done) {
      progress.markComplete(problem.id);
      setPlaying(false);
    }
  }, [done, problem.id]);

  useEffect(() => {
    if (!playing || done) return;
    const id = window.setTimeout(() => setStep((s) => Math.min(s + 1, n - 1)), step < 0 ? 300 : AUTOPLAY_MS);
    return () => window.clearTimeout(id);
  }, [playing, step, done, n]);

  useEffect(() => {
    if (embedded) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest('input, textarea, select')) return;
      if (e.key === 'ArrowRight') setStep((s) => Math.min(s + 1, n - 1));
      if (e.key === 'ArrowLeft') setStep((s) => Math.max(s - 1, -1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-bind when step changes so setStep sees the current step
  }, [embedded, n, step, limit]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>('[data-current="true"]');
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [step]);

  const hasFigure = Boolean(problem.figures?.length || problem.customFigure);
  const isMcq = Boolean(problem.options?.length);

  return (
    <div className={`grid gap-5 ${hasFigure ? 'lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]' : ''}`}>
      {/* Question + figure */}
      <div className="space-y-4">
        <div className="card p-5">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="chip bg-indigo-50 text-indigo-700">{problem.group}</span>
            <span className="chip bg-slate-100 text-slate-700">{problem.label}</span>
            {problem.concept && <span className="chip bg-amber-50 text-amber-700">{problem.concept}</span>}
            {isExercise(problem) && teacher && <span className="chip bg-teal-50 text-teal-700">Teacher mode · solution open</span>}
          </div>
          <p className="text-[15px] leading-relaxed text-slate-800">
            <Rich text={problem.question} />
          </p>

          {isMcq && (
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {problem.options!.map((opt, i) => {
                const picked = choice === i;
                const reveal = choice !== null || done;
                const correct = i === problem.correct;
                const tone = reveal && correct ? 'border-emerald-400 bg-emerald-50 text-emerald-800' : picked && !correct ? 'border-rose-300 bg-rose-50 text-rose-700' : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50';
                return (
                  <button key={i} type="button" disabled={choice !== null} onClick={() => pick(i)} className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition disabled:cursor-default ${tone}`}>
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">{problem.options!.length === 2 ? (i === 0 ? 'T' : 'F') : String.fromCharCode(65 + i)}</span>
                    <Rich text={displayFractions(opt)} />
                  </button>
                );
              })}
            </div>
          )}
          {isMcq && choice !== null && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className={`mt-3 text-sm font-semibold ${choice === problem.correct ? 'text-emerald-700' : 'text-rose-600'}`}>
              <Icon name={choice === problem.correct ? 'check' : 'close'} className="mr-1 size-[1.1em]" />
              {choice === problem.correct ? 'Correct! Step through the solution to see why.' : 'Not quite — step through the solution to see why.'}
            </motion.p>
          )}
        </div>

        {hasFigure && (
          <div className="card p-4 lg:sticky lg:top-20">
            <div className={`grid gap-2 ${problem.figures && problem.figures.length > 1 ? 'sm:grid-cols-2' : ''}`}>
              {problem.customFigure === 'equilateral' && <EquilateralSplit stage={fig.stage} />}
              {problem.customFigure === 'similar' && <SimilarTriangles stage={fig.stage} />}
              {problem.figures?.map((spec, i) => (
                <div key={i}>
                  <TriangleFigure
                    spec={spec}
                    angle={fig.angle}
                    highlight={fig.highlight}
                    sideLabels={fig.reveal}
                    angleMarks={fig.marks}
                    refVertex={fig.ref !== undefined && spec.vertices.includes(fig.ref) ? fig.ref : undefined}
                  />
                  {spec.caption && <p className="text-center text-xs text-slate-500">{spec.caption}</p>}
                </div>
              ))}
            </div>
            <RoleLegend className="mt-2 justify-center" />
          </div>
        )}
      </div>

      {/* Steps */}
      <div className="card flex flex-col p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="font-display text-base font-bold text-slate-900">Step-by-step solution</h3>
          <span className="text-xs font-medium text-slate-500">
            {Math.max(step + 1, 0)} / {n}
          </span>
        </div>
        <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <motion.div className="h-full rounded-full bg-indigo-500" animate={{ width: `${((step + 1) / n) * 100}%` }} />
        </div>

        <ol ref={listRef} className={`space-y-3 ${embedded ? '' : 'max-h-[60vh] overflow-y-auto pr-1'}`}>
          {step < 0 && !locked && (
            <li className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
              Try it yourself first, then press <strong>Next step</strong> (or <kbd className="rounded bg-slate-100 px-1" aria-label="right arrow key"><Icon name="arrow-right" /></kbd>) to reveal the solution one step at a time.
            </li>
          )}
          <AnimatePresence initial={false}>
            {problem.steps.slice(0, step + 1).map((s, i) => {
              const current = i === step;
              return (
                <motion.li
                  key={i}
                  data-current={current}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35 }}
                  className={`flex gap-3 rounded-xl p-3 transition-colors ${current ? 'bg-indigo-50 ring-1 ring-indigo-200' : 'opacity-75'}`}
                >
                  <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${current ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>{i + 1}</span>
                  <div className="min-w-0 flex-1 text-[14.5px] leading-relaxed text-slate-700">
                    <Rich text={s.text} />
                    {s.math && <Tex tex={s.math} wrap className="mt-1 text-slate-900" />}
                    {s.rule && (
                      <div className="mt-1.5">
                        <span className="chip bg-violet-50 text-violet-700">
                          <Icon name="flag" className="mr-1 size-3" />
                          <Rich text={s.rule} />
                        </span>
                      </div>
                    )}
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ol>

        {locked && (
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="flex items-center gap-2 font-semibold text-amber-900">
              <Icon name="pencil" /> Solve it in your notebook first
            </p>
            <p className="mt-1 text-sm text-amber-800">
              {isMcq ? 'Pick your answer above. The solution unlocks once you have chosen.' : 'The step-by-step solution unlocks once you have tried it yourself.'}
              {step < 0 && canHint(problem) && ' Stuck? A hint shows only the first step.'}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {step < 0 && canHint(problem) && (
                <button type="button" className="btn-ghost" onClick={takeHint}>
                  <Icon name="lightbulb" className="size-4 text-amber-500" /> Show a hint
                </button>
              )}
              {!isMcq && (
                <button type="button" className="btn-primary" onClick={unlock}>
                  I’ve tried — show solution
                </button>
              )}
            </div>
          </div>
        )}

        <AnimatePresence>
          {done && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="mb-1 flex items-center gap-1 text-xs font-bold tracking-wide text-emerald-700 uppercase">
                <Icon name="check" className="size-3.5" /> Answer
              </p>
              <div className="text-[15px] text-emerald-900">
                <Rich text={problem.answer} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {done && tracked && !isMcq && (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 p-3 text-sm">
            <span className="font-semibold text-slate-700">Did you get it right?</span>
            {(['right', 'wrong'] as const).map((r) => {
              const on = rec?.result === r;
              const tone = on ? (r === 'right' ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-rose-300 bg-rose-50 text-rose-700') : 'border-slate-200 text-slate-600 hover:bg-slate-50';
              return (
                <button key={r} type="button" onClick={() => progress.updateExercise(problem.id, { result: r })} className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 font-semibold transition ${tone}`}>
                  <Icon name={r === 'right' ? 'check' : 'close'} />
                  {r === 'right' ? 'I got it' : 'I got it wrong'}
                </button>
              );
            })}
            {rec?.result && <span className="text-xs text-slate-500">Saved to your progress</span>}
          </div>
        )}

        {!locked && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
            <button type="button" className="btn-ghost" onClick={() => setStep((s) => Math.max(s - 1, -1))} disabled={step < 0}>
              <Icon name="arrow-left" /> Back
            </button>
            <button type="button" className="btn-primary" onClick={() => setStep((s) => Math.min(s + 1, n - 1))} disabled={done}>
              {step < 0 ? 'Start solution' : 'Next step'} <Icon name="arrow-right" />
            </button>
            <button type="button" className="btn-ghost" onClick={() => (done ? (setStep(-1), setPlaying(true)) : setPlaying((p) => !p))}>
              <Icon name={playing ? 'pause' : done ? 'replay' : 'play'} className="size-[1em]" />
              {playing ? 'Pause' : done ? 'Replay' : 'Auto-play'}
            </button>
            {!done && (
              <button type="button" className="ml-auto text-xs font-semibold text-slate-500 hover:text-indigo-600" onClick={() => setStep(n - 1)}>
                Show all
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
