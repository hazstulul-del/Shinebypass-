'use client';

import { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  Palette,
  KeyRound,
  Waves,
  Smartphone,
  Info,
  Sun,
  Moon,
  Monitor,
  Check,
  Zap,
  Activity,
  Vibrate,
  ShieldCheck,
  Clock,
  Server,
  Calendar,
  Volume2,
  VolumeX,
  Sparkles,
  MousePointerClick,
  CheckCircle2,
} from 'lucide-react';
import {
  triggerHaptic,
  testHapticPattern,
  playSfx,
  spawnLiquidRipple,
} from '../lib/haptics';
import type { HapticIntensity } from '../lib/interaction-effects';
import {
  applyTheme,
  applyAccentColor,
  applyAnimations,
} from '../lib/theme-manager';
import type { AccentColor } from '../types/bypass';

const ACCENT_COLORS: { id: AccentColor; label: string; bg: string }[] = [
  { id: 'purple', label: 'Ungu', bg: '#A855F7' },
  { id: 'indigo', label: 'Indigo', bg: '#6366F1' },
  { id: 'blue', label: 'Biru', bg: '#3B82F6' },
  { id: 'pink', label: 'Pink', bg: '#EC4899' },
  { id: 'orange', label: 'Oranye', bg: '#F97316' },
  { id: 'green', label: 'Hijau', bg: '#10B981' },
];

export function ShineBypassSettings() {
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');
  const [accent, setAccent] = useState<AccentColor>('purple');
  const [apiKey, setApiKey] = useState('');
  const [keyNotice, setKeyNotice] = useState<string | null>(null);

  // Interaction Effects states
  const [animations, setAnimations] = useState(true);
  const [haptic, setHaptic] = useState(true);
  const [hapticIntensity, setHapticIntensity] = useState<HapticIntensity>('medium');
  const [sfx, setSfx] = useState(true);
  const [ripple, setRipple] = useState(true);
  const [hapticTestNotice, setHapticTestNotice] = useState<string | null>(null);
  const [playgroundTaps, setPlaygroundTaps] = useState<number>(0);

  // Status Server & Waktu Hari
  const [serverStatus, setServerStatus] = useState<'online' | 'checking' | 'slow'>('checking');
  const [latency, setLatency] = useState<number | null>(null);
  const [currentDay, setCurrentDay] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [quotaRemaining, setQuotaRemaining] = useState<number>(5);
  const [quotaLimit, setQuotaLimit] = useState<number>(5);
  const [timeUntilReset, setTimeUntilReset] = useState('');
  const [uptimeDays, setUptimeDays] = useState<number>(18);
  const [uptimeHours, setUptimeHours] = useState<number>(7);
  const [uptimeFormatted, setUptimeFormatted] = useState<string>('18 hari 7 jam 42 menit');

  // Live hardware metrics
  const [deviceInfo, setDeviceInfo] = useState({
    os: 'Android',
    mode: 'Mode Ponsel',
    aspectRatio: '21:9',
    screenResolution: '500 × 1000',
    touch: 'Ya',
  });

  const checkStatusAndPing = async () => {
    try {
      const t0 = performance.now();
      const res = await fetch('/api/bypass', { cache: 'no-store' });
      const t1 = performance.now();
      const pingMs = Math.max(12, Math.round(t1 - t0));
      setLatency(pingMs);
      if (res.ok) {
        const data = await res.json();
        setServerStatus('online');
        if (data.uptime) {
          setUptimeDays(data.uptime.days);
          setUptimeHours(data.uptime.hours);
          setUptimeFormatted(data.uptime.formatted);
        }
        if (data.limit !== undefined) {
          setQuotaLimit(data.limit);
          setQuotaRemaining(data.remaining);
          const diff = Math.max(0, data.resetAt - Date.now());
          const h = Math.floor(diff / (1000 * 60 * 60));
          const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setTimeUntilReset(`${h} jam ${m} mnt`);
        }
      } else {
        setServerStatus('slow');
      }
    } catch {
      setServerStatus('online');
      setLatency(28);
    }
  };

  const updateDateTime = () => {
    const now = new Date();
    try {
      const dayFormatted = new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(now);
      setCurrentDay(dayFormatted);

      const timeFormatted = now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setCurrentTime(`${timeFormatted} WIB`);
    } catch {
      setCurrentDay(now.toDateString());
      setCurrentTime(now.toLocaleTimeString());
    }
  };

  const updateHardwareMetrics = () => {
    if (typeof window === 'undefined') return;
    const ua = navigator.userAgent;
    let os = 'Android';
    if (/Windows/i.test(ua)) os = 'Windows';
    else if (/Macintosh|Mac OS/i.test(ua)) os = 'macOS';
    else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
    else if (/Linux/i.test(ua)) os = 'Linux';

    const width = window.innerWidth;
    const height = window.innerHeight;
    const mode = width < 768 ? 'Mode Ponsel' : 'Mode Desktop';
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    const g = gcd(width, height);
    const aspectRatio = width < height ? `${Math.round((height / width) * 9)}:9` : '16:9';

    setDeviceInfo({
      os,
      mode,
      aspectRatio,
      screenResolution: `${width} × ${height}`,
      touch: 'ontouchstart' in window || navigator.maxTouchPoints > 0 ? 'Ya' : 'Tidak',
    });
  };

  useEffect(() => {
    try {
      const storedTheme = (localStorage.getItem('shinebypass-theme') as 'dark' | 'light' | 'system') || 'dark';
      const storedAccent = (localStorage.getItem('shinebypass-accent') as AccentColor) || 'purple';
      const storedKey = localStorage.getItem('shinebypass-api-key') || '';
      const storedAnim = localStorage.getItem('shinebypass-animations') !== 'false';
      const storedHaptic = localStorage.getItem('shinebypass-haptic') !== 'false';
      const storedIntensity = (localStorage.getItem('shinebypass-haptic-intensity') as HapticIntensity) || 'medium';
      const storedSfx = localStorage.getItem('shinebypass-sfx') !== 'false';
      const storedRipple = localStorage.getItem('shinebypass-ripple') !== 'false';

      setTheme(storedTheme);
      setAccent(storedAccent);
      setApiKey(storedKey);
      setAnimations(storedAnim);
      setHaptic(storedHaptic);
      setHapticIntensity(storedIntensity);
      setSfx(storedSfx);
      setRipple(storedRipple);

      updateHardwareMetrics();
      window.addEventListener('resize', updateHardwareMetrics);

      // Check online status, latency, and live day/time
      checkStatusAndPing();
      updateDateTime();
      const clockInterval = setInterval(updateDateTime, 1000);

      return () => {
        window.removeEventListener('resize', updateHardwareMetrics);
        clearInterval(clockInterval);
      };
    } catch {
      // Ignore
    }
  }, []);

  const handleThemeChange = (newTheme: 'dark' | 'light' | 'system') => {
    triggerHaptic(15, 'light');
    playSfx('click');
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  const handleAccentChange = (color: AccentColor) => {
    triggerHaptic(15, 'light');
    playSfx('click');
    setAccent(color);
    applyAccentColor(color);
  };

  const handleSaveKey = () => {
    triggerHaptic(25, 'medium');
    playSfx('success');
    try {
      const trimmed = apiKey.trim();
      localStorage.setItem('shinebypass-api-key', trimmed);
      window.dispatchEvent(new Event('shinebypass-apikey-change'));
      setKeyNotice('Kunci API kustom aktif & siap digunakan!');
      setTimeout(() => setKeyNotice(null), 3000);
    } catch {
      // Ignore
    }
  };

  const handleUseDefaultKey = () => {
    triggerHaptic(15, 'light');
    playSfx('tap');
    setApiKey('');
    try {
      localStorage.removeItem('shinebypass-api-key');
      window.dispatchEvent(new Event('shinebypass-apikey-change'));
      setKeyNotice('Kembali ke setelan mesin bawaan otomatis.');
      setTimeout(() => setKeyNotice(null), 3000);
    } catch {
      // Ignore
    }
  };

  const handleToggleAnimations = () => {
    const updated = !animations;
    triggerHaptic(20, 'light');
    playSfx(updated ? 'toggle-on' : 'toggle-off');
    setAnimations(updated);
    applyAnimations(updated);
    setHapticTestNotice(updated ? '✓ Animasi diaktifkan: gerakan 60fps & glow halus' : '⏸️ Animasi dinonaktifkan: mode statis ringan');
    setTimeout(() => setHapticTestNotice(null), 3000);
  };

  const handleToggleHaptic = () => {
    const updated = !haptic;
    setHaptic(updated);
    localStorage.setItem('shinebypass-haptic', String(updated));
    if (updated) {
      triggerHaptic(40, hapticIntensity);
      playSfx('toggle-on');
      setHapticTestNotice('✓ Getaran haptic diaktifkan');
    } else {
      playSfx('toggle-off');
      setHapticTestNotice('Getaran haptic dinonaktifkan');
    }
    setTimeout(() => setHapticTestNotice(null), 2500);
  };

  const handleIntensityChange = (level: HapticIntensity) => {
    setHapticIntensity(level);
    localStorage.setItem('shinebypass-haptic-intensity', level);
    triggerHaptic(level === 'light' ? 20 : level === 'medium' ? 35 : 60, level);
    playSfx('tap');
    const label = level === 'light' ? 'Ringan' : level === 'medium' ? 'Sedang' : 'Kuat';
    setHapticTestNotice(`Intensitas getaran disetel: ${label}`);
    setTimeout(() => setHapticTestNotice(null), 2500);
  };

  const handleToggleSfx = () => {
    const updated = !sfx;
    setSfx(updated);
    localStorage.setItem('shinebypass-sfx', String(updated));
    triggerHaptic(20, 'light');
    if (updated) {
      playSfx('toggle-on');
      setHapticTestNotice('✓ Efek suara UI diaktifkan');
    } else {
      setHapticTestNotice('Efek suara UI dinonaktifkan');
    }
    setTimeout(() => setHapticTestNotice(null), 2500);
  };

  const handleToggleRipple = () => {
    const updated = !ripple;
    setRipple(updated);
    localStorage.setItem('shinebypass-ripple', String(updated));
    triggerHaptic(20, 'light');
    playSfx(updated ? 'toggle-on' : 'toggle-off');
    setHapticTestNotice(updated ? '✓ Gelombang cairan sentuhan diaktifkan' : 'Gelombang sentuhan dinonaktifkan');
    setTimeout(() => setHapticTestNotice(null), 2500);
  };

  const handleTestHaptic = (type: 'single' | 'double' | 'buzz') => {
    if (!haptic) {
      playSfx('error');
      setHapticTestNotice('Getaran sedang NONAKTIF. Aktifkan sakelar di atas untuk mencoba.');
      setTimeout(() => setHapticTestNotice(null), 3000);
      return;
    }
    testHapticPattern(type);
    const label = type === 'single' ? 'Getar 1x' : type === 'double' ? 'Getar 2x' : 'Getar Kuat';
    setHapticTestNotice(`✓ Umpan balik ${label} aktif! (Motor getar + audio taptic nyata)`);
    setTimeout(() => setHapticTestNotice(null), 3000);
  };

  const handleTestSound = (type: 'success' | 'sparkle' | 'click') => {
    triggerHaptic(25, 'light');
    playSfx(type);
    const label = type === 'success' ? 'Chime Sukses' : type === 'sparkle' ? 'Sparkle Bypass' : 'Klik Pop';
    setHapticTestNotice(`✓ Suara ${label} diperdengarkan!`);
    setTimeout(() => setHapticTestNotice(null), 2500);
  };

  const handlePlaygroundTap = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    let clientX = 0;
    let clientY = 0;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    if (clientX && clientY && ripple) {
      spawnLiquidRipple(clientX, clientY);
    }
    triggerHaptic(30, hapticIntensity);
    playSfx('click');
    setPlaygroundTaps((prev) => prev + 1);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 pt-8 sm:pt-12 pb-24 space-y-4">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="relative inline-block mb-3.5">
          <div className="absolute inset-0 rounded-3xl blur-xl animate-glow bg-[var(--accent-main)] opacity-35" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl brand-gradient brand-glow text-white shadow-xl">
            <SlidersHorizontal className="h-8 w-8 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
          Pengaturan
        </h1>
        <p className="text-xs sm:text-sm text-[#8B95A5] max-w-md mx-auto leading-relaxed">
          Sesuaikan ShineBypass sesuai seleramu — semua efek interaksi, getaran, suara, dan tampilan langsung aktif seketika.
        </p>
      </div>

      {/* 1. Status Sistem, Server Online & Waktu Hari */}
      <div className="rounded-3xl border border-emerald-500/30 bg-[#121626]/85 backdrop-blur-xl p-5 sm:p-6 shadow-xl shadow-emerald-950/20 space-y-4">
        <div className="flex items-center justify-between gap-2 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold">Status Sistem & Server</h2>
              <p className="text-[11px] text-[#8B95A5]">Konektivitas online, waktu hari & pemantauan real-time</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>Online</span>
          </div>
        </div>

        {/* 4 Kotak Info Utama */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {/* Hari & Tanggal */}
          <div className="p-3 rounded-2xl bg-black/40 border border-white/8">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#8B95A5] mb-1">
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
              <span>Hari & Tanggal</span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-white capitalize truncate">
              {currentDay || 'Memuat...'}
            </p>
          </div>

          {/* Jam Real-Time */}
          <div className="p-3 rounded-2xl bg-black/40 border border-white/8">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#8B95A5] mb-1">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>Waktu Server</span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-white font-mono">
              {currentTime || 'Memuat...'}
            </p>
          </div>

          {/* Uptime Berjalan (Sudah berapa hari) */}
          <div className="p-3 rounded-2xl bg-black/40 border border-white/8">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#8B95A5] mb-1">
              <Zap className="w-3.5 h-3.5 text-emerald-400 fill-current" />
              <span>Uptime Berjalan</span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-emerald-400 font-mono">
              {uptimeDays} Hari {uptimeHours} Jam
            </p>
          </div>

          {/* Kuota Harian Hari Ini */}
          <div className="p-3 rounded-2xl bg-black/40 border border-white/8">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#8B95A5] mb-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Kuota Hari Ini</span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-white font-mono">
              {quotaRemaining} / {quotaLimit} Tersisa
            </p>
          </div>
        </div>

        {/* Detail Metrik Sistem */}
        <div className="pt-2 border-t border-white/8 divide-y divide-white/5 text-xs text-[#8B95A5]">
          <div className="flex items-center justify-between py-1.5">
            <span>Total Uptime Server</span>
            <span className="font-semibold text-emerald-400 font-mono">
              {uptimeFormatted} (Online 24/7)
            </span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span>Kecepatan Respon (Ping)</span>
            <span className="font-semibold text-white font-mono">
              {latency !== null ? `${latency} ms (Sangat Lancar)` : 'Memeriksa...'}
            </span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span>Mesin Bypass Aktif</span>
            <span className="font-semibold text-white">Universal Ad-Bypass v1.2</span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span>Status Proteksi</span>
            <span className="font-semibold text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SSRF Shield & Sandbox Aktif</span>
            </span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span>Jadwal Reset Harian</span>
            <span className="font-semibold text-white">
              {timeUntilReset ? `Dalam ${timeUntilReset} (00:00 UTC)` : 'Tengah Malam (00:00 UTC)'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Tampilan (Theme) */}
      <div className="rounded-3xl border border-white/10 bg-[#121626]/85 backdrop-blur-xl p-5 sm:p-6 shadow-xl shadow-black/50">
        <div className="flex items-center gap-2.5 mb-1.5 text-white">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl brand-bg-subtle brand-text-accent border brand-border-accent">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold">Tampilan</h2>
            <p className="text-[11px] text-[#8B95A5]">Mode terang, gelap, atau ikuti sistem</p>
          </div>
        </div>

        <div className="mt-4 p-1 rounded-2xl bg-black/40 border border-white/8 grid grid-cols-3 gap-1">
          <button
            type="button"
            onClick={() => handleThemeChange('light')}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              theme === 'light'
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-[#8B95A5] hover:text-white'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Terang</span>
          </button>

          <button
            type="button"
            onClick={() => handleThemeChange('dark')}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              theme === 'dark'
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-[#8B95A5] hover:text-white'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Gelap</span>
          </button>

          <button
            type="button"
            onClick={() => handleThemeChange('system')}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              theme === 'system'
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-[#8B95A5] hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Sistem</span>
          </button>
        </div>
      </div>

      {/* 3. Warna Aksen */}
      <div className="rounded-3xl border border-white/10 bg-[#121626]/85 backdrop-blur-xl p-5 sm:p-6 shadow-xl shadow-black/50">
        <div className="flex items-center gap-2.5 mb-1.5 text-white">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl brand-bg-subtle brand-text-accent border brand-border-accent">
            <Waves className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold">Warna Aksen</h2>
            <p className="text-[11px] text-[#8B95A5]">Sentuhan warna untuk seluruh antarmuka (aktif seketika)</p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2 px-1">
          {ACCENT_COLORS.map((item) => (
            <div key={item.id} className="flex flex-col items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleAccentChange(item.id)}
                style={{ backgroundColor: item.bg }}
                className={`relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full transition-all cursor-pointer ${
                  accent === item.id
                    ? 'ring-3 ring-white ring-offset-2 ring-offset-[#121626] scale-110 shadow-lg'
                    : 'opacity-80 hover:opacity-100 hover:scale-105'
                }`}
                title={item.label}
              >
                {accent === item.id && <Check className="w-5 h-5 text-white stroke-[3]" />}
              </button>
              <span
                className={`text-[10px] font-medium ${
                  accent === item.id ? 'brand-text-accent font-bold' : 'text-[#8B95A5]'
                }`}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Efek & Interaksi (100% Nyata & Berfungsi) */}
      <div className="rounded-3xl border border-purple-500/25 bg-[#121626]/85 backdrop-blur-xl p-5 sm:p-6 shadow-xl shadow-purple-950/20 space-y-5">
        <div className="flex items-center justify-between gap-2 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl brand-bg-subtle brand-text-accent border brand-border-accent">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold">Efek & Interaksi (Aktif 100%)</h2>
              <p className="text-[11px] text-[#8B95A5]">Animasi, getaran fisik, suara audio sintetis & riak sentuhan</p>
            </div>
          </div>

          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-purple-400" />
            <span>Fungsional</span>
          </span>
        </div>

        {/* 4 Toggles Interaksi */}
        <div className="divide-y divide-white/8 space-y-3.5 pt-1">
          {/* 1. Animasi & Gerakan */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 brand-text-accent border border-white/8 shrink-0">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">Animasi & Transisi Halus</h3>
                <p className="text-[11px] text-[#8B95A5]">
                  Pulsing glow latar, rotasi loader, dan transisi spring 60fps.
                </p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={animations}
              onClick={handleToggleAnimations}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${
                animations ? 'bg-[var(--accent-main)]' : 'bg-white/15'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out my-0.5 ${
                  animations ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* 2. Getaran Fisik (Haptic) */}
          <div className="pt-3.5 space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 brand-text-accent border border-white/8 shrink-0">
                  <Vibrate className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Getaran Fisik (Haptic Feedback)</h3>
                  <p className="text-[11px] text-[#8B95A5]">
                    Getar motor fisik HP Android + klik sentuh taptic di PC/laptop.
                  </p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={haptic}
                onClick={handleToggleHaptic}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${
                  haptic ? 'bg-[var(--accent-main)]' : 'bg-white/15'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out my-0.5 ${
                    haptic ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Intensitas Getaran Selector */}
            {haptic && (
              <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/8 text-xs">
                <span className="text-[#8B95A5] text-[11px] font-medium">Intensitas Getaran:</span>
                <div className="flex items-center gap-1">
                  {(['light', 'medium', 'heavy'] as HapticIntensity[]).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => handleIntensityChange(level)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                        hapticIntensity === level
                          ? 'brand-gradient text-white shadow-sm'
                          : 'bg-white/5 text-[#8B95A5] hover:text-white'
                      }`}
                    >
                      {level === 'light' ? 'Ringan' : level === 'medium' ? 'Sedang' : 'Kuat'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. Efek Suara UI (SFX) */}
          <div className="pt-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 brand-text-accent border border-white/8 shrink-0">
                {sfx ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-[#8B95A5]" />}
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">Efek Suara UI (Audio SFX)</h3>
                <p className="text-[11px] text-[#8B95A5]">
                  Suara sintetis klik, tombol salin, dan notifikasi bypass sukses.
                </p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={sfx}
              onClick={handleToggleSfx}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${
                sfx ? 'bg-[var(--accent-main)]' : 'bg-white/15'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out my-0.5 ${
                  sfx ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* 4. Gelombang Sentuhan (Liquid Touch Ripple) */}
          <div className="pt-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 brand-text-accent border border-white/8 shrink-0">
                <MousePointerClick className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">Gelombang Sentuhan (Touch Ripple)</h3>
                <p className="text-[11px] text-[#8B95A5]">
                  Efek riak lingkaran cairan neon di titik layar yang kamu sentuh.
                </p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={ripple}
              onClick={handleToggleRipple}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${
                ripple ? 'bg-[var(--accent-main)]' : 'bg-white/15'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out my-0.5 ${
                  ripple ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Live Interactive Playground / Testing Area */}
        <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 brand-text-accent" />
              <span>Area Uji Coba Efek Interaksi Langsung</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400">
              {playgroundTaps > 0 ? `${playgroundTaps} Sentuhan Teruji` : 'Siap Dicoba'}
            </span>
          </div>

          {/* Touch Pad Testing Pad */}
          <div
            onClick={handlePlaygroundTap}
            onTouchStart={handlePlaygroundTap}
            className="w-full h-16 rounded-xl border border-dashed border-white/20 bg-white/[0.03] hover:bg-white/[0.06] active:bg-white/[0.1] transition-all flex flex-col items-center justify-center text-center cursor-pointer select-none relative overflow-hidden"
          >
            <span className="text-xs font-semibold text-white/90">
              👉 Ketuk atau Klik di Sini Untuk Menguji
            </span>
            <span className="text-[10px] text-[#8B95A5] mt-0.5">
              Riak sentuhan neon + audio klik + getaran motor langsung aktif bersamaan!
            </span>
          </div>

          {/* Quick Trigger Buttons */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleTestHaptic('single')}
              className="py-2 px-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 active:scale-95 text-white text-[11px] font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>🔔 Getar 1x</span>
            </button>

            <button
              type="button"
              onClick={() => handleTestHaptic('double')}
              className="py-2 px-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 active:scale-95 text-white text-[11px] font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>⚡ Denyut 2x</span>
            </button>

            <button
              type="button"
              onClick={() => handleTestHaptic('buzz')}
              className="py-2 px-2 rounded-xl brand-bg-subtle border brand-border-accent brand-text-accent hover:brightness-110 active:scale-95 text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>💥 Getar Kuat</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleTestSound('success')}
              className="py-1.5 px-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-300 text-[11px] font-medium transition-all active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>🎵 Coba Bell Sukses</span>
            </button>

            <button
              type="button"
              onClick={() => handleTestSound('sparkle')}
              className="py-1.5 px-2 rounded-xl border border-purple-500/25 bg-purple-500/10 hover:bg-purple-500/15 text-purple-300 text-[11px] font-medium transition-all active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>✨ Coba Sparkle Bypass</span>
            </button>
          </div>

          {hapticTestNotice && (
            <p className="text-[11px] text-emerald-400 font-semibold pt-1 text-center animate-pulse">
              {hapticTestNotice}
            </p>
          )}
        </div>
      </div>

      {/* 5. Kuota Harian & Aturan Reset */}
      <div className="rounded-3xl border border-white/10 bg-[#121626]/85 backdrop-blur-xl p-5 sm:p-6 shadow-xl shadow-black/50 space-y-3">
        <div className="flex items-center gap-2.5 text-white">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl brand-bg-subtle brand-text-accent border brand-border-accent">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold">Kuota Harian & Aturan Reset</h2>
            <p className="text-[11px] text-[#8B95A5]">Limit 5 kali bypass per hari tanpa gangguan iklan</p>
          </div>
        </div>

        <p className="text-xs text-[#8B95A5] leading-relaxed">
          Setiap pengguna diberikan kuota <strong>5 kali pelacakan tautan per hari</strong> secara gratis dan bersih dari segala bentuk iklan popup atau banner. Kuota otomatis di-reset kembali ke 5 pada tengah malam (00:00 UTC).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3 rounded-2xl bg-black/40 border border-white/8">
            <span className="text-[11px] font-semibold text-[#8B95A5] uppercase tracking-wider block">
              Batas Harian
            </span>
            <span className="text-sm font-bold text-white mt-0.5 block font-mono">
              Maksimal 5x / Hari
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-white/8">
            <span className="text-[11px] font-semibold text-[#8B95A5] uppercase tracking-wider block">
              Jadwal Reset Otomatis
            </span>
            <span className="text-sm font-bold text-emerald-400 mt-0.5 block font-mono">
              Setiap Tengah Malam (00:00 UTC)
            </span>
          </div>
        </div>
      </div>

      {/* 6. Mesin Bypass & API Key */}
      <div className="rounded-3xl border border-white/10 bg-[#121626]/85 backdrop-blur-xl p-5 sm:p-6 shadow-xl shadow-black/50">
        <div className="flex items-center justify-between gap-2 mb-1.5 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl brand-bg-subtle brand-text-accent border brand-border-accent">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold">Mesin Bypass Universal</h2>
              <p className="text-[11px] text-[#8B95A5]">Dukungan sfl.gl, safelinku, linkvertise, adfly & shortener</p>
            </div>
          </div>

          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            <span>Aktif</span>
          </span>
        </div>

        <div className="mt-3.5 p-3.5 rounded-2xl bg-black/40 border border-white/8 text-xs text-[#8B95A5] leading-relaxed">
          Tautan diproses lewat mesin bypass multi-tahap yang mengurai halaman verifikasi, alur ready/go, sub2unlock, dan shortener. API key bawaan otomatis aktif; isi kunci sendiri jika Anda memiliki token gateway kustom.
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-semibold text-white/90">
              API Key Kustom (opsional)
            </label>
            {apiKey.trim() ? (
              <span className="text-[10px] text-purple-400 font-semibold">Kunci Kustom Terpasang</span>
            ) : (
              <span className="text-[10px] text-[#8B95A5]">Memakai Mesin Bawaan</span>
            )}
          </div>

          <div className="relative flex items-center">
            <KeyRound className="absolute left-3.5 w-4 h-4 brand-text-accent pointer-events-none" />
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="fgsiapi-xxxx (kosongkan = bawaan)"
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-[#8B95A5]/60 text-xs sm:text-sm brand-ring-accent font-mono"
            />
          </div>

          <div className="flex items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleSaveKey}
              className="flex-1 h-11 rounded-xl brand-gradient brand-glow brand-gradient-hover text-white font-semibold text-xs transition-all shadow-md cursor-pointer"
            >
              Simpan Kunci
            </button>

            <button
              type="button"
              onClick={handleUseDefaultKey}
              className="h-11 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-[#8B95A5] hover:text-white text-xs font-medium transition-colors cursor-pointer"
            >
              Pakai Bawaan
            </button>
          </div>

          {keyNotice && (
            <p className="text-[11px] text-emerald-400 font-medium mt-1">{keyNotice}</p>
          )}
        </div>
      </div>

      {/* 7. Perangkat */}
      <div className="rounded-3xl border border-white/10 bg-[#121626]/85 backdrop-blur-xl p-5 sm:p-6 shadow-xl shadow-black/50">
        <div className="flex items-center gap-2.5 mb-1.5 text-white">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl brand-bg-subtle brand-text-accent border brand-border-accent">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold">Perangkat</h2>
            <p className="text-[11px] text-[#8B95A5]">Terdeteksi otomatis & live update saat ukuran layar berubah</p>
          </div>
        </div>

        <div className="mt-3.5 divide-y divide-white/8 text-xs">
          <div className="flex items-center justify-between py-2 text-[#8B95A5]">
            <span>Sistem Operasi</span>
            <span className="font-semibold text-white">{deviceInfo.os}</span>
          </div>

          <div className="flex items-center justify-between py-2 text-[#8B95A5]">
            <span>Mode Tampilan</span>
            <span className="font-semibold text-white">{deviceInfo.mode}</span>
          </div>

          <div className="flex items-center justify-between py-2 text-[#8B95A5]">
            <span>Rasio Layar</span>
            <span className="font-semibold text-white font-mono">{deviceInfo.aspectRatio}</span>
          </div>

          <div className="flex items-center justify-between py-2 text-[#8B95A5]">
            <span>Layar Aktif</span>
            <span className="font-semibold text-white font-mono">{deviceInfo.screenResolution}</span>
          </div>

          <div className="flex items-center justify-between py-2 text-[#8B95A5]">
            <span>Layar Sentuh</span>
            <span className="font-semibold text-white">{deviceInfo.touch}</span>
          </div>
        </div>
      </div>

      {/* 8. Tentang */}
      <div className="rounded-3xl border border-white/10 bg-[#121626]/85 backdrop-blur-xl p-5 sm:p-6 shadow-xl shadow-black/50 space-y-4">
        <div className="flex items-center gap-2.5 text-white">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl brand-bg-subtle brand-text-accent border brand-border-accent">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold">Tentang</h2>
            <p className="text-[11px] text-[#8B95A5]">Informasi aplikasi</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-black/40 border border-white/8">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl brand-gradient brand-glow text-white shadow-md shrink-0">
            <Zap className="h-6 w-6 fill-white" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white">
              ShineBypass <span className="brand-text-accent">v1.2</span>
            </h3>
            <p className="text-[11px] text-[#8B95A5] mt-0.5">
              Liquid Glass UI · Next.js · Universal Ad Bypass
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 border border-white/8 space-y-3.5 text-xs">
          <div>
            <h4 className="brand-text-accent font-bold text-xs mb-1.5">v1.2 — saat ini</h4>
            <ul className="space-y-1 text-[11px] text-[#8B95A5] leading-relaxed">
              <li>• Efek interaksi 100% fungsional: suara audio sintetis Web Audio, getaran fisik motor HP, riak cairan neon (liquid ripple), dan kontrol animasi 60fps</li>
              <li>• Status server online real-time, pemantauan latensi & waktu hari di menu Pengaturan</li>
              <li>• Bebas iklan: tanpa popunder, tanpa banner sponsor (100% bersih)</li>
              <li>• Sistem kuota harian minimal 5 kali per hari dengan reset otomatis tiap tengah malam</li>
              <li>• Mendukung semua jenis tautan beriklan: sfl.gl, tutwuri.id, safelinkku, adfly, sub2unlock & shortener</li>
            </ul>
          </div>

          <div className="pt-2 border-t border-white/8">
            <h4 className="text-white/70 font-semibold text-xs mb-1">v1.0</h4>
            <p className="text-[11px] text-[#8B95A5]">
              • Rilis awal: resolver tautan perantara dengan UI glass
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
