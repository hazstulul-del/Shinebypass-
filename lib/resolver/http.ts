import { validateSafeUrl } from '../security/ssrf';
import type { RedirectTraceStep } from '../../types/bypass';

export interface HttpHopResult {
  finalUrl: string;
  statusCode: number;
  trace: RedirectTraceStep[];
  htmlSnippet?: string;
  redirectCount: number;
}

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 ShineBypass/1.0';

const MAX_REDIRECTS = 10;
const TIMEOUT_MS = 6500;
const MAX_HTML_BYTES = 150000;

export async function followHttpRedirects(startUrl: string): Promise<HttpHopResult> {
  let currentUrl = startUrl;
  const trace: RedirectTraceStep[] = [];
  let redirectCount = 0;
  let finalHtml = '';
  let finalStatus = 200;

  const visitedUrls = new Set<string>();

  while (redirectCount < MAX_REDIRECTS) {
    if (visitedUrls.has(currentUrl)) {
      throw new Error(`Terdeteksi perulangan redirect (infinite loop) pada ${currentUrl}`);
    }
    visitedUrls.add(currentUrl);

    const ssrfCheck = await validateSafeUrl(currentUrl);
    if (!ssrfCheck.safe) {
      throw new Error(`Pelanggaran Keamanan SSRF: ${ssrfCheck.error || 'Alamat tujuan dilarang'}`);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let res: Response;
    try {
      res = await fetch(currentUrl, {
        method: 'GET',
        redirect: 'manual',
        headers: {
          'User-Agent': USER_AGENT,
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,text/*;q=0.8,*/*;q=0.5',
          'Accept-Language': 'id,en-US;q=0.9,en;q=0.8',
          'Cache-Control': 'no-cache',
        },
        signal: controller.signal,
      });
    } catch (err: unknown) {
      const errorObj = err as { name?: string; message?: string };
      if (errorObj?.name === 'AbortError') {
        throw new Error('Koneksi waktu habis (timeout) saat mencoba mengakses server tujuan.');
      }
      throw new Error(
        `Kesalahan jaringan saat menghubungi tujuan: ${errorObj?.message || 'Host tidak dapat dijangkau'}`
      );
    } finally {
      clearTimeout(timeoutId);
    }

    finalStatus = res.status;

    if ([301, 302, 303, 307, 308].includes(res.status)) {
      const locationHeader = res.headers.get('location');
      if (!locationHeader) {
        trace.push({
          url: currentUrl,
          status: res.status,
          type: 'http',
          note: `HTTP ${res.status} tanpa header Location`,
        });
        break;
      }

      let nextUrl: string;
      try {
        nextUrl = new URL(locationHeader, currentUrl).toString();
      } catch {
        throw new Error(`Header redirect Location tidak valid: ${locationHeader}`);
      }

      trace.push({
        url: currentUrl,
        status: res.status,
        type: 'http',
        note: `HTTP ${res.status} mengalihkan ke ${nextUrl}`,
      });

      currentUrl = nextUrl;
      redirectCount++;
      continue;
    }

    trace.push({
      url: currentUrl,
      status: res.status,
      type: 'http',
      note: `Status akhir: HTTP ${res.status}`,
    });

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('text/html') || contentType.includes('application/xhtml+xml')) {
      try {
        const text = await res.text();
        finalHtml = text.slice(0, MAX_HTML_BYTES);
      } catch {
        finalHtml = '';
      }
    }

    break;
  }

  return {
    finalUrl: currentUrl,
    statusCode: finalStatus,
    trace,
    htmlSnippet: finalHtml,
    redirectCount,
  };
}
