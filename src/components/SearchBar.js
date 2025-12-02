'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';

const sampleLocations = [
  'Hanoi',
  'Ho Chi Minh City',
  'Da Nang',
  'Hue',
  'Can Tho',
  'Hai Phong',
  'Nha Trang',
  'Vung Tau'
];

export default function SearchBar() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Build search URL with parameters
    const params = new URLSearchParams();
    if (keyword) params.set('q', keyword);
    if (location) params.set('location', location);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);

    const searchURL = params.toString() ? `/rental-posts?${params.toString()}` : '/rental-posts';
    
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      router.push(`/login?returnUrl=${encodeURIComponent(searchURL)}`);
      return;
    }

    router.push(searchURL);
  };

  const handleQuickSearch = (searchLocation) => {
    const searchURL = `/rental-posts?location=${encodeURIComponent(searchLocation)}`;
    if (!isAuthenticated) {
      router.push(`/login?returnUrl=${encodeURIComponent(searchURL)}`);
      return;
    }
    router.push(searchURL);
  };

  return (
    <section className="bg-white dark:bg-gray-800 py-8 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('searchBar.title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('searchBar.subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            {/* Keyword Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('searchBar.keyword')}
              </label>
              <input
                type="text"
                placeholder={t('searchBar.keywordPlaceholder')}
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('searchBar.location')}
              </label>
              <select
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t('searchBar.allAreas')}</option>
                {sampleLocations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('searchBar.priceRange')} (USD)
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder={t('searchBar.minPrice')}
                  value={minPrice}
                  onChange={e => setMinPrice(e.target.value)}
                  className="w-full px-3 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder={t('searchBar.maxPrice')}
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Search Button */}
            <div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-700 dark:hover:bg-blue-600 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                </svg>
                {t('searchBar.searchButton')}
              </button>
            </div>
          </div>
        </form>

        {/* Quick Search Buttons */}
        <div className="mt-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 text-center">
            {t('searchBar.quickSearch')}:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {['District 1', 'District 7', 'Thu Duc City', 'Binh Thanh District', 'Go Vap District'].map(area => (
              <button
                key={area}
                onClick={() => handleQuickSearch(area)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {area}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
