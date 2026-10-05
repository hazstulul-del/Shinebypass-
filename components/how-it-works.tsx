import { Shield, GitCommit, FileCode, CheckCircle } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    title: 'Validasi Sintaks & SSRF',
    description:
      'Memverifikasi integritas protokol (hanya HTTP/HTTPS) dan memeriksa DNS publik untuk memblokir alamat IP lokal, loopback, serta layanan metadata cloud.',
    icon: Shield,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  {
    number: '02',
    title: 'Pelacak HTTP Multi-Hop',
    description:
      'Menelusuri kode pengalihan HTTP (301, 302, 303, 307, 308) hingga 10 lompatan aman dengan perlindungan terhadap redirect loop dan timeout.',
    icon: GitCommit,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
  },
  {
    number: '03',
    title: 'Ekstraksi Meta & Skrip',
    description:
      'Menganalisis badan halaman untuk mendeteksi tag <meta http-equiv="refresh">, script pengalihan lokasi, serta parameter URL terenkode Base64.',
    icon: FileCode,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
  },
  {
    number: '04',
    title: 'Hasil URL Tujuan Bersih',
    description:
      'Menyajikan tautan tujuan akhir yang bersih, siap disalin atau dibuka dengan aman tanpa mengeksekusi pelacak pihak ketiga.',
    icon: CheckCircle,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 sm:py-24 border-t border-white/8 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F7FA]">
            Cara Kerja ShineBypass
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#8B95A5]">
            Mesin pelacak 4-tahap transparan yang dirancang untuk kecepatan, keamanan, dan privasi penuh.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative rounded-2xl border border-white/8 bg-[#0D1117]/60 backdrop-blur-xl p-6 transition-all duration-200 hover:border-white/15 hover:bg-[#0D1117]/80"
              >
                <div className="flex items-center justify-between mb-5">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${step.bg} ${step.color} border ${step.border}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-mono font-semibold text-[#8B95A5]/60">
                    {step.number}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-[#F5F7FA] mb-2">{step.title}</h3>
                <p className="text-xs sm:text-sm text-[#8B95A5] leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
