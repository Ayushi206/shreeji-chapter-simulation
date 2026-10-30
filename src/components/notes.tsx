import { motion } from 'framer-motion';
import { Tex } from '../lib/tex';
import { Callout } from './ui';

/** Concept blocks shared by the section pages and the lesson-mode screens. */

/** The chapter-opening quote from the NCERT textbook (p. 113). */
export function ChapterQuote({ className = '' }: { className?: string }) {
  return (
    <motion.blockquote initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className={`border-l-4 border-indigo-300 pl-4 ${className}`}>
      <p className="text-[15px] text-slate-600 italic">“There is perhaps nothing which so occupies the middle position of mathematics as trigonometry.”</p>
      <footer className="mt-1 text-sm font-semibold text-slate-500">— J.F. Herbart (1890)</footer>
    </motion.blockquote>
  );
}

const WORD = [
  { part: 'tri', meaning: 'three' },
  { part: 'gon', meaning: 'sides' },
  { part: 'metron', meaning: 'measure' },
];

export function TrigWord() {
  return (
    <div className="card p-6">
      <div className="flex flex-wrap items-end justify-center gap-2 sm:gap-4">
        {WORD.map((w, i) => (
          <motion.div key={w.part} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.35 }} className="text-center">
            <div className="font-display rounded-2xl bg-indigo-600 px-4 py-3 text-2xl font-extrabold text-white sm:text-3xl">{w.part}</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.35 }} className="mt-2 text-sm font-semibold text-slate-600">
              {w.meaning}
            </motion.div>
          </motion.div>
        ))}
      </div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="mx-auto mt-6 max-w-2xl text-center text-[15px] text-slate-700">
        From Greek. <strong>Trigonometry is the study of relationships between the sides and angles of a triangle.</strong>
      </motion.p>
    </div>
  );
}

export function IntroNotes() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Callout tone="history" title="A very old idea">
        <p>The earliest known work on trigonometry was recorded in Egypt and Babylon. Early astronomers used it to find the distances of the stars and planets from the Earth.</p>
        <p>Even today, most of the advanced methods used in engineering and the physical sciences are based on trigonometric ideas.</p>
      </Callout>
      <Callout tone="remark" title="What we will study in this chapter">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Ratios of the sides of a right triangle with respect to its acute angles, called the <strong>trigonometric ratios</strong> of the angle
          </li>
          <li>These ratios for angles of 0° and 90° as well</li>
          <li>Exact values for some specific angles</li>
          <li>
            Equations that are true for every angle, called <strong>trigonometric identities</strong>
          </li>
        </ul>
        <p className="text-xs opacity-80">We restrict ourselves to acute angles, but the ratios can be extended to other angles too.</p>
      </Callout>
    </div>
  );
}

const DEFS = [
  { name: 'sine', tex: '\\sin A = \\dfrac{\\color{#e11d48}{\\text{opposite}}}{\\color{#d97706}{\\text{hypotenuse}}} = \\dfrac{BC}{AC}' },
  { name: 'cosine', tex: '\\cos A = \\dfrac{\\color{#2563eb}{\\text{adjacent}}}{\\color{#d97706}{\\text{hypotenuse}}} = \\dfrac{AB}{AC}' },
  { name: 'tangent', tex: '\\tan A = \\dfrac{\\color{#e11d48}{\\text{opposite}}}{\\color{#2563eb}{\\text{adjacent}}} = \\dfrac{BC}{AB}' },
  { name: 'cosecant', tex: '\\cosec A = \\dfrac{1}{\\sin A} = \\dfrac{AC}{BC}' },
  { name: 'secant', tex: '\\sec A = \\dfrac{1}{\\cos A} = \\dfrac{AC}{AB}' },
  { name: 'cotangent', tex: '\\cot A = \\dfrac{1}{\\tan A} = \\dfrac{AB}{BC}' },
];

export function DefinitionsGrid() {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {DEFS.map((d, i) => (
          <motion.div key={d.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="card p-4">
            <p className="mb-1 text-xs font-bold tracking-wide text-slate-400 uppercase">{d.name}</p>
            <Tex tex={d.tex} block />
          </motion.div>
        ))}
      </div>
      <p className="mt-3 text-sm text-slate-600">
        <strong>Mnemonic:</strong> sin = <span className="text-opp">O</span>/<span className="text-hyp">H</span>, cos = <span className="text-adj">A</span>/<span className="text-hyp">H</span>, tan = <span className="text-opp">O</span>/<span className="text-adj">A</span>. The last three ratios are the first three flipped upside down.
      </p>
    </>
  );
}

export function RatioRemarks() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Callout tone="warning" title="Remark: sin A is NOT “sin × A”">
        <p>
          <Tex tex="\sin A" /> is short for “the sine of angle A”. “sin” on its own, separated from A, has no meaning. In the same way, <Tex tex="\cos A" /> is not cos × A.
        </p>
      </Callout>
      <Callout tone="remark" title="Notation note">
        <p>
          We write <Tex tex="\sin^2 A" /> for <Tex tex="(\sin A)^2" />. But <Tex tex="\cosec A = (\sin A)^{-1} \neq \sin^{-1} A" />. The symbol <Tex tex="\sin^{-1} A" /> (sine inverse) means something different and comes in higher classes. The Greek letter θ (theta) is also often used for an angle.
        </p>
      </Callout>
      <Callout tone="tip" title="Remark: sin A and cos A are always below 1">
        <p>The hypotenuse is the longest side of a right triangle, so opposite ÷ hypotenuse and adjacent ÷ hypotenuse can never be more than 1. They can equal 1 only in the special cases covered in Section 8.3.</p>
      </Callout>
      <Callout tone="history" title="History: from jya to sine">
        <p>
          The first use of “sine” in today’s sense was in <em>Aryabhatiyam</em> by <strong>Aryabhata</strong> (A.D. 500). He called the half-chord <em>ardha-jya</em>, which was shortened to <em>jya</em> or <em>jiva</em>. Translated into Arabic and then Latin, <em>jiva</em> became <em>sinus</em>, which became “sine”.
        </p>
        <p>Edmund Gunter (1581–1626) first used the short form “sin”. The cosine came from computing the sine of the complementary angle: Aryabhata called it <em>kotijya</em>. Sir Jonas Moore first wrote “cos” in 1674.</p>
      </Callout>
    </div>
  );
}

export function IdentityCards() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {[
        ['\\sin^2 A + \\cos^2 A = 1', '0° ≤ A ≤ 90°'],
        ['1 + \\tan^2 A = \\sec^2 A', '0° ≤ A < 90°'],
        ['\\cot^2 A + 1 = \\cosec^2 A', '0° < A ≤ 90°'],
      ].map(([tex, range]) => (
        <div key={tex} className="card p-4 text-center">
          <Tex tex={tex} block className="text-lg" />
          <p className="text-xs font-semibold text-slate-500">valid for {range}</p>
        </div>
      ))}
    </div>
  );
}

const STRATEGIES = [
  { title: 'Convert to sin & cos', body: 'When stuck, rewrite tan, cot, sec and cosec in terms of sin and cos, then simplify.', eg: '\\tan A = \\tfrac{\\sin A}{\\cos A}' },
  { title: 'Replace the “1”', body: 'A plain 1 can be swapped for an identity that fits the expression, e.g. 1 = sec² − tan².', eg: '1 = \\sin^2A + \\cos^2A' },
  { title: 'Multiply by a conjugate', body: 'Multiply top and bottom by (a − b) to create a² − b², which an identity can then collapse.', eg: '(1-\\sin A)(1+\\sin A) = \\cos^2A' },
  { title: 'Work on both sides', body: 'If the two sides look very different, simplify each separately until they meet in the middle.', eg: '\\text{LHS} \\to X \\leftarrow \\text{RHS}' },
];

export function ProofToolkit() {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {STRATEGIES.map((s, i) => (
          <motion.div key={s.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="card p-4">
            <span className="font-display text-xs font-extrabold text-indigo-500">0{i + 1}</span>
            <h3 className="font-display font-bold text-slate-900">{s.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{s.body}</p>
            <Tex tex={s.eg} block className="mt-2 text-sm" />
          </motion.div>
        ))}
      </div>
      <Callout tone="warning" title="Common mistake">
        <p>
          Don’t “cancel” across a plus sign. <Tex tex="\frac{\sin A + 1}{\sin A}" /> is <strong>not</strong> 1 + 1. Only common <em>factors</em> of the whole numerator and the whole denominator can be cancelled.
        </p>
      </Callout>
    </div>
  );
}
