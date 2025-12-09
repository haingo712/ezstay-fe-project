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
      console.log('📥 Fetching review by ID:', id);
      const response = await axiosInstance.get(`/api/Review/${id}`);
      console.log('📦 Review response:', response);
      console.log('📦 Review data:', response.data);

      // Handle different response formats
      if (response.data) {
        // Check if wrapped in isSuccess format
        if (response.data.isSuccess && response.data.data) {
          console.log('✅ Review data (wrapped):', response.data.data);
          return response.data.data;
        }
        // Direct data
        console.log('✅ Review data (direct):', response.data);
        return response.data;
      }

      throw new Error('No data in response');
    } catch (error) {
      console.error('❌ Error fetching review:', error);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error data:', error.response?.data);

      // Provide more specific error messages
      if (error.response?.status === 404) {
        throw new Error('Review not found');
      } else if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later or contact support.');
      }

      throw error;
    }
  },

  // Lấy tất cả reviews theo RoomId
  getAllReviewsByRoomId: async (roomId) => {
    try {
      console.log('📥 Fetching reviews by RoomId:', roomId);
      const response = await axiosInstance.get(`/api/Review/all/${roomId}`);
      console.log('📦 Reviews raw response:', response);
      console.log('📦 Reviews response.data:', response.data);
      
      // Backend returns IQueryable<ReviewResponse> with OData
      // OData may wrap in { value: [...] } or return array directly
      let reviewsData = response.data;
      
      // Handle OData format: { @odata.context: "...", value: [...] }
      if (reviewsData && reviewsData.value && Array.isArray(reviewsData.value)) {
        console.log('✅ OData format detected, extracting value array');
        reviewsData = reviewsData.value;
      }
      
      // Ensure it's an array
      if (!Array.isArray(reviewsData)) {
        console.warn('⚠️ Response is not an array, returning empty array');
        return [];
      }
      
      console.log('✅ Reviews parsed:', reviewsData.length, 'reviews');
      return reviewsData;
    } catch (error) {
      console.error('❌ Error fetching reviews by room:', error);
      console.error('❌ Error details:', error.response?.data);
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

  // Tạo review mới (yêu cầu contractId) với FormData cho image upload
  createReview: async (contractId, reviewData) => {
    try {
      console.log('Creating review for contract:', contractId);

      // Check if reviewData is FormData (for image upload to Filebase IPFS)
      if (reviewData instanceof FormData) {
        console.log('📤 Sending review FormData with image to Filebase IPFS');
        console.log('📤 FormData contents:', {
          rating: reviewData.get('Rating'),
          content: reviewData.get('Content'),
          hasImage: !!reviewData.get('ImageUrl')
        });

        // Use fetch with FormData - axiosInstance will handle multipart/form-data
        const response = await axiosInstance.post(`/api/Review/${contractId}`, reviewData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        console.log('✅ Review created with image:', response.data);

        // Backend returns: { isSuccess: true, message: "...", data: {...} }
        if (response.data && response.data.isSuccess) {
          console.log('📦 Created review data:', response.data.data);
          console.log('🖼️ Filebase IPFS URL:', response.data.data?.imageUrl);
          return response.data.data || response.data;
        }

        return response.data;
      }

      // Legacy: JSON data (for backward compatibility if needed)
      const payload = {
        rating: reviewData.rating,
        content: reviewData.content,
        imageId: reviewData.imageId || null
      };

      console.log('Review JSON payload:', payload);
      const response = await axiosInstance.post(`/api/Review/${contractId}`, payload);
      console.log('Review created response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating review:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Cập nhật review với FormData cho optional image upload
  updateReview: async (id, reviewData) => {
    try {
      console.log(`🔄 Updating review ${id}`);

      // Check if reviewData is FormData (for image upload)
      if (reviewData instanceof FormData) {
        console.log('📤 Sending review FormData with optional image update');
        console.log('📤 FormData contents:', {
          rating: reviewData.get('Rating'),
          content: reviewData.get('Content'),
          hasNewImage: !!reviewData.get('ImageUrl')
        });

        const response = await axiosInstance.put(`/api/Review/${id}`, reviewData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        console.log('✅ Review updated with FormData:', response.data);

        if (response.data && response.data.isSuccess) {
          console.log('📦 Updated review data:', response.data.data);
          console.log('🖼️ Filebase IPFS URL:', response.data.data?.imageUrl);
          return response.data.data || response.data;
        }

        return response.data;
      }

      // Legacy: JSON data
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

  // Kiểm tra review đã tồn tại cho contract hay chưa
  checkReviewExists: async (contractId) => {
    try {
      console.log('🔍 Checking if review exists for contract:', contractId);
      const response = await axiosInstance.get(`/api/Review/${contractId}/check-exists`);
      console.log('✅ Review exists check:', response.data);
      return response.data; // Returns boolean
    } catch (error) {
      console.error('❌ Error checking review exists:', error);
      throw error;
    }
  },
};

export default reviewService;
