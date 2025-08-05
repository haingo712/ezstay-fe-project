'use client';

import Link from 'next/link';

import featuredPosts from '../sampleData/featuredPosts';

export default function FeaturedPosts() {
  return (
    <section className="py-12 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">Featured Posts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {featuredPosts.map(post => (
            <div key={post.id} className="bg-gray-50 dark:bg-gray-900 rounded-xl shadow hover:shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all">
              <img src={post.image} alt={post.title} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{post.title}</h3>
                <div className="text-blue-600 dark:text-blue-400 font-bold mb-1">{post.price}</div>
                <div className="text-gray-700 dark:text-gray-300 text-sm mb-4">{post.location}</div>
                <Link href={`/posts/${post.id}`} className="inline-block px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-sm font-medium">View Details</Link>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-8">
          <Link href="/rooms" className="inline-block px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-semibold text-base">See More</Link>
        </div>
      </div>
    </section>
  );
}
