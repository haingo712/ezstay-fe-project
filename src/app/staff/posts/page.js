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
    if (!confirm('Are you sure you want to approve this post? It will be visible to all users.')) {
      return;
    }
    try {
      setProcessingId(postId);
      await rentalPostService.approvePost(postId);
      await loadPendingPosts();
      alert(t('staffPosts.approveSuccess') || 'Bài đăng đã được duyệt thành công!');
    } catch (error) {
      console.error('Error approving post:', error);
      alert(t('staffPosts.approveError') || 'Không thể duyệt bài đăng. Vui lòng thử lại.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (postId) => {
    if (!confirm(t('staffPosts.confirmReject') || 'Bạn có chắc muốn từ chối bài đăng này?')) {
      return;
    }
    try {
      setProcessingId(postId);
      await rentalPostService.rejectPost(postId);
      await loadPendingPosts();
      alert(t('staffPosts.rejectSuccess') || 'Bài đăng đã bị từ chối.');
    } catch (error) {
      console.error('Error rejecting post:', error);
      alert(t('staffPosts.rejectError') || 'Không thể từ chối bài đăng. Vui lòng thử lại.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleViewDetail = (post) => {
    setSelectedPost(post);
    setShowDetailModal(true);
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
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Giá thuê</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {post.price ? `${post.price.toLocaleString('vi-VN')}đ` : 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Maximize2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Diện tích</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {post.area ? `${post.area} m²` : 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Tác giả</p>
                            <p className="font-semibold text-gray-900 dark:text-white truncate">
                              {post.authorName || 'N/A'}
                            </p>
                          </div>
                        </div>
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
                            onClick={() => window.open(`/rental-posts/${post.id}`, '_blank')}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t('staffPosts.modal.title') || 'Post Details'}
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Images Gallery */}
              {selectedPost.imageUrls && selectedPost.imageUrls.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    {t('staffPosts.modal.images') || 'Images'} ({selectedPost.imageUrls.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedPost.imageUrls.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`${selectedPost.title} - Image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Post Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('staffPosts.modal.postTitle') || 'Title'}
                  </h3>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedPost.title || 'Untitled'}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('staffPosts.modal.description') || 'Description'}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {selectedPost.content || selectedPost.description || 'No description'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('staffPosts.modal.house') || 'Boarding House'}
                    </h3>
                    <p className="text-gray-900 dark:text-white">{selectedPost.houseName || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('staffPosts.modal.room') || 'Room'}
                    </h3>
                    <p className="text-gray-900 dark:text-white">{selectedPost.roomName || 'All rooms'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('staffPosts.modal.author') || 'Author'}
                    </h3>
                    <p className="text-gray-900 dark:text-white">{selectedPost.authorName || selectedPost.authorId || 'Unknown'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('staffPosts.modal.contact') || 'Contact'}
                    </h3>
                    <p className="text-gray-900 dark:text-white">{selectedPost.contactPhone || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('staffPosts.modal.createdAt') || 'Created At'}
                    </h3>
                    <p className="text-gray-900 dark:text-white">{formatDate(selectedPost.createdAt)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('staffPosts.modal.postId') || 'Post ID'}
                    </h3>
                    <p className="text-gray-900 dark:text-white text-xs font-mono">{selectedPost.id}</p>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    handleApprove(selectedPost.id);
                    setShowDetailModal(false);
                  }}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {t('staffPosts.actions.approve') || 'Approve Post'}
                </button>

                <button
                  onClick={() => {
                    handleReject(selectedPost.id);
                    setShowDetailModal(false);
                  }}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {t('staffPosts.actions.reject') || 'Reject Post'}
                </button>

                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
                >
                  {t('staffPosts.actions.close') || 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}