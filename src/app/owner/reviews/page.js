'use client';

import { useState, useEffect } from 'react';
import { reviewAPI } from '@/utils/api';

export default function OwnerReviewsPage() {
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

  useEffect(() => {
    setMounted(true);
    loadReviews();
    loadReviewReplies();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await reviewAPI.getAllReviews({ $orderby: 'createdAt desc' });
      const reviewData = response.value || response || [];
      setReviews(reviewData);
    } catch (err) {
      console.error('Error loading reviews:', err);
      setError('Không thể tải danh sách đánh giá. Vui lòng thử lại.');
      setReviews([]);
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
      setReviewReplies(repliesMap);
    } catch (err) {
      console.error('Error loading review replies:', err);
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
      alert('Vui lòng nhập nội dung phản hồi');
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
        setSuccess('Cập nhật phản hồi thành công!');
      } else {
        await reviewAPI.createReviewReply(selectedReview.id, formData);
        setSuccess('Gửi phản hồi thành công!');
      }

      await loadReviewReplies();
      setShowResponseModal(false);
      setSelectedReview(null);
      setResponseData({ content: '', image: null });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error submitting response:', err);
      setError(err.message || 'Không thể gửi phản hồi. Vui lòng thử lại.');
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
      setError('Không thể xóa phản hồi. Vui lòng thử lại.');
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
          <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải đánh giá...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">📝 Quản Lý Đánh Giá</h1>
          <p className="text-gray-600 dark:text-gray-400">Xem và phản hồi đánh giá từ khách hàng</p>
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
                <p className="text-sm text-gray-600 dark:text-gray-400">Tổng Đánh Giá</p>
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
                <p className="text-sm text-gray-600 dark:text-gray-400">Chưa Phản Hồi</p>
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
                <p className="text-sm text-gray-600 dark:text-gray-400">Đã Phản Hồi</p>
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
                <p className="text-sm text-gray-600 dark:text-gray-400">Đánh Giá TB</p>
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
                { key: 'all', label: 'Tất Cả', count: stats.total },
                { key: 'pending', label: 'Chưa Phản Hồi', count: stats.pending },
                { key: 'responded', label: 'Đã Phản Hồi', count: stats.responded },
                { key: 'positive', label: 'Tích Cực (4-5⭐)', count: reviews.filter(r => r.rating >= 4).length },
                { key: 'negative', label: 'Tiêu Cực (1-2⭐)', count: reviews.filter(r => r.rating <= 2).length }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.key
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
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Chưa có đánh giá nào</h3>
              <p className="text-gray-600 dark:text-gray-400">Các đánh giá từ khách hàng sẽ hiển thị ở đây</p>
            </div>
          ) : (
            filteredReviews.map((review) => {
              const reply = reviewReplies[review.id];
              const hasReply = !!reply;

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
                            {hasReply ? '✓ Đã phản hồi' : '⏳ Chưa phản hồi'}
                          </span>
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
                    <button
                      onClick={() => handleOpenResponseModal(review)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                      {hasReply ? 'Chỉnh Sửa Phản Hồi' : 'Phản Hồi'}
                    </button>
                  </div>

                  {reply && (
                    <div className="mt-4 ml-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border-l-4 border-blue-500">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <p className="font-semibold text-blue-900 dark:text-blue-100">Phản Hồi Của Chủ Nhà</p>
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
                        {reply.updatedAt !== reply.createdAt && ' (đã chỉnh sửa)'}
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
                  {reviewReplies[selectedReview.id] ? 'Chỉnh Sửa Phản Hồi' : 'Phản Hồi Đánh Giá'}
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
                    Nội dung phản hồi <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={responseData.content}
                    onChange={(e) => setResponseData(prev => ({ ...prev, content: e.target.value }))}
                    rows={5}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Nhập nội dung phản hồi của bạn..."
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Hình ảnh (Tùy chọn)</label>
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
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Đang gửi...
                      </>
                    ) : (
                      reviewReplies[selectedReview.id] ? 'Cập Nhật' : 'Gửi Phản Hồi'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
