'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  RotateCcw,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Link2,
  ArrowRight,
} from 'lucide-react';
import type { BypassSuccessResponse, BypassErrorResponse } from '../types/bypass';

interface ResultCardProps {
  result: BypassSuccessResponse;
  onReset: () => void;
}

interface ErrorCardProps {
  error: BypassErrorResponse;
  onRetry: () => void;
  onClear: () => void;
}

export function ResultCard({ result, onReset }: ResultCardProps) {
  const [copied, setCopied] = useState(false);
  const [showTrace, setShowTrace] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.destinationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = result.destinationUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'http-redirect':
        return 'Pengalihan HTTP 3xx Diikuti';
      case 'meta-refresh':
        return 'Meta Refresh HTML Terdeteksi';
      case 'javascript-redirect':
        return 'Pengalihan Skrip JavaScript';
      case 'query-parameter':
        return 'Parameter Query URL Diekstrak';
      default:
        return 'Tautan Langsung Terverifikasi';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto rounded-3xl border border-emerald-500/20 bg-[#0D1117]/90 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/20 transition-all duration-300">
      <div className="flex items-start justify-between gap-4 border-b border-white/8 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#F5F7FA]">Tujuan Asli Ditemukan</h2>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-[#8B95A5]">
              <span className="font-medium text-emerald-400">{getMethodBadge(result.method)}</span>
              <span>·</span>
              <span>{result.redirectCount} lompatan</span>
              {result.quota && (
                <>
                  <span>·</span>
                  <span className="text-blue-400 font-medium">
                    Sisa Kuota: {result.quota.remaining}/{result.quota.limit}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="text-xs text-[#8B95A5] hover:text-white transition-colors flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-white/10 hover:bg-white/5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Lacak Lagi</span>
        </button>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#8B95A5] uppercase tracking-wider mb-1.5">
            URL Asal
          </label>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/8 text-sm text-[#8B95A5] font-mono break-all">
            <Link2 className="h-4 w-4 shrink-0 text-white/40" />
            <span className="line-clamp-1">{result.originalUrl}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1.5">
            URL Tujuan Asli
          </label>
          <div className="relative group p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-[#F5F7FA] font-mono text-sm sm:text-base break-all leading-relaxed">
            <span className="select-all">{result.destinationUrl}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleCopy}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-medium text-sm transition-all duration-200 shadow-md cursor-pointer ${
            copied
              ? 'bg-emerald-600 text-white'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white'
          }`}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              <span>Tersalin!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>Salin URL</span>
            </>
          )}
        </button>

        <a
          href={result.destinationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-[#F5F7FA] font-medium text-sm transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          <span>Buka Tautan</span>
        </a>
      </div>

      {result.trace && result.trace.length > 0 && (
        <div className="mt-6 pt-5 border-t border-white/8">
          <button
            type="button"
            onClick={() => setShowTrace(!showTrace)}
            className="w-full flex items-center justify-between text-xs text-[#8B95A5] hover:text-white transition-colors cursor-pointer"
          >
            <span>Jejak Riwayat Pengalihan ({result.trace.length} tahapan)</span>
            {showTrace ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showTrace && (
            <div className="mt-3 space-y-2 text-xs font-mono">
              {result.trace.map((step, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex items-start gap-2.5"
                >
                  <span className="shrink-0 px-1.5 py-0.5 rounded bg-white/10 text-white/80 font-bold text-[10px]">
                    #{idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#8B95A5] truncate">{step.url}</p>
                    {step.note && (
                      <p className="text-emerald-400/90 text-[11px] mt-0.5 flex items-center gap-1">
                        <ArrowRight className="w-3 h-3 inline shrink-0" />
                        <span>{step.note}</span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ErrorCard({ error, onRetry, onClear }: ErrorCardProps) {
  return (
    <div className="w-full max-w-2xl mx-auto rounded-3xl border border-red-500/20 bg-[#0D1117]/90 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl shadow-red-950/20">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 border border-red-500/30">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-[#F5F7FA]">Tidak dapat melacak tautan ini</h2>
          <p className="mt-2 text-sm text-[#8B95A5] leading-relaxed">
            {error.error ||
              'Tautan ini mungkin memerlukan verifikasi CAPTCHA, autentikasi login, sesi aktif, atau mekanisme yang tidak didukung.'}
          </p>

          {error.originalUrl && (
            <div className="mt-3 p-3 rounded-xl bg-white/[0.03] border border-white/8 text-xs text-[#8B95A5] font-mono truncate">
              {error.originalUrl}
            </div>
          )}

          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={onRetry}
              className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs sm:text-sm transition-all cursor-pointer"
            >
              Coba Lagi
            </button>
            <button
              type="button"
              onClick={onClear}
              className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#8B95A5] hover:text-white font-medium text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Hapus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
