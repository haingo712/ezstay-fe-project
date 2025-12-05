import axiosInstance from '@/utils/axiosConfig';
import { publicApiFetch } from '@/utils/api';
import boardingHouseService from './boardingHouseService';
import roomService from './roomService';

// Helper function to normalize post data from PascalCase to camelCase
const normalizePostData = (post) => {
  if (!post) return post;

  console.log('🔄 Normalizing post, raw data keys:', Object.keys(post));
  console.log('🔄 Raw id field:', post.id, 'Raw Id field:', post.Id);

  // Parse imageUrls if it's a JSON string inside an array
  let imageUrls = post.imageUrls || post.ImageUrls;
  console.log('📥 Raw imageUrls:', imageUrls);

  if (Array.isArray(imageUrls) && imageUrls.length > 0 && typeof imageUrls[0] === 'string') {
    try {
      // Check if first item is a JSON string like: "{\"urls\":[...]}"
      const parsed = JSON.parse(imageUrls[0]);
      if (parsed.urls && Array.isArray(parsed.urls)) {
        imageUrls = parsed.urls;
        console.log('✅ Parsed imageUrls:', imageUrls);
      }
    } catch (e) {
      // If parsing fails, keep original array
      console.log('ℹ️ imageUrls is already in correct format or not parseable');
    }
  }

  // Normalize nested Room object
  const roomData = post.room || post.Room;
  const normalizedRoom = roomData ? {
    ...roomData,
    id: roomData.id || roomData.Id,
    roomName: roomData.roomName || roomData.RoomName,
    price: roomData.price || roomData.Price,
    area: roomData.area || roomData.Area,
    amenities: roomData.amenities || roomData.Amenities || roomData.roomAmenities || roomData.RoomAmenities,
    roomStatus: roomData.roomStatus || roomData.RoomStatus,
    maxOccupants: roomData.maxOccupants || roomData.MaxOccupants
  } : null;

  // Normalize nested BoardingHouse object
  const houseData = post.boardingHouse || post.BoardingHouse;
  const normalizedHouse = houseData ? {
    ...houseData,
    id: houseData.id || houseData.Id,
    houseName: houseData.houseName || houseData.HouseName,
    location: houseData.location || houseData.Location,
    amenities: houseData.amenities || houseData.Amenities
  } : null;

  const normalized = {
    ...post,
    id: post.id || post.Id,
    roomId: post.roomId || post.RoomId,
    authorId: post.authorId || post.AuthorId,
    ownerId: post.ownerId || post.OwnerId,
    boardingHouseId: post.boardingHouseId || post.BoardingHouseId,
    imageUrls: imageUrls,
    authorName: post.authorName || post.AuthorName,
    roomName: post.roomName || post.RoomName,
    houseName: post.houseName || post.HouseName,
    title: post.title || post.Title,
    content: post.content || post.Content,
    description: post.content || post.Content || post.description || post.Description,
    contactPhone: post.contactPhone || post.ContactPhone,
    isActive: post.isActive !== undefined ? post.isActive : post.IsActive,
    isApproved: post.isApproved !== undefined ? post.isApproved : post.IsApproved,
    postStatus: post.postStatus !== undefined ? post.postStatus : post.PostStatus,
    createdAt: post.createdAt || post.CreatedAt,
    updatedAt: post.updatedAt || post.UpdatedAt,
    reviews: post.reviews || post.Reviews,
    // Room details from nested Room object
    price: post.price || post.Price || normalizedRoom?.price,
    area: post.area || post.Area || normalizedRoom?.area,
    // Nested objects (normalized)
    boardingHouse: normalizedHouse,
    room: normalizedRoom,
    // Additional fields
    approvedBy: post.approvedBy || post.ApprovedBy,
    approvedAt: post.approvedAt || post.ApprovedAt
  };

  // Log all important fields for debugging
  console.log('✅ Normalized post:', {
    id: normalized.id,
    title: normalized.title,
    houseName: normalized.houseName,
    roomName: normalized.roomName,
    contactPhone: normalized.contactPhone,
    authorName: normalized.authorName,
    price: normalized.price,
    boardingHouse: normalized.boardingHouse,
    room: normalized.room
  });

  if (!normalized.id) {
    console.error('❌ CRITICAL: Normalized post has no id!', post);
  }

  return normalized;
};

// Helper function to enrich post with boarding house, room, and author names by fetching from APIs
// NOTE: BE RentalPostsAPI already returns AuthorName, HouseName, RoomName in the DTO
// This function is kept for backward compatibility but mostly unnecessary now
const enrichPostWithNames = async (post, verbose = false) => {
  try {
    // Backend already provides these fields, so we use them directly
    // Only fallback to fetching if fields are missing

    // Check if authorName is already provided by backend
    if (!post.authorName && post.authorId) {
      if (verbose) console.log(`⚠️ AuthorName missing, fetching for ID: ${post.authorId}`);
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/Accounts/${post.authorId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const authorData = await response.json();
            post.authorName = authorData?.fullName ||
              authorData?.FullName ||
              authorData?.username ||
              authorData?.Username ||
              'Unknown Author';
            if (verbose) console.log(`✅ Fetched author name: "${post.authorName}"`);
          } else {
            post.authorName = 'Unknown Author';
          }
        } else {
          post.authorName = 'Unknown Author';
        }
      } catch (err) {
        if (verbose) console.warn(`⚠️ Could not fetch author:`, err.message);
        post.authorName = 'Unknown Author';
      }
    } else if (verbose && post.authorName) {
      console.log(`✅ AuthorName already provided by backend: "${post.authorName}"`);
    }

    // Check if houseName is already provided by backend
    if (!post.houseName && post.boardingHouseId) {
      if (verbose) console.log(`⚠️ HouseName missing, fetching for ID: ${post.boardingHouseId}`);
      try {
        const houseData = await boardingHouseService.getById(post.boardingHouseId);
        post.houseName = houseData?.houseName || houseData?.HouseName || 'Unknown House';
        if (verbose) console.log(`✅ Fetched house name: "${post.houseName}"`);
      } catch (err) {
        if (verbose) console.warn(`⚠️ Could not fetch house:`, err.message);
        post.houseName = 'Unknown House';
      }
    } else if (verbose && post.houseName) {
      console.log(`✅ HouseName already provided by backend: "${post.houseName}"`);
    }

    // Check if roomName is already provided by backend
    if (!post.roomName) {
      post.roomName = 'All rooms';
      if (verbose) console.log(`ℹ️ RoomName not specified, using default: "All rooms"`);
    } else if (verbose) {
      console.log(`✅ RoomName already provided by backend: "${post.roomName}"`);
    }

    return post;
  } catch (error) {
    console.error('❌ Error enriching post:', error);
    return post;
  }
};

export const rentalPostService = {
  // Get all posts for owner (using token authentication)
  getOwnerPosts: async () => {
    try {
      const response = await axiosInstance.get('/api/RentalPosts/owner');
      let posts = response.data;

      console.log('📋 Raw posts from backend:', posts);

      // Normalize posts data
      if (Array.isArray(posts)) {
        posts = posts.map(normalizePostData);

        // Enrich posts with boarding house and room names
        const enrichedPosts = await Promise.all(
          posts.map(post => enrichPostWithNames(post, true)) // verbose = true for owner posts
        );

        return enrichedPosts;
      }

      return posts;
    } catch (error) {
      console.error('Error fetching owner posts:', error);
      throw error;
    }
  },

  // Create new post (backend will auto-fill: AuthorName, RoomName, HouseName from token + BoardingHouseId + RoomIds)
  createPost: async (postData) => {
    try {
      // Create FormData for multipart/form-data
      const formData = new FormData();
      formData.append('boardingHouseId', postData.boardingHouseId);
      formData.append('title', postData.title);
      formData.append('content', postData.description); // Backend uses 'content' not 'description'
      formData.append('isAllRooms', postData.roomIds?.length === 0 ? 'true' : 'false');

      // Add multiple roomIds
      if (postData.roomIds && postData.roomIds.length > 0) {
        postData.roomIds.forEach(roomId => {
          formData.append('roomId', roomId);
        });
      }

      // Add multiple images
      if (postData.images && postData.images.length > 0) {
        postData.images.forEach(image => {
          formData.append('images', image);
        });
      }

      console.log('📤 Creating post with FormData');
      const response = await axiosInstance.post('/api/RentalPosts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('✅ Post created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating post:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    }
  },

  // Update post
  updatePost: async (postId, postData) => {
    try {
      const payload = {
        title: postData.title,
        content: postData.description // Backend uses 'content'
      };
      const response = await axiosInstance.put(`/api/RentalPosts/${postId}`, payload);
      return normalizePostData(response.data);
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  },

  // Delete post
  deletePost: async (postId, deletedBy) => {
    try {
      await axiosInstance.delete(`/api/RentalPosts/${postId}?deletedBy=${deletedBy}`);
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  },

  // Get all posts PUBLIC (no auth required) - for homepage guest access
  getAllPublic: async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_GATEWAY_URL;
      console.log('🌐 Fetching public rental posts (no auth)...');
      console.log('🔗 Base URL:', baseUrl);
      console.log('🔗 Full URL:', `${baseUrl}/api/RentalPosts`);
      
      if (!baseUrl) {
        console.error('❌ NEXT_PUBLIC_API_GATEWAY_URL is not defined!');
        return [];
      }
      
      // Use native fetch directly to avoid axios interceptors
      const response = await fetch(`${baseUrl}/api/RentalPosts`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const posts = await response.json();
      console.log('📦 Public posts fetched:', posts?.length || 0, posts);

      // Normalize posts data
      if (Array.isArray(posts)) {
        return posts.map(normalizePostData);
      }

      return posts || [];
    } catch (error) {
      console.error('❌ Error fetching public posts:', error);
      // Return empty array instead of throwing for guest access
      return [];
    }
  },

  // Get post by ID PUBLIC (no auth required) - for guest access
  getByIdPublic: async (postId) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_GATEWAY_URL;
      console.log('🌐 Fetching public post detail (no auth)...');
      console.log('🔗 Full URL:', `${baseUrl}/api/RentalPosts/${postId}`);
      
      if (!baseUrl) {
        console.error('❌ NEXT_PUBLIC_API_GATEWAY_URL is not defined!');
        return null;
      }
      
      // Use native fetch directly to avoid axios interceptors
      const response = await fetch(`${baseUrl}/api/RentalPosts/${postId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        return null;
      }

      let postData = await response.json();
      console.log('📦 Public post fetched:', postData);

      // Check if response is wrapped in ApiResponse structure
      if (postData && postData.data && postData.isSuccess !== undefined) {
        postData = postData.data;
      }

      return normalizePostData(postData);
    } catch (error) {
      console.error('❌ Error fetching public post detail:', error);
      return null;
    }
  },

  // Get all posts for users (includes approved posts) - with enriched data
  getAllForUser: async () => {
    try {
      const response = await axiosInstance.get('/api/RentalPosts');
      let posts = response.data;

      // Handle if response is wrapped in ApiResponse structure
      if (posts && posts.data && posts.isSuccess !== undefined) {
        posts = posts.data;
        console.log('📋 Unwrapped posts:', posts);
      }

      // Normalize and enrich posts data
      if (Array.isArray(posts)) {
        posts = posts.map(normalizePostData);

        // Enrich posts with boarding house and room names
        const enrichedPosts = await Promise.all(
          posts.map(post => enrichPostWithNames(post, false)) // verbose = false for public posts
        );

        console.log('📋 Enriched posts count:', enrichedPosts.length);
        return enrichedPosts;
      }

      return posts || [];
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  },

  // Get post by ID (with enriched data)
  getById: async (postId) => {
    try {
      const response = await axiosInstance.get(`/api/RentalPosts/${postId}`);
      console.log('📥 Raw getById response:', response.data);

      // Check if response is wrapped in ApiResponse structure
      let postData = response.data;
      if (postData && postData.data && postData.isSuccess !== undefined) {
        // Unwrap ApiResponse: { isSuccess, data, message }
        postData = postData.data;
        console.log('📥 Unwrapped post data:', postData);
      }

      let post = normalizePostData(postData);

      // Enrich with boarding house and room names
      post = await enrichPostWithNames(post, false);

      return post;
    } catch (error) {
      console.error('Error fetching post:', error);
      throw error;
    }
  },

  // Alias for getById
  getPostById: async (postId) => {
    return rentalPostService.getById(postId);
  },

  // ==================== STAFF POST MODERATION ====================

  // Get all pending posts for staff review
  getPendingPosts: async () => {
    try {
      console.log('📋 Fetching pending posts for staff review...');
      const response = await axiosInstance.get('/api/RentalPosts/pending');
      let posts = response.data;

      console.log('📋 Raw pending posts from backend:', posts);

      // Normalize posts data
      if (Array.isArray(posts)) {
        posts = posts.map(normalizePostData);

        // Enrich posts with additional data
        const enrichedPosts = await Promise.all(
          posts.map(post => enrichPostWithNames(post, false))
        );

        return enrichedPosts;
      }

      return posts;
    } catch (error) {
      console.error('❌ Error fetching pending posts:', error);
      throw error;
    }
  },

  // Approve a post (Staff only)
  approvePost: async (postId) => {
    try {
      console.log(`✅ Approving post ${postId}...`);
      const response = await axiosInstance.put(`/api/RentalPosts/${postId}/approve`);
      console.log('✅ Post approved successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error approving post:', error);
      throw error;
    }
  },

  // Reject a post (Staff only)
  rejectPost: async (postId) => {
    try {
      console.log(`❌ Rejecting post ${postId}...`);
      const response = await axiosInstance.put(`/api/RentalPosts/${postId}/reject`);
      console.log('✅ Post rejected successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error rejecting post:', error);
      throw error;
    }
  }
};

export default rentalPostService;