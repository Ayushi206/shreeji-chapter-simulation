import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { ALL_PROBLEMS, problemPath, SECTIONS } from '../content';
import { progress, useProgress, type QuizCategory } from '../lib/progress';
import { CATEGORY_LABEL, CATEGORY_LINK } from '../lib/quiz';
import type { ProblemGroup } from '../types';

const EXERCISE_GROUPS: ProblemGroup[] = ['Exercise 8.1', 'Exercise 8.2', 'Exercise 8.3'];

function Kpi({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">{label}</p>
      <p className="font-display mt-1 text-3xl font-extrabold text-slate-900 tabular-nums">{value}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

export default function Progress() {
  const { completed, quiz, exercises } = useProgress();
  const solved = ALL_PROBLEMS.filter((p) => completed[p.id]).length;
  const best = quiz.reduce((m, a) => Math.max(m, a.score / a.total), 0);
  const last = quiz.at(-1);
  const nextUp = ALL_PROBLEMS.find((p) => !completed[p.id]);

  const sections = SECTIONS.filter((s) => s.id !== '8.1' && s.id !== '8.5').map((s) => {
    const list = ALL_PROBLEMS.filter((p) => p.section === s.id);
    return { ...s, total: list.length, done: list.filter((p) => completed[p.id]).length };
  });

  const cats = Object.keys(CATEGORY_LABEL) as QuizCategory[];
  const catStats = cats.map((c) => {
    const [ok, n] = quiz.reduce<[number, number]>((acc, a) => {
      const v = a.byCat[c];
      return v ? [acc[0] + v[0], acc[1] + v[1]] : acc;
    }, [0, 0]);
    return { cat: c, ok, n, pct: n ? ok / n : null };
  });

  const exerciseStats = EXERCISE_GROUPS.map((group) => {
    const recs = ALL_PROBLEMS.filter((p) => p.group === group).map((p) => exercises[p.id]);
    return {
      group,
      total: recs.length,
      right: recs.filter((r) => r?.result === 'right').length,
      wrong: recs.filter((r) => r?.result === 'wrong').length,
      unmarked: recs.filter((r) => r?.unlocked && !r.result).length,
      hints: recs.filter((r) => r?.hint).length,
    };
  });
  const revisit = ALL_PROBLEMS.filter((p) => exercises[p.id]?.result === 'wrong');

  const history = quiz.slice(-10);
  const chartH = 140;

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900">My progress</h1>
          <p className="mt-1 text-slate-600">Saved in this browser. See what you have finished and which topics need more practice.</p>
        </div>
        <button
          type="button"
          className="text-sm font-semibold text-slate-400 hover:text-rose-600"
          onClick={() => {
            if (window.confirm('Reset all progress and quiz history?')) progress.reset();
          }}
        >
          Reset progress
        </button>
      </header>

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Problems solved" value={`${solved}/${ALL_PROBLEMS.length}`} sub={`${Math.round((solved / ALL_PROBLEMS.length) * 100)}% of the chapter`} />
        <Kpi label="Quizzes taken" value={String(quiz.length)} />
        <Kpi label="Best quiz score" value={quiz.length ? `${Math.round(best * 100)}%` : '–'} />
        <Kpi label="Last quiz" value={last ? `${last.score}/${last.total}` : '–'} sub={last ? new Date(last.at).toLocaleDateString() : undefined} />
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="font-display mb-4 font-bold text-slate-900">Completion by section</h2>
          <div className="space-y-4">
            {sections.map((s) => (
              <Link key={s.id} to={s.path} className="block">
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-semibold text-slate-700">
                    {s.id} {s.title}
                  </span>
                  <span className="text-slate-500 tabular-nums">
                    {s.done}/{s.total}
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <motion.div className="h-full rounded-full bg-indigo-500" initial={{ width: 0 }} animate={{ width: `${(s.done / s.total) * 100}%` }} transition={{ duration: 0.8 }} />
                </div>
              </Link>
            ))}
          </div>
          {nextUp && (
            <Link to={problemPath(nextUp.id)} className="mt-5 flex items-center justify-between rounded-xl bg-indigo-50 p-3 text-sm text-indigo-900 hover:bg-indigo-100">
              <span>
                <span className="font-semibold">Up next:</span> {nextUp.group} · {nextUp.label}
              </span>
              <Icon name="arrow-right" />
            </Link>
          )}
        </section>

        <section className="card p-5">
          <h2 className="font-display mb-1 font-bold text-slate-900">Topic strength</h2>
          <p className="mb-4 text-xs text-slate-500">From all your quiz answers</p>
          <div className="space-y-3">
            {catStats.map((c) => {
              const tone = c.pct === null ? 'bg-slate-300' : c.pct >= 0.8 ? 'bg-emerald-500' : c.pct >= 0.5 ? 'bg-amber-500' : 'bg-rose-500';
              const tag = c.pct === null ? 'No data yet' : c.pct >= 0.8 ? 'Strong' : c.pct >= 0.5 ? 'Getting there' : 'Needs practice';
              return (
                <div key={c.cat}>
                  <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                    <span className="text-slate-700">{CATEGORY_LABEL[c.cat]}</span>
                    <span className="flex items-center gap-2">
                      {c.pct !== null && c.pct < 0.5 && (
                        <Link to={CATEGORY_LINK[c.cat]} className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline">
                          Revise <Icon name="arrow-right" />
                        </Link>
                      )}
                      <span className="text-xs font-semibold text-slate-500">{tag}</span>
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${tone}`} style={{ width: `${(c.pct ?? 0) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <section className="card mb-8 p-5">
        <h2 className="font-display mb-1 font-bold text-slate-900">Exercise practice</h2>
        <p className="mb-4 text-xs text-slate-500">Your own results on exercise questions, tried before seeing the solution</p>
        <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
          <div className="space-y-4">
            {exerciseStats.map((g) => (
              <div key={g.group}>
                <div className="mb-1 flex flex-wrap justify-between gap-x-3 text-sm">
                  <span className="font-semibold text-slate-700">{g.group}</span>
                  <span className="inline-flex flex-wrap items-center gap-x-1.5 text-xs text-slate-500 tabular-nums">
                    <span className="inline-flex items-center gap-0.5 text-emerald-600">
                      <Icon name="check" /> {g.right}
                    </span>
                    ·
                    <span className="inline-flex items-center gap-0.5 text-rose-600">
                      <Icon name="close" /> {g.wrong}
                    </span>
                    ·
                    <span className="inline-flex items-center gap-0.5">
                      <Icon name="lightbulb" className="size-[1.1em] text-amber-500" /> {g.hints} hints
                    </span>
                    · {g.right + g.wrong + g.unmarked}/{g.total} tried
                  </span>
                </div>
                <div className="flex h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full bg-emerald-500" style={{ width: `${(g.right / g.total) * 100}%` }} />
                  <div className="h-full bg-rose-500" style={{ width: `${(g.wrong / g.total) * 100}%` }} />
                  <div className="h-full bg-slate-400" style={{ width: `${(g.unmarked / g.total) * 100}%` }} />
                </div>
              </div>
            ))}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
              {[
                ['bg-emerald-500', 'Got it right'],
                ['bg-rose-500', 'Got it wrong'],
                ['bg-slate-400', 'Tried, not marked'],
              ].map(([tone, label]) => (
                <span key={label} className="inline-flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${tone}`} />
                  {label}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700">To revisit</p>
            {revisit.length === 0 ? (
              <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-500">Questions you mark “I got it wrong” will appear here.</p>
            ) : (
              <ul className="max-h-48 space-y-1 overflow-y-auto">
                {revisit.map((p) => (
                  <li key={p.id}>
                    <Link to={problemPath(p.id)} className="flex items-center justify-between rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-900 hover:bg-rose-100">
                      <span>
                        {p.group} · {p.label}
                      </span>
                      <Icon name="arrow-right" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section className="card p-5">
        <h2 className="font-display mb-4 font-bold text-slate-900">Quiz history (last 10)</h2>
        {history.length === 0 ? (
          <div className="py-8 text-center">
            <p className="mb-3 text-slate-500">You haven’t taken a quiz yet.</p>
            <Link to="/practice" className="btn-primary">
              Take your first quiz
            </Link>
          </div>
        ) : (
          <div className="flex items-end gap-2" style={{ height: chartH + 40 }}>
            {history.map((a, k) => {
              const pct = a.score / a.total;
              return (
                <div key={a.at} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-xs font-semibold text-slate-600 tabular-nums">{Math.round(pct * 100)}%</span>
                  <motion.div
                    className={`w-full max-w-12 rounded-t-lg ${pct >= 0.8 ? 'bg-emerald-500' : pct >= 0.5 ? 'bg-amber-500' : 'bg-rose-500'}`}
                    initial={{ height: 0 }}
                    animate={{ height: Math.max(4, pct * chartH) }}
                    transition={{ delay: k * 0.05, duration: 0.6 }}
                  />
                  <span className="text-[10px] text-slate-400">#{quiz.length - history.length + k + 1}</span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
