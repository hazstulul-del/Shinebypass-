'use client';

import { useState, useEffect } from 'react';
import { Settings, Sun, Moon, Monitor, Trash2, Check, Sparkles, Activity, Zap } from 'lucide-react';
import type { Theme } from '../../components/theme-toggle';

export default function SettingsPage() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [reduceMotion, setReduceMotion] = useState(false);
  const [clearedNotice, setClearedNotice] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedTheme = (localStorage.getItem('shinebypass-theme') as Theme) || 'dark';
    const storedMotion = localStorage.getItem('shinebypass-reduce-motion') === 'true';
    setTheme(storedTheme);
    setReduceMotion(storedMotion);
  }, []);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('shinebypass-theme', newTheme);
    const root = document.documentElement;
    if (newTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
    } else if (newTheme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
    window.dispatchEvent(new Event('shinebypass-theme-change'));
  };

  const handleReduceMotionToggle = () => {
    const updated = !reduceMotion;
    setReduceMotion(updated);
    localStorage.setItem('shinebypass-reduce-motion', String(updated));
    if (updated) {
      document.documentElement.classList.add('motion-reduce');
    } else {
      document.documentElement.classList.remove('motion-reduce');
    }
  };

  const handleClearHistory = () => {
    try {
      localStorage.removeItem('shinebypass-history');
      setClearedNotice(true);
      setTimeout(() => setClearedNotice(false), 3000);
    } catch {
      // Ignore
    }
  };

  if (!mounted) {
    return (
      <div className="flex-1 py-16 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 py-10 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600/10 text-violet-400 border border-violet-500/20">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F7FA]">
              Preferensi & Pengaturan
            </h1>
            <p className="text-xs sm:text-sm text-[#8B95A5] mt-0.5">
              Sesuaikan tampilan tema, preferensi animasi, dan kelola data penyimpanan lokal.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-white/8 bg-[#0D1117]/80 backdrop-blur-xl p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-2 text-[#F5F7FA]">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <h2 className="text-base font-semibold">Tema Tampilan</h2>
            </div>
            <p className="text-xs sm:text-sm text-[#8B95A5] mb-6 leading-relaxed">
              Pilih gaya visual favorit Anda. Antarmuka liquid glass otomatis menyesuaikan dengan mode terang maupun gelap.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleThemeChange('dark')}
                className={`flex items-center justify-center gap-2.5 p-3.5 rounded-2xl border text-sm font-medium transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'border-blue-500/50 bg-blue-600/15 text-white shadow-md'
                    : 'border-white/8 bg-white/[0.02] text-[#8B95A5] hover:text-white hover:bg-white/5'
                }`}
              >
                <Moon className="w-4 h-4 text-blue-400" />
                <span>Kaca Gelap</span>
              </button>

              <button
                type="button"
                onClick={() => handleThemeChange('light')}
                className={`flex items-center justify-center gap-2.5 p-3.5 rounded-2xl border text-sm font-medium transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'border-blue-500/50 bg-blue-600/15 text-white shadow-md'
                    : 'border-white/8 bg-white/[0.02] text-[#8B95A5] hover:text-white hover:bg-white/5'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Kaca Terang</span>
              </button>

              <button
                type="button"
                onClick={() => handleThemeChange('system')}
                className={`flex items-center justify-center gap-2.5 p-3.5 rounded-2xl border text-sm font-medium transition-all cursor-pointer ${
                  theme === 'system'
                    ? 'border-blue-500/50 bg-blue-600/15 text-white shadow-md'
                    : 'border-white/8 bg-white/[0.02] text-[#8B95A5] hover:text-white hover:bg-white/5'
                }`}
              >
                <Monitor className="w-4 h-4 text-indigo-400" />
                <span>Ikuti Sistem</span>
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/8 bg-[#0D1117]/80 backdrop-blur-xl p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5 text-[#F5F7FA]">
                  <Activity className="w-4 h-4 text-violet-400" />
                  <h2 className="text-base font-semibold">Pengurangan Gerak (Reduced Motion)</h2>
                </div>
                <p className="text-xs sm:text-sm text-[#8B95A5] max-w-lg leading-relaxed">
                  Meminimalkan efek transisi, denyut cahaya latar, dan animasi putaran untuk kenyamanan mata.
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={reduceMotion}
                onClick={handleReduceMotionToggle}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  reduceMotion ? 'bg-blue-600' : 'bg-white/10'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    reduceMotion ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/8 bg-[#0D1117]/80 backdrop-blur-xl p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-2 text-[#F5F7FA]">
              <Zap className="w-4 h-4 text-emerald-400" />
              <h2 className="text-base font-semibold">Kuota Harian & Aturan Reset</h2>
            </div>
            <p className="text-xs sm:text-sm text-[#8B95A5] mb-4 leading-relaxed">
              Setiap pengguna mendapatkan kuota minimal <strong>5 kali pelacakan tautan per hari</strong>. Kuota ini otomatis di-reset setiap hari pada tengah malam (00:00 UTC) untuk menjaga performa server tetap stabil dan adil bagi semua pengguna.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/8">
                <span className="text-[11px] font-semibold text-[#8B95A5] uppercase tracking-wider block">
                  Batas Harian
                </span>
                <span className="text-base font-bold text-[#F5F7FA] mt-0.5 block font-mono">
                  Minimal 5x / Hari
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/8">
                <span className="text-[11px] font-semibold text-[#8B95A5] uppercase tracking-wider block">
                  Jadwal Reset
                </span>
                <span className="text-base font-bold text-emerald-400 mt-0.5 block font-mono">
                  Setiap Hari (00:00 UTC)
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/8 bg-[#0D1117]/80 backdrop-blur-xl p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-1.5 text-[#F5F7FA]">
              <Trash2 className="w-4 h-4 text-red-400" />
              <h2 className="text-base font-semibold">Memori Riwayat & Privasi</h2>
            </div>
            <p className="text-xs sm:text-sm text-[#8B95A5] mb-6 leading-relaxed">
              ShineBypass menyimpan riwayat tautan hanya di penyimpanan browser Anda. Tidak ada data pribadi atau log yang dikirim ke pihak ketiga.
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/8">
              <div>
                <span className="text-xs font-semibold text-[#F5F7FA] block">
                  Kosongkan Riwayat Lokal
                </span>
                <span className="text-xs text-[#8B95A5]">
                  Menghapus semua entri riwayat pelacakan yang tersimpan di perangkat ini.
                </span>
              </div>

              <button
                type="button"
                onClick={handleClearHistory}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium text-xs transition-colors shrink-0 cursor-pointer"
              >
                {clearedNotice ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Riwayat Terhapus!</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Semua Data</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
