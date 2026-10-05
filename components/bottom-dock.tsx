'use client';

import { Home, History, SlidersHorizontal } from 'lucide-react';
import { triggerHaptic, playSfx } from '../lib/haptics';

export type NavTab = 'home' | 'history' | 'settings';

interface BottomDockProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export function BottomDock({ activeTab, onTabChange }: BottomDockProps) {
  const handleSelect = (tab: NavTab) => {
    triggerHaptic(20, 'light');
    playSfx('click');
    onTabChange(tab);
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <nav
        aria-label="Navigasi Bawah"
        className="flex items-center gap-1.5 p-1.5 rounded-full bg-[#121626]/90 border border-white/12 backdrop-blur-2xl shadow-2xl shadow-black/70"
      >
        <button
          type="button"
          onClick={() => handleSelect('home')}
          className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
            activeTab === 'home'
              ? 'brand-gradient brand-glow text-white shadow-md'
              : 'text-[#8B95A5] hover:text-white px-4'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Beranda</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelect('history')}
          className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
            activeTab === 'history'
              ? 'brand-gradient brand-glow text-white shadow-md'
              : 'text-[#8B95A5] hover:text-white px-4'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Riwayat</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelect('settings')}
          className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
            activeTab === 'settings'
              ? 'brand-gradient brand-glow text-white shadow-md'
              : 'text-[#8B95A5] hover:text-white px-4'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Pengaturan</span>
        </button>
      </nav>
    </div>
  );
}
