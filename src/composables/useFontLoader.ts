// Автопоиск всех файлов шрифтов и генерация @font-face на лету.
// Работает в Vite (Vue 3) через import.meta.glob.

type FontStyle = 'normal' | 'italic';

interface FaceDesc {
  url: string;
  format: 'woff2' | 'woff' | 'ttf' | 'otf';
  weight: number;
  style: FontStyle;
  family: string;
}

const FONT_GLOB = import.meta.glob(
  '/src/assets/fonts/**/*.{woff2,woff,ttf,otf}',
  //'/src/assets/fonts/**/*.ttf',
  { eager: true, as: 'url' }
) as Record<string, string>;

// Inter-Regular.woff2 / Inter-BoldItalic.ttf / Roboto-Light-Italic.woff
function parseFileName(filePath: string): Omit<FaceDesc, 'url'|'format'> & { rawName: string } {
  const file = filePath.split('/').pop()!.replace(/\.(woff2|woff|ttf|otf)$/i, '');
  // family = всё до первого дефиса, остальное — модификаторы
  const [familyRaw, ...mods] = file.split('-');
  const family = familyRaw.replace(/_/g, ' ');
  const modsStr = mods.join('-').toLowerCase();

  let weight = 400;
  let style: FontStyle = 'normal';

  // Вес
  if (/thin/.test(modsStr)) weight = 100;
  else if (/extralight|ultralight/.test(modsStr)) weight = 200;
  else if (/light/.test(modsStr)) weight = 300;
  else if (/regular|book|normal/.test(modsStr) || modsStr === '') weight = 400;
  else if (/medium/.test(modsStr)) weight = 500;
  else if (/semibold|demibold/.test(modsStr)) weight = 600;
  else if (/bold/.test(modsStr)) weight = 700;
  else if (/extrabold|ultrabold|heavy/.test(modsStr)) weight = 800;
  else if (/black|heavy/.test(modsStr)) weight = 900;

  // Курсив
  if (/italic|oblique/.test(modsStr)) style = 'italic';

  return { family, weight, style, rawName: file };
}

function extToFormat(ext: string): FaceDesc['format'] {
  const e = ext.toLowerCase();
  if (e.endsWith('woff2')) return 'woff2';
  if (e.endsWith('woff')) return 'woff';
  if (e.endsWith('ttf')) return 'ttf';
  return 'otf';
}
/*
function buildCss(faces: FaceDesc[]): string {
  // Группируем по (family, weight, style) и формируем src с fallback форматов
  const byKey = new Map<string, FaceDesc[]>();
  for (const f of faces) {
    const key = `${f.family}__${f.weight}__${f.style}`;
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key)!.push(f);
  }

  let css = '';
  for (const [, arr] of byKey) {
    // Сортируем, чтобы woff2 был первым
    arr.sort((a, b) => {
      const order = { woff2: 0, woff: 1, ttf: 2, otf: 3 } as any;
      return order[a.format] - order[b.format];
    });
    const { family, weight, style } = arr[0];
    const srcParts = arr.map(a => `url("${a.url}") format("${a.format}")`);
    css += `
@font-face{
  font-family:"${family}";
  font-style:${style};
  font-weight:${weight};
  font-display:swap;
  src:${srcParts.join(', ')};
}
`;
  }
  return css;
}

function injectCssOnce(id: string, css: string) {
  let tag = document.getElementById(id) as HTMLStyleElement | null;
  if (!tag) {
    tag = document.createElement('style');
    tag.id = id;
    tag.type = 'text/css';
    document.head.appendChild(tag);
  }
  tag.textContent = css;
}

export function useFontLoader() {
  const faces: FaceDesc[] = [];

  for (const [path, url] of Object.entries(FONT_GLOB)) {
    const meta = parseFileName(path);
    const format = extToFormat(path);
    faces.push({
      url,
      format,
      family: meta.family,
      weight: meta.weight,
      style: meta.style,
    });
  }

  if (faces.length) {
    const css = buildCss(faces);
    injectCssOnce('dynamic-fonts-from-assets', css);
  }

  // Уникальные семейства для выпадающего списка
  const families = Array.from(new Set(faces.map(f => f.family))).sort();

  // Гарантированная подгрузка конкретного начертания
  async function ensureLoaded(family: string, weight = 400, style: FontStyle = 'normal') {
    try {
      // 16px достаточно для загрузки face
      await (document as any).fonts.load(`${style} ${weight} 16px "${family}"`);
    } catch {
      // ignore
    }
  }

  return { families, ensureLoaded };
}
*/
export const families: string[] = []

export async function loadFonts(): Promise<void> {
  const faces: FaceDesc[] = [];

  for (const [path, url] of Object.entries(FONT_GLOB)) {
    const meta = parseFileName(path);
    const format = extToFormat(path);
    faces.push({
      url,
      format,
      family: meta.family,
      weight: meta.weight,
      style: meta.style,
    });
  }

  if (faces.length) {
    const fontFaces = faces.map(f => (new FontFace(f.family, `url(${f.url})`, { style: f.style, weight: '' + f.weight })))
    await Promise.all(fontFaces.map(ff => (ff.load())))
    fontFaces.forEach(ff => { document.fonts.add(ff) })
    if (families.length) families.length = 0
    families.push(...Array.from(new Set(faces.map(f => f.family))).sort())
  }
}
