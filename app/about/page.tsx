import { Info, CheckCircle, AlertTriangle, EyeOff, Terminal } from 'lucide-react';

export const metadata = {
  title: 'Tentang & Kebijakan Etis — ShineBypass',
  description:
    'Pelajari tentang ShineBypass, cara kerja mesin pelacak redirect, dukungan mekanisme, privasi, serta batasan hukum etis.',
};

export default function AboutPage() {
  return (
    <div className="flex-1 py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-400 border border-blue-500/20">
            <Info className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F7FA]">
              Tentang ShineBypass
            </h1>
            <p className="text-xs sm:text-sm text-[#8B95A5] mt-0.5">
              Alat pelacak dan pembuka pengalihan tautan yang transparan, aman, dan bebas dari pelacak pihak ketiga.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/8 bg-[#0D1117]/80 backdrop-blur-xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-[#F5F7FA]">
            <Terminal className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold">Apa itu ShineBypass?</h2>
          </div>
          <p className="text-sm text-[#8B95A5] leading-relaxed">
            ShineBypass adalah utilitas full-stack modern yang dirancang untuk membuka dan menelusuri tautan pengalihan perantara, tautan pendek (shortened URLs), dan halaman transisi resmi sebelum pengguna sampai ke tujuan asli. Di era internet saat ini, banyak tautan melewati berbagai perantara analitik atau halaman penundaan yang membebani browser pengguna.
          </p>
          <p className="text-sm text-[#8B95A5] leading-relaxed">
            ShineBypass mengeksekusi proses penelusuran secara aman di sisi server (server-side), memungkinkan pengguna melihat alamat akhir yang bersih tanpa harus mengunduh iklan atau mengeksekusi pelacak pihak ketiga.
          </p>
        </div>

        <div className="rounded-3xl border border-white/8 bg-[#0D1117]/80 backdrop-blur-xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-[#F5F7FA]">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-semibold">Bagaimana Mesin Bekerja?</h2>
          </div>
          <p className="text-sm text-[#8B95A5] leading-relaxed">
            Saat Anda memasukkan tautan, ShineBypass menjalankan alur kerja bertahap:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/8">
              <span className="text-xs font-mono font-bold text-blue-400 block mb-1">
                Tahap 1: Perlindungan SSRF
              </span>
              <p className="text-xs text-[#8B95A5] leading-relaxed">
                Menolak protokol terlarang, memvalidasi rentang IP privat IPv4/IPv6, dan memeriksa DNS publik sebelum koneksi dibuka.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/8">
              <span className="text-xs font-mono font-bold text-indigo-400 block mb-1">
                Tahap 2: Penelusur Status HTTP
              </span>
              <p className="text-xs text-[#8B95A5] leading-relaxed">
                Melangkah manual melewati kode 301, 302, 303, 307, dan 308 dengan pencatatan jejak (hop trace) dan pembatasan siklus tak terbatas.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/8">
              <span className="text-xs font-mono font-bold text-violet-400 block mb-1">
                Tahap 3: Pemindaian Meta & Skrip
              </span>
              <p className="text-xs text-[#8B95A5] leading-relaxed">
                Memindai header HTML untuk tag &lt;meta http-equiv=&quot;refresh&quot;&gt; serta script lokasi JavaScript sederhana.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/8">
              <span className="text-xs font-mono font-bold text-amber-400 block mb-1">
                Tahap 4: Decoding Parameter
              </span>
              <p className="text-xs text-[#8B95A5] leading-relaxed">
                Membongkar argumen query seperti ?url=, ?target=, ?dest=, hingga muatan terenkode Base64 untuk menemukan alamat asli.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/8 bg-[#0D1117]/80 backdrop-blur-xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-[#F5F7FA]">
            <EyeOff className="w-5 h-5 text-violet-400" />
            <h2 className="text-lg font-semibold">Komitmen Privasi</h2>
          </div>
          <p className="text-sm text-[#8B95A5] leading-relaxed">
            Riwayat pencarian tautan Anda disimpan secara eksklusif di memori lokal peramban Anda (<code className="text-xs bg-white/5 px-1.5 py-0.5 rounded text-white font-mono">localStorage</code>). ShineBypass tidak mengumpulkan basis data profil pengguna, tidak memantau aktivitas pribadi, dan tidak membagikan data kepada pihak ketiga manapun.
          </p>
        </div>

        <div className="rounded-3xl border border-red-500/20 bg-red-950/10 backdrop-blur-xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-5 h-5" />
            <h2 className="text-lg font-semibold text-[#F5F7FA]">Batasan Etis & Kepatuhan Hukum</h2>
          </div>
          <p className="text-sm text-[#8B95A5] leading-relaxed">
            ShineBypass beroperasi murni sebagai unshortener dan redirect resolver yang sah. Layanan ini <strong className="text-white">TIDAK</strong> dan <strong className="text-white">TIDAK AKAN PERNAH</strong>:
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-[#8B95A5] list-disc list-inside">
            <li>Melewati atau menyelesaikan teka-teki CAPTCHA, reCAPTCHA, atau Cloudflare Turnstile.</li>
            <li>Membobol paywall atau pembatasan artikel berita/konten berbayar.</li>
            <li>Memalsukan, mencuri, menyuntikkan, atau membajak cookie autentikasi dan token sesi login.</li>
            <li>Melewati firewall penangkal bot Cloudflare atau sistem keamanan WAF.</li>
            <li>Mengeksploitasi celah keamanan server atau meretas jaringan intranet privat.</li>
          </ul>
          <p className="text-xs text-[#8B95A5]/80 pt-2 border-t border-red-500/20 leading-relaxed">
            <strong>Penafian (Disclaimer):</strong> ShineBypass hanya memproses URL publik yang sah dan dapat diakses oleh browser umum. Pengguna bertanggung jawab penuh atas tautan yang dimasukkan untuk dilacak.
          </p>
        </div>
      </div>
    </div>
  );
}
