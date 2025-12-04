'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import reviewService from '@/services/reviewService';
import { Star, ArrowLeft, Save } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SafeImage from '@/components/SafeImage';
import { toast } from 'react-toastify';

export default function EditReviewPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const reviewId = params.id;

  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    content: '',
    imageFile: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (reviewId) {
      loadReview();
    }
  }, [reviewId]);

  const loadReview = async () => {
    try {
      setLoading(true);
      const response = await reviewService.getReviewById(reviewId);
      console.log('Review loaded:', response);
      
      // Check if user is owner
      if (user && response.userId !== user.id) {
        toast.error('You do not have permission to edit this review');
        router.push('/profile/rental-history');
        return;
      }

      setReview(response);
      setReviewForm({
        rating: response.rating || 5,
        content: response.content || '',
        imageFile: null // No file selected initially
      });
      setImagePreview(null); // Will show current image from response.imageUrl
    } catch (error) {
      console.error('Error loading review:', error);
      toast.error('Failed to load review');
      router.push('/profile/rental-history');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (reviewForm.rating < 1 || reviewForm.rating > 5) {
      newErrors.rating = 'Rating must be between 1 and 5';
    }

    if (!reviewForm.content.trim()) {
      newErrors.content = 'Review content is required';
    } else if (reviewForm.content.length > 1000) {
      newErrors.content = 'Review content must not exceed 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReviewForm({ ...reviewForm, imageFile: file });
      
      // Create temporary preview using base64 Data URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      
      // Create FormData for file upload to backend
      // Backend will upload the file to Filebase IPFS and return IPFS URL
      const formData = new FormData();
      formData.append('Rating', reviewForm.rating);
      formData.append('Content', reviewForm.content);
      
      // Only append image if user selected a new one
      if (reviewForm.imageFile) {
        formData.append('ImageUrl', reviewForm.imageFile);
        console.log('📤 Updating with new image:', reviewForm.imageFile.name);
      } else {
        console.log('📤 Updating without changing image');
      }
      
      const response = await reviewService.updateReview(reviewId, formData);
      console.log('Review updated:', response);
      toast.success('Review updated successfully!');
      router.push(`/reviews/${reviewId}`);
    } catch (error) {
      console.error('Error updating review:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.title ||
                          'Failed to update review. Please try again.';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
            className="transition-transform hover:scale-110 focus:outline-none"
          >
            <Star
              className={`h-8 w-8 ${
                star <= reviewForm.rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300 dark:text-gray-600'
              }`}
            />
          </button>
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

  if (!review) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Review Not Found
            </h3>
            <button
              onClick={() => router.push('/profile/rental-history')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Go to Rental History
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 mb-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Edit Review
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Update your review
          </p>
        </div>

        {/* Review Info Card */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
            Review Information
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm text-blue-700 dark:text-blue-300">
            <div>
              <span className="font-medium">Created:</span> {new Date(review.createdAt).toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium">Review ID:</span> {reviewId.slice(0, 8)}...
            </div>
          </div>
        </div>

        {/* Review Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Rating <span className="text-red-500">*</span>
            </label>
            {renderStars(reviewForm.rating)}
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {reviewForm.rating} {reviewForm.rating === 1 ? 'star' : 'stars'} selected
            </p>
            {errors.rating && (
              <p className="text-red-500 text-sm mt-1">{errors.rating}</p>
            )}
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Review <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reviewForm.content}
              onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })}
              placeholder="Share your experience with this rental..."
              rows={8}
              maxLength={1000}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none ${
                errors.content ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {reviewForm.content.length}/1000 characters
              </p>
              {errors.content && (
                <p className="text-red-500 text-sm">{errors.content}</p>
              )}
            </div>
          </div>

          {/* Current Image */}
          {review.imageUrl && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Image
              </label>
              <div className="relative h-64 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                <SafeImage
                  src={review.imageUrl}
                  alt="Current Review Image"
                  fill
                  fallbackIcon="📷"
                  objectFit="contain"
                />
              </div>
            </div>
          )}

          {/* Upload New Image (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload New Image (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Leave empty to keep current image. Uploaded to Filebase IPFS storage.
            </p>

            {/* New Image Preview */}
            {imagePreview && (
              <div className="mt-3 relative h-64 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border-2 border-blue-500">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="New Preview"
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  New Image Preview
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={submitting}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !reviewForm.content.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Update Review
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}
