import { Sparkles, ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-white/8 bg-[#07090D] py-12 text-[#8B95A5] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-white/8">
          <div className="space-y-2">
            <a
              href="/"
              className="flex items-center gap-2 text-sm font-bold text-[#F5F7FA] hover:opacity-90"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-violet-600 text-white">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <span>ShineBypass</span>
            </a>
            <p className="max-w-md text-xs text-[#8B95A5] leading-relaxed">
              Utilitas pelacak redirect dan halaman perantara yang aman. Memeriksa header HTTP, tag meta refresh, dan target tautan tanpa pelacakan data pribadi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs">
            <a href="/" className="hover:text-[#F5F7FA] transition-colors">
              Beranda
            </a>
            <a href="/history" className="hover:text-[#F5F7FA] transition-colors">
              Riwayat
            </a>
            <a href="/settings" className="hover:text-[#F5F7FA] transition-colors">
              Pengaturan
            </a>
            <a href="/about" className="hover:text-[#F5F7FA] transition-colors">
              Tentang & Legal
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#F5F7FA] transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-[11px] text-[#8B95A5]/80">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-400 shrink-0" />
            <span>
              Resolver etis: tidak mem-bypass CAPTCHA, autentikasi, paywall, atau jaringan privat.
            </span>
          </div>

          <div className="text-[11px] text-[#8B95A5]/60 flex items-center gap-1">
            <span>© {new Date().getFullYear()} ShineBypass. Terbuka dan ramah privasi.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
