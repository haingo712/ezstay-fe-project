'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { rentalPostService } from '@/services/rentalPostService';
import { useTranslation } from '@/hooks/useTranslation';

export default function PostsReviewPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [posts, setPosts] = useState([]);

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
    if (activeTab === 'pending') return post.isApproved === null;
    if (activeTab === 'approved') return post.isApproved === 1;
    if (activeTab === 'rejected') return post.isApproved === 0;
    return true;
  });

  const handleApprove = async (postId) => {
    try {
      await rentalPostService.approvePost(postId);
      await loadPendingPosts();
      alert('Post approved successfully!');
    } catch (error) {
      console.error('Error approving post:', error);
      alert('Failed to approve post. Please try again.');
    }
  };

  const handleReject = async (postId) => {
    try {
      await rentalPostService.rejectPost(postId);
      await loadPendingPosts();
      alert('Post rejected successfully!');
    } catch (error) {
      console.error('Error rejecting post:', error);
      alert('Failed to reject post. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <div className="text-red-600 mb-4">❌</div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {t('staffPosts.error')}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
        <button
          onClick={loadPendingPosts}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          {t('staffPosts.retry')}
        </button>
      </div>
    );
  }

  const pendingCount = posts.filter(p => p.isApproved === null).length;
  const approvedCount = posts.filter(p => p.isApproved === 1).length;
  const rejectedCount = posts.filter(p => p.isApproved === 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('staffPosts.title')}</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {t('staffPosts.subtitle') || 'Review and moderate rental property listings'}
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {pendingCount} {t('staffPosts.pendingReviews') || 'pending reviews'}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'pending', label: 'Pending', count: pendingCount },
              { key: 'approved', label: 'Approved', count: approvedCount },
              { key: 'rejected', label: 'Rejected', count: rejectedCount }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Posts List */}
      {filteredPosts.length > 0 ? (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <div key={post.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6">
                  {/* Post Image */}
                  <div className="w-full lg:w-48 h-32 lg:h-36 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center mb-4 lg:mb-0 flex-shrink-0">
                    <span className="text-4xl">🏠</span>
                  </div>

                  {/* Post Details */}
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {post.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {post.roomName} - {post.houseName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                          By: {post.authorId} • {formatDate(post.createdAt)}
                        </p>
                      </div>
                      <div className="mt-2 sm:mt-0 flex items-center space-x-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          post.isApproved === null ? 'bg-yellow-100 text-yellow-800' :
                          post.isApproved === 1 ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {post.isApproved === null ? '⏳ Pending' :
                           post.isApproved === 1 ? '✅ Approved' :
                           '❌ Rejected'}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {post.description}
                      </p>
                    </div>

                    {/* Post Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">Price:</span>
                        <p className="text-gray-600 dark:text-gray-400">${post.monthlyRent || 'N/A'}/month</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">Area:</span>
                        <p className="text-gray-600 dark:text-gray-400">{post.area || 'N/A'} m²</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">Contact:</span>
                        <p className="text-gray-600 dark:text-gray-400">{post.contactPhone}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">Author:</span>
                        <p className="text-gray-600 dark:text-gray-400">{post.authorId}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    {post.isApproved === null && (
                      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => handleApprove(post.id)}
                          className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {t('staffPosts.actions.approve')}
                        </button>

                        <button
                          onClick={() => handleReject(post.id)}
                          className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          {t('staffPosts.actions.reject')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {t('staffPosts.empty') || 'No posts found'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {activeTab === 'pending' 
              ? "No posts are currently pending review."
              : `No ${activeTab} posts found.`
            }
          </p>
        </div>
      )}
    </div>
  );
}