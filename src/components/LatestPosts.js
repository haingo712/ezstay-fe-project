'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { rentalPostService } from '@/services/rentalPostService';
import { useGuestRedirect } from '@/hooks/useGuestRedirect';
import { Building, Home, MapPin, Calendar } from 'lucide-react';

export default function LatestPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isGuest, isAuthenticated, loading: authLoading } = useGuestRedirect();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth to finish loading before fetching
    if (!authLoading) {
      loadLatestPosts();
    }
  }, [authLoading, isAuthenticated]); // Re-load when auth state changes

  const loadLatestPosts = async () => {
    try {
      setLoading(true);
      // Use public API for guest access (no auth required)
      const allPosts = !isAuthenticated 
        ? await rentalPostService.getAllPublic()
        : await rentalPostService.getAllForUser();
      console.log('📦 All posts loaded:', allPosts);
      
      // Get 9 latest posts (sort by createdAt desc)
      const sortedPosts = (allPosts || [])
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 9);
      setPosts(sortedPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
      setPosts([]);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (post) => {
    if (!post.isActive) return { text: 'Inactive', class: 'bg-gray-100 text-gray-800' };
    if (post.isApproved === null) return { text: 'Pending', class: 'bg-yellow-100 text-yellow-800' };
    if (post.isApproved === 0) return { text: 'Rejected', class: 'bg-red-100 text-red-800' };
    return { text: 'Available', class: 'bg-green-100 text-green-800' };
  };

  if (loading) {
    return (
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading latest posts...</p>
          </div>
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return (
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Latest Rental Posts
          </h2>
          <div className="text-center py-12">
            <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">No posts available yet</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Latest Rental Posts
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Discover the newest boarding houses available for rent
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {posts.map((post) => {
            const status = getStatusBadge(post);
            return (
              <Link
                key={post.id}
                href={`/rental-posts/${post.id}`}
                onClick={(e) => handlePostClick(e, post.id)}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105 block"
              >
                {/* Image */}
                <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
                  {post.imageUrls && post.imageUrls.length > 0 ? (
                    <img
                      src={post.imageUrls[0]}
                      alt={post.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to placeholder on error
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg></div>';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building className="w-16 h-16 text-white" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.class}`}>
                      {status.text}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
                    {post.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                    {post.description}
                  </p>

                  {/* Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                      <Building className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{post.houseName || 'Unknown House'}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                      <Home className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{post.roomName || 'Unknown Room'}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                      <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                  </div>

                  {/* Author */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                        {post.authorName ? post.authorName[0].toUpperCase() : 'A'}
                      </div>
                      <div className="ml-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {post.authorName || 'Anonymous'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          📞 {post.contactPhone}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* View More Button */}
        <div className="text-center">
          <Link
            href="/rental-posts"
            onClick={handleViewAllClick}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <span>View All Posts</span>
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
