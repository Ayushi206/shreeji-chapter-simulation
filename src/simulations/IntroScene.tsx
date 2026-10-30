import { motion, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Icon } from '../components/Icon';

type SceneId = 'minar' | 'balcony' | 'balloon';

const SCENES: Record<SceneId, { title: string; fig: string; question: string; known: string; unknown: string }> = {
  minar: {
    title: 'Qutub Minar',
    fig: 'Fig. 8.1',
    question: 'A student looks at the top of the Qutub Minar. Can she find its height without climbing it?',
    known: 'Distance from the Minar + the angle she looks up at',
    unknown: 'Height of the Minar',
  },
  balcony: {
    title: 'Balcony & river',
    fig: 'Fig. 8.2',
    question: 'A girl on a balcony looks down at a flower pot across the river. If she knows her height above the ground, can she find the width of the river?',
    known: 'Height of the balcony + the angle she looks down at',
    unknown: 'Width of the river',
  },
  balloon: {
    title: 'Hot-air balloon',
    fig: 'Fig. 8.3',
    question: 'A girl spots a balloon at A. By the time her mother comes out, it has drifted to B. Can they find the altitude of B?',
    known: 'Angles of sight from the ground + distance travelled',
    unknown: 'Altitude of the balloon at B',
  },
};

const STAGE_MS = 1300;
const HL = '#4f46e5';

function useStage(key: string, max: number, active: boolean) {
  const [stage, setStage] = useState(0);
  const [run, setRun] = useState(0);
  useEffect(() => {
    setStage(0);
    if (!active) return;
    const timers = Array.from({ length: max }, (_, i) => window.setTimeout(() => setStage(i + 1), (i + 1) * STAGE_MS));
    return () => timers.forEach(clearTimeout);
  }, [key, max, run, active]);
  return { stage, replay: () => setRun((r) => r + 1) };
}

const draw = { initial: { pathLength: 0, opacity: 0 }, animate: { pathLength: 1, opacity: 1 }, transition: { duration: 1 } };
const pop = { initial: { opacity: 0, scale: 0.7 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.4 } };

function Label({ x, y, children, color = '#0f172a', anchor = 'middle' }: { x: number; y: number; children: string; color?: string; anchor?: 'start' | 'middle' | 'end' }) {
  return (
    <motion.text {...pop} x={x} y={y} textAnchor={anchor} fontSize={13} fontWeight={700} fill={color} stroke="#fff" strokeWidth={4} paintOrder="stroke">
      {children}
    </motion.text>
  );
}

function Person({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} stroke="#0f172a" strokeWidth={2.2} strokeLinecap="round" fill="none">
      <circle cx={0} cy={-26} r={5} fill="#fde68a" />
      <path d="M0 -21 L0 -8 M0 -8 L-5 0 M0 -8 L5 0 M0 -17 L-6 -11 M0 -17 L6 -12" />
    </g>
  );
}

function Minar({ stage }: { stage: number }) {
  const eye = { x: 92, y: 238 };
  const top = { x: 430, y: 48 };
  const foot = { x: 430, y: 238 };
  return (
    <>
      <rect x={0} y={250} width={560} height={50} fill="#dcfce7" />
      <line x1={0} y1={250} x2={560} y2={250} stroke="#86efac" strokeWidth={2} />
      {/* tower */}
      <path d="M410 250 L417 48 L443 48 L450 250 Z" fill="#7dd3fc" stroke="#0284c7" strokeWidth={1.5} />
      {[70, 110, 150, 190, 225].map((y) => (
        <line key={y} x1={410 + ((250 - y) * 7) / 202} y1={y} x2={450 - ((250 - y) * 7) / 202} y2={y} stroke="#0369a1" strokeWidth={2} opacity={0.5} />
      ))}
      <rect x={414} y={40} width={32} height={8} rx={2} fill="#0284c7" />
      <Person x={92} y={250} />
      {stage >= 1 && <motion.line {...draw} x1={eye.x} y1={eye.y - 12} x2={top.x} y2={top.y} stroke="#0f172a" strokeWidth={1.8} strokeDasharray="5 5" />}
      {stage >= 2 && (
        <>
          <motion.path {...draw} d={`M ${eye.x} ${eye.y - 12} L ${foot.x} ${foot.y - 12} L ${top.x} ${top.y}`} fill="none" stroke={HL} strokeWidth={3} />
          <motion.path {...pop} d={`M ${foot.x - 12} ${foot.y - 12} v -12 h 12`} fill="none" stroke={HL} strokeWidth={1.5} />
          <motion.path {...pop} d={`M ${eye.x + 38} ${eye.y - 12} A 38 38 0 0 0 ${eye.x + 34.5} ${eye.y - 28}`} fill="none" stroke="#e11d48" strokeWidth={2.5} />
        </>
      )}
      {stage >= 3 && (
        <>
          <Label x={260} y={244}>distance (can measure)</Label>
          <Label x={470} y={150} color="#e11d48" anchor="start">
            height = ?
          </Label>
          <Label x={eye.x + 56} y={eye.y - 30} color="#e11d48" anchor="start">
            angle
          </Label>
        </>
      )}
    </>
  );
}

function Balcony({ stage }: { stage: number }) {
  const eye = { x: 140, y: 112 };
  const pot = { x: 432, y: 240 };
  const ground = { x: 140, y: 240 };
  return (
    <>
      <rect x={0} y={248} width={560} height={52} fill="#dcfce7" />
      <rect x={155} y={244} width={255} height={14} fill="#93c5fd" />
      <path d="M160 251 q 10 -4 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0" fill="none" stroke="#3b82f6" strokeWidth={1.5} />
      {/* house */}
      <rect x={40} y={90} width={100} height={158} fill="#f1f5f9" stroke="#475569" strokeWidth={1.5} />
      <path d="M32 92 L90 52 L148 92 Z" fill="#cbd5e1" stroke="#475569" strokeWidth={1.5} />
      <rect x={56} y={150} width={22} height={22} fill="#bae6fd" stroke="#475569" />
      <rect x={96} y={200} width={26} height={48} fill="#e2e8f0" stroke="#475569" />
      <rect x={128} y={118} width={22} height={4} fill="#475569" />
      <Person x={140} y={124} scale={0.8} />
      {/* temple */}
      <path d="M440 248 L440 196 L500 196 L500 248 Z" fill="#fef3c7" stroke="#b45309" strokeWidth={1.5} />
      <path d="M436 198 L470 150 L504 198 Z" fill="#fcd34d" stroke="#b45309" strokeWidth={1.5} />
      <path d="M420 248 h20 v-6 h-14 v-6 h14" fill="none" stroke="#b45309" strokeWidth={1.5} />
      <circle cx={pot.x} cy={pot.y - 3} r={5} fill="#f97316" />
      {stage >= 1 && <motion.line {...draw} x1={eye.x + 4} y1={eye.y} x2={pot.x} y2={pot.y - 4} stroke="#0f172a" strokeWidth={1.8} strokeDasharray="5 5" />}
      {stage >= 2 && (
        <>
          <motion.path {...draw} d={`M ${eye.x + 4} ${eye.y} L ${ground.x + 4} ${ground.y - 4} L ${pot.x} ${pot.y - 4}`} fill="none" stroke={HL} strokeWidth={3} />
          <motion.path {...pop} d={`M ${ground.x + 4} ${ground.y - 16} h 12 v 12`} fill="none" stroke={HL} strokeWidth={1.5} />
          <motion.path {...pop} d={`M ${pot.x - 40} ${pot.y - 4} A 40 40 0 0 1 ${pot.x - 37} ${pot.y - 21}`} fill="none" stroke="#e11d48" strokeWidth={2.5} />
        </>
      )}
      {stage >= 3 && (
        <>
          <Label x={284} y={232} color="#e11d48">
            width of river = ?
          </Label>
          <Label x={eye.x + 12} y={185} anchor="start">
            height (known)
          </Label>
        </>
      )}
    </>
  );
}

function Balloon({ stage }: { stage: number }) {
  const girl = { x: 90, y: 238 };
  const A = { x: 220, y: 70 };
  const B = { x: 440, y: 64 };
  const at = stage >= 2 ? B : A;
  return (
    <>
      <rect x={0} y={250} width={560} height={50} fill="#dcfce7" />
      <line x1={0} y1={250} x2={560} y2={250} stroke="#86efac" strokeWidth={2} />
      <Person x={girl.x} y={250} scale={0.9} />
      <Person x={girl.x - 18} y={250} scale={1.05} />
      {/* balloon */}
      <motion.g initial={false} animate={{ x: at.x, y: at.y }} transition={{ duration: 1.4, ease: 'easeInOut' }}>
        <ellipse cx={0} cy={-26} rx={18} ry={22} fill="#f472b6" stroke="#be185d" strokeWidth={1.5} />
        <path d="M-8 -6 L-4 6 M8 -6 L4 6" stroke="#78350f" strokeWidth={1.2} />
        <rect x={-5} y={6} width={10} height={8} fill="#92400e" />
      </motion.g>
      {stage >= 1 && (
        <>
          <motion.line {...draw} x1={girl.x} y1={girl.y - 10} x2={A.x} y2={A.y + 14} stroke="#0f172a" strokeWidth={1.6} strokeDasharray="5 5" />
          <motion.line {...draw} x1={A.x} y1={A.y + 14} x2={A.x} y2={250} stroke="#94a3b8" strokeWidth={1.4} strokeDasharray="4 4" />
          <Label x={A.x + 12} y={A.y + 24} anchor="start">
            A
          </Label>
        </>
      )}
      {stage >= 3 && (
        <>
          <motion.path {...draw} d={`M ${girl.x} ${girl.y - 10} L ${B.x} ${girl.y - 10} L ${B.x} ${B.y + 14} Z`} fill="none" stroke={HL} strokeWidth={3} />
          <motion.path {...pop} d={`M ${B.x - 12} ${girl.y - 10} v -12 h 12`} fill="none" stroke={HL} strokeWidth={1.5} />
          <Label x={B.x + 12} y={B.y + 24} anchor="start">
            B
          </Label>
          <Label x={B.x + 12} y={160} color="#e11d48" anchor="start">
            altitude = ?
          </Label>
        </>
      )}
    </>
  );
}

export const SCENE_IDS: SceneId[] = ['minar', 'balcony', 'balloon'];

/** One textbook situation per card; the animation starts once the card is on screen. */
export function IntroScene({ scene }: { scene: SceneId }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const { stage, replay } = useStage(scene, 3, inView);
  const meta = SCENES[scene];
  const n = SCENE_IDS.indexOf(scene) + 1;

  return (
    <div ref={ref} className="card overflow-hidden">
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
        <span className="font-display grid h-7 w-7 shrink-0 place-items-center rounded-full bg-indigo-600 text-sm font-bold text-white">{n}</span>
        <div className="min-w-0 flex-1">
          <p className="font-display truncate font-bold text-slate-900">{meta.title}</p>
          <p className="text-xs font-semibold text-slate-400">
            Situation {n} of {SCENE_IDS.length} · {meta.fig}
          </p>
        </div>
        <button type="button" onClick={replay} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-50">
          <Icon name="replay" /> Replay
        </button>
      </div>
      <div className="grid gap-0 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="bg-linear-to-b from-sky-50 to-white">
          <svg viewBox="0 0 560 300" className="h-auto w-full" role="img" aria-label={`${meta.title}: a right triangle formed in a real-life situation`}>
            {scene === 'minar' && <Minar stage={stage} />}
            {scene === 'balcony' && <Balcony stage={stage} />}
            {scene === 'balloon' && <Balloon stage={stage} />}
          </svg>
        </div>
        <div className="flex flex-col gap-4 p-5">
          <p className="text-[15px] leading-relaxed text-slate-700">{meta.question}</p>
          <ol className="space-y-2 text-sm">
            {['Look along the line of sight', 'Spot the hidden right triangle', 'Mark what we know and what we want'].map((s, i) => (
              <li key={s} className={`flex items-center gap-2 transition ${stage > i ? 'text-slate-900' : 'text-slate-400'}`}>
                <span className={`grid h-5 w-5 place-items-center rounded-full text-[11px] font-bold ${stage > i ? 'bg-indigo-600 text-white' : 'bg-slate-200'}`}>{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
          <div className="mt-auto grid gap-2 text-sm">
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-900">
              <span className="font-bold">We know: </span>
              {meta.known}
            </div>
            <div className="rounded-xl bg-rose-50 p-3 text-rose-900">
              <span className="font-bold">We want: </span>
              {meta.unknown}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const sceneTitle = (scene: SceneId) => SCENES[scene].title;
export const sceneFig = (scene: SceneId) => SCENES[scene].fig;
export type { SceneId };
