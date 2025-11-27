'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import rentalPostService from '@/services/rentalPostService';
import reviewService from '@/services/reviewService';
import boardingHouseService from '@/services/boardingHouseService';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Calendar, 
  User, 
  Star,
  ArrowLeft,
  MessageSquare,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatDialog from '@/components/ChatDialog';
import Image from 'next/image';

export default function RentalPostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id;
  const { isAuthenticated, user } = useAuth();

  const [post, setPost] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showChatDialog, setShowChatDialog] = useState(false);
  const [groupByRoom, setGroupByRoom] = useState(false);
  const [userNames, setUserNames] = useState({});
  const [houseLocation, setHouseLocation] = useState(null);

  useEffect(() => {
    if (postId) {
      loadPost();
    }
  }, [postId]);

  const loadPost = async () => {
    try {
      setLoading(true);
      const postData = await rentalPostService.getPostById(postId);
      console.log('📋 Post detail:', postData);
      
      setPost(postData);
      
      // Fetch boarding house location if boardingHouseId exists
      if (postData.boardingHouseId) {
        fetchHouseLocation(postData.boardingHouseId);
      }
      
      // BE RentalPostsAPI returns reviews in post.Reviews (already normalized to camelCase)
      const reviewsData = postData.reviews || [];
      console.log('📝 Reviews from BE:', reviewsData);
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      
      // Fetch userNames for all reviews
      if (Array.isArray(reviewsData) && reviewsData.length > 0) {
        fetchUserNames(reviewsData);
      }
    } catch (error) {
      console.error('❌ Error loading post:', error);
      alert('Failed to load post details');
    } finally {
      setLoading(false);
    }
  };

  // Fetch boarding house location from BoardingHouse API
  const fetchHouseLocation = async (boardingHouseId) => {
    try {
      console.log('🏠 Fetching boarding house location:', boardingHouseId);
      const houseData = await boardingHouseService.getById(boardingHouseId);
      console.log('✅ House data:', houseData);
      
      // Extract location data
      const location = houseData?.location || houseData?.Location;
      if (location) {
        setHouseLocation({
          fullAddress: location.fullAddress || location.FullAddress || '',
          provinceName: location.provinceName || location.ProvinceName || '',
          communeName: location.communeName || location.CommuneName || '',
          addressDetail: location.addressDetail || location.AddressDetail || ''
        });
        console.log('✅ Location loaded:', location);
      }
    } catch (error) {
      console.error('❌ Error fetching house location:', error);
    }
  };

  // Fetch user names from Account API
  const fetchUserNames = async (reviewsList) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const uniqueUserIds = [...new Set(reviewsList.map(r => r.userId))];
      const namesMap = {};

      await Promise.all(
        uniqueUserIds.map(async (userId) => {
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/Accounts/${userId}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
              const userData = await response.json();
              namesMap[userId] = userData?.fullName || userData?.FullName || 'Unknown User';
            } else {
              namesMap[userId] = 'Unknown User';
            }
          } catch (err) {
            namesMap[userId] = 'Unknown User';
          }
        })
      );

      setUserNames(namesMap);
      console.log('✅ User names loaded:', namesMap);
    } catch (error) {
      console.error('❌ Error loading user names:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      0: { label: 'Available', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      1: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      2: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle },
      3: { label: 'Inactive', color: 'bg-gray-100 text-gray-800', icon: XCircle },
    };

    const config = statusConfig[status] || statusConfig[1];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="h-4 w-4" />
        {config.label}
      </span>
    );
  };

  const StarRating = ({ rating }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  // Group reviews by roomId
  const groupReviewsByRoom = () => {
    if (reviews.length === 0) return {};
    
    const grouped = reviews.reduce((acc, review) => {
      const roomId = review.roomId || 'unknown';
      if (!acc[roomId]) {
        acc[roomId] = [];
      }
      acc[roomId].push(review);
      return acc;
    }, {});
    
    return grouped;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading post details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Post Not Found
            </h3>
            <button
              onClick={() => router.back()}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Posts
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Post Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              {/* Images Gallery */}
              {post.imageUrls && post.imageUrls.length > 0 ? (
                <div className="mb-6">
                  {/* Main Image */}
                  <div className="relative h-64 md:h-96 rounded-lg overflow-hidden mb-4">
                    <Image
                      src={post.imageUrls[0]}
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      {getStatusBadge(post.postStatus)}
                    </div>
                  </div>
                  
                  {/* Thumbnail Images */}
                  {post.imageUrls.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {post.imageUrls.slice(1).map((imageUrl, index) => (
                        <div key={index} className="relative h-20 rounded-lg overflow-hidden">
                          <Image
                            src={imageUrl}
                            alt={`${post.title} - Image ${index + 2}`}
                            fill
                            className="object-cover hover:scale-110 transition-transform cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative h-64 md:h-96 rounded-lg overflow-hidden mb-6 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <Building2 className="h-20 w-20 text-gray-400" />
                  <div className="absolute top-4 right-4">
                    {getStatusBadge(post.postStatus)}
                  </div>
                </div>
              )}

              {/* Title & Info */}
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {post.title}
              </h1>

              {/* Address highlight */}
              {houseLocation && houseLocation.fullAddress && (
                <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        📍 Location
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white text-base">
                        {houseLocation.fullAddress}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 mb-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {post.authorName || 'Unknown'}
                </div>
              </div>

              {/* Description */}
              <div className="prose dark:prose-invert max-w-none">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Description
                </h2>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {post.description}
                </p>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="h-7 w-7 text-blue-600" />
                  Room Reviews
                </h2>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 px-4 py-2 rounded-lg">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-xl font-bold text-gray-900 dark:text-white">
                        {calculateAverageRating()}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        ({reviews.length})
                      </span>
                    </div>
                    
                    {/* Toggle Group by Room */}
                    {Object.keys(groupReviewsByRoom()).length > 1 && (
                      <button
                        onClick={() => setGroupByRoom(!groupByRoom)}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                      >
                        <Building2 className="h-4 w-4" />
                        {groupByRoom ? 'Show All' : 'Group by Room'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading reviews...</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No reviews yet. Be the first to review!
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {groupByRoom ? (
                    // Group by Room View
                    Object.entries(groupReviewsByRoom()).map(([roomId, roomReviews]) => (
                      <div key={roomId} className="border-2 border-blue-200 dark:border-blue-800 rounded-xl p-5 bg-blue-50/30 dark:bg-blue-900/10">
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-blue-300 dark:border-blue-700">
                          <Building2 className="h-5 w-5 text-blue-600" />
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                            Room ID: {roomId.substring(0, 13)}...
                          </h3>
                          <span className="ml-auto bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-semibold">
                            {roomReviews.length} {roomReviews.length === 1 ? 'review' : 'reviews'}
                          </span>
                        </div>
                        <div className="space-y-4">
                          {roomReviews.map((review) => (
                            <div
                              key={review.id}
                              className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-start gap-4">
                                <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                                  <span className="text-white font-bold text-base">
                                    {userNames[review.userId] ? userNames[review.userId][0].toUpperCase() : '?'}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-3 mb-2">
                                    <div className="flex-1 min-w-0">
                                      <span className="font-bold text-gray-900 dark:text-white text-base block truncate">
                                        {userNames[review.userId] || 'Loading...'}
                                      </span>
                                      <div className="flex items-center gap-2 mt-1">
                                        <StarRating rating={review.rating} />
                                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 rounded">
                                          {review.rating}/5
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <p className="text-gray-800 dark:text-gray-200 mb-2 leading-relaxed text-sm">
                                    {review.content}
                                  </p>
                                  {review.imageUrl && review.imageUrl !== '' && (
                                    <div className="mb-2">
                                      <img 
                                        src={review.imageUrl} 
                                        alt="Review" 
                                        className="rounded-lg max-h-48 w-auto object-cover border-2 border-gray-200 dark:border-gray-600 shadow-md"
                                      />
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                    <Calendar className="h-3 w-3" />
                                    <span>{new Date(review.createdAt).toLocaleDateString('vi-VN', { 
                                      year: 'numeric', 
                                      month: 'short', 
                                      day: 'numeric' 
                                    })}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    // Flat List View
                    reviews.map((review) => (
                      <div
                        key={review.id}
                        className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700/50 dark:to-blue-900/20 rounded-lg p-5 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-200"
                      >
                        <div className="flex items-start gap-4">
                          <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg border-2 border-white dark:border-gray-700">
                            <span className="text-white font-bold text-lg">
                              {userNames[review.userId] ? userNames[review.userId][0].toUpperCase() : '?'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-bold text-gray-900 dark:text-white truncate text-lg">
                                    {userNames[review.userId] || 'Loading...'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <StarRating rating={review.rating} />
                                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 rounded">
                                    {review.rating}/5
                                  </span>
                                </div>
                              </div>
                            </div>
                            <p className="text-gray-800 dark:text-gray-200 mb-3 leading-relaxed text-base">
                              {review.content}
                            </p>
                            {review.imageUrl && review.imageUrl !== '' && (
                              <div className="mb-3">
                                <img 
                                  src={review.imageUrl} 
                                  alt="Review" 
                                  className="rounded-lg max-h-64 w-auto object-cover border-2 border-gray-200 dark:border-gray-600 shadow-md"
                                />
                              </div>
                            )}
                            <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 px-3 py-2 rounded-md">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                <span className="font-medium">{new Date(review.createdAt).toLocaleDateString('vi-VN', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}</span>
                              </div>
                              {review.roomId && (
                                <div className="flex items-center gap-1.5 border-l border-gray-300 dark:border-gray-600 pl-4">
                                  <Building2 className="h-3.5 w-3.5 text-blue-600" />
                                  <span className="font-medium">Room: {review.roomId.substring(0, 8)}...</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Property Details
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">House</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {post.houseName || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Room</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {post.roomName || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Contact</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {post.contactPhone || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Posted by</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {post.authorName || 'Unknown'}
                    </p>
                  </div>
                </div>

                {/* Address Section */}
                {houseLocation && houseLocation.fullAddress && (
                  <div className="flex items-start gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <MapPin className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Address</p>
                      <p className="font-medium text-gray-900 dark:text-white leading-relaxed">
                        {houseLocation.fullAddress}
                      </p>
                      {(houseLocation.provinceName || houseLocation.communeName) && (
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                          {houseLocation.communeName && (
                            <div className="flex items-center gap-1">
                              <span className="font-medium">📍</span>
                              <span>{houseLocation.communeName}</span>
                            </div>
                          )}
                          {houseLocation.provinceName && (
                            <div className="flex items-center gap-1">
                              <span className="font-medium">🌍</span>
                              <span>{houseLocation.provinceName}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3 mt-6">
                {isAuthenticated ? (
                  <>
                    <button 
                      onClick={() => setShowChatDialog(true)}
                      className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Chat with Owner
                    </button>
                    
                    <button className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2">
                      <Phone className="h-4 w-4" />
                      Call Owner
                    </button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <button 
                      onClick={() => router.push('/login')}
                      className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Login to Chat
                    </button>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                      Please login to contact the owner
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      
      {/* Chat Dialog */}
      <ChatDialog 
        isOpen={showChatDialog}
        onClose={() => setShowChatDialog(false)}
        postId={postId}
        postTitle={post?.title}
        ownerName={post?.authorName}
      />
    </div>
  );
}
