import { isValidHttpUrl } from './parser';

function resolveUrl(target: string, baseUrl: string): string | null {
  if (!target) return null;
  const cleanTarget = target.trim().replace(/^['"]|['"]$/g, '');

  if (isValidHttpUrl(cleanTarget)) {
    return cleanTarget;
  }

  try {
    const resolved = new URL(cleanTarget, baseUrl);
    if (resolved.protocol === 'http:' || resolved.protocol === 'https:') {
      return resolved.toString();
    }
  } catch {
    return null;
  }

  return null;
}

export function extractMetaRefresh(html: string, baseUrl: string): string | null {
  if (!html || typeof html !== 'string') return null;

  const metaRegex = /<meta\s+[^>]*http-equiv=["']?refresh["']?[^>]*content=["']?([^"'>]+)["']?[^>]*>/i;
  let match = metaRegex.exec(html);

  if (!match) {
    const invertedRegex = /<meta\s+[^>]*content=["']?([^"'>]+)["']?[^>]*http-equiv=["']?refresh["']?[^>]*>/i;
    match = invertedRegex.exec(html);
  }

  if (match && match[1]) {
    const content = match[1];
    const urlSubMatch = content.match(/url\s*=\s*([^;]+)/i);
    if (urlSubMatch && urlSubMatch[1]) {
      const rawTarget = urlSubMatch[1].trim();
      return resolveUrl(rawTarget, baseUrl);
    }
  }

  return null;
}

export function extractJavascriptRedirect(html: string, baseUrl: string): string | null {
  if (!html || typeof html !== 'string') return null;

  const snippet = html.length > 100000 ? html.slice(0, 100000) : html;

  const patterns = [
    /(?:window\.)?location(?:\.href)?\s*=\s*['"]([^'"]+)['"]/i,
    /(?:window\.)?location\.(?:replace|assign)\(\s*['"]([^'"]+)['"]\s*\)/i,
    /document\.location(?:\.href)?\s*=\s*['"]([^'"]+)['"]/i,
    /document\.location\.(?:replace|assign)\(\s*['"]([^'"]+)['"]\s*\)/i,
    /top\.location(?:\.href)?\s*=\s*['"]([^'"]+)['"]/i,
    /self\.location(?:\.href)?\s*=\s*['"]([^'"]+)['"]/i,
  ];

  for (const regex of patterns) {
    const match = regex.exec(snippet);
    if (match && match[1]) {
      const rawTarget = match[1].trim();
      if (
        rawTarget.startsWith('#') ||
        rawTarget.startsWith('javascript:') ||
        rawTarget === 'about:blank' ||
        rawTarget.length < 2
      ) {
        continue;
      }

      const resolved = resolveUrl(rawTarget, baseUrl);
      if (resolved && resolved !== baseUrl) {
        return resolved;
      }
    }
  }

  return null;
}
