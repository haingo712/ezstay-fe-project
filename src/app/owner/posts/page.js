'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { rentalPostService } from '@/services/rentalPostService';
import boardingHouseService from '@/services/boardingHouseService';
import roomService from '@/services/roomService';
import { FileText, Plus, Edit2, Trash2, Copy, X, Building, Home } from 'lucide-react';

export default function PostsPage() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [posts, setPosts] = useState([]);
  const [showPostModal, setShowPostModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [postData, setPostData] = useState({
    roomId: '',
    title: '',
    description: '',
    contactPhone: ''
  });
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const loadAvailableRooms = useCallback(async () => {
    try {
      if (!user || !user.id) {
        console.log('No user, skipping room load');
        return;
      }
      setLoadingRooms(true);
      const houses = await boardingHouseService.getAll();
      const ownerHouses = houses.filter(h => h.ownerId === user.id);
      const allRooms = [];
      for (const house of ownerHouses) {
        try {
          const rooms = await roomService.getByBoardingHouseId(house.id);
          // Filter only available rooms (roomStatus = 0 or "Available")
          const availableRooms = rooms.filter(room => 
            room.roomStatus === 0 || 
            room.roomStatus === "Available" || 
            room.roomStatus?.toLowerCase() === "available"
          );
          const roomsWithHouse = availableRooms.map(room => ({
            ...room,
            houseName: house.houseName,
            houseId: house.id
          }));
          allRooms.push(...roomsWithHouse);
        } catch (err) {
          console.error(`Error loading rooms for house ${house.id}:`, err);
        }
      }
      console.log('✅ Loaded available rooms:', allRooms.length, 'rooms');
      setAvailableRooms(allRooms);
    } catch (error) {
      console.error('Error loading rooms:', error);
    } finally {
      setLoadingRooms(false);
    }
  }, [user]);

  const loadPosts = useCallback(async () => {
    try {
      if (!user || !user.id) {
        console.log(' No user, skipping posts load');
        setLoading(false);
        return;
      }
      setLoading(true);
      console.log(' Loading posts for owner...');
      const response = await rentalPostService.getOwnerPosts();
      console.log(' Posts response:', response);
      setPosts(response || []);
    } catch (error) {
      console.error(' Error loading posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && user) {
      loadPosts();
      loadAvailableRooms();
    }
  }, [mounted, user, loadPosts, loadAvailableRooms]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (post) => {
    if (!post.isActive) return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    if (post.isApproved === null) return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300';
    if (post.isApproved === 0) return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300';
    return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300';
  };

  const getStatusText = (post) => {
    if (!post.isActive) return 'Inactive';
    if (post.isApproved === null) return 'Pending';
    if (post.isApproved === 0) return 'Rejected';
    return 'Active';
  };

  const filteredPosts = posts.filter(post => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return post.isActive && post.isApproved === 1;
    if (activeTab === 'pending') return post.isActive && post.isApproved === null;
    if (activeTab === 'inactive') return !post.isActive || post.isApproved === 0;
    return true;
  });

  const stats = {
    total: posts.length,
    active: posts.filter(p => p.isActive && p.isApproved === 1).length,
    pending: posts.filter(p => p.isActive && p.isApproved === null).length,
    inactive: posts.filter(p => !p.isActive || p.isApproved === 0).length,
  };

  const handleNewPost = () => {
    setEditingPost(null);
    setPostData({
      roomId: '',
      title: '',
      description: '',
      contactPhone: user?.phone || ''
    });
    setFormErrors({});
    setShowPostModal(true);
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setPostData({
      roomId: post.roomId,
      title: post.title,
      description: post.description,
      contactPhone: post.contactPhone
    });
    setFormErrors({});
    setShowPostModal(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!postData.roomId) errors.roomId = 'Please select a room';
    if (!postData.title.trim()) errors.title = 'Title is required';
    if (!postData.description.trim()) errors.description = 'Description is required';
    if (!postData.contactPhone.trim()) errors.contactPhone = 'Contact phone is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingPost) {
        await rentalPostService.updatePost(editingPost.id, postData);
        alert('Post updated successfully!');
      } else {
        const response = await rentalPostService.createPost(postData);
        if (response.success) {
          alert(response.message || 'Post created successfully!');
        } else {
          alert(response.message || 'Failed to create post');
          return;
        }
      }
      await loadPosts();
      setShowPostModal(false);
      setPostData({ roomId: '', title: '', description: '', contactPhone: user?.phone || '' });
    } catch (error) {
      console.error('Error submitting post:', error);
      alert(error.response?.data?.message || 'Failed to submit post');
    }
  };

  const handleDeletePost = async (postId) => {
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        await rentalPostService.deletePost(postId, user.id);
        await loadPosts();
        alert('Post deleted successfully!');
      } catch (error) {
        console.error('Error deleting post:', error);
        alert(error.response?.data?.message || 'Failed to delete post');
      }
    }
  };

  const handleDuplicatePost = async (post) => {
    try {
      const duplicatedData = {
        roomId: post.roomId,
        title: `${post.title} (Copy)`,
        description: post.description,
        contactPhone: post.contactPhone
      };
      await rentalPostService.createPost(duplicatedData);
      await loadPosts();
      alert('Post duplicated successfully!');
    } catch (error) {
      console.error('Error duplicating post:', error);
      alert(error.response?.data?.message || 'Failed to duplicate post');
    }
  };

  if (!mounted) return null;

  if (loading && posts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Posts Management</h1>
              <p className="text-gray-600 dark:text-gray-400">Create and manage rental listings</p>
            </div>
            <button
              onClick={handleNewPost}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
            >
              <Plus className="w-5 h-5" />
              <span>Create Post</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <FileText className="w-10 h-10 text-blue-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.active}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-green-600 dark:bg-green-400 rounded-full"></div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-yellow-600 dark:bg-yellow-400 rounded-full"></div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Inactive</p>
                <p className="text-3xl font-bold text-gray-600 dark:text-gray-400">{stats.inactive}</p>
              </div>
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-gray-600 dark:bg-gray-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-1 mb-6 inline-flex">
          {[
            { id: 'all', label: 'All', count: stats.total },
            { id: 'active', label: 'Active', count: stats.active },
            { id: 'pending', label: 'Pending', count: stats.pending },
            { id: 'inactive', label: 'Inactive', count: stats.inactive },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Posts Grid */}
        {filteredPosts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No posts found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Create your first rental post</p>
            <button
              onClick={handleNewPost}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
            >
              Create Post
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(post)}`}>
                      {getStatusText(post)}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditPost(post)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicatePost(post)}
                        className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                    {post.description}
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Building className="w-4 h-4 mr-2" />
                      <span className="font-medium">{post.houseName || 'Unknown House'}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Home className="w-4 h-4 mr-2" />
                      <span>{post.roomName || 'Unknown Room'}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <span> {post.contactPhone}</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-3">
                      Created: {formatDate(post.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-600">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                  <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingPost ? 'Edit Post' : 'Create Post'}
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowPostModal(false);
                  setEditingPost(null);
                  setPostData({ roomId: '', title: '', description: '', contactPhone: user?.phone || '' });
                  setFormErrors({});
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitPost} className="space-y-6">
              {/* Room Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  <span className="flex items-center">
                     Room <span className="text-red-500 ml-1">*</span>
                  </span>
                </label>
                <select
                  value={postData.roomId}
                  onChange={(e) => {
                    setPostData({ ...postData, roomId: e.target.value });
                    if (formErrors.roomId) setFormErrors({ ...formErrors, roomId: '' });
                  }}
                  className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white/70 dark:bg-gray-700/70 text-gray-900 dark:text-white ${
                    formErrors.roomId ? 'border-red-500 ring-1 ring-red-200' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  disabled={loadingRooms || editingPost}
                >
                  <option value="">
                    {loadingRooms ? 'Loading rooms...' : 'Select a room'}
                  </option>
                  {availableRooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.houseName} - {room.roomName}
                    </option>
                  ))}
                </select>
                {formErrors.roomId && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formErrors.roomId}</p>
                )}
                {!loadingRooms && availableRooms.length === 0 && (
                  <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
                    No rooms available. Please create a boarding house and rooms first.
                  </p>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  <span className="flex items-center">
                     Title <span className="text-red-500 ml-1">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  value={postData.title}
                  onChange={(e) => {
                    setPostData({ ...postData, title: e.target.value });
                    if (formErrors.title) setFormErrors({ ...formErrors, title: '' });
                  }}
                  className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white/70 dark:bg-gray-700/70 text-gray-900 dark:text-white ${
                    formErrors.title ? 'border-red-500 ring-1 ring-red-200' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter post title"
                />
                {formErrors.title && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formErrors.title}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  <span className="flex items-center">
                     Description <span className="text-red-500 ml-1">*</span>
                  </span>
                </label>
                <textarea
                  rows="5"
                  value={postData.description}
                  onChange={(e) => {
                    setPostData({ ...postData, description: e.target.value });
                    if (formErrors.description) setFormErrors({ ...formErrors, description: '' });
                  }}
                  className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white/70 dark:bg-gray-700/70 text-gray-900 dark:text-white resize-none ${
                    formErrors.description ? 'border-red-500 ring-1 ring-red-200' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Describe the room and rental details..."
                />
                {formErrors.description && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formErrors.description}</p>
                )}
              </div>

              {/* Contact Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  <span className="flex items-center">
                     Contact Phone <span className="text-red-500 ml-1">*</span>
                  </span>
                </label>
                <input
                  type="tel"
                  value={postData.contactPhone}
                  onChange={(e) => {
                    setPostData({ ...postData, contactPhone: e.target.value });
                    if (formErrors.contactPhone) setFormErrors({ ...formErrors, contactPhone: '' });
                  }}
                  className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white/70 dark:bg-gray-700/70 text-gray-900 dark:text-white ${
                    formErrors.contactPhone ? 'border-red-500 ring-1 ring-red-200' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter contact phone number"
                />
                {formErrors.contactPhone && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formErrors.contactPhone}</p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPostModal(false);
                    setEditingPost(null);
                    setPostData({ roomId: '', title: '', description: '', contactPhone: user?.phone || '' });
                    setFormErrors({});
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl"
                >
                  {editingPost ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
