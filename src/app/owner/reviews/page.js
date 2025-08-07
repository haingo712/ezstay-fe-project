'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function OwnerReviewsPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [reviews, setReviews] = useState([
    {
      id: 1,
      userId: 101,
      userName: 'John Doe',
      userAvatar: '/api/placeholder/40/40',
      roomId: 1,
      roomName: 'Modern Studio Apartment',
      houseName: 'Sunrise Residence',
      rating: 5,
      content: 'Excellent place with great amenities. The landlord was very responsive and helpful throughout my stay. The location is perfect for commuting to work and the apartment was exactly as described. Highly recommend!',
      createdAt: '2023-12-15T14:30:00Z',
      images: ['/api/placeholder/300/200', '/api/placeholder/300/200'],
      helpful: 12,
      response: {
        id: 1,
        ownerId: 1,
        responseContent: 'Thank you so much for the wonderful review! It was a pleasure having you as a tenant. You took great care of the apartment and were always respectful. Best wishes for your future!',
        createdAt: '2023-12-16T10:15:00Z',
        updatedAt: '2023-12-16T10:15:00Z'
      },
      status: 'responded'
    },
    {
      id: 2,
      userId: 102,
      userName: 'Emily Chen',
      userAvatar: '/api/placeholder/40/40',
      roomId: 2,
      roomName: 'Cozy Room Near University',
      houseName: 'Student Haven',
      rating: 4,
      content: 'Nice quiet neighborhood, good for families. House was well-maintained and the other tenants were friendly. The only minor issue was occasional noise from upstairs, but overall a great experience.',
      createdAt: '2023-11-20T16:45:00Z',
      images: [],
      helpful: 8,
      response: null,
      status: 'pending'
    },
    {
      id: 3,
      userId: 103,
      userName: 'Michael Rodriguez',
      userAvatar: '/api/placeholder/40/40',
      roomId: 4,
      roomName: 'Luxury Penthouse Room',
      houseName: 'Sunrise Residence',
      rating: 5,
      content: 'Outstanding luxury accommodation! The penthouse room exceeded all expectations. Amazing city views, top-notch amenities, and excellent service. The owner is professional and attentive to details.',
      createdAt: '2023-11-10T12:20:00Z',
      images: ['/api/placeholder/300/200'],
      helpful: 15,
      response: {
        id: 2,
        ownerId: 1,
        responseContent: 'Thank you for the fantastic review! We\'re thrilled that you enjoyed the penthouse and the city views. It was great having such a respectful and professional tenant.',
        createdAt: '2023-11-11T09:30:00Z',
        updatedAt: '2023-11-11T09:30:00Z'
      },
      status: 'responded'
    },
    {
      id: 4,
      userId: 104,
      userName: 'Sarah Wilson',
      userAvatar: '/api/placeholder/40/40',
      roomId: 3,
      roomName: 'Spacious Shared House Room',
      houseName: 'Green Valley House',
      rating: 3,
      content: 'The room was decent but had some maintenance issues. The heating system needed repair during winter, and it took a while to get fixed. The location is good though, and the price is fair.',
      createdAt: '2023-10-25T11:15:00Z',
      images: [],
      helpful: 5,
      response: {
        id: 3,
        ownerId: 1,
        responseContent: 'Thank you for your feedback. I apologize for the heating issues you experienced. We have since upgraded the heating system to prevent future problems. Your input helps us improve our services.',
        createdAt: '2023-10-26T14:45:00Z',
        updatedAt: '2023-10-26T14:45:00Z'
      },
      status: 'responded'
    },
    {
      id: 5,
      userId: 105,
      userName: 'David Kim',
      userAvatar: '/api/placeholder/40/40',
      roomId: 1,
      roomName: 'Modern Studio Apartment',
      houseName: 'Sunrise Residence',
      rating: 2,
      content: 'The apartment had several issues that weren\'t mentioned in the listing. The internet was unreliable, and there were plumbing problems. The landlord was slow to respond to maintenance requests.',
      createdAt: '2023-10-15T09:30:00Z',
      images: ['/api/placeholder/300/200'],
      helpful: 3,
      response: null,
      status: 'pending'
    },
    {
      id: 6,
      userId: 106,
      userName: 'Lisa Thompson',
      userAvatar: '/api/placeholder/40/40',
      roomId: 2,
      roomName: 'Cozy Room Near University',
      houseName: 'Student Haven',
      rating: 4,
      content: 'Great location for students! Walking distance to campus and plenty of study spaces. The room was clean and well-furnished. Would definitely recommend to other students.',
      createdAt: '2023-09-28T13:20:00Z',
      images: [],
      helpful: 9,
      response: {
        id: 4,
        ownerId: 1,
        responseContent: 'Thank you for the positive review! We\'re glad you found the location convenient for your studies. Best of luck with your academic pursuits!',
        createdAt: '2023-09-29T08:45:00Z',
        updatedAt: '2023-09-29T08:45:00Z'
      },
      status: 'responded'
    }
  ]);

  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [responseData, setResponseData] = useState({
    responseContent: ''
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-lg ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>
        ★
      </span>
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'responded':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600 dark:text-green-400';
    if (rating >= 3) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const filteredReviews = reviews.filter(review => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return review.status === 'pending';
    if (activeTab === 'responded') return review.status === 'responded';
    if (activeTab === 'positive') return review.rating >= 4;
    if (activeTab === 'negative') return review.rating <= 2;
    return true;
  });

  const handleOpenResponseModal = (review) => {
    setSelectedReview(review);
    setResponseData({
      responseContent: review.response?.responseContent || ''
    });
    setShowResponseModal(true);
  };

  const handleSubmitResponse = (e) => {
    e.preventDefault();
    
    const updatedReview = {
      ...selectedReview,
      response: {
        id: selectedReview.response?.id || reviews.length + 1,
        ownerId: 1,
        responseContent: responseData.responseContent,
        createdAt: selectedReview.response?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      status: 'responded'
    };

    setReviews(prev => prev.map(review => 
      review.id === selectedReview.id ? updatedReview : review
    ));

    setShowResponseModal(false);
    setSelectedReview(null);
    setResponseData({ responseContent: '' });
    
    alert('Response submitted successfully!');
  };

  const handleDeleteResponse = (reviewId) => {
    if (confirm('Are you sure you want to delete this response?')) {
      setReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? { ...review, response: null, status: 'pending' }
          : review
      ));
      alert('Response deleted successfully!');
    }
  };

  const handleReportReview = (reviewId) => {
    if (confirm('Are you sure you want to report this review as inappropriate?')) {
      // This would integrate with your moderation system
      alert('Review reported for moderation. Our team will review it shortly.');
    }
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalReviews = reviews.length;
  const pendingReviews = reviews.filter(r => r.status === 'pending').length;
  const respondedReviews = reviews.filter(r => r.status === 'responded').length;
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0;
  const positiveReviews = reviews.filter(r => r.rating >= 4).length;
  const negativeReviews = reviews.filter(r => r.rating <= 2).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reviews Management</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage and respond to tenant reviews
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">Average Rating</p>
                <div className="flex items-center justify-end space-x-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{averageRating}</span>
                  <div className="flex">
                    {renderStars(Math.round(averageRating))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'all', label: 'All Reviews', count: totalReviews },
              { key: 'pending', label: 'Pending Response', count: pendingReviews },
              { key: 'responded', label: 'Responded', count: respondedReviews },
              { key: 'positive', label: 'Positive (4-5★)', count: positiveReviews },
              { key: 'negative', label: 'Negative (1-2★)', count: negativeReviews }
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

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalReviews}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingReviews}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Responded</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{respondedReviews}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Positive</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{positiveReviews}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 13l3 3 7-7" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Negative</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{negativeReviews}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {filteredReviews.length > 0 ? (
        <div className="space-y-6">
          {filteredReviews.map((review) => (
            <div key={review.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <div className="flex flex-col space-y-4">
                  {/* Review Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold">
                          {review.userName.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {review.userName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {review.roomName} - {review.houseName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(review.status)}`}>
                        {review.status === 'pending' ? 'Needs Response' : 'Responded'}
                      </span>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center space-x-2">
                    <div className="flex">
                      {renderStars(review.rating)}
                    </div>
                    <span className={`text-lg font-bold ${getRatingColor(review.rating)}`}>
                      {review.rating}/5
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

                  {/* Helpful Count */}
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {review.helpful} people found this helpful
                    </span>
                  </div>

                  {/* Owner Response */}
                  {review.response && (
                    <div className="border-l-4 border-blue-500 pl-4 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-r-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          Your Response
                        </h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(review.response.updatedAt)}
                          </span>
                          <button
                            onClick={() => handleOpenResponseModal(review)}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteResponse(review.id)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {review.response.responseContent}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    {review.status === 'pending' ? (
                      <button
                        onClick={() => handleOpenResponseModal(review)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                        Respond to Review
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenResponseModal(review)}
                        className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Edit Response
                      </button>
                    )}

                    <Link
                      href={`/rooms/${review.roomId}`}
                      className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Room
                    </Link>

                    {review.rating <= 2 && (
                      <button
                        onClick={() => handleReportReview(review.id)}
                        className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Report Review
                      </button>
                    )}
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
              No reviews found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {activeTab === 'all' 
                ? "You don't have any reviews yet."
                : `No ${activeTab.replace('_', ' ')} reviews found.`
              }
            </p>
            {activeTab !== 'all' && (
              <button
                onClick={() => setActiveTab('all')}
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Show All Reviews
              </button>
            )}
          </div>
        </div>
      )}

      {/* Response Modal */}
      {showResponseModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedReview.response ? 'Edit Response' : 'Respond to Review'}
                </h3>
                <button
                  onClick={() => setShowResponseModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Review Summary */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">
                      {selectedReview.userName.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {selectedReview.userName}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex">
                        {renderStars(selectedReview.rating)}
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedReview.rating}/5
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {selectedReview.content}
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmitResponse} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Response *
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={responseData.responseContent}
                    onChange={(e) => setResponseData(prev => ({ ...prev, responseContent: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Write a professional and helpful response to this review..."
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Your response will be visible to all users viewing this review.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowResponseModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    {selectedReview.response ? 'Update Response' : 'Submit Response'}
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