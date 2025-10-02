import axiosInstance from '@/utils/axiosConfig';

export const rentalPostService = {
  // Get all posts for owner (using token authentication)
  getOwnerPosts: async () => {
    try {
      const response = await axiosInstance.get('/api/RentalPosts/owner');
      return response.data;
    } catch (error) {
      console.error('Error fetching owner posts:', error);
      throw error;
    }
  },

  // Create new post (backend will auto-fill: AuthorName, RoomName, HouseName from token + RoomId)
  createPost: async (postData) => {
    try {
      // Only send: roomId, title, description, contactPhone
      const payload = {
        roomId: postData.roomId,
        title: postData.title,
        description: postData.description,
        contactPhone: postData.contactPhone
      };
      console.log('📤 Creating post with payload:', payload);
      const response = await axiosInstance.post('/api/RentalPosts', payload);
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
        description: postData.description,
        contactPhone: postData.contactPhone
      };
      const response = await axiosInstance.put(`/api/RentalPosts/${postId}`, payload);
      return response.data;
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

  // Get all posts for users (includes approved posts)
  getAllForUser: async () => {
    try {
      const response = await axiosInstance.get('/api/RentalPosts');
      return response.data;
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  },

  // Get post by ID
  getById: async (postId) => {
    try {
      const response = await axiosInstance.get(`/api/RentalPosts/${postId}`);
      return response.data;
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