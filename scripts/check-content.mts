/**
 * Content QA: renders every LaTeX fragment of every problem with KaTeX in strict
 * mode, and checks ids, MCQ answer indices and figure side references.
 * Run: npm run check:content
 */
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const katex = require('katex');
const { ratioProblems } = await import('../src/content/ratios.ts');
const { specificAngleProblems } = await import('../src/content/specificAngles.ts');
const { identityProblems } = await import('../src/content/identities.ts');
const all = [...ratioProblems, ...specificAngleProblems, ...identityProblems];
const macros = { [String.raw`\cosec`]: String.raw`\operatorname{cosec}` };
let errors = 0, count = 0;
const check = (tex: string, where: string, display = false) => {
  count++;
  try { katex.renderToString(tex, { throwOnError: true, displayMode: display, macros: { ...macros }, strict: 'error' }); }
  catch (e: any) { errors++; console.log(`✗ ${where}: ${e.message}\n   ${tex}`); }
};
const inline = (text: string, where: string) => {
  const dollars = (text.match(/\$/g) || []).length;
  if (dollars % 2) { errors++; console.log(`✗ ${where}: unbalanced $ in: ${text}`); }
  for (const m of text.matchAll(/\$([^$]+)\$/g)) check(m[1], where);
};
const ids = new Set<string>();
for (const p of all) {
  if (ids.has(p.id)) { errors++; console.log('✗ duplicate id', p.id); }
  ids.add(p.id);
  inline(p.question, p.id + ' question');
  inline(p.answer, p.id + ' answer');
  p.options?.forEach((o: string, i: number) => inline(o, `${p.id} option ${i}`));
  if (p.options && (p.correct === undefined || p.correct >= p.options.length)) { errors++; console.log('✗ bad correct index', p.id); }
  p.steps.forEach((s: any, i: number) => {
    inline(s.text, `${p.id} step ${i + 1}`);
    if (s.rule) inline(s.rule, `${p.id} step ${i + 1} rule`);
    if (s.math) check(s.math, `${p.id} step ${i + 1} math`, true);
    for (const k of [...(s.fig?.highlight ?? []), ...Object.keys(s.fig?.reveal ?? {})]) {
      const verts = (p.figures ?? []).flatMap((f: any) => f.vertices);
      if (p.figures && !k.split('').every((c: string) => verts.includes(c))) { errors++; console.log(`✗ ${p.id} step ${i + 1}: side ${k} not in figure`); }
    }
  });
}
const groups: Record<string, number> = {};
for (const p of all) groups[p.group] = (groups[p.group] ?? 0) + 1;
console.log(`\nProblems: ${all.length}`, groups);
console.log(`Checked ${count} LaTeX fragments — ${errors} error(s).`);
process.exit(errors ? 1 : 0);
