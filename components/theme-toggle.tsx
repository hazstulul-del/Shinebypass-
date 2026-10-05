'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

export type Theme = 'dark' | 'light' | 'system';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = (localStorage.getItem('shinebypass-theme') as Theme) || 'dark';
    setTheme(stored);
    applyTheme(stored);
  }, []);

  const applyTheme = (targetTheme: Theme) => {
    const root = document.documentElement;
    if (targetTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
    } else if (targetTheme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
    window.dispatchEvent(new Event('shinebypass-theme-change'));
  };

  const handleSelectTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('shinebypass-theme', newTheme);
    applyTheme(newTheme);
  };

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 animate-pulse" />
    );
  }

  return (
    <div
      role="group"
      aria-label="Pilih tema tampilan"
      className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] dark:bg-[#0D1117]/80 border border-white/10 backdrop-blur-md"
    >
      <button
        type="button"
        onClick={() => handleSelectTheme('dark')}
        aria-label="Ganti ke tema gelap"
        className={`p-1.5 rounded-lg transition-all cursor-pointer ${
          theme === 'dark'
            ? 'bg-blue-600/25 text-blue-400 border border-blue-500/40 shadow-sm'
            : 'text-[#8B95A5] hover:text-white hover:bg-white/5'
        }`}
        title="Mode Gelap"
      >
        <Moon className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => handleSelectTheme('light')}
        aria-label="Ganti ke tema terang"
        className={`p-1.5 rounded-lg transition-all cursor-pointer ${
          theme === 'light'
            ? 'bg-blue-600/25 text-blue-600 dark:text-blue-400 border border-blue-500/40 shadow-sm'
            : 'text-[#8B95A5] hover:text-white hover:bg-white/5'
        }`}
        title="Mode Terang"
      >
        <Sun className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => handleSelectTheme('system')}
        aria-label="Ikuti setelan perangkat"
        className={`p-1.5 rounded-lg transition-all cursor-pointer ${
          theme === 'system'
            ? 'bg-blue-600/25 text-blue-400 border border-blue-500/40 shadow-sm'
            : 'text-[#8B95A5] hover:text-white hover:bg-white/5'
        }`}
        title="Sesuai Sistem"
      >
        <Monitor className="w-4 h-4" />
      </button>
    </div>
  );
}
