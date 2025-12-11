'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { rentalPostService } from '@/services/rentalPostService';
import { useGuestRedirect } from '@/hooks/useGuestRedirect';

export default function FeaturedPosts() {
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isGuest } = useGuestRedirect();
  const router = useRouter();

  useEffect(() => {
    loadFeaturedPosts();
  }, []);

  const loadFeaturedPosts = async () => {
    try {
      const allPosts = await rentalPostService.getAllForUser();
      // Get first 6 active and approved posts
      const featured = allPosts
        .filter(post => post.isActive && post.isApproved === 1)
        .slice(0, 6);
      setFeaturedPosts(featured);
    } catch (error) {
      console.error('Error loading featured posts:', error);
      setFeaturedPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePostClick = (e, postId) => {
    if (isGuest) {
      e.preventDefault();
      router.push(`/login?returnUrl=${encodeURIComponent(`/rental-posts/${postId}`)}`);
    }
  };

  const handleViewAllClick = (e) => {
    if (isGuest) {
      e.preventDefault();
      router.push(`/login?returnUrl=${encodeURIComponent('/rental-posts')}`);
    }
  };

  const formatPrice = (price) => {
    if (!price) return 'Contact for price';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (loading) {
    return (
      <section className="py-12 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading featured posts...</p>
          </div>
        </div>
      </section>
    );
  }

  if (featuredPosts.length === 0) {
    return null; // Don't render section if no posts
  }

  return (
    <section className="py-12 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Featured Posts
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Latest rental posts from our community
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredPosts.map(post => (
            <div key={post.id} className="bg-gray-50 dark:bg-gray-900 rounded-xl shadow hover:shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all flex flex-col h-full">
              <div className="relative">
                <img
                  src={post.imageUrls?.[0] || '/placeholder-room.jpg'}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    Available
                  </span>
                </div>
              </div>

              <div className="p-4 flex flex-col flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {post.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">
                  {post.description}
                </p>

                <div className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                  🏠 {post.houseName || 'N/A'}{post.roomName && post.roomName !== 'All rooms' && post.roomName !== 'AllRRoom' && ` - ${post.roomName}`}
                </div>

                <div className="flex-1"></div>

                <div className="mt-auto">
                  <div className="text-blue-600 dark:text-blue-400 font-bold text-xl mb-2">
                    {formatPrice(post.price)}
                  </div>

                  <div className="text-gray-500 dark:text-gray-400 text-xs mb-4">
                    By {post.authorName || 'Unknown'} • {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                  </div>

                  <Link
                    href={`/rental-posts/${post.id}`}
                    onClick={(e) => handlePostClick(e, post.id)}
                    className="inline-block w-full text-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-sm font-medium"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-8">
          <Link
            href="/rental-posts"
            onClick={handleViewAllClick}
            className="inline-block px-8 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-semibold text-base"
          >
            View All Posts
          </Link>
        </div>
      </div>
    </section>
  );
}
