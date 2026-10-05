import type { AccentColor } from '../types/bypass';
import { initInteractionEngine } from './interaction-effects';

export function applyTheme(theme: 'dark' | 'light' | 'system') {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  } else if (theme === 'light') {
    root.classList.add('light');
    root.classList.remove('dark');
  } else {
    root.classList.add('dark');
    root.classList.remove('light');
  }

  localStorage.setItem('shinebypass-theme', theme);
  window.dispatchEvent(new Event('shinebypass-theme-change'));
}

export function applyAccentColor(accent: AccentColor) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-accent', accent);
  localStorage.setItem('shinebypass-accent', accent);
  window.dispatchEvent(new Event('shinebypass-accent-change'));
}

export function applyAnimations(enabled: boolean) {
  if (typeof document === 'undefined') return;
  if (!enabled) {
    document.documentElement.classList.add('disable-animations');
    document.documentElement.classList.add('motion-reduce');
  } else {
    document.documentElement.classList.remove('disable-animations');
    document.documentElement.classList.remove('motion-reduce');
  }
  localStorage.setItem('shinebypass-animations', String(enabled));
  window.dispatchEvent(new Event('shinebypass-animations-change'));
}

export function initializeSettings() {
  if (typeof window === 'undefined') return;
  try {
    const theme = (localStorage.getItem('shinebypass-theme') as 'dark' | 'light' | 'system') || 'dark';
    const accent = (localStorage.getItem('shinebypass-accent') as AccentColor) || 'purple';
    const anim = localStorage.getItem('shinebypass-animations') !== 'false';

    applyTheme(theme);
    applyAccentColor(accent);
    applyAnimations(anim);
    initInteractionEngine();
  } catch {
    // Ignore
  }
}
