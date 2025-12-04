'use client';

import { useState, useEffect } from 'react';
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
  AlertCircle
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatDialog from '@/components/ChatDialog';
import Image from 'next/image';

// ============ MOCK DATA FOR DEMO - DELETE AFTER SCREENSHOT ============
const MOCK_POST_DETAIL = {
  id: '1',
  title: 'Phòng trọ cao cấp quận 1 - Full nội thất, view đẹp',
  description: `🏠 PHÒNG TRỌ CAO CẤP QUẬN 1 - FULL NỘI THẤT

📍 Vị trí: 123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh

✨ TIỆN ÍCH:
• Máy lạnh Daikin Inverter tiết kiệm điện
• Tủ lạnh mini 90L
• Máy giặt cửa trước 7kg
• Bếp từ đơn + Lò vi sóng
• Giường đệm cao cấp 1m6
• Tủ quần áo 3 cánh
• Bàn làm việc + ghế xoay
• Wifi tốc độ cao 100Mbps

🔐 AN NINH:
• Bảo vệ 24/7
• Khóa vân tay thông minh
• Camera an ninh
• Thẻ từ ra vào tòa nhà

💰 CHI PHÍ:
• Giá thuê: 5,500,000 VND/tháng
• Điện: 3,500 VND/kWh (giá nhà nước)
• Nước: 15,000 VND/m³
• Wifi: Miễn phí
• Gửi xe: Miễn phí

📞 Liên hệ xem phòng ngay!`,
  houseName: 'Nhà trọ Sunshine Residence',
  roomName: 'Phòng A101 - Studio Premium',
  authorId: 'owner1',
  authorName: 'Nguyễn Văn An',
  contactPhone: '0901234567',
  contactEmail: 'nguyenvanan@email.com',
  createdAt: '2025-11-28T10:00:00Z',
  isActive: true,
  isApproved: 1,
  price: 5500000,
  area: 35,
  boardingHouseId: 'house1',
  roomId: 'room1',
  imageUrls: ['/image.png', '/image.png', '/image.png'],
  reviews: [
    {
      id: 'review1',
      userId: 'user1',
      rating: 5,
      content: 'Phòng rất đẹp và sạch sẽ, chủ nhà nhiệt tình. Nội thất đầy đủ, tiện nghi. Vị trí trung tâm, đi lại thuận tiện. Rất hài lòng với phòng này!',
      createdAt: '2025-11-25T10:00:00Z',
      imageUrl: '/image.png'
    },
    {
      id: 'review2',
      userId: 'user2',
      rating: 4,
      content: 'Phòng ổn, giá hợp lý cho vị trí trung tâm. Wifi ổn định, máy lạnh mát. Chỉ hơi ồn vào ban đêm do gần đường lớn.',
      createdAt: '2025-11-20T14:30:00Z',
      imageUrl: null
    },
    {
      id: 'review3',
      userId: 'user3',
      rating: 5,
      content: 'Tuyệt vời! Đã ở được 6 tháng, không có gì phàn nàn. Chủ nhà rất tốt, hỗ trợ sửa chữa nhanh chóng khi có vấn đề.',
      createdAt: '2025-11-15T09:00:00Z',
      imageUrl: '/image.png'
    }
  ]
};

const MOCK_USER_NAMES = {
  'user1': 'Trần Thị Bình',
  'user2': 'Lê Minh Cường',
  'user3': 'Phạm Hoàng Dũng'
};

const MOCK_HOUSE_LOCATION = {
  fullAddress: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
  provinceName: 'TP. Hồ Chí Minh',
  communeName: 'Phường Bến Nghé',
  addressDetail: '123 Nguyễn Huệ'
};
// ============ END MOCK DATA ============

export default function RentalPostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id;
  const { isAuthenticated, user } = useAuth();
  const { t } = useTranslation();

  const [post, setPost] = useState(null);
  const [reviews, setReviews] = useState([]);
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
    numberOfOccupants: 1,
    // Identity Profile fields
    fullName: '',
    gender: 0,
    dateOfBirth: '',
    phone: '',
    email: '',
    provinceId: '',
    provinceName: '',
    wardId: '',
    wardName: '',
    address: '',
    temporaryResidence: '',
    citizenIdNumber: '',
    citizenIdIssuedDate: '',
    citizenIdIssuedPlace: '',
    frontImageUrl: '',
    backImageUrl: '',
    avatar: ''
  });
  const [rentalRequestErrors, setRentalRequestErrors] = useState({});
  const [submittingRentalRequest, setSubmittingRentalRequest] = useState(false);
  const [loadingUserProfile, setLoadingUserProfile] = useState(false);
  const [userProfileLoaded, setUserProfileLoaded] = useState(false);
  const [profileError, setProfileError] = useState(null);

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

      // ============ USE MOCK DATA IF NO REAL DATA ============
      const postToUse = postData && postData.id ? postData : MOCK_POST_DETAIL;
      setPost(postToUse);
      // ============ END MOCK DATA USAGE ============

      // Fetch boarding house location if boardingHouseId exists
      if (postToUse.boardingHouseId) {
        fetchHouseLocation(postToUse.boardingHouseId);
      }

      // BE RentalPostsAPI returns reviews in post.Reviews (already normalized to camelCase)
      const reviewsData = postToUse.reviews || [];
      console.log('📝 Reviews from BE:', reviewsData);
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);

      // Fetch userNames for all reviews
      if (Array.isArray(reviewsData) && reviewsData.length > 0) {
        fetchUserNames(reviewsData);
      }
    } catch (error) {
      console.error('❌ Error loading post:', error);
      // ============ USE MOCK DATA ON ERROR ============
      setPost(MOCK_POST_DETAIL);
      setReviews(MOCK_POST_DETAIL.reviews);
      setUserNames(MOCK_USER_NAMES);
      setHouseLocation(MOCK_HOUSE_LOCATION);
      // ============ END MOCK DATA ON ERROR ============
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

  // ==================== RENTAL REQUEST FUNCTIONS ====================
  const openRentalRequestModal = async () => {
    // Set default dates
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    setRentalRequestData({
      checkinDate: today.toISOString().split('T')[0],
      checkoutDate: nextMonth.toISOString().split('T')[0],
      numberOfOccupants: 1,
      fullName: '',
      gender: 0,
      dateOfBirth: '',
      phone: '',
      email: '',
      provinceId: '',
      provinceName: '',
      wardId: '',
      wardName: '',
      address: '',
      temporaryResidence: '',
      citizenIdNumber: '',
      citizenIdIssuedDate: '',
      citizenIdIssuedPlace: '',
      frontImageUrl: '',
      backImageUrl: '',
      avatar: ''
    });
    setRentalRequestErrors({});
    setProfileError(null);
    setUserProfileLoaded(false);
    setShowRentalRequestModal(true);

    // Load user profile
    if (user?.id) {
      setLoadingUserProfile(true);
      try {
        // Use profileService.getProfile() which calls /api/Profile/profile
        // This returns full profile data including CCCD info
        const profile = await profileService.getProfile();
        console.log('📋 User profile loaded from profileService:', profile);

        if (profile) {
          console.log('📋 Profile data details:', {
            fullName: profile.fullName || profile.FullName,
            phone: profile.phone || profile.Phone,
            email: profile.email || profile.Email,
            gender: profile.gender ?? profile.Gender,
            dateOfBirth: profile.dateOfBirth || profile.DateOfBirth,
            detailAddress: profile.detailAddress || profile.DetailAddress,
            provinceId: profile.provinceId || profile.ProvinceId,
            provinceName: profile.provinceName || profile.ProvinceName,
            wardId: profile.wardId || profile.WardId,
            wardName: profile.wardName || profile.WardName,
            citizenIdNumber: profile.citizenIdNumber || profile.CitizenIdNumber,
            citizenIdIssuedDate: profile.citizenIdIssuedDate || profile.CitizenIdIssuedDate,
            citizenIdIssuedPlace: profile.citizenIdIssuedPlace || profile.CitizenIdIssuedPlace,
            frontImageUrl: profile.frontImageUrl || profile.FrontImageUrl,
            backImageUrl: profile.backImageUrl || profile.BackImageUrl
          });

          // Helper function to safely format date
          const formatDateSafe = (dateValue) => {
            if (!dateValue) return '';
            try {
              const date = new Date(dateValue);
              if (isNaN(date.getTime())) return '';
              return date.toISOString().split('T')[0];
            } catch {
              return '';
            }
          };

          setRentalRequestData(prev => ({
            ...prev,
            fullName: profile.fullName || profile.FullName || '',
            gender: profile.gender ?? profile.Gender ?? 0,
            dateOfBirth: formatDateSafe(profile.dateOfBirth || profile.DateOfBirth),
            phone: profile.phone || profile.Phone || '',
            email: profile.email || profile.Email || '',
            provinceId: profile.provinceId || profile.ProvinceId || '',
            provinceName: profile.provinceName || profile.ProvinceName || '',
            wardId: profile.wardId || profile.WardId || '',
            wardName: profile.wardName || profile.WardName || '',
            address: profile.detailAddress || profile.DetailAddress || '',
            temporaryResidence: profile.temporaryResidence || profile.TemporaryResidence || '',
            citizenIdNumber: profile.citizenIdNumber || profile.CitizenIdNumber || '',
            citizenIdIssuedDate: formatDateSafe(profile.citizenIdIssuedDate || profile.CitizenIdIssuedDate),
            citizenIdIssuedPlace: profile.citizenIdIssuedPlace || profile.CitizenIdIssuedPlace || '',
            frontImageUrl: profile.frontImageUrl || profile.FrontImageUrl || '',
            backImageUrl: profile.backImageUrl || profile.BackImageUrl || '',
            avatar: profile.avatar || profile.Avatar || ''
          }));
          setUserProfileLoaded(true);

          // Check if profile is complete
          if (!profile.citizenIdNumber && !profile.CitizenIdNumber) {
            setProfileError(t('rentalPostDetail.rentalRequest.errors.incompleteCCCD'));
          }
        } else {
          setProfileError(t('rentalPostDetail.rentalRequest.errors.loadProfileFailed'));
        }
      } catch (error) {
        console.error('❌ Error loading user profile:', error);
        setProfileError(t('rentalPostDetail.rentalRequest.errors.loadProfileFailed'));
      } finally {
        setLoadingUserProfile(false);
      }
    }
  };

  const validateRentalRequest = () => {
    const errors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!rentalRequestData.checkinDate) {
      errors.checkinDate = t('rentalPostDetail.rentalRequest.errors.checkinRequired');
    } else {
      const checkinDate = new Date(rentalRequestData.checkinDate);
      if (checkinDate < today) {
        errors.checkinDate = t('rentalPostDetail.rentalRequest.errors.checkinPast');
      }
    }

    if (!rentalRequestData.checkoutDate) {
      errors.checkoutDate = t('rentalPostDetail.rentalRequest.errors.checkoutRequired');
    } else if (rentalRequestData.checkinDate) {
      const checkinDate = new Date(rentalRequestData.checkinDate);
      const checkoutDate = new Date(rentalRequestData.checkoutDate);
      const minCheckout = new Date(checkinDate);
      minCheckout.setMonth(minCheckout.getMonth() + 1);

      if (checkoutDate < minCheckout) {
        errors.checkoutDate = t('rentalPostDetail.rentalRequest.errors.checkoutMinOneMonth');
      }
    }

    if (!rentalRequestData.numberOfOccupants || rentalRequestData.numberOfOccupants < 1) {
      errors.numberOfOccupants = t('rentalPostDetail.rentalRequest.errors.occupantsMin');
    }

    // Validate identity profile info
    if (!rentalRequestData.fullName?.trim()) {
      errors.fullName = t('rentalPostDetail.rentalRequest.errors.fullNameRequired');
    }
    if (!rentalRequestData.phone?.trim()) {
      errors.phone = t('rentalPostDetail.rentalRequest.errors.phoneRequired');
    }
    if (!rentalRequestData.citizenIdNumber?.trim()) {
      errors.citizenIdNumber = t('rentalPostDetail.rentalRequest.errors.cccdRequired');
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

      const requestData = {
        CheckinDate: new Date(rentalRequestData.checkinDate).toISOString(),
        CheckoutDate: new Date(rentalRequestData.checkoutDate).toISOString(),
        NumberOfOccupants: parseInt(rentalRequestData.numberOfOccupants),
        // Identity Profile fields
        Gender: parseInt(rentalRequestData.gender) || 0,
        FullName: rentalRequestData.fullName,
        Avatar: rentalRequestData.avatar || '',
        DateOfBirth: rentalRequestData.dateOfBirth
          ? new Date(rentalRequestData.dateOfBirth).toISOString()
          : null,
        Phone: rentalRequestData.phone,
        Email: rentalRequestData.email || '',
        ProvinceId: rentalRequestData.provinceId || '',
        ProvinceName: rentalRequestData.provinceName || '',
        WardId: rentalRequestData.wardId || '',
        WardName: rentalRequestData.wardName || '',
        Address: rentalRequestData.address || '',
        TemporaryResidence: rentalRequestData.temporaryResidence || '',
        CitizenIdNumber: rentalRequestData.citizenIdNumber,
        CitizenIdIssuedDate: rentalRequestData.citizenIdIssuedDate
          ? new Date(rentalRequestData.citizenIdIssuedDate).toISOString()
          : null,
        CitizenIdIssuedPlace: rentalRequestData.citizenIdIssuedPlace || '',
        FrontImageUrl: rentalRequestData.frontImageUrl || '',
        BackImageUrl: rentalRequestData.backImageUrl || ''
      };

      console.log('📝 Submitting rental request with full profile:', { ownerId, roomId, requestData });

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

              {/* Address highlight */}
              {houseLocation && houseLocation.fullAddress && (
                <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        📍 {t('rentalPostDetail.location')}
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
                            Room ID: {roomId.substring(0, 13)}...
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
                {t('rentalPostDetail.propertyDetails')}
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('rentalPostDetail.house')}</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {post.houseName || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('rentalPostDetail.room')}</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {post.roomName || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('rentalPostDetail.contact')}</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {post.contactPhone || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('rentalPostDetail.postedBy')}</p>
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
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('rentalPostDetail.address')}</p>
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

                    {/* <button className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2">
                      <Phone className="h-4 w-4" />
                      {t('rentalPostDetail.callOwner')}
                    </button> */}
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
              {/* Loading state */}
              {loadingUserProfile && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {t('rentalPostDetail.rentalRequest.loadingProfile')}
                  </p>
                </div>
              )}

              {/* Profile Error */}
              {profileError && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">
                      {profileError}
                    </p>
                    <button
                      onClick={() => router.push('/profile')}
                      className="text-sm text-yellow-600 dark:text-yellow-400 underline mt-1 hover:text-yellow-800"
                    >
                      {t('rentalPostDetail.rentalRequest.updateProfile')}
                    </button>
                  </div>
                </div>
              )}

              {!loadingUserProfile && (
                <>
                  {/* Section: Rental Info */}
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-green-600" />
                      {t('rentalPostDetail.rentalRequest.rentalInfoSection')}
                    </h4>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Check-in Date */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          {t('rentalPostDetail.rentalRequest.checkinDate')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={rentalRequestData.checkinDate}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setRentalRequestData({ ...rentalRequestData, checkinDate: e.target.value })}
                          className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${rentalRequestErrors.checkinDate ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {rentalRequestErrors.checkinDate && (
                          <p className="mt-1 text-xs text-red-500">{rentalRequestErrors.checkinDate}</p>
                        )}
                      </div>

                      {/* Check-out Date */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          {t('rentalPostDetail.rentalRequest.checkoutDate')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={rentalRequestData.checkoutDate}
                          min={rentalRequestData.checkinDate || new Date().toISOString().split('T')[0]}
                          onChange={(e) => setRentalRequestData({ ...rentalRequestData, checkoutDate: e.target.value })}
                          className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${rentalRequestErrors.checkoutDate ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {rentalRequestErrors.checkoutDate && (
                          <p className="mt-1 text-xs text-red-500">{rentalRequestErrors.checkoutDate}</p>
                        )}
                      </div>
                    </div>

                    {/* Number of Occupants */}
                    <div className="mt-3">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        <Users className="h-3 w-3 inline mr-1" />
                        {t('rentalPostDetail.rentalRequest.numberOfOccupants')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={rentalRequestData.numberOfOccupants}
                        min="1"
                        max="10"
                        onChange={(e) => setRentalRequestData({ ...rentalRequestData, numberOfOccupants: parseInt(e.target.value) || 1 })}
                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${rentalRequestErrors.numberOfOccupants ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {rentalRequestErrors.numberOfOccupants && (
                        <p className="mt-1 text-xs text-red-500">{rentalRequestErrors.numberOfOccupants}</p>
                      )}
                    </div>
                  </div>

                  {/* Section: Personal Info */}
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" />
                      {t('rentalPostDetail.rentalRequest.personalInfoSection')}
                    </h4>

                    <div className="space-y-3">
                      {/* Full Name */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          {t('rentalPostDetail.rentalRequest.fullName')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={rentalRequestData.fullName}
                          onChange={(e) => setRentalRequestData({ ...rentalRequestData, fullName: e.target.value })}
                          className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${rentalRequestErrors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder={t('rentalPostDetail.rentalRequest.fullNamePlaceholder')}
                        />
                        {rentalRequestErrors.fullName && (
                          <p className="mt-1 text-xs text-red-500">{rentalRequestErrors.fullName}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {/* Phone */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            <Phone className="h-3 w-3 inline mr-1" />
                            {t('rentalPostDetail.rentalRequest.phone')} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            value={rentalRequestData.phone}
                            onChange={(e) => setRentalRequestData({ ...rentalRequestData, phone: e.target.value })}
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${rentalRequestErrors.phone ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="0901234567"
                          />
                          {rentalRequestErrors.phone && (
                            <p className="mt-1 text-xs text-red-500">{rentalRequestErrors.phone}</p>
                          )}
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            <Mail className="h-3 w-3 inline mr-1" />
                            {t('rentalPostDetail.rentalRequest.email')}
                          </label>
                          <input
                            type="email"
                            value={rentalRequestData.email}
                            onChange={(e) => setRentalRequestData({ ...rentalRequestData, email: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="email@example.com"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {/* Gender */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            {t('rentalPostDetail.rentalRequest.gender')}
                          </label>
                          <select
                            value={rentalRequestData.gender}
                            onChange={(e) => setRentalRequestData({ ...rentalRequestData, gender: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          >
                            <option value={0}>{t('rentalPostDetail.rentalRequest.genderMale')}</option>
                            <option value={1}>{t('rentalPostDetail.rentalRequest.genderFemale')}</option>
                            <option value={2}>{t('rentalPostDetail.rentalRequest.genderOther')}</option>
                          </select>
                        </div>

                        {/* Date of Birth */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            {t('rentalPostDetail.rentalRequest.dateOfBirth')}
                          </label>
                          <input
                            type="date"
                            value={rentalRequestData.dateOfBirth}
                            onChange={(e) => setRentalRequestData({ ...rentalRequestData, dateOfBirth: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                      </div>

                      {/* Address */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          <MapPin className="h-3 w-3 inline mr-1" />
                          {t('rentalPostDetail.rentalRequest.address')}
                        </label>
                        <input
                          type="text"
                          value={`${rentalRequestData.address}${rentalRequestData.wardName ? ', ' + rentalRequestData.wardName : ''}${rentalRequestData.provinceName ? ', ' + rentalRequestData.provinceName : ''}`}
                          readOnly
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-600 dark:border-gray-600 dark:text-gray-300"
                          placeholder={t('rentalPostDetail.rentalRequest.addressPlaceholder')}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section: CCCD Info */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-purple-600" />
                      {t('rentalPostDetail.rentalRequest.cccdSection')}
                    </h4>

                    <div className="space-y-3">
                      {/* CCCD Number */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          {t('rentalPostDetail.rentalRequest.cccdNumber')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={rentalRequestData.citizenIdNumber}
                          onChange={(e) => setRentalRequestData({ ...rentalRequestData, citizenIdNumber: e.target.value })}
                          className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${rentalRequestErrors.citizenIdNumber ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder="0123456789012"
                        />
                        {rentalRequestErrors.citizenIdNumber && (
                          <p className="mt-1 text-xs text-red-500">{rentalRequestErrors.citizenIdNumber}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {/* Issue Date */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            {t('rentalPostDetail.rentalRequest.cccdIssuedDate')}
                          </label>
                          <input
                            type="date"
                            value={rentalRequestData.citizenIdIssuedDate}
                            onChange={(e) => setRentalRequestData({ ...rentalRequestData, citizenIdIssuedDate: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>

                        {/* Issue Place */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            {t('rentalPostDetail.rentalRequest.cccdIssuedPlace')}
                          </label>
                          <input
                            type="text"
                            value={rentalRequestData.citizenIdIssuedPlace}
                            onChange={(e) => setRentalRequestData({ ...rentalRequestData, citizenIdIssuedPlace: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder={t('rentalPostDetail.rentalRequest.cccdIssuedPlacePlaceholder')}
                          />
                        </div>
                      </div>

                      {/* CCCD Images Preview */}
                      {(rentalRequestData.frontImageUrl || rentalRequestData.backImageUrl) && (
                        <div className="grid grid-cols-2 gap-3">
                          {rentalRequestData.frontImageUrl && (
                            <div>
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                {t('rentalPostDetail.rentalRequest.cccdFront')}
                              </label>
                              <img
                                src={rentalRequestData.frontImageUrl}
                                alt="CCCD Front"
                                className="w-full h-20 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                              />
                            </div>
                          )}
                          {rentalRequestData.backImageUrl && (
                            <div>
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                {t('rentalPostDetail.rentalRequest.cccdBack')}
                              </label>
                              <img
                                src={rentalRequestData.backImageUrl}
                                alt="CCCD Back"
                                className="w-full h-20 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      💡 {t('rentalPostDetail.rentalRequest.infoNote')}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowRentalRequestModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                {t('rentalPostDetail.rentalRequest.cancel')}
              </button>
              <button
                onClick={handleSubmitRentalRequest}
                disabled={submittingRentalRequest || loadingUserProfile}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submittingRentalRequest ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    {t('rentalPostDetail.rentalRequest.submitting')}
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    {t('rentalPostDetail.rentalRequest.submit')}
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
