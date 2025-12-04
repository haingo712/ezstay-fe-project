'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { rentalPostService } from '@/services/rentalPostService';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'react-toastify';

export default function PostsReviewPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

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

  const handleApprove = async (postId) => {
    if (!confirm('Are you sure you want to approve this post? It will be visible to all users.')) {
      return;
    }
    try {
      await rentalPostService.approvePost(postId);
      await loadPendingPosts();
      toast.success(t('staffPosts.toast.approveSuccess') || 'Post approved successfully!');
    } catch (error) {
      console.error('Error approving post:', error);
      toast.error(t('staffPosts.toast.approveFailed') || 'Failed to approve post. Please try again.');
    }
  };

  const handleReject = async (postId) => {
    if (!confirm('Are you sure you want to reject this post? The owner will need to edit and resubmit.')) {
      return;
    }
    try {
      await rentalPostService.rejectPost(postId);
      await loadPendingPosts();
      toast.success(t('staffPosts.toast.rejectSuccess') || 'Post rejected successfully!');
    } catch (error) {
      console.error('Error rejecting post:', error);
      toast.error(t('staffPosts.toast.rejectFailed') || 'Failed to reject post. Please try again.');
    }
  };

  const handleViewDetail = (post) => {
    setSelectedPost(post);
    setShowDetailModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4 text-4xl">❌</div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {t('staffPosts.error') || 'Error Loading Posts'}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
        <button
          onClick={loadPendingPosts}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          {t('staffPosts.retry') || 'Retry'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('staffPosts.title') || 'Post Review'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {t('staffPosts.subtitle') || 'Review and approve rental property listings from owners'}
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              <button
                onClick={loadPendingPosts}
                className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {t('staffPosts.refresh') || 'Refresh'}
              </button>
              <span className="px-4 py-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 font-medium rounded-lg">
                {posts.length} {t('staffPosts.pendingReviews') || 'pending reviews'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Posts List */}
      {posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6">
                  {/* Post Image */}
                  <div className="w-full lg:w-48 h-32 lg:h-36 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center mb-4 lg:mb-0 flex-shrink-0 overflow-hidden">
                    {post.imageUrls && post.imageUrls.length > 0 ? (
                      <img 
                        src={post.imageUrls[0]} 
                        alt={post.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl">🏠</span>
                    )}
                  </div>

                  {/* Post Details */}
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {post.title || 'Untitled Post'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          📍 {post.houseName || 'Unknown House'} {post.roomName && `- ${post.roomName}`}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                          👤 {post.authorName || post.authorId || 'Unknown'} • 📅 {formatDate(post.createdAt)}
                        </p>
                      </div>
                      <div className="mt-2 sm:mt-0">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                          ⏳ Pending Review
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {post.content || post.description || 'No description provided.'}
                      </p>
                    </div>

                    {/* Post Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-500 dark:text-gray-400">Contact:</span>
                        <p className="text-gray-900 dark:text-white">{post.contactPhone || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500 dark:text-gray-400">Images:</span>
                        <p className="text-gray-900 dark:text-white">{post.imageUrls?.length || 0} photos</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500 dark:text-gray-400">Room ID:</span>
                        <p className="text-gray-900 dark:text-white text-xs">{post.roomId || 'All rooms'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500 dark:text-gray-400">Post ID:</span>
                        <p className="text-gray-900 dark:text-white text-xs truncate">{post.id}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => handleViewDetail(post)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {t('staffPosts.actions.viewDetail') || 'View Detail'}
                      </button>
                      
                      <button
                        onClick={() => handleApprove(post.id)}
                        className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {t('staffPosts.actions.approve') || 'Approve'}
                      </button>

                      <button
                        onClick={() => handleReject(post.id)}
                        className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        {t('staffPosts.actions.reject') || 'Reject'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="text-gray-400 mb-4 text-6xl">✅</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {t('staffPosts.empty') || 'All Caught Up!'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {t('staffPosts.emptyDescription') || 'No posts are currently pending review. Check back later.'}
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