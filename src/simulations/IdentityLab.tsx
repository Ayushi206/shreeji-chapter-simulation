import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ROLE_COLORS, TriangleFigure } from '../components/TriangleFigure';
import { Tex } from '../lib/tex';

const CAP = 5;

function Bar({ parts, cap = CAP }: { parts: Array<{ v: number; color: string; label: string }>; cap?: number }) {
  return (
    <div className="flex h-8 w-full overflow-hidden rounded-lg bg-slate-100">
      {parts.map((p) => {
        const w = Math.max(0, Math.min(p.v, cap)) / cap;
        return (
          <motion.div key={p.label} className="flex h-full items-center justify-center overflow-hidden text-[11px] font-bold whitespace-nowrap text-white" style={{ background: p.color }} animate={{ width: `${w * 100}%` }} transition={{ type: 'spring', stiffness: 200, damping: 26 }}>
            {w > 0.12 ? p.label : ''}
          </motion.div>
        );
      })}
    </div>
  );
}

/** Live check of the three identities for any angle — values change, equalities never break. */
export function IdentityLab() {
  const [angle, setAngle] = useState(35);
  const r = (angle * Math.PI) / 180;
  const s = angle === 90 ? 1 : Math.sin(r);
  const c = angle === 90 ? 0 : Math.cos(r);
  const tan2 = c === 0 ? Infinity : (s / c) ** 2;
  const sec2 = c === 0 ? Infinity : 1 / c ** 2;
  const cot2 = s === 0 ? Infinity : (c / s) ** 2;
  const cosec2 = s === 0 ? Infinity : 1 / s ** 2;
  const f = (v: number) => (Number.isFinite(v) ? v.toFixed(3) : 'not defined');

  return (
    <div className="card grid gap-6 p-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <div>
        <TriangleFigure
          spec={{ vertices: ['A', 'B', 'C'], angle: 35, ref: 'A' }}
          angle={Math.max(angle, 0.4)}
          animate={false}
          sideLabels={{ AC: '1', AB: `cos A = ${c.toFixed(2)}`, BC: `${s.toFixed(2)}` }}
        />
        <label className="mt-2 block">
          <span className="flex justify-between text-sm font-semibold text-slate-700">
            ∠A <span className="text-indigo-600 tabular-nums">{angle}°</span>
          </span>
          <input type="range" min={0} max={90} value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="w-full" aria-label="Angle A" />
        </label>
        <p className="mt-2 text-sm text-slate-600">
          Take the hypotenuse as 1. Then the legs are exactly <span className="font-semibold text-adj">cos A</span> and <span className="font-semibold text-opp">sin A</span>, and Pythagoras says <Tex tex="\cos^2A + \sin^2A = 1^2" />.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2">
            <Tex tex="\sin^2 A + \cos^2 A = 1" />
            <span className="text-xs text-slate-500 tabular-nums">
              {f(s * s)} + {f(c * c)} = <strong className="text-slate-900">{f(s * s + c * c)}</strong>
            </span>
          </div>
          <Bar
            cap={1}
            parts={[
              { v: s * s, color: ROLE_COLORS.opposite, label: 'sin²A' },
              { v: c * c, color: ROLE_COLORS.adjacent, label: 'cos²A' },
            ]}
          />
          <p className="mt-1 text-xs text-slate-500">The two pieces change size, but together they always fill the bar exactly. Valid for 0° ≤ A ≤ 90°.</p>
        </div>

        <div>
          <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2">
            <Tex tex="1 + \tan^2 A = \sec^2 A" />
            <span className="text-xs text-slate-500 tabular-nums">
              1 + {f(tan2)} = <strong className="text-slate-900">{f(sec2)}</strong>
            </span>
          </div>
          {Number.isFinite(sec2) ? (
            <div className="space-y-1">
              <Bar parts={[{ v: 1, color: '#94a3b8', label: '1' }, { v: tan2, color: ROLE_COLORS.opposite, label: 'tan²A' }]} />
              <Bar parts={[{ v: sec2, color: ROLE_COLORS.hypotenuse, label: 'sec²A' }]} />
            </div>
          ) : (
            <p className="rounded-lg bg-rose-50 p-2 text-sm text-rose-700">At A = 90°, tan A and sec A are not defined, so this identity holds only for 0° ≤ A &lt; 90°.</p>
          )}
        </div>

        <div>
          <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2">
            <Tex tex="\cot^2 A + 1 = \cosec^2 A" />
            <span className="text-xs text-slate-500 tabular-nums">
              {f(cot2)} + 1 = <strong className="text-slate-900">{f(cosec2)}</strong>
            </span>
          </div>
          {Number.isFinite(cosec2) ? (
            <div className="space-y-1">
              <Bar parts={[{ v: cot2, color: ROLE_COLORS.adjacent, label: 'cot²A' }, { v: 1, color: '#94a3b8', label: '1' }]} />
              <Bar parts={[{ v: cosec2, color: ROLE_COLORS.hypotenuse, label: 'cosec²A' }]} />
            </div>
          ) : (
            <p className="rounded-lg bg-rose-50 p-2 text-sm text-rose-700">At A = 0°, cot A and cosec A are not defined, so this identity holds only for 0° &lt; A ≤ 90°.</p>
          )}
        </div>
        <p className="text-xs text-slate-400">Bars are drawn on a scale of 0–{CAP}; very large values are clipped.</p>
      </div>
    </div>
  );
}

/** Home-page hero: a triangle that keeps changing its angle. */
export function HeroTriangle() {
  const angles = [30, 45, 60, 45];
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setI((k) => (k + 1) % angles.length), 2200);
    return () => window.clearInterval(id);
  }, [angles.length]);
  const a = angles[i];
  const r = (a * Math.PI) / 180;
  return (
    <div className="relative">
      <TriangleFigure spec={{ vertices: ['A', 'B', 'C'], angle: a, ref: 'A' }} angleMarks={{ A: `${a}°` }} sideLabels={{ BC: 'opposite', AB: 'adjacent', AC: 'hypotenuse' }} />
      <motion.div key={a} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-1 flex justify-center gap-4 text-sm font-semibold tabular-nums">
        <span className="text-opp">sin {a}° = {Math.sin(r).toFixed(3)}</span>
        <span className="text-adj">cos {a}° = {Math.cos(r).toFixed(3)}</span>
      </motion.div>
    </div>
  );
}
