import { setTeacherMode, teacherModeAllowed, useTeacherMode } from '../lib/exerciseGate';

/** Mentor switch: opens every exercise solution for explaining in class. Hidden for students. */
export function TeacherToggle({ className = '' }: { className?: string }) {
  const on = useTeacherMode();
  if (!teacherModeAllowed) return null;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => setTeacherMode(!on)}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition ${on ? 'bg-teal-50 text-teal-800' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'} ${className}`}
      title="Teacher mode opens all exercise solutions without the try-first lock"
    >
      <span className={`relative h-4 w-7 shrink-0 rounded-full transition ${on ? 'bg-teal-500' : 'bg-slate-300'}`}>
        <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-all ${on ? 'left-3.5' : 'left-0.5'}`} />
      </span>
      <span>
        Teacher mode
        <span className="block text-[11px] font-normal text-slate-500">{on ? 'All solutions open' : 'Exercises: try first'}</span>
      </span>
    </button>
  );
}
