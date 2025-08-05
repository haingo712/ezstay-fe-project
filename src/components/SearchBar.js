'use client';

import { useState } from 'react';

export default function SearchBar() {
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [roomType, setRoomType] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // For now, just alert. Later, integrate with search API
    alert(`Search: Location: ${location}, Price: ${price}, Room type: ${roomType}`);
  };

  return (
    <section className="bg-white dark:bg-gray-800 py-6 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-3xl mx-auto px-4">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-center justify-center">
          <input
            type="text"
            placeholder="Location (e.g. District 9, Thu Duc...)"
            value={location}
            onChange={e => setLocation(e.target.value)}
            className="w-full md:w-[320px] lg:w-[400px] px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={price}
            onChange={e => setPrice(e.target.value)}
            className="w-full md:w-[150px] px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Price range</option>
            <option value="<2m">Under 2 million</option>
            <option value="2-3m">2 - 3 million</option>
            <option value="3-5m">3 - 5 million</option>
            <option value=">5m">Above 5 million</option>
          </select>
          <select
            value={roomType}
            onChange={e => setRoomType(e.target.value)}
            className="w-full md:w-[150px] px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Room type</option>
            <option value="boarding">Boarding room</option>
            <option value="apartment">Mini apartment</option>
            <option value="whole-house">Whole house</option>
          </select>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-700 dark:hover:bg-blue-600 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
            </svg>
            Search
          </button>
        </form>
      </div>
    </section>
  );
}
