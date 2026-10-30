/**
 * Icons live as SVG files in src/assets/icons/ and are inlined (not <img>),
 * so `stroke="currentColor"` picks up the surrounding text colour.
 */
const files = import.meta.glob<string>('../assets/icons/*.svg', { query: '?raw', import: 'default', eager: true });
const ICONS: Record<string, string> = Object.fromEntries(Object.entries(files).map(([path, svg]) => [path.slice(path.lastIndexOf('/') + 1, -'.svg'.length), svg]));

/** One name per file in src/assets/icons/. */
export type IconName =
  | 'arrow-left'
  | 'arrow-right'
  | 'arrow-up'
  | 'chart'
  | 'check'
  | 'chevron-left'
  | 'chevron-right'
  | 'close'
  | 'dot'
  | 'flag'
  | 'fullscreen'
  | 'home'
  | 'lightbulb'
  | 'menu'
  | 'pause'
  | 'pencil'
  | 'pin'
  | 'play'
  | 'replay'
  | 'sidebar-close'
  | 'trophy';

/** Sized in `em` by default, so an icon matches the text it sits next to. */
export function Icon({ name, className = 'size-[1.1em]' }: { name: IconName; className?: string }) {
  if (import.meta.env.DEV && !ICONS[name]) console.warn(`Icon "${name}" has no file in src/assets/icons/`);
  return <span aria-hidden="true" className={`inline-block shrink-0 align-[-0.15em] [&>svg]:block [&>svg]:size-full ${className}`} dangerouslySetInnerHTML={{ __html: ICONS[name] ?? '' }} />;
}
