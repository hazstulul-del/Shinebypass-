'use client';

import { Zap, ShieldCheck, Lock, Sparkles, Layers } from 'lucide-react';

export function ShineBypassHero() {
  return (
    <div className="text-center pt-8 sm:pt-14 pb-6 px-4">
      {/* Glowing squircle logo with dynamic accent */}
      <div className="relative inline-block mb-4">
        <div className="absolute inset-0 rounded-3xl blur-xl animate-glow bg-[var(--accent-main)] opacity-40" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl brand-gradient brand-glow text-white shadow-xl">
          <Sparkles className="h-8 w-8 fill-white text-white" />
        </div>
      </div>

      {/* Main Brand Title */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-2.5">
        ShineBypass
      </h1>

      {/* Subtitle covering all ad-links */}
      <p className="text-xs sm:text-sm text-[#8B95A5] max-w-md mx-auto leading-relaxed [text-wrap:balance]">
        Tempel semua tautan beriklan, safelinku, shortener, atau redirect URL — dapatkan tautan aslinya tanpa iklan dan tanpa jeda tunggu.
      </p>

      {/* Badges */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 brand-text-accent backdrop-blur-md">
          <Zap className="w-3.5 h-3.5" />
          <span>Bypass Universal</span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-[#8B95A5] backdrop-blur-md">
          <ShieldCheck className="w-3.5 h-3.5 text-white/50" />
          <span>Anti-Iklan & Bersih</span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-[#8B95A5] backdrop-blur-md">
          <Lock className="w-3.5 h-3.5 text-white/50" />
          <span>Riwayat Lokal</span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-[#8B95A5] backdrop-blur-md">
          <Layers className="w-3.5 h-3.5 text-white/50" />
          <span>Liquid Glass v1.2</span>
        </div>
      </div>
    </div>
  );
}
