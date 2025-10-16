import axiosInstance from '@/utils/axiosConfig';
import boardingHouseService from './boardingHouseService';
import roomService from './roomService';

// Helper function to normalize post data from PascalCase to camelCase
const normalizePostData = (post) => {
  if (!post) return post;
  
  // Parse imageUrls if it's a JSON string inside an array
  let imageUrls = post.imageUrls || post.ImageUrls;
  if (Array.isArray(imageUrls) && imageUrls.length > 0 && typeof imageUrls[0] === 'string') {
    try {
      // Check if first item is a JSON string like: "{\"urls\":[...]}"
      const parsed = JSON.parse(imageUrls[0]);
      if (parsed.urls && Array.isArray(parsed.urls)) {
        imageUrls = parsed.urls;
      }
    } catch (e) {
      // If parsing fails, keep original array
      console.log('ℹ️ imageUrls is already in correct format');
    }
  }
  
  return {
    ...post,
    id: post.id || post.Id,
    roomId: post.roomId || post.RoomId,
    authorId: post.authorId || post.AuthorId,
    boardingHouseId: post.boardingHouseId || post.BoardingHouseId,
    imageUrls: imageUrls,
    authorName: post.authorName || post.AuthorName,
    roomName: post.roomName || post.RoomName,
    houseName: post.houseName || post.HouseName,
    title: post.title || post.Title,
    content: post.content || post.Content,
    description: post.content || post.Content || post.description, // Map Content to description for compatibility
    contactPhone: post.contactPhone || post.ContactPhone,
    isActive: post.isActive !== undefined ? post.isActive : post.IsActive,
    isApproved: post.isApproved !== undefined ? post.isApproved : post.IsApproved,
    createdAt: post.createdAt || post.CreatedAt,
    updatedAt: post.updatedAt || post.UpdatedAt
  };
};

// Helper function to enrich post with boarding house, room, and author names by fetching from APIs
const enrichPostWithNames = async (post, verbose = false) => {
  try {
    // Fetch author name by ID
    if (post.authorId) {
      try {
        if (verbose) console.log(`👤 Fetching author info for ID: ${post.authorId}`);
        const token = localStorage.getItem('token');
        if (token) {
          const response = await fetch(`https://localhost:7000/api/Accounts/${post.authorId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (verbose) console.log(`📡 Author API response status: ${response.status}`);
          
          if (response.ok) {
            const authorData = await response.json();
            if (verbose) console.log(`📥 Author data received:`, authorData);
            
            // Try multiple possible field names
            post.authorName = authorData?.fullName || 
                            authorData?.FullName || 
                            authorData?.username || 
                            authorData?.Username ||
                            authorData?.userName ||
                            authorData?.UserName ||
                            authorData?.name ||
                            authorData?.Name ||
                            'Unknown Author';
            
            if (verbose) console.log(`✅ Author name: "${post.authorName}"`);
          } else {
            const errorText = await response.text();
            if (verbose) console.warn(`⚠️ Author API error response:`, errorText);
            post.authorName = 'Unknown Author';
          }
        } else {
          if (verbose) console.warn(`⚠️ No token found in localStorage`);
          post.authorName = 'Unknown Author';
        }
      } catch (err) {
        if (verbose) console.warn(`⚠️ Could not fetch author ${post.authorId}:`, err.message);
        post.authorName = 'Unknown Author';
      }
    } else {
      post.authorName = 'Anonymous';
    }
    
    // Fetch boarding house name by ID
    if (post.boardingHouseId) {
      try {
        if (verbose) console.log(`🏠 Fetching house info for ID: ${post.boardingHouseId}`);
        const houseData = await boardingHouseService.getById(post.boardingHouseId);
        post.houseName = houseData?.houseName || houseData?.HouseName || 'Unknown House';
        if (verbose) console.log(`✅ House name: "${post.houseName}"`);
      } catch (err) {
        if (verbose) console.warn(`⚠️ Could not fetch house ${post.boardingHouseId}:`, err.message);
        post.houseName = 'Unknown House';
      }
    } else {
      post.houseName = 'No house specified';
    }
    
    // Fetch room names by IDs array
    if (post.roomId && Array.isArray(post.roomId) && post.roomId.length > 0) {
      try {
        if (verbose) console.log(`🚪 Fetching ${post.roomId.length} rooms:`, post.roomId);
        const roomPromises = post.roomId.map(async (roomId) => {
          try {
            const roomData = await roomService.getById(roomId);
            return roomData?.roomName || roomData?.RoomName || null;
          } catch (err) {
            if (verbose) console.warn(`⚠️ Could not fetch room ${roomId}:`, err.message);
            return null;
          }
        });
        
        const roomNames = (await Promise.all(roomPromises)).filter(name => name);
        
        if (roomNames.length > 0) {
          post.roomName = roomNames.join(', ');
          if (verbose) console.log(`✅ Room names: "${post.roomName}"`);
        } else {
          post.roomName = 'All rooms';
          if (verbose) console.log(`⚠️ No room names found, using: "All rooms"`);
        }
      } catch (err) {
        if (verbose) console.warn('⚠️ Error fetching room names:', err.message);
        post.roomName = 'All rooms';
      }
    } else {
      post.roomName = 'All rooms';
      if (verbose) console.log(`ℹ️ No specific rooms, showing: "All rooms"`);
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
      formData.append('contactPhone', postData.contactPhone);
      
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
        content: postData.description, // Backend uses 'content'
        contactPhone: postData.contactPhone
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

  // Get all posts for users (includes approved posts) - with enriched data
  getAllForUser: async () => {
    try {
      const response = await axiosInstance.get('/api/RentalPosts');
      let posts = response.data;
      
      // Normalize and enrich posts data
      if (Array.isArray(posts)) {
        posts = posts.map(normalizePostData);
        
        // Enrich posts with boarding house and room names
        const enrichedPosts = await Promise.all(
          posts.map(post => enrichPostWithNames(post, false)) // verbose = false for public posts
        );
        
        return enrichedPosts;
      }
      
      return posts;
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  },

  // Get post by ID (with enriched data)
  getById: async (postId) => {
    try {
      const response = await axiosInstance.get(`/api/RentalPosts/${postId}`);
      let post = normalizePostData(response.data);
      
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
  }
};

export default rentalPostService;