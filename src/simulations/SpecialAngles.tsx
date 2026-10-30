import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Icon } from '../components/Icon';
import { ROLE_COLORS, TriangleFigure } from '../components/TriangleFigure';
import { ANGLES, ND, RATIO_NAMES, TABLE, ratioTex } from '../content';
import { Tex } from '../lib/tex';

function fmt(v: number) {
  if (!Number.isFinite(v) || Math.abs(v) > 1e6) return 'Not defined';
  return v.toFixed(3);
}

/** Fig 8.17 / 8.18 — shrink A towards 0° or grow it towards 90° and watch the ratios. */
export function LimitExplorer() {
  const [angle, setAngle] = useState(40);
  const raf = useRef<number | null>(null);

  const animateTo = (target: number) => {
    if (raf.current) cancelAnimationFrame(raf.current);
    const from = angle;
    const start = performance.now();
    const dur = 1600;
    const tick = (now: number) => {
      const k = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - k, 3);
      setAngle(Math.round((from + (target - from) * eased) * 10) / 10);
      if (k < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };
  useEffect(() => () => {
    if (raf.current) cancelAnimationFrame(raf.current);
  }, []);

  const r = (angle * Math.PI) / 180;
  const s = angle === 0 ? 0 : angle === 90 ? 1 : Math.sin(r);
  const c = angle === 0 ? 1 : angle === 90 ? 0 : Math.cos(r);
  const values = [
    { tex: '\\sin A', v: s, color: ROLE_COLORS.opposite },
    { tex: '\\cos A', v: c, color: ROLE_COLORS.adjacent },
    { tex: '\\tan A', v: c === 0 ? Infinity : s / c },
    { tex: '\\cosec A', v: s === 0 ? Infinity : 1 / s },
    { tex: '\\sec A', v: c === 0 ? Infinity : 1 / c },
    { tex: '\\cot A', v: s === 0 ? Infinity : c / s },
  ];

  const note =
    angle <= 2
      ? 'BC has almost vanished, and AC ≈ AB. So sin A → 0 and cos A → 1. We define sin 0° = 0 and cos 0° = 1.'
      : angle >= 88
        ? 'AB has almost vanished, and AC ≈ BC. So sin A → 1 and cos A → 0. We define sin 90° = 1 and cos 90° = 0.'
        : 'Drag the slider, or press a button to slide the angle all the way to 0° or 90°.';

  return (
    <div className="card grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div>
        <TriangleFigure spec={{ vertices: ['A', 'B', 'C'], angle: 40, ref: 'A' }} angle={Math.max(angle, 0.4)} animate={false} />
        <label className="mt-2 block">
          <span className="flex justify-between text-sm font-semibold text-slate-700">
            ∠A <span className="text-indigo-600 tabular-nums">{angle.toFixed(1)}°</span>
          </span>
          <input type="range" min={0} max={90} step={0.5} value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="w-full" aria-label="Angle A" />
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" className="btn-ghost" onClick={() => animateTo(0)}>
            <Icon name="play" className="size-[0.9em] -scale-x-100" /> Shrink to 0°
          </button>
          <button type="button" className="btn-ghost" onClick={() => animateTo(45)}>
            45°
          </button>
          <button type="button" className="btn-ghost" onClick={() => animateTo(90)}>
            Grow to 90° <Icon name="play" className="size-[0.9em]" />
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {values.map((x) => {
            const nd = fmt(x.v) === 'Not defined';
            return (
              <div key={x.tex} className={`rounded-xl border p-3 ${nd ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-slate-50/70'}`}>
                <Tex tex={x.tex} />
                <div className={`font-display mt-1 font-bold tabular-nums ${nd ? 'text-sm text-rose-600' : 'text-xl'}`} style={!nd && x.color ? { color: x.color } : undefined}>
                  {fmt(x.v)}
                </div>
              </div>
            );
          })}
        </div>
        <AnimatePresence mode="wait">
          <motion.p key={note} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="rounded-xl bg-indigo-50 p-3 text-sm text-indigo-900">
            {note}
          </motion.p>
        </AnimatePresence>
        <p className="text-xs text-slate-500">
          Ratios with sin or cos in the <em>denominator</em> become “not defined” when that value is 0, because we cannot divide by zero.
        </p>
      </div>
    </div>
  );
}

/** Table 8.1 — click cells to reveal, or reveal row by row; with the √n/2 memory trick. */
export function ValueTable() {
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [trick, setTrick] = useState(false);
  const all = RATIO_NAMES.flatMap((r) => ANGLES.map((_, i) => `${r}-${i}`));
  const toggle = (k: string) => setRevealed((s) => new Set(s).add(k));
  const nextRow = () => {
    const row = RATIO_NAMES.find((r) => ANGLES.some((_, i) => !revealed.has(`${r}-${i}`)));
    if (row) setRevealed((s) => new Set([...s, ...ANGLES.map((_, i) => `${row}-${i}`)]));
  };
  const trickSin = ['\\frac{\\sqrt0}{2}', '\\frac{\\sqrt1}{2}', '\\frac{\\sqrt2}{2}', '\\frac{\\sqrt3}{2}', '\\frac{\\sqrt4}{2}'];

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 p-3">
        <button type="button" className="btn-primary" onClick={nextRow} disabled={revealed.size === all.length}>
          Reveal next row
        </button>
        <button type="button" className="btn-ghost" onClick={() => setRevealed(new Set(all))}>
          Reveal all
        </button>
        <button type="button" className="btn-ghost" onClick={() => setRevealed(new Set())}>
          Hide all (self-test)
        </button>
        <label className="ml-auto inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
          <input type="checkbox" checked={trick} onChange={(e) => setTrick(e.target.checked)} className="h-4 w-4" />
          Memory trick
        </label>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-center">
          <thead>
            <tr className="bg-slate-50">
              <th className="p-3 text-sm font-bold text-slate-600">∠A</th>
              {ANGLES.map((a) => (
                <th key={a} className="font-display p-3 text-base font-bold text-slate-900">
                  {a}°
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RATIO_NAMES.map((r) => (
              <tr key={r} className="border-t border-slate-100">
                <th className="p-3 text-left">
                  <Tex tex={`${ratioTex(r)} A`} />
                </th>
                {ANGLES.map((_, i) => {
                  const k = `${r}-${i}`;
                  const shown = revealed.has(k);
                  const val = TABLE[r][i];
                  return (
                    <td key={k} className="p-1.5">
                      <button
                        type="button"
                        onClick={() => toggle(k)}
                        className={`flex h-14 w-full items-center justify-center rounded-lg transition ${shown ? (val === ND ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50/60 text-slate-900') : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                        aria-label={`${r} ${ANGLES[i]} degrees`}
                      >
                        <AnimatePresence mode="wait">
                          {shown ? (
                            <motion.span key="v" initial={{ rotateX: 90, opacity: 0 }} animate={{ rotateX: 0, opacity: 1 }} transition={{ duration: 0.3 }}>
                              {val === ND ? <span className="text-xs font-semibold">Not defined</span> : <Tex tex={trick && r === 'sin' ? trickSin[i] : trick && r === 'cos' ? trickSin[4 - i] : val} />}
                            </motion.span>
                          ) : (
                            <motion.span key="q" className="text-lg font-bold">
                              ?
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {trick && (
        <p className="border-t border-slate-100 bg-amber-50 p-3 text-sm text-amber-900">
          <strong>Memory trick:</strong> the sin row is <Tex tex="\frac{\sqrt0}{2}, \frac{\sqrt1}{2}, \frac{\sqrt2}{2}, \frac{\sqrt3}{2}, \frac{\sqrt4}{2}" /> (simplify each one). The cos row is the same list read backwards. Then tan = sin ÷ cos, and the last three rows are reciprocals.
        </p>
      )}
    </div>
  );
}

/** Remark after Table 8.1: as A goes 0°→90°, sin increases 0→1, cos decreases 1→0. */
export function SinCosTrend() {
  const [hover, setHover] = useState<number | null>(null);
  const W = 520;
  const H = 240;
  const pad = { l: 44, r: 16, t: 16, b: 34 };
  const x = (deg: number) => pad.l + (deg / 90) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - v) * (H - pad.t - pad.b);
  const path = (f: (r: number) => number) =>
    Array.from({ length: 91 }, (_, d) => `${d === 0 ? 'M' : 'L'} ${x(d).toFixed(1)} ${y(f((d * Math.PI) / 180)).toFixed(1)}`).join(' ');
  const hv = hover ?? 45;
  const hr = (hv * Math.PI) / 180;

  return (
    <div className="card p-4">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full touch-none select-none"
        role="img"
        aria-label="Graph of sin A and cos A from 0 to 90 degrees"
        onPointerMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const px = ((e.clientX - rect.left) / rect.width) * W;
          setHover(Math.round(Math.min(90, Math.max(0, ((px - pad.l) / (W - pad.l - pad.r)) * 90))));
        }}
        onPointerLeave={() => setHover(null)}
      >
        {[0, 0.5, 1].map((v) => (
          <g key={v}>
            <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} stroke="#e2e8f0" />
            <text x={pad.l - 8} y={y(v)} textAnchor="end" dominantBaseline="middle" fontSize={11} fill="#64748b">
              {v}
            </text>
          </g>
        ))}
        {ANGLES.map((a) => (
          <text key={a} x={x(a)} y={H - 12} textAnchor="middle" fontSize={11} fill="#64748b">
            {a}°
          </text>
        ))}
        <motion.path d={path(Math.sin)} fill="none" stroke={ROLE_COLORS.opposite} strokeWidth={2.5} initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.4 }} />
        <motion.path d={path(Math.cos)} fill="none" stroke={ROLE_COLORS.adjacent} strokeWidth={2.5} initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.4, delay: 0.3 }} />
        {ANGLES.map((a) => (
          <g key={`p${a}`}>
            <circle cx={x(a)} cy={y(Math.sin((a * Math.PI) / 180))} r={4} fill={ROLE_COLORS.opposite} stroke="#fff" strokeWidth={2} />
            <circle cx={x(a)} cy={y(Math.cos((a * Math.PI) / 180))} r={4} fill={ROLE_COLORS.adjacent} stroke="#fff" strokeWidth={2} />
          </g>
        ))}
        <line x1={x(hv)} x2={x(hv)} y1={pad.t} y2={H - pad.b} stroke="#94a3b8" strokeDasharray="3 3" />
        <text x={x(hv) + (hv > 70 ? -6 : 6)} y={pad.t + 10} textAnchor={hv > 70 ? 'end' : 'start'} fontSize={11.5} fontWeight={600} fill="#0f172a">
          {hv}°: sin = {Math.sin(hr).toFixed(2)}, cos = {Math.cos(hr).toFixed(2)}
        </text>
        <text x={x(80)} y={y(Math.sin((80 * Math.PI) / 180)) + 18} fontSize={12} fontWeight={700} fill={ROLE_COLORS.opposite} textAnchor="middle">
          sin A
        </text>
        <text x={x(80)} y={y(Math.cos((80 * Math.PI) / 180)) - 12} fontSize={12} fontWeight={700} fill={ROLE_COLORS.adjacent} textAnchor="middle">
          cos A
        </text>
      </svg>
      <p className="mt-2 text-sm text-slate-600">
        As ∠A increases from 0° to 90°, <span className="font-semibold text-opp">sin A increases from 0 to 1</span> and <span className="font-semibold text-adj">cos A decreases from 1 to 0</span>. They cross at 45°, where sin A = cos A. Hover over the graph to read values.
      </p>
    </div>
  );
}
