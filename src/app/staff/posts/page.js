'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { rentalPostService } from '@/services/rentalPostService';
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
  List,
  Maximize2
} from 'lucide-react';
import Image from 'next/image';
import { toast } from 'react-toastify';

export default function PostsReviewPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
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
      setError('Failed to load pending posts. Please try again.');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && user) {
      loadPendingPosts();
    }
  }, [mounted, user, loadPendingPosts]);

  const filteredPosts = posts.filter(post => {
    if (activeTab === 'all') return true;
    const status = post.isApproved ?? post.IsApproved;
    if (activeTab === 'pending') return status === 0;
    if (activeTab === 'approved') return status === 1;
    if (activeTab === 'rejected') return status === 2;
    return true;
  });

  const handleApprove = async (postId) => {
    console.log('🔍 Approving post with ID:', postId);
    setConfirmMessage('Are you sure you want to approve this post? It will be visible to all users.');
    setConfirmAction(() => async () => {
      try {
        setProcessingId(postId);
        setShowConfirmModal(false);
        console.log('📤 Sending approve request for post:', postId);
        await rentalPostService.approvePost(postId);
        await loadPendingPosts();
        setSuccessMessage('Post approved successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error('Error approving post:', error);
        toast.error('Failed to approve post. Please try again.');
      } finally {
        setProcessingId(null);
      }
    });
    setShowConfirmModal(true);
  };

  const handleReject = async (postId) => {
    setConfirmMessage('Are you sure you want to reject this post?');
    setConfirmAction(() => async () => {
      try {
        setProcessingId(postId);
        setShowConfirmModal(false);
        await rentalPostService.rejectPost(postId);
        await loadPendingPosts();
        setSuccessMessage('Post rejected successfully.');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error('Error rejecting post:', error);
        toast.error('Failed to reject post. Please try again.');
      } finally {
        setProcessingId(null);
      }
    });
    setShowConfirmModal(true);
  };

  const handleViewDetail = async (post) => {
    try {
      setShowDetailModal(true);

      // Always fetch full post details from API to get Room and BoardingHouse info
      setSelectedPost({ ...post, loading: true });
      console.log('👁️ Fetching full post details for ID:', post.id);

      const fullPost = await rentalPostService.getPostById(post.id, false); // Don't increment view count for staff review
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
        boardingHouse: fullPost.boardingHouse,
        viewCount: fullPost.viewCount
      });

      setSelectedPost(fullPost);
    } catch (error) {
      console.error('❌ Error fetching post details:', error);
      toast.error('Failed to load post details. Please try again.');
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
    console.log('🔍 Post status debug:', { postId: post.id, isApproved: post.isApproved, IsApproved: post.IsApproved, status, statusType: typeof status });

    if (status === 0) {
      return {
        text: 'Pending',
        icon: Clock,
        class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      };
    }
    if (status === 1) {
      return {
        text: 'Approved',
        icon: CheckCircle,
        class: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      };
    }
    if (status === 2) {
      return {
        text: 'Rejected',
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
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
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
          Error Loading Posts
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
        <button
          onClick={loadPendingPosts}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  const pendingCount = posts.filter(p => p.isApproved === 0).length;
  const approvedCount = posts.filter(p => p.isApproved === 1).length;
  const rejectedCount = posts.filter(p => p.isApproved === 2).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="text-white">
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <FileText className="w-7 h-7" />
                Posts Management
              </h1>
              <p className="mt-1 opacity-90">
                Review and moderate rental posts
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center gap-3">
              <button
                onClick={loadPendingPosts}
                className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <div className="bg-white/20 px-4 py-2 rounded-lg">
                <span className="text-white font-medium">
                  {pendingCount} pending reviews
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <nav className="flex">
            {/* All Tab */}
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-4 px-4 font-medium text-sm transition-colors border-b-2 flex items-center justify-center gap-2 ${
                activeTab === 'all'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <List className={`w-4 h-4 ${activeTab === 'all' ? 'text-blue-500' : ''}`} />
              All
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                activeTab === 'all'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}>
                {posts.length}
              </span>
            </button>

            {/* Pending Tab */}
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 py-4 px-4 font-medium text-sm transition-colors border-b-2 flex items-center justify-center gap-2 ${
                activeTab === 'pending'
                  ? 'border-yellow-500 text-yellow-600 dark:text-yellow-400 bg-white dark:bg-gray-800'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Clock className={`w-4 h-4 ${activeTab === 'pending' ? 'text-yellow-500' : ''}`} />
              Pending
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                activeTab === 'pending'
                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}>
                {pendingCount}
              </span>
            </button>

            {/* Approved Tab */}
            <button
              onClick={() => setActiveTab('approved')}
              className={`flex-1 py-4 px-4 font-medium text-sm transition-colors border-b-2 flex items-center justify-center gap-2 ${
                activeTab === 'approved'
                  ? 'border-green-500 text-green-600 dark:text-green-400 bg-white dark:bg-gray-800'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <CheckCircle className={`w-4 h-4 ${activeTab === 'approved' ? 'text-green-500' : ''}`} />
              Approved
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                activeTab === 'approved'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}>
                {approvedCount}
              </span>
            </button>

            {/* Rejected Tab */}
            <button
              onClick={() => setActiveTab('rejected')}
              className={`flex-1 py-4 px-4 font-medium text-sm transition-colors border-b-2 flex items-center justify-center gap-2 ${
                activeTab === 'rejected'
                  ? 'border-red-500 text-red-600 dark:text-red-400 bg-white dark:bg-gray-800'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <XCircle className={`w-4 h-4 ${activeTab === 'rejected' ? 'text-red-500' : ''}`} />
              Rejected
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                activeTab === 'rejected'
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}>
                {rejectedCount}
              </span>
            </button>
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
                          +{post.imageUrls.length - 1} photos
                        </div>
                      )}
                    </div>

                    {/* Post Details */}
                    <div className="flex-1 min-w-0">
                      {/* Header Row */}
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                            {post.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm">
                            <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                              <Building2 className="w-4 h-4 text-purple-500" />
                              <span className="font-medium">{post.houseName || 'N/A'}</span>
                            </div>
                            {post.roomName && post.roomName !== 'All rooms' && post.roomName !== 'Tất cả phòng' && (
                              <>
                                <span className="text-gray-300 dark:text-gray-600">•</span>
                                <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                                  <Home className="w-4 h-4 text-green-500" />
                                  <span className="font-medium">{post.roomName}</span>
                                </div>
                              </>
                            )}
                            <span className="text-gray-300 dark:text-gray-600">•</span>
                            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(post.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${status.class}`}>
                          <StatusIcon className="w-4 h-4" />
                          {status.text}
                        </div>
                      </div>

                      {/* Contact Info */}
                      {post.contactPhone && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 mb-4">
                          <Phone className="w-4 h-4 text-green-500" />
                          <span>{post.contactPhone}</span>
                        </div>
                      )}

                      {/* Actions */}
                      {isPending && (
                        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <button
                            onClick={() => handleApprove(post.id)}
                            disabled={isProcessing}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold rounded-lg transition-all shadow-sm hover:shadow-md"
                          >
                            {isProcessing ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                            ) : (
                              <CheckCircle className="w-5 h-5" />
                            )}
                            Approve
                          </button>

                          <button
                            onClick={() => handleReject(post.id)}
                            disabled={isProcessing}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold rounded-lg transition-all shadow-sm hover:shadow-md"
                          >
                            {isProcessing ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                            ) : (
                              <XCircle className="w-5 h-5" />
                            )}
                            Reject
                          </button>

                          <button
                            onClick={() => handleViewDetail(post)}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-semibold rounded-lg transition-all"
                          >
                            <Eye className="w-5 h-5" />
                            View Details
                          </button>
                        </div>
                      )}

                      {!isPending && (
                        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <button
                            onClick={() => handleViewDetail(post)}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-sm hover:shadow-md"
                          >
                            <Eye className="w-5 h-5" />
                            {t('staffPosts.actions.view') || 'View Details'}
                          </button>
                        </div>
                      )}

                      {/* Approved/Rejected info */}
                      {!isPending && post.approvedAt && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                          {postStatus === 1 ? '✓ Approved' : '✗ Rejected'} on {formatDate(post.approvedAt)}
                          {post.approvedBy && ` by ${post.approvedBy}`}
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
            No Posts
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {activeTab === 'pending'
              ? 'No posts pending review.'
              : activeTab === 'approved'
                ? 'No approved posts.'
                : 'No rejected posts.'
            }
          </p>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedPost && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-900 dark:to-blue-900 p-6 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Eye className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {t('staffPosts.modal.title') || 'Post Details'}
                  </h2>
                  <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${selectedPost.isApproved === 1 ? 'bg-green-100 text-green-800' :
                    selectedPost.isApproved === 2 ? 'bg-red-100 text-red-800' :
                      selectedPost.isApproved === 0 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                    }`}>
                    {selectedPost.isApproved === 1 ? `✓ ${t('staffPosts.status.approved') || 'Approved'}` :
                      selectedPost.isApproved === 2 ? `✗ ${t('staffPosts.status.rejected') || 'Rejected'}` :
                        selectedPost.isApproved === 0 ? `⏳ ${t('staffPosts.status.pending') || 'Pending'}` :
                          `🚫 ${t('staffPosts.status.inactive') || 'Inactive'}`}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-white/80 hover:text-white hover:bg-white/20 transition-all rounded-lg p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Loading State */}
              {selectedPost.loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">{t('staffPosts.modal.loading') || 'Loading post details...'}</p>
                </div>
              ) : (
                <div className="p-6 space-y-6">
                  {/* Title & Date */}
                  <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t('staffPosts.modal.postTitle') || 'Title'}</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                          {selectedPost.title || 'Untitled'}
                        </h3>
                      </div>
                      <div className="text-right text-sm text-gray-500 dark:text-gray-400 shrink-0">
                        <div className="flex items-center gap-1">
                          <span>📅</span>
                          <span>{formatDate(selectedPost.createdAt)}</span>
                        </div>
                        {selectedPost.updatedAt && selectedPost.updatedAt !== selectedPost.createdAt && (
                          <div className="flex items-center gap-1 mt-1">
                            <span>🔄</span>
                            <span>{formatDate(selectedPost.updatedAt)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Main Content Grid - 2 columns */}
                  <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left Column - Images & Description (2/3 width) */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Images Gallery */}
                      {selectedPost.imageUrls && selectedPost.imageUrls.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <span>🖼️</span>
                            {t('staffPosts.modal.images') || 'Images'}
                            <span className="text-sm font-normal text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                              {selectedPost.imageUrls.length}
                            </span>
                          </h3>
                          <div className="grid grid-cols-2 gap-3">
                            {selectedPost.imageUrls.map((url, index) => (
                              <div key={index} className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 group">
                                <img
                                  src={url}
                                  alt={`${selectedPost.title} - ${index + 1}`}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                                  onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                                  }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md font-medium">
                                  {index + 1}/{selectedPost.imageUrls.length}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Description */}
                      {(selectedPost.content || selectedPost.description) &&
                        (selectedPost.content?.trim() || selectedPost.description?.trim()) &&
                        (selectedPost.content?.trim().toLowerCase() !== 'kk') && (
                          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                              <span>📝</span>
                              {t('staffPosts.modal.description') || 'Description'}
                            </h3>
                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                {selectedPost.content || selectedPost.description}
                              </p>
                            </div>
                          </div>
                        )}

                      {/* Amenities */}
                      {selectedPost.room?.amenities && selectedPost.room.amenities.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <span>✨</span>
                            {t('staffPosts.modal.amenities') || 'Amenities'}
                            <span className="text-sm font-normal text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                              {selectedPost.room.amenities.length}
                            </span>
                          </h3>
                          <div className="grid grid-cols-2 gap-2">
                            {selectedPost.room.amenities.map((amenity, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3 border border-indigo-100 dark:border-indigo-800"
                              >
                                {amenity.imageUrl ? (
                                  <img
                                    src={amenity.imageUrl}
                                    alt={amenity.amenityName || amenity.name}
                                    className="w-8 h-8 object-cover rounded-md flex-shrink-0"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextElementSibling.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <span className={`text-xl flex-shrink-0 ${!amenity.imageUrl ? 'flex' : 'hidden'}`}></span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {amenity.amenityName || amenity.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column - Information (1/3 width) */}
                    <div className="space-y-4">
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm sticky top-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <span>ℹ️</span>
                          {t('staffPosts.modal.detailInfo') || 'Detail Information'}
                        </h3>
                        <div className="space-y-3">
                          {/* Boarding House */}
                          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-100 dark:border-purple-800">
                            <div className="flex items-center text-purple-600 dark:text-purple-400 mb-1 text-xs font-semibold">
                              <Building2 className="w-3.5 h-3.5 mr-1.5" />
                              {t('staffPosts.modal.boardingHouse') || 'Boarding House'}
                            </div>
                            <p className="text-gray-900 dark:text-white font-semibold text-sm pl-5">
                              {selectedPost.houseName || 'N/A'}
                            </p>
                          </div>

                          {/* Room */}
                          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-100 dark:border-green-800">
                            <div className="flex items-center text-green-600 dark:text-green-400 mb-1 text-xs font-semibold">
                              <Home className="w-3.5 h-3.5 mr-1.5" />
                              {t('staffPosts.modal.room') || 'Room'}
                            </div>
                            <p className="text-gray-900 dark:text-white font-semibold text-sm pl-5">
                              {selectedPost.room?.roomName || selectedPost.roomName || 'All rooms'}
                            </p>
                          </div>

                          {/* Price */}
                          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 border border-emerald-100 dark:border-emerald-800">
                            <div className="flex items-center text-emerald-600 dark:text-emerald-400 mb-1 text-xs font-semibold">
                              <DollarSign className="w-3.5 h-3.5 mr-1.5" />
                              {t('staffPosts.modal.price') || 'Rent Price'}
                            </div>
                            <p className="text-gray-900 dark:text-white font-bold text-base pl-5">
                              {selectedPost.room?.price ? `${selectedPost.room.price.toLocaleString('vi-VN')}đ` :
                                selectedPost.price ? `${selectedPost.price.toLocaleString('vi-VN')}đ` : 'N/A'}
                            </p>
                          </div>

                          {/* Area */}
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-100 dark:border-blue-800">
                            <div className="flex items-center text-blue-600 dark:text-blue-400 mb-1 text-xs font-semibold">
                              <Maximize2 className="w-3.5 h-3.5 mr-1.5" />
                              {t('staffPosts.modal.area') || 'Area'}
                            </div>
                            <p className="text-gray-900 dark:text-white font-semibold text-sm pl-5">
                              {selectedPost.room?.area ? `${selectedPost.room.area} m²` :
                                selectedPost.area ? `${selectedPost.area} m²` : 'N/A'}
                            </p>
                          </div>

                          {/* Author */}
                          {selectedPost.authorName && selectedPost.authorName !== 'Unknown Author' && (
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3 border border-indigo-100 dark:border-indigo-800">
                              <div className="flex items-center text-indigo-600 dark:text-indigo-400 mb-1 text-xs font-semibold">
                                <User className="w-3.5 h-3.5 mr-1.5" />
                                {t('staffPosts.modal.author') || 'Author'}
                              </div>
                              <p className="text-gray-900 dark:text-white font-semibold text-sm pl-5">
                                {selectedPost.authorName}
                              </p>
                            </div>
                          )}

                          {/* Contact */}
                          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 border border-orange-100 dark:border-orange-800">
                            <div className="flex items-center text-orange-600 dark:text-orange-400 mb-1 text-xs font-semibold">
                              <Phone className="w-3.5 h-3.5 mr-1.5" />
                              {t('staffPosts.modal.contact') || 'Contact'}
                            </div>
                            <p className="text-gray-900 dark:text-white font-semibold text-sm pl-5">
                              {selectedPost.contactPhone || 'N/A'}
                            </p>
                          </div>

                          {/* View Count */}
                          <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-3 border border-cyan-100 dark:border-cyan-800">
                            <div className="flex items-center text-cyan-600 dark:text-cyan-400 mb-1 text-xs font-semibold">
                              <Eye className="w-3.5 h-3.5 mr-1.5" />
                              {t('staffPosts.modal.viewCount') || 'View Count'}
                            </div>
                            <p className="text-gray-900 dark:text-white font-semibold text-sm pl-5">
                              {selectedPost.viewCount || 0} views
                            </p>
                          </div>

                          {/* Location */}
                          {selectedPost.boardingHouse?.location?.fullAddress && (
                            <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-3 border border-pink-100 dark:border-pink-800">
                              <div className="flex items-center text-pink-600 dark:text-pink-400 mb-1 text-xs font-semibold">
                                <MapPin className="w-3.5 h-3.5 mr-1.5" />
                                {t('staffPosts.modal.location') || 'Location'}
                              </div>
                              <p className="text-gray-900 dark:text-white font-semibold text-sm pl-5 line-clamp-3">
                                {selectedPost.boardingHouse.location.fullAddress}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer - Action Buttons */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex flex-wrap gap-3">
                {selectedPost.isApproved === null && (
                  <>
                    <button
                      onClick={() => {
                        handleApprove(selectedPost.id);
                        setShowDetailModal(false);
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg"
                    >
                      <CheckCircle className="w-5 h-5" />
                      {t('staffPosts.actions.approve') || 'Approve'}
                    </button>

                    <button
                      onClick={() => {
                        handleReject(selectedPost.id);
                        setShowDetailModal(false);
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg"
                    >
                      <XCircle className="w-5 h-5" />
                      {t('staffPosts.actions.reject') || 'Reject'}
                    </button>
                  </>
                )}

                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 inline-flex items-center justify-center px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold transition-all"
                >
                  {t('staffPosts.actions.close') || 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Confirm
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {confirmMessage}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmAction) confirmAction();
                }}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Confirm
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