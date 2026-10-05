'use client';

import { useState, useEffect } from 'react';
import {
  History,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  AlertCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { formatTimestamp } from '../lib/utils';
import type { HistoryItem } from '../types/bypass';

export function HistoryList() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem('shinebypass-history');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch {
      // LocalStorage access fallback
    }
  }, []);

  const handleCopy = async (id: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleDelete = (id: string) => {
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    try {
      localStorage.setItem('shinebypass-history', JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const handleClearAll = () => {
    setHistory([]);
    try {
      localStorage.removeItem('shinebypass-history');
    } catch {
      // Ignore
    }
  };

  if (!mounted) {
    return (
      <div className="py-12 text-center text-[#8B95A5]">
        <div className="w-8 h-8 mx-auto border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-3" />
        <p className="text-sm">Memuat riwayat...</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="rounded-3xl border border-white/8 bg-[#0D1117]/60 backdrop-blur-xl p-12 text-center max-w-xl mx-auto">
        <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-white/5 text-[#8B95A5] mb-4">
          <History className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-semibold text-[#F5F7FA]">Belum Ada Riwayat</h3>
        <p className="mt-2 text-sm text-[#8B95A5] leading-relaxed">
          Tautan yang Anda lacak di ShineBypass akan tersimpan secara otomatis di memori lokal peramban Anda untuk kemudahan referensi.
        </p>
        <a
          href="#home"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-medium transition-all shadow-md cursor-pointer"
        >
          <span>Lacak tautan pertama Anda</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-[#F5F7FA]">
            {history.length} {history.length === 1 ? 'rekaman' : 'rekaman'}
          </span>
          <span className="text-xs text-[#8B95A5]">· Disimpan di browser lokal</span>
        </div>

        <button
          type="button"
          onClick={handleClearAll}
          className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/10 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Hapus Semua</span>
        </button>
      </div>

      <div className="space-y-3">
        {history.map((item) => {
          const isSuccess = item.status === 'success';
          const isCopied = copiedId === item.id;

          return (
            <div
              key={item.id}
              className="rounded-2xl border border-white/8 bg-[#0D1117]/80 backdrop-blur-xl p-4 sm:p-5 transition-all hover:border-white/15 hover:bg-[#0D1117]/95"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      isSuccess ? 'bg-emerald-400' : 'bg-red-400'
                    }`}
                  />
                  <span className="text-xs font-semibold text-[#F5F7FA] uppercase tracking-wider">
                    {item.method}
                  </span>
                  <span className="text-xs text-[#8B95A5]">·</span>
                  <span className="text-xs text-[#8B95A5]">
                    {formatTimestamp(item.timestamp)}
                  </span>
                </div>

                <div className="flex items-center gap-1 self-end sm:self-auto">
                  {isSuccess && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleCopy(item.id, item.destinationUrl)}
                        aria-label="Salin URL tujuan"
                        className="p-1.5 rounded-lg border border-white/8 hover:bg-white/10 text-[#8B95A5] hover:text-[#F5F7FA] transition-colors cursor-pointer"
                        title="Salin Tujuan"
                      >
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <a
                        href={item.destinationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Buka tujuan di tab baru"
                        className="p-1.5 rounded-lg border border-white/8 hover:bg-white/10 text-[#8B95A5] hover:text-[#F5F7FA] transition-colors"
                        title="Buka di tab baru"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    aria-label="Hapus rekaman ini"
                    className="p-1.5 rounded-lg border border-white/8 hover:bg-red-500/10 text-[#8B95A5] hover:text-red-400 transition-colors cursor-pointer"
                    title="Hapus rekaman"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex items-center gap-2 text-[#8B95A5]">
                  <span className="shrink-0 text-white/40">Asal:</span>
                  <span className="truncate">{item.originalUrl}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="shrink-0 text-emerald-400 font-medium">Tujuan:</span>
                  {isSuccess ? (
                    <span className="text-[#F5F7FA] truncate font-medium">
                      {item.destinationUrl}
                    </span>
                  ) : (
                    <span className="text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 inline shrink-0" />
                      <span>Pelacakan gagal</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
