'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import favoritePostService from '@/services/favoritePostService';
import { rentalPostService } from '@/services/rentalPostService';
import { Building, Calendar, Heart, Home, Trash2 } from 'lucide-react';

const formatDate = (value) =>
  new Date(value).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const getStatusBadge = (post) => {
  if (!post?.isActive) return { text: 'Inactive', className: 'bg-gray-100 text-gray-800' };
  if (post?.isApproved === null) return { text: 'Pending', className: 'bg-yellow-100 text-yellow-800' };
  if (post?.isApproved === 0) return { text: 'Rejected', className: 'bg-red-100 text-red-800' };
  return { text: 'Available', className: 'bg-green-100 text-green-800' };
};

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  // Map để lưu postId -> favoriteId cho việc xóa nhanh
  const [postToFavoriteMap, setPostToFavoriteMap] = useState({});
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const run = async () => {
      try {
        setLoading(true);
        const favoriteList = await favoritePostService.getMyFavorites();
        console.log('📋 Raw Favorites from API:', favoriteList);
        console.log('📋 Favorites array length:', favoriteList?.length);
        
        const normalizedFavorites = Array.isArray(favoriteList) ? favoriteList : [];
        setFavorites(normalizedFavorites);
        
        // Tạo map postId -> favoriteId để dễ dàng tìm favoriteId khi xóa
        const map = {};
        normalizedFavorites.forEach(fav => {
          if (fav.postId && fav.id) {
            map[fav.postId] = fav.id;
          }
        });
        setPostToFavoriteMap(map);
        console.log('🗺️ Post to Favorite map:', map);
        
        console.log('📋 Normalized favorites:', normalizedFavorites);
        normalizedFavorites.forEach((fav, idx) => {
          console.log(`  [${idx}] id=${fav?.id}, postId=${fav?.postId}, accountId=${fav?.accountId}`);
        });

        if (normalizedFavorites.length > 0) {
          console.log('✅ Sample favorite item:', normalizedFavorites[0]);
          const postRequests = normalizedFavorites.map((item) => {
            console.log(`🔄 Fetching post for postId: ${item.postId}`);
            return rentalPostService.getById(item.postId).catch((err) => {
              console.error(`❌ Failed to fetch post ${item.postId}:`, err);
              return null;
            });
          });
          const resolvedPosts = (await Promise.all(postRequests)).filter(Boolean);
          console.log('📋 Resolved posts:', resolvedPosts);
          resolvedPosts.forEach((post, idx) => {
            console.log(`  Post[${idx}]: id=${post?.id}, title=${post?.title}`);
          });
          setPosts(resolvedPosts);
        } else {
          setPosts([]);
        }
      } catch (error) {
        console.error('Failed to load favorite posts:', error);
        setFavorites([]);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [isAuthenticated, authLoading, router]);

  const handleRemoveFavorite = async (favoriteId, postId) => {
    console.log('🗑️ Removing favorite:', { favoriteId, postId, type: typeof favoriteId });
    
    // Nếu favoriteId undefined, thử tìm trong map
    let actualFavoriteId = favoriteId;
    if (!actualFavoriteId && postId) {
      // Chuẩn hóa postId về lowercase để tìm trong map
      const postIdNormalized = postId?.toString().toLowerCase();
      actualFavoriteId = postToFavoriteMap[postIdNormalized];
      console.log(`🔍 Looking for postId: ${postIdNormalized}, found favoriteId: ${actualFavoriteId}`);
    }
    
    if (!actualFavoriteId) {
      console.error('❌ favoriteId is undefined or null!');
      console.error('postId:', postId);
      console.error('All favorites:', favorites);
      console.error('Post to Favorite map:', postToFavoriteMap);
      const favorite = favorites.find((item) => item.postId?.toLowerCase() === postId?.toLowerCase());
      console.error('Found favorite for postId:', favorite);
      if (favorite?.id) {
        actualFavoriteId = favorite.id;
        console.log('✅ Found favoriteId from favorites array:', actualFavoriteId);
      } else {
        alert('Lỗi: Không tìm thấy ID yêu thích. Vui lòng thử tải lại trang.');
        return;
      }
    }
    
    try {
      console.log('🗑️ Calling removeFavorite with favoriteId:', actualFavoriteId);
      await favoritePostService.removeFavorite(actualFavoriteId);
      
      // Xóa khỏi state
      setFavorites((prev) => prev.filter((item) => item.id !== actualFavoriteId));
      setPosts((prev) => prev.filter((post) => {
        const postIdNormalized = post.id?.toString().toLowerCase();
        const targetPostIdNormalized = postId?.toString().toLowerCase();
        return postIdNormalized !== targetPostIdNormalized;
      }));
      
      // Xóa khỏi map
      setPostToFavoriteMap((prev) => {
        const newMap = { ...prev };
        const postIdNormalized = postId?.toString().toLowerCase();
        delete newMap[postIdNormalized];
        return newMap;
      });
      
      console.log('✅ Removed successfully');
    } catch (error) {
      console.error('❌ Failed to remove favorite:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert(`Không thể xóa yêu thích. ${error.response?.data?.message || error.message}`);
    }
  };

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
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">{t('favorites.loading')}</p>
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
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Heart className="w-12 h-12 text-red-500 fill-red-500" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
              {t('favorites.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {posts.length > 0
                ? t('favorites.subtitle').replace('{count}', posts.length)
                : t('favorites.emptySubtitle')}
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-20">
              <Heart className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t('favorites.emptyDescription')}
              </p>
              <button
                onClick={() => router.push('/rental-posts')}
                className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
              >
                {t('favorites.explore')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => {
                // Chuẩn hóa postId về lowercase để so sánh
                const postIdNormalized = post.id?.toString().toLowerCase();
                console.log('🔍 Looking for favorite with postId:', postIdNormalized);
                console.log('🔍 Available favorites:', favorites);
                
                const favorite = favorites.find((item) => {
                  const itemPostIdNormalized = item.postId?.toString().toLowerCase();
                  console.log(`  Comparing: item.postId=${itemPostIdNormalized} vs post.id=${postIdNormalized}`);
                  return itemPostIdNormalized === postIdNormalized;
                });
                
                const status = getStatusBadge(post);
                
                console.log('🔍 Rendering post:', { 
                  postId: postIdNormalized, 
                  favoriteId: favorite?.id,
                  favoriteFound: !!favorite,
                  favorite: favorite 
                });

                return (
                  <div
                    key={post.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    <div
                      className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 cursor-pointer"
                      onClick={() => handleViewDetails(post.id)}
                    >
                      <img
                        src="/image.png"
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />

                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          // Truyền cả favoriteId và postIdNormalized
                          handleRemoveFavorite(favorite?.id, postIdNormalized);
                        }}
                        className="absolute top-4 left-4 p-2 bg-white dark:bg-gray-900/80 rounded-full shadow-lg hover:scale-110 transition-transform"
                        title={t('favorites.removeFromFavorites')}
                      >
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </button>

                      <div className="absolute top-4 right-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.className}`}>
                          {status.text}
                        </span>
                      </div>
                    </div>

                    <div
                      className="p-6 cursor-pointer"
                      onClick={() => handleViewDetails(post.id)}
                    >
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                        {post.description}
                      </p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                          <Building className="w-4 h-4 mr-2" />
                          <span className="truncate">{post.houseName || t('favorites.notUpdated')}</span>
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                          <Home className="w-4 h-4 mr-2" />
                          <span className="truncate">{post.roomName || t('favorites.notUpdated')}</span>
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{formatDate(post.createdAt)}</span>
                        </div>
                      </div>

                      <div className="flex items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                          {post.authorName ? post.authorName[0].toUpperCase() : '?'}
                        </div>
                        <div className="ml-3 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            👤 {post.authorName || t('favorites.unknownAuthor')}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            📞 {post.contactPhone || t('favorites.noPhone')}
                          </p>
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
