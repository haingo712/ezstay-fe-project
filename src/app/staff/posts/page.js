'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { rentalPostService } from '@/services/rentalPostService';
import { useTranslation } from '@/hooks/useTranslation';
import {
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  Home,
  User,
  Phone,
  Calendar,
  Eye,
  RefreshCw,
  FileText,
  MapPin,
  DollarSign,
  Maximize2
} from 'lucide-react';
import Image from 'next/image';
import { toast } from 'react-toastify';

export default function PostsReviewPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [posts, setPosts] = useState([]);
  const [processingId, setProcessingId] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Load pending posts from API
  const loadPendingPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📋 Loading pending posts for staff review...');

      const response = await rentalPostService.getPendingPosts();
      setPosts(response || []);
      console.log('✅ Pending posts loaded:', response);
    } catch (error) {
      console.error('❌ Error loading pending posts:', error);
      setError(t('staffPosts.loadError') || 'Failed to load pending posts. Please try again.');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && user) {
      loadPendingPosts();
    }
  }, [mounted, user, loadPendingPosts]);

  const filteredPosts = posts.filter(post => {
    const status = post.isApproved ?? post.IsApproved;
    if (activeTab === 'pending') return status === 0;
    if (activeTab === 'approved') return status === 1;
    if (activeTab === 'rejected') return status === 2;
    return true;
  });

  const handleApprove = async (postId) => {
    setConfirmMessage(t('staffPosts.confirmApprove') || 'Bạn có chắc muốn duyệt bài đăng này? Bài đăng sẽ hiển thị cho tất cả người dùng.');
    setConfirmAction(() => async () => {
      try {
        setProcessingId(postId);
        setShowConfirmModal(false);
        await rentalPostService.approvePost(postId);
        await loadPendingPosts();
        setSuccessMessage(t('staffPosts.approveSuccess') || 'Bài đăng đã được duyệt thành công!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error('Error approving post:', error);
        toast.error(t('staffPosts.approveError') || 'Không thể duyệt bài đăng. Vui lòng thử lại.');
      } finally {
        setProcessingId(null);
      }
    });
    setShowConfirmModal(true);
  };

  const handleReject = async (postId) => {
    setConfirmMessage(t('staffPosts.confirmReject') || 'Bạn có chắc muốn từ chối bài đăng này?');
    setConfirmAction(() => async () => {
      try {
        setProcessingId(postId);
        setShowConfirmModal(false);
        await rentalPostService.rejectPost(postId);
        await loadPendingPosts();
        setSuccessMessage(t('staffPosts.rejectSuccess') || 'Bài đăng đã bị từ chối.');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error('Error rejecting post:', error);
        toast.error(t('staffPosts.rejectError') || 'Không thể từ chối bài đăng. Vui lòng thử lại.');
      } finally {
        setProcessingId(null);
      }
    });
    setShowConfirmModal(true);
  };

  const handleViewDetail = async (post) => {
    try {
      setShowDetailModal(true);
      setSelectedPost({ ...post, loading: true }); // Show modal with loading state

      console.log('👁️ Fetching full post details for ID:', post.id);

      // Fetch full post details from API
      const fullPost = await rentalPostService.getPostById(post.id);
      console.log('✅ Full post data received:', fullPost);
      console.log('Full post structure:', {
        id: fullPost.id,
        title: fullPost.title,
        content: fullPost.content,
        imageUrls: fullPost.imageUrls,
        houseName: fullPost.houseName,
        roomName: fullPost.roomName,
        authorName: fullPost.authorName,
        contactPhone: fullPost.contactPhone,
        isApproved: fullPost.isApproved,
        isActive: fullPost.isActive,
        createdAt: fullPost.createdAt,
        updatedAt: fullPost.updatedAt,
        room: fullPost.room,
        'room.price': fullPost.room?.price,
        'room.area': fullPost.room?.area,
        'room.amenities': fullPost.room?.amenities,
        boardingHouse: fullPost.boardingHouse
      });

      setSelectedPost(fullPost);
    } catch (error) {
      console.error('❌ Error fetching post details:', error);
      toast.error('Không thể tải chi tiết bài đăng. Vui lòng thử lại.');
      setShowDetailModal(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (post) => {
    const status = post.isApproved ?? post.IsApproved;

    if (status === 0) {
      return {
        text: t('staffPosts.status.pending') || 'Chờ duyệt',
        icon: Clock,
        class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      };
    }
    if (status === 1) {
      return {
        text: t('staffPosts.status.approved') || 'Đã duyệt',
        icon: CheckCircle,
        class: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      };
    }
    if (status === 2) {
      return {
        text: t('staffPosts.status.rejected') || 'Đã từ chối',
        icon: XCircle,
        class: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      };
    }
    // Fallback for unknown status
    return {
      text: 'Unknown',
      icon: XCircle,
      class: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    };
  };

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">{t('common.loading') || 'Đang tải...'}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {t('staffPosts.error') || 'Lỗi Tải Bài Đăng'}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
        <button
          onClick={loadPendingPosts}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          {t('staffPosts.retry') || 'Thử Lại'}
        </button>
      </div>
    );
  }

  const pendingCount = posts.filter(p => p.isApproved === null || p.isApproved === undefined).length;
  const approvedCount = posts.filter(p => p.isApproved === 1 || p.isApproved === true).length;
  const rejectedCount = posts.filter(p => p.isApproved === 0 || p.isApproved === false).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="text-white">
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <FileText className="w-7 h-7" />
                {t('staffPosts.title') || 'Quản Lý Bài Đăng'}
              </h1>
              <p className="mt-1 opacity-90">
                {t('staffPosts.subtitle') || 'Duyệt và kiểm duyệt các bài đăng cho thuê'}
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center gap-3">
              <button
                onClick={loadPendingPosts}
                className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                {t('common.refresh') || 'Làm mới'}
              </button>
              <div className="bg-white/20 px-4 py-2 rounded-lg">
                <span className="text-white font-medium">
                  {pendingCount} {t('staffPosts.pendingReviews') || 'bài chờ duyệt'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <nav className="flex">
            {[
              { key: 'pending', label: t('staffPosts.tabs.pending') || 'Chờ duyệt', count: pendingCount, icon: Clock, color: 'yellow' },
              { key: 'approved', label: t('staffPosts.tabs.approved') || 'Đã duyệt', count: approvedCount, icon: CheckCircle, color: 'green' },
              { key: 'rejected', label: t('staffPosts.tabs.rejected') || 'Từ chối', count: rejectedCount, icon: XCircle, color: 'red' }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-4 px-4 font-medium text-sm transition-colors border-b-2 flex items-center justify-center gap-2 ${activeTab === tab.key
                    ? `border-${tab.color}-500 text-${tab.color}-600 dark:text-${tab.color}-400 bg-white dark:bg-gray-800`
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                >
                  <Icon className={`w-4 h-4 ${activeTab === tab.key ? `text-${tab.color}-500` : ''}`} />
                  {tab.label}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${activeTab === tab.key
                    ? `bg-${tab.color}-100 text-${tab.color}-700 dark:bg-${tab.color}-900/30 dark:text-${tab.color}-400`
                    : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Posts List */}
      {posts.length > 0 ? (
        <div className="space-y-4">
          {filteredPosts.map((post) => {
            const status = getStatusBadge(post);
            const StatusIcon = status.icon;
            const isProcessing = processingId === post.id;
            const postStatus = post.isApproved ?? post.IsApproved;
            const isPending = postStatus === 0;

            return (
              <div
                key={post.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    {/* Post Image */}
                    <div className="w-full lg:w-56 h-40 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden flex-shrink-0 relative">
                      {post.imageUrls && post.imageUrls.length > 0 ? (
                        <img
                          src={post.imageUrls[0]}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Home className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      {/* Image count badge */}
                      {post.imageUrls && post.imageUrls.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded-md text-xs font-medium">
                          +{post.imageUrls.length - 1} ảnh
                        </div>
                      )}
                    </div>

                    {/* Post Details */}
                    <div className="flex-1 min-w-0 space-y-4">
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                            {post.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-1.5">
                              <Building2 className="w-4 h-4 text-purple-500" />
                              {post.houseName || 'N/A'}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Home className="w-4 h-4 text-orange-500" />
                              {post.roomName || 'Tất cả phòng'}
                            </span>
                          </div>
                        </div>
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${status.class}`}>
                          <StatusIcon className="w-4 h-4" />
                          {status.text}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {post.description || post.content || 'Không có mô tả'}
                      </p>

                      {/* Post Info Grid */}
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                          <Calendar className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Ngày đăng</p>
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">
                            {formatDate(post.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Contact Info */}
                      {post.contactPhone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Phone className="w-4 h-4 text-green-500" />
                          <span>Liên hệ: {post.contactPhone}</span>
                        </div>
                      )}

                      {/* Actions */}
                      {isPending && (
                        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <button
                            onClick={() => handleApprove(post.id)}
                            disabled={isProcessing}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors shadow-sm"
                          >
                            {isProcessing ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                            {t('staffPosts.actions.approve') || 'Duyệt bài'}
                          </button>

                          <button
                            onClick={() => handleReject(post.id)}
                            disabled={isProcessing}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-lg transition-colors shadow-sm"
                          >
                            {isProcessing ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                            {t('staffPosts.actions.reject') || 'Từ chối'}
                          </button>

                          <button
                            onClick={() => handleViewDetail(post)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            {t('staffPosts.actions.view') || 'Xem chi tiết'}
                          </button>
                        </div>
                      )}

                      {/* Approved/Rejected info */}
                      {!isPending && post.approvedAt && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                          {postStatus === 1 ? 'Đã duyệt' : 'Đã từ chối'} lúc: {formatDate(post.approvedAt)}
                          {post.approvedBy && ` bởi ${post.approvedBy}`}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {t('staffPosts.empty') || 'Không có bài đăng'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {activeTab === 'pending'
              ? (t('staffPosts.emptyPending') || 'Không có bài đăng nào đang chờ duyệt.')
              : activeTab === 'approved'
                ? (t('staffPosts.emptyApproved') || 'Không có bài đăng nào đã duyệt.')
                : (t('staffPosts.emptyRejected') || 'Không có bài đăng nào bị từ chối.')
            }
          </p>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedPost && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <Eye className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t('staffPosts.modal.title') || 'Chi tiết bài đăng'}
                </h2>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Loading State */}
              {selectedPost.loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">{t('staffPosts.modal.loading') || 'Đang tải chi tiết bài đăng...'}</p>
                </div>
              ) : (
                <>
                  {/* Title */}
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      {t('staffPosts.modal.postTitle') || 'Tiêu đề'}
                    </h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedPost.title || 'Untitled'}
                    </p>
                  </div>

                  {/* Images Gallery */}
                  {selectedPost.imageUrls && selectedPost.imageUrls.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <span>🖼️</span>
                        {t('staffPosts.modal.images') || 'Hình ảnh'}
                        <span className="text-sm font-normal text-gray-500">({selectedPost.imageUrls.length})</span>
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {selectedPost.imageUrls.map((url, index) => (
                          <div key={index} className="relative aspect-video rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 shadow-md hover:shadow-xl transition-shadow">
                            <img
                              src={url}
                              alt={`${selectedPost.title} - ${index + 1}`}
                              className="w-full h-full object-cover hover:scale-110 transition-transform duration-300 cursor-pointer"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                              }}
                            />
                            <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                              {index + 1}/{selectedPost.imageUrls.length}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <span>📝</span>
                      {t('staffPosts.modal.description') || 'Mô tả'}
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                        {selectedPost.content || selectedPost.description || (
                          <span className="text-gray-400 italic">{t('staffPosts.modal.noDescription') || 'Không có mô tả'}</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Status and Date */}
                  <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${selectedPost.isApproved === 1 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      selectedPost.isApproved === 2 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                        selectedPost.isApproved === 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                      {selectedPost.isApproved === 1 ? `✓ ${t('staffPosts.status.approved') || 'Đã duyệt'}` :
                        selectedPost.isApproved === 2 ? `✗ ${t('staffPosts.status.rejected') || 'Đã từ chối'}` :
                          selectedPost.isApproved === 0 ? `⏳ ${t('staffPosts.status.pending') || 'Chờ duyệt'}` :
                            `🚫 ${t('staffPosts.status.inactive') || 'Không hoạt động'}`}
                    </span>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <div>📅 {formatDate(selectedPost.createdAt)}</div>
                      {selectedPost.updatedAt && selectedPost.updatedAt !== selectedPost.createdAt && (
                        <div className="mt-1">🔄 {formatDate(selectedPost.updatedAt)}</div>
                      )}
                    </div>
                  </div>

                  {/* Information Grid */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <span>ℹ️</span>
                      {t('staffPosts.modal.detailInfo') || 'Thông tin chi tiết'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Boarding House */}
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                        <div className="flex items-center text-purple-600 dark:text-purple-400 mb-2">
                          <Building2 className="w-5 h-5 mr-2" />
                          <span className="text-sm font-semibold">{t('staffPosts.modal.boardingHouse') || 'Nhà trọ'}</span>
                        </div>
                        <p className="text-gray-900 dark:text-white font-semibold text-lg ml-7">
                          {selectedPost.houseName || 'N/A'}
                        </p>
                      </div>

                      {/* Room */}
                      <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-lg p-4 border border-green-200 dark:border-green-700">
                        <div className="flex items-center text-green-600 dark:text-green-400 mb-2">
                          <Home className="w-5 h-5 mr-2" />
                          <span className="text-sm font-semibold">{t('staffPosts.modal.room') || 'Phòng'}</span>
                        </div>
                        <p className="text-gray-900 dark:text-white font-semibold text-lg ml-7">
                          {selectedPost.room?.roomName || selectedPost.roomName || 'All rooms'}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-lg p-4 border border-emerald-200 dark:border-emerald-700">
                        <div className="flex items-center text-emerald-600 dark:text-emerald-400 mb-2">
                          <DollarSign className="w-5 h-5 mr-2" />
                          <span className="text-sm font-semibold">{t('staffPosts.modal.price') || 'Giá thuê'}</span>
                        </div>
                        <p className="text-gray-900 dark:text-white font-semibold text-lg ml-7">
                          {selectedPost.room?.price ? `${selectedPost.room.price.toLocaleString('vi-VN')}đ` :
                            selectedPost.price ? `${selectedPost.price.toLocaleString('vi-VN')}đ` : 'N/A'}
                        </p>
                      </div>

                      {/* Area */}
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                        <div className="flex items-center text-blue-600 dark:text-blue-400 mb-2">
                          <Maximize2 className="w-5 h-5 mr-2" />
                          <span className="text-sm font-semibold">{t('staffPosts.modal.area') || 'Diện tích'}</span>
                        </div>
                        <p className="text-gray-900 dark:text-white font-semibold text-lg ml-7">
                          {selectedPost.room?.area ? `${selectedPost.room.area} m²` :
                            selectedPost.area ? `${selectedPost.area} m²` : 'N/A'}
                        </p>
                      </div>

                      {/* Author */}
                      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 rounded-lg p-4 border border-indigo-200 dark:border-indigo-700">
                        <div className="flex items-center text-indigo-600 dark:text-indigo-400 mb-2">
                          <User className="w-5 h-5 mr-2" />
                          <span className="text-sm font-semibold">{t('staffPosts.modal.author') || 'Tác giả'}</span>
                        </div>
                        <p className="text-gray-900 dark:text-white font-semibold text-lg ml-7">
                          {selectedPost.authorName || 'Unknown Author'}
                        </p>
                      </div>

                      {/* Contact */}
                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-lg p-4 border border-orange-200 dark:border-orange-700">
                        <div className="flex items-center text-orange-600 dark:text-orange-400 mb-2">
                          <Phone className="w-5 h-5 mr-2" />
                          <span className="text-sm font-semibold">{t('staffPosts.modal.contact') || 'Liên hệ'}</span>
                        </div>
                        <p className="text-gray-900 dark:text-white font-semibold text-lg ml-7">
                          {selectedPost.contactPhone || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Amenities */}
                  {selectedPost.room?.amenities && selectedPost.room.amenities.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <span>✨</span>
                        {t('staffPosts.modal.amenities') || 'Tiện nghi'}
                        <span className="text-sm font-normal text-gray-500">({selectedPost.room.amenities.length})</span>
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {selectedPost.room.amenities.map((amenity, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-lg p-3 border border-indigo-200 dark:border-indigo-700 hover:shadow-md transition-shadow"
                          >
                            {amenity.imageUrl ? (
                              <img
                                src={amenity.imageUrl}
                                alt={amenity.amenityName || amenity.name}
                                className="w-10 h-10 object-cover rounded-lg shadow-sm"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextElementSibling.style.display = 'block';
                                }}
                              />
                            ) : null}
                            <span className={`text-2xl ${!amenity.imageUrl ? '' : 'hidden'}`}>🏠</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white flex-1">
                              {amenity.amenityName || amenity.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Modal Actions */}
                  <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                    {selectedPost.isApproved === null && (
                      <>
                        <button
                          onClick={() => {
                            handleApprove(selectedPost.id);
                            setShowDetailModal(false);
                          }}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors shadow-lg hover:shadow-xl"
                        >
                          <CheckCircle className="w-5 h-5" />
                          {t('staffPosts.actions.approve') || 'Duyệt bài'}
                        </button>

                        <button
                          onClick={() => {
                            handleReject(selectedPost.id);
                            setShowDetailModal(false);
                          }}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors shadow-lg hover:shadow-xl"
                        >
                          <XCircle className="w-5 h-5" />
                          {t('staffPosts.actions.reject') || 'Từ chối'}
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => setShowDetailModal(false)}
                      className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold transition-colors"
                    >
                      {t('staffPosts.actions.close') || 'Đóng'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {t('common.confirm') || 'Xác nhận'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {confirmMessage}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {t('common.cancel') || 'Hủy'}
              </button>
              <button
                onClick={() => {
                  if (confirmAction) confirmAction();
                }}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {t('common.confirm') || 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-[70] animate-fade-in">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span>{successMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}