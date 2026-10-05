import { Check, X, ArrowUpRight } from 'lucide-react';

const SUPPORTED_FEATURES = [
  {
    title: 'HTTP 301 & 308 (Permanen)',
    description: 'Menelusuri pengalihan tingkat server ke URL kanonikal resmi.',
  },
  {
    title: 'HTTP 302, 303, & 307 (Sementara)',
    description: 'Mengikuti tautan pemendek URL dan redirect sementara hingga 10 lompatan.',
  },
  {
    title: 'HTML Meta Refresh',
    description: 'Mendeteksi halaman jeda yang menggunakan tag <meta http-equiv="refresh">.',
  },
  {
    title: 'Pengalihan JavaScript Sederhana',
    description: 'Memeriksa penugasan lokasi seperti window.location atau location.replace.',
  },
  {
    title: 'Parameter Query Target',
    description: 'Mengekstrak parameter tautan seperti url=, target=, dest=, dan Base64.',
  },
];

const PROHIBITED_SCOPE = [
  'Melewati verifikasi CAPTCHA, reCAPTCHA, atau Cloudflare Turnstile',
  'Membobol paywall konten berbayar atau batas artikel berlangganan',
  'Mencuri, memalsukan, atau menyuntikkan cookie autentikasi dan token login',
  'Menembus tantangan firewall anti-bot Cloudflare atau Akamai WAF',
  'Mengeksploitasi celah keamanan server atau mengakses intranet/IP privat',
];

export function SupportedRedirects() {
  return (
    <section className="py-16 sm:py-24 border-t border-white/8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F7FA]">
            Mekanisme yang Didukung & Batasan Etis
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#8B95A5]">
            ShineBypass adalah alat legal untuk memeriksa tautan web publik secara aman dan transparan.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="rounded-3xl border border-emerald-500/20 bg-[#0D1117]/80 backdrop-blur-xl p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-6 text-emerald-400">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold">
                ✓
              </span>
              <h3 className="text-lg font-semibold text-[#F5F7FA]">Didukung & Aman Digunakan</h3>
            </div>

            <ul className="space-y-4">
              {SUPPORTED_FEATURES.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#F5F7FA]">{item.title}</h4>
                    <p className="text-xs text-[#8B95A5] mt-0.5">{item.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#0D1117]/80 backdrop-blur-xl p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-6 text-red-400">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/20 text-xs font-bold">
                ✕
              </span>
              <h3 className="text-lg font-semibold text-[#F5F7FA]">Yang TIDAK Kami Bypass</h3>
            </div>

            <ul className="space-y-4">
              {PROHIBITED_SCOPE.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-400">
                    <X className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs sm:text-sm text-[#8B95A5] leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-6 pt-6 border-t border-white/8 text-xs text-[#8B95A5] flex items-center justify-between">
              <span>Ingin mempelajari kebijakan privasi kami?</span>
              <a
                href="#about"
                className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Buka halaman Tentang</span>
                <ArrowUpRight className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
