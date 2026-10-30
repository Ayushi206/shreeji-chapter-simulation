import katex from 'katex';
import { useMemo } from 'react';

const MACROS = {
  '\\cosec': '\\operatorname{cosec}',
};

export function renderTex(tex: string, display = false): string {
  return katex.renderToString(tex, {
    displayMode: display,
    throwOnError: false,
    strict: false,
    macros: { ...MACROS },
  });
}

export function Tex({ tex, block = false, wrap = false, className = '' }: { tex: string; block?: boolean; wrap?: boolean; className?: string }) {
  // `wrap`: display-style maths that may line-break after "=" (KaTeX only breaks in inline mode).
  const html = useMemo(() => (wrap ? renderTex(`\\displaystyle ${tex}`, false) : renderTex(tex, block)), [tex, block, wrap]);
  if (wrap) {
    return <div className={`py-1.5 text-center leading-[2.6] ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
  }
  if (block) {
    return <div className={`overflow-x-auto overflow-y-hidden py-1 ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
  }
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Bigger fractions for answer options: \frac → \dfrac. */
export const displayFractions = (text: string) => text.replaceAll(String.raw`\frac`, String.raw`\dfrac`);

type Segment ={ kind: 'text' | 'tex' | 'bold'; value: string };

function parseRich(text: string): Segment[] {
  const out: Segment[] = [];
  const re = /(\$[^$]+\$|\*\*[^*]+\*\*)/g;
  let last = 0;
  for (const m of text.matchAll(re)) {
    const i = m.index ?? 0;
    if (i > last) out.push({ kind: 'text', value: text.slice(last, i) });
    const tok = m[0];
    if (tok.startsWith('$')) out.push({ kind: 'tex', value: tok.slice(1, -1) });
    else out.push({ kind: 'bold', value: tok.slice(2, -2) });
    last = i + tok.length;
  }
  if (last < text.length) out.push({ kind: 'text', value: text.slice(last) });
  return out;
}

/** Plain text with inline `$LaTeX$` and `**bold**`. */
export function Rich({ text, className = '' }: { text: string; className?: string }) {
  const parts = useMemo(() => parseRich(text), [text]);
  return (
    <span className={className}>
      {parts.map((p, i) =>
        p.kind === 'tex' ? (
          <Tex key={i} tex={p.value} />
        ) : p.kind === 'bold' ? (
          <strong key={i} className="font-semibold text-slate-900">
            {p.value}
          </strong>
        ) : (
          <span key={i}>{p.value}</span>
        ),
      )}
    </span>
  );
}
