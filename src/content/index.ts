import type { Problem, SectionId } from '../types';
import { identityProblems } from './identities';
import { ratioProblems } from './ratios';
import { specificAngleProblems } from './specificAngles';

export const ALL_PROBLEMS: Problem[] = [...ratioProblems, ...specificAngleProblems, ...identityProblems];

export const PROBLEM_BY_ID = new Map(ALL_PROBLEMS.map((p) => [p.id, p]));

export interface SectionMeta {
  id: SectionId | '8.5';
  path: string;
  title: string;
}

/** `path` opens the section's first screen in the lesson. */
export const SECTIONS: SectionMeta[] = [
  { id: '8.1', path: '/play/s-8.1', title: 'Introduction' },
  { id: '8.2', path: '/play/s-8.2', title: 'Trigonometric Ratios' },
  { id: '8.3', path: '/play/s-8.3', title: 'Ratios of Specific Angles' },
  { id: '8.4', path: '/play/s-8.4', title: 'Trigonometric Identities' },
  { id: '8.5', path: '/play/v-summary', title: 'Summary' },
];

/** Link to a problem's screen in the lesson. */
export const problemPath = (id: string) => `/play/p-${id}`;

/** Table 8.1 as LaTeX, indexed [ratio][angle index] with angles 0,30,45,60,90. ND = not defined. */
export const ANGLES = [0, 30, 45, 60, 90] as const;
export type RatioName = 'sin' | 'cos' | 'tan' | 'cosec' | 'sec' | 'cot';
export const RATIO_NAMES: RatioName[] = ['sin', 'cos', 'tan', 'cosec', 'sec', 'cot'];
export const ND = 'ND';
export const TABLE: Record<RatioName, string[]> = {
  sin: ['0', '\\frac{1}{2}', '\\frac{1}{\\sqrt2}', '\\frac{\\sqrt3}{2}', '1'],
  cos: ['1', '\\frac{\\sqrt3}{2}', '\\frac{1}{\\sqrt2}', '\\frac{1}{2}', '0'],
  tan: ['0', '\\frac{1}{\\sqrt3}', '1', '\\sqrt3', ND],
  cosec: [ND, '2', '\\sqrt2', '\\frac{2}{\\sqrt3}', '1'],
  sec: ['1', '\\frac{2}{\\sqrt3}', '\\sqrt2', '2', ND],
  cot: [ND, '\\sqrt3', '1', '\\frac{1}{\\sqrt3}', '0'],
};

export const ratioTex = (r: RatioName) => (r === 'cosec' ? '\\cosec' : `\\${r}`);
