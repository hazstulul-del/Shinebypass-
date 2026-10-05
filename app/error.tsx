'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error for debugging
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-xl font-bold mb-3 text-[#F5F7FA]">Something went wrong</h2>
      <p className="text-sm text-[#8B95A5] mb-6 max-w-md">
        {error?.message || 'An error occurred while loading this page.'}
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors cursor-pointer"
      >
        Try again
      </button>
    </div>
  );
}
