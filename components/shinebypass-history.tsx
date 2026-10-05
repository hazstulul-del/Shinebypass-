'use client';

import { useState, useEffect } from 'react';
import {
  History as HistoryIcon,
  Zap,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Link2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { triggerHaptic, playSfx } from '../lib/haptics';
import { formatTimestamp } from '../lib/utils';
import type { HistoryItem } from '../types/bypass';

export function ShineBypassHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const loadHistory = () => {
    try {
      const stored = localStorage.getItem('shinebypass-history');
      if (stored) {
        setHistory(JSON.parse(stored));
      } else {
        setHistory([]);
      }
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    setMounted(true);
    loadHistory();

    const handleUpdate = () => loadHistory();
    window.addEventListener('shinebypass-history-change', handleUpdate);
    return () => window.removeEventListener('shinebypass-history-change', handleUpdate);
  }, []);

  const handleCopy = async (id: string, url: string) => {
    triggerHaptic(20, 'light');
    playSfx('success');
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const handleDelete = (id: string) => {
    triggerHaptic(15, 'light');
    playSfx('tap');
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    try {
      localStorage.setItem('shinebypass-history', JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const handleClearAll = () => {
    triggerHaptic(30, 'medium');
    playSfx('toggle-off');
    setHistory([]);
    try {
      localStorage.removeItem('shinebypass-history');
      window.dispatchEvent(new Event('shinebypass-history-change'));
    } catch {
      // Ignore
    }
  };

  if (!mounted) {
    return (
      <div className="py-20 text-center text-[#8B95A5]">
        <div className="w-8 h-8 mx-auto border-2 border-[var(--accent-main)]/20 border-t-[var(--accent-main)] rounded-full animate-spin mb-3" />
      </div>
    );
  }

  const successCount = history.filter((i) => i.status === 'success').length;

  return (
    <div className="w-full max-w-xl mx-auto px-4 pt-8 sm:pt-12 pb-24">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="relative inline-block mb-3.5">
          <div className="absolute inset-0 rounded-3xl blur-xl animate-glow bg-[var(--accent-main)] opacity-35" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl brand-gradient brand-glow text-white shadow-xl">
            <HistoryIcon className="h-8 w-8 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
          Riwayat
        </h1>
        <p className="text-xs sm:text-sm text-[#8B95A5] max-w-md mx-auto leading-relaxed">
          Semua tautan yang pernah kamu bypass — tersimpan hanya di perangkat ini.
        </p>
      </div>

      {/* Stats and Clear Row */}
      {history.length > 0 && (
        <div className="flex items-center justify-between gap-3 mb-4 px-1">
          <div className="flex items-center gap-1.5 text-xs brand-text-accent font-medium">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>
              {successCount} {successCount === 1 ? 'tautan' : 'tautan'} berhasil dibypass
            </span>
          </div>

          <button
            type="button"
            onClick={handleClearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-500/25 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Bersihkan semua</span>
          </button>
        </div>
      )}

      {/* History Items */}
      {history.length === 0 ? (
        <div className="rounded-3xl border border-white/8 bg-[#121626]/70 backdrop-blur-xl p-10 text-center">
          <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-white/5 text-[#8B95A5] mb-3">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-white">Belum Ada Riwayat</h3>
          <p className="text-xs text-[#8B95A5] mt-1.5 max-w-xs mx-auto leading-relaxed">
            Tautan beriklan atau shortener yang kamu bypass akan muncul di sini secara otomatis.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {history.map((item) => {
            const isCopied = copiedId === item.id;
            return (
              <div
                key={item.id}
                className="rounded-3xl border border-white/10 bg-[#121626]/85 backdrop-blur-xl p-5 transition-all hover:border-white/20 shadow-xl shadow-black/50"
              >
                {/* Original URL */}
                <div className="flex items-center gap-1.5 text-xs font-mono text-[#8B95A5] mb-2 truncate">
                  <Link2 className="w-3.5 h-3.5 shrink-0 text-white/40" />
                  <span className="truncate">{item.originalUrl.replace(/^https?:\/\//, '')}</span>
                </div>

                {/* Destination link */}
                <div className="font-mono text-sm sm:text-base text-white font-semibold truncate mb-3 select-all">
                  {item.destinationUrl.replace(/^https?:\/\//, '')}
                </div>

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#8B95A5] mb-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white/[0.04] border border-white/8 text-[11px]">
                    <Clock className="w-3 h-3 text-white/40" />
                    <span>{formatTimestamp(item.timestamp)}</span>
                  </span>

                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white/[0.04] border border-white/8 text-[11px]">
                    <Zap className="w-3 h-3 brand-text-accent" />
                    <span>{item.durationText || '1,8 dtk'}</span>
                  </span>

                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg brand-bg-subtle border brand-border-accent brand-text-accent text-[10px] font-semibold">
                    <span>{item.engine || 'Mesin Ad-Bypass'}</span>
                  </span>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(item.id, item.destinationUrl)}
                    className="flex-1 h-11 rounded-2xl brand-gradient brand-glow brand-gradient-hover text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Salin</span>
                      </>
                    )}
                  </button>

                  <a
                    href={item.destinationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => triggerHaptic(15)}
                    className="h-11 w-11 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors shrink-0"
                    title="Buka Tautan"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="h-11 w-11 rounded-2xl border border-white/10 bg-white/5 hover:bg-red-500/15 text-[#8B95A5] hover:text-red-400 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
