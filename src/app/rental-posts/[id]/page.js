'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import rentalPostService from '@/services/rentalPostService';
import reviewService from '@/services/reviewService';
import boardingHouseService from '@/services/boardingHouseService';
import contractService from '@/services/contractService';
import profileService from '@/services/profileService';
import { toast } from 'react-toastify';
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
  XCircle,
  Home,
  Users,
  X,
  Mail,
  CreditCard,
  FileText,
  AlertCircle,
  DollarSign,
  Maximize2,
  Wifi,
  Tv,
  Wind,
  Refrigerator,
  Droplets,
  Car,
  Shield,
  Zap
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
  const { t } = useTranslation();

  const [post, setPost] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewReplies, setReviewReplies] = useState({});
  const [loading, setLoading] = useState(true);
  const [showChatDialog, setShowChatDialog] = useState(false);
  const [groupByRoom, setGroupByRoom] = useState(false);
  const [userNames, setUserNames] = useState({});
  const [houseLocation, setHouseLocation] = useState(null);

  // Rental Request Modal States
  const [showRentalRequestModal, setShowRentalRequestModal] = useState(false);
  const [rentalRequestData, setRentalRequestData] = useState({
    checkinDate: '',
    checkoutDate: '',
    citizenIdNumbers: [''] // Array of CCCD, start with one empty field
  });
  const [rentalRequestErrors, setRentalRequestErrors] = useState({});
  const [submittingRentalRequest, setSubmittingRentalRequest] = useState(false);

  // Track if view has been incremented to avoid double counting
  const viewIncrementedRef = useRef(false);

  // Handle dynamic CCCD fields
  const handleAddCCCD = () => {
    setRentalRequestData(prev => ({
      ...prev,
      citizenIdNumbers: [...prev.citizenIdNumbers, '']
    }));
  };

  const handleRemoveCCCD = (index) => {
    setRentalRequestData(prev => ({
      ...prev,
      citizenIdNumbers: prev.citizenIdNumbers.filter((_, i) => i !== index)
    }));
  };

  const handleChangeCCCD = (index, value) => {
    setRentalRequestData(prev => {
      const newCitizenIdNumbers = [...prev.citizenIdNumbers];
      newCitizenIdNumbers[index] = value;
      return {
        ...prev,
        citizenIdNumbers: newCitizenIdNumbers
      };
    });
  };

  useEffect(() => {
    if (postId) {
      loadPost();
    }
  }, [postId]);

  const loadPost = async () => {
    try {
      setLoading(true);

      console.log('🔍 Loading post, isAuthenticated:', isAuthenticated);

      // Determine if we should increment view (only once per page load)
      const shouldIncrementView = !viewIncrementedRef.current;
      if (shouldIncrementView) {
        viewIncrementedRef.current = true;
      }

      // Use authenticated API if logged in, public API for guests
      let postData = null;
      if (isAuthenticated) {
        console.log('🔐 User authenticated, using getPostById()');
        try {
          postData = await rentalPostService.getPostById(postId, shouldIncrementView);
        } catch (authError) {
          console.warn('⚠️ Authenticated call failed, trying public API:', authError);
          postData = await rentalPostService.getByIdPublic(postId, false); // Don't increment again on fallback
        }
      } else {
        console.log('👤 Guest user, using getByIdPublic()');
        postData = await rentalPostService.getByIdPublic(postId, shouldIncrementView);
      }
      console.log('📋 Post detail:', postData);

      if (!postData || !postData.id) {
        console.error('❌ No post data found');
        toast.error('Không tìm thấy bài đăng này');
        setPost(null);
        return;
      }

      setPost(postData);

      // Fetch boarding house location if boardingHouseId exists
      if (postData.boardingHouseId) {
        fetchHouseLocation(postData.boardingHouseId);
      }

      // Fetch reviews by RoomId using ReviewAPI endpoint: GET /api/Review/all/{roomId}
      const roomId = postData.roomId || postData.RoomId;
      if (roomId) {
        try {
          console.log('📝 Fetching reviews for roomId:', roomId);
          const reviewsData = await reviewService.getAllReviewsByRoomId(roomId);
          console.log('✅ Reviews loaded from ReviewAPI:', reviewsData);
          setReviews(Array.isArray(reviewsData) ? reviewsData : []);

          // Fetch replies for each review
          if (Array.isArray(reviewsData) && reviewsData.length > 0) {
            const repliesMap = {};
            for (const review of reviewsData) {
              try {
                const reply = await reviewService.getReplyByReviewId(review.id);
                if (reply) {
                  repliesMap[review.id] = reply;
                }
              } catch (error) {
                console.log('No reply for review:', review.id);
              }
            }
            setReviewReplies(repliesMap);
            console.log('💬 Replies loaded:', repliesMap);
          }

          // Fetch userNames for all reviews
          if (Array.isArray(reviewsData) && reviewsData.length > 0) {
            fetchUserNames(reviewsData);
          }
        } catch (reviewError) {
          console.error('❌ Error loading reviews:', reviewError);
          // Fallback: use reviews from post if ReviewAPI fails
          const reviewsData = postData.reviews || [];
          console.log('⚠️ Using fallback reviews from post:', reviewsData);
          setReviews(Array.isArray(reviewsData) ? reviewsData : []);
          if (Array.isArray(reviewsData) && reviewsData.length > 0) {
            fetchUserNames(reviewsData);
          }
        }
      } else {
        // No roomId, use reviews from post as fallback
        const reviewsData = postData.reviews || [];
        console.log('📝 Reviews from post (no roomId):', reviewsData);
        setReviews(Array.isArray(reviewsData) ? reviewsData : []);
        if (Array.isArray(reviewsData) && reviewsData.length > 0) {
          fetchUserNames(reviewsData);
        }
      }
    } catch (error) {
      console.error('❌ Error loading post:', error);
      setPost(null);
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
      const uniqueUserIds = [...new Set(reviewsList.map(r => r.userId))];
      const namesMap = {};

      // First, try to get names from reviews themselves (if review has fullName)
      reviewsList.forEach(review => {
        if (review.fullName || review.FullName || review.userName || review.UserName) {
          namesMap[review.userId] = review.fullName || review.FullName || review.userName || review.UserName;
        }
      });

      // If no token (guest), use names from reviews or set as Anonymous
      if (!token) {
        uniqueUserIds.forEach(userId => {
          if (!namesMap[userId]) {
            namesMap[userId] = 'Người dùng';
          }
        });
        setUserNames(namesMap);
        return;
      }

      // Fetch remaining user names from API
      const userIdsToFetch = uniqueUserIds.filter(id => !namesMap[id]);

      await Promise.all(
        userIdsToFetch.map(async (userId) => {
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/Accounts/${userId}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
              const userData = await response.json();
              namesMap[userId] = userData?.fullName || userData?.FullName || 'Người dùng';
            } else {
              namesMap[userId] = 'Người dùng';
            }
          } catch (err) {
            namesMap[userId] = 'Người dùng';
          }
        })
      );

      setUserNames(namesMap);
      console.log('✅ User names loaded:', namesMap);
    } catch (error) {
      console.error('❌ Error loading user names:', error);
    }
  };

  // ==================== RENTAL REQUEST FUNCTIONS ====================
  const openRentalRequestModal = async () => {
    // Set default dates
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    // Get user's Citizen ID from profile API
    let citizenIdNumbers = [''];
    try {
      const profileData = await profileService.getProfile();
      console.log('👤 User profile loaded:', profileData);

      if (profileData && profileData.citizenIdNumber) {
        citizenIdNumbers = [profileData.citizenIdNumber];
        console.log('✅ Auto-filled Citizen ID:', profileData.citizenIdNumber);
      } else {
        console.log('⚠️ No Citizen ID found in profile');
      }
    } catch (error) {
      console.error('❌ Error loading profile for Citizen ID:', error);
      // Continue with empty field if profile fetch fails
    }

    setRentalRequestData({
      checkinDate: today.toISOString().split('T')[0],
      checkoutDate: nextMonth.toISOString().split('T')[0],
      citizenIdNumbers: citizenIdNumbers // Auto-fill with user's Citizen ID if available
    });
    setRentalRequestErrors({});
    setShowRentalRequestModal(true);
  };

  const validateRentalRequest = () => {
    const errors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Validate CheckinDate
    if (!rentalRequestData.checkinDate) {
      errors.checkinDate = t('rentalPostDetail.rentalRequest.errors.checkinRequired') || 'Vui lòng chọn ngày nhận phòng';
    } else {
      const checkinDate = new Date(rentalRequestData.checkinDate);
      if (checkinDate < today) {
        errors.checkinDate = t('rentalPostDetail.rentalRequest.errors.checkinPast') || 'Ngày nhận phòng phải từ hôm nay trở đi';
      }
    }

    // Validate CheckoutDate
    if (!rentalRequestData.checkoutDate) {
      errors.checkoutDate = t('rentalPostDetail.rentalRequest.errors.checkoutRequired') || 'Vui lòng chọn ngày trả phòng';
    } else if (rentalRequestData.checkinDate) {
      const checkinDate = new Date(rentalRequestData.checkinDate);
      const checkoutDate = new Date(rentalRequestData.checkoutDate);
      const minCheckout = new Date(checkinDate);
      minCheckout.setMonth(minCheckout.getMonth() + 1);

      if (checkoutDate < minCheckout) {
        errors.checkoutDate = t('rentalPostDetail.rentalRequest.errors.checkoutMinOneMonth') || 'Ngày trả phòng phải ít nhất 1 tháng sau ngày nhận phòng';
      }
    }

    // Validate CitizenIdNumbers (at least one non-empty CCCD)
    const validCCCDs = rentalRequestData.citizenIdNumbers.filter(cccd => cccd.trim());
    if (validCCCDs.length === 0) {
      errors.citizenIdNumbers = t('rentalPostDetail.rentalRequest.errors.cccdRequired') || 'Vui lòng nhập ít nhất 1 số CCCD';
    }

    setRentalRequestErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitRentalRequest = async () => {
    if (!validateRentalRequest()) return;

    const ownerId = post?.authorId || post?.AuthorId;
    const roomId = post?.roomId || post?.RoomId;

    if (!ownerId || !roomId) {
      toast.error(t('rentalPostDetail.rentalRequest.errors.missingInfo'));
      return;
    }

    try {
      setSubmittingRentalRequest(true);

      // Backend chỉ cần 4 fields: CheckinDate, CheckoutDate, NumberOfOccupants, CitizenIdNumber (array)
      // NumberOfOccupants tự động tính từ số lượng CCCD
      const validCCCDs = rentalRequestData.citizenIdNumbers.filter(cccd => cccd.trim());
      const requestData = {
        CheckinDate: new Date(rentalRequestData.checkinDate).toISOString(),
        CheckoutDate: new Date(rentalRequestData.checkoutDate).toISOString(),
        NumberOfOccupants: validCCCDs.length,
        CitizenIdNumber: validCCCDs
      };

      console.log('📝 Submitting rental request:', { ownerId, roomId, requestData });

      await contractService.createRentalRequest(ownerId, roomId, requestData);

      toast.success(t('rentalPostDetail.rentalRequest.success'));
      setShowRentalRequestModal(false);
    } catch (error) {
      console.error('❌ Error submitting rental request:', error);
      const errorMessage = error.response?.data?.message || error.message || t('rentalPostDetail.rentalRequest.errors.failed');
      toast.error(errorMessage);
    } finally {
      setSubmittingRentalRequest(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      0: { label: t('rentalPostDetail.available'), color: 'bg-green-100 text-green-800', icon: CheckCircle },
      1: { label: t('rentalPostDetail.pending'), color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      2: { label: t('rentalPostDetail.rejected'), color: 'bg-red-100 text-red-800', icon: XCircle },
      3: { label: t('rentalPostDetail.inactive'), color: 'bg-gray-100 text-gray-800', icon: XCircle },
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
            className={`h-4 w-4 ${star <= rating
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
            <p className="mt-4 text-gray-600 dark:text-gray-400">{t('rentalPostDetail.loading')}</p>
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
              {t('rentalPostDetail.notFound')}
            </h3>
            <button
              onClick={() => router.back()}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {t('rentalPostDetail.goBack')}
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
          {t('rentalPostDetail.backToPosts')}
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

              <div className="flex items-center gap-4 mb-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {post.authorName || 'Không rõ'}
                </div>
              </div>

              {/* Amenities Section */}
              {(post.room?.amenities?.length > 0 || post.boardingHouse?.amenities?.length > 0) && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    ✨ Tiện ích phòng
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {(post.room?.amenities || post.boardingHouse?.amenities || []).map((amenity, index) => (
                      <div
                        key={index}
                        className="flex flex-col items-center p-4 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow"
                      >
                        {/* Amenity Image */}
                        <div className="w-12 h-12 mb-2 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-600 flex items-center justify-center">
                          {(amenity.imageUrl || amenity.ImageUrl || amenity.icon || amenity.Icon) ? (
                            <img
                              src={amenity.imageUrl || amenity.ImageUrl || amenity.icon || amenity.Icon}
                              alt={amenity.name || amenity.amenityName || amenity.Name || amenity.AmenityName || 'Amenity'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className={`w-full h-full items-center justify-center text-2xl ${(amenity.imageUrl || amenity.ImageUrl || amenity.icon || amenity.Icon) ? 'hidden' : 'flex'}`}>
                            ✓
                          </div>
                        </div>
                        {/* Amenity Name */}
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                          {amenity.name || amenity.amenityName || amenity.Name || amenity.AmenityName || amenity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="prose dark:prose-invert max-w-none">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {t('rentalPostDetail.description')}
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
                  {t('rentalPostDetail.roomReviews')}
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
                        {groupByRoom ? t('rentalPostDetail.showAll') : t('rentalPostDetail.groupByRoom')}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t('rentalPostDetail.loadingReviews')}</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {t('rentalPostDetail.beFirstToReview')}
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
                            {roomReviews[0]?.roomName || `Phòng ${roomId.substring(0, 8)}`}
                          </h3>
                          <span className="ml-auto bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-semibold">
                            {roomReviews.length} {roomReviews.length === 1 ? t('rentalPostDetail.review') : t('rentalPostDetail.reviewsCount')}
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
                                    {userNames[review.userId] ? userNames[review.userId][0].toUpperCase() : 'U'}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-3 mb-2">
                                    <div className="flex-1 min-w-0">
                                      <span className="font-bold text-gray-900 dark:text-white text-base block truncate">
                                        {userNames[review.userId] || 'Người dùng'}
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
                                  {review.imageUrl && review.imageUrl.trim() !== '' && review.imageUrl !== 'null' && (
                                    <div className="mb-2">
                                      <img
                                        src={review.imageUrl}
                                        alt="Review"
                                        className="rounded-lg max-h-48 w-auto object-cover border-2 border-gray-200 dark:border-gray-600 shadow-md"
                                        onError={(e) => { e.target.style.display = 'none'; }}
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
                              {userNames[review.userId] ? userNames[review.userId][0].toUpperCase() : 'U'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-bold text-gray-900 dark:text-white truncate text-lg">
                                    {userNames[review.userId] || 'Người dùng'}
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
                            {review.imageUrl && Array.isArray(review.imageUrl) && review.imageUrl.length > 0 && (
                              <div className="mb-3 grid grid-cols-2 md:grid-cols-3 gap-2">
                                {review.imageUrl.map((imgUrl, idx) => (
                                  <img
                                    key={idx}
                                    src={imgUrl}
                                    alt={`Review ${idx + 1}`}
                                    className="rounded-lg h-48 w-full object-cover border-2 border-gray-200 dark:border-gray-600 shadow-md hover:scale-105 transition-transform cursor-pointer"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                    onClick={() => window.open(imgUrl, '_blank')}
                                  />
                                ))}
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
                              {review.roomName && (
                                <div className="flex items-center gap-1.5 border-l border-gray-300 dark:border-gray-600 pl-4">
                                  <Building2 className="h-3.5 w-3.5 text-blue-600" />
                                  <span className="font-medium">{review.roomName}</span>
                                </div>
                              )}
                            </div>

                            {/* Owner Reply */}
                            {reviewReplies[review.id] && (
                              <div className="mt-4 ml-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border-l-4 border-blue-500">
                                <div className="flex items-start gap-3">
                                  <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-white font-bold text-sm">CH</span>
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="font-bold text-gray-900 dark:text-white text-sm">Chủ nhà phản hồi</span>
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(reviewReplies[review.id].createdAt).toLocaleDateString('vi-VN')}
                                      </span>
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                                      {reviewReplies[review.id].content}
                                    </p>
                                    {reviewReplies[review.id].image && Array.isArray(reviewReplies[review.id].image) && reviewReplies[review.id].image.length > 0 && (
                                      <div className="mt-3 grid grid-cols-2 gap-2">
                                        {reviewReplies[review.id].image.map((imgUrl, idx) => (
                                          <img
                                            key={idx}
                                            src={imgUrl}
                                            alt={`Reply ${idx + 1}`}
                                            className="rounded-lg h-32 w-full object-cover border-2 border-gray-200 dark:border-gray-600 shadow-sm hover:scale-105 transition-transform cursor-pointer"
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                            onClick={() => window.open(imgUrl, '_blank')}
                                          />
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
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
              {/* Price highlight */}
              {(post.price || post.room?.price) && (
                <div className="mb-6 p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white">
                  <p className="text-sm opacity-90 mb-1">{t('rentalPostDetail.rentalPrice')}</p>
                  <p className="text-2xl font-bold">
                    {(post.price || post.room?.price)?.toLocaleString('vi-VN')} đ
                  </p>
                  <p className="text-sm opacity-90">{t('rentalPostDetail.perMonth')}</p>
                </div>
              )}

              {/* Quick Info */}
              {(post.area || post.room?.area) && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center gap-3">
                  <Maximize2 className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('rentalPostDetail.area')}</p>
                    <p className="font-semibold text-blue-600">{post.area || post.room?.area} m²</p>
                  </div>
                </div>
              )}

              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                {t('rentalPostDetail.propertyDetails')}
              </h3>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <Building2 className="h-5 w-5 text-purple-500" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('rentalPostDetail.house')}</p>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {post.houseName || post.boardingHouse?.houseName || t('rentalPostDetail.notUpdated')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <Home className="h-5 w-5 text-orange-500" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('rentalPostDetail.room')}</p>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {post.roomName || post.room?.roomName || t('rentalPostDetail.notUpdated')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <Phone className="h-5 w-5 text-green-500" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('rentalPostDetail.contact')}</p>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {post.contactPhone || t('rentalPostDetail.notUpdated')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <User className="h-5 w-5 text-blue-500" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('rentalPostDetail.postedBy')}</p>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {post.authorName || t('rentalPostDetail.unknown')}
                    </p>
                  </div>
                </div>

                {/* Address Section */}
                {(houseLocation?.fullAddress || post.boardingHouse?.location) && (
                  <div className="flex items-start gap-3 p-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <MapPin className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('rentalPostDetail.address')}</p>
                      <p className="font-medium text-gray-900 dark:text-white text-sm leading-relaxed">
                        {houseLocation?.fullAddress || 
                         [
                           post.boardingHouse?.location?.address,
                           post.boardingHouse?.location?.wardName,
                           post.boardingHouse?.location?.districtName,
                           post.boardingHouse?.location?.provinceName
                         ].filter(Boolean).join(', ') ||
                         t('rentalPostDetail.notUpdated')
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3 mt-6">
                {isAuthenticated ? (
                  <>
                    {/* Rental Request Button - Only show if user is not the owner */}
                    {user?.id !== (post?.authorId || post?.AuthorId) && (
                      <button
                        onClick={openRentalRequestModal}
                        className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <Home className="h-4 w-4" />
                        {t('rentalPostDetail.sendRentalRequest')}
                      </button>
                    )}

                    <button
                      onClick={() => setShowChatDialog(true)}
                      className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      {t('rentalPostDetail.chatWithOwner')}
                    </button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={() => router.push('/login')}
                      className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      {t('rentalPostDetail.loginToChat')}
                    </button>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                      {t('rentalPostDetail.pleaseLogin')}
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
        ownerId={post?.authorId || post?.AuthorId}
        postTitle={post?.title || post?.Title}
        ownerName={post?.authorName || post?.AuthorName}
      />

      {/* Rental Request Modal */}
      {showRentalRequestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Home className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {t('rentalPostDetail.rentalRequest.title')}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {post?.roomName || t('rentalPostDetail.rentalRequest.subtitle')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRentalRequestModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Section: Rental Info */}
              <div className="space-y-4">
                <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  {t('rentalPostDetail.rentalRequest.rentalInfoSection') || 'Thông tin thuê'}
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  {/* Check-in Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('rentalPostDetail.rentalRequest.checkinDate') || 'Ngày nhận phòng'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={rentalRequestData.checkinDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setRentalRequestData({ ...rentalRequestData, checkinDate: e.target.value })}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${rentalRequestErrors.checkinDate ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {rentalRequestErrors.checkinDate && (
                      <p className="mt-1 text-sm text-red-500">{rentalRequestErrors.checkinDate}</p>
                    )}
                  </div>

                  {/* Check-out Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('rentalPostDetail.rentalRequest.checkoutDate') || 'Ngày trả phòng'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={rentalRequestData.checkoutDate}
                      min={rentalRequestData.checkinDate || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setRentalRequestData({ ...rentalRequestData, checkoutDate: e.target.value })}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${rentalRequestErrors.checkoutDate ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {rentalRequestErrors.checkoutDate && (
                      <p className="mt-1 text-sm text-red-500">{rentalRequestErrors.checkoutDate}</p>
                    )}
                  </div>
                </div>

                {/* Number of Occupants (Read-only, calculated from CCCD count) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Users className="h-4 w-4 inline mr-1" />
                    {t('rentalPostDetail.rentalRequest.numberOfOccupants') || 'Số người ở'}
                  </label>
                  <input
                    type="text"
                    value={rentalRequestData.citizenIdNumbers.filter(cccd => cccd.trim()).length}
                    readOnly
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {t('rentalPostDetail.rentalRequest.autoCalculated') || 'Tự động tính từ số lượng CCCD'}
                  </p>
                </div>

                {/* CCCD Numbers (Dynamic fields) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <CreditCard className="h-4 w-4 inline mr-1" />
                    {t('rentalPostDetail.rentalRequest.cccdNumbers') || 'Số CCCD các người ở'} <span className="text-red-500">*</span>
                  </label>

                  <div className="space-y-3">
                    {rentalRequestData.citizenIdNumbers.map((cccd, index) => (
                      <div key={index} className="space-y-2">
                        {/* Label: Người đại diện (index 0) or Người ở cùng (index > 0) */}
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium px-2 py-1 rounded ${index === 0
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}>
                            {index === 0
                              ? (t('rentalPostDetail.rentalRequest.representative') || 'Người đại diện')
                              : (t('rentalPostDetail.rentalRequest.coOccupant') || 'Người ở cùng')
                            }
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={cccd}
                            onChange={(e) => handleChangeCCCD(index, e.target.value)}
                            placeholder={`${t('rentalPostDetail.rentalRequest.cccdNumber') || 'Số CCCD'} ${index + 1}`}
                            className={`flex-1 px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${rentalRequestErrors.citizenIdNumbers ? 'border-red-500' : 'border-gray-300'}`}
                          />
                          {rentalRequestData.citizenIdNumbers.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveCCCD(index)}
                              className="px-3 py-2.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                              title={t('rentalPostDetail.rentalRequest.removeCCCD') || 'Xóa CCCD'}
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    {rentalRequestErrors.citizenIdNumbers && (
                      <p className="text-sm text-red-500">{rentalRequestErrors.citizenIdNumbers}</p>
                    )}

                    <button
                      type="button"
                      onClick={handleAddCCCD}
                      className="w-full px-4 py-2.5 border-2 border-dashed border-green-300 dark:border-green-700 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      {t('rentalPostDetail.rentalRequest.addCCCD') || 'Thêm CCCD'}
                    </button>
                  </div>
                </div>

                {/* Info box */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    💡 {t('rentalPostDetail.rentalRequest.infoNote') || 'Thông tin này sẽ được sử dụng để tạo hợp đồng thuê. Vui lòng kiểm tra kỹ trước khi gửi.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowRentalRequestModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                {t('rentalPostDetail.rentalRequest.cancel') || 'Hủy'}
              </button>
              <button
                onClick={handleSubmitRentalRequest}
                disabled={submittingRentalRequest}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submittingRentalRequest ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    {t('rentalPostDetail.rentalRequest.submitting') || 'Đang gửi...'}
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    {t('rentalPostDetail.rentalRequest.submit') || 'Gửi yêu cầu'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}