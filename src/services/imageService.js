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
      const uploadPromises = files.map(file => imageService.upload(file));
      const results = await Promise.all(uploadPromises);
      console.log("✅ Multiple images uploaded:", results);
      return results;
    } catch (error) {
      console.error("❌ Error uploading multiple images:", error);
      throw error;
    }
  },

  /**
   * Convert canvas to Blob file for upload
   * @param {HTMLCanvasElement} canvas - Canvas element with drawn signature
   * @param {string} filename - Optional filename
   * @returns {Promise<File>} - File object ready for upload
   */
  canvasToFile: async (canvas, filename = 'signature.png') => {
    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => {
        if (!blob) {
          reject(new Error('Failed to convert canvas to blob'));
          return;
        }
        
        const file = new File([blob], filename, { type: 'image/png' });
        resolve(file);
      }, 'image/png', 0.95); // High quality PNG
    });
  },

  /**
   * Convert base64 data URL to File object
   * @param {string} dataUrl - Base64 data URL (e.g., from canvas.toDataURL())
   * @param {string} filename - Optional filename
   * @returns {File} - File object ready for upload
   */
  dataUrlToFile: (dataUrl, filename = 'signature.png') => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, { type: mime });
  },

  /**
   * Upload signature from canvas element
   * @param {HTMLCanvasElement} canvas - Canvas with drawn signature
   * @returns {Promise<string>} - URL of uploaded signature image
   */
  uploadSignatureFromCanvas: async (canvas) => {
    console.log("🖌️ Uploading signature from canvas...");
    const file = await imageService.canvasToFile(canvas);
    return imageService.upload(file);
  },

  /**
   * Upload signature from base64 data URL
   * @param {string} dataUrl - Base64 data URL
   * @returns {Promise<string>} - URL of uploaded signature image
   */
  uploadSignatureFromDataUrl: async (dataUrl) => {
    console.log("📄 Uploading signature from data URL...");
    const file = imageService.dataUrlToFile(dataUrl);
    return imageService.upload(file);
  }
};

export default imageService;