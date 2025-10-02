import api from "@/utils/api";

const imageService = {
  // Upload single image file and return URL
  upload: async (file) => {
    try {
      console.log("📸 Uploading image...", file.name);
      
      const formData = new FormData();
      formData.append('File', file);
      
      // ImageAPI có thể chạy trên port khác, cần check API Gateway routing
      const response = await api.post('/api/Images/upload', formData);
      console.log("✅ Image uploaded successfully:", response);
      console.log("📋 Response structure:", {
        url: response.url,
        data: response.data,
        dataUrl: response.data?.url,
        fullResponse: response
      });
      
      // Return the URL from response - ImageAPI returns { Url: "..." }
      const imageUrl = response.data?.Url || response.Url || response.url || response.data?.url || response.data || response;
      console.log("🔗 Extracted image URL:", imageUrl);
      return imageUrl;
    } catch (error) {
      console.error("❌ Error uploading image:", error);
      throw error;
    }
  },

  // Upload multiple images
  uploadMultiple: async (files) => {
    try {
      const uploadPromises = files.map(file => this.upload(file));
      const results = await Promise.all(uploadPromises);
      console.log("✅ Multiple images uploaded:", results);
      return results;
    } catch (error) {
      console.error("❌ Error uploading multiple images:", error);
      throw error;
    }
  }
};

export default imageService;