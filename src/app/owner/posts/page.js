'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PostsPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [posts, setPosts] = useState([
    {
      id: 1,
      authorId: 1,
      roomId: 1,
      roomName: 'Modern Studio Apartment',
      houseName: 'Sunrise Residence',
      title: 'Beautiful Modern Studio in Downtown - Perfect for Professionals',
      description: 'Stunning studio apartment with city views, modern amenities, and excellent location. Perfect for working professionals who value comfort and convenience.',
      contactPhone: '+1 (555) 123-4567',
      createdAt: '2024-01-20T10:30:00Z',
      isActive: true,
      isApproved: true,
      approvedBy: 201,
      approvedAt: '2024-01-20T14:15:00Z',
      views: 156,
      inquiries: 23,
      favorites: 12,
      images: ['/api/placeholder/400/300', '/api/placeholder/400/300', '/api/placeholder/400/300'],
      price: 250,
      area: 35,
      maxTenants: 2
    },
    {
      id: 2,
      authorId: 1,
      roomId: 2,
      roomName: 'Cozy Room Near University',
      houseName: 'Student Haven',
      title: 'Student-Friendly Room Near Campus - Great for Studies',
      description: 'Quiet and comfortable room perfect for students. Walking distance to university, study-friendly environment, and affordable pricing.',
      contactPhone: '+1 (555) 123-4567',
      createdAt: '2024-01-18T09:15:00Z',
      isActive: true,
      isApproved: false,
      approvedBy: null,
      approvedAt: null,
      views: 89,
      inquiries: 12,
      favorites: 8,
      images: ['/api/placeholder/400/300'],
      price: 180,
      area: 20,
      maxTenants: 1
    },
    {
      id: 3,
      authorId: 1,
      roomId: 3,
      roomName: 'Spacious Shared House Room',
      houseName: 'Green Valley House',
      title: 'Large Room in Peaceful Shared House with Garden',
      description: 'Spacious room in a beautiful shared house with garden access. Perfect for those who enjoy community living in a peaceful environment.',
      contactPhone: '+1 (555) 123-4567',
      createdAt: '2024-01-15T16:45:00Z',
      isActive: false,
      isApproved: true,
      approvedBy: 201,
      approvedAt: '2024-01-16T10:30:00Z',
      views: 67,
      inquiries: 8,
      favorites: 5,
      images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
      price: 200,
      area: 45,
      maxTenants: 3
    },
    {
      id: 4,
      authorId: 1,
      roomId: 4,
      roomName: 'Luxury Penthouse Room',
      houseName: 'Sunrise Residence',
      title: 'Premium Penthouse Room with City Views - Executive Living',
      description: 'Luxury penthouse room with panoramic city views and premium amenities. Perfect for executives and professionals seeking upscale living.',
      contactPhone: '+1 (555) 123-4567',
      createdAt: '2024-01-12T11:20:00Z',
      isActive: true,
      isApproved: true,
      approvedBy: 202,
      approvedAt: '2024-01-13T09:45:00Z',
      views: 234,
      inquiries: 45,
      favorites: 28,
      images: ['/api/placeholder/400/300'],
      price: 350,
      area: 50,
      maxTenants: 2
    }
  ]);

  const [showPostModal, setShowPostModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [postData, setPostData] = useState({
    roomId: '',
    title: '',
    description: '',
    contactPhone: '',
    images: []
  });

  const [availableRooms] = useState([
    { id: 1, name: 'Modern Studio Apartment', houseName: 'Sunrise Residence' },
    { id: 2, name: 'Cozy Room Near University', houseName: 'Student Haven' },
    { id: 3, name: 'Spacious Shared House Room', houseName: 'Green Valley House' },
    { id: 4, name: 'Luxury Penthouse Room', houseName: 'Sunrise Residence' }
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (post) => {
    if (!post.isActive) {
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
    if (!post.isApproved) {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  };

  const getStatusText = (post) => {
    if (!post.isActive) return 'Inactive';
    if (!post.isApproved) return 'Pending Approval';
    return 'Active';
  };

  const getStatusIcon = (post) => {
    if (!post.isActive) return '⏸️';
    if (!post.isApproved) return '⏳';
    return '✅';
  };

  const filteredPosts = posts.filter(post => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return post.isActive && post.isApproved;
    if (activeTab === 'pending') return post.isActive && !post.isApproved;
    if (activeTab === 'inactive') return !post.isActive;
    return true;
  });

  const handleNewPost = () => {
    setEditingPost(null);
    setPostData({
      roomId: '',
      title: '',
      description: '',
      contactPhone: '+1 (555) 123-4567',
      images: []
    });
    setShowPostModal(true);
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setPostData({
      roomId: post.roomId,
      title: post.title,
      description: post.description,
      contactPhone: post.contactPhone,
      images: post.images
    });
    setShowPostModal(true);
  };

  const handleSubmitPost = (e) => {
    e.preventDefault();
    
    const selectedRoom = availableRooms.find(r => r.id === parseInt(postData.roomId));
    
    if (editingPost) {
      // Update existing post
      setPosts(prev => prev.map(post => 
        post.id === editingPost.id 
          ? { 
              ...post, 
              ...postData,
              roomId: parseInt(postData.roomId),
              roomName: selectedRoom?.name || post.roomName,
              houseName: selectedRoom?.houseName || post.houseName,
              isApproved: false, // Reset approval status when edited
              approvedBy: null,
              approvedAt: null
            }
          : post
      ));
      alert('Post updated successfully! It will need re-approval.');
    } else {
      // Add new post
      const newPost = {
        id: posts.length + 1,
        authorId: 1,
        ...postData,
        roomId: parseInt(postData.roomId),
        roomName: selectedRoom?.name || 'Unknown Room',
        houseName: selectedRoom?.houseName || 'Unknown House',
        createdAt: new Date().toISOString(),
        isActive: true,
        isApproved: false,
        approvedBy: null,
        approvedAt: null,
        views: 0,
        inquiries: 0,
        favorites: 0,
        price: 250, // This should come from room data
        area: 35,   // This should come from room data
        maxTenants: 2 // This should come from room data
      };
      setPosts(prev => [newPost, ...prev]);
      alert('Post created successfully! It will be reviewed for approval.');
    }

    setShowPostModal(false);
    setEditingPost(null);
    setPostData({
      roomId: '',
      title: '',
      description: '',
      contactPhone: '',
      images: []
    });
  };

  const handleDeletePost = (postId) => {
    if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      setPosts(prev => prev.filter(post => post.id !== postId));
      alert('Post deleted successfully!');
    }
  };

  const handleToggleActive = (postId) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, isActive: !post.isActive }
        : post
    ));
  };

  const handleDuplicatePost = (post) => {
    const duplicatedPost = {
      ...post,
      id: posts.length + 1,
      title: `${post.title} (Copy)`,
      createdAt: new Date().toISOString(),
      isApproved: false,
      approvedBy: null,
      approvedAt: null,
      views: 0,
      inquiries: 0,
      favorites: 0
    };
    setPosts(prev => [duplicatedPost, ...prev]);
    alert('Post duplicated successfully!');
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalPosts = posts.length;
  const activePosts = posts.filter(p => p.isActive && p.isApproved).length;
  const pendingPosts = posts.filter(p => p.isActive && !p.isApproved).length;
  const inactivePosts = posts.filter(p => !p.isActive).length;
  const totalViews = posts.reduce((sum, post) => sum + post.views, 0);
  const totalInquiries = posts.reduce((sum, post) => sum + post.inquiries, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Posts Management</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Create and manage your rental property listings
              </p>
            </div>
            <button
              onClick={handleNewPost}
              className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Post
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'all', label: 'All Posts', count: totalPosts },
              { key: 'active', label: 'Active', count: activePosts },
              { key: 'pending', label: 'Pending', count: pendingPosts },
              { key: 'inactive', label: 'Inactive', count: inactivePosts }
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Posts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalPosts}</p>
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Posts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{activePosts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Views</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalViews}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Inquiries</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalInquiries}</p>
            </div>
          </div>
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
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">
                          {formatPrice(post.price)}/month
                        </p>
                      </div>
                      <div className="mt-2 sm:mt-0 flex items-center space-x-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(post)}`}>
                          <span className="mr-1">{getStatusIcon(post)}</span>
                          {getStatusText(post)}
                        </span>
                      </div>
                    </div>

                    {/* Post Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Post Details
                        </h4>
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          <p><span className="font-medium">Created:</span> {formatDate(post.createdAt)}</p>
                          <p><span className="font-medium">Contact:</span> {post.contactPhone}</p>
                          <p><span className="font-medium">Room Size:</span> {post.area}m² • {post.maxTenants} people</p>
                          {post.isApproved && post.approvedAt && (
                            <p><span className="font-medium">Approved:</span> {formatDate(post.approvedAt)}</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Performance
                        </h4>
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          <p><span className="font-medium">Views:</span> {post.views}</p>
                          <p><span className="font-medium">Inquiries:</span> {post.inquiries}</p>
                          <p><span className="font-medium">Favorites:</span> {post.favorites}</p>
                          <p><span className="font-medium">Images:</span> {post.images.length}</p>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Description
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {post.description}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => handleEditPost(post)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Edit
                      </button>

                      <button
                        onClick={() => handleToggleActive(post.id)}
                        className={`inline-flex items-center px-4 py-2 font-medium rounded-lg transition-colors ${
                          post.isActive
                            ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {post.isActive ? 'Deactivate' : 'Activate'}
                      </button>

                      <button
                        onClick={() => handleDuplicatePost(post)}
                        className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Duplicate
                      </button>

                      <Link
                        href={`/rooms/${post.roomId}`}
                        className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Live
                      </Link>

                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
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
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No posts found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {activeTab === 'all' 
                ? "You haven't created any posts yet."
                : `No ${activeTab} posts found.`
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleNewPost}
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Post
              </button>
              {activeTab !== 'all' && (
                <button
                  onClick={() => setActiveTab('all')}
                  className="inline-flex items-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Show All Posts
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Post Modal */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingPost ? 'Edit Post' : 'Create New Post'}
                </h3>
                <button
                  onClick={() => setShowPostModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmitPost} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Room *
                  </label>
                  <select
                    required
                    value={postData.roomId}
                    onChange={(e) => setPostData(prev => ({ ...prev, roomId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select Room</option>
                    {availableRooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name} - {room.houseName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Post Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={postData.title}
                    onChange={(e) => setPostData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter an attractive title for your post"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={postData.description}
                    onChange={(e) => setPostData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Describe your room in detail. Highlight key features and benefits..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={postData.contactPhone}
                    onChange={(e) => setPostData(prev => ({ ...prev, contactPhone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter contact phone number"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPostModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    {editingPost ? 'Update Post' : 'Create Post'}
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