/**
 * Content schema. Every concept walkthrough, NCERT example and exercise
 * question is authored as a `Problem` and rendered by the generic
 * ProblemPlayer + TriangleFigure engine — content is data, not code.
 *
 * Text fields are "rich text": plain text with inline LaTeX in `$...$`
 * and **bold** segments.
 */

export type SectionId = '8.1' | '8.2' | '8.3' | '8.4';

export type ProblemGroup =
  | 'Derivation'
  | 'In-text'
  | 'Examples'
  | 'Exercise 8.1'
  | 'Exercise 8.2'
  | 'Exercise 8.3';

/**
 * A right triangle drawn with the right angle on the base.
 * vertices = [base vertex, right-angle vertex, apex]. The apex sits
 * directly above the right-angle vertex. `flip` mirrors it horizontally
 * so the right angle is on the left (to match the NCERT figure).
 */
export interface TriangleSpec {
  vertices: [string, string, string];
  /** Visual angle (degrees) at the base vertex — controls the shape. */
  angle: number;
  flip?: boolean;
  /** Side labels keyed by side name, e.g. { AB: '24 cm' }. Order-insensitive. */
  sides?: Record<string, string>;
  /** Angle arcs keyed by vertex, value is the label (may be ''). */
  angleMarks?: Record<string, string>;
  /** Reference angle vertex — sides are coloured opposite / adjacent / hypotenuse to it. */
  ref?: string;
  caption?: string;
}

/** Figure changes applied at a step. `reveal` and `angleMarks` accumulate across steps. */
export interface StepFigure {
  highlight?: string[];
  reveal?: Record<string, string>;
  ref?: string;
  angleMarks?: Record<string, string>;
  /** Stage index for custom figures (e.g. the equilateral-triangle split). */
  stage?: number;
  /** Re-shape the triangle to this angle (degrees) — animates, e.g. shrinking ∠A towards 0°. */
  angle?: number;
}

export interface Step {
  text: string;
  /** Display-mode LaTeX shown under the text. */
  math?: string;
  /** The fact / rule used in this step, shown as a chip. */
  rule?: string;
  fig?: StepFigure;
}

export interface Problem {
  id: string;
  section: SectionId;
  group: ProblemGroup;
  label: string;
  concept?: string;
  question: string;
  /** Multiple-choice / true-false options (rich text). */
  options?: string[];
  correct?: number;
  figures?: TriangleSpec[];
  customFigure?: 'equilateral' | 'similar';
  steps: Step[];
  answer: string;
}
