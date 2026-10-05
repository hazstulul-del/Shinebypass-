import { ShieldCheck, Zap, Lock } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative pt-12 pb-8 sm:pt-20 sm:pb-12 text-center overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-tr from-blue-600/15 via-violet-600/15 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-[#8B95A5] mb-6 backdrop-blur-md">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Cepat</span>
          <span className="text-white/20">·</span>
          <span>Sederhana</span>
          <span className="text-white/20">·</span>
          <span>Aman & Ramah Privasi</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F5F7FA] [text-wrap:balance] leading-[1.15]">
          Lewati Pengalihan.{' '}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent">
            Temukan Tautan Asli.
          </span>
        </h1>

        <p className="mt-4 sm:mt-6 text-base sm:text-lg text-[#8B95A5] max-w-2xl mx-auto [text-wrap:balance] leading-relaxed">
          Buka tautan pendek, redirect perantara, dan interstitial page yang didukung untuk langsung mendapatkan URL tujuan asli. Dilengkapi proteksi SSRF dan pelacakan multi-hop transparan.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-[#8B95A5]">
          <div className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-blue-400" />
            <span>Resolusi multi-hop otomatis</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
            <span>Mesin aman dari ancaman SSRF</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-violet-400" />
            <span>Tanpa pelacakan cookie atau data pribadi</span>
          </div>
        </div>
      </div>
    </section>
  );
}
