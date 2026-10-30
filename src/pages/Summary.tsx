import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { SectionHeader } from '../components/ui';
import { ANGLES, ND, RATIO_NAMES, TABLE, ratioTex } from '../content';
import { Tex } from '../lib/tex';

const POINTS: Array<{ title: string; tex: string[]; note?: string; link: string }> = [
  {
    title: 'Definitions (right triangle ABC, right-angled at B)',
    tex: ['\\sin A = \\frac{\\text{side opposite to } A}{\\text{hypotenuse}}, \\quad \\cos A = \\frac{\\text{side adjacent to } A}{\\text{hypotenuse}}', '\\tan A = \\frac{\\text{side opposite to } A}{\\text{side adjacent to } A}'],
    link: '/play/v-defs',
  },
  {
    title: 'Reciprocal and quotient relations',
    tex: ['\\cosec A = \\frac{1}{\\sin A},\\quad \\sec A = \\frac{1}{\\cos A},\\quad \\tan A = \\frac{1}{\\cot A},\\quad \\tan A = \\frac{\\sin A}{\\cos A}'],
    link: '/play/v-recip',
  },
  { title: 'If one ratio of an acute angle is known, all the others can be found', tex: [], note: 'Use Pythagoras theorem (or the identities) to find the missing side.', link: '/play/p-8.2-intext-sin' },
  { title: 'Values for 0°, 30°, 45°, 60° and 90°', tex: [], note: 'See the table below.', link: '/play/v-table' },
  {
    title: 'Bounds',
    tex: ['0 \\le \\sin A,\\ \\cos A \\le 1, \\qquad \\sec A \\ge 1 \\ (0^\\circ \\le A < 90^\\circ), \\qquad \\cosec A \\ge 1 \\ (0^\\circ < A \\le 90^\\circ)'],
    link: '/play/v-limits',
  },
  {
    title: 'Identities',
    tex: ['\\sin^2 A + \\cos^2 A = 1', '\\sec^2 A - \\tan^2 A = 1 \\quad (0^\\circ \\le A < 90^\\circ)', '\\cosec^2 A = 1 + \\cot^2 A \\quad (0^\\circ < A \\le 90^\\circ)'],
    link: '/play/v-lab',
  },
];

export default function Summary() {
  return (
    <div>
      <SectionHeader number="8.5" title="Summary" intro="The whole chapter on one screen. Tap any card to jump back to that part of the lesson." />
      <div className="mb-10 grid gap-4 lg:grid-cols-2">
        {POINTS.map((p, i) => (
          <motion.div key={p.title} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
            <Link to={p.link} className="card block h-full p-5 transition hover:border-indigo-300 hover:shadow-md">
              <div className="flex gap-3">
                <span className="font-display grid h-8 w-8 shrink-0 place-items-center rounded-full bg-indigo-600 text-sm font-bold text-white">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display font-bold text-slate-900">{p.title}</h3>
                  {p.tex.map((t) => (
                    <Tex key={t} tex={t} block className="text-sm" />
                  ))}
                  {p.note && <p className="mt-1 text-sm text-slate-600">{p.note}</p>}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="card mb-10 overflow-x-auto">
        <table className="w-full min-w-[520px] text-center">
          <thead>
            <tr className="bg-indigo-600 text-white">
              <th className="p-3 text-sm">∠A</th>
              {ANGLES.map((a) => (
                <th key={a} className="p-3">
                  {a}°
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RATIO_NAMES.map((r) => (
              <tr key={r} className="border-t border-slate-100 odd:bg-slate-50/60">
                <th className="p-2.5 text-left">
                  <Tex tex={`${ratioTex(r)} A`} />
                </th>
                {TABLE[r].map((v, i) => (
                  <td key={i} className="p-2.5">
                    {v === ND ? <span className="text-xs font-semibold text-rose-600">Not defined</span> : <Tex tex={v} />}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/practice" className="btn-primary">
          Test yourself with a quiz <Icon name="arrow-right" />
        </Link>
        <Link to="/progress" className="btn-ghost">
          See my progress
        </Link>
      </div>
    </div>
  );
}
