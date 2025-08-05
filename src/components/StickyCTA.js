'use client';

import Link from 'next/link';

export default function StickyCTA() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Link
        href="/register"
        className="flex items-center gap-2 px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-700 dark:hover:bg-blue-600 font-semibold text-base transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 animate-bounce"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        AI Assistant
      </Link>
    </div>
  );
}
