import { useSyncExternalStore } from 'react';
import type { Problem } from '../types';
import type { ExerciseRecord } from './progress';

/**
 * Exercise questions keep their solution locked until the learner has tried:
 * MCQs unlock once an answer is picked, the rest after "I've tried".
 * A hint shows only the first step. Examples and derivations stay open —
 * the textbook already solves them.
 *
 * Teacher mode unlocks everything (for a mentor explaining in class).
 * It follows the logged-in user's role (see roleAllowsTeacherMode).
 */

export const isExercise = (p: Problem) => p.group.startsWith('Exercise');

/** Short solutions would give the answer away in the hint. */
export const canHint = (p: Problem) => p.steps.length >= 3;

export const isLocked = (p: Problem, rec: ExerciseRecord | undefined, teacher: boolean) => isExercise(p) && !teacher && !rec?.unlocked;

/** Last step the learner may see right now (-1 = question only). */
export function revealLimit(p: Problem, rec: ExerciseRecord | undefined, teacher: boolean): number {
  if (!isLocked(p, rec, teacher)) return p.steps.length - 1;
  return rec?.hint ? 0 : -1;
}

// ── Teacher mode (separate from learner progress; survives "Reset progress") ──

const TEACHER_KEY = 'trig-lab:teacher-mode';
/** Where the main app keeps the logged-in user, e.g. {"name": "…", "role": "student"}. */
const USER_KEY = 'user';

/** Students never get teacher mode. Any other role does. No user or no role → off. */
function roleAllowsTeacherMode(): boolean {
  try {
    const user = JSON.parse(localStorage.getItem(USER_KEY) ?? 'null') as { role?: unknown } | null;
    if (!user?.role) return false;
    return String(user.role).trim().toLowerCase() !== 'student';
  } catch {
    return false; // missing storage or a malformed user value
  }
}

/** Decided once per page load; only these users see the switch. */
export const teacherModeAllowed = roleAllowsTeacherMode();

let teacher = false;
const listeners = new Set<() => void>();

export function setTeacherMode(on: boolean) {
  teacher = on && teacherModeAllowed;
  try {
    localStorage.setItem(TEACHER_KEY, String(teacher));
  } catch {
    /* storage unavailable */
  }
  listeners.forEach((l) => l());
}

// A teacher starts with all solutions open (and can switch off to preview the student view).
setTeacherMode(teacherModeAllowed);

export function useTeacherMode(): boolean {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => teacher,
    () => teacher,
  );
}
