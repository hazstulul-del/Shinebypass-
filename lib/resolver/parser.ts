const REDIRECT_QUERY_KEYS = [
  'url',
  'u',
  'target',
  'target_url',
  'dest',
  'destination',
  'redirect',
  'redirect_to',
  'redirect_url',
  'link',
  'r',
  'to',
  'goto',
  'next',
  'out',
  'forward',
  'q',
  'uri',
  'return_to',
  'callback_url',
];

export function isValidHttpUrl(str: string): boolean {
  if (!str) return false;
  try {
    const parsed = new URL(str);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function tryDecodeBase64Url(val: string): string | null {
  try {
    if (!/^[A-Za-z0-9+/=_-]+$/.test(val) || val.length < 8) {
      return null;
    }
    let base64 = val.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }

    const decoded = Buffer.from(base64, 'base64').toString('utf8');
    if (isValidHttpUrl(decoded)) {
      return decoded;
    }
  } catch {
    // Ignore error
  }
  return null;
}

export function extractQueryRedirect(rawUrl: string): string | null {
  try {
    const parsed = new URL(rawUrl);

    for (const key of REDIRECT_QUERY_KEYS) {
      const val = parsed.searchParams.get(key);
      if (!val) continue;

      const trimmed = val.trim();

      if (isValidHttpUrl(trimmed)) {
        return trimmed;
      }

      try {
        const decoded = decodeURIComponent(trimmed);
        if (isValidHttpUrl(decoded)) {
          return decoded;
        }
      } catch {
        // Ignore
      }

      const base64Decoded = tryDecodeBase64Url(trimmed);
      if (base64Decoded) {
        return base64Decoded;
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function extractUrlFromText(text: string): string {
  if (!text) return '';
  const trimmed = text.trim();
  const match = trimmed.match(/https?:\/\/[^\s<>"'{}|\\^`[\]]+/i);
  if (match) {
    return match[0];
  }
  return trimmed;
}
