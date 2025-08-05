'use client';

export default function Stats() {
  return (
    <div className="bg-gray-100 dark:bg-[#1a2634] text-black dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-3 text-center">
          <div className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 transform hover:-translate-y-1 transition-all duration-300">
            <span className="block text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">100K+</span>
            <span className="block text-lg text-gray-700 dark:text-gray-300">Active Users</span>
          </div>
          <div className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 transform hover:-translate-y-1 transition-all duration-300">
            <span className="block text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">10K</span>
            <span className="block text-lg text-gray-700 dark:text-gray-300">Daily Transactions</span>
          </div>
          <div className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 transform hover:-translate-y-1 transition-all duration-300">
            <span className="block text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">24/7</span>
            <span className="block text-lg text-gray-700 dark:text-gray-300">Support</span>
          </div>
        </div>
      </div>
    </div>
  );
}
