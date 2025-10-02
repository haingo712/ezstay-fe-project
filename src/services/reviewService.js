import axiosInstance from '../utils/axiosConfig';

const reviewService = {
  // Lấy tất cả reviews
  getAllReviews: async () => {
    try {
      const response = await axiosInstance.get('/api/Review');
      return response.data;
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }
  },

  // Lấy review theo ID
  getReviewById: async (id) => {
    try {
      const response = await axiosInstance.get(`/api/Review/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching review:', error);
      throw error;
    }
  },

  // Lấy reviews theo PostId (từ repository nếu có)
  getReviewsByPostId: async (postId) => {
    try {
      // Nếu backend có endpoint này, sử dụng
      const response = await axiosInstance.get(`/api/Review/post/${postId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching reviews by post:', error);
      // Fallback: filter từ getAll
      try {
        const allReviews = await reviewService.getAllReviews();
        return allReviews.filter(review => review.postId === postId);
      } catch (fallbackError) {
        throw error;
      }
    }
  },

  // Tạo review mới (yêu cầu contractId)
  createReview: async (contractId, reviewData) => {
    try {
      console.log('Creating review for contract:', contractId, reviewData);
      
      // Ensure the data matches backend DTO: { rating, content, imageId? }
      const payload = {
        rating: reviewData.rating,
        content: reviewData.content,
        imageId: reviewData.imageId || null // Optional imageId
      };
      
      console.log('Review payload:', payload);
      const response = await axiosInstance.post(`/api/Review/${contractId}`, payload);
      console.log('Review created response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating review:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Cập nhật review
  updateReview: async (id, reviewData) => {
    try {
      const response = await axiosInstance.put(`/api/Review/${id}`, reviewData);
      return response.data;
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  },

  // Xóa review (chỉ Staff)
  deleteReview: async (id) => {
    try {
      const response = await axiosInstance.delete(`/api/Review/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  },
};

export default reviewService;
