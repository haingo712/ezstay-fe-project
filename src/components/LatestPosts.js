'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { rentalPostService } from '@/services/rentalPostService';
import { useGuestRedirect } from '@/hooks/useGuestRedirect';
import { Building, Home, MapPin, Calendar, Maximize2, Eye, Users, Phone } from 'lucide-react';

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
      
      let allPosts = [];
      
      // If authenticated, use the authenticated API (with token)
      // If guest, try public API first, then fall back to empty
      if (isAuthenticated) {
        console.log('🔐 User authenticated, using getAllForUser()');
        allPosts = await rentalPostService.getAllForUser();
      } else {
        console.log('👤 Guest user, trying getAllPublic()');
        allPosts = await rentalPostService.getAllPublic();
      }
      
      console.log('📦 All posts loaded:', allPosts?.length || 0);
      
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
    // Guest can view rental post detail - no redirect needed
    // Just let them navigate to the detail page
  };

  const handleViewAllClick = (e) => {
    // Guest can view all rental posts - no redirect needed
    // Just let them navigate to the rental-posts page
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
            const price = post.price || post.room?.price;
            const area = post.area || post.room?.area;
            
            // Get location info
            const location = post.boardingHouse?.location || post.location;
            const fullAddress = location ? 
              [location.address, location.wardName, location.districtName, location.provinceName]
                .filter(Boolean).join(', ') : '';
            
            // View count
            const viewCount = post.viewCount || 0;
            
            // Rental rate calculation
            const totalRooms = post.boardingHouse?.totalRooms || post.totalRooms || 0;
            const rentedRooms = post.boardingHouse?.rentedRooms || post.rentedRooms || 0;
            const rentalRate = totalRooms > 0 ? Math.round((rentedRooms / totalRooms) * 100) : 0;

            return (
              <Link
                key={post.id}
                href={`/rental-posts/${post.id}`}
                onClick={(e) => handlePostClick(e, post.id)}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 block group"
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  {post.imageUrls && post.imageUrls.length > 0 ? (
                    <img
                      src={post.imageUrls[0]}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600"><svg class="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg></div>';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                      <Building className="w-16 h-16 text-white" />
                    </div>
                  )}
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Status badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg ${status.class}`}>
                      {status.text}
                    </span>
                  </div>

                  {/* Price tag */}
                  {price && (
                    <div className="absolute bottom-3 left-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl shadow-lg">
                      <span className="font-bold text-lg">{price.toLocaleString('vi-VN')}đ</span>
                      <span className="text-xs opacity-90">/tháng</span>
                    </div>
                  )}

                  {/* Area tag */}
                  {area && (
                    <div className="absolute bottom-3 right-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-800 dark:text-white px-3 py-2 rounded-xl shadow-lg flex items-center gap-1.5">
                      <Maximize2 className="w-4 h-4 text-blue-500" />
                      <span className="font-semibold text-sm">{area} m²</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {post.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                    {post.description}
                  </p>

                  {/* Property Info */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                      <Building className="w-4 h-4 mr-2 flex-shrink-0 text-purple-500" />
                      <span className="truncate font-medium">{post.houseName || 'Unknown House'}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                      <Home className="w-4 h-4 mr-2 flex-shrink-0 text-orange-500" />
                      <span className="truncate">{post.roomName || 'All rooms'}</span>
                    </div>
                  </div>

                  {/* Full Address */}
                  {fullAddress && (
                    <div className="flex items-start text-gray-600 dark:text-gray-400 text-sm mb-3">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0 text-red-500 mt-0.5" />
                      <span className="line-clamp-2">{fullAddress}</span>
                    </div>
                  )}

                  {/* Stats: View Count & Rental Rate */}
                  <div className="flex items-center gap-4 mb-4 py-2 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    {/* View Count */}
                    <div className="flex items-center gap-1.5 text-sm">
                      <Eye className="w-4 h-4 text-blue-500" />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{viewCount}</span>
                      <span className="text-gray-500 dark:text-gray-400 text-xs">lượt xem</span>
                    </div>

                    <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>

                    {/* Rental Rate */}
                    <div className="flex items-center gap-1.5 text-sm">
                      <Users className="w-4 h-4 text-green-500" />
                      <span className={`font-medium ${
                        rentalRate >= 80 ? 'text-red-600 dark:text-red-400' : 
                        rentalRate >= 50 ? 'text-orange-600 dark:text-orange-400' : 
                        'text-green-600 dark:text-green-400'
                      }`}>
                        {rentalRate}%
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 text-xs">đã thuê</span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                    {/* Author & Date */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                          {post.authorName ? post.authorName[0].toUpperCase() : 'E'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {post.authorName || 'Ezstay'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(post.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Phone icon */}
                      {post.contactPhone && (
                        <div className="flex-shrink-0 p-2 bg-green-50 dark:bg-green-900/30 rounded-full" title={post.contactPhone}>
                          <Phone className="w-4 h-4 text-green-600" />
                        </div>
                      )}
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
