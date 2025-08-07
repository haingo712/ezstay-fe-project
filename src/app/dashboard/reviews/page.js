'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ReviewsPage() {
  const [mounted, setMounted] = useState(false);
  const [reviews, setReviews] = useState([
    {
      id: 1,
      roomName: 'Modern Studio Apartment',
      houseName: 'Downtown Loft',
      location: 'Downtown District, New York',
      landlordName: 'Sarah Johnson',
      rating: 5,
      content: 'Excellent place with great amenities. The landlord was very responsive and helpful throughout my stay. The location is perfect for commuting to work and the apartment was exactly as described. Highly recommend!',
      createdAt: '2023-12-15',
      images: ['/api/placeholder/300/200', '/api/placeholder/300/200'],
      landlordResponse: {
        content: 'Thank you so much for the wonderful review! It was a pleasure having you as a tenant. You took great care of the apartment and were always respectful. Best wishes for your future!',
        createdAt: '2023-12-16'
      },
      helpful: 12,
      roomImage: '/api/placeholder/400/300'
    },
    {
      id: 2,
      roomName: 'Shared House Room',
      houseName: 'Green Valley House',
      location: 'Residential Area, Seattle',
      landlordName: 'Emma Wilson',
      rating: 4,
      content: 'Nice quiet neighborhood, good for families. House was well-maintained and the other tenants were friendly. The only minor issue was occasional noise from upstairs, but overall a great experience.',
      createdAt: '2023-05-20',
      images: [],
      landlordResponse: {
        content: 'Thank you for your feedback! I\'m glad you enjoyed your stay. I\'ve addressed the noise issue with the upstairs tenant. Hope to see you again in the future!',
        createdAt: '2023-05-21'
      },
      helpful: 8,
      roomImage: '/api/placeholder/400/300'
    },
    {
      id: 3,
      roomName: 'Budget Room',
      houseName: 'Economy Stay',
      location: 'Suburbs, Chicago',
      landlordName: 'Tom Rodriguez',
      rating: 3,
      content: 'Decent place for the price. Room was clean but quite small. WiFi was reliable which was important for my work. Location is a bit far from downtown but public transport is accessible.',
      createdAt: '2022-08-10',
      images: ['/api/placeholder/300/200'],
      landlordResponse: null,
      helpful: 5,
      roomImage: '/api/placeholder/400/300'
    }
  ]);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [reviewData, setReviewData] = useState({
    roomId: '',
    roomName: '',
    rating: 5,
    content: '',
    images: []
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type={interactive ? "button" : undefined}
        onClick={interactive ? () => onRatingChange && onRatingChange(i + 1) : undefined}
        className={`text-2xl ${i < rating ? 'text-yellow-400' : 'text-gray-300'} ${
          interactive ? 'hover:text-yellow-400 cursor-pointer' : ''
        } transition-colors`}
        disabled={!interactive}
      >
        ★
      </button>
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setReviewData({
      roomId: review.id,
      roomName: review.roomName,
      rating: review.rating,
      content: review.content,
      images: review.images || []
    });
    setShowReviewModal(true);
  };

  const handleNewReview = () => {
    setEditingReview(null);
    setReviewData({
      roomId: '',
      roomName: '',
      rating: 5,
      content: '',
      images: []
    });
    setShowReviewModal(true);
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    
    if (editingReview) {
      // Update existing review
      setReviews(prev => prev.map(review => 
        review.id === editingReview.id 
          ? { ...review, rating: reviewData.rating, content: reviewData.content, images: reviewData.images }
          : review
      ));
      alert('Review updated successfully!');
    } else {
      // Add new review
      const newReview = {
        id: reviews.length + 1,
        roomName: reviewData.roomName,
        houseName: 'Sample House',
        location: 'Sample Location',
        landlordName: 'Sample Landlord',
        rating: reviewData.rating,
        content: reviewData.content,
        createdAt: new Date().toISOString().split('T')[0],
        images: reviewData.images,
        landlordResponse: null,
        helpful: 0,
        roomImage: '/api/placeholder/400/300'
      };
      setReviews(prev => [newReview, ...prev]);
      alert('Review submitted successfully!');
    }

    setShowReviewModal(false);
    setEditingReview(null);
    setReviewData({ roomId: '', roomName: '', rating: 5, content: '', images: [] });
  };

  const handleDeleteReview = (reviewId) => {
    if (confirm('Are you sure you want to delete this review?')) {
      setReviews(prev => prev.filter(review => review.id !== reviewId));
      alert('Review deleted successfully!');
    }
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Reviews</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Reviews you've written for rooms you've stayed in
              </p>
            </div>
            <button
              onClick={handleNewReview}
              className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Write Review
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{reviews.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{averageRating}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Responses</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {reviews.filter(r => r.landlordResponse).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Helpful Votes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {reviews.reduce((sum, review) => sum + review.helpful, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:space-x-6">
                  {/* Room Image */}
                  <div className="w-full lg:w-48 h-32 lg:h-36 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center mb-4 lg:mb-0 flex-shrink-0">
                    <span className="text-4xl">🏠</span>
                  </div>

                  {/* Review Content */}
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {review.roomName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {review.houseName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          📍 {review.location}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Landlord: {review.landlordName}
                        </p>
                      </div>
                      <div className="mt-2 sm:mt-0 flex items-center space-x-2">
                        <button
                          onClick={() => handleEditReview(review)}
                          className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          title="Edit review"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          title="Delete review"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Rating and Date */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {review.rating}/5
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>

                    {/* Review Content */}
                    <div>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {review.content}
                      </p>
                    </div>

                    {/* Review Images */}
                    {review.images && review.images.length > 0 && (
                      <div className="flex space-x-2 overflow-x-auto">
                        {review.images.map((image, index) => (
                          <div key={index} className="w-20 h-20 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-2xl">📷</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Landlord Response */}
                    {review.landlordResponse && (
                      <div className="border-l-4 border-blue-500 pl-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-r-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                            Response from {review.landlordName}
                          </h4>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(review.landlordResponse.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {review.landlordResponse.content}
                        </p>
                      </div>
                    )}

                    {/* Review Stats */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {review.helpful} people found this helpful
                        </span>
                      </div>
                      <Link
                        href={`/rooms/${review.id}`}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                      >
                        View Room →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">⭐</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No reviews yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              You haven't written any reviews yet. Share your experience with rooms you've stayed in!
            </p>
            <button
              onClick={handleNewReview}
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Write Your First Review
            </button>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingReview ? 'Edit Review' : 'Write Review'}
                </h3>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-6">
                {!editingReview && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Room Name
                    </label>
                    <input
                      type="text"
                      required
                      value={reviewData.roomName}
                      onChange={(e) => setReviewData(prev => ({ ...prev, roomName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter the room name you want to review"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rating
                  </label>
                  <div className="flex space-x-1">
                    {renderStars(reviewData.rating, true, (rating) => 
                      setReviewData(prev => ({ ...prev, rating }))
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Review
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={reviewData.content}
                    onChange={(e) => setReviewData(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Share your experience with this room. What did you like? What could be improved?"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    {editingReview ? 'Update Review' : 'Submit Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}