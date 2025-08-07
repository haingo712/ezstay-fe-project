'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PostsReviewPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedPost, setSelectedPost] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    action: '',
    note: '',
    tags: []
  });

  const [posts, setPosts] = useState([
    {
      id: 1,
      title: 'Beautiful Modern Studio in Downtown',
      description: 'Stunning studio apartment with city views, modern amenities, and excellent location. Perfect for working professionals who value comfort and convenience. The apartment features high-speed internet, fully equipped kitchen, and 24/7 security.',
      authorId: 101,
      authorName: 'John Doe',
      authorEmail: 'john.doe@example.com',
      authorPhone: '+1 (555) 123-4567',
      roomId: 1,
      roomName: 'Modern Studio Apartment',
      houseName: 'Sunrise Residence',
      price: 250,
      area: 35,
      maxTenants: 2,
      location: 'Downtown',
      contactPhone: '+1 (555) 123-4567',
      submittedAt: '2024-01-22T10:30:00Z',
      status: 'pending',
      priority: 'normal',
      images: ['/api/placeholder/400/300', '/api/placeholder/400/300', '/api/placeholder/400/300'],
      amenities: ['WiFi', 'Kitchen', 'Security', 'Parking'],
      aiAnalysis: {
        score: 85,
        flags: ['appropriate_content', 'reasonable_price', 'complete_information'],
        sentiment: 'positive',
        qualityScore: 88,
        spamProbability: 5
      },
      verificationStatus: {
        phoneVerified: true,
        emailVerified: true,
        identityVerified: false,
        propertyVerified: true
      },
      reportCount: 0,
      viewCount: 156,
      inquiryCount: 23
    },
    {
      id: 2,
      title: 'CHEAP ROOM AVAILABLE NOW!!!',
      description: 'Super cheap room available immediately! Best deal in the city! Contact me now for amazing discount! Don\'t miss this opportunity! Call now!!!',
      authorId: 102,
      authorName: 'QuickDeals123',
      authorEmail: 'deals@example.com',
      authorPhone: '+1 (555) 999-9999',
      roomId: 2,
      roomName: 'Budget Room',
      houseName: 'Unknown Property',
      price: 50,
      area: 15,
      maxTenants: 1,
      location: 'Unspecified',
      contactPhone: '+1 (555) 999-9999',
      submittedAt: '2024-01-22T09:15:00Z',
      status: 'flagged',
      priority: 'high',
      images: [],
      amenities: [],
      aiAnalysis: {
        score: 25,
        flags: ['spam_detected', 'suspicious_pricing', 'excessive_punctuation', 'low_quality_content'],
        sentiment: 'promotional',
        qualityScore: 20,
        spamProbability: 85
      },
      verificationStatus: {
        phoneVerified: false,
        emailVerified: false,
        identityVerified: false,
        propertyVerified: false
      },
      reportCount: 3,
      viewCount: 45,
      inquiryCount: 2
    },
    {
      id: 3,
      title: 'Luxury Penthouse Room with City Views',
      description: 'Premium penthouse room with panoramic city views and top-notch amenities. Perfect for executives and professionals seeking upscale living. Features include marble bathroom, walk-in closet, and private balcony.',
      authorId: 103,
      authorName: 'Michael Rodriguez',
      authorEmail: 'michael@example.com',
      authorPhone: '+1 (555) 345-6789',
      roomId: 3,
      roomName: 'Luxury Penthouse Room',
      houseName: 'Sunrise Residence',
      price: 350,
      area: 50,
      maxTenants: 2,
      location: 'Downtown',
      contactPhone: '+1 (555) 345-6789',
      submittedAt: '2024-01-21T14:20:00Z',
      status: 'approved',
      priority: 'normal',
      images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
      amenities: ['WiFi', 'Gym', 'Pool', 'Concierge', 'Parking', 'Balcony'],
      aiAnalysis: {
        score: 92,
        flags: ['high_quality_content', 'verified_owner', 'complete_information', 'professional_photos'],
        sentiment: 'positive',
        qualityScore: 95,
        spamProbability: 2
      },
      verificationStatus: {
        phoneVerified: true,
        emailVerified: true,
        identityVerified: true,
        propertyVerified: true
      },
      reportCount: 0,
      viewCount: 234,
      inquiryCount: 45,
      approvedAt: '2024-01-21T16:30:00Z',
      approvedBy: 'Staff Manager'
    },
    {
      id: 4,
      title: 'Student Room Near University Campus',
      description: 'Perfect room for students! Walking distance to campus, quiet study environment, and affordable pricing. Shared kitchen and common areas with other students.',
      authorId: 104,
      authorName: 'Emily Chen',
      authorEmail: 'emily@example.com',
      authorPhone: '+1 (555) 234-5678',
      roomId: 4,
      roomName: 'Student Room',
      houseName: 'Student Haven',
      price: 180,
      area: 20,
      maxTenants: 1,
      location: 'University Area',
      contactPhone: '+1 (555) 234-5678',
      submittedAt: '2024-01-21T11:45:00Z',
      status: 'pending',
      priority: 'normal',
      images: ['/api/placeholder/400/300'],
      amenities: ['WiFi', 'Study Room', 'Kitchen Access', 'Laundry'],
      aiAnalysis: {
        score: 78,
        flags: ['appropriate_content', 'target_audience_clear', 'reasonable_price'],
        sentiment: 'positive',
        qualityScore: 75,
        spamProbability: 8
      },
      verificationStatus: {
        phoneVerified: true,
        emailVerified: true,
        identityVerified: false,
        propertyVerified: true
      },
      reportCount: 0,
      viewCount: 89,
      inquiryCount: 12
    },
    {
      id: 5,
      title: 'Shared House Room with Garden Access',
      description: 'Spacious room in a beautiful shared house with garden access. Perfect for those who enjoy community living in a peaceful environment. Includes all utilities and weekly cleaning service.',
      authorId: 105,
      authorName: 'Sarah Wilson',
      authorEmail: 'sarah@example.com',
      authorPhone: '+1 (555) 456-7890',
      roomId: 5,
      roomName: 'Garden Room',
      houseName: 'Green Valley House',
      price: 200,
      area: 25,
      maxTenants: 1,
      location: 'Suburban',
      contactPhone: '+1 (555) 456-7890',
      submittedAt: '2024-01-20T16:30:00Z',
      status: 'rejected',
      priority: 'normal',
      images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
      amenities: ['WiFi', 'Garden', 'Kitchen Access', 'Cleaning Service'],
      aiAnalysis: {
        score: 65,
        flags: ['duplicate_content_detected', 'similar_post_exists'],
        sentiment: 'positive',
        qualityScore: 70,
        spamProbability: 15
      },
      verificationStatus: {
        phoneVerified: true,
        emailVerified: true,
        identityVerified: true,
        propertyVerified: true
      },
      reportCount: 1,
      viewCount: 67,
      inquiryCount: 8,
      rejectedAt: '2024-01-21T09:15:00Z',
      rejectedBy: 'Staff Manager',
      rejectionReason: 'Duplicate content - similar post already exists for this property'
    }
  ]);

  const [availableTags] = useState([
    'high_quality', 'needs_improvement', 'spam_risk', 'duplicate_content',
    'inappropriate_images', 'misleading_info', 'verified_owner', 'suspicious_activity'
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'flagged':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'normal':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getAIScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const filteredPosts = posts.filter(post => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return post.status === 'pending';
    if (activeTab === 'flagged') return post.status === 'flagged';
    if (activeTab === 'approved') return post.status === 'approved';
    if (activeTab === 'rejected') return post.status === 'rejected';
    return true;
  });

  const handleOpenReviewModal = (post, action) => {
    setSelectedPost(post);
    setReviewData({
      action: action,
      note: '',
      tags: []
    });
    setShowReviewModal(true);
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    
    const updatedPost = {
      ...selectedPost,
      status: reviewData.action,
      [`${reviewData.action}At`]: new Date().toISOString(),
      [`${reviewData.action}By`]: 'Staff Manager',
      [`${reviewData.action}Reason`]: reviewData.note,
      moderatorTags: reviewData.tags
    };

    setPosts(prev => prev.map(post => 
      post.id === selectedPost.id ? updatedPost : post
    ));

    setShowReviewModal(false);
    setSelectedPost(null);
    setReviewData({ action: '', note: '', tags: [] });
    
    alert(`Post ${reviewData.action} successfully!`);
  };

  const handleTagToggle = (tag) => {
    setReviewData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleQuickAction = (postId, action) => {
    const updatedPost = posts.find(p => p.id === postId);
    if (!updatedPost) return;

    const newPost = {
      ...updatedPost,
      status: action,
      [`${action}At`]: new Date().toISOString(),
      [`${action}By`]: 'Staff Manager'
    };

    setPosts(prev => prev.map(post => 
      post.id === postId ? newPost : post
    ));

    alert(`Post ${action} successfully!`);
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const pendingCount = posts.filter(p => p.status === 'pending').length;
  const flaggedCount = posts.filter(p => p.status === 'flagged').length;
  const approvedCount = posts.filter(p => p.status === 'approved').length;
  const rejectedCount = posts.filter(p => p.status === 'rejected').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Posts Review</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Review and approve rental property posts
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {pendingCount + flaggedCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'all', label: 'All Posts', count: posts.length },
              { key: 'pending', label: 'Pending', count: pendingCount },
              { key: 'flagged', label: 'Flagged', count: flaggedCount },
              { key: 'approved', label: 'Approved', count: approvedCount },
              { key: 'rejected', label: 'Rejected', count: rejectedCount }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-purple-500 text-purple-600 dark:text-purple-400'
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
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <div key={post.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:space-x-6">
                  {/* Post Images */}
                  <div className="lg:w-1/3 mb-4 lg:mb-0">
                    {post.images && post.images.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {post.images.slice(0, 4).map((image, index) => (
                          <div key={index} className="aspect-square bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">🏠</span>
                          </div>
                        ))}
                        {post.images.length > 4 && (
                          <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              +{post.images.length - 4} more
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="aspect-square bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <span className="text-4xl mb-2 block">📷</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">No images</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Post Details */}
                  <div className="lg:w-2/3 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {post.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {post.roomName} - {post.houseName}
                        </p>
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">
                          {formatPrice(post.price)}/month
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(post.status)}`}>
                          {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(post.priority)}`}>
                          {post.priority}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 line-clamp-3">
                      {post.description}
                    </p>

                    {/* Post Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Property Details
                        </h4>
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          <p><span className="font-medium">Area:</span> {post.area}m²</p>
                          <p><span className="font-medium">Max Tenants:</span> {post.maxTenants}</p>
                          <p><span className="font-medium">Location:</span> {post.location}</p>
                          <p><span className="font-medium">Contact:</span> {post.contactPhone}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Author Information
                        </h4>
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          <p><span className="font-medium">Name:</span> {post.authorName}</p>
                          <p><span className="font-medium">Email:</span> {post.authorEmail}</p>
                          <p><span className="font-medium">Phone:</span> {post.authorPhone}</p>
                          <p><span className="font-medium">Submitted:</span> {formatDate(post.submittedAt)}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Performance
                        </h4>
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          <p><span className="font-medium">Views:</span> {post.viewCount}</p>
                          <p><span className="font-medium">Inquiries:</span> {post.inquiryCount}</p>
                          <p><span className="font-medium">Reports:</span> {post.reportCount}</p>
                        </div>
                      </div>
                    </div>

                    {/* AI Analysis */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                        AI Analysis
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                        <div className="text-center">
                          <p className={`text-lg font-bold ${getAIScoreColor(post.aiAnalysis.score)}`}>
                            {post.aiAnalysis.score}/100
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Overall Score</p>
                        </div>
                        <div className="text-center">
                          <p className={`text-lg font-bold ${getAIScoreColor(post.aiAnalysis.qualityScore)}`}>
                            {post.aiAnalysis.qualityScore}/100
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Quality Score</p>
                        </div>
                        <div className="text-center">
                          <p className={`text-lg font-bold ${post.aiAnalysis.spamProbability > 50 ? 'text-red-600' : 'text-green-600'}`}>
                            {post.aiAnalysis.spamProbability}%
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Spam Risk</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                            {post.aiAnalysis.sentiment}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Sentiment</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {post.aiAnalysis.flags.map((flag, index) => (
                          <span key={index} className={`px-2 py-1 text-xs rounded-full ${
                            flag.includes('appropriate') || flag.includes('high_quality') || flag.includes('verified') 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : flag.includes('spam') || flag.includes('suspicious') || flag.includes('low_quality')
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          }`}>
                            {flag.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Verification Status */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                        Verification Status
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Object.entries(post.verificationStatus).map(([key, verified]) => (
                          <div key={key} className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${verified ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Amenities */}
                    {post.amenities && post.amenities.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Amenities
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {post.amenities.map((amenity, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Previous Actions */}
                    {(post.approvedAt || post.rejectedAt) && (
                      <div className={`p-3 rounded-lg ${
                        post.status === 'approved' 
                          ? 'bg-green-50 dark:bg-green-900/20' 
                          : 'bg-red-50 dark:bg-red-900/20'
                      }`}>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                          Previous Action
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {post.status === 'approved' ? 'Approved' : 'Rejected'} by {post.approvedBy || post.rejectedBy} on{' '}
                          {formatDate(post.approvedAt || post.rejectedAt)}
                        </p>
                        {post.rejectionReason && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Reason: {post.rejectionReason}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    {(post.status === 'pending' || post.status === 'flagged') && (
                      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => handleOpenReviewModal(post, 'approved')}
                          className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Approve
                        </button>
                        <button
                          onClick={() => handleOpenReviewModal(post, 'rejected')}
                          className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Reject
                        </button>
                        <button
                          onClick={() => handleQuickAction(post.id, 'flagged')}
                          className="inline-flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          Flag
                        </button>
                        <Link
                          href={`mailto:${post.authorEmail}`}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Contact Author
                        </Link>
                      </div>
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
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No posts found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {activeTab === 'all' 
                ? "No posts available for review."
                : `No ${activeTab} posts found.`
              }
            </p>
            {activeTab !== 'all' && (
              <button
                onClick={() => setActiveTab('all')}
                className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
              >
                Show All Posts
              </button>
            )}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {reviewData.action === 'approved' ? 'Approve Post' : 'Reject Post'}
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

              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white">{selectedPost.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">by {selectedPost.authorName}</p>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {reviewData.action === 'approved' ? 'Approval Notes' : 'Rejection Reason'} *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={reviewData.note}
                    onChange={(e) => setReviewData(prev => ({ ...prev, note: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={
                      reviewData.action === 'approved' 
                        ? "Add any notes about the approval..."
                        : "Explain why this post is being rejected..."
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags (Optional)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleTagToggle(tag)}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                          reviewData.tags.includes(tag)
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        {tag.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
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
                    className={`flex-1 px-4 py-2 font-medium rounded-lg transition-colors text-white ${
                      reviewData.action === 'approved'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {reviewData.action === 'approved' ? 'Approve Post' : 'Reject Post'}
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