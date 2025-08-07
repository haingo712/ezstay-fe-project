'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ContentModerationPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedItems, setSelectedItems] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const [contentItems, setContentItems] = useState([
    {
      id: 1,
      type: 'post',
      title: 'Beautiful Studio Apartment in Downtown',
      content: 'Amazing studio apartment with city views, modern amenities, and great location. Perfect for young professionals.',
      authorId: 101,
      authorName: 'John Doe',
      authorEmail: 'john.doe@example.com',
      submittedAt: '2024-01-22T10:30:00Z',
      status: 'pending',
      priority: 'normal',
      flaggedReasons: [],
      images: ['/api/placeholder/300/200', '/api/placeholder/300/200'],
      metadata: {
        price: 250,
        location: 'Downtown',
        roomType: 'Studio',
        contactPhone: '+1 (555) 123-4567'
      },
      aiScore: 85,
      aiFlags: ['price_reasonable', 'content_appropriate']
    },
    {
      id: 2,
      type: 'post',
      title: 'CHEAP ROOM!!! BEST DEAL!!!',
      content: 'Super cheap room available now! Contact me immediately for the best deal in the city! Don\'t miss out!!!',
      authorId: 102,
      authorName: 'SpamUser123',
      authorEmail: 'spam@example.com',
      submittedAt: '2024-01-22T09:15:00Z',
      status: 'flagged',
      priority: 'high',
      flaggedReasons: ['spam_content', 'excessive_caps', 'suspicious_pricing'],
      images: [],
      metadata: {
        price: 50,
        location: 'Unknown',
        roomType: 'Room',
        contactPhone: '+1 (555) 999-9999'
      },
      aiScore: 25,
      aiFlags: ['spam_detected', 'price_suspicious', 'excessive_punctuation']
    },
    {
      id: 3,
      type: 'review',
      title: 'Review for Green Valley House',
      content: 'This place was absolutely terrible! The landlord is a scammer and the room was nothing like described. Avoid at all costs!',
      authorId: 103,
      authorName: 'AngryTenant',
      authorEmail: 'angry@example.com',
      submittedAt: '2024-01-21T16:45:00Z',
      status: 'flagged',
      priority: 'medium',
      flaggedReasons: ['defamatory_content', 'unverified_claims'],
      images: [],
      metadata: {
        rating: 1,
        propertyId: 3,
        propertyName: 'Green Valley House'
      },
      aiScore: 40,
      aiFlags: ['negative_sentiment', 'potential_defamation']
    },
    {
      id: 4,
      type: 'post',
      title: 'Luxury Penthouse Room Available',
      content: 'Premium penthouse room with panoramic city views. Fully furnished with high-end amenities. Perfect for executives.',
      authorId: 104,
      authorName: 'Michael Rodriguez',
      authorEmail: 'michael@example.com',
      submittedAt: '2024-01-21T14:20:00Z',
      status: 'approved',
      priority: 'normal',
      flaggedReasons: [],
      images: ['/api/placeholder/300/200'],
      metadata: {
        price: 350,
        location: 'Downtown',
        roomType: 'Penthouse',
        contactPhone: '+1 (555) 345-6789'
      },
      aiScore: 92,
      aiFlags: ['high_quality_content', 'verified_owner']
    },
    {
      id: 5,
      type: 'user_report',
      title: 'Report: Inappropriate Images',
      content: 'User reported that post contains inappropriate images that don\'t match the room description.',
      authorId: 105,
      authorName: 'ConcernedUser',
      authorEmail: 'concerned@example.com',
      submittedAt: '2024-01-21T11:30:00Z',
      status: 'pending',
      priority: 'high',
      flaggedReasons: ['inappropriate_images', 'misleading_content'],
      images: [],
      metadata: {
        reportedPostId: 6,
        reportedUserId: 106,
        reportType: 'inappropriate_content'
      },
      aiScore: 60,
      aiFlags: ['user_report', 'requires_manual_review']
    },
    {
      id: 6,
      type: 'post',
      title: 'Cozy Student Room Near University',
      content: 'Perfect room for students! Walking distance to campus, quiet neighborhood, affordable price.',
      authorId: 107,
      authorName: 'Emily Chen',
      authorEmail: 'emily@example.com',
      submittedAt: '2024-01-20T13:15:00Z',
      status: 'rejected',
      priority: 'normal',
      flaggedReasons: ['duplicate_content'],
      images: ['/api/placeholder/300/200'],
      metadata: {
        price: 180,
        location: 'University Area',
        roomType: 'Student Room',
        contactPhone: '+1 (555) 234-5678'
      },
      aiScore: 70,
      aiFlags: ['duplicate_detected'],
      moderatorNote: 'Duplicate of existing post. User has been notified.'
    }
  ]);

  const [filterOptions, setFilterOptions] = useState({
    type: 'all',
    priority: 'all',
    aiScore: 'all',
    dateRange: 'all'
  });

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
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'post':
        return '📝';
      case 'review':
        return '⭐';
      case 'user_report':
        return '🚨';
      case 'image':
        return '🖼️';
      default:
        return '📄';
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

  const filteredItems = contentItems.filter(item => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return item.status === 'pending';
    if (activeTab === 'flagged') return item.status === 'flagged';
    if (activeTab === 'approved') return item.status === 'approved';
    if (activeTab === 'rejected') return item.status === 'rejected';
    return true;
  }).filter(item => {
    if (filterOptions.type !== 'all' && item.type !== filterOptions.type) return false;
    if (filterOptions.priority !== 'all' && item.priority !== filterOptions.priority) return false;
    if (filterOptions.aiScore !== 'all') {
      if (filterOptions.aiScore === 'high' && item.aiScore < 80) return false;
      if (filterOptions.aiScore === 'medium' && (item.aiScore < 60 || item.aiScore >= 80)) return false;
      if (filterOptions.aiScore === 'low' && item.aiScore >= 60) return false;
    }
    return true;
  });

  const handleItemSelect = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(item => item.id));
    }
  };

  const handleBulkAction = (action) => {
    if (selectedItems.length === 0) return;

    const updatedItems = contentItems.map(item => {
      if (selectedItems.includes(item.id)) {
        return { ...item, status: action };
      }
      return item;
    });

    setContentItems(updatedItems);
    setSelectedItems([]);
    setShowBulkActions(false);
    
    alert(`${selectedItems.length} items ${action}!`);
  };

  const handleItemAction = (itemId, action, note = '') => {
    const updatedItems = contentItems.map(item => {
      if (item.id === itemId) {
        return { 
          ...item, 
          status: action,
          moderatorNote: note || undefined,
          reviewedAt: new Date().toISOString(),
          reviewedBy: 'Staff Manager'
        };
      }
      return item;
    });

    setContentItems(updatedItems);
    alert(`Item ${action}!`);
  };

  const handleFilterChange = (filterType, value) => {
    setFilterOptions(prev => ({ ...prev, [filterType]: value }));
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const pendingCount = contentItems.filter(item => item.status === 'pending').length;
  const flaggedCount = contentItems.filter(item => item.status === 'flagged').length;
  const approvedCount = contentItems.filter(item => item.status === 'approved').length;
  const rejectedCount = contentItems.filter(item => item.status === 'rejected').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Content Moderation</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Review and moderate user-generated content
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              {selectedItems.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowBulkActions(!showBulkActions)}
                    className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Bulk Actions ({selectedItems.length})
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showBulkActions && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                      <div className="py-1">
                        <button
                          onClick={() => handleBulkAction('approved')}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Approve Selected
                        </button>
                        <button
                          onClick={() => handleBulkAction('rejected')}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Reject Selected
                        </button>
                        <button
                          onClick={() => handleBulkAction('flagged')}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Flag Selected
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'all', label: 'All Items', count: contentItems.length },
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

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content Type
              </label>
              <select
                value={filterOptions.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="post">Posts</option>
                <option value="review">Reviews</option>
                <option value="user_report">User Reports</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </label>
              <select
                value={filterOptions.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="normal">Normal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                AI Score
              </label>
              <select
                value={filterOptions.aiScore}
                onChange={(e) => handleFilterChange('aiScore', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Scores</option>
                <option value="high">High (80+)</option>
                <option value="medium">Medium (60-79)</option>
                <option value="low">Low (&lt;60)</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSelectAll}
                className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                {selectedItems.length === filteredItems.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Items */}
      {filteredItems.length > 0 ? (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  {/* Checkbox */}
                  <div className="flex-shrink-0 pt-1">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleItemSelect(item.id)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-2xl">{getTypeIcon(item.type)}</span>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {item.title}
                          </h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(item.status)}`}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(item.priority)}`}>
                            {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                          </span>
                        </div>
                        
                        <p className="text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
                          {item.content}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                              Author Information
                            </h4>
                            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                              <p><span className="font-medium">Name:</span> {item.authorName}</p>
                              <p><span className="font-medium">Email:</span> {item.authorEmail}</p>
                              <p><span className="font-medium">Submitted:</span> {formatDate(item.submittedAt)}</p>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                              AI Analysis
                            </h4>
                            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                              <p>
                                <span className="font-medium">Score:</span> 
                                <span className={`ml-1 font-bold ${getAIScoreColor(item.aiScore)}`}>
                                  {item.aiScore}/100
                                </span>
                              </p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {item.aiFlags.map((flag, index) => (
                                  <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                                    {flag.replace('_', ' ')}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Flagged Reasons */}
                        {item.flaggedReasons.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                              Flagged Reasons
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {item.flaggedReasons.map((reason, index) => (
                                <span key={index} className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs rounded-full">
                                  {reason.replace('_', ' ')}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Metadata */}
                        {item.metadata && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                              Additional Information
                            </h4>
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                {Object.entries(item.metadata).map(([key, value]) => (
                                  <div key={key}>
                                    <span className="font-medium text-gray-600 dark:text-gray-400">
                                      {key.replace(/([A-Z])/g, ' $1').replace('_', ' ')}:
                                    </span>
                                    <span className="ml-1 text-gray-900 dark:text-white">
                                      {typeof value === 'number' && key.includes('price') ? `$${value}` : value}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Images */}
                        {item.images && item.images.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                              Images ({item.images.length})
                            </h4>
                            <div className="flex space-x-2 overflow-x-auto">
                              {item.images.map((image, index) => (
                                <div key={index} className="w-20 h-20 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <span className="text-2xl">🖼️</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Moderator Note */}
                        {item.moderatorNote && (
                          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">
                              Moderator Note
                            </h4>
                            <p className="text-sm text-blue-800 dark:text-blue-300">
                              {item.moderatorNote}
                            </p>
                          </div>
                        )}

                        {/* Actions */}
                        {(item.status === 'pending' || item.status === 'flagged') && (
                          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <button
                              onClick={() => handleItemAction(item.id, 'approved')}
                              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                const note = prompt('Reason for rejection (optional):');
                                handleItemAction(item.id, 'rejected', note);
                              }}
                              className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Reject
                            </button>
                            <button
                              onClick={() => handleItemAction(item.id, 'flagged')}
                              className="inline-flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              Flag for Review
                            </button>
                            <Link
                              href={`mailto:${item.authorEmail}`}
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
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No content found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {activeTab === 'all' 
                ? "No content items match your current filters."
                : `No ${activeTab} content found.`
              }
            </p>
            {activeTab !== 'all' && (
              <button
                onClick={() => setActiveTab('all')}
                className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
              >
                Show All Content
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}