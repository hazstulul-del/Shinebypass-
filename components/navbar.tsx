'use client';

import { useState } from 'react';
import { Sparkles, Menu, X, Github, Share2, Check } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { GitHubModal } from './github-modal';

const NAV_ITEMS = [
  { label: 'Beranda', href: '/' },
  { label: 'Riwayat', href: '/history' },
  { label: 'Pengaturan', href: '/settings' },
  { label: 'Tentang', href: '/about' },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [githubModalOpen, setGithubModalOpen] = useState(false);
  const [shared, setShared] = useState(false);

  const handleShare = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/8 bg-[#07090D]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a
            href="/"
            className="flex items-center gap-2.5 text-base font-semibold tracking-tight text-[#F5F7FA] transition-opacity hover:opacity-90"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-violet-600 text-white shadow-sm shadow-blue-500/20">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight">ShineBypass</span>
          </a>

          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-3.5 py-1.5 text-sm font-medium transition-colors rounded-lg text-[#8B95A5] hover:text-[#F5F7FA] hover:bg-white/5"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Switcher */}
            <ThemeToggle />

            {/* Share / Copy App Link button */}
            <button
              type="button"
              onClick={handleShare}
              aria-label="Salin tautan website"
              className={`flex h-9 items-center gap-1.5 px-2.5 sm:px-3 rounded-xl border transition-all text-xs font-medium cursor-pointer ${
                shared
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                  : 'border-white/10 bg-[#0D1117]/80 text-[#8B95A5] hover:border-white/20 hover:text-[#F5F7FA]'
              }`}
              title="Salin Tautan Website"
            >
              {shared ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{shared ? 'Tersalin!' : 'Bagikan'}</span>
            </button>

            {/* GitHub Repo Modal Button */}
            <button
              type="button"
              onClick={() => setGithubModalOpen(true)}
              aria-label="Informasi Repositori GitHub & Deploy"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-[#0D1117]/80 text-[#8B95A5] transition-colors hover:border-white/20 hover:text-[#F5F7FA] cursor-pointer"
              title="Repositori GitHub & Panduan Deploy"
            >
              <Github className="h-4 w-4" />
            </button>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Buka menu navigasi"
              className="flex md:hidden h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-[#0D1117]/80 text-[#8B95A5] hover:text-[#F5F7FA] cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-b border-white/10 bg-[#0D1117]/95 px-4 pt-2 pb-6 backdrop-blur-2xl">
            <nav className="flex flex-col gap-1.5">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium text-[#8B95A5] hover:bg-white/5 hover:text-[#F5F7FA] transition-colors"
                >
                  <span>{item.label}</span>
                </a>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* GitHub Repository & Vercel Modal */}
      <GitHubModal isOpen={githubModalOpen} onClose={() => setGithubModalOpen(false)} />
    </>
  );
}
