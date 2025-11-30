'use client';

import { useState, useEffect } from 'react';
import { reviewAPI } from '@/utils/api';
import { useTranslation } from '@/hooks/useTranslation';

// ============ MOCK DATA FOR DEMO - DELETE AFTER SCREENSHOT ============
const MOCK_REVIEWS = [
  {
    id: 'review-001',
    userId: 'user-001',
    userName: 'Trần Thị Bình',
    roomId: 'room-001',
    roomName: 'Phòng A101 - Studio Premium',
    houseName: 'Nhà trọ Sunshine Residence',
    rating: 5,
    content: 'Phòng rất đẹp và sạch sẽ, chủ nhà nhiệt tình. Nội thất đầy đủ, tiện nghi. Vị trí trung tâm, đi lại thuận tiện. Rất hài lòng với phòng này! Sẽ giới thiệu cho bạn bè.',
    imageUrl: '/image.png',
    createdAt: '2025-11-28T10:00:00Z'
  },
  {
    id: 'review-002',
    userId: 'user-002',
    userName: 'Lê Minh Cường',
    roomId: 'room-002',
    roomName: 'Phòng B205 - Standard',
    houseName: 'Nhà trọ Phú Mỹ Hưng',
    rating: 4,
    content: 'Phòng ổn, giá hợp lý cho vị trí gần trung tâm. Wifi ổn định, máy lạnh mát. Chỉ hơi ồn vào ban đêm do gần đường lớn. Nhìn chung vẫn đáng để thuê.',
    imageUrl: null,
    createdAt: '2025-11-26T14:30:00Z'
  },
  {
    id: 'review-003',
    userId: 'user-003',
    userName: 'Phạm Hoàng Dũng',
    roomId: 'room-001',
    roomName: 'Phòng A101 - Studio Premium',
    houseName: 'Nhà trọ Sunshine Residence',
    rating: 5,
    content: 'Tuyệt vời! Đã ở được 6 tháng, không có gì phàn nàn. Chủ nhà rất tốt, hỗ trợ sửa chữa nhanh chóng khi có vấn đề. Điện nước giá nhà nước, hợp lý.',
    imageUrl: '/image.png',
    createdAt: '2025-11-24T09:00:00Z'
  },
  {
    id: 'review-004',
    userId: 'user-004',
    userName: 'Nguyễn Thị Hồng',
    roomId: 'room-003',
    roomName: 'Phòng C301 - Có gác',
    houseName: 'Nhà trọ Bình Thạnh Home',
    rating: 3,
    content: 'Phòng tạm ổn nhưng hơi chật cho 2 người. Gác lửng khá thấp. Bảo vệ không có 24/7. Mong chủ nhà cải thiện thêm.',
    imageUrl: null,
    createdAt: '2025-11-22T16:45:00Z'
  },
  {
    id: 'review-005',
    userId: 'user-005',
    userName: 'Võ Văn Thành',
    roomId: 'room-004',
    roomName: 'Phòng D401 - VIP Suite',
    houseName: 'Nhà trọ Central Park',
    rating: 5,
    content: 'Phòng VIP đúng như mô tả. Ban công view cực đẹp, nhìn ra thành phố. Nội thất cao cấp, máy giặt riêng rất tiện. Đáng đồng tiền bát gạo!',
    imageUrl: '/image.png',
    createdAt: '2025-11-20T11:30:00Z'
  },
  {
    id: 'review-006',
    userId: 'user-006',
    userName: 'Đặng Thị Mai',
    roomId: 'room-002',
    roomName: 'Phòng B205 - Standard',
    houseName: 'Nhà trọ Phú Mỹ Hưng',
    rating: 2,
    content: 'Phòng không như hình ảnh đăng. Nội thất cũ kỹ, máy lạnh yếu. Cần cải thiện nhiều. Không hài lòng lắm với trải nghiệm này.',
    imageUrl: null,
    createdAt: '2025-11-18T08:00:00Z'
  }
];

const MOCK_REVIEW_REPLIES = {
  'review-001': {
    id: 'reply-001',
    reviewId: 'review-001',
    content: 'Cảm ơn bạn đã đánh giá tích cực! Chúng tôi rất vui khi bạn hài lòng với phòng. Chúc bạn ở vui vẻ!',
    createdAt: '2025-11-28T12:00:00Z'
  },
  'review-003': {
    id: 'reply-003',
    reviewId: 'review-003',
    content: 'Xin cảm ơn bạn đã ở với chúng tôi suốt 6 tháng qua. Chúng tôi luôn cố gắng hỗ trợ khách hàng tốt nhất!',
    createdAt: '2025-11-24T15:00:00Z'
  }
};

const MOCK_REVIEW_REPORTS = {
  'review-006': {
    id: 'report-001',
    reviewId: 'review-006',
    reason: 'Đánh giá không chính xác, phòng đã được nâng cấp nội thất mới',
    createdAt: '2025-11-19T10:00:00Z',
    status: 'pending'
  }
};
// ============ END MOCK DATA ============

export default function OwnerReviewsPage() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [reviews, setReviews] = useState([]);
  const [reviewReplies, setReviewReplies] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [responseData, setResponseData] = useState({ content: '', image: null });
  const [submitting, setSubmitting] = useState(false);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState({ reason: '', images: [] });
  const [reviewReports, setReviewReports] = useState({});

  useEffect(() => {
    setMounted(true);
    loadReviews();
    loadReviewReplies();
    loadReviewReports();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await reviewAPI.getAllReviews({ $orderby: 'createdAt desc' });
      const reviewData = response.value || response || [];
      // ============ USE MOCK DATA IF NO REAL DATA ============
      const dataToUse = reviewData && reviewData.length > 0 ? reviewData : MOCK_REVIEWS;
      setReviews(dataToUse);
      // ============ END MOCK DATA USAGE ============
    } catch (err) {
      console.error('Error loading reviews:', err);
      // ============ USE MOCK DATA ON ERROR ============
      setReviews(MOCK_REVIEWS);
      // ============ END MOCK DATA ON ERROR ============
    } finally {
      setLoading(false);
    }
  };

  const loadReviewReplies = async () => {
    try {
      const response = await reviewAPI.getAllReviewReplies();
      const replies = response.value || response || [];
      const repliesMap = {};
      replies.forEach(reply => { repliesMap[reply.reviewId] = reply; });
      // ============ USE MOCK DATA IF NO REAL DATA ============
      const dataToUse = Object.keys(repliesMap).length > 0 ? repliesMap : MOCK_REVIEW_REPLIES;
      setReviewReplies(dataToUse);
      // ============ END MOCK DATA USAGE ============
    } catch (err) {
      console.error('Error loading review replies:', err);
      // ============ USE MOCK DATA ON ERROR ============
      setReviewReplies(MOCK_REVIEW_REPLIES);
      // ============ END MOCK DATA ON ERROR ============
    }
  };

  const loadReviewReports = async () => {
    try {
      const response = await reviewAPI.getAllReviewReports();
      const reports = response.value || response || [];
      const reportsMap = {};
      reports.forEach(report => { reportsMap[report.reviewId] = report; });
      // ============ USE MOCK DATA IF NO REAL DATA ============
      const dataToUse = Object.keys(reportsMap).length > 0 ? reportsMap : MOCK_REVIEW_REPORTS;
      setReviewReports(dataToUse);
      // ============ END MOCK DATA USAGE ============
    } catch (err) {
      console.error('Error loading review reports:', err);
      // ============ USE MOCK DATA ON ERROR ============
      setReviewReports(MOCK_REVIEW_REPORTS);
      // ============ END MOCK DATA ON ERROR ============
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-lg ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusColor = (hasReply) => hasReply
    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600 dark:text-green-400';
    if (rating >= 3) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const filteredReviews = reviews.filter(review => {
    const hasReply = !!reviewReplies[review.id];
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return !hasReply;
    if (activeTab === 'responded') return hasReply;
    if (activeTab === 'positive') return review.rating >= 4;
    if (activeTab === 'negative') return review.rating <= 2;
    return true;
  });

  const handleOpenResponseModal = (review) => {
    const existingReply = reviewReplies[review.id];
    setSelectedReview(review);
    setResponseData({ content: existingReply?.content || '', image: null });
    setShowResponseModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setResponseData(prev => ({ ...prev, image: file }));
  };

  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    if (!responseData.content.trim()) {
      alert(t('ownerReviews.messages.enterReply'));
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('Content', responseData.content);
      if (responseData.image) formData.append('Image', responseData.image);

      const existingReply = reviewReplies[selectedReview.id];
      if (existingReply) {
        await reviewAPI.updateReviewReply(existingReply.id, formData);
        setSuccess(t('ownerReviews.messages.replyUpdateSuccess'));
      } else {
        await reviewAPI.createReviewReply(selectedReview.id, formData);
        setSuccess(t('ownerReviews.messages.replySuccess'));
      }

      await loadReviewReplies();
      setShowResponseModal(false);
      setSelectedReview(null);
      setResponseData({ content: '', image: null });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error submitting response:', err);
      setError(err.message || t('ownerReviews.errors.replyFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReply = async (replyId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa phản hồi này?')) return;
    try {
      await reviewAPI.deleteReviewReply(replyId);
      setSuccess('Xóa phản hồi thành công!');
      await loadReviewReplies();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting reply:', err);
      setError(t('ownerReviews.errors.deleteReplyFailed'));
    }
  };

  const handleOpenReportModal = (review) => {
    const existingReport = reviewReports[review.id];
    setSelectedReview(review);
    setReportData({ reason: existingReport?.reason || '', images: [] });
    setShowReportModal(true);
  };

  const handleReportFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setReportData(prev => ({ ...prev, images: files }));
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!reportData.reason.trim()) {
      alert(t('ownerReviews.messages.enterReason'));
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('Reason', reportData.reason);
      if (reportData.images && reportData.images.length > 0) {
        reportData.images.forEach((image) => {
          formData.append('Images', image);
        });
      }

      const existingReport = reviewReports[selectedReview.id];
      if (existingReport) {
        await reviewAPI.updateReviewReport(selectedReview.id, formData);
        setSuccess(t('ownerReviews.messages.reportUpdateSuccess'));
      } else {
        await reviewAPI.createReviewReport(selectedReview.id, formData);
        setSuccess(t('ownerReviews.messages.reportSuccess'));
      }

      await loadReviewReports();
      setShowReportModal(false);
      setSelectedReview(null);
      setReportData({ reason: '', images: [] });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error submitting report:', err);
      setError(err.message || t('ownerReviews.errors.reportFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const stats = {
    total: reviews.length,
    pending: reviews.filter(r => !reviewReplies[r.id]).length,
    responded: reviews.filter(r => !!reviewReplies[r.id]).length,
    avgRating: reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('ownerReviews.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('ownerReviews.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t('ownerReviews.subtitle')}</p>
        </div>

        {success && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-green-800 dark:text-green-200">{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('ownerReviews.stats.totalReviews')}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('ownerReviews.stats.pending')}</p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">{stats.pending}</p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('ownerReviews.stats.responded')}</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{stats.responded}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('ownerReviews.stats.avgRating')}</p>
                <div className="flex items-center mt-2">
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.avgRating}</p>
                  <span className="text-yellow-400 ml-2 text-2xl">★</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { key: 'all', label: t('ownerReviews.tabs.all'), count: stats.total },
                { key: 'pending', label: t('ownerReviews.tabs.pending'), count: stats.pending },
                { key: 'responded', label: t('ownerReviews.tabs.responded'), count: stats.responded },
                { key: 'positive', label: t('ownerReviews.tabs.positive'), count: reviews.filter(r => r.rating >= 4).length },
                { key: 'negative', label: t('ownerReviews.tabs.negative'), count: reviews.filter(r => r.rating <= 2).length }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.key
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                >
                  {tab.label}
                  <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-gray-100 dark:bg-gray-700">{tab.count}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="space-y-6">
          {filteredReviews.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('ownerReviews.emptyState.title')}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t('ownerReviews.emptyState.description')}</p>
            </div>
          ) : (
            filteredReviews.map((review) => {
              const reply = reviewReplies[review.id];
              const report = reviewReports[review.id];
              const hasReply = !!reply;
              const hasReport = !!report;
              // backend may serialize boolean as IsHidden or isHidden
              const isHidden = review.isHidden ?? review.IsHidden ?? false;

              return (
                <div key={review.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {review.userId.toString().slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">User ID: {review.userId}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(hasReply)}`}>
                            {hasReply ? t('ownerReviews.status.responded') : t('ownerReviews.status.pending')}
                          </span>
                          {hasReport && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${report.status === 0 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                              report.status === 1 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>
                              {report.status === 0 ? t('ownerReviews.status.reportProcessing') :
                                report.status === 1 ? t('ownerReviews.status.reportApproved') :
                                  t('ownerReviews.status.reportRejected')}
                            </span>
                          )}

                          {isHidden && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              {t('ownerReviews.status.hidden')}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Room ID: {review.roomId} | Contract ID: {review.contractId}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center mb-1">{renderStars(review.rating)}</div>
                      <p className={`text-sm font-semibold ${getRatingColor(review.rating)}`}>{review.rating}/5</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{review.content}</p>
                    {review.imageUrl && (
                      <div className="mt-4">
                        <img src={review.imageUrl} alt="Review" className="rounded-lg max-w-md" onError={(e) => { e.target.style.display = 'none'; }} />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(review.createdAt)}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenReportModal(review)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        {hasReport ? t('ownerReviews.actions.viewReport') : t('ownerReviews.actions.report')}
                      </button>
                      <button
                        onClick={() => handleOpenResponseModal(review)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                        {hasReply ? t('ownerReviews.actions.editReply') : t('ownerReviews.actions.reply')}
                      </button>
                    </div>
                  </div>

                  {reply && (
                    <div className="mt-4 ml-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border-l-4 border-blue-500">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <p className="font-semibold text-blue-900 dark:text-blue-100">{t('ownerReviews.replySection.ownerReply')}</p>
                        </div>
                        <button onClick={() => handleDeleteReply(reply.id)} className="text-red-600 hover:text-red-700 dark:text-red-400">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-2">{reply.content}</p>
                      {reply.image && (
                        <img src={reply.image} alt="Reply" className="rounded-lg max-w-sm mt-2" onError={(e) => { e.target.style.display = 'none'; }} />
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {formatDate(reply.createdAt)}
                        {reply.updatedAt !== reply.createdAt && ` (${t('ownerReviews.replySection.edited')})`}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {showResponseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {reviewReplies[selectedReview.id] ? t('ownerReviews.modal.editReply') : t('ownerReviews.modal.replyToReview')}
                </h3>
              </div>

              <form onSubmit={handleSubmitResponse} className="p-6">
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center mb-2">
                    {renderStars(selectedReview.rating)}
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{selectedReview.rating}/5</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{selectedReview.content}</p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('ownerReviews.modal.replyContent')} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={responseData.content}
                    onChange={(e) => setResponseData(prev => ({ ...prev, content: e.target.value }))}
                    rows={5}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder={t('ownerReviews.modal.replyPlaceholder')}
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('ownerReviews.modal.imageOptional')}</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowResponseModal(false);
                      setSelectedReview(null);
                      setResponseData({ content: '', image: null });
                    }}
                    className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
                  >
                    {t('ownerReviews.modal.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        {t('ownerReviews.modal.sending')}
                      </>
                    ) : (
                      reviewReplies[selectedReview.id] ? t('ownerReviews.modal.update') : t('ownerReviews.modal.sendReply')
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showReportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {reviewReports[selectedReview.id] ? t('ownerReviews.modal.viewReport') : t('ownerReviews.modal.reportReview')}
                </h3>
              </div>

              <form onSubmit={handleSubmitReport} className="p-6">
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center mb-2">
                    {renderStars(selectedReview.rating)}
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{selectedReview.rating}/5</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{selectedReview.content}</p>
                  {selectedReview.imageUrl && (
                    <div className="mt-4">
                      <img src={selectedReview.imageUrl} alt="Review" className="rounded-lg max-w-md" onError={(e) => { e.target.style.display = 'none'; }} />
                    </div>
                  )}
                </div>

                {reviewReports[selectedReview.id] && (
                  <div className="mb-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-l-4 border-orange-500">
                    <p className="text-sm font-medium text-orange-900 dark:text-orange-200 mb-2">
                      {t('ownerReviews.modal.statusLabel')}: {
                        reviewReports[selectedReview.id].status === 0 ? t('ownerReviews.modal.statusPending') :
                          reviewReports[selectedReview.id].status === 1 ? t('ownerReviews.modal.statusApproved') :
                            t('ownerReviews.modal.statusRejected')
                      }
                    </p>
                    {reviewReports[selectedReview.id].rejectReason && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                        <strong>{t('ownerReviews.modal.rejectReason')}:</strong> {reviewReports[selectedReview.id].rejectReason}
                      </p>
                    )}
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('ownerReviews.modal.reportReason')} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={reportData.reason}
                    onChange={(e) => setReportData(prev => ({ ...prev, reason: e.target.value }))}
                    rows={5}
                    required
                    disabled={reviewReports[selectedReview.id]?.status === 0}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                    placeholder={t('ownerReviews.modal.reportPlaceholder')}
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {t('ownerReviews.modal.maxChars')}
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('ownerReviews.modal.evidenceImages')}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleReportFileChange}
                    disabled={reviewReports[selectedReview.id]?.status === 0}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {t('ownerReviews.modal.multipleImages')}
                  </p>
                  {reviewReports[selectedReview.id]?.images && reviewReports[selectedReview.id].images.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {reviewReports[selectedReview.id].images.map((img, idx) => (
                        <img key={idx} src={img} alt={`Report ${idx + 1}`} className="rounded-lg w-full h-24 object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReportModal(false);
                      setSelectedReview(null);
                      setReportData({ reason: '', images: [] });
                    }}
                    className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
                  >
                    {reviewReports[selectedReview.id] ? t('ownerReviews.modal.close') : t('ownerReviews.modal.cancel')}
                  </button>
                  {!reviewReports[selectedReview.id] || reviewReports[selectedReview.id].status !== 0 ? (
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          {t('ownerReviews.modal.sending')}
                        </>
                      ) : (
                        reviewReports[selectedReview.id] ? t('ownerReviews.modal.updateReport') : t('ownerReviews.modal.sendReport')
                      )}
                    </button>
                  ) : null}
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
