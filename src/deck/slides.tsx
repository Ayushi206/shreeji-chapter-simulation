import type { ReactNode } from 'react';
import { DefinitionsGrid, IdentityCards, IntroNotes, ProofToolkit, RatioRemarks, TrigWord } from '../components/notes';
import { ALL_PROBLEMS, PROBLEM_BY_ID } from '../content';
import Summary from '../pages/Summary';
import { IdentityLab } from '../simulations/IdentityLab';
import { IntroScene, SCENE_IDS, sceneFig, sceneTitle } from '../simulations/IntroScene';
import { MeetTheSides, RatioExplorer, ReciprocalCards } from '../simulations/RatioExplorer';
import { LimitExplorer, SinCosTrend, ValueTable } from '../simulations/SpecialAngles';
import type { Problem, ProblemGroup, SectionId } from '../types';

/**
 * Lesson mode: the whole chapter as one linear sequence of screens.
 * Problem screens are stepped through tap by tap; other screens are a single view.
 */
export type Slide =
  | { id: string; section: SectionId | '8.5' | ''; kind: 'cover' | 'end' }
  | { id: string; section: SectionId | '8.5'; kind: 'section'; title: string; blurb: string }
  | { id: string; section: SectionId | '8.5'; kind: 'view'; kicker: string; title: string; body: () => ReactNode; bare?: boolean }
  | { id: string; section: SectionId; kind: 'problem'; problem: Problem };

const problem = (id: string): Slide => {
  const p = PROBLEM_BY_ID.get(id);
  if (!p) throw new Error(`Unknown problem ${id}`);
  return { id: `p-${id}`, section: p.section, kind: 'problem', problem: p };
};

const problemsIn = (section: SectionId, groups: ProblemGroup[]): Slide[] =>
  ALL_PROBLEMS.filter((p) => p.section === section && groups.includes(p.group)).map((p) => problem(p.id));

export const SLIDES: Slide[] = [
  { id: 'cover', section: '', kind: 'cover' },

  // 8.1
  { id: 's-8.1', section: '8.1', kind: 'section', title: 'Introduction', blurb: 'Right triangles are hiding everywhere around us. If we can spot them, we can measure heights and distances we could never reach.' },
  ...SCENE_IDS.map(
    (scene, i): Slide => ({
      id: `v-scene-${scene}`,
      section: '8.1',
      kind: 'view',
      kicker: `Situation ${i + 1} of ${SCENE_IDS.length} · ${sceneFig(scene)}`,
      title: sceneTitle(scene),
      body: () => <IntroScene scene={scene} />,
      bare: true,
    }),
  ),
  { id: 'v-word', section: '8.1', kind: 'view', kicker: 'Concept', title: 'What does “trigonometry” mean?', body: () => (<div className="space-y-6"><TrigWord /><IntroNotes /></div>) },

  // 8.2
  { id: 's-8.2', section: '8.2', kind: 'section', title: 'Trigonometric Ratios', blurb: 'Six ratios of the sides of a right triangle, fixed by the angle alone.' },
  { id: 'v-sides', section: '8.2', kind: 'view', kicker: 'Step 1 · Fig. 8.4 & 8.5', title: 'Opposite, adjacent, hypotenuse', body: () => <MeetTheSides /> },
  { id: 'v-defs', section: '8.2', kind: 'view', kicker: 'Step 2 · Definitions', title: 'The six trigonometric ratios', body: () => <DefinitionsGrid /> },
  problem('8.2-intext-angle-c'),
  { id: 'v-explorer', section: '8.2', kind: 'view', kicker: 'Simulation', title: 'Ratio Explorer', body: () => <RatioExplorer /> },
  problem('8.2-intext-similar'),
  { id: 'v-recip', section: '8.2', kind: 'view', kicker: 'Interactive', title: 'Reciprocals and the quotient relation', body: () => <ReciprocalCards /> },
  { id: 'v-remarks', section: '8.2', kind: 'view', kicker: 'Remarks', title: 'Things to remember', body: () => <RatioRemarks /> },
  problem('8.2-intext-sin'),
  ...problemsIn('8.2', ['Examples', 'Exercise 8.1']),

  // 8.3
  { id: 's-8.3', section: '8.3', kind: 'section', title: 'Ratios of Specific Angles', blurb: 'Derive the exact values for 0°, 30°, 45°, 60° and 90° using nothing but geometry.' },
  problem('8.3-derive-45'),
  problem('8.3-derive-30-60'),
  problem('8.3-derive-0-90'),
  { id: 'v-limits', section: '8.3', kind: 'view', kicker: 'Simulation · Fig. 8.17 & 8.18', title: 'Try it yourself: slide the angle to 0° and 90°', body: () => <LimitExplorer /> },
  { id: 'v-table', section: '8.3', kind: 'view', kicker: 'Interactive table', title: 'Table 8.1 — test yourself', body: () => <ValueTable /> },
  { id: 'v-trend', section: '8.3', kind: 'view', kicker: 'Remark', title: 'How sin A and cos A change', body: () => <SinCosTrend /> },
  ...problemsIn('8.3', ['Examples', 'Exercise 8.2']),

  // 8.4
  { id: 's-8.4', section: '8.4', kind: 'section', title: 'Trigonometric Identities', blurb: 'Three identities from one theorem, and how to prove anything with them.' },
  problem('8.4-derive'),
  { id: 'v-lab', section: '8.4', kind: 'view', kicker: 'Simulation', title: 'Identity Lab: try to break them', body: () => (<div className="space-y-6"><IdentityLab /><IdentityCards /></div>) },
  problem('8.4-intext-tan'),
  { id: 'v-toolkit', section: '8.4', kind: 'view', kicker: 'Strategy', title: 'Proof toolkit', body: () => <ProofToolkit /> },
  ...problemsIn('8.4', ['Examples', 'Exercise 8.3']),

  // 8.5
  { id: 'v-summary', section: '8.5', kind: 'view', kicker: '8.5', title: 'Summary', body: () => <Summary />, bare: true },
  { id: 'end', section: '', kind: 'end' },
];

export const slideTitle = (s: Slide): string => {
  switch (s.kind) {
    case 'cover':
      return 'Start';
    case 'end':
      return 'Chapter complete';
    case 'problem':
      return `${s.problem.group} · ${s.problem.label}`;
    default:
      return s.title;
  }
};
