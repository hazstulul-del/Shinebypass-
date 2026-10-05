import { History } from 'lucide-react';
import { HistoryList } from '../../components/history-list';

export const metadata = {
  title: 'History — ShineBypass',
  description: 'View and manage recently resolved link redirects stored securely in your browser.',
};

export default function HistoryPage() {
  return (
    <div className="flex-1 py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-400 border border-blue-500/20">
            <History className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F7FA]">
              Resolution History
            </h1>
            <p className="text-xs sm:text-sm text-[#8B95A5] mt-0.5">
              Locally stored audit trail of your recently unshortened and bypassed URLs.
            </p>
          </div>
        </div>

        <HistoryList />
      </div>
    </div>
  );
}
