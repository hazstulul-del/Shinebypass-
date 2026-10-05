'use client';

import { useState } from 'react';
import {
  Github,
  X,
  Copy,
  Check,
  ExternalLink,
  Terminal,
  Rocket,
  Code2,
  FolderGit2,
  UserCheck,
} from 'lucide-react';
import { triggerHaptic, playSfx } from '../lib/haptics';

interface GitHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GitHubModal({ isOpen, onClose }: GitHubModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const username = 'corleonev975-crypto';
  const repoName = 'shinebypass';
  const repoUrl = `https://github.com/${username}/${repoName}`;
  const cloneCommand = `git clone https://github.com/${username}/${repoName}.git`;
  const remoteCommand = `git remote add origin https://github.com/${username}/${repoName}.git`;
  const pushCommand = 'git branch -M main && git push -u origin main';
  const buildCommand = 'npm install && npm run build';

  const copyToClipboard = async (text: string, fieldId: string) => {
    triggerHaptic(20, 'light');
    playSfx('success');
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // Fallback
    }
  };

  const handleClose = () => {
    triggerHaptic(15, 'light');
    playSfx('tap');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl border border-white/12 bg-[#0D1117] p-6 sm:p-8 shadow-2xl text-[#F5F7FA] space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl brand-gradient brand-glow text-white shadow-md">
              <Github className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Repositori GitHub</span>
                <span className="px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/30 text-purple-300 font-mono text-[11px]">
                  {repoName}
                </span>
              </h3>
              <p className="text-xs text-[#8B95A5] flex items-center gap-1.5 mt-0.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Akun: <strong className="text-white font-mono">{username}</strong></span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Tutup jendela"
            className="p-2 rounded-xl border border-white/10 text-[#8B95A5] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3.5 text-xs">
          {/* 1. Nama Repo Box */}
          <div className="p-3.5 rounded-2xl bg-black/50 border border-purple-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FolderGit2 className="w-4 h-4 text-purple-400 shrink-0" />
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#8B95A5] font-semibold block">
                  Target Repositori
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-white font-mono break-all">
                  {username}/{repoName}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => copyToClipboard(`${username}/${repoName}`, 'full-name')}
              className="py-1.5 px-3 rounded-xl brand-gradient text-white text-[11px] font-semibold transition-all hover:brightness-110 active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0 ml-2"
            >
              {copiedField === 'full-name' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Target</span>
                </>
              )}
            </button>
          </div>

          {/* 2. Clone Command */}
          <div>
            <label className="block text-[#8B95A5] font-semibold text-[11px] uppercase tracking-wider mb-1.5">
              Perintah Clone URL
            </label>
            <div className="flex items-center justify-between p-3 rounded-xl bg-black/50 border border-white/8 font-mono text-[#F5F7FA]">
              <span className="truncate pr-2 text-[11px]">{cloneCommand}</span>
              <button
                type="button"
                onClick={() => copyToClipboard(cloneCommand, 'clone')}
                className="shrink-0 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
              >
                {copiedField === 'clone' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedField === 'clone' ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>
          </div>

          {/* 3. Remote Origin Setup */}
          <div>
            <label className="block text-[#8B95A5] font-semibold text-[11px] uppercase tracking-wider mb-1.5">
              Hubungkan ke Remote GitHub Anda
            </label>
            <div className="flex items-center justify-between p-3 rounded-xl bg-black/50 border border-white/8 font-mono text-[#F5F7FA]">
              <span className="truncate pr-2 text-[11px]">{remoteCommand}</span>
              <button
                type="button"
                onClick={() => copyToClipboard(remoteCommand, 'remote')}
                className="shrink-0 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
              >
                {copiedField === 'remote' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedField === 'remote' ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>
          </div>

          {/* Step Guide */}
          <div className="p-3.5 rounded-2xl bg-purple-600/10 border border-purple-500/20 text-[#8B95A5] space-y-2">
            <div className="flex items-center gap-2 text-purple-300 font-semibold text-xs">
              <Rocket className="w-4 h-4 text-purple-400" />
              <span>Langkah Push ke Akun &quot;{username}&quot;:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-[#8B95A5] leading-relaxed">
              <li>Pastikan repo <code className="text-white font-mono bg-white/10 px-1 rounded">{repoName}</code> sudah dibuat di akun GitHub Anda.</li>
              <li>Jalankan remote di terminal: <code className="text-white font-mono bg-white/10 px-1 rounded break-all">{remoteCommand}</code></li>
              <li>Push kode: <code className="text-white font-mono bg-white/10 px-1 rounded">{pushCommand}</code></li>
              <li>Buka dashboard <strong>Vercel</strong> lalu sambungkan repo <strong>{username}/{repoName}</strong> untuk deploy otomatis!</li>
            </ol>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <a
            href={`https://github.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#8B95A5] hover:text-white transition-colors flex items-center gap-1"
          >
            <span>Profil GitHub: @{username}</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              className="px-3.5 py-2 rounded-xl border border-white/10 text-[#8B95A5] hover:text-white text-xs font-medium cursor-pointer"
            >
              Tutup
            </button>
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl brand-gradient brand-glow text-white text-xs font-semibold transition-all hover:brightness-110 shadow-md"
            >
              <span>Buka Repositori</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
