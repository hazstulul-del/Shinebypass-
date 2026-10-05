'use client';

import { useState, useEffect } from 'react';
import {
  Link2,
  Zap,
  Loader2,
  Check,
  Copy,
  ExternalLink,
  RotateCcw,
  AlertCircle,
  Clock,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { triggerHaptic, playSfx } from '../lib/haptics';
import type {
  BypassSuccessResponse,
  BypassErrorResponse,
  HistoryItem,
  DailyQuota,
} from '../types/bypass';

const SAMPLE_LINKS = [
  {
    label: 'sfl.gl / Safelinku',
    url: 'https://httpbin.org/redirect-to?url=https%3A%2F%2Fmediafire.com%2Ffile%2Fsample_file',
  },
  {
    label: 'Redirect HTTP 302',
    url: 'https://httpbin.org/status/302',
  },
  {
    label: 'Query Parameter Bypass',
    url: 'https://httpbin.org/redirect-to?url=https%3A%2F%2Fgithub.com',
  },
];

export function ShineBypassForm() {
  const [inputUrl, setInputUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [result, setResult] = useState<BypassSuccessResponse | null>(null);
  const [errorResult, setErrorResult] = useState<BypassErrorResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [showTrace, setShowTrace] = useState(false);

  // Daily quota (Limit 5x daily)
  const [quota, setQuota] = useState<DailyQuota>({
    limit: 5,
    remaining: 5,
    resetAt: Date.now() + 24 * 60 * 60 * 1000,
  });
  const [timeUntilReset, setTimeUntilReset] = useState<string>('');

  // Custom API key from settings
  const [customApiKey, setCustomApiKey] = useState('');

  const fetchQuota = async () => {
    try {
      const res = await fetch('/api/bypass', { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        if (data.limit) {
          setQuota({
            limit: data.limit,
            remaining: data.remaining,
            resetAt: data.resetAt,
          });
        }
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchQuota();
    try {
      const savedKey = localStorage.getItem('shinebypass-api-key') || '';
      setCustomApiKey(savedKey);
    } catch {
      // Ignore
    }

    const handleKeyChange = () => {
      const key = localStorage.getItem('shinebypass-api-key') || '';
      setCustomApiKey(key);
    };
    window.addEventListener('shinebypass-apikey-change', handleKeyChange);
    return () => window.removeEventListener('shinebypass-apikey-change', handleKeyChange);
  }, []);

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const diff = Math.max(0, quota.resetAt - now);
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeUntilReset(`${hours} jam ${minutes} menit`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [quota.resetAt]);

  const saveToHistory = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    try {
      if (typeof window === 'undefined') return;
      const historyStr = localStorage.getItem('shinebypass-history') || '[]';
      const history: HistoryItem[] = JSON.parse(historyStr);

      const newItem: HistoryItem = {
        id: Math.random().toString(36).substring(2, 9),
        ...item,
        timestamp: Date.now(),
      };

      const updated = [newItem, ...history.filter((h) => h.originalUrl !== item.originalUrl)].slice(
        0,
        50
      );
      localStorage.setItem('shinebypass-history', JSON.stringify(updated));
      window.dispatchEvent(new Event('shinebypass-history-change'));
    } catch {
      // Ignore
    }
  };

  const handleResolve = async (urlOverride?: string) => {
    const raw = (urlOverride ?? inputUrl).trim();
    setValidationError(null);
    setResult(null);
    setErrorResult(null);
    setCopied(false);

    if (!raw) {
      setValidationError('Silakan masukkan tautan yang ingin Anda bypass.');
      triggerHaptic(30, 'medium');
      playSfx('error');
      return;
    }

    setLoading(true);
    triggerHaptic(40, 'heavy');
    playSfx('sparkle');

    try {
      const res = await fetch('/api/bypass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: raw, apiKey: customApiKey }),
      });

      const data = await res.json();

      if (data.quota) {
        setQuota(data.quota);
      }

      if (res.ok && data.success) {
        setResult(data as BypassSuccessResponse);
        triggerHaptic(50, 'medium');
        playSfx('success');
        saveToHistory({
          originalUrl: data.originalUrl,
          destinationUrl: data.destinationUrl,
          method: data.method,
          status: 'success',
          durationText: data.durationText || '1,8 dtk',
          engine: data.engine || 'Mesin Universal Ad-Bypass',
        });
      } else {
        const err: BypassErrorResponse = {
          success: false,
          error: data.error || 'Gagal mem-bypass tautan ini.',
          originalUrl: raw,
          code: data.code,
          durationText: data.durationText,
          engine: data.engine,
          quota: data.quota,
        };
        setErrorResult(err);
        triggerHaptic(60, 'heavy');
        playSfx('error');
        saveToHistory({
          originalUrl: raw,
          destinationUrl: 'Tidak Terlacak',
          method: 'failed',
          status: 'failed',
          durationText: data.durationText || '1,5 dtk',
          engine: 'Mesin Ad-Bypass',
        });
      }
    } catch (err: unknown) {
      const errorMsg = (err as Error)?.message || 'Terjadi gangguan jaringan saat menghubungi server.';
      setErrorResult({
        success: false,
        error: errorMsg,
        originalUrl: raw,
      });
      triggerHaptic(60, 'heavy');
      playSfx('error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (url: string) => {
    triggerHaptic(25, 'light');
    playSfx('success');
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleOpenDestination = (targetUrl: string) => {
    triggerHaptic(15, 'light');
    playSfx('click');
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleReset = () => {
    triggerHaptic(15, 'light');
    playSfx('tap');
    setInputUrl('');
    setResult(null);
    setErrorResult(null);
    setValidationError(null);
  };

  const isOutOfQuota = quota.remaining <= 0;

  return (
    <div className="w-full max-w-xl mx-auto px-4">
      {/* Daily Quota 5 Card */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl text-xs">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg brand-bg-subtle brand-text-accent border brand-border-accent">
            <Zap className="h-3.5 w-3.5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2 font-medium text-white">
              <span>Kuota Harian:</span>
              <span
                className={`font-mono font-bold ${
                  quota.remaining > 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {quota.remaining} / {quota.limit} tersisa
              </span>
            </div>
            <p className="text-[11px] text-[#8B95A5]">
              Limit 5 kali sehari • Bebas iklan • Reset otomatis tiap hari
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-[#8B95A5] self-end sm:self-auto bg-black/30 px-2.5 py-1 rounded-lg border border-white/5">
          <Clock className="w-3 h-3 brand-text-accent" />
          <span>Reset dalam {timeUntilReset || 'beberapa jam'}</span>
        </div>
      </div>

      {/* Main Input Card */}
      <div className="rounded-3xl border border-white/10 bg-[#121626]/85 backdrop-blur-2xl p-6 sm:p-7 shadow-2xl shadow-black/60 relative">
        <div className="flex items-center justify-between mb-3">
          <label
            htmlFor="adlink-input"
            className="block text-xs font-semibold text-white/90"
          >
            Tempel Tautan Beriklan / URL Apapun
          </label>
          <span className="text-[10px] text-[#8B95A5] uppercase tracking-wider font-semibold">
            Bebas Iklan · Limit 5x/Hari
          </span>
        </div>

        <div className="space-y-3.5">
          <div className="relative flex items-center">
            <Link2 className="absolute left-4 w-4 h-4 text-[#8B95A5] pointer-events-none" />
            <input
              id="adlink-input"
              type="text"
              value={inputUrl}
              onChange={(e) => {
                setInputUrl(e.target.value);
                if (validationError) setValidationError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleResolve();
                }
              }}
              placeholder="https://... (tempel tautan beriklan atau shortener di sini)"
              disabled={loading || isOutOfQuota}
              className="w-full h-13 pl-11 pr-4 rounded-2xl bg-white/[0.04] border border-white/10 text-white placeholder-[#8B95A5]/60 text-sm brand-ring-accent transition-all disabled:opacity-50"
            />
          </div>

          <button
            type="button"
            onClick={() => handleResolve()}
            disabled={loading || !inputUrl.trim() || isOutOfQuota}
            className="w-full h-13 rounded-2xl brand-gradient brand-glow brand-gradient-hover text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses tautan...</span>
              </>
            ) : isOutOfQuota ? (
              <span>Kuota Harian Habis (Reset Besok)</span>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-white" />
                <span>Bypass Sekarang</span>
              </>
            )}
          </button>
        </div>

        {/* Validation error */}
        {validationError && (
          <div className="mt-3.5 flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3.5 py-2.5 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Out of quota notice */}
        {isOutOfQuota && (
          <div className="mt-3.5 flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3.5 py-2.5 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              Batas kuota harian Anda (5 kali/hari) telah tercapai. Kuota akan di-reset otomatis
              dalam {timeUntilReset}.
            </span>
          </div>
        )}

        {/* Footer text */}
        <p className="text-[11px] text-[#8B95A5] text-center mt-5 leading-relaxed">
          Dukung semua tautan: <strong className="text-white/90">sfl.gl</strong>, safelinku, tutwuri.id, safelinkku, linkvertise, sub2unlock, adf.ly, bit.ly & redirect lainnya.
        </p>

        {/* Quick sample chips */}
        <div className="mt-3 pt-3 border-t border-white/8 flex flex-wrap items-center justify-center gap-1.5 text-[11px]">
          <span className="text-[#8B95A5]/70 text-[10px]">Coba contoh:</span>
          {SAMPLE_LINKS.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setInputUrl(sample.url);
                handleResolve(sample.url);
              }}
              disabled={loading || isOutOfQuota}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/8 text-[#8B95A5] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clean Result Card */}
      {result && (
        <div className="mt-6 space-y-4 animate-fade-in">
          <div className="rounded-3xl border border-white/15 bg-[#121626]/95 backdrop-blur-2xl p-6 shadow-2xl brand-glow relative">
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-white/8">
              <div className="flex items-center gap-2 text-xs font-mono text-[#8B95A5] truncate">
                <Link2 className="w-3.5 h-3.5 shrink-0 text-white/40" />
                <span className="truncate">{result.originalUrl}</span>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-[#8B95A5] hover:text-white flex items-center gap-1 shrink-0 p-1 rounded-lg hover:bg-white/5 cursor-pointer"
                title="Bypass Tautan Lain"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            <div className="py-4">
              <p className="text-[11px] uppercase tracking-wider brand-text-accent font-bold mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tautan Tujuan Asli:</span>
              </p>
              <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 font-mono text-sm sm:text-base text-white break-all select-all leading-relaxed font-semibold">
                {result.destinationUrl}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-[#8B95A5] mb-5">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/8 text-[11px]">
                <Clock className="w-3 h-3 text-white/40" />
                <span>Baru saja</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/8 text-[11px]">
                <Zap className="w-3 h-3 brand-text-accent" />
                <span>{result.durationText || '1,8 dtk'}</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg brand-bg-subtle border brand-border-accent brand-text-accent text-[11px] font-semibold">
                <span>{result.engine || 'Mesin Universal Ad-Bypass'}</span>
              </span>

              {result.quota && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/8 text-[11px] text-[#8B95A5]">
                  <span>Sisa Kuota: {result.quota.remaining}/{result.quota.limit}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleCopy(result.destinationUrl)}
                className="flex-1 h-12 rounded-2xl brand-gradient brand-glow brand-gradient-hover text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Salin URL</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleOpenDestination(result.destinationUrl)}
                className="h-12 px-5 rounded-2xl border border-white/12 bg-white/5 hover:bg-white/10 text-white flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors shrink-0 cursor-pointer"
                title="Buka Tautan"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Buka Tautan</span>
              </button>
            </div>

            {result.trace && result.trace.length > 0 && (
              <div className="mt-4 pt-3 border-t border-white/8">
                <button
                  type="button"
                  onClick={() => setShowTrace(!showTrace)}
                  className="text-[11px] text-[#8B95A5] hover:text-white flex items-center justify-between w-full transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3 h-3" />
                    <span>Audit Jejak Pengalihan ({result.trace.length} tahap)</span>
                  </div>
                  {showTrace ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {showTrace && (
                  <div className="mt-2.5 space-y-1.5 text-[11px] font-mono">
                    {result.trace.map((step, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-black/40 border border-white/5 flex items-start gap-2"
                      >
                        <span className="shrink-0 px-1 rounded bg-white/10 text-white/70 text-[10px]">
                          #{idx + 1}
                        </span>
                        <div className="truncate flex-1">
                          <span className="text-white/80">{step.url}</span>
                          {step.note && <p className="brand-text-accent text-[10px] mt-0.5">{step.note}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {errorResult && (
        <div className="mt-6 rounded-3xl border border-red-500/30 bg-[#121626]/95 backdrop-blur-2xl p-6 shadow-2xl shadow-red-950/40 animate-fade-in">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-white">Tidak dapat mem-bypass tautan ini</h3>
              <p className="text-xs text-[#8B95A5] mt-1 leading-relaxed">
                {errorResult.error || 'Tautan ini mungkin memerlukan verifikasi CAPTCHA manusia atau sesi login.'}
              </p>

              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleResolve()}
                  className="px-4 py-2 rounded-xl brand-gradient text-white font-medium text-xs transition-colors cursor-pointer"
                >
                  Coba Lagi
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#8B95A5] hover:text-white font-medium text-xs transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
