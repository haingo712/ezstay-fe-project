'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { rentalPostService } from '@/services/rentalPostService';
import boardingHouseService from '@/services/boardingHouseService';
import roomService from '@/services/roomService';
import { FileText, Plus, Edit2, Trash2, Copy, X, Building, Home, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';

export default function PostsPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [posts, setPosts] = useState([]);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [detailPost, setDetailPost] = useState(null);
  const [postData, setPostData] = useState({
    boardingHouseId: '',
    roomIds: [],
    title: '',
    description: '',
    contactPhone: '',
    images: []
  });
  const [boardingHouses, setBoardingHouses] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const loadBoardingHouses = useCallback(async () => {
    try {
      if (!user || !user.id) {
        console.log('No user, skipping boarding houses load');
        return;
      }
      console.log('🏠 Loading boarding houses...');
      const houses = await boardingHouseService.getAll();
      const ownerHouses = houses.filter(h => h.ownerId === user.id);
      console.log('✅ Loaded boarding houses:', ownerHouses.length);
      setBoardingHouses(ownerHouses);
    } catch (error) {
      console.error('Error loading boarding houses:', error);
    }
  }, [user]);

  const loadRoomsForHouse = useCallback(async (houseId, currentRoomId = null) => {
    if (!houseId) {
      setAvailableRooms([]);
      return;
    }
    try {
      setLoadingRooms(true);
      console.log('🚪 Loading rooms for house:', houseId, 'currentRoomId:', currentRoomId);
      const rooms = await roomService.getByBoardingHouseId(houseId);

      if (currentRoomId) {
        // When editing, include all rooms (so current room is visible)
        // but prioritize available rooms + current room
        const currentRoom = rooms.find(r => r.id === currentRoomId);
        const availableRooms = rooms.filter(room =>
          room.id === currentRoomId || // Include current room
          room.roomStatus === 0 ||
          room.roomStatus === "Available" ||
          room.roomStatus?.toLowerCase() === "available"
        );
        console.log('✅ Loaded rooms for edit (including current):', availableRooms.length, 'rooms');
        setAvailableRooms(availableRooms);
      } else {
        // When creating new post, filter only available rooms (roomStatus = 0 or "Available")
        const availableRooms = rooms.filter(room =>
          room.roomStatus === 0 ||
          room.roomStatus === "Available" ||
          room.roomStatus?.toLowerCase() === "available"
        );
        console.log('✅ Loaded available rooms:', availableRooms.length, 'rooms');
        setAvailableRooms(availableRooms);
      }
    } catch (error) {
      console.error('Error loading rooms:', error);
      setAvailableRooms([]);
    } finally {
      setLoadingRooms(false);
    }
  }, []);

  const loadPosts = useCallback(async () => {
    try {
      if (!user || !user.id) {
        console.log('📋 No user, skipping posts load');
        setLoading(false);
        return;
      }
      setLoading(true);
      console.log('📋 Loading posts for owner...');
      const response = await rentalPostService.getOwnerPosts();
      console.log('📋 Posts response:', response);

      // Debug: Log first post to check data structure
      if (response && response.length > 0) {
        console.log('📋 First post FULL data:', response[0]);
        console.log('📋 House name:', response[0].houseName);
        console.log('📋 Room name:', response[0].roomName);
        console.log('📋 Author name:', response[0].authorName);
        console.log('📋 Contact phone:', response[0].contactPhone);
        console.log('📋 Image URLs:', response[0].imageUrls);
        console.log('📋 boardingHouseId:', response[0].boardingHouseId);
        console.log('📋 roomId:', response[0].roomId);
      }

      setPosts(response || []);
    } catch (error) {
      console.error('❌ Error loading posts:', error);
      // Show empty state on error
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    console.log('🖼️ imagePreviews updated:', imagePreviews.length, imagePreviews);
  }, [imagePreviews]);

  useEffect(() => {
    if (mounted && user) {
      loadPosts();
      loadBoardingHouses();
    }
  }, [mounted, user, loadPosts, loadBoardingHouses]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusColor = (post) => {
    if (!post.isActive) return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    if (post.isApproved === 0) return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300';
    if (post.isApproved === 2) return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300';
    return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300';
  };

  const getStatusText = (post) => {
    if (!post.isActive) return t('ownerPosts.status.inactive');
    if (post.isApproved === 0) return t('ownerPosts.status.pending');
    if (post.isApproved === 2) return t('ownerPosts.status.rejected');
    return t('ownerPosts.status.active');
  };

  const filteredPosts = posts.filter(post => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return post.isActive && post.isApproved === 1;
    if (activeTab === 'pending') return post.isActive && post.isApproved === 0;
    if (activeTab === 'inactive') return !post.isActive || post.isApproved === 2;
    return true;
  });

  const stats = {
    total: posts.length,
    active: posts.filter(p => p.isActive && p.isApproved === 1).length,
    pending: posts.filter(p => p.isActive && p.isApproved === 0).length,
    inactive: posts.filter(p => !p.isActive || p.isApproved === 2).length,
  };

  const handleNewPost = () => {
    setEditingPost(null);
    setPostData({
      boardingHouseId: '',
      roomIds: [],
      title: '',
      description: '',
      contactPhone: user?.phone || '',
      images: []
    });
    setFormErrors({});
    setImagePreviews([]);
    setAvailableRooms([]);
    setShowPostModal(true);
  };

  const handleEditPost = (post) => {
    console.log('🔧 Editing post:', post);
    console.log('📷 Post imageUrls:', post.imageUrls);
    console.log('📷 imageUrls type:', typeof post.imageUrls, Array.isArray(post.imageUrls));

    setEditingPost(post);
    setPostData({
      boardingHouseId: post.boardingHouseId || '',
      roomIds: post.roomId ? [post.roomId] : [],
      title: post.title,
      description: post.content || post.description,
      contactPhone: post.contactPhone,
      images: []
    });
    setFormErrors({});

    const imageUrls = post.imageUrls || [];
    console.log('📷 Setting imagePreviews to:', imageUrls);
    setImagePreviews(imageUrls);

    if (post.boardingHouseId) {
      loadRoomsForHouse(post.boardingHouseId, post.roomId);
    }
    setShowPostModal(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!postData.boardingHouseId) errors.boardingHouseId = 'Please select a boarding house';
    if (!postData.title.trim()) errors.title = 'Title is required';
    if (!postData.description.trim()) errors.description = 'Description is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingPost) {
        // When editing, include existing imageUrls from imagePreviews
        const updateData = {
          ...postData,
          imageUrls: imagePreviews
        };
        await rentalPostService.updatePost(editingPost.id, updateData);
        toast.success(t('ownerPosts.messages.updateSuccess'));
      } else {
        const response = await rentalPostService.createPost(postData);
        if (!response.isSuccess) {
          toast.error(response.message || t('ownerPosts.messages.createFailed'));
          return;
        }
        // Don't show success toast for create - let user see it in the list
      }
      await loadPosts();
      setShowPostModal(false);
      setPostData({
        boardingHouseId: '',
        roomIds: [],
        title: '',
        description: '',
        contactPhone: user?.phone || '',
        images: []
      });
      setImagePreviews([]);
    } catch (error) {
      console.error('Error submitting post:', error);
      toast.error(error.response?.data?.message || t('ownerPosts.messages.createFailed'));
    }
  };

  const handleDeletePost = async (postId) => {
    if (confirm(t('ownerPosts.messages.deleteConfirm'))) {
      try {
        await rentalPostService.deletePost(postId, user.id);
        await loadPosts();
        // Don't show success toast - let user see the result in the list
      } catch (error) {
        console.error('Error deleting post:', error);
        toast.error(error.response?.data?.message || t('ownerPosts.messages.deleteFailed'));
      }
    }
  };

  const handleDuplicatePost = async (post) => {
    try {
      const duplicatedData = {
        boardingHouseId: post.boardingHouseId,
        roomIds: post.roomId || [],
        title: `${post.title} (Copy)`,
        description: post.content || post.description,
        contactPhone: post.contactPhone,
        images: []
      };
      await rentalPostService.createPost(duplicatedData);
      await loadPosts();
      toast.success(t('ownerPosts.messages.duplicateSuccess'));
    } catch (error) {
      console.error('Error duplicating post:', error);
      toast.error(error.response?.data?.message || t('ownerPosts.messages.duplicateFailed'));
    }
  };

  const handleViewDetail = async (post) => {
    try {
      // Always fetch fresh data from API to get complete information
      console.log('🔍 Fetching post detail by ID:', post.id);
      const detailData = await rentalPostService.getById(post.id);
      console.log('✅ Post detail loaded:', detailData);

      if (!detailData) {
        toast.error('Không tìm thấy bài đăng');
        return;
      }

      setDetailPost(detailData);
      setShowDetailModal(true);
    } catch (error) {
      console.error('❌ Error loading post detail:', error);
      toast.error('Không thể tải chi tiết bài đăng');
    }
  };

  const handleImageChange = (e) => {
    const newFiles = Array.from(e.target.files);

    if (newFiles.length === 0) return;

    // Validate file types and size
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    const validFiles = newFiles.filter(file => {
      if (!file.type.startsWith('image/')) return false;
      if (file.size > maxFileSize) {
        toast.warning(t('ownerPosts.messages.fileTooLarge').replace('{{name}}', file.name));
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
      toast.warning(t('ownerPosts.messages.noValidImages'));
      return;
    }

    if (validFiles.length !== newFiles.length) {
      toast.info(t('ownerPosts.messages.someFilesSkipped'));
    }

    // Limit total images (e.g., max 10)
    const existingCount = postData.images.length;
    const maxImages = 10;

    if (existingCount >= maxImages) {
      toast.warning(t('ownerPosts.messages.maxImagesReached').replace('{{max}}', maxImages));
      return;
    }

    const availableSlots = maxImages - existingCount;
    const filesToAdd = validFiles.slice(0, availableSlots);

    if (filesToAdd.length < validFiles.length) {
      toast.warning(t('ownerPosts.messages.maxImagesReached').replace('{{max}}', maxImages));
    }

    // Add to existing images
    const updatedImages = [...postData.images, ...filesToAdd];
    setPostData({ ...postData, images: updatedImages });

    // Create previews for new files using URL.createObjectURL for instant display
    const newPreviews = filesToAdd.map(file => URL.createObjectURL(file));
    const updatedPreviews = [...imagePreviews, ...newPreviews];

    console.log('📸 Image previews created:', {
      newPreviewsCount: newPreviews.length,
      totalPreviews: updatedPreviews.length,
      samplePreview: newPreviews[0]?.substring(0, 50) + '...'
    });

    setImagePreviews(updatedPreviews);

    // Reset input to allow selecting same file again if needed
    e.target.value = '';
  };

  const handleRemoveImage = (index) => {
    const newImages = [...postData.images];
    newImages.splice(index, 1);
    setPostData({ ...postData, images: newImages });

    const newPreviews = [...imagePreviews];
    // Only revoke blob URLs (data: or blob:), not HTTP URLs from server
    if (newPreviews[index] && newPreviews[index].startsWith('blob:')) {
      URL.revokeObjectURL(newPreviews[index]);
    }
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
  };

  const handleBoardingHouseChange = (houseId) => {
    setPostData({
      ...postData,
      boardingHouseId: houseId,
      roomIds: [] // Reset selected rooms
    });
    if (formErrors.boardingHouseId) {
      setFormErrors({ ...formErrors, boardingHouseId: '' });
    }
    loadRoomsForHouse(houseId);
  };

  const handleRoomToggle = (roomId) => {
    const isSelected = postData.roomIds.includes(roomId);
    let newRoomIds;
    if (isSelected) {
      newRoomIds = postData.roomIds.filter(id => id !== roomId);
    } else {
      newRoomIds = [...postData.roomIds, roomId];
    }
    setPostData({ ...postData, roomIds: newRoomIds });
  };

  // Drag & Drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      toast.warning(t('ownerPosts.messages.onlyImagesAllowed'));
      return;
    }

    // Process dropped images same as file input
    const existingCount = postData.images.length;
    const maxImages = 10;

    if (existingCount >= maxImages) {
      toast.warning(t('ownerPosts.messages.maxImagesReached').replace('{{max}}', maxImages));
      return;
    }

    const availableSlots = maxImages - existingCount;
    const filesToAdd = imageFiles.slice(0, availableSlots);

    if (filesToAdd.length < imageFiles.length) {
      toast.warning(t('ownerPosts.messages.maxImagesReached').replace('{{max}}', maxImages));
    }

    const updatedImages = [...postData.images, ...filesToAdd];
    setPostData({ ...postData, images: updatedImages });

    const newPreviews = filesToAdd.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  if (!mounted) return null;

  if (loading && posts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('ownerPosts.loading')}</p>
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('ownerPosts.title')}</h1>
              <p className="text-gray-600 dark:text-gray-400">{t('ownerPosts.subtitle')}</p>
            </div>
            <button
              onClick={handleNewPost}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
            >
              <Plus className="w-5 h-5" />
              <span>{t('ownerPosts.createPost')}</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('ownerPosts.stats.total')}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <FileText className="w-10 h-10 text-blue-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('ownerPosts.stats.active')}</p>
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
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('ownerPosts.stats.pending')}</p>
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
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('ownerPosts.stats.inactive')}</p>
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
            { id: 'all', label: t('ownerPosts.tabs.all'), count: stats.total },
            { id: 'active', label: t('ownerPosts.tabs.active'), count: stats.active },
            { id: 'pending', label: t('ownerPosts.tabs.pending'), count: stats.pending },
            { id: 'inactive', label: t('ownerPosts.tabs.inactive'), count: stats.inactive },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${activeTab === tab.id
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
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('ownerPosts.emptyState.title')}</h3>
            <p className="text-gray-600 dark:text-gray-400">{t('ownerPosts.emptyState.description')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
              >
                {/* Images Section */}
                {post.imageUrls && post.imageUrls.length > 0 && (
                  <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                    <img
                      src={post.imageUrls[0]}
                      alt={post.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                      }}
                    />
                    {post.imageUrls.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
                        +{post.imageUrls.length - 1} more
                      </div>
                    )}
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(post)}`}>
                      {getStatusText(post)}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetail(post)}
                        className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {/* Only show Edit button for Pending posts (isApproved === 0) */}
                      {post.isApproved === 0 && (
                        <button
                          onClick={() => handleEditPost(post)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Edit Post"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {/* <button
                        onClick={() => handleDuplicatePost(post)}
                        className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                      >
                        <Copy className="w-4 h-4" /> */}
                      {/* </button> */}
                      {/* Only show Delete button for Active posts (isApproved === 1) */}
                      {post.isApproved === 1 && (
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Delete Post"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                    {post.content || post.description}
                  </p>
                  <div className="space-y-2 text-sm">
                    {/* Author */}
                    {post.authorName && (
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        {/* <span className="mr-2">👤</span>
                        <span className="font-medium">{post.authorName}</span> */}
                      </div>
                    )}

                    {/* Boarding House */}
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Building className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="font-medium truncate">{post.houseName || t('ownerPosts.card.noHouse')}</span>
                    </div>

                    {/* Rooms */}
                    {/* <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Home className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{post.roomName || t('ownerPosts.card.allRooms')}</span>
                    </div> */}

                    {/* Contact Phone */}
                    {post.contactPhone && (
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <span className="mr-2">📞</span>
                        <span>{post.contactPhone}</span>
                      </div>
                    )}

                    {/* Images count
                    {post.imageUrls && post.imageUrls.length > 0 && (
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <span className="mr-2">🖼️</span>
                        <span>{post.imageUrls.length} image{post.imageUrls.length > 1 ? 's' : ''}</span>
                      </div>
                    )} */}

                    {/* Created date */}
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                      {t('ownerPosts.card.created')}: {formatDate(post.createdAt)}
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
        <div className="fixed inset-0 bg-white/70 dark:bg-gray-900/70 flex justify-center items-center z-50 backdrop-blur-md">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-600">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                  <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingPost ? t('ownerPosts.editPost') : t('ownerPosts.createPost')}
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowPostModal(false);
                  setEditingPost(null);
                  setPostData({
                    boardingHouseId: '',
                    roomIds: [],
                    title: '',
                    description: '',
                    contactPhone: user?.phone || '',
                    images: []
                  });
                  setFormErrors({});
                  setImagePreviews([]);
                  setAvailableRooms([]);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitPost} className="space-y-6">
              {/* Boarding House Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  <span className="flex items-center">
                    <Building className="w-4 h-4 mr-2" />
                    {t('ownerPosts.form.boardingHouse')} <span className="text-red-500 ml-1">*</span>
                  </span>
                </label>
                <select
                  value={postData.boardingHouseId}
                  onChange={(e) => handleBoardingHouseChange(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white/70 dark:bg-gray-700/70 text-gray-900 dark:text-white ${formErrors.boardingHouseId ? 'border-red-500 ring-1 ring-red-200' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  disabled={editingPost}
                >
                  <option value="">{t('ownerPosts.form.selectBoardingHouse')}</option>
                  {boardingHouses.map((house) => (
                    <option key={house.id} value={house.id}>
                      {house.houseName}
                    </option>
                  ))}
                </select>
                {formErrors.boardingHouseId && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formErrors.boardingHouseId}</p>
                )}
                {boardingHouses.length === 0 && (
                  <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
                    {t('ownerPosts.form.noBoardingHouses')}
                  </p>
                )}
              </div>

              {/* Room Selection (Dropdown like Boarding House) */}
              {postData.boardingHouseId && (
                <div>
                  <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    <span className="flex items-center">
                      <Home className="w-4 h-4 mr-2" />
                      {t('ownerPosts.form.rooms')}
                    </span>
                  </label>
                  {loadingRooms ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{t('ownerPosts.form.loadingRooms')}</p>
                    </div>
                  ) : availableRooms.length === 0 ? (
                    <p className="text-sm text-yellow-600 dark:text-yellow-400 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      {t('ownerPosts.form.noRooms')}
                    </p>
                  ) : (
                    <select
                      value={postData.roomIds.length > 0 ? postData.roomIds[0] : ''}
                      onChange={(e) => {
                        const selectedRoomId = e.target.value;
                        setPostData({
                          ...postData,
                          roomIds: selectedRoomId ? [selectedRoomId] : []
                        });
                      }}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white/70 dark:bg-gray-700/70 text-gray-900 dark:text-white"
                      disabled={editingPost}
                    >
                      <option value="">{t('ownerPosts.form.selectRoom') || 'Chọn phòng để đăng'}</option>
                      {availableRooms.map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.roomName} - {room.price?.toLocaleString('vi-VN')} VNĐ/tháng
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

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
                  className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white/70 dark:bg-gray-700/70 text-gray-900 dark:text-white ${formErrors.title ? 'border-red-500 ring-1 ring-red-200' : 'border-gray-300 dark:border-gray-600'
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
                  className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white/70 dark:bg-gray-700/70 text-gray-900 dark:text-white resize-none ${formErrors.description ? 'border-red-500 ring-1 ring-red-200' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  placeholder="Describe the room and rental details..."
                />
                {formErrors.description && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formErrors.description}</p>
                )}
              </div>

              {/* Image Upload - Multiple Images Support with Drag & Drop */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  <span className="flex items-center">
                    📷 {t('ownerPosts.form.images')} <span className="text-gray-500 text-xs ml-2">{t('ownerPosts.form.imagesHint')}</span>
                  </span>
                </label>

                {/* Drag & Drop Zone */}
                <div
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 cursor-pointer ${isDragging
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.02]'
                    : 'border-gray-300 dark:border-gray-600 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'
                    }`}
                  onClick={() => document.getElementById('image-upload-input').click()}
                >
                  <input
                    id="image-upload-input"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />

                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${isDragging
                      ? 'bg-blue-500 scale-110'
                      : 'bg-gradient-to-br from-blue-500 to-purple-500'
                      }`}>
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div className="text-center">
                      {/* <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
                        {isDragging ? '📥 Drop your images here' : '📷 Upload Images'}
                      </p> */}
                      {/* <p className="text-xs text-gray-500 dark:text-gray-400">
                        Drag & drop or click to browse
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        💡 Max: 10 images, 5MB each
                      </p> */}
                    </div>
                  </div>
                </div>
                {/* <div className="mt-2 flex items-start justify-between gap-2">

                  {postData.images.length > 0 && (
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded whitespace-nowrap">
                        {t('ownerPosts.form.imagesCount').replace('{{count}}', postData.images.length)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(postData.images.reduce((acc, img) => acc + img.size, 0))} {t('ownerPosts.form.totalSize').replace('{{size}}', '')}
                      </span>
                    </div>
                  )}
                </div> */}

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                      📸 {t('ownerPosts.form.selectedImages').replace('{{count}}', imagePreviews.length)}
                    </p>
                    <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-600 shadow-md hover:shadow-lg transition-shadow">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                              loading="eager"
                              onError={(e) => {
                                console.error('❌ Image failed to load:', preview);
                                e.target.src = 'https://via.placeholder.com/200x200?text=Error';
                              }}
                            />

                            {/* Delete button - always visible on mobile, hover on desktop */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-lg flex items-center justify-center z-30">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveImage(index);
                                }}
                                className="md:opacity-0 md:group-hover:opacity-100 bg-red-500 text-white p-2.5 rounded-full hover:bg-red-600 transition-all transform md:scale-90 md:group-hover:scale-100 shadow-lg hover:shadow-xl"
                                title="Remove image"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Image number badge */}
                            <div className="absolute top-1 right-1 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full font-medium z-30">
                              {index + 1}
                            </div>

                            {/* File size badge - only show for new uploaded files, not existing URLs */}
                            {postData.images[index] && postData.images[index].size && (
                              <div className="absolute bottom-1 left-1 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded z-30">
                                {formatFileSize(postData.images[index].size)}
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-1 truncate">
                            {postData.images[index]?.name || `Image ${index + 1}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPostModal(false);
                    setEditingPost(null);
                    setPostData({
                      boardingHouseId: '',
                      roomIds: [],
                      title: '',
                      description: '',
                      contactPhone: user?.phone || '',
                      images: []
                    });
                    setFormErrors({});
                    setImagePreviews([]);
                    setAvailableRooms([]);
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  {t('ownerPosts.buttons.cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl"
                >
                  {editingPost ? t('ownerPosts.buttons.update') : t('ownerPosts.buttons.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && detailPost && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-900 dark:to-blue-900 p-6 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Eye className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {t('ownerPosts.detailTitle')}
                  </h2>
                  <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(detailPost)}`}>
                    {getStatusText(detailPost)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setDetailPost(null);
                }}
                className="text-white/80 hover:text-white hover:bg-white/20 transition-all rounded-lg p-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6 space-y-6">
              {/* Title & Date */}
              <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t('ownerPosts.detail.title')}</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                      {detailPost.title}
                    </h3>
                  </div>
                  <div className="text-right text-sm text-gray-500 dark:text-gray-400 shrink-0">
                    <div className="flex items-center gap-1">
                      <span>📅</span>
                      <span>{formatDate(detailPost.createdAt)}</span>
                    </div>
                    {detailPost.updatedAt && detailPost.updatedAt !== detailPost.createdAt && (
                      <div className="flex items-center gap-1 mt-1">
                        <span>🔄</span>
                        <span>{formatDate(detailPost.updatedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Main Content Grid - 2 columns on large screens */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column - Images & Description (2/3 width) */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Images Gallery */}
                  {detailPost.imageUrls && detailPost.imageUrls.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <span>🖼️</span>
                        {t('ownerPosts.detail.images')}
                        <span className="text-sm font-normal text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                          {detailPost.imageUrls.length}
                        </span>
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {detailPost.imageUrls.map((url, index) => (
                          <div key={index} className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 group">
                            <img
                              src={url}
                              alt={`${detailPost.title} - ${index + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md font-medium">
                              {index + 1}/{detailPost.imageUrls.length}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <span>📝</span>
                      {t('ownerPosts.detail.description')}
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                        {detailPost.content || detailPost.description || (
                          <span className="text-gray-400 italic">{t('ownerPosts.detail.noDescription')}</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Amenities - Full width in left column */}
                  <div className="space-y-5">
                    {/* Room Amenities */}
                    {detailPost.room?.amenities && detailPost.room.amenities.length > 0 && (
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <span>✨</span>
                          {t('ownerPosts.detail.roomAmenities')}
                          <span className="text-sm font-normal text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                            {detailPost.room.amenities.length}
                          </span>
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                          {detailPost.room.amenities.map((amenity, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3 border border-indigo-100 dark:border-indigo-800"
                            >
                              {amenity.imageUrl ? (
                                <img
                                  src={amenity.imageUrl}
                                  alt={amenity.amenityName || amenity.name}
                                  className="w-8 h-8 object-cover rounded-md flex-shrink-0"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextElementSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <span className={`text-xl flex-shrink-0 ${!amenity.imageUrl ? 'flex' : 'hidden'}`}>🏠</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {amenity.amenityName || amenity.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* House Amenities */}
                    {detailPost.boardingHouse?.amenities && detailPost.boardingHouse.amenities.length > 0 && (
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <span>🏢</span>
                          {t('ownerPosts.detail.houseAmenities')}
                          <span className="text-sm font-normal text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                            {detailPost.boardingHouse.amenities.length}
                          </span>
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                          {detailPost.boardingHouse.amenities.map((amenity, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 bg-violet-50 dark:bg-violet-900/20 rounded-lg p-3 border border-violet-100 dark:border-violet-800"
                            >
                              {amenity.imageUrl ? (
                                <img
                                  src={amenity.imageUrl}
                                  alt={amenity.amenityName || amenity.name}
                                  className="w-8 h-8 object-cover rounded-md flex-shrink-0"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextElementSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <span className={`text-xl flex-shrink-0 ${!amenity.imageUrl ? 'flex' : 'hidden'}`}>🏢</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {amenity.amenityName || amenity.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Information (1/3 width) */}
                <div className="space-y-4">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm sticky top-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <span>ℹ️</span>
                      {t('ownerPosts.detail.information')}
                    </h3>
                    <div className="space-y-3">
                      {/* Author */}
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-100 dark:border-blue-800">
                        <div className="flex items-center text-blue-600 dark:text-blue-400 mb-1 text-xs font-semibold">
                          <span className="mr-1.5">👤</span>
                          {t('ownerPosts.detail.author')}
                        </div>
                        <p className="text-gray-900 dark:text-white font-semibold text-sm pl-5">
                          {detailPost.authorName}
                        </p>
                      </div>

                      {/* Boarding House */}
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-100 dark:border-purple-800">
                        <div className="flex items-center text-purple-600 dark:text-purple-400 mb-1 text-xs font-semibold">
                          <Building className="w-3.5 h-3.5 mr-1.5" />
                          {t('ownerPosts.detail.boardingHouse')}
                        </div>
                        <p className="text-gray-900 dark:text-white font-semibold text-sm pl-5">
                          {detailPost.houseName || t('ownerPosts.card.noHouse')}
                        </p>
                      </div>

                      {/* Room */}
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-100 dark:border-green-800">
                        <div className="flex items-center text-green-600 dark:text-green-400 mb-1 text-xs font-semibold">
                          <Home className="w-3.5 h-3.5 mr-1.5" />
                          {t('ownerPosts.detail.room')}
                        </div>
                        <p className="text-gray-900 dark:text-white font-semibold text-sm pl-5">
                          {detailPost.room?.roomName || detailPost.roomName || t('ownerPosts.card.allRooms')}
                        </p>
                      </div>

                      {/* Price */}
                      {detailPost.room?.price && (
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 border border-emerald-100 dark:border-emerald-800">
                          <div className="flex items-center text-emerald-600 dark:text-emerald-400 mb-1 text-xs font-semibold">
                            <span className="mr-1.5">💰</span>
                            {t('ownerPosts.detail.price')}
                          </div>
                          <p className="text-gray-900 dark:text-white font-bold text-base pl-5">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(detailPost.room.price)}
                          </p>
                        </div>
                      )}

                      {/* Area */}
                      {detailPost.room?.area && (
                        <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-3 border border-cyan-100 dark:border-cyan-800">
                          <div className="flex items-center text-cyan-600 dark:text-cyan-400 mb-1 text-xs font-semibold">
                            <span className="mr-1.5">📏</span>
                            {t('ownerPosts.detail.area')}
                          </div>
                          <p className="text-gray-900 dark:text-white font-semibold text-sm pl-5">
                            {detailPost.room.area} m²
                          </p>
                        </div>
                      )}

                      {/* Contact */}
                      <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 border border-orange-100 dark:border-orange-800">
                        <div className="flex items-center text-orange-600 dark:text-orange-400 mb-1 text-xs font-semibold">
                          <span className="mr-1.5">📞</span>
                          {t('ownerPosts.detail.contact')}
                        </div>
                        <p className="text-gray-900 dark:text-white font-semibold text-sm pl-5">
                          {detailPost.contactPhone || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer - Action Buttons */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleEditPost(detailPost);
                  }}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all font-medium shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm"
                >
                  <Edit2 className="w-4 h-4" />
                  {t('common.edit')}
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setDetailPost(null);
                  }}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium text-sm"
                >
                  {t('common.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
