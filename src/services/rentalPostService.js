import axiosInstance from '@/utils/axiosConfig';

export const rentalPostService = {
  // Get all posts for owner
  getOwnerPosts: async (ownerId) => {
    try {
      const response = await axiosInstance.get(`/api/RentalPosts/owner/${ownerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching owner posts:', error);
      throw error;
    }
  },

  // Create new post
  createPost: async (postData) => {
    try {
      const response = await axiosInstance.post('/api/RentalPosts', postData);
      return response.data;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },

  // Update post
  updatePost: async (postId, postData) => {
    try {
      const response = await axiosInstance.put(`/api/RentalPosts/${postId}`, postData);
      return response.data;
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  },

  // Delete post
  deletePost: async (postId) => {
    try {
      await axiosInstance.delete(`/api/RentalPosts/${postId}`);
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  },

  // Get pending posts (for staff)
  getPendingPosts: async () => {
    try {
      const response = await axiosInstance.get('/api/RentalPosts/pending');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending posts:', error);
      throw error;
    }
  },

  // Approve post (for staff)
  approvePost: async (postId) => {
    try {
      const response = await axiosInstance.post(`/api/RentalPosts/${postId}/approve`);
      return response.data;
    } catch (error) {
      console.error('Error approving post:', error);
      throw error;
    }
  },

  // Reject post (for staff)
  rejectPost: async (postId) => {
    try {
      const response = await axiosInstance.post(`/api/RentalPosts/${postId}/reject`);
      return response.data;
    } catch (error) {
      console.error('Error rejecting post:', error);
      throw error;
    }
  },

  // Get all approved posts (for homepage)
  getApprovedPosts: async () => {
    try {
      const response = await axiosInstance.get('/api/RentalPosts/approved');
      return response.data;
    } catch (error) {
      console.error('Error fetching approved posts:', error);
      throw error;
    }
  }
};