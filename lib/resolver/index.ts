import { validateSafeUrl } from '../security/ssrf';
import { extractQueryRedirect, extractUrlFromText } from './parser';
import { extractMetaRefresh, extractJavascriptRedirect } from './html';
import { followHttpRedirects } from './http';
import {
  bypassSub2Unlock,
  bypassSafelinkuHtml,
  scanGenericAdWrapper,
} from './specialized';
import type { BypassSuccessResponse, RedirectMethod, RedirectTraceStep } from '../../types/bypass';

export async function resolveDestinationUrl(
  inputUrl: string,
  apiKey?: string
): Promise<BypassSuccessResponse> {
  const startTime = Date.now();
  const rawClean = extractUrlFromText(inputUrl);

  const validation = await validateSafeUrl(rawClean);
  if (!validation.safe) {
    throw new Error(validation.error || 'URL tidak valid atau berbahaya.');
  }

  const initialUrl = validation.urlObj!.toString();
  const trace: RedirectTraceStep[] = [];
  let currentTarget = initialUrl;
  let detectedMethod: RedirectMethod = 'direct';
  let totalHops = 0;
  let engineUsed = 'Mesin Universal Ad-Bypass';

  // Identify service category
  const lowerUrl = initialUrl.toLowerCase();
  const isSfl = /sfl\.gl|safelinku|tutwuri\.id|safelinkku|wpsafelink|cararegistrasi|clik\.pw|duit\.cc/i.test(lowerUrl);
  const isSub2Unlock = /sub2unlock|sub4unlock/i.test(lowerUrl);
  const isLinkvertise = /linkvertise|link-to\.net|direct-link\.net/i.test(lowerUrl);
  const isAdfly = /adf\.ly|ay\.gy|j\.gs|q\.gs/i.test(lowerUrl);

  if (isSfl) engineUsed = 'Mesin Fgsi (Safelinku)';
  else if (isSub2Unlock) engineUsed = 'Mesin Sub2Unlock';
  else if (isLinkvertise) engineUsed = 'Mesin Linkvertise';
  else if (isAdfly) engineUsed = 'Mesin Ad-Bypass';

  // 1. Check if external FGSI / Safelinku bypass API is available or if key provided
  const activeKey = apiKey?.trim() || process.env.FGSI_API_KEY || 'fgsiapi-default';

  if (isSfl && activeKey && activeKey !== 'fgsiapi-default') {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3800);
      const apiEndpoint = `https://api.fgsi.my.id/bypass?url=${encodeURIComponent(
        initialUrl
      )}&apikey=${encodeURIComponent(activeKey)}`;

      const apiRes = await fetch(apiEndpoint, {
        headers: {
          'User-Agent': 'ShineBypass/1.2 (Liquid Glass)',
          Accept: 'application/json',
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (apiRes.ok) {
        const apiData = await apiRes.json();
        const resolved = apiData?.url || apiData?.destination || apiData?.result;
        if (resolved && typeof resolved === 'string' && /^https?:\/\//i.test(resolved)) {
          const durationMs = Date.now() - startTime;
          const durationSec = (Math.max(800, durationMs) / 1000).toFixed(1).replace('.', ',');

          trace.push({
            url: initialUrl,
            status: 200,
            type: 'http',
            note: 'Berhasil diproses melalui API Mesin Fgsi resmi',
          });

          return {
            success: true,
            originalUrl: initialUrl,
            destinationUrl: resolved.trim(),
            method: 'direct',
            redirectCount: 1,
            trace,
            durationMs,
            durationText: `${durationSec} dtk`,
            engine: 'Mesin Fgsi (API)',
          };
        }
      }
    } catch {
      // Fallback to internal multi-stage engine
    }
  }

  // 2. Follow HTTP redirects (handles 301, 302, 303, 307, 308)
  const initialQueryParam = extractQueryRedirect(initialUrl);

  const httpResult = await followHttpRedirects(currentTarget);
  trace.push(...httpResult.trace);
  totalHops += httpResult.redirectCount;
  currentTarget = httpResult.finalUrl;

  if (httpResult.redirectCount > 0) {
    detectedMethod = 'http-redirect';
    if (engineUsed === 'Mesin Universal Ad-Bypass') {
      engineUsed = 'Mesin Shortener Multi-Hop';
    }
  }

  // 3. Scan HTML for specialized ad-link patterns (Safelinku, Sub2unlock, Adfly, Meta, JS)
  if (httpResult.htmlSnippet) {
    const html = httpResult.htmlSnippet;

    // Check Sub2Unlock
    const subCheck = bypassSub2Unlock(html);
    if (subCheck.matched && subCheck.destinationUrl && subCheck.destinationUrl !== currentTarget) {
      trace.push({
        url: currentTarget,
        type: 'js',
        note: subCheck.note || 'Mengekstrak target dari Sub2Unlock',
      });
      const subHttp = await followHttpRedirects(subCheck.destinationUrl);
      trace.push(...subHttp.trace);
      totalHops += 1 + subHttp.redirectCount;
      currentTarget = subHttp.finalUrl;
      detectedMethod = 'javascript-redirect';
      engineUsed = 'Mesin Sub2Unlock';
    }

    // Check Safelinku
    const sflCheck = bypassSafelinkuHtml(html, currentTarget);
    if (sflCheck.matched && sflCheck.destinationUrl && sflCheck.destinationUrl !== currentTarget) {
      trace.push({
        url: currentTarget,
        type: 'param',
        note: sflCheck.note || 'Mengekstrak tujuan dari Safelinku',
      });
      const sflHttp = await followHttpRedirects(sflCheck.destinationUrl);
      trace.push(...sflHttp.trace);
      totalHops += 1 + sflHttp.redirectCount;
      currentTarget = sflHttp.finalUrl;
      detectedMethod = 'query-parameter';
      engineUsed = 'Mesin Fgsi (Safelinku)';
    }

    // Check Generic Ad Wrapper (ysmm or direct file host links)
    const adCheck = scanGenericAdWrapper(html);
    if (adCheck.matched && adCheck.destinationUrl && adCheck.destinationUrl !== currentTarget) {
      trace.push({
        url: currentTarget,
        type: 'js',
        note: adCheck.note || 'Menemukan tautan tujuan dari pembungkus iklan',
      });
      const adHttp = await followHttpRedirects(adCheck.destinationUrl);
      trace.push(...adHttp.trace);
      totalHops += 1 + adHttp.redirectCount;
      currentTarget = adHttp.finalUrl;
      detectedMethod = 'javascript-redirect';
      engineUsed = adCheck.engineName || 'Mesin Ad-Bypass';
    }

    // Check Meta Refresh
    const metaTarget = extractMetaRefresh(html, currentTarget);
    if (metaTarget && metaTarget !== currentTarget) {
      trace.push({
        url: currentTarget,
        type: 'meta',
        note: `<meta http-equiv="refresh"> mengalihkan ke ${metaTarget}`,
      });

      const metaHttpResult = await followHttpRedirects(metaTarget);
      trace.push(...metaHttpResult.trace);
      totalHops += 1 + metaHttpResult.redirectCount;
      currentTarget = metaHttpResult.finalUrl;
      detectedMethod = 'meta-refresh';
    } else {
      // Check JS Redirect
      const jsTarget = extractJavascriptRedirect(html, currentTarget);
      if (jsTarget && jsTarget !== currentTarget) {
        trace.push({
          url: currentTarget,
          type: 'js',
          note: `Pengalihan JavaScript mendeteksi target ke ${jsTarget}`,
        });

        const jsHttpResult = await followHttpRedirects(jsTarget);
        trace.push(...jsHttpResult.trace);
        totalHops += 1 + jsHttpResult.redirectCount;
        currentTarget = jsHttpResult.finalUrl;
        detectedMethod = 'javascript-redirect';
      }
    }
  }

  // 4. Query param decode fallback
  if (currentTarget === initialUrl && initialQueryParam) {
    const queryValidation = await validateSafeUrl(initialQueryParam);
    if (queryValidation.safe) {
      trace.push({
        url: initialUrl,
        type: 'param',
        note: `Mengekstrak parameter redirect mengarah ke ${initialQueryParam}`,
      });

      const paramResult = await followHttpRedirects(initialQueryParam);
      trace.push(...paramResult.trace);
      totalHops += 1 + paramResult.redirectCount;
      currentTarget = paramResult.finalUrl;
      detectedMethod = 'query-parameter';
    }
  }

  if (currentTarget !== initialUrl && detectedMethod === 'direct') {
    detectedMethod = 'http-redirect';
  }

  const durationMs = Date.now() - startTime;
  const durationSec = (Math.max(600, durationMs) / 1000).toFixed(1).replace('.', ',');

  return {
    success: true,
    originalUrl: initialUrl,
    destinationUrl: currentTarget,
    method: detectedMethod,
    redirectCount: totalHops,
    trace,
    durationMs,
    durationText: `${durationSec} dtk`,
    engine: engineUsed,
  };
}
