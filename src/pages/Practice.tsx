import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { TriangleFigure } from '../components/TriangleFigure';
import { progress, type QuizAttempt, type QuizCategory } from '../lib/progress';
import { CATEGORY_LABEL, generateQuiz, type QuizQuestion } from '../lib/quiz';
import { displayFractions, Rich } from '../lib/tex';

const QUESTIONS_PER_ROUND = 10;

export default function Practice() {
  const [questions, setQuestions] = useState<QuizQuestion[]>(() => generateQuiz(QUESTIONS_PER_ROUND));
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Array<number | null>>(() => Array(QUESTIONS_PER_ROUND).fill(null));
  const [finished, setFinished] = useState<QuizAttempt | null>(null);

  const q = questions[i];
  const picked = answers[i];

  const choose = (k: number) => {
    if (picked !== null) return;
    setAnswers((a) => a.map((v, idx) => (idx === i ? k : v)));
  };

  const finish = () => {
    const byCat: QuizAttempt['byCat'] = {};
    questions.forEach((qq, k) => {
      const cur = byCat[qq.category] ?? [0, 0];
      byCat[qq.category] = [cur[0] + (answers[k] === qq.correct ? 1 : 0), cur[1] + 1];
    });
    const attempt: QuizAttempt = { at: Date.now(), score: questions.filter((qq, k) => answers[k] === qq.correct).length, total: questions.length, byCat };
    progress.addQuizAttempt(attempt);
    setFinished(attempt);
  };

  const restart = () => {
    setQuestions(generateQuiz(QUESTIONS_PER_ROUND));
    setAnswers(Array(QUESTIONS_PER_ROUND).fill(null));
    setI(0);
    setFinished(null);
  };

  if (finished) {
    const pct = Math.round((finished.score / finished.total) * 100);
    const C = 2 * Math.PI * 52;
    return (
      <div className="mx-auto max-w-2xl">
        <div className="card p-8 text-center">
          <svg viewBox="0 0 120 120" className="mx-auto h-40 w-40" role="img" aria-label={`Score ${pct} percent`}>
            <circle cx={60} cy={60} r={52} fill="none" stroke="#e2e8f0" strokeWidth={10} />
            <motion.circle cx={60} cy={60} r={52} fill="none" stroke={pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#f43f5e'} strokeWidth={10} strokeLinecap="round" transform="rotate(-90 60 60)" strokeDasharray={C} initial={{ strokeDashoffset: C }} animate={{ strokeDashoffset: C * (1 - pct / 100) }} transition={{ duration: 1.2 }} />
            <text x={60} y={58} textAnchor="middle" fontSize={26} fontWeight={800} fill="#0f172a">
              {finished.score}/{finished.total}
            </text>
            <text x={60} y={78} textAnchor="middle" fontSize={11} fill="#64748b">
              {pct}%
            </text>
          </svg>
          <h1 className="font-display mt-4 text-2xl font-extrabold text-slate-900">{pct >= 80 ? 'Excellent work!' : pct >= 50 ? 'Good effort!' : 'Keep practising!'}</h1>
          <div className="mt-6 space-y-2 text-left">
            {(Object.entries(finished.byCat) as Array<[QuizCategory, [number, number]]>).map(([cat, [c, n]]) => (
              <div key={cat} className="flex items-center gap-3 text-sm">
                <span className="w-44 shrink-0 text-slate-600">{CATEGORY_LABEL[cat]}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${c / n >= 0.8 ? 'bg-emerald-500' : c / n >= 0.5 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${(c / n) * 100}%` }} />
                </div>
                <span className="w-10 text-right font-semibold text-slate-700 tabular-nums">
                  {c}/{n}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button type="button" className="btn-primary" onClick={restart}>
              <Icon name="replay" /> New quiz
            </button>
            <Link to="/progress" className="btn-ghost">
              View progress dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900">Practice quiz</h1>
        <p className="mt-1 text-slate-600">Ten questions from across the chapter. You get a new set every time.</p>
      </header>

      <div className="mb-4 flex gap-1.5">
        {questions.map((qq, k) => (
          <button
            key={qq.id}
            type="button"
            onClick={() => setI(k)}
            aria-label={`Question ${k + 1}`}
            className={`h-2 flex-1 rounded-full transition ${k === i ? 'bg-indigo-600' : answers[k] === null ? 'bg-slate-200' : answers[k] === qq.correct ? 'bg-emerald-400' : 'bg-rose-400'}`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={q.id + i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="card p-6">
          <div className="mb-3 flex items-center justify-between">
            <span className="chip bg-indigo-50 text-indigo-700">{CATEGORY_LABEL[q.category]}</span>
            <span className="text-xs font-semibold text-slate-400">
              Question {i + 1} of {questions.length}
            </span>
          </div>
          <p className="font-display text-xl font-bold text-slate-900">
            <Rich text={q.prompt} />
          </p>
          {q.figure && (
            <div className="mx-auto mt-3 max-w-sm">
              <TriangleFigure spec={q.figure.spec} refVertex={q.category === 'ratios' ? undefined : null} />
            </div>
          )}
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {q.options.map((opt, k) => {
              const show = picked !== null;
              const tone = show && k === q.correct ? 'border-emerald-400 bg-emerald-50' : show && k === picked ? 'border-rose-300 bg-rose-50' : 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50';
              return (
                <button key={k} type="button" onClick={() => choose(k)} disabled={show} className={`flex min-h-14 items-center gap-3 rounded-xl border px-4 py-3 text-left text-base transition disabled:cursor-default ${tone}`}>
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">{String.fromCharCode(65 + k)}</span>
                  <Rich text={displayFractions(opt)} />
                </button>
              );
            })}
          </div>
          {picked !== null && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={`mt-4 rounded-xl p-4 text-sm ${picked === q.correct ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'}`}>
              <p className="mb-1 flex items-center gap-1.5 font-bold">
                <Icon name={picked === q.correct ? 'check' : 'close'} />
                {picked === q.correct ? 'Correct' : 'Not quite'}
              </p>
              <Rich text={q.explain} />
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-5 flex items-center justify-between">
        <button type="button" className="btn-ghost" disabled={i === 0} onClick={() => setI((k) => k - 1)}>
          <Icon name="arrow-left" /> Previous
        </button>
        {i < questions.length - 1 ? (
          <button type="button" className="btn-primary" disabled={picked === null} onClick={() => setI((k) => k + 1)}>
            Next question <Icon name="arrow-right" />
          </button>
        ) : (
          <button type="button" className="btn-primary" disabled={answers.some((a) => a === null)} onClick={finish}>
            Finish & see score
          </button>
        )}
      </div>
    </div>
  );
}
