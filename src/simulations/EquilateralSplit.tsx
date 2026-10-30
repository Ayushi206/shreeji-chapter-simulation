import { motion } from 'framer-motion';
import { ROLE_COLORS } from '../components/TriangleFigure';

/**
 * NCERT Fig 8.15 — an equilateral triangle split by the altitude AD,
 * used to derive the ratios of 30° and 60°. `stage` drives the animation:
 * 0 equilateral · 1 altitude · 2 focus ΔABD · 3 AD = a√3 · 4 roles for 30° · 5 roles for 60°
 */
export function EquilateralSplit({ stage }: { stage: number }) {
  const B = { x: 80, y: 228 };
  const C = { x: 280, y: 228 };
  const A = { x: 180, y: 228 - 200 * (Math.sqrt(3) / 2) };
  const D = { x: 180, y: 228 };

  const roleAt30 = stage === 4;
  const roleAt60 = stage >= 5;
  const colAB = roleAt30 || roleAt60 ? ROLE_COLORS.hypotenuse : '#334155';
  const colBD = roleAt30 ? ROLE_COLORS.opposite : roleAt60 ? ROLE_COLORS.adjacent : '#334155';
  const colAD = roleAt30 ? ROLE_COLORS.adjacent : roleAt60 ? ROLE_COLORS.opposite : '#334155';
  const fadeRight = stage >= 2 ? 0.18 : 1;

  const label = (x: number, y: number, text: string, fill = '#0f172a', size = 15) => (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize={size} fontWeight={700} fill={fill} stroke="#fff" strokeWidth={4} paintOrder="stroke">
      {text}
    </text>
  );

  return (
    <svg viewBox="0 0 360 260" className="h-auto w-full select-none" role="img" aria-label="Equilateral triangle ABC with altitude AD">
      <path d={`M ${A.x} ${A.y} L ${B.x} ${B.y} L ${D.x} ${D.y} Z`} fill="#eef2ff" />
      <motion.path d={`M ${A.x} ${A.y} L ${D.x} ${D.y} L ${C.x} ${C.y} Z`} fill="#eef2ff" animate={{ opacity: fadeRight }} />

      {/* right half */}
      <motion.g animate={{ opacity: fadeRight }}>
        <line x1={A.x} y1={A.y} x2={C.x} y2={C.y} stroke="#334155" strokeWidth={3} strokeLinecap="round" />
        <line x1={D.x} y1={D.y} x2={C.x} y2={C.y} stroke="#334155" strokeWidth={3} strokeLinecap="round" />
        {label(C.x + 14, C.y + 6, 'C')}
        {stage === 0 && label(C.x - 30, C.y - 14, '60°', '#475569', 12)}
      </motion.g>

      {/* left half */}
      <motion.line x1={A.x} y1={A.y} x2={B.x} y2={B.y} animate={{ stroke: colAB }} strokeWidth={stage >= 2 ? 4.5 : 3} strokeLinecap="round" />
      <motion.line x1={B.x} y1={B.y} x2={D.x} y2={D.y} animate={{ stroke: colBD }} strokeWidth={stage >= 2 ? 4.5 : 3} strokeLinecap="round" />
      {stage === 0 && <line x1={D.x} y1={D.y} x2={C.x} y2={C.y} stroke="#334155" strokeWidth={3} />}

      {/* altitude */}
      {stage >= 1 && (
        <motion.line
          x1={A.x}
          y1={A.y}
          x2={D.x}
          y2={D.y}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1, stroke: colAD }}
          transition={{ duration: 0.9 }}
          strokeWidth={stage >= 2 ? 4.5 : 3}
          strokeDasharray={stage === 1 ? '6 5' : undefined}
          strokeLinecap="round"
        />
      )}
      {stage >= 1 && <path d={`M ${D.x - 12} ${D.y} L ${D.x - 12} ${D.y - 12} L ${D.x} ${D.y - 12}`} fill="none" stroke="#64748b" strokeWidth={1.5} />}

      {/* angle marks */}
      <path d={describeArc(B, A, D, 26)} fill="none" stroke={roleAt60 ? '#4f46e5' : '#64748b'} strokeWidth={roleAt60 ? 2.5 : 1.6} />
      {label(B.x + 40, B.y - 14, '60°', roleAt60 ? '#4f46e5' : '#475569', 12)}
      {stage >= 1 ? (
        <>
          <path d={describeArc(A, B, D, 30)} fill="none" stroke={roleAt30 ? '#4f46e5' : '#64748b'} strokeWidth={roleAt30 ? 2.5 : 1.6} />
          {label(A.x - 12, A.y + 46, '30°', roleAt30 ? '#4f46e5' : '#475569', 12)}
          <motion.g animate={{ opacity: fadeRight }}>{label(A.x + 12, A.y + 46, '30°', '#475569', 12)}</motion.g>
        </>
      ) : (
        <>
          <path d={describeArc(A, B, C, 26)} fill="none" stroke="#64748b" strokeWidth={1.6} />
          {label(A.x, A.y + 42, '60°', '#475569', 12)}
        </>
      )}

      {/* side lengths */}
      {stage >= 2 && label((A.x + B.x) / 2 - 22, (A.y + B.y) / 2, '2a', colAB)}
      {stage >= 2 && label((B.x + D.x) / 2, B.y + 18, 'a', colBD)}
      {stage >= 3 && label(A.x + 22, (A.y + D.y) / 2 + 30, 'a√3', colAD)}

      {label(A.x, A.y - 14, 'A')}
      {label(B.x - 14, B.y + 6, 'B')}
      {stage >= 1 && label(D.x, D.y + 18, 'D')}
    </svg>
  );
}

function describeArc(v: { x: number; y: number }, p: { x: number; y: number }, q: { x: number; y: number }, r: number) {
  const a1 = Math.atan2(p.y - v.y, p.x - v.x);
  const a2 = Math.atan2(q.y - v.y, q.x - v.x);
  let d = a2 - a1;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  const s = { x: v.x + r * Math.cos(a1), y: v.y + r * Math.sin(a1) };
  const e = { x: v.x + r * Math.cos(a1 + d), y: v.y + r * Math.sin(a1 + d) };
  return `M ${s.x} ${s.y} A ${r} ${r} 0 0 ${d > 0 ? 1 : 0} ${e.x} ${e.y}`;
}
