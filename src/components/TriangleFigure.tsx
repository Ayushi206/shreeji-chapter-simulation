import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import type { TriangleSpec } from '../types';

export const ROLE_COLORS = {
  opposite: '#e11d48',
  adjacent: '#2563eb',
  hypotenuse: '#d97706',
} as const;
export type Role = keyof typeof ROLE_COLORS;

const NEUTRAL = '#334155';

export type Pt = { x: number; y: number };

/** Side names are order-insensitive: "BA" and "AB" are the same side. */
export const sideKey = (a: string, b: string) => [a, b].sort().join('');
const normKey = (s: string) => s.split('').sort().join('');

/** Places the triangle inside a W×H box; returns [base vertex, right-angle vertex, apex]. */
export function layoutTriangle(angleDeg: number, flip = false, W = 360, H = 260, maxW = 250, maxH = 170): [Pt, Pt, Pt] {
  const a = (Math.min(Math.max(angleDeg, 0.4), 89.6) * Math.PI) / 180;
  let b = maxW;
  let h = b * Math.tan(a);
  if (h > maxH) {
    h = maxH;
    b = h / Math.tan(a);
  }
  const x0 = (W - b) / 2;
  const yb = (H + h) / 2 + 4;
  const base = { x: flip ? x0 + b : x0, y: yb };
  const right = { x: flip ? x0 : x0 + b, y: yb };
  const apex = { x: right.x, y: yb - h };
  return [base, right, apex];
}

/** Role of each side relative to a reference vertex (which must be an acute vertex). */
export function sideRoles(vertices: [string, string, string], ref?: string | null): Record<string, Role> {
  const [p0, p1, p2] = vertices;
  const hyp = sideKey(p0, p2);
  if (ref === p0) return { [sideKey(p1, p2)]: 'opposite', [sideKey(p0, p1)]: 'adjacent', [hyp]: 'hypotenuse' };
  if (ref === p2) return { [sideKey(p0, p1)]: 'opposite', [sideKey(p1, p2)]: 'adjacent', [hyp]: 'hypotenuse' };
  return {};
}

const unit = (from: Pt, to: Pt) => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: dx / len, y: dy / len, len };
};

function arc(v: Pt, p: Pt, q: Pt, r: number) {
  const a1 = Math.atan2(p.y - v.y, p.x - v.x);
  const a2 = Math.atan2(q.y - v.y, q.x - v.x);
  let d = a2 - a1;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  const s = { x: v.x + r * Math.cos(a1), y: v.y + r * Math.sin(a1) };
  const e = { x: v.x + r * Math.cos(a1 + d), y: v.y + r * Math.sin(a1 + d) };
  const mid = a1 + d / 2;
  return {
    d: `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 0 ${d > 0 ? 1 : 0} ${e.x.toFixed(2)} ${e.y.toFixed(2)}`,
    label: { x: v.x + (r + 15) * Math.cos(mid), y: v.y + (r + 15) * Math.sin(mid) },
  };
}

export interface TriangleFigureProps {
  spec: TriangleSpec;
  /** Override the spec's angle (e.g. live sliders). */
  angle?: number;
  highlight?: string[];
  sideLabels?: Record<string, string>;
  refVertex?: string | null;
  angleMarks?: Record<string, string>;
  /** Smoothly animate geometry changes (off for slider-driven figures). */
  animate?: boolean;
  /** Extra SVG drawn on top; receives the vertex positions keyed by name. */
  overlay?: (pts: Record<string, Pt>) => ReactNode;
  className?: string;
  width?: number;
  height?: number;
}

export function TriangleFigure({
  spec,
  angle,
  highlight = [],
  sideLabels,
  refVertex,
  angleMarks,
  animate = true,
  overlay,
  className = '',
  width = 360,
  height = 260,
}: TriangleFigureProps) {
  const [n0, n1, n2] = spec.vertices;
  const [p0, p1, p2] = layoutTriangle(angle ?? spec.angle, spec.flip, width, height);
  const pts: Record<string, Pt> = { [n0]: p0, [n1]: p1, [n2]: p2 };
  const centroid = { x: (p0.x + p1.x + p2.x) / 3, y: (p0.y + p1.y + p2.y) / 3 };

  const ref = refVertex === undefined ? spec.ref : refVertex;
  const roles = sideRoles(spec.vertices, ref);
  const hl = new Set(highlight.map(normKey));
  const labels: Record<string, string> = {};
  for (const [k, v] of Object.entries({ ...spec.sides, ...sideLabels })) labels[normKey(k)] = v;
  const marks = { ...spec.angleMarks, ...angleMarks };

  const t = animate ? { type: 'spring' as const, stiffness: 140, damping: 22 } : { duration: 0 };

  const sides: Array<[string, string]> = [
    [n0, n1],
    [n1, n2],
    [n0, n2],
  ];

  // Right-angle marker
  const u = unit(p1, p0);
  const w = unit(p1, p2);
  const s = Math.min(13, u.len * 0.3, w.len * 0.3);
  const rightMark = `M ${p1.x + u.x * s} ${p1.y + u.y * s} L ${p1.x + u.x * s + w.x * s} ${p1.y + u.y * s + w.y * s} L ${p1.x + w.x * s} ${p1.y + w.y * s}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={`h-auto w-full select-none ${className}`} role="img" aria-label={`Right triangle ${n0}${n1}${n2}, right-angled at ${n1}`}>
      <motion.path
        initial={false}
        animate={{ d: `M ${p0.x} ${p0.y} L ${p1.x} ${p1.y} L ${p2.x} ${p2.y} Z` }}
        transition={t}
        fill="#eef2ff"
        opacity={0.75}
      />

      {/* highlight glow (under the sides) */}
      {sides.map(([a, b]) => {
        const key = sideKey(a, b);
        if (!hl.has(key)) return null;
        const col = roles[key] ? ROLE_COLORS[roles[key]] : '#6366f1';
        return (
          <motion.line
            key={`glow-${key}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.18, 0.4, 0.18], x1: pts[a].x, y1: pts[a].y, x2: pts[b].x, y2: pts[b].y }}
            transition={{ opacity: { duration: 1.6, repeat: Infinity }, default: t }}
            stroke={col}
            strokeWidth={13}
            strokeLinecap="round"
          />
        );
      })}

      {sides.map(([a, b]) => {
        const key = sideKey(a, b);
        const role = roles[key];
        const col = role ? ROLE_COLORS[role] : NEUTRAL;
        const dim = hl.size > 0 && !hl.has(key);
        return (
          <motion.line
            key={key}
            initial={false}
            animate={{ x1: pts[a].x, y1: pts[a].y, x2: pts[b].x, y2: pts[b].y, opacity: dim ? 0.35 : 1 }}
            transition={t}
            stroke={col}
            strokeWidth={hl.has(key) ? 4.5 : 3}
            strokeLinecap="round"
          />
        );
      })}

      <motion.path initial={false} animate={{ d: rightMark }} transition={t} fill="none" stroke="#64748b" strokeWidth={1.5} />

      {Object.entries(marks).map(([v, text]) => {
        if (!pts[v] || v === n1) return null;
        const others = spec.vertices.filter((n) => n !== v);
        const a = arc(pts[v], pts[others[0]], pts[others[1]], 24);
        const isRef = v === ref;
        return (
          <g key={`ang-${v}`}>
            <path d={a.d} fill="none" stroke={isRef ? '#4f46e5' : '#64748b'} strokeWidth={isRef ? 2.5 : 1.6} />
            {text && (
              <motion.g initial={false} animate={{ x: a.label.x, y: a.label.y }} transition={t}>
                <text textAnchor="middle" dominantBaseline="middle" fontSize={13} fontWeight={700} fill={isRef ? '#4f46e5' : '#475569'}>
                  {text}
                </text>
              </motion.g>
            )}
          </g>
        );
      })}

      {/* reference-angle arc when no explicit mark */}
      {ref && ref !== n1 && pts[ref] && marks[ref] === undefined && (() => {
        const others = spec.vertices.filter((n) => n !== ref);
        const a = arc(pts[ref], pts[others[0]], pts[others[1]], 24);
        return <path d={a.d} fill="none" stroke="#4f46e5" strokeWidth={2.5} />;
      })()}

      {/* side labels */}
      {sides.map(([a, b]) => {
        const key = sideKey(a, b);
        const text = labels[key];
        if (!text) return null;
        const mx = (pts[a].x + pts[b].x) / 2;
        const my = (pts[a].y + pts[b].y) / 2;
        const d = unit(centroid, { x: mx, y: my });
        const off = 17 + Math.min(text.length, 12) * 1.6;
        const role = roles[key];
        return (
          <motion.g key={`lab-${key}`} initial={false} animate={{ x: mx + d.x * off, y: my + d.y * off }} transition={t}>
            <motion.text
              key={text}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={13.5}
              fontWeight={600}
              fill={role ? ROLE_COLORS[role] : '#0f172a'}
              stroke="#fff"
              strokeWidth={4}
              paintOrder="stroke"
            >
              {text}
            </motion.text>
          </motion.g>
        );
      })}

      {/* vertex labels */}
      {spec.vertices.map((v) => {
        const d = unit(centroid, pts[v]);
        return (
          <motion.g key={`v-${v}`} initial={false} animate={{ x: pts[v].x + d.x * 15, y: pts[v].y + d.y * 15 }} transition={t}>
            <text textAnchor="middle" dominantBaseline="middle" fontSize={16} fontWeight={700} fill="#0f172a" fontFamily="Plus Jakarta Sans, Inter, sans-serif">
              {v}
            </text>
          </motion.g>
        );
      })}

      {overlay?.(pts)}
    </svg>
  );
}

export function RoleLegend({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-slate-600 ${className}`}>
      {(Object.keys(ROLE_COLORS) as Role[]).map((r) => (
        <span key={r} className="inline-flex items-center gap-1.5">
          <span className="h-1 w-5 rounded-full" style={{ background: ROLE_COLORS[r] }} />
          {r[0].toUpperCase() + r.slice(1)}
        </span>
      ))}
    </div>
  );
}
