import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 mb-4 text-blue-400">
        <Sparkles className="h-7 w-7" />
      </div>
      <h1 className="text-2xl font-bold text-[#F5F7FA]">404 — Page Not Found</h1>
      <p className="mt-2 text-sm text-[#8B95A5] max-w-sm">
        The destination you are looking for does not exist or has been relocated.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Resolver</span>
      </Link>
    </div>
  );
}
