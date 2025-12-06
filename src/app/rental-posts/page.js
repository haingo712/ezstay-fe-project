'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { rentalPostService } from '@/services/rentalPostService';
import favoritePostService from '@/services/favoritePostService';
import { Building, Home, Calendar, Search, Filter, Heart, MapPin, Maximize2, DollarSign, User, Phone } from 'lucide-react';

export default function RentalPostsPage() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [favorites, setFavorites] = useState([]);
  const [favoriteLoading, setFavoriteLoading] = useState({});
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    loadPosts();
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadFavorites();
    } else {
      setFavorites([]);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    filterPosts();
  }, [searchTerm, statusFilter, posts]);

  const loadFavorites = async () => {
    try {
      const response = await favoritePostService.getMyFavorites();
      setFavorites(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Failed to load favorites:', error);
      setFavorites([]);
    }
  };

  const loadPosts = async () => {
    try {
      setLoading(true);

      // Use public API for guests, authenticated API for logged-in users
      let allPosts;
      if (isAuthenticated) {
        console.log('🔐 Loading posts with auth');
        allPosts = await rentalPostService.getAllForUser();
      } else {
        console.log('👤 Loading posts without auth (public)');
        allPosts = await rentalPostService.getAllPublic();
      }

      // Debug: Log để kiểm tra authorName
      console.log('📋 Posts loaded:', allPosts?.length || 0);
      if (allPosts && allPosts.length > 0) {
        console.log('📋 Sample post with author:', {
          id: allPosts[0].id,
          title: allPosts[0].title,
          authorId: allPosts[0].authorId,
          authorName: allPosts[0].authorName,
          houseName: allPosts[0].houseName,
          roomName: allPosts[0].roomName
        });
      }

      // Sort by newest first
      const sortedPosts = (allPosts || []).sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setPosts(sortedPosts);
      setFilteredPosts(sortedPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
      setPosts([]);
      setFilteredPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const filterPosts = () => {
    let filtered = [...posts];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.houseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.roomName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(post => {
        if (statusFilter === 'available') return post.isActive && post.isApproved === 1;
        if (statusFilter === 'pending') return post.isActive && post.isApproved === null;
        if (statusFilter === 'inactive') return !post.isActive || post.isApproved === 0;
        return true;
      });
    }

    setFilteredPosts(filtered);
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

  const handleToggleFavorite = async (postId, event) => {
    event.stopPropagation();

    if (!isAuthenticated) {
      toast.info(t('rentalPosts.loginToSave'));
      router.push('/login');
      return;
    }

    const currentFavorite = favorites.find((favorite) => favorite.postId === postId);

    try {
      setFavoriteLoading((prev) => ({ ...prev, [postId]: true }));

      if (currentFavorite) {
        await favoritePostService.removeFavorite(currentFavorite.id);
        setFavorites((prev) => prev.filter((favorite) => favorite.id !== currentFavorite.id));
        return;
      }

      const createdFavorite = await favoritePostService.addFavorite(postId);
      const favoriteRecord = createdFavorite?.id ? createdFavorite : { id: `${Date.now()}-${postId}`, postId };
      setFavorites((prev) => [...prev, favoriteRecord]);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      toast.error(t('rentalPosts.favoriteError'));
    } finally {
      setFavoriteLoading((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const isFavorited = (postId) => favoritePostService.isFavorited(postId, favorites);

  const handleViewDetails = (postId) => {
    router.push(`/rental-posts/${postId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">{t('rentalPosts.loading')}</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('rentalPosts.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {t('rentalPosts.subtitle')}
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8 border border-gray-200 dark:border-gray-700">
            <div className="w-full">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('rentalPosts.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Results count */}
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              {t('rentalPosts.showing')} {filteredPosts.length} {t('rentalPosts.of')} {posts.length} {t('rentalPosts.posts')}
            </div>
          </div>

          {/* Posts Grid */}
          {filteredPosts.length === 0 ? (
            <div className="text-center py-20">
              <Building className="w-20 h-20 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t('rentalPosts.noPosts')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || statusFilter !== 'all'
                  ? t('rentalPosts.adjustSearch')
                  : t('rentalPosts.noPostsDesc')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPosts.map((post) => {
                const status = getStatusBadge(post);
                const price = post.price || post.room?.price;
                const area = post.area || post.room?.area;

                return (
                  <div
                    key={post.id}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                    onClick={() => handleViewDetails(post.id)}
                  >
                    {/* Image */}
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={post.imageUrls?.[0] || "/image.png"}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />

                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      {/* Favorite button */}
                      <button
                        onClick={(event) => handleToggleFavorite(post.id, event)}
                        disabled={favoriteLoading[post.id]}
                        className="absolute top-3 left-3 p-2.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full shadow-lg transition-all hover:scale-110 hover:bg-white disabled:opacity-60"
                        title={isFavorited(post.id) ? t('rentalPosts.removeFromFavorites') : t('rentalPosts.addToFavorites')}
                      >
                        <Heart
                          className={`w-5 h-5 transition-colors ${isFavorited(post.id)
                            ? 'fill-red-500 text-red-500'
                            : 'text-gray-500 hover:text-red-400'
                            }`}
                        />
                      </button>

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
                          <span className="text-xs opacity-90">/{t('common.month')}</span>
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
                      <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                        {post.description}
                      </p>

                      {/* Property Info */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                          <Building className="w-4 h-4 mr-2 flex-shrink-0 text-purple-500" />
                          <span className="truncate font-medium">{post.houseName || t('rentalPosts.unknownHouse')}</span>
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                          <Home className="w-4 h-4 mr-2 flex-shrink-0 text-orange-500" />
                          <span className="truncate">{post.roomName || t('rentalPosts.allRooms')}</span>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                        {/* Author & Date */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                              {post.authorName ? post.authorName[0].toUpperCase() : 'U'}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                {post.authorName || t('rentalPosts.unknownAuthor')}
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
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
