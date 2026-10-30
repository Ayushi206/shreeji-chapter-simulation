import { motion } from 'framer-motion';
import { useState } from 'react';
import { Icon } from '../components/Icon';
import { ROLE_COLORS, RoleLegend, TriangleFigure, type Role } from '../components/TriangleFigure';
import { Tex } from '../lib/tex';

/** Fig 8.4 / 8.5 — the same triangle seen from angle A and from angle C. */
export function MeetTheSides() {
  const [ref, setRef] = useState<'A' | 'C'>('A');
  const labels =
    ref === 'A'
      ? { BC: 'Opposite to A', AB: 'Adjacent to A', AC: 'Hypotenuse' }
      : { AB: 'Opposite to C', BC: 'Adjacent to C', AC: 'Hypotenuse' };
  return (
    <div className="card grid gap-4 p-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-center">
      <div>
        <TriangleFigure spec={{ vertices: ['A', 'B', 'C'], angle: 50 }} refVertex={ref} sideLabels={labels} width={380} />
        <RoleLegend className="justify-center" />
      </div>
      <div className="space-y-4">
        <div className="inline-flex rounded-xl bg-slate-100 p-1">
          {(['A', 'C'] as const).map((v) => (
            <button key={v} type="button" onClick={() => setRef(v)} className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${ref === v ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'}`}>
              Look from angle {v}
            </button>
          ))}
        </div>
        <ul className="space-y-2 text-[15px] leading-relaxed text-slate-700">
          <li>
            <span className="font-semibold text-hyp">Hypotenuse</span> — always the side facing the right angle (AC). It never changes.
          </li>
          <li>
            <span className="font-semibold text-opp">Opposite</span> — the side that <em>faces</em> the angle you are looking from ({ref === 'A' ? 'BC' : 'AB'}).
          </li>
          <li>
            <span className="font-semibold text-adj">Adjacent</span> — the side that <em>touches</em> the angle and is not the hypotenuse ({ref === 'A' ? 'AB' : 'BC'}).
          </li>
        </ul>
        <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
          Switch between A and C: <strong>opposite and adjacent swap</strong>, the hypotenuse stays. Always ask “opposite to <em>which</em> angle?”
        </p>
      </div>
    </div>
  );
}

const W = 300;
const H = 270;
const ORIGIN = { x: 24, y: 250 };
const MAX_HYP = 230;
const PX_PER_UNIT = 20;

type RatioRow = { name: string; tex: string; num: Role; den: Role; value: number };

export function RatioExplorer() {
  const [angle, setAngle] = useState(35);
  const [scale, setScale] = useState(0.85);
  const [ref, setRef] = useState<'A' | 'C'>('A');
  const [similar, setSimilar] = useState(false);
  const [t, setT] = useState(0.55);

  const rad = (angle * Math.PI) / 180;
  const L = MAX_HYP * scale;
  const A = ORIGIN;
  const B = { x: A.x + L * Math.cos(rad), y: A.y };
  const C = { x: B.x, y: A.y - L * Math.sin(rad) };
  const len = { AB: (B.x - A.x) / PX_PER_UNIT, BC: (B.y - C.y) / PX_PER_UNIT, AC: L / PX_PER_UNIT };

  const opp = ref === 'A' ? 'BC' : 'AB';
  const adj = ref === 'A' ? 'AB' : 'BC';
  const role: Record<string, Role> = { [opp]: 'opposite', [adj]: 'adjacent', AC: 'hypotenuse' };
  const o = len[opp as 'AB' | 'BC'];
  const a = len[adj as 'AB' | 'BC'];
  const h = len.AC;

  const rows: RatioRow[] = [
    { name: 'sin', tex: `\\sin ${ref}`, num: 'opposite', den: 'hypotenuse', value: o / h },
    { name: 'cos', tex: `\\cos ${ref}`, num: 'adjacent', den: 'hypotenuse', value: a / h },
    { name: 'tan', tex: `\\tan ${ref}`, num: 'opposite', den: 'adjacent', value: o / a },
    { name: 'cosec', tex: `\\cosec ${ref}`, num: 'hypotenuse', den: 'opposite', value: h / o },
    { name: 'sec', tex: `\\sec ${ref}`, num: 'hypotenuse', den: 'adjacent', value: h / a },
    { name: 'cot', tex: `\\cot ${ref}`, num: 'adjacent', den: 'opposite', value: a / o },
  ];
  const sideOf: Record<Role, string> = { opposite: opp, adjacent: adj, hypotenuse: 'AC' };
  const lenOf = (r: Role) => len[sideOf[r] as keyof typeof len];

  const P = { x: A.x + t * (C.x - A.x), y: A.y + t * (C.y - A.y) };
  const M = { x: P.x, y: A.y };
  const refAngle = ref === 'A' ? angle : 90 - angle;

  const line = (p: { x: number; y: number }, q: { x: number; y: number }, key: string) => (
    <line x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={ROLE_COLORS[role[key]]} strokeWidth={3.5} strokeLinecap="round" />
  );
  const sideText = (x: number, y: number, key: keyof typeof len, anchor: 'start' | 'middle' | 'end' = 'middle') => (
    <text x={x} y={y} textAnchor={anchor} fontSize={12.5} fontWeight={700} fill={ROLE_COLORS[role[key]]} stroke="#fff" strokeWidth={4} paintOrder="stroke">
      {len[key].toFixed(1)}
    </text>
  );

  return (
    <div className="card p-5">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <div>
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full select-none" role="img" aria-label={`Right triangle with angle A = ${angle} degrees`}>
            <path d={`M ${A.x} ${A.y} L ${B.x} ${B.y} L ${C.x} ${C.y} Z`} fill="#eef2ff" />
            {line(A, B, 'AB')}
            {line(B, C, 'BC')}
            {line(A, C, 'AC')}
            <path d={`M ${B.x - 11} ${B.y} v -11 h 11`} fill="none" stroke="#64748b" strokeWidth={1.5} />
            {ref === 'A' ? (
              <path d={`M ${A.x + 30} ${A.y} A 30 30 0 0 0 ${A.x + 30 * Math.cos(rad)} ${A.y - 30 * Math.sin(rad)}`} fill="none" stroke="#4f46e5" strokeWidth={2.5} />
            ) : (
              <path d={`M ${C.x} ${C.y + 26} A 26 26 0 0 1 ${C.x - 26 * Math.cos(rad)} ${C.y + 26 * Math.sin(rad)}`} fill="none" stroke="#4f46e5" strokeWidth={2.5} />
            )}
            {similar && (
              <g>
                <line x1={P.x} y1={P.y} x2={M.x} y2={M.y} stroke="#7c3aed" strokeWidth={2.5} strokeDasharray="5 4" />
                <path d={`M ${M.x - 9} ${M.y} v -9 h 9`} fill="none" stroke="#7c3aed" strokeWidth={1.3} />
                <circle cx={P.x} cy={P.y} r={4} fill="#7c3aed" />
                <text x={P.x - 8} y={P.y - 8} textAnchor="end" fontSize={14} fontWeight={700} fill="#7c3aed">
                  P
                </text>
                <text x={M.x} y={M.y + 16} textAnchor="middle" fontSize={14} fontWeight={700} fill="#7c3aed">
                  M
                </text>
              </g>
            )}
            {sideText((A.x + B.x) / 2, A.y + 17, 'AB')}
            {sideText(B.x + 7, (B.y + C.y) / 2, 'BC', 'start')}
            {sideText((A.x + C.x) / 2 - 8, (A.y + C.y) / 2 - 8, 'AC', 'end')}
            <text x={A.x - 4} y={A.y + 16} fontSize={15} fontWeight={800} fill="#0f172a">
              A
            </text>
            <text x={B.x + 4} y={B.y + 16} fontSize={15} fontWeight={800} fill="#0f172a">
              B
            </text>
            <text x={C.x + 6} y={C.y - 2} fontSize={15} fontWeight={800} fill="#0f172a">
              C
            </text>
          </svg>
          <RoleLegend className="justify-center" />
        </div>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="flex justify-between text-sm font-semibold text-slate-700">
                Angle A <span className="text-indigo-600 tabular-nums">{angle}°</span>
              </span>
              <input type="range" min={5} max={85} value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="w-full" aria-label="Angle A" />
            </label>
            <label className="block">
              <span className="flex justify-between text-sm font-semibold text-slate-700">
                Triangle size <span className="text-indigo-600 tabular-nums">×{scale.toFixed(2)}</span>
              </span>
              <input type="range" min={0.45} max={1} step={0.01} value={scale} onChange={(e) => setScale(Number(e.target.value))} className="w-full" aria-label="Triangle size" />
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-xl bg-slate-100 p-1">
              {(['A', 'C'] as const).map((v) => (
                <button key={v} type="button" onClick={() => setRef(v)} className={`rounded-lg px-3 py-1 text-sm font-semibold transition ${ref === v ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'}`}>
                  Ratios of ∠{v} = {v === 'A' ? angle : 90 - angle}°
                </button>
              ))}
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
              <input type="checkbox" checked={similar} onChange={(e) => setSimilar(e.target.checked)} className="h-4 w-4 accent-violet-600" />
              Show △PAM (Fig. 8.6)
            </label>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {rows.map((r) => (
              <motion.div key={r.name} layout className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <div className="flex items-baseline justify-between">
                  <Tex tex={r.tex} className="text-slate-900" />
                  <span className="text-[11px] font-semibold text-slate-400">{sideOf[r.num]}/{sideOf[r.den]}</span>
                </div>
                <div className="mt-1 text-xs">
                  <span style={{ color: ROLE_COLORS[r.num] }}>{lenOf(r.num).toFixed(1)}</span>
                  <span className="text-slate-400"> ÷ </span>
                  <span style={{ color: ROLE_COLORS[r.den] }}>{lenOf(r.den).toFixed(1)}</span>
                </div>
                <div className="font-display mt-0.5 text-xl font-bold text-slate-900 tabular-nums">{r.value.toFixed(3)}</div>
              </motion.div>
            ))}
          </div>

          {similar ? (
            <div className="rounded-xl border border-violet-200 bg-violet-50 p-3 text-sm text-violet-900">
              <label className="mb-2 block">
                <span className="text-xs font-semibold">Slide P along AC</span>
                <input type="range" min={0.2} max={0.9} step={0.01} value={t} onChange={(e) => setT(Number(e.target.value))} className="w-full accent-violet-600" aria-label="Position of P" />
              </label>
              <p>
                In △PAM: <Tex tex={`\\frac{MP}{AP} = ${((A.y - P.y) / Math.hypot(P.x - A.x, P.y - A.y)).toFixed(3)}`} /> and in △CAB: <Tex tex={`\\frac{BC}{AC} = ${(len.BC / len.AC).toFixed(3)}`} />.
              </p>
              <p className="mt-1">△PAM ~ △CAB (AA similarity), so the ratios are equal — <strong>sin A doesn’t depend on where P is.</strong></p>
            </div>
          ) : (
            <div className="rounded-xl bg-indigo-50 p-3 text-sm text-indigo-900">
              <strong>Try this:</strong> drag the <em>size</em> slider. The side lengths change, but every ratio stays the same. The values of the trigonometric ratios of an angle do not vary with the lengths of the sides, if the angle remains the same.
            </div>
          )}
          <p className="text-xs text-slate-500">
            {refAngle > 45 ? (
              <>
                <Icon name="arrow-up" className="mr-0.5 size-[1.1em] text-indigo-500" />
                tan is now greater than 1, since the opposite side is longer than the adjacent side.{' '}
              </>
            ) : (
              'tan is below 1, since the opposite side is shorter than the adjacent side. '
            )}
            sin and cos are always below 1, because the hypotenuse is the longest side.
          </p>
        </div>
      </div>
    </div>
  );
}

const CARDS = [
  { front: '\\sin A = \\frac{BC}{AC}', back: '\\cosec A = \\frac{1}{\\sin A} = \\frac{AC}{BC}' },
  { front: '\\cos A = \\frac{AB}{AC}', back: '\\sec A = \\frac{1}{\\cos A} = \\frac{AC}{AB}' },
  { front: '\\tan A = \\frac{BC}{AB}', back: '\\cot A = \\frac{1}{\\tan A} = \\frac{AB}{BC}' },
];

export function ReciprocalCards() {
  const [flipped, setFlipped] = useState<boolean[]>([false, false, false]);
  const [step, setStep] = useState(0);
  const quotient = [
    '\\tan A = \\frac{BC}{AB}',
    '\\tan A = \\frac{BC}{AB} = \\frac{\\;BC/AC\\;}{\\;AB/AC\\;}',
    '\\tan A = \\frac{BC/AC}{AB/AC} = \\frac{\\sin A}{\\cos A}',
    '\\tan A = \\frac{\\sin A}{\\cos A} \\qquad \\cot A = \\frac{\\cos A}{\\sin A}',
  ];
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <div className="grid gap-3 sm:grid-cols-3">
        {CARDS.map((c, i) => (
          <button
            key={i}
            type="button"
            className="perspective h-36 text-left"
            onClick={() => setFlipped((f) => f.map((v, k) => (k === i ? !v : v)))}
            aria-label={`Flip card ${i + 1}`}
          >
            <motion.div className="relative h-full w-full" animate={{ rotateY: flipped[i] ? 180 : 0 }} transition={{ duration: 0.6 }} style={{ transformStyle: 'preserve-3d' }}>
              <div className="backface-hidden card absolute inset-0 flex flex-col items-center justify-center gap-2 p-3">
                <Tex tex={c.front} className="text-lg" />
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400">
                  tap to flip <Icon name="replay" />
                </span>
              </div>
              <div className="backface-hidden absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl border border-indigo-200 bg-indigo-50 p-3" style={{ transform: 'rotateY(180deg)' }}>
                <Tex tex={c.back} className="text-lg" />
                <span className="text-xs font-semibold text-indigo-400">reciprocal</span>
              </div>
            </motion.div>
          </button>
        ))}
      </div>
      <div className="card flex flex-col p-4">
        <p className="mb-2 text-sm font-semibold text-slate-700">Why is tan A = sin A ÷ cos A?</p>
        <div className="flex min-h-20 items-center justify-center">
          <motion.div key={step} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <Tex tex={quotient[step]} block />
          </motion.div>
        </div>
        <p className="mb-3 text-xs text-slate-500">{['Start from the definition.', 'Divide top and bottom by the hypotenuse AC.', 'BC/AC is sin A and AB/AC is cos A.', 'Flip it over for cot A.'][step]}</p>
        <div className="mt-auto flex gap-2">
          <button type="button" className="btn-ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)} aria-label="Previous step">
            <Icon name="arrow-left" />
          </button>
          <button type="button" className="btn-primary flex-1" disabled={step === quotient.length - 1} onClick={() => setStep((s) => s + 1)}>
            Next step <Icon name="arrow-right" />
          </button>
        </div>
      </div>
    </div>
  );
}
