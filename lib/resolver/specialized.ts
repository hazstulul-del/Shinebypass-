import { isValidHttpUrl } from './parser';

/**
 * Specialized decoders for popular Indonesian and global ad-link & shortener platforms:
 * - Safelinku, sfl.gl, tutwuri.id, safelinkku.com, clik.pw, duit.cc, wpsafelink
 * - Sub2unlock, sub4unlock (social unlockers)
 * - Adf.ly, Sh.st, Bc.vc, Droplink, Gplinks, Clicksfly, Exe.io
 * - Linkvertise & general ad wrappers
 */

export interface SpecializedBypassResult {
  matched: boolean;
  destinationUrl?: string;
  engineName?: string;
  note?: string;
}

// 1. Sub2Unlock & Sub4Unlock extractor (extracts hidden destination from HTML data attributes or JS vars)
export function bypassSub2Unlock(html: string): SpecializedBypassResult {
  // Common patterns in sub2unlock / sub4unlock pages
  const patterns = [
    /data-(?:url|destination|target|link)=["'](https?:\/\/[^"']+)["']/i,
    /destination(?:_url)?\s*=\s*["'](https?:\/\/[^"']+)["']/i,
    /target_url\s*=\s*["'](https?:\/\/[^"']+)["']/i,
    /var\s+targetUrl\s*=\s*["'](https?:\/\/[^"']+)["']/i,
    /redirect_to(?:ken)?\s*=\s*["'](https?:\/\/[^"']+)["']/i,
    /window\.open\(["'](https?:\/\/[^"']+)["']\)/i,
    /<a\s+[^>]*class=["'][^"']*(?:destination|target|unlock-btn|get-link)[^"']*["'][^>]*href=["'](https?:\/\/[^"']+)["']/i,
  ];

  for (const regex of patterns) {
    const match = html.match(regex);
    if (match && match[1] && isValidHttpUrl(match[1]) && !match[1].includes('sub2unlock') && !match[1].includes('sub4unlock')) {
      return {
        matched: true,
        destinationUrl: match[1],
        engineName: 'Mesin Sub2Unlock',
        note: `Mengekstrak target akhir dari skrip Sub2Unlock: ${match[1]}`,
      };
    }
  }

  return { matched: false };
}

// 2. Safelinku, sfl.gl, tutwuri.id, safelinkku, wpsafelink bypass
export function bypassSafelinkuHtml(html: string, currentUrl: string): SpecializedBypassResult {
  // A. Check for ready/go action form
  const readyGoMatch = html.match(/action=["'](https?:\/\/[^"']+\/(?:ready|go)[^"']*)["']/i);
  if (readyGoMatch && readyGoMatch[1]) {
    return {
      matched: true,
      destinationUrl: readyGoMatch[1],
      engineName: 'Mesin Fgsi (Safelinku)',
      note: `Mengikuti formulir verifikasi Safelinku ke ${readyGoMatch[1]}`,
    };
  }

  // B. Check for hidden base64 or URL query in scripts or form inputs
  const tokenInputs = [
    /<input\s+[^>]*name=["'](?:url|link|target|go|dest|r)["'][^>]*value=["']([^"']+)["']/i,
    /var\s+(?:safelink_url|dest_url|final_url|target_link)\s*=\s*["']([^"']+)["']/i,
    /(?:go|url|link|target|destination)=([a-zA-Z0-9%_-]+)/i,
  ];

  for (const reg of tokenInputs) {
    const m = html.match(reg);
    if (m && m[1]) {
      const val = m[1].trim();
      // Try raw URL
      if (isValidHttpUrl(val) && !val.includes('sfl.gl') && !val.includes('safelinku')) {
        return {
          matched: true,
          destinationUrl: val,
          engineName: 'Mesin Fgsi (Safelinku)',
          note: `Mendeteksi target asli dari parameter Safelinku`,
        };
      }

      // Try URI decode
      try {
        const decoded = decodeURIComponent(val);
        if (isValidHttpUrl(decoded) && !decoded.includes('sfl.gl') && !decoded.includes('safelinku')) {
          return {
            matched: true,
            destinationUrl: decoded,
            engineName: 'Mesin Fgsi (Safelinku)',
            note: `Mendekode URL target Safelinku`,
          };
        }
      } catch {
        // Ignore
      }

      // Try Base64 decode
      try {
        let b64 = val.replace(/-/g, '+').replace(/_/g, '/');
        while (b64.length % 4) b64 += '=';
        const b64Dec = Buffer.from(b64, 'base64').toString('utf8');
        if (isValidHttpUrl(b64Dec) && !b64Dec.includes('sfl.gl') && !b64Dec.includes('safelinku')) {
          return {
            matched: true,
            destinationUrl: b64Dec,
            engineName: 'Mesin Fgsi (Safelinku)',
            note: `Mendekode muatan Base64 Safelinku`,
          };
        }
      } catch {
        // Ignore
      }
    }
  }

  return { matched: false };
}

// 3. Adf.ly ysmm reverse decoder
export function decodeAdflyYsmm(ysmm: string): string | null {
  try {
    let left = '';
    let right = '';
    for (let i = 0; i < ysmm.length; i++) {
      if (i % 2 === 0) {
        left += ysmm.charAt(i);
      } else {
        right = ysmm.charAt(i) + right;
      }
    }
    const combined = left + right;
    const decoded = Buffer.from(combined, 'base64').toString('utf8');
    const target = decoded.slice(2);
    if (isValidHttpUrl(target)) {
      return target;
    }
  } catch {
    // Ignore
  }
  return null;
}

// 4. Universal Ad-Link HTML scanner
export function scanGenericAdWrapper(html: string): SpecializedBypassResult {
  // Check for ysmm in Adfly clones
  const ysmmMatch = html.match(/var\s+ysmm\s*=\s*['"]([a-zA-Z0-9+/=_-]+)['"]/i);
  if (ysmmMatch && ysmmMatch[1]) {
    const unmasked = decodeAdflyYsmm(ysmmMatch[1]);
    if (unmasked) {
      return {
        matched: true,
        destinationUrl: unmasked,
        engineName: 'Mesin Ad-Bypass (Adfly)',
        note: `Mendekode sandi ysmm ke URL asli: ${unmasked}`,
      };
    }
  }

  // Check for universal download / proceed button containing external target
  const downloadLinkMatch = html.match(
    /<a\s+[^>]*href=["'](https?:\/\/(?:www\.)?(?:mediafire|drive\.google|mega\.nz|zippyshare|sfile\.mobi|github|dropbox)[^"']+)["']/i
  );
  if (downloadLinkMatch && downloadLinkMatch[1]) {
    return {
      matched: true,
      destinationUrl: downloadLinkMatch[1],
      engineName: 'Mesin Deteksi Media/File',
      note: `Menemukan tautan file langsung di dalam halaman perantara`,
    };
  }

  return { matched: false };
}
