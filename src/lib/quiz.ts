import { ANGLES, ND, RATIO_NAMES, TABLE, ratioTex, type RatioName } from '../content';
import type { TriangleSpec } from '../types';
import type { QuizCategory } from './progress';

export interface QuizQuestion {
  id: string;
  category: QuizCategory;
  prompt: string;
  options: string[];
  correct: number;
  explain: string;
  figure?: { spec: TriangleSpec };
}

export const CATEGORY_LABEL: Record<QuizCategory, string> = {
  values: 'Standard angle values',
  sides: 'Identifying sides',
  ratios: 'Ratios from sides',
  identities: 'Identities',
  defined: 'Defined / not defined',
};

export const CATEGORY_LINK: Record<QuizCategory, string> = {
  values: '/play/v-table',
  sides: '/play/v-sides',
  ratios: '/play/v-defs',
  identities: '/play/v-lab',
  defined: '/play/v-limits',
};

const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Shuffle the correct answer in with distinct distractors. */
function withOptions(correct: string, distractors: string[]): { options: string[]; correct: number } {
  const unique = [...new Set(distractors.filter((d) => d !== correct))];
  const options = shuffle([correct, ...shuffle(unique).slice(0, 3)]);
  return { options, correct: options.indexOf(correct) };
}

const LABEL_SETS: Array<[string, string, string]> = [
  ['A', 'B', 'C'],
  ['P', 'Q', 'R'],
  ['X', 'Y', 'Z'],
  ['L', 'M', 'N'],
  ['D', 'E', 'F'],
];

function valuesQ(i: number): QuizQuestion {
  let r: RatioName;
  let a: number;
  do {
    r = pick(RATIO_NAMES);
    a = Math.floor(Math.random() * ANGLES.length);
  } while (TABLE[r][a] === ND);
  const correct = `$${TABLE[r][a]}$`;
  const pool = RATIO_NAMES.flatMap((n) => TABLE[n]).filter((v) => v !== ND).map((v) => `$${v}$`);
  const { options, correct: c } = withOptions(correct, pool);
  return {
    id: `q${i}`,
    category: 'values',
    prompt: `What is $${ratioTex(r)} ${ANGLES[a]}^\\circ$?`,
    options,
    correct: c,
    explain: `From Table 8.1, $${ratioTex(r)} ${ANGLES[a]}^\\circ = ${TABLE[r][a]}$.`,
  };
}

function sidesQ(i: number): QuizQuestion {
  const labels = shuffle([...pick(LABEL_SETS)]) as [string, string, string];
  const [p0, p1, p2] = labels;
  const at = Math.random() < 0.5 ? p0 : p2;
  const role = pick(['opposite', 'adjacent', 'hypotenuse'] as const);
  const side = (a: string, b: string) => [a, b].sort().join('');
  const answer =
    role === 'hypotenuse' ? side(p0, p2) : role === 'opposite' ? (at === p0 ? side(p1, p2) : side(p0, p1)) : at === p0 ? side(p0, p1) : side(p1, p2);
  const all = [side(p0, p1), side(p1, p2), side(p0, p2)];
  const options = shuffle(all);
  return {
    id: `q${i}`,
    category: 'sides',
    prompt: `In the right triangle shown (right-angled at ${p1}), which side is the **${role}** ${role === 'hypotenuse' ? '' : `to angle ${at}`}?`,
    options,
    correct: options.indexOf(answer),
    explain:
      role === 'hypotenuse'
        ? `The hypotenuse faces the right angle at ${p1}, so it is ${answer}.`
        : role === 'opposite'
          ? `The opposite side faces angle ${at} — it does not touch ${at}. That is ${answer}.`
          : `The adjacent side touches angle ${at} but is not the hypotenuse. That is ${answer}.`,
    figure: { spec: { vertices: labels, angle: 30 + Math.random() * 30, flip: Math.random() < 0.5, angleMarks: { [at]: '' } } },
  };
}

const TRIPLES: Array<[number, number, number]> = [
  [3, 4, 5],
  [5, 12, 13],
  [8, 15, 17],
  [7, 24, 25],
  [20, 21, 29],
  [9, 40, 41],
];

function ratiosQ(i: number): QuizQuestion {
  const [x, y, h] = pick(TRIPLES);
  const [opp, adj] = Math.random() < 0.5 ? [x, y] : [y, x];
  const [A, B, C] = pick(LABEL_SETS);
  const r = pick(RATIO_NAMES);
  const frac = (n: number, d: number) => `$\\frac{${n}}{${d}}$`;
  const value: Record<RatioName, string> = {
    sin: frac(opp, h),
    cos: frac(adj, h),
    tan: frac(opp, adj),
    cosec: frac(h, opp),
    sec: frac(h, adj),
    cot: frac(adj, opp),
  };
  const { options, correct } = withOptions(value[r], Object.values(value));
  const def: Record<RatioName, string> = {
    sin: 'opposite / hypotenuse',
    cos: 'adjacent / hypotenuse',
    tan: 'opposite / adjacent',
    cosec: 'hypotenuse / opposite',
    sec: 'hypotenuse / adjacent',
    cot: 'adjacent / opposite',
  };
  return {
    id: `q${i}`,
    category: 'ratios',
    prompt: `Using the triangle shown, find $${ratioTex(r)} ${A}$.`,
    options,
    correct,
    explain: `$${ratioTex(r)} ${A}$ = ${def[r]} = ${value[r]}.`,
    figure: {
      spec: {
        vertices: [A, B, C],
        angle: (Math.atan(opp / adj) * 180) / Math.PI,
        ref: A,
        sides: { [A + B]: String(adj), [B + C]: String(opp), [A + C]: String(h) },
      },
    },
  };
}

const IDENTITY_BANK: Array<{ prompt: string; correct: string; wrong: string[]; explain: string }> = [
  { prompt: '$\\sin^2 A + \\cos^2 A =$', correct: '$1$', wrong: ['$0$', '$2$', '$\\tan^2 A$'], explain: 'Divide $AB^2 + BC^2 = AC^2$ by $AC^2$.' },
  { prompt: '$\\sec^2 A - \\tan^2 A =$', correct: '$1$', wrong: ['$0$', '$-1$', '$\\sec A$'], explain: 'From $1 + \\tan^2 A = \\sec^2 A$.' },
  { prompt: '$\\cosec^2 A - \\cot^2 A =$', correct: '$1$', wrong: ['$0$', '$-1$', '$\\cot^2 A$'], explain: 'From $\\cot^2 A + 1 = \\cosec^2 A$.' },
  { prompt: '$1 - \\sin^2 A =$', correct: '$\\cos^2 A$', wrong: ['$\\tan^2 A$', '$\\sec^2 A$', '$1$'], explain: 'Rearrange $\\sin^2 A + \\cos^2 A = 1$.' },
  { prompt: '$1 + \\cot^2 A =$', correct: '$\\cosec^2 A$', wrong: ['$\\sec^2 A$', '$\\tan^2 A$', '$1$'], explain: 'Divide $AB^2 + BC^2 = AC^2$ by $BC^2$.' },
  { prompt: '$\\tan A \\times \\cot A =$', correct: '$1$', wrong: ['$0$', '$\\tan^2 A$', '$\\sin A\\cos A$'], explain: '$\\cot A$ is the reciprocal of $\\tan A$.' },
  { prompt: '$\\dfrac{\\sin A}{\\cos A} =$', correct: '$\\tan A$', wrong: ['$\\cot A$', '$\\sec A$', '$1$'], explain: '$\\frac{BC/AC}{AB/AC} = \\frac{BC}{AB} = \\tan A$.' },
  { prompt: '$(1 + \\tan^2 A)\\cos^2 A =$', correct: '$1$', wrong: ['$\\sin^2 A$', '$\\sec^2 A$', '$0$'], explain: '$(1 + \\tan^2 A)\\cos^2 A = \\sec^2 A\\cos^2 A = 1$.' },
  { prompt: '$(1 - \\cos^2 A)\\cosec^2 A =$', correct: '$1$', wrong: ['$\\cos^2 A$', '$\\cot^2 A$', '$0$'], explain: '$(1 - \\cos^2 A)\\cosec^2 A = \\sin^2 A \\cdot \\frac{1}{\\sin^2 A} = 1$.' },
];

function identitiesQ(i: number): QuizQuestion {
  const q = pick(IDENTITY_BANK);
  const { options, correct } = withOptions(q.correct, q.wrong);
  return { id: `q${i}`, category: 'identities', prompt: q.prompt, options, correct, explain: q.explain };
}

function definedQ(i: number): QuizQuestion {
  const undefinedSet = ['\\tan 90^\\circ', '\\sec 90^\\circ', '\\cot 0^\\circ', '\\cosec 0^\\circ'];
  const definedSet = ['\\tan 0^\\circ', '\\sec 0^\\circ', '\\cot 90^\\circ', '\\cosec 90^\\circ', '\\sin 0^\\circ', '\\cos 90^\\circ', '\\sin 90^\\circ'];
  const bad = pick(undefinedSet);
  const { options, correct } = withOptions(`$${bad}$`, definedSet.map((d) => `$${d}$`));
  const why: Record<string, string> = {
    '\\tan 90^\\circ': '$\\tan 90^\\circ = \\frac{\\sin 90^\\circ}{\\cos 90^\\circ} = \\frac{1}{0}$',
    '\\sec 90^\\circ': '$\\sec 90^\\circ = \\frac{1}{\\cos 90^\\circ} = \\frac{1}{0}$',
    '\\cot 0^\\circ': '$\\cot 0^\\circ = \\frac{\\cos 0^\\circ}{\\sin 0^\\circ} = \\frac{1}{0}$',
    '\\cosec 0^\\circ': '$\\cosec 0^\\circ = \\frac{1}{\\sin 0^\\circ} = \\frac{1}{0}$',
  };
  return {
    id: `q${i}`,
    category: 'defined',
    prompt: 'Which of these is **not defined**?',
    options,
    correct,
    explain: `${why[bad]} — division by zero is not defined.`,
  };
}

/** A balanced, shuffled round of questions across all categories. */
export function generateQuiz(count = 10): QuizQuestion[] {
  const makers = [valuesQ, sidesQ, ratiosQ, identitiesQ, definedQ, valuesQ, ratiosQ, identitiesQ, sidesQ, valuesQ];
  return shuffle(Array.from({ length: count }, (_, i) => makers[i % makers.length](i)));
}
