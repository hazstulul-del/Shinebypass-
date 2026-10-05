/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { ShineBypassHero } from '../components/shinebypass-hero';
import { ShineBypassForm } from '../components/shinebypass-form';
import { ShineBypassHistory } from '../components/shinebypass-history';
import { ShineBypassSettings } from '../components/shinebypass-settings';
import { BottomDock, NavTab } from '../components/bottom-dock';
import { GitHubModal } from '../components/github-modal';
import { Github, Share2, Check } from 'lucide-react';
import { triggerHaptic } from '../lib/haptics';
import { initializeSettings } from '../lib/theme-manager';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [githubModalOpen, setGithubModalOpen] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    initializeSettings();

    const handleHash = () => {
      const hash = window.location.hash.replace('#', '') as NavTab;
      if (['home', 'history', 'settings'].includes(hash)) {
        setActiveTab(hash);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
    window.location.hash = tab === 'home' ? '' : tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShare = async () => {
    triggerHaptic(15);
    try {
      const url = window.location.href.split('#')[0];
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)] antialiased selection:bg-purple-600/30 selection:text-white transition-colors duration-250 relative overflow-x-hidden">
      {/* Background ambient liquid glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full blur-3xl pointer-events-none -z-10 bg-[var(--accent-glow)] opacity-40 transition-all duration-300" />

      {/* Top right quick utilities (GitHub & Share) */}
      <div className="absolute top-4 right-4 z-40 flex items-center gap-2">
        <button
          type="button"
          onClick={handleShare}
          aria-label="Salin tautan website"
          className="flex h-8 items-center gap-1.5 px-2.5 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-md text-[#8B95A5] hover:text-white text-[11px] transition-colors cursor-pointer"
          title="Salin Link Website"
        >
          {shared ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{shared ? 'Tersalin!' : 'Bagikan'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            triggerHaptic(15);
            setGithubModalOpen(true);
          }}
          aria-label="Repositori GitHub & Vercel Deploy"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-md text-[#8B95A5] hover:text-white transition-colors cursor-pointer"
          title="GitHub Repo & Deploy"
        >
          <Github className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main View Router */}
      <main className="flex-1 flex flex-col justify-start">
        {activeTab === 'home' && (
          <div className="flex-1 flex flex-col pb-24">
            <ShineBypassHero />
            <ShineBypassForm />
          </div>
        )}

        {activeTab === 'history' && <ShineBypassHistory />}

        {activeTab === 'settings' && <ShineBypassSettings />}
      </main>

      {/* Global Footer Credit */}
      <footer className="text-[11px] text-[#8B95A5]/60 text-center py-6 pb-24 pointer-events-none select-none">
        ShineBypass v1.2 · Liquid Glass UI · Gunakan secara bijak & bertanggung jawab
      </footer>

      {/* Floating Bottom Dock Navigation */}
      <BottomDock activeTab={activeTab} onTabChange={handleTabChange} />

      {/* GitHub Repository & Vercel Modal */}
      <GitHubModal isOpen={githubModalOpen} onClose={() => setGithubModalOpen(false)} />
    </div>
  );
}
