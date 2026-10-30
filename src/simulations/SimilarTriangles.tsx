import { motion } from 'framer-motion';
import { ROLE_COLORS } from '../components/TriangleFigure';

/**
 * NCERT Fig 8.6 — P on the hypotenuse AC with PM ⊥ AB, and Q on AC extended with QN ⊥ AB extended.
 * stage: 0 △CAB · 1 △PAM · 2 compare sin A in △PAM and △CAB · 3 △QAN
 */
export function SimilarTriangles({ stage }: { stage: number }) {
  const A = { x: 34, y: 226 };
  const B = { x: 236, y: 226 };
  const C = { x: 236, y: 226 - 202 * Math.tan((36 * Math.PI) / 180) };
  const at = (t: number) => ({ x: A.x + t * (C.x - A.x), y: A.y + t * (C.y - A.y) });
  const P = at(0.55);
  const M = { x: P.x, y: A.y };
  const Q = at(1.3);
  const N = { x: Q.x, y: A.y };

  const VIOLET = '#7c3aed';
  const TEAL = '#0d9488';
  const showP = stage >= 1;
  const showQ = stage >= 3;
  const compare = stage === 2;

  const seg = (p: { x: number; y: number }, q: { x: number; y: number }, color: string, width = 3, dash?: string, key?: string) => (
    <motion.line key={key} x1={p.x} y1={p.y} x2={q.x} y2={q.y} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7 }} stroke={color} strokeWidth={width} strokeDasharray={dash} strokeLinecap="round" />
  );
  const label = (p: { x: number; y: number }, text: string, dx: number, dy: number, color = '#0f172a') => (
    <text x={p.x + dx} y={p.y + dy} textAnchor="middle" dominantBaseline="middle" fontSize={15} fontWeight={700} fill={color} stroke="#fff" strokeWidth={4} paintOrder="stroke">
      {text}
    </text>
  );
  const rightMark = (p: { x: number; y: number }, color: string) => <path d={`M ${p.x - 10} ${p.y} v -10 h 10`} fill="none" stroke={color} strokeWidth={1.4} />;

  return (
    <svg viewBox="0 0 360 260" className="h-auto w-full select-none" role="img" aria-label="Right triangle ABC with smaller triangle PAM and larger triangle QAN sharing angle A">
      {/* △QAN (Q on AC extended) */}
      {showQ && (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <path d={`M ${A.x} ${A.y} L ${N.x} ${N.y} L ${Q.x} ${Q.y} Z`} fill={TEAL} opacity={0.08} />
          {seg(C, Q, TEAL, 2.5, '5 4', 'cq')}
          {seg(B, N, TEAL, 2.5, '5 4', 'bn')}
          {seg(Q, N, TEAL, 2.5, '5 4', 'qn')}
          {rightMark(N, TEAL)}
          {label(Q, 'Q', 4, -12, TEAL)}
          {label(N, 'N', 8, 16, TEAL)}
        </motion.g>
      )}

      {/* △CAB */}
      <path d={`M ${A.x} ${A.y} L ${B.x} ${B.y} L ${C.x} ${C.y} Z`} fill="#eef2ff" opacity={0.8} />
      <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={ROLE_COLORS.adjacent} strokeWidth={3} strokeLinecap="round" />
      <line x1={B.x} y1={B.y} x2={C.x} y2={C.y} stroke={ROLE_COLORS.opposite} strokeWidth={compare ? 5 : 3} strokeLinecap="round" />
      <line x1={A.x} y1={A.y} x2={C.x} y2={C.y} stroke={ROLE_COLORS.hypotenuse} strokeWidth={compare ? 5 : 3} strokeLinecap="round" />
      {rightMark(B, '#64748b')}
      <path d={`M ${A.x + 28} ${A.y} A 28 28 0 0 0 ${A.x + 28 * Math.cos((36 * Math.PI) / 180)} ${A.y - 28 * Math.sin((36 * Math.PI) / 180)}`} fill="none" stroke="#4f46e5" strokeWidth={2.5} />

      {/* △PAM (P on AC) */}
      {showP && (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <path d={`M ${A.x} ${A.y} L ${M.x} ${M.y} L ${P.x} ${P.y} Z`} fill={VIOLET} opacity={stage === 3 ? 0.06 : 0.14} />
          {seg(P, M, VIOLET, compare ? 5 : 3, compare ? undefined : '6 4', 'pm')}
          {compare && seg(A, P, VIOLET, 5, undefined, 'ap')}
          {rightMark(M, VIOLET)}
          <circle cx={P.x} cy={P.y} r={4} fill={VIOLET} />
          {label(P, 'P', -12, -10, VIOLET)}
          {label(M, 'M', 0, 17, VIOLET)}
        </motion.g>
      )}

      {label(A, 'A', -12, 6)}
      {label(B, 'B', 10, 16)}
      {label(C, 'C', -12, -6)}
    </svg>
  );
}
