import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon, type IconName } from '../components/Icon';
import { TeacherToggle } from '../components/TeacherToggle';
import { SECTIONS } from '../content';
import { useProgress } from '../lib/progress';
import { SLIDES, type Slide } from './slides';

interface Item {
  slide: Slide;
  index: number;
  label: string;
  sub: string;
}
interface Group {
  key: string;
  number: string;
  title: string;
  items: Item[];
  problemIds: string[];
}

const groupKeyOf = (s: Slide) => s.section || (s.kind === 'end' ? '8.5' : 'start');

function itemLabel(s: Slide): { label: string; sub: string } {
  switch (s.kind) {
    case 'cover':
      return { label: 'Cover', sub: '' };
    case 'end':
      return { label: 'Chapter complete', sub: '' };
    case 'section':
      return { label: 'Section introduction', sub: 'Concepts' };
    case 'view':
      return { label: s.title, sub: 'Concepts' };
    case 'problem':
      return { label: s.problem.label, sub: s.problem.group === 'Derivation' || s.problem.group === 'In-text' ? 'Concepts' : s.problem.group };
  }
}

/** Chapter navigator: sections → sub-groups → screens, built from the slide list. */
function buildGroups(): Group[] {
  const groups: Group[] = [];
  SLIDES.forEach((slide, index) => {
    const key = groupKeyOf(slide);
    let g = groups.find((x) => x.key === key);
    if (!g) {
      const meta = SECTIONS.find((s) => s.id === key);
      g = { key, number: key === 'start' ? '' : key, title: meta?.title ?? 'Start', items: [], problemIds: [] };
      groups.push(g);
    }
    g.items.push({ slide, index, ...itemLabel(slide) });
    if (slide.kind === 'problem') g.problemIds.push(slide.problem.id);
  });
  return groups;
}

const GROUPS = buildGroups();
export const groupOfIndex = (i: number) => groupKeyOf(SLIDES[i]);

interface ContentsProps {
  current: number;
  onJump: (index: number) => void;
  /** Rendered as the pinned desktop sidebar (shows "hide") vs the slide-in drawer (shows "close"). */
  pinned: boolean;
  canPin: boolean;
  onTogglePin: () => void;
  onClose: () => void;
}

export function Contents({ current, onJump, pinned, canPin, onTogglePin, onClose }: ContentsProps) {
  const { completed } = useProgress();
  const currentGroup = groupOfIndex(current);
  const [open, setOpen] = useState<Set<string>>(() => new Set([currentGroup]));
  const listRef = useRef<HTMLDivElement>(null);

  // Always keep the section you are in expanded.
  useEffect(() => {
    setOpen((s) => (s.has(currentGroup) ? s : new Set(s).add(currentGroup)));
  }, [currentGroup]);

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>('[data-current="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [current, open]);

  const toggle = (key: string) =>
    setOpen((s) => {
      const next = new Set(s);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const totals = useMemo(() => {
    const ids = GROUPS.flatMap((g) => g.problemIds);
    return { done: ids.filter((id) => completed[id]).length, total: ids.length };
  }, [completed]);

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b border-slate-100 p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="font-display font-bold text-slate-900">Chapter 8 · Contents</p>
          <div className="flex items-center gap-1">
            {canPin && (
              <button type="button" onClick={onTogglePin} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-indigo-600" title={pinned ? 'Hide sidebar' : 'Keep open as a sidebar'}>
                <Icon name={pinned ? 'sidebar-close' : 'pin'} className="size-3.5" />
                {pinned ? 'Hide' : 'Pin'}
              </button>
            )}
            {!pinned && (
              <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Close contents">
                <Icon name="close" className="size-4" />
              </button>
            )}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-500">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
            <motion.div className="h-full rounded-full bg-linear-to-r from-indigo-500 to-violet-500" animate={{ width: `${(totals.done / totals.total) * 100}%` }} />
          </div>
          <span className="tabular-nums">
            {totals.done}/{totals.total} solved
          </span>
        </div>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto p-2">
        {GROUPS.map((g) => {
          const isOpen = open.has(g.key);
          const done = g.problemIds.filter((id) => completed[id]).length;
          const isCurrent = g.key === currentGroup;
          if (g.key === 'start') {
            const it = g.items[0];
            return (
              <button key={g.key} type="button" data-current={current === it.index} onClick={() => onJump(it.index)} className={`mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${current === it.index ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`}>
                <Icon name="home" className="mx-0.5 size-4" /> Start of chapter
              </button>
            );
          }
          return (
            <div key={g.key} className={`mb-1 rounded-xl ${isCurrent ? 'bg-indigo-50/60' : ''}`}>
              <button type="button" onClick={() => toggle(g.key)} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left hover:bg-slate-100/80" aria-expanded={isOpen}>
                <span className={`font-display w-7 shrink-0 text-xs font-extrabold ${isCurrent ? 'text-indigo-600' : 'text-slate-400'}`}>{g.number}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-slate-900">{g.title}</span>
                  {g.problemIds.length > 0 && (
                    <span className="mt-1 flex items-center gap-2">
                      <span className="h-1 flex-1 overflow-hidden rounded-full bg-slate-200">
                        <span className={`block h-full rounded-full ${done === g.problemIds.length ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${(done / g.problemIds.length) * 100}%` }} />
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 tabular-nums">
                        {done}/{g.problemIds.length}
                      </span>
                    </span>
                  )}
                </span>
                <motion.span animate={{ rotate: isOpen ? 90 : 0 }} className="grid text-slate-400">
                  <Icon name="chevron-right" className="size-4" />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.ol initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden pb-2">
                    {g.items.map((it, k) => {
                      const showSub = it.sub && it.sub !== g.items[k - 1]?.sub;
                      const active = it.index === current;
                      const solved = it.slide.kind === 'problem' && completed[it.slide.problem.id];
                      const icon: IconName = it.slide.kind === 'problem' ? (solved ? 'check' : 'pencil') : it.slide.kind === 'view' ? 'play' : 'dot';
                      return (
                        <li key={it.slide.id}>
                          {showSub && <p className="mt-2 mb-1 pl-12 text-[10.5px] font-bold tracking-wider text-slate-400 uppercase">{it.sub}</p>}
                          <button
                            type="button"
                            data-current={active}
                            onClick={() => onJump(it.index)}
                            className={`flex w-full items-center gap-2 rounded-lg py-1.5 pr-3 pl-5 text-left text-[13px] transition ${active ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-white hover:text-slate-900'}`}
                          >
                            <span className={`grid w-5 shrink-0 place-items-center ${active ? 'text-indigo-100' : solved ? 'text-emerald-600' : 'text-slate-400'}`}>
                              <Icon name={icon} className={icon === 'check' ? 'size-3.5' : 'size-3'} />
                            </span>
                            <span className="truncate">{it.label}</span>
                          </button>
                        </li>
                      );
                    })}
                  </motion.ol>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="space-y-1 border-t border-slate-100 p-2">
        {(
          [
            { to: '/practice', icon: 'pencil', label: 'Practice quiz' },
            { to: '/progress', icon: 'chart', label: 'My progress dashboard' },
          ] as const
        ).map((l) => (
          <Link key={l.to} to={l.to} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900">
            <Icon name={l.icon} className="mx-0.5 size-4" />
            {l.label}
          </Link>
        ))}
        <TeacherToggle />
      </div>
    </div>
  );
}
