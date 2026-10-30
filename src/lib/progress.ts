import { useSyncExternalStore } from 'react';

/** Learner progress, persisted in LocalStorage (per browser). */

export type QuizCategory = 'values' | 'sides' | 'ratios' | 'identities' | 'defined';

export interface QuizAttempt {
  at: number;
  score: number;
  total: number;
  /** category -> [correct, attempted] */
  byCat: Partial<Record<QuizCategory, [number, number]>>;
}

/** How a learner worked through one exercise question. */
export interface ExerciseRecord {
  /** Took the hint (first step) before unlocking the solution. */
  hint?: boolean;
  unlocked?: boolean;
  /** Picked in an MCQ, or self-marked by the learner after the solution. */
  result?: 'right' | 'wrong';
}

export interface ProgressState {
  completed: Record<string, number>;
  quiz: QuizAttempt[];
  exercises: Record<string, ExerciseRecord>;
}

const KEY = 'trig-lab:progress:v1';
const EMPTY: ProgressState = { completed: {}, quiz: [], exercises: {} };

const isObject = (v: unknown): v is Record<string, never> => Boolean(v) && typeof v === 'object' && !Array.isArray(v);

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    return {
      completed: isObject(parsed.completed) ? parsed.completed : {},
      quiz: Array.isArray(parsed.quiz) ? parsed.quiz : [],
      exercises: isObject(parsed.exercises) ? parsed.exercises : {},
    };
  } catch {
    return EMPTY;
  }
}

let state: ProgressState = load();
const listeners = new Set<() => void>();

function commit(next: ProgressState) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable (private mode) — keep in memory */
  }
  listeners.forEach((l) => l());
}

export const progress = {
  markComplete(id: string) {
    if (state.completed[id]) return;
    commit({ ...state, completed: { ...state.completed, [id]: Date.now() } });
  },
  addQuizAttempt(attempt: QuizAttempt) {
    commit({ ...state, quiz: [...state.quiz, attempt].slice(-30) });
  },
  updateExercise(id: string, patch: ExerciseRecord) {
    commit({ ...state, exercises: { ...state.exercises, [id]: { ...state.exercises[id], ...patch } } });
  },
  reset() {
    commit(EMPTY);
  },
};

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useProgress(): ProgressState {
  return useSyncExternalStore(subscribe, () => state, () => state);
}
