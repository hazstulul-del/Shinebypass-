'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, Loader2, Sparkles, AlertCircle, Clock, Zap } from 'lucide-react';
import { ResultCard, ErrorCard } from './result-card';
import type {
  BypassSuccessResponse,
  BypassErrorResponse,
  HistoryItem,
  DailyQuota,
} from '../types/bypass';

const SAMPLE_LINKS = [
  {
    label: 'Pengalihan Query URL',
    url: 'https://httpbin.org/redirect-to?url=https%3A%2F%2Fgithub.com',
  },
  {
    label: 'Kanonikal Wikipedia 301',
    url: 'http://en.wikipedia.org/wiki/URL_redirection',
  },
  {
    label: 'Pengalihan Status 302',
    url: 'https://httpbin.org/status/302',
  },
];

export function UrlForm() {
  const [inputUrl, setInputUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [result, setResult] = useState<BypassSuccessResponse | null>(null);
  const [errorResult, setErrorResult] = useState<BypassErrorResponse | null>(null);

  // Daily quota state (minimum 5 resets every day)
  const [quota, setQuota] = useState<DailyQuota>({
    limit: 5,
    remaining: 5,
    resetAt: Date.now() + 24 * 60 * 60 * 1000,
  });
  const [timeUntilReset, setTimeUntilReset] = useState<string>('');

  // Fetch initial daily quota from server
  useEffect(() => {
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

    fetchQuota();
  }, []);

  // Update live countdown to daily reset
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

  const validateClientUrl = (raw: string): string | null => {
    const trimmed = raw.trim();
    if (!trimmed) {
      return 'Silakan masukkan tautan URL yang ingin Anda lacak.';
    }

    const lower = trimmed.toLowerCase();
    if (
      lower.startsWith('javascript:') ||
      lower.startsWith('data:') ||
      lower.startsWith('file:') ||
      lower.startsWith('ftp:')
    ) {
      return 'Protokol tidak diizinkan. Hanya URL standar HTTP dan HTTPS yang didukung.';
    }

    if (!lower.startsWith('http://') && !lower.startsWith('https://')) {
      return 'Tautan harus diawali dengan http:// atau https://';
    }

    try {
      const parsed = new URL(trimmed);
      const host = parsed.hostname.toLowerCase();
      if (
        host === 'localhost' ||
        host === '127.0.0.1' ||
        host === '0.0.0.0' ||
        host.endsWith('.local') ||
        host.endsWith('.internal')
      ) {
        return 'Alamat localhost dan jaringan privat dilarang demi alasan keamanan.';
      }
    } catch {
      return 'Format tautan tidak valid. Pastikan penulisan URL sudah benar.';
    }

    return null;
  };

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
    } catch {
      // LocalStorage access failure fallback
    }
  };

  const handleResolve = async (urlToResolve?: string) => {
    const targetUrl = (urlToResolve ?? inputUrl).trim();
    setValidationError(null);
    setResult(null);
    setErrorResult(null);

    const clientCheck = validateClientUrl(targetUrl);
    if (clientCheck) {
      setValidationError(clientCheck);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/bypass', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: targetUrl }),
      });

      const data = await res.json();

      if (data.quota) {
        setQuota(data.quota);
      }

      if (res.ok && data.success) {
        setResult(data as BypassSuccessResponse);
        saveToHistory({
          originalUrl: data.originalUrl,
          destinationUrl: data.destinationUrl,
          method: data.method,
          status: 'success',
        });
      } else {
        const errorData: BypassErrorResponse = {
          success: false,
          error: data.error || 'Gagal menemukan alamat tujuan asli.',
          originalUrl: targetUrl,
          code: data.code,
          quota: data.quota,
        };
        setErrorResult(errorData);
        saveToHistory({
          originalUrl: targetUrl,
          destinationUrl: 'Tidak Terlacak',
          method: 'failed',
          status: 'failed',
        });
      }
    } catch (err: unknown) {
      const errorMsg =
        (err as Error)?.message || 'Terjadi kesalahan jaringan saat menghubungi server.';
      const fallbackError: BypassErrorResponse = {
        success: false,
        error: errorMsg,
        originalUrl: targetUrl,
      };
      setErrorResult(fallbackError);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleResolve();
  };

  const handleClear = () => {
    setInputUrl('');
    setResult(null);
    setErrorResult(null);
    setValidationError(null);
  };

  const isOutOfQuota = quota.remaining <= 0;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6">
      {/* Daily Quota Card */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/8 backdrop-blur-xl text-xs">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Zap className="h-3.5 w-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2 font-medium text-[#F5F7FA]">
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
              Minimal 5 kali sehari • Direset otomatis setiap hari
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-[#8B95A5] self-end sm:self-auto bg-black/30 px-2.5 py-1 rounded-lg border border-white/5">
          <Clock className="w-3 h-3 text-blue-400" />
          <span>Reset dalam {timeUntilReset || 'beberapa jam'}</span>
        </div>
      </div>

      <div className="relative rounded-3xl border border-white/10 bg-[#0D1117]/80 backdrop-blur-2xl p-5 sm:p-8 shadow-2xl shadow-black/50">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <label
              htmlFor="url-input"
              className="text-xs font-semibold text-[#8B95A5] uppercase tracking-wider flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Masukkan Tautan</span>
            </label>
            <span className="text-xs text-[#8B95A5]">Hanya HTTP / HTTPS</span>
          </div>

          <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <input
              id="url-input"
              type="text"
              value={inputUrl}
              onChange={(e) => {
                setInputUrl(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder="https://contoh.com/redirect?url=..."
              disabled={loading || isOutOfQuota}
              className="w-full h-13 px-4 rounded-2xl bg-white/[0.04] border border-white/10 text-[#F5F7FA] placeholder-[#8B95A5]/60 text-sm sm:text-base focus:outline-none focus:border-blue-500/50 focus:ring-3 focus:ring-blue-500/15 transition-all disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={loading || !inputUrl.trim() || isOutOfQuota}
              className="h-13 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Melacak...</span>
                </>
              ) : isOutOfQuota ? (
                <span>Kuota Habis (Reset Besok)</span>
              ) : (
                <>
                  <span>Lacak Tautan</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {validationError && (
            <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3.5 py-2.5 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {isOutOfQuota && (
            <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3.5 py-2.5 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                Batas kuota harian Anda (5 kali/hari) telah tercapai. Kuota akan di-reset otomatis
                dalam {timeUntilReset}.
              </span>
            </div>
          )}

          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-[#8B95A5]">
            <span className="text-[#8B95A5]/70">Coba contoh tautan:</span>
            {SAMPLE_LINKS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputUrl(sample.url);
                  handleResolve(sample.url);
                }}
                disabled={loading || isOutOfQuota}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/8 text-[#8B95A5] hover:text-[#F5F7FA] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </form>
      </div>

      {loading && (
        <div className="mt-8 text-center animate-fade-in">
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#0D1117]/90 border border-blue-500/30 text-blue-400 text-sm font-medium shadow-xl">
            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            <span>Melacak tujuan... Mengikuti jalur pengalihan yang aman</span>
          </div>
        </div>
      )}

      {result && !loading && (
        <div className="mt-8 animate-fade-in">
          <ResultCard result={result} onReset={handleClear} />
        </div>
      )}

      {errorResult && !loading && (
        <div className="mt-8 animate-fade-in">
          <ErrorCard error={errorResult} onRetry={() => handleResolve()} onClear={handleClear} />
        </div>
      )}
    </div>
  );
}
