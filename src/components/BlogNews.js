'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

import posts from '../sampleData/blogPosts';

export default function BlogNews() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatDate = (dateString) => {
    if (!mounted) return ''; // Return empty string during SSR
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  };

  return (
    <section className="py-12 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">Latest from our blog</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map(post => (
            <div key={post.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all flex flex-col">
              <img src={post.image} alt={post.title} className="w-full h-40 object-cover" />
              <div className="p-4 flex flex-col flex-1">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{formatDate(post.date)}</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{post.title}</h3>
                <p className="text-gray-700 dark:text-gray-300 flex-1">{post.excerpt}</p>
                <Link href={`/blog/${post.id}`} className="mt-4 inline-block text-blue-600 dark:text-blue-400 font-semibold hover:underline">Read more</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
