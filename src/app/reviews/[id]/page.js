'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import reviewService from '@/services/reviewService';
import { useTranslation } from '@/hooks/useTranslation';
import { Star, Calendar, User, MessageSquare, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import SafeImage from '@/components/SafeImage';
import { toast } from 'react-toastify';
import notification from '@/utils/notification';

export default function ReviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();
  const reviewId = params.id;

  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (reviewId) {
      loadReview();
    }
  }, [reviewId]);

  const loadReview = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Loading review ID:', reviewId);
      const response = await reviewService.getReviewById(reviewId);
      console.log('✅ Review detail loaded:', response);
      
      // Validate response has required fields
      if (!response || !response.id) {
        console.warn('⚠️ Review response missing id field:', response);
        throw new Error('Invalid review data');
      }
      
      setReview(response);
    } catch (error) {
      console.error('❌ Error loading review:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error response:', error.response);
      
      // Set user-friendly error message
      if (error.message === 'Review not found') {
        setError('Review not found. It may have been deleted.');
      } else if (error.message?.includes('Server error')) {
        setError('Server error. The review service is temporarily unavailable. Please try again later.');
      } else {
        setError(error.message || 'Failed to load review details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/reviews/${reviewId}/edit`);
  };

  const handleDelete = async () => {
    const confirmed = await notification.confirm(t('reviewDetail.confirmDelete'), t('common.confirm') || 'Xác nhận');
    if (!confirmed) return;

    try {
      await reviewService.deleteReview(reviewId);
      toast.success(t('reviewDetail.deleteSuccess'));
      router.push('/profile/rental-history');
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error(t('reviewDetail.deleteFailed'));
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <MessageSquare className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {error?.includes('Server error') ? t('reviewDetail.serverError') : t('reviewDetail.reviewNotFound')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">
              {error || t('reviewDetail.doesNotExist')}
            </p>
            
            {/* Debug info for development */}
            {process.env.NODE_ENV === 'development' && reviewId && (
              <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left max-w-md mx-auto">
                <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                  Review ID: {reviewId}
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                  Check browser console for detailed error logs
                </p>
              </div>
            )}
            
            <div className="flex gap-3 justify-center mt-6">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('reviewDetail.goBack')}
              </button>
              <button
                onClick={() => loadReview()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('reviewDetail.tryAgain')}
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isOwner = user && review.userId === user.id;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-4 py-2 mb-6 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('reviewDetail.back')}
        </button>

        {/* Review Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t('reviewDetail.anonymousUser')}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4" />
                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
              {renderStars(review.rating)}
            </div>

            {/* Action Buttons (Only for owner) */}
            {isOwner && (
              <div className="flex gap-2">
                <button
                  onClick={handleEdit}
                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  title={t('reviewDetail.editReview')}
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title={t('reviewDetail.deleteReview')}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Review Image (if exists) */}
          {review.imageUrl && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('reviewDetail.reviewImage')}
              </h4>
              <div className="relative h-64 md:h-96 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                <SafeImage
                  src={review.imageUrl}
                  alt="Review Image"
                  fill
                  fallbackIcon="📷"
                  objectFit="contain"
                />
              </div>
            </div>
          )}

          {/* Content */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('reviewDetail.reviewContent')}
            </h4>
            <p className="text-gray-900 dark:text-white leading-relaxed">
              {review.content}
            </p>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('reviewDetail.contractId')}:</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                {review.contractId || 'N/A'}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('reviewDetail.postId')}:</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                {review.postId || 'N/A'}
              </p>
            </div>
            {review.reviewDeadline && (
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('reviewDetail.reviewDeadline')}:</span>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(review.reviewDeadline).toLocaleDateString()}
                </p>
              </div>
            )}
            {review.updatedAt && review.updatedAt !== review.createdAt && (
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('reviewDetail.lastUpdated')}:</span>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(review.updatedAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {/* Image (if exists) */}
          {review.imageId && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {t('reviewDetail.attachedImage')}
              </h4>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('reviewDetail.imageId')}: {review.imageId}
                </p>
                {/* TODO: Load actual image from ImageAPI if needed */}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
