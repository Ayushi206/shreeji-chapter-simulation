import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export function SectionHeader({ number, title, intro }: { number: string; title: string; intro: string }) {
  return (
    <motion.header initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
      <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold tracking-wide text-indigo-700 uppercase">Section {number}</p>
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
      <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-600">{intro}</p>
    </motion.header>
  );
}

const CALLOUT_TONE = {
  remark: 'border-sky-200 bg-sky-50 text-sky-900',
  warning: 'border-rose-200 bg-rose-50 text-rose-900',
  history: 'border-amber-200 bg-amber-50 text-amber-950',
  tip: 'border-emerald-200 bg-emerald-50 text-emerald-900',
};

export function Callout({ tone = 'remark', title, children }: { tone?: keyof typeof CALLOUT_TONE; title: string; children: ReactNode }) {
  return (
    <div className={`rounded-2xl border p-4 text-sm leading-relaxed ${CALLOUT_TONE[tone]}`}>
      <p className="mb-1 font-bold">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
